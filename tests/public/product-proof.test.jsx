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

  const acquisition = screen.getByRole('heading', { name: 'Acquisition' })
  expect(acquisition).toBeInTheDocument()
  expect(acquisition.closest('article')).toHaveStyle({ width: '560px', height: '420px' })

  expect(screen.getByRole('heading', { name: 'Signal Quality' })).toBeInTheDocument()
  expect(screen.getByRole('heading', { name: 'Result Explained' })).toBeInTheDocument()
})
