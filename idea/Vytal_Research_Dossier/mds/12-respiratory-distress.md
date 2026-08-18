# Respiratory Distress Indicator

`Medium-Term Clinical · 1 day · logic on existing HR + BR outputs`

---

## What it does

If BR and HR are simultaneously elevated past clinical thresholds, flags "signs of respiratory distress — assess for pneumonia" instead of treating HR and BR as two independent numbers.

## The protocols this is built on

| Source | What it defines | Where it fits Vytal |
|---|---|---|
| **WHO IMCI pneumonia danger sign** | Age-banded elevated RR thresholds (>50 for infants, >40 for children 1-5, >20 for adults) combined with other danger signs = urgent referral | RR-side of the combination logic; reuses the same age-banded table as pediatric mode (feature 10) |
| Singer, M. et al. **"The Third International Consensus Definitions for Sepsis and Septic Shock (Sepsis-3)."** *JAMA* 315(8):801-810 (2016) | Tachypnoea (RR >22) + tachycardia (HR >90) are two of the core criteria used to flag early sepsis, rather than judging either vital sign alone | Directly justifies combining HR + BR into one flag instead of two separate ones — this is the same clinical logic the alert scale (feature 03) already borrows from Sepsis-3 |

## Algorithm

```
Input: hr, br  (already produced), age_group (from pediatric mode if set)

# Adult (Sepsis-3-aligned) rule:
if hr > 100 and br > 25:
    flag("Signs of respiratory distress — assess for pneumonia", tier="ORANGE")

# Age-banded (WHO IMCI-aligned) rule, when pediatric mode is active:
imci_rr_danger = {
  "infant_under_2mo": 60,
  "infant_2_12mo":     50,
  "child_1_5y":        40,
}
if age_group in imci_rr_danger and br > imci_rr_danger[age_group]:
    flag("Elevated respiratory rate for age — IMCI danger sign", tier="RED")
```

## Where this lives in the codebase

- Logic addition to `ai.js`, directly downstream of the existing HR/BR outputs — no new capture, no new signal processing. Shares the age-band table introduced for pediatric mode (feature 10).

## Honest limitations

- This is a combination of two well-established, already-validated clinical protocols, not new machine learning — the main risk isn't the thresholds, it's getting the pediatric age bands wired to the right source table version and keeping the two protocols (IMCI for RR, Sepsis-3 for the HR+RR combination) from silently drifting out of sync with each other in the code as they get maintained separately.
