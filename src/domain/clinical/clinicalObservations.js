
const numberObservation = (metricKey, value, unit, metadata = {}) => Number.isFinite(Number(value))
  ? { metric_key: metricKey, value_numeric: Number(value), value_text: null, unit, metadata }
  : null

const textObservation = (metricKey, value, metadata = {}) => typeof value === 'string' && value.trim()
  ? { metric_key: metricKey, value_numeric: null, value_text: value.trim(), unit: null, metadata }
  : null

export function toClinicalObservations(record = {}) {
  const observations = [
    numberObservation('heart_rate', record.hr, 'bpm'),
    numberObservation('breathing_rate', record.br, 'breaths/min'),
    numberObservation('stress_score', record.stress, 'score/100'),
    numberObservation('spo2_proxy', record.spo2 ?? record.spo2Result?.spo2, '%'),
    numberObservation('pulse_rmssd_proxy', record.rmssd, 'ms'),
    numberObservation('systolic_bp_trend', record.bpResult?.sbp, 'mmHg', { calibrated: Boolean(record.bpResult?.isCalibrated) }),
    numberObservation('diastolic_bp_trend', record.bpResult?.dbp, 'mmHg', { calibrated: Boolean(record.bpResult?.isCalibrated) }),
    numberObservation('bmi_proxy', record.bmiResult?.bmi, 'kg/m2'),
    textObservation('bmi_category', record.bmiResult?.category),
    numberObservation('hemoglobin_proxy', record.anemiaResult?.hb, 'g/dL'),
    numberObservation('anemia_erythema_index', record.anemiaResult?.erythemaIndex, 'index'),
    textObservation('anemia_tier', record.anemiaResult?.tier),
    numberObservation('bilirubin_proxy', record.jaundiceResult?.yellowIndex, 'index'),
    textObservation('jaundice_tier', record.jaundiceResult?.tier),
    textObservation('alert_tier', record.alertTier),
    textObservation('rhythm_screening', record.isIrregularRhythm === true ? 'irregular' : record.isIrregularRhythm === false ? 'regular' : null),
  ]
  return observations.filter(Boolean)
}
