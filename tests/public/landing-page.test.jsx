import { render, screen, within } from '@testing-library/react'
import { MemoryRouter } from 'react-router-dom'
import LandingPage from '../../src/public/pages/LandingPage.jsx'

test('landing hero keeps intrigue first and moves explanation into the scroll narrative', () => {
  const { container } = render(
    <MemoryRouter>
      <LandingPage />
    </MemoryRouter>,
  )

  const hero = container.querySelector('[data-home-chapter="hero"]')
  expect(hero).not.toBeNull()

  const heroQueries = within(hero)
  expect(heroQueries.getByRole('heading', { level: 1, name: /there’s more here than you can see/i })).toBeInTheDocument()
  expect(heroQueries.getByText(/your camera sees it/i)).toBeInTheDocument()
  expect(heroQueries.getByRole('link', { name: /scroll to reveal/i })).toHaveAttribute('href', '#access-thesis')
})
