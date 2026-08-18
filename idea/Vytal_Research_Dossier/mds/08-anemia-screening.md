# Anemia Screening (Conjunctival Pallor)

`Medium-Term Clinical · 2-3 weeks · new scan mode`

---

## What it does

Captures a close-up image of the lower palpebral conjunctiva (the inner lower eyelid, pulled down) and estimates haemoglobin level from the redness/pallor of that tissue — the same thing a CHW is already trained to eyeball manually under WHO IMCI, just quantified by the camera instead of judged by eye.

## The research this is built on (verified)

| Paper | What it actually showed | Where it fits Vytal |
|---|---|---|
| Zhao, L., Vidwans, A., Bearnot, C.J., Rayner, J., Lin, T., Baird, J., Suner, S., Jay, G.D. **"Prediction of anemia in real-time using a smartphone camera processing conjunctival images."** *PLOS ONE* 19(5): e0302883 (2024). DOI: 10.1371/journal.pone.0302883. Open access: pmc.ncbi.nlm.nih.gov/articles/PMC11090304 | RAW-format conjunctival images, hue-ratio-based Hb estimate, tested on 435 ED patients. AUC **0.92** at the 7 g/dL transfusion threshold, **0.90** at 9 g/dL. Bland-Altman bias 0.10 g/dL, limits of agreement (-4.73, +4.93) g/dL. Overall point accuracy 75.4% | This is the core algorithm to replicate: **high hue ratio** computed from RAW (not JPEG) conjunctival images is the specific, reproducible signal |
| Same group's earlier work: Suner, S. et al. **"Prediction of anemia and estimation of hemoglobin concentration using a smartphone camera."** *PLOS ONE* 16: e0253495 (2021) | The original derivation dataset the 2024 paper's classifier was built on | Read this one first — it defines the hue-ratio feature extraction the 2024 paper's classifier consumes |
| Jain, P., Bauskar, S., Gyanchandani, M. **"Neural network based non-invasive method to detect anemia from images of eye conjunctiva."** *Int J Imaging Syst Technol* 30:112-125 (2020) | Independent NN-based approach on conjunctiva images, different research group, same target tissue | Cross-validates that conjunctiva-based Hb estimation isn't a one-lab result |

*(The roadmap's "AnemiaVision" EfficientNet-B3 preprint and the "3D-printed spacer" Bentham Science paper could not be independently located/confirmed as of this research pass — don't cite them as verified sources; the Zhao et al. 2024 PLOS ONE paper above is the one solid, checkable anchor.)*

## Algorithm

```
1. Capture mode: guide the user to gently pull down the lower eyelid
   and hold the phone 3-6 inches from the eye (per Zhao et al.'s
   protocol). Overlay a framing guide on the camera preview — the
   paper is explicit that image standardisation drives accuracy.

2. Capture in RAW format if the device/browser supports it
   (Zhao et al. found RAW materially outperforms JPEG, because JPEG's
   in-camera compression discards the subtle hue information the
   classifier relies on). Fall back to highest-quality JPEG if RAW
   capture isn't available in-browser.

3. Segment the conjunctival ROI (the pink/red strip of exposed inner
   eyelid tissue) — either via a manual crop guide the user aligns to,
   or a simple colour-based segmentation (skin/white-of-eye rejection,
   keep the reddish band).

4. Compute the "high hue ratio":
     For each pixel in the ROI, convert RGB -> HSV.
     high_hue_ratio = (fraction of pixels with hue in the paper's
                        defined "high hue" band) 
     (exact band boundaries are defined in the Suner 2021 derivation
      paper — pull the precise HSV thresholds from that paper before
      implementing, they are not restated in the 2024 validation paper)

5. Apply the derivation dataset's regression/classifier mapping
   high_hue_ratio -> estimated Hb (g/dL).
   This mapping was fit on Zhao et al.'s own population — it is a
   starting point, not a guarantee it transfers unchanged to Vytal's
   camera hardware and lighting conditions.

6. Classify into WHO IMCI-aligned bands rather than showing a raw
   number as gospel:
     Hb < 7 g/dL   -> RED  "severe anemia — urgent referral"
     Hb 7-9 g/dL   -> ORANGE "moderate anemia — refer for confirmation"
     Hb > 9 g/dL   -> normal / low risk
   (matching the two transfusion thresholds the paper actually
   validated against — don't report finer-grained numbers than the
   validation supports)
```

## Where this lives in the codebase

- New scan mode alongside the existing face/fingertip modes — needs its own capture UI in `ScanPage.jsx` (eyelid framing guide) rather than reusing the rPPG capture flow.
- New `anemia.js` module for the hue-ratio computation and threshold classification.
- Feeds the same referral-flag pipeline as the alert scale (feature 03).

## Honest limitations (from the paper itself)

- 75.4% overall point accuracy is real but modest; the *threshold detection* (is this person below 7 or 9 g/dL) is meaningfully stronger (AUC 0.90-0.92) than the *point estimate* is. Build this as a threshold/triage tool, not a "your hemoglobin is exactly X" display.
- RAW image capture reliability varies a lot across Android browsers/devices — confirm what's actually achievable in Vytal's target device range before assuming this step works as described.
- Validated on an Emergency Department population in the US, not on the CHW/rural populations Vytal targets — accuracy in a different setting and lighting is genuinely unknown until tested.
