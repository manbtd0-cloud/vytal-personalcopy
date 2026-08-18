# 🧠 Vytal — Supabase Backend Specification
### For: Backend Developer
### Project: Vytal — Clinical-Grade Triage Platform (P@SHA ICT Awards 2026)

> **Read this fully before touching a single line of code.**
> This app is not a typical CRUD app. It's an offline-first medical triage system used by community health workers in low-connectivity areas. Every design decision has a medical or operational reason behind it.

---

## 🏗️ OVERVIEW: What Vytal Does

Vytal turns any smartphone camera into a triage station using **rPPG (Remote Photoplethysmography)** — it reads heart rate, breathing rate, and pulse variability from a 10-second face or fingertip scan. **No wearable. No internet required at time of scan.**

The frontend is React + Vite, fully offline-capable. Supabase is the **cloud sync layer** — it stores records when connectivity is restored, enables dashboard analytics, handles auth for health workers, and will eventually power population-level surveillance alerts.

The current local state uses `localStorage` (see `src/lib/storage.js`). Supabase replaces the cloud sync endpoint in `src/lib/cloudSync.js`.

---

## 🔐 SECTION 1: Authentication

### Who logs in?
Two types of users:
1. **Community Health Workers (CHWs)** — field workers scanning patients. Mobile-first, low-bandwidth.
2. **Supervisors / Clinicians** — desktop users reviewing dashboards and flagged patients.

### Implementation
- Use **Supabase Auth** with **Email + Password** (no OAuth needed for now).
- Enable **Row Level Security (RLS)** on ALL tables — this is non-negotiable for medical data.

```sql
-- Enable RLS on every table you create
ALTER TABLE patient_records ENABLE ROW LEVEL SECURITY;
```

### User Metadata Schema
When a user signs up, store this in `auth.users` `user_metadata`:

```json
{
  "full_name": "Hina Bibi",
  "role": "chw",           // "chw" | "supervisor" | "admin"
  "region": "Khyber Pakhtunkhwa",
  "facility_code": "KPK-LHW-0032",
  "language": "ur"
}
```

### RLS Policy Rules
```sql
-- CHWs can only read/write their own records
CREATE POLICY "CHW own records only"
ON patient_records
FOR ALL
USING (auth.uid() = created_by_user_id);

-- Supervisors can read all records from their region
CREATE POLICY "Supervisor regional read"
ON patient_records
FOR SELECT
USING (
  (SELECT role FROM profiles WHERE id = auth.uid()) = 'supervisor'
  AND region = (SELECT region FROM profiles WHERE id = auth.uid())
);
```

---

## 🗄️ SECTION 2: Database Schema

### Table 1: `profiles` (extends Supabase Auth users)

```sql
CREATE TABLE profiles (
  id            UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  full_name     TEXT,
  role          TEXT NOT NULL DEFAULT 'chw',  -- 'chw' | 'supervisor' | 'admin'
  region        TEXT,
  facility_code TEXT,
  language      TEXT DEFAULT 'en',
  created_at    TIMESTAMPTZ DEFAULT NOW()
);
```

> Auto-create via Supabase trigger on `auth.users` insert.

---

### Table 2: `patient_records` (CORE TABLE — treat this with care)

