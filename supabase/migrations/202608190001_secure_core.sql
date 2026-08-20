-- VYTAL secure core schema
-- Authenticated ownership is enforced in Postgres, not trusted to the browser.

create extension if not exists pgcrypto;
create schema if not exists private;
revoke all on schema private from public, anon, authenticated;

create or replace function public.set_updated_at()
returns trigger
language plpgsql
set search_path = ''
as $$
begin
  new.updated_at = now();
  return new;
end;
$$;

-- Trigger helpers are not callable application APIs.
revoke all on function public.set_updated_at() from public, anon, authenticated;

create table if not exists public.profiles (
  id uuid primary key references auth.users(id) on delete cascade,
  full_name text not null default '' check (char_length(full_name) <= 120),
  date_of_birth date check (date_of_birth is null or date_of_birth <= current_date),
  sex text not null default 'prefer_not_to_say'
    check (sex in ('female', 'male', 'intersex', 'other', 'prefer_not_to_say')),
  phone text check (phone is null or phone ~ '^[0-9+() .-]{1,32}$'),
  address jsonb not null default '{}'::jsonb check (jsonb_typeof(address) = 'object'),
  emergency_contact jsonb not null default '{}'::jsonb
    check (jsonb_typeof(emergency_contact) = 'object'),
  custom_fields jsonb not null default '{}'::jsonb check (jsonb_typeof(custom_fields) = 'object'),
  consent_version text,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create trigger profiles_set_updated_at
before update on public.profiles
for each row execute function public.set_updated_at();

create table if not exists public.metric_definitions (
  metric_key text primary key check (metric_key ~ '^[a-z][a-z0-9_]{1,63}$'),
  label text not null check (char_length(label) between 1 and 100),
  canonical_unit text,
  value_type text not null default 'number' check (value_type in ('number', 'text', 'boolean', 'json')),
  description text,
  is_active boolean not null default true,
  created_at timestamptz not null default now()
);

insert into public.metric_definitions (metric_key, label, canonical_unit, description)
values
  ('heart_rate', 'Heart rate', 'bpm', 'Camera-estimated pulse rate'),
  ('breathing_rate', 'Breathing rate', 'breaths/min', 'Camera-estimated respiratory rate'),
  ('stress_score', 'Pulse variability stress score', 'score/100', 'Screening trend derived from variability'),
  ('spo2_proxy', 'Blood oxygen proxy', '%', 'Camera proxy requiring clinical confirmation'),
  ('systolic_bp_trend', 'Systolic blood pressure trend', 'mmHg', 'Calibrated trend only'),
  ('diastolic_bp_trend', 'Diastolic blood pressure trend', 'mmHg', 'Calibrated trend only'),
  ('hemoglobin_proxy', 'Hemoglobin proxy', 'g/dL', 'Conjunctival pallor screening proxy'),
  ('bilirubin_proxy', 'Bilirubin proxy', 'index', 'Scleral colour screening proxy'),
  ('bmi_proxy', 'BMI proxy', 'kg/m2', 'Anthropometric screening proxy'),
  ('temperature', 'Temperature', 'C', 'External thermal sensor reading')
on conflict (metric_key) do nothing;

create table if not exists public.health_baselines (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users(id) on delete cascade,
  metric_key text not null check (metric_key ~ '^[a-z][a-z0-9_]{1,63}$'),
  value_numeric double precision,
  value_text text,
  unit text check (unit is null or char_length(unit) <= 32),
  metadata jsonb not null default '{}'::jsonb check (jsonb_typeof(metadata) = 'object'),
  recorded_at timestamptz not null default now(),
  created_at timestamptz not null default now(),
  constraint baseline_has_value check (value_numeric is not null or value_text is not null),
  unique (user_id, metric_key)
);

create table if not exists public.screenings (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users(id) on delete cascade,
  patient_reference text not null check (char_length(patient_reference) between 1 and 80),
  patient_name text not null check (char_length(patient_name) between 1 and 120),
  status text not null default 'ok' check (status in ('ok', 'pending', 'flagged')),
  stress_label text,
  explanation text,
  language text not null default 'en' check (char_length(language) between 2 and 12),
  source text not null default 'camera_rppg' check (char_length(source) <= 40),
  metadata jsonb not null default '{}'::jsonb check (jsonb_typeof(metadata) = 'object'),
  observed_at timestamptz not null default now(),
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  unique (id, user_id)
);

create trigger screenings_set_updated_at
before update on public.screenings
for each row execute function public.set_updated_at();

create table if not exists public.vital_observations (
  id uuid primary key default gen_random_uuid(),
  screening_id uuid not null,
  user_id uuid not null,
  metric_key text not null check (metric_key ~ '^[a-z][a-z0-9_]{1,63}$'),
  value_numeric double precision,
  value_text text,
  value_json jsonb,
  unit text check (unit is null or char_length(unit) <= 32),
  confidence numeric(5,4) check (confidence is null or confidence between 0 and 1),
  metadata jsonb not null default '{}'::jsonb check (jsonb_typeof(metadata) = 'object'),
  observed_at timestamptz not null default now(),
  created_at timestamptz not null default now(),
  constraint observation_owner_fk foreign key (screening_id, user_id)
    references public.screenings(id, user_id) on delete cascade,
  constraint observation_has_value check (
    value_numeric is not null or value_text is not null or value_json is not null
  )
);

create table if not exists public.billing_customers (
  user_id uuid primary key references auth.users(id) on delete cascade,
  provider text not null check (provider in ('stripe', 'jazzcash', 'easypaisa')),
  provider_customer_id text not null unique,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create trigger billing_customers_set_updated_at
before update on public.billing_customers
for each row execute function public.set_updated_at();

create table if not exists public.donations (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users(id) on delete cascade,
  provider text not null check (provider in ('stripe', 'jazzcash', 'easypaisa')),
  checkout_session_id text unique,
  provider_payment_id text unique,
  amount_minor bigint not null check (amount_minor between 100 and 1000000000),
  currency text not null check (currency ~ '^[A-Z]{3}$'),
  status text not null default 'pending'
    check (status in ('pending', 'paid', 'failed', 'refunded', 'cancelled')),
  receipt_url text,
  metadata jsonb not null default '{}'::jsonb check (jsonb_typeof(metadata) = 'object'),
  created_at timestamptz not null default now(),
  paid_at timestamptz,
  updated_at timestamptz not null default now()
);

create trigger donations_set_updated_at
before update on public.donations
for each row execute function public.set_updated_at();

create table if not exists public.invoices (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users(id) on delete cascade,
  invoice_number text not null unique,
  provider text not null check (provider in ('stripe', 'jazzcash', 'easypaisa', 'manual')),
  provider_invoice_id text unique,
  amount_minor bigint not null check (amount_minor >= 0),
  currency text not null check (currency ~ '^[A-Z]{3}$'),
  status text not null check (status in ('draft', 'open', 'paid', 'void', 'uncollectible')),
  receipt_url text,
  metadata jsonb not null default '{}'::jsonb check (jsonb_typeof(metadata) = 'object'),
  issued_at timestamptz not null default now(),
  due_at timestamptz,
  paid_at timestamptz,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create trigger invoices_set_updated_at
before update on public.invoices
for each row execute function public.set_updated_at();

create table if not exists public.payment_events (
  id text primary key,
  provider text not null,
  event_type text not null,
  processed_at timestamptz not null default now()
);

create table if not exists public.audit_events (
  id bigint generated always as identity primary key,
  user_id uuid,
  event_type text not null,
  resource_type text,
  resource_id text,
  metadata jsonb not null default '{}'::jsonb,
  occurred_at timestamptz not null default now()
);

create index if not exists profiles_updated_idx on public.profiles(updated_at desc);
create index if not exists baselines_user_idx on public.health_baselines(user_id);
create index if not exists screenings_user_observed_idx on public.screenings(user_id, observed_at desc);
create index if not exists observations_user_idx on public.vital_observations(user_id);
create index if not exists observations_screening_idx on public.vital_observations(screening_id);
create index if not exists donations_user_created_idx on public.donations(user_id, created_at desc);
create index if not exists invoices_user_issued_idx on public.invoices(user_id, issued_at desc);

alter table public.profiles enable row level security;
alter table public.profiles force row level security;
alter table public.metric_definitions enable row level security;
alter table public.metric_definitions force row level security;
alter table public.health_baselines enable row level security;
alter table public.health_baselines force row level security;
alter table public.screenings enable row level security;
alter table public.screenings force row level security;
alter table public.vital_observations enable row level security;
alter table public.vital_observations force row level security;
alter table public.billing_customers enable row level security;
alter table public.billing_customers force row level security;
alter table public.donations enable row level security;
alter table public.donations force row level security;
alter table public.invoices enable row level security;
alter table public.invoices force row level security;
alter table public.payment_events enable row level security;
alter table public.payment_events force row level security;
alter table public.audit_events enable row level security;
alter table public.audit_events force row level security;

create policy profiles_select_own on public.profiles for select to authenticated
  using ((select auth.uid()) is not null and (select auth.uid()) = id);
create policy profiles_insert_own on public.profiles for insert to authenticated
  with check ((select auth.uid()) is not null and (select auth.uid()) = id);
create policy profiles_update_own on public.profiles for update to authenticated
  using ((select auth.uid()) = id) with check ((select auth.uid()) = id);

create policy metric_definitions_read on public.metric_definitions for select to authenticated
  using (is_active = true);

create policy baselines_select_own on public.health_baselines for select to authenticated
  using ((select auth.uid()) = user_id);
create policy baselines_insert_own on public.health_baselines for insert to authenticated
  with check ((select auth.uid()) = user_id);
create policy baselines_update_own on public.health_baselines for update to authenticated
  using ((select auth.uid()) = user_id) with check ((select auth.uid()) = user_id);
create policy baselines_delete_own on public.health_baselines for delete to authenticated
  using ((select auth.uid()) = user_id);

create policy screenings_select_own on public.screenings for select to authenticated
  using ((select auth.uid()) = user_id);
create policy screenings_insert_own on public.screenings for insert to authenticated
  with check ((select auth.uid()) = user_id);
create policy screenings_update_own on public.screenings for update to authenticated
  using ((select auth.uid()) = user_id) with check ((select auth.uid()) = user_id);
create policy screenings_delete_own on public.screenings for delete to authenticated
  using ((select auth.uid()) = user_id);

create policy observations_select_own on public.vital_observations for select to authenticated
  using ((select auth.uid()) = user_id);
create policy observations_insert_own on public.vital_observations for insert to authenticated
  with check ((select auth.uid()) = user_id);
create policy observations_update_own on public.vital_observations for update to authenticated
  using ((select auth.uid()) = user_id) with check ((select auth.uid()) = user_id);
create policy observations_delete_own on public.vital_observations for delete to authenticated
  using ((select auth.uid()) = user_id);

-- Billing identifiers and statuses are webhook-managed. Users may only read their own rows.
create policy billing_customers_select_own on public.billing_customers for select to authenticated
  using ((select auth.uid()) = user_id);
create policy donations_select_own on public.donations for select to authenticated
  using ((select auth.uid()) = user_id);
create policy invoices_select_own on public.invoices for select to authenticated
  using ((select auth.uid()) = user_id);

revoke all on all tables in schema public from anon;
revoke all on public.payment_events, public.audit_events from authenticated;
grant select, insert, update on public.profiles to authenticated;
grant select on public.metric_definitions to authenticated;
grant select, insert, update, delete on public.health_baselines to authenticated;
grant select, insert, update, delete on public.screenings to authenticated;
grant select, insert, update, delete on public.vital_observations to authenticated;
grant select on public.billing_customers, public.donations, public.invoices to authenticated;

create or replace function private.handle_new_user()
returns trigger
language plpgsql
security definer
set search_path = ''
as $$
begin
  insert into public.profiles (id, full_name)
  values (new.id, coalesce(new.raw_user_meta_data ->> 'full_name', ''))
  on conflict (id) do nothing;
  return new;
end;
$$;

revoke all on function private.handle_new_user() from public, anon, authenticated;

drop trigger if exists on_auth_user_created on auth.users;
create trigger on_auth_user_created
after insert on auth.users
for each row execute function private.handle_new_user();
