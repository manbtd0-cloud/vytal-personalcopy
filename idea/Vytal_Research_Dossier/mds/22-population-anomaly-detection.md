# Population-Level Anomaly Detection

`AI Layer · Emerging · requires data aggregation pipeline`

---

## What it does

Looks at aggregated, anonymised vital-sign data across all patients a CHW (or a region) has screened, to spot clusters of abnormal readings that might indicate an emerging outbreak or environmental health event — before it would show up in traditional clinic-visit-based surveillance.

## The research this is built on

The roadmap's original citation ("Digital Epidemiological Surveillance Using mHealth Data," *Lancet Digital Health*, 2021) could **not** be independently located under that exact title in this research pass — it should be treated as unverified/possibly mis-cited rather than repeated as a real source. The general premise is real and supported by other, checkable literature:

| Source | What it actually showed | Where it fits Vytal |
|---|---|---|
| **"Mobile Phone-Based mHealth Approaches for Public Health Surveillance in Sub-Saharan Africa: A Systematic Review."** *PMC* (ncbi.nlm.nih.gov/pmc/articles/PMC4245630) | Reviews multiple deployed mHealth surveillance systems using mobile-collected data for outbreak/disease-cluster detection across malaria, TB, influenza-like-illness and child-malnutrition surveillance in the exact kind of low-resource settings Vytal targets | The closest real-world precedent for what this feature would actually look like deployed — worth reading directly rather than the roadmap's likely-miscited Lancet reference |
| **"Harnessing the potential of digital data for infectious disease surveillance in sub-Saharan Africa."** PMC9594435 | Describes a concrete electronic surveillance framework linking mobile-collected health signals to outbreak risk assessment, built for exactly this kind of low-resource deployment context | A more current, specific model for the aggregation-and-alerting architecture this feature needs |
| A Lancet Digital Health commentary on leveraging mobile health data for clinical prediction (PIIS2589-7500(21)00212-0, 2021) | Real Lancet Digital Health 2021 piece on mHealth data for clinical prediction — discusses the general opportunity and pitfalls of aggregating mobile-collected physiological data | The genuine Lancet Digital Health 2021 source in this space — likely what the roadmap's citation was gesturing at, even if the specific title didn't match |

## Algorithm

```
1. Aggregation (privacy-preserving — this needs to happen server-side,
   never expose per-patient data across CHWs):
     For each region/time-window, compute the DISTRIBUTION of scan
     results (e.g. % of scans flagged ORANGE/RED, mean HR/BR z-score
     vs. that region's own historical baseline), not individual
     patient records.

2. Baseline: each region's own trailing rolling average
   (e.g. last 90 days) serves as its "normal" — this avoids needing
   an external population-normal reference, which the sub-Saharan
   Africa surveillance literature notes is often unavailable or
   unreliable at a local level.

3. Anomaly trigger:
     if this_week_flag_rate > baseline_flag_rate + 2*std_dev:
         raise regional anomaly alert
   (a simple statistical process control approach — the cited
   surveillance-system literature uses more sophisticated methods
   in production, but this is a reasonable, explainable starting
   point that a small team can actually ship and reason about)

4. Alert surfaces to a supervisor/coordinator view, not to individual
   CHWs — this is a program-level signal, not a per-patient one.
```

## Where this lives in the codebase

- Requires a server-side aggregation job, not a client-side feature — sits alongside the DHIS2/FHIR export pipeline (feature 15) since it needs the same synced, centralised data.
- New backend service, not a `ScanPage.jsx`/`ReportPage.jsx` addition.

## Honest limitations

- This is the least concretely research-backed feature in the whole roadmap — the original citation could not be verified, and even the real supporting sources describe systems built at a scale (national/multi-district) Vytal doesn't yet operate at. Treat this as a genuinely emerging, unproven direction, not a validated feature to promise in a pitch with confidence comparable to features 8, 9, or 11.
- Real privacy/ethics review needed before aggregating any patient health data across CHWs, even anonymised — this isn't just an engineering task.
