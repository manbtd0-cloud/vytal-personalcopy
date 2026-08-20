# Vytal Reference-Driven Redesign — Motion, Interaction & ReactBits System

**Purpose:** Define the reusable motion/interaction architecture that lets the public site approach the Save a Child's Heart reference site's richness without becoming a heavy animation showcase.

---

# 1. Governing principle

Motion must carry meaning.

A Vytal animation earns its place only when it communicates one of these ideas:

1. hidden information becoming visible;
2. noisy input becoming a usable signal;
3. confidence becoming stronger or weaker;
4. one reading becoming part of a sequence;
5. many signals/contexts forming a broader system;
6. human stories or evidence being progressively disclosed;
7. a route/chapter changing semantic register.

If an effect does not improve one of those meanings, it is decorative and should normally be removed.

---

# 2. Runtime policy

## 2.1 Allowed runtime

Primary animation runtime:

- `gsap`
- `@gsap/react`
- `ScrollTrigger` from GSAP

CSS transitions/keyframes remain appropriate for:

- button hover/active states;
- simple opacity/transform changes;
- static reduced-motion fallbacks;
- tiny ambient effects where no JS state is needed.

## 2.2 Not added by default

- Framer Motion / Motion
- Lenis
- Three.js
- OGL
- Locomotive Scroll
- face-api.js for decoration
- shader libraries
- a custom cursor library

No second animation runtime is introduced merely because a copied ReactBits component happens to use one.

---

# 3. Global reduced-motion contract

Create a reusable `useReducedMotion()` hook used by every JS-driven motion primitive.

Contract:

- reads `(prefers-reduced-motion: reduce)`;
- responds if preference changes during session;
- returns boolean;
- no component duplicates its own ad-hoc media-query implementation after migration.

When reduced motion is active:

- looping marquees stop;
- parallax is disabled;
- route wipes become simple opacity changes or none;
- Signal Thread renders final semantic state immediately;
- story overlay uses short opacity transition only;
- background/cinematic video uses poster/static image where practical;
- CountUp displays final number without counting;
- pinned sections become normal document flow;
- SplitText/ScrollReveal render final text immediately or with minimal opacity transition.

Information and hierarchy must remain identical.

---

# 4. Signal Thread architecture

## 4.1 Component family

### `SignalThread`
Top-level semantic visual primitive.

Suggested conceptual props:

- `variant`: `raw | lock | trusted | context | timeline | network | divider`
- `progress`: optional controlled `0..1`
- `direction`: `horizontal | vertical | path`
- `tone`: `coral | amber | mint | ivory | ink | auto`
- `density`: `quiet | normal | dense`
- `animate`: boolean/default true
- `decorative`: default true
- `className`
- `children` for labels/markers when semantically required

### `SignalMarker`
Optional semantic marker on timeline/path.

Props:

- `label`
- `state`
- `position`
- `active`

### `SpectralSamples`
Small reusable raw-input point/trace field.

No infinite random-particle engine. Sample coordinates should be deterministic from a fixed seed or explicit data array so screenshots/tests remain stable.

### `RoiFrame`
Corner/focus frame used in capture/quality chapters.

## 4.2 Rendering

Preferred implementation:

- SVG for paths, strokes, markers, and clipping;
- small DOM spans only for sample dots where SVG would be more awkward;
- GSAP animates `strokeDashoffset`, opacity, transform, clip-path, and marker state;
- CSS custom properties expose colors and line weights.

## 4.3 State semantics

### RAW
- irregular points/traces;
- slight RGB/spectral separation;
- low opacity;
- no mint;
- visual uncertainty.

### LOCK
- ROI frame becomes clear;
- one trace begins to dominate;
- amber can mark caution/quality checking;
- sample noise reduces.

### TRUSTED
- line becomes coherent;
- mint appears;
- optional confidence marker;
- no exaggerated medical-monitor ECG shape.

### CONTEXT
- clean line extends through time or branches to other sources;
- becomes trend/timeline/network rather than pulse waveform.

## 4.4 Section-specific manifestations

Home Hero: RAW scan over media.
Home proof: data-point connector.
Home science teaser: timeline.
Home signal journey: RAW → LOCK → TRUSTED.
Home trust: failure/retry vs stable lock.
Home language band: clean divider/thread.
Home platform teaser: first branching network.
Science: long timeline rail.
Journey: quality-state spine.
Platform: multi-fragment network.
Footer: static final thread/divider only if composition needs it.

---

# 5. Section theme system

The redesigned site crosses dark, coral, ivory, and media-dominant chapters. Navigation and certain fixed UI must adapt.

## 5.1 `SectionThemeBoundary`

Each major section declares a semantic theme:

- `dark`
- `light`
- `coral`
- `media-dark`

The boundary exposes a `data-public-theme` attribute.

## 5.2 `useSectionTheme`

A single observer tracks which themed section occupies the navigation threshold.

Implementation goals:

- one `IntersectionObserver`, not one scroll listener per section;
- updates root/public-layout state;
- navigation chooses light/dark logo/text treatment;
- transitions color over ~200–350ms;
- no expensive layout polling.

## 5.3 Nav states

