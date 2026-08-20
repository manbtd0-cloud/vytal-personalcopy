import { render, screen, within } from '@testing-library/react'
import { MemoryRouter } from 'react-router-dom'
import ScreeningsPage from '../../src/public/pages/ScreeningsPage.jsx'
import { screeningGroups, screenings } from '../../src/public/content/screenings.js'

const coreMediaSlots = ['SCR-HR-01', 'SCR-BR-01', 'SCR-HRV-01']

test('Screenings is a maturity-aware capability atlas rather than an equal-card catalogue', () => {
  const { container } = render(
    <MemoryRouter>
      <ScreeningsPage />
    </MemoryRouter>,
  )

  expect(
    screen.getByRole('heading', { level: 1, name: /what vytal is designed to screen/i }),
  ).toBeInTheDocument()

  const spine = container.querySelector('[data-screening-spine]')
  expect(spine).toBeInTheDocument()
  expect(container.querySelector('.screening-card-grid')).not.toBeInTheDocument()

  const renderedGroups = Array.from(spine.querySelectorAll('[data-screening-group]')).map((node) =>
    node.getAttribute('data-screening-group'),
  )
  expect(renderedGroups).toEqual(screeningGroups.map((group) => group.title))

  const renderedItems = spine.querySelectorAll('[data-screening-item]')
  expect(renderedItems).toHaveLength(screenings.length)

  expect(within(spine).getByText('Core physiological')).toBeInTheDocument()
  expect(within(spine).getAllByText('Research proxy').length).toBeGreaterThan(0)
  expect(within(spine).getAllByText('Experimental').length).toBeGreaterThan(0)
  expect(within(spine).getAllByText('Context / triage').length).toBeGreaterThan(0)
  expect(within(spine).getAllByText('Future integration').length).toBeGreaterThan(0)

  for (const slotId of coreMediaSlots) {
    expect(spine.querySelector(`[data-media-slot="${slotId}"]`)).toBeInTheDocument()
  }

  expect(within(spine).getByText(/not a replacement for a cuff/i)).toBeInTheDocument()
  expect(within(spine).getByText(/camera ppg is not an ecg/i)).toBeInTheDocument()
})

test('Screenings exposes a desktop atlas indicator and explicit truth/entry chapters', () => {
  const { container } = render(
    <MemoryRouter>
      <ScreeningsPage />
    </MemoryRouter>,
  )

  const tray = screen.getByRole('navigation', { name: /screening atlas sections/i })
  for (const group of screeningGroups) {
    expect(within(tray).getByRole('link', { name: group.title })).toHaveAttribute('href', expect.stringMatching(/^#screening-/))
  }

  const truth = container.querySelector('[data-screening-truth]')
  expect(truth).toBeInTheDocument()
  const truthQueries = within(truth)
  expect(truthQueries.getByText(/camera oxygen proxy/i)).toBeInTheDocument()
  expect(truthQueries.getByText(/rhythm screening/i)).toBeInTheDocument()
  expect(truthQueries.getByText(/not a cuff replacement/i)).toBeInTheDocument()
  expect(truthQueries.getByText(/future hardware/i)).toBeInTheDocument()

  expect(screen.getByRole('link', { name: /start screening/i })).toHaveAttribute('href', '/scan')
  expect(screen.getByRole('link', { name: /explore the science/i })).toHaveAttribute('href', '/science')
})
