# Tachycardia / Bradycardia 3-Level Alert Scale

`Quick Win · 1 day · threshold table in ai.js`

---

## What it does

Replaces a single flagged/not-flagged boolean with a Yellow / Orange / Red escalation, driven by HR + BR + stress together instead of any one number in isolation.

## The clinical protocols this is built on

This is not a machine-learning research feature — it is a direct implementation of three established clinical triage protocols. No paper needs "verifying" the way the ML papers do; these are living clinical guidelines maintained by WHO and professional bodies.

| Protocol | What it defines | Where it fits Vytal |
|---|---|---|
| **WHO IMCI (Integrated Management of Childhood Illness)** danger-sign thresholds | Age-banded HR/RR cut-offs that trigger "refer today" | Yellow/Orange/Red bands for the pediatric-mode age groups |
| **AHA/ACC tachycardia guidelines** | HR >150 bpm sustained = urgent evaluation in adults | Adult Red-tier threshold |
| **Sepsis-3** (Singer, M. et al., JAMA 2016, "The Third International Consensus Definitions for Sepsis and Septic Shock") | Combines HR, RR and altered consciousness into a SOFA-based urgency score rather than judging any vital sign alone | Justifies combining HR + BR + stress into one scale instead of three separate flags |

## Algorithm

```
Input: hr (bpm), br (breaths/min), stress (Vytal's existing RMSSD-based score)

adult thresholds (pediatric mode swaps in WHO IMCI age bands, see feature 10):

  RED    if hr > 150 or hr < 40 or (br > 30 and hr > 120)
  ORANGE if hr > 120 or hr < 50 or br > 24 or stress == "high"
  YELLOW if hr > 100 or hr < 60 or br > 20 or stress == "elevated"
  GREEN  otherwise

Sepsis-3-style combination check (upgrades severity regardless of
individual thresholds above):
  if hr > 90 and br > 22:
      bump one tier up (e.g. YELLOW -> ORANGE)
```

## Where this lives in the codebase

- Single threshold table added to `ai.js`, replacing the current binary flag logic.
- Consumed by the dashboard referral-flag colour/placement (already planned per the Seven Day Build Plan, Day 4).

## Honest limitations

- These thresholds are population guidelines, not personalised — a fit 25-year-old's resting 95bpm means something different from a sedentary 60-year-old's. No amount of literature fixes that; it needs the age/context inputs from pediatric mode (10) and pregnancy mode (13) to be meaningful.
