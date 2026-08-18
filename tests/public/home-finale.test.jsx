import { render, screen, within } from '@testing-library/react'
import { MemoryRouter } from 'react-router-dom'
import LandingPage from '../../src/public/pages/LandingPage.jsx'

test('home closes with clearly labelled future direction and product entry', () => {
  render(
    <MemoryRouter>
      <LandingPage />
    </MemoryRouter>,
  )

  expect(
    screen.getByRole('heading', { name: /the camera is the beginning, not the boundary/i }),
  ).toBeInTheDocument()
  expect(screen.getByText(/research & future direction/i)).toBeInTheDocument()
  expect(screen.getByText('BLE devices')).toBeInTheDocument()
  expect(screen.getByText('Wearables')).toBeInTheDocument()
  expect(screen.getByText('Thermal sensing')).toBeInTheDocument()

  expect(
    screen.getByRole('heading', { name: /see what your camera can tell you/i }),
  ).toBeInTheDocument()

  const finalCta = screen.getByRole('region', { name: /final call to action/i })
  expect(within(finalCta).getByRole('link', { name: /start screening/i })).toHaveAttribute('href', '/scan')
  expect(within(finalCta).getByRole('link', { name: /explore screenings/i })).toHaveAttribute('href', '/screenings')
  expect(within(finalCta).getByText(/does not provide a medical diagnosis/i)).toBeInTheDocument()
})