At top of hero:
- transparent;
- appropriate text based on hero media overlay.

After scroll threshold:
- optional subtle backdrop blur/background;
- no permanently floating rounded pill.

Over ivory:
- dark ink nav.

Over coral:
- ink or ivory determined by contrast test.

---

# 6. Editorial text motion

## 6.1 Split Text

Use for:

- Hero headline;
- one or two major page intros;
- selected chapter statements.

Do not split every heading.

Timing band:
- word delay ~45–95ms;
- duration ~0.65–1.0s;
- ease `power3.out` or `power4.out`;
- avoid character-by-character animation for long medical text.

## 6.2 Scroll Reveal

Use for:

- sparse editorial statements;
- trust reset headline;
- selected Science statements.

Avoid applying to paragraphs that should simply be readable.

## 6.3 Scroll Float candidate

Prototype only for one large transitional word/statement if it visually supports the reference-like editorial rhythm. Reject if it feels like a ReactBits demo.

---

# 7. Media reveal system

## 7.1 `MediaFrame` reveal variants

Supported reveal names:

- `none`
- `fade`
- `clip-up`
- `clip-left`
- `soft-scale`
- `wipe-signal`

No more than 3 reveal families should appear prominently on a single route.

## 7.2 `wipe-signal`

A Signal Thread-like line travels across the frame while the media clip expands behind it.

This is the most Vytal-specific reveal and should be reserved for important images/hero transitions.

## 7.3 Parallax

Only selected large frames get subtle parallax.

Desktop magnitude target:
- ~12–36px travel over section progress.

Never large enough to expose empty image edges or induce motion sickness.

Disabled on reduced motion and usually on small mobile widths.

---

# 8. Moving semantic bands

The reference uses repeated names/countries/statistics. Vytal uses semantic loops.

## 8.1 `LoopBand`

One reusable wrapper supports:

- screening/signal names;
- supported languages;
- product/system facts;
- platform fragments if needed.

Props:

- `items`
- `speed`
- `direction`
- `pauseOnHover`
- `ariaLabel`
- `reducedMotionMode`: `wrap | scroll | static`
- optional `renderItem`

## 8.2 Implementation choice gate

Prototype two approaches:

A. ReactBits `Scroll Velocity`
B. custom GSAP/CSS transform loop

Choose based on:

- deterministic layout;
- accessibility;
- resize behavior;
- no visual jump at seam;
- DOM duplication count;
- bundle cost;
- mobile behavior;
- ease of pausing for reduced motion.

The implementation plan should include a small isolated spike/test before committing to either.

## 8.3 Accessibility

The visual loop must not cause a screen reader to read duplicated items repeatedly.

Pattern:

- one semantic hidden/static list for assistive technology;
- visual duplicated track marked `aria-hidden="true"`.

---

# 9. Verified-stat animation

ReactBits `Count Up` is allowed for verified numeric facts.

Requirements:

- numeric source comes from one content constant/model where practical;
- no decorative fake metrics;
- final text remains visible if JS/motion disabled;
- labels make units/meaning explicit;
- animate once per page view, not every tiny viewport re-entry.

---

# 10. Science timeline motion

## 10.1 Desktop

- long Signal Thread rail;
- ScrollTrigger maps overall page progress to path draw;
- each milestone gets an activation threshold;
- active milestone may brighten, reveal media, or switch line state;
- selected milestones can pin for short durations if the content benefits.

## 10.2 Mobile

- single left rail;
- no alternating left/right zig-zag that compresses text;
- no long pinned sequences;
- thread path largely vertical;
- content remains normal scroll document.

## 10.3 Reduced motion

Full line visible from start; milestone content static.

---

# 11. Story overlay interaction

Used primarily on `/impact` and Home story previews.

## 11.1 Open behavior

- click/Enter opens selected scenario;
- overlay receives focus;
- body scroll locks;
- background content is inert/aria-hidden where supported;
- focus moves to close button or heading.

## 11.2 Motion

Desktop normal motion:
- selected tile media may scale/expand toward overlay position;
- background dims;
- overlay content staggers softly.

Do not attempt a brittle pixel-perfect FLIP transition if it adds large complexity. A controlled scale/fade/clip transition is acceptable.

## 11.3 Close behavior

- close button;
- Escape;
- optional backdrop click if unambiguous;
- focus returns to triggering story tile;
- previous/next scenario controls available in overlay.

## 11.4 Mobile

Overlay becomes full-screen sheet/page-like layer.

---

# 12. Raw → explained transition

The existing PixelTransition concept remains valid if it survives visual review.

Semantic job:

- show that measurements exist before AI explanation;
- user can toggle between `Raw reading` and `Explained`;
- raw values never disappear from provenance.

Requirements:

- controlled component state;
- keyboard accessible tabs/buttons;
- example values visibly labeled `EXAMPLE READING`;
- no AI animation that makes it appear the model generated the physiological values.

If PixelTransition feels visually foreign after the redesign, replace with a custom mask/clip reveal using the Signal Thread.

---

# 13. Product UI proof motion

CardSwap remains a candidate for one product chapter only.

Allowed states:

- Acquisition
- Signal Quality
- Result Explained

Rules:

- all sample metrics labeled illustrative;
- cards use actual Vytal visual language, not generic device mockups;
- autoplay interval long enough to read (~4.5–6.5s);
- controls available;
- reduced motion disables auto swapping.

If CardSwap competes with the reference-inspired editorial flow, downgrade to a static three-frame sequence.

---

# 14. Route transitions

A public-only transition can make the route system feel like one continuous experience.

## 14.1 Preferred concept

Signal Thread wipe:

1. short line/spectral field crosses viewport;
2. outgoing content fades/clips;
3. route changes;
4. incoming page appears as thread resolves.

## 14.2 Constraints

- target total duration ~450–750ms;
- never delay direct `/scan` entry significantly;
- clinical routes do not inherit this heavy transition;
- browser back/forward remains functional;
- reduced motion uses immediate/short fade;
- route scroll restoration handled explicitly.

Implementation only after pages themselves are stable; do not build route-transition infrastructure first.

---

# 15. Hover and pointer behavior

No global custom cursor.

Allowed hover patterns:

- Magnet on primary marketing CTAs;
- media frame caption/metadata reveal;
- subtle link underline/thread extension;
- story tile image scale <= ~1.03;
- screening detail focus/hover state;
- no information hidden exclusively behind hover.

Touch/coarse pointers disable Magnet and hover-only transforms where appropriate.

---

# 16. Mobile substitutions

Every desktop effect gets an explicit mobile decision.

| Desktop effect | Mobile behavior |
|---|---|
| hero video | poster or playsInline video if appropriate |
| media parallax | disabled or very small |
| pinned editorial chapter | normal stacked flow |
| two-direction marquee | slower single-direction or static scroll strip |
| complex science timeline | single vertical rail |
| story overlay | full-screen sheet |
| Magnet | disabled on coarse pointer |
| hover media reveal | always-visible metadata or tap-safe state |
| large multi-column proof field | sequential stat blocks |
| route wipe | shorter/simple version |

---

# 17. Cleanup and lifecycle

Every GSAP component must:

- use `useGSAP`/GSAP context or explicit cleanup;
- kill owned ScrollTriggers on unmount;
- not call `ScrollTrigger.killAll()` globally;
- refresh ScrollTrigger after significant media/layout changes through a centralized utility where necessary;
- avoid duplicate registrations in hot reload where possible;
- avoid creating a new `matchMedia` listener in every component after `useReducedMotion` is centralized.

---

# 18. Performance guardrails

- animation only `transform`, `opacity`, SVG stroke, clip/mask where practical;
- avoid animating expensive box-shadow/filter continuously;
- no dozens of `will-change` declarations left permanently active;
- no infinite RAF loop for static pages;
- looping bands use one track transform, not per-item animation;
- offscreen video pauses;
- below-fold motion initializes lazily when near viewport where practical;
- SVG paths kept modest in complexity;
- media transformations apply to wrappers, not oversized raw image pixels whenever possible.

---

# 19. ReactBits decision table

| ReactBits component | Redesign role | Decision |
|---|---|---|
| Split Text | hero / selected chapter headlines | KEEP |
| Magnet | primary public CTA | KEEP |
| Scroll Reveal | selected statements | KEEP |
| Scroll Velocity | semantic marquees | PROTOTYPE AGAINST CUSTOM LOOP |
| Count Up | verified proof facts | ADD IF LIGHTWEIGHT |
| Masonry | media/story irregular field | PROTOTYPE; reject if layout control weak |
| Card Swap | product proof | KEEP CONDITIONALLY |
| Pixel Transition | raw → explained | KEEP CONDITIONALLY |
| Animated Content | small generic entrance utility | OPTIONAL |
| Spotlight Card | structured technical/detail surfaces only | DE-EMPHASIZE |
| Scroll Stack | not aligned with reference page grammar | DO NOT BASE ARCHITECTURE ON IT |
| Glare Hover | decorative | REJECT DEFAULT |
| Border Glow | decorative | REJECT DEFAULT |
| Scanner | heavy / misleading fit | REJECT |
| Grid Scan | heavy WebGL/face stack | REJECT |
| Dark Veil | generic background spectacle | REJECT |
| particle/galaxy/hyperspeed effects | generic spectacle | REJECT |

---

# 20. Motion QA checklist

For every animated chapter verify:

- does the effect communicate a defined narrative job?
- is text readable before/during/after animation?
- can user scroll quickly without broken states?
- does resize recover correctly?
- does back navigation restore a sensible state?
- does reduced-motion render a complete static composition?
- does touch work without hover?
- does motion stop after component unmount?
- does the animation create horizontal overflow?
- are media placeholders animated exactly like future real media would be?
- does animation preserve the distinction between medical fact and decorative context?

---

# 21. Final motion thesis

The reference site's strongest motion quality is that the heartbeat is never merely a loading animation; it is a visual explanation of life, history, scale, and continuity.

Vytal must meet that standard with the Signal Thread.

The visitor should repeatedly see **uncertain optical information become more coherent as trust is earned**. That progression is the motion identity of the public website.
