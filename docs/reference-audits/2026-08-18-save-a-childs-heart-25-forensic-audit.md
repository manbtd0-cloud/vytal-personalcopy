# Save a Child's Heart — 25th Anniversary Site Forensic Reference Audit

**Reference:** https://25.saveachildsheart.org/  
**Audit date:** 2026-08-18  
**Purpose:** Exhaustive reference-system audit for the Vytal public experience.  
**Status:** Reference research only. No Vytal implementation decisions are made by this document.

---

## 1. Executive summary

The Save a Child's Heart 25th anniversary site is valuable to Vytal not because its subject matter is identical, but because it solves a related design problem unusually well: it has to communicate serious healthcare work while remaining emotionally memorable, visually ambitious, human, and donation/conversion capable.

The site's strongest idea is not a particular animation, card, layout, or color. It is the use of **one semantic visual language — the heartbeat — as connective tissue across many very different editorial compositions**.

The anniversary experience does not behave like a conventional healthcare SaaS website. It behaves more like an interactive documentary:

1. emotion first;
2. scale and proof second;
3. history and context;
4. individual human stories;
5. process and institutional capability;
6. longitudinal proof;
7. tangible contribution/conversion;
8. a final return to the mission.

Its pages are also deliberately not identical. The Home page is a broad anniversary narrative. History is a chronological scroll documentary. Faces of Hope is a living archive of individual outcomes. Global Giving Day is campaign/conversion storytelling. Get Involved is a compact action directory. Mazen is a single-patient case study that expands into institutional proof. Mosaic uses a page-specific visual metaphor around repair and wholeness.

This is the most important design lesson for Vytal:

> **A premium experience can have a persistent design grammar without forcing every page into the same component template.**

For Vytal, that points toward retaining our technology/science-first identity while allowing more human imagery, more editorial variation, more purposeful repetition, and a stronger persistent sensing/physiology motif.

---

## 2. Audit methodology and evidence policy

This audit intentionally separates evidence strength. The anniversary website is live, but the available inspection environment does not provide a full interactive desktop/mobile browser with frame-by-frame animation recording. Therefore no animation behavior is asserted as exact unless the evidence supports it.

### Evidence labels

#### DIRECTLY OBSERVED
Verified from the live site's parsed page structure, page copy hierarchy, links, media embeds, repeated DOM content, asset URLs, filenames, route structure, and footer/navigation structure.

#### EXTERNALLY CONFIRMED
A third-party article specifically describing this exact Save a Child's Heart anniversary site confirms the behavior. This is used for the hero video/heartbeat overlay, world-map/stat animation, and heartbeat history timeline.

#### STRONGLY INFERRED
The live DOM/asset structure makes a behavior highly likely — for example, identical sequences duplicated several times beside the same graphic motif — but the exact rendered motion could not be played interactively in this environment.

#### UNVERIFIED
A behavior that would require interactive browser capture, CSS/JS runtime inspection, or multiple real devices. It must not be treated as fact.

### What was audited

- route discovery and navigation structure;
- hidden/indexed anniversary routes;
- section order and narrative pacing;
- heading/body/stat hierarchy;
- images, videos, archival material, portraits, quote imagery;
- SVG motif system;
- repeated DOM patterns that appear to power looping interactions;
- storytelling and conversion patterns;
- patient-story structure;
- timeline structure;
- donation/action architecture;
- page-specific visual metaphors;
- shared shell/footer/social structure;
- likely CMS/build-platform clues;
- quality issues and stale artifacts;
- design principles worth translating to Vytal;
- things Vytal should explicitly *not* copy.

### What cannot be claimed as exact from this audit

- exact font family;
- exact hex colors;
- exact easing curves;
- exact transition durations;
- exact scroll trigger offsets;
- exact hover states;
- exact cursor behavior;
- exact page-transition implementation;
- exact responsive breakpoints;
- exact mobile animation substitutions;
- exact JS animation library beyond the site's strong Webflow evidence;
- measured performance metrics such as LCP/CLS/INP;
- accessibility conformance level.

Those require a full rendered-browser instrumentation pass.

---

## 3. Route inventory

Seven indexed/reachable anniversary-site routes were identified during the audit.

### Primary navigation routes

1. `/` — anniversary Home
2. `/faces-of-hope` — visible in navigation as **Our Children**
3. `/get-involved`
4. `/global-giving-day`
5. `/history`

### Hidden / non-primary-navigation anniversary routes

6. `/mazen` — feature on the organization's 6,000th treated child
7. `/mosaic` — special anniversary giving/mosaic page

No additional anniversary-subdomain pages were found in the final indexed-route exclusion searches. That is a strong practical route map, but not a mathematical guarantee that no orphan URL has ever existed.

---

## 4. Shared site shell

### 4.1 Navigation

**DIRECTLY OBSERVED**

The public navigation is compact and mission-focused:

- Home
- Our Children
- Get involved
- Global Giving Day
- History
- external link to the parent Save a Child's Heart site
- Donate Now

Two Donate Now destinations appear in parsed markup: one to the parent organization's site and another to an IsraelGives donation destination. The exact responsive/payment logic behind the duplication is unverified.

### 4.2 Footer

**DIRECTLY OBSERVED**

Shared footer elements include:

- anniversary/footer logo;
- YouTube;
- LinkedIn asset in the final footer bundle;
- Facebook;
- Twitter;
- Instagram link visible in parsed page navigation/footer data on several routes;
- 2021 copyright line.

Key footer asset filenames include:

- `logo-footer.svg`
- `yt.svg`
- `in.svg`
- `fb.svg`
- `tw.svg`

### 4.3 Conversion architecture

Donate CTAs are not sprinkled uniformly after every paragraph. The longer storytelling pages build emotional/contextual momentum and then place action at chapter boundaries or near the close. The shorter action pages are naturally more CTA-dense.

This distinction is important: **storytelling pages and conversion pages use different CTA density.**

---

# 5. Global visual system

