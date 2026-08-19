# Vytal Reference-Driven Public Experience Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Rebuild Vytal's public experience into a reference-quality interactive health-sensing documentary that reproduces the Save a Child's Heart anniversary site's pacing, page specialization, semantic motion, media rhythm and storytelling quality while using original Vytal branding, content, Signal Thread visuals, honest medical claims, and production-sized empty media placeholders.

**Architecture:** Preserve the existing lazy public/clinical routing boundary and GSAP-only animation runtime. Build a reusable public-system layer (`MediaFrame`, `SignalThread`, theme boundaries, LoopBand, StoryOverlay), then replace the current uniform Home sections in staged visual gates before adding route-specific Screenings, Science, Impact, About, Journey, Platform and legal pages. Public content remains structured and truth-driven; missing human media and social proof remain explicit first-class placeholders rather than fabricated content.

**Tech Stack:** React 18, React Router 6, Vite 5, GSAP 3 + `@gsap/react`, CSS/SVG, existing ReactBits source forks where approved, Vitest 3, Testing Library, jsdom.

**Spec:** `docs/superpowers/specs/2026-08-18-vytal-reference-driven-public-site-design.md`

**Companion plans:**
- `docs/superpowers/plans/2026-08-18-vytal-reference-redesign-architecture.md`
- `docs/superpowers/plans/2026-08-18-vytal-reference-home-execution.md`
- `docs/superpowers/plans/2026-08-18-vytal-reference-supporting-routes.md`
- `docs/superpowers/plans/2026-08-18-vytal-reference-qa-performance.md`

## Global Constraints

- Start implementation from green commit `b444173f299f5e2022e53890363e77af877e5246`, not RED-only `93be2495f300d6d9f412d10b87fd2ecf0e5905bf`.
- `/scan`, `/dashboard`, `/report` remain clinical and are not visually redesigned by this plan.
- Public marketing code remains lazily isolated from the clinical critical bundle.
- GSAP + `@gsap/react` remain the only JS animation runtime.
- No Three.js, OGL, Lenis, Motion/Framer Motion, face-api.js, shader/particle library, or global custom cursor is added by default.
- Signal Thread must not use a literal ECG/heartbeat identity.
- Missing media renders as production-sized empty `MediaFrame`; never use random stock fallback or shimmer placeholders.
- No fake patients, testimonials, clinicians, hospitals, countries, adoption statistics or outcomes.
- All current human scenarios are visibly labelled `Illustrative scenario`; `/journey` says `ILLUSTRATIVE SCREENING JOURNEY — NOT A REAL PATIENT CASE`.
- Screening maturity comes from `src/public/content/screenings.js`; marketing copy never upgrades status.
- Use `screen`, `estimate`, `proxy`, `possible`, `trend`, `flag`, `confidence`, `confirmation recommended`; avoid unsupported diagnostic/medical-grade/replacement claims.
- Future BLE/wearable/thermal/population features carry visible research/future/prototype status.
- Reduced motion stops looping/pinning/parallax and renders complete static states.
- Required visual QA widths: 360, 390, 430, 768, 1024, 1280, 1440, 1920 px as specified by visual gates.
- Public landing JS target: roughly <100 kB gzip beyond shared React/router code where practical; any breach needs a concrete visible benefit.
- Clinical bundle must not materially grow because of public visual components.

---

## Phase 0 — Execution baseline

### Task 1: Create the clean redesign worktree and preserve the green baseline

**Files:**
- No production file change required until branch/worktree setup is complete.
- Bring docs from `landing-page-reference-redesign-plan` into the execution branch as documentation-only commits/cherry-picks if they are not already present.

**Interfaces:**
- Consumes: green commit `b444173f299f5e2022e53890363e77af877e5246`.
- Produces: isolated implementation branch/worktree with all existing tests green before redesign code.

- [ ] **Step 1: Create isolated worktree from the green commit**

```bash
git worktree add ../vytal-reference-redesign -b landing-page-reference-redesign b444173f299f5e2022e53890363e77af877e5246
cd ../vytal-reference-redesign
```

- [ ] **Step 2: Confirm the accidental RED-only Screenings test is absent**

```bash
git log -1 --oneline
rg -n "define screenings page capability contract" . || true
```

Expected: HEAD is `b444173...`; no RED-only Task-13 change is introduced.

- [ ] **Step 3: Install and run baseline tests/build**

```bash
npm install
npm test
npm run build
```

Expected: all existing tests PASS and build exits 0 before redesign edits.

- [ ] **Step 4: Record baseline build chunk sizes in the implementation notes/PR body**

Capture Vite build lines for main/clinical/PublicSite JS/CSS. These values are used in Task 24 performance comparison.

- [ ] **Step 5: Commit docs only if the execution branch needs them**

```bash
git add docs/
git commit -m "docs: add reference-driven redesign spec and plan"
```

Skip the commit if docs are already present with no changes.

---

## Phase 1 — Truth/data/system foundation

### Task 2: Centralize public facts and add automated medical-claim guardrails

**Files:**
- Create: `src/public/content/siteFacts.js`
- Create: `tests/public/site-facts.test.js`
- Create: `tests/public/content-claims.test.js`
- Modify: `src/public/content/home.js`

**Interfaces:**
- Consumes: `SUPPORTED_LANGUAGES` from `src/lib/ai.js`, `screenings` from `src/public/content/screenings.js`, existing trust factors from `home.js`.
- Produces: `getSiteFacts(): { languageCount, coreScreeningCount, qualityFactorCount }`; automated claim scanner used for all later content.

- [ ] **Step 1: Write the failing site-facts test**

```js
// tests/public/site-facts.test.js
import { describe, expect, it } from 'vitest'
import { SUPPORTED_LANGUAGES } from '../../src/lib/ai.js'
import { screenings } from '../../src/public/content/screenings.js'
import { getSiteFacts } from '../../src/public/content/siteFacts.js'

describe('public site facts', () => {
  it('derives public numbers from canonical content instead of duplicate marketing literals', () => {
    const facts = getSiteFacts()
    expect(facts.languageCount).toBe(SUPPORTED_LANGUAGES.length)
    expect(facts.coreScreeningCount).toBe(screenings.filter((item) => item.status === 'Core').length)
    expect(facts.qualityFactorCount).toBe(4)
  })
})
```

- [ ] **Step 2: Run focused test and verify RED**

```bash
npx vitest run tests/public/site-facts.test.js
```

Expected: FAIL because `siteFacts.js` does not exist.

- [ ] **Step 3: Implement `siteFacts.js`**

```js
import { SUPPORTED_LANGUAGES } from '../../lib/ai.js'
import { screenings } from './screenings.js'

const QUALITY_FACTORS = ['Motion', 'Lighting', 'Signal quality', 'Confidence']

export function getSiteFacts() {
  return {
    languageCount: SUPPORTED_LANGUAGES.length,
    coreScreeningCount: screenings.filter((item) => item.status === 'Core').length,
    qualityFactorCount: QUALITY_FACTORS.length,
  }
}

export { QUALITY_FACTORS }
```

- [ ] **Step 4: Add claim-guard test**

```js
// tests/public/content-claims.test.js
import { describe, expect, it } from 'vitest'
import { homeContent } from '../../src/public/content/home.js'
import { screenings } from '../../src/public/content/screenings.js'

const prohibited = [
  /medical[- ]grade/i,
  /replaces? (a |your )?doctor/i,
  /replaces? (a |your )?cuff/i,
  /replaces? (an |your )?ecg/i,
  /diagnoses? (you|patients|disease)/i,
  /used in \d+ countries/i,
  /trusted by \d+/i,
  /saves? lives/i,
]

it('does not contain unreviewed high-risk public claims', () => {
  const text = JSON.stringify({ homeContent, screenings })
  for (const pattern of prohibited) expect(text).not.toMatch(pattern)
})
```

- [ ] **Step 5: Run both tests, then full suite/build**

```bash
npx vitest run tests/public/site-facts.test.js tests/public/content-claims.test.js
npm test
npm run build
```

Expected: PASS.

- [ ] **Step 6: Commit**

```bash
git add src/public/content/home.js src/public/content/siteFacts.js tests/public/site-facts.test.js tests/public/content-claims.test.js
git commit -m "feat(public-content): centralize facts and claim guardrails"
```

---

### Task 3: Create canonical media-slot data and the production-shaped `MediaFrame`

