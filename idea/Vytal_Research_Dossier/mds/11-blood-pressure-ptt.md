# Blood Pressure Estimation (Pulse Transit Time)

`Medium-Term Clinical · 3-4 weeks · most complex near-clinical feature`

---

## What it does

Measures the time delay between the rPPG pulse arriving at two different points on the body — the forehead (face scan) and the fingertip (fingertip scan) — since blood takes measurably longer to reach a point further from the heart when blood pressure is lower, and less time when it's higher. That delay, Pulse Transit Time (PTT), is used as a proxy for BP.

## The research this is built on (verified)

| Paper | What it actually showed | Where it fits Vytal |
|---|---|---|
| Ni, F. et al. **"ReViSe: Remote Vital Signs Measurement Using Smartphone Camera."** arXiv:2206.08748 (2022) | Simultaneous HR, HRV, SpO2 and BP estimation from facial rPPG video; reported BP MAE of **6-10 mmHg** for systolic/diastolic | Sets realistic accuracy expectations — this is squarely a "trend, not absolute number" feature |
| Systematic review of cuffless/camera-based BP estimation methods (NIH/PubMed, 2022) | Confirms the PTT-BP relationship is a valid non-invasive proxy in principle, but stresses that *individual calibration* materially improves accuracy over a population-level formula | Directly shapes the algorithm below — don't ship an uncalibrated population formula and call it accurate |
| Frontiers in Physiology, contactless BP estimation survey (2023) | ML-based camera BP methods are promising but lack standardised validation protocols; performance is sensitive to motion, lighting, skin tone | Grounds the honest-limitations section below |

## Algorithm

```
Two-stage capture (unlike other features, this needs BOTH a face
scan AND a fingertip scan, either sequential or simultaneous if a
second camera/device is used):

1. Run Vytal's existing rPPG pipeline on the face scan -> beatTimesMs_face
2. Run Vytal's existing rPPG pipeline (fingertip+flash mode,
   already built as a fallback capture mode) -> beatTimesMs_finger

3. For each heartbeat visible in both traces, compute:
     PTT[i] = beatTimesMs_finger[i] - beatTimesMs_face[i]
   (the pulse reaches the forehead, which is closer to the heart,
   before it reaches the fingertip — PTT should be a small positive
   number, tens of milliseconds)

4. Average PTT across the scan window, same trimmed-mean approach
   Vytal already uses for HR stabilisation.

5. Map PTT -> BP using a linear approximation (PTT shortens as BP
   rises):
     systolic_est  = a - b * mean_PTT
     diastolic_est = c - d * mean_PTT
   The literature is explicit that a/b/c/d are population-fit
   constants that do NOT transfer well person-to-person without
   calibration — see limitations below. Do not hardcode a/b/c/d
   from one paper and present the output as accurate; the review
   paper's core finding is that per-user calibration is required.

6. Calibration step (required, not optional, per the cited review):
   On first use, ask for one real cuff-BP reading. Solve for a/b/c/d
   (or a simpler per-user offset) so the PTT formula's output matches
   that one known point. Re-calibrate periodically.

7. Display as a *trend* indicator (rising/falling/stable vs. this
   patient's own calibrated baseline), not a standalone clinical
   BP reading.
```

## Where this lives in the codebase

- Needs a two-scan capture flow in `ScanPage.jsx` — the biggest UX change of any near-term feature, since it requires the CHW to do a face scan and a fingertip scan in the same session.
- New `bloodPressurePTT.js`, consuming `beatTimesMs` from both scans.

## Honest limitations (directly from the cited literature)

- Published MAE of 6-10 mmHg is **worse** than the IEEE/AAMI clinical-device standard of <5 mmHg MAE — this cannot be marketed or used as a clinically accurate BP reading under any current published camera-based method, Vytal's included.
- Requires per-user calibration against a real cuff reading to be meaningful at all; without that, treat the output as unvalidated.
- Of everything in this roadmap, this is the feature furthest from being usable as anything but a rough trend line — build it last, and build the honest-limitations messaging into the UI itself, not just this doc.