## 5.1 The heartbeat/EKG as the master motif

The heartbeat is the site's most important ownable design device.

### Direct asset evidence

Recurring files include:

- `heart-icon-outline.svg`
- `ekg-stat.svg`
- `ekg.svg`
- `ekg-yellow.svg`
- `White_Heart_Icon.svg`

These are used across hero, statistics, history, quote areas, campaign sections, and repeated horizontal bands.

### Why it works

The motif is not decorative branding pasted onto unrelated sections. It has semantic legitimacy:

- the organization treats hearts;
- the heartbeat means life;
- it naturally becomes a line/timeline;
- it can connect data points;
- it can separate chapters;
- it can animate without feeling like arbitrary motion;
- it can bridge emotional imagery and clinical information.

The site's coherence therefore comes from **semantic repetition**, not just color consistency.

### Vytal lesson

Vytal needs an equally ownable visual/interaction grammar rooted in what Vytal actually does: revealing latent physiological information from ordinary optical input. A generic ECG line would be derivative and too obvious. The transferable principle is the semantic connective tissue, not the literal heartbeat graphic.

---

## 5.2 Typography behavior

The exact typeface was not verified. The structural typography system is clear.

**DIRECTLY OBSERVED:**

- oversized editorial headings;
- frequent all-caps anchors;
- deliberately unusual casing in campaign words;
- short emotional statements used as chapter breaks;
- very large year numerals in historical content;
- large numerical statistics paired with extremely simple labels;
- restrained body paragraphs beside expressive display type;
- small eyebrow/context labels followed by much larger semantic anchor words.

The resulting hierarchy often feels closer to an editorial magazine/exhibition than a healthcare product dashboard.

### Important caution

The casing play is effective when controlled but can quickly become gimmicky or look like a typo. Vytal should borrow confidence and hierarchy, not mimic random capitalization.

---

## 5.3 Color behavior

Exact hex values were not measured.

**DIRECTLY OBSERVED / asset-supported roles:**

- Save a Child's Heart blue as the dominant brand field;
- white for strong contrast;
- red-heart parent identity;
- yellow as a recurring anniversary accent, especially around quote/EKG assets;
- documentary photography introduces warmer and more complex natural color.

The important point is not the palette itself. The site lets **photography carry much of the visual color variation** rather than forcing every section into artificial gradients.

---

## 5.4 Imagery strategy

This site is emphatically not image-light.

Its media system includes:

- full-scale hospital video;
- patient documentary photography;
- archival/retro photography;
- before/after or then/current photographs;
- clinical/hospital environments;
- caregiver/family imagery;
- supporter portraits;
- campaign photography;
- YouTube embeds;
- Vimeo embeds;
- art/project photography on Mosaic.

### Why the photography works

The photographs are not stock decoration. They serve as **evidence**:

- a child existed;
- treatment happened;
- time passed;
- a person grew up;
- a medical team worked;
- a country/community was reached;
- the institution has history;
- the outcome has a human face.

This is a major corrective to Vytal's earlier technology-first/image-light direction. Vytal should remain technology-first, but we should not avoid human imagery merely to appear futuristic. Selective real, documentary, or carefully commissioned imagery can deepen credibility and emotional memory.

---

## 5.5 Layout grammar

Common layout behaviors across the site include:

- full-bleed cinematic hero treatment;
- long-form scroll storytelling;
- giant typography as chapter separators;
- asymmetric/editorial text-and-media pairings;
- nonuniform image clusters instead of endless equal cards;
- horizontal repeated-content bands;
- videos inserted as narrative interruptions;
- generous negative space around emotionally important lines;
- large single-purpose statistics;
- high contrast between dense image chapters and sparse statement chapters;
- route-specific compositions under one common visual language.

The site does **not** look premium because every section is visually complex. It looks premium partly because it knows when to become simple.

---

# 6. Global motion and interaction system

## 6.1 Motion matrix

| Behavior | Evidence | Confidence | Design function |
|---|---|---:|---|
| Full-scale hospital/children hero video | Exact-site external review | High | Immediate emotional immersion |
| Animated heartbeat line over hero video | Exact-site external review | High | Branded semantic motion |
| World map over animated organizational statistics | Exact-site external review | High | Turns scale/proof into a moving chapter |
| Animated heartbeat history timeline | Exact-site external review | High | Makes chronology feel physically connected |
| Patient-name horizontal loop | Repeated sequence four times in Home DOM + EKG asset | Strong inference | Rhythm, scale, human identity |
| Country-name horizontal loop | Repeated country sequences + EKG asset | Strong inference | Global scale without static map-only presentation |
| Mazen statistics loop | Same statistic block repeated three times | Strong inference | Keeps macro proof kinetic |
| Mosaic photo conveyor/scroller | Long repeated labeled image sequence | Strong inference | Creates visual flow before giving proposition |
| Faces story modal/detail overlay | Repeated close button per CMS story, no individual child routes | Strong inference | Keeps browsing in one archive context |
| Learn More expansion without route change | Repeated preview + full narrative in same DOM | Strong inference | Progressive disclosure |
| Exact hover effects | Not captured | Unverified | — |
| Exact page transitions | Not captured | Unverified | — |
| Custom cursor | Not captured | Unverified | — |
| Mouse parallax | Not captured | Unverified | — |
| Exact scroll easing / smooth-scroll engine | Not captured | Unverified | — |
| Mobile motion substitutions | Not captured | Unverified | — |

## 6.2 Confirmed homepage motion sequence

An exact-site healthcare design review describes the homepage as opening with a full-scale hospital-children video with an animated heartbeat line layered over it. It then describes a world map superimposed on animated accomplishment statistics, followed later by an animated heartbeat-line organizational timeline.

That matters because it confirms the site's core motion principle independently of markup inference: **motion is attached to semantic information**, not merely reveal-on-scroll decoration.

## 6.3 Repetition as a motion technique

Several content sequences are duplicated multiple times in the DOM.

