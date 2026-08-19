import { render, within } from '@testing-library/react'
import { MemoryRouter } from 'react-router-dom'
import LandingPage from '../../src/public/pages/LandingPage.jsx'
import { SUPPORTED_LANGUAGES } from '../../src/lib/ai.js'
import * as homeReferenceContent from '../../src/public/content/homeReference.js'

const { homeEvidenceItems, homeLanguageItems } = homeReferenceContent

test('Home trust reset makes retry an explicit valid outcome without a card grid', () => {
  const { container } = render(
    <MemoryRouter>
      <LandingPage />
    </MemoryRouter>,
  )

  const chapter = container.querySelector('[data-home-chapter="trust-reset"]')
  expect(chapter).toBeInTheDocument()
  expect(chapter).toHaveAttribute('data-public-theme', 'light')

  const queries = within(chapter)
  expect(queries.getByRole('heading', { name: /sometimes the right result is no result/i })).toBeInTheDocument()
  expect(queries.getByText(/movement → signal lost → retry/i)).toBeInTheDocument()
  expect(queries.getByText(/stable input → signal lock → screening context/i)).toBeInTheDocument()
  expect(chapter.querySelector('.public-card-grid')).not.toBeInTheDocument()
})

test('Home evidence reserves real voices instead of generating testimonials', () => {
  expect(homeEvidenceItems).toHaveLength(4)
  expect(homeEvidenceItems.map((item) => item.type)).toEqual([
    'pending-voice',
    'pending-voice',
    'research-note',
    'owned-principle',
  ])

  for (const item of homeEvidenceItems.filter((entry) => entry.type === 'pending-voice')) {
    expect(item.quote).toBeNull()
  }

  const { container } = render(
    <MemoryRouter>
      <LandingPage />
    </MemoryRouter>,
  )

  const chapter = container.querySelector('[data-home-chapter="evidence"]')
  expect(chapter).toBeInTheDocument()
  const queries = within(chapter)
  expect(queries.getByText(/clinician \/ researcher voice pending/i)).toBeInTheDocument()
  expect(queries.getByText(/health-worker voice pending/i)).toBeInTheDocument()
  expect(queries.getByText(/ai explains the measurements\. it doesn’t invent them/i)).toBeInTheDocument()
})

test('Home language band is derived exactly from supported languages and uses LoopBand', () => {
  expect(homeLanguageItems).toEqual(
    SUPPORTED_LANGUAGES.map(({ code, name, label }) => ({ code, name, label })),
  )

  const { container } = render(
    <MemoryRouter>
      <LandingPage />
    </MemoryRouter>,
  )

  const chapter = container.querySelector('[data-home-chapter="language-band"]')
  expect(chapter).toBeInTheDocument()
  expect(chapter.querySelector('[data-loop-band]')).toBeInTheDocument()

  const hiddenList = chapter.querySelector('.visually-hidden-list')
  expect(hiddenList).toBeInTheDocument()
  const queries = within(hiddenList)

  for (const language of SUPPORTED_LANGUAGES) {
    expect(queries.getByText(language.label)).toBeInTheDocument()
  }
})
