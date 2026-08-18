/**
 * Tachycardia / Bradycardia 3-Level Triage Alert Scale & Clinical Rules Engine
 * References:
 *   - WHO IMCI (Integrated Management of Childhood Illness)
 *   - AHA / PALS pediatric guidelines
 *   - Sepsis-3 International Consensus Definitions (Singer et al., JAMA 2016)
 *   - Obstetric Cardiovascular Adaptation Standards (3rd Trimester)
 */

export const AGE_GROUPS = [
  { id: 'adult', label: 'Adult (13+ yrs)', desc: 'Standard adult clinical thresholds' },
  { id: 'child_5_12', label: 'Child (5–12 yrs)', desc: 'Pediatric PALS thresholds' },
  { id: 'child_1_5y', label: 'Child (1–5 yrs)', desc: 'WHO IMCI toddler thresholds' },
  { id: 'infant_2_12mo', label: 'Infant (2–12 mo)', desc: 'WHO IMCI infant thresholds' },
  { id: 'infant_under_2mo', label: 'Young Infant (<2 mo)', desc: 'WHO IMCI neonatal thresholds' },
]


export const PROGRAMME_CONTEXTS = [
  { id: 'general', label: 'General Community Health', icon: '🩺' },
  { id: 'tb', label: 'Tuberculosis (TB) Screening', icon: '🫁' },
  { id: 'maternal', label: 'Maternal Health / ANC', icon: '🤰' },
  { id: 'paediatric', label: 'IMCI Paediatric Screening', icon: '👶' },
  { id: 'post_covid', label: 'Post-COVID / Respiratory Follow-up', icon: '😷' },
]


/**
 * Evaluate vitals against age-banded and pregnancy-aware clinical guidelines.
 * 
 * @param {object} params
 *   { hr, br, stress, ageGroup, isPregnant, programmeContext }
 * @returns {{ tier: 'RED'|'ORANGE'|'YELLOW'|'GREEN', title: string, recommendation: string, reasons: string[], respiratoryDistress: boolean }}
 */
export function evaluateAlertScale({
  hr,
  br,
  stress = 20,
  ageGroup = 'adult',
  isPregnant = false,
  programmeContext = 'general',
}) {
  const reasons = []
  let respiratoryDistress = false

  // 1. Threshold mapping by age group
  let hrRedHigh = 150
  let hrRedLow = 40
  let hrOrangeHigh = 120
  let hrOrangeLow = 50
  let hrYellowHigh = 100
  let hrYellowLow = 60

  let brDanger = 24
  let brYellow = 20

  if (ageGroup === 'infant_under_2mo') {
    hrRedHigh = 190
    hrRedLow = 90
    hrOrangeHigh = 180
    hrOrangeLow = 95
    hrYellowHigh = 160
    hrYellowLow = 100
    brDanger = 60
    brYellow = 55
  } else if (ageGroup === 'infant_2_12mo') {
    hrRedHigh = 180
    hrRedLow = 80
    hrOrangeHigh = 170
    hrOrangeLow = 90
    hrYellowHigh = 150
    hrYellowLow = 95
    brDanger = 50
    brYellow = 45
  } else if (ageGroup === 'child_1_5y') {
    hrRedHigh = 160
    hrRedLow = 70
    hrOrangeHigh = 150
    hrOrangeLow = 75
    hrYellowHigh = 135
    hrYellowLow = 80
    brDanger = 40
    brYellow = 35
  } else if (ageGroup === 'child_5_12') {
    hrRedHigh = 145
    hrRedLow = 55
    hrOrangeHigh = 130
    hrOrangeLow = 60
    hrYellowHigh = 115
    hrYellowLow = 65
    brDanger = 30
    brYellow = 25
  }

  // 2. Adjustments for 3rd trimester pregnancy
  if (isPregnant && ageGroup === 'adult') {
    hrYellowHigh = 110 // Elevated baseline is normal in pregnancy
    hrYellowLow = 70
    brYellow = 22
  }

  // 3. Determine base tier
  let tier = 'GREEN'

  if (hr > hrRedHigh) {
    tier = 'RED'
    reasons.push(`Severe tachycardia (HR ${hr} bpm > ${hrRedHigh})`)
  } else if (hr < hrRedLow) {
    tier = 'RED'
    reasons.push(`Severe bradycardia (HR ${hr} bpm < ${hrRedLow})`)
  }

  if (tier !== 'RED') {
    if (hr > hrOrangeHigh || hr < hrOrangeLow || (br && br > brDanger)) {
      tier = 'ORANGE'
      if (hr > hrOrangeHigh) reasons.push(`High heart rate (HR ${hr} bpm)`)
      if (hr < hrOrangeLow) reasons.push(`Low heart rate (HR ${hr} bpm)`)
      if (br && br > brDanger) reasons.push(`Elevated breathing rate (${br} br/min)`)
    }
  }

  if (tier === 'GREEN') {
    if (hr > hrYellowHigh || hr < hrYellowLow || (br && br > brYellow) || stress >= 60) {
      tier = 'YELLOW'
      if (hr > hrYellowHigh) reasons.push(`Mild pulse elevation (${hr} bpm)`)
      if (hr < hrYellowLow) reasons.push(`Mildly low pulse (${hr} bpm)`)
      if (br && br > brYellow) reasons.push(`Slightly fast breathing (${br} br/min)`)
      if (stress >= 60) reasons.push(`High pulse variability stress index (${stress}/100)`)
    }
  }

  // 4. Sepsis-3 / Respiratory Distress combination check
  const isAdultCombination = ageGroup === 'adult' && hr > 90 && br && br > 22
  const isPedsCombination = ageGroup !== 'adult' && br && br > brDanger && hr > hrOrangeHigh

  if (isAdultCombination || isPedsCombination || (br && br > 25 && hr > 100)) {
    respiratoryDistress = true
    reasons.push('Combined tachycardia and tachypnoea (Signs of Respiratory Distress)')

    // Upgrade tier
    if (tier === 'YELLOW') tier = 'ORANGE'
    else if (tier === 'GREEN') tier = 'YELLOW'
  }

  // 5. Programme context specific notes
  if (programmeContext === 'tb' && br && br > 22) {
    reasons.push('TB Programme Flag: Elevated respiration requires chronic respiratory assessment')
  } else if (programmeContext === 'maternal' && isPregnant && hr > 115) {
    reasons.push('Maternal ANC Flag: Monitor for preeclampsia or maternal dehydration')
  }

  // 6. Action recommendations by tier
  let title = 'Normal Resting Vitals'
  let recommendation = 'Vitals within expected physiological ranges for age. Re-screen during routine visit.'

  if (tier === 'YELLOW') {
    title = 'Level 1 Alert (Yellow) — Monitor'
    recommendation = 'Monitor patient. Keep patient rested and re-check scan in 10–15 minutes.'
  } else if (tier === 'ORANGE') {
    title = 'Level 2 Alert (Orange) — Same-Day Referral'
    recommendation = 'Refer patient to community health facility or supervisor today for clinical assessment.'
  } else if (tier === 'RED') {
    title = 'Level 3 Alert (Red) — Urgent Transfer'
    recommendation = 'URGENT: Initiate immediate transfer or supervisor escalation. Clinical danger sign detected.'
  }

  return {
    tier,
    title,
    recommendation,
    reasons,
    respiratoryDistress,
  }
}
