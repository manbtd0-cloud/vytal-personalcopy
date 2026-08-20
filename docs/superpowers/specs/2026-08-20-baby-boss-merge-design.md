# Baby Boss Merge Design

## Goal

Create one integration branch, `baby-boss`, that preserves the secure database/billing architecture from `agent/secure-database-billing` while restoring the newer research-backed clinical work from `vytal-final-version`, especially anemia and jaundice screening.

## Branch topology

The resulting commit is a real two-parent merge:

1. First parent: `agent/secure-database-billing` (`6bae2e3dc062210724aefda4b54e8bc477f484d5`).
2. Second parent: `vytal-final-version` (`4bfd4e7d96563b5b190e9fb970acd423d5220338`).
3. Content base: the secure branch, reconciled file-by-file with the clinical branch.

This makes both histories ancestors of `baby-boss` without allowing Git's default conflict choices to silently discard either architecture.

## Authority rules

The secure branch is authoritative for authentication, consent, patient identity, production persistence, RLS, transactional screening/referral writes, billing, donations, server-side provider credentials, request security, and preview-mode memory behavior.

The clinical branch is authoritative for the rPPG engine, uncertainty engine, anemia analysis, jaundice analysis, SpO2 proxy, irregular-rhythm proxy, age/pregnancy/programme alert scale, BMI/malnutrition proxy, single-site blood-pressure trend method, voice guidance, and the scientific limitations attached to those features.

The secure Apple Health-inspired UI remains the visual base. Clinical controls and results are inserted into that design instead of restoring the older global stylesheet wholesale.

## Clinical behavior

The scan console supports these modes:

- Face rPPG and fingertip contact PPG: heart rate, breathing rate, short-window pulse variability/stress, uncertainty, SpO2 proxy, rhythm regularity, and age-aware alert tier.
- Anemia: conjunctival-pallor proxy with explicit low-confidence retry behavior and laboratory-confirmation wording.
- Jaundice: ambient-corrected scleral-yellowing proxy with bilirubin-confirmation wording.
- BMI/malnutrition: anthropometric screening proxy with limitations.
- BP trend: single-site PPG crest-time trend only; never labeled as cuff-equivalent blood pressure.

Every mode requires a selected patient with granted consent. A result is stored as metric observations under the linked patient. No PHI or calibration is written to localStorage or IndexedDB.

## Risk and referral contract

One clinical policy returns `{ flagged, tier, reasons, priority }`. It combines the age/pregnancy/programme alert scale with optional extended measurements. RED and ORANGE are referral-producing. Visual-screening risk also produces referral reasons when anemia is RED/ORANGE or jaundice is positive. UNKNOWN/low-confidence results are retry-only and must not generate a clinical referral.

The database remains the final authority for production screening status and referral creation. A new forward migration extends the transactional RPC so non-rPPG screening modes can be stored without fabricating a heart rate, validates every supported metric range, and creates referrals from server-derived risk.

## Persistence contract

The browser sends a normalized record containing mode, patient ID, context, capture quality, quality flags, explanation, and a list of metric observations. The storage adapter serializes only finite/validated measurements. Reading adapters expose all stored observations to Report and Dashboard pages while retaining the legacy `hr`, `br`, and `stress` convenience fields.

Unconfigured preview mode stays memory-only. Supabase mode uses authenticated owner-scoped queries and the transactional RPC. Alibaba `cloudSync` is not connected because it would create a second persistence authority. BP calibration is represented as owner-scoped baseline metrics rather than browser storage.

## Honest prototype boundaries

The pure population-anomaly algorithm may remain documented for future server aggregation, but it is not run over owner-scoped browser data and is not shown as regional surveillance. The simulated wearable integration is not exposed as a real Garmin/HealthKit/Fitbit connection. Thermal/WebUSB and BLE helpers remain capability-gated experiments, not automatic clinical measurements.

## AI and security

AI calls continue through the Supabase Edge Function; no provider secret or direct provider endpoint returns to browser code. Offline explanations accept the same normalized clinical context and never turn a proxy into a diagnosis. Existing CSP, Stripe Checkout boundary, rate limits, RLS, consent checks, and no-browser-PHI rules remain intact.

## Verification

Automated tests cover clinical thresholds, anemia/jaundice low-confidence and positive/negative fixtures, normalized observation serialization, secure preview persistence, and the database query-plan regression. `npm run verify` must pass. The Supabase pgTAP suite must pass when Docker/Supabase CLI are available; otherwise the exact unavailable dependency is reported without claiming database verification.
