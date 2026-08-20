-- Backend performance hardening.
-- Adds indexes that match application access paths and moves Stripe checkout
-- validation/update into one atomic database call.

create index if not exists screenings_reference_lookup_idx
  on public.screenings(user_id, patient_reference, observed_at desc);

create index if not exists referrals_owner_updated_idx
  on public.referrals(user_id, updated_at desc);

create index if not exists referrals_active_owner_due_idx
  on public.referrals(user_id, due_at, updated_at desc)
  where status not in ('completed', 'cancelled');

create index if not exists referral_events_owner_occurred_idx
  on public.referral_events(user_id, occurred_at desc);

create index if not exists audit_events_user_occurred_idx
  on public.audit_events(user_id, occurred_at desc);

create index if not exists api_rate_limits_updated_idx
  on private.api_rate_limits(updated_at);

create or replace function public.apply_checkout_event(
  p_kind text,
  p_record_id uuid,
  p_user_id uuid,
  p_checkout_session_id text,
  p_outcome text,
  p_amount_minor bigint,
  p_currency text,
  p_provider_payment_id text default null,
  p_receipt_url text default null
)
returns boolean
language plpgsql
security definer
set search_path = ''
as $$
declare
  v_rows integer := 0;
begin
  if p_kind not in ('donation', 'invoice') then
    raise exception using errcode = '22023', message = 'Unsupported payment kind.';
  end if;
  if p_outcome not in ('pending', 'paid', 'failed', 'expired') then
    raise exception using errcode = '22023', message = 'Unsupported payment outcome.';
  end if;
  if p_record_id is null or p_user_id is null then
    raise exception using errcode = '22004', message = 'Payment ownership metadata is required.';
  end if;
  if p_checkout_session_id is null
    or char_length(p_checkout_session_id) not between 3 and 255 then
    raise exception using errcode = '22023', message = 'Invalid checkout session.';
  end if;
  if p_amount_minor is null or p_amount_minor < 0 then
    raise exception using errcode = '22023', message = 'Invalid checkout amount.';
  end if;
  if p_currency is null or p_currency !~ '^[A-Z]{3}$' then
    raise exception using errcode = '22023', message = 'Invalid checkout currency.';
  end if;
  if p_outcome = 'paid'
    and (p_provider_payment_id is null or char_length(p_provider_payment_id) not between 3 and 255) then
    raise exception using errcode = '22023', message = 'A paid checkout requires a provider payment id.';
  end if;
  if p_receipt_url is not null and char_length(p_receipt_url) > 2048 then
    raise exception using errcode = '22001', message = 'Receipt URL is too long.';
  end if;

  if p_kind = 'donation' then
    if p_outcome = 'pending' then
      perform 1
      from public.donations
      where id = p_record_id
        and user_id = p_user_id
        and checkout_session_id = p_checkout_session_id
        and amount_minor = p_amount_minor
        and currency = p_currency;
      if found then v_rows := 1; end if;
    elsif p_outcome = 'paid' then
      update public.donations
      set
        status = 'paid',
        provider_payment_id = p_provider_payment_id,
        receipt_url = p_receipt_url,
        paid_at = coalesce(paid_at, now())
      where id = p_record_id
        and user_id = p_user_id
        and checkout_session_id = p_checkout_session_id
        and amount_minor = p_amount_minor
        and currency = p_currency
        and status in ('pending', 'failed', 'paid');
      get diagnostics v_rows = row_count;
    else
      update public.donations
      set status = case when p_outcome = 'failed' then 'failed' else 'cancelled' end
      where id = p_record_id
        and user_id = p_user_id
        and checkout_session_id = p_checkout_session_id
        and amount_minor = p_amount_minor
        and currency = p_currency
        and status in ('pending', 'failed', 'cancelled');
      get diagnostics v_rows = row_count;
    end if;
  else
    if p_outcome = 'pending' then
      perform 1
      from public.invoices
      where id = p_record_id
        and user_id = p_user_id
        and checkout_session_id = p_checkout_session_id
        and amount_minor = p_amount_minor
        and currency = p_currency;
      if found then v_rows := 1; end if;
    elsif p_outcome = 'paid' then
      update public.invoices
      set
        status = 'paid',
        provider_payment_id = p_provider_payment_id,
        receipt_url = p_receipt_url,
        paid_at = coalesce(paid_at, now())
      where id = p_record_id
        and user_id = p_user_id
        and checkout_session_id = p_checkout_session_id
        and amount_minor = p_amount_minor
        and currency = p_currency
        and status in ('open', 'uncollectible', 'paid');
      get diagnostics v_rows = row_count;
    else
      update public.invoices
      set status = case when p_outcome = 'failed' then 'uncollectible' else 'void' end
      where id = p_record_id
        and user_id = p_user_id
        and checkout_session_id = p_checkout_session_id
        and amount_minor = p_amount_minor
        and currency = p_currency
        and status in ('open', 'uncollectible', 'void');
      get diagnostics v_rows = row_count;
    end if;
  end if;

  if v_rows <> 1 then
    raise exception using errcode = 'P0001',
      message = 'Checkout metadata does not match exactly one server record.';
  end if;

  return true;
end;
$$;

create or replace function public.prune_expired_rate_limits(
  p_before timestamptz default now() - interval '2 days'
)
returns integer
language plpgsql
security definer
set search_path = ''
as $$
declare
  v_deleted integer;
begin
  if p_before is null or p_before > now() - interval '1 hour' then
    raise exception using errcode = '22023', message = 'Rate-limit cutoff is too recent.';
  end if;

  delete from private.api_rate_limits where updated_at < p_before;
  get diagnostics v_deleted = row_count;
  return v_deleted;
end;
$$;

revoke all on function public.apply_checkout_event(
  text, uuid, uuid, text, text, bigint, text, text, text
) from public, anon, authenticated;
revoke all on function public.prune_expired_rate_limits(timestamptz)
  from public, anon, authenticated;
grant execute on function public.apply_checkout_event(
  text, uuid, uuid, text, text, bigint, text, text, text
) to service_role;
grant execute on function public.prune_expired_rate_limits(timestamptz)
  to service_role;
