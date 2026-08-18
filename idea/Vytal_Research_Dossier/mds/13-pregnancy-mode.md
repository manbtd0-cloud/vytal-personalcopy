# Pregnancy Mode

`Medium-Term Clinical · 2-3 days · toggle + threshold config`

---

## What it does

A toggle that shifts Vytal's normal-range baselines for third-trimester physiology — elevated resting HR, elevated resting RR, and a shifted stress-scoring baseline — so a pregnant patient's normal readings aren't mis-flagged as abnormal.

## The research this is built on

| Source | What it establishes | Where it fits Vytal |
|---|---|---|
| Established obstetric physiology literature on cardiovascular adaptation in pregnancy (widely covered in OB/GYN and cardiology references, e.g. *NEJM* reviews on cardiovascular adaptations in pregnancy) | Third-trimester physiology involves increased blood volume and cardiac output alongside reduced systemic vascular resistance, producing an elevated resting HR (roughly 80-100 bpm baseline) and slightly elevated RR (roughly 16-20 br/min) compared to non-pregnant baselines | Sets the specific threshold shift Vytal needs — this is the exact physiological reason the "adult normal" bands from feature 03 would over-flag a healthy pregnant patient |

*(This roadmap item cites a general, well-established physiological principle rather than one specific paper with a headline statistic — unlike features 8, 9, and 11, there isn't a single number like "AUC 0.90" to verify here. The mechanism itself — elevated cardiac output and reduced vascular resistance in the third trimester — is standard obstetric physiology, not a novel or contested finding.)*

## Algorithm

```
Input: pregnancy_mode toggle (with optional trimester selector)
       hr, br, rmssd (already computed by Vytal's existing pipeline)

pregnancy_thresholds = {
  hr_normal_band: [80, 100],   # shifted up from adult default [60,100]
  br_normal_band: [16, 20],    # shifted up from adult default [12,20]
  # RMSSD-based stress baseline also needs re-centring: pregnancy
  # physiology shifts autonomic tone, so the "elevated stress" cutoff
  # that applies to a non-pregnant adult would over-trigger here.
  # No single published RMSSD-in-pregnancy constant is cited in the
  # roadmap source — flag this as something to validate locally
  # (e.g. against a small reference set of confirmed-normal pregnant
  # scans) rather than hardcoding an unverified number.
}

# reuse feature 03's alert-scale logic, parameterised by
# pregnancy_thresholds when the toggle is on, same pattern as
# pediatric mode (feature 10)
run_alert_scale(hr, br, stress, thresholds=pregnancy_thresholds)
```

## Where this lives in the codebase

- Toggle added to the patient-context selector on `ScanPage.jsx`, alongside pediatric mode's age-group selector — both are instances of the same underlying pattern (swap the threshold table).
- Threshold config added to the same table structure introduced for pediatric mode.

## Honest limitations

- The HR/RR shifts are well-grounded obstetric physiology; the *stress-score RMSSD baseline shift* is much less specifically documented in accessible literature and should be treated as an assumption to validate, not a number to trust out of the box.
- Does not account for pregnancy complications (preeclampsia, gestational diabetes) that would themselves shift baselines further — this is a healthy-pregnancy baseline adjustment only, not a pregnancy-complication screen.
