begin;

select plan(14);

select ok(
  has_schema_privilege('service_role', 'public', 'USAGE'),
  'service role can access the public schema'
);
select ok(
  has_table_privilege('service_role', 'public.billing_products', 'SELECT'),
  'service role can read the server-owned billing catalogue'
);

select ok(
  has_table_privilege('service_role', 'public.billing_customers', 'SELECT'),
  'service role can read billing customers'
);
select ok(
  has_table_privilege('service_role', 'public.billing_customers', 'INSERT'),
  'service role can create billing customers'
);
select ok(
  has_table_privilege('service_role', 'public.billing_customers', 'UPDATE'),
  'service role can update billing customers'
);

select ok(
  has_table_privilege('service_role', 'public.donations', 'SELECT'),
  'service role can read donations'
);
select ok(
  has_table_privilege('service_role', 'public.donations', 'INSERT'),
  'service role can create donations'
);
select ok(
  has_table_privilege('service_role', 'public.donations', 'UPDATE'),
  'service role can update donations'
);

select ok(
  has_table_privilege('service_role', 'public.invoices', 'SELECT'),
  'service role can read invoices'
);
select ok(
  has_table_privilege('service_role', 'public.invoices', 'INSERT'),
  'service role can create invoices'
);
select ok(
  has_table_privilege('service_role', 'public.invoices', 'UPDATE'),
  'service role can update invoices'
);

select ok(
  not has_table_privilege('service_role', 'public.billing_customers', 'DELETE'),
  'service role cannot delete billing customers'
);
select ok(
  not has_table_privilege('service_role', 'public.donations', 'DELETE'),
  'service role cannot delete donations'
);
select ok(
  not has_table_privilege('service_role', 'public.invoices', 'DELETE'),
  'service role cannot delete invoices'
);

select * from finish();
rollback;
