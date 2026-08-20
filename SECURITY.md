# VYTAL security and deployment

VYTAL handles health screening and payment metadata. This repository provides a secure-by-default
application structure, but deploying it does **not** by itself make the product a certified medical
device or a regulated-compliance environment.

## Security model

- Supabase Auth identifies the account making each database request.
- PostgreSQL row-level security (RLS) compares every user-owned row with `auth.uid()`.
- New vitals are stored as validated observation rows, not added as unbounded profile columns.
- Browser code receives only the Supabase URL and publishable key.
- Database secret/service-role, AI provider, Stripe, and webhook keys are Edge Function secrets.
- Payment methods are collected by Stripe-hosted Checkout. VYTAL stores provider identifiers,
  amount, currency, state, and receipt URL - never card numbers or CVC data.
- Donation and invoice state has no client insert/update policy. Signed webhooks control payment state.
- Unconfigured preview mode keeps demo/new screening rows in memory and does not persist PHI in
  `localStorage`.
- Referral status transitions are copied into an append-only event table. Authenticated browser
  clients may read their own event history but cannot insert, update, or delete audit events directly.
- Profile/baseline and screening/referral writes use transactional database functions. Authenticated
  clients cannot bypass those functions with direct table mutations.
- Billing prices are read from a server-owned catalogue. Browser-supplied prices are never trusted.
- Checkout and AI Edge Functions use per-account rate limits stored in a private database schema.
- Edge Function traces log request IDs, status, duration and stable error codes only; request bodies,
  authorization headers, patient readings, payment metadata and provider secrets are excluded.

## Immediate credential action

An AI provider credential previously existed in frontend source. Treat that credential as compromised:

1. Revoke it in the provider dashboard.
2. Create a replacement.
3. Store the replacement as `GROQ_API_KEY` or `DASHSCOPE_API_KEY` in Supabase Edge Function secrets.
4. Do not put the replacement in a `VITE_` variable, GitHub secret visible to preview builds, issue,
   commit message, screenshot, or chat.

Removing a secret from the current file does not remove it from Git history. Coordinate a history
rewrite separately if the repository owner requires one, then rotate credentials again afterward.

## Deploy the database

1. Create a Supabase project in an appropriate region and enable email confirmation/MFA as required.
2. Apply the migrations in filename order using the Supabase CLI or SQL editor:

   ```text
   supabase/migrations/202608190001_secure_core.sql
   supabase/migrations/202608190002_patient_referrals.sql
   supabase/migrations/202608190003_atomic_clinical_backend.sql
   supabase/migrations/202608190004_billing_backend.sql
   supabase/migrations/202608190005_backend_performance.sql
   supabase/migrations/202608190006_cs_architecture.sql
   supabase/migrations/202608190007_service_role_billing_permissions.sql
   supabase/migrations/202608200008_extended_clinical_screenings.sql
   ```

3. Confirm RLS is enabled and forced on all public health, patient, referral, and billing tables.
4. Verify that a health worker can only select patient and referral rows owned by their own account.
5. Configure only these browser values in `.env.local` or the hosting dashboard:

   ```text
   VITE_SUPABASE_URL=https://your-project.supabase.co
   VITE_SUPABASE_PUBLISHABLE_KEY=sb_publishable_...
   ```

6. Never expose a Supabase secret/service-role key to Vite or the browser.

## Deploy server functions

Configure secrets from `supabase/functions/.env.example` with `supabase secrets set`, then deploy:

```bash
supabase functions deploy ai-explanation
supabase functions deploy create-billing-checkout
supabase functions deploy create-donation-checkout
supabase functions deploy stripe-webhook --no-verify-jwt
```

Set `SITE_URL` to the exact production origin and `ALLOWED_ORIGINS` to a comma-separated allowlist.
Do not reflect arbitrary request origins.

## Activate Stripe billing and donations

1. Start with Stripe test-mode keys.
2. Register the deployed `stripe-webhook` URL in Stripe.
3. Subscribe to `checkout.session.completed`, `checkout.session.async_payment_succeeded`,
   `checkout.session.async_payment_failed`, and `checkout.session.expired`.
4. Store the signing secret as `STRIPE_WEBHOOK_SECRET`.
5. Test successful, cancelled, delayed, duplicated, and invalid-signature events.
6. Switch to live keys only after the webhook, receipts, refund process, privacy notice, and legal
   ownership of the merchant account are approved.

JazzCash/Easypaisa require separate merchant credentials and callback-signature adapters. Do not label
either provider as active until its server integration and signed callback verification are complete.

## Operational checklist

- Run `npm run verify` before every deployment.
- Run `supabase test db` with local Supabase before every database deployment. See
  `docs/BACKEND_IMPLEMENTATION.md` for the complete test sequence.
- Require MFA for Supabase, Stripe, GitHub, Vercel, and AI-provider administrators.
- Enable database backups and regularly test restoration.
- Set log retention and avoid logging names, contact details, raw images, access tokens, or full AI prompts.
- Configure monitoring for repeated authentication failures, payment webhook errors, and RLS denials.
- Call the service-only `prune_expired_rate_limits()` function daily from a trusted scheduler so old
  rate-limit buckets do not grow indefinitely.
- Maintain a breach-response process and a documented data-retention/deletion policy.
- Perform a professional penetration test and privacy/compliance review before handling real patient data.