This is especially visible with:

- patient names on Home;
- country names on Home;
- macro statistics on Mazen.

The most likely reason is seamless looping/marquee behavior. Exact speed/direction cannot be asserted, but the duplication itself is directly observable.

### Design lesson

Infinite motion works here because the repeated content represents things that are inherently numerous: people, countries, cumulative impact. The loop communicates abundance.

Vytal should only use repetition when the meaning supports it — e.g. signal samples, repeated readings, longitudinal measurements, languages, or screened communities — not simply because a marquee is fashionable.

---

# 7. Home page — forensic audit

**Route:** `/`

## 7.1 Narrative job

Home is the broad anniversary documentary. It must simultaneously explain mission, evoke emotion, show scale, prove longevity, feature individual lives, show global reach, establish institutional capacity, and convert visitors.

It succeeds by sequencing those jobs instead of trying to fit all of them into the hero.

## 7.2 Hero chapter

The hero centers on the 25-year anniversary and hope.

**EXTERNALLY CONFIRMED:**

- full-scale video featuring children/hospital context;
- animated heartbeat overlay.

**DIRECTLY OBSERVED:**

- anniversary-first typography;
- explicit scroll invitation;
- anniversary mark and heart-outline assets;
- mission language follows quickly after the initial emotional hook.

### Why this works

The hero does not start with service categories. It starts with *why the work matters* and makes the medium itself — real people in video — part of the proof.

## 7.3 Scale/statistics chapter

The site presents large organizational accomplishments such as missions, countries, medical trainees, children treated/saved, and children examined.

The same statistics appear in repeated groups.

**EXTERNALLY CONFIRMED:** a world map is layered with animated accomplishment statistics.

### Design role

The page shifts from emotion to quantitative credibility without feeling like it has left the story.

## 7.4 Mini-history chapter

A compressed historical sequence introduces milestones from the organization's founding era through major treatment and institutional events.

The timeline includes founding, early cross-border patient care, documentary/media milestones, a children's home, international recognition, and milestone patients.

**EXTERNALLY CONFIRMED:** animated heartbeat-line history treatment.

### Live-site quality issue

A leftover placeholder paragraph appears in the Home timeline. This is an important reminder that impressive motion cannot compensate for content QA.

## 7.5 Faces-of-Hope preview chapter

Home does not use generic testimonials. It introduces named former patients and their longitudinal stories.

The recurring narrative structure is:

- person;
- original health problem / treatment circumstance;
- the care journey;
- what happened later;
- present-day life, study, family, or ambitions.

This converts “impact” from an abstract metric into a time-based human outcome.

## 7.6 Courage / care-journey editorial chapter

A major editorial block reframes the work through four concepts around access, action, healing, and resilience.

Each concept pairs:

- a large editorial word treatment;
- documentary imagery;
- explanatory body copy.

Representative image assets include:

- `story-9.jpg`
- `Taking-Action-3.jpg`
- `quote-8.jpg`
- `RESILIENCE-3.jpg`

### Design lesson

This section is not a “four feature cards” grid even though it communicates four pillars. Each pillar is treated as a visual chapter.

## 7.7 Patient-name rhythm band

The page contains a sequence of individual names repeated four times in the DOM, with recurring EKG/stat imagery.

Names include people such as Ionut, Hanna, Arena, Shaida, Lisa, Diana, Avita, Arielle, Hamza, Jowin, Yahya, Omer, Mahir, Lemos, and Clairia.

**STRONGLY INFERRED:** seamless name marquee/loop.

### Why it matters

Instead of saying “thousands of children,” the site turns scale into identities.

## 7.8 Archival/documentary “25 years” image chapter

The site creates a long photo-driven sequence that mixes current and archival media.

Representative assets:

- `Rose-from-Kenya.jpg`
- `img-10.jpg`
- `Abdourahman-from-Gambia.jpg`
- `retro-sach-25-3.jpg`
- `quote-9.jpg`
- `img-3.jpg`
- `retro-sach-25-1.jpg`
- `Tasnin-from-the-Palestinian-Authority.jpg`
- `quote-4.jpg`
- `Senet-from-Ethiopia.jpg`
- `img-2.jpg`
- `retro-sach-25-2.jpg`
- `img-4.jpg`
- `Fidan-from-Kosovo-0.jpg`
- `retro-sach-25-4.jpg`
- `Lilu-from-Chinajpg.jpg`

### Design lesson

The deliberate mix of image ages and textures makes *time visible*. A perfectly uniform modern photo set would actually weaken the anniversary narrative.

## 7.9 Emotional bridge

After dense evidence and imagery, the page uses a sparse statement about courage, hope, healing, and giving.

This is a pacing reset before another proof chapter.

## 7.10 Quote/testimonial chapter

The quote system combines real-person photography, oversized quote treatment, yellow quote marks, and yellow EKG graphics.

Representative assets:

- `Dia01.jpg`
- `quotes-yellow.svg`
- `ekg-yellow.svg`
- `Dr.-Ahmed-Zarour.jpg`
- `Surgery-1.jpg`
- `quote-3.jpg`

Voices include a parent, a physician, another parent, and supporter/volunteer perspectives.

### Design lesson

The site deliberately mixes **beneficiary, clinician, and supporter voices**. Credibility is therefore distributed across stakeholder types rather than outsourced to one testimonial format.

## 7.11 Country/global-reach band

A long country list is repeated multiple times beside EKG/stat graphics.

The list spans Africa, Asia, the Palestinian territories, Europe, the Caribbean, and other regions.

**STRONGLY INFERRED:** another continuous horizontal marquee/loop.

### Why it works

The earlier world-map/data chapter gives geographic abstraction; this later text loop gives geographic accumulation. The site uses two different visual mechanisms to prove the same global premise without repeating the same layout.

## 7.12 Institutional arc

Near the lower page, the story shifts from individual treatment to institution-building:

- founding;
- expanding access;
- growing the mission;
- new hospital/infrastructure.

