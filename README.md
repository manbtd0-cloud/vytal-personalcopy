# 🩺 Vytal (Vital)
### Camera-Based Vitals Screening & AI Triage Platform

> **P@SHA ICT Awards & Hackathon Submission**
>
> **Theme:** Healthcare, Community Health Triage & AI Technology

---

## 🔗 Repository

**GitHub:** https://github.com/Ahmad-Ali-Shah/Vital

---

# Executive Summary

Millions of people living in rural and underserved communities lack access to basic medical equipment such as pulse oximeters, ECG devices, and blood pressure monitors. Community Health Workers (CHWs) are often the first—and sometimes only—healthcare providers available, yet they must make critical decisions with limited diagnostic tools.

Research shows that **40–60% of rural patients requiring follow-up care never complete referrals**, leading to delayed treatment and preventable complications.

**Vytal** addresses these challenges by transforming an ordinary smartphone into a research-backed AI health screening device.

Using **remote Photoplethysmography (rPPG)** and **contact PPG**, Vytal estimates vital signs directly from a smartphone or webcam camera, reports an honest reading uncertainty (±bpm margin), provides multilingual guidance, performs signal processing locally, and maintains a protected patient-to-referral care loop when connected to its secure backend.

The platform is designed specifically for:

- Rural health clinics & Community Health Workers (CHWs)
- NGO medical camps & Mobile healthcare units
- Disaster relief operations & Low-resource triage
- Areas with limited internet connectivity

---

# Key Features

## 🔬 Dual-Mode Camera-Based Vital Screening

Vytal supports two independent, research-grounded scanning methods to maximize compatibility across devices and environments.

### 👤 Face Scan Mode (rPPG)

Uses **remote Photoplethysmography (rPPG)** to estimate vital signs by tracking subtle, pulse-induced skin color variations captured by the front camera.

- **MediaPipe Face Mesh**: Precise facial ROI tracking excluding eyes/mouth.
- **Dynamic Face Oval Guide**: Real-time position guidance and alignment detection.
- **CHROM (de Haan & Jeanne, 2013) & POS (Wang et al., 2016)**: Dual-plane skin tone projection algorithms.
- **Goertzel Frequency Transform**: Efficient spectral estimation with parabolic sub-BPM peak interpolation.
- **Live Pulse Waveform**: Real-time canvas rendering of the smoothed BVP pulse wave.

---

### 👆 Fingertip + Flash Mode (Contact PPG)

For environments with poor lighting or unsupported front cameras, users place their fingertip directly over the camera lens and LED flash.

- **Continuous 30 FPS Sampling**: Tissue absorption detection ($R > B$ blue light absorption check) ensures zero dropped frames, preserving temporal interval accuracy.
- **Inverted Green Channel PPG (Gudi et al., 2020)**: Evaluates direct inverted green absorbance ($detrend(-g)$) alongside POS/CHROM for gold-standard contact PPG pulse signal extraction.
- **Camera Stabilization Locks**: Automatically locks camera track constraints (`torch`, `exposureMode`, `whiteBalanceMode`, `focusMode`) to prevent gain/exposure oscillation during finger contact.

---

## 🎯 Honest Uncertainty & Camera Quality Engine

Rather than displaying a "black-box" number, Vytal computes a transparent error margin ($\pm N\text{ bpm}$) and camera quality grade grounded in empirical rPPG literature:

- **Camera Hardware Diagnostics**: Reads `track.getCapabilities()` and `track.getSettings()` for FPS, resolution, sensor tier, and LED torch availability.
- **Real-Time Environment Sensing**: Detects overexposure (>215 average pixel brightness), lighting flicker, and fast head/finger motion via inter-frame variance analysis.
- **Uncertainty Margin Badge**: Displays an honest $\pm\text{bpm}$ margin on every reading; flags unusable signals when uncertainty exceeds the 8 bpm blind-guess floor.

---

## 🧠 AI Clinical Assistant

Converts technical metrics into clear, empathetic health guidance.

- **Server-side AI providers**: Alibaba Cloud DashScope (Qwen) or Groq, selected behind a protected Supabase Edge Function; provider keys never enter browser code.
- **Capabilities**: Plain-language explanations, clinical risk flagging, follow-up advice.
- **Offline Rule Engine**: Automatic fallback to local clinical decision rules when offline.

