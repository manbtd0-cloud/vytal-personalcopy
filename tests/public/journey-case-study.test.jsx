import { render, screen, within } from '@testing-library/react'
import { MemoryRouter } from 'react-router-dom'
import JourneyPage from '../../src/public/pages/JourneyPage.jsx'
import { illustrativeJourney } from '../../src/public/content/journey.js'
import { getMediaSlotById } from '../../src/public/content/mediaSlots.js'
import { getSiteFacts, QUALITY_FACTORS } from '../../src/public/content/siteFacts.js'

const journeyMediaSlots = [
  'JRN-HERO-01',
  'JRN-CONTEXT-01',
  'JRN-FAIL-01',
  'JRN-LOCK-01',
  'JRN-RESULT-01',
  'JRN-EXPLAIN-01',
  'JRN-HISTORY-01',
  'JRN-TREND-01',
  'JRN-CLOSE-01',
]

test('Journey is explicitly illustrative and reserves every canonical production media position', () => {
  const { container } = render(
    <MemoryRouter>
      <JourneyPage />
    </MemoryRouter>,
  )

  expect(screen.getByText(/illustrative screening journey — not a real patient case/i)).toBeInTheDocument()
  expect(illustrativeJourney.label).toMatch(/not a real patient case/i)

  for (const slotId of journeyMediaSlots) {
    expect(getMediaSlotById(slotId)).not.toBeNull()
    expect(container.querySelector(`[data-media-slot="${slotId}"]`)).toBeInTheDocument()
  }
})

test('Journey refuses low-confidence input before any example result appears', () => {
  const { container } = render(
    <MemoryRouter>
      <JourneyPage />
    </MemoryRouter>,
  )

  const beats = Array.from(container.querySelectorAll('[data-journey-beat]'))
  const beatIds = beats.map((node) => node.getAttribute('data-journey-beat'))

  expect(beatIds).toEqual(illustrativeJourney.beats.map((beat) => beat.id))
  expect(beatIds.indexOf('low-confidence')).toBeLessThan(beatIds.indexOf('signal-lock'))
  expect(beatIds.indexOf('signal-lock')).toBeLessThan(beatIds.indexOf('example-result'))

  const lowConfidence = beats[beatIds.indexOf('low-confidence')]
  expect(within(lowConfidence).getByText(/reading withheld/i)).toBeInTheDocument()
  expect(within(lowConfidence).getByText(/retry/i)).toBeInTheDocument()

  const result = beats[beatIds.indexOf('example-result')]
  expect(within(result).getByText(/example \/ illustrative/i)).toBeInTheDocument()
  expect(within(result).getByText(/72 bpm/i)).toBeInTheDocument()

  const trend = beats[beatIds.indexOf('trend')]
  expect(within(trend).getByText(/example \/ illustrative/i)).toBeInTheDocument()
})

test('Journey closes with derived product facts and direct product entry', () => {
  const { container } = render(
    <MemoryRouter>
      <JourneyPage />
    </MemoryRouter>,
  )

  const facts = getSiteFacts()
  const proof = container.querySelector('[data-journey-product-facts]')
  expect(proof).toBeInTheDocument()
  expect(within(proof).getByText(new RegExp(`${facts.coreScreeningCount} core`, 'i'))).toBeInTheDocument()
  expect(within(proof).getByText(new RegExp(`${facts.languageCount} supported languages`, 'i'))).toBeInTheDocument()
  expect(within(proof).getByText(new RegExp(`${QUALITY_FACTORS.length} quality factors`, 'i'))).toBeInTheDocument()

  const close = container.querySelector('[data-journey-close]')
  expect(close).toBeInTheDocument()
  expect(within(close).getByRole('link', { name: /start screening/i })).toHaveAttribute('href', '/scan')
  expect(within(close).getByText(/screening support, not diagnosis/i)).toBeInTheDocument()
})