Representative assets:

- `Copy-of-Dr.-Ami-Cohen-(2).jpg`
- `Dr.-Lior-Sasson-and-Palestinian-patient.jpg`
- `Sylvan-Adams-Children's-Hospital_external-(4).jpg`

### Design lesson

The site delays organizational/institutional messaging until after the visitor understands the people. That order prevents the nonprofit from feeling bureaucratic.

## 7.13 Donation-economics chapter

The page translates donation amounts into concrete outcomes such as a medical mission, physician training, a child's treatment, or accommodations.

### Why it works

The conversion is not “Donate because we asked.” It converts money into an understandable unit of impact.

## 7.14 Final close

The page returns to the one-heart-at-a-time mission, Get Involved, a moral/mission statement, a final human image, donation, newsletter, and footer.

The site therefore closes by compressing the entire long narrative back into a simple action.

## 7.15 Home pacing map

**Emotion/video → scale/data → history → individual lives → care philosophy → people rhythm → archive/history imagery → emotional reset → multi-stakeholder quotes → global reach → institution/future → donation economics → action.**

This pacing map is more valuable to Vytal than any single visual component.

---

# 8. History page — forensic audit

**Route:** `/history`

## 8.1 Narrative job

History is a scroll-based institutional documentary. It answers: *How did this organization become credible over time?*

## 8.2 Opening strategy

The page does not immediately begin with a database-like year list. It establishes founder/origin context before the formal chronology.

### Why this matters

Chronology becomes emotionally legible because the visitor first knows *whose idea and conviction* created it.

## 8.3 Timeline structure

Years represented include:

- 1990
- 1995
- 1996
- 1998
- 1999
- 2000
- 2001
- 2004
- 2008
- 2009
- 2010
- 2011
- 2012
- 2013
- 2014
- 2015
- 2016
- 2018
- 2019
- 2020

The important design feature is **irregularity**.

Different years receive different editorial weight:

- some are compact milestones;
- some contain long contextual essays;
- some have image clusters;
- some are punctuated by large quotations;
- selected moments use embedded video.

This prevents the timeline from becoming 20 identical cards.

## 8.4 Video interruptions

YouTube embeds appear at selected milestones, including videos associated with 2008, 2013, and 2019.

The video IDs observed are:

- `6oWbbuYZZyU`
- `1leL9Re-gz8`
- `RrmLLsQaPNc`

### Design role

Video is reserved for moments where moving media adds historical/emotional value. It is not a decorative background repeated everywhere.

## 8.5 Quote interruptions

Quotes appear at major points, including founder/team reflections and cross-border-care framing.

The timeline therefore alternates between **fact, artifact, image, quotation, and moving media**.

## 8.6 Motion

**EXTERNALLY CONFIRMED:** the organizational history is rendered with an animated heartbeat-line timeline.

This is an ideal semantic transformation: heartbeat → line → temporal connector.

## 8.7 Representative assets

- `logo.svg`
- `ekg.svg`
- `line.svg`
- `IMG_8683.jpg`
- `top-3.jpg`
- `story-10.jpg`
- `Ethiopia.jpg`
- `1996-First-Palestinian-child-operated-by-SACH-in-Israel.jpg`
- `quotes-yellow.svg`
- `ekg-yellow.svg`
- `sach-history-5.jpg`
- `Dr.-Lior-Sasson-and-Palestinian-patient.jpg`
- `Copy-of-Dr.-Ami-Cohen-in-2000_Ethiopia.jpg`
- `2001 - Journal Article.jpeg`
- `2001-Dr-Ami-Cohen’s-death-on-the-Kilimanjaro,-the-team-commits-itself-to-continuing-its-mission.jpg`
- `4.jpg`
- `Iraq.jpeg`
- `2004.jpg`
- `2009-First-Child-from-Kosovo-Treated.jpg`
- `2012-SACH-opens-the-Legacy-Heritage-Children’s-Home-in-Holon.jpg`
- `D6CJ_-WX4AEXkl1.jpeg`
- `2016-First-Joint-Israeli-German-catheterization-mission-to-Tanzania.jpg`
- `award-2-1.jpg`
- `2019-Uzbekistan-became-the-60th-country-whose-children-have-been-saved-by-SACH.jpg`
- `Sylvan-Adams-Children's-Hospital_external.jpg`
- `Hamza-Dar-Ali-Mohammed-(28)-(1).jpg`
- `1 (2).jpeg`
- `3 (1).jpeg`
- `4.jpeg`
- `2 (1).jpeg`
- `Add-to-scroller-1.jpg`
- `Add-to-scroller-2.jpg`
- `logo-footer.svg`

## 8.8 Core lesson for Vytal

A timeline should be a **choreography of evidence**, not a chronologically sorted card component. If Vytal later has a validation/research/product-evolution timeline, milestone importance should determine layout weight.

---

# 9. Faces of Hope — forensic audit

**Route:** `/faces-of-hope`

## 9.1 Narrative job

This page is a living archive of outcomes. Its central promise is not merely that children were treated, but that visitors can see where former patients are *now*.

This makes it one of the strongest conceptual references for Vytal's future longitudinal-health story.

## 9.2 Story architecture

Each story contains the same conceptual layers:

1. several photographs;
2. the person's name;
3. a short teaser/hook;
4. a longer treatment/history narrative;
5. a present-day outcome;
6. a short preview quote/summary;
7. a Learn More action.

The live DOM contains both teaser and detailed content for each person.

## 9.3 Interaction architecture

A shared `close-btn.svg` is repeated around the CMS story content, while there are no individual child-story routes.

**STRONGLY INFERRED:** Learn More opens an overlay/modal/detail state on the same page and the repeated close button exits that state.

This is a strong UX choice for browsing many stories without repeatedly leaving the archive.

## 9.4 Verified story inventory

The page contains 21 named stories:

