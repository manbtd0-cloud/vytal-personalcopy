import { requireAuthenticatedUser, supabase, supabaseConfigured } from './supabase.js'
import { REFERRAL_STEPS, referralWorkflow } from '../domain/referrals/ReferralWorkflow.js'
import { applyDescendingCursor, boundedPageSize, pageResult } from './pagination.js'

export { REFERRAL_STEPS }

const MAX_PATIENTS = 200
const MAX_REFERRALS = 200
const PATIENT_FIELDS = 'id, patient_code, full_name, date_of_birth, sex, phone, address, emergency_contact, consent_status, consented_at, created_at, updated_at'

const DEMO_PATIENTS = [
  {
    id: 'demo-amina', patient_code: 'P-0231', full_name: 'Amina K.', date_of_birth: '1989-04-12',
    sex: 'female', phone: '+92 300 0000001', emergency_contact: { name: 'Sana K.', phone: '+92 300 0000011' },
    consent_status: 'granted', created_at: new Date(Date.now() - 12 * 86400000).toISOString(),
  },
  {
    id: 'demo-rahim', patient_code: 'P-0230', full_name: 'Rahim D.', date_of_birth: '1978-11-03',
    sex: 'male', phone: '+92 300 0000002', emergency_contact: { name: 'Ali D.', phone: '+92 300 0000012' },
    consent_status: 'granted', created_at: new Date(Date.now() - 8 * 86400000).toISOString(),
  },
  {
    id: 'demo-fatima', patient_code: 'P-0229', full_name: 'Fatima S.', date_of_birth: '1996-07-18',
    sex: 'female', phone: '+92 300 0000003', emergency_contact: {},
    consent_status: 'granted', created_at: new Date(Date.now() - 4 * 86400000).toISOString(),
  },
]

let sessionPatients = [...DEMO_PATIENTS]
let sessionReferrals = [
  {
    id: 'demo-referral-1', patient_id: 'demo-amina', screening_id: 'demo-screening-1',
    status: 'flagged', priority: 'priority', reason: 'Elevated resting pulse requires follow-up review.',
    due_at: new Date(Date.now() + 86400000).toISOString(), notes: '',
    created_at: new Date(Date.now() - 12 * 60000).toISOString(),
    updated_at: new Date(Date.now() - 12 * 60000).toISOString(),
  },
]

async function currentUserOrNull() {
  if (!supabaseConfigured) return null
  try {
    return await requireAuthenticatedUser()
  } catch {
    return null
  }
}

function patientCode() {
  const suffix = crypto.randomUUID().slice(0, 4).toUpperCase()
  return `P-${String(Date.now()).slice(-6)}-${suffix}`
}

function normalizePatient(input, userId = null) {
  return {
    owner_user_id: userId,
    patient_code: (input.patient_code || patientCode()).trim().toUpperCase(),
    full_name: input.full_name.trim(),
    date_of_birth: input.date_of_birth || null,
    sex: input.sex || 'prefer_not_to_say',
    phone: input.phone?.trim() || null,
    address: input.address ?? {},
    emergency_contact: input.emergency_contact ?? {},
    consent_status: input.consent_status || 'pending',
    consent_version: input.consent_status === 'granted' ? 'v1' : null,
    consented_at: input.consent_status === 'granted' ? new Date().toISOString() : null,
    custom_fields: input.custom_fields ?? {},
  }
}

export async function getPatients() {
  const page = await getPatientsPage({ limit: MAX_PATIENTS })
  return page.items
}

export async function getPatientsPage({ limit = 40, cursor = null } = {}) {
  const pageSize = boundedPageSize(limit, 40, MAX_PATIENTS)
  const user = await currentUserOrNull()
  if (!user) {
    const start = cursor ? Math.max(0, sessionPatients.findIndex((item) => item.id === cursor.id) + 1) : 0
    return pageResult(sessionPatients.slice(start, start + pageSize + 1), pageSize, 'updated_at')
  }

  let query = supabase
    .from('patients')
    .select(PATIENT_FIELDS)
    .eq('owner_user_id', user.id)
    .order('updated_at', { ascending: false })
    .order('id', { ascending: false })
    .limit(pageSize + 1)

  query = applyDescendingCursor(query, 'updated_at', cursor)
  const { data, error } = await query
  if (error) throw error
  return pageResult(data ?? [], pageSize, 'updated_at')
}

export async function createPatient(input) {
  if (!input.full_name?.trim()) throw new Error('Patient name is required.')
  if (input.consent_status !== 'granted') throw new Error('Record consent before registering the patient.')

  const user = await currentUserOrNull()
  if (!user) {
    const patient = {
      ...normalizePatient(input),
      id: `demo-${crypto.randomUUID()}`,
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
    }
    sessionPatients = [patient, ...sessionPatients].slice(0, MAX_PATIENTS)
    return patient
  }

  const { data, error } = await supabase
    .from('patients')
    .insert(normalizePatient(input, user.id))
    .select(PATIENT_FIELDS)
    .single()

  if (error) throw error
  return data
}

