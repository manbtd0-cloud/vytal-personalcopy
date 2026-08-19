# Vytal Reference-Driven Redesign — Route & Chapter Blueprints

**Purpose:** Page-level design blueprint for the public-site redesign. This document is more concrete than the master design spec and less code-oriented than the implementation plan.

---

# 1. Global page rhythm rules

Every public route must answer four questions before implementation:

1. **What is this page's narrative job?**
2. **What is its dominant physical/motion mode?**
3. **Where does the Signal Thread change meaning?**
4. **Where does the page intentionally become quiet?**

A route is not allowed to become a generic sequence of reusable section shells simply because those components already exist.

---

# 2. Home (`/`)

## Narrative job

Make an ordinary visitor feel the central Vytal premise before they are asked to understand technical terminology:

**ordinary camera → hidden physiology → trustworthy signal → explanation → continuity → accessibility.**

## Page length

Long-form, reference-like. Approximate target: 13–15 substantial chapters with large differences in density.

## Color rhythm

1. Dark cinematic
2. Dark sparse
3. Coral/dark proof field
4. Dark timeline
5. Dark + media
6. Mixed dark/media editorial
7. Coral/ink kinetic band
8. Media-heavy dark
9. Ivory trust reset
10. Dark evidence/media
11. Dark/mint language band
12. Dark platform arc
13. Coral/ivory tangible-value units
14. Dark/coral close

The exact sequence can be tuned visually, but there must be at least three major field changes across Home.

---

## HOME-01 — Hero: hidden in ordinary light

### Layout
- 100svh minimum.
- Full-bleed `MediaFrame` behind content.
- Dark scrim only as needed for legibility.
- Vytal logo/nav over media.
- Copy anchored lower-left or upper-left depending media crop, not rigidly centered.
- A small metadata line can identify `OPTICAL INPUT / PUBLIC EXPERIENCE`.

### Copy hierarchy
1. Main headline: `There's more here than you can see.`
2. Secondary reveal: `Your camera sees it.`
3. Scroll cue.
4. No full explanatory paragraph until the visitor begins to leave the hero.

### Motion
- media enters with slow scale/opacity if motion allowed;
- Signal Thread begins as sparse/noisy optical points;
- thin scan passes once, not perpetually like a barcode scanner;
- text reveal uses SplitText but should feel calm, not game-like;
- on scroll, the thread exits hero and visually motivates the next section.

### Media placeholder
`HOME-HERO-01`
- kind: video-ready
- ratio: full viewport
- desired future content: person using phone camera or close human/device moment; avoid white-coat stock pose.

### Mobile
- poster/static image preferred over autoplay video under reduced-motion/data constraints;
- title max ~4–5 lines;
- scroll cue preserved.

---

## HOME-02 — Access thesis

### Layout
- sparse, high negative space;
- one oversized statement occupying 60–70% of available width;
- supporting copy lower/right;
- optional small vertical media/detail frame.

### Primary statement
`A useful first health signal should not have to wait for perfect access.`

### Supporting ideas
- smartphone camera already in hand;
- first-line screening, not diagnosis;
- low-connectivity thinking;
- understandable next step.

### Motion
Very restrained. This section is a breathing space.

---

## HOME-03 — Proof/access field

### Layout
Reference-like data spectacle without fake adoption statistics.

- large field, potentially full Signal Coral with dark/ivory type or dark field with coral grid;
- abstract/world access map behind data;
- four or five large factual values rotate/appear as scroll progresses;
- each value gets a one-line meaning only.

### Candidate verified metrics
- `1` ordinary camera core concept
- `3` core physiological categories represented in public content
- `8` supported explanation languages in current `SUPPORTED_LANGUAGES`
- `4` quality dimensions publicly explained

If counts change during implementation, derive them from content models rather than duplicating literals.

### Motion
- CountUp;
- Signal Thread links the facts;
- map/access points can drift/pulse slowly;
- no claim that dots represent real deployed users.

### Label
`DESIGNED FOR REACH — NOT A DEPLOYMENT MAP`

---

## HOME-04 — Science lineage teaser

### Layout
- horizontal or shallow vertical timeline;
- 4–5 milestones;
- large date/era typography;
- some milestones mostly text, one with diagram media frame;
- CTA to Science.

### Content requirement
All historical milestone dates must be sourced from primary research before publication.

### Motion
Signal Thread becomes timeline and fills based on scroll progress.

---

## HOME-05 — Human context previews

### Layout
Three large, nonuniform story previews rather than cards.

Suggested geometry:

- Story A: large landscape image left, title/text overlap at bottom edge.
- Story B: narrow portrait image right, copy occupying large left field.
- Story C: wide near-full-bleed crop with small floating metadata.

