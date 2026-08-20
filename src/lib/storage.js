// Secure record persistence. Production data is stored in Supabase/Postgres
// behind Auth + row-level security. Unconfigured development mode is memory-only
// so patient information is never written to browser persistence.

import { createReferralForScreening } from './patients.js'
import { requireAuthenticatedUser, supabase, supabaseConfigured } from './supabase.js'
import { applyDescendingCursor, boundedPageSize, pageResult } from './pagination.js'
import { toClinicalObservations } from '../domain/clinical/clinicalObservations.js'

const MAX_SCREENINGS = 100
const SCREENING_FIELDS = `
  id, patient_id, patient_reference, patient_name, status, stress_label,
  explanation, language, source, risk_reasons, algorithm_version, capture_quality, metadata, observed_at,
  vital_observations(metric_key, value_numeric, value_text, unit)
`

const DEMO_RECORDS = [
  {
    id: 'demo-screening-1', patientId: 'P-0231', patientDatabaseId: 'demo-amina', name: 'Amina K.',
    hr: 128, br: 21, stress: 78, stressLabel: 'High', status: 'flagged', language: 'en', synced: true,
    explanation: 'Heart rate and pulse variability indicators are elevated at rest. A community clinician review is recommended.',
    timestamp: new Date(Date.now() - 12 * 60 * 1000).toISOString(),
  },
  {
    id: 'demo-screening-2', patientId: 'P-0230', patientDatabaseId: 'demo-rahim', name: 'Rahim D.',
    hr: 76, br: 16, stress: 22, stressLabel: 'Normal', status: 'ok', language: 'en', synced: true,
    explanation: 'Screening values are within a typical resting range. No immediate follow-up is indicated.',
    timestamp: new Date(Date.now() - 40 * 60 * 1000).toISOString(),
  },
  {
    id: 'demo-screening-3', patientId: 'P-0229', patientDatabaseId: 'demo-fatima', name: 'Fatima S.',
    hr: 91, br: 18, stress: 58, stressLabel: 'Slightly high', status: 'pending', language: 'en', synced: false,
    explanation: 'Pulse variability is mildly elevated. Rest and repeat the screening if symptoms continue.',
    timestamp: new Date(Date.now() - 60 * 60 * 1000).toISOString(),
  },
]

let sessionRecords = [...DEMO_RECORDS]

function observationMap(observations = []) {
  const result = Object.create(null)
  for (const item of observations) {
    result[item.metric_key] = item.value_numeric ?? item.value_text
  }
  return result
}

function screeningToRecord(screening) {
  const values = observationMap(screening.vital_observations)
  return {
    id: screening.id,
    reportId: screening.id,
    databaseId: screening.id,
    patientId: screening.patient_reference || screening.patient_id,
    patientDatabaseId: screening.patient_id,
    name: screening.patient_name || 'Patient',
    hr: values.heart_rate,
    br: values.breathing_rate,
    stress: values.stress_score,
    spo2: values.spo2_proxy,
    rmssd: values.pulse_rmssd_proxy,
    alertTier: values.alert_tier || screening.metadata?.alert_tier || null,
    alertReasons: screening.risk_reasons || [],
    anemiaResult: values.anemia_tier ? { hb: values.hemoglobin_proxy, erythemaIndex: values.anemia_erythema_index, tier: values.anemia_tier } : null,
    jaundiceResult: values.jaundice_tier ? { yellowIndex: values.bilirubin_proxy, tier: values.jaundice_tier, isJaundiced: values.jaundice_tier === 'ORANGE' } : null,
    bmiResult: values.bmi_proxy ? { bmi: values.bmi_proxy, category: values.bmi_category } : null,
    bpResult: values.systolic_bp_trend ? { sbp: values.systolic_bp_trend, dbp: values.diastolic_bp_trend, isCalibrated: Boolean(screening.metadata?.bp_calibrated) } : null,
    isIrregularRhythm: values.rhythm_screening == null ? null : values.rhythm_screening === 'irregular',
    mode: screening.metadata?.mode || screening.source || 'face',
    metrics: values,
    stressLabel: screening.stress_label || 'Normal',
    status: screening.status,
    explanation: screening.explanation || '',
    language: screening.language || 'en',
    timestamp: screening.observed_at,
    synced: true,
  }
}

async function currentUserOrNull() {
  if (!supabaseConfigured) return null
  try {
    return await requireAuthenticatedUser()
  } catch {
    return null
  }
}

