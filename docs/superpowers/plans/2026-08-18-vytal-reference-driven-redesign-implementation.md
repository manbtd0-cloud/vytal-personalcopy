# Vytal Reference-Driven Public Experience — Canonical Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: use `superpowers:executing-plans` for inline execution or `superpowers:subagent-driven-development` for delegated execution. Follow TDD and verification gates task-by-task.

**Goal:** Rebuild Vytal’s public experience into a reference-quality interactive health-sensing documentary that preserves the strongest qualities of the Save a Child’s Heart 25th-anniversary experience—cinematic pacing, semantic motion, page specialization, irregular editorial composition, human/media rhythm, longitudinal storytelling, and strong conversion closes—while using original Vytal branding, truthful medical content, the Vytal-native Signal Thread system, and production-sized empty media frames wherever final imagery is not yet available.

**Execution base:** `b444173f299f5e2022e53890363e77af877e5246` (last green public-site implementation)

**Do not base execution on:** `93be2495f300d6d9f412d10b87fd2ecf0e5905bf` (RED-only unfinished Screenings test commit)

**Architecture:** Preserve the existing lazy public/clinical split. Build shared public-system primitives first, replace Home in visually reviewed batches, then implement each supporting route as a genuinely different narrative mode. GSAP remains the single animation runtime. Missing media is represented by final-geometry `MediaFrame` placeholders; proof is never fabricated to fill reference-shaped layouts.

**Tech stack:** React 18, React Router 6, Vite 5, GSAP 3, `@gsap/react`, CSS/SVG, existing reviewed ReactBits source forks, Vitest 3, Testing Library, jsdom.

## Required companion documents

Read these before executing tasks:

1. `docs/superpowers/specs/2026-08-18-vytal-reference-driven-public-site-design.md`
2. `docs/superpowers/specs/2026-08-18-vytal-sach25-reference-crosswalk.md`
3. `docs/superpowers/specs/2026-08-18-vytal-reference-driven-route-blueprints.md`
4. `docs/superpowers/specs/2026-08-18-vytal-motion-reactbits-system.md`
5. `docs/superpowers/specs/2026-08-18-vytal-media-slot-manifest.md`
6. `docs/superpowers/specs/2026-08-18-vytal-content-evidence-rules.md`
7. `docs/superpowers/plans/2026-08-18-vytal-reference-redesign-architecture.md`
8. `docs/superpowers/plans/2026-08-18-vytal-reference-home-execution.md`
9. `docs/superpowers/plans/2026-08-18-vytal-reference-supporting-routes.md`
10. `docs/superpowers/plans/2026-08-18-vytal-reference-qa-performance.md`

---

# 0. Locked implementation decisions

These are no longer implementation-time forks.

## 0.1 Animation runtime

Use only:

- `gsap`
- `@gsap/react`
- GSAP `ScrollTrigger`
- CSS transitions/keyframes for trivial states

Do not add:

- Motion / Framer Motion
- Lenis
- Three.js
- OGL
- Locomotive Scroll
- face-api.js for marketing decoration
- a cursor library
- a shader/particle library

## 0.2 ReactBits decisions

### Keep/adapt existing reviewed forks where useful

- Split Text
- Magnet
- Scroll Reveal
- Card Swap only if final Product/UI composition still benefits
- Pixel Transition only if final raw→explained composition still benefits

### Do not use ReactBits Scroll Velocity
Its current source imports `motion/react`; build a custom GSAP/CSS `LoopBand` instead.

### Do not use ReactBits Count Up
Its current source imports `motion/react`; build a small GSAP `NumberReveal` utility instead.

### Do not use ReactBits Masonry for the Home documentary run
Although its current source is GSAP-only, the reference-inspired media run requires deterministic art-directed placement. Use explicit CSS Grid.

### Do not base architecture on

- Scroll Stack
- Scanner
- Grid Scan
- Dark Veil
- generic particles/galaxy/hyperspeed effects
- Spotlight-card grids as the dominant page language

ReactBits is an implementation toolkit, not the art director.

## 0.3 Route-transition decision

Do **not** build a speculative full-screen custom page-transition wipe in the baseline redesign. Exact reference-site page transitions were not verified. Implement reliable scroll restoration and subtle nav/theme continuity only. A route wipe may be reconsidered after all pages are visually approved, but it is not part of this plan.

## 0.4 Media-layout decision

The Home documentary image run uses a custom 12-column CSS grid with explicit placements. No generic masonry engine.

## 0.5 Public vs clinical boundary

