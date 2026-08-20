# VYTAL backend implementation and test guide

This branch completes the backend work from the task board in dependency order. Task 02, the
competitive scoreboard, is intentionally deferred because the board marks it as a future module.

## Task 01 — Dynamic user and clinical database

Completed:

- Authenticated account profiles, contact details, emergency contacts, and custom fields.
- Extensible metric definitions and health baselines instead of one database column per vital.
- Consent-first patients linked to every production screening.
- `save_account_profile(...)` stores profile and baseline changes in one transaction.
- `record_screening(...)` validates and stores a screening, its observations, its risk result, its
  optional referral, and its private audit event in one transaction.
- The forward `202608200008_extended_clinical_screenings.sql` migration accepts anemia, jaundice,
  BMI, SpO₂, rhythm, and calibrated blood-pressure-trend observations. Visual modes may omit heart
  rate, but must contain a bounded primary measurement; the backend never fabricates one.
- `advance_referral(...)` enforces the care-path order; browser code cannot skip stages.
- Row-level security restricts reads to the owner, while table privileges prevent browser clients
  from bypassing the protected write functions.

## Task 03 — Account-linked billing

Completed:

- Server-owned billing product and price catalogue.
- Stripe-hosted account checkout created by an authenticated Edge Function.
- Stripe customer IDs, invoices, line items, states, and receipt links tied to the authenticated user.
- The browser can read only its own invoice history and cannot create or mark invoices paid.

## Task 04 — Donations and receipts

Completed:

- Authenticated Donate flow with bounded amount and currency validation.
- Stripe-hosted payment page; VYTAL never receives a card number or CVC.
- Signed webhook processing for immediate, delayed, failed, and expired Checkout sessions.
- Stored amount/currency matching before any payment is accepted.
- Retry-safe payment-event claims prevent duplicate event processing.
- Provider receipt links are saved after confirmed payment.
- Per-user rate limiting for payment checkout and AI explanation endpoints.

## Local application test

On Windows PowerShell, use `npm.cmd` if PowerShell blocks `npm.ps1`:

```powershell
cd C:\Users\A\OneDrive\Documents\GitHub\Vital
npm.cmd install
npm.cmd run verify
npm.cmd run dev
```

Open `http://localhost:5173` and test:

1. Sign up or sign in on Account.
2. Save profile and baseline values, refresh, and confirm they persist.
3. Register a patient with consent granted.
4. Run face/fingertip, anemia, jaundice, BMI, and BP-trend modes; confirm reports contain only actual measurements.
5. Run a flagged screening and confirm one referral is created with the expected priority.
6. Advance the referral one stage at a time; confirm stage skipping is rejected.
7. Open Billing and confirm the server product, account invoices, and donation history load.

## Import and push the delivered branch bundle

Download `VYTAL_Backend_All_Tasks_Final.bundle` to your Windows Downloads folder. In the VS Code
PowerShell terminal, first confirm `git status` does not show local work you still need to commit,
then run:

```powershell
cd C:\Users\A\OneDrive\Documents\GitHub\Vital
git switch agent/secure-database-billing
git fetch "$env:USERPROFILE\Downloads\VYTAL_Backend_All_Tasks_Final.bundle" agent/secure-database-billing
git merge --ff-only FETCH_HEAD
git push -u origin agent/secure-database-billing
```

The `--ff-only` guard stops instead of overwriting divergent local work. After the push, GitHub
Actions will run the application verification and database policy tests.

## Local database policy test

Install Docker Desktop and the Supabase CLI, then run from the repository root:

```powershell
supabase start
supabase test db
```

The pgTAP files under `supabase/tests/database/` verify owner isolation, consent, direct-write denial,
transactional pulse and visual clinical writes, no synthetic heart-rate observations, proxy ranges,
referral rules, query plans, server pricing, private payment events, rate limits, and webhook-event idempotency.

## Stripe test-mode test

1. Apply all migrations in filename order.
2. Configure the secrets listed in `supabase/functions/.env.example`.
3. Deploy all four Edge Functions listed in `SECURITY.md`.
4. Register `stripe-webhook` in Stripe test mode for the documented Checkout events.
5. Start Stripe CLI forwarding when testing locally:

   ```powershell
   stripe listen --forward-to https://YOUR_PROJECT.supabase.co/functions/v1/stripe-webhook
   ```

6. Use Stripe's successful test card `4242 4242 4242 4242` with any future expiry/CVC.
7. Confirm the invoice or donation changes to `paid` only after the signed webhook arrives.
8. Confirm the receipt link appears and a repeated event does not create a second update.
9. Test cancellation, delayed payment, invalid signature, amount mismatch, and rate-limit responses.

Never use live keys or real patient information during hackathon testing.

## Automated verification

Run:

```powershell
npm.cmd run verify
```

This executes the browser-secret scan, backend/security/performance/CS architecture contracts, unit
and integration/concurrency tests, and the production build.
GitHub Actions additionally starts local Supabase and runs the pgTAP database policy suite.

## Required production hardening

Before real patient or live-payment use, complete a professional security test, privacy/compliance
review, backup/restore drill, data-retention policy, incident-response process, administrator MFA,
monitoring, merchant/legal approval, and clinical-device validation. This remains a screening and
decision-support prototype, not a certified diagnostic device.
