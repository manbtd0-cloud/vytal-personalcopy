# Vytal Public Experience — Reference-Driven Redesign Design Specification

**Date:** 2026-08-18  
**Status:** Design specification for the Save a Child's Heart reference-driven redesign  
**Working branch:** `landing-page-reference-redesign-spec`  
**Reference audit:** `docs/reference-audits/2026-08-18-save-a-childs-heart-25-forensic-audit.md`  
**Clinical product boundary:** `/scan`, `/dashboard`, and `/report` remain a separate, restrained clinical register.

---

## 0. Purpose

This specification replaces the previous assumption that the Vytal public site should primarily be a sequence of polished product sections. The existing direction is technically sound and visually competent, but the Save a Child's Heart 25th anniversary reference demonstrates a higher standard of experience design: one persistent semantic visual language, materially different chapter geometries, richer human evidence, long-form pacing, and page-specific storytelling modes.

The redesign therefore aims to reproduce **as much of the reference site's experiential quality as is appropriate** while remaining unmistakably Vytal.

This means we deliberately borrow:

- long-form editorial pacing;
- emotion → proof → context → human consequence → action sequencing;
- full-bleed media chapters;
- oversized typography;
- sparse statement chapters;
- moving proof bands;
- timeline storytelling;
- media mosaics and irregular image clusters;
- same-page story overlays;
- route-specific visual modes;
- motion that carries semantic meaning;
- repeated motifs that change function across a page;
- contrasting chapter colors and densities;
- a strong closing conversion chapter.

We deliberately do **not** copy:

- Save a Child's Heart copy;
- its photographs, videos, illustrations, logos, or SVGs;
- its heartbeat/EKG identity;
- donor/fundraising mechanics that do not fit Vytal;
- its exact Webflow implementation or duplicated marquee markup;
- stale campaign facts, typo artifacts, or old metrics;
- unverified hover/page-transition behaviors;
- fake patients, fake testimonials, fake hospitals, fake countries, or fake deployment figures.

The target is a near-isomorphic **experience architecture**, not a trademark/copyright clone.

---

# 1. Core product and honesty constraints

These constraints override visual ambition.

1. Vytal is a **screening platform**, not a diagnostic medical device.
2. The camera is not framed as magical. Camera-derived measurements are presented as signal extraction under real quality constraints.
3. Core camera-derived measurements and research/experimental screening pathways must remain visibly distinguishable.
4. Poor signal may produce no trusted result. This is a feature, not a failure to hide.
5. AI explains measurements; it does not create or substitute for the measurements.
6. Longitudinal/trend claims must be framed as context and pattern awareness, not diagnosis.
7. Future BLE, wearable, thermal, and population-health directions remain visibly marked as future/research/prototype.
8. The marketing/public surface may be cinematic; the clinical app surface remains quiet, fast, predictable, and legible.
9. No fake social proof will be created to fill a reference-shaped slot.
10. Empty media/story/quote slots are preferable to fabricated proof.

---

# 2. The reference quality target

The redesign is successful only if the public experience inherits the following **qualities**, not merely some similar component names.

## 2.1 One semantic system across the whole site

Save a Child's Heart repeatedly transforms a heartbeat/EKG motif into hero motion, timeline, proof bands, dividers, quote graphics, and page connective tissue.

Vytal's equivalent is the **Signal Thread**.

The Signal Thread is not an ECG line. It represents the transformation:

**ordinary light → optical sample → isolated physiological variation → confidence → interpretation → longitudinal context.**

It can appear as:

- a thin scanning line moving across media;
- a cluster of raw optical samples;
- three slightly separated color/spectral traces;
- an ROI/focus frame;
- a noisy waveform that progressively stabilizes;
- a timeline connector;
- a baseline beneath a marquee;
- a path between statistics;
- a line chart over time;
- a route transition wipe;
- a section divider;
- a confidence band whose clarity changes;
- a thread joining multiple sensor inputs on the Platform page.

The Signal Thread must remain semantically related to sensing. It must never become a decorative squiggle.

## 2.2 Chapter variation

The site must not read as `SectionShell` repeated twelve times.

Across a full Home scroll, the visitor should encounter materially different physical modes:

- full-screen media;
- near-empty statement field;
- moving data/proof field;
- scroll timeline;
- asymmetric media/text editorial layout;
- same-page story preview/overlay;
- full-width horizontal text band;
- dense media mosaic;
- light/ivory trust interruption;
- quote/evidence composition;
- another semantic moving band;
- future/platform narrative;
- final conversion field.

Code remains modular. Visual geometry does not become repetitive just because components are modular.

## 2.3 Human evidence without stock-healthcare aesthetics

Technology-first no longer means image-light.

Human imagery is allowed and encouraged when it proves something or changes emotional register. It should eventually include real, permissioned or commissioned material such as:

- ordinary people using a phone camera;
- community health workers;
- hands/phone/fingertip interaction;
- low-resource or non-hospital settings;
- clinicians or researchers where appropriate;
- longitudinal/context imagery where a real story exists.

Until those assets exist, **first-class empty media frames** occupy the exact dimensions, clipping, responsive behavior, and animation roles that real imagery will later use.

Do not substitute generic smiling-doctor stock photography merely to fill space.

---

# 3. Public information architecture

The public marketing/research site remains isolated from the clinical app via the existing lazy `PublicSite` boundary.

## 3.1 Primary public routes

### `/` — Home
Master Vytal narrative. Closest analogue to the anniversary Home page.

### `/screenings` — Screening atlas
A high-intent, highly visual catalogue of what Vytal measures, estimates, screens, contextualizes, or is researching. It borrows the reference campaign/action pages' decisiveness but remains medically explicit.

### `/science` — Science & validation
Closest analogue to the reference History page. A long-form evidence timeline where the Signal Thread becomes the chronological/scientific connector.

### `/impact` — Context & continuity
Closest analogue to Faces of Hope. It presents human/use-context stories. Until real stories exist, every story is explicitly labelled **Illustrative scenario** and uses media placeholders rather than invented testimony.

### `/about` — Why Vytal / principles / project
A shorter origin-and-principles page. It borrows the reference Get Involved page's economy and the Home page's institutional arc.

## 3.2 Secondary / contextual routes

### `/journey` — Illustrative screening journey
Analogue to the hidden Mazen feature page. One example journey becomes the spine for explaining capture, quality, result, explanation, record, and follow-up. It must be clearly labelled illustrative, never a fake patient case.

### `/platform` — Beyond the camera
Analogue to the hidden Mosaic page. A page-specific metaphor: multiple fragments of physiological context become a broader picture. Camera, BLE devices, wearables, thermal sensing, language/explanation, and longitudinal records are visualized as separate pieces that join into one system. Future/prototype status is prominent.

## 3.3 Trust/legal routes

- `/privacy`
- `/medical-disclaimer`
- optional `/terms` when needed

## 3.4 Clinical routes

- `/scan`
- `/dashboard`
- `/report`

These are not redesigned as part of this public-site art direction.

---

# 4. Navigation and global shell

## 4.1 Desktop navigation

The current floating SaaS-like pill treatment should evolve into a more editorial, reference-compatible shell.

Target behavior:

- fixed at top;
- Vytal mark/wordmark left;
- compact nav links right or center-right;
- `Start Screening` visually distinct but not oversized;
- transparent over hero/media;
- section-aware light/dark theme switching as the page crosses dark, coral, and ivory chapters;
- subtle background/blur only after scroll, not a permanent floating card;
- no fake external links/socials.

Primary links:

- Screenings
- Science
- Impact
- About
- Start Screening

`Journey` and `Platform` remain contextual links from relevant sections.

## 4.2 Mobile navigation

A full-screen or near-full-screen menu is preferable to squeezing desktop links into a tiny pill.

Requirements:

- large editorial link typography;
- visible `Start Screening` CTA;
- body scroll lock while open;
- focus containment and Escape-to-close;
- reduced-motion fallback;
- Signal Thread can appear as a minimal menu divider/entry stroke, not a full animation spectacle.

## 4.3 Footer

The footer should have the reference site's sense of a deliberate final chapter, but with Vytal-specific content:

- Vytal mark/wordmark;
- concise mission statement;
- main route links;
- Start Screening;
- Privacy;
- Medical Disclaimer;
- explicit `Screening support, not diagnosis` language;
- research/prototype/future-direction note where appropriate;
- optional version/build label in small mono text.

