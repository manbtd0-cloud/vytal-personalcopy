# Vytal Reference-Driven Public Experience — Canonical Implementation Plan

> **Execution rule:** use Superpowers `executing-plans` for inline execution or `subagent-driven-development` for delegated execution. Use TDD for behavioral work and fresh verification before every completion claim.

**Goal:** Rebuild the Vytal public experience to carry the strongest experiential qualities of the Save a Child’s Heart 25th-anniversary reference—cinematic opening, long-form editorial pacing, meaningful motion, nonuniform chapter geometry, human/media rhythm, longitudinal storytelling, route-specific narrative modes and decisive closes—while remaining original to Vytal in branding, copy, assets, scientific honesty and interaction language.

**Execution base:** `b444173f299f5e2022e53890363e77af877e5246` — last green public-site implementation.

**Never use as execution base:** `93be2495f300d6d9f412d10b87fd2ecf0e5905bf` — unfinished RED-only Screenings task.

## Companion documents — authoritative detail

Read in this order before code:

1. `docs/reference-audits/2026-08-18-save-a-childs-heart-25-forensic-audit.md`
2. `docs/superpowers/specs/2026-08-18-vytal-reference-driven-public-site-design.md`
3. `docs/superpowers/specs/2026-08-18-vytal-sach25-reference-crosswalk.md`
4. `docs/superpowers/specs/2026-08-18-vytal-reference-driven-route-blueprints.md`
5. `docs/superpowers/specs/2026-08-18-vytal-motion-reactbits-system.md`
6. `docs/superpowers/specs/2026-08-18-vytal-media-slot-manifest.md`
7. `docs/superpowers/specs/2026-08-18-vytal-content-evidence-rules.md`
8. `docs/superpowers/plans/2026-08-18-vytal-reference-redesign-architecture.md`
9. `docs/superpowers/plans/2026-08-18-vytal-reference-home-execution.md`
10. `docs/superpowers/plans/2026-08-18-vytal-reference-supporting-routes.md`
11. `docs/superpowers/plans/2026-08-18-vytal-reference-qa-performance.md`

The companion files contain exact media-slot IDs, component contracts, route chapter anatomy, tests, viewport matrices, motion rules and content restrictions. This canonical plan locks the final sequence and resolves all earlier optional forks.

---

# A. Final locked decisions

## A1. Runtime

Use only:

- React / React Router / Vite already present
- GSAP + `@gsap/react`
- GSAP ScrollTrigger
- CSS/SVG

Do not add Motion/Framer Motion, Lenis, Three.js, OGL, Locomotive Scroll, face-api.js for public decoration, shader libraries or cursor libraries.

## A2. ReactBits

**Baseline redesign uses:**

- Split Text
- Magnet
- Scroll Reveal

**Baseline redesign does not use:**

- Scroll Velocity — current official source imports `motion/react`
- Count Up — current official source imports `motion/react`
- Masonry — GSAP-only, but auto-reflow conflicts with our fixed editorial placement
- Scroll Stack
- Scanner
- Grid Scan
- Dark Veil
- Spotlight-card grids as a dominant visual language
- Card Swap
- Pixel Transition

Card Swap and Pixel Transition may remain in the repository temporarily because the previous green implementation uses them, but the new reference-driven baseline does not depend on them. Remove them in cleanup if no surviving route imports them.

Their useful ideas are replaced by Vytal-native Signal Thread / MediaFrame / product-UI compositions.

## A3. Home color-field sequence

Lock the major Home fields:

- H01 Hero: media-dark / deep ink
- H02 Access thesis: deep ink
- H03 Proof field: **Signal Coral field with Ink text**
- H04 Science teaser: deep ink
- H05 Context stories: media-dark
- H06 Signal Journey: deep ink
- H07 Signal band: coral/ink kinetic field
- H08 Documentary run: deep ink / media-dominant
- H09 Trust reset: **Warm Ivory / Ivory Ink**
- H10 Evidence: deep ink
- H11 Language band: dark with mint/ivory signal accents
- H12 Platform arc: deep ink
- H13 Concrete value: Warm Ivory or Ivory-dominant split field
- H14 Final entry: **Deep Ink with resolved coral/mint Signal Thread**

