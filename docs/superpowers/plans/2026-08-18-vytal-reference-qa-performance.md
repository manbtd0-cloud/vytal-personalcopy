# Vytal Reference-Driven Redesign — QA, Performance & Visual Acceptance Plan

**Companion to the master implementation plan.** The redesign is not accepted on unit tests alone; its central requirement is experiential quality across screen sizes without compromising clinical correctness or bundle isolation.

---

# 1. Verification layers

Every implementation batch is checked in this order:

1. focused RED/GREEN unit/component test;
2. full `npm test`;
3. `npm run build`;
4. bundle/chunk inspection;
5. manual rendered visual review at required widths;
6. keyboard/reduced-motion review when applicable;
7. content/claim review;
8. commit only after the above relevant checks are satisfied.

The environment may use GitHub Actions for tests/build when local dependency execution is unavailable, but visual review must still be performed in a real rendered browser before a visual gate is approved.

---

# 2. Baseline commands

```bash
npm install
npm test
npm run build
```

Focused Vitest command:

```bash
npx vitest run tests/public/<file>.test.jsx
```

Start visual-review server:

```bash
npm run dev -- --host 0.0.0.0
```

Production preview when needed:

```bash
npm run build
npm run preview -- --host 0.0.0.0
```

---

# 3. Automated test requirements

## System primitives

- `MediaFrame` preserves slot geometry and emits slot/status attributes with no source.
- `MediaFrame` selects image/video behavior when source exists.
- `useReducedMotion` returns current preference and cleans listener.
- `SignalThread` exposes deterministic variant/state classes and hides decorative SVG from AT.
- `LoopBand` exposes one accessible semantic list while visual duplicate tracks are hidden.
- `StoryOverlay` opens/closes with keyboard and returns focus.
- section-theme boundaries expose correct theme attributes.

## Content truth

- supported-language count equals `SUPPORTED_LANGUAGES.length`;
- core screening count derives from `screenings.js`;
- every screening item has status;
- every research/future item has limitation/status text;
- every Impact scenario is illustrative initially;
- Journey carries real-case disclaimer;
- example results are labelled;
- future platform items show status;
- legal routes exist;
- public CTA routes to `/scan`;
- claim scanner catches a limited high-risk phrase list.

## Route contracts

All public routes render their unique H1/core premise.
Clinical routes still render independently.
404 remains public-only.

---

# 4. Claim scanner

Create a small test-only guardrail in `tests/public/content-claims.test.js`.

Suggested prohibited patterns:

```js
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
```

The test serializes reviewed public content objects, not generated DOM, and fails when these strings appear unexpectedly.

Do not include bare `/diagnosis/` because required disclaimers legitimately say `not diagnosis`.

---

# 5. Visual review matrix

## Required viewport widths

- 360 × 800
- 390 × 844
- 430 × 932
- 768 × 1024
- 1024 × 768
- 1280 × 800
- 1440 × 900
- 1920 × 1080

Not every task needs all eight. Visual gates use the matrix specified below.

## Browsers

Minimum manual final pass:

- Chromium/Chrome
- Firefox

Safari/WebKit should be checked before production launch if available, particularly clip-path/mask/video behavior.

---

# 6. Visual Gate A

Scope:

- public navigation shell;
- Hero;
- Access thesis;
- Proof field.

Widths:

- 390
- 768
- 1440
- 1920

Checklist:

- [ ] hero occupies a true cinematic first viewport;
- [ ] empty hero media frame looks intentional, not broken/loading;
- [ ] nav is editorial/transparent, not floating SaaS pill;
- [ ] headline dominates before explanation;
- [ ] Signal Thread is visible but not an ECG clone;
- [ ] hero → access-thesis transition changes pace;
- [ ] proof field changes physical/color rhythm;
- [ ] numbers are verified product facts;
- [ ] map says design intent, not deployment;
- [ ] no horizontal overflow;
- [ ] mobile title does not cover CTA/nav;
- [ ] reduced motion looks intentionally static.

Failure response:

Do not continue stacking downstream visual chapters on a weak grammar. Fix shell/typography/Signal Thread first.

---

# 7. Visual Gate B

Scope through Context Stories + Signal Journey.

Widths:

- 390
- 768
- 1440

Checklist:

- [ ] Science teaser reads as timeline, not cards;
- [ ] three context previews have visibly different compositions;
- [ ] each says Illustrative scenario;
- [ ] overlay is visually integrated and keyboard usable;
- [ ] CAPTURE / EXTRACT / VERIFY / EXPLAIN are four different editorial beats;
- [ ] no old four-card SaaS look survives;
- [ ] amber/mint semantics remain understandable without color alone;
- [ ] mobile story/order makes sense.

---

# 8. Visual Gate C

Scope: complete Home.

Widths:

- 360
- 430
- 768
- 1024
- 1440
- 1920

Checklist:

- [ ] page has major density changes;
- [ ] at least three clear tonal field changes;
- [ ] media run feels intentionally art-directed with blank frames;
- [ ] signal marquee and language marquee are differentiated;
- [ ] marquee seams do not jump;
- [ ] ivory trust reset is visually dominant and calm;
- [ ] evidence section contains no fake quote prose;
- [ ] platform/future content is clearly labelled;
- [ ] final CTA resolves hero motif;
- [ ] footer feels like final chapter;
- [ ] no section looks like random ReactBits demo;
- [ ] no long stretches of same-width/same-radius cards;
- [ ] scroll remains responsive on mid-range hardware;
- [ ] content remains usable when all media frames are empty.

---

# 9. Visual Gate D

Scope: all public routes.

Widths:

- 390
- 768
- 1440

