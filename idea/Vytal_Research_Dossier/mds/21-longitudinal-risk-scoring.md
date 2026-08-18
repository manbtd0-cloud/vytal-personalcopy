# Longitudinal Patient Risk Scoring

`AI Layer · Emerging · requires 3+ scans per patient`

---

## What it does

Instead of judging each scan in isolation, tracks how a patient's HR/BR/stress trend *over multiple visits*, and flags deterioration patterns that a single-point reading would miss — the natural extension of the scan-history sparkline (feature 04) into an actual risk model.

## The research this is built on (verified)

The roadmap's original citation ("Temporal Vital Sign Patterns and Deterioration Prediction," *Critical Care Medicine*, 2021) points to a real and well-established body of work, though the exact title/year pairing should be treated as approximate — the specific, checkable anchor is below.

| Paper | What it actually showed | Where it fits Vytal |
|---|---|---|
| A trend-based early warning score paper in *Critical Care Medicine* 49: e961-e967 (2021), DOI: 10.1097/CCM.0000000000005064, cited widely including in ScienceDirect's "Impact of dynamic parameter of trends in vital signs on the prediction of serious events" | A trend-based early warning score, implemented in a hospital EMR, effectively predicted inpatient deterioration — confirming that *trend*, not just point-in-time value, materially improves prediction | Directly validates the roadmap's premise: Vytal tracking a patient's trajectory across visits should outperform flagging each scan independently |
| **"Machine Learning–Based Early Warning Systems for Clinical Deterioration: Systematic Scoping Review."** *JMIR* 23(2): e25187 (2021) | Reviews the whole field; explicitly notes that classic aggregate-weighted scores (like the ones behind Vytal's alert scale, feature 03) "do not incorporate trends nor provide information about the possible risk trajectory" — exactly the gap this feature closes | This is the clearest, most citable articulation of *why* longitudinal scoring is a meaningful addition on top of the single-scan alert scale, not a duplicate of it |
| Churpek, M.M., Adhikari, R., Edelson, D.P. **"The value of vital sign trends for detecting clinical deterioration on the wards."** *Resuscitation* 102:1-5 (2016) | Foundational paper establishing that the *rate of change* between successive vital-sign readings, not just the readings themselves, predicts deterioration | Basis for the delta/slope calculation in the algorithm below |

## Algorithm

```
Input: history = [ {hr, br, stress, timestamp}, ... ]  per patient,
       at least 3 prior scans (per Churpek et al., trend calculations
       need multiple points to be meaningful, not just two)

1. Compute deltas between successive scans:
     delta_hr[i] = hr[i] - hr[i-1]
     delta_br[i] = br[i] - br[i-1]

2. Compute a simple slope over the recent window (e.g. last 3-5 scans)
   using linear regression of value vs. time — this is the
   "trajectory," not just the latest delta.

3. Risk bump logic (on top of feature 03's single-scan alert scale):
     if slope_hr > 0 and slope_br > 0 and most_recent_scan_is_YELLOW+:
         escalate one tier (e.g. YELLOW -> ORANGE)
     # rising trend + already-elevated single reading is a stronger
     # signal than either alone, consistent with the trend-EWS
     # literature above

4. Surface on the dashboard as a distinct "trending worse" indicator,
   separate from (and layered on top of) the single-scan alert colour,
   so a CHW can tell "this reading is concerning" from "this patient
   has been getting worse over their last few visits."
```

## Where this lives in the codebase

- Builds directly on feature 04 (scan history sparkline) for the underlying multi-visit data.
- New `longitudinalRisk.js`, consuming the same patient-record history store, feeding the same alert-tier system as feature 03.

## Honest limitations

- All the cited validation is from hospital inpatient settings with frequent (hourly) vital-sign measurements — Vytal's use case (occasional CHW visits, days or weeks apart) is a much sparser sampling rate than any of these studies tested. The underlying "trend matters" principle should transfer; the specific thresholds/slopes almost certainly need re-derivation for Vytal's sampling interval rather than being borrowed directly.
- Requires at least 3 visits per patient before this feature can say anything — not useful for first-time or one-off screenings.
