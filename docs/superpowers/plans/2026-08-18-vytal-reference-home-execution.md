# Vytal Reference-Driven Redesign — Home Execution Details

**Companion to the master implementation plan.** This file locks Home component responsibilities, class contracts, data ownership and visual-gate acceptance criteria.

---

# 1. Home composition target

`LandingPage.jsx` final structure:

```jsx
import HeroMediaChapter from '../components/home-reference/HeroMediaChapter.jsx'
import AccessThesisChapter from '../components/home-reference/AccessThesisChapter.jsx'
import ProofFieldChapter from '../components/home-reference/ProofFieldChapter.jsx'
import ScienceLineageChapter from '../components/home-reference/ScienceLineageChapter.jsx'
import ContextStoriesChapter from '../components/home-reference/ContextStoriesChapter.jsx'
import SignalJourneyChapter from '../components/home-reference/SignalJourneyChapter.jsx'
import SignalMarqueeChapter from '../components/home-reference/SignalMarqueeChapter.jsx'
import DocumentaryRunChapter from '../components/home-reference/DocumentaryRunChapter.jsx'
import TrustResetChapter from '../components/home-reference/TrustResetChapter.jsx'
import EvidenceVoicesChapter from '../components/home-reference/EvidenceVoicesChapter.jsx'
import LanguageBandChapter from '../components/home-reference/LanguageBandChapter.jsx'
import PlatformArcChapter from '../components/home-reference/PlatformArcChapter.jsx'
import ConcreteValueChapter from '../components/home-reference/ConcreteValueChapter.jsx'
import FinalEntryChapter from '../components/home-reference/FinalEntryChapter.jsx'

export default function LandingPage() {
  return (
    <main className="reference-home">
      <HeroMediaChapter />
      <AccessThesisChapter />
      <ProofFieldChapter />
      <ScienceLineageChapter />
      <ContextStoriesChapter />
      <SignalJourneyChapter />
      <SignalMarqueeChapter />
      <DocumentaryRunChapter />
      <TrustResetChapter />
      <EvidenceVoicesChapter />
      <LanguageBandChapter />
      <PlatformArcChapter />
      <ConcreteValueChapter />
      <FinalEntryChapter />
    </main>
  )
}
```

The final order intentionally mirrors the reference Home's narrative jobs:

**cinematic emotion → mission → proof → history/science → people/context → operational journey → breadth rhythm → media evidence → emotional/trust reset → voices/evidence → accessibility rhythm → institution/platform → concrete value → action.**

---

# 2. HOME batch A — Hero / Access / Proof

## 2.1 `HeroMediaChapter.jsx`

Responsibilities:

- full viewport hero;
- consume `mediaSlots.HOME_HERO_01`;
- render `MediaFrame` in viewport-cover mode;
- overlay `SignalThread variant="raw"`;
- preserve mystery copy;
- render `Scroll to reveal` cue;
- no large product paragraph;
- hero gets `SectionThemeBoundary theme="media-dark"`;
- expose `data-home-chapter="hero"`.

Recommended DOM:

```jsx
<SectionThemeBoundary theme="media-dark" as="section" className="ref-hero" data-home-chapter="hero">
  <MediaFrame slot={mediaSlots.HOME_HERO_01} className="ref-hero__media" />
  <div className="ref-hero__scrim" aria-hidden="true" />
  <SignalThread variant="raw" tone="coral" className="ref-hero__signal" />
  <div className="public-shell ref-hero__content">
    <p className="ref-kicker">OPTICAL INPUT / VYTAL</p>
    <SplitText text={homeReference.hero.title} tag="h1" className="ref-hero__title" ... />
    <p className="ref-hero__reveal">{homeReference.hero.reveal}</p>
    <a className="ref-scroll-cue" href="#access-thesis">Scroll to reveal</a>
  </div>
</SectionThemeBoundary>
```

The exact `SplitText` props use the already-reviewed timing band; do not add a second hero animation library.

## 2.2 `AccessThesisChapter.jsx`

