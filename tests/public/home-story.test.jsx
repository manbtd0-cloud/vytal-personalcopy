import { render, screen } from '@testing-library/react'
import { MemoryRouter } from 'react-router-dom'
import LandingPage from '../../src/public/pages/LandingPage.jsx'

test('home explains camera physiology and the four-step screening process', () => {
  render(
    <MemoryRouter>
      <LandingPage />
    </MemoryRouter>,
  )

  expect(
    screen.getByRole('heading', { name: /a heartbeat changes the way light leaves your skin/i }),
  ).toBeInTheDocument()

  expect(screen.getByText(/remote photoplethysmography/i)).toBeInTheDocument()
  expect(screen.getByRole('heading', { name: 'Observe' })).toBeInTheDocument()
  expect(screen.getByRole('heading', { name: 'Extract' })).toBeInTheDocument()
  expect(screen.getByRole('heading', { name: 'Check' })).toBeInTheDocument()
  expect(screen.getByRole('heading', { name: 'Explain' })).toBeInTheDocument()
})
