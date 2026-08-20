begin;

select plan(7);

select has_index('public', 'screenings', 'screenings_owner_cursor_idx', 'screening cursor query is indexed');
select has_index('public', 'patients', 'patients_owner_cursor_idx', 'patient cursor query is indexed');
select has_index('public', 'referrals', 'referrals_owner_cursor_idx', 'referral cursor query is indexed');
select has_index('public', 'invoices', 'invoices_owner_cursor_idx', 'invoice cursor query is indexed');
select has_index('public', 'donations', 'donations_owner_cursor_idx', 'donation cursor query is indexed');

select results_eq(
  $$ select count(*) from pg_publication_tables where pubname = 'supabase_realtime' and schemaname = 'public' and tablename = 'screenings' $$,
  array[1::bigint],
  'screening changes are available to RLS-aware Realtime subscribers'
);
select results_eq(
  $$ select count(*) from pg_publication_tables where pubname = 'supabase_realtime' and schemaname = 'public' and tablename = 'referrals' $$,
  array[1::bigint],
  'referral changes are available to RLS-aware Realtime subscribers'
);

select * from finish();
rollback;
