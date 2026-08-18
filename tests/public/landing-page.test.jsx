import { render, screen, within } from '@testing-library/react'
import { MemoryRouter } from 'react-router-dom'
import LandingPage from '../../src/public/pages/LandingPage.jsx'

test('landing hero exposes clear product entry after the intrigue copy', () => {
  render(
    <MemoryRouter>
      <LandingPage />
    </MemoryRouter>,
  )

  const heading = screen.getByRole('heading', { level: 1, name: /there’s more here than you can see/i })
  expect(heading).toBeInTheDocument()

  const hero = heading.closest('section')
  expect(hero).not.toBeNull()
  const heroQueries = within(hero)

  expect(heroQueries.getByText(/your camera sees it/i)).toBeInTheDocument()
  expect(heroQueries.getByRole('link', { name: /start screening/i })).toHaveAttribute('href', '/scan')
  expect(heroQueries.getByRole('button', { name: /see how it works/i })).toBeInTheDocument()
  expect(heroQueries.getByText(/screening support, not diagnosis/i)).toBeInTheDocument()
})