Public redesign may be cinematic. These remain clinically restrained and outside visual redesign scope:

- `/scan`
- `/dashboard`
- `/report`

Public styles/GSAP work must not leak into those routes.

## 0.6 Medical/proof honesty

Never fabricate:

- patients
- testimonials
- clinician quotes
- hospitals
- partner logos
- countries deployed
- user/adoption numbers
- accuracy percentages
- diagnoses/outcomes
- lives saved

Use:

- verified product facts
- primary research
- clearly labelled illustrative scenarios
- production-shaped empty proof/media slots

---

# 1. Final task sequence

```text
01 Green execution worktree
02 Public facts + claim guardrails
03 Central reduced-motion hook
04 Complete media-slot registry + MediaFrame
05 Signal Thread system
06 Section theming + public nav/footer rebuild
07 Custom LoopBand + GSAP NumberReveal
08 Home Hero + Access thesis
09 Home Proof field + Science teaser              → VISUAL GATE A
10 Impact scenario data + StoryOverlay
11 Home Context stories + Signal Journey          → VISUAL GATE B
12 Home Signal band + Documentary media run
13 Home Trust reset + Evidence + Language band
14 Home Platform arc + Concrete value + Final CTA → VISUAL GATE C
15 Remove superseded old Home compositions
16 Expand public route tree
17 Screenings capability atlas
18 Science timeline/exhibition
19 Impact story archive
20 About mission/principles page
21 Illustrative Journey case-study page
22 Platform fragments-to-context page
23 Privacy + Medical Disclaimer + 404             → VISUAL GATE D
24 Public scroll restoration / continuity
25 Responsive + keyboard + reduced-motion hardening
26 Performance + bundle hardening
27 Content/evidence/license cleanup
28 Fresh final verification and handoff
```

---

# Phase 0 — Establish a trustworthy baseline

## Task 1: Create isolated redesign worktree from the last green code

**Files changed:** none initially.

- [ ] Create worktree:

```bash
git worktree add ../vytal-reference-redesign -b landing-page-reference-redesign b444173f299f5e2022e53890363e77af877e5246
cd ../vytal-reference-redesign
```

- [ ] Confirm HEAD:

```bash
git rev-parse HEAD
git log -1 --oneline
```

Expected: `b444173f...`.

- [ ] Install dependencies:

```bash
npm install
```

- [ ] Run fresh baseline tests/build:

```bash
npm test
npm run build
```

Expected: zero failing tests, build exit 0.

- [ ] Record baseline Vite chunk output for comparison in **Task 26**.

Record at least:

- shared/main JS
- clinical route/main chunk
- PublicSite JS
- PublicSite CSS

- [ ] Bring current design/plan docs into the execution branch without importing RED-only production changes.

Preferred method: cherry-pick docs-only commits or copy only `docs/` paths.

- [ ] Commit documentation if needed:

```bash
git add docs/
git commit -m "docs: add reference-driven redesign specification"
```

---

# Phase 1 — Truth and reusable public-system foundation

## Task 2: Centralize verifiable public facts and add claim guardrails

**Create:**
- `src/public/content/siteFacts.js`
- `tests/public/site-facts.test.js`
- `tests/public/content-claims.test.js`

**Modify:**
- `src/public/content/home.js`

### RED

Create `tests/public/site-facts.test.js` asserting:

```js
expect(getSiteFacts().languageCount).toBe(SUPPORTED_LANGUAGES.length)
expect(getSiteFacts().coreScreeningCount)
  .toBe(screenings.filter((item) => item.status === 'Core').length)
expect(getSiteFacts().qualityFactorCount).toBe(4)
```

Run:

```bash
npx vitest run tests/public/site-facts.test.js
```

Expected: fail because `siteFacts.js` does not exist.

### GREEN

Implement:

```js
import { SUPPORTED_LANGUAGES } from '../../lib/ai.js'
import { screenings } from './screenings.js'

export const QUALITY_FACTORS = ['Motion', 'Lighting', 'Signal quality', 'Confidence']

export function getSiteFacts() {
  return {
    languageCount: SUPPORTED_LANGUAGES.length,
    coreScreeningCount: screenings.filter((item) => item.status === 'Core').length,
    qualityFactorCount: QUALITY_FACTORS.length,
  }
}
```

Create a limited claim scanner over public content using prohibited patterns such as:

```js
/medical[- ]grade/i
/replaces? (a |your )?doctor/i
/replaces? (a |your )?cuff/i
/replaces? (an |your )?ecg/i
/diagnoses? (you|patients|disease)/i
/used in \d+ countries/i
/trusted by \d+/i
/saves? lives/i
```

Do not prohibit the word `diagnosis` itself because legitimate disclaimers say `not diagnosis`.

Verify:

```bash
npx vitest run tests/public/site-facts.test.js tests/public/content-claims.test.js
npm test
npm run build
```

Commit:

```bash
git add src/public/content tests/public/site-facts.test.js tests/public/content-claims.test.js
git commit -m "feat(public-content): centralize facts and claim guardrails"
```

---

## Task 3: Centralize reduced-motion behavior before motion-aware primitives

**Create:**
- `src/public/hooks/useReducedMotion.js`
- `tests/public/reduced-motion.test.jsx`

**Modify incrementally:**
- existing public ReactBits adapters that currently create their own persistent reduced-motion listener.

### RED

Test a probe component against mocked `window.matchMedia` with `matches: true` and `false`.

Run:

```bash
npx vitest run tests/public/reduced-motion.test.jsx
```

Expected: fail because hook does not exist.

### GREEN

Implement one hook that:

- reads `(prefers-reduced-motion: reduce)`;
- returns current boolean;
- subscribes to `change`;
- removes listener on unmount.

Then migrate `Magnet`, `SplitText`, `ScrollReveal`, `CardSwap`, `PixelTransition` only where behavior remains equivalent.

Verify:

```bash
npx vitest run tests/public/reduced-motion.test.jsx tests/public/reactbits-primitives.test.jsx
npm test
npm run build
```

Commit:

```bash
git add src/public/hooks src/public/components/reactbits tests/public/reduced-motion.test.jsx
git commit -m "refactor(public-motion): centralize reduced-motion state"
```

---

## Task 4: Implement the complete media-slot registry and production-shaped `MediaFrame`

**Create:**
- `src/public/content/mediaSlots.js`
- `src/public/components/system/MediaFrame.jsx`
- `src/public/styles/media-frame.css`
- `tests/public/media-slots.test.js`
- `tests/public/media-frame.test.jsx`

**Modify:** public style import entry (`PublicSite.jsx` or current public style aggregator).

### Required contract

Every slot in `2026-08-18-vytal-media-slot-manifest.md` must exist immediately, even without assets.

`tests/public/media-slots.test.js` must contain the complete required ID array from `2026-08-18-vytal-reference-redesign-architecture.md` and assert every ID exists in `mediaSlots`.

This includes all Home, Screenings, Science, Impact, About, Journey and Platform slots—not a partial starter set.

### RED

`media-frame.test.jsx` asserts:

- placeholder emits `data-media-slot`;
- placeholder emits `data-media-status="placeholder"`;
- no `<img>`/`<video>` exists when source is null;
- real image source renders correct alt/src;
- ratio data/style remains present.

Run:

```bash
npx vitest run tests/public/media-slots.test.js tests/public/media-frame.test.jsx
```

Expected: fail.

### GREEN

Implement a canonical slot helper:

```js
const slot = (id, kind, ratio, desiredContent, extra = {}) => ({
  id,
  kind,
  ratio,
  src: null,
  poster: null,
  alt: '',
  caption: '',
  objectPosition: '50% 50%',
  reveal: 'fade',
  parallax: false,
  priority: 'low',
  status: 'placeholder',
  desiredContent,
  rights: 'pending',
  ...extra,
})
```

`MediaFrame` uses `useReducedMotion()` from Task 3 and:

- preserves aspect ratio when empty;
- renders a quiet neutral surface, not shimmer;
- renders image/video when source exists;
- disables parallax/auto-motion under reduced motion;
- uses eager/high priority only for hero media;
- emits stable slot/status data attributes.

Verify:

```bash
npx vitest run tests/public/media-slots.test.js tests/public/media-frame.test.jsx
npm test
npm run build
```

Commit:

```bash
git add src/public/content/mediaSlots.js src/public/components/system/MediaFrame.jsx src/public/styles/media-frame.css tests/public/media-slots.test.js tests/public/media-frame.test.jsx
git commit -m "feat(public-system): add production media placeholders"
```

---

## Task 5: Build the deterministic Vytal Signal Thread system

**Create:**
- `src/public/components/system/SignalThread.jsx`
- `SignalMarker.jsx`
- `SpectralSamples.jsx`
- `RoiFrame.jsx`
- `src/public/styles/signal-thread.css`
- `tests/public/signal-thread.test.jsx`