Exact minor shades come from existing Vytal tokens; do not reopen palette direction during implementation.

## A4. Typography

Keep Poppins + JetBrains Mono for baseline. Do not introduce a new display font during structural implementation. Reconsider only after Gate C if typography alone is proven to limit quality.

## A5. Media layout

Home documentary run is an explicit 12-column CSS Grid. No Masonry engine.

## A6. Loop/counter implementation

Build:

- custom GSAP/CSS `LoopBand`
- custom GSAP `NumberReveal`

Do not copy ReactBits Scroll Velocity/Count Up because doing so would add Motion.

## A7. Route transitions

No speculative full-screen public page-transition wipe in baseline. Exact reference transitions were not verified. Implement reliable scroll restoration and section/nav theme continuity only.

## A8. Proof honesty

Never fabricate people, quotes, hospitals, partners, deployments, user counts, medical accuracy, patient outcomes or countries served.

Empty proof/media slots remain visibly intentional. Human narratives remain `Illustrative scenario` until real permissioned material exists.

## A9. Clinical boundary

Do not redesign `/scan`, `/dashboard`, `/report`. Public GSAP/CSS must remain lazy and isolated from clinical UI.

---

# B. Final public route system

```text
/                    Home — master sensing documentary
/screenings          Screening capability atlas
/science             Science / validation timeline exhibition
/impact              Illustrative context-story archive
/about               Short mission / principles page
/journey             Illustrative screening journey case-study mode
/platform            Future fragments-to-context platform metaphor
/privacy             Plain trust/legal page
/medical-disclaimer  Plain medical-boundary page
/*                   Public 404

/scan                 Clinical app — unchanged visual register
/dashboard            Clinical app — unchanged visual register
/report                Clinical app — unchanged visual register
```

---

# C. Final Home narrative

The final 14 chapters are fixed:

1. `hero` — full-viewport media + RAW Signal Thread + intrigue
2. `access-thesis` — sparse mission/access statement
3. `proof` — coral verified-product-fact field
4. `science-lineage` — compact sourced timeline
5. `context-stories` — three nonuniform illustrative human contexts
6. `signal-journey` — CAPTURE / EXTRACT / VERIFY / EXPLAIN as four different editorial beats
7. `signal-band` — semantic screening vocabulary loop
8. `documentary-run` — 10 production-sized irregular media placeholders
9. `trust-reset` — ivory `Sometimes the right result is no result.`
10. `evidence` — clinician/health-worker pending slots + sourced evidence + Vytal principle
11. `language-band` — 8 current supported languages
12. `platform-arc` — CAMERA FIRST / CONFIDENCE AWARE / CONTEXT OVER TIME / BEYOND CAMERA
13. `concrete-value` — SCAN / RESULT / EXPLANATION / HISTORY / HANDOFF
14. `final-entry` — `See what your camera can tell you.`

Do not reorder during coding without a new design decision.

---

# D. Task execution sequence

## Task 01 — Create isolated green worktree

**Production files:** none.

```bash
git worktree add ../vytal-reference-redesign -b landing-page-reference-redesign b444173f299f5e2022e53890363e77af877e5246
cd ../vytal-reference-redesign
npm install
npm test
npm run build
```

Record baseline Vite chunk sizes for comparison in Task 26. Bring docs-only redesign commits into this worktree without importing `93be249...` production changes.

**Gate:** zero test failures, build exit 0 before redesign code.

---

## Task 02 — Public facts + claim scanner

**Create:**

- `src/public/content/siteFacts.js`
- `tests/public/site-facts.test.js`
- `tests/public/content-claims.test.js`

**Source facts:**

