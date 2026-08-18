# Wearable HRV Baseline

`Hardware · Garmin/Apple HealthKit/Fitbit SDKs`

---

## What it does

For patients (or CHWs monitoring their own wellbeing) who already own a consumer wearable, pulls in that device's longer-term HRV data to give Vytal's single-scan RMSSD stress score a personalised baseline to compare against, instead of judging every scan against a generic population norm.

## The research this is built on

The roadmap's original citation ("The superiority of personalised HRV baselines over population norms for stress detection," *Frontiers in Psychology*, 2022) could **not** be located under that exact title/journal/year in this research pass and should be treated as unverified — it may be a mis-remembered or conflated citation. The underlying principle, however, is well supported by real, checkable literature:

| Paper | What it actually showed | Where it fits Vytal |
|---|---|---|
| Shaffer, F., Ginsberg, J.P. **"An overview of heart rate variability metrics and norms."** *Frontiers in Public Health* 5: 258 (2017) | Surveys published HRV normative values and explicitly stresses that measurement context — recording length, age, sex — all shift what counts as a "normal" baseline HRV; population norms are not one-size-fits-all | The real, correctly-cited Frontiers paper closest to the roadmap's intent — use this instead of the unverified 2022 citation |
| Verkuil, B. et al. (referenced within Brown, S.B.R.E. et al., **"Assessing New Methods to Optimally Detect Episodes of Non-metabolic Heart Rate Variability Reduction."** *Frontiers in Neuroscience* 14: 564123, 2020) | Used a lab calibration period to compute a **personalized algorithm per participant**, then used that individualised baseline to detect stress-related HRV reductions in daily life — outperforming a fixed population cutoff | This is the actual methodological precedent for "calibrate per-person, then compare future readings against that person's own baseline," which is exactly what this feature proposes |
| **"Changes in Continuous, Long-Term Heart Rate Variability and Individualized Physiological Responses to Wellness and Vacation Interventions Using a Wearable Sensor."** *Frontiers in Cardiovascular Medicine* 7: 120 (2020) | Demonstrates that continuous wearable HRV monitoring over time enables assessment "especially relative to one's own baseline," and that individualised, longitudinal HRV patterns reveal information that snapshot measurements miss | Directly supports pulling in wearable data specifically *because* it gives Vytal continuous data a single 10-15 second scan can never provide |

## Algorithm

```
1. Wearable connection (per platform):
     Garmin Health SDK / Apple HealthKit (iOS) / Fitbit Web API
   Each exposes historical HRV data (typically as RMSSD or SDNN,
   the same core metrics Vytal's own stress scoring already uses)
   via their own OAuth-based read API — three separate integrations,
   not one unified API.

2. Baseline computation, per the Verkuil et al. calibration-period
   approach: pull the patient's trailing N-day (e.g. 14-30 day)
   average RMSSD from the wearable as their personal baseline,
   rather than comparing against Vytal's population-level "elevated
   stress" cutoff.

3. On each Vytal scan, compare that scan's RMSSD against the
   patient's own wearable-derived baseline instead of (or alongside)
   the population threshold:
     personal_deviation = (scan_rmssd - wearable_baseline_rmssd)
                           / wearable_baseline_stddev
     if personal_deviation < -1.5:  # notably below their own norm
         flag "stress elevated relative to this patient's own baseline"
```

## Where this lives in the codebase

- New `wearableIntegration.js` per platform (Garmin/HealthKit/Fitbit), each behind its own OAuth flow.
- Feeds a personalised comparison into the existing stress-scoring output, rather than replacing Vytal's own RMSSD calculation.

## Honest limitations

- Requires the patient to already own and actively use a compatible wearable — a narrow subset of Vytal's actual target population (rural, low-resource CHW-served communities), which cuts against this being a near-term priority despite being a technically sound idea.
- The original citation for this feature could not be verified — treat the *approach* (personalised over population baselines) as well-supported by the alternate sources above, but don't repeat the specific unverified citation in a pitch or report.
- Three separate vendor SDK integrations (Garmin, Apple, Fitbit) is meaningfully more engineering effort than the roadmap's single-line description suggests.