---

## 🌍 Multilingual Support

Supported languages:
- 🇬🇧 English | 🇵🇰 Urdu (اردو) | 🇦🇫 Pashto (پښتو) | 🇵🇰 Sindhi (سنڌي) | 🇸🇦 Arabic (العربية)

## 🧪 Extended Clinical Screening Proxies

- **Anemia proxy:** landmark-tracked conjunctival capture with a low-confidence `UNKNOWN` result instead of false reassurance.
- **Jaundice proxy:** ambient-corrected scleral yellow-index capture with explicit retry handling.
- **SpO₂ and rhythm proxies:** quality-gated camera estimates that require approved-device/ECG confirmation.
- **BMI/malnutrition proxy:** face-scale anthropometric estimate; not a substitute for measured height and weight.
- **Blood-pressure trend:** available only with explicit owner-scoped calibration; no uncalibrated 120/80 value is fabricated.
- **Age-aware alert policy:** unifies pulse, breathing, SpO₂, rhythm, anemia, jaundice, BMI, pregnancy, and programme context into a review tier.

---

## 🔐 Secure Dynamic Database & Accounts

- **Supabase Auth + PostgreSQL RLS**: Profile, contact, emergency contact, screening, vital,
  invoice, and donation rows are restricted to their authenticated owner inside the database.
- **Consent-First Patient Register**: Each person receives an owner-scoped patient code. A new
  screening cannot begin until an active consent record is linked to the selected patient.
- **Closed-Loop Referrals**: Flagged screenings automatically enter a tracked workflow from flagged,
  referred, contacted, and appointment booked through completion. Status changes also create an
  append-only audit event that browser clients cannot edit or delete.
- **Extensible Vital Schema**: New measurements are stored as metric observations, so the model can
  add SpO2, blood-pressure trends, anemia/jaundice proxies, BMI, temperature, or future metrics without
  hardcoding new patient columns.
- **No Persistent PHI in Browser Storage**: Unconfigured preview mode is memory-only. Production
  health records use the protected database instead of `localStorage`.
- **QR Code Referral Reports**: Generates printable single-page reports with embedded record QR codes.

## 💳 Billing & Donations

- Server-owned account products, account-linked invoices, and donation history.
- Stripe-hosted Checkout boundary: card data never enters VYTAL.
- Signed, retry-safe webhook processing validates stored amount/currency and controls paid/failed
  status and receipt URLs.
- Per-account limits protect payment and AI endpoints from request abuse.
- Provider adapter boundary ready for separately approved JazzCash or Easypaisa merchant integration.

## ⚡ Backend Performance

- Bounded newest-first patient, referral, screening, invoice, and donation queries.
- Composite/partial PostgreSQL indexes matched to clinical and referral access paths.
- One-query referral/patient loading and an atomic Stripe webhook state transition.
- Reused Edge Function clients, bounded request bodies, idempotency, and indexed rate-limit cleanup.
- Complexity decisions and production measurement guidance are documented in
  [docs/PERFORMANCE_OPTIMIZATION.md](./docs/PERFORMANCE_OPTIMIZATION.md).

## 🎓 Computer Science Architecture

VYTAL now demonstrates OOP/SOLID and design patterns, streaming data structures, referral graph and
heap algorithms, resilient HTTP and Realtime WebSocket behavior, Web Worker/TypedArray/bitmask memory
concepts, and normalized transactional database design with cursor pagination. The implementation map,
complexities, tests, and honest limitations are in
[docs/COMPUTER_SCIENCE_ARCHITECTURE.md](./docs/COMPUTER_SCIENCE_ARCHITECTURE.md).

---

# 📐 Signal Processing Pipeline

