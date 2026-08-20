/**
 * Platform & Deployment Export Utilities
 * Covers: FHIR R4 Export, SMS Fallback, WhatsApp Share
 * Reference: HL7 FHIR R4 Observation spec, RFC 5724 sms: URI scheme
 */

const LOINC = {
  heartRate:     '8867-4',
  breathingRate: '9279-1',
  stressIndex:   '80394-6',
  spo2:          '59408-5',
}


/**
 * Build an HL7 FHIR R4 Observation resource from a Vytal scan record.
 *
 * @param {object} record - { patientId, hr, br, stress, spo2, timestamp }
 * @returns {object} FHIR Bundle (JSON-serialisable)
 */
export function buildFhirBundle(record) {
  const ts = new Date(record.timestamp || Date.now()).toISOString()
  const patientRef = `Patient/${record.patientId || record.id}`

  function obs(loincCode, unit, value) {
    if (value == null) return null
    return {
      resourceType: 'Observation',
      status: 'final',
      code: {
        coding: [{
          system: 'http://loinc.org',
          code: loincCode,
        }],
      },
      subject: { reference: patientRef },
      effectiveDateTime: ts,
      valueQuantity: { value, unit },
    }
  }

  const entries = [
    obs(LOINC.heartRate,     'bpm',     record.hr),
    obs(LOINC.breathingRate, '/min',    record.br),
    obs(LOINC.stressIndex,   '/100',    record.stress),
    obs(LOINC.spo2,          '%',       record.spo2 ?? null),
  ].filter(Boolean)

  return {
    resourceType: 'Bundle',
    type: 'collection',
    timestamp: ts,
    entry: entries.map((resource) => ({ resource })),
  }
}


/**
 * Download a FHIR JSON bundle as a file.
 *
 * @param {object} record
 */
export function downloadFhirBundle(record) {
  const bundle = buildFhirBundle(record)
  const json = JSON.stringify(bundle, null, 2)
  const blob = new Blob([json], { type: 'application/json' })
  const url = URL.createObjectURL(blob)
  const a = document.createElement('a')
  a.href = url
  a.download = `vytal-fhir-${record.patientId || record.id}.json`
  a.click()
  URL.revokeObjectURL(url)
}


/**
 * Open the device SMS composer pre-filled with a referral summary.
 * Uses the RFC 5724 sms: URI scheme.
 *
 * @param {string} recipientPhone - Supervisor or clinic phone number
 * @param {object} record - Scan record
 */
export function openSmsReferral(recipientPhone, record) {
  const tier = record.alertTier || 'UNKNOWN'
  const lines = [
    `🚨 Vytal Triage Alert [${tier}]`,
    `Patient: ${record.name || record.patientId}`,
    `HR: ${record.hr} bpm | BR: ${record.br || '—'} br/min | Stress: ${record.stress}/100`,
    record.spo2 ? `SpO2 Proxy: ${record.spo2}%` : '',
    `Time: ${new Date(record.timestamp || Date.now()).toLocaleString()}`,
    `Reason: ${(record.alertReasons || []).join('; ') || 'See Vytal record.'}`,
    `Record: ${window.location.origin}/report?id=${record.patientId || record.id}`,
  ].filter(Boolean).join('\n')

  const phone = recipientPhone ? recipientPhone.replace(/\s+/g, '') : ''
  const uri = `sms:${phone}?body=${encodeURIComponent(lines)}`
  window.location.href = uri
}


/**
 * Open WhatsApp Click-to-Chat with a patient summary message.
 *
 * @param {object} record
 * @param {string} reportUrl - Full URL to the Vytal report
 */
export function openWhatsAppShare(record, reportUrl) {
  const msg = [
    `🩺 *Vytal Screening Result*`,
    `*Patient:* ${record.name || record.patientId}`,
    `*Status:* ${record.alertTier || (record.status === 'flagged' ? 'FLAGGED' : 'NORMAL')}`,
    `• Heart Rate: ${record.hr} bpm`,
    `• Breathing: ${record.br || '—'} br/min`,
    `• Stress Index: ${record.stress}/100`,
    record.spo2 ? `• SpO2 Proxy: ${record.spo2}%` : '',
    ``,
    `📎 Full Report: ${reportUrl}`,
    ``,
    `_Vytal Community Health Triage System_`,
  ].filter((l, i, arr) => l !== '' || arr[i - 1] !== '').join('\n')

  const url = `https://wa.me/?text=${encodeURIComponent(msg)}`
  window.open(url, '_blank', 'noopener,noreferrer')
}


/**
 * Voice readout of scan results using Web Speech API.
 * Reads the AI explanation aloud in the patient's selected language.
 *
 * @param {string} text - Text to read aloud
 * @param {string} langCode - BCP-47 language code ('en', 'ur', 'ar', etc.)
 * @param {function} [onEnd] - Callback when speech finishes
 * @returns {{ cancel: function }} - Object with cancel method to stop speech
 */
export function speakExplanation(text, langCode = 'en', onEnd = null) {
  if (!window.speechSynthesis || !text) {
    return { cancel: () => {} }
  }

  // Map short language code -> BCP-47
  const BCP47 = {
    en: 'en-US',
    ur: 'ur-PK',
    ps: 'ps-AF',
    sd: 'sd-PK',
    ar: 'ar-SA',
    sw: 'sw-KE',
    ha: 'ha-NG',
    am: 'am-ET',
    bn: 'bn-BD',
    hi: 'hi-IN',
    tl: 'tl-PH',
  }

  window.speechSynthesis.cancel()
  const utterance = new SpeechSynthesisUtterance(text)
  utterance.lang = BCP47[langCode] || 'en-US'
  utterance.rate = 0.88
  utterance.pitch = 1.0

  if (onEnd) utterance.addEventListener('end', onEnd)
  window.speechSynthesis.speak(utterance)

  return { cancel: () => window.speechSynthesis.cancel() }
}


/**
 * Check if Web Speech API has a voice available for the given language.
 *
 * @param {string} langCode
 * @returns {boolean}
 */
export function isVoiceAvailable(langCode = 'en') {
  if (!window.speechSynthesis) return false
  const voices = window.speechSynthesis.getVoices()
  const prefix = langCode.toLowerCase()
  return voices.some((v) => v.lang.toLowerCase().startsWith(prefix))
}
