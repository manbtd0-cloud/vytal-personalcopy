# SpO2 Proxy Estimation

`Quick Win · 3-5 days · no new hardware`

---

## What it does

Estimates blood oxygen saturation from the same rPPG signal Vytal already extracts for heart rate, by comparing how much the red channel and the green/blue channel pulse with each heartbeat. Oxygenated and deoxygenated haemoglobin absorb red and infrared/green light differently, so the *ratio* of pulsatile-to-baseline amplitude in each channel (the Ratio-of-Ratios, or RoR) tracks SpO2.

## The research this is built on

| Paper | What it actually showed | Where it fits Vytal |
|---|---|---|
| Ni, F. et al., **ReViSe: Remote Vital Signs Measurement Using Smartphone Camera** (arXiv:2206.08748, 2022) | End-to-end smartphone rPPG pipeline estimating HR, SpO2 and BP together from facial video; SpO2 MAE 1.64% on PURE | Confirms SpO2 is extractable from the *same* facial video Vytal already records — no second capture needed |
| **SpO2 Estimation Using Deep Neural Networks: A Comparative Study** (IEEE EMBC 2023) | DNN model on fingertip video beat classical RoR, MAE ~1.97% across 70-100% SpO2 | Shows a learned mapping beats the textbook RoR formula, but the textbook formula is still the right *first* implementation |
| **A Multi-Channel Ratio-of-Ratios Method for Noncontact Hand Video Based SpO2 Monitoring Using Smartphone Cameras** (arXiv) | Extends RoR to multiple ROIs/channels rather than one fixed patch | Motivates sampling SpO2 from more than one skin patch and averaging |
| Samsung Research, **Estimating SpO2 with Deep Oxygen Desaturations from Facial Video** | Normalises RoR against lighting/skin-tone to fix cross-user drift | Directly informs the normalisation step below |

## Algorithm

Vytal already isolates the raw RGB traces per ROI in the rPPG pipeline (the same signal that feeds CHROM/POS). SpO2 reuses that, not a new capture.

```
1. Take the same forehead/cheek ROI trace Vytal already samples for HR.
   For each frame, record mean R, G, B channel intensity.

2. Bandpass filter each channel to the cardiac band (0.7-4 Hz),
   same filter Vytal already applies before CHROM.

3. For the RED and BLUE (or GREEN) channel separately, compute:
     AC_x = std(filtered_channel_x)          # pulsatile component
     DC_x = mean(raw_channel_x)              # baseline / non-pulsatile
     ratio_x = AC_x / DC_x

4. Ratio of Ratios:
     R = ratio_RED / ratio_BLUE

5. Empirical calibration curve (from RoR literature, needs local
   calibration against a pulse-oximeter reference before trusting
   absolute numbers):
     SpO2 = 110 - 25 * R        # starting linear approximation,
                                 # replace slope/intercept once
                                 # you have paired reference readings

6. Confidence gate: reuse Vytal's existing uncertainty.js SNR check.
   If the HR signal for that scan was already flagged unreliable,
   do not compute or display an SpO2 number.
```

## Where this lives in the codebase

- Reuses the RGB channel traces already computed before CHROM/POS runs (same ROI, same 15-second window) — do **not** duplicate signal extraction.
- New file: `spo2.js` exporting `estimateSpO2(redTrace, blueTrace) -> {value, confidence}`.
- Gate on `uncertainty.js`'s existing `reliable` flag before showing a number.
- Surfaces on `ScanPage.jsx` result view and `ReportPage.jsx`, labelled explicitly as a proxy.

## Honest limitations

- The linear calibration above is a *starting point* from published RoR literature, not a validated constant for Vytal's specific camera/ROI setup — it will need tuning against a real pulse oximeter on a handful of test subjects before the numbers can be trusted even directionally.
- Every cited study trained/validated mostly on people with SpO2 in the 90-100% range. Accuracy below ~90% (the range that actually matters clinically) is the least tested part of this literature — treat any reading under 90% as "possible desaturation, confirm with a real oximeter," never as a number to act on directly.
- Must ship labelled "proxy estimate — not a medical device."