- language count from `SUPPORTED_LANGUAGES.length`
- core-screening count from `screenings.filter(status === 'Core')`
- quality factors from one canonical list: Motion / Lighting / Signal quality / Confidence

**TDD:** tests first; focused RED; implement; focused GREEN; `npm test`; `npm run build`.

Claim test rejects high-risk unsupported phrases listed in content/evidence spec but permits legitimate `not diagnosis` disclaimers.

**Commit:** `feat(public-content): centralize facts and claim guardrails`

---

## Task 03 — Central `useReducedMotion`

**Create:**

- `src/public/hooks/useReducedMotion.js`
- `tests/public/reduced-motion.test.jsx`

Test mocked `matchMedia` true/false and listener cleanup.

Migrate existing public animation adapters to the hook only where behavior stays equivalent.

**Verify:** focused test + existing ReactBits primitive tests + full suite/build.

**Commit:** `refactor(public-motion): centralize reduced-motion state`

---

## Task 04 — Complete `mediaSlots` registry + `MediaFrame`

**Create:**

- `src/public/content/mediaSlots.js`
- `src/public/components/system/MediaFrame.jsx`
- `src/public/styles/media-frame.css`
- `tests/public/media-slots.test.js`
- `tests/public/media-frame.test.jsx`

Use the complete media-slot ID list from `2026-08-18-vytal-reference-redesign-architecture.md`. The test must fail if even one planned slot is omitted.

`MediaFrame` must:

- occupy final aspect ratio even without source;
- show quiet intentional surface, not shimmer;
- emit `data-media-slot` / `data-media-status`;
- support image/video;
- use hero priority only where configured;
- lazy-load below-fold media;
- disable motion/parallax under reduced motion.

**Gate:** every Home/Screenings/Science/Impact/About/Journey/Platform slot exists before any page build starts.

**Commit:** `feat(public-system): add production media placeholders`

---

## Task 05 — Signal Thread system

**Create:**

- `SignalThread.jsx`
- `SignalMarker.jsx`
- `SpectralSamples.jsx`
- `RoiFrame.jsx`
- `signal-thread.css`
- `signal-thread.test.jsx`

Fixed semantic variants:

- RAW
- LOCK
- TRUSTED
- CONTEXT
- TIMELINE
- NETWORK
- DIVIDER

Use deterministic coordinates and SVG/CSS. Never `Math.random()`. Never literal ECG geometry.

Reduced motion renders final semantic state.

**Commit:** `feat(public-system): add Vytal Signal Thread`

---

## Task 06 — Section themes + editorial public shell

**Create:**

- `SectionThemeBoundary.jsx`
- `useSectionTheme.js`
- `public-nav-theme.test.jsx`

**Rebuild:**

- `PublicNav.jsx`
- `PublicFooter.jsx`
- `PublicLayout.jsx`

Nav is fixed/transparent over Hero, section-aware over dark/coral/ivory, no permanent SaaS pill. Mobile uses full-screen editorial menu with Escape, focus safety and body lock.

Footer contains real route/trust content only; no fake socials/newsletter.

**Commit:** `feat(public-shell): build editorial themed navigation`

---

## Task 07 — Custom `LoopBand` + `NumberReveal`

**Create:**

- `LoopBand.jsx`
- `VisuallyHiddenList.jsx`
- `NumberReveal.jsx`
- tests/CSS

`LoopBand`:

- one semantic accessible list;
- hidden visual duplicated track;
- GSAP continuous transform;
- `ResizeObserver` measurement;
- minimal seam duplication;
- reduced motion = static/wrapped row;
- cleanup tween/observer.

`NumberReveal`:

- final numeric text exists as fallback;
- GSAP enhancement on first view;
- reduced motion shows final value;
- animate once.

**Commit:** `feat(public-system): add semantic motion bands and facts`

---

# E. Home build — visual gates are mandatory

## Task 08 — H01 Hero + H02 Access thesis

**Create:**

- `home-reference/HeroMediaChapter.jsx`
- `AccessThesisChapter.jsx`
- `home-reference.css`
- `home-reference-structure.test.jsx`