### Initial story labels
- `ILLUSTRATIVE SCENARIO / INDIVIDUAL`
- `ILLUSTRATIVE SCENARIO / HEALTH WORKER`
- `ILLUSTRATIVE SCENARIO / CONTINUITY`

### No fabricated person data
No invented names, diagnoses, testimonials, ages, hospitals, or outcomes.

### Interaction
`Learn More` opens `StoryOverlay` with larger placeholder media and workflow details.

---

## HOME-06 — The journey of a signal

### Intro statement
`The journey from light to meaning is a journey of filtering, checking and context.`

### Chapter A — CAPTURE
- large portrait media placeholder;
- tiny label `CAMERA / OPTICAL INPUT`;
- copy about region/optical input.

### Chapter B — EXTRACT
- wide diagram frame;
- Signal Thread visibly separates from raw sample noise;
- copy about isolating pulse-related variation.

### Chapter C — VERIFY
- layout becomes sparse/technical;
- movement, lighting, consistency and confidence appear as labels around an empty central field;
- amber used here more prominently.

### Chapter D — EXPLAIN
- product UI/media frame;
- raw reading and plain-language context share the composition;
- mint only appears after trust/quality state.

### Motion
Each chapter can pin for a short distance on desktop, but the page must work fully as normal stacked flow on mobile/reduced motion.

---

## HOME-07 — Signal breadth marquee

### Content
A continuous sequence of screening vocabulary with maturity treatment.

### Visual
- 12–18vw tall strip depending viewport;
- huge text, mostly outline/filled alternation;
- small status glyphs for research items;
- Signal Thread runs through or beneath words.

### Interaction
No click requirement; this is rhythm/scale.

### Motion
Prototype ReactBits Scroll Velocity vs custom GSAP loop. Choose the more deterministic/accessible implementation.

---

## HOME-08 — Human/device media run

### Purpose
Do for Vytal what the reference's archival sequence does: make the world of the product visible.

### Planned frames
1. Face + phone portrait
2. Fingertip camera close-up
3. Community health worker portrait
4. Low-connectivity environment landscape
5. Multilingual explanation in hand
6. Result/report detail
7. Follow-up reading context
8. Clinician/health-worker handoff
9. Phone/device detail
10. Environmental texture/human detail

### Current state
All empty `MediaFrame` placeholders.

### Geometry
- no uniform grid;
- some frames bleed to viewport edge;
- some small frames sit in large empty fields;
- occasional pairings/overlap allowed;
- text labels are minimal.

### Motion
- subtle vertical parallax on 2–3 frames only;
- clip reveals vary by frame;
- no universal hover tilt.

---

## HOME-09 — Ivory trust reset

### Background
Warm Ivory.

### Headline
`Sometimes the right result is no result.`

### Body
Explain quality gating and retry behavior.

### Secondary visual
A simple quality path:

`MOVEMENT → SIGNAL LOST → RETRY`

and

`STABLE INPUT → SIGNAL LOCK → SCREENING CONTEXT`

### Motion
Almost none; the visual contrast is the effect.

---

## HOME-10 — Evidence & voices

### Composition
Reference quote chapter adapted into a four-state editorial carousel/sequence.

### Slot 1
`CLINICIAN / RESEARCHER VOICE — ASSET/COPY PENDING`

- portrait placeholder
- quote placeholder, no fake text

### Slot 2
`HEALTH WORKER VOICE — ASSET/COPY PENDING`

### Slot 3
`RESEARCH EVIDENCE NOTE`

- sourced paraphrase and citation
- diagram or paper-thumbnail placeholder, not copyrighted screenshot by default

### Slot 4
`VYTAL PRINCIPLE`

Owned statement, e.g. `AI explains the measurements. It doesn't invent them.`

### Motion
Crossfade/slide between states; controls must be usable with keyboard.

---

## HOME-11 — Language/access band

### Content
Eight current supported languages as rendered in code.

### Visual
- slower than H07;
- different font weight/size;
- alternate scripts become part of the visual texture;
- Signal Thread is clean/TRUSTED state.

### Motion
Continuous if motion allowed; static wrapped line for reduced-motion.

---

## HOME-12 — Platform evolution

Four large chapters, each with media slot:

### CAMERA FIRST
Ordinary camera / core signal premise.

### CONFIDENCE AWARE
Quality/uncertainty as product architecture.

### CONTEXT OVER TIME
History, trends, reports, continuity.

### BEYOND CAMERA
BLE devices, wearables, thermal, population insight; clearly future/research.

### CTA
`Explore the platform` → `/platform`.

### Motion
Signal Thread changes from single line to branching network in final chapter.

---

## HOME-13 — Concrete units of value

### Purpose
Make the abstract pipeline tangible.