No newsletter or social icons are added unless there is a real destination.

---

# 5. Visual identity

## 5.1 Palette

Keep the current Vytal palette, but use it at reference-level editorial scale.

### Core

- **Deep Ink:** `#0D0C0B`
- **Warm Black:** `#11100F`
- **Surface:** `#181512`
- **Raised Surface:** `#211D19`
- **Warm Ivory:** `#F1EDE7`
- **Ivory Ink:** `#171412`

### Signal colors

- **Signal Coral:** `#FF4D5E`
- **Uncertainty Amber:** `#FFB020`
- **Confidence Mint:** `#6FBF97`

### Usage principle

Reference parity requires larger tonal changes than the current implementation.

Home should move through:

- cinematic dark;
- near-black;
- full/near-full coral field;
- dark again;
- ivory trust field;
- photography/media-driven mixed color;
- dark/future field;
- strong coral/ink close.

Do not place every section on `#11100F` with slightly different cards.

## 5.2 Typography

Keep Poppins + JetBrains Mono initially to preserve brand/app continuity and avoid adding another font dependency before visual evaluation.

The redesign changes **typographic behavior** much more than font family:

- hero display: ~`clamp(4rem, 10vw, 10rem)` depending on viewport;
- chapter statements: 8–15 words, huge, low line-height;
- overline/metadata in JetBrains Mono;
- section indices used sparingly;
- year/milestone numerals on Science become extremely large;
- body measure remains readable (`55–72ch` max);
- no blanket center alignment;
- casing play is controlled and purposeful, not imitated from the anniversary site's typos/playful capitalization.

A font change may be evaluated during the visual polish phase only if Poppins proves too soft/editorially generic.

## 5.3 Borders/radii

The public site should reduce the feeling that everything is a rounded SaaS card.

- full-bleed media often uses `0–12px` radius;
- story portraits may use mild radius or none;
- technical panels can retain current rounded language;
- CTA buttons remain rounded/pill-like as a product affordance;
- large editorial sections should rely on spacing, cropping, line, and color rather than card containers.

---

# 6. The Signal Thread system

## 6.1 Semantic states

### RAW
Visual character:

- scattered optical samples;
- slight spectral separation;
- low opacity;
- irregular/noisy path;
- coral/neutral dominant.

Meaning: camera input exists, but useful signal is not yet isolated.

### LOCK
Visual character:

- ROI corners/focus frame;
- trace becomes more coherent;
- amber may appear for quality/caution;
- labels can surface.

Meaning: the system has identified a usable region/signal candidate.

### TRUSTED
Visual character:

- clean line/waveform;
- mint confirmation;
- less noise;
- confidence annotation.

Meaning: sufficient quality for a screening result.

### CONTEXT
Visual character:

- line extends through time or joins multiple data sources;
- can become trend/history/path.

Meaning: one reading becomes part of a larger pattern.

## 6.2 Implementation philosophy

The Signal Thread must be achievable without WebGL.

Primary tools:

- SVG paths;
- CSS masks/clip paths;
- GSAP timelines;
- GSAP ScrollTrigger;
- CSS transforms/opacity;
- minimal DOM sample points;
- optional Canvas only if later proved necessary for one isolated visualization, not as the default architecture.

No Three.js/OGL/face-api background effect is allowed on the marketing surface merely for decoration.

## 6.3 Reuse rule

Every occurrence must have a narrative job. If removing the Signal Thread changes nothing about the meaning of a section, that occurrence is decorative and should be removed.

---

# 7. Media system and placeholder contract

## 7.1 First-class `MediaFrame`

All planned imagery/video uses a shared wrapper contract even before assets exist.

Conceptual props:

- `slotId`
- `kind: image | video | portrait | diagram`
- `ratio`
- `src`
- `poster`
- `alt`
- `caption`
- `objectPosition`
- `tone`
- `reveal`
- `priority`
- `parallax`

## 7.2 Placeholder behavior

When `src` is missing:

- the exact frame remains in layout;
- the final aspect ratio remains intact;
- the final clipping/radius remains intact;
- the final reveal/parallax wrapper still runs;
- the frame uses a quiet neutral Vytal surface;
- no shimmer/skeleton animation;
- no stock fallback image;
- optional development-only slot label can identify the asset (`HOME-HERO-01`, etc.);
- production can suppress the label and leave a deliberate empty frame.

