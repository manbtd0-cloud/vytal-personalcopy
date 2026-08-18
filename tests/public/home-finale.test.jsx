import { render, screen } from '@testing-library/react'
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
  expect(screen.getByRole('link', { name: /start screening/i })).toHaveAttribute('href', '/scan')
  expect(screen.getByRole('link', { name: /explore screenings/i })).toHaveAttribute('href', '/screenings')
  expect(screen.getByText(/does not provide a medical diagnosis/i)).toBeInTheDocument()
})
