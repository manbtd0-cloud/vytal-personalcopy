# Vytal: Complete Tech Stack, Layer by Layer

Every part of the project, what language it runs in, what idea it's built on, and what API or library powers it. Free API options researched at the end.

---

## Layer 1: Camera Capture (the face scan)

**Language:** JavaScript, plain, no framework needed
**Idea:** every heartbeat causes a tiny, invisible color shift in skin, a camera pointed at skin can pick this up over a few seconds
**What it uses:**
• `getUserMedia()`, built into every modern browser, free, no API key, this is what turns on the camera
• Canvas API, built in, used to read the actual pixel colors frame by frame
• `requestAnimationFrame`, built in, drives the capture loop at the browser's natural frame rate
• The math itself (turning raw color into a heart rate number) is hand written, no external library required, this part is already built and tested

**Optional upgrade:** MediaPipe Face Landmarker (`@mediapipe/tasks-vision`, loaded from a CDN), a free, on device face mesh model from Google, useful later if the team wants to automatically find the forehead and both cheeks instead of using a fixed guide box.

---

## Layer 2: Fingertip and Flash Fallback

**Language:** JavaScript, same as above
**Idea:** when lighting or camera quality is too weak for a face scan, put a finger directly on the rear camera lens with the flash on, this gives a much stronger signal since the light source is now fixed and controlled instead of ambient and unpredictable
**What it uses:** the same `getUserMedia()` call, pointed at the rear camera (`facingMode: 'environment'`), plus the browser's torch or flash control where the device supports it

---

## Layer 3: AI Explanation Layer

**Language:** JavaScript or Python, whichever the backend teammate prefers, both work identically here
**Idea:** turn a raw number like "heart rate 92" into a calm, plain language explanation in the patient's own language, and suggest whether a referral looks warranted
**Primary API, required for this hackathon:** Qwen, through Alibaba Cloud Model Studio (also called DashScope)
• New accounts get a free trial of roughly 70 million tokens total across about 70 models, valid 90 days, on the Singapore endpoint, plenty for a 3 day build and demo
• After that or for any overflow, it's pay per token and cheap, Qwen-Turbo runs about $0.05 per million input tokens and $0.20 per million output tokens
• No special SDK needed, the official `openai` npm or pip package works, you just point `base_url` at DashScope's OpenAI compatible endpoint and use your Alibaba API key

```
from openai import OpenAI
client = OpenAI(
    api_key=os.getenv("DASHSCOPE_API_KEY"),
    base_url="https://dashscope-intl.aliyuncs.com/compatible-mode/v1"
)
response = client.chat.completions.create(
    model="qwen-plus",
    messages=[{"role": "user", "content": "Explain this reading to a patient"}]
)
```

### Free and low cost alternatives, researched

| API | Free tier | Worth knowing |
|---|---|---|
| **Qwen** (Alibaba Model Studio) | ~70M tokens total, 90 days, new accounts only | Required for this hackathon's rules, keep this as the real integration |
| **Google Gemini** (AI Studio) | Permanent, no credit card, about 15 requests per minute and 1,500 per day on the Flash model | Genuinely never expires, but free tier prompts may be used by Google to improve their models, worth avoiding for real patient data, fine for demo data |
| **Kimi K2 / K3** (Moonshot AI) | No standing free tier on the official platform anymore, needs a minimum $1 top up to activate | Cheap once activated, some third party resellers advertise limited free daily requests but that is not from Moonshot directly, treat those claims carefully |
| **Groq** (hosts open weight models, including open Qwen models) | Free, no credit card, rate limited | Good as a tested backup call path for the live pitch, in case the primary endpoint has a hiccup on stage |

**Recommendation:** build the real, judged integration on Qwen since the hackathon rules require it. If anyone wants a personal side project or a backup demo path, Gemini's permanent free tier is the easiest second option to wire up, since it also uses the same OpenAI style client pattern with just a different base URL and key.

---

## Layer 4: Offline Storage and Sync

**Language:** JavaScript
**Idea:** a reading and a referral flag save to the phone the instant they happen, then quietly sync once a connection is available, so nothing depends on the clinic having steady internet
**What it uses:**
• IndexedDB, built into every browser, free, this is the local queue
• Optionally the `idb` npm package, a small wrapper that makes IndexedDB easier to use with promises instead of its native, older callback style
• Alibaba Cloud Function Compute as the receiving endpoint once synced, written in Node.js or Python, both are supported
• Alibaba Cloud OSS (object storage) or Tablestore (structured data) to actually hold the synced records

---

## Layer 5: Health Worker Dashboard and Report

**Language:** JavaScript
**Idea:** one screen listing patients, their last reading, and referral flag status, plus a one page printable report per patient
**The React question:** the face scan screen already built (`lumen.html`) is plain JavaScript and HTML, and that's enough for a single screen. A dashboard with multiple screens and shared data between them is exactly what React is built for, so it does earn its place here.
**Recommendation:** only bring in React if at least one of the three of you is already comfortable with it. Learning it from zero inside a 3 day window costs time you don't have. If nobody already knows it well, plain JavaScript with a few small reusable functions does the same job for judging purposes, just with a little more manual wiring.
**Other small libraries either way:**
• `qrcode` npm package, generates the QR code on the printable report
• `jspdf`, or simply a `@media print` CSS stylesheet, turns the report screen into a clean one page printable document without needing a PDF library at all

---

## Layer 6: Cloud Deployment

**Language:** Node.js or Python, both fully supported
**Idea:** the hackathon specifically checks for proof of real Alibaba Cloud usage, not just a slide mentioning it
**What it uses:**
• Alibaba Cloud Function Compute, the serverless backend that receives synced readings
• Alibaba Cloud OSS or Tablestore, where those readings actually live
• Alibaba Cloud Model Studio, where the Qwen calls run

---

*Every layer above either already works (Layer 1 and 2, built and tested) or uses a free tier and a well documented API, so there is nothing in this stack that requires paid access to start building today.*
