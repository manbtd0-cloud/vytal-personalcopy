-- Atomic clinical backend operations.
-- Browser clients may read their own clinical rows, but create screenings and
-- advance referrals only through these validated transactional functions.

alter table public.screenings
  add column if not exists risk_reasons text[] not null default '{}'::text[],
  add column if not exists algorithm_version text not null default 'rppg-v1',
  add column if not exists capture_quality numeric(5,2)
    check (capture_quality is null or capture_quality between 0 and 100);

-- Harden the existing append-only referral audit trigger for deployments that
-- already applied the patient/referral migration.
create or replace function public.log_referral_transition()
returns trigger
language plpgsql
security definer
set search_path = ''
as $$
begin
  if tg_op = 'INSERT' then
    insert into public.referral_events (
      referral_id, user_id, actor_user_id, from_status, to_status
    ) values (
      new.id, new.user_id, auth.uid(), null, new.status
    );
  elsif old.status is distinct from new.status then
    insert into public.referral_events (
      referral_id, user_id, actor_user_id, from_status, to_status
    ) values (
      new.id, new.user_id, auth.uid(), old.status, new.status
    );
  end if;
  return new;
end;
$$;

revoke all on function public.log_referral_transition() from public, anon, authenticated;

create or replace function public.save_account_profile(
  p_profile jsonb,
  p_baselines jsonb default '[]'::jsonb
)
returns boolean
language plpgsql
security definer
set search_path = ''
as $$
declare
  v_user_id uuid := auth.uid();
  v_sex text;
  v_phone text;
