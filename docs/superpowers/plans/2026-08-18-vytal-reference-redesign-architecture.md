# Vytal Reference-Driven Redesign — Implementation Architecture & File Map

**Plan companion.** This document locks the code boundaries before task-by-task implementation begins.

---

# 1. Starting point

Implementation starts from green commit:

`b444173f299f5e2022e53890363e77af877e5246`

Do **not** start from RED-only commit `93be2495f300d6d9f412d10b87fd2ecf0e5905bf`.

Preserve:

- `src/App.jsx` lazy public/clinical split;
- `/scan`, `/dashboard`, `/report` under `ClinicalLayout`;
- GSAP as the single animation runtime;
- current Vitest/Testing Library harness;
- `src/public/content/screenings.js` as public medical-status truth.

---

# 2. Target public tree

```text
src/public/
├── PublicLayout.jsx
├── PublicSite.jsx
├── components/
│   ├── PublicFooter.jsx
│   ├── PublicNav.jsx
│   ├── StatusChip.jsx
│   ├── system/
│   │   ├── LoopBand.jsx
│   │   ├── MediaFrame.jsx
│   │   ├── RoiFrame.jsx
│   │   ├── SectionThemeBoundary.jsx
│   │   ├── SignalMarker.jsx
│   │   ├── SignalThread.jsx
│   │   ├── SpectralSamples.jsx
│   │   ├── StoryOverlay.jsx
│   │   └── VisuallyHiddenList.jsx
│   ├── home-reference/
│   │   ├── AccessThesisChapter.jsx
│   │   ├── ConcreteValueChapter.jsx
│   │   ├── ContextStoriesChapter.jsx
│   │   ├── DocumentaryRunChapter.jsx
│   │   ├── EvidenceVoicesChapter.jsx
│   │   ├── FinalEntryChapter.jsx
│   │   ├── HeroMediaChapter.jsx
│   │   ├── LanguageBandChapter.jsx
│   │   ├── PlatformArcChapter.jsx
│   │   ├── ProofFieldChapter.jsx
│   │   ├── ScienceLineageChapter.jsx
│   │   ├── SignalJourneyChapter.jsx
│   │   ├── SignalMarqueeChapter.jsx
│   │   └── TrustResetChapter.jsx
│   ├── screenings/
│   │   ├── ScreeningCategoryNav.jsx
│   │   ├── ScreeningEditorialItem.jsx
│   │   ├── ScreeningHero.jsx
│   │   └── ScreeningTruthChapter.jsx
│   ├── science/
│   │   ├── ScienceHero.jsx
│   │   ├── ScienceMilestone.jsx
│   │   ├── ScienceResearchBranches.jsx
│   │   ├── ScienceTimeline.jsx
│   │   ├── ValidationRoadmap.jsx
│   │   └── WhatWeDoNotClaim.jsx
│   ├── impact/
│   │   ├── ImpactHero.jsx
│   │   ├── ImpactScenarioTile.jsx
│   │   ├── ImpactScenarioArchive.jsx
│   │   └── ImpactWorkflowBand.jsx
│   ├── about/
│   │   ├── AboutHero.jsx
│   │   ├── AboutPrinciples.jsx
│   │   └── AboutActionDirectory.jsx
│   ├── journey/
│   │   ├── JourneyHero.jsx
│   │   ├── JourneyQualityBeat.jsx
│   │   ├── JourneyResultBeat.jsx
│   │   └── JourneyTrendBeat.jsx
│   ├── platform/
│   │   ├── PlatformHero.jsx
│   │   ├── PlatformFragment.jsx
│   │   └── PlatformAssembly.jsx
│   └── reactbits/
│       └── existing approved forks + winning ScrollVelocity/CountUp adaptation
├── content/
│   ├── about.js
│   ├── home.js
│   ├── impact.js
│   ├── journey.js
│   ├── mediaSlots.js
│   ├── navigation.js
│   ├── platform.js
│   ├── science.js
│   ├── screenings.js
│   └── siteFacts.js
├── hooks/
│   ├── useReducedMotion.js
│   └── useSectionTheme.js
├── pages/
│   ├── AboutPage.jsx
│   ├── ImpactPage.jsx
│   ├── JourneyPage.jsx
│   ├── LandingPage.jsx
│   ├── MedicalDisclaimerPage.jsx
│   ├── PlatformPage.jsx
│   ├── PrivacyPage.jsx
│   ├── PublicNotFoundPage.jsx
│   ├── SciencePage.jsx
│   └── ScreeningsPage.jsx
└── styles/
    ├── about.css
    ├── home-reference.css
    ├── impact.css
    ├── journey.css
    ├── legal.css
    ├── media-frame.css
    ├── platform.css
    ├── public-layout.css
    ├── public-motion.css
    ├── public-tokens.css
    ├── responsive.css
    ├── science.css
    ├── screenings.css
    └── signal-thread.css
```

