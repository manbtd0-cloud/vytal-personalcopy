begin;

select plan(7);
set local enable_seqscan = off;

create function pg_temp.explain_text(p_query text)
returns text
language plpgsql
as $$
declare
  v_line text;
  v_plan text := '';
begin
  for v_line in execute 'explain (costs off) ' || p_query loop
    v_plan := v_plan || v_line || E'\n';
  end loop;
  return v_plan;
end;
$$;

select like(
  pg_temp.explain_text($query$
    select id from public.screenings
    where user_id = '50000000-0000-0000-0000-000000000001'
    order by observed_at desc, id desc limit 26
  $query$)::text,
  '%screenings_owner_cursor_idx%'::text,
  'screening keyset pages use the owner cursor index'::text
);

select like(
  pg_temp.explain_text($query$
    select id from public.patients
    where owner_user_id = '50000000-0000-0000-0000-000000000001'
    order by updated_at desc, id desc limit 26
  $query$)::text,
  '%patients_owner_cursor_idx%'::text,
  'patient keyset pages use the owner cursor index'::text
);

select like(
  pg_temp.explain_text($query$
    select id from public.referrals
    where user_id = '50000000-0000-0000-0000-000000000001'
    order by updated_at desc, id desc limit 26
  $query$)::text,
  '%referrals_owner_cursor_idx%'::text,
  'referral keyset pages use the owner cursor index'::text
);

select like(
  pg_temp.explain_text($query$
    select id from public.invoices
    where user_id = '50000000-0000-0000-0000-000000000001'
    order by issued_at desc, id desc limit 26
  $query$)::text,
  '%invoices_owner_cursor_idx%'::text,
  'invoice history uses the owner cursor index'::text
);

select like(
  pg_temp.explain_text($query$
    select id from public.donations
    where user_id = '50000000-0000-0000-0000-000000000001'
    order by created_at desc, id desc limit 26
  $query$)::text,
  '%donations_owner_cursor_idx%'::text,
  'donation history uses the owner cursor index'::text
);

select like(
  pg_temp.explain_text($query$
    select id from public.screenings
    where user_id = '50000000-0000-0000-0000-000000000001'
      and patient_reference = 'VYT-PLAN'
    order by observed_at desc limit 1
  $query$)::text,
  '%screenings_reference_lookup_idx%'::text,
  'patient reference lookup uses its composite index'::text
);

select like(
  pg_temp.explain_text($query$
    select bucket_key from private.api_rate_limits
    where updated_at < now() - interval '2 days'
    order by updated_at limit 100
  $query$)::text,
  '%api_rate_limits_updated_idx%'::text,
  'bounded rate-limit cleanup uses the expiration index'::text
);

select * from finish();
rollback;