begin
  if v_user_id is null then
    raise exception using errcode = '28000', message = 'Authentication required.';
  end if;
  if p_profile is null or jsonb_typeof(p_profile) <> 'object'
    or octet_length(p_profile::text) > 32768 then
    raise exception using errcode = '22023', message = 'Invalid account profile.';
  end if;
  if p_baselines is null or jsonb_typeof(p_baselines) <> 'array'
    or jsonb_array_length(p_baselines) > 64
    or octet_length(p_baselines::text) > 65536 then
    raise exception using errcode = '22023', message = 'Invalid health baselines.';
  end if;
  if char_length(coalesce(p_profile ->> 'full_name', '')) > 120 then
    raise exception using errcode = '22001', message = 'Profile name is too long.';
  end if;
  if nullif(p_profile ->> 'date_of_birth', '') is not null
    and (p_profile ->> 'date_of_birth') !~ '^[0-9]{4}-[0-9]{2}-[0-9]{2}$' then
    raise exception using errcode = '22023', message = 'Invalid date of birth.';
  end if;

  v_sex := coalesce(nullif(p_profile ->> 'sex', ''), 'prefer_not_to_say');
  if v_sex not in ('female', 'male', 'intersex', 'other', 'prefer_not_to_say') then
    raise exception using errcode = '22023', message = 'Invalid sex value.';
  end if;
  v_phone := nullif(btrim(p_profile ->> 'phone'), '');
  if v_phone is not null and v_phone !~ '^[0-9+() .-]{1,32}$' then
    raise exception using errcode = '22023', message = 'Invalid phone number.';
  end if;
  if coalesce(jsonb_typeof(p_profile -> 'address'), 'object') <> 'object'
    or coalesce(jsonb_typeof(p_profile -> 'emergency_contact'), 'object') <> 'object'
    or coalesce(jsonb_typeof(p_profile -> 'custom_fields'), 'object') <> 'object' then
    raise exception using errcode = '22023', message = 'Profile detail fields must be objects.';
  end if;

  if exists (
    select 1
    from jsonb_array_elements(p_baselines) as item
    left join public.metric_definitions as definition
      on definition.metric_key = item ->> 'metric_key'
      and definition.is_active = true
    where jsonb_typeof(item) <> 'object'
      or definition.metric_key is null
      or (definition.value_type = 'number'
        and coalesce(jsonb_typeof(item -> 'value_numeric'), 'null') <> 'number')
      or (definition.value_type = 'text'
        and coalesce(jsonb_typeof(item -> 'value_text'), 'null') <> 'string')
      or definition.value_type in ('boolean', 'json')
      or char_length(coalesce(item ->> 'unit', '')) > 32
      or (item ? 'metadata' and jsonb_typeof(item -> 'metadata') <> 'object')
  ) then
    raise exception using errcode = '22023', message = 'A health baseline is invalid or unsupported.';
  end if;

  if exists (
    select 1
    from jsonb_array_elements(p_baselines) as item
    group by item ->> 'metric_key'
    having count(*) > 1
  ) then
    raise exception using errcode = '23505', message = 'Duplicate health baselines are not allowed.';
  end if;

  insert into public.profiles (
    id, full_name, date_of_birth, sex, phone, address, emergency_contact, custom_fields
  ) values (
    v_user_id,
    coalesce(p_profile ->> 'full_name', ''),
    nullif(p_profile ->> 'date_of_birth', '')::date,
    v_sex,
    v_phone,
    coalesce(p_profile -> 'address', '{}'::jsonb),
    coalesce(p_profile -> 'emergency_contact', '{}'::jsonb),
    coalesce(p_profile -> 'custom_fields', '{}'::jsonb)
  )
  on conflict (id) do update set
    full_name = excluded.full_name,
    date_of_birth = excluded.date_of_birth,
    sex = excluded.sex,
    phone = excluded.phone,
    address = excluded.address,
    emergency_contact = excluded.emergency_contact,
    custom_fields = excluded.custom_fields;

  delete from public.health_baselines
  where user_id = v_user_id and patient_id is null;

  insert into public.health_baselines (
    user_id, metric_key, value_numeric, value_text, unit, metadata
  )
  select
    v_user_id,
    item ->> 'metric_key',
    case when jsonb_typeof(item -> 'value_numeric') = 'number'
      then (item ->> 'value_numeric')::double precision else null end,
    case when jsonb_typeof(item -> 'value_text') = 'string'
      then item ->> 'value_text' else null end,
    coalesce(definition.canonical_unit, nullif(item ->> 'unit', '')),
    coalesce(item -> 'metadata', '{}'::jsonb)
  from jsonb_array_elements(p_baselines) as item
  join public.metric_definitions as definition
    on definition.metric_key = item ->> 'metric_key'
    and definition.is_active = true;

  insert into public.audit_events (
    user_id, event_type, resource_type, resource_id, metadata
  ) values (
    v_user_id,
    'profile.updated',
    'profile',
    v_user_id::text,
    jsonb_build_object('baseline_count', jsonb_array_length(p_baselines))
  );

  return true;
end;
$$;

create or replace function public.record_screening(
  p_patient_id uuid,
  p_language text,
  p_explanation text,
  p_source text,
  p_stress_label text,
  p_algorithm_version text,
  p_capture_quality numeric,
  p_observations jsonb,
  p_metadata jsonb default '{}'::jsonb,
  p_observed_at timestamptz default now()
)
returns table (
  screening_id uuid,
  screening_status text,
  referral_id uuid
)
language plpgsql
security definer
set search_path = ''
as $$
declare
  v_user_id uuid := auth.uid();
  v_patient_code text;
  v_patient_name text;
  v_consent_status text;
  v_screening_id uuid;
  v_referral_id uuid;
  v_status text := 'ok';
  v_priority text := 'priority';
  v_reasons text[] := array[]::text[];
  v_heart_rate double precision;
  v_breathing_rate double precision;
  v_stress_score double precision;
