# Vytal: Core Concepts and Research Foundations

This document walks through every technical concept behind Vytal, in the order the data actually flows through the app, and points to the real published research each piece is based on. Share this with teammates so everyone can speak to the science behind the demo, not just the code.

---

## 1. Capturing a pulse signal from an ordinary camera (rPPG)

Every heartbeat pushes a small pulse of blood through the skin, which changes how much light the skin absorbs and reflects. A regular camera can pick up this tiny color change if you point it at skin and average the pixels over time. This technique is called remote photoplethysmography, or rPPG.

Key points:
• No contact and no extra hardware are needed, a phone or laptop camera is enough
• The green color channel carries the strongest version of this signal because hemoglobin absorbs green light more than red or blue
• The technique works at normal webcam frame rates as low as 25 frames per second

Foundational paper:
• Verkruysse, W., Svaasand, L. O., and Nelson, J. S. (2008). Remote plethysmographic imaging using ambient light. Optics Express, 16(26), 21434 to 21445.

---

## 2. Removing motion and lighting noise (the CHROM algorithm)

Raw color signals are noisy. Head movement, camera shake, and changing room light all shift the red, green, and blue channels together, and that shared shift can swamp the tiny pulse signal. Vytal uses the CHROM method, which combines the three color channels into two chrominance signals, then subtracts them in a ratio designed so that shared lighting and motion changes cancel out, leaving mostly the blood volume pulse behind.

Key points:
• Normalizes each color channel by its own average brightness first
• Combines channels into two derived signals, then finds the mixing ratio that minimizes shared noise
• Validated on 117 people, reaching close agreement with a contact pulse oximeter, and roughly twice as accurate as earlier blind source separation methods during motion

Foundational paper:
• de Haan, G. and Jeanne, V. (2013). Robust pulse rate from chrominance based rPPG. IEEE Transactions on Biomedical Engineering, 60(10), 2878 to 2886.

---

## 3. Finding the beat frequency (the Goertzel algorithm)

Once the pulse signal is isolated, Vytal needs to know its dominant frequency, which maps directly to beats per minute. Instead of computing a full spectrum with an FFT, Vytal uses the Goertzel algorithm, which efficiently measures the signal power at one chosen frequency at a time. This lets the app scan just the plausible heart rate range (about 42 to 200 beats per minute) instead of wasting computation on frequencies that could never be a human pulse.

Key points:
• Originally developed for detecting telephone touch tones (DTMF), where only a few known frequencies matter
• Cheaper than a full FFT when you only care about a narrow, known range of frequencies
• The same function is reused at a lower frequency range to estimate breathing rate

Foundational reference:
• Goertzel, G. (1958). An algorithm for the evaluation of finite trigonometric series. The American Mathematical Monthly, 65(1), 34 to 35.

---

## 4. From beats to meaning (heart rate variability and stress)

A heart does not beat like a metronome, the time between beats naturally varies, and that variability is controlled by the autonomic nervous system. Vytal's stress indicator is built on this idea: tighter, more regular spacing between beats tends to reflect a more stressed or sympathetic dominant state, while healthier variability tends to reflect a calmer, parasympathetic dominant state.

Key points:
• Heart rate variability, or HRV, is a well established noninvasive window into autonomic nervous system activity
• Reduced HRV is consistently associated with acute and chronic stress across many clinical studies
• HRV is already used commercially in wearables (for example Whoop, Garmin, Oura) as a stress and recovery signal

Foundational papers:
• Ishaque, S., Khan, N., and Krishnan, S. (2021). Trends in heart rate variability signal analysis. Frontiers in Digital Health, 3, 639444.
• A systematic review and meta analysis, Continuous heart rate variability monitoring, stress and recovery in doctors, Occupational Medicine (Oxford Academic, 2025).

---

## 5. A second vital sign hiding in the same signal (respiration rate)

Breathing subtly changes blood volume and blood pressure, which shows up in the pulse signal in three ways researchers call baseline wander, amplitude modulation, and frequency modulation. Vytal focuses on the amplitude and baseline effects, which are visible even in a lower quality camera derived signal, to estimate breathing rate from the same footage used for heart rate.

Key points:
• During inhalation, chest pressure changes reduce pulse amplitude slightly, during exhalation it increases again
• This effect has been studied for decades on contact pulse oximeter data and translates reasonably well to camera based signals
• Typical healthy adult resting respiration is roughly 12 to 20 breaths per minute, which is the range Vytal scans