Hero uses `HOME-HERO-01`, RAW Signal Thread, mystery copy and scroll cue. No feature dump.

Access thesis is sparse, not card-based.

Run focused Home tests + existing landing/routing tests + full build.

**Commit:** `feat(home): rebuild cinematic opening chapters`

---

## Task 09 — H03 coral Proof + H04 sourced Science teaser

**Create:**

- `ProofFieldChapter.jsx`
- `ScienceLineageChapter.jsx`
- `src/public/content/science.js`

Proof uses only derived facts and explicitly says map/access field is not deployment data.

Science data begins with these verified milestones:

- 2008 Verkruysse/Svaasand/Nelson — ambient-light remote plethysmographic imaging
- 2010 Poh/McDuff/Picard — automated video pulse extraction
- 2013 de Haan/Jeanne — chrominance robustness
- 2016 Moço/Stuijk/de Haan — motion-artifact/color mapping
- 2017 Wang et al. — algorithmic principles of remote PPG
- 2019 Gudi et al. — real-time camera heart-rate / beat-timing variability pipeline
- 2026 Vytal prototype — internal milestone, explicitly not peer-reviewed publication

Exact primary URLs are fixed in the earlier master/Science companion and must be copied into `science.js`.

**After GREEN/full build: VISUAL GATE A** at 390 / 768 / 1440 / 1920.

Gate A must establish the art direction before downstream visual work.

---

## Task 10 — Impact scenario model + `StoryOverlay`

**Create:**

- `content/impact.js`
- `StoryOverlay.jsx`
- `story-overlay.test.jsx`

Six scenario IDs are fixed:

- individual-home
- community-health-worker
- low-connectivity
- multilingual-explanation
- longitudinal-follow-up
- referral-continuity

Every scenario is visibly illustrative and has three production media-slot IDs.

Overlay requires dialog semantics, focus trap, Escape, body lock, focus restore, previous/next and mobile full-screen sheet.

**Commit:** `feat(public-system): add illustrative story overlays`

---

## Task 11 — H05 Context stories + H06 Signal Journey

Create nonuniform story previews and four physically different signal chapters:

- CAPTURE
- EXTRACT
- VERIFY
- EXPLAIN

Desktop may use short pin/sticky enhancement only after static composition works; mobile/reduced motion is normal flow.

**After GREEN/full build: VISUAL GATE B** at 390 / 768 / 1440.

---

## Task 12 — H07 Signal band + H08 documentary media run

Signal band derives titles/statuses from canonical Screenings and uses custom `LoopBand`.

Documentary run renders `HOME-MEDIA-01` through `HOME-MEDIA-10` in the fixed art-directed CSS Grid from Home execution companion.

No Masonry. No stock substitution.

---

## Task 13 — H09 Trust + H10 Evidence + H11 Language band

Trust field is Warm Ivory:

`Sometimes the right result is no result.`

Show:

- MOVEMENT → SIGNAL LOST → RETRY
- STABLE INPUT → SIGNAL LOCK → SCREENING CONTEXT

Evidence composition has:

- clinician/researcher voice placeholder — no quote prose
- health-worker voice placeholder — no quote prose
- sourced research evidence note
- Vytal principle: `AI explains the measurements. It doesn’t invent them.`

Language band derives the exact 8 current languages from `SUPPORTED_LANGUAGES`.

---

## Task 14 — H12 Platform arc + H13 concrete value + H14 final entry

Platform arc:

- CAMERA FIRST
- CONFIDENCE AWARE
- CONTEXT OVER TIME
- BEYOND CAMERA — explicit research/future status

Concrete units:

- SCAN
- RESULT
- EXPLANATION
- HISTORY
- HANDOFF

Final:

`See what your camera can tell you.`

- Start Screening → `/scan`
- Explore Screenings → `/screenings`
- readable screening-not-diagnosis text.

