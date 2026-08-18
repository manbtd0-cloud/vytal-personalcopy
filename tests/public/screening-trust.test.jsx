import { render, screen } from '@testing-library/react'
import { MemoryRouter } from 'react-router-dom'
import LandingPage from '../../src/public/pages/LandingPage.jsx'

test('home separates screening ambition from confidence and uncertainty', () => {
  render(
    <MemoryRouter>
      <LandingPage />
    </MemoryRouter>,
  )

  expect(
    screen.getByRole('heading', { name: /one camera\. more than one kind of signal/i }),
  ).toBeInTheDocument()
  expect(screen.getByRole('heading', { name: 'Heart rate' })).toBeInTheDocument()
  expect(screen.getAllByText('Core').length).toBeGreaterThan(0)
  expect(screen.getAllByText('Research proxy').length).toBeGreaterThan(0)
  expect(screen.getAllByText('Experimental').length).toBeGreaterThan(0)
  expect(screen.getByRole('link', { name: /explore all screenings/i })).toHaveAttribute('href', '/screenings')

  expect(
    screen.getByRole('heading', { name: /designed to know when not to trust a reading/i }),
  ).toBeInTheDocument()
  expect(screen.getByRole('heading', { name: 'Motion' })).toBeInTheDocument()
  expect(screen.getByRole('heading', { name: 'Lighting' })).toBeInTheDocument()
  expect(screen.getByRole('heading', { name: 'Signal quality' })).toBeInTheDocument()
  expect(screen.getByRole('heading', { name: 'Confidence' })).toBeInTheDocument()
})
