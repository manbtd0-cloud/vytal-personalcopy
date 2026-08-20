export const homeContent = {
  hero: {
    eyebrow: 'OPTICAL INPUT / READY',
    title: 'There’s more here than you can see.',
    reveal: 'Your camera sees it.',
    body: 'Vytal turns subtle optical changes captured by an ordinary camera into accessible health-screening signals, then helps explain what they may mean.',
    primary: 'Start Screening',
    secondary: 'See How It Works',
    disclaimer: 'Screening support, not diagnosis.',
  },
  cameraScience: {
    eyebrow: 'FROM LIGHT TO SIGNAL',
    title: 'A heartbeat changes the way light leaves your skin.',
    body: 'Each heartbeat changes blood volume beneath the skin by a tiny amount. Those changes slightly alter reflected light. Vytal uses camera frames and signal processing to extract that optical variation and turn it into a physiological signal.',
    technical: 'Remote photoplethysmography (rPPG)',
    labels: ['Reflected light', 'Optical variation', 'Signal extraction', 'Physiological waveform'],
  },
  process: {
    eyebrow: 'HOW VYTAL WORKS',
    intro: 'The useful part is not simply seeing a face. It is separating a usable physiological signal from everything that can distort it.',
    cards: [
      { number: '01', title: 'Observe', body: 'Camera frames provide a region and optical input suitable for screening.' },
      { number: '02', title: 'Extract', body: 'Signal processing isolates pulse-related variation from movement and visual noise.' },
      { number: '03', title: 'Check', body: 'Motion, lighting and signal quality are evaluated before a result is trusted.' },
      { number: '04', title: 'Explain', body: 'Measurements are converted into understandable screening guidance and context.' },
    ],
  },
  productProof: {
    eyebrow: 'THE PRODUCT',
    title: 'A real screening flow, not just a research diagram.',
    body: 'Vytal carries the signal all the way into an interface: acquisition, quality checking, results, explanation and records.',
    labels: ['Acquisition', 'Signal Quality', 'Result Explained'],
    microcopy: ['FACE / OPTICAL INPUT', 'QUALITY / STABLE', 'EXAMPLE RESULT'],
  },
  ecosystem: {
    eyebrow: 'SCREENING ECOSYSTEM',
    title: 'One camera. More than one kind of signal.',
    body: 'Vytal combines core camera-based vitals with broader optical and algorithmic screening research.',
    cta: 'Explore all screenings',
  },
  trust: {
    eyebrow: 'UNCERTAINTY IS PART OF THE RESULT',
    title: 'Designed to know when not to trust a reading.',
    body: 'Camera screening is only useful when signal quality is good enough. Vytal treats motion, lighting, visibility and physiological consistency as part of the result—not as details to hide.',
    factors: [
      { title: 'Motion', body: 'Large movement can corrupt a camera-derived physiological signal.' },
      { title: 'Lighting', body: 'Uneven or unstable illumination changes the optical information the camera receives.' },
      { title: 'Signal quality', body: 'A waveform needs enough consistency before a derived metric should be trusted.' },
      { title: 'Confidence', body: 'Low-confidence readings should trigger caution, a repeat scan or clinical confirmation—not false certainty.' },
    ],
  },
  ai: {
    eyebrow: 'EXPLANATION LAYER',
    title: 'Measurements first. Explanation second.',
    statement: 'AI explains the measurements. It doesn’t invent them.',
    raw: ['Heart rate 104 BPM', 'Pulse variability LOW', 'Signal confidence 82%', 'EXAMPLE READING'],
    explained: 'Your heart rate appears elevated in this example. Rest, consider repeating the reading under stable conditions, and seek professional care if symptoms or concerning readings persist.',
    tabs: ['Raw reading', 'Explained'],
  },
  longitudinal: {
    eyebrow: 'OVER TIME',
    title: 'A reading is a moment. Health is a pattern.',
    body: 'Repeated screenings can provide context that one isolated number cannot: changes, trends, reports and a clearer history to carry forward.',
    features: ['Reading history', 'Trend awareness', 'Shareable reports', 'Referral continuity'],
    chartLabel: 'Illustrative trend',
  },
  impact: {
    eyebrow: 'ACCESS FIRST',
    title: 'Built around the hardware people already have.',
    body: 'The original Vytal idea starts from a practical constraint: basic health information should not require perfect connectivity or expensive equipment before a useful first signal is possible.',
    items: ['Ordinary cameras', 'Low-connectivity thinking', 'Understandable explanations', 'Health-worker workflows'],
    flow: 'Screen → Save → Explain → Refer',
    cta: 'See the wider impact',
  },
  science: {
    eyebrow: 'THE SCIENCE',
    title: 'The interface is simple. The measurement problem is not.',
    pillars: ['Computer vision', 'Physiological signal processing', 'Quality & uncertainty', 'Research-backed screening pathways'],
    body: 'The public experience hides complexity; the science page does not. Explore the methods, assumptions, limitations and validation questions behind Vytal.',
    cta: 'Explore the science',
  },
  future: {
    eyebrow: 'BEYOND THE CAMERA',
    title: 'The camera is the beginning, not the boundary.',
    body: 'Vytal’s broader research direction connects camera sensing with external devices, wearable baselines and longitudinal information.',
    stages: ['Camera', 'BLE devices', 'Wearables', 'Thermal sensing', 'Longitudinal / population insight'],
    label: 'Research & future direction',
  },
  finalCta: {
    title: 'See what your camera can tell you.',
    body: 'Start with the screening experience, then explore the science behind it.',
    primary: 'Start Screening',
    secondary: 'Explore Screenings',
    disclaimer: 'Vytal supports screening and research. It does not provide a medical diagnosis.',
  },
}

export const supportingPageIntros = {
  screenings: {
    eyebrow: 'SCREENINGS',
    title: 'What Vytal is designed to screen.',
    body: 'The homepage shows the vision. This page separates core measurements, experimental screening pathways, contextual triage and future sensing extensions—and states their limitations clearly.',
  },
  science: {
    eyebrow: 'SCIENCE',
    title: 'From camera frames to physiological signals.',
    body: 'Vytal combines computer vision, signal processing and uncertainty-aware screening research. This page explains what those methods can—and cannot—support.',
  },
  impact: {
    eyebrow: 'IMPACT',
    title: 'A useful first signal should not depend on perfect access.',
    body: 'Vytal explores what becomes possible when screening is designed around ordinary devices, constrained connectivity and continuity of care.',
  },
  about: {
    eyebrow: 'ABOUT VYTAL',
    title: 'Make sophisticated screening easier to reach—and harder to overclaim.',
    body: 'Vytal began with camera-derived vital signs and expanded into a broader research platform built around accessibility, evidence and honest uncertainty.',
  },
}
