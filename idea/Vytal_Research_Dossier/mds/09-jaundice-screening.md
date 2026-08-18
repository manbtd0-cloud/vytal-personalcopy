# Jaundice Screening (Scleral Icterus)

`Medium-Term Clinical · 2-3 weeks · new scan mode`

---

## What it does

Captures an image of the sclera (white of the eye) and estimates elevated bilirubin from its yellow discolouration — applicable to both neonatal jaundice screening and adult liver/pancreatic disease triage.

## The research this is built on (verified)

| Paper | What it actually showed | Where it fits Vytal |
|---|---|---|
| Mariakakis, A., Banks, M.A., Phillipi, L., Yu, L., Taylor, J., Patel, S.N. **"BiliScreen: Smartphone-Based Scleral Jaundice Monitoring for Liver and Pancreatic Disorders."** *Proc. ACM Interact. Mob. Wearable Ubiquitous Technol.* 1(2), Article 20 (2017). DOI: 10.1145/3090085. Open PDF: ubicomplab.cs.washington.edu/pdfs/biliscreen.pdf | 70-person clinical study. With a 3D-printed light-control box accessory: Pearson r = 0.89, mean error -0.09 ± 2.76 mg/dL vs. blood bilirubin. As a binary "cases of concern" screen: **sensitivity 89.7%, specificity 96.8%** | This is the primary algorithm to replicate — sclera colour-space analysis, with the explicit finding that a light-control accessory measurably improves accuracy over bare-camera capture |
| Taylor, J.A., Stout, J.W., de Greef, L. et al. **"Use of a Smartphone App to Assess Neonatal Jaundice."** *Pediatrics* (2017). PMID: 28842403 | The BiliCam predecessor — skin-based (not sclera-based) neonatal screening, ~90% correlation with blood bilirubin in 530 infants | Relevant specifically for a future "infant mode" of this feature — neonates need skin-patch analysis, not sclera, since infant sclera imaging is impractical |
| **"Smartphone screening for neonatal jaundice via ambient-subtracted sclera chromaticity."** *PLOS ONE* (2020). journals.plos.org/plosone/article?id=10.1371/journal.pone.0216970 | Front camera flash used as a controlled light source, flash/no-flash image *pair* subtracted to cancel ambient lighting — no physical accessory needed | Directly useful for Vytal: this is a software-only way to get BiliScreen's "light-control box" benefit without requiring CHWs to carry a 3D-printed accessory |

## Algorithm

```
1. Two-shot capture using the front camera:
     shot_A = capture with screen-flash (max brightness white screen)
     shot_B = capture immediately after, screen at normal brightness
   (per the ambient-subtracted PLOS ONE method — this cancels room
   lighting variation without needing BiliScreen's physical box)

2. ambient_subtracted = shot_A - shot_B   (pixel-wise)
   This isolates the light that's actually reflecting off the sclera
   under the *controlled* flash, independent of room lighting.

3. Segment the sclera region:
   - Detect eye landmarks (Vytal already has MediaPipe Face Mesh
     wired in for ROI tracking — reuse it; MediaPipe's iris/eye
     landmarks give the sclera boundary directly, no new CV needed)
   - Mask out iris and eyelid, keep only the white-of-eye band

4. Convert masked sclera pixels to a colour space that separates
   yellow from white cleanly (BiliScreen uses a custom chromaticity
   metric; CIE Lab or HSV hue+saturation are simpler substitutes —
   start with HSV hue shift toward yellow (~50-65°) as the working
   signal, since BiliScreen's own supplementary detail on the exact
   colour transform is in the full paper, not summarized here)

5. Map colour shift -> "case of concern" binary flag using
   BiliScreen's validated operating point (89.7% sens / 96.8% spec),
   not a fine-grained bilirubin number — the paper's point-estimate
   error bar (±2.76 mg/dL) is too wide for a precise mg/dL display
   to be honest.
```

## Where this lives in the codebase

- Reuses Vytal's existing MediaPipe Face Mesh integration (already wired for rPPG ROI tracking) to locate the eye/sclera region — this is the single biggest implementation shortcut, since face landmarking doesn't need to be built from scratch.
- New `jaundice.js` module for the two-shot ambient-subtraction + colour analysis.
- New capture step in `ScanPage.jsx`: two rapid captures (flash/no-flash) instead of one.

## Honest limitations

- BiliScreen's headline numbers (89.7%/96.8%) were achieved *with* a physical 3D-printed light-control box in the original study — the ambient-subtraction software approach above is a reasonable substitute grounded in a *different* paper, but the combination (BiliScreen's colour analysis + software-only ambient subtraction instead of a physical box) has not itself been validated as one pipeline. Treat accuracy as unverified until tested.
- This is a threshold detector ("case of concern," yes/no), not a lab-grade bilirubin measurement — it should prompt a referral or blood test, never replace one.