### States

- `raw`
- `lock`
- `trusted`
- `context`
- `timeline`
- `network`
- `divider`

Tones:

- coral
- amber
- mint
- ivory
- ink

### RED

Assert:

```js
[data-signal-thread]
data-signal-variant="raw"
aria-hidden="true" // when decorative
```

Rerender trusted variant and assert state changes.

### GREEN

Use deterministic fixed sample coordinates—never `Math.random()`.

Use SVG path/stroke + small DOM/SVG sample points. The path must not look like a literal ECG trace.

Under reduced motion, render final semantic state immediately.

Verify:

```bash
npx vitest run tests/public/signal-thread.test.jsx
npm test
npm run build
```

Commit:

```bash
git add src/public/components/system src/public/styles/signal-thread.css tests/public/signal-thread.test.jsx
git commit -m "feat(public-system): add Vytal Signal Thread"
```

---

## Task 6: Add section themes and rebuild public nav/footer into editorial shell

**Create:**
- `src/public/components/system/SectionThemeBoundary.jsx`
- `src/public/hooks/useSectionTheme.js`
- `tests/public/public-nav-theme.test.jsx`

**Modify:**
- `PublicNav.jsx`
- `PublicFooter.jsx`
- `PublicLayout.jsx`
- public layout CSS

### Requirements

Desktop nav:

- fixed transparent over hero;
- no permanent SaaS pill container;
- Vytal left;
- Screenings / Science / Impact / About;
- Start Screening distinct;
- transitions text/logo treatment over dark/light/coral/media sections;
- after scroll may gain subtle blur/background, not oversized card shell.

Mobile:

- full-screen/near-full-screen editorial menu;
- body scroll lock;
- Escape closes;
- focus-safe;
- Start Screening visible.

Footer:

- mission statement;
- routes;
- Start Screening;
- Privacy;
- Medical Disclaimer;
- `Screening support, not diagnosis.`;
- no fake social/newsletter links.

### Verification

```bash
npx vitest run tests/public/public-nav.test.jsx tests/public/public-nav-theme.test.jsx
npm test
npm run build
```

Commit:

```bash
git add src/public/PublicLayout.jsx src/public/components/PublicNav.jsx src/public/components/PublicFooter.jsx src/public/components/system/SectionThemeBoundary.jsx src/public/hooks/useSectionTheme.js src/public/styles tests/public/public-nav-theme.test.jsx
git commit -m "feat(public-shell): build editorial themed navigation"
```

---

## Task 7: Build custom GSAP `LoopBand` and `NumberReveal`

**Create:**
- `src/public/components/system/LoopBand.jsx`
- `VisuallyHiddenList.jsx`
- `NumberReveal.jsx`
- associated CSS
- `tests/public/loop-band.test.jsx`
- `tests/public/number-reveal.test.jsx`

### Locked decision

Do not copy ReactBits Scroll Velocity or Count Up because both currently depend on Motion. Recreate only the useful interaction grammar with existing GSAP/CSS.

### LoopBand contract

```jsx
<LoopBand
  items={items}
  direction="left"
  speed={0.8}
  ariaLabel="Vytal screening areas"
  renderItem={(item) => <span>{item.label}</span>}
/>
```

Accessibility:

- exactly one semantic list for assistive tech;
- visual duplicate tracks `aria-hidden="true"`;
- no repeated AT reading;
- reduced motion renders static wrapped/scrollable sequence.

Implementation:

- measure one visual sequence with `ResizeObserver`;
- GSAP moves a track continuously;
- duplicate only enough content to cover seam;
- pause/stop under reduced motion;
- cleanup tween and observer.

### NumberReveal

Small GSAP enhancement:

- DOM contains final numeric value for fallback/accessibility;
- on first viewport entry animate an object value from start to end with GSAP;
- update text using formatter;
- reduced motion immediately shows final value;
- animate once.

### Verify

```bash
npx vitest run tests/public/loop-band.test.jsx tests/public/number-reveal.test.jsx
npm test
npm run build
```

Commit:

```bash
git add src/public/components/system src/public/styles tests/public/loop-band.test.jsx tests/public/number-reveal.test.jsx
git commit -m "feat(public-system): add semantic motion bands and facts"
```

---

# Phase 2 — Home: Gate A

## Task 8: Rebuild Home opening as cinematic Hero + sparse Access thesis

**Create:**
- `home-reference/HeroMediaChapter.jsx`
- `home-reference/AccessThesisChapter.jsx`
- `src/public/styles/home-reference.css`
- `tests/public/home-reference-structure.test.jsx`

