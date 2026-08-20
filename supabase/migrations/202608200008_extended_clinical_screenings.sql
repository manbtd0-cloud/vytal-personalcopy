-- Merge the expanded clinical screening modes into the secure transactional
-- backend. Visual screenings may omit heart rate, but every accepted record
-- must contain at least one bounded primary measurement.

insert into public.metric_definitions (
  metric_key, label, canonical_unit, value_type, description
)
values
  ('pulse_rmssd_proxy', 'Pulse RMSSD proxy', 'ms', 'number', 'Short-window pulse variability proxy'),
  ('anemia_erythema_index', 'Conjunctival erythema index', 'index', 'number', 'Camera pallor-screening feature'),
  ('anemia_tier', 'Anemia screening tier', null, 'text', 'Non-diagnostic camera anemia screening tier'),
  ('jaundice_tier', 'Jaundice screening tier', null, 'text', 'Non-diagnostic camera jaundice screening tier'),
  ('bmi_category', 'BMI category', null, 'text', 'Anthropometric screening category'),
  ('alert_tier', 'Clinical alert tier', null, 'text', 'Unified clinical review tier'),
  ('rhythm_screening', 'Rhythm screening result', null, 'text', 'Short-window irregular-rhythm proxy')
on conflict (metric_key) do update set
  label = excluded.label,
  canonical_unit = excluded.canonical_unit,
  value_type = excluded.value_type,
  description = excluded.description,
  is_active = true;

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
  v_spo2 double precision;
  v_rmssd double precision;
  v_systolic double precision;
  v_diastolic double precision;
  v_hemoglobin double precision;
  v_bilirubin double precision;
  v_bmi double precision;
  v_rhythm text;
  v_age_group text;
  v_hr_red_high double precision := 150;
  v_hr_red_low double precision := 40;
  v_hr_orange_high double precision := 120;
  v_hr_orange_low double precision := 50;
  v_br_orange_high double precision := 24;
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
    max(case when item ->> 'metric_key' = 'stress_score' then (item ->> 'value_numeric')::double precision end),
    max(case when item ->> 'metric_key' = 'spo2_proxy' then (item ->> 'value_numeric')::double precision end),
    max(case when item ->> 'metric_key' = 'pulse_rmssd_proxy' then (item ->> 'value_numeric')::double precision end),
    max(case when item ->> 'metric_key' = 'systolic_bp_trend' then (item ->> 'value_numeric')::double precision end),
    max(case when item ->> 'metric_key' = 'diastolic_bp_trend' then (item ->> 'value_numeric')::double precision end),
    max(case when item ->> 'metric_key' = 'hemoglobin_proxy' then (item ->> 'value_numeric')::double precision end),
    max(case when item ->> 'metric_key' = 'bilirubin_proxy' then (item ->> 'value_numeric')::double precision end),
    max(case when item ->> 'metric_key' = 'bmi_proxy' then (item ->> 'value_numeric')::double precision end),
    max(case when item ->> 'metric_key' = 'rhythm_screening' then item ->> 'value_text' end)
  into
    v_heart_rate, v_breathing_rate, v_stress_score, v_spo2, v_rmssd,
    v_systolic, v_diastolic, v_hemoglobin, v_bilirubin, v_bmi, v_rhythm
  from jsonb_array_elements(p_observations) as item;

  if v_heart_rate is null and v_hemoglobin is null and v_bilirubin is null and v_bmi is null then
    raise exception using errcode = '22023', message = 'A primary pulse, anemia, jaundice, or BMI measurement is required.';
  end if;
  if v_heart_rate is not null and v_heart_rate not between 25 and 240 then
    raise exception using errcode = '22023', message = 'Heart rate must be between 25 and 240 bpm.';
  end if;
  if v_breathing_rate is not null and v_breathing_rate not between 4 and 80 then
    raise exception using errcode = '22023', message = 'Breathing rate is outside the supported range.';
  end if;
  if v_stress_score is not null and v_stress_score not between 0 and 100 then
    raise exception using errcode = '22023', message = 'Stress score must be between 0 and 100.';
  end if;
  if v_spo2 is not null and v_spo2 not between 70 and 100 then
    raise exception using errcode = '22023', message = 'SpO2 proxy is outside the supported range.';
  end if;
  if v_rmssd is not null and v_rmssd not between 0 and 1000 then
    raise exception using errcode = '22023', message = 'Pulse RMSSD proxy is outside the supported range.';
  end if;
  if v_systolic is not null and v_systolic not between 60 and 260 then
    raise exception using errcode = '22023', message = 'Systolic trend is outside the supported range.';
  end if;
  if v_diastolic is not null and v_diastolic not between 30 and 160 then
    raise exception using errcode = '22023', message = 'Diastolic trend is outside the supported range.';
  end if;
  if v_hemoglobin is not null and v_hemoglobin not between 3 and 22 then
    raise exception using errcode = '22023', message = 'Hemoglobin proxy is outside the supported range.';
  end if;
  if v_bilirubin is not null and v_bilirubin not between 0 and 100 then
    raise exception using errcode = '22023', message = 'Jaundice proxy is outside the supported range.';
  end if;
  if v_bmi is not null and v_bmi not between 8 and 80 then
    raise exception using errcode = '22023', message = 'BMI proxy is outside the supported range.';
  end if;
  if v_rhythm is not null and v_rhythm not in ('regular', 'irregular') then
    raise exception using errcode = '22023', message = 'Rhythm screening value is invalid.';
  end if;

  v_age_group := coalesce(nullif(p_metadata ->> 'age_group', ''), 'adult');
  if v_age_group not in ('adult', 'child_5_12', 'child_1_5y', 'infant_2_12mo', 'infant_under_2mo') then
    raise exception using errcode = '22023', message = 'Age group is invalid.';
  end if;
  if v_age_group = 'child_5_12' then
    v_hr_red_high := 145; v_hr_red_low := 55;
    v_hr_orange_high := 130; v_hr_orange_low := 60; v_br_orange_high := 30;
  elsif v_age_group = 'child_1_5y' then
    v_hr_red_high := 160; v_hr_red_low := 70;
    v_hr_orange_high := 150; v_hr_orange_low := 75; v_br_orange_high := 40;
  elsif v_age_group = 'infant_2_12mo' then
    v_hr_red_high := 180; v_hr_red_low := 80;
    v_hr_orange_high := 170; v_hr_orange_low := 90; v_br_orange_high := 50;
  elsif v_age_group = 'infant_under_2mo' then
    v_hr_red_high := 190; v_hr_red_low := 90;
    v_hr_orange_high := 180; v_hr_orange_low := 95; v_br_orange_high := 60;
  end if;

  if v_heart_rate is not null and v_heart_rate < v_hr_orange_low then v_reasons := array_append(v_reasons, 'Heart rate below age-banded review threshold'); end if;
  if v_heart_rate is not null and v_heart_rate > v_hr_orange_high then v_reasons := array_append(v_reasons, 'Heart rate above age-banded review threshold'); end if;
  if v_breathing_rate is not null and v_breathing_rate > v_br_orange_high then v_reasons := array_append(v_reasons, 'Breathing rate above age-banded review threshold'); end if;
  if v_spo2 is not null and v_spo2 < 95 then v_reasons := array_append(v_reasons, 'SpO2 camera proxy below confirmation threshold'); end if;
  if v_hemoglobin is not null and v_hemoglobin <= 9 then v_reasons := array_append(v_reasons, 'Hemoglobin camera proxy below review threshold'); end if;
  if v_bilirubin is not null and v_bilirubin >= 22 then v_reasons := array_append(v_reasons, 'Scleral yellowing proxy above review threshold'); end if;
  if v_bmi is not null and v_bmi < 18.5 then v_reasons := array_append(v_reasons, 'BMI proxy below review threshold'); end if;
  if v_rhythm = 'irregular' then v_reasons := array_append(v_reasons, 'Irregular rhythm proxy requires ECG confirmation'); end if;

  if cardinality(v_reasons) > 0 then v_status := 'flagged'; end if;
  if coalesce(v_heart_rate < v_hr_red_low, false) or coalesce(v_heart_rate > v_hr_red_high, false)
    or coalesce(v_spo2 < 90, false) or coalesce(v_hemoglobin < 7, false)
    or coalesce(v_bmi < 16, false) or v_rhythm = 'irregular' then
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
      p_observed_at + case when v_priority = 'urgent' then interval '4 hours' else interval '1 day' end
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
      'observation_count', jsonb_array_length(p_observations),
      'screening_mode', p_metadata ->> 'mode'
    )
  );

  return query select v_screening_id, v_status, v_referral_id;
end;
$$;

revoke all on function public.record_screening(
  uuid, text, text, text, text, text, numeric, jsonb, jsonb, timestamptz
) from public, anon;
grant execute on function public.record_screening(
  uuid, text, text, text, text, text, numeric, jsonb, jsonb, timestamptz
) to authenticated;
