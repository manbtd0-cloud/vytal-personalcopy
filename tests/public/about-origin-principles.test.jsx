import { render, screen, within } from '@testing-library/react'
import { MemoryRouter } from 'react-router-dom'
import AboutPage from '../../src/public/pages/AboutPage.jsx'
import { aboutPrinciples } from '../../src/public/content/about.js'

const aboutMediaSlots = [
  'ABOUT-HERO-01',
  'ABOUT-ORIGIN-01',
  'ABOUT-TEAM-01',
  'ABOUT-TEAM-02',
  'ABOUT-RESEARCH-01',
]

test('About is a short origin experience with the approved product thesis', () => {
  const { container } = render(
    <MemoryRouter>
      <AboutPage />
    </MemoryRouter>,
  )

  expect(
    screen.getByRole('heading', {
      level: 1,
      name: /make sophisticated screening easier to reach—and harder to overclaim/i,
    }),
  ).toBeInTheDocument()

  expect(container.querySelector('[data-about-origin]')).toBeInTheDocument()
  expect(container.querySelector('[data-about-research]')).toBeInTheDocument()

  for (const slotId of aboutMediaSlots) {
    expect(container.querySelector(`[data-media-slot="${slotId}"]`)).toBeInTheDocument()
  }
})

test('About renders the four principles with deliberately unequal visual weights and no card grid', () => {
  expect(aboutPrinciples.map((principle) => principle.title)).toEqual([
    'Accessible',
    'Evidence-aware',
    'Honest about uncertainty',
    'Human-understandable',
  ])
  expect(new Set(aboutPrinciples.map((principle) => principle.weight)).size).toBeGreaterThan(1)

  const { container } = render(
    <MemoryRouter>
      <AboutPage />
    </MemoryRouter>,
  )

  const principles = container.querySelector('[data-about-principles]')
  expect(principles).toBeInTheDocument()
  expect(principles.querySelector('.about-principle-grid')).not.toBeInTheDocument()

  const rendered = Array.from(principles.querySelectorAll('[data-about-principle]'))
  expect(rendered).toHaveLength(aboutPrinciples.length)

  aboutPrinciples.forEach((principle, index) => {
    const item = rendered[index]
    expect(item).toHaveAttribute('data-about-principle', principle.id)
    expect(item).toHaveAttribute('data-weight', principle.weight)
    expect(within(item).getByRole('heading', { name: principle.title })).toBeInTheDocument()
    expect(within(item).getByText(principle.body)).toBeInTheDocument()
  })
})

test('About keeps team portrait positions empty until real assets exist', () => {
  const { container } = render(
    <MemoryRouter>
      <AboutPage />
    </MemoryRouter>,
  )

  const team = container.querySelector('[data-about-team]')
  expect(team).toBeInTheDocument()
  expect(within(team).getByText(/real team portraits only/i)).toBeInTheDocument()

  for (const slotId of ['ABOUT-TEAM-01', 'ABOUT-TEAM-02']) {
    const frame = team.querySelector(`[data-media-slot="${slotId}"]`)
    expect(frame).toBeInTheDocument()
    expect(frame).toHaveAttribute('data-media-status', 'placeholder')
  }

  expect(team.querySelector('blockquote')).not.toBeInTheDocument()
})
