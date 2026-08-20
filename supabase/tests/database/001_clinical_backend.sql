begin;

select plan(19);

select has_table('public', 'patients', 'patients table exists');
select has_table('public', 'vital_observations', 'extensible vital observations table exists');
select has_function(
  'public',
  'record_screening',
  array['uuid', 'text', 'text', 'text', 'text', 'text', 'numeric', 'jsonb', 'jsonb', 'timestamp with time zone'],
  'atomic record_screening backend function exists'
);
select has_function(
  'public',
  'save_account_profile',
  array['jsonb', 'jsonb'],
  'atomic account profile backend function exists'
);

insert into auth.users (
  instance_id, id, aud, role, email, encrypted_password, email_confirmed_at,
  raw_app_meta_data, raw_user_meta_data, created_at, updated_at,
  confirmation_token, email_change, email_change_token_new, recovery_token
) values
  (
    '00000000-0000-0000-0000-000000000000',
    '10000000-0000-0000-0000-000000000001',
    'authenticated', 'authenticated', 'worker-a@example.test', 'test', now(),
    '{"provider":"email","providers":["email"]}', '{}', now(), now(), '', '', '', ''
  ),
  (
    '00000000-0000-0000-0000-000000000000',
    '10000000-0000-0000-0000-000000000002',
    'authenticated', 'authenticated', 'worker-b@example.test', 'test', now(),
    '{"provider":"email","providers":["email"]}', '{}', now(), now(), '', '', '', ''
  );

insert into public.patients (
  id, owner_user_id, patient_code, full_name, consent_status, consent_version, consented_at
) values
  (
    '20000000-0000-0000-0000-000000000001',
    '10000000-0000-0000-0000-000000000001',
    'TEST-A', 'Patient A', 'granted', 'test-v1', now()
  ),
  (
    '20000000-0000-0000-0000-000000000002',
    '10000000-0000-0000-0000-000000000002',
    'TEST-B', 'Patient B', 'granted', 'test-v1', now()
  );

set local role authenticated;
select set_config('request.jwt.claim.sub', '10000000-0000-0000-0000-000000000001', true);
select set_config(
  'request.jwt.claims',
  '{"sub":"10000000-0000-0000-0000-000000000001","role":"authenticated"}',
  true
);

select results_eq(
  $$ select count(*) from public.patients $$,
  array[1::bigint],
  'RLS exposes only the signed-in worker patient'
);

select lives_ok(
  $$
    select public.save_account_profile(
      '{"full_name":"Worker A","sex":"prefer_not_to_say","phone":"+92 300 0000000"}'::jsonb,
      '[{"metric_key":"heart_rate","value_numeric":72,"unit":"bpm"}]'::jsonb
    )
  $$,
  'profile and baseline save atomically'
);
select results_eq(
  $$ select count(*) from public.health_baselines $$,
  array[1::bigint],
  'atomic profile save committed its health baseline'
);
select throws_ok(
  $$ update public.profiles set full_name = 'Bypass' where id = auth.uid() $$,
  null,
  null,
  'browser cannot bypass the atomic profile backend'
);

select throws_ok(
  $$
    select * from public.record_screening(
      '20000000-0000-0000-0000-000000000002', 'en', null, 'camera_rppg',
      'Normal', 'test-v1', 90,
      '[{"metric_key":"heart_rate","value_numeric":76,"unit":"bpm"}]'::jsonb,
      '{}'::jsonb, now()
    )
  $$,
  null,
  null,
  'worker cannot record a screening for another owner patient'
);

select lives_ok(
  $$
    select * from public.record_screening(
      '20000000-0000-0000-0000-000000000001', 'en', 'Test guidance',
      'camera_rppg', 'High', 'test-v1', 92,
      '[
        {"metric_key":"heart_rate","value_numeric":128,"unit":"bpm","confidence":0.9},
        {"metric_key":"breathing_rate","value_numeric":18,"unit":"breaths/min"},
        {"metric_key":"stress_score","value_numeric":70,"unit":"score/100"}
      ]'::jsonb,
      '{"test":true}'::jsonb, now()
    )
  $$,
  'worker can atomically record an owned consented patient screening'
);

select results_eq(
  $$ select count(*) from public.screenings $$,
  array[1::bigint],
  'one screening was committed'
);
select results_eq(
  $$ select count(*) from public.vital_observations $$,
  array[3::bigint],
  'all dynamic observations were committed'
);
select results_eq(
  $$ select count(*) from public.referrals $$,
  array[1::bigint],
  'flagged screening created one referral'
);

select throws_ok(
  $$
    insert into public.screenings (
      user_id, patient_reference, patient_name, status, language, source
    ) values (
      '10000000-0000-0000-0000-000000000001', 'BYPASS', 'Bypass', 'ok', 'en', 'camera_rppg'
    )
  $$,
  null,
  null,
  'authenticated browser cannot bypass atomic screening backend'
);

select throws_ok(
  $$
    select * from public.advance_referral(
      (select id from public.referrals limit 1), 'completed', null
    )
  $$,
  null,
  null,
  'referral stages cannot be skipped'
);

select lives_ok(
  $$
    select * from public.advance_referral(
      (select id from public.referrals limit 1), 'referred', 'Test handoff'
    )
  $$,
  'valid next referral stage succeeds'
);

select results_eq(
  $$ select count(*) from public.referral_events $$,
  array[2::bigint],
  'referral creation and transition are both audited'
);

select throws_ok(
  $$
    insert into public.referral_events (
      referral_id, user_id, from_status, to_status
    ) values (
      (select id from public.referrals limit 1),
      '10000000-0000-0000-0000-000000000001',
      'referred', 'completed'
    )
  $$,
  null,
  null,
  'browser cannot forge append-only referral audit events'
);

reset role;

select results_eq(
  $$ select count(*) from public.audit_events where event_type = 'screening.created' $$,
  array[1::bigint],
  'screening backend emitted one private audit event'
);

select * from finish();
rollback;
