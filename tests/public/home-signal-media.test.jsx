import { render, within } from '@testing-library/react'
import { MemoryRouter } from 'react-router-dom'
import LandingPage from '../../src/public/pages/LandingPage.jsx'
import { homeScreeningTiles } from '../../src/public/content/screenings.js'
import { homeSignalBandItems } from '../../src/public/content/homeReference.js'

const documentarySlots = Array.from(
  { length: 10 },
  (_, index) => `HOME-MEDIA-${String(index + 1).padStart(2, '0')}`,
)

test('Home signal band is derived from canonical screening titles and keeps maturity visible', () => {
  expect(homeSignalBandItems).toEqual(
    homeScreeningTiles.map(({ slug, title, status }) => ({
      id: slug,
      label: title,
      status,
      isResearch: status !== 'Core',
    })),
  )

  const { container } = render(
    <MemoryRouter>
      <LandingPage />
    </MemoryRouter>,
  )

  const chapter = container.querySelector('[data-home-chapter="signal-band"]')
  expect(chapter).toBeInTheDocument()
  expect(chapter.querySelector('[data-loop-band]')).toBeInTheDocument()

  const hiddenList = chapter.querySelector('.visually-hidden-list')
  expect(hiddenList).toBeInTheDocument()

  for (const item of homeSignalBandItems) {
    const label = within(hiddenList).getByText(item.label)
    const row = label.closest('li')
    expect(row).not.toBeNull()
    expect(within(row).getByText(item.status)).toBeInTheDocument()
  }
})

test('Home documentary run renders all ten canonical media positions in fixed source order', () => {
  const { container } = render(
    <MemoryRouter>
      <LandingPage />
    </MemoryRouter>,
  )

  const chapter = container.querySelector('[data-home-chapter="documentary-run"]')
  expect(chapter).toBeInTheDocument()

  const renderedSlots = Array.from(chapter.querySelectorAll('[data-media-slot]')).map((frame) =>
    frame.getAttribute('data-media-slot'),
  )

  expect(renderedSlots).toEqual(documentarySlots)
  expect(chapter.querySelectorAll('.ref-documentary-run__frame')).toHaveLength(10)
})