Additional 1920:

- Home
- Science
- Platform

Checklist:

- [ ] Screenings is a capability atlas, not Home clone;
- [ ] Science is an irregular timeline/exhibition;
- [ ] Impact is a story archive;
- [ ] About is shorter and quieter;
- [ ] Journey is a single narrative case-study mode;
- [ ] Platform has fragments-to-context identity;
- [ ] all still share Signal Thread/palette/type/nav identity;
- [ ] route navigation has no broken focus/scroll states;
- [ ] future/research status remains obvious.

---

# 10. Accessibility pass

## Keyboard

Verify:

- nav links reachable in logical order;
- mobile menu opens from keyboard;
- Escape closes mobile menu;
- story tiles open via keyboard;
- StoryOverlay traps focus;
- prev/next/close controls reachable;
- focus returns to originating tile;
- CTA links have visible focus state;
- no focusable decorative marquee duplicates.

## Semantics

- one H1 per route;
- heading order remains logical;
- decorative SVGs/SignalThread hidden;
- meaningful diagrams have adjacent text equivalents;
- status is text, not color only;
- list-like content uses list semantics where appropriate.

## Contrast

Check text/interactive contrast on:

- Deep Ink
- Signal Coral
- Warm Ivory
- media scrims
- amber/mint status treatments.

---

# 11. Reduced-motion pass

Force browser/OS reduced motion.

Verify:

- no continuous marquee movement;
- no media parallax;
- no pinned scroll-jacking;
- no animated route wipe;
- hero thread appears in final/static state;
- CountUp shows final values;
- StoryOverlay remains understandable;
- video hero uses poster/static presentation where configured;
- all content appears without waiting for an animation callback.

Automated tests should verify primitive decisions; manual pass verifies composition.

---

# 12. Responsive overflow pass

At every target width inspect:

```js
Math.max(
  document.documentElement.scrollWidth,
  document.body.scrollWidth
) <= window.innerWidth
```

Any horizontal overflow is a blocker unless the specific component is an intentionally contained horizontal scroller with no page-level overflow.

Common risk areas:

- LoopBand tracks;
- huge display text;
- absolute Signal Thread SVGs;
- irregular media grids;
- Platform scattered fragments;
- sticky/pinned Signal Journey;
- full-screen mobile overlay.

---

# 13. Performance/bundle pass

## Build output

Run:

```bash
npm run build
```

Record:

- main/clinical shared chunks;
- PublicSite Home chunk;
- each lazy route chunk;
- CSS output.

Targets:

- public landing JS roughly <100 kB gzip beyond shared React/router code where practical;
- no Three/OGL/face-api marketing dependency;
- clinical chunk should not materially grow from supporting-route visuals;
- no duplicate animation runtime.

If budget exceeded:

1. identify exact module through build analyzer/manual chunk inspection;
2. remove/defer lowest-value dependency first;
3. lazy-load route-specific heavy content;
4. prefer custom GSAP/CSS behavior over a large component dependency.

Do not sacrifice core accessibility or medical truth to meet a cosmetic byte target.

---

# 14. Runtime-performance pass

Manual Chrome performance check on Home/Science/Platform:

- scroll entire page normally;
- watch for long main-thread stalls;
- verify no runaway RAF after leaving animated section;
- switch routes repeatedly and look for duplicated ScrollTriggers;
- open/close StoryOverlay multiple times;
- resize desktop → tablet width and recheck layout;
- inspect offscreen videos are paused/lazy where applicable.

Optional console debugging during development:

```js
gsap.plugins.ScrollTrigger?.getAll?.().length
```

The count should not monotonically grow after route changes.

---

# 15. Media-loading pass

With placeholders:

- all frames retain layout;
- no CLS from absent images.

With real test media inserted:

- hero image/video loads eagerly/priority appropriately;
- below-fold images are lazy;
- dimensions/aspect ratios prevent layout shift;
- video has poster;
- autoplay is muted/playsInline;
- page remains usable if video cannot play;
- responsive crop works at 390/768/1440.

---

# 16. Clinical regression boundary

After every major public phase run existing routing/smoke tests and manually confirm:

- `/scan` loads clinical UI;
- `/dashboard` loads clinical UI;
- `/report` loads clinical UI;
- public nav does not appear inside clinical layout;
- marketing CSS does not visibly leak into clinical UI;
- public GSAP effects do not execute on clinical routes.

The redesign is a public-surface project; breaking the medical app is a hard regression.

---

# 17. Content/evidence review

Before Gate C and final Gate D:

- compare all screening labels against `screenings.js`;
- verify language list against `SUPPORTED_LANGUAGES`;
- verify any Science timeline date against cited primary source;
- search for fake-looking social proof;
- search for unlabelled illustrative numbers;
- search for future hardware without status label;
- verify disclaimers are readable;
- verify map is not presented as deployment data.

Recommended searches:

```bash
rg -n "medical-grade|replaces your doctor|replaces a doctor|saves lives|trusted by|used in [0-9]+ countries" src/public
rg -n "ILLUSTRATIVE|EXAMPLE READING|Research / future direction|Future integration" src/public
```

---

# 18. Code cleanup pass

After Gate C approval:

- remove obsolete old Home components no longer imported;
- remove obsolete CSS rules;
- remove ReactBits adapters no longer used after redesign;
- verify third-party notices still match copied ReactBits code actually present;
- run full tests/build again.

Use imports/code search before deletion.

---

# 19. Final completion commands

Fresh final evidence:

```bash
npm test
npm run build
```

Then perform final manual Gate D review and clinical regression check.

No claim of completion should be made from an earlier CI run.
