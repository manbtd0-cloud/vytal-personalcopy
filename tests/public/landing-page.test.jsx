import { render, screen } from '@testing-library/react'
import { MemoryRouter } from 'react-router-dom'
import LandingPage from '../../src/public/pages/LandingPage.jsx'

test('landing hero exposes clear product entry after the intrigue copy', () => {
  render(
    <MemoryRouter>
      <LandingPage />
    </MemoryRouter>,
  )

  expect(
    screen.getByRole('heading', { level: 1, name: /there’s more here than you can see/i }),
  ).toBeInTheDocument()

  expect(screen.getByText(/your camera sees it/i)).toBeInTheDocument()
  expect(screen.getByRole('link', { name: /start screening/i })).toHaveAttribute('href', '/scan')
  expect(screen.getByRole('button', { name: /see how it works/i })).toBeInTheDocument()
  expect(screen.getByText(/screening support, not diagnosis/i)).toBeInTheDocument()
})