The placeholder is treated as a production media object with missing content, not as a temporary layout approximation.

## 7.3 Asset loading rules

Once assets exist:

- hero poster/image receives high priority;
- hero video must include a poster and degrade to poster when autoplay/data constraints apply;
- all below-fold images lazy-load;
- responsive `srcset`/sizes used for real images;
- motion should transform wrappers, not repeatedly repaint giant images;
- videos are muted/playsInline if background/cinematic;
- no auto-playing audio;
- reduced-motion may replace background video with poster.

---

# 8. Home — master narrative design

Home intentionally mirrors the **pacing roles** of the reference Home page while using Vytal content.

## H01 — Cinematic hero / mystery

Reference role: full-scale hospital/children video + heartbeat overlay.

Vytal translation:

- full-viewport media frame; initially an empty full-bleed hero media placeholder;
- Signal Thread in RAW state crosses the media;
- title remains intrigue-led: `There's more here than you can see.`
- `Your camera sees it.` follows as a smaller reveal;
- no large explanatory paragraph above the fold;
- small `Scroll to reveal` cue;
- Start Screening remains accessible in global nav;
- hero content becomes clearer after first scroll beat rather than immediately dumping features.

If a hero video is later supplied, the wrapper is already video-ready.

## H02 — Mission / access thesis

Reference role: `hope forward` mission statement.

Vytal translation:

A sparse editorial chapter that explains the reason for the product before the technology:

> A useful first health signal should not have to wait for perfect access.

Supporting copy introduces ordinary cameras, low-connectivity thinking, and first-line screening without claiming diagnosis.

This chapter should feel spacious, not like a feature section.

## H03 — Scale/proof field

Reference role: animated world map + large accomplishment statistics.

Vytal cannot invent usage scale. Instead the same **proof geometry** uses verified product facts.

Candidate verified facts:

- `1` ordinary camera as the core input concept;
- `3` core physiological signal categories currently represented publicly (heart rate, breathing rate, pulse variability);
- `8` explanation languages represented in `SUPPORTED_LANGUAGES`;
- `4` major signal-quality factors highlighted publicly;
- multiple research screening pathways, shown by category rather than a misleading adoption number.

A world/access field may be used as a **design-intent map**, never as a deployment map. Copy must say `Designed for reach`, not `Used in X countries`.

Use CountUp for real numeric facts only.

## H04 — Compressed science lineage

Reference role: mini history timeline.

Vytal translation:

A four-to-five milestone scientific lineage: photoplethysmography → camera/rPPG sensing → modern signal-quality/remote measurement research → Vytal's accessible screening experiment.

Every year/milestone must be source-verified before final copy. No approximate dates are hard-coded from memory.

Signal Thread changes from scan line to timeline connector.

CTA: `Explore the science`.

## H05 — Human/context preview

Reference role: Faces of Hope preview.

Vytal translation:

Three large story/context previews with real-sized media placeholders:

1. Individual / at-home screening context
2. Community health worker / field workflow
3. Longitudinal follow-up / continuity context

Each is explicitly labelled `Illustrative scenario` until real permissioned stories exist.

Interaction:

- preview card/tile;
- Learn More opens a same-page overlay/detail state;
- overlay contains larger media slots, narrative, and workflow diagram;
- no fake names, quotes, outcomes, or diagnoses.

## H06 — Four-chapter signal journey

Reference role: PROviding ACCESS / Taking ACTION / Nurturing HEALING / Cultivating RESILIENCE.

Vytal translation:

Four editorial beats, **not equal cards**:

- CAPTURE — ordinary optical input
- EXTRACT — isolate pulse-related variation
- VERIFY — assess motion, lighting, consistency, confidence
- EXPLAIN — translate trusted measurements into understandable context

Each chapter gets different composition/scale and its own media/diagram slot.

The current `Observe / Extract / Check / Explain` logic survives semantically, but the four stacked cards are visually retired.

## H07 — Screening/signal marquee

Reference role: repeated patient-name band.

Vytal translation:

A continuous kinetic band of screening/signal names, for example:

`HEART RATE / BREATHING / PULSE VARIABILITY / OXYGEN PROXY / RHYTHM / ANEMIA / JAUNDICE / BP TRENDS ...`