Small local subcomponents can remain in their route/chapter file until complexity justifies extraction; do not create one-line files merely to match the tree.

---

# 3. Core interfaces

## 3.1 Reduced motion

```js
export default function useReducedMotion() // boolean
```

Owns the single `matchMedia('(prefers-reduced-motion: reduce)')` subscription pattern used by public JS animation components.

## 3.2 MediaFrame

```jsx
<MediaFrame slot={mediaSlots.HOME_HERO_01} src={optionalOverride} poster={optionalPoster} alt={optionalAlt} />
```

Slot shape:

```js
{
  id: 'HOME-HERO-01',
  kind: 'video',
  ratio: 'viewport',
  src: null,
  poster: null,
  alt: '',
  caption: '',
  objectPosition: '50% 50%',
  reveal: 'wipe-signal',
  parallax: false,
  priority: 'high',
  status: 'placeholder',
  desiredContent: 'Human/device camera-screening moment',
  rights: 'pending'
}
```

Missing source still renders final geometry and `data-media-slot`.

## 3.3 SignalThread

```jsx
<SignalThread
  variant="raw"
  tone="coral"
  direction="horizontal"
  density="normal"
  decorative
/>
```

Conventions:

```text
variant: raw | lock | trusted | context | timeline | network | divider
tone: coral | amber | mint | ivory | ink | auto
direction: horizontal | vertical | path
density: quiet | normal | dense
progress: number 0..1 | undefined
```

## 3.4 SectionThemeBoundary

```jsx
<SectionThemeBoundary theme="light" as="section" id="trust-reset">
  ...
</SectionThemeBoundary>
```

Allowed: `dark`, `light`, `coral`, `media-dark`.

## 3.5 LoopBand

```jsx
<LoopBand
  items={items}
  direction="left"
  speed={0.8}
  ariaLabel="Vytal screening areas"
  renderItem={(item) => <span>{item.label}</span>}
/>
```

One accessible list + hidden visual track(s); reduced motion renders static/wrapped content.

## 3.6 StoryOverlay

```jsx
<StoryOverlay
  open={open}
  scenario={scenario}
  onClose={close}
  onPrevious={previous}
  onNext={next}
/>
```

Dialog semantics, focus trap, Escape, scroll lock, focus restoration, mobile full-screen mode.

---

# 4. Canonical public facts

`siteFacts.js` derives values; it does not duplicate marketing literals.

```js
export function getSiteFacts() {
  return {
    languageCount: SUPPORTED_LANGUAGES.length,
    coreScreeningCount: screenings.filter((item) => item.status === 'Core').length,
    qualityFactorCount: QUALITY_FACTORS.length,
  }
}
```

---

# 5. Media-slot completeness contract

`tests/public/media-slots.test.js` should verify every planned slot exists.

