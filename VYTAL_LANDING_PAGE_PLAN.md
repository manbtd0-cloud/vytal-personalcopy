# Vytal — Landing Page & Motion Design Plan

**Sources reviewed:** awwwards.com Sites of the Day, the "Dark Mode in Websites and Apps" collection (29 examples), the "Hovers, Cursors and Cute Interactions" collection, and Awwwards' own written guidance on custom cursors and magnetic buttons.

## 0. The core tension, stated up front

Awwwards-style sites are built to make an agency/portfolio/brand feel expensive and cinematic — heavy cursor replacement, aggressive magnetic pull, WebGL hero scenes, slow reveal-on-scroll for every element. Vytal is a **clinical screening tool**. Someone opening it may be anxious about a real symptom. The existing design (dark, calm, coral/mint accents, restrained motion — see the round-1 CSS polish pass) is already the *correct* register for that. Awwwards' own writeup on custom cursors says this directly: appropriate for portfolios and artistic sites, **"less appropriate for corporate and e-com projects"** — a clinical tool is further in that direction than e-commerce, not less.

So the plan below is deliberately split:
- **Landing page (new, marketing-register)** — this is where the cinematic techniques belong. Nobody is mid-diagnosis here; it's the pitch before the tool.
- **In-app screens (Scan/Dashboard/Report)** — get it explicitly **not** touched beyond what's already shipped. No custom cursor, no magnetic buttons, no scroll-triggered reveals on vital readouts. Trust and legibility win over spectacle the moment someone is actually using the tool.

This split is the single most important decision in this doc — everything below assumes it.

## 1. What currently exists

- `App.jsx` has no landing route — `/` goes straight into `ScanPage`. There is no marketing/story page at all.
- The "▶ Intro" button in the navbar just replays `SplashAnimation`, a brief loading-style overlay — not a landing page.
- Routes: `/` (Scan), `/dashboard`, `/report`. A `/landing` or making `/` the landing page (with Scan moving to `/scan`) would need routing changes.

## 2. Techniques found, and the fit call for each

| Technique | Real examples found | Fit for Vytal landing page |
|---|---|---|
| **Custom cursor** (dot + trailing ring, blend-mode) | Readymag showcase (`awwwards.com/sites/custom-cursor`), OHMY (`inspiration/custom-cursor-ohmy`) | **Yes, but restrained.** A small dot-and-ring cursor, `mix-blend-mode: difference` against the dark bg, tinted with the existing `--accent`/`--ok` colors depending on hover context (e.g. turns mint over the CTA). Desktop only — Awwwards' own guidance flags cursor replacement as meaningless on touch devices, and disable entirely on `(hover: none)` / mobile. |
| **Magnetic buttons/links** | Aiyanna (`inspiration/magnetic-button-aiyanna`), Vertex3D magnetic-cursor-to-glassmorphism (`inspiration/magnetic-custom-cursor-physics-vertex3d`) | **Yes, on the landing page's primary CTA only** ("Start Your Free Scan"), capped at the commonly-cited 20-30px pull radius so it reads as premium, not disorienting. **Not** on in-app buttons — a "Start Scan" button that's mid-scan should be exactly where the user expects it, every time. |
| **Scroll-triggered section reveals** | Awwwards "Scrolling" collection; standard pattern across nearly every SOTD site | **Yes.** Fade+rise sections as the user scrolls the landing page (same `--pop` easing already defined in `index.css`, not a new system) — how the "10-second scan, 6 screening modes, offline-first, AI explained" story unfolds. |
| **Split-text / staggered headline reveal** | Common across dark-mode SOTD sites (e.g. Glenn Catteeuw portfolio, `inspiration/glenn-catteeuw-portfolio`) | **Yes**, for the hero headline only — characters or words stagger in on load, echoing the existing staggered `readout-stat` entrance already shipped for scan results. Reuses a pattern that already exists in the codebase instead of inventing a second one. |
| **Ambient WebGL/3D hero scene** | Lusion labs (`labs.lusion.co`), many SOTD sites | **No.** Real cost (bundle size, GPU load, battery) for a screening tool likely used on lower-end phones in the field — directly conflicts with the app's own "offline-ready, low-resource" positioning. The existing CSS-only ambient glow (two drifting radial blobs, already shipped) is the right budget for this app; extend it, don't replace it with WebGL. |
| **Full page-transition wipes between routes** | Common SOTD pattern | **Partially.** A wipe/crossfade from landing → app entry (clicking the CTA) is worth it as a one-time "arrival" moment. The existing `.page` fade+rise on every in-app route change (already shipped) stays as-is — don't add a heavier transition there, it'd fight the "get to your result fast" goal of a screening tool. |
| **Dark-mode toggle / light-dark transition** | Nearly every example in the Awwwards dark-mode collection | **No, not now.** Vytal doesn't have a light theme at all; building one is a separate, much bigger project than "make it more attractive," and the dark theme is core to the app's calm-clinical identity. Flagging as out of scope rather than silently ignoring it. |

## 3. Landing page structure (new route)

Proposed as a new `/` route (moving the current Scan tool to `/scan`, or a `/welcome` route with a "skip intro" link for returning users — routing decision to confirm before building). Sections, each a scroll-reveal beat:

1. **Hero** — staggered headline ("Vitals in 10 seconds — no cuff, no clinic, just a camera"), the PulseMark logo animating its heartbeat trace on load (already exists, currently only animates in the navbar), magnetic primary CTA → app entry.
2. **How it works** — the 6 scan modes (face, fingertip, anemia, jaundice, BP, BMI) as a horizontal or stacked reveal, each with a one-line honest description of what it measures and its confidence tier — this is also an opportunity to be upfront that these are screening proxies, not diagnoses, right in the pitch rather than only in fine print.
3. **Trust/offline section** — the existing "offline-ready storage" and "AI explanation" messaging already written for the in-app cards, elevated into full-width sections with the ambient glow treatment.
4. **CTA close** — repeat the magnetic primary button, into `/scan`.

## 4. What does NOT change

- No changes to `ScanPage.jsx`, `DashboardPage.jsx`, `ReportPage.jsx` visual behavior beyond what's already shipped in the round-1 polish pass.
- No custom cursor, no magnetic effects, anywhere inside the live scanning flow or on vital readouts.
- Color tokens (`--bg`, `--accent`, `--accent2`, `--ok`), fonts, and the existing ambient-glow/PulseMark/card system stay exactly as they are — the landing page reuses these tokens, it doesn't introduce a second visual language.
- No WebGL, no new heavy dependencies (framer-motion, three.js, GSAP) — everything above is achievable with CSS transitions/`@keyframes`, `IntersectionObserver`, and vanilla mousemove listeners, consistent with the app's current zero-animation-library approach.

## 5. Open questions before building

- Routing: make `/` the new landing page and move Scan to `/scan`, or keep `/` as Scan and add landing at a separate path reached only from an external link/marketing context?
- Should returning users (already have scan history in `DashboardPage`) see the landing page every visit, or skip straight to `/scan` after their first visit (e.g. via a localStorage flag)?
- Content for the "6 scan modes" section — pull the existing `MODES[].hint` copy from `ScanPage.jsx`, or write fresh marketing copy?

Once these are confirmed, this is a single self-contained new page/route plus a handful of shared CSS additions (cursor, magnetic-hover utility, scroll-reveal utility) — it doesn't touch any of the clinical/algorithm work from the previous rounds.
