-- Separate care recipients from authenticated health-worker accounts and
-- attach every new screening/referral to the correct patient owner.

create table public.patients (
  id uuid primary key default gen_random_uuid(),
  owner_user_id uuid not null references auth.users(id) on delete cascade,
  patient_code text not null
    check (char_length(patient_code) between 1 and 80)
    check (patient_code ~ '^[A-Za-z0-9][A-Za-z0-9_.-]{0,79}$'),
  full_name text not null check (char_length(full_name) between 1 and 120),
  date_of_birth date check (date_of_birth is null or date_of_birth <= current_date),
  sex text not null default 'prefer_not_to_say'
    check (sex in ('female', 'male', 'intersex', 'other', 'prefer_not_to_say')),
  phone text check (phone is null or phone ~ '^[0-9+() .-]{1,32}$'),
  address jsonb not null default '{}'::jsonb check (jsonb_typeof(address) = 'object'),
  emergency_contact jsonb not null default '{}'::jsonb
    check (jsonb_typeof(emergency_contact) = 'object'),
  consent_status text not null default 'pending'
    check (consent_status in ('pending', 'granted', 'withdrawn')),
  consent_version text,
  consented_at timestamptz,
  custom_fields jsonb not null default '{}'::jsonb check (jsonb_typeof(custom_fields) = 'object'),
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  unique (owner_user_id, patient_code),
  unique (id, owner_user_id),
  constraint granted_consent_has_time check (
    consent_status <> 'granted' or consented_at is not null
  )
);

create trigger patients_set_updated_at
before update on public.patients
for each row execute function public.set_updated_at();

alter table public.screenings add column patient_id uuid;
alter table public.screenings
  add constraint screenings_patient_owner_fk foreign key (patient_id, user_id)
  references public.patients(id, owner_user_id) on delete restrict;

alter table public.health_baselines add column patient_id uuid;
alter table public.health_baselines
  add constraint baselines_patient_owner_fk foreign key (patient_id, user_id)
  references public.patients(id, owner_user_id) on delete cascade;
alter table public.health_baselines
  drop constraint if exists health_baselines_user_id_metric_key_key;
create unique index health_baselines_patient_metric_unique
  on public.health_baselines(patient_id, metric_key) where patient_id is not null;
create unique index health_baselines_account_metric_unique
  on public.health_baselines(user_id, metric_key) where patient_id is null;

create table public.referrals (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users(id) on delete cascade,
  patient_id uuid not null,
  screening_id uuid unique,
  status text not null default 'flagged'
    check (status in ('flagged', 'referred', 'contacted', 'appointment_booked', 'completed', 'cancelled')),
  priority text not null default 'priority'
    check (priority in ('routine', 'priority', 'urgent')),
  reason text not null check (char_length(reason) between 1 and 500),
  due_at timestamptz,
  notes text check (notes is null or char_length(notes) <= 2000),
  completed_at timestamptz,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  unique (id, user_id),
  constraint completed_referral_has_time check (
    (status = 'completed' and completed_at is not null)
    or (status <> 'completed' and completed_at is null)
  ),
  constraint referrals_patient_owner_fk foreign key (patient_id, user_id)
    references public.patients(id, owner_user_id) on delete cascade,
  constraint referrals_screening_owner_fk foreign key (screening_id, user_id)
    references public.screenings(id, user_id) on delete restrict
);

create trigger referrals_set_updated_at
before update on public.referrals
for each row execute function public.set_updated_at();

-- Append-only referral events retain the care trail even as the current status changes.
create table public.referral_events (
  id bigint generated always as identity primary key,
  referral_id uuid not null,
  user_id uuid not null references auth.users(id) on delete cascade,
  actor_user_id uuid references auth.users(id) on delete set null,
  from_status text,
  to_status text not null,
  occurred_at timestamptz not null default now(),
  constraint referral_events_owner_fk foreign key (referral_id, user_id)
    references public.referrals(id, user_id) on delete cascade
);

create or replace function public.log_referral_transition()
returns trigger
language plpgsql
security definer
set search_path = public
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

create trigger referrals_log_transition
after insert or update of status on public.referrals
for each row execute function public.log_referral_transition();

create index patients_owner_updated_idx on public.patients(owner_user_id, updated_at desc);
create index screenings_patient_observed_idx on public.screenings(patient_id, observed_at desc);
create index referrals_owner_status_idx on public.referrals(user_id, status, updated_at desc);
create index referrals_patient_idx on public.referrals(patient_id, updated_at desc);

alter table public.patients enable row level security;
alter table public.patients force row level security;
alter table public.referrals enable row level security;
alter table public.referrals force row level security;
alter table public.referral_events enable row level security;
alter table public.referral_events force row level security;

create policy patients_select_own on public.patients for select to authenticated
  using ((select auth.uid()) = owner_user_id);
create policy patients_insert_own on public.patients for insert to authenticated
  with check ((select auth.uid()) = owner_user_id);
create policy patients_update_own on public.patients for update to authenticated
  using ((select auth.uid()) = owner_user_id) with check ((select auth.uid()) = owner_user_id);
create policy patients_delete_own on public.patients for delete to authenticated
  using ((select auth.uid()) = owner_user_id);

create policy referrals_select_own on public.referrals for select to authenticated
  using ((select auth.uid()) = user_id);
create policy referrals_insert_own on public.referrals for insert to authenticated
  with check ((select auth.uid()) = user_id);
create policy referrals_update_own on public.referrals for update to authenticated
  using ((select auth.uid()) = user_id) with check ((select auth.uid()) = user_id);
create policy referrals_delete_own on public.referrals for delete to authenticated
  using ((select auth.uid()) = user_id);

create policy referral_events_select_own on public.referral_events for select to authenticated
  using ((select auth.uid()) = user_id);

revoke all on public.patients, public.referrals, public.referral_events from anon;
revoke insert, update, delete on public.referral_events from authenticated;
grant select, insert, update, delete on public.patients, public.referrals to authenticated;
grant select on public.referral_events to authenticated;

-- Preserve earlier prototype screenings by creating owner-scoped patient rows.
insert into public.patients (
  owner_user_id, patient_code, full_name, consent_status, consent_version, consented_at
)
select
  user_id,
  patient_reference,
  max(patient_name),
  'pending',
  null,
  null
from public.screenings
group by user_id, patient_reference
on conflict (owner_user_id, patient_code) do nothing;

update public.screenings as screening
set patient_id = patient.id
from public.patients as patient
where screening.patient_id is null
  and patient.owner_user_id = screening.user_id
  and patient.patient_code = screening.patient_reference;

insert into public.referrals (
  user_id, patient_id, screening_id, status, priority, reason, due_at
)
select
  screening.user_id,
  screening.patient_id,
  screening.id,
  'flagged',
  'priority',
  'Earlier flagged screening requires follow-up review.',
  screening.observed_at + interval '1 day'
from public.screenings as screening
where screening.status = 'flagged' and screening.patient_id is not null
on conflict (screening_id) do nothing;
