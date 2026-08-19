export const impactScenarios = [
  {
    id: 'individual-home',
    title: 'Individual at home',
    illustrative: true,
    summary: 'An ordinary phone becomes the starting point for a screening interaction at home, with the result framed as context rather than diagnosis.',
    detail: 'The scenario is intentionally illustrative. It shows the product flow Vytal is designed around, not a real patient outcome or deployment claim.',
    mediaSlotIds: ['IMP-HOME-01', 'IMP-HOME-02', 'IMP-HOME-03'],
  },
  {
    id: 'community-health-worker',
    title: 'Community health worker',
    illustrative: true,
    summary: 'One portable device supports a screen, save, explain and refer workflow in a field-health context.',
    detail: 'The scenario represents a target workflow. It does not imply an existing health-system partnership or clinical deployment.',
    mediaSlotIds: ['IMP-CHW-01', 'IMP-CHW-02', 'IMP-CHW-03'],
  },
  {
    id: 'low-connectivity',
    title: 'Low connectivity',
    illustrative: true,
    summary: 'The product is shaped around the idea that useful screening context should remain understandable when connectivity is limited.',
    detail: 'This is a design direction rather than a guarantee of seamless offline synchronization in the current prototype.',
    mediaSlotIds: ['IMP-OFFLINE-01', 'IMP-OFFLINE-02', 'IMP-OFFLINE-03'],
  },
  {
    id: 'multilingual-explanation',
    title: 'Multilingual explanation',
    illustrative: true,
    summary: 'Measurements can be translated into plain-language explanations so the result is easier to understand in the user’s language.',
    detail: 'The explanation layer follows the measurement. It is not the source of the physiological reading and does not turn a screening result into a diagnosis.',
    mediaSlotIds: ['IMP-LANG-01', 'IMP-LANG-02', 'IMP-LANG-03'],
  },
  {
    id: 'longitudinal-follow-up',
    title: 'Longitudinal follow-up',
    illustrative: true,
    summary: 'Repeated readings can be organized into a history so change over time becomes more visible than a single isolated moment.',
    detail: 'Trend views are contextual and depend on the quality and comparability of the underlying readings.',
    mediaSlotIds: ['IMP-LONG-01', 'IMP-LONG-02', 'IMP-LONG-03'],
  },
  {
    id: 'referral-continuity',
    title: 'Referral continuity',
    illustrative: true,
    summary: 'A saved screening record can support a clearer handoff when a person needs follow-up from a health worker or clinician.',
    detail: 'The scenario demonstrates continuity intent; it does not claim current interoperability with a specific provider or health system.',
    mediaSlotIds: ['IMP-REFERRAL-01', 'IMP-REFERRAL-02', 'IMP-REFERRAL-03'],
  },
]

export const impactAudiences = [
  {
    title: 'Individuals',
    body: 'A simpler first layer of screening built around a device many people already carry.',
  },
  {
    title: 'Community health workers',
    body: 'A workflow shaped around screening, saving, explaining and referring from one portable tool.',
  },
  {
    title: 'Low-resource communities',
    body: 'A research direction that treats connectivity, equipment access and continuity as product constraints rather than edge cases.',
  },
  {
    title: 'Healthcare systems',
    body: 'Structured screening context, reports and future interoperability pathways that can support—not replace—professional care.',
  },
]

export const impactPrinciples = [
  'Ordinary-device first',
  'Low-connectivity thinking',
  'Understandable explanations',
  'Continuity beyond one reading',
]

export const healthWorkerFlow = ['Screen', 'Save', 'Explain', 'Refer']
