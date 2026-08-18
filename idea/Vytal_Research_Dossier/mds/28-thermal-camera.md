# Thermal Camera (USB-C)

`Hardware · W3C Web USB API · FLIR Lepton 3.5`

---

## What it does

Adds fever screening via a low-cost USB-C thermal camera module, giving Vytal a skin-temperature-based fever signal to combine with its existing HR/BR/stress readings.

## The standard, hardware, and research this is built on (verified)

| Source | What it defines/showed | Where it fits Vytal |
|---|---|---|
| **W3C Web USB API** specification | Browser-native USB device access, letting a web app talk directly to a connected USB peripheral without a native driver/app | Same role as Web Bluetooth plays for the pulse oximeter — this is what lets a $79 thermal module plug into a phone and be read by Vytal's web app |
| **FLIR Lepton 3.5** module | 160×120 thermal resolution at 8.6 Hz, USB-C compatible, ~$79 — an actual, currently available consumer thermal sensor | The specific, sourceable hardware this feature targets, not a hypothetical device |
| **"Diagnostic accuracy of non-contact infrared thermometers and thermal scanners: a systematic review and meta-analysis."** *Journal of Travel Medicine* 27(8): taaa193 (2020) | Pooled across studies: non-contact infrared thermometers (forehead) — sensitivity **0.808**, specificity **0.920**; thermal scanners — sensitivity **0.818**, specificity **0.923** | This is the real, verifiable meta-analysis to cite — note it's somewhat *lower* sensitivity than the roadmap's original "~84%" figure implied, and specificity is closer to 92% than 91%, close but worth citing precisely rather than approximately |

*(The roadmap's original "sensitivity ~84%, specificity ~91% at 37.5°C" is in the right ballpark of the real meta-analysis above but doesn't exactly match any single number in it — use the verified 0.808-0.818 sensitivity / 0.920-0.923 specificity range instead of restating the roadmap's approximate figure as if it were an exact citation.)*

## Algorithm / implementation

```
1. Device connection via Web USB, triggered by explicit user gesture:
     const device = await navigator.usb.requestDevice({
       filters: [{ vendorId: FLIR_VENDOR_ID }]
     });
     await device.open();

2. Read thermal frame data per the Lepton 3.5's documented USB
   frame protocol (FLIR publishes a Lepton software IDD — Interface
   Description Document — covering the exact frame/packet format;
   implement against that spec rather than reverse-engineering it).

3. Face-region temperature extraction:
   Vytal already runs MediaPipe Face Mesh for rPPG ROI tracking —
   reuse those landmarks to locate the forehead/inner-canthus region
   in the thermal frame (requires a one-time spatial calibration
   between the RGB camera's face landmarks and the thermal sensor's
   field of view, since they are two physically separate camera
   modules with different fields of view and mounting offsets).

4. Apply the same forehead-temperature fever threshold the cited
   meta-analysis studies used (commonly 37.5°C, though the review
   notes fever thresholds across included studies actually ranged
   37.3-38.5°C — pick and document one threshold explicitly
   rather than leaving it ambiguous).

5. Combine with existing HR/BR/respiratory-distress flag (feature 12):
   fever + tachycardia + tachypnoea together is a materially stronger
   sepsis/serious-infection signal than any one sign alone, per the
   same Sepsis-3 logic feature 12 already implements.
```

## Where this lives in the codebase

- New `thermalCamera.js` handling Web USB pairing and Lepton frame parsing.
- Spatial calibration step needed once per device pairing to align thermal FOV with the existing MediaPipe face landmarks.
- Fever flag feeds the same combination logic as feature 12 (respiratory distress).

## Honest limitations

- Web USB, like Web Bluetooth, has real browser/platform gaps (notably iOS/Safari) — same deployment caveat as feature 27.
- Even the real, verified meta-analysis shows non-contact thermal screening sensitivity around 80-82%, not 90%+ — this is a meaningfully imperfect screening tool on its own and should be combined with other signs (per the combination logic above), not trusted as a standalone fever detector.
- Requires the CHW to carry an additional physical accessory — same no-extra-hardware trade-off noted for feature 27.