**Files:**
- Create: `src/public/content/mediaSlots.js`
- Create: `src/public/components/system/MediaFrame.jsx`
- Create: `src/public/styles/media-frame.css`
- Create: `tests/public/media-frame.test.jsx`
- Modify: `src/public/PublicSite.jsx` or public style imports to include `media-frame.css`.

**Interfaces:**
- Consumes: media manifest spec.
- Produces: `mediaSlots` object and `<MediaFrame slot={...} />` used by every route.

- [ ] **Step 1: Write RED tests for blank and real image states**

```jsx
import { render, screen } from '@testing-library/react'
import { describe, expect, it } from 'vitest'
import MediaFrame from '../../src/public/components/system/MediaFrame.jsx'

const placeholder = {
  id: 'TEST-SLOT',
  kind: 'image',
  ratio: '4 / 3',
  src: null,
  alt: '',
  reveal: 'fade',
  parallax: false,
  priority: 'low',
  status: 'placeholder',
}

it('preserves a production media slot when source is absent', () => {
  const { container } = render(<MediaFrame slot={placeholder} />)
  const frame = container.querySelector('[data-media-slot="TEST-SLOT"]')
  expect(frame).toBeInTheDocument()
  expect(frame).toHaveAttribute('data-media-status', 'placeholder')
  expect(frame).not.toContainHTML('<img')
  expect(frame).not.toContainHTML('<video')
})

it('renders an image when a slot has a source', () => {
  render(<MediaFrame slot={{ ...placeholder, src: '/test.jpg', alt: 'Test media', status: 'final' }} />)
  expect(screen.getByRole('img', { name: 'Test media' })).toHaveAttribute('src', '/test.jpg')
})
```

- [ ] **Step 2: Verify RED**

```bash
npx vitest run tests/public/media-frame.test.jsx
```

- [ ] **Step 3: Create `mediaSlots.js` with all stable IDs from the media manifest**

Use a helper to keep objects consistent:

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

export const mediaSlots = {
  HOME_HERO_01: slot('HOME-HERO-01', 'video', 'viewport', 'Human/device camera-screening moment', { priority: 'high', reveal: 'wipe-signal' }),
  HOME_ACCESS_DETAIL_01: slot('HOME-ACCESS-DETAIL-01', 'image', '3 / 4', 'Hand/device/environment detail'),
  HOME_ACCESS_MAP_01: slot('HOME-ACCESS-MAP-01', 'diagram', '16 / 9', 'Original access/reach field'),
  // Continue with every exact slot ID from the committed media-slot manifest.
}
```

The implementation must include the complete manifest, not just the three shown above. Copy exact IDs/ratios/purpose from `2026-08-18-vytal-media-slot-manifest.md`.

- [ ] **Step 4: Implement `MediaFrame.jsx`**

```jsx
import useReducedMotion from '../../hooks/useReducedMotion.js'

export default function MediaFrame({ slot, src, poster, alt, className = '' }) {
  const reducedMotion = useReducedMotion()
  const mediaSrc = src ?? slot.src
  const mediaPoster = poster ?? slot.poster
  const mediaAlt = alt ?? slot.alt ?? ''
  const classes = ['media-frame', `media-frame--${slot.kind}`, `media-frame--reveal-${slot.reveal}`, className]
    .filter(Boolean)
    .join(' ')

  return (
    <figure
      className={classes}
      data-media-slot={slot.id}
      data-media-status={mediaSrc ? (slot.status === 'placeholder' ? 'candidate' : slot.status) : 'placeholder'}
      data-media-parallax={slot.parallax && !reducedMotion ? 'enabled' : 'disabled'}
      style={{ '--media-ratio': slot.ratio, '--media-position': slot.objectPosition }}
    >
      <div className="media-frame__surface">
        {slot.kind === 'video' && mediaSrc ? (
          <video src={mediaSrc} poster={mediaPoster || undefined} muted playsInline loop={!reducedMotion} autoPlay={!reducedMotion} />
        ) : mediaSrc ? (
          <img
            src={mediaSrc}
            alt={mediaAlt}
            loading={slot.priority === 'high' ? 'eager' : 'lazy'}
            decoding="async"
          />
        ) : (
          <div className="media-frame__placeholder" aria-hidden="true" />
        )}
      </div>
      {slot.caption ? <figcaption>{slot.caption}</figcaption> : null}
    </figure>
  )
}
```

If Task 4 has not yet created `useReducedMotion`, initially pass a simple `reducedMotion` prop or create Task 4 first in execution. Preferred execution order is Task 4 before Step 4 if strict imports require it; do not duplicate the hook logic.

- [ ] **Step 5: Add CSS**

```css
.media-frame {
  --media-ratio: 4 / 3;
  --media-position: 50% 50%;
  margin: 0;
  min-width: 0;
}
.media-frame__surface {
  position: relative;
  overflow: hidden;
  aspect-ratio: var(--media-ratio);
  background: linear-gradient(135deg, rgba(255,255,255,.035), rgba(255,255,255,.01));
}
.media-frame__surface > img,
.media-frame__surface > video {
  width: 100%; height: 100%; display: block; object-fit: cover; object-position: var(--media-position);
}
.media-frame__placeholder { width: 100%; height: 100%; background: rgba(241,237,231,.035); }
.media-frame[data-media-status='placeholder'] .media-frame__surface { outline: 1px solid rgba(241,237,231,.1); outline-offset: -1px; }
```

- [ ] **Step 6: GREEN/full verification and commit**

```bash
npx vitest run tests/public/media-frame.test.jsx
npm test
npm run build
git add src/public/content/mediaSlots.js src/public/components/system/MediaFrame.jsx src/public/styles/media-frame.css tests/public/media-frame.test.jsx src/public/PublicSite.jsx
git commit -m "feat(public-system): add production media slots"
```

---

### Task 4: Centralize reduced-motion behavior

**Files:**
- Create: `src/public/hooks/useReducedMotion.js`
- Create: `tests/public/reduced-motion.test.jsx`
- Modify: existing public ReactBits adapters that currently create their own long-lived reduced-motion query where practical.

**Interfaces:**
- Produces: `useReducedMotion(): boolean`.

- [ ] **Step 1: Write failing hook consumer test**

```jsx
function Probe() {
  const reduced = useReducedMotion()
  return <span>{reduced ? 'reduce' : 'motion'}</span>
}

it('reads the reduced-motion media query', () => {
  window.matchMedia = vi.fn().mockImplementation(() => ({
    matches: true,
    addEventListener: vi.fn(),
    removeEventListener: vi.fn(),
  }))
  render(<Probe />)
  expect(screen.getByText('reduce')).toBeInTheDocument()
})
```

- [ ] **Step 2: Verify RED**

```bash
npx vitest run tests/public/reduced-motion.test.jsx
```

- [ ] **Step 3: Implement hook**

```js
import { useEffect, useState } from 'react'

const QUERY = '(prefers-reduced-motion: reduce)'

