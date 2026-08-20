# Baby Boss Merge Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Produce a tested two-parent `baby-boss` merge containing the secure backend/billing system and the complete, honestly labeled clinical screening feature set.

**Architecture:** Start from the secure branch tree. Add pure clinical modules and a single extended risk contract, then connect them to consent-gated scanning, normalized observation persistence, reports, and dashboards. Extend production database behavior through a forward migration and preserve secure AI/RLS/Stripe boundaries.

**Tech Stack:** React 18, Vite 5, Node test runner, MediaPipe Tasks Vision, Supabase/PostgreSQL/pgTAP, Stripe Edge Functions.

**Spec:** `docs/superpowers/specs/2026-08-20-baby-boss-merge-design.md`

## Global Constraints

- Branch name is exactly `baby-boss`.
- The merge commit has both source tips as parents.
- No persistent PHI, BP calibration, or secrets in browser storage.
- No direct browser calls to AI or payment providers.
- Clinical outputs are screening proxies, never diagnoses.
- Low-confidence visual results request a retry and never create a referral.
- Existing secure patient consent and RLS ownership rules remain mandatory.

---

### Task 1: Establish the merge regression harness

**Files:**
- Create: `tests/unit/clinical-merge.test.js`
- Create: `tests/unit/clinical-observations.test.js`
- Modify: `package.json`

**Interfaces:**
- Consumes: current `ClinicalRiskPolicy`, secure storage adapter, and clinical module exports.
- Produces: executable requirements for extended risk and observation normalization.

- [ ] Write failing Node tests with literal fixtures for adult/child alert tiers, anemia/jaundice retry and referral states, and extended observation serialization.
- [ ] Run `node --test tests/unit/clinical-merge.test.js tests/unit/clinical-observations.test.js`; expect failures caused by missing merged exports.
- [ ] Add only the test script wiring required for the new suites.
- [ ] Re-run the tests and retain the expected RED evidence for the implementation cycle.

### Task 2: Restore and normalize the clinical engines

**Files:**
- Add from clinical branch: `src/lib/afib.js`, `src/lib/alertScale.js`, `src/lib/anemia.js`, `src/lib/bmiEstimate.js`, `src/lib/jaundice.js`, `src/lib/spo2.js`, `src/lib/platform.js`
- Replace with newer clinical versions: `src/lib/rppg.js`, `src/lib/uncertainty.js`
- Refactor: `src/lib/bloodPressurePTT.js`
- Modify: `src/domain/clinical/ClinicalRiskPolicy.js`
- Create: `src/domain/clinical/clinicalObservations.js`

**Interfaces:**
- Produces: `clinicalRiskPolicy.evaluate(context)`, `clinicalRiskPolicy.stressLabel(score)`, and `toClinicalObservations(record)`.
- `evaluate` returns `{ flagged, tier, reasons, priority }`.
- `toClinicalObservations` returns `{ metric_key, value_numeric, value_text, unit, metadata }[]`.

- [ ] Port the pure modules without adding provider or storage side effects.
- [ ] Replace BP localStorage functions with pure calibration objects accepted as arguments.
- [ ] Implement the unified clinical-risk adapter and observation serializer minimally to satisfy the tests.
- [ ] Run both new test files; expect PASS.
- [ ] Run all unit tests; fix regressions while preserving the secure contracts.

### Task 3: Integrate every supported scan mode into the secure flow

**Files:**
- Modify: `src/pages/ScanPage.jsx`
- Modify: `src/domain/scanning/ScanStrategy.js`
- Modify: `src/services/SignalAnalysisService.js`
- Modify: `src/workers/signal.worker.js`
- Modify: `src/lib/ai.js`
- Modify: `src/lib/storage.js`

**Interfaces:**
- Consumes: consented selected patient, clinical modules, worker analysis, unified risk, and `toClinicalObservations`.
- Produces: one normalized record per completed scan and one stored report ID.

- [ ] Add anemia, jaundice, BMI, and BP-trend modes to the secure mode selector and camera strategy.
- [ ] Preserve workerized rPPG analysis and use the newer signal engine inside the worker boundary.
- [ ] Add landmark-following conjunctiva/sclera/body guides and short visual capture windows.
- [ ] Route every successful mode through the same consent-gated save path; do not fabricate missing vitals.
- [ ] Extend server-proxy AI request context and offline guidance without adding browser credentials.
- [ ] Run unit/integration tests and `npm run build`; expect PASS.

### Task 4: Extend transactional database risk and fix pgTAP query plans

**Files:**
- Create: `supabase/migrations/202608200008_extended_clinical_screenings.sql`
- Create: `supabase/tests/database/007_extended_clinical_screenings.sql`
- Modify: `supabase/tests/database/006_query_plans.sql`
- Modify: `scripts/backend-contract-check.mjs`

**Interfaces:**
- Consumes: normalized observation JSON and existing patient/consent transaction rules.
- Produces: server-derived status/referral for rPPG and visual screening modes.

- [ ] Add pgTAP cases that reject missing consent, accept anemia/jaundice observations without heart rate, reject out-of-range values, and create only clinically warranted referrals.
- [ ] Confirm the new tests fail before the forward migration exists.
- [ ] Add the forward RPC migration with strict metric allowlisting/ranges and server-side risk derivation.
- [ ] Cast query-plan actual/expected arguments so `like(text, text, text)` resolves deterministically.
- [ ] Run `supabase test db` when the local Supabase runtime is available; expect all planned assertions to pass.

### Task 5: Reconcile report, dashboard, UI, and documentation

**Files:**
- Modify: `src/pages/ReportPage.jsx`, `src/pages/DashboardPage.jsx`, `src/index.css`, `README.md`, `SECURITY.md`, `docs/BACKEND_IMPLEMENTATION.md`, `docs/COMPUTER_SCIENCE_ARCHITECTURE.md`
- Restore: `VYTAL_STATUS_AND_ROADMAP.md`, `VYTAL_LANDING_PAGE_PLAN.md`, `idea/BACKEND_SUPABASE_SPEC.md`, `idea/Vytal_Research_Dossier/**`, `idea/important/important.txt`

**Interfaces:**
- Consumes: normalized stored records with optional metrics and clinical context.
- Produces: readable reports/dashboard rows and accurate source-of-truth documentation.

- [ ] Display extended metrics, tier/reasons, uncertainty, and proxy limitations without breaking legacy records.
- [ ] Retain secure referral/patient/realtime dashboard behavior and add longitudinal per-patient summaries only.
- [ ] Add only the CSS selectors required by merged controls/results to the secure stylesheet.
- [ ] Update docs to distinguish implemented, experimental, and deferred features; remove stale completion claims.
- [ ] Run `npm run verify`; expect every application contract, test, and build to pass.

### Task 6: Verify and publish the real merge

**Files:** all changed files listed above.

**Interfaces:**
- Produces: remote `baby-boss` pointing at the verified two-parent merge commit.

- [ ] Inspect the full diff for secrets, browser persistence, duplicate backends, conflict markers, missing clinical imports, and stale feature claims.
- [ ] Run fresh `npm run verify` and record its exit code and test counts.
- [ ] Run or explicitly report the availability result of `supabase test db`.
- [ ] Create Git blobs/tree from the verified workspace using the secure tree as base.
- [ ] Create a merge commit with secure first parent and clinical second parent.
- [ ] Create/update remote `baby-boss` only after the commit object exists and verification evidence is green.
- [ ] Compare both source refs to `baby-boss` and confirm both are ancestors by merge metadata.
