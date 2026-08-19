import { render, screen, within } from '@testing-library/react'
import { MemoryRouter } from 'react-router-dom'
import LandingPage from '../../src/public/pages/LandingPage.jsx'

test('home connects individual readings to continuity, impact and science', () => {
  render(
    <MemoryRouter>
      <LandingPage />
    </MemoryRouter>,
  )

  expect(
    screen.getByRole('heading', { name: /a reading is a moment\. health is a pattern/i }),
  ).toBeInTheDocument()
  expect(screen.getByText('Illustrative trend')).toBeInTheDocument()

  expect(
    screen.getByRole('heading', { name: /built around the hardware people already have/i }),
  ).toBeInTheDocument()
  expect(screen.getByText(/screen → save → explain → refer/i)).toBeInTheDocument()
  expect(screen.getByRole('link', { name: /see the wider impact/i })).toHaveAttribute('href', '/impact')

  const legacyScienceHeading = screen.getByRole('heading', {
    name: /the interface is simple\. the measurement problem is not/i,
  })
  expect(legacyScienceHeading).toBeInTheDocument()

  const legacyScienceSection = legacyScienceHeading.closest('section')
  expect(legacyScienceSection).not.toBeNull()
  expect(within(legacyScienceSection).getByRole('link', { name: /explore the science/i })).toHaveAttribute(
    'href',
    '/science',
  )
})
