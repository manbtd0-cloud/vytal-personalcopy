import { render, within } from '@testing-library/react'
import { MemoryRouter } from 'react-router-dom'
import LandingPage from '../../src/public/pages/LandingPage.jsx'
import * as homeReferenceContent from '../../src/public/content/homeReference.js'

const { homePlatformArcItems, homeConcreteValueItems } = homeReferenceContent

const platformSlots = [
  'HOME-ARC-CAMERA-01',
  'HOME-ARC-CONFIDENCE-01',
  'HOME-ARC-CONTEXT-01',
  'HOME-ARC-FUTURE-01',
]

test('Home platform arc separates current camera foundation from future sensing directions', () => {
  expect(homePlatformArcItems.map((item) => item.title)).toEqual([
    'CAMERA FIRST',
    'CONFIDENCE AWARE',
    'CONTEXT OVER TIME',
    'BEYOND CAMERA',
  ])
  expect(homePlatformArcItems.at(-1).status).toBe('Research / future direction')

  const { container } = render(
    <MemoryRouter>
      <LandingPage />
    </MemoryRouter>,
  )

  const chapter = container.querySelector('[data-home-chapter="platform-arc"]')
  expect(chapter).toBeInTheDocument()
  const queries = within(chapter)

  for (const item of homePlatformArcItems) {
    expect(queries.getByRole('heading', { name: item.title })).toBeInTheDocument()
  }

  for (const slotId of platformSlots) {
    expect(chapter.querySelector(`[data-media-slot="${slotId}"]`)).toBeInTheDocument()
  }

  expect(queries.getByText('Research / future direction')).toBeInTheDocument()
  expect(queries.getByRole('link', { name: /explore the platform/i })).toHaveAttribute('href', '/platform')
})

test('Home concrete value translates the system into five non-statistical outcomes', () => {
  expect(homeConcreteValueItems.map((item) => item.title)).toEqual([
    'Scan',
    'Result',
    'Explanation',
    'History',
    'Handoff',
  ])

  const { container } = render(
    <MemoryRouter>
      <LandingPage />
    </MemoryRouter>,
  )

  const chapter = container.querySelector('[data-home-chapter="concrete-value"]')
  expect(chapter).toBeInTheDocument()
  expect(chapter.querySelectorAll('[data-value-unit]')).toHaveLength(5)

  const queries = within(chapter)
  for (const item of homeConcreteValueItems) {
    expect(queries.getByRole('heading', { name: item.title })).toBeInTheDocument()
    expect(queries.getByText(item.body)).toBeInTheDocument()
  }
})

test('Home final entry resolves the signal into product entry and ends the narrative', () => {
  const { container } = render(
    <MemoryRouter>
      <LandingPage />
    </MemoryRouter>,
  )

  const chapter = container.querySelector('[data-home-chapter="final-entry"]')
  expect(chapter).toBeInTheDocument()
  const queries = within(chapter)

  expect(queries.getByRole('heading', { name: /see what your camera can tell you/i })).toBeInTheDocument()
  expect(queries.getByRole('link', { name: /start screening/i })).toHaveAttribute('href', '/scan')
  expect(queries.getByRole('link', { name: /explore screenings/i })).toHaveAttribute('href', '/screenings')
  expect(queries.getByText(/screening support, not diagnosis/i)).toBeInTheDocument()
  expect(chapter.querySelector('[data-signal-variant="trusted"]')).toBeInTheDocument()
})
