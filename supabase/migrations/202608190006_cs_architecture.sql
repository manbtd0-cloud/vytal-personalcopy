-- Computer-science architecture support: deterministic keyset pagination and
-- row-level-security-aware Realtime feeds for the clinical dashboard.

create index if not exists screenings_owner_cursor_idx
  on public.screenings(user_id, observed_at desc, id desc);

create index if not exists patients_owner_cursor_idx
  on public.patients(owner_user_id, updated_at desc, id desc);

create index if not exists referrals_owner_cursor_idx
  on public.referrals(user_id, updated_at desc, id desc);

create index if not exists invoices_owner_cursor_idx
  on public.invoices(user_id, issued_at desc, id desc);

create index if not exists donations_owner_cursor_idx
  on public.donations(user_id, created_at desc, id desc);

do $$
begin
  if exists (select 1 from pg_publication where pubname = 'supabase_realtime') then
    if not exists (
      select 1 from pg_publication_tables
      where pubname = 'supabase_realtime' and schemaname = 'public' and tablename = 'screenings'
    ) then
      execute 'alter publication supabase_realtime add table public.screenings';
    end if;
    if not exists (
      select 1 from pg_publication_tables
      where pubname = 'supabase_realtime' and schemaname = 'public' and tablename = 'referrals'
    ) then
      execute 'alter publication supabase_realtime add table public.referrals';
    end if;
  end if;
end;
$$;