### Layout
Large-number/index treatment similar to donation economics, but values are units rather than money.

1. `01 / SCAN` → signal + quality
2. `02 / RESULT` → trusted screening output
3. `03 / EXPLANATION` → understandable context
4. `04 / HISTORY` → repeated-reading context
5. `05 / HANDOFF` → saved/shareable information and referral continuity

### Motion
Numbers can count/slide only once.

---

## HOME-14 — Final product entry

### Background
Deep Ink or Signal Coral depending final visual test.

### Headline
`See what your camera can tell you.`

### Actions
- Start Screening
- Explore Screenings

### Signal Thread
Fully clean/trusted state, resolving the noisy hero motif.

---

# 3. Screenings (`/screenings`)

## Narrative job
Answer the high-intent question: **What does Vytal actually screen, how mature is each pathway, and what are the limits?**

## Physical mode
Editorial capability atlas with deliberate hierarchy, not a feature-card wall.

## SECTION S01 — Hero
- full-width optical/media placeholder;
- large `SCREENINGS` label;
- title: `What Vytal is designed to screen.`
- copy immediately states that core, research, contextual, and future items differ.

## SECTION S02 — Category navigator
Four large anchors:
- Core physiological
- Optical / algorithmic research
- Context / triage
- Future sensing extensions

Can be sticky as user scrolls.

## SECTION S03 — Core physiological
Largest chapter.

Heart rate, breathing rate, pulse variability.

Each item gets:
- large title;
- status;
- visual waveform/diagram frame;
- input;
- output;
- limitation;
- clinical confirmation note;
- Start Screening only if route/mode exists.

## SECTION S04 — Research pathways
More experimental editorial geometry.

- oxygen proxy
- irregular rhythm
- anemia indicators
- jaundice indicators
- blood-pressure trends
- malnutrition/BMI proxy

Do not make each look equally validated.

Use different widths/weights while keeping common anatomy.

## SECTION S05 — Context / triage
- respiratory-distress context
- pediatric context
- pregnancy context
- alert/triage scale

Emphasize these as interpretation layers, not independent camera measurements.

## SECTION S06 — Future integrations
- BLE oximeter
- thermal sensing
- wearable baseline

Large future/research label across entire chapter.

## SECTION S07 — What Vytal does not claim
Ivory trust field.

## SECTION S08 — CTA
Start a current screening / explore Science.

---

# 4. Science (`/science`)

## Narrative job
Be the authoritative public explanation of how Vytal thinks about measurement, evidence, uncertainty and validation.

## Dominant physical mode
Long, irregular scientific timeline / exhibition.

## SCI-01 — Opening problem
Headline:
`The interface is simple. The measurement problem is not.`

Large diagram/media placeholder.

## SCI-02 — Sourced lineage timeline
Milestones must be researched and cited.

Potential categories:
- optical pulse measurement foundations;
- PPG;
- remote/camera PPG;
- face/ROI methods;
- signal processing/motion suppression;
- modern rPPG methods;
- uncertainty/quality;
- Vytal prototype.

No final dates until research pass.

## SCI-03 — Camera → ROI
Original explanatory diagram, not borrowed paper art.

## SCI-04 — ROI → waveform
Signal extraction chapter.

## SCI-05 — Motion & lighting
Full viewport or strong contrast chapter demonstrating why input quality matters.

## SCI-06 — Beat timing / variability
Explain IBI/HRV-related context carefully.

## SCI-07 — Screening research branches
Shorter clustered milestones for SpO2 proxy, rhythm, anemia, jaundice, BP trends, BMI/malnutrition.

## SCI-08 — Uncertainty
Large ivory or amber-accent chapter.

## SCI-09 — Current implementation truth
Explicitly distinguish what code currently does from ideal future research architecture.

## SCI-10 — What Vytal does not claim
Mandatory.

## SCI-11 — Validation roadmap
Bench/device/population validation needs.

## SCI-12 — References
Clean bibliography and links to primary papers.

---

# 5. Impact (`/impact`)

## Narrative job
Make accessibility and continuity human without fabricating social proof.

## Dominant physical mode
Story archive with same-page detail overlays.

## IMP-01 — Hero
- full-width human-context media placeholder;
- title: `A useful first signal should not depend on perfect access.`

## IMP-02 — Story/scenario grid
At least six initial illustrative contexts:

1. Individual at home
2. Community health worker
3. Low connectivity
4. Multilingual explanation
5. Longitudinal follow-up
6. Report/referral handoff

Each uses 2–4 media slots in its detailed state.

## IMP-03 — StoryOverlay behavior
- opens from selected tile;
- background page remains contextually visible or is covered by dark sheet;
- focus trap;
- close button;
- prev/next;
- full narrative;
- limitations included.

