# Vytal Reference-Driven Redesign — Content, Evidence & Claim Rules

**Purpose:** Define what the redesigned public experience may say, what must be sourced, what must remain illustrative, and how reference-like proof/story structures are populated without inventing medical or social proof.

---

# 1. Evidence hierarchy

When public copy conflicts with another source, use this order:

1. actual current implementation behavior;
2. newest committed audit/status documentation;
3. reviewed public screening content model (`src/public/content/screenings.js`);
4. Vytal research dossier / primary scientific sources;
5. older roadmaps/product vision documents;
6. marketing copy.

Marketing language never upgrades a feature's maturity.

---

# 2. Core product positioning

Preferred central description:

> Vytal explores how ordinary cameras can support an accessible first layer of health screening by extracting physiological signals, checking their quality, explaining what they may mean, and carrying useful context forward.

Shorter variants may be used by section, but they must preserve:

- screening rather than diagnosis;
- signal extraction rather than AI invention;
- quality/confidence;
- accessibility;
- context/continuity.

---

# 3. Approved vocabulary

Use where appropriate:

- screening
- estimate
- proxy
- possible
- indication
- trend
- flag
- context
- confidence
- signal quality
- research
- experimental
- illustrative
- confirmation recommended
- professional assessment
- future direction
- prototype

Avoid or require exceptional validation for:

- diagnosis / diagnose
- medical-grade
- clinically accurate
- replaces a doctor
- replaces a cuff
- replaces an ECG
- measures oxygen like a pulse oximeter
- detects atrial fibrillation definitively
- measures hemoglobin
- measures bilirubin
- saves lives
- prevents disease
- proven accuracy percentages not backed by validation data

---

# 4. Current capability status contract

The public site must inherit status directly from the reviewed screening model.

## Core

### Heart rate
- camera-derived estimate
- quality-sensitive
- not a substitute for clinical assessment when symptoms/readings concern the user

### Breathing rate
- estimate from physiological signal behavior
- motion/noise sensitive

### Pulse variability
- beat-timing/HRV-related context
- not ECG-based HRV assessment

## Research proxy / experimental

### Oxygen saturation proxy
- camera color-channel approximation
- not calibrated clinical pulse oximetry
- concerning readings require validated device/clinical confirmation

### Irregular rhythm screening
- pulse-interval screening flag
- not ECG
- cannot diagnose AFib

### Anemia indicators
- conjunctival color research proxy
- not a hemoglobin test

### Jaundice indicators
- scleral color research proxy
- not bilirubin measurement

### Blood-pressure trends
- experimental single-site waveform timing / calibrated trend concept
- not true two-site PTT
- not a cuff replacement

### BMI/malnutrition proxy
- rough anthropometric proxy
- not validated BMI measurement

## Context / triage

Respiratory, pediatric, pregnancy and alert-scale features are context/triage layers, not separate direct camera measurements.

## Future integrations

BLE, thermal and wearable work must be labelled future/research/prototype unless the implementation status materially changes.

---

# 5. Numbers and statistics

The reference site uses dramatic organizational statistics. Vytal may use numbers only when their derivation is explicit.

## 5.1 Currently safe product facts

### `8` supported explanation languages
Derive from `SUPPORTED_LANGUAGES.length` where practical rather than hard-coding independent marketing value.

Current list:
- English
- Urdu
- Pashto
- Sindhi
- Arabic
- Swahili
- Hindi
- Bengali

### `3` core physiological screening categories in the public content model
- Heart rate
- Breathing rate
- Pulse variability

If the reviewed content model changes, derive this from status/group data.

### `4` public quality/trust factors
The current public trust narrative names:
- motion
- lighting
- signal quality
- confidence

This count is a design/content fact, not a clinical validation metric.

### `1` ordinary-camera-first concept
Use primarily as editorial copy (`one camera`), not as a fake technical statistic.

## 5.2 Forbidden unsourced metrics

Do not invent:

- users screened;
- countries deployed;
- health workers using Vytal;
- hospitals/clinics using Vytal;
- lives saved;
- diagnoses found;
- referral success rates;
- accuracy/sensitivity/specificity;
- time saved;
- cost saved;
- number of scans completed;
- uptime;
- offline success percentages.

If real analytics become available later, they require a separate review before entering the public proof field.

---

# 6. Maps and geography

A world map or access field is allowed as a **design-intent visual**.

Mandatory wording nearby:

- `Designed for reach`
- `Access-first design direction`
- or equivalent

Forbidden:

- highlighting countries as if Vytal is deployed there without evidence;
- pulsing points that are described as live users;
- `available in X countries` without a real distribution/legal basis.

The reference site's global map demonstrates actual organizational reach. Vytal's map must not mimic that claim.

---

# 7. Human story policy

## 7.1 Before real case studies exist

All contextual narratives are labelled:

`ILLUSTRATIVE SCENARIO`

or, on Journey:

`ILLUSTRATIVE SCREENING JOURNEY — NOT A REAL PATIENT CASE`

Allowed:

- generic problem/context framing;
- product workflow;
- explicitly illustrative sample values;
- limitations;
- examples of when clinical confirmation would be recommended.

Forbidden:

- invented personal name;
- invented age tied to a claimed patient;
- invented location/hospital;
- invented diagnosis;
- invented quote;
- invented outcome;
- invented before/after story presented as real.

## 7.2 When real case studies become available

Require before publication:

- explicit permission/consent appropriate for public use;
- review for personal/medical data disclosure;
- factual verification;
- quote approval where needed;
- clear distinction between user experience and medical efficacy.

---

# 8. Quote/testimonial policy

The redesign intentionally includes reference-like quote slots.

Until real quotes exist:

- render the composition/frame;
- show a neutral development/public placeholder such as `CLINICIAN VOICE / PENDING` if desired;
- do not place invented sentence text inside quotation marks;
- do not generate AI-written testimonials.

Owned Vytal statements may occupy the same composition only if clearly labelled as:

- `Vytal principle`
- `Design principle`
- `Research principle`

Example:

> AI explains the measurements. It doesn't invent them.

This is product positioning, not a testimonial.

---

# 9. Research evidence policy

Science/history content must use primary sources where possible.

## 9.1 Historical/scientific dates

Before publishing a timeline year:

1. identify a primary paper/source;
2. verify publication/event date;
3. document citation in the Science content model;
4. avoid claims like `first ever` unless the source supports them.

## 9.2 Research summaries

Prefer paraphrase.

Do not reproduce long copyrighted passages or full paper figures.

Original diagrams should explain concepts in Vytal's visual language.

## 9.3 Vytal implementation truth

Science must explicitly separate:

- what research literature demonstrates in controlled studies;
- what the current Vytal prototype implements;
- what remains unvalidated or incomplete.

A research paper supporting a method does not automatically validate Vytal's implementation of that method.

---

# 10. AI copy rules

Core line:

`AI explains the measurements. It doesn't invent them.`

Public explanation should state:

- physiological/screening outputs originate from signal-processing/screening modules;
- AI is an explanation/translation layer;
- fallback/rule-based explanation exists in the current implementation when API service/key is unavailable;
- multilingual capability is part of accessibility.

Do not claim:

- AI independently diagnoses from the camera;
- AI validates signal quality unless the actual quality module does;
- AI replaces clinician interpretation.

---

# 11. Offline/accessibility wording

Allowed framing:

- offline-first philosophy
- low-connectivity thinking
- local/offline fallback explanation
- designed around constrained connectivity

Do not overclaim seamless production sync/offline infrastructure beyond implementation truth.

Avoid wording such as:

- `your records always sync securely everywhere`
- `works fully offline with cloud continuity`

unless backend/product state later proves it.

---

# 12. Longitudinal wording

Allowed:

- repeated readings can add context;
- history can show patterns/changes;
- saved records can help carry information forward;
- trend awareness;
- longitudinal risk research/direction where accurately labelled.

Do not claim:

- the app predicts disease from trends;
- trends replace clinical follow-up;
- a short camera history establishes diagnosis.

All example charts on the public site are labelled `Illustrative trend` unless sourced from a real consented case.

---

# 13. Future platform wording

Every page that mentions BLE, thermal, wearables, population-level insight or similar future extensions must include a nearby status treatment:

- `Research / future direction`
- `Prototype integration`
- or the exact reviewed status.

Do not allow future items to visually blend with current/core items without a status marker.

---

# 14. Product UI examples

Sample UI on Home/Journey may contain values such as heart rate or confidence solely to explain the interface.

Mandatory label:

- `EXAMPLE READING`
- `ILLUSTRATIVE`

Rules:

- values should be plausible but neutral;
- avoid dramatic emergency numbers for visual excitement;
- never present the example as a real measured person;
- explanation text must remain cautious.

---

# 15. CTA language

Preferred primary CTA:

`Start Screening`

Secondary CTAs:

- `See How It Works`
- `Explore Screenings`
- `Explore the Science`
- `See Impact`
- `Explore the Platform`

Avoid fear-based conversion copy such as:

- `Find out what's wrong now`
- `Detect disease before it's too late`
- `Know if you're sick`

---

# 16. Medical disclaimer placement

The full legal disclaimer lives on `/medical-disclaimer`.

Short disclaimers appear at:

- hero/product entry where appropriate;
- example results;
- experimental screening sections;
- Journey;
- final footer.

Preferred concise form:

`Screening support, not diagnosis.`

or

`Vytal supports screening and research. It does not provide a medical diagnosis.`

The disclaimer should be readable, not hidden at 8px opacity.

---

# 17. Emergency/symptom rule

Any content discussing abnormal or concerning results must preserve the principle:

**urgent/concerning symptoms override app reassurance.**

The public site should never imply that a reassuring camera screen rules out a medical problem.

---

# 18. Content model architecture

Prefer structured JS data over copy embedded inside large page components.

Recommended models:

- `content/home.js`
- `content/screenings.js` (existing, extend carefully)
- `content/science.js`
- `content/impact.js`
- `content/about.js`
- `content/journey.js`
- `content/platform.js`
- `content/mediaSlots.js`
- `content/siteFacts.js`

`siteFacts.js` should derive or centralize public numeric facts so the proof field, marquees and Journey page cannot drift apart.

---

# 19. Automated/content QA ideas

Tests/static checks should catch:

- every screening has a status;
- every research/future screening has limitation text;
- every Journey example contains illustrative marker;
- every Impact scenario is illustrative until explicitly marked real;
- no placeholder quote contains generated testimonial prose;
- no banned high-risk claim phrases appear in public content without an allowlist/review;
- supported-language count matches `SUPPORTED_LANGUAGES`;
- future integrations render visible future/research status;
- legal disclaimer route exists;
- Start Screening points to `/scan`.

A simple claim-scanner test can inspect content strings for known prohibited phrases such as `diagnoses`, `medical-grade`, `replaces your doctor`, etc. It is a guardrail, not a substitute for human review.

---

# 20. Final evidence principle

The reference site earns emotion with real children, real history and real outcomes. Vytal cannot ethically reproduce that credibility by manufacturing equivalents.

Therefore the redesign should copy the **space reserved for proof** before it has proof to fill it.

Beautiful empty frames, clearly illustrative journeys, sourced scientific evidence, and honest status labels are preferable to a visually complete but misleading healthcare website.