function referralPriority(record) {
  if (record.referralPriority === 'urgent' || record.alertTier === 'RED' || record.anemiaResult?.tier === 'RED') return 'urgent'
  if (!Number.isFinite(Number(record.hr))) return 'priority'
  if (record.hr < 45 || record.hr > 120 || record.br > 25) return 'urgent'
  return 'priority'
}

export async function getStoredRecords() {
  const page = await getStoredRecordsPage({ limit: MAX_SCREENINGS })
  return page.items
}

export async function getStoredRecordsPage({ limit = 25, cursor = null } = {}) {
  const pageSize = boundedPageSize(limit, 25, MAX_SCREENINGS)
  const user = await currentUserOrNull()
  if (!user) {
    const start = cursor ? Math.max(0, sessionRecords.findIndex((item) => item.id === cursor.id) + 1) : 0
    const rows = sessionRecords.slice(start, start + pageSize + 1)
    return pageResult(rows, pageSize, 'timestamp')
  }

  let query = supabase
    .from('screenings')
    .select(SCREENING_FIELDS)
    .eq('user_id', user.id)
    .order('observed_at', { ascending: false })
    .order('id', { ascending: false })
    .limit(pageSize + 1)

  query = applyDescendingCursor(query, 'observed_at', cursor)
  const { data, error } = await query

  if (error) throw error
  const page = pageResult(data ?? [], pageSize, 'observed_at')
  return { ...page, items: page.items.map(screeningToRecord) }
}

export async function saveRecord(record) {
  const user = await currentUserOrNull()
  if (!user) {
    const saved = {
      ...record,
      id: record.id || `demo-screening-${crypto.randomUUID()}`,
    }
    saved.reportId = saved.id
    sessionRecords = [saved, ...sessionRecords.filter((item) => item.id !== saved.id)]
      .slice(0, MAX_SCREENINGS)

    if (saved.status === 'flagged') {
      await createReferralForScreening({
        patientId: saved.patientDatabaseId,
        screeningId: saved.id,
        priority: referralPriority(saved),
        reason: 'Camera screening crossed a configured review threshold. Confirm with an approved device or clinician.',
      })
    }
    return saved
  }

  if (!record.patientDatabaseId) throw new Error('A linked patient is required for secure screening storage.')

  const observations = toClinicalObservations(record)
  if (observations.length === 0) throw new Error('At least one measured clinical observation is required.')

  const { data, error } = await supabase.rpc('record_screening', {
    p_patient_id: record.patientDatabaseId,
    p_language: record.language || 'en',
    p_explanation: record.explanation || null,
    p_source: record.source || 'camera_rppg',
    p_stress_label: record.stressLabel || null,
    p_algorithm_version: record.algorithmVersion || 'rppg-v1',
    p_capture_quality: record.captureQuality ?? null,
    p_observations: observations,
    p_metadata: {
      quality_flags: Number(record.qualityFlags ?? 0),
      mode: record.mode || 'face',
      alert_tier: record.alertTier || null,
      age_group: record.ageGroup || null,
      is_pregnant: Boolean(record.isPregnant),
      programme_context: record.programmeContext || null,
      bp_calibrated: Boolean(record.bpResult?.isCalibrated),
    },
    p_observed_at: record.timestamp || new Date().toISOString(),
  })

  if (error) throw error
  const result = Array.isArray(data) ? data[0] : data
  if (!result?.screening_id) throw new Error('The clinical backend did not return a screening identifier.')

  const saved = {
    ...record,
    id: result.screening_id,
    reportId: result.screening_id,
    databaseId: result.screening_id,
    status: result.screening_status,
    referralId: result.referral_id || null,
    synced: true,
  }

  return saved
}

export async function getRecordById(id) {
  const user = await currentUserOrNull()
  if (!user) {
    return sessionRecords.find((item) => item.id === id || item.patientId === id) ?? sessionRecords[0]
  }

  let query = supabase
    .from('screenings')
    .select(SCREENING_FIELDS)
    .eq('user_id', user.id)

  const isUuid = /^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i.test(id || '')
  query = isUuid
    ? query.eq('id', id)
    : query.eq('patient_reference', id).order('observed_at', { ascending: false }).limit(1)

  const { data, error } = await query.maybeSingle()
  if (error) throw error
  return data ? screeningToRecord(data) : null
}

export async function syncPendingRecords() {
  // Database writes are immediate. Development records deliberately remain
  // memory-only until the secure backend is configured.
  return getStoredRecords()
}