## IMP-04 — Access thesis
Large text reset.

## IMP-05 — Workflow band
`SCREEN / SAVE / EXPLAIN / REFER`

## IMP-06 — Final CTA
Try Vytal / explore Science.

---

# 6. About (`/about`)

## Narrative job
Explain why the project exists and what principles constrain it.

## Dominant physical mode
Short editorial mission page.

## ABOUT-01 — Hero
Title:
`Make sophisticated screening easier to reach—and harder to overclaim.`

## ABOUT-02 — Origin
Camera-first accessibility thesis.

## ABOUT-03 — Four principles
Not cards. Four differently weighted text/media blocks:

- Accessible
- Evidence-aware
- Honest about uncertainty
- Human-understandable

## ABOUT-04 — Team/project
Real team content if available; otherwise empty portrait/team frames.

## ABOUT-05 — Current status
Research/prototype honesty.

## ABOUT-06 — Action directory
- Start Screening
- Explore Screenings
- Explore Science
- See Impact
- Explore Platform

---

# 7. Journey (`/journey`)

## Narrative job
Demonstrate the complete product logic through one coherent example, mirroring the reference Mazen page's single-story spine.

## Mandatory top label
`ILLUSTRATIVE SCREENING JOURNEY — NOT A REAL PATIENT CASE`

## JRN-01 — Hero
Full-width human/device video placeholder.

## JRN-02 — Context
An ordinary user wants a basic screening reading.

Avoid fabricated demographic/medical details.

## JRN-03 — First scan fails quality
Show motion/lighting problem.

Large quality result:
`LOW CONFIDENCE / REPEAT`

This is the key dramatic moment.

## JRN-04 — Second scan locks
Signal Thread transitions RAW → LOCK → TRUSTED.

## JRN-05 — Example result
Clearly marked illustrative values.

## JRN-06 — Explanation
Raw → plain-language transition.

## JRN-07 — Saved history
Example record appears as timeline context.

## JRN-08 — Later reading / pattern
Illustrative trend only; no disease conclusion.

## JRN-09 — Macro proof band
Verified product facts/languages/screening categories.

## JRN-10 — Close
Start Screening + medical disclaimer.

---

# 8. Platform (`/platform`)

## Narrative job
Show the broader future without pretending it is already production-ready.

## Dominant physical mode
Page-specific fragments-to-context metaphor.

## PLT-01 — Hero
Scattered frames/data fragments in a wide field.

Headline:
`One signal is a fragment. Context makes the picture.`

## PLT-02 — Camera fragment
Current core.

## PLT-03 — Device fragments
BLE / thermal / wearable placeholders.

## PLT-04 — Time fragment
Longitudinal records.

## PLT-05 — Explanation fragment
Multilingual/AI layer.

## PLT-06 — Human care fragment
Health-worker/report/referral context.

## PLT-07 — Assembly
Signal Thread connects fragments into a coherent system diagram.

## PLT-08 — Research/future notice
Prominent status.

## PLT-09 — Close
Back to current product: Start Screening / Science.

---

# 9. Trust/legal pages

These remain intentionally plain relative to the cinematic routes.

## Privacy
Readable prose, no decorative scroll traps.

## Medical Disclaimer
Clear definition of screening vs diagnosis, experimental/research pathways, emergency symptoms overriding app reassurance.

The site's credibility would be damaged if legal/trust information were hidden behind excessive art direction.

---

# 10. Cross-route consistency matrix

| Element | Home | Screenings | Science | Impact | About | Journey | Platform |
|---|---|---|---|---|---|---|---|
| Signal Thread | master sequence | category connector | timeline rail | story connector | restrained | quality journey | multi-fragment network |
| Human media | high | low/medium | low | very high | medium | high | medium |
| Technical diagrams | medium | high | very high | low | low | high | high |
| Continuous marquee | 2 | optional 1 | none | optional | none | 1 | optional |
| Ivory reset | yes | yes | yes | optional | optional | optional | yes |
| Modal/overlay | story preview | no | no | core | no | no | no |
| Major CTA density | medium | high | low/medium | medium | medium | high close | medium |
| Future/research labels | selective | strong | strong | selective | status | selective | constant |

---

# 11. Definition of route-quality parity

A route meets the target only if:

- its narrative job is obvious;
- its composition cannot be mistaken for another route with different copy;
- it still feels like Vytal because the same Signal Thread, typography hierarchy, palette and truth language recur;
- the page contains at least one visually dominant chapter and at least one quiet chapter;
- media slots are treated as final geometry;
- motion is tied to meaning;
- no proof is fabricated to imitate the reference;
- mobile retains narrative hierarchy rather than collapsing into a generic stack.
