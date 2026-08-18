# Malnutrition Screening Proxy (BMI from Photo)

`Medium-Term Clinical · 3-4 weeks · new full-body scan mode`

---

## What it does

Estimates BMI from a full-body photo using a lightweight on-device model, then pairs that with Vytal's existing HR trend data for a combined malnutrition risk signal — aimed at community screening where a scale and a MUAC tape aren't always at hand.

## The research this is built on (verified)

| Paper | What it actually showed | Where it fits Vytal |
|---|---|---|
| **"SinBMI: Estimating BMI from a Single Image."** Noy, T.T., Sagi, I., Spingarn Eliezer, N. (Technion, preprint/conference paper) | Lightweight EfficientNet-B2 backbone + 7-layer MLP head, single 2D full-body image in, scalar BMI out. Designed specifically for mobile deployment; state-of-the-art accuracy/efficiency trade-off among BMI-from-photo models | This is the architecture to replicate: a small, mobile-friendly CNN backbone, not a heavy ResNet |
| **"Digital Scale: Open-Source On-Device BMI Estimation from Smartphone Camera Images."** arXiv:2508.20534 | Trained on 71,322 curated full-body smartphone images from 25,353 people; **MAPE 7.9%** on their own held-out set, 13% on a fully external dataset; open-source | Gives a realistic, externally-validated accuracy range to set expectations against, and is explicitly open-source — worth evaluating directly as a starting model rather than training from scratch |
| **"PatchBMI-Net: Lightweight Facial Patch-based Ensemble for BMI Prediction."** arXiv:2311.18102 | Facial-patch-only approach (no full-body photo needed), MAE 3.58-6.51, 5.4x smaller than ResNet-50/Xception baselines, 3x faster on-device | A genuinely useful alternative if a full-body photo proves impractical in the field — worth prototyping *both* full-body (SinBMI/Digital Scale) and facial-patch (PatchBMI-Net) approaches, since the facial-patch method needs far less patient cooperation and space |

*(The roadmap's cited "ResNet-50 Malnutrition Classification, jpinfotech.org" and "SAM Photo Diagnosis App, ISRCTN/ENN" could not be independently confirmed in this research pass — don't cite them as verified until a source is located; the three papers above are solid, checkable anchors that cover the same ground.)*

## Algorithm

```
Full-body approach (SinBMI / Digital Scale style):

1. Capture guidance: patient stands against a plain wall, fixed
   distance (both cited full-body papers stress that posture and
   distance standardisation drive accuracy — overlay a body-outline
   guide on the camera preview).

2. Person detection + posture filtering (Digital Scale's own
   pipeline does this to reject unusable images before scoring —
   reuse the same idea: reject frames where the person isn't fully
   in frame or standing normally, rather than scoring a bad image).

3. Feed the cropped, standardised full-body image through a
   lightweight CNN backbone (EfficientNet-B2, per SinBMI) followed
   by a small regression head -> scalar BMI estimate.
   Evaluate Digital Scale's open-source model directly as a starting
   point before training anything from scratch.

4. Classify into WHO malnutrition risk bands rather than displaying
   a bare BMI number as precise:
     BMI < 16       -> RED    "severe malnutrition risk"
     BMI 16-18.5     -> ORANGE "moderate malnutrition risk"
     BMI >= 18.5     -> normal range

5. Pair with Vytal's existing HR trend (feature 04/21): a rising
   resting HR alongside a low/falling BMI estimate over successive
   visits strengthens the malnutrition risk signal beyond either
   number alone — this pairing is the roadmap's own proposed logic,
   not something validated in the cited papers, so treat it as a
   local heuristic to test, not an established result.
```

## Where this lives in the codebase

- New full-body capture mode in `ScanPage.jsx`, distinct from the face/fingertip rPPG modes — needs its own framing-guide UI.
- New `bmiEstimate.js`, ideally wrapping an existing lightweight open-source model (Digital Scale) rather than training one from scratch given the timeline.
- BMI risk band feeds the same referral pipeline as other flags.

## Honest limitations

- All three cited models need a genuine full-body (or at minimum full-face) photo with real posture/lighting standardisation — accuracy drops meaningfully with casual, unposed photos, which is a real risk in a rushed field-screening context.
- None of the three papers were validated on the specific populations (rural CHW-served communities) Vytal targets — accuracy transfer is unverified.
- This is explicitly a *screening proxy*, not a diagnosis — the WHO-band framing above is deliberately coarse for that reason.
