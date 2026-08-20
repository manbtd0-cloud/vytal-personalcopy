begin;

select plan(11);

select has_index(
  'public', 'screenings', 'screenings_reference_lookup_idx',
  'patient-reference screening lookup has a matching index'
);
select has_index(
  'public', 'referrals', 'referrals_owner_updated_idx',
  'ordered owner referral lookup has a matching index'
);
select has_index(
  'private', 'api_rate_limits', 'api_rate_limits_updated_idx',
  'expired rate-limit cleanup has a matching index'
);
select has_function(
  'public', 'apply_checkout_event',
  array['text', 'uuid', 'uuid', 'text', 'text', 'bigint', 'text', 'text', 'text'],
  'atomic checkout event function exists'
);
select has_function(
  'public', 'prune_expired_rate_limits', array['timestamp with time zone'],
  'bounded rate-limit cleanup function exists'
);

insert into auth.users (
  instance_id, id, aud, role, email, encrypted_password, email_confirmed_at,
  raw_app_meta_data, raw_user_meta_data, created_at, updated_at,
  confirmation_token, email_change, email_change_token_new, recovery_token
) values (
  '00000000-0000-0000-0000-000000000000',
  '40000000-0000-0000-0000-000000000001',
  'authenticated', 'authenticated', 'performance@example.test', 'test', now(),
  '{"provider":"email","providers":["email"]}', '{}', now(), now(), '', '', '', ''
);

insert into public.donations (
  id, user_id, provider, checkout_session_id, amount_minor, currency, status
) values (
  '41000000-0000-0000-0000-000000000001',
  '40000000-0000-0000-0000-000000000001',
  'stripe', 'cs_performance_donation', 1500, 'USD', 'pending'
);

insert into public.invoices (
  id, user_id, invoice_number, provider, checkout_session_id, amount_minor, currency, status
) values (
  '42000000-0000-0000-0000-000000000001',
  '40000000-0000-0000-0000-000000000001',
  'PERFORMANCE-INV-1', 'stripe', 'cs_performance_invoice', 2500, 'USD', 'open'
);

insert into private.api_rate_limits (
  bucket_key, window_started_at, request_count, updated_at
) values ('performance:expired', now() - interval '8 days', 1, now() - interval '8 days');

set local role service_role;

select lives_ok(
  $test$
    select public.apply_checkout_event(
      'donation',
      '41000000-0000-0000-0000-000000000001',
      '40000000-0000-0000-0000-000000000001',
      'cs_performance_donation', 'paid', 1500, 'USD', 'pi_performance_donation', null
    )
  $test$,
  'matching donation is updated atomically'
);
select results_eq(
  $$ select status from public.donations where id = '41000000-0000-0000-0000-000000000001' $$,
  array['paid'::text],
  'atomic donation update persists paid status'
);
select throws_ok(
  $test$
    select public.apply_checkout_event(
      'donation',
      '41000000-0000-0000-0000-000000000001',
      '40000000-0000-0000-0000-000000000001',
      'cs_performance_donation', 'paid', 9999, 'USD', 'pi_wrong_amount', null
    )
  $test$,
  null,
  null,
  'mismatched checkout amount is rejected'
);
select lives_ok(
  $test$
    select public.apply_checkout_event(
      'invoice',
      '42000000-0000-0000-0000-000000000001',
      '40000000-0000-0000-0000-000000000001',
      'cs_performance_invoice', 'expired', 2500, 'USD', null, null
    )
  $test$,
  'matching expired invoice is updated atomically'
);
select results_eq(
  $$ select status from public.invoices where id = '42000000-0000-0000-0000-000000000001' $$,
  array['void'::text],
  'expired invoice becomes void'
);
select results_eq(
  $$ select public.prune_expired_rate_limits(now() - interval '2 days') $$,
  array[1],
  'expired rate-limit bucket is pruned with bounded retention'
);

reset role;
select * from finish();
rollback;
