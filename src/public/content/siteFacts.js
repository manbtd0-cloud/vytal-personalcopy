import { SUPPORTED_LANGUAGES } from '../../lib/ai.js'
import { screenings } from './screenings.js'

export const QUALITY_FACTORS = ['Motion', 'Lighting', 'Signal quality', 'Confidence']

export function getSiteFacts() {
  return {
    languageCount: SUPPORTED_LANGUAGES.length,
    coreScreeningCount: screenings.filter((item) => item.status === 'Core').length,
    qualityFactorCount: QUALITY_FACTORS.length,
  }
}