Rules:

- statuses are not hidden; research items can carry a small symbol or alternate tone;
- the band represents breadth, not equivalence of maturity;
- use ReactBits Scroll Velocity or a lightweight custom GSAP loop after a prototype comparison;
- mobile may use slower movement or a horizontally scrollable static row.

## H08 — Media/documentary run

Reference role: archival/current photo stream.

Vytal translation:

An irregular sequence of full-fledged empty media frames that later accept real context photography:

- phone/face interaction;
- fingertip camera interaction;
- community health worker;
- home environment;
- clinic/field environment;
- hands/device detail;
- multilingual explanation screen;
- report/referral handoff.

Frame ratios intentionally vary: portrait, landscape, near-square, narrow crop.

The composition should make the page feel editorial, not like an image gallery component demo.

## H09 — Trust reset / ivory chapter

Reference role: sparse emotional bridge.

Vytal translation:

The existing uncertainty thesis becomes a much stronger visual interruption:

> Sometimes the right result is no result.

Warm ivory background, dark ink, very large typography.

Secondary copy:

Vytal evaluates movement, illumination, visibility, signal quality, and consistency before trusting a camera-derived reading.

This is the only major light field on Home and should feel like the visitor has entered a different chapter.

## H10 — Evidence/voice composition

Reference role: multi-stakeholder quotes.

Vytal translation:

Build the full quote/evidence composition, but **do not fabricate voices**.

Slots:

- clinician/researcher quote slot — empty until real permissioned quote;
- community-health-worker quote slot — empty until real source;
- research evidence note — can use sourced paraphrase/citation;
- Vytal principle statement — owned copy, not presented as testimonial.

Each slot has a media frame or portrait slot where appropriate.

The layout is implemented now; unearned social proof remains visibly absent.

## H11 — Language/context band

Reference role: country-name band.

Vytal translation:

A second kinetic text band using verifiable accessibility/context data:

`English / اردو / پښتو / سنڌي / العربية / Kiswahili / हिन्दी / বাংলা`

Optionally interleave modes such as `PATIENT VIEW / CLINICIAN VIEW / OFFLINE FALLBACK` if visually needed.

This is directly grounded in `SUPPORTED_LANGUAGES`.

## H12 — Product/institutional arc

Reference role: founding → expanding access → growing mission → new hospital.

Vytal translation:

A future-facing arc:

1. CAMERA FIRST — useful signal from hardware people already have
2. CONFIDENCE AWARE — uncertainty is part of the result
3. CONTEXT OVER TIME — records/trends/referral continuity
4. BEYOND CAMERA — devices, wearables, thermal, population context as research/future direction

Each chapter gets a large media or product-UI slot.

The final chapter links to `/platform`.

## H13 — Concrete value units

Reference role: donation amount → tangible outcome.

Vytal translation:

Translate an abstract platform into concrete units:

- one scan → camera-derived signal + quality state;
- one trusted result → understandable explanation;
- repeated readings → trend context;
- one saved report → information that can be carried forward;
- one health-worker workflow → Screen → Save → Explain → Refer.

Do not invent time-saved, money-saved, lives-saved, accuracy, or adoption metrics.

## H14 — Final product entry

Reference role: mission/action close.

Vytal translation:

Full-field closing chapter that visually echoes H01 but resolves the mystery completely.

Headline:

`See what your camera can tell you.`

Primary:

`Start Screening`

Secondary:

`Explore Screenings`

Medical disclaimer stays visible without dominating the CTA.

---

# 9. Screenings page design

The Screenings page must avoid the generic `all capabilities in equal cards` look.

## 9.1 Job

Help a visitor understand:

- what Vytal currently measures most directly;
- what is a proxy/research pathway;
- what is contextual/triage logic;
- what is a future integration;
- what each result can and cannot mean.

## 9.2 Structure

1. Full-width hero with media/optical placeholder.
2. Four-category index.
3. Core physiological chapter — largest visual treatment.
4. Optical/algorithmic research chapter — editorial tiles, not one uniform grid.
5. Context/triage chapter.
6. Future integrations chapter.
7. `What Vytal does not claim` trust chapter.
8. Product entry CTA.

## 9.3 Screening detail anatomy

