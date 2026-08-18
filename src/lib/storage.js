// Local storage and offline queue for Vytal patient screening records

const STORAGE_KEY = 'vytal_patient_records'

const INITIAL_DEMO_PATIENTS = [
  {
    id: 'P-0231',
    patientId: 'P-0231',
    name: 'Amina K.',
    hr: 118,
    br: 21,
    stress: 78,
    stressLabel: 'High',
    status: 'flagged',
    explanation:
      "Amina's heart rate (118 bpm) and stress reading are higher than expected at rest. This doesn't mean something is wrong, but it's recommended to have a clinician evaluate her within 24-48 hours.",
    language: 'en',
    timestamp: new Date(Date.now() - 12 * 60 * 1000).toISOString(),
    synced: true,
  },
  {
    id: 'P-0230',
    patientId: 'P-0230',
    name: 'Rahim D.',
    hr: 76,
    br: 16,
    stress: 22,
    stressLabel: 'Normal',
    status: 'ok',
    explanation:
      "Rahim's vitals (heart rate 76 bpm, 16 breaths/min) are in a healthy resting range. No immediate follow-up required.",
    language: 'en',
    timestamp: new Date(Date.now() - 40 * 60 * 1000).toISOString(),
    synced: true,
  },
  {
    id: 'P-0229',
    patientId: 'P-0229',
    name: 'Fatima S.',
    hr: 91,
    br: 18,
    stress: 58,
    stressLabel: 'Slightly high',
    status: 'pending',
    explanation:
      "Fatima's heart rate is 91 bpm with mild elevation in stress index. Advised rest and re-scan if feeling unwell.",
    language: 'en',
    timestamp: new Date(Date.now() - 60 * 60 * 1000).toISOString(),
    synced: false,
  },
  {
    id: 'P-0228',
    patientId: 'P-0228',
    name: 'Yusuf M.',
    hr: 72,
    br: 15,
    stress: 15,
    stressLabel: 'Normal',
    status: 'ok',
    explanation:
      "Yusuf's resting vitals are steady and calm. Excellent baseline reading.",
    language: 'en',
    timestamp: new Date(Date.now() - 2 * 60 * 60 * 1000).toISOString(),
    synced: true,
  },
  {
    id: 'P-0227',
    patientId: 'P-0227',
    name: 'Zainab R.',
    hr: 104,
    br: 20,
    stress: 72,
    stressLabel: 'High',
    status: 'flagged',
    explanation:
      "Zainab shows an elevated resting pulse of 104 bpm. Recommended for community health worker follow-up.",
    language: 'en',
    timestamp: new Date(Date.now() - 3 * 60 * 60 * 1000).toISOString(),
    synced: true,
  },
]

export function getStoredRecords() {
  try {
    const raw = localStorage.getItem(STORAGE_KEY)
    if (!raw) {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(INITIAL_DEMO_PATIENTS))
      return INITIAL_DEMO_PATIENTS
    }
    return JSON.parse(raw)
  } catch (err) {
    console.error('Failed to read stored records', err)
    return INITIAL_DEMO_PATIENTS
  }
}

export function saveRecord(record) {
  try {
    const existing = getStoredRecords()
    const updated = [record, ...existing.filter((r) => r.id !== record.id)]
    localStorage.setItem(STORAGE_KEY, JSON.stringify(updated))
    return updated
  } catch (err) {
    console.error('Failed to save record', err)
    return []
  }
}

export function getRecordById(id) {
  const records = getStoredRecords()
  return records.find((r) => r.id === id || r.patientId === id) || records[0]
}

export function syncPendingRecords() {
  const records = getStoredRecords()
  const updated = records.map((r) => ({ ...r, synced: true }))
  localStorage.setItem(STORAGE_KEY, JSON.stringify(updated))
  return updated
}