```sql
CREATE TABLE patient_records (
  id                  UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  patient_id          TEXT NOT NULL,          -- CHW-assigned ID e.g. "P-0231"
  patient_name        TEXT,
  created_by_user_id  UUID REFERENCES auth.users(id),
  region              TEXT,
  facility_code       TEXT,

  -- Core rPPG Vitals
  hr                  SMALLINT,               -- Heart rate (bpm)
  br                  SMALLINT,               -- Breathing rate (br/min)
  stress_index        SMALLINT,               -- Pulse variability score (0-100)
  stress_label        TEXT,                   -- 'Normal' | 'Slightly high' | 'High'

  -- Clinical Screening Modules
  spo2_proxy          NUMERIC(4,1),           -- SpO2 % estimate (proxy, not medical device)
  spo2_confidence     TEXT,                   -- 'High' | 'Medium' | 'Low'
  is_irregular_rhythm BOOLEAN DEFAULT FALSE,  -- AFib flag from beat interval analysis
  alert_tier          TEXT,                   -- 'GREEN' | 'YELLOW' | 'ORANGE' | 'RED'
  alert_reasons       TEXT[],                 -- Array of flagged clinical reasons

  -- AI Explanation
  ai_explanation      TEXT,
  language            TEXT DEFAULT 'en',

  -- Scan metadata
  scan_mode           TEXT DEFAULT 'face',    -- 'face' | 'fingertip' | 'anemia' | etc.
  scan_quality_score  SMALLINT,              -- Camera quality score (0-100)

  -- Status & Sync
  status              TEXT DEFAULT 'ok',      -- 'ok' | 'flagged' | 'pending'
  synced              BOOLEAN DEFAULT TRUE,
  
  -- Timestamps
  scanned_at          TIMESTAMPTZ NOT NULL,   -- When scan happened on device
  created_at          TIMESTAMPTZ DEFAULT NOW()
);

-- Index for fast dashboard queries
CREATE INDEX idx_patient_records_user     ON patient_records(created_by_user_id);
CREATE INDEX idx_patient_records_region   ON patient_records(region);
CREATE INDEX idx_patient_records_tier     ON patient_records(alert_tier);
CREATE INDEX idx_patient_records_scanned  ON patient_records(scanned_at DESC);
```

---

### Table 3: `population_anomaly_log` (Epidemiological Surveillance — STANDOUT FEATURE)

This is where Vytal stands out from every other health app. We run **Shewhart Statistical Process Control (SPC)** on the population — if average heart rates in a region spike above 3 standard deviations from baseline, it triggers an automated outbreak alert.

```sql
CREATE TABLE population_anomaly_log (
  id              UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  region          TEXT NOT NULL,
  detected_at     TIMESTAMPTZ DEFAULT NOW(),
  metric          TEXT NOT NULL,       -- 'hr_mean' | 'br_mean' | 'stress_mean' | 'flag_rate'
  baseline_mean   NUMERIC(6,2),
  baseline_std    NUMERIC(6,2),
  observed_value  NUMERIC(6,2),
  z_score         NUMERIC(5,2),
  is_anomaly      BOOLEAN DEFAULT FALSE,
  alert_message   TEXT,
  record_count    INT                  -- How many scans the anomaly was based on
);
```

---

### Table 4: `sync_queue` (Offline-First Sync Tracking)

Tracks pending local records that haven't reached the server yet. The frontend writes `synced: false` locally; this table represents the server-side acknowledgment queue.

```sql
CREATE TABLE sync_queue (
  id                UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  local_record_id   TEXT NOT NULL,              -- Frontend's local UUID/ID
  user_id           UUID REFERENCES auth.users(id),
  payload           JSONB NOT NULL,             -- Full record JSON as sent by frontend
  fhir_bundle       JSONB,                      -- HL7 FHIR R4 Bundle we generated
  status            TEXT DEFAULT 'pending',     -- 'pending' | 'processed' | 'failed'
  received_at       TIMESTAMPTZ DEFAULT NOW(),
  processed_at      TIMESTAMPTZ
);
```

---

## 🔌 SECTION 3: API Endpoints (Supabase Edge Functions)

You'll write these as **Supabase Edge Functions** (Deno runtime). These replace the `VITE_CLOUD_SYNC_URL` endpoint.

### Edge Function 1: `sync-records`

**Route:** `POST /functions/v1/sync-records`  
**Auth:** Bearer token (Supabase JWT)

**Request Body** (this is exactly what `src/lib/cloudSync.js` sends):
```json
{
  "records": [
    {
      "id": "P-1234",
      "patientId": "P-1234",
      "name": "Amina K.",
      "hr": 118,
      "br": 21,
      "stress": 78,
      "spo2": 97,
      "alertTier": "ORANGE",
      "alertReasons": ["Elevated resting heart rate"],
      "isIrregularRhythm": false,
      "status": "flagged",
      "explanation": "AI-generated text...",
      "language": "ur",
      "timestamp": "2026-08-09T12:00:00Z",
      "synced": false
    }
  ],
  "fhirBundle": [ /* Array of FHIR Bundles */ ]
}
```

