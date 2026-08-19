# Vytal Reference-Driven Redesign — Supporting Routes Execution Details

**Companion to the master implementation plan.** This document defines route-specific page modes so supporting pages do not collapse into Home-with-different-copy.

---

# 1. Routing contract

Final public route table:

```jsx
<Route element={<PublicLayout />}>
  <Route index element={<LandingPage />} />
  <Route path="screenings" element={<ScreeningsPage />} />
  <Route path="science" element={<SciencePage />} />
  <Route path="impact" element={<ImpactPage />} />
  <Route path="about" element={<AboutPage />} />
  <Route path="journey" element={<JourneyPage />} />
  <Route path="platform" element={<PlatformPage />} />
  <Route path="privacy" element={<PrivacyPage />} />
  <Route path="medical-disclaimer" element={<MedicalDisclaimerPage />} />
  <Route path="*" element={<PublicNotFoundPage />} />
</Route>
```

Secondary pages may be lazy imports. `/scan`, `/dashboard`, `/report` remain outside this tree under `ClinicalLayout`.

---

# 2. Screenings route

## 2.1 Page component

`src/public/pages/ScreeningsPage.jsx`

```jsx
export default function ScreeningsPage() {
  return (
    <main className="screenings-page">
      <ScreeningHero />
      <ScreeningCategoryNav />
      {screeningGroups.map((group) => (
        <ScreeningGroupChapter key={group.title} group={group} />
      ))}
      <ScreeningTruthChapter />
      <PublicPageCta
        title="Ready to try the current screening experience?"
        primary={{ label: 'Start Screening', to: '/scan' }}
        secondary={{ label: 'Explore the Science', to: '/science' }}
      />
    </main>
  )
}
```

`ScreeningGroupChapter` may live in `ScreeningsPage.jsx` initially if small, otherwise extract to `components/screenings/`.

## 2.2 Visual hierarchy

### Core physiological
Largest treatment, three major editorial units.

### Research/experimental
Irregular medium/large units. Status visible beside title before descriptive copy.

### Context/triage
More text-led, because these are interpretation layers rather than direct signals.

### Future integrations
Distinct future field; every unit visibly says future/research.

## 2.3 `ScreeningEditorialItem`

Consumes one item from `screenings.js` and renders:

```jsx
<article className="screening-editorial-item" data-status={item.status}>
  <header>
    <StatusChip status={item.status} />
    <h2>{item.title}</h2>
  </header>
  <MediaFrame slot={mediaSlots[mediaSlotKey]} />
  <dl>
    <div><dt>Input</dt><dd>{item.input}</dd></div>
    {item.looksFor && <div><dt>Looks for</dt><dd>{item.looksFor}</dd></div>}
    {item.method && <div><dt>Method</dt><dd>{item.method}</dd></div>}
    {item.output && <div><dt>Output</dt><dd>{item.output}</dd></div>}
  </dl>
  <p className="screening-editorial-item__limitation">{item.limitation}</p>
  {item.confirmation && <p className="screening-editorial-item__confirmation">{item.confirmation}</p>}
</article>
```

No marketing rewrite is allowed inside this component.

## 2.4 `ScreeningTruthChapter`

Warm-ivory or equivalent trust field with explicit lines:

- camera SpO2 proxy ≠ clinical pulse oximeter;
- rhythm screening ≠ ECG diagnosis;
- anemia/jaundice indicators ≠ lab measurement;
- BP trends ≠ cuff replacement;
- future hardware ≠ current production integration.

Use concise reviewed wording from content model, not sensational disclaimers.

## 2.5 Test

`tests/public/screenings-page.test.jsx`