1. Alexia
2. Fatma
3. Meron Shimeles
4. Noura
5. Arena
6. Sarah
7. Hamza
8. Clarence
9. Avita
10. Mahmad
11. Christina
12. Didier
13. Khayrat
14. Ahmed
15. Yared
16. Julius
17. Jarusha
18. David
19. Ferdinand
20. Elhme
21. Zeinab

## 9.5 Longitudinal pattern

Many stories explicitly bridge childhood treatment to later life:

- school achievement;
- medicine/healthcare careers;
- marriage/family;
- university;
- sports and hobbies;
- community volunteering;
- repeat interventions and follow-up;
- long-term relationship with the organization.

The emotional mechanism is therefore **time**, not sentimental copy alone.

## 9.6 Asset pattern

Each story uses multiple images, often mixing treatment-era and present-day imagery.

### Alexia
- `Alexia.PNG`
- `Alexia Vien CASTRO Philippines saying goodbye to Mama Hbraime Mali March 29 2011_2_resize.JPG`
- `WhatsApp Image 2021-05-06 at 8.31.36 PM (1).jpeg`

### Fatma
- `Fatma-1.jpeg`
- `Fatma_O_1.jpeg`
- `Fatma Simai SILIMA_Zanzibar and mother (17).jpeg`
- `img-6.jpg`

### Meron
- `WhatsApp Image 2021-04-21 at 12.37.02 AM.jpeg`
- `WhatsApp Image 2021-04-18 at 10.03.14 AM.jpeg`
- `Meron-1.jpg`

### Noura
- `WhatsApp Image 2021-06-29 at 12.48.12 PM.jpeg`
- `WhatsApp Image 2021-06-29 at 12.42.27 PM (3).jpeg`
- related `(2).jpeg`

### Arena
- `arena-1.jpg`
- `arena-2.jpg`
- `arena-3.jpg`

### Sarah
- `WhatsApp Image 2021-04-19 at 4.29.46 PM.jpeg`
- `IMG_5503.jpg`
- `Sara Rambally.jpeg`

### Hamza
- `hamza-2.jpeg`
- `hamza-3.jpeg`
- `hamza-4.jpeg`
- `Hamza.jpeg`

### Clarence
- `Clarence 1.JPG`
- `Clarence 3.jpeg`
- `Clarence 2.JPG`
- `Clarence-2.jpg`

### Avita
- `Avita_3.jpg`
- `Avita_2.jpg`
- `Avita_1.jpg`
- `Avita Nepal_2020.jpg`

### Mahmad
- `Mohammad Shweike Jericho 8mos..jpg`
- April 2021 WhatsApp image
- `Mahmad SHWEIKY_PA.jpeg`
- `Mohammad-1.jpg`

### Christina
- `Cristina URSU Moldova June 11 2013_1cropped.jpg`
- `Christina Ursu, Moldova 2.jpeg`
- `Capture.png`

### Didier
- `Didier 1.jpg`
- `Didier 3.jpeg`
- `Didier 2.JPG`
- `Didier-2.jpg`

### Khayrat
- `Kharat-o-2.jpeg`
- `Khayrat 2.jpeg`
- `Kharat-o-1.jpeg`

### Ahmed
- June 2021 WhatsApp images
- `Ahmed Dweikat_PA_Gaza0.jpg`

### Yared
- `Yared-at-the-SACH-House-Nov-22-0005.jpg`
- `Yared-in-Sydney-by-George-Makrigany-August-20-0004.jpg`
- `Yared-Worde-SACH1999.jpg`

### Julius
- `j2.jpg`
- `Julous-outside-the-school.jpg`
- `Julius-Bernard.jpg`

### Jarusha
- `processed-(3).jpg`
- `processed-(1).jpg`
- `Jarusha 2.jpeg`

### David
- `David-from-Romania-Thumb.jpg`
- `david-s1.jpg`
- `David 2016.png`

### Ferdinand
- `Ferdinand.PNG`
- `Ferdinand2.PNG`
- `Ferdinand1.PNG`

### Elhme
- `Elhme-CTA.jpg`
- `Tile_7.jpg`
- `IMG_4723.jpg`
- `Half_1.jpg`

### Zeinab
- `Zeinab-1.jpg`
- `Zeinab-3.jpeg`
- `Zeinab-2.jpg`

### Shared story control
- `close-btn.svg`

## 9.7 Content/data quality note

Some teaser ages/descriptions are stale relative to the longer story copy. This is another reminder that longitudinal storytelling creates content-maintenance responsibility.

## 9.8 Core lesson for Vytal

If Vytal shows real-world longitudinal health journeys in the future, the strongest presentation may be **a before/now narrative with time, context, and follow-up**, not testimonials about how “easy the app was.”

---

# 10. Global Giving Day — forensic audit

**Route:** `/global-giving-day`

## 10.1 Narrative job

This is a conversion campaign page, not an encyclopedia of the organization.

It compresses the anniversary identity into a clear event/action funnel.

## 10.2 Flow

The page moves through:

1. anniversary/campaign hero;
2. embedded video;
3. the proposition that each gift contributes to future treatment;
4. a concrete child-saving goal;
5. beneficiary/family voices;
6. supporter/celebrity/clinician voices;
7. eBay auction/event activation;
8. future-access CTA.

## 10.3 Direct voices

Video/voice sections include beneficiaries/families such as Mwewa, Mama Josaiah, Ester, and Mama Harvey.

Supporter/authority voices include Avi Issacharoff, Uri Geller, Fiona Gubelmann, and Dr Lior Sasson.

### Why this works

The campaign does not rely on one kind of social proof. It layers:

- beneficiary voice;
- caregiver voice;
- clinician authority;
- recognizable supporter voice;
- institutional action.

## 10.4 Representative assets

- `25-graphic.svg`
- `ekg.svg`
- `GGD option8.jpeg`
- `heart-graphic-meter.svg`
- `25th anniversary - global giving day photo shoot (11).jpg`
- `25th anniversary - global giving day photo shoot (66) (1).jpg`
- `Avi.PNG`
- `quotes-yellow.svg`
- `Uri Geller.jpeg`
- `unnamed.jpeg`
- `Dr. Lior Sasson.jpg`
- `ebay-logo-color.svg`
- `GGD option4.jpeg`

