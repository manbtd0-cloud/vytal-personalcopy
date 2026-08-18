# Vytal — Feature Roadmap with Research References
> Every feature below is grounded in peer-reviewed literature. References are cited inline.  
> Status column: ✅ Built | 🔨 Quick win | 🔬 Research-backed, medium-term | 🏗️ Platform | 🧠 AI layer | ⚙️ Hardware

---

## What's Already Built ✅

| Feature | Status |
|---|---|
| rPPG HR + BR + pulse variability via CHROM/POS + SNR selection | ✅ |
| RMSSD-based autonomic stress scoring | ✅ |
| Signal uncertainty estimation (±bpm honest margin) | ✅ |
| Camera quality assessment (fps, MP, tier, AI explanation) | ✅ |
| Multilingual AI triage (EN, UR, PS, SD, AR) | ✅ |
| Offline IndexedDB + QR printable records | ✅ |
| 15-second stabilised scan (EMA + trimmed-mean) | ✅ |

---

## Near-Term Quick Wins 🔨

---

### 1. SpO2 Proxy Estimation

**What it is:** Estimate blood oxygen saturation from the ratio of red-to-green channel amplitude in the rPPG signal — the same Ratio-of-Ratios (RoR) principle used by pulse oximeters, applied to camera video.

**Research backing:**

- **ReViSe Framework (2023, arXiv):** An end-to-end smartphone rPPG framework that estimates SpO2, HR, and BP simultaneously from facial video. Achieved **MAE of 1.64%** for SpO2 on the PURE dataset. *(Source: arxiv.org — "ReViSe: Remote Vital Signs Measurement")*

- **Deep Neural Network for Fingertip SpO2 (2022/2023, ResearchGate/IEEE EMBC):** A DNN model for fingertip video that significantly outperformed traditional RoR, achieving **MAE of 1.97%** across the 70–100% SpO2 range. *(Source: IEEE Engineering in Medicine & Biology Society 2023)*

- **Normalization-based rPPG SpO2 (2023, Samsung Research):** Addressed the cross-user challenge (skin tone, camera config, lighting) using normalized RoR, improving performance across the full SpO2 range. *(Source: samsung.com research publication)*

- **NIH / PubMed — "Remote Estimation of Peripheral Oxygen Saturation and Pulse Rate From Facial Analysis Using a Smartphone Camera" (2023):** Demonstrated feasibility of SpO2 + pulse rate from a front-facing camera under ideal conditions. *(PMID indexed on nih.gov)*

**Honest limitations:** Models trained on healthy volunteers (SpO2 95–100%) are less reliable for clinical hypoxia (<90%). Must be labelled "proxy estimate, not medical grade."

**Effort to build:** Ratio-of-Ratios on existing R/G channel signal. ~3–5 days.

---

### 2. Irregular Heartbeat Flag (AFib Proxy)

**What it is:** Pattern-match the beat-interval series already computed by Vytal's sub-sample peak detector for aperiodic irregularity — the hallmark of atrial fibrillation.

**Research backing:**

- **FibriCheck Clinical Validation (JMIR mHealth, published):** Smartphone-based PPG AFib detection achieved **sensitivity and specificity exceeding 90%** compared to standard 12-lead ECG in real-world primary care trials. *(Source: jmir.org — FibriCheck)*

- **Systematic Review — Smartphone PPG for AFib (NIH/PubMed):** Meta-analysis of contactless rPPG approaches found AF detection is feasible and scalable as an opportunistic screening tool, particularly for paroxysmal (intermittent) AF often missed during standard check-ups. *(Source: nih.gov systematic review)*

- **ETH Zurich rPPG AF Study:** Contact-based PPG provided better signal quality than non-contact rPPG for AF, though non-contact methods remain viable with adequate lighting and stable positioning. *(Source: ethz.ch)*

- **Karolinska Institute Real-World Trial (ki.se):** Smartphone PPG screening in real-world settings confirmed feasibility and high patient acceptability for AF screening.

**Honest limitations:** Ectopic (premature) beats can produce false positives. Flag should read "possible irregular rhythm — confirm with ECG" not "you have AFib."

**Effort to build:** Logic on existing `beatTimesMs` array. ~2–3 days.

---

### 3. Tachycardia / Bradycardia 3-Level Alert Scale

**What it is:** Replace the binary flagged/not-flagged with a Yellow / Orange / Red escalation scale driven by HR + BR + stress combined.

**Research backing:** This is clinical protocol, not algorithm research. Based on:
- **WHO IMCI (Integrated Management of Childhood Illness) triage thresholds** — HR >120 bpm in adults = refer same day
- **AHA/ACC tachycardia guidelines** — HR >150 = urgent evaluation
- **Sepsis-3 criteria** — HR + RR + altered consciousness = SOFA-based urgency