begin
  if v_user_id is null then
    raise exception using errcode = '28000', message = 'Authentication required.';
  end if;

  if p_patient_id is null then
    raise exception using errcode = '22004', message = 'A patient is required.';
  end if;
  if p_language is null or p_language !~ '^[a-z]{2}(-[A-Za-z0-9]{2,8})?$' then
    raise exception using errcode = '22023', message = 'Invalid language code.';
  end if;
  if p_source is null or char_length(p_source) not between 1 and 40 then
    raise exception using errcode = '22023', message = 'Invalid screening source.';
  end if;
  if p_algorithm_version is null or char_length(p_algorithm_version) not between 1 and 40 then
    raise exception using errcode = '22023', message = 'Invalid algorithm version.';
  end if;
  if p_capture_quality is not null and (p_capture_quality < 0 or p_capture_quality > 100) then
    raise exception using errcode = '22023', message = 'Capture quality must be between 0 and 100.';
  end if;
  if p_explanation is not null and char_length(p_explanation) > 2000 then
    raise exception using errcode = '22001', message = 'Explanation is too long.';
  end if;
  if p_stress_label is not null and char_length(p_stress_label) > 80 then
    raise exception using errcode = '22001', message = 'Stress label is too long.';
  end if;
  if p_observed_at is null
    or p_observed_at < now() - interval '30 days'
    or p_observed_at > now() + interval '5 minutes' then
    raise exception using errcode = '22023', message = 'Screening time is outside the accepted range.';
  end if;
  if p_metadata is null or jsonb_typeof(p_metadata) <> 'object' or octet_length(p_metadata::text) > 16384 then
    raise exception using errcode = '22023', message = 'Invalid screening metadata.';
  end if;
  if p_observations is null
    or jsonb_typeof(p_observations) <> 'array'
    or jsonb_array_length(p_observations) not between 1 and 32
    or octet_length(p_observations::text) > 65536 then
    raise exception using errcode = '22023', message = 'Provide between 1 and 32 observations.';
  end if;

  select patient.patient_code, patient.full_name, patient.consent_status
  into v_patient_code, v_patient_name, v_consent_status
  from public.patients as patient
  where patient.id = p_patient_id
    and patient.owner_user_id = v_user_id;

  if not found then
    raise exception using errcode = '42501', message = 'Patient is unavailable for this account.';
  end if;
  if v_consent_status <> 'granted' then
    raise exception using errcode = '42501', message = 'Active patient consent is required.';
  end if;

  if exists (
    select 1
    from jsonb_array_elements(p_observations) as item
    left join public.metric_definitions as definition
      on definition.metric_key = item ->> 'metric_key'
      and definition.is_active = true
    where jsonb_typeof(item) <> 'object'
      or definition.metric_key is null
      or char_length(coalesce(item ->> 'metric_key', '')) not between 2 and 64
      or (item ? 'metadata' and jsonb_typeof(item -> 'metadata') <> 'object')
      or (item ? 'confidence' and case
        when jsonb_typeof(item -> 'confidence') <> 'number' then true
        else (item ->> 'confidence')::numeric not between 0 and 1
      end)
      or (
        coalesce(jsonb_typeof(item -> 'value_numeric'), 'null') = 'null'
        and coalesce(jsonb_typeof(item -> 'value_text'), 'null') = 'null'
        and coalesce(jsonb_typeof(item -> 'value_json'), 'null') = 'null'
      )
      or (item ? 'value_numeric' and jsonb_typeof(item -> 'value_numeric') not in ('number', 'null'))
      or (item ? 'value_text' and jsonb_typeof(item -> 'value_text') not in ('string', 'null'))
      or case definition.value_type
        when 'number' then coalesce(jsonb_typeof(item -> 'value_numeric'), 'null') <> 'number'
        when 'text' then coalesce(jsonb_typeof(item -> 'value_text'), 'null') <> 'string'
        when 'boolean' then coalesce(jsonb_typeof(item -> 'value_json'), 'null') <> 'boolean'
        when 'json' then coalesce(jsonb_typeof(item -> 'value_json'), 'null') = 'null'
        else true
      end
  ) then
    raise exception using errcode = '22023', message = 'An observation is invalid or uses an inactive metric.';
  end if;

  if exists (
    select 1
    from jsonb_array_elements(p_observations) as item
    group by item ->> 'metric_key'
    having count(*) > 1
  ) then
    raise exception using errcode = '23505', message = 'Duplicate metric observations are not allowed.';
  end if;

  select
    max(case when item ->> 'metric_key' = 'heart_rate' then (item ->> 'value_numeric')::double precision end),
    max(case when item ->> 'metric_key' = 'breathing_rate' then (item ->> 'value_numeric')::double precision end),
    max(case when item ->> 'metric_key' = 'stress_score' then (item ->> 'value_numeric')::double precision end)
  into v_heart_rate, v_breathing_rate, v_stress_score
  from jsonb_array_elements(p_observations) as item;

  if v_heart_rate is null or v_heart_rate not between 25 and 240 then
    raise exception using errcode = '22023', message = 'Heart rate must be between 25 and 240 bpm.';
  end if;
  if v_breathing_rate is not null and v_breathing_rate not between 4 and 80 then
    raise exception using errcode = '22023', message = 'Breathing rate is outside the supported range.';
  end if;
  if v_stress_score is not null and v_stress_score not between 0 and 100 then
    raise exception using errcode = '22023', message = 'Stress score must be between 0 and 100.';
  end if;

  if v_heart_rate < 50 then v_reasons := array_append(v_reasons, 'Heart rate below review threshold'); end if;
  if v_heart_rate > 100 then v_reasons := array_append(v_reasons, 'Heart rate above review threshold'); end if;
  if v_breathing_rate is not null and v_breathing_rate < 10 then v_reasons := array_append(v_reasons, 'Breathing rate below review threshold'); end if;
  if v_breathing_rate is not null and v_breathing_rate > 22 then v_reasons := array_append(v_reasons, 'Breathing rate above review threshold'); end if;
  if v_stress_score is not null and v_stress_score >= 60 then v_reasons := array_append(v_reasons, 'Pulse variability score above review threshold'); end if;

  if cardinality(v_reasons) > 0 then v_status := 'flagged'; end if;
  if v_heart_rate < 40 or v_heart_rate > 130
    or coalesce(v_breathing_rate < 8, false)
    or coalesce(v_breathing_rate > 30, false) then
    v_priority := 'urgent';
  end if;

  insert into public.screenings (
    user_id, patient_id, patient_reference, patient_name, status, stress_label,
    explanation, language, source, risk_reasons, algorithm_version,
    capture_quality, metadata, observed_at
  ) values (
    v_user_id, p_patient_id, v_patient_code, v_patient_name, v_status, p_stress_label,
    p_explanation, p_language, p_source, v_reasons, p_algorithm_version,
    p_capture_quality, p_metadata, p_observed_at
  ) returning id into v_screening_id;

  insert into public.vital_observations (
    screening_id, user_id, metric_key, value_numeric, value_text, value_json,
    unit, confidence, metadata, observed_at
  )
  select
    v_screening_id,
    v_user_id,
    item ->> 'metric_key',
    case when jsonb_typeof(item -> 'value_numeric') = 'number'
      then (item ->> 'value_numeric')::double precision else null end,
    case when jsonb_typeof(item -> 'value_text') = 'string'
      then item ->> 'value_text' else null end,
    case when coalesce(jsonb_typeof(item -> 'value_json'), 'null') <> 'null'
      then item -> 'value_json' else null end,
    coalesce(definition.canonical_unit, nullif(item ->> 'unit', '')),
    case when jsonb_typeof(item -> 'confidence') = 'number'
      then (item ->> 'confidence')::numeric else null end,
    coalesce(item -> 'metadata', '{}'::jsonb),
    p_observed_at
  from jsonb_array_elements(p_observations) as item
  join public.metric_definitions as definition
    on definition.metric_key = item ->> 'metric_key'
    and definition.is_active = true;

  if v_status = 'flagged' then
    insert into public.referrals (
      user_id, patient_id, screening_id, status, priority, reason, due_at
    ) values (
      v_user_id,
      p_patient_id,
      v_screening_id,
      'flagged',
      v_priority,
      array_to_string(v_reasons, '; ') || '. Confirm with an approved device or clinician.',
      p_observed_at + interval '1 day'
    ) returning id into v_referral_id;
  end if;

  insert into public.audit_events (
    user_id, event_type, resource_type, resource_id, metadata
  ) values (
    v_user_id,
    'screening.created',
    'screening',
    v_screening_id::text,
    jsonb_build_object(
      'status', v_status,
      'algorithm_version', p_algorithm_version,
      'observation_count', jsonb_array_length(p_observations)
    )
  );

  return query select v_screening_id, v_status, v_referral_id;
