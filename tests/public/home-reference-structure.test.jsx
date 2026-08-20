import { render, within } from '@testing-library/react'
import { MemoryRouter } from 'react-router-dom'
import { expect, test } from 'vitest'
import LandingPage from '../../src/public/pages/LandingPage.jsx'

test('reference Home opens with a cinematic sensing chapter and sparse access thesis', () => {
  const { container } = render(
    <MemoryRouter>
      <LandingPage />
    </MemoryRouter>,
  )

  const hero = container.querySelector('[data-home-chapter="hero"]')
  const access = container.querySelector('[data-home-chapter="access-thesis"]')

  expect(hero).toBeInTheDocument()
  expect(access).toBeInTheDocument()
  expect(hero.querySelector('[data-media-slot="HOME-HERO-01"]')).toBeInTheDocument()
  expect(hero.querySelector('[data-signal-thread]')).toHaveAttribute('data-signal-variant', 'raw')

  const heroQueries = within(hero)
  expect(heroQueries.getByRole('heading', { level: 1, name: /there’s more here than you can see/i })).toBeInTheDocument()
  expect(heroQueries.getByText(/your camera sees it/i)).toBeInTheDocument()
  expect(heroQueries.getByRole('link', { name: /scroll to reveal/i })).toHaveAttribute('href', '#access-thesis')

  const statement = within(access).getByRole('heading', { level: 2 })
  expect(statement).toHaveTextContent('A useful first health signal should not have to wait for perfect access.')
})
