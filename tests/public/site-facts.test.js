import { describe, expect, it } from 'vitest'
import { SUPPORTED_LANGUAGES } from '../../src/lib/ai.js'
import { screenings } from '../../src/public/content/screenings.js'
import { getSiteFacts } from '../../src/public/content/siteFacts.js'

describe('public site facts', () => {
  it('derives public numbers from canonical content instead of duplicate marketing literals', () => {
    const facts = getSiteFacts()
    expect(facts.languageCount).toBe(SUPPORTED_LANGUAGES.length)
    expect(facts.coreScreeningCount).toBe(screenings.filter((item) => item.status === 'Core').length)
    expect(facts.qualityFactorCount).toBe(4)
  })
})
