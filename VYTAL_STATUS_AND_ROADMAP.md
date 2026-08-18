# Vytal — Status & Roadmap

**Branch:** `vytal-final-version`
**Last updated:** 2026-08-12
**Source of truth:** `VYTAL_FULL_AUDIT_AND_OPTIMIZATION.md` (18-module research-to-code audit against the 29-file research dossier) + this session's P0 fix pass.

This doc has three parts:
1. [What's done](#1-whats-done) — the P0 fixes shipped this session, commit `dd40030`.
2. [What's left](#2-whats-left) — the P1–P4 algorithm work from the audit, not yet started.
3. [UI polish — animation & scroll](#3-ui-polish--animation--scroll-no-layout-changes) — a scoped list of motion/scroll enhancements that touch **only** transitions/animations, not layout, structure, or visual design.

---

## 1. What's done

Commit `dd40030` on `vytal-final-version` (pushed). Five P0 bugs identified by the audit, all fixed and build-verified (`npm run build` passes clean).

### 1.1 `rppg.js` — `beatTimesMs` never left `analyzeSignal()`
**Was:** `detectBeatsWithSubsampleTiming()` computed real beat-peak timestamps internally (used for RMSSD/stress), but the array was never included in `analyzeSignal()`'s return object. `ScanPage.jsx` read `analysis.beatTimesMs || []`, which was always `[]`.
**Impact:** `afib.js::checkIrregularRhythm()` always received an empty array and always short-circuited to `"Regular Rhythm" / "Insufficient beat data"` — AFib screening was silently a no-op for every single scan, regardless of the actual rhythm.
**Fix:** Added `beatTimesMs` to the return object. AFib screening now runs on real beat-interval data.

### 1.2 `ai.js` — hardcoded Groq API key
**Was:** `const groqKey = apiKey || import.meta.env.VITE_GROQ_API_KEY || 'gsk_...'` — a live key baked in as a fallback, shipped to every client and committed to git history.
**Fix:** Removed the hardcoded fallback. Missing key now correctly falls through to `generateOfflineExplanation()` (the existing rule-based multilingual fallback) instead of silently working off a shared secret.
**Added:** `.env.example` documenting `VITE_GROQ_API_KEY` / `VITE_DASHSCOPE_API_KEY`.
**⚠️ Still needs action:** the exposed key is in git history permanently unless history is rewritten. **Rotate it in the Groq console.**

### 1.3 `cloudSync.js` — false-positive sync state
**Was:** `if (response.ok || response.status === 404 || response.status === 502)` marked records `synced: true` — and the `catch` block for network failures *also* marked everything synced ("fallback sync behavior"). Every code path ended in `synced: true`, so a record could silently never reach the backend while the UI reported it as safely synced.
**Fix:** Only a genuine 2xx response sets `synced: true`. 404/502/exceptions now return `{ success: false }` and leave records queued for the next retry — the queue is now honest about what has and hasn't actually reached Alibaba Cloud.

### 1.4 `ScanPage.jsx` — fixed pixel-box ROIs for anemia/jaundice
**Was:** Both capture paths used a hardcoded `{ x: 50, y: 50, w: 200, h: 100 }` screen-position box regardless of where the user's face/eye actually was — meaningless the moment framing, distance, or device orientation varied from whatever position that box was tuned for.
**Fix:** Added `getScleraRoi()` and `getConjunctivaRoi()`, both built from MediaPipe FaceLandmarker eye-contour landmarks (`RIGHT_EYE_INDICES`, the same landmarker already running for the forehead rPPG ROI — no new model load). ROI now tracks the actual eye position/size every frame. Falls back to the old fixed box only if no face was ever detected during the 4s capture window (better than a hard failure).

### 1.5 `ScanPage.jsx` / `bloodPressurePTT.js` — fabricated PTT reading
**Was:** `estimateBloodPressurePTT(215)` — a hardcoded constant fed in as if it were a measured pulse transit time, on every single BP(PTT) scan, regardless of what was actually captured.
**Fix:** Routed to `estimateBloodPressurePTT(null)`, which triggers the function's own existing honest fallback (`"Normal Baseline (Uncalibrated)"` with a note that real PTT capture is required). Updated the mode's UI hint text to say "Experimental — uncalibrated baseline" instead of implying a real reading is happening.
**Why not "properly" fixed:** true PTT requires **simultaneous** face + finger signals (or an ECG/wearable reference). This app has one rear camera and captures sequentially — a "two-phase" sequential capture can't stay phase-locked to the same cardiac cycle across the multi-second gap where the user physically repositions their finger, so it can't produce a scientifically valid PTT value. This needs a real architecture decision (see §2.6), not a line fix.

---

## 2. What's left (as of round 2 — see §5 for round 3, which closed out most of this table)

| # | Module | Status after round 3 |
|---|---|---|
| P1 | `rppg.js` (core engine) | **Partially done.** Added Kubios-style adaptive IBI outlier rejection (§5). Did NOT touch the core CHROM/POS motion-suppression pipeline itself — too risky to rewrite blind with no way to test against a live signal in this sandbox. Still needed: Gudi 2020 NLMS motion suppression, two-stage bandpass. |
| P1 | `spo2.js` | **Done** (§5) — red/green channels, skin-tone-tiered caution threshold. |
| P1 | `bleOximeter.js` | **Done** (§5) — correct SFLOAT decoder for both SpO2 and pulse rate. |
| P2 | `afib.js` | **Done** (§5) — Poincaré SD1/SD2 + sample entropy, 2-of-3 evidence vote. |
| P2 | `anemia.js` | **Done** (§5) — continuous erythema-index signal, low-confidence gate (from round 2). |
| P2 | `jaundice.js` | **Done** (§5) — gray-world ambient-light correction (documented substitute for BiliScreen's literal two-shot method — see §5 for why). |
| P2 | `bloodPressurePTT.js` | **Done, reframed** (§5) — real single-site crest-time measurement + per-user localStorage calibration. No longer claims to measure PTT at all (renamed the whole mental model — see §5 for why true PTT stays out of scope). |
| P3 | `uncertainty.js` | **Done** (§5) — Fitzpatrick-correlated ITA skin-tone tier wired into the uncertainty widening. |
| P3 | `populationAnomaly.js` | **Done** (§5) — EWMA moving baseline replacing the fixed 15% stub. |
| P4 | Validation | **Still not started** — bench protocols + a 90-day validation sprint plan need real-world data collection, not something buildable in this sandbox. |
| — | BMI mode | **Done** (§5) — was fully fabricated (hardcoded inputs), now a real face-width-based anthropometric measurement. |

### 2.6 On the PTT problem specifically
See §5 for what was actually built. True two-site PTT remains out of scope — still needs one of:
- **Dual-stream capture:** request `facingMode: 'user'` and `facingMode: 'environment'` simultaneously via `getUserMedia`. Works on some devices/browsers, not all — needs real device testing, not something verifiable in this sandbox.
- What was actually built instead: single-site PPG crest-time + per-user calibration (§5) — a different, honestly-labeled metric, not a PTT substitute.

---

## 3. UI polish — animation & scroll (no layout changes)

Scope constraint for this section: **no changes to layout, component structure, colors, copy, or existing visual design** — only transition/animation/scroll-behavior additions layered on top of what's already there. `src/index.css` already has a `prefers-reduced-motion` block (lines 83–85) — every item below must respect it.

### 3.1 Page-level transitions
- [ ] Fade/slide-in on route change (Scan → Dashboard → Report) — currently instant cut. A ~150–200ms opacity+translateY matching the existing `fade-in-down` pattern (already used for the language dropdown, `index.css:1339`) would extend a pattern that already exists rather than introducing a new one.
- [ ] Persist scroll position per route on back-navigation (currently resets to top every time).

### 3.2 Scan flow (`ScanPage.jsx`)
- [ ] Smooth cross-fade between `scanState` values (`idle → analyzing → done/error`) instead of the current instant swap — the DOM already re-renders conditionally on `scanState`, this is a CSS transition on the existing conditional blocks, not a restructure.
- [ ] Results panel: stagger-in the readout fields (`READOUT_FIELDS`) instead of all appearing at once — e.g. 40ms delay per field, reusing existing card styling.
- [ ] Numeric count-up animation for `hr`/`br`/`stress` values when a scan completes (0 → final value over ~600ms) — a common pattern for vitals dashboards, purely a JS interval + existing number display, no markup change.
- [ ] Waveform canvas (`drawWaveform`) already redraws every frame — could add a subtle trailing-fade on the stroke (lower alpha on older points) for a "live scope" feel without touching layout.

### 3.3 Dashboard / Report (`DashboardPage.jsx`, `ReportPage.jsx`)
- [ ] Scroll-triggered fade-up for record list items as they enter viewport (`IntersectionObserver`, no library needed) — currently all render at once with no entrance animation.
- [ ] Smooth height transition when expanding/collapsing a record's detail view, if one exists — check current implementation before assuming this applies.
- [ ] Sticky header shadow-on-scroll (subtle `box-shadow` fade-in past scroll threshold 0) for `NavBar.jsx` — a common, low-risk pattern that improves scannability without changing the nav's structure.

### 3.4 Micro-interactions
- [ ] Button press feedback: the existing `transition: transform 0.15s ease` (index.css:192, 715) covers hover — could extend to an `:active` scale-down (0.97) for tactile press feedback, reusing the same transition property already declared.
- [ ] Mode selector (`MODES` pills in `ScanPage.jsx`): animate the active-state indicator sliding between pills rather than an instant class swap, if it isn't already doing this — verify current behavior first.

### 3.5 Explicitly out of scope for this pass
- Any change to color palette, spacing, typography, or component hierarchy.
- Any new dependency (framer-motion, GSAP, etc.) unless explicitly requested — everything above is achievable with CSS transitions/`@keyframes` and vanilla `IntersectionObserver`, consistent with the codebase's current zero-animation-library approach.
- Rewriting the splash animation (`SplashAnimation.jsx`) — it's already a dedicated, working component.

---

## Suggested order of work
1. §2.6 PTT calibration input (unblocks the most misleading remaining feature — right now it just shows a flat baseline).
2. §2 P1 items (`spo2.js`, `bleOximeter.js` SFLOAT decoder) — both are clear, scoped, single-file fixes once the research dossier is re-derived or the optimization package is re-supplied.
3. §3 UI polish — independent of the algorithm work above, can be done in parallel by a frontend-focused pass without touching `src/lib/`.

---

## 4. Round 2 — bug fixes from local testing (commit `b5978fc`)

Found from screenshots of a local run: the black-screen-after-scan issue, a false "Severe Anemia" result on a non-anemic user, and requests for a live eye-position guide + voice guidance during capture.

**Fixed:**
- **Black circle after every scan** — root cause: `stopStream()` stops camera tracks but never clears `video.srcObject`, so the video element goes solid black once the stream ends. This affects *every* mode, not just anemia/jaundice — it just wasn't visible in face/BP screenshots since those were captured mid-scan. Now the last real frame is captured as a freeze-frame and shown (dimmed, so it reads as "done" not "live") instead of black.
- **The actual "5s of nothing happening"** — the `initializing` state was rendering an empty `<video>` with zero placeholder text or feedback for however long `getUserMedia` takes. Added a spinner + "Starting camera…" so that wait is visible instead of looking frozen.
- **False "Severe Anemia Risk" on a non-anemic user** — `anemia.js` had no confidence gate: an ROI with too few pink-hue pixels (e.g. capturing normal under-eye skin instead of actual pulled-down conjunctiva) fell through to the Hb regression's low-ratio default, which reports the *worst possible* result (Hb 5.0, URGENT REFERRAL) instead of flagging an unreliable capture. Now returns "Low Confidence — Retry Scan" below a minimum valid-pixel threshold, and pixels need a saturation floor to count as tissue at all (filters out shadow/hair/background inside the ROI).
- **Live eye-tracking guide for anemia/jaundice** — previously only static hint text, no visual guide (face-scan/BP modes had a face-oval, these didn't). Added a landmark-tracked overlay box that follows the eye in real time and turns solid green when detected.
- **Voice guidance during capture** — anemia/jaundice/BMI modes now speak their positioning hint aloud (Web Speech API, reusing the existing Listen-button infra) when the scan starts, instead of relying only on on-screen text.

**Still open / not fully solved:**
- [ ] **Anemia accuracy is a mitigation, not a fix.** The confidence gate reduces *false severe* results but doesn't solve the core issue: the app has no way to verify the user actually pulled their eyelid down vs. just showing normal under-eye skin. A real fix needs the Suner 2021/erythema-index method (§2, P2 row) — that's an algorithm change, not a threshold tweak.
- [ ] **BMI/Malnutrition mode needs the same interactive treatment** — right now it has a hint + voice guidance like anemia/jaundice, but no live visual guide (no equivalent of the eye-guide box) for shoulder-to-height framing. Would need a landmark-based body/shoulder-width guide box, similar approach to `videoRoiToContainerPercent` but keyed off shoulder/torso landmarks instead of eye landmarks — MediaPipe FaceLandmarker alone doesn't give body landmarks, so this would need MediaPipe Pose (a second model) or an approximation from face-landmark scale + frame position. Bigger lift than the eye-guide was.
- [ ] **Jaundice mode's underlying algorithm** — untouched this round (was reported as giving reasonable results), still only "Research-aligned MVP" per the original audit (§2) — the BiliScreen two-shot ambient-light-subtracted method is still the recommended upgrade.
- [ ] **Verify on-device** — none of this round's fixes could be visually confirmed (no headless browser in this sandbox); confirmed only via code tracing + `npm run build`. Needs a real local run to check the eye-guide actually tracks correctly and the freeze-frame doesn't look jarring.

---

## 5. Round 3 — cleared almost the entire P1-P4 table (commits `1fdfbd8`..`26bff9b`)

Worked through the whole remaining audit list. Every item is either done or has an explicit, honest reason it's still open — nothing was silently skipped.

**Done, high confidence (well-documented, standard techniques):**
- `bleOximeter.js` — correct IEEE-11073-20601 SFLOAT decoder. The old code called `DataView.getFloat16`, which doesn't exist as a native method in any browser — it silently fell through to reading one raw byte. Fixed for both SpO2 and pulse rate (pulse rate had the same bug, wasn't even using the fallback path).
- `afib.js` — added Poincaré SD1/SD2 geometry and sample entropy as two more independent signals alongside the existing RMSSD/pNN50 check, combined as a 2-of-3 evidence vote instead of one brittle AND.
- `uncertainty.js` — `inferSkinToneTier()` via Individual Typology Angle (ITA), a real dermatological method (sRGB → linear → XYZ → Lab → ITA), wired into the uncertainty widening as a ~2x/1.35x multiplier for dark/medium skin tones.
- `populationAnomaly.js` — EWMA moving baseline (CDC EARS-style, lambda=0.3) replacing the fixed 15% constant, computed from the app's own historical daily flag rates, with a labeled provisional fallback for <2 days of data.
- `rppg.js` — Kubios-style adaptive local-median IBI outlier rejection layered on top of the existing fixed-range filter.

**Done, but re-derived rather than reproducing the exact cited papers (that data isn't available in this project — see each module's honesty note in the code):**
- `spo2.js` — switched red/blue → red/green channels (standard pairing in camera-SpO2 literature). Added skin-tone caution thresholds instead of fabricating corrected calibration coefficients I have no validation data for.
- `anemia.js` — replaced the fixed hue-window pixel classifier with a continuous erythema index (log-reflectance gap between green/red channels). Documented as a general dermatological technique, not the exact Suner 2021/Zhao 2024 fitted coefficients.
- `jaundice.js` — gray-world color-constancy correction as a documented, deployable substitute for BiliScreen's literal two-shot flash-difference method (which needs a torch — the front camera used for jaundice capture doesn't have one).
- `bloodPressurePTT.js` — completely reframed. Was asked to fix "PTT" but true PTT needs simultaneous two-site capture, which stays architecturally out of reach (see §2.6). Instead built what's actually measurable: single-site PPG crest time (`rppg.js::computeCrestTimeMs`) plus real localStorage-backed per-user calibration (enter one real cuff reading, it's paired with that session's crest time as your baseline). No longer pretends to measure PTT at all — the function, docs, and UI copy were all renamed to reflect what it actually is.
- **BMI mode** — turned out to be worse than "no visual guide": `estimateMalnutritionBMI(0.24, 165)` was hardcoded on every single call, so this mode never measured anything, ever. Fixed using the FaceLandmarker already loaded for every other mode (face bounding-box width → anthropometric shoulder-width estimate → real per-scan ratio), deliberately without adding an untested second pose-detection model. Added the live tracking guide box too.

**Explicitly still not done, with reasons:**
- `rppg.js` core CHROM/POS motion-suppression rewrite (Gudi 2020 NLMS filter, two-stage bandpass) — the highest-risk item in the whole list. This is the module everything else depends on (HR/BR/stress/AFib all read from its output), and there is no way to test a rewrite against a live camera signal in this sandbox. Modifying it blind risked silently breaking a currently-working, carefully-tuned system for a benefit I couldn't verify. Only the IBI post-processing stage (isolated, low-risk) was touched.
- True two-site PTT — still architecturally blocked, see §2.6.
- P4 validation/bench protocols — needs real-world data collection, not buildable in a sandbox.
- **On-device verification** — same caveat as round 2: none of this was visually confirmed, only build-checked. This is now three rounds of changes across every `src/lib/` module without a single real camera test. Strongly recommend a full manual pass through every scan mode before treating any of this as production-ready.

