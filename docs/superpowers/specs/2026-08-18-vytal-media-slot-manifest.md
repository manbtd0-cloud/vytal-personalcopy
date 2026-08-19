# Vytal Reference-Driven Redesign — Media Slot Manifest

**Purpose:** Treat all missing photography/video/diagram media as production-level layout objects from day one. Empty frames must occupy the exact geometry, motion wrapper, crop and responsive role of the future asset.

---

# 1. Media rules

## 1.1 Placeholder is a first-class state

A missing asset does **not** remove the frame from layout.

When a slot has no `src`:

- render the final frame dimensions;
- preserve final aspect ratio;
- preserve crop/container clipping;
- preserve reveal/parallax wrapper;
- render a quiet Vytal neutral surface;
- development may show slot ID + intended media type;
- production may leave frame visually empty;
- never substitute random stock photography;
- never use shimmer/skeleton loaders for intentionally missing editorial media.

## 1.2 Rights/content rule

Final media must be one of:

- owned by Vytal/team;
- explicitly licensed for site use;
- commissioned;
- sourced from a legitimate reusable library with compatible license;
- supplied by a real participant with documented permission.

Do not download/reuse Save a Child's Heart media.

## 1.3 Human-story rule

No fake people or fake medical journeys.

Where story slots exist before real case material:

- label the narrative `Illustrative scenario`;
- use empty media frames;
- do not invent names, hospitals, diagnoses, quotes, ages, outcomes, or countries.

---

# 2. Shared `MediaFrame` metadata schema

Each slot should eventually be represented by data similar to:

```js
{
  id: 'HOME-HERO-01',
  route: '/',
  kind: 'video',
  ratio: 'full-viewport',
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

Suggested `status` values:

- `placeholder`
- `candidate`
- `approved`
- `final`

---

# 3. Home media slots

## HERO

### `HOME-HERO-01`
- kind: video-ready hero / still fallback
- ratio: viewport-cover
- priority: high
- reveal: wipe-signal / soft-scale
- desired content: intimate human + ordinary smartphone interaction; a face, hand or device can dominate; should feel real rather than posed medical advertising
- future video: 5–15s ambient sequence acceptable
- audio: none/autoplay muted
- required fallback: poster image

---

## ACCESS THESIS

### `HOME-ACCESS-DETAIL-01`
- kind: image/detail
- ratio: portrait 3:4 or narrow 2:3
- priority: low
- desired content: hand/device/environment detail, not a hero portrait
- optional; frame can remain intentionally empty if text composition is stronger without it

---

## PROOF FIELD

### `HOME-ACCESS-MAP-01`
- kind: original diagram/graphic
- ratio: wide 16:9 / full-field background
- desired content: abstract access/reach field or world silhouette
- explicit label: design intent, not deployment data
- rights: internally generated/original only

---

## SCIENCE LINEAGE TEASER

### `HOME-SCIENCE-DIAGRAM-01`
- kind: original diagram
- ratio: 4:3
- desired content: light → skin → camera channel variation → waveform
- no copied paper figures

---

## HUMAN CONTEXT PREVIEWS

### `HOME-STORY-INDIVIDUAL-01`
- kind: image
- ratio: landscape 4:3
- desired content: person using phone camera in an ordinary home/context
- initial narrative label: Illustrative scenario

### `HOME-STORY-INDIVIDUAL-02`
- kind: image/detail
- ratio: portrait 3:4
- desired content: hand/phone/camera closeup or follow-up context

### `HOME-STORY-HEALTHWORKER-01`
- kind: portrait
- ratio: 3:4
- desired content: community health worker or equivalent field-health context with device

### `HOME-STORY-HEALTHWORKER-02`
- kind: landscape
- ratio: 16:10
- desired content: screening/report/referral interaction

### `HOME-STORY-CONTINUITY-01`
- kind: landscape
- ratio: 16:9
- desired content: repeated-reading context / saved record / return visit

### `HOME-STORY-CONTINUITY-02`
- kind: image/detail
- ratio: square
- desired content: report/handoff/device detail

---

## SIGNAL JOURNEY — CAPTURE / EXTRACT / VERIFY / EXPLAIN

### `HOME-JOURNEY-CAPTURE-01`
- kind: image/video-ready
- ratio: portrait 4:5
- desired content: face/phone positioning or fingertip capture
- reveal: clip-up

### `HOME-JOURNEY-EXTRACT-01`
- kind: original diagram
- ratio: wide 16:9
- desired content: raw color-channel variation separating into a clean signal

### `HOME-JOURNEY-VERIFY-01`
- kind: original quality diagram
- ratio: near-square 1:1
- desired content: motion/lighting/visibility/quality map

### `HOME-JOURNEY-EXPLAIN-01`
- kind: product UI composition
- ratio: landscape 4:3
- desired content: Vytal result + explanation UI; use actual app visual language, example values only

---

## MEDIA/DOCUMENTARY RUN

The following frames form one irregular composition. Ratios intentionally differ.

### `HOME-MEDIA-01`
- portrait 4:5
- face + phone

### `HOME-MEDIA-02`
- landscape 3:2
- fingertip/phone macro

### `HOME-MEDIA-03`
- portrait 2:3
- community health worker

### `HOME-MEDIA-04`
- ultra-wide 16:9
- low-connectivity / rural / community environment

### `HOME-MEDIA-05`
- square 1:1
- multilingual explanation on device

### `HOME-MEDIA-06`
- landscape 4:3
- report or health-worker handoff

### `HOME-MEDIA-07`
- narrow portrait 9:16
- repeat reading / longitudinal context

### `HOME-MEDIA-08`
- landscape 16:10
- clinician/community worker conversation or referral context

### `HOME-MEDIA-09`
- square/detail
- phone/camera/device close-up

### `HOME-MEDIA-10`
- landscape/detail
- human/environment texture used as pacing image

All start empty.

---

## EVIDENCE & VOICES

### `HOME-VOICE-CLINICIAN-01`
- kind: portrait
- ratio: 4:5
- desired content: real clinician/researcher portrait with permission
- quote status: pending; no fake text

### `HOME-VOICE-HEALTHWORKER-01`
- kind: portrait
- ratio: 4:5
- desired content: real health worker/community practitioner with permission
- quote status: pending

### `HOME-EVIDENCE-RESEARCH-01`
- kind: original diagram or citation visual
- ratio: 3:2
- desired content: original visual explaining research result/concept; do not paste copyrighted paper figures

### `HOME-PRINCIPLE-01`
- kind: optional product/UI image
- ratio: 4:3
- desired content: AI explanation layer or raw-vs-explained screen

---

## PLATFORM EVOLUTION

### `HOME-ARC-CAMERA-01`
- kind: image/product
- ratio: 4:3
- desired content: ordinary camera sensing

### `HOME-ARC-CONFIDENCE-01`
- kind: diagram/product
- ratio: 4:3
- desired content: quality/confidence UI

### `HOME-ARC-CONTEXT-01`
- kind: product
- ratio: 4:3
- desired content: history/trend/report UI

### `HOME-ARC-FUTURE-01`
- kind: conceptual diagram
- ratio: 16:10
- desired content: camera + BLE + wearable + thermal fragments; explicitly future/research

---

# 4. Screenings page media slots

## Hero

### `SCR-HERO-01`
- kind: image/video-ready
- ratio: wide/full bleed
- desired content: optical sensing/device/human detail

## Core screening diagrams

### `SCR-HR-01`
- kind: original diagram
- ratio: 4:3
- desired content: camera signal → pulse timing

### `SCR-BR-01`
- original diagram
- ratio: 4:3
- desired content: respiratory rhythm component

### `SCR-HRV-01`
- original diagram
- ratio: 4:3
- desired content: beat intervals / variability

## Research screening media

### `SCR-SPO2-01`
- original diagram; camera color channels

### `SCR-RHYTHM-01`
- original interval/irregularity diagram; explicitly not ECG

### `SCR-ANEMIA-01`
- image/diagram placeholder; conjunctival region illustration, not a real patient until sourced

### `SCR-JAUNDICE-01`
- image/diagram placeholder; scleral region illustration

### `SCR-BP-01`
- original waveform timing diagram; explicitly single-site trend approach, not PTT diagram

### `SCR-BMI-01`
- original geometry/anthropometric approximation diagram

## Context/triage

### `SCR-CONTEXT-01`
- original context layering diagram

## Future integrations

### `SCR-BLE-01`
- device/product placeholder

### `SCR-THERMAL-01`
- device/thermal placeholder

### `SCR-WEARABLE-01`
- wearable placeholder

All future integration frames must carry a visible status label in the same visual region as the media.

---

# 5. Science page media slots

Science relies more on original diagrams and sourced references than photography.

### `SCI-HERO-01`
- kind: original diagram / macro optical image
- ratio: 16:10
- desired content: camera frame → ROI → signal concept

### `SCI-TIMELINE-PPG-01`
- kind: original explanatory diagram
- ratio: 4:3

### `SCI-TIMELINE-RPPG-01`
- original camera/face/remote sensing diagram

### `SCI-TIMELINE-ROI-01`
- original face-region/ROI diagram

### `SCI-TIMELINE-MOTION-01`
- original clean-vs-motion signal comparison

### `SCI-TIMELINE-IBI-01`
- original beat-interval diagram

### `SCI-TIMELINE-UNCERTAINTY-01`
- original confidence/uncertainty diagram

### `SCI-VIDEO-01`
- kind: optional video placeholder
- ratio: 16:9
- purpose: future real product/research demonstration only

### `SCI-VIDEO-02`
- optional second video slot, initially empty; remove entirely if no meaningful content exists

### `SCI-RESEARCH-BRANCHES-01..06`
- six smaller original diagram slots for SpO2/rhythm/anemia/jaundice/BP/BMI research pathways

### `SCI-VALIDATION-01`
- original validation-roadmap diagram

### `SCI-REFERENCES-01`
- no media required; bibliography is content, not decorative imagery

---

# 6. Impact page media slots

Each illustrative scenario reserves multiple production-sized frames so the future real-story system needs no redesign.

## Individual at home
- `IMP-HOME-01` landscape context
- `IMP-HOME-02` portrait/device interaction
- `IMP-HOME-03` result/follow-up detail

## Community health worker
- `IMP-CHW-01` portrait
- `IMP-CHW-02` environment landscape
- `IMP-CHW-03` report/referral detail

## Low connectivity
- `IMP-OFFLINE-01` wide environment
- `IMP-OFFLINE-02` device detail
- `IMP-OFFLINE-03` saved/local workflow detail

## Multilingual explanation
- `IMP-LANG-01` portrait/context
- `IMP-LANG-02` device UI detail
- `IMP-LANG-03` communication/handoff frame

## Longitudinal follow-up
- `IMP-LONG-01` first-reading context
- `IMP-LONG-02` later-reading context
- `IMP-LONG-03` trend/report detail

## Referral continuity
- `IMP-REFERRAL-01` person/context
- `IMP-REFERRAL-02` report handoff
- `IMP-REFERRAL-03` health-worker/clinician context

All begin empty and all scenario copy remains explicitly illustrative.

---

# 7. About page media slots

### `ABOUT-HERO-01`
- optional wide human/device/environment image

### `ABOUT-ORIGIN-01`
- kind: documentary/project image placeholder
- desired content: early Vytal development/process, if available

### `ABOUT-TEAM-01`
- portrait/team frame
- real team only

### `ABOUT-TEAM-02`
- optional second portrait/team frame

### `ABOUT-RESEARCH-01`
- product/research workspace image or diagram

Do not invent an office/lab/team photo.

---

# 8. Journey page media slots

### `JRN-HERO-01`
- kind: video-ready human/device demo
- ratio: full-width 16:9 or 16:10
- desired content: eventual real product demonstration

### `JRN-CONTEXT-01`
- context/human frame

### `JRN-FAIL-01`
- product UI/quality frame showing low confidence; example UI

### `JRN-LOCK-01`
- signal/quality diagram

### `JRN-RESULT-01`
- actual Vytal-style result UI with illustrative values

### `JRN-EXPLAIN-01`
- raw/explained UI

### `JRN-HISTORY-01`
- history/timeline UI

### `JRN-TREND-01`
- illustrative trend chart

### `JRN-CLOSE-01`
- optional human/device close frame

Every numeric result gets an `EXAMPLE / ILLUSTRATIVE` marker.

---

# 9. Platform page media slots

The Platform route is deliberately fragment-based.

### `PLT-FRAG-CAMERA-01`
- camera/product frame

### `PLT-FRAG-BLE-01`
- device placeholder

### `PLT-FRAG-WEARABLE-01`
- wearable placeholder

### `PLT-FRAG-THERMAL-01`
- thermal placeholder

### `PLT-FRAG-RECORD-01`
- longitudinal record/product frame

### `PLT-FRAG-LANGUAGE-01`
- multilingual UI frame

### `PLT-FRAG-REFERRAL-01`
- report/handoff frame

### `PLT-FRAG-POPULATION-01`
- original population-level research diagram

### `PLT-ASSEMBLED-01`
- kind: original system diagram
- desired content: all fragments connected into one Vytal architecture

No external-device photo implies current production support unless explicitly labelled.

---

# 10. Footer/legal media

No decorative photography is required for Privacy or Medical Disclaimer.

Footer may use only:

- Vytal mark;
- Signal Thread static divider;
- no social icons without actual accounts.

---

# 11. Asset acquisition priority

## Tier 0 — no external asset required
Can be created from product UI/original SVG/CSS:

- Signal Thread graphics
- core screening diagrams
- science diagrams
- quality/uncertainty visuals
- product UI frames
- trend/history graphics
- platform system diagram

## Tier 1 — highest value real imagery
Acquire first:

1. `HOME-HERO-01`
2. `HOME-STORY-HEALTHWORKER-01`
3. `HOME-MEDIA-01`
4. `HOME-MEDIA-02`
5. `HOME-MEDIA-03`
6. `IMPACT` scenario hero/context frames
7. `JRN-HERO-01` product demo footage

## Tier 2 — supporting documentary imagery
- remaining Home media run
- About team/project photos
- Impact secondary frames

## Tier 3 — optional
- extra Science video
- decorative environment/detail shots

The site must remain compositionally complete even if only Tier 0 assets exist.

---

# 12. Image QA

Every final image must be checked for:

- source/usage rights;
- sufficient resolution at largest render size;
- responsive crop at mobile/tablet/desktop;
- alt text;
- no accidental protected health information;
- no misleading implication of endorsement/use;
- no medical condition inference from a generic person's appearance;
- compression/format;
- loading priority;
- contrast under overlaid text;
- reduced-motion/poster behavior for videos.

---

# 13. Placeholder QA

Before real assets are inserted, verify that:

- all slot IDs are visible in development mode;
- no frame collapses to zero height;
- no section depends on the color/details of a missing image to remain readable;
- mobile crop/ratio is already intentional;
- reveal motion works on blank frame exactly as it will on media;
- page still feels deliberate rather than unfinished;
- there is no skeleton shimmer suggesting content is temporarily loading forever.