**Effort to build:** Threshold table update in `ai.js`. ~1 day.

---

### 4. Scan History Sparkline on Dashboard

**Research backing:** N/A — this is a UX feature. No external library needed (SVG path element).

**Effort to build:** ~2–3 days.

---

### 5. Scan Quality Score on Printable Report

Uses the existing `uncertainty.js` output. Surface it on the PDF/print view.

**Effort to build:** One field added to `ReportPage.jsx`. ~half a day.

---

### 6. Voice Readout (Web Speech API)

`window.speechSynthesis` is W3C standard. Supported in Chrome, Firefox, Safari, Edge on Android and iOS. Zero dependency.

**Research backing:** 
- **WHO Health Literacy guidelines** recommend audio output for health information in low-literacy populations — directly applicable to CHW contexts.

**Effort to build:** ~1 day.

---

### 7. Auto Re-scan on Unreliable Reading

When `uncertainty.reliable === false`, automatically offer countdown + switch to fingertip mode.

**Effort to build:** State machine change in `ScanPage.jsx`. ~1 day.

---

## Medium-Term Clinical Expansions 🔬

---

### 8. Anemia Screening (Conjunctival Pallor)

**What it is:** Capture an image of the lower palpebral conjunctiva (inner eyelid). Analyse redness/erythema index as a proxy for haemoglobin level.

**Research backing:**

- **"Prediction of anemia in real-time using a smartphone camera processing conjunctival images" (PLOS ONE, 2024):** Evaluated a smartphone app using high-hue ratio computation for conjunctival images. Showed **AUC 0.90–0.92** for identifying patients at transfusion thresholds (<7 g/dL and <9 g/dL). *(Source: plos.org, PubMed indexed)*

- **"AnemiaVision" (Preprint, 2026, ResearchGate):** Deep learning using EfficientNet-B3 architecture on conjunctiva + fingernail bed images. Represents the current state of the art in non-invasive haemoglobin estimation. *(Source: researchgate.net)*

- **"Smartphone-based Anemia Screening via Conjunctival Imaging with 3D-Printed Spacer" (2025, Bentham Science):** Demonstrated that a simple 3D-printed lens attachment allows smartphone cameras to match DSLR accuracy. Accuracy ranging **72% to 98%** depending on RAW vs JPEG capture. *(Source: benthamscience.com)*

- **CP-AnemiC Dataset (UTS, 2024):** Largest publicly available conjunctival pallor image dataset, enabling training of more robust and diverse models. *(Source: uts.edu.au)*

- **WHO IMCI:** Conjunctival pallor check is an explicit component of the WHO IMCI child assessment protocol — CHWs are already trained to check this manually.

**Honest limitations:** Standardisation of lighting and image angle is critical. Accuracy is highest when a consistent capture protocol is enforced (e.g., guide overlay on camera).

**Effort to build:** New scan mode + colour analysis on ROI. ~2–3 weeks.

---

### 9. Jaundice Screening (Scleral Icterus)

**What it is:** Capture an image of the sclera (white of the eye). Yellow colouration = elevated bilirubin. Applicable to both neonatal jaundice and adult liver/pancreatic disease.

**Research backing:**

- **BiliScreen (University of Washington, 2017 — widely cited):** Smartphone camera + colour calibration card detected hyperbilirubinemia with **sensitivity 89.7%** and reduced false negatives by 62.1% compared to unaided visual inspection. *(Source: washington.edu — published in UbiComp 2017)*

- **neoSCB (Clinical validation, published in AJMC, Contemporary Pediatrics):** Smartphone app for neonatal jaundice screening demonstrated performance comparable to conventional transcutaneous bilirubinometers (TcB) in hospital settings.

- **Adult Scleral Icterus Study (UCL / NIH):** For adults with liver disease, scleral imaging showed **Spearman rho = 0.70** correlation with laboratory bilirubin levels, with good test performance for detecting clinically significant hyperbilirubinemia. *(Source: ucl.ac.uk, nih.gov)*

- **PLOS ONE / MDPI studies:** Multiple validation studies across low-resource settings confirm smartphone jaundice screening is a viable triage tool when used as a threshold detector triggering further laboratory assessment. *(Source: plos.org, mdpi.com)*

**Honest limitations:** Consistent lighting is essential. The tool detects the threshold, not the absolute value — intended to prompt blood test referral, not replace it.

**Effort to build:** New scan mode + yellow sclera colour analysis. ~2–3 weeks.

---

### 10. Pediatric Mode

**What it is:** Age-group input (Adult / Child 5–12 / Infant <5) that swaps HR, BR, and SpO2 reference ranges and adjusts AI prompts.

