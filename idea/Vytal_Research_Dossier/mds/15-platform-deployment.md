# Platform & Deployment Features

`Platform · SMS Fallback, FHIR, DHIS2, Batch Scan, WhatsApp Share · standards, not research papers`

---

## What these are

Five engineering/interoperability features that don't need literature backing — they need standards compliance. Grouped into one file because they share the same nature: each is "implement to a published protocol," not "validate against a study."

| Feature | Standard / Protocol | What it means for Vytal |
|---|---|---|
| **FHIR Export** | HL7 FHIR R4 `Observation` resource spec (hl7.org/fhir/R4/observation.html) | Each Vytal reading (HR, BR, SpO2 once built, referral flag) maps to one FHIR `Observation` resource with a LOINC code identifying the measurement type. This is what lets a Vytal reading be imported into a hospital EMR that speaks FHIR. |
| **DHIS2 Integration** | DHIS2 Web API v2 — Tracker Events endpoint (docs.dhis2.org) | DHIS2 is the dominant health-information-system platform across the ministries of health Vytal would realistically deploy alongside. Posting each scan as a Tracker Event is the standard way a point-of-care tool feeds into a national HMIS. |
| **SMS Fallback** | RFC 5724 — the `sms:` URI scheme | For referral notifications where a smartphone data connection isn't available but basic SMS is — `sms:+92XXXXXXXXXX?body=...` triggers the device's native SMS composer with a pre-filled referral message. |
| **WhatsApp Share** | `https://wa.me/?text=` (WhatsApp's documented Click-to-Chat API) | One-tap share of a patient's report link or summary to a CHW supervisor or the patient's own WhatsApp, without needing WhatsApp Business API credentials for a simple share-out use case. |
| **Batch Scan** | No external standard — pure UX/data-model feature | Lets a CHW run several patients through in sequence without returning to a home screen between each; a queue/session model, not a protocol integration. |
| **Offline Sync** (already built) | IndexedDB, W3C Level 2 spec | Already implemented per prior status — listed here for completeness since the other five build on the same offline-first record store. |

## Implementation notes

```
FHIR Observation mapping (per reading):
  resourceType: "Observation"
  status: "final"
  code: { coding: [{ system: "http://loinc.org", code: "8867-4" }] }  # heart rate LOINC
  subject: { reference: "Patient/{patientId}" }
  effectiveDateTime: scan.timestamp
  valueQuantity: { value: scan.hr, unit: "bpm" }
  # repeat per vital sign with its own LOINC code (BR, SpO2, etc.)

DHIS2 Tracker Event push:
  POST /api/tracker  (batches events; DHIS2's newer unified endpoint
                       replaces the older /api/events endpoint —
                       check current DHIS2 version in the target
                       deployment before integrating, the API has
                       changed across major versions)

SMS fallback trigger:
  window.location.href =
    `sms:${clinicianPhone}?body=${encodeURIComponent(referralSummary)}`

WhatsApp share:
  window.open(
    `https://wa.me/?text=${encodeURIComponent(reportSummaryAndLink)}`
  )
```

## Where this lives in the codebase

- FHIR/DHIS2 exporters: new `export/fhir.js` and `export/dhis2.js`, triggered from the sync layer Laiba owns alongside the existing IndexedDB sync.
- SMS/WhatsApp share: buttons on `ReportPage.jsx`, no backend needed — both are client-side URI triggers.
- Batch scan: session/queue state added to `ScanPage.jsx`.

## Honest limitations

- FHIR and DHIS2 compliance both have real version-drift risk — "implements FHIR" or "integrates with DHIS2" means very little without pinning to a specific FHIR version (R4 vs R5) and DHIS2 API version, since both have made breaking changes across releases.
- SMS fallback depends entirely on the device having a default SMS app configured — not guaranteed on every Android device in the field.