end;
$$;

create or replace function public.advance_referral(
  p_referral_id uuid,
  p_next_status text,
  p_note text default null
)
returns table (
  referral_id uuid,
  referral_status text,
  referral_completed_at timestamptz,
  referral_updated_at timestamptz
)
language plpgsql
security definer
set search_path = ''
as $$
declare
  v_user_id uuid := auth.uid();
  v_current_status text;
  v_completed_at timestamptz;
  v_updated_at timestamptz;
begin
  if v_user_id is null then
    raise exception using errcode = '28000', message = 'Authentication required.';
  end if;
  if p_note is not null and char_length(p_note) > 500 then
    raise exception using errcode = '22001', message = 'Referral note is too long.';
  end if;

  select referral.status
  into v_current_status
  from public.referrals as referral
  where referral.id = p_referral_id
    and referral.user_id = v_user_id
  for update;

  if not found then
    raise exception using errcode = '42501', message = 'Referral is unavailable for this account.';
  end if;

  if not (
    (v_current_status = 'flagged' and p_next_status in ('referred', 'cancelled'))
    or (v_current_status = 'referred' and p_next_status in ('contacted', 'cancelled'))
    or (v_current_status = 'contacted' and p_next_status in ('appointment_booked', 'cancelled'))
    or (v_current_status = 'appointment_booked' and p_next_status in ('completed', 'cancelled'))
  ) then
    raise exception using errcode = '22023', message = 'Invalid referral status transition.';
  end if;

  update public.referrals as referral
  set
    status = p_next_status,
    completed_at = case when p_next_status = 'completed' then now() else null end,
    notes = case
      when nullif(btrim(p_note), '') is null then referral.notes
      else left(concat_ws(E'\n', referral.notes, btrim(p_note)), 2000)
    end
  where referral.id = p_referral_id
    and referral.user_id = v_user_id
  returning referral.completed_at, referral.updated_at
  into v_completed_at, v_updated_at;

  insert into public.audit_events (
    user_id, event_type, resource_type, resource_id, metadata
  ) values (
    v_user_id,
    'referral.status_changed',
    'referral',
    p_referral_id::text,
    jsonb_build_object('from_status', v_current_status, 'to_status', p_next_status)
  );

  return query select p_referral_id, p_next_status, v_completed_at, v_updated_at;
end;
$$;

revoke all on function public.record_screening(
  uuid, text, text, text, text, text, numeric, jsonb, jsonb, timestamptz
) from public, anon;
revoke all on function public.save_account_profile(jsonb, jsonb) from public, anon;
revoke all on function public.advance_referral(uuid, text, text) from public, anon;
grant execute on function public.save_account_profile(jsonb, jsonb) to authenticated;
grant execute on function public.record_screening(
  uuid, text, text, text, text, text, numeric, jsonb, jsonb, timestamptz
) to authenticated;
grant execute on function public.advance_referral(uuid, text, text) to authenticated;

-- Remove multi-statement browser writes. The transactional functions above are
-- now the only authenticated mutation path for screenings and referrals.
revoke insert, update, delete on public.screenings from authenticated;
revoke insert, update, delete on public.vital_observations from authenticated;
revoke insert, update, delete on public.referrals from authenticated;
revoke insert, update, delete on public.profiles from authenticated;
revoke insert, update, delete on public.health_baselines from authenticated;
grant select on public.screenings, public.vital_observations, public.referrals to authenticated;
grant select on public.profiles, public.health_baselines to authenticated;
