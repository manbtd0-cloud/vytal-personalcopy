import { render, screen, within } from '@testing-library/react'
import { MemoryRouter } from 'react-router-dom'
import SciencePage from '../../src/public/pages/SciencePage.jsx'
import { screeningGroups } from '../../src/public/content/screenings.js'

const researchGroup = screeningGroups.find((group) => group.title === 'Optical / algorithmic screening research')
const branchSlots = Array.from(
  { length: 6 },
  (_, index) => `SCI-RESEARCH-BRANCHES-${String(index + 1).padStart(2, '0')}`,
)

test('Science branches into all six canonical research screening directions without flattening maturity', () => {
  expect(researchGroup).toBeDefined()

  const { container } = render(
    <MemoryRouter>
      <SciencePage />
    </MemoryRouter>,
  )

  const chapter = container.querySelector('[data-science-chapter="research-branches"]')
  expect(chapter).toBeInTheDocument()

  const branches = Array.from(chapter.querySelectorAll('[data-science-research-branch]'))
  expect(branches).toHaveLength(researchGroup.items.length)

  researchGroup.items.forEach((item, index) => {
    const branch = branches[index]
    const queries = within(branch)

    expect(branch).toHaveAttribute('data-science-research-branch', item.slug)
    expect(queries.getByRole('heading', { name: item.title })).toBeInTheDocument()
    expect(queries.getByText(item.status)).toBeInTheDocument()
    expect(queries.getByText(item.limitation)).toBeInTheDocument()
    expect(branch.querySelector(`[data-media-slot="${branchSlots[index]}"]`)).toBeInTheDocument()
  })
})

test('Science states what Vytal does not claim using canonical limitation language', () => {
  const { container } = render(
    <MemoryRouter>
      <SciencePage />
    </MemoryRouter>,
  )

  const chapter = container.querySelector('[data-science-chapter="claim-boundaries"]')
  expect(chapter).toBeInTheDocument()
  const queries = within(chapter)

  expect(queries.getByRole('heading', { name: /what we do not claim/i })).toBeInTheDocument()

  for (const item of researchGroup.items) {
    expect(queries.getByText(item.limitation)).toBeInTheDocument()
  }
})
