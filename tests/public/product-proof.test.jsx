import { render, screen } from '@testing-library/react'
import { MemoryRouter } from 'react-router-dom'
import LandingPage from '../../src/public/pages/LandingPage.jsx'

test('home shows a real Vytal-style product flow', () => {
  render(
    <MemoryRouter>
      <LandingPage />
    </MemoryRouter>,
  )

  expect(
    screen.getByRole('heading', { name: /a real screening flow, not just a research diagram/i }),
  ).toBeInTheDocument()
  expect(screen.getByText('Acquisition')).toBeInTheDocument()
  expect(screen.getByText('Signal Quality')).toBeInTheDocument()
  expect(screen.getByText('Result Explained')).toBeInTheDocument()
})
