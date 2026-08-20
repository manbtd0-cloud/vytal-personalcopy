# VYTAL `baby-boss` integration status

**Integration date:** 2026-08-20
**Parents:** `agent/secure-database-billing` + `vytal-final-version`

This is the current status document for the reconciled branch. Older roadmap and research files are
retained as design history; they do not override the security or clinical limitations below.

## What the integration contains

- Supabase Auth, owner-scoped patients, explicit consent, forced RLS, transactional screening writes,
  closed-loop referrals, billing, donations, server-side AI provider credentials, audit events, and
  a memory-only unconfigured preview.
- Face rPPG and fingertip PPG with the newer signal engine, uncertainty estimates, SpO₂ and
  irregular-rhythm proxies, plus age/programme/pregnancy context for the unified alert policy.
- Restored anemia, jaundice, BMI/malnutrition, and calibrated blood-pressure trend modes.
- Extended observation storage and reports for all merged modes. Visual modes are accepted without
  heart rate and never create a synthetic pulse measurement.
- Recent per-patient longitudinal trend summaries on the protected dashboard.

## Clinical truth and limitations

- All camera-derived results are research prototypes and screening proxies, not diagnoses or
  certified medical-device readings.
- A 15-second camera capture is materially shorter and less controlled than many validation studies.
  Heart rate is generally more defensible than short-window HRV, SpO₂, rhythm, anemia, jaundice, BMI,
  or blood-pressure estimates.
- Anemia and jaundice require a valid eye-region capture; failed/low-sample captures return `UNKNOWN`
  and are not stored as normal results.
- Blood-pressure output is unavailable until an owner-scoped calibration is supplied. Calibration is
  passed explicitly and is not stored in browser persistence.
- Abnormal results require confirmation with approved equipment and a qualified clinician.
- Real-device and clinical validation remain outstanding. Do not use real patient or live-payment
  data until security, privacy, operational, and clinical reviews are complete.

## Deliberately excluded from production behavior

- Direct browser calls containing Groq, DashScope, Supabase service-role, or payment credentials.
- `localStorage`/IndexedDB persistence of patient records or calibration data.
- Alibaba `cloudSync` as a competing clinical database.
- Client-side population surveillance across separately owned RLS accounts.
- Simulated wearable readings presented as real HealthKit/Garmin data.

## Verification contract

Run `npm run verify` and `supabase test db`. The database suite includes extended visual-screening,
consent, range, referral, and no-synthetic-heart-rate assertions in
`supabase/tests/database/007_extended_clinical_screenings.sql`.