## 10.5 Design lesson

The page preserves the same heartbeat/quote identity while **reducing narrative breadth**. A conversion page should not automatically inherit the Home page's length.

---

# 11. Get Involved — forensic audit

**Route:** `/get-involved`

## 11.1 Narrative job

Get Involved is a compact action directory.

It is dramatically shorter than Home or History.

## 11.2 Action modules

The page routes visitors into several participation modes:

- direct donation;
- activating personal networks/fundraising;
- eBay auction participation;
- the Mosaic Mezuzah project tied to the new children's hospital;
- deeper Learn More path.

## 11.3 Representative assets

- `story-3.jpg`
- `img-4.jpg`
- `Nogaye Samb DIENG with bubbles.jpg`
- `IMG_2801.jpg`

## 11.4 Design lesson

The site does not mistake “consistent branding” for “same page template.” This route becomes short and decisive because the user's intent here is action, not education.

---

# 12. Mazen — hidden single-story feature audit

**Route:** `/mazen`

## 12.1 Why this hidden route matters

Mazen reveals a narrative mode that the primary navigation alone would not expose: **one patient story as the spine for a full institutional proof page**.

## 12.2 Flow

The page begins with a major milestone — 6,000 children treated — but immediately anchors that milestone in one child's story.

The chapter sequence is approximately:

1. milestone hero;
2. cinematic Vimeo feature;
3. Mazen's personal story;
4. clinician/expert quote;
5. institutional commitment;
6. advanced-treatment capability;
7. regional/population statistics;
8. organization-wide scale statistics;
9. future donation close.

## 12.3 Video

Observed Vimeo embed:

- `656779364/c74419d740`

## 12.4 Macro proof/statistics

The page includes regional and institutional figures around Palestinian screening, trained professionals, patient composition, historical Palestinian patients, recent patients, catheterization volume, years of activity, countries reached, and total children treated.

The complete statistics group is duplicated three times in the DOM.

**STRONGLY INFERRED:** the repetition powers a moving/looping statistic band.

## 12.5 Representative assets

- `Mazen-Alhato_Gaza44.jpg`
- `Mazen-Alhato_Gaza5.jpg`
- `Mazen-Alhato_Gaza4(1).jpg`
- `Mazen-Alhato_Gaza26.jpg`
- `quotes-yellow.svg`
- `ekg-yellow.svg`
- `Mazen-Alhato_Gaza41.jpg`
- `Mazen-Alhato_Gaza15.jpg`
- `Mazen-Alhato_Gaza40.jpg`

## 12.6 Design lesson

This page solves a difficult communication problem: how to discuss systems, training, advanced treatment, geography, and scale without becoming corporate. It keeps returning to one child.

For Vytal, this suggests future case-study pages could use one real screening journey to explain camera sensing, uncertainty, longitudinal records, multilingual explanation, and referral flow.

---

# 13. Mosaic — hidden giving-metaphor audit

**Route:** `/mosaic`

## 13.1 Why this route matters

Mosaic proves that the site allows **page-specific conceptual art direction** without abandoning the parent brand.

## 13.2 Opening

The route introduces special anniversary giving opportunities and the upcoming children's hospital.

It then enters a long repeated documentary image sequence labeled around a specific child/location context before explaining the art/giving concept.

## 13.3 Mosaic metaphor

The collaboration with artist Mia Schon uses the mosaic as a conceptual metaphor:

- broken pieces;
- repair/healing;
- separate pieces becoming whole;
- diverse pieces forming a shared/global community.

This is not merely a product card. The design proposition and fundraising object are made meaningful by metaphor.

## 13.4 Giving options

The page presents premium giving opportunities such as:

- a limited Mosaic Mezuzah project;
- a Hearts Wall opportunity;
- artist information / external artist material.

## 13.5 Representative assets

- `4.jpg`
- `2.jpg`
- `quote-9.jpg`
- `IMG_2602.jpg`
- February 2021 WhatsApp image
- `quote-4.jpg`
- `3.jpg`
- `IMG_2767.jpg`
- `img-4.jpg`
- `IMG_2697.jpg`
- February 2021 WhatsApp image
- `IMG_2830.jpg`
- `White_Heart_Icon.svg`
- `IMG_2801.jpg`
- April 2021 WhatsApp image
- `Mia Schon Bio Pic.png`

## 13.6 Motion inference

The many repeated child/location/image units form a long visual run before the giving explanation.

**STRONGLY INFERRED:** this is implemented as a scrolling/conveyor-style image sequence or equivalent kinetic photo band. Exact motion is unverified.

## 13.7 Design lesson

The lesson is not “Vytal needs a mosaic.” The lesson is that a supporting page can have its **own metaphor and composition** while still belonging to the same overall system.

---

# 14. Content architecture across the seven routes

| Route | Primary narrative job | Dominant proof type | Conversion intensity |
|---|---|---|---|
| Home | Anniversary master narrative | Emotion + scale + history + people | Medium, delayed |
| History | Institutional longevity | Chronology + archive + video | Low/medium |
| Faces of Hope | Longitudinal human outcomes | Individual then/now stories | Low until close |
| Global Giving Day | Campaign conversion | Voices + goal + event | High |
| Get Involved | Action directory | Participation options | Very high |
| Mazen | Single case → system proof | One child + clinician + macro stats | Medium/high |
| Mosaic | Metaphor-led premium giving | Art + documentary imagery + giving object | High |

The design system supports different **jobs**, not merely different URLs.

---

# 15. Why the site feels more premium than a normal healthcare/nonprofit site

## 15.1 It begins with a feeling, not an information architecture

The homepage earns attention with cinematic humanity before asking visitors to process organizational structure.

## 15.2 It has one ownable semantic motif

