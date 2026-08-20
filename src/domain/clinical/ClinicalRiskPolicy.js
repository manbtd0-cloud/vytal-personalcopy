import { evaluateAlertScale } from '../../lib/alertScale.js'

const hasNumber = (value) => value !== null && value !== '' && Number.isFinite(Number(value))

export class ClinicalRiskPolicy {
  constructor({ minHeartRate = 50, maxHeartRate = 100, minBreathingRate = 10, maxBreathingRate = 22, maxStress = 60 } = {}) {
    this.thresholds = Object.freeze({ minHeartRate, maxHeartRate, minBreathingRate, maxBreathingRate, maxStress })
  }

  evaluate({
    mode = 'face', heartRate, breathingRate, stressScore, ageGroup = 'adult', isPregnant = false,
    programmeContext = 'general', anemia = null, jaundice = null, bmi = null,
    spo2 = null, isIrregularRhythm = false,
  } = {}) {
    if (mode === 'anemia' || anemia) {
      if (!anemia || anemia.tier === 'UNKNOWN' || !hasNumber(anemia.hb)) {
        return { flagged: false, tier: 'UNKNOWN', reasons: ['Anemia capture requires a retry'], priority: null }
      }
      const flagged = anemia.tier === 'RED' || anemia.tier === 'ORANGE'
      return {
        flagged,
        tier: anemia.tier,
        reasons: flagged ? [`${anemia.tier === 'RED' ? 'Severe' : 'Moderate'} anemia screening proxy`] : [],
        priority: anemia.tier === 'RED' ? 'urgent' : flagged ? 'priority' : null,
      }
    }

    if (mode === 'jaundice' || jaundice) {
      if (!jaundice || jaundice.tier === 'UNKNOWN' || !hasNumber(jaundice.yellowIndex)) {
        return { flagged: false, tier: 'UNKNOWN', reasons: ['Jaundice capture requires a retry'], priority: null }
      }
      const flagged = Boolean(jaundice.isJaundiced) || jaundice.tier === 'ORANGE'
      return {
        flagged,
        tier: flagged ? 'ORANGE' : 'GREEN',
        reasons: flagged ? ['Scleral yellowing proxy requires bilirubin confirmation'] : [],
        priority: flagged ? 'priority' : null,
      }
    }

    if (mode === 'bmi' || bmi) {
      const tier = bmi?.tier || 'GREEN'
      const flagged = tier === 'RED' || tier === 'ORANGE'
      return { flagged, tier, reasons: flagged ? ['Anthropometric nutrition proxy outside review range'] : [], priority: tier === 'RED' ? 'urgent' : flagged ? 'priority' : null }
    }

    if (!hasNumber(heartRate)) {
      return { flagged: false, tier: 'UNKNOWN', reasons: ['No valid pulse measurement'], priority: null }
    }

    const alert = evaluateAlertScale({
      hr: Number(heartRate), br: hasNumber(breathingRate) ? Number(breathingRate) : null,
      stress: hasNumber(stressScore) ? Number(stressScore) : 20,
      ageGroup, isPregnant, programmeContext,
    })
    let tier = alert.tier
    const reasons = [...alert.reasons]
    if (hasNumber(spo2) && Number(spo2) < 95) {
      const oxygenTier = Number(spo2) < 90 ? 'RED' : 'ORANGE'
      const severity = { GREEN: 0, YELLOW: 1, ORANGE: 2, RED: 3 }
      if (severity[oxygenTier] > severity[tier]) tier = oxygenTier
      reasons.push('SpO₂ camera proxy requires approved-oximeter confirmation')
    }
    if (isIrregularRhythm) {
      tier = 'RED'
      reasons.push('Irregular rhythm proxy requires clinical ECG confirmation')
    }
    const flagged = tier === 'RED' || tier === 'ORANGE'
    return { flagged, tier, reasons, priority: tier === 'RED' ? 'urgent' : flagged ? 'priority' : null }
  }

  stressLabel(stressScore) {
    if (!Number.isFinite(stressScore) || stressScore < 30) return 'Normal'
    if (stressScore < this.thresholds.maxStress) return 'Slightly high'
    return 'High'
  }
}

export const clinicalRiskPolicy = new ClinicalRiskPolicy()