Responsibilities:

- sparse editorial field;
- no card wrapper;
- id `access-thesis`;
- one giant statement;
- small supporting body;
- optional `HOME-ACCESS-DETAIL-01` frame.

Recommended copy model:

```js
accessThesis: {
  statement: 'A useful first health signal should not have to wait for perfect access.',
  body: 'Vytal starts with hardware people already carry: an ordinary camera. The goal is accessible screening context—not a replacement for clinical care.',
}
```

## 2.3 `ProofFieldChapter.jsx`

Responsibilities:

- compute facts from `getSiteFacts()`;
- never hard-code adoption numbers;
- render original access-map placeholder/diagram;
- use CountUp only if adopted in the primitive spike;
- clearly label map `Designed for reach — not a deployment map`;
- use Signal Thread as data connector;
- section field may be coral or deep ink based on Gate A visual review.

Fact item interface:

```js
{
  value: 8,
  suffix: '',
  label: 'supported explanation languages',
  source: 'SUPPORTED_LANGUAGES'
}
```

Render all values as text even if CountUp JS does not initialize.

---

# 3. HOME batch B — Science teaser / Context stories / Signal journey

## 3.1 `ScienceLineageChapter.jsx`

Responsibilities:

- consume a compact subset from verified `science.js` milestones;
- render 4–5 milestones;
- Signal Thread variant `timeline`;
- no guessed years;
- one original diagram slot `HOME-SCIENCE-DIAGRAM-01`;
- CTA `/science`.

Markup contract:

```jsx
<section className="ref-science-teaser" data-home-chapter="science-lineage">
  <SignalThread variant="timeline" direction="horizontal" />
  <ol className="ref-science-teaser__milestones">
    {homeScienceMilestones.map((milestone) => (
      <li key={milestone.id} data-weight={milestone.weight}>...</li>
    ))}
  </ol>
</section>
```

## 3.2 `ContextStoriesChapter.jsx`

Responsibilities:

- consume first three Impact scenarios;
- render deliberately nonuniform story previews;
- each preview displays `Illustrative scenario`;
- use MediaFrame slots from scenario data;
- one shared `StoryOverlay` instance receives selected scenario;
- no personal names.

State pattern:

```jsx
const [selectedId, setSelectedId] = useState(null)
const selected = impactScenarios.find((item) => item.id === selectedId) ?? null
```

Do not render one overlay per tile.

## 3.3 `SignalJourneyChapter.jsx`

Responsibilities:

Replace old four-card process composition.

Internal structure:

```jsx
<section className="ref-signal-journey" data-home-chapter="signal-journey">
  <CaptureBeat />
  <ExtractBeat />
  <VerifyBeat />
  <ExplainBeat />
</section>
```

The four beats may live as small local functions in the file initially. Split into files only if the component exceeds a manageable size.

### CAPTURE
- `HOME-JOURNEY-CAPTURE-01`
- RAW thread / ROI frame
- title `CAPTURE`

### EXTRACT
- `HOME-JOURNEY-EXTRACT-01`
- raw sample → cleaner waveform diagram
- title `EXTRACT`

### VERIFY
- `HOME-JOURNEY-VERIFY-01`
- labels Motion / Lighting / Signal quality / Confidence
- amber emphasis
- title `VERIFY`

### EXPLAIN
- `HOME-JOURNEY-EXPLAIN-01`
- actual Vytal-style UI example
- title `EXPLAIN`
- existing raw→explained transition may be reused here or later Evidence chapter after visual review.

Desktop can use short pin/sticky behavior for selected beats only. Mobile is normal stacked flow.

---

# 4. HOME batch C — Marquee / Documentary media / Trust / Evidence / Language

## 4.1 `SignalMarqueeChapter.jsx`

Data should come from `homeSignalBandItems`, derived from reviewed screening content.

Example item:

```js
{
  label: 'Oxygen proxy',
  status: 'Research proxy',
  isResearch: true
}
```

Visual item must retain a visible research marker/status key.