The heartbeat keeps returning in different forms. That creates recognition without needing every section to look alike.

## 15.3 Its sections have different physical rhythms

Some sections are full viewport. Some are dense photo streams. Some are sparse statements. Some are moving data. Some are timelines. Some are overlays.

The variation prevents “component fatigue.”

## 15.4 It treats photography as evidence

Real people and real historical media make the page feel harder to fake.

## 15.5 It uses motion to explain meaning

The strongest confirmed motion is not random reveal animation:

- heartbeat animates life;
- timeline animates history;
- map/stat animation animates scale.

## 15.6 It repeats strategically

Names, countries, and statistics become rhythmic fields. Repetition communicates scale and continuity.

## 15.7 It makes time visible

History, archival imagery, former-patient stories, and milestone pages all use the passage of time as proof.

## 15.8 It lets pages specialize

History does not become Home with different copy. Faces does not become a generic CMS grid. Get Involved does not become a 15-section landing page.

## 15.9 It balances emotion and institution

The site frequently uses a pattern like:

**person → feeling → evidence → institution → action**

instead of institution-first corporate copy.

## 15.10 It knows when to simplify

Big emotional lines are often given room. Conversion pages are shorter. Not every surface is animated.

---

# 16. Design patterns worth borrowing as principles — not copies

## 16.1 Persistent semantic motion language

**Borrow:** one central visual behavior that is genuinely related to the product and can mutate across contexts.

**Do not borrow literally:** the heartbeat line.

For Vytal, the candidate grammar should come from **signal extraction / hidden physiological information / optical sensing**.

## 16.2 Emotion → proof sequencing

Vytal can reveal the human stakes before diving into technical signal processing, then use science as proof rather than as the opening burden.

## 16.3 Documentary evidence

Where appropriate, Vytal can use selective real-world human photography or carefully commissioned documentary-style visuals.

Avoid generic doctor-with-tablet stock imagery.

## 16.4 Time as proof

Vytal's longitudinal-health proposition can become visual:

- a reading now;
- another later;
- a trend;
- a changed confidence state;
- escalation/referral if needed.

## 16.5 Page-specific narrative modes

Potential future Vytal mapping — **conceptual only, not approved design:**

- Home = master sensing story;
- Screenings = structured capability/limitations catalogue;
- Science = experimental/technical evidence narrative;
- Impact = people/access/community-health-worker story;
- About = origin/mission/principles;
- case studies = individual longitudinal journeys.

## 16.6 Repetition with semantic meaning

Potential Vytal uses:

- optical sample values;
- repeated readings;
- longitudinal timestamps;
- community screenings;
- language accessibility;
- signal-quality states.

The repetition should represent abundance/continuity, not exist merely to fill horizontal space.

## 16.7 Irregular editorial composition

Stop treating every four-part idea as four equal cards. Important ideas should receive different visual weight.

## 16.8 Human + technical juxtaposition

A real person can sit beside a signal field, measurement artifact, confidence visualization, or UI fragment. The emotional and technical layers do not need separate websites.

---

# 17. Patterns Vytal should NOT copy

## 17.1 Do not clone the heartbeat

It belongs naturally to Save a Child's Heart and would make Vytal feel derivative.

## 17.2 Do not inherit nonprofit donation structure where it does not fit

Vytal's primary action is screening/product entry, not fundraising.

## 17.3 Do not inherit outdated campaign copy

The anniversary site contains dated 2021 campaign material and milestone numbers. Vytal should architect changing claims/data so stale copy is easier to maintain.

## 17.4 Do not duplicate DOM loops recklessly

The reference repeats some sequences several times to support kinetic bands. Vytal should build loops efficiently and test runtime/memory/DOM cost.

## 17.5 Do not overuse playful casing

What works as anniversary art direction can look careless in a clinical/scientific product.

## 17.6 Do not let spectacle invade the medical app

The public Vytal experience can be cinematic. `/scan`, Dashboard, and Reports still need clinical restraint, readability, and predictable controls.

## 17.7 Do not copy visual assets or compositions one-for-one

We should translate mechanisms:

- semantic motif;
- editorial pacing;
- human evidence;
- motion tied to meaning;
- page specialization;
- longitudinal storytelling.

The resulting Vytal art direction must remain ownable.

---

# 18. Reference-site flaws and QA failures

A forensic audit should record weaknesses too.

## 18.1 Placeholder copy

The live Home page contains a leftover Lorem ipsum passage in/after the historical sequence.

## 18.2 Typos / copy issues

Observed examples include:

- “Lean More” rather than “Learn More” in places;
- spacing/copy issues on Mosaic;
- a medical-device spelling typo on Mazen;
- small parser/copy artifacts on Get Involved.

## 18.3 Stale/conflicting milestone statistics

Different anniversary-era pages contain different cumulative child-treatment figures because they represent different campaign moments. This is understandable historically but can read as inconsistent when the old pages remain live together.

## 18.4 Stale age/time references

Some patient teaser descriptions and longer detail stories are not perfectly synchronized as time passes.

## 18.5 Campaign aging

Global Giving Day and other event-specific copy is date-bound. Long-lived public URLs need explicit archival treatment or maintenance ownership.

## 18.6 Performance uncertainty

The site is Webflow-based and contains many images, duplicate loop content, and embedded videos. However, this audit did **not** run Lighthouse/WebPageTest or collect field performance metrics, so no claim should be made that the site is slow or fast.

---

# 19. Technical/build clues

## 19.1 Webflow evidence

The site strongly presents as a Webflow build:

- asset delivery uses Webflow's `website-files.com` infrastructure;
- project assets share a Webflow-style project identifier;
- Faces of Hope media uses a separate CMS collection asset identifier;
- an external CMS comparison explicitly lists the anniversary site as a Webflow example.

Observed project asset ID:

`604fc0c56fc10d0c22a15cd9`

Observed Faces CMS asset ID:

`605bb6e0d846693d29dd8b3c`

