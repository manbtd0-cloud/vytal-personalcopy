# Scan History Sparkline on Dashboard

`Quick Win · 2-3 days · UX only, no external research`

---

## What it does

Shows a small inline trend line (sparkline) of a patient's last few HR/BR/stress readings on the dashboard, so a CHW can see "trending up" vs. "one bad reading" at a glance.

## Research backing

None needed — this is a UX/data-visualisation feature, not a physiological measurement claim. No algorithm to validate against a paper.

The one place research *does* matter here is downstream: once Vytal has more than one reading per patient, the same trend data becomes the input to feature 21 (Longitudinal Patient Risk Scoring), which *is* research-backed — see `21-longitudinal-risk-scoring.md`. This sparkline is effectively the visual precursor to that feature.

## Implementation sketch

```
1. Store each scan's {hr, br, stress, timestamp} keyed by patient id
   (already happening via the offline-first IndexedDB store).
2. On dashboard render, pull the last N (e.g. 5) readings per patient.
3. Render as an inline SVG <polyline>, no charting library needed.
4. Colour the line by whether the trend is worsening, using the same
   thresholds as the 3-level alert scale (feature 03).
```

## Where this lives in the codebase

- `DashboardPage.jsx` — pure frontend, reads from the existing local/synced patient record store.