export default function useReducedMotion() {
  const [reduced, setReduced] = useState(() => window.matchMedia?.(QUERY)?.matches ?? false)

  useEffect(() => {
    const media = window.matchMedia?.(QUERY)
    if (!media) return undefined
    const update = (event) => setReduced(event.matches)
    setReduced(media.matches)
    media.addEventListener?.('change', update)
    return () => media.removeEventListener?.('change', update)
  }, [])

  return reduced
}
```

- [ ] **Step 4: Migrate public components incrementally**

Replace duplicate reduced-motion query logic in `Magnet`, `SplitText`, `ScrollReveal`, `CardSwap`, `PixelTransition` only where behavior remains equivalent. Do not rewrite working component internals beyond the media-query ownership change.

- [ ] **Step 5: Verify and commit**

```bash
npx vitest run tests/public/reduced-motion.test.jsx tests/public/reactbits-primitives.test.jsx
npm test
npm run build
git add src/public/hooks/useReducedMotion.js src/public/components/reactbits tests/public/reduced-motion.test.jsx
git commit -m "refactor(public-motion): centralize reduced-motion state"
```

---

### Task 5: Build the deterministic Signal Thread primitives

**Files:**
- Create: `src/public/components/system/SignalThread.jsx`
- Create: `src/public/components/system/SignalMarker.jsx`
- Create: `src/public/components/system/SpectralSamples.jsx`
- Create: `src/public/components/system/RoiFrame.jsx`
- Create: `src/public/styles/signal-thread.css`
- Create: `tests/public/signal-thread.test.jsx`

**Interfaces:**
- Produces the exact component family documented in architecture spec.

- [ ] **Step 1: Write RED contract test**

```jsx
it('renders semantic Signal Thread states deterministically', () => {
  const { rerender, container } = render(<SignalThread variant="raw" tone="coral" decorative />)
  const thread = container.querySelector('[data-signal-thread]')
  expect(thread).toHaveAttribute('data-signal-variant', 'raw')
  expect(thread).toHaveAttribute('aria-hidden', 'true')

  rerender(<SignalThread variant="trusted" tone="mint" decorative />)
  expect(container.querySelector('[data-signal-thread]')).toHaveAttribute('data-signal-variant', 'trusted')
})
```

- [ ] **Step 2: Verify RED**

```bash
npx vitest run tests/public/signal-thread.test.jsx
```

- [ ] **Step 3: Implement deterministic samples**

```js
const DEFAULT_SAMPLES = [
  [8, 18], [17, 61], [29, 37], [41, 74], [53, 28], [66, 52], [79, 20], [90, 68],
]
```

`SpectralSamples` renders this fixed data; no `Math.random()`.

- [ ] **Step 4: Implement `SignalThread` as SVG/state wrapper**

```jsx
export default function SignalThread({
  variant = 'raw', tone = 'coral', direction = 'horizontal', progress,
  density = 'normal', decorative = true, className = '',
}) {
  const reducedMotion = useReducedMotion()
  const safeProgress = reducedMotion ? 1 : progress
  return (
    <div
      className={`signal-thread signal-thread--${variant} signal-thread--${tone} ${className}`}
      data-signal-thread="true"
      data-signal-variant={variant}
      data-signal-direction={direction}
      data-signal-density={density}
      aria-hidden={decorative ? 'true' : undefined}
      style={safeProgress == null ? undefined : { '--signal-progress': safeProgress }}
    >
      {variant === 'raw' ? <SpectralSamples /> : null}
      <svg viewBox="0 0 1000 120" preserveAspectRatio="none" focusable="false">
        <path className="signal-thread__ghost" d="M0 60 C120 55 160 70 260 58 S430 48 520 62 S700 68 1000 58" />
        <path className="signal-thread__path" d="M0 60 C120 55 160 70 260 58 S430 48 520 62 S700 68 1000 58" />
      </svg>
    </div>
  )
}
```

Different variants are primarily styled/composed rather than creating an ECG waveform.

- [ ] **Step 5: Add CSS state semantics and reduced-motion final state**

Use coral/noisy RAW, amber LOCK, mint TRUSTED, and neutral CONTEXT/timeline/network. Keep continuous filters off.

- [ ] **Step 6: Verify and commit**

```bash
npx vitest run tests/public/signal-thread.test.jsx
npm test
npm run build
git add src/public/components/system src/public/styles/signal-thread.css tests/public/signal-thread.test.jsx
git commit -m "feat(public-system): add Vytal Signal Thread"
```

---

### Task 6: Build section-theme observation and redesign the public shell

**Files:**
- Create: `src/public/components/system/SectionThemeBoundary.jsx`
- Create: `src/public/hooks/useSectionTheme.js`
- Modify: `src/public/components/PublicNav.jsx`
- Modify: `src/public/components/PublicFooter.jsx`
- Modify: `src/public/PublicLayout.jsx`
- Modify: `src/public/styles/public-layout.css` or split current public CSS accordingly.
- Create: `tests/public/public-nav-theme.test.jsx`

**Interfaces:**
- Produces section-aware nav theme and editorial mobile menu.

- [ ] **Step 1: Write RED theme-boundary/nav test**

```jsx
it('exposes section themes and keeps the primary screening action', () => {
  render(
    <MemoryRouter>
      <PublicLayout />
    </MemoryRouter>,
  )
  expect(screen.getByRole('link', { name: /start screening/i })).toHaveAttribute('href', '/scan')
})

it('renders semantic theme boundaries', () => {
  const { container } = render(<SectionThemeBoundary theme="light">Trust</SectionThemeBoundary>)
  expect(container.querySelector('[data-public-theme="light"]')).toBeInTheDocument()
})
```

- [ ] **Step 2: Implement boundary and observer**

Boundary:

```jsx
export default function SectionThemeBoundary({ as: Tag = 'section', theme = 'dark', children, ...props }) {
  return <Tag data-public-theme={theme} {...props}>{children}</Tag>
}
```

`useSectionTheme` uses one `IntersectionObserver` with a narrow rootMargin band near nav height; it selects the most recently intersecting boundary.

- [ ] **Step 3: Rebuild nav**

Required DOM/classes:

```jsx
<header className={`public-nav public-nav--${theme} ${scrolled ? 'is-scrolled' : ''}`}>
  <Link className="public-nav__brand" to="/">Vytal</Link>
  <nav aria-label="Primary">...</nav>
  <Link className="public-nav__cta" to="/scan">Start Screening</Link>
  <button className="public-nav__menu-toggle" aria-expanded={menuOpen}>...</button>