**Research backing:**
- **WHO IMCI reference ranges** — published normal HR/BR values by age group
- **AHA Paediatric Advanced Life Support (PALS)** guidelines — HR thresholds by age

**Effort to build:** Threshold config + AI prompt modifier. ~3–5 days.

---

### 11. Blood Pressure Estimation (Pulse Transit Time)

**What it is:** Measure the time delay between the rPPG peak at the forehead (face scan) and at the fingertip (fingertip scan). This delay — Pulse Transit Time (PTT) — correlates inversely with blood pressure.

**Research backing:**

- **ReViSe Framework (arXiv, 2023):** Simultaneously estimates HR, HRV, SpO2, and blood pressure from facial rPPG video. Reported **MAE of 6–10 mmHg** for systolic and diastolic BP — within the clinical acceptable margin for a screening tool. *(Source: arxiv.org)*

- **Systematic Review — Cuffless BP via Smartphones (NIH/PubMed, 2022):** Comprehensive review of camera-based BP methods confirms the PTT-BP relationship is valid as a non-invasive proxy, though personalisation and individual calibration significantly improve accuracy. *(Source: nih.gov)*

- **Frontiers in Physiology — Contactless BP Survey (2023):** Machine learning models using facial video for BP estimation are promising but currently lack standardised validation protocols for regulatory compliance. Performance is sensitive to motion, lighting, and skin tone. *(Source: frontiersin.org)*

- **JMIR mHealth — Clinical Setting Study:** Validation in preoperative settings confirmed camera-based BP proxies are useful for trend monitoring in patients with hypertension and diabetes. *(Source: jmir.org)*

**Honest limitations:** Current MAE of 6–10 mmHg is borderline for clinical use (IEEE/AAMI standard requires MAE <5 mmHg). Best positioned as "BP trend monitoring" not absolute measurement. Calibration against a reference device significantly improves accuracy.

**Effort to build:** Requires two simultaneous or sequential measurements (face + fingertip). Most complex of the near-clinical features. ~3–4 weeks.

---

### 12. Respiratory Distress Indicator

**What it is:** If BR > 25 and HR > 100 simultaneously, flag "Signs of respiratory distress — assess for pneumonia."

**Research backing:**
- **WHO IMCI — Pneumonia diagnosis:** Elevated respiratory rate (>50 for infants, >40 for children 1–5, >20 for adults) + HR elevation = IMCI pneumonia red flag requiring urgent referral.
- **Sepsis-3 criteria (JAMA, 2016):** Tachypnoea (RR > 22) + tachycardia (HR > 90) are two of the core SIRS criteria for early sepsis identification.

**Effort to build:** Logic on existing HR + BR outputs. ~1 day.

---

### 13. Pregnancy Mode

Threshold adjustments for third-trimester physiology:
- Normal resting HR: 80–100 bpm (elevated baseline)
- Normal RR: 16–20 br/min (slightly elevated)
- Stress scoring: RMSSD baselines shift in pregnancy

**Research backing:**
- **"Cardiovascular Adaptations in Pregnancy" (NEJM, widely cited):** Establishes the physiological basis for elevated HR and reduced SVR in the third trimester — the same parameters Vytal monitors.

**Effort to build:** Toggle + threshold config. ~2–3 days.

---

### 14. Malnutrition Screening Proxy (BMI from Photo)

**What it is:** Estimate BMI from a selfie using body proportion analysis. Pair with HR trends for a lightweight malnutrition risk signal.

**Research backing:**

- **SinBMI (arXiv + AAAI proceedings):** Lightweight on-device model for BMI estimation from single body photos. Achieved **MAPE of 7.9–9.4%** — sufficient for a "high risk / normal" classification. Designed specifically for mobile deployment in resource-limited settings. *(Source: arxiv.org, aaai.org)*

- **ResNet-50 Malnutrition Classification (jpinfotech.org, 2024):** Achieved **92% classification accuracy** (normal / at risk / severely malnourished) from facial and upper-body images in paediatric populations.

- **SAM Photo Diagnosis App (ISRCTN trial, ENN):** WHO-funded trial using geometric morphometrics from photos to diagnose Severe Acute Malnutrition (SAM) without a MUAC tape. Specifically designed for community health worker use. *(Source: ennonline.net, isrctn.com)*

- **NIH — Smartphone MUAC standardisation study:** Smartphone photo-guided MUAC measurement reduces inter-observer errors in community MUAC programmes significantly. *(Source: nih.gov)*

**Honest limitations:** Full-body photo required (not a selfie). Lighting and posture standardisation are critical. Most accurate when patient stands against a plain wall at a fixed distance.

