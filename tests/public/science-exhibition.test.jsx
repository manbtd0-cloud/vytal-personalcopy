import { render, screen, within } from '@testing-library/react'
import { MemoryRouter } from 'react-router-dom'
import SciencePage from '../../src/public/pages/SciencePage.jsx'
import { scienceMilestones } from '../../src/public/content/science.js'

const milestoneMediaSlots = [
  'SCI-2008-01',
  'SCI-2010-01',
  'SCI-2013-01',
  'SCI-2016-01',
  'SCI-2017-01',
  'SCI-2019-01',
  'SCI-VYTAL-01',
]

test('Science renders the complete sourced rPPG lineage as an irregular timeline', () => {
  const { container } = render(
    <MemoryRouter>
      <SciencePage />
    </MemoryRouter>,
  )

  expect(
    screen.getByRole('heading', { level: 1, name: /measurement problem is not/i }),
  ).toBeInTheDocument()

  const timeline = container.querySelector('[data-science-timeline]')
  expect(timeline).toBeInTheDocument()

  const renderedMilestones = Array.from(timeline.querySelectorAll('[data-science-milestone]'))
  expect(renderedMilestones.map((node) => node.getAttribute('data-science-milestone'))).toEqual(
    scienceMilestones.map((milestone) => milestone.id),
  )

  scienceMilestones.forEach((milestone, index) => {
    const item = renderedMilestones[index]
    const queries = within(item)
    expect(queries.getByText(String(milestone.year))).toBeInTheDocument()
    expect(queries.getByRole('heading', { name: milestone.title })).toBeInTheDocument()
    expect(queries.getByText(milestone.authors)).toBeInTheDocument()
    expect(queries.getByText(milestone.note)).toBeInTheDocument()

    if (milestone.sourceUrl) {
      expect(queries.getByRole('link', { name: new RegExp(milestone.sourceLabel, 'i') })).toHaveAttribute(
        'href',
        milestone.sourceUrl,
      )
    } else {
      expect(queries.getByText(/not a peer-reviewed research publication/i)).toBeInTheDocument()
    }

    expect(item.querySelector(`[data-media-slot="${milestoneMediaSlots[index]}"]`)).toBeInTheDocument()
  })
})

test('Science separates implementation mechanics, failure conditions and validation status', () => {
  const { container } = render(
    <MemoryRouter>
      <SciencePage />
    </MemoryRouter>,
  )

  const implementation = container.querySelector('[data-science-chapter="implementation"]')
  expect(implementation).toBeInTheDocument()
  expect(implementation.querySelector('[data-media-slot="SCI-HERO-DIAGRAM-01"]')).toBeInTheDocument()
  expect(within(implementation).getByText(/camera frames → roi → color signal → filtering → beat timing → context/i)).toBeInTheDocument()

  const failure = container.querySelector('[data-science-chapter="failure-conditions"]')
  expect(failure).toBeInTheDocument()
  expect(failure.querySelector('[data-media-slot="SCI-QUALITY-01"]')).toBeInTheDocument()
  for (const condition of ['Motion', 'Lighting', 'Face visibility', 'Compression', 'Camera auto-exposure', 'Insufficient clean signal']) {
    expect(within(failure).getByText(condition)).toBeInTheDocument()
  }

  const validation = container.querySelector('[data-science-chapter="validation"]')
  expect(validation).toBeInTheDocument()
  expect(validation.querySelector('[data-media-slot="SCI-VALIDATION-01"]')).toBeInTheDocument()
  expect(within(validation).getByText(/prototype/i)).toBeInTheDocument()
  expect(within(validation).getByText(/not a diagnostic medical device/i)).toBeInTheDocument()
})

test('Science ends with the primary-source library and an explicit medical boundary', () => {
  const { container } = render(
    <MemoryRouter>
      <SciencePage />
    </MemoryRouter>,
  )

  const library = container.querySelector('[data-science-chapter="research-library"]')
  expect(library).toBeInTheDocument()
  const links = within(library).getAllByRole('link')
  expect(links).toHaveLength(scienceMilestones.filter((milestone) => milestone.sourceUrl).length)

  const boundary = container.querySelector('[data-science-medical-boundary]')
  expect(boundary).toBeInTheDocument()
  expect(within(boundary).getByText(/screening support, not diagnosis/i)).toBeInTheDocument()
})