</header>
```

Desktop is transparent/editorial; mobile menu becomes full-screen panel, locks body scroll, closes on Escape.

- [ ] **Step 4: Rebuild footer**

Footer includes mission, public nav, Start Screening, Privacy, Medical Disclaimer, and `Screening support, not diagnosis.` No fake socials/newsletter.

- [ ] **Step 5: Verify**

```bash
npx vitest run tests/public/public-nav.test.jsx tests/public/public-nav-theme.test.jsx
npm test
npm run build
```

- [ ] **Step 6: Commit**

```bash
git add src/public/PublicLayout.jsx src/public/components/PublicNav.jsx src/public/components/PublicFooter.jsx src/public/components/system/SectionThemeBoundary.jsx src/public/hooks/useSectionTheme.js src/public/styles/public-layout.css tests/public/public-nav-theme.test.jsx
git commit -m "feat(public-shell): add editorial themed navigation"
```

---

### Task 7: Prototype and choose the moving-band/count primitives

**Files:**
- Create: `src/public/components/system/LoopBand.jsx`
- Create: `src/public/components/system/VisuallyHiddenList.jsx`
- Optionally create/adapt: `src/public/components/reactbits/ScrollVelocity.jsx`
- Optionally create/adapt: `src/public/components/reactbits/CountUp.jsx`
- Create: `tests/public/loop-band.test.jsx`
- Modify: `THIRD_PARTY_NOTICES.md` only if new ReactBits source is retained.

**Interfaces:**
- Produces accessible `<LoopBand />`; optionally a CountUp wrapper.

- [ ] **Step 1: Inspect current ReactBits Scroll Velocity and Count Up source/dependencies before copying**

Record whether each uses only already-present GSAP/native APIs or adds a new runtime. Reject any implementation that violates Global Constraints.

- [ ] **Step 2: Write RED LoopBand accessibility test**

```jsx
it('exposes one semantic list while hiding duplicated moving tracks', () => {
  const { container } = render(<LoopBand items={['Heart rate', 'Breathing']} ariaLabel="Signals" />)
  expect(screen.getByRole('list', { name: 'Signals' })).toBeInTheDocument()
  expect(within(screen.getByRole('list', { name: 'Signals' })).getAllByRole('listitem')).toHaveLength(2)
  expect(container.querySelectorAll('[data-loop-track][aria-hidden="true"]').length).toBeGreaterThan(0)
})
```

- [ ] **Step 3: Implement LoopBand using the winning engine**

Required public API:

```jsx
<LoopBand items={items} direction="left" speed={0.8} ariaLabel="Signals" renderItem={(item) => ...} />
```

If ReactBits Scroll Velocity requires another motion runtime, use a GSAP/CSS track instead.

- [ ] **Step 4: Add CountUp only if dependency-light**

If retained, it must render the final numeric text server/DOM-side and animate enhancement only; reduced motion returns final value immediately.

- [ ] **Step 5: Verify build impact and commit**

```bash
npx vitest run tests/public/loop-band.test.jsx
npm test
npm run build
git add src/public/components/system src/public/components/reactbits THIRD_PARTY_NOTICES.md tests/public/loop-band.test.jsx
git commit -m "feat(public-system): add accessible semantic motion bands"
```

---

## Phase 2 — Home, Gate A

### Task 8: Implement cinematic media Hero and access thesis

**Files:**
- Create: `src/public/components/home-reference/HeroMediaChapter.jsx`
- Create: `src/public/components/home-reference/AccessThesisChapter.jsx`
- Modify: `src/public/content/home.js`
- Create/Modify: `src/public/styles/home-reference.css`
- Modify: `src/public/pages/LandingPage.jsx`
- Create: `tests/public/home-reference-structure.test.jsx`

**Interfaces:**
- Consumes `MediaFrame`, `SignalThread`, `SectionThemeBoundary`, `SplitText`, home content.
- Produces Home chapters `hero`, `access-thesis`.

- [ ] **Step 1: Write RED test for first two chapter contracts**

```jsx
it('opens with cinematic mystery then access thesis', () => {
  const { container } = render(<MemoryRouter><LandingPage /></MemoryRouter>)
  expect(container.querySelector('[data-home-chapter="hero"]')).toBeInTheDocument()
  expect(container.querySelector('[data-home-chapter="access-thesis"]')).toBeInTheDocument()
  expect(container.querySelector('[data-media-slot="HOME-HERO-01"]')).toBeInTheDocument()
  expect(screen.getByRole('heading', { level: 1, name: /more here than you can see/i })).toBeInTheDocument()
  expect(screen.getByText(/useful first health signal/i)).toBeInTheDocument()
})
```

- [ ] **Step 2: Verify RED**

- [ ] **Step 3: Implement exact structures from Home Execution Details sections 2.1–2.2**

Use `data-home-chapter` attributes and full-viewport `MediaFrame`. Remove the old Hero import only after the replacement renders.

- [ ] **Step 4: CSS**

Hero: `min-height: 100svh`, full bleed media absolute inset 0, content layered above, title `clamp(4rem,10vw,10rem)`, sparse access chapter with no card root.

- [ ] **Step 5: Verify focused/full/build**

```bash
npx vitest run tests/public/home-reference-structure.test.jsx tests/public/landing-page.test.jsx
npm test
npm run build
```

Update old landing-page assertions only when they assumed removed visual structure; preserve semantic assertions like Start Screening and screening-not-diagnosis.

- [ ] **Step 6: Commit**

```bash
git add src/public/components/home-reference src/public/pages/LandingPage.jsx src/public/content/home.js src/public/styles/home-reference.css tests/public
git commit -m "feat(home): rebuild cinematic opening chapters"
```

---

### Task 9: Implement verified proof field and sourced science teaser

**Files:**
- Create: `src/public/components/home-reference/ProofFieldChapter.jsx`
- Create: `src/public/components/home-reference/ScienceLineageChapter.jsx`
- Create: `src/public/content/science.js`
- Modify: `src/public/pages/LandingPage.jsx`
- Modify: `src/public/styles/home-reference.css`
- Modify: `tests/public/home-reference-structure.test.jsx`

**Interfaces:**
- Consumes `getSiteFacts`, media slots, SignalThread.
- Produces initial verified `scienceMilestones` and Home subset.

- [ ] **Step 1: Add RED expectations for chapters `proof` and `science-lineage`**

```js
expect(chapters.slice(0, 4)).toEqual(['hero', 'access-thesis', 'proof', 'science-lineage'])
expect(screen.getByText(/designed for reach/i)).toBeInTheDocument()
expect(screen.getByRole('link', { name: /explore the science/i })).toHaveAttribute('href', '/science')
```

- [ ] **Step 2: Create exact initial Science milestones**

```js
export const scienceMilestones = [
  {
    id: 'ambient-rppg', year: '2008', weight: 'feature',
    title: 'Ambient light becomes a remote pulse signal',
    body: 'Verkruysse, Svaasand and Nelson demonstrated remote plethysmographic imaging using ambient light and a consumer camera.',
    citation: { label: 'Verkruysse et al., Optics Express (2008)', url: 'https://opg.optica.org/oe/fulltext.cfm?uri=oe-16-26-21434', sourceType: 'primary' },
    mediaSlotId: 'SCI-TIMELINE-RPPG-01',
  },
  {
    id: 'video-bss', year: '2010', weight: 'major',
    title: 'Automated pulse measurement from video',
    body: 'Poh, McDuff and Picard described non-contact automated cardiac pulse measurements using video imaging and blind source separation.',
    citation: { label: 'Poh et al., Optics Express (2010)', url: 'https://opg.optica.org/oe/fulltext.cfm?uri=oe-18-10-10762', sourceType: 'primary' },
    mediaSlotId: 'SCI-TIMELINE-PPG-01',
  },
  {
    id: 'chrom', year: '2013', weight: 'major',
    title: 'Chrominance improves motion robustness',
    body: 'De Haan and Jeanne introduced a chrominance-based rPPG approach designed around the motion problem in RGB video.',
    citation: { label: 'de Haan & Jeanne, IEEE TBME (2013)', url: 'https://doi.org/10.1109/TBME.2013.2266196', sourceType: 'primary' },
    mediaSlotId: 'SCI-TIMELINE-MOTION-01',
  },
  {
    id: 'motion-mapping', year: '2016', weight: 'minor',
    title: 'Motion artifacts become an explicit imaging problem',
    body: 'Moço, Stuijk and de Haan analyzed motion-related artifacts in PPG imaging and color-channel mapping approaches.',
    citation: { label: 'Moço et al., Biomedical Optics Express (2016)', url: 'https://doi.org/10.1364/BOE.7.001737', sourceType: 'primary' },
    mediaSlotId: 'SCI-TIMELINE-MOTION-01',
  },
  {
    id: 'principles', year: '2017', weight: 'feature',
    title: 'Remote PPG gets an explicit optical/algorithmic model',
    body: 'Wang and colleagues described algorithmic principles that connect skin optics, color signals and pulse extraction choices.',
    citation: { label: 'Wang et al., IEEE TBME (2017)', url: 'https://doi.org/10.1109/TBME.2016.2609282', sourceType: 'primary' },
    mediaSlotId: 'SCI-TIMELINE-ROI-01',
  },
  {
    id: 'hrv-realtime', year: '2019', weight: 'feature',
    title: 'Real-time camera pulse timing extends toward variability',
    body: 'Gudi and colleagues presented a real-time rPPG pipeline that extracts a pulse waveform for heart rate and beat-timing/HRV analysis.',
    citation: { label: 'Gudi et al., ICCV Workshops (2019)', url: 'https://openaccess.thecvf.com/content_ICCVW_2019/html/CVPM/Gudi_Efficient_Real-Time_Camera_Based_Estimation_of_Heart_Rate_and_Its_ICCVW_2019_paper.html', sourceType: 'primary' },
    mediaSlotId: 'SCI-TIMELINE-IBI-01',
  },
]
```

Add a separate `vytalPrototypeMilestone` labelled `2026 / Vytal prototype` with `sourceType: 'internal'`; do not present it as published research.

- [ ] **Step 3: Implement ProofField from derived facts**

Render `languageCount`, `coreScreeningCount`, `qualityFactorCount`; include access-map slot and explicit non-deployment label.

- [ ] **Step 4: Implement Science teaser using first/selected milestones**

Render 4–5 milestones with Signal Thread timeline and CTA.

- [ ] **Step 5: Full verification**

```bash
npx vitest run tests/public/home-reference-structure.test.jsx tests/public/site-facts.test.js
npm test
npm run build
```

- [ ] **Step 6: Commit**

```bash
git add src/public/components/home-reference/ProofFieldChapter.jsx src/public/components/home-reference/ScienceLineageChapter.jsx src/public/content/science.js src/public/pages/LandingPage.jsx src/public/styles/home-reference.css tests/public/home-reference-structure.test.jsx
git commit -m "feat(home): add verified proof and science lineage"
```

- [ ] **Step 7: VISUAL GATE A**

Perform the exact Gate A checklist in `2026-08-18-vytal-reference-qa-performance.md`. Do not continue visual layering until shell/Hero/access/proof grammar is acceptable.

---

## Phase 3 — Home, Gate B

### Task 10: Build accessible StoryOverlay and Impact scenario data

**Files:**
- Create: `src/public/content/impact.js`
- Create: `src/public/components/system/StoryOverlay.jsx`
- Create: `tests/public/story-overlay.test.jsx`
- Modify: `src/public/styles/public-motion.css` / layout CSS as needed.

**Interfaces:**
- Produces `impactScenarios` and `<StoryOverlay />` for Home and `/impact`.

- [ ] **Step 1: Write RED overlay test using `fireEvent` to avoid new test dependency**

```jsx
it('opens as a dialog, closes on Escape and returns focus', () => {
  function Harness() {
    const [open, setOpen] = useState(false)
    return <><button onClick={() => setOpen(true)}>Open story</button><StoryOverlay open={open} scenario={impactScenarios[0]} onClose={() => setOpen(false)} /></>
  }
  render(<Harness />)
  const trigger = screen.getByRole('button', { name: 'Open story' })
  fireEvent.click(trigger)
  expect(screen.getByRole('dialog')).toBeInTheDocument()
  fireEvent.keyDown(document, { key: 'Escape' })
  expect(screen.queryByRole('dialog')).not.toBeInTheDocument()
  expect(trigger).toHaveFocus()
})
```

- [ ] **Step 2: Create the six exact illustrative scenarios**

IDs and media IDs come from supporting-route plan. Every object includes `isIllustrative: true` and label `Illustrative scenario`.

- [ ] **Step 3: Implement dialog semantics/focus**

Use refs and a small focusable-selector query; save `document.activeElement` on open, restore on close. Lock `document.body.style.overflow = 'hidden'` while open and restore prior value.

- [ ] **Step 4: Verify and commit**

```bash
npx vitest run tests/public/story-overlay.test.jsx
npm test
npm run build
git add src/public/content/impact.js src/public/components/system/StoryOverlay.jsx src/public/styles tests/public/story-overlay.test.jsx
git commit -m "feat(public-system): add illustrative story overlays"
```

---

### Task 11: Implement Home context stories and four-beat Signal Journey

**Files:**
- Create: `src/public/components/home-reference/ContextStoriesChapter.jsx`
- Create: `src/public/components/home-reference/SignalJourneyChapter.jsx`
- Modify: `src/public/pages/LandingPage.jsx`
- Modify: `src/public/styles/home-reference.css`
- Modify: `tests/public/home-reference-structure.test.jsx`

**Interfaces:**
- Consumes first three `impactScenarios`, StoryOverlay, MediaFrame, SignalThread, RoiFrame.
- Produces chapters `context-stories`, `signal-journey`.

- [ ] **Step 1: Extend RED chapter-order test**

Expected first six chapters:

```js
expect(chapters.slice(0, 6)).toEqual([
  'hero', 'access-thesis', 'proof', 'science-lineage', 'context-stories', 'signal-journey',
])
expect(screen.getAllByText(/illustrative scenario/i)).toHaveLength(3)
```

- [ ] **Step 2: Implement ContextStories using one selected-ID state and one StoryOverlay**

Use the three compositions defined in Home Execution Details; do not map all three into identical card wrappers.

- [ ] **Step 3: Implement CAPTURE/EXTRACT/VERIFY/EXPLAIN in SignalJourney**

Use exact media slots and quality labels. Assign `data-signal-beat="capture|extract|verify|explain"` for QA/testing.

- [ ] **Step 4: Add sticky/pin enhancement only on desktop after static composition works**

Use GSAP ScrollTrigger inside component context. If viewport <1024px or reduced motion, skip pinning and preserve normal flow.

- [ ] **Step 5: Verify**

```bash
npx vitest run tests/public/home-reference-structure.test.jsx tests/public/story-overlay.test.jsx
npm test
npm run build
```

- [ ] **Step 6: Commit and VISUAL GATE B**

```bash
git add src/public/components/home-reference src/public/pages/LandingPage.jsx src/public/styles/home-reference.css tests/public/home-reference-structure.test.jsx
git commit -m "feat(home): add human contexts and signal journey"
```

Run Gate B checklist before Phase 4.

---

## Phase 4 — Complete Home, Gate C

### Task 12: Build screening marquee and irregular documentary media run

**Files:**
- Create: `src/public/components/home-reference/SignalMarqueeChapter.jsx`
- Create: `src/public/components/home-reference/DocumentaryRunChapter.jsx`
- Modify: `src/public/content/home.js`
- Modify: `src/public/pages/LandingPage.jsx`
- Modify: `src/public/styles/home-reference.css`
- Modify: `tests/public/home-reference-structure.test.jsx`

**Interfaces:**
- Consumes `LoopBand`, screening content, media slots.
- Produces `signal-band`, `documentary-run`.

- [ ] **Step 1: Derive band items from canonical screenings**

```js
export const homeSignalBandItems = screenings
  .filter((item) => ['Core', 'Research proxy', 'Experimental'].includes(item.status))
  .map(({ id, title, status }) => ({ id, label: title, status, isResearch: status !== 'Core' }))