**Modify:**
- `LandingPage.jsx`
- `home.js`

### Hero

Use:

- `HOME-HERO-01` full-viewport MediaFrame;
- `SignalThread variant="raw"`;
- intrigue copy `There’s more here than you can see.`;
- secondary `Your camera sees it.`;
- small scroll cue;
- no large feature paragraph above fold.

### Access thesis

Large sparse statement:

`A useful first health signal should not have to wait for perfect access.`

No card grid.

### RED/GREEN

Test required chapter attributes and hero media slot.

Verify:

```bash
npx vitest run tests/public/home-reference-structure.test.jsx tests/public/landing-page.test.jsx
npm test
npm run build
```

Commit:

```bash
git add src/public/components/home-reference src/public/pages/LandingPage.jsx src/public/content/home.js src/public/styles/home-reference.css tests/public
git commit -m "feat(home): rebuild cinematic opening chapters"
```

---

## Task 9: Add verified Proof field and sourced Science lineage teaser

**Create:**
- `ProofFieldChapter.jsx`
- `ScienceLineageChapter.jsx`
- `src/public/content/science.js`

**Modify:** Home page/style/test.

### Proof field

Use only derived facts:

- supported language count;
- core screening count;
- quality-factor count;
- one ordinary-camera concept as editorial copy.

Any world/access visual says:

`Designed for reach — not a deployment map.`

Use custom `NumberReveal` from Task 7.

### Science milestones

Initial verified research timeline:

- **2008** Verkruysse, Svaasand & Nelson — remote plethysmographic imaging under ambient light / consumer camera. Primary URL: `https://opg.optica.org/oe/fulltext.cfm?uri=oe-16-26-21434`
- **2010** Poh, McDuff & Picard — non-contact automated pulse measurement from video with blind source separation. URL: `https://opg.optica.org/oe/fulltext.cfm?uri=oe-18-10-10762`
- **2013** de Haan & Jeanne — chrominance-based robust rPPG. URL: `https://doi.org/10.1109/TBME.2013.2266196`
- **2016** Moço, Stuijk & de Haan — motion-robust PPG imaging/color mapping. URL: `https://doi.org/10.1364/BOE.7.001737`
- **2017** Wang et al. — algorithmic principles of remote PPG. URL: `https://doi.org/10.1109/TBME.2016.2609282`
- **2019** Gudi et al. — efficient real-time camera heart-rate and variability estimation. URL: `https://openaccess.thecvf.com/content_ICCVW_2019/html/CVPM/Gudi_Efficient_Real-Time_Camera_Based_Estimation_of_Heart_Rate_and_Its_ICCVW_2019_paper.html`

Add **2026 / Vytal prototype** as a separate internal milestone with `sourceType: 'internal'`; do not imply peer-reviewed publication.

Home shows a compact selected subset; `/science` later shows full exhibition.

### Verify

```bash
npx vitest run tests/public/home-reference-structure.test.jsx tests/public/site-facts.test.js
npm test
npm run build
```

Commit, then perform **VISUAL GATE A** from QA companion at 390 / 768 / 1440 / 1920.

Do not proceed if hero/shell/proof grammar still feels like a normal SaaS landing page.

---

# Phase 3 — Home: Gate B

## Task 10: Create six illustrative Impact scenarios and reusable accessible StoryOverlay

**Create:**
- `src/public/content/impact.js`
- `src/public/components/system/StoryOverlay.jsx`
- `tests/public/story-overlay.test.jsx`

Scenario IDs:

1. `individual-home`
2. `community-health-worker`
3. `low-connectivity`
4. `multilingual-explanation`
5. `longitudinal-follow-up`
6. `referral-continuity`

Every scenario:

- `label: 'Illustrative scenario'`
- `isIllustrative: true`
- no person name
- no fake diagnosis/outcome/quote
- 3 media slot IDs
- context, friction, workflow, limitation.

Overlay requirements:

- `role="dialog"`;
- focus trap;
- Escape close;
- body scroll lock;
- focus returns to originating trigger;
- prev/next support;
- full-screen sheet mobile.

Verify focused test/full suite/build. Commit.

---

## Task 11: Build Home Context stories + four-beat Signal Journey

**Create:**
- `ContextStoriesChapter.jsx`
- `SignalJourneyChapter.jsx`

**Modify:** Home/style/order test.

Context previews are deliberately nonuniform and each visibly says `Illustrative scenario`.

