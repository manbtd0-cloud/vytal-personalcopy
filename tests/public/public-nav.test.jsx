import { render, screen } from '@testing-library/react'
import { MemoryRouter } from 'react-router-dom'
import PublicNav from '../../src/public/components/PublicNav.jsx'

test('public nav exposes core links and scan CTA', () => {
  render(
    <MemoryRouter>
      <PublicNav />
    </MemoryRouter>,
  )

  expect(screen.getByRole('link', { name: /screenings/i })).toHaveAttribute('href', '/screenings')
  expect(screen.getByRole('link', { name: /science/i })).toHaveAttribute('href', '/science')
  expect(screen.getByRole('link', { name: /impact/i })).toHaveAttribute('href', '/impact')
  expect(screen.getByRole('link', { name: /about/i })).toHaveAttribute('href', '/about')
  expect(screen.getByRole('link', { name: /start screening/i })).toHaveAttribute('href', '/scan')
})