Each screening unit draws from `screenings.js`:

- title;
- status;
- input;
- what it looks for;
- method;
- output;
- limitation;
- confirmation recommendation;
- CTA only when the current app actually exposes that mode.

The status must be visually impossible to miss.

---

# 10. Science page design

Science is the closest direct structural adaptation of the reference History page.

## 10.1 Job

Show that Vytal is not an LLM guessing health numbers. Explain the measurement chain, research lineage, uncertainty, limitations, and validation requirements.

## 10.2 Timeline grammar

- huge year/milestone labels;
- Signal Thread becomes vertical/diagonal timeline;
- some milestones are tiny;
- some become full-viewport media/diagram chapters;
- some include a paper/reference block;
- optional video slots only when meaningful;
- irregularity is deliberate.

## 10.3 Required scientific chapters

- PPG / optical pulse sensing foundation;
- remote/camera PPG lineage;
- region-of-interest/computer-vision extraction;
- motion/lighting quality problems;
- beat/IBI analysis;
- uncertainty/confidence;
- research proxies by modality;
- current Vytal implementation truth;
- what is not validated;
- validation roadmap;
- references.

Exact historical dates and claims require source verification before final content.

## 10.4 `What we do not claim`

This chapter is mandatory and visually prominent.

Examples:

- camera SpO2 proxy is not clinical pulse oximetry;
- camera rhythm flag is not ECG diagnosis;
- anemia/jaundice are research indicators, not lab measurements;
- blood-pressure work is not a cuff replacement;
- future devices are not current production integrations.

---

# 11. Impact page design

Impact borrows the **story archive behavior** of Faces of Hope while refusing fabricated patients.

## 11.1 Opening

Large human/context media field + statement about access.

## 11.2 Scenario archive

Initial scenario categories:

- individual at home;
- community health worker;
- low-connectivity environment;
- multilingual explanation;
- longitudinal follow-up;
- referral/report continuity.

Every item begins as:

`Illustrative scenario`

No fake personal names or quotes are introduced.

## 11.3 Same-page overlay

Selecting a scenario opens a large detail overlay instead of navigating away.

Overlay anatomy:

- media placeholder(s);
- context;
- friction/problem;
- Vytal workflow;
- what the result can support;
- limitation/what still requires care;
- close control;
- next scenario navigation.

If real case studies are later obtained, this structure can accept them without redesign.

---

# 12. About page design

Shorter, calmer, decisive.

Sections:

1. Why Vytal exists.
2. The accessibility thesis.
3. Four principles:
   - Accessible
   - Evidence-aware
   - Honest about uncertainty
   - Human-understandable
4. Team/project media placeholders.
5. Research/project status.
6. Paths forward:
   - Try Vytal
   - Explore science
   - Explore screenings
   - See impact

Avoid corporate filler, fake partner logos, careers, or investor theater.

---

# 13. `/journey` — illustrative case-study page

This page adapts the reference Mazen narrative mode.

## 13.1 Mandatory label

`ILLUSTRATIVE SCREENING JOURNEY — NOT A REAL PATIENT CASE`

## 13.2 Story

A neutral example demonstrates trust behavior rather than dramatic disease.

Recommended arc:

1. user opens camera screening;
2. first acquisition is unstable due to movement;
3. Vytal rejects/asks for a repeat rather than inventing confidence;
4. second acquisition is stable;
5. example heart rate/breathing/variability appears;
6. explanation layer translates the numbers;
7. result is saved;
8. later reading can be compared as trend context;
9. any concerning symptoms still require professional care.

Example numbers must be explicitly marked illustrative.

## 13.3 Visual pattern

- cinematic hero media placeholder;
- product UI fragments;
- oversized quality/confidence moment;
- clinician/science note;
- repeated macro-capability band;
- final Start Screening CTA.

---

# 14. `/platform` — fragments-to-context page

This page adapts the reference Mosaic page's **metaphor strategy**, not its literal mosaic art.

## 14.1 Metaphor

`One signal is a fragment. Context makes the picture.`

Fragments:

- camera;
- BLE device;
- wearable baseline;
- thermal sensing;
- longitudinal record;
- multilingual explanation;
- referral/health-worker context;
- population-level research.

## 14.2 Choreography

