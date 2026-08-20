import { fireEvent, render, screen, within } from '@testing-library/react'
import { MemoryRouter } from 'react-router-dom'
import LandingPage from '../../src/public/pages/LandingPage.jsx'
import { impactScenarios } from '../../src/public/content/impact.js'

const journeySlots = [
  'HOME-JOURNEY-CAPTURE-01',
  'HOME-JOURNEY-EXTRACT-01',
  'HOME-JOURNEY-VERIFY-01',
  'HOME-JOURNEY-EXPLAIN-01',
]

test('Home turns the first three impact scenarios into nonuniform story previews with one shared overlay', () => {
  const { container } = render(
    <MemoryRouter>
      <LandingPage />
    </MemoryRouter>,
  )

  const chapter = container.querySelector('[data-home-chapter="context-stories"]')
  expect(chapter).toBeInTheDocument()

  for (const scenario of impactScenarios.slice(0, 3)) {
    expect(within(chapter).getByRole('heading', { name: scenario.title })).toBeInTheDocument()
  }

  expect(within(chapter).getAllByText(/illustrative scenario/i)).toHaveLength(3)

  fireEvent.click(within(chapter).getByRole('button', { name: /open individual at home/i }))
  const dialog = screen.getByRole('dialog')
  expect(dialog).toBeInTheDocument()
  expect(within(dialog).getByRole('heading', { name: /individual at home/i })).toBeInTheDocument()

  fireEvent.keyDown(document, { key: 'Escape' })
  expect(screen.queryByRole('dialog')).not.toBeInTheDocument()
})

test('Home signal journey exposes four distinct capture-to-explain beats with canonical media slots', () => {
  const { container } = render(
    <MemoryRouter>
      <LandingPage />
    </MemoryRouter>,
  )

  const chapter = container.querySelector('[data-home-chapter="signal-journey"]')
  expect(chapter).toBeInTheDocument()

  const beats = Array.from(chapter.querySelectorAll('[data-signal-beat]'))
  expect(beats.map((beat) => beat.getAttribute('data-signal-beat'))).toEqual([
    'capture',
    'extract',
    'verify',
    'explain',
  ])

  for (const slotId of journeySlots) {
    expect(chapter.querySelector(`[data-media-slot="${slotId}"]`)).toBeInTheDocument()
  }

  expect(within(chapter).getByRole('heading', { name: 'CAPTURE' })).toBeInTheDocument()
  expect(within(chapter).getByRole('heading', { name: 'EXTRACT' })).toBeInTheDocument()
  expect(within(chapter).getByRole('heading', { name: 'VERIFY' })).toBeInTheDocument()
  expect(within(chapter).getByRole('heading', { name: 'EXPLAIN' })).toBeInTheDocument()

  for (const qualityFactor of ['Motion', 'Lighting', 'Signal quality', 'Confidence']) {
    expect(within(chapter).getByText(qualityFactor)).toBeInTheDocument()
  }
})