`LoopBand` receives the items. No manual four-times array duplication in the page component.

## 4.2 `DocumentaryRunChapter.jsx`

Responsibilities:

- render `HOME-MEDIA-01` through `HOME-MEDIA-10`;
- custom CSS grid / explicit placement is preferred for art-directed layout;
- Masonry is accepted only if the earlier prototype demonstrates deterministic placement and responsive control;
- every frame has `data-media-slot`;
- selected frames set `parallax: true` in media data rather than adding bespoke scroll code in this component.

Suggested desktop grid uses 12 columns with explicit classes:

```text
01: cols 1–4
02: cols 6–11
03: cols 9–12
04: cols 1–9
05: cols 2–5
06: cols 6–12
07: cols 1–3
08: cols 4–10
09: cols 10–12
10: cols 2–8
```

Exact row spacing is tuned visually, but the composition must remain irregular.

## 4.3 `TrustResetChapter.jsx`

Requirements:

- `SectionThemeBoundary theme="light"`;
- warm ivory full-width field;
- headline exactly conveys no-result/retry principle;
- two small quality paths:
  - movement → signal lost → retry
  - stable input → signal lock → screening context
- no card grid;
- no looping animation;
- Signal Thread static/clean.

## 4.4 `EvidenceVoicesChapter.jsx`

Content slots:

- clinician/researcher pending
- health-worker pending
- research evidence note
- Vytal principle

Pending quote slots must not contain generated quote prose.

State model:

```js
const evidenceItems = [
  { id: 'clinician', type: 'pending-voice', ... },
  { id: 'health-worker', type: 'pending-voice', ... },
  { id: 'research', type: 'research-note', ... },
  { id: 'principle', type: 'owned-principle', ... },
]
```

A simple controlled slider/sequence is enough. Do not add a carousel dependency.

## 4.5 `LanguageBandChapter.jsx`

Consumes `SUPPORTED_LANGUAGES` through a lightweight derived content export, not duplicated language strings.

Use `LoopBand` with opposite direction/lower speed than signal marquee.

Under reduced motion, render one wrapped line/list.

---

# 5. HOME batch D — Platform arc / Concrete value / Final entry

## 5.1 `PlatformArcChapter.jsx`

Four editorial blocks:

1. CAMERA FIRST
2. CONFIDENCE AWARE
3. CONTEXT OVER TIME
4. BEYOND CAMERA

Media slots:

- `HOME-ARC-CAMERA-01`
- `HOME-ARC-CONFIDENCE-01`
- `HOME-ARC-CONTEXT-01`
- `HOME-ARC-FUTURE-01`

The fourth beat must visibly contain `Research / future direction`.

Signal Thread evolves into a branching network in the final beat.

CTA to `/platform`.

## 5.2 `ConcreteValueChapter.jsx`

Data:

```js
[
  { index: '01', title: 'Scan', body: 'Camera-derived signal + quality state' },
  { index: '02', title: 'Result', body: 'Trusted screening output' },
  { index: '03', title: 'Explanation', body: 'Understandable context' },
  { index: '04', title: 'History', body: 'Repeated-reading context' },
  { index: '05', title: 'Handoff', body: 'Information that can be carried forward' },
]
```

This is editorial value translation, not fake performance statistics.

## 5.3 `FinalEntryChapter.jsx`

Requirements:

- full-field closing chapter;
- resolves Signal Thread to TRUSTED state;
- headline `See what your camera can tell you.`;
- primary link `/scan`;
- secondary `/screenings`;
- visible concise medical disclaimer;
- no extra feature list after CTA.

---

# 6. Home content restructuring

`src/public/content/home.js` should evolve from one flat product-section object into an explicit narrative model while retaining reviewed wording.

Recommended exports:

```js
export const homeReference = {
  hero: {...},
  accessThesis: {...},
  proof: {...},
  signalJourney: {...},
  trust: {...},
  evidence: {...},
  platformArc: {...},
  concreteValue: {...},
  finalEntry: {...},
}

export const homeSignalBandItems = ...
export const homeScienceMilestoneIds = [...]
export const homeImpactScenarioIds = [...]
```