**What the function does:**
1. Validate JWT → extract `user_id`, `region`, `facility_code` from profile.
2. Insert each record into `patient_records`.
3. Insert raw payload + FHIR bundle into `sync_queue` (status: 'processed').
4. Trigger `run-population-anomaly-check` edge function (async, don't block response).
5. Return `{ success: true, syncedCount: N }`.

---

### Edge Function 2: `run-population-anomaly-check`

**Route:** `POST /functions/v1/run-population-anomaly-check` (internal, called from sync-records)

**What it does:**
1. Pull last 30 days of `patient_records` for the relevant `region`.
2. Calculate mean + std deviation for `hr`, `br`, `stress_index`.
3. Calculate today's mean for the same metrics.
4. Compute Z-score = `(today_mean - baseline_mean) / baseline_std`.
5. If `z_score > 3.0` for any metric → insert into `population_anomaly_log` with `is_anomaly: TRUE`.
6. Optionally: trigger a Supabase Realtime broadcast to supervisor dashboards.

```typescript
// Edge function skeleton
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2'

Deno.serve(async (req) => {
  const { region } = await req.json()
  const supabase = createClient(
    Deno.env.get('SUPABASE_URL')!,
    Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!
  )

  // Pull baseline (last 30 days excluding today)
  const { data: baseline } = await supabase
    .from('patient_records')
    .select('hr, br, stress_index')
    .eq('region', region)
    .lt('scanned_at', new Date().toISOString().slice(0, 10))
    .gte('scanned_at', new Date(Date.now() - 30 * 86400000).toISOString())

  // Pull today's records
  const { data: today } = await supabase
    .from('patient_records')
    .select('hr, br, stress_index')
    .eq('region', region)
    .gte('scanned_at', new Date().toISOString().slice(0, 10))

  // Calculate stats, check z-scores, insert anomalies...
  // ...
  
  return new Response(JSON.stringify({ checked: true }))
})
```

---

### Edge Function 3: `get-dashboard-summary`

**Route:** `GET /functions/v1/get-dashboard-summary`  
**Auth:** Bearer token

Returns aggregated stats for the supervisor dashboard:
```json
{
  "totalScreened": 142,
  "flaggedToday": 7,
  "pendingSync": 3,
  "avgHeartRate": 78.4,
  "avgBreathingRate": 16.2,
  "avgStress": 34.1,
  "regionAnomalyAlert": false,
  "lastSyncAt": "2026-08-09T11:45:00Z"
}
```

---

## 📡 SECTION 4: Realtime Subscriptions (Supervisor Dashboard)

The supervisor dashboard should **live-update** when a CHW submits a flagged scan from the field.

```typescript
// Subscribe to new RED/ORANGE tier records
const channel = supabase
  .channel('flagged-alerts')
  .on('postgres_changes', {
    event: 'INSERT',
    schema: 'public',
    table: 'patient_records',
    filter: `alert_tier=in.(RED,ORANGE)`,
  }, (payload) => {
    // Show toast notification on supervisor dashboard
    showAlert(payload.new)
  })
  .subscribe()
```

---

## 🔑 SECTION 5: Frontend Integration Points

Tell the frontend developer to update these two files once the Supabase project is live:

### `.env` updates needed:
```env
VITE_SUPABASE_URL=https://xxxxxxxxxxxx.supabase.co
VITE_SUPABASE_ANON_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6...
VITE_CLOUD_SYNC_URL=https://xxxxxxxxxxxx.supabase.co/functions/v1/sync-records
```

### Install Supabase client:
```bash
npm install @supabase/supabase-js
```

### Create `src/lib/supabase.js`:
```javascript
import { createClient } from '@supabase/supabase-js'

export const supabase = createClient(
  import.meta.env.VITE_SUPABASE_URL,
  import.meta.env.VITE_SUPABASE_ANON_KEY
)
```

### Replace `syncPendingRecords()` in `storage.js`:
```javascript
// Old
export function syncPendingRecords() {
  const records = getStoredRecords()
  const updated = records.map((r) => ({ ...r, synced: true }))
  localStorage.setItem(STORAGE_KEY, JSON.stringify(updated))
  return updated
}

// New (after Supabase integration)
import { supabase } from './supabase'

export async function syncPendingRecords() {
  const records = getStoredRecords()
  const pending = records.filter((r) => !r.synced)
  
  for (const record of pending) {
    await supabase.from('patient_records').upsert({
      patient_id:          record.patientId,
      patient_name:        record.name,
      hr:                  record.hr,
      br:                  record.br,
      stress_index:        record.stress,
      spo2_proxy:          record.spo2 || null,
      alert_tier:          record.alertTier || 'GREEN',
      alert_reasons:       record.alertReasons || [],
      is_irregular_rhythm: record.isIrregularRhythm || false,
      ai_explanation:      record.explanation,
      language:            record.language,
      status:              record.status,
      scanned_at:          record.timestamp,
    })
  }
  
  const updated = records.map((r) => ({ ...r, synced: true }))
  localStorage.setItem(STORAGE_KEY, JSON.stringify(updated))
  return updated
}
```

---

## 🧱 SECTION 6: Supabase Project Setup Checklist

```
[ ] Create new Supabase project (region: Singapore or nearest)
[ ] Run ALL SQL migrations from Section 2 in order
[ ] Enable RLS on all tables
[ ] Create RLS policies from Section 1
[ ] Deploy Edge Functions: sync-records, run-population-anomaly-check, get-dashboard-summary
[ ] Set Edge Function env vars: SUPABASE_URL, SUPABASE_SERVICE_ROLE_KEY
[ ] Enable Supabase Realtime on patient_records table
[ ] Create test CHW user + test Supervisor user
[ ] Test POST /sync-records with sample payload
[ ] Verify population anomaly check triggers on insert
[ ] Share VITE_SUPABASE_URL and VITE_SUPABASE_ANON_KEY with Ahmad
```

---

## ⚠️ CRITICAL MEDICAL DATA RULES

1. **Never expose `SUPABASE_SERVICE_ROLE_KEY` to the frontend** — it bypasses all RLS. Only use in Edge Functions.
2. **RLS must be ON before any real patient data hits the DB.** Test this.
3. All data is PHI (Protected Health Information) — do not log patient names or IDs to any external analytics service.
4. The `spo2_proxy`, `is_irregular_rhythm`, and all clinical readings are **screening estimates, not diagnoses** — make sure no UI on your side presents them as definitive medical readings.
5. Ensure `scanned_at` uses the **device timestamp**, not the server timestamp — CHWs work offline and sync hours later.

---

## 🚀 STANDOUT FEATURES (Make Sure These Work End-to-End)

| Feature | Why It Stands Out |
|---|---|
| **Offline-First Sync Queue** | CHWs can scan 50 patients in a no-internet village, sync everything when they hit a town with 2G |
| **HL7 FHIR R4 Export** | Hospital-grade interoperability standard — no other mobile triage tool in Pakistan does this |
| **Population SPC Anomaly Detection** | Regional outbreak alerting from aggregated anonymized scan data — epidemiological intelligence at the community level |
| **8-Language AI Explanations** | Urdu, Pashto, Sindhi, Arabic — AI generates results in patient's native language, backed by Groq LLaMA 3.3 |
| **Multi-tier Clinical Alert Scale** | WHO IMCI/PALS-validated GREEN/YELLOW/ORANGE/RED tier system, not just a simple flag |
| **Supervisor Realtime Alerts** | When a CHW scans a RED-tier patient in the field, supervisor sees it live on dashboard instantly |

---

*Document prepared by Ahmad Ali Shah for Vytal backend handoff.*  
*Repository: https://github.com/Ahmad-Ali-Shah/Vital (branch: vytal-final-version)*