```js
const requiredMediaSlotIds = [
  'HOME-HERO-01','HOME-ACCESS-DETAIL-01','HOME-ACCESS-MAP-01','HOME-SCIENCE-DIAGRAM-01',
  'HOME-STORY-INDIVIDUAL-01','HOME-STORY-INDIVIDUAL-02','HOME-STORY-HEALTHWORKER-01','HOME-STORY-HEALTHWORKER-02','HOME-STORY-CONTINUITY-01','HOME-STORY-CONTINUITY-02',
  'HOME-JOURNEY-CAPTURE-01','HOME-JOURNEY-EXTRACT-01','HOME-JOURNEY-VERIFY-01','HOME-JOURNEY-EXPLAIN-01',
  'HOME-MEDIA-01','HOME-MEDIA-02','HOME-MEDIA-03','HOME-MEDIA-04','HOME-MEDIA-05','HOME-MEDIA-06','HOME-MEDIA-07','HOME-MEDIA-08','HOME-MEDIA-09','HOME-MEDIA-10',
  'HOME-VOICE-CLINICIAN-01','HOME-VOICE-HEALTHWORKER-01','HOME-EVIDENCE-RESEARCH-01','HOME-PRINCIPLE-01',
  'HOME-ARC-CAMERA-01','HOME-ARC-CONFIDENCE-01','HOME-ARC-CONTEXT-01','HOME-ARC-FUTURE-01',
  'SCR-HERO-01','SCR-HR-01','SCR-BR-01','SCR-HRV-01','SCR-SPO2-01','SCR-RHYTHM-01','SCR-ANEMIA-01','SCR-JAUNDICE-01','SCR-BP-01','SCR-BMI-01','SCR-CONTEXT-01','SCR-BLE-01','SCR-THERMAL-01','SCR-WEARABLE-01',
  'SCI-HERO-01','SCI-TIMELINE-PPG-01','SCI-TIMELINE-RPPG-01','SCI-TIMELINE-ROI-01','SCI-TIMELINE-MOTION-01','SCI-TIMELINE-IBI-01','SCI-TIMELINE-UNCERTAINTY-01','SCI-VIDEO-01','SCI-VIDEO-02','SCI-RESEARCH-BRANCHES-01','SCI-RESEARCH-BRANCHES-02','SCI-RESEARCH-BRANCHES-03','SCI-RESEARCH-BRANCHES-04','SCI-RESEARCH-BRANCHES-05','SCI-RESEARCH-BRANCHES-06','SCI-VALIDATION-01',
  'IMP-HOME-01','IMP-HOME-02','IMP-HOME-03','IMP-CHW-01','IMP-CHW-02','IMP-CHW-03','IMP-OFFLINE-01','IMP-OFFLINE-02','IMP-OFFLINE-03','IMP-LANG-01','IMP-LANG-02','IMP-LANG-03','IMP-LONG-01','IMP-LONG-02','IMP-LONG-03','IMP-REFERRAL-01','IMP-REFERRAL-02','IMP-REFERRAL-03',
  'ABOUT-HERO-01','ABOUT-ORIGIN-01','ABOUT-TEAM-01','ABOUT-TEAM-02','ABOUT-RESEARCH-01',
  'JRN-HERO-01','JRN-CONTEXT-01','JRN-FAIL-01','JRN-LOCK-01','JRN-RESULT-01','JRN-EXPLAIN-01','JRN-HISTORY-01','JRN-TREND-01','JRN-CLOSE-01',
  'PLT-FRAG-CAMERA-01','PLT-FRAG-BLE-01','PLT-FRAG-WEARABLE-01','PLT-FRAG-THERMAL-01','PLT-FRAG-RECORD-01','PLT-FRAG-LANGUAGE-01','PLT-FRAG-REFERRAL-01','PLT-FRAG-POPULATION-01','PLT-ASSEMBLED-01',
]

it('defines every planned production media slot', () => {
  const ids = new Set(Object.values(mediaSlots).map((item) => item.id))
  for (const id of requiredMediaSlotIds) expect(ids.has(id), id).toBe(true)
})
```

