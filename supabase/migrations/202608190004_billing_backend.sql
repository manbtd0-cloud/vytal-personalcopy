-- Account-linked billing products, invoice checkout metadata, webhook state,
-- and a server-only rate limiter for sensitive Edge Functions.

create table public.billing_products (
  code text primary key check (code ~ '^[a-z][a-z0-9_-]{2,63}$'),
  name text not null check (char_length(name) between 1 and 120),
  description text not null check (char_length(description) between 1 and 500),
  amount_minor bigint not null check (amount_minor between 100 and 1000000000),
  currency text not null check (currency ~ '^[A-Z]{3}$'),
  is_active boolean not null default true,
  metadata jsonb not null default '{}'::jsonb check (jsonb_typeof(metadata) = 'object'),
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create trigger billing_products_set_updated_at
before update on public.billing_products
for each row execute function public.set_updated_at();

insert into public.billing_products (
  code, name, description, amount_minor, currency, metadata
) values (
  'clinic-screening-pack',
  'Clinic screening pack',
  'Account credit for community screening operations and protected record services.',
  2500,
  'USD',
  '{"category":"one_time_account_charge"}'::jsonb
) on conflict (code) do nothing;

alter table public.invoices
  add column if not exists checkout_session_id text unique,
  add column if not exists provider_payment_id text unique,
  add column if not exists line_items jsonb not null default '[]'::jsonb
    check (jsonb_typeof(line_items) = 'array');

alter table public.payment_events
  add column if not exists status text not null default 'processing'
    check (status in ('processing', 'processed', 'failed')),
  add column if not exists attempt_count integer not null default 1
    check (attempt_count between 1 and 100),
  add column if not exists last_error text,
  add column if not exists updated_at timestamptz not null default now();

alter table public.payment_events
  alter column processed_at drop not null,
  alter column processed_at drop default;

create trigger payment_events_set_updated_at
before update on public.payment_events
for each row execute function public.set_updated_at();

create table private.api_rate_limits (
  bucket_key text primary key,
  window_started_at timestamptz not null,
  request_count integer not null check (request_count >= 0),
  updated_at timestamptz not null default now()
);

revoke all on private.api_rate_limits from public, anon, authenticated;

create or replace function public.consume_rate_limit(
  p_bucket_key text,
  p_limit integer,
  p_window_seconds integer
)
returns boolean
language plpgsql
security definer
set search_path = ''
as $$
declare
  v_now timestamptz := clock_timestamp();
  v_count integer;
begin
  if p_bucket_key is null or char_length(p_bucket_key) not between 3 and 200 then
    raise exception using errcode = '22023', message = 'Invalid rate-limit key.';
  end if;
  if p_limit not between 1 and 10000 or p_window_seconds not between 1 and 86400 then
    raise exception using errcode = '22023', message = 'Invalid rate-limit configuration.';
  end if;

  insert into private.api_rate_limits (
    bucket_key, window_started_at, request_count, updated_at
  ) values (
    p_bucket_key, v_now, 1, v_now
  )
  on conflict (bucket_key) do update
  set
    window_started_at = case
      when private.api_rate_limits.window_started_at
        <= v_now - make_interval(secs => p_window_seconds)
      then v_now
      else private.api_rate_limits.window_started_at
    end,
    request_count = case
      when private.api_rate_limits.window_started_at
        <= v_now - make_interval(secs => p_window_seconds)
      then 1
      else private.api_rate_limits.request_count + 1
    end,
    updated_at = v_now
  returning request_count into v_count;

  return v_count <= p_limit;
end;
$$;

revoke all on function public.consume_rate_limit(text, integer, integer)
  from public, anon, authenticated;
grant execute on function public.consume_rate_limit(text, integer, integer)
  to service_role;

create or replace function public.claim_payment_event(
  p_event_id text,
  p_provider text,
  p_event_type text
)
returns boolean
language plpgsql
security definer
set search_path = ''
as $$
declare
  v_status text;
  v_updated_at timestamptz;
begin
  if p_event_id is null or char_length(p_event_id) not between 3 and 255 then
    raise exception using errcode = '22023', message = 'Invalid payment event id.';
  end if;
  if p_provider is null or char_length(p_provider) not between 2 and 40 then
    raise exception using errcode = '22023', message = 'Invalid payment provider.';
  end if;
  if p_event_type is null or char_length(p_event_type) not between 3 and 120 then
    raise exception using errcode = '22023', message = 'Invalid payment event type.';
  end if;

  insert into public.payment_events (
    id, provider, event_type, status, attempt_count, last_error, processed_at, updated_at
  ) values (
    p_event_id, p_provider, p_event_type, 'processing', 1, null, null, now()
  ) on conflict (id) do nothing;

  if found then return true; end if;

  select payment_event.status, payment_event.updated_at
  into v_status, v_updated_at
  from public.payment_events as payment_event
  where payment_event.id = p_event_id
  for update;

  if v_status = 'failed'
    or (v_status = 'processing' and v_updated_at < now() - interval '5 minutes') then
    update public.payment_events
    set
      status = 'processing',
      event_type = p_event_type,
      attempt_count = attempt_count + 1,
      last_error = null,
      updated_at = now()
    where id = p_event_id;
    return true;
  end if;

  return false;
end;
$$;

create or replace function public.finish_payment_event(
  p_event_id text,
  p_succeeded boolean,
  p_error text default null
)
returns void
language plpgsql
security definer
set search_path = ''
as $$
begin
  update public.payment_events
  set
    status = case when p_succeeded then 'processed' else 'failed' end,
    last_error = case
      when p_succeeded then null
      else left(coalesce(p_error, 'Webhook processing failed.'), 1000)
    end,
    processed_at = case when p_succeeded then now() else processed_at end,
    updated_at = now()
  where id = p_event_id
    and status = 'processing';
end;
$$;

revoke all on function public.claim_payment_event(text, text, text)
  from public, anon, authenticated;
revoke all on function public.finish_payment_event(text, boolean, text)
  from public, anon, authenticated;
grant execute on function public.claim_payment_event(text, text, text)
  to service_role;
grant execute on function public.finish_payment_event(text, boolean, text)
  to service_role;

alter table public.billing_products enable row level security;
alter table public.billing_products force row level security;

create policy billing_products_read_active
on public.billing_products for select to authenticated
using (is_active = true);

revoke all on public.billing_products from anon;
revoke insert, update, delete on public.billing_products from authenticated;
grant select on public.billing_products to authenticated;

create index billing_products_active_idx
  on public.billing_products(is_active, code);
create index invoices_user_status_idx
  on public.invoices(user_id, status, issued_at desc);
create index payment_events_status_updated_idx
  on public.payment_events(status, updated_at);
