# Scan Quality Score on Printable Report

`Quick Win · half a day · UX only`

---

## What it does

Surfaces the confidence/uncertainty number Vytal's `uncertainty.js` already computes for every scan, on the printed one-page report — so a clinician reading the paper record later knows how much to trust the number, not just the number itself.

## Research backing

None needed beyond what's already backing `uncertainty.js` itself (SNR-based signal quality estimation, already built). This feature is purely "expose an existing internal number on an existing screen" — no new algorithm.

## Implementation sketch

```
1. uncertainty.js already returns something like
     { reliable: bool, marginBpm: number, snr: number }
2. Add one field to the ReportPage.jsx print template:
     "Reading confidence: <High/Medium/Low>  (±{marginBpm} bpm)"
3. Map snr/marginBpm to the same three-tier label the scan screen
   already uses, for visual consistency.
```

## Where this lives in the codebase

- `ReportPage.jsx` — one field, consuming `uncertainty.js` output already computed at scan time.