```

- [ ] **Step 2: Add RED test**

```js
expect(chapters).toContain('signal-band')
expect(chapters).toContain('documentary-run')
expect(container.querySelectorAll('[data-media-slot^="HOME-MEDIA-"]')).toHaveLength(10)
```

- [ ] **Step 3: Implement LoopBand with visible research markers**

- [ ] **Step 4: Implement explicit 12-column documentary CSS placements**

Render all ten slots even empty; use exact placement guide from Home Execution Details. On <=768px convert to deliberate one/two-column sequence rather than maintaining desktop overlaps.

- [ ] **Step 5: Verify and commit**

```bash
npx vitest run tests/public/home-reference-structure.test.jsx tests/public/loop-band.test.jsx
npm test
npm run build
git add src/public/components/home-reference src/public/content/home.js src/public/pages/LandingPage.jsx src/public/styles/home-reference.css tests/public/home-reference-structure.test.jsx
git commit -m "feat(home): add semantic breadth and media rhythm"
```

---

### Task 13: Build ivory Trust reset, Evidence/Voices, and language band

**Files:**
- Create: `src/public/components/home-reference/TrustResetChapter.jsx`
- Create: `src/public/components/home-reference/EvidenceVoicesChapter.jsx`
- Create: `src/public/components/home-reference/LanguageBandChapter.jsx`
- Modify: `src/public/content/home.js`
- Modify: `src/public/pages/LandingPage.jsx`
- Modify: `src/public/styles/home-reference.css`
- Create/Modify: `tests/public/home-trust-evidence.test.jsx`

**Interfaces:**
- Consumes SectionThemeBoundary, QUALITY_FACTORS, LoopBand, SUPPORTED_LANGUAGES.

- [ ] **Step 1: Write RED test**

```jsx
it('uses uncertainty as a major reset without fabricating social proof', () => {
  const { container } = render(<MemoryRouter><LandingPage /></MemoryRouter>)
  const trust = container.querySelector('[data-home-chapter="trust-reset"]')
  expect(trust).toHaveAttribute('data-public-theme', 'light')
  expect(screen.getByText(/sometimes the right result is no result/i)).toBeInTheDocument()
  expect(screen.getByText(/clinician.*pending/i)).toBeInTheDocument()
  expect(screen.queryByText(/dr\. [a-z]+ says/i)).not.toBeInTheDocument()
  expect(screen.getByText('اردو')).toBeInTheDocument()
})
```

- [ ] **Step 2: Implement Trust paths**

Render two semantic paths as text + simple thread state:

```text
MOVEMENT → SIGNAL LOST → RETRY
STABLE INPUT → SIGNAL LOCK → SCREENING CONTEXT
```

- [ ] **Step 3: Implement evidence items without generated quotes**

Pending voice items display label/status/frame only. Research note uses sourced paraphrase. Owned principle displays `AI explains the measurements. It doesn't invent them.` as Vytal principle.

- [ ] **Step 4: Render supported languages from `SUPPORTED_LANGUAGES` via LoopBand**

Do not duplicate list manually.

- [ ] **Step 5: Verify/commit**

```bash
npx vitest run tests/public/home-trust-evidence.test.jsx tests/public/content-claims.test.js
npm test
npm run build
git add src/public/components/home-reference src/public/content/home.js src/public/pages/LandingPage.jsx src/public/styles/home-reference.css tests/public/home-trust-evidence.test.jsx
git commit -m "feat(home): add trust reset and evidence rhythm"
```

---

### Task 14: Complete Home with platform arc, tangible units and final entry

