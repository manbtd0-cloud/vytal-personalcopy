# Pediatric Mode

`Medium-Term Clinical · 3-5 days · threshold config + AI prompt modifier`

---

## What it does

An age-group selector (Adult / Child 5-12 / Infant <5) that swaps every threshold Vytal already uses — HR, BR, and once built, SpO2 and the alert scale — for age-appropriate reference ranges, and adjusts the AI explanation prompt to match.

## The protocols this is built on

Not research papers to "verify" — these are maintained clinical reference standards, the same kind of source the roadmap already correctly cites for the alert scale (feature 03).

| Source | What it defines |
|---|---|
| **WHO IMCI (Integrated Management of Childhood Illness)** danger-sign reference tables | Published normal/danger HR and RR ranges by age band (young infant, infant, child) — e.g. RR thresholds of >60 for <2 months, >50 for 2-12 months, >40 for 1-5 years define the pneumonia danger sign |
| **AHA Pediatric Advanced Life Support (PALS)** guidelines | HR reference ranges by age, used across pediatric emergency medicine, complementary to IMCI's RR-focused thresholds |

## Algorithm

```
Input: age_group selection (Adult / Child 5-12 / Infant <5)
       hr, br  (already produced by Vytal's existing rPPG pipeline)

threshold_table = {
  "infant_under_2mo":  { hr: [100,180], br_danger: 60 },
  "infant_2_12mo":     { hr: [100,170], br_danger: 50 },
  "child_1_5y":        { hr: [80,150],  br_danger: 40 },
  "child_5_12":        { hr: [70,130],  br_danger: 30 },  # PALS-aligned
  "adult":              { hr: [60,100],  br_danger: 24 },  # Vytal's current default
}
# exact numeric bands should be pulled directly from the current
# WHO IMCI adaptation guide and PALS reference tables at build time,
# not hardcoded from memory — these vary slightly between guideline
# revisions and Vytal should track the source version used.

selected = threshold_table[age_group]

# reuse feature 03's alert-scale logic, parameterised by `selected`
# instead of the hardcoded adult numbers
run_alert_scale(hr, br, stress, thresholds=selected)

# AI prompt modifier: pass age_group into the existing Qwen prompt
# so the explanation register matches (e.g. "for a child this age,
# a faster heartbeat than an adult's is completely normal")
```

## Where this lives in the codebase

- New age-group selector control on `ScanPage.jsx`, stored alongside the patient record.
- Threshold config extracted out of `ai.js`'s hardcoded adult numbers (needed anyway for feature 03) into an age-indexed table.
- Age group passed as a parameter into the existing Qwen prompt-construction step.

## Honest limitations

- WHO IMCI and PALS use somewhat different age bands and were built for slightly different clinical purposes (community triage vs. emergency resuscitation) — reconciling them into one clean table needs a clinical reviewer's judgement call, not just a literature lookup.