Foundational papers:
• Charlton, P. H. et al. Breathing rate estimation from the electrocardiogram and photoplethysmogram, a review.
• A Photoplethysmography Based Respiratory Rate Estimation Algorithm for Health Monitoring Applications, Journal of Medical and Biological Engineering (Springer, 2022).

---

## 6. Explaining results in plain language (Qwen large language model)

Numbers alone are not useful to most people. Vytal's AI layer uses Qwen, Alibaba's large language model family, to turn a raw reading into a plain language explanation, answer follow up questions, and offer guidance in the user's own language. Qwen3 supports well over one hundred languages, which matters for a tool aimed at community clinics serving mixed language populations.

Key points:
• Qwen3 spans model sizes from 0.6 billion to 235 billion parameters, so it can run at a size that fits the deployment budget
• Multilingual coverage expanded from 29 languages in Qwen2.5 to 119 languages and dialects in Qwen3
• Runs through Alibaba Cloud Model Studio, which satisfies the hackathon requirement of a working Alibaba Cloud deployment

Foundational reference:
• Qwen Team, Alibaba Group (2025). Qwen3 Technical Report. arXiv:2505.09388.

---

## 7. Keeping the AI honest (why the assistant only explains and refers, it never diagnoses)

It would be tempting to have the AI assistant tell a user what condition they might have. Published research is a clear warning against that. A recent red teaming study of four major chatbots found problematic responses to real patient medical questions ranging from about 22 percent to 43 percent of the time, with a meaningful share flagged as outright unsafe. Separate research on triage specific chatbots found that giving an LLM an interactive conversation actually reduced diagnostic accuracy compared to a single structured answer, and recommended LLMs be used as an educational or supplementary resource alongside a clinician rather than a replacement for one.

This is exactly why Vytal's assistant is scoped narrowly: explain the numbers, ask clarifying questions, and recommend a real clinician when something looks off, never produce a diagnosis.

Foundational papers:
• Large language models provide unsafe answers to patient posed medical questions (arXiv:2507.18905, 2025).
• Evaluating large language model workflows in clinical decision support for triage and referral and diagnosis, npj Digital Medicine (Nature, 2025).
• How large language model powered conversational agents influence decision making in domestic medical triage contexts, Frontiers in Computer Science (2024).

---

## 8. Why this problem matters (the equity case)

Vytal's entire premise, screening vitals without a wearable or a pulse oximeter, exists because access to even basic vital sign equipment is uneven worldwide. Frontiers in Medical Technology hosts a research topic called Mind the Gap, addressing global healthcare challenges through equitable healthcare technologies, which is the single most viewed research topic on that entire journal, with over 49,000 views and 11 published articles. That level of sustained attention is a strong, independent signal that reviewers and researchers see this as a real and pressing gap, not a niche concern.

---

## Full reference list

1. Verkruysse, W., Svaasand, L. O., and Nelson, J. S. (2008). Remote plethysmographic imaging using ambient light. Optics Express, 16(26), 21434 to 21445.
2. de Haan, G. and Jeanne, V. (2013). Robust pulse rate from chrominance based rPPG. IEEE Transactions on Biomedical Engineering, 60(10), 2878 to 2886.
3. Goertzel, G. (1958). An algorithm for the evaluation of finite trigonometric series. The American Mathematical Monthly, 65(1), 34 to 35.
4. Ishaque, S., Khan, N., and Krishnan, S. (2021). Trends in heart rate variability signal analysis. Frontiers in Digital Health, 3, 639444.
5. Continuous heart rate variability monitoring, stress and recovery in doctors, a systematic review and meta analysis. Occupational Medicine, Oxford Academic (2025).
6. Charlton, P. H. et al. Breathing rate estimation from the electrocardiogram and photoplethysmogram, a review.
7. A Photoplethysmography Based Respiratory Rate Estimation Algorithm for Health Monitoring Applications. Journal of Medical and Biological Engineering, Springer (2022).
8. Qwen Team, Alibaba Group (2025). Qwen3 Technical Report. arXiv:2505.09388.
9. Large language models provide unsafe answers to patient posed medical questions. arXiv:2507.18905 (2025).
10. Evaluating large language model workflows in clinical decision support for triage and referral and diagnosis. npj Digital Medicine, Nature (2025).
11. How large language model powered conversational agents influence decision making in domestic medical triage contexts. Frontiers in Computer Science (2024).
12. Mind the Gap, addressing global healthcare challenges through equitable healthcare technologies. Research Topic, Frontiers in Medical Technology.

---

*Not a medical device. Every concept above supports a screening and education tool, not a diagnostic one. Readings should never replace a real clinician.*
