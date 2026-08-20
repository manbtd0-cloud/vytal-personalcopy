begin;

select plan(11);

select results_eq(
  $$
    select count(*)
    from public.metric_definitions
    where metric_key in (
      'pulse_rmssd_proxy', 'anemia_erythema_index', 'anemia_tier',
      'jaundice_tier', 'bmi_category', 'alert_tier', 'rhythm_screening'
    ) and is_active
  $$,
  array[7::bigint],
  'all merged clinical metrics are registered'
);

insert into auth.users (
  instance_id, id, aud, role, email, encrypted_password, email_confirmed_at,
  raw_app_meta_data, raw_user_meta_data, created_at, updated_at,
  confirmation_token, email_change, email_change_token_new, recovery_token
) values (
  '00000000-0000-0000-0000-000000000000',
  '10000000-0000-0000-0000-000000000007',
  'authenticated', 'authenticated', 'clinical-merge@example.test', 'test', now(),
  '{"provider":"email","providers":["email"]}', '{}', now(), now(), '', '', '', ''
);

insert into public.patients (
  id, owner_user_id, patient_code, full_name, consent_status, consent_version, consented_at
) values
  (
    '20000000-0000-0000-0000-000000000007',
    '10000000-0000-0000-0000-000000000007',
    'VISUAL-OK', 'Visual Patient', 'granted', 'test-v1', now()
  ),
  (
    '20000000-0000-0000-0000-000000000008',
    '10000000-0000-0000-0000-000000000007',
    'VISUAL-NO', 'No Consent Patient', 'revoked', 'test-v1', now()
  );

set local role authenticated;
select set_config('request.jwt.claim.sub', '10000000-0000-0000-0000-000000000007', true);
select set_config(
  'request.jwt.claims',
  '{"sub":"10000000-0000-0000-0000-000000000007","role":"authenticated"}',
  true
);

select lives_ok(
  $$
    select * from public.record_screening(
      '20000000-0000-0000-0000-000000000007', 'en', 'Camera proxy requires confirmation.',
      'camera_anemia', null, 'clinical-merge-v1', 88,
      '[
        {"metric_key":"hemoglobin_proxy","value_numeric":6.8,"unit":"g/dL"},
        {"metric_key":"anemia_erythema_index","value_numeric":0.12,"unit":"index"},
        {"metric_key":"anemia_tier","value_text":"RED"},
        {"metric_key":"alert_tier","value_text":"RED"}
      ]'::jsonb,
      '{"mode":"anemia","age_group":"adult"}'::jsonb,
      now()
    )
  $$,
  'anemia screening stores transactionally without a fabricated heart rate'
);

select results_eq(
  $$ select status from public.screenings where source = 'camera_anemia' $$,
  array['flagged'::text],
  'severe anemia proxy is flagged by the server policy'
);

select results_eq(
  $$
    select priority from public.referrals
    where screening_id = (select id from public.screenings where source = 'camera_anemia')
  $$,
  array['urgent'::text],
  'severe anemia proxy creates an urgent referral'
);

select results_eq(
  $$
    select count(*) from public.vital_observations
    where screening_id = (select id from public.screenings where source = 'camera_anemia')
  $$,
  array[4::bigint],
  'all anemia observations are stored'
);

select results_eq(
  $$
    select count(*) from public.vital_observations
    where screening_id = (select id from public.screenings where source = 'camera_anemia')
      and metric_key = 'heart_rate'
  $$,
  array[0::bigint],
  'visual screening contains no synthetic heart-rate observation'
);

select lives_ok(
  $$
    select * from public.record_screening(
      '20000000-0000-0000-0000-000000000007', 'en', 'No yellowing proxy detected.',
      'camera_jaundice', null, 'clinical-merge-v1', 91,
      '[
        {"metric_key":"bilirubin_proxy","value_numeric":14.2,"unit":"index"},
        {"metric_key":"jaundice_tier","value_text":"GREEN"},
        {"metric_key":"alert_tier","value_text":"GREEN"}
      ]'::jsonb,
      '{"mode":"jaundice"}'::jsonb,
      now()
    )
  $$,
  'normal jaundice proxy stores without creating a pulse reading'
);

select results_eq(
  $$ select status from public.screenings where source = 'camera_jaundice' $$,
  array['ok'::text],
  'normal jaundice proxy remains unflagged'
);

select throws_ok(
  $$
    select * from public.record_screening(
      '20000000-0000-0000-0000-000000000008', 'en', null,
      'camera_anemia', null, 'clinical-merge-v1', 90,
      '[{"metric_key":"hemoglobin_proxy","value_numeric":8.5,"unit":"g/dL"}]'::jsonb,
      '{"mode":"anemia"}'::jsonb,
      now()
    )
  $$,
  null,
  null,
  'visual screening still requires active patient consent'
);

select throws_ok(
  $$
    select * from public.record_screening(
      '20000000-0000-0000-0000-000000000007', 'en', null,
      'camera_jaundice', null, 'clinical-merge-v1', 90,
      '[{"metric_key":"bilirubin_proxy","value_numeric":101,"unit":"index"}]'::jsonb,
      '{"mode":"jaundice"}'::jsonb,
      now()
    )
  $$,
  null,
  null,
  'visual proxy range validation rejects impossible values'
);

select throws_ok(
  $$
    select * from public.record_screening(
      '20000000-0000-0000-0000-000000000007', 'en', null,
      'camera_rppg', null, 'clinical-merge-v1', 90,
      '[{"metric_key":"spo2_proxy","value_numeric":97,"unit":"%"}]'::jsonb,
      '{"mode":"face"}'::jsonb,
      now()
    )
  $$,
  null,
  null,
  'a secondary proxy alone cannot masquerade as a complete screening'
);

select * from finish();
rollback;