**Files:**
- Create: `src/public/components/home-reference/PlatformArcChapter.jsx`
- Create: `src/public/components/home-reference/ConcreteValueChapter.jsx`
- Create: `src/public/components/home-reference/FinalEntryChapter.jsx`
- Modify: `src/public/content/home.js`
- Modify: `src/public/pages/LandingPage.jsx`
- Modify: `src/public/styles/home-reference.css`
- Modify: `tests/public/home-reference-structure.test.jsx`

**Interfaces:**
- Produces final 14-chapter Home.

- [ ] **Step 1: Replace chapter-order test with full final order**

Use exact 14-name array from Home Execution Details.

- [ ] **Step 2: Implement four platform beats**

Final BEYOND CAMERA item includes visible `Research / future direction` and link `/platform`.

- [ ] **Step 3: Implement concrete values exactly as 01–05 semantic units**

No fake percentages/counts.

- [ ] **Step 4: Implement final CTA**

Start Screening `/scan`, Explore Screenings `/screenings`, readable `Screening support, not diagnosis.`

- [ ] **Step 5: Verify**

```bash
npx vitest run tests/public/home-reference-structure.test.jsx tests/public/home-finale.test.jsx tests/public/content-claims.test.js
npm test
npm run build
```

- [ ] **Step 6: Commit and VISUAL GATE C**

```bash
git add src/public/components/home-reference src/public/content/home.js src/public/pages/LandingPage.jsx src/public/styles/home-reference.css tests/public
git commit -m "feat(home): complete reference-driven narrative"
```

Run the complete Gate C checklist. Do not delete old Home files until Gate C passes visually.

---

### Task 15: Remove obsolete Home implementation after Gate C

**Files:**
- Delete only old Home component files no longer imported.
- Remove obsolete old landing CSS selectors.
- Update: tests that reference retired implementation details while preserving valid semantic behavior.
- Update: `THIRD_PARTY_NOTICES.md` if a copied ReactBits component becomes unused and is removed.

**Interfaces:**
- Consumes approved Gate C Home.
- Produces clean public tree with no duplicate visual implementations.

- [ ] **Step 1: Find actual unused files before deleting**

```bash
rg -n "CameraScienceSection|ProcessSection|ProductProofSection|ScreeningEcosystemSection|TrustSection|AiExplanationSection|LongitudinalSection|ImpactSection|SciencePreviewSection|FutureVisionSection|FinalCtaSection" src tests
```

- [ ] **Step 2: Delete only files with no retained imports**

Do not delete ReactBits adapters still used by new Home/supporting routes.

- [ ] **Step 3: Run full verification**

```bash
npm test
npm run build
```

- [ ] **Step 4: Commit**

```bash
git add -A
git commit -m "refactor(home): remove superseded landing compositions"
```

---

## Phase 5 — Supporting routes

### Task 16: Expand public routing and add page skeletons without visual duplication

**Files:**
- Modify: `src/public/PublicSite.jsx`
- Create: `src/public/pages/ScreeningsPage.jsx`
- Create: `src/public/pages/SciencePage.jsx`
- Create: `src/public/pages/ImpactPage.jsx`
- Create: `src/public/pages/AboutPage.jsx`
- Create: `src/public/pages/JourneyPage.jsx`
- Create: `src/public/pages/PlatformPage.jsx`
- Create: `src/public/pages/PrivacyPage.jsx`
- Create: `src/public/pages/MedicalDisclaimerPage.jsx`
- Create: `tests/public/public-routing-expanded.test.jsx`

**Interfaces:**
- Produces route endpoints and lazy imports; page internals may be minimal but truthful until following tasks.

- [ ] **Step 1: Write RED expanded routing table test**

Use exact route/name table from Supporting Routes plan.

- [ ] **Step 2: Verify RED**

```bash
npx vitest run tests/public/public-routing-expanded.test.jsx
```

- [ ] **Step 3: Add lazy route imports and route table**

Use `React.lazy` for Screenings, Science, Impact, About, Journey, Platform. Keep tiny legal pages eager if desired.

- [ ] **Step 4: Create minimal page H1 shells with correct premise only**

These are not final placeholders such as `Coming soon`; they are valid semantic page shells whose following tasks add full chapters. Example:

```jsx
export default function ScreeningsPage() {
  return <main className="screenings-page"><h1>What Vytal is designed to screen.</h1></main>
}
```

- [ ] **Step 5: GREEN/full/build and commit**

```bash
npx vitest run tests/public/public-routing-expanded.test.jsx tests/routing.test.jsx
npm test
npm run build
git add src/public/PublicSite.jsx src/public/pages tests/public/public-routing-expanded.test.jsx
git commit -m "feat(public-routes): add reference-driven route system"
```

---

### Task 17: Build the Screenings capability atlas

**Files:**
- Create: `src/public/components/screenings/ScreeningHero.jsx`
- Create: `src/public/components/screenings/ScreeningCategoryNav.jsx`
- Create: `src/public/components/screenings/ScreeningEditorialItem.jsx`
- Create: `src/public/components/screenings/ScreeningTruthChapter.jsx`
- Modify: `src/public/pages/ScreeningsPage.jsx`
- Create: `src/public/styles/screenings.css`
- Create: `tests/public/screenings-page.test.jsx`

**Interfaces:**
- Consumes canonical `screeningGroups`, `screenings`, media slots, StatusChip.

- [ ] **Step 1: Add RED maturity/limitations test**

Use exact test from Supporting Routes Details.

- [ ] **Step 2: Implement hero/category navigator**

Four anchors: Core physiological; Optical/algorithmic research; Context/triage; Future sensing extensions.

- [ ] **Step 3: Implement `ScreeningEditorialItem` exact `<dl>` anatomy**

No rewording of `limitation`/`confirmation` in JSX.

- [ ] **Step 4: Create nonuniform group layouts**

Core receives largest treatment; research items vary size; context text-led; future chapter clearly separate.

- [ ] **Step 5: Implement `What Vytal does not claim`**

Use reviewed limitations.

- [ ] **Step 6: Verify/commit**

```bash
npx vitest run tests/public/screenings-page.test.jsx tests/public/content-claims.test.js
npm test
npm run build
git add src/public/components/screenings src/public/pages/ScreeningsPage.jsx src/public/styles/screenings.css tests/public/screenings-page.test.jsx
git commit -m "feat(screenings): build capability atlas"
```

---

### Task 18: Build Science as an irregular sourced timeline/exhibition

**Files:**
- Modify: `src/public/content/science.js`
- Create: `src/public/components/science/ScienceHero.jsx`
- Create: `src/public/components/science/ScienceTimeline.jsx`
- Create: `src/public/components/science/ScienceMilestone.jsx`
- Create: `src/public/components/science/ScienceResearchBranches.jsx`
- Create: `src/public/components/science/WhatWeDoNotClaim.jsx`
- Create: `src/public/components/science/ValidationRoadmap.jsx`
- Modify: `src/public/pages/SciencePage.jsx`
- Create: `src/public/styles/science.css`
- Create: `tests/public/science-page.test.jsx`

**Interfaces:**
- Consumes exact verified milestones created Task 9 plus research screening model.

- [ ] **Step 1: Write RED page/citation test**

Use Supporting Routes test; additionally assert every `scienceMilestone` has non-placeholder year + citation URL.

- [ ] **Step 2: Implement ScienceHero**

H1: `The interface is simple. The measurement problem is not.`; hero uses `SCI-HERO-01` media/diagram frame.

- [ ] **Step 3: Implement timeline ordered list + Signal Thread vertical rail**

`ScienceMilestone` changes layout based on `weight`. `feature` may span width/full chapter; `minor` stays compact. Do not render uniform cards.

- [ ] **Step 4: Add research branches from `screenings.js`**

Group SpO2/rhythm/anemia/jaundice/BP/BMI with explicit statuses/limitations.

- [ ] **Step 5: Implement WhatWeDoNotClaim + validation roadmap + references**

References link to the primary URLs stored in content data.

- [ ] **Step 6: Verify/commit**

```bash
npx vitest run tests/public/science-page.test.jsx tests/public/content-claims.test.js
npm test
npm run build
git add src/public/content/science.js src/public/components/science src/public/pages/SciencePage.jsx src/public/styles/science.css tests/public/science-page.test.jsx
git commit -m "feat(science): build sourced signal-history experience"
```

---

### Task 19: Build Impact as a longitudinal/context story archive

