import { homeScreeningTiles } from './screenings.js'
import { SUPPORTED_LANGUAGES } from '../../lib/ai.js'

export const homeReference = {
  hero: {
    kicker: 'OPTICAL INPUT / VYTAL',
    title: 'There’s more here than you can see.',
    reveal: 'Your camera sees it.',
    scrollCue: 'Scroll to reveal',
  },
  accessThesis: {
    kicker: 'ACCESS / FIRST SIGNAL',
    statement: 'A useful first health signal should not have to wait for perfect access.',
    body: 'Vytal starts with hardware people already carry: an ordinary camera. The goal is accessible screening context—not a replacement for clinical care.',
  },
  proof: {
    kicker: 'WHAT IS REAL / NOW',
    title: 'Start with what we can actually stand behind.',
    body: 'Vytal’s public proof is built from the product and its current content model—not invented reach, adoption or medical accuracy.',
    mapLabel: 'Designed for reach — not a deployment map',
  },
  scienceLineage: {
    kicker: 'A SHORT SCIENTIFIC LINE',
    title: 'The camera idea did not begin with Vytal.',
    body: 'Remote optical physiology has been built through years of published work on camera sensing, color signals, motion robustness and beat timing. Vytal sits downstream of that lineage as a prototype—not as proof that every research direction is clinically validated.',
    cta: 'Explore the science',
  },
}

export const homeSignalBandItems = homeScreeningTiles.map(({ slug, title, status }) => ({
  id: slug,
  label: title,
  status,
  isResearch: status !== 'Core',
}))

export const homeEvidenceItems = [
  {
    id: 'clinician-voice',
    type: 'pending-voice',
    label: 'Clinician / researcher voice pending',
    quote: null,
    mediaSlotId: 'HOME-VOICE-CLINICIAN-01',
  },
  {
    id: 'health-worker-voice',
    type: 'pending-voice',
    label: 'Health-worker voice pending',
    quote: null,
    mediaSlotId: 'HOME-VOICE-HEALTHWORKER-01',
  },
  {
    id: 'research-note',
    type: 'research-note',
    label: 'Research evidence',
    body: 'Remote optical physiology has a published lineage. The Science page separates primary research, prototype implementation and current limitations.',
    mediaSlotId: 'HOME-EVIDENCE-RESEARCH-01',
  },
  {
    id: 'owned-principle',
    type: 'owned-principle',
    label: 'Vytal principle',
    body: 'AI explains the measurements. It doesn’t invent them.',
    mediaSlotId: 'HOME-PRINCIPLE-01',
  },
]

export const homeLanguageItems = SUPPORTED_LANGUAGES.map(({ code, name, label }) => ({
  code,
  name,
  label,
}))

export const homePlatformArcItems = [
  {
    id: 'camera',
    index: '01',
    title: 'CAMERA FIRST',
    body: 'Begin with optical input from hardware already present in an ordinary phone.',
    status: 'Current foundation',
    mediaSlotId: 'HOME-ARC-CAMERA-01',
    signalVariant: 'raw',
  },
  {
    id: 'confidence',
    index: '02',
    title: 'CONFIDENCE AWARE',
    body: 'Treat motion, lighting and signal quality as part of the result—not as invisible implementation detail.',
    status: 'Current foundation',
    mediaSlotId: 'HOME-ARC-CONFIDENCE-01',
    signalVariant: 'trusted',
  },
  {
    id: 'context',
    index: '03',
    title: 'CONTEXT OVER TIME',
    body: 'Carry readings into history so repeated context can matter more than one isolated number.',
    status: 'Platform direction',
    mediaSlotId: 'HOME-ARC-CONTEXT-01',
    signalVariant: 'timeline',
  },
  {
    id: 'future',
    index: '04',
    title: 'BEYOND CAMERA',
    body: 'BLE devices, thermal sensing and wearables are expansion paths being explored around the camera-first core.',
    status: 'Research / future direction',
    mediaSlotId: 'HOME-ARC-FUTURE-01',
    signalVariant: 'network',
  },
]

export const homeConcreteValueItems = [
  { index: '01', title: 'Scan', body: 'Camera-derived signal + quality state' },
  { index: '02', title: 'Result', body: 'Trusted screening output' },
  { index: '03', title: 'Explanation', body: 'Understandable context' },
  { index: '04', title: 'History', body: 'Repeated-reading context' },
  { index: '05', title: 'Handoff', body: 'Information that can be carried forward' },
]