```jsx
it('shows capability maturity and limitations instead of flattening screenings', () => {
  render(
    <MemoryRouter>
      <ScreeningsPage />
    </MemoryRouter>,
  )

  expect(screen.getByRole('heading', { level: 1, name: /what vytal is designed to screen/i })).toBeInTheDocument()
  expect(screen.getByText('Core physiological')).toBeInTheDocument()
  expect(screen.getAllByText('Research proxy').length).toBeGreaterThan(0)
  expect(screen.getAllByText('Experimental').length).toBeGreaterThan(0)
  expect(screen.getAllByText('Future integration').length).toBeGreaterThan(0)
  expect(screen.getByText(/not a cuff replacement/i)).toBeInTheDocument()
})
```

---

# 3. Science route

## 3.1 Content-research gate

Before `science.js` is finalized, research and verify the public scientific timeline from primary sources. The implementation task must produce concrete milestones/citations, not `YYYY` placeholders.

For every milestone store:

```js
{
  id,
  year,
  title,
  body,
  weight: 'minor' | 'major' | 'feature',
  citation: {
    label,
    url,
    sourceType: 'primary'
  },
  mediaSlotId
}
```

At minimum the timeline must accurately cover:

- PPG/optical pulse sensing foundation;
- camera/remote PPG progression;
- ROI/computer-vision approach;
- signal quality/motion problem;
- beat timing/variability;
- uncertainty/confidence;
- current Vytal research pathways;
- current Vytal implementation truth;
- validation roadmap.

Do not claim a method was the `first` unless primary source/history supports it.

## 3.2 Page structure

```jsx
<main className="science-page">
  <ScienceHero />
  <ScienceTimeline milestones={scienceMilestones} />
  <ScienceResearchBranches />
  <WhatWeDoNotClaim />
  <ValidationRoadmap />
  <ScienceReferences />
</main>
```

`ScienceReferences` may remain in the page file if simple.

## 3.3 Timeline

`ScienceTimeline` renders one semantic ordered list and one decorative/progressive Signal Thread.

```jsx
<section className="science-timeline" aria-labelledby="science-timeline-title">
  <SignalThread variant="timeline" direction="vertical" className="science-timeline__thread" />
  <ol>
    {milestones.map((item) => (
      <ScienceMilestone key={item.id} milestone={item} />
    ))}
  </ol>
</section>
```

`ScienceMilestone` uses `data-weight` to vary composition. It must not normalize every milestone into same-size card.

## 3.4 `WhatWeDoNotClaim`

Mandatory contrast chapter. It is part of design, not footer fine print.

## 3.5 Test

`tests/public/science-page.test.jsx`

```jsx
it('presents sourced science, limitations and validation as first-class content', () => {
  render(
    <MemoryRouter>
      <SciencePage />
    </MemoryRouter>,
  )

  expect(screen.getByRole('heading', { level: 1, name: /measurement problem is not/i })).toBeInTheDocument()
  expect(screen.getByRole('heading', { name: /what we do not claim/i })).toBeInTheDocument()
  expect(screen.getByRole('heading', { name: /validation/i })).toBeInTheDocument()

  for (const milestone of scienceMilestones) {
    expect(milestone.year).not.toBe('YYYY')
    expect(milestone.citation?.url).toMatch(/^https?:\/\//)
  }
})
```

---

# 4. Impact route

## 4.1 Data

`src/public/content/impact.js` exports six scenarios, all initially illustrative.

Exact IDs:

```js
[
  'individual-home',
  'community-health-worker',
  'low-connectivity',
  'multilingual-explanation',
  'longitudinal-follow-up',
  'referral-continuity',
]
```

Each scenario includes:

- label `Illustrative scenario`;
- title;
- summary;
- context;
- friction;
- workflow;
- limitation;
- 3 media slot IDs;
- `isIllustrative: true`.

## 4.2 Page

```jsx
<main className="impact-page">
  <ImpactHero />
  <ImpactScenarioArchive scenarios={impactScenarios} />
  <section className="impact-access-thesis">...</section>
  <ImpactWorkflowBand />
  <PublicPageCta ... />
</main>
```

## 4.3 Archive

Nonuniform CSS grid/list. One shared `StoryOverlay`.

No fake name/portrait labels.