Signal Journey replaces old four-card process geometry with four different compositions:

- CAPTURE
- EXTRACT
- VERIFY
- EXPLAIN

Use exact media slots from manifest.

Desktop may add short sticky/pinned enhancements only after static layout works. Skip pinning under <1024px and reduced motion.

Verify and perform **VISUAL GATE B**.

---

# Phase 4 — Complete Home: Gate C

## Task 12: Add semantic screening band and art-directed documentary media run

**Create:**
- `SignalMarqueeChapter.jsx`
- `DocumentaryRunChapter.jsx`

Signal band items derive from canonical screenings and preserve research/core distinction.

Use custom `LoopBand`, not ReactBits Scroll Velocity.

Documentary run renders all:

- `HOME-MEDIA-01` … `HOME-MEDIA-10`

Use explicit 12-column CSS placement from Home execution companion. Mobile becomes intentional one/two-column sequence.

Do not use Masonry.

Verify tests/full build. Commit.

---

## Task 13: Add ivory Trust reset, Evidence/Voices composition and supported-language band

**Create:**
- `TrustResetChapter.jsx`
- `EvidenceVoicesChapter.jsx`
- `LanguageBandChapter.jsx`
- `tests/public/home-trust-evidence.test.jsx`

Trust:

`Sometimes the right result is no result.`

Two quality paths:

- `MOVEMENT → SIGNAL LOST → RETRY`
- `STABLE INPUT → SIGNAL LOCK → SCREENING CONTEXT`

Evidence slots:

- clinician/researcher voice pending;
- health-worker voice pending;
- sourced research evidence note;
- Vytal-owned principle.

Never put generated testimonial prose in pending quote slots.

Language band derives directly from `SUPPORTED_LANGUAGES` and uses custom LoopBand in a visibly different speed/typographic treatment from screening band.

Verify and commit.

---

## Task 14: Complete Home with platform evolution, concrete value units and final entry

**Create:**
- `PlatformArcChapter.jsx`
- `ConcreteValueChapter.jsx`
- `FinalEntryChapter.jsx`

Platform beats:

1. CAMERA FIRST
2. CONFIDENCE AWARE
3. CONTEXT OVER TIME
4. BEYOND CAMERA — visibly `Research / future direction`

Concrete units:

- 01 Scan
- 02 Result
- 03 Explanation
- 04 History
- 05 Handoff

No fake performance metrics.

Final CTA:

- `See what your camera can tell you.`
- Start Screening → `/scan`
- Explore Screenings → `/screenings`
- concise screening-not-diagnosis line.

Full Home chapter-order test must now equal the exact 14-chapter order defined in Home execution companion.

Verify, commit, then run **VISUAL GATE C** across 360 / 430 / 768 / 1024 / 1440 / 1920.

---

## Task 15: Remove superseded old Home implementation only after Gate C approval

Search imports before deletion:

```bash
rg -n "CameraScienceSection|ProcessSection|ProductProofSection|ScreeningEcosystemSection|TrustSection|AiExplanationSection|LongitudinalSection|ImpactSection|SciencePreviewSection|FutureVisionSection|FinalCtaSection" src tests
```

Delete only no-longer-imported old Home files/CSS.

Retain ReactBits adapters still used anywhere.

Run:

```bash
npm test
npm run build
```

Commit cleanup separately.

---

# Phase 5 — Supporting routes with distinct physical modes

## Task 16: Expand PublicSite routing

Add/lazy-load:

- `/screenings`
- `/science`
- `/impact`
- `/about`
- `/journey`
- `/platform`
- `/privacy`
- `/medical-disclaimer`

Keep public `*` 404.

Create `tests/public/public-routing-expanded.test.jsx` asserting each route’s unique H1/premise.

Clinical routes continue to be tested separately.

Commit route skeletons only after full tests/build pass.

---

## Task 17: Build `/screenings` as capability atlas

**Create:** route-specific components/CSS/test defined in supporting-route companion.

Physical mode: precise editorial atlas, not equal cards.

Sections:

1. hero
2. category navigator
3. Core physiological — largest treatment
4. Research/experimental — irregular treatment
5. Context/triage — text-led
6. Future integrations — distinct future field
7. `What Vytal does not claim`
8. product/science CTA.

Every item renders canonical status, input, method/looks-for, output, limitation, confirmation.

No status may be hidden behind hover.

Verify `screenings-page.test.jsx`, claim test, full suite, build. Commit.

---

## Task 18: Build `/science` as irregular sourced timeline/exhibition

