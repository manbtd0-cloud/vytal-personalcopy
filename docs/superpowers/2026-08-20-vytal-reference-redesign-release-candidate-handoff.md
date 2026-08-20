# Vytal Reference-Driven Redesign — Release Candidate Handoff

**Date:** 2026-08-20  
**Branch:** `landing-page-reference-redesign`  
**PR:** #2 — `Reference-driven Vytal public redesign` (draft)  
**Implementation baseline:** `b444173f299f5e2022e53890363e77af877e5246`

This handoff records only evidence established in the repository, fresh CI, and rendered browser captures. Empty production media slots are documented as placeholders rather than described as finished content.

---

## 1. Implementation status

The reference-driven public redesign is implemented across the planned public route tree:

- `/`
- `/screenings`
- `/science`
- `/impact`
- `/about`
- `/journey`
- `/platform`
- `/privacy`
- `/medical-disclaimer`
- public branded 404

Clinical routes remain outside the redesign surface and route independently:

- `/scan`
- `/dashboard`
- `/report`

### Home retirement / Task 15

The staged legacy Home has been retired. `LandingPage.jsx` renders only the approved H01–H14 reference-driven chapter sequence.

Removed with the legacy Home:

- old `src/public/components/home/` implementation tree;
- old Home-only CSS files;
- old Home-only tests;
- unused ReactBits `CardSwap`, `Magnet`, `PixelTransition`, and `SpotlightCard` adapters.

Retained ReactBits source is limited to:

- `ScrollReveal.jsx`
- `SplitText.jsx`

`THIRD_PARTY_NOTICES.md` and the automated license inventory test match that retained set.

---

## 2. Automated verification

Fresh verification after Task-15 retirement, skip-link hardening, and visual-review completion is green:

- test files: **34 passed / 34**
- tests: **74 passed / 74**
- production build: **passed**
- transformed modules: **222**
- `git diff --check`: **passed**
- clean working tree check: **passed**

The Task-15 regression guard verifies that Home contains exactly the 14 approved direct chapters in canonical order. A dedicated skip-link style regression also verifies that the public skip link remains off-canvas until keyboard focus.

### Current bundle output

| Output | Raw | Gzip |
|---|---:|---:|
| PublicSite JS | 187.10 kB | **67.44 kB** |
| PublicSite CSS | 66.81 kB | **12.24 kB** |
| Shared/entry JS (`index`) | 412.38 kB | **136.48 kB** |
| Shared/entry CSS (`index`) | 22.47 kB | **5.19 kB** |

Lazy public route JS gzip sizes:

- Privacy: 1.32 kB
- Medical Disclaimer: 1.34 kB
- Impact: 1.78 kB
- About: 2.16 kB
- Screenings: 2.08 kB
- Platform: 2.41 kB
- Journey: 2.63 kB
- Science: 2.94 kB

### Task-15 bundle improvement

Immediately before legacy Home retirement, the verified build reported:

- PublicSite JS: 218.66 kB / 75.43 kB gzip
- PublicSite CSS: 112.51 kB / 20.39 kB gzip

Current post-retirement build:

- PublicSite JS: 187.10 kB / 67.44 kB gzip
- PublicSite CSS: 66.81 kB / 12.24 kB gzip

The cleanup therefore removed roughly **7.99 kB gzip JS** and **8.15 kB gzip CSS** from the public bundle while leaving the shared/clinical entry effectively unchanged.

---

## 3. Content / evidence state

Automated evidence guards pass for:

- prohibited medical/marketing claim phrases;
- unresolved `YYYY`, `TBD`, `TODO`, and lorem-ipsum placeholders in public JS/JSX;
- retained third-party source inventory.

The implemented content model deliberately separates:

- sourced research history;
- Vytal internal/prototype facts;
- illustrative scenarios/examples;
- research/experimental directions;
- future integrations.

Impact and Journey remain explicitly illustrative rather than fabricated patient evidence. Platform and screening surfaces preserve maturity/status language for non-current capabilities. Science distinguishes external literature from the internal Vytal prototype milestone.

---

## 4. Media/content still awaiting real assets

The canonical media manifest contains **103 planned production media slots**. At this release-candidate stage they inherit `src: null` and `status: placeholder`; empty frames are intentional production geometry, not finished media content.

Important outstanding real-asset categories include:

