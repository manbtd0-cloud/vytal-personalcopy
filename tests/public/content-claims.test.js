import { expect, it } from 'vitest'
import { homeContent } from '../../src/public/content/home.js'
import { screenings } from '../../src/public/content/screenings.js'

const prohibited = [
  /medical[- ]grade/i,
  /replaces? (a |your )?doctor/i,
  /replaces? (a |your )?cuff/i,
  /replaces? (an |your )?ecg/i,
  /diagnoses? (you|patients|disease)/i,
  /used in \d+ countries/i,
  /trusted by \d+/i,
  /saves? lives/i,
]

it('does not contain unreviewed high-risk public claims', () => {
  const text = JSON.stringify({ homeContent, screenings })
  for (const pattern of prohibited) expect(text).not.toMatch(pattern)
})
