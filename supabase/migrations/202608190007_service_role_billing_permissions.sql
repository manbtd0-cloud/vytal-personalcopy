-- Grant the server-side Supabase role only the table privileges used by the
-- billing and donation Edge Functions. RLS bypass does not replace PostgreSQL
-- table privileges, so these grants are required even for service_role.

grant usage on schema public to service_role;

revoke all on public.billing_products from service_role;
revoke all on public.billing_customers from service_role;
revoke all on public.donations from service_role;
revoke all on public.invoices from service_role;

grant select on public.billing_products to service_role;
grant select, insert, update on public.billing_customers to service_role;
grant select, insert, update on public.donations to service_role;
grant select, insert, update on public.invoices to service_role;