export async function updatePatientConsent(patientId, consentStatus) {
  if (!['granted', 'withdrawn'].includes(consentStatus)) {
    throw new Error('Unsupported consent status.')
  }

  const user = await currentUserOrNull()
  const consentedAt = consentStatus === 'granted' ? new Date().toISOString() : null
  const update = {
    consent_status: consentStatus,
    consent_version: consentStatus === 'granted' ? 'v1' : null,
    consented_at: consentedAt,
  }

  if (!user) {
    sessionPatients = sessionPatients.map((patient) => patient.id === patientId
      ? { ...patient, ...update, updated_at: new Date().toISOString() }
      : patient)
    return sessionPatients.find((patient) => patient.id === patientId)
  }

  const { data, error } = await supabase
    .from('patients')
    .update(update)
    .eq('id', patientId)
    .eq('owner_user_id', user.id)
    .select(PATIENT_FIELDS)
    .single()

  if (error) throw error
  return data
}

export async function getReferrals() {
  const page = await getReferralsPage({ limit: MAX_REFERRALS })
  return page.items
}

export async function getReferralsPage({ limit = 40, cursor = null } = {}) {
  const pageSize = boundedPageSize(limit, 40, MAX_REFERRALS)
  const user = await currentUserOrNull()
  if (!user) {
    const patientMap = new Map(sessionPatients.map((patient) => [patient.id, patient]))
    const joined = sessionReferrals.map((referral) => ({
      ...referral,
      patient: patientMap.get(referral.patient_id) ?? null,
    }))
    const start = cursor ? Math.max(0, joined.findIndex((item) => item.id === cursor.id) + 1) : 0
    return pageResult(joined.slice(start, start + pageSize + 1), pageSize, 'updated_at')
  }

  let query = supabase
    .from('referrals')
    .select(`
      id, patient_id, screening_id, status, priority, reason, due_at, notes,
      completed_at, created_at, updated_at,
      patient:patients!referrals_patient_owner_fk(id, patient_code, full_name, phone)
    `)
    .eq('user_id', user.id)
    .order('updated_at', { ascending: false })
    .order('id', { ascending: false })
    .limit(pageSize + 1)

  query = applyDescendingCursor(query, 'updated_at', cursor)
  const { data: referrals, error: referralError } = await query
  if (referralError) throw referralError
  return pageResult(referrals ?? [], pageSize, 'updated_at')
}

export async function createReferralForScreening({ patientId, screeningId, reason, priority = 'priority' }) {
  if (!patientId) return null
  const user = await currentUserOrNull()
  const referral = {
    patient_id: patientId,
    screening_id: screeningId,
    status: 'flagged',
    priority,
    reason,
    due_at: new Date(Date.now() + 86400000).toISOString(),
  }

  if (!user) {
    const existing = sessionReferrals.find((item) => item.screening_id === screeningId)
    if (existing) return existing
    const created = {
      ...referral,
      id: `demo-referral-${crypto.randomUUID()}`,
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
    }
    sessionReferrals = [created, ...sessionReferrals].slice(0, MAX_REFERRALS)
    return created
  }

  throw new Error('Production referrals are created atomically by the clinical screening backend.')
}

export async function updateReferralStatus(referralId, status) {
  if (!REFERRAL_STEPS.includes(status) && status !== 'cancelled') {
    throw new Error('Unsupported referral status.')
  }

  const user = await currentUserOrNull()
  const completedAt = status === 'completed' ? new Date().toISOString() : null

  if (!user) {
    const currentReferral = sessionReferrals.find((item) => item.id === referralId)
    if (!currentReferral || !referralWorkflow.canTransition(currentReferral.status, status)) {
      throw new Error('Referral transition must follow the care workflow.')
    }
    sessionReferrals = sessionReferrals.map((item) => item.id === referralId
      ? { ...item, status, completed_at: completedAt, updated_at: new Date().toISOString() }
      : item)
    return sessionReferrals.find((item) => item.id === referralId)
  }

  const { data, error } = await supabase
    .rpc('advance_referral', {
      p_referral_id: referralId,
      p_next_status: status,
      p_note: null,
    })

  if (error) throw error
  const updated = Array.isArray(data) ? data[0] : data
  return {
    id: updated.referral_id,
    status: updated.referral_status,
    completed_at: updated.referral_completed_at,
    updated_at: updated.referral_updated_at,
  }
}