This test is the executable source ensuring the empty-frame plan is not partially implemented.

---

# 6. Science data interface with verified example

```js
{
  id: 'ambient-rppg',
  year: '2008',
  title: 'Ambient light becomes a remote pulse signal',
  body: 'Verkruysse, Svaasand and Nelson demonstrated remote plethysmographic imaging using ambient light and a consumer camera.',
  weight: 'feature',
  citation: {
    label: 'Verkruysse et al., Optics Express (2008)',
    url: 'https://opg.optica.org/oe/fulltext.cfm?uri=oe-16-26-21434',
    sourceType: 'primary'
  },
  mediaSlotId: 'SCI-TIMELINE-RPPG-01'
}
```

The master plan contains all fixed initial research milestones; do not introduce unresolved year markers.

---

# 7. Public route loading

`PublicSite.jsx` keeps Home immediate inside the public chunk and lazily loads larger secondary routes:

```jsx
const ScreeningsPage = lazy(() => import('./pages/ScreeningsPage.jsx'))
const SciencePage = lazy(() => import('./pages/SciencePage.jsx'))
const ImpactPage = lazy(() => import('./pages/ImpactPage.jsx'))
const AboutPage = lazy(() => import('./pages/AboutPage.jsx'))
const JourneyPage = lazy(() => import('./pages/JourneyPage.jsx'))
const PlatformPage = lazy(() => import('./pages/PlatformPage.jsx'))
```

Tiny legal pages may remain eager.

---

# 8. CSS ownership

- `public-tokens.css`: tokens only.
- `public-layout.css`: public root/nav/footer/global editorial utilities.
- `public-motion.css`: shared motion/reduced-motion/route-transition styles.
- `media-frame.css`: media/placeholder states.
- `signal-thread.css`: Signal Thread states.
- `home-reference.css`: Home composition.
- route CSS: route-specific geometry.
- `responsive.css`: only cross-route coordinated overrides.

Do not restore a universal section-card recipe.

---

# 9. Migration strategy

1. Build/test system primitives while old Home remains working.
2. Create new `home-reference/` chapters.
3. Replace Home in visual-gated batches.
4. Keep superseded files until Gate C is approved.
5. Delete old Home files in a dedicated cleanup task.
6. Build supporting routes after Home fixes the shared visual grammar.

---

# 10. Test map

```text
tests/public/
├── content-claims.test.js
├── site-facts.test.js
├── media-slots.test.js
├── media-frame.test.jsx
├── reduced-motion.test.jsx
├── signal-thread.test.jsx
├── loop-band.test.jsx
├── public-nav-theme.test.jsx
├── home-reference-structure.test.jsx
├── home-trust-evidence.test.jsx
├── story-overlay.test.jsx
├── screenings-page.test.jsx
├── science-page.test.jsx
├── impact-page.test.jsx
├── about-page.test.jsx
├── journey-page.test.jsx
├── platform-page.test.jsx
├── legal-pages.test.jsx
├── public-routing-expanded.test.jsx
└── public-route-continuity.test.jsx
```

Existing tests remain when they assert still-valid semantics.

---

# 11. Dependency policy

Allowed existing runtime:

- GSAP
- `@gsap/react`

ReactBits candidates requiring source/dependency inspection before retention:

- Scroll Velocity
- Count Up
- Masonry

If a candidate introduces another animation runtime or a heavy dependency, reproduce the small useful behavior with GSAP/CSS or reject it.

---

# 12. Rollback boundaries

1. System primitives complete; old Home still active.
2. Gate A: shell + Hero + access + proof.
3. Gate B: first half through context stories/signal journey.
4. Gate C: complete new Home.
5. Each major supporting route lands as its own commit.
6. Accessibility/performance changes remain separate from content/structure commits.

A failed visual experiment should be revertible without undoing routing or medical-content truth.