**Create:** ScienceHero, ScienceTimeline, ScienceMilestone, ScienceResearchBranches, WhatWeDoNotClaim, ValidationRoadmap, science CSS/test.

Use verified 2008/2010/2013/2016/2017/2019 milestones plus separate 2026 internal Vytal milestone.

Physical rules:

- Signal Thread becomes long timeline rail;
- milestone weight controls geometry (`minor`, `major`, `feature`);
- no equal card map;
- mobile becomes one-side vertical rail;
- no unresolved year markers;
- primary citations visible/linked;
- research literature ≠ validation of Vytal implementation.

Mandatory chapters:

- measurement problem
- camera/ROI
- signal extraction
- motion/lighting
- beat timing/variability
- screening research branches
- uncertainty
- current implementation truth
- What We Do Not Claim
- validation roadmap
- references.

Verify test/full suite/build. Commit.

---

## Task 19: Build `/impact` as illustrative context/story archive

**Create:** ImpactHero, ImpactScenarioTile, ImpactScenarioArchive, ImpactWorkflowBand, impact CSS/test.

Use Task-10 scenarios.

Physical mode:

- human/context-heavy nonuniform archive;
- same-page StoryOverlay;
- 2–4 media slots per detailed story;
- clear Illustrative Scenario label;
- `SCREEN / SAVE / EXPLAIN / REFER` rhythm band;
- no fake names/quotes/outcomes.

Verify overlay + route tests/full build. Commit.

---

## Task 20: Build `/about` as shorter mission/principles page

Create content/components/CSS/test.

H1 concept:

`Make sophisticated screening easier to reach—and harder to overclaim.`

Four principles, rendered at different visual weights rather than equal cards:

- Accessible
- Evidence-aware
- Honest about uncertainty
- Human-understandable

Team/project frames remain empty until real assets exist.

No fake partners, office, careers, corporate biography filler.

End with route action directory.

Verify and commit.

---

## Task 21: Build `/journey` as one illustrative case-study spine

Mandatory top label:

`ILLUSTRATIVE SCREENING JOURNEY — NOT A REAL PATIENT CASE`

Beat order:

1. context
2. low-confidence first scan
3. signal lock on retry
4. example result
5. explanation
6. saved history
7. illustrative trend
8. verified facts band
9. final CTA.

The key dramatic event is **honest failure**: Vytal asks for a repeat before showing a result.

All sample metrics/graphs visibly say `EXAMPLE READING` / `ILLUSTRATIVE TREND`.

Verify order/disclaimer test/full build. Commit.

---

## Task 22: Build `/platform` as fragments-to-context metaphor

Fragment IDs:

- camera
- BLE
- wearable
- thermal
- records
- language
- referral
- population

Each has explicit current/prototype/future/research status.

Desktop starts visually scattered; Signal Thread `network` connects fragments as scroll progresses. Mobile uses ordered normal flow.

No literal mosaic tiles.

Headline:

`One signal is a fragment. Context makes the picture.`

Final chapter returns to current product + Science.

Verify test/full build. Commit.

---

## Task 23: Finalize Privacy, Medical Disclaimer and public 404

Legal/trust routes are deliberately plain and readable.

Privacy copy must reflect actual code/data flow only; do not promise backend/cloud properties that are not implemented.

Medical Disclaimer must state:

- screening/research support, not diagnosis;
- experimental pathways exist;
- low-confidence limitations;
- validated clinical confirmation can be necessary;
- urgent/concerning symptoms override app reassurance.

Run legal test + expanded route tests + full suite/build.

Then perform **VISUAL GATE D** on all public routes at 390 / 768 / 1440, plus 1920 for Home/Science/Platform.

---

# Phase 6 — Continuity, accessibility and performance

## Task 24: Add reliable public scroll restoration and subtle continuity only

**No custom full-screen route wipe in this plan.**

Implement a small `usePublicScrollRestoration` or `useLocation()` effect in `PublicLayout` that resets scroll on public pathname changes.

Test by mocking `window.scrollTo`.

Nav/theme changes may transition softly, but route navigation must not be delayed.

`/scan` entry remains immediate.

Verify routing + full build. Commit.

---

## Task 25: Complete responsive, keyboard and reduced-motion hardening

Manual viewport matrix:

- 360×800
- 390×844
- 430×932
- 768×1024
- 1024×768
- 1280×800
- 1440×900
- 1920×1080

Fix concrete defects only, with regression tests.

Required behavior:

- giant typography clamps correctly;
- media stays full bleed where intended;
- mobile timelines use one rail;
- pinned/sticky sequences become normal flow on mobile/reduced motion;
- StoryOverlay is full-screen mobile;
- LoopBands stop and become readable static rows under reduced motion;
- Magnet disabled on coarse pointer;
- no hover-only meaning;
- no page-level horizontal overflow;
- menu Escape/focus behavior works;
- status never relies on color alone.

Run full tests/build after fixes. Commit.

---

## Task 26: Performance and bundle hardening against Task-1 baseline

Run:

```bash
npm run build
npm ls three ogl framer-motion motion lenis face-api.js 2>/dev/null || true
```

Expected: none of those new public dependencies have been added.

Compare:

- Public Home chunk
- each lazy public route
- shared/main
- clinical bundle

Target: public landing JS roughly under 100 kB gzip beyond shared React/router code where practical. A breach requires documented visible benefit.

Runtime checks:

- Home → Science → Impact → Home repeatedly;
- ScrollTrigger count must not monotonically grow;
- GSAP tweens killed on unmount;
- offscreen videos pause/lazy-load as appropriate;
- no runaway RAF loops;
- loops duplicate minimal DOM;
- hero only high-priority media;
- below-fold media lazy.

Measured fixes priority:

1. remove unused component/adaptation;
2. lazy-load route-specific code;
3. simplify low-value motion;
4. reduce loop DOM duplication;
5. optimize media.

Run full tests/build and commit performance work.

---

## Task 27: Final content/evidence/license cleanup

Run:

```bash
rg -n "medical-grade|replaces your doctor|replaces a doctor|saves lives|trusted by|used in [0-9]+ countries" src/public
rg -n "ILLUSTRATIVE|EXAMPLE READING|Research / future direction|Future integration" src/public
rg -n "YYYY|TBD|TODO|lorem ipsum" src/public
```

Review every hit manually.

Requirements:

- no unresolved scientific dates;
- no fabricated proof;
- all future integrations visibly labelled;
- all illustrative scenarios labelled;
- all sample metrics labelled;
- all Science milestones carry actual citation URLs;
- no unused ReactBits adapters remain;
- `THIRD_PARTY_NOTICES.md` describes only retained copied source.

Search imports before deleting components.

Run full tests/build. Commit cleanup.

---

# Phase 7 — Fresh final verification

## Task 28: Verify completion from scratch and prepare handoff

No success claim until this task is freshly executed.

Run:

```bash
npm test
npm run build
git diff --check
git status --short
```

Expected:

- zero failed tests;
- production build exit 0;
- no whitespace errors;
- clean working tree.

Then run final manual Visual Gate D and clinical regression:

- `/`
- `/screenings`
- `/science`
- `/impact`
- `/about`
- `/journey`
- `/platform`
- `/privacy`
- `/medical-disclaimer`
- `/scan`
- `/dashboard`
- `/report`

Verify public nav/motion never leaks into clinical pages.

Compare implementation scope:

```bash
git diff --stat b444173f299f5e2022e53890363e77af877e5246...HEAD
git log --oneline b444173f299f5e2022e53890363e77af877e5246..HEAD
```

Final handoff must state:

- routes built;
- visual gates passed;
- tests/build evidence;
- public/clinical bundle sizes;
- all still-empty media slot IDs or asset groups;
- which content is real, sourced, illustrative or future/research;
- any real photography/quotes intentionally still pending.

Do not call empty media/story slots “complete content.”

---

# Final acceptance standard

This redesign is accepted only when all of the following are true:

1. Home no longer reads as a sequence of uniform SaaS product sections.
2. The public experience carries reference-like cinematic/editorial pacing and deliberate quiet sections.
3. The Signal Thread is a recognizable Vytal-native semantic system across multiple routes without becoming an ECG clone.
4. Media placeholders occupy real production geometry and the site still feels intentionally composed while they are empty.
5. Screenings visibly distinguishes core, research, contextual and future maturity.
6. Science is sourced, irregular and explicit about validation limits.
7. Impact/Journey never fabricate a patient or outcome.
8. Platform never presents future hardware as current production support.
9. Supporting routes have distinct narrative physics rather than reusing Home layouts.
10. ReactBits remains a source of selected useful mechanics, not the site’s visual identity.
11. Mobile and reduced-motion versions are deliberately designed, not merely desktop collapsed vertically.
12. Public motion/dependencies do not contaminate clinical app performance or styling.
13. Fresh final tests pass and production build succeeds.