**Files:**
- Create: `src/public/components/impact/ImpactHero.jsx`
- Create: `src/public/components/impact/ImpactScenarioTile.jsx`
- Create: `src/public/components/impact/ImpactScenarioArchive.jsx`
- Create: `src/public/components/impact/ImpactWorkflowBand.jsx`
- Modify: `src/public/pages/ImpactPage.jsx`
- Create: `src/public/styles/impact.css`
- Create: `tests/public/impact-page.test.jsx`

**Interfaces:**
- Consumes Task-10 `impactScenarios` + StoryOverlay.

- [ ] **Step 1: Write RED illustrative/archive test**

Use exact test in Supporting Routes, using `fireEvent` if user-event is not installed.

- [ ] **Step 2: Implement nonuniform archive**

Each tile shows media placeholder + label + title + summary. Button accessible name is scenario title.

- [ ] **Step 3: Wire one StoryOverlay with prev/next navigation**

Compute index from selected ID; wrap previous/next at edges or disable controls consistently.

- [ ] **Step 4: Add `SCREEN / SAVE / EXPLAIN / REFER` LoopBand/large rhythm chapter**

- [ ] **Step 5: Verify/commit**

```bash
npx vitest run tests/public/impact-page.test.jsx tests/public/story-overlay.test.jsx
npm test
npm run build
git add src/public/components/impact src/public/pages/ImpactPage.jsx src/public/styles/impact.css tests/public/impact-page.test.jsx
git commit -m "feat(impact): add illustrative context archive"
```

---

### Task 20: Build concise About page and action directory

**Files:**
- Create: `src/public/content/about.js`
- Create: `src/public/components/about/AboutHero.jsx`
- Create: `src/public/components/about/AboutPrinciples.jsx`
- Create: `src/public/components/about/AboutActionDirectory.jsx`
- Modify: `src/public/pages/AboutPage.jsx`
- Create: `src/public/styles/about.css`
- Create: `tests/public/about-page.test.jsx`

**Interfaces:**
- Produces short origin/principles route.

- [ ] **Step 1: RED test exact principle/anti-corporate contract**

Use Supporting Routes test.

- [ ] **Step 2: Implement verified origin/principles copy**

Do not add fake company history, partner logos, office, careers or investor claims.

- [ ] **Step 3: Render four principles at different visual weights**

Avoid four equal cards.

- [ ] **Step 4: Render team/project media placeholders and route action directory**

- [ ] **Step 5: Verify/commit**

```bash
npx vitest run tests/public/about-page.test.jsx tests/public/content-claims.test.js
npm test
npm run build
git add src/public/content/about.js src/public/components/about src/public/pages/AboutPage.jsx src/public/styles/about.css tests/public/about-page.test.jsx
git commit -m "feat(about): add concise principles experience"
```

---

### Task 21: Build the illustrative Journey case-study experience

**Files:**
- Create: `src/public/content/journey.js`
- Create: `src/public/components/journey/JourneyHero.jsx`
- Create: `src/public/components/journey/JourneyQualityBeat.jsx`
- Create: `src/public/components/journey/JourneyResultBeat.jsx`
- Create: `src/public/components/journey/JourneyTrendBeat.jsx`
- Modify: `src/public/pages/JourneyPage.jsx`
- Create: `src/public/styles/journey.css`
- Create: `tests/public/journey-page.test.jsx`

**Interfaces:**
- Produces single story spine analogous to reference Mazen mode without fake patient.

- [ ] **Step 1: RED ordering/disclaimer test**

Use exact test from Supporting Routes.

- [ ] **Step 2: Create data with beats in exact order**

`context`, `low-confidence`, `signal-lock`, `example-result`, `explanation`, `history`, `trend`.

- [ ] **Step 3: Implement Hero + failure/retry beat**

The low-confidence beat must visually dominate before any result. Show `LOW CONFIDENCE / REPEAT` and relevant quality factors.

- [ ] **Step 4: Implement example result + explanation + history/trend**

Every sample numeric/graph region contains visible `EXAMPLE READING` or `ILLUSTRATIVE TREND`.

- [ ] **Step 5: Add verified fact LoopBand and final CTA**

- [ ] **Step 6: Verify/commit**

```bash
npx vitest run tests/public/journey-page.test.jsx tests/public/content-claims.test.js
npm test
npm run build
git add src/public/content/journey.js src/public/components/journey src/public/pages/JourneyPage.jsx src/public/styles/journey.css tests/public/journey-page.test.jsx
git commit -m "feat(journey): add illustrative screening case study"
```

---

### Task 22: Build Platform fragments-to-context experience

**Files:**
- Create: `src/public/content/platform.js`
- Create: `src/public/components/platform/PlatformHero.jsx`
- Create: `src/public/components/platform/PlatformFragment.jsx`
- Create: `src/public/components/platform/PlatformAssembly.jsx`
- Modify: `src/public/pages/PlatformPage.jsx`
- Create: `src/public/styles/platform.css`
- Create: `tests/public/platform-page.test.jsx`

**Interfaces:**
- Produces page-specific visual metaphor analogous to reference Mosaic role.

- [ ] **Step 1: RED future-status test**

Use exact Supporting Routes test.

- [ ] **Step 2: Create fragment data with explicit statuses**

Use eight IDs: camera, ble, wearable, thermal, records, language, referral, population. Align status copy with current implementation truth.

- [ ] **Step 3: Implement scattered fragment field**

Desktop uses explicit absolute/grid offsets inside controlled section; mobile uses normal ordered stack.

- [ ] **Step 4: Implement assembly state**

Signal Thread variant `network` connects fragments as scroll progresses. No literal mosaic tiles.

- [ ] **Step 5: Add large future/research notice and current-product close**

- [ ] **Step 6: Verify/commit**

```bash
npx vitest run tests/public/platform-page.test.jsx tests/public/content-claims.test.js
npm test
npm run build
git add src/public/content/platform.js src/public/components/platform src/public/pages/PlatformPage.jsx src/public/styles/platform.css tests/public/platform-page.test.jsx
git commit -m "feat(platform): connect future sensing fragments"
```

---

### Task 23: Finalize Privacy, Medical Disclaimer and public 404

**Files:**
- Modify: `src/public/pages/PrivacyPage.jsx`
- Modify: `src/public/pages/MedicalDisclaimerPage.jsx`
- Modify: `src/public/pages/PublicNotFoundPage.jsx`
- Create: `src/public/styles/legal.css`
- Create: `tests/public/legal-pages.test.jsx`

**Interfaces:**
- Produces trustworthy low-motion legal routes.

- [ ] **Step 1: RED medical disclaimer test**

```jsx
it('states the screening boundary and symptom override clearly', () => {
  render(<MemoryRouter><MedicalDisclaimerPage /></MemoryRouter>)
  expect(screen.getByRole('heading', { level: 1, name: /medical disclaimer/i })).toBeInTheDocument()
  expect(screen.getByText(/not a medical diagnosis/i)).toBeInTheDocument()
  expect(screen.getByText(/urgent symptoms/i)).toBeInTheDocument()
})
```

- [ ] **Step 2: Write privacy copy from actual current data behavior**

Describe camera/local/API behavior only to the extent verified by current code. Do not promise backend/cloud guarantees not present.

- [ ] **Step 3: Implement plain readable layouts**

No marquee, pinned scroll or heavy Signal Thread animation.

- [ ] **Step 4: Verify/commit**

```bash
npx vitest run tests/public/legal-pages.test.jsx tests/public/public-routing-expanded.test.jsx
npm test
npm run build
git add src/public/pages src/public/styles/legal.css tests/public/legal-pages.test.jsx
git commit -m "feat(trust): finalize public privacy and medical boundaries"
```

- [ ] **Step 5: VISUAL GATE D**

Run full route-system checklist before global polish.

---

## Phase 6 — Cross-route polish, accessibility and performance

### Task 24: Add public-only route continuity and scroll restoration

**Files:**
- Create: `src/public/components/system/PublicRouteTransition.jsx` only if visual prototype passes.
- Create: `src/public/hooks/usePublicScrollRestoration.js` or small route effect in `PublicLayout.jsx`.
- Modify: `src/public/PublicLayout.jsx`
- Create/Modify: `tests/public/public-route-continuity.test.jsx`

**Interfaces:**
- Produces route scroll-to-top and optional short Signal Thread wipe.

- [ ] **Step 1: Test scroll restoration behavior**