## 19.2 What this does NOT prove

It does not prove the exact animation library or custom-code stack. Webflow can host native interactions and custom JavaScript. Do not infer GSAP, Lenis, Three.js, Locomotive Scroll, or other libraries without runtime inspection.

---

# 20. Vytal translation hypothesis — high level only

This is **not yet a redesign specification**. It is the design opportunity exposed by the audit.

The earlier Vytal direction was already correct in several ways:

- premium public surface;
- restrained clinical app;
- technology-first presentation;
- scientific honesty;
- uncertainty as a differentiator;
- camera → signal → interpretation narrative;
- longitudinal health story.

The Save a Child's Heart reference suggests how to elevate it.

## 20.1 Biggest correction: technology-first does not need to mean image-light

A stronger Vytal can combine:

- sensing visualizations;
- signal traces;
- live/product UI;
- optical/camera geometry;
- **selective human documentary imagery**;
- longitudinal human context.

Images should appear when they prove something or change the emotional register.

## 20.2 Biggest structural improvement: one continuous semantic grammar

Instead of a sequence of impressive but independent sections, the full public website should feel as if the same Vytal sensing system keeps changing form.

One possible conceptual behavior:

**ordinary surface → hidden sample → extracted signal → confidence → interpretation → pattern over time → human consequence.**

That can become Vytal's equivalent of the reference site's heartbeat grammar without copying its visual motif.

## 20.3 Stronger Home pacing candidate

Not final/approved:

**mystery/hidden physiology → human stake → optical reveal → product proof → screening breadth → uncertainty → explanation → longitudinal pattern → access/community impact → science/validation → future sensing → product entry.**

The key change is inserting human stakes and richer editorial cadence around the existing technical story.

## 20.4 Stronger supporting-page philosophy

Each public route should solve a different narrative problem rather than reuse the same landing-page component library mechanically.

For example:

- Screenings should feel precise and comparative;
- Science should feel like an evidence/research journey;
- Impact should feel human and geographic;
- About should feel principled and origin-driven;
- future case studies should feel longitudinal.

The design system remains common; the storytelling mode changes.

---

# 21. Questions this audit answers

### Why does the reference feel alive without becoming a toy?
Because the strongest motion has semantic meaning and is surrounded by real human evidence.

### Why does the long page not feel like one giant component stack?
Because section geometry, media density, typography, and movement change chapter by chapter.

### Why do the supporting pages still feel related?
Because the heartbeat, typography hierarchy, imagery philosophy, and mission language recur even when page composition changes.

### Why is the human photography so important?
Because it makes impact, time, and medical work visible rather than merely claimed.

### What is most dangerous to copy literally?
The heartbeat motif, charity conversion mechanics, anniversary casing gimmicks, and old Webflow loop implementation patterns.

### What is most valuable to translate?
Persistent semantic motion, emotional/editorial pacing, longitudinal storytelling, page specialization, and human evidence.

---

# 22. Completeness checklist

## Routes
- [x] Home
- [x] History
- [x] Faces of Hope / Our Children
- [x] Global Giving Day
- [x] Get Involved
- [x] Mazen hidden feature
- [x] Mosaic hidden giving page

## Shared system
- [x] navigation
- [x] donation entry points
- [x] footer
- [x] social assets
- [x] heartbeat/EKG SVG family
- [x] typography behavior
- [x] color roles
- [x] photography/media philosophy
- [x] editorial layout behavior
- [x] motion evidence matrix
- [x] repeated-loop structures
- [x] patient detail interaction inference
- [x] conversion architecture
- [x] page-specific design modes
- [x] Webflow/build clues
- [x] stale/QA issues
- [x] Vytal translation principles

## Explicitly unresolved without interactive instrumentation
- [ ] exact desktop hover states
- [ ] exact easing/durations
- [ ] exact scroll trigger offsets
- [ ] exact page-transition animation
- [ ] exact custom cursor behavior, if any
- [ ] exact mobile choreography
- [ ] exact breakpoint values
- [ ] exact CSS typography family/weights
- [ ] exact hex palette
- [ ] runtime animation-library inventory
- [ ] performance metrics
- [ ] accessibility audit

These remain unresolved by evidence policy, not accidentally omitted.

---

# 23. Primary source list

## Live anniversary routes

- https://25.saveachildsheart.org/
- https://25.saveachildsheart.org/history
- https://25.saveachildsheart.org/faces-of-hope
- https://25.saveachildsheart.org/global-giving-day
- https://25.saveachildsheart.org/get-involved
- https://25.saveachildsheart.org/mazen
- https://25.saveachildsheart.org/mosaic

## Exact-site motion description

- https://mycodelesswebsite.com/healthcare-websites/ — entry for Save a Child's Heart specifically describes the hero video + heartbeat overlay, map with animated statistics, and heartbeat history timeline.

## Webflow corroboration

- https://www.meetguillaume.dev/en-us/comparisons-of-cms-for-your-website — external CMS comparison including the anniversary site as a Webflow example.

## Asset delivery evidence

Representative assets resolve through Webflow's `cdn.prod.website-files.com` infrastructure using the project/CMS IDs recorded above.

---

# 24. Final reference verdict

The anniversary site's strongest contribution to the Vytal redesign is not a collection of animations to imitate. It is a **way of thinking about a healthcare story as one continuous designed experience**.

It demonstrates that a serious healthcare-adjacent website can be:

- cinematic without becoming sci-fi;
- emotional without becoming sentimental stock marketing;
- data-rich without becoming a dashboard;
- animated without turning into a component demo;
- human without abandoning technical credibility;
- long without repeating one section template;
- consistent without making every page look the same.

For Vytal, the target should therefore not be “copy Save a Child's Heart in Vytal colors.”

The target should be:

> **Build an equally coherent, equally intentional, but Vytal-native experience in which every visual, interaction, image, and motion reinforces the act of revealing useful physiological information that was already hidden in ordinary light.**

That is the standard this reference sets.
