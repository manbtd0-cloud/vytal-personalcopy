# Auto Re-scan on Unreliable Reading

`Quick Win · 1 day · state machine change`

---

## What it does

When `uncertainty.js` reports `reliable: false` for a completed scan, instead of just showing "reading unreliable," Vytal automatically offers a countdown to re-scan and suggests switching to fingertip+flash mode (Vytal's existing fallback capture mode).

## Research backing

This closes the loop on Vytal's own already-built uncertainty estimation — it doesn't need new external papers, it needs the existing `uncertainty.js` output wired into a UX decision instead of a passive label. The one relevant piece of outside grounding:

| Source | What it says | Where it fits Vytal |
|---|---|---|
| Vytal's own build plan (fingertip + flash fallback, already specced for Day 3) | Fixed, close light source (phone flash) removes the ambient-lighting variability that is the single biggest driver of poor face-scan SNR | This is *why* switching capture mode, not just re-running the same face scan, is the right auto-suggestion — a bad-lighting room will fail the face scan again on retry unless the mode changes |

## Algorithm

```
On scan completion:
  result = uncertainty.js output   # { reliable, snr, marginBpm }

  if not result.reliable:
      show: "Reading quality was low. Retry now?"
      start 3-second countdown, auto-confirm unless user cancels

      if this is the 1st retry AND current mode == "face":
          suggest: "Try fingertip + flash mode instead —
                     works better in low light"
      elif this is the 2nd consecutive unreliable reading:
          stop auto-retrying; show manual guidance
          (hold still, cover camera fully, steady light)
          rather than looping indefinitely
```

## Where this lives in the codebase

- State machine change in `ScanPage.jsx`, consuming the existing `uncertainty.js` reliability flag.

## Honest limitations

- Auto-retrying indefinitely on a genuinely bad setup (e.g. a very dark room with no flash fallback available) just burns the patient's time and the CHW's patience — the 2-retry cap above is a UX judgement call, not something backed by a study, and should be tuned based on real field use.