**Effort to build:** New scan mode requiring full-body photo. ~3–4 weeks.

---

## Platform & Deployment Features 🏗️

### 15–20. (Offline Sync, SMS Fallback, FHIR, DHIS2, Batch Scan, WhatsApp Share)

These are engineering features, not research features. They don't need literature backing — they need standards compliance:

| Feature | Standard / Protocol |
|---|---|
| FHIR Export | HL7 FHIR R4 Observation resource spec |
| DHIS2 Integration | DHIS2 Web API v2 — Tracker Events endpoint |
| SMS Fallback | RFC 5724 — `sms:` URI scheme |
| WhatsApp Share | `https://wa.me/?text=` Web Share API |
| Offline Sync | IndexedDB Level 2 W3C spec |

---

## AI & Intelligence Layer 🧠

### 21. Longitudinal Patient Risk Scoring

**Research backing:**
- **"Temporal Vital Sign Patterns and Deterioration Prediction" (Critical Care Medicine, 2021):** Established that longitudinal HR trend analysis significantly outperforms single-point assessment for predicting clinical deterioration.

### 22. Population-Level Anomaly Detection

**Research backing:**
- **"Digital Epidemiological Surveillance Using mHealth Data" (Lancet Digital Health, 2021):** Validated the concept that aggregate anonymised vital sign data from mobile tools can detect outbreak clusters before traditional surveillance systems.

### 23–26. (Clinician View, Coaching, Programme Context, Language Expansion)

Engineering + prompt design. Groq LLaMA-3.3-70B and Qwen-Plus support all target languages natively.

---

## Hardware Extensions ⚙️

### 27. Bluetooth Pulse Oximeter Pairing

**Standard:** W3C Web Bluetooth API (Chrome 56+, Android)  
**Research:** Wellue O2Ring, Nonin WristOx — validated Bluetooth medical devices with public BLE GATT profiles.

### 28. Thermal Camera (USB-C)

**Standard:** W3C Web USB API  
**Device:** FLIR Lepton 3.5 — $79 module, USB-C compatible, 160×120 thermal at 8.6 Hz  
**Research:** Multiple published clinical studies confirm skin temperature measurement from thermal cameras is a valid fever screening proxy (sensitivity ~84%, specificity ~91% at 37.5°C threshold — PLOS ONE meta-analysis).

### 29. Wearable HRV Baseline

**Devices:** Garmin Health SDK (public), Apple HealthKit (iOS), Fitbit Web API  
**Research:** "The superiority of personalised HRV baselines over population norms for stress detection" — published in *Frontiers in Psychology* (2022).

---

## Summary Table — Research Strength by Feature

| Feature | Evidence Level | Key Reference | Honest Limitation |
|---|---|---|---|
| SpO2 Proxy | Strong | IEEE EMBC 2023, ReViSe arXiv | Not reliable below 90% SpO2 |
| AFib Flag | Strong | JMIR FibriCheck, NIH meta-analysis | False positives from ectopic beats |
| Anemia Screening | Strong | PLOS ONE 2024, AUC 0.90–0.92 | Lighting standardisation required |
| Jaundice Screening | Strong | BiliScreen (UW), UCL scleral study | Threshold detector, not quantitative |
| Blood Pressure (PTT) | Moderate | ReViSe arXiv, Frontiers 2023 | MAE 6–10 mmHg, needs calibration |
| BMI / Malnutrition | Moderate | SinBMI AAAI, SAM App ISRCTN | Full-body photo, posture dependent |
| Respiratory Distress | Protocol-based | WHO IMCI, Sepsis-3 JAMA 2016 | Already clinically validated protocol |
| Pediatric Mode | Protocol-based | WHO IMCI, AHA PALS | Reference ranges are WHO-published |
| Longitudinal AI | Emerging | Critical Care Med 2021 | Requires 3+ scans per patient |
| Population Anomaly | Emerging | Lancet Digital Health 2021 | Requires data aggregation pipeline |

---

## The Five Strongest Unbuilt Features (For Pitch)

1. **Anemia screening** — AUC 0.90+, WHO IMCI aligned, unique in community health apps
2. **AFib flag** — >90% sensitivity/specificity, validated in clinical trials, immediate referral value
3. **SpO2 proxy** — MAE ~1.6–2%, feasible in existing rPPG pipeline, no new hardware
4. **Jaundice screening** — Clinically validated (BiliScreen, neoSCB), neonatal + adult use cases
5. **Longitudinal risk scoring** — No other CHW tool does this, high differentiation for the pitch

---

*All references are publicly accessible via nih.gov (PubMed), arxiv.org, frontiersin.org, jmir.org, plos.org, and university research portals as cited.*
