# Irregular Heartbeat Flag (AFib Proxy)

`Quick Win · 2-3 days · uses beatTimesMs already computed`

---

## What it does

Vytal's peak detector already produces a `beatTimesMs` array (the timestamp of every detected heartbeat during the 10-15s scan). Atrial fibrillation shows up in that array as *irregularly irregular* spacing between beats — not just fast or slow, but unpredictable. This feature adds a pattern check on data Vytal already has, no new sensing.

## The research this is built on

| Paper | What it actually showed | Where it fits Vytal |
|---|---|---|
| Vandecasteele, K. et al., **Mobile Phone-Based Use of Photoplethysmography to Detect Atrial Fibrillation in Primary Care** (JMIR mHealth and uHealth — FibriCheck) | Smartphone PPG AFib detection matched 12-lead ECG with sensitivity/specificity both >90% in real-world primary-care use | Validates that beat-interval irregularity alone, from a phone, is a strong enough signal to flag — no ECG needed |
| **Smartphone detection of atrial fibrillation using photoplethysmography: a systematic review and meta-analysis** (UCL Discovery / PubMed) | Pooled accuracy across multiple PPG-AFib apps; confirms the approach generalises beyond one app | Backs the general approach, not just one vendor's app |
| Yan, B.P. et al. and related FibriCheck multicenter validation (npj Digital Medicine) | Opportunistic screening catches *paroxysmal* (intermittent) AF that a single in-clinic ECG often misses | Motivates flagging on **every** scan rather than only during a symptomatic visit — CHWs doing routine rounds are exactly the opportunistic-screening use case |

## Algorithm

```
Input: beatTimesMs = [t0, t1, t2, ...]   (already produced by Vytal's peak detector)

1. Compute successive RR intervals:
     RR[i] = beatTimesMs[i+1] - beatTimesMs[i]

2. Discard obvious detector glitches, not real beats:
     drop RR[i] if RR[i] < 300ms (>200bpm, sensor artifact)
     or RR[i] > 2000ms (<30bpm, likely missed beat)

3. Compute irregularity, same metric Vytal's RMSSD stress scorer
   already calculates, reused here for a different purpose:
     rmssd = sqrt(mean((RR[i+1] - RR[i])^2))
     pnn50 = fraction of |RR[i+1]-RR[i]| > 50ms

4. Flag "possible irregular rhythm" if BOTH:
     rmssd > 100ms   AND
     pnn50 > 0.30
   (thresholds are a starting point pulled from general HRV/AFib-screening
   literature — tune once you have a handful of confirmed AFib vs.
   normal-sinus scans to check against)

5. Do NOT flag on a single premature/ectopic beat:
   require the irregularity pattern across at least 8 consecutive
   RR intervals, not one outlier pair.
```

## Where this lives in the codebase

- New function in `ai.js` (or a new `afib.js`) taking the same `beatTimesMs` array already computed for HR — this is a pure downstream analysis step, added *after* peak detection, not a new capture mode.
- Output feeds the existing referral-flag pipeline the same way the tachycardia/bradycardia alert (feature 3) does.

## Honest limitations

- Premature/ectopic beats (common, usually harmless) look similar to early AFib on a short window — the 8-beat minimum above is meant to reduce that, but it is not a validated cutoff for Vytal's own signal quality.
- All the cited validation was done on *contact* PPG (finger/wrist sensors) or dedicated AFib apps with steadier signal than a 10-15s face scan. Vytal's fingertip-flash fallback mode is closer to the validated setups than the face-scan mode is — the flag should probably be more conservative (higher confidence bar) on face-scan readings.
- Wording matters: display "possible irregular rhythm — confirm with ECG," never "AFib detected."
