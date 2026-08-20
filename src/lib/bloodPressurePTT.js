/**
 * Blood Pressure Trend Estimation via Single-Site PPG Crest Time
 * Reference: Pflugradt, M. et al. "Pulse Transit Time (PTT) based blood pressure measurement,"
 * IEEE Reviews in Biomedical Engineering — informs the general PTT/BP
 * inverse relationship this module uses, but this module does NOT measure
 * true pulse transit time.
 *
 * HONEST LABELING NOTE: true PTT requires two simultaneous measurement
 * sites (e.g. face + finger, or ECG R-wave + peripheral pulse). This app
 * has one camera and cannot capture two sites at once — see
 * VYTAL_STATUS_AND_ROADMAP.md §2.6 for why a sequential two-phase capture
 * can't stay phase-locked to the same cardiac cycle either. What IS
 * measurable from a single rPPG waveform is systolic crest time (the
 * foot-to-peak rise time of each pulse, computed in rppg.js), which has
 * published correlation with arterial stiffness and can track BP changes
 * *for a given individual* once calibrated against a real cuff reading.
 * It is a trend proxy, not a transit-time measurement, and it is
 * meaningless without per-user calibration — there is no population
 * default that means anything for crest time the way there arguably is
 * for face-to-finger PTT.
 */

/**
 * Validate an owner-scoped calibration loaded by the caller. Persistence
 * belongs to the protected account baseline store, never browser storage.
 * @returns {{ baselineSbp: number, baselineDbp: number, baselineCrestTimeMs: number, savedAt: string } | null}
 */
export function getBpCalibration(calibration = null) {
  if (!calibration) return null
  const baselineSbp = Number(calibration.baselineSbp)
  const baselineDbp = Number(calibration.baselineDbp)
  const baselineCrestTimeMs = Number(calibration.baselineCrestTimeMs)
  if (!Number.isFinite(baselineSbp) || baselineSbp < 70 || baselineSbp > 250) return null
  if (!Number.isFinite(baselineDbp) || baselineDbp < 40 || baselineDbp > 150) return null
  if (!Number.isFinite(baselineCrestTimeMs) || baselineCrestTimeMs < 40 || baselineCrestTimeMs > 400) return null
  return { baselineSbp, baselineDbp, baselineCrestTimeMs, savedAt: calibration.savedAt || null }
}

/**
 * Save a one-point calibration: the user's real cuff-measured SBP/DBP,
 * paired with their crest time measured in the same scan session.
 * This is a simplified single-point calibration, not the full AAMI
 * two-point protocol (which wants readings spanning a BP range, e.g. at
 * rest and after mild exertion) — see note in estimateBloodPressurePTT.
 */
export function saveBpCalibration(sbp, dbp, crestTimeMs) {
  return getBpCalibration({
    baselineSbp: sbp,
    baselineDbp: dbp,
    baselineCrestTimeMs: crestTimeMs,
    savedAt: new Date().toISOString(),
  })
}

export function clearBpCalibration() {
  return null
}

/**
 * Estimate Systolic (SBP) and Diastolic (DBP) blood pressure TREND from
 * single-site PPG systolic crest time. Requires per-user calibration —
 * see module note above for why there is no meaningful uncalibrated
 * default the way face-to-finger PTT literature might otherwise suggest.
 *
 * @param {number} crestTimeMs - measured systolic foot-to-peak rise time (ms), from rppg.js analyzeSignal()
 * @param {object} [calibration] - explicit override; otherwise reads getBpCalibration()
 * @returns {{ sbp: number, dbp: number, category: string, note: string, isCalibrated: boolean }}
 */
export function estimateBloodPressurePTT(crestTimeMs, calibration = null) {
  const cal = getBpCalibration(calibration)

  if (!crestTimeMs || crestTimeMs < 40 || crestTimeMs > 400) {
    return {
      sbp: cal?.baselineSbp ?? null,
      dbp: cal?.baselineDbp ?? null,
      category: cal ? 'Saved cuff baseline' : 'Uncalibrated — No Estimate',
      note: 'Could not measure a clear pulse waveform this scan — showing your last saved baseline, if any.',
      isCalibrated: Boolean(cal),
    }
  }

  if (!cal) {
    return {
      sbp: null,
      dbp: null,
      category: 'Uncalibrated — Save a Baseline',
      note:
        'This is a single-site PPG trend proxy, not a real blood pressure measurement, and has no meaningful default until calibrated. ' +
        'Measure your BP with a real cuff once and save it as your baseline to get a personalized trend from future scans.',
      isCalibrated: false,
    }
  }

  // Inverse relationship: shorter crest time (faster, stiffer upstroke) is
  // associated with higher BP; longer crest time with lower BP — same
  // general direction as the PTT literature's BP/transit-time inverse
  // relationship, applied here to a within-person delta from their own
  // calibrated baseline rather than a population constant.
  const deltaCrestTime = crestTimeMs - cal.baselineCrestTimeMs
  const estimatedSbp = Math.round(cal.baselineSbp - 0.35 * deltaCrestTime)
  const estimatedDbp = Math.round(cal.baselineDbp - 0.22 * deltaCrestTime)

  const sbp = Math.max(80, Math.min(200, estimatedSbp))
  const dbp = Math.max(50, Math.min(130, estimatedDbp))

  let category = 'Normal'
  if (sbp >= 140 || dbp >= 90) category = 'Hypertension Stage 2'
  else if (sbp >= 130 || dbp >= 80) category = 'Hypertension Stage 1'
  else if (sbp >= 120 && dbp < 80) category = 'Elevated'
  else if (sbp < 90 || dbp < 60) category = 'Hypotension'

  return {
    sbp,
    dbp,
    category,
    note: 'Personalized PPG crest-time trend estimate, calibrated against your saved baseline — not a substitute for a real cuff or clinical measurement.',
    isCalibrated: true,
  }
}