Do not duplicate full screening/science/impact objects in `home.js`; store IDs and derive from canonical models.

---

# 7. Home CSS contract

`home-reference.css` owns the final Home geometry.

Required top-level class families:

```text
.ref-hero
.ref-access-thesis
.ref-proof-field
.ref-science-teaser
.ref-context-stories
.ref-signal-journey
.ref-signal-band
.ref-documentary-run
.ref-trust-reset
.ref-evidence
.ref-language-band
.ref-platform-arc
.ref-concrete-value
.ref-final-entry
```

Rules:

- do not reuse one `.public-section` spacing recipe for every chapter;
- large chapters can be full width while content subregions use `.public-shell`;
- at least H01, H03, H07, H09 and H14 should be visually full-field;
- no default rounded background card on chapter root;
- card-like surfaces only for product UI or structured technical detail.

---

# 8. Home automated contract test

Create `tests/public/home-reference-structure.test.jsx` that asserts narrative structure without snapshotting CSS.

Core pattern:

```jsx
import { render, screen, within } from '@testing-library/react'
import { MemoryRouter } from 'react-router-dom'
import LandingPage from '../../src/public/pages/LandingPage.jsx'

it('renders the reference-driven home narrative in order', () => {
  const { container } = render(
    <MemoryRouter>
      <LandingPage />
    </MemoryRouter>,
  )

  const chapters = [...container.querySelectorAll('[data-home-chapter]')]
    .map((node) => node.getAttribute('data-home-chapter'))

  expect(chapters).toEqual([
    'hero',
    'access-thesis',
    'proof',
    'science-lineage',
    'context-stories',
    'signal-journey',
    'signal-band',
    'documentary-run',
    'trust-reset',
    'evidence',
    'language-band',
    'platform-arc',
    'concrete-value',
    'final-entry',
  ])

  expect(screen.getByRole('heading', { level: 1, name: /more here than you can see/i })).toBeInTheDocument()
  expect(screen.getByText(/sometimes the right result is no result/i)).toBeInTheDocument()
  expect(screen.getByRole('link', { name: /start screening/i })).toHaveAttribute('href', '/scan')
})
```

Individual system/component tests cover overlay, media placeholder, loops and theme behavior.

---

# 9. Visual Gate A — shell + H01–H03

Review at widths:

- 390
- 768
- 1440
- 1920

Must satisfy:

- hero reads as cinematic even with empty media frame;
- mystery copy dominates, not UI chrome;
- nav disappears into composition rather than floating as SaaS pill;
- first transition from hero → access thesis feels deliberate;
- proof field is a major change in physical rhythm;
- no fake deployment implication;
- placeholder frame does not look like broken content;
- no horizontal overflow;
- reduced-motion still looks composed.

Do not proceed to full Home polish if Gate A is visually weak. Fix the grammar first.

---

# 10. Visual Gate B — H01–H06

Must satisfy:

- story previews feel editorial and nonuniform;
- illustrative labels are impossible to miss but not ugly disclaimers;
- story overlay feels like same experience, not generic modal library;
- Signal Journey clearly replaces old four-card SaaS pattern;
- CAPTURE / EXTRACT / VERIFY / EXPLAIN each has different composition;
- mobile stacking preserves correct narrative order.

---

# 11. Visual Gate C — complete Home

Must satisfy:

- at least three strong tonal field changes across full scroll;
- two kinetic bands do not feel like duplicated gimmicks;
- documentary placeholder run creates real visual rhythm without images;
- trust ivory chapter is a genuine pacing reset;
- evidence section does not fake credibility;
- future/platform material is clearly future/research;
- final CTA resolves, rather than restarts, the story;
- Home feels closer to an interactive documentary than a sequence of feature sections;
- clinical product entry remains obvious.

After Gate C approval, old Home component/CSS cleanup becomes safe.
