begin;

select plan(14);

select has_table('public', 'billing_products', 'server-owned billing products table exists');
select has_column('public', 'invoices', 'checkout_session_id', 'invoices track hosted checkout sessions');
select has_function(
  'public', 'consume_rate_limit', array['text', 'integer', 'integer'],
  'server-only rate limiter exists'
);
select has_function(
  'public', 'claim_payment_event', array['text', 'text', 'text'],
  'idempotent payment event claim function exists'
);

insert into auth.users (
  instance_id, id, aud, role, email, encrypted_password, email_confirmed_at,
  raw_app_meta_data, raw_user_meta_data, created_at, updated_at,
  confirmation_token, email_change, email_change_token_new, recovery_token
) values
  (
    '00000000-0000-0000-0000-000000000000',
    '30000000-0000-0000-0000-000000000001',
    'authenticated', 'authenticated', 'billing-a@example.test', 'test', now(),
    '{"provider":"email","providers":["email"]}', '{}', now(), now(), '', '', '', ''
  ),
  (
    '00000000-0000-0000-0000-000000000000',
    '30000000-0000-0000-0000-000000000002',
    'authenticated', 'authenticated', 'billing-b@example.test', 'test', now(),
    '{"provider":"email","providers":["email"]}', '{}', now(), now(), '', '', '', ''
  );

insert into public.invoices (
  user_id, invoice_number, provider, amount_minor, currency, status
) values
  ('30000000-0000-0000-0000-000000000001', 'TEST-INV-A', 'stripe', 2500, 'USD', 'open'),
  ('30000000-0000-0000-0000-000000000002', 'TEST-INV-B', 'stripe', 2500, 'USD', 'open');

insert into public.donations (
  user_id, provider, amount_minor, currency, status
) values
  ('30000000-0000-0000-0000-000000000001', 'stripe', 1000, 'USD', 'pending'),
  ('30000000-0000-0000-0000-000000000002', 'stripe', 1000, 'USD', 'pending');

set local role authenticated;
select set_config('request.jwt.claim.sub', '30000000-0000-0000-0000-000000000001', true);
select set_config(
  'request.jwt.claims',
  '{"sub":"30000000-0000-0000-0000-000000000001","role":"authenticated"}',
  true
);

select results_eq(
  $$ select count(*) from public.invoices $$,
  array[1::bigint],
  'account sees only its own invoice'
);
select results_eq(
  $$ select count(*) from public.donations $$,
  array[1::bigint],
  'account sees only its own donation'
);
select results_eq(
  $$ select count(*) from public.billing_products where is_active $$,
  array[1::bigint],
  'authenticated account can read active server pricing'
);
select throws_ok(
  $$
    insert into public.invoices (
      user_id, invoice_number, provider, amount_minor, currency, status
    ) values (
      '30000000-0000-0000-0000-000000000001', 'FORGED', 'stripe', 1, 'USD', 'paid'
    )
  $$,
  null,
  null,
  'browser cannot forge an invoice or price'
);
select throws_ok(
  $$ select count(*) from public.payment_events $$,
  null,
  null,
  'browser cannot read private payment event state'
);

reset role;
set local role service_role;

select ok(
  public.consume_rate_limit('test:billing-limit', 1, 60),
  'first rate-limited backend request is allowed'
);
select ok(
  not public.consume_rate_limit('test:billing-limit', 1, 60),
  'request above the configured limit is rejected'
);
select ok(
  public.claim_payment_event('evt_test_backend', 'stripe', 'checkout.session.completed'),
  'first signed provider event is claimed'
);
select ok(
  not public.claim_payment_event('evt_test_backend', 'stripe', 'checkout.session.completed'),
  'duplicate provider event is not processed twice'
);

select public.finish_payment_event('evt_test_backend', true, null);
reset role;

select results_eq(
  $$ select status from public.payment_events where id = 'evt_test_backend' $$,
  array['processed'::text],
  'claimed provider event is finalized as processed'
);

select * from finish();
rollback;