- Home hero and documentary photography/video;
- clinician/researcher portrait and real permissioned quote;
- community-health-worker portrait and real permissioned quote;
- Impact scenario photography;
- About origin/team/research photography;
- real Science/product demonstration video where eventually used;
- Journey product demonstration footage;
- final permission/rights resolution for non-original photography.

Original-only diagrams remain specified separately in the manifest and should not be replaced with misleading stock imagery.

---

## 5. Visual acceptance gates

**Status: PASSED for the implemented placeholder-media composition.**

Rendered browser evidence was generated in temporary one-off GitHub Actions workflows and visually reviewed. The workflows were removed after capture so future PR updates do not keep consuming Actions; the completed-run artifacts remain the evidence record.

### Chrome / Chromium final matrix

Completed visual-review run: **Vytal public visual review #5**  
Evidence artifact: `vytal-public-final-visual-review`

The run captured and checked:

- Home at **360, 390, 430, 768, 1024, 1440, 1920**;
- all supporting public routes at **390, 768, 1440**;
- Science and Platform additionally at **1920**;
- Home chapter-entry evidence for Gates A/B at 390 / 768 / 1440 and wide-screen evidence at 1920;
- reduced-motion Home at 390;
- clinical `/scan`, `/dashboard`, `/report` at 390 and 1440.

Objective diagnostics ran across **72 public route/viewport combinations** covering all eight required widths (360 / 390 / 430 / 768 / 1024 / 1280 / 1440 / 1920) and found:

- **0 page-level horizontal-overflow failures**;
- **0 H1-count failures**;
- **0 unexpectedly visible unfocused skip links**;
- no public-navigation leakage into clinical routes.

### Firefox cross-browser pass

Completed visual-review run: **Vytal Firefox visual smoke #1**  
Evidence artifact: `vytal-firefox-visual-smoke`

Firefox rendered every public route at **390 and 1440**, plus clinical routes at both sizes. The Firefox run passed overflow/H1 checks and clinical public-nav isolation, and the rendered screenshots were reviewed against the Chrome composition without finding a browser-specific layout regression.

### Gate decisions

- **Gate A — PASS:** cinematic opening, access thesis, proof field and sourced science lineage reviewed at 390 / 768 / 1440 / 1920.
- **Gate B — PASS:** context stories and signal journey reviewed at 390 / 768 / 1440; mobile remains normal flow rather than scroll-jacked.
- **Gate C — PASS:** complete Home composition reviewed across 360 / 430 / 768 / 1024 / 1440 / 1920, with 390 additionally covered by the final matrix.
- **Gate D — PASS:** supporting public routes reviewed at 390 / 768 / 1440; Home / Science / Platform wide-screen behavior reviewed at 1920.

The placeholder media frames remain visibly intentional and preserve the designed rhythm at each reviewed breakpoint. They are not being counted as finished photography/video.

Keyboard/focus, mobile-menu Escape/focus restoration, reduced-motion mechanics, scroll restoration and related behavioral requirements remain covered by the green regression suite in addition to the rendered review.

---

## 6. Known non-blocking / follow-up items

Fresh `npm install` reports **5 dependency vulnerabilities: 3 moderate, 2 high**. They were not introduced or diagnosed as part of the public redesign work. Do not run a blind breaking `npm audit fix --force`; audit the exact advisories and affected runtime paths before production release.

Vitest output also emits React Router v7 future-flag warnings. They do not fail the current test suite but should be handled during the eventual router upgrade.

The package manifest does not directly include the forbidden marketing-heavy dependencies called out by the QA plan (`three`, `ogl`, `framer-motion`, `motion`, `lenis`, `face-api.js`).

---

## 7. Release-candidate decision

**Automated/code state:** verified green.  
**Task 15 legacy retirement:** complete and regression-guarded.  
**Visual Gates A–D:** passed for the implemented placeholder-media composition.  
**Chrome + Firefox review:** passed at the documented matrices.  
**Public redesign implementation:** complete across the planned route tree.  
**Production-content state:** real media and permissioned voices remain intentionally incomplete.  
**PR state:** keep draft until the project owner decides whether real production assets and the dependency-security review are required before merge.  
**Redesign acceptance:** implementation and visual-system acceptance are complete; remaining work is production-content replacement and release hardening, not unfinished redesign structure.