**After GREEN/full build: VISUAL GATE C** at 360 / 430 / 768 / 1024 / 1440 / 1920.

---

## Task 15 — Remove old Home only after Gate C approval

Search imports first. Delete only no-longer-used old Home components/CSS. Remove CardSwap/PixelTransition/Spotlight adapters at this point if the new site no longer imports them anywhere.

Run full tests/build after cleanup.

---

# F. Supporting routes — each must have different narrative physics

## Task 16 — Expand public route tree

Add/lazy-load:

- `/screenings`
- `/science`
- `/impact`
- `/about`
- `/journey`
- `/platform`
- `/privacy`
- `/medical-disclaimer`

Create `public-routing-expanded.test.jsx` with unique page-premise assertions. Keep clinical route tests intact.

---

## Task 17 — `/screenings`: capability atlas

Physical mode: precise, high-intent atlas—not Home clone and not equal cards.

Chapters:

1. hero
2. sticky/category navigator
3. Core physiological — largest
4. Research/experimental — varied weights
5. Context/triage — text-led
6. Future integrations — clearly separate
7. What Vytal does not claim — trust field
8. Start Screening / Science CTA

Every item renders canonical status, input, method/looks-for, output, limitation and confirmation.

---

## Task 18 — `/science`: sourced research/history exhibition

Physical mode: long irregular timeline.

Signal Thread becomes timeline rail.

Mandatory chapters:

- measurement problem
- optical/PPG lineage
- camera/ROI
- signal extraction
- motion/lighting
- beat timing/variability
- research screening branches
- uncertainty
- current Vytal implementation truth
- What We Do Not Claim
- validation roadmap
- references.

Milestone weights control geometry; no uniform timeline cards. Mobile uses one-side rail.

Every external milestone has real citation URL; Vytal 2026 is internal-labelled.

---

## Task 19 — `/impact`: contextual story archive

Physical mode: nonuniform visual archive + same-page overlay.

Use the six Task-10 scenarios and all their media slots.

Include `SCREEN / SAVE / EXPLAIN / REFER` rhythm chapter.

No fake names, quotes or outcomes.

---

## Task 20 — `/about`: short origin/principles experience

Physical mode: quieter, shorter editorial page.

H1 concept:

`Make sophisticated screening easier to reach—and harder to overclaim.`

Principles:

- Accessible
- Evidence-aware
- Honest about uncertainty
- Human-understandable

Different visual weights, no four-card grid.

Team frames remain empty until real assets exist.

---

## Task 21 — `/journey`: illustrative case-study mode

Mandatory first-viewport label:

`ILLUSTRATIVE SCREENING JOURNEY — NOT A REAL PATIENT CASE`

Story order:

1. context
2. first scan low confidence
3. retry / signal lock
4. example result
5. explanation
6. saved history
7. illustrative trend
8. verified product facts
9. Start Screening close.

The key dramatic event is the product refusing a poor reading.

Every sample value/chart says EXAMPLE / ILLUSTRATIVE.

---

## Task 22 — `/platform`: fragments-to-context metaphor

Physical mode: separate sensor/context fragments gradually connected into a coherent system.

Fragments:

- camera
- BLE
- wearable
- thermal
- records
- language
- referral
- population research

Signal Thread NETWORK connects them as context grows.

No literal mosaic tiles.

Future/prototype statuses remain visible beside each non-current fragment.

---

## Task 23 — Trust/legal routes + public 404

Privacy reflects actual current code/data behavior only.

Medical Disclaimer explicitly covers:

- screening/research, not diagnosis
- experimental pathways
- signal-quality limitations
- professional confirmation where appropriate
- urgent/concerning symptoms override app reassurance.

No cinematic scroll traps on legal routes.

**After GREEN/full build: VISUAL GATE D** on all public routes at 390 / 768 / 1440; also 1920 for Home / Science / Platform.

---

# G. Cross-route hardening

## Task 24 — Scroll restoration and continuity

Implement pathname-based public scroll restoration.

