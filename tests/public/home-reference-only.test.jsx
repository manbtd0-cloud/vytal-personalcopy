import { render } from '@testing-library/react'
import { MemoryRouter } from 'react-router-dom'
import LandingPage from '../../src/public/pages/LandingPage.jsx'

// Task 15 regression guard: the staged legacy Home must never be appended again.
const EXPECTED_CHAPTERS = [
  'hero',
  'access-thesis',
  'proof',
  'science-lineage',
  'context-stories',
  'signal-journey',
  'signal-band',
  'documentary-run',
  'trust-reset',
  'evidence',
  'language-band',
  'platform-arc',
  'concrete-value',
  'final-entry',
]

test('Home contains only the approved 14 reference-driven chapters', () => {
  const { container } = render(
    <MemoryRouter>
      <LandingPage />
    </MemoryRouter>,
  )

  const home = container.querySelector('.reference-home')
  expect(home).not.toBeNull()

  const directChildren = [...home.children]
  expect(directChildren).toHaveLength(EXPECTED_CHAPTERS.length)
  expect(directChildren.map((node) => node.getAttribute('data-home-chapter'))).toEqual(EXPECTED_CHAPTERS)
})