## 4.4 Test

`tests/public/impact-page.test.jsx`

```jsx
it('labels every current impact story as illustrative and opens accessible detail', async () => {
  const user = userEvent.setup()
  render(
    <MemoryRouter>
      <ImpactPage />
    </MemoryRouter>,
  )

  expect(screen.getAllByText(/illustrative scenario/i)).toHaveLength(impactScenarios.length)

  await user.click(screen.getByRole('button', { name: /individual at home/i }))
  const dialog = screen.getByRole('dialog')
  expect(within(dialog).getByText(/illustrative scenario/i)).toBeInTheDocument()
  expect(within(dialog).getByRole('button', { name: /close/i })).toBeInTheDocument()
})
```

Use `@testing-library/user-event` only if added; otherwise use `fireEvent` to avoid adding a dev dependency solely for one test. The master plan chooses one approach consistently.

---

# 5. About route

## 5.1 Page structure

```jsx
<main className="about-page">
  <AboutHero />
  <section className="about-origin">...</section>
  <AboutPrinciples />
  <section className="about-team-project">...</section>
  <section className="about-status">...</section>
  <AboutActionDirectory />
</main>
```

## 5.2 Principles

Exact initial list:

- Accessible
- Evidence-aware
- Honest about uncertainty
- Human-understandable

Render as four differently weighted editorial blocks, not four equal cards.

## 5.3 Team media

Use actual team copy only if already verified. Empty `ABOUT-TEAM-*` frames remain until real assets are available.

## 5.4 Test

```jsx
it('keeps About focused on principles and honest project status', () => {
  render(<MemoryRouter><AboutPage /></MemoryRouter>)
  expect(screen.getByRole('heading', { level: 1, name: /harder to overclaim/i })).toBeInTheDocument()
  expect(screen.getByText('Accessible')).toBeInTheDocument()
  expect(screen.getByText('Evidence-aware')).toBeInTheDocument()
  expect(screen.getByText(/honest about uncertainty/i)).toBeInTheDocument()
  expect(screen.queryByText(/trusted by/i)).not.toBeInTheDocument()
})
```

---

# 6. Journey route

## 6.1 Mandatory label

The first viewport contains:

`ILLUSTRATIVE SCREENING JOURNEY — NOT A REAL PATIENT CASE`

## 6.2 Data

`journey.js` stores one neutral example:

```js
export const illustrativeJourney = {
  label: 'Illustrative screening journey — not a real patient case',
  beats: [
    { id: 'context', ... },
    { id: 'low-confidence', ... },
    { id: 'signal-lock', ... },
    { id: 'example-result', ... },
    { id: 'explanation', ... },
    { id: 'history', ... },
    { id: 'trend', ... },
  ],
}
```

Any sample metric fields include `isExample: true`.

## 6.3 Narrative

The key story beat is **failure handled honestly**:

- first scan has low confidence;
- product asks to retry;
- second scan reaches usable quality;
- only then are example outputs shown.

This is more valuable than a dramatic disease story and reinforces the public trust thesis.

## 6.4 Test

```jsx
it('makes the journey illustrative and shows low-confidence retry before result', () => {
  const { container } = render(<MemoryRouter><JourneyPage /></MemoryRouter>)
  expect(screen.getByText(/not a real patient case/i)).toBeInTheDocument()

  const beats = [...container.querySelectorAll('[data-journey-beat]')]
    .map((node) => node.getAttribute('data-journey-beat'))

  expect(beats.indexOf('low-confidence')).toBeLessThan(beats.indexOf('example-result'))
  expect(screen.getAllByText(/example|illustrative/i).length).toBeGreaterThan(1)
})
```

---

# 7. Platform route

## 7.1 Data

`platform.js` fragments:

```js
[
  { id: 'camera', status: 'Current / core direction', ... },
  { id: 'ble', status: 'Future integration', ... },
  { id: 'wearable', status: 'Future integration', ... },
  { id: 'thermal', status: 'Future / research direction', ... },
  { id: 'records', status: 'Prototype / current direction', ... },
  { id: 'language', status: 'Current capability', ... },
  { id: 'referral', status: 'Workflow direction', ... },
  { id: 'population', status: 'Research direction', ... },
]
```

Exact status wording must remain aligned with implementation/content truth.

## 7.2 Page

```jsx
<main className="platform-page">
  <PlatformHero />
  <section className="platform-fragments">...</section>
  <PlatformAssembly fragments={platformFragments} />
  <section className="platform-future-notice">...</section>
  <PublicPageCta ... />
</main>
```

## 7.3 Motion

Fragments begin visually separated and become connected as scroll progresses. Do not literally use mosaic tiles.

## 7.4 Test

```jsx
it('distinguishes current platform pieces from future research directions', () => {
  render(<MemoryRouter><PlatformPage /></MemoryRouter>)
  expect(screen.getByRole('heading', { level: 1, name: /one signal is a fragment/i })).toBeInTheDocument()
  expect(screen.getAllByText(/future|research/i).length).toBeGreaterThan(2)
  expect(screen.getByText(/camera/i)).toBeInTheDocument()
})
```

---

# 8. Legal routes

## 8.1 Privacy

Readable document page. No pinned motion or kinetic bands.

Content must reflect actual current data handling; do not invent a privacy architecture not present in implementation.

## 8.2 Medical Disclaimer

Must explicitly state:

- screening/research support, not diagnosis;
- experimental/research pathways;
- low-confidence limitations;
- urgent symptoms override app reassurance;
- external clinical confirmation can be necessary.

## 8.3 Test

```jsx
it('exposes public trust routes with direct medical limitation language', () => {
  render(<MemoryRouter><MedicalDisclaimerPage /></MemoryRouter>)
  expect(screen.getByRole('heading', { level: 1, name: /medical disclaimer/i })).toBeInTheDocument()
  expect(screen.getByText(/not a medical diagnosis/i)).toBeInTheDocument()
  expect(screen.getByText(/urgent symptoms/i)).toBeInTheDocument()
})
```

---

# 9. Expanded routing test

`tests/public/public-routing-expanded.test.jsx`

Use a helper:

```jsx
function renderPublicRoute(path) {
  window.history.pushState({}, '', path)
  return render(<App />)
}
```

Test routes individually:

```jsx
it.each([
  ['/', /more here than you can see/i],
  ['/screenings', /what vytal is designed to screen/i],
  ['/science', /measurement problem is not/i],
  ['/impact', /first signal should not depend/i],
  ['/about', /harder to overclaim/i],
  ['/journey', /not a real patient case/i],
  ['/platform', /one signal is a fragment/i],
  ['/privacy', /privacy/i],
  ['/medical-disclaimer', /medical disclaimer/i],
])('%s renders the correct public page', async (path, name) => {
  renderPublicRoute(path)
  expect(await screen.findByText(name)).toBeInTheDocument()
})
```

Keep existing clinical routing tests for `/scan`, `/dashboard`, `/report`.

---

# 10. Visual Gate D — complete route system

Review all major routes at:

- 390px
- 768px
- 1440px

Additional 1920px check for Home, Science and Platform.

Acceptance:

### Screenings
- feels precise/high-intent, not another Home;
- maturity visually obvious;
- core gets more weight than speculative research.

### Science
- feels like a research/history exhibition;
- timeline is irregular, not uniform cards;
- citations/limitations are readable.

### Impact
- human/context-heavy even with empty frames;
- story overlay is polished and accessible;
- illustrative nature is clear.

### About
- deliberately shorter/quieter;
- no corporate filler.

### Journey
- single coherent narrative spine;
- low-confidence failure is a feature, not hidden;
- illustrative warning cannot be missed.

### Platform
- has its own fragments-to-context visual metaphor;
- future items are unmistakably future.

The pages must share identity without sharing identical layouts.
