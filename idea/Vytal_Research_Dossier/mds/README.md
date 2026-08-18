# Vytal Research Dossier — MD Index

Algorithm-and-citation mapping for every feature on the Vytal roadmap
that is not yet built, continuing from the "What's Already Built"
list in the source roadmap document.

Each file follows the same structure: what the feature does, the
specific papers/standards it rests on (verified where possible, with
verification status noted honestly where a roadmap citation could not
be confirmed), a concrete algorithm/pseudocode section tied to Vytal's
actual codebase (`uncertainty.js`, `ai.js`, `ScanPage.jsx`,
`ReportPage.jsx`, `beatTimesMs`), where it lives in the repo, and
honest limitations.

## Near-Term Quick Wins
- 01-spo2-proxy.md
- 02-afib-flag.md
- 03-alert-scale.md
- 04-scan-history-sparkline.md
- 05-scan-quality-score.md
- 06-voice-readout.md
- 07-auto-rescan.md

## Medium-Term Clinical Expansions
- 08-anemia-screening.md
- 09-jaundice-screening.md
- 10-pediatric-mode.md
- 11-blood-pressure-ptt.md
- 12-respiratory-distress.md
- 13-pregnancy-mode.md
- 14-malnutrition-bmi.md

## Platform & Deployment
- 15-platform-deployment.md (covers FHIR, DHIS2, SMS fallback, WhatsApp share, batch scan)

## AI & Intelligence Layer
- 21-longitudinal-risk-scoring.md
- 22-population-anomaly-detection.md
- 23-ai-layer-clinician-coaching-language.md (covers clinician view, coaching, programme context, language expansion)

## Hardware Extensions
- 27-ble-pulse-oximeter.md
- 28-thermal-camera.md
- 29-wearable-hrv-baseline.md

## A note on citation verification

Every file distinguishes between citations that were independently
re-searched and confirmed to exist with the stated findings (marked
with a full author/journal/DOI or verifiable URL) versus the original
roadmap's citations that could not be located under the stated title
in this research pass (marked explicitly as unverified, with a real
alternative source substituted where one exists). Three of the
roadmap's original citations — "AnemiaVision" preprint, the
"3D-printed spacer" Bentham Science paper, "ResNet-50 Malnutrition
Classification," "SAM Photo Diagnosis App," the *Frontiers in
Psychology* 2022 HRV paper, and the *Lancet Digital Health* 2021
"Digital Epidemiological Surveillance" paper — fall into this
unverified category. This isn't a small caveat: don't repeat those
specific citations in a pitch deck as if they were confirmed.