The page opens with scattered media/data frames. As the visitor progresses, the Signal Thread connects them and the composition gradually becomes more ordered.

The final assembled state represents a broader sensing platform.

Every non-current integration carries `Research / future direction` labeling.

---

# 15. Motion system

## 15.1 Runtime policy

Keep GSAP + `@gsap/react` as the animation runtime already introduced.

Do not add a second animation runtime unless a future requirement cannot reasonably be implemented with GSAP/CSS.

No Lenis requirement is introduced merely to imitate an unverified smooth-scroll engine.

## 15.2 Motion families

### A. Signal Thread drawing
SVG stroke-dash / path progress tied to section entry/scroll.

### B. Media reveal
Clip/mask reveal; occasional vertical or lateral wipe. Avoid applying the same reveal to every image.

### C. Editorial typography
SplitText / ScrollReveal / ScrollFloat-like behavior reserved for major statements.

### D. Moving proof bands
Continuous horizontal loops for signals/languages/capabilities.

### E. Timeline progression
ScrollTrigger updates line progress and milestone activation.

### F. Story overlay
Large modal/detail expansion with image/content stagger.

### G. Statistics
CountUp for verified facts only.

### H. Route transition
A brief Signal Thread/field wipe may be used only between public routes. Clinical route transitions remain separate and restrained.

## 15.3 Reduced motion

`prefers-reduced-motion: reduce` must:

- stop looping marquees;
- render Signal Thread in final static state;
- skip parallax;
- skip automatic media movement;
- replace video hero with poster where practical;
- preserve all information and route functionality.

---

# 16. ReactBits policy

ReactBits is an implementation toolkit, not the art director.

## 16.1 Strong candidates

- `Split Text` — hero and selected major headings;
- `Magnet` — primary public CTAs only;
- `Scroll Reveal` — selected large editorial statements;
- `Scroll Velocity` — prototype for semantic marquees;
- `Count Up` — verified numeric proof;
- `Masonry` — prototype for irregular media/archive layouts if it remains lightweight and controllable;
- `Card Swap` — product UI proof if it survives the new visual composition;
- `Pixel Transition` — raw-reading → explained-reading transformation if it still feels purposeful;
- `Animated Content` — utility-level entrance behavior where custom code would be wasteful.

## 16.2 Use sparingly

- Spotlight Card;
- Scroll Stack;
- Glare Hover;
- Border Glow.

These should appear only where the reference's narrative job actually benefits from that physical behavior.

## 16.3 Reject as baseline

- Scanner/Grid Scan heavy WebGL variants;
- Three.js/OGL backgrounds;
- random particle systems;
- hyperspeed/galaxy/terminal backgrounds;
- cursor effects with no semantic value;
- multiple shader systems;
- anything that makes the site read as a ReactBits showcase.

---

# 17. Current-code salvage matrix

## Keep / extend

- lazy public/clinical route split in `src/App.jsx`;
- `ClinicalLayout` boundary;
- `src/public/content/screenings.js` as medical claim source;
- `home.js` copy concepts where still valid;
- GSAP runtime;
- reduced-motion setup;
- Vitest/Testing Library harness;
- `SplitText`, `Magnet`, `ScrollReveal` adapters;
- `CardSwap` and `PixelTransition` only where they survive redesign review;
- current `StatusChip` concept;
- existing public color tokens as starting values.

## Rebuild visually

- `PublicNav.jsx`;
- most Home section compositions;
- current Spotlight-card screening grid;
- current four-card process geometry;
- current section-shell uniformity;
- current simple lower-page sequences;
- public footer composition.

## Retire / replace where redundant

- `SectionShell` as the universal visual wrapper;
- any public CSS rule that assumes every section has the same max-width/padding structure;
- repeated generic rounded-card containers.

## Do not touch

- `ScanPage.jsx` layout/behavior as part of this redesign;
- `DashboardPage.jsx`;
- `ReportPage.jsx`;
- core signal-processing modules except where content needs to read their truth;
- clinical navigation behavior except routing links required to enter/exit public site.

---

# 18. Responsive design

The reference quality must survive mobile rather than becoming a reduced desktop screenshot.

Target widths for explicit QA:

- 360
- 390
- 430
- 768
- 1024
- 1280
- 1440
- 1920