Test `window.scrollTo` on route change.

Do not build a full-screen transition wipe.

Nav/theme transitions remain subtle and immediate; `/scan` entry must never be artificially delayed.

---

## Task 25 — Responsive / keyboard / reduced-motion pass

Required widths:

- 360×800
- 390×844
- 430×932
- 768×1024
- 1024×768
- 1280×800
- 1440×900
- 1920×1080

Hard requirements:

- no page-level horizontal overflow
- timeline one rail mobile
- no mobile scroll-jacking
- StoryOverlay full-screen mobile
- LoopBand stops under reduced motion
- parallax/pinning off under reduced motion
- Magnet off coarse pointer
- hover-only meaning forbidden
- mobile menu keyboard/Escape/focus correct
- status never color-only
- all empty MediaFrames remain intentional at every breakpoint.

Add a regression test for every concrete behavioral/a11y defect found.

---

## Task 26 — Performance + bundle hardening

Compare against Task-01 baseline.

Run:

```bash
npm run build
npm ls three ogl framer-motion motion lenis face-api.js 2>/dev/null || true
```

Expected: no new forbidden dependency.

Target: public landing JS roughly under 100 kB gzip beyond shared React/router code where practical. Any breach must be tied to a concrete visible benefit.

Check repeated Home→Science→Impact→Home navigation for ScrollTrigger/tween leaks. Offscreen videos should not continue unnecessary work.

Optimization order:

1. remove unused old adapter/component
2. lazy-load route-specific code
3. simplify low-value animation
4. reduce loop duplication
5. optimize media.

Clinical bundle must not materially grow from public-only visuals.

---

## Task 27 — Content/evidence/license cleanup

Run:

```bash
rg -n "medical-grade|replaces your doctor|replaces a doctor|saves lives|trusted by|used in [0-9]+ countries" src/public
rg -n "ILLUSTRATIVE|EXAMPLE READING|Research / future direction|Future integration" src/public
rg -n "YYYY|TBD|TODO|lorem ipsum" src/public
```

Review every hit.

Before completion:

- all science dates resolved
- all citations real
- no fake proof
- all future integrations labelled
- all scenarios/results labelled illustrative where applicable
- unused ReactBits code removed
- `THIRD_PARTY_NOTICES.md` matches retained copied source.

---

# H. Fresh final verification

## Task 28 — Release-candidate verification and handoff

Run fresh:

```bash
npm test
npm run build
git diff --check
git status --short
```

Then manually recheck:

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

Compare implementation scope:

```bash
git diff --stat b444173f299f5e2022e53890363e77af877e5246...HEAD
git log --oneline b444173f299f5e2022e53890363e77af877e5246..HEAD
```

Final handoff records:

- routes implemented
- four visual gates passed
- test/build evidence
- final public and clinical bundle sizes
- which media slots are still empty
- which material is sourced vs illustrative vs future/research
- any real photography/quotes still awaiting assets/permission.

Do not describe empty media/story slots as finished content.

---

# I. Acceptance standard

The redesign is complete only when all are simultaneously true:

1. Home reads like one continuous designed health-sensing story, not a SaaS section stack.
2. The public site achieves reference-like variation between cinematic, sparse, data, timeline, story, media, trust and conversion chapters.
3. Signal Thread is recognizably Vytal and repeatedly changes semantic function without becoming a heartbeat clone.
4. Empty media frames are full production geometry and still create intentional visual rhythm.
5. Screenings makes maturity differences impossible to miss.
6. Science is sourced and separates literature from Vytal validation.
7. Impact and Journey do not invent patients or outcomes.
8. Platform does not imply future hardware is production-ready.
9. Supporting pages share identity but are not Home templates with replaced text.
10. ReactBits contributes selected mechanics only; it does not dictate visual identity.
11. Mobile and reduced-motion experiences are intentionally designed.
12. Clinical pages remain visually/performance-isolated from the marketing experience.
13. Fresh final tests pass and production build succeeds.