```
            User Camera Input
                   │
      ┌────────────┴────────────┐
      ▼                         ▼
   Face Mode              Fingertip Mode
 (MediaPipe ROI)        (Tissue Abs. R > B)
      │                         │
      └────────────┬────────────┘
                   ▼
      Uniform 30 Hz Resampling
                   ▼
  Multi-Channel Extraction & Selection
   ├─ CHROM (de Haan & Jeanne, 2013)
   ├─ POS (Wang et al., 2016)
   └─ Inverted Green PPG (Gudi et al., 2020)
                   ▼
   Hann-Weighted Bandpass Filter (0.5–4.0 Hz)
                   ▼
  Goertzel Spectrum + Parabolic Interpolation
   └─ Sub-Harmonic Rejection (HR / 2 Check)
                   ▼
    Stabilisation: EMA + Trimmed Mean + SNR Weighting
                   ▼
   Sub-Sample Peak Timing ──► RMSSD & Stress Index
                   ▼
   Camera Assessment & Honest Uncertainty (±N bpm)
                   ▼
   Multilingual AI Triage & Printable Referral
```

---

# 🔬 Scientific Foundations & References

1. **De Haan, G., & Jeanne, V. (2013)**. *Robust pulse rate from chrominance-based rPPG*. IEEE TBME.
2. **Wang, W. et al. (2016)**. *Algorithmic principles of remote PPG*. IEEE TBME.
3. **Gudi, A., Bittner, M., & van Gemert, J. (2020)**. *Real-time Webcam Heart-Rate and Variability Estimation with Clean Ground Truth*. MDPI Applied Sciences.
4. **Malik, M. et al. (1996)**. *Heart rate variability: Standards of measurement, physiological interpretation, and clinical use*. European Heart Journal.
5. **McDuff, D. et al. (2020)**. *rPPG benchmarking under compression and ambient lighting*. IEEE EMBC.

---

# 🛠️ Technology Stack

| Category | Technologies |
|-----------|--------------|
| Frontend | React 18, Vite |
| Styling | CSS3, Apple Health-inspired clinical design system |
| Computer Vision | HTML5 Canvas API, MediaPipe Tasks Vision |
| Signal Processing | CHROM, POS, Inverted Green PPG, Goertzel Transform, Bandpass Filter |
| Uncertainty Engine | Heuristic Error Estimation, Hardware Capabilities API |
| AI Models | Qwen or Groq behind a Supabase Edge Function; local rules offline |
| Database & Auth | Supabase Auth, PostgreSQL, Row-Level Security |
| Payments | Stripe Checkout + signed Edge Function webhooks |
| Reports | QR Code (`qrcode`), `@media print` CSS |

---

# 🚀 Getting Started

## Installation

```bash
git clone https://github.com/Ahmad-Ali-Shah/Vital.git
cd Vital
npm install --ignore-scripts
npm run security:check
npm run dev
```

Open: `http://localhost:5173`

For production database, patient/referral workflow, AI proxy, and payment setup, follow [SECURITY.md](./SECURITY.md). Only
`VITE_SUPABASE_URL` and `VITE_SUPABASE_PUBLISHABLE_KEY` belong in the browser environment.
The full backend task map and test procedure are in
[docs/BACKEND_IMPLEMENTATION.md](./docs/BACKEND_IMPLEMENTATION.md).
Backend data-structure, query, time, and space optimizations are in
[docs/PERFORMANCE_OPTIMIZATION.md](./docs/PERFORMANCE_OPTIMIZATION.md).
This includes performance budgets, a bounded load-test harness, request tracing, centralized errors,
query-plan assertions and concurrency tests.
The complete university-concept mapping is in
[docs/COMPUTER_SCIENCE_ARCHITECTURE.md](./docs/COMPUTER_SCIENCE_ARCHITECTURE.md).
The reconciled clinical/security status and known limitations are in
[VYTAL_BABY_BOSS_STATUS.md](./VYTAL_BABY_BOSS_STATUS.md).

## Production Build

```bash
npm run build
npm run preview
```

---

# 👥 Team

- **Ahmad Ali Shah**: AI, Signal Processing & Backend Architect
- **Muhammad Ahmad**: Frontend Engineer & UI/UX Integration
- **Laiba**: Cloud Architecture & Database Systems

---

# ⚠️ Disclaimer

Vytal is a clinical decision-support and screening prototype. It is **not** a certified medical device. Final clinical evaluations must always be performed by qualified healthcare professionals.