Rules:

- giant typography scales with `clamp()` and intentional line breaks;
- full-bleed media remains full-bleed;
- complex two-column editorial chapters stack with deliberate image/text order;
- horizontal loops never cause viewport overflow;
- story overlays become full-screen sheets on narrow viewports;
- timeline switches from alternating layout to one-side rail on mobile;
- pinned/scroll-controlled chapters must degrade to normal document flow where pinning harms usability;
- hover-only meaning is forbidden;
- touch interactions remain obvious;
- media placeholders use the same mobile crops intended for final assets.

---

# 19. Accessibility

Minimum requirements:

- logical heading structure;
- keyboard-accessible navigation and story overlays;
- visible focus states;
- modal focus trapping and restoration;
- Escape-to-close;
- semantic links/buttons;
- image alt contract once assets exist;
- decorative Signal Thread marked `aria-hidden`;
- no medical meaning conveyed by color alone;
- status chips include text;
- reduced-motion support;
- videos include captions/transcripts when they contain spoken content;
- sufficient contrast on coral/ivory/dark fields.

---

# 20. Performance budget

Premium must not mean heavy.

## JavaScript

- keep marketing code within lazy public chunk;
- no Three.js/OGL/face-api for decoration;
- one animation runtime;
- avoid dozens of independent scroll listeners;
- use GSAP contexts/ScrollTrigger cleanup;
- lazy-load route-specific page modules where useful.

## Media

- only hero media is high priority;
- below-fold images lazy;
- responsive sizes;
- modern formats where possible;
- poster-first video;
- pause offscreen videos;
- avoid multiple autoplay videos simultaneously.

## Budget target

The public landing JS should remain roughly under **100 kB gzip beyond shared React/router code where practical**, and any intentional breach must be traced to a concrete user-visible benefit.

The clinical chunk must not grow because a new public visual component was added.

---

# 21. Content truth architecture

Medical/public copy remains data-driven.

Sources of truth:

1. newer status/audit docs;
2. actual implementation behavior;
3. `screenings.js` content model;
4. research dossier;
5. peer-reviewed/primary sources for historical/scientific claims;
6. marketing copy only after the above.

Forbidden phrases without validation include:

- `diagnoses`;
- `accurately measures blood pressure with your camera`;
- `medical-grade`;
- fake accuracy percentages;
- fake patient outcomes;
- fake deployment reach;
- fake clinician endorsement.

Preferred language:

- screen;
- estimate;
- proxy;
- indication;
- possible;
- trend;
- flag;
- confidence;
- confirmation recommended.

---

# 22. QA standard

A section is not complete because its JSX exists.

Each major chapter requires:

1. functional rendering;
2. reduced-motion verification;
3. mobile/tablet/desktop review;
4. overflow check;
5. keyboard check;
6. content-claim review;
7. real placeholder geometry check;
8. motion timing review;
9. build/test verification;
10. reference-quality comparison: does the chapter have a distinct physical identity and narrative job?

Four visual review gates are mandatory during implementation:

- Gate A — global shell + hero + mission/proof field;
- Gate B — first half of Home through human/context preview;
- Gate C — full Home;
- Gate D — complete public route system.

Do not build all routes blindly and only then inspect the visuals.

---

# 23. Explicit non-goals

- cloning reference text/assets;
- inventing patient stories;
- building a CMS now;
- building a new backend;
- adding pricing;
- adding fake partner/hospital logos;
- adding careers/blog merely to fill a footer;
- redesigning the clinical scanner;
- matching unverified reference easing/hover behavior pixel-for-pixel;
- introducing WebGL simply because the reference feels cinematic.

---

# 24. Final design thesis

The Save a Child's Heart reference works because its website behaves like its mission: a heartbeat keeps reappearing as the visitor moves through people, time, proof, and action.

Vytal's public website should behave like **Vytal's sensing process**.

A visitor should repeatedly experience the same transformation in different forms:

> **Something ordinary contains information that is hard to see. Vytal observes it, extracts a signal, decides whether that signal deserves trust, explains the result, and carries the context forward.**

The redesign therefore aims to feel less like a polished product landing page and more like an interactive health-sensing documentary: technically credible, emotionally grounded, visually varied, honest about uncertainty, and unmistakably Vytal.
