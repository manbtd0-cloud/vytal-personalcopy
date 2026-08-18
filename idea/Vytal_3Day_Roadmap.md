# Vytal: 3 Day Build Roadmap

Team of 3. Roles are a starting split, swap based on who is actually strongest where.
• Person A, Capture and Signal
• Person B, AI and Cloud
• Person C, Product, UI and Pitch

---

## The finalized idea, one paragraph

A community health worker's own phone becomes the vitals device they do not carry. It reads heart rate, breathing rate, and a stress indicator from a face scan, or from a fingertip over the rear camera and flash when lighting or camera quality is poor. Qwen explains each reading in plain language and the patient's own language, and flags when a referral looks warranted. That flag travels with a lightweight, offline first patient record so it is not silently lost, the single biggest documented failure point in community health referrals. Vytal is not trying to replace mature case management platforms like CommCare or the Community Health Toolkit, it is the hardware free vitals sensor that ecosystem does not have.

What it replaces on the ground, in one phone: a pulse oximeter or BP cuff, a bilingual health educator to explain the number, and a paper referral slip.

---

## Day 1, Foundations

**Person A, Capture and Signal**
• Port the existing face scan capture (getUserMedia, CHROM, Goertzel, already built and validated) into the team repo
• Add the live signal quality readout on screen

**Person B, AI and Cloud**
• Create the Alibaba Cloud account, activate Model Studio, get a DashScope API key
• Send one working Qwen call from Python or Node, confirm response works
• Draft the JSON shape for a reading record: heart rate, breathing rate, stress score, timestamp, patient id, referral flag

**Person C, Product, UI and Pitch**
• Set up the repo and the three screens as empty shells: scan screen, health worker dashboard, one page report
• Write 2 to 3 short patient and health worker personas for the pitch story
• Sketch the dashboard and report layout

---

## Day 2, Core features

**Person A, Capture and Signal**
• Build the fingertip and flash capture mode
• Build the automatic switch: keep reading if signal quality is strong, switch to fingertip mode if weak
• Test both modes in a dim room and a bright room

**Person B, AI and Cloud**
• Wire a reading into a Qwen prompt that returns a plain language explanation and a referral suggestion
• Add a language selector so the explanation comes back in the patient's language
• Build the offline queue (IndexedDB) so readings save locally first, then sync to Alibaba Cloud once online

**Person C, Product, UI and Pitch**
• Build the health worker dashboard: list of patients, last reading, referral flag status
• Build the one page report: reading summary, Qwen explanation, QR code linking back to the record
• Start the pitch deck outline

---

## Day 3, Integration, polish, pitch

**All three**
• Integrate all pieces into one flow: scan, explain, flag, dashboard, report
• Run through the whole flow start to finish at least 5 times, fix what breaks

**Person A**
• Final accuracy tuning, confirm the synthetic demo mode still works as a stage backup

**Person B**
• Finish the Alibaba Cloud deployment, capture proof of it working (screenshot or short clip) since the hackathon rules require this

**Person C**
• Finish the pitch deck and rehearse the demo
• Prepare answers for the expected judge question, "isn't this just CommCare," the answer is that CommCare and CHT are excellent at case management and do not include a vitals sensor, Vytal is that missing sensor layer

---

## Libraries and tools

**Frontend and capture**
• Plain JavaScript with getUserMedia and Canvas, already built, no extra library required for the core signal math
• Optional, MediaPipe Face Landmarker (`@mediapipe/tasks-vision`, via CDN) if there is time to add automatic multi region face detection instead of the manual guide oval
• IndexedDB (built into the browser, the `idb` npm package gives a cleaner API) for the offline first queue
• `qrcode` npm package for the report QR code
• `jspdf` or a simple print stylesheet for the one page report

**AI and cloud**
• The official `openai` Python or Node.js SDK, pointed at Alibaba Cloud Model Studio's OpenAI compatible endpoint, no separate SDK required
• Example setup:
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
• Alibaba Cloud Function Compute for a lightweight serverless sync endpoint, or a small Node or Python backend if the team wants something easy to run live during the demo
• Alibaba Cloud OSS or Tablestore for synced readings and reports, if there is time, otherwise a hosted database like Supabase works as a hackathon stand in

**Testing**
• A phone with a working flashlight and rear camera for the fingertip mode
• A second device for the face scan mode
• A dim room and a bright room, to show the automatic switch live during the pitch

---

*Not a medical device. The assistant explains and flags, it never diagnoses.*
