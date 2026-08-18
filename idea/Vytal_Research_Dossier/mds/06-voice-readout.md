# Voice Readout (Web Speech API)

`Quick Win · 1 day · zero dependency, W3C standard`

---

## What it does

Reads the AI-generated plain-language explanation out loud using the browser's built-in `window.speechSynthesis`, so a low-literacy patient or a CHW whose hands are busy doesn't have to read the screen.

## The standard and research this is built on

| Source | What it says | Where it fits Vytal |
|---|---|---|
| **W3C Web Speech API specification** | `speechSynthesis` is a standard browser API, supported in Chrome, Firefox, Safari and Edge, on both Android and iOS, no server round-trip or paid TTS service needed | This is why it's a 1-day feature — no new infrastructure |
| **WHO health-literacy guidance on audio health information** | Recommends audio delivery of health information for low-literacy populations, since text literacy and health literacy both vary widely in exactly the CHW-served populations Vytal targets | Directly justifies *why* this feature matters for Vytal's specific users, not just that it's easy to build |

## Algorithm / implementation

```
1. Vytal's ai.js already produces a plain-language explanation string
   per scan, in the patient's selected language (feature already built:
   multilingual AI triage EN/UR/PS/SD/AR).

2. On the scan-result screen, add a speaker-icon button:

     function speakExplanation(text, langCode) {
       const utterance = new SpeechSynthesisUtterance(text);
       utterance.lang = langCodeToBCP47(langCode);  // e.g. 'ur' -> 'ur-PK'
       utterance.rate = 0.9;   // slightly slower than default for clarity
       window.speechSynthesis.speak(utterance);
     }

3. Check voice availability per language at runtime:
     window.speechSynthesis.getVoices()
   Urdu/Pashto/Sindhi voice support varies by OS/browser — fall back
   to showing a "voice not available in this language on this device"
   notice rather than silently failing.
```

## Where this lives in the codebase

- `ScanPage.jsx` (or the results view), a small addition alongside the existing explanation text render.

## Honest limitations

- Voice quality and even availability for Urdu/Pashto/Sindhi varies significantly by device OS and browser — this needs to be tested on the actual low-end Android devices CHWs will carry, not just a development machine, before being trusted as a real feature rather than a demo nicety.