Mock `window.scrollTo` and render route change; expect `{ top: 0 }` or equivalent call.

- [ ] **Step 2: Implement scroll restoration first**

Use `useLocation()` effect; do not wait for animation.

- [ ] **Step 3: Prototype transition**

If a ~450–750ms Signal Thread wipe improves route continuity without delaying `/scan`, retain it. Otherwise skip it; route-transition spectacle is lower priority than page quality.

- [ ] **Step 4: Ensure clinical entry bypasses/shortens public transition**

`/scan` navigation should remain immediate enough for product entry.

- [ ] **Step 5: Verify/commit**

```bash
npx vitest run tests/public/public-route-continuity.test.jsx tests/routing.test.jsx
npm test
npm run build
git add src/public tests/public/public-route-continuity.test.jsx
git commit -m "feat(public-motion): add route continuity"
```

If transition is rejected, commit only scroll restoration with a correspondingly accurate message.

---

### Task 25: Complete responsive, keyboard and reduced-motion pass

**Files:**
- Modify: `src/public/styles/responsive.css`
- Modify: route/system CSS files as findings require.
- Modify: `src/public/components/PublicNav.jsx`, `StoryOverlay.jsx`, Signal/Loop components only for discovered accessibility defects.
- Add focused regression tests for each defect found.

**Interfaces:**
- Consumes completed route system.
- Produces mobile/reduced-motion/a11y-complete public site.

- [ ] **Step 1: Run manual viewport matrix from QA plan**

Use dev server and inspect required widths.

- [ ] **Step 2: Fix overflow and mobile substitutions explicitly**

Rules:
- timelines one-side rail mobile;
- pinned chapters normal flow mobile/reduced motion;
- StoryOverlay full screen mobile;
- marquees static/slower fallback;
- Magnet disabled coarse pointer;
- parallax off mobile/reduced motion.

- [ ] **Step 3: Keyboard pass**

Nav, menu, story archive/overlay, CTAs, route focus behavior.

- [ ] **Step 4: Add tests for every concrete defect fixed**

Example if mobile menu Escape is broken:

```jsx
fireEvent.click(screen.getByRole('button', { name: /menu/i }))
expect(screen.getByRole('navigation', { name: /mobile/i })).toBeInTheDocument()
fireEvent.keyDown(document, { key: 'Escape' })
expect(screen.queryByRole('navigation', { name: /mobile/i })).not.toBeInTheDocument()
```

- [ ] **Step 5: Full verify/commit**

```bash
npm test
npm run build
git add src/public tests/public
git commit -m "fix(a11y): harden responsive and reduced-motion experience"
```

---

### Task 26: Performance and bundle hardening

**Files:**
- Modify only files identified by profiling/build output.
- Potentially adjust lazy imports, media loading, ReactBits components, CSS.
- No speculative refactor without measured issue.

**Interfaces:**
- Produces final public bundle/runtime within reasonable budget without clinical regression.

- [ ] **Step 1: Run fresh build and compare baseline**

```bash
npm run build
```

Record public Home chunk, secondary route chunks, clinical/main chunks.

- [ ] **Step 2: Check dependency violations**

```bash
npm ls three ogl framer-motion motion lenis face-api.js 2>/dev/null || true
```

Expected: none introduced by redesign unless explicitly approved contrary to plan.

- [ ] **Step 3: Inspect likely runtime leaks**

Route Home → Science → Impact → Home repeatedly; verify ScrollTrigger count does not monotonically grow and offscreen video behavior is sane.

- [ ] **Step 4: Apply measured fixes**

Priority order:
1. remove unused ReactBits adapter/dependency;
2. lazy-load route-specific code;
3. simplify low-value animation;
4. reduce DOM duplication in loops;
5. optimize media loading.

- [ ] **Step 5: Clinical bundle regression check**

Compare build output to Task 1 baseline. Public-only code should not inflate clinical route entry materially.

- [ ] **Step 6: Verify/commit**

```bash
npm test
npm run build
git add -A
git commit -m "perf(public): harden reference-driven experience"
```

---

### Task 27: Final content/evidence and third-party cleanup

**Files:**
- Modify: public content files only for verified corrections.
- Modify: `THIRD_PARTY_NOTICES.md`
- Delete unused ReactBits adapters after import search.
- Update: `README.md` or landing-page docs with new public routes if appropriate.

**Interfaces:**
- Produces content/legal/licensing-clean release candidate.

- [ ] **Step 1: Run claim searches**

```bash
rg -n "medical-grade|replaces your doctor|replaces a doctor|saves lives|trusted by|used in [0-9]+ countries" src/public
rg -n "ILLUSTRATIVE|EXAMPLE READING|Research / future direction|Future integration" src/public
```

Review every hit manually.

- [ ] **Step 2: Verify scientific URLs/content**

Every `scienceMilestones` item must contain an actual cited URL and no `YYYY`, `TBD`, `TODO` or placeholder prose.

```bash
rg -n "YYYY|TBD|TODO|lorem ipsum" src/public docs/superpowers/plans docs/superpowers/specs
```

Any docs use of the word `placeholder` is expected for media; unresolved implementation content is not.

- [ ] **Step 3: Remove unused adapters only after search**

```bash
for name in CardSwap PixelTransition SpotlightCard ScrollReveal SplitText Magnet; do rg -n "$name" src/public || true; done
```

Delete only truly unused source and update third-party notice accordingly.

- [ ] **Step 4: Full verify/commit**

```bash
npm test
npm run build
git add -A
git commit -m "chore(public): finalize content and dependency hygiene"
```

---

### Task 28: Final verification and implementation handoff

**Files:**
- No production changes unless verification discovers a defect; defects receive focused fix/test commits before re-running this task.

**Interfaces:**
- Produces release-ready evidence, not a new feature.

- [ ] **Step 1: Run fresh complete automated verification**

```bash
npm test
npm run build
```

Expected: zero failing tests; build exit 0.

- [ ] **Step 2: Run complete Visual Gate D + clinical regression pass**

Review all routes and required widths from QA companion. Explicitly check `/scan`, `/dashboard`, `/report` remain clinical and free of public chrome/motion leakage.

- [ ] **Step 3: Verify working tree**

```bash
git status --short
git diff --check
```

Expected: clean working tree; no whitespace errors.

- [ ] **Step 4: Compare implementation branch against green base**

```bash
git diff --stat b444173f299f5e2022e53890363e77af877e5246...HEAD
git log --oneline b444173f299f5e2022e53890363e77af877e5246..HEAD
```

Review scope for accidental clinical changes.

- [ ] **Step 5: Prepare final handoff summary**

Include:

- routes built;
- visual gates passed;
- empty media slot inventory still requiring assets;
- current real vs illustrative content status;
- public/clinical bundle sizes;
- tests/build evidence;
- any intentionally deferred real photography/quotes;
- no claim that missing assets are complete content.

---

# Implementation sequencing summary

```text
1  clean green worktree
2  site facts + claim guardrails
3  media manifest + MediaFrame
4  reduced motion
5  Signal Thread
6  themed public shell
7  LoopBand / CountUp spike
8  Hero + access thesis
9  proof + science teaser        → VISUAL GATE A
10 StoryOverlay + Impact data
11 context stories + signal journey → VISUAL GATE B
12 signal marquee + media run
13 trust + evidence + language
14 platform arc + values + close → VISUAL GATE C
15 remove old Home implementation
16 expand routes
17 Screenings
18 Science
19 Impact
20 About
21 Journey
22 Platform
23 legal/trust pages            → VISUAL GATE D
24 route continuity
25 responsive/a11y/reduced motion
26 performance/bundle hardening
27 content/license cleanup
28 final fresh verification
```

# Final acceptance standard

The work is not complete merely because all routes render.

Completion requires all of the following simultaneously:

- Vytal public experience has reference-like editorial rhythm and page specialization;
- Signal Thread provides one ownable Vytal-native semantic language across routes;
- Home no longer reads as a uniform product-section stack;
- empty image/video frames are treated as final production geometry;
- Screenings is medically explicit about maturity;
- Science is sourced and honest about validation;
- Impact/Journey never fabricate patients or outcomes;
- Platform never presents future integrations as current;
- ReactBits remains implementation support rather than visual identity;
- mobile/reduced-motion experiences remain intentional;
- public animation/runtime does not contaminate the clinical app;
- all tests pass and the production build succeeds in a fresh final run.
