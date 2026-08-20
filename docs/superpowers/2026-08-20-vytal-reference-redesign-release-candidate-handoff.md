# Vytal Reference-Driven Redesign — Release Candidate Handoff

**Date:** 2026-08-20  
**Branch:** `landing-page-reference-redesign`  
**PR:** #2 — `Reference-driven Vytal public redesign` (draft)  
**Implementation baseline:** `b444173f299f5e2022e53890363e77af877e5246`

This handoff records only evidence that is present in the repository or in fresh CI. It intentionally does **not** mark manual visual gates as passed without rendered-browser evidence.

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

Clinical routes remain outside the redesign surface and are still routed independently:

- `/scan`
- `/dashboard`
- `/report`

### Home retirement / Task 15

The staged legacy Home has been retired. `LandingPage.jsx` now renders only the approved H01–H14 reference-driven chapter sequence.

Removed with the legacy Home:

- old `src/public/components/home/` implementation tree;
- old Home-only CSS files;
- old Home-only tests;
- unused ReactBits `CardSwap`, `Magnet`, `PixelTransition`, and `SpotlightCard` adapters.

Retained ReactBits source is now limited to:

- `ScrollReveal.jsx`
- `SplitText.jsx`

`THIRD_PARTY_NOTICES.md` and the automated license inventory test match that retained set.

---

## 2. Fresh automated verification

Fresh GitHub Actions verification on commit `1cfc80b66c9fe5b461c6a20c1534ab56c9d6cca1`:

- workflow: `Vytal landing verification`
- run: **#105**
- result: **success**
- test files: **33 passed / 33**
- tests: **73 passed / 73**
- production build: **passed**
- transformed modules: **222**
- `git diff --check`: **passed**
- clean working tree check: **passed**

The Task-15 regression guard also passes and verifies that Home contains exactly the 14 approved direct chapters in canonical order.

### Current bundle output

| Output | Raw | Gzip |
|---|---:|---:|
| PublicSite JS | 187.10 kB | **67.43 kB** |
| PublicSite CSS | 66.22 kB | **12.13 kB** |
| Shared/entry JS (`index`) | 412.38 kB | **136.49 kB** |
| Shared/entry CSS (`index`) | 22.47 kB | **5.19 kB** |

Lazy public route JS gzip sizes:

- Privacy: 1.32 kB
- Medical Disclaimer: 1.34 kB
- Impact: 1.78 kB
- About: 2.17 kB
- Screenings: 2.08 kB
- Platform: 2.42 kB
- Journey: 2.64 kB
- Science: 2.95 kB

### Task-15 bundle improvement

Immediately before legacy Home retirement, the verified build reported:

- PublicSite JS: 218.66 kB / 75.43 kB gzip
- PublicSite CSS: 112.51 kB / 20.39 kB gzip

After retirement:

- PublicSite JS: 187.10 kB / 67.43 kB gzip
- PublicSite CSS: 66.22 kB / 12.13 kB gzip

So the cleanup removed roughly **8.00 kB gzip JS** and **8.26 kB gzip CSS** from the public bundle.

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

**Status: NOT YET VERIFIED / NOT APPROVED.**

No repository evidence was found that records completed rendered-browser approval for Visual Gates A, B, C, or D. The QA plan explicitly requires real-browser visual review; automated unit tests are not a substitute.

The current execution environment cannot fetch/clone the branch into a local browser runtime and no public preview deployment for this branch was available, so this handoff does not claim those gates passed.

Before merge/production acceptance, run the required final visual pass:

- all public routes at 390 / 768 / 1440;
- Home / Science / Platform additionally at 1920;
- Home responsive checks at 360 / 430 / 1024 as specified by Gate C;
- keyboard/focus review;
- reduced-motion review;
- page-level horizontal-overflow review;
- Chrome/Chromium and Firefox minimum final pass;
- clinical `/scan`, `/dashboard`, `/report` visual regression check.

This is the principal remaining acceptance blocker under the approved implementation plan.

---

## 6. Known non-blocking / follow-up items

Fresh `npm install` reports **5 dependency vulnerabilities: 3 moderate, 2 high**. They were not introduced or diagnosed as part of the public redesign work. Do not run a blind breaking `npm audit fix --force`; audit the exact advisories and affected runtime paths before production release.

Vitest output also emits React Router v7 future-flag warnings. They do not fail the current test suite but should be handled during the eventual router upgrade.

The package manifest does not directly include the forbidden marketing-heavy dependencies called out by the QA plan (`three`, `ogl`, `framer-motion`, `motion`, `lenis`, `face-api.js`), but the exact final `npm ls ...` command should still be included in a local release review if strict transitive verification is required.

---

## 7. Release-candidate decision

**Automated/code state:** verified green.  
**Task 15 legacy retirement:** complete and regression-guarded.  
**Public redesign implementation:** present across the planned route tree.  
**PR state:** keep draft until manual visual acceptance is recorded.  
**Production-content state:** media/real quotes remain intentionally incomplete.  
**Final acceptance:** blocked on mandatory real-browser Visual Gates A–D, plus explicit review/acceptance of the dependency-audit findings before production release.
