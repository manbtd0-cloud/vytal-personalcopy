# Clinician View, Coaching, Programme Context, Language Expansion

`AI Layer · engineering + prompt design`

---

## What these are

Four related features grouped together because none of them are new algorithms — they're all extensions of Vytal's *already-built* multilingual AI triage layer (Qwen via Alibaba Cloud DashScope), reached through prompt design and UI surfacing rather than new signal processing or new external research.

| Feature | What it adds | Basis |
|---|---|---|
| **Clinician View** | A denser, less plain-language version of the scan result — raw numbers, uncertainty margins, and the alert-scale reasoning — for a supervising clinician rather than the CHW-to-patient explanation | Same underlying data Vytal already computes (`uncertainty.js`, `ai.js` outputs); this is a second render/prompt template, not new data |
| **Coaching** | Prompts the CHW with next-step guidance based on the flag tier (e.g. "this is an ORANGE flag — here's what to tell the patient and how urgently to refer") | Built on the same alert-scale tiers (feature 03) and pediatric/pregnancy context (features 10, 13) already in the pipeline |
| **Programme Context** | Lets a deployment (e.g. a specific NGO programme or district health office) configure which features are active, referral pathways, and terminology, without a code change | Configuration layer over existing features, no new research |
| **Language Expansion** | Adding languages beyond the current EN/UR/PS/SD/AR set | Groq's LLaMA-3.3-70B and Qwen-Plus both support additional languages natively per their published model cards — expansion is a prompt/config change, not a new integration |

## Implementation notes

```
Clinician view:
  Reuse ai.js's existing explanation-generation call, but swap the
  prompt template from "explain to a patient in plain language" to
  "summarize for a supervising clinician: raw values, confidence
  interval, which threshold triggered the flag."

Coaching:
  Prompt template keyed off the alert tier already computed by
  feature 03:
    GREEN  -> no coaching needed
    YELLOW -> "monitor, re-check in N days" guidance
    ORANGE -> "refer within 48h, here's how to explain urgency"
    RED    -> "refer today, here's the immediate-safety script"

Programme context:
  A config object (JSON) loaded per deployment, gating which
  features (anemia screening, jaundice screening, etc.) are enabled
  and which referral pathway text/phone numbers are shown — no
  algorithm change, just parameterising what's already built.

Language expansion:
  Add a language code to the existing language selector; confirm
  voice-readout (feature 06) support separately, since TTS voice
  availability doesn't always match LLM language support.
```

## Where this lives in the codebase

- All four extend `ai.js`'s existing prompt-construction logic and the language selector already built for multilingual triage — no new files needed beyond prompt template variants.

## Honest limitations

- None of these four need external research validation — the risk here is entirely in prompt quality and clinical review of the coaching scripts, not in citing papers. A clinician should review the coaching-script wording for each alert tier before it ships, the same way the Day 5/Day 7 build-plan tasks already call for reading every AI explanation out loud before demo.
