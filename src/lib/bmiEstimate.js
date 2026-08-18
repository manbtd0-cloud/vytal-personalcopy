/**
 * Malnutrition Screening & Anthropometric BMI Estimation from Photo
 * Reference: WHO Child Growth Standards & MUAC / Anthropometric computer vision proxies
 */

/**
 * Estimate Body Mass Index (BMI) and malnutrition category from body framing proportions.
 * 
 * @param {number} shoulderToHeightRatio - Ratio of shoulder width to total frame height
 * @param {number} heightCm - Patient reported or estimated height in cm (default 165)
 * @returns {{ bmi: number, category: string, tier: 'RED'|'ORANGE'|'GREEN', recommendation: string }}
 */
export function estimateMalnutritionBMI(shoulderToHeightRatio = 0.24, heightCm = 165) {
  // Typical adult shoulder-to-height ratio ~0.23-0.28
  // Lower ratios (<0.20) indicate severe wasting / low muscle mass
  let baseBmi = 14 + (shoulderToHeightRatio / 0.25) * 7.5
  baseBmi = Math.round(baseBmi * 10) / 10

  const bmi = Math.max(12.0, Math.min(40.0, baseBmi))

  let category = 'Normal Weight'
  let tier = 'GREEN'
  let recommendation = 'Body anthropometrics indicate normal nutritional status.'

  if (bmi < 16.0) {
    category = 'Severe Acute Malnutrition (SAM)'
    tier = 'RED'
    recommendation = 'URGENT REFERRAL: SAM detected (BMI < 16). Immediate therapeutic feeding protocol indicated.'
  } else if (bmi < 18.5) {
    category = 'Moderate Malnutrition (MAM)'
    tier = 'ORANGE'
    recommendation = 'SAME-DAY REFERRAL: Moderate wasting detected (BMI 16–18.5). Supplementary nutrition required.'
  } else if (bmi > 30.0) {
    category = 'Obesity'
    tier = 'YELLOW'
    recommendation = 'Lifestyle counseling and metabolic screening recommended.'
  }

  return {
    bmi,
    category,
    tier,
    recommendation,
  }
}
