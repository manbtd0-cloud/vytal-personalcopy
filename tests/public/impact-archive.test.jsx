import { fireEvent, render, screen, within } from '@testing-library/react'
import { MemoryRouter } from 'react-router-dom'
import ImpactPage from '../../src/public/pages/ImpactPage.jsx'
import { healthWorkerFlow, impactScenarios } from '../../src/public/content/impact.js'

const scenarioIds = [
  'individual-home',
  'community-health-worker',
  'low-connectivity',
  'multilingual-explanation',
  'longitudinal-follow-up',
  'referral-continuity',
]

test('Impact data keeps all six scenarios explicitly illustrative and structurally complete', () => {
  expect(impactScenarios.map((scenario) => scenario.id)).toEqual(scenarioIds)

  for (const scenario of impactScenarios) {
    expect(scenario.label).toBe('Illustrative scenario')
    expect(scenario.isIllustrative).toBe(true)
    expect(scenario.illustrative).toBe(true)
    expect(scenario.context).toEqual(expect.any(String))
    expect(scenario.friction).toEqual(expect.any(String))
    expect(scenario.workflow).toEqual(expect.any(String))
    expect(scenario.limitation).toEqual(expect.any(String))
    expect(scenario.mediaSlotIds).toHaveLength(3)
  }
})

test('Impact renders a nonuniform six-scenario archive using every canonical scenario media slot', () => {
  const { container } = render(
    <MemoryRouter>
      <ImpactPage />
    </MemoryRouter>,
  )

  expect(
    screen.getByRole('heading', { level: 1, name: /first signal should not depend on perfect access/i }),
  ).toBeInTheDocument()

  const archive = container.querySelector('[data-impact-archive]')
  expect(archive).toBeInTheDocument()
  expect(archive.querySelector('.impact-card-grid')).not.toBeInTheDocument()

  const scenarios = Array.from(archive.querySelectorAll('[data-impact-scenario]'))
  expect(scenarios.map((node) => node.getAttribute('data-impact-scenario'))).toEqual(scenarioIds)
  expect(within(archive).getAllByText('Illustrative scenario')).toHaveLength(impactScenarios.length)

  impactScenarios.forEach((scenario, index) => {
    const item = scenarios[index]
    const queries = within(item)
    expect(queries.getByRole('heading', { name: scenario.title })).toBeInTheDocument()

    for (const slotId of scenario.mediaSlotIds) {
      expect(item.querySelector(`[data-media-slot="${slotId}"]`)).toBeInTheDocument()
    }
  })
})

test('Impact uses one same-page accessible story overlay rather than story routes', () => {
  const { container } = render(
    <MemoryRouter>
      <ImpactPage />
    </MemoryRouter>,
  )

  const archive = container.querySelector('[data-impact-archive]')
  fireEvent.click(within(archive).getByRole('button', { name: /open individual at home/i }))

  const dialog = screen.getByRole('dialog')
  expect(dialog).toBeInTheDocument()
  expect(within(dialog).getByText('Illustrative scenario')).toBeInTheDocument()
  expect(within(dialog).getByRole('button', { name: /close story/i })).toBeInTheDocument()
  expect(container.querySelectorAll('[role="dialog"]')).toHaveLength(1)
  expect(container.querySelector('a[href^="/impact/story/"]')).not.toBeInTheDocument()
})

test('Impact closes the archive with access principles, health-worker flow and product entry', () => {
  const { container } = render(
    <MemoryRouter>
      <ImpactPage />
    </MemoryRouter>,
  )

  const thesis = container.querySelector('[data-impact-access-thesis]')
  expect(thesis).toBeInTheDocument()
  expect(within(thesis).getByRole('heading', { name: /built for where access is imperfect/i })).toBeInTheDocument()

  const workflow = container.querySelector('[data-impact-workflow-band]')
  expect(workflow).toBeInTheDocument()
  for (const step of healthWorkerFlow) {
    expect(within(workflow).getByText(step)).toBeInTheDocument()
  }

  expect(screen.getByRole('link', { name: /start screening/i })).toHaveAttribute('href', '/scan')
  expect(screen.getByRole('link', { name: /follow an illustrative journey/i })).toHaveAttribute('href', '/journey')
})
