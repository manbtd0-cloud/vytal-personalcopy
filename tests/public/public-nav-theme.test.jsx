import { fireEvent, render, screen, within } from '@testing-library/react'
import { MemoryRouter } from 'react-router-dom'
import { expect, it } from 'vitest'
import PublicNav from '../../src/public/components/PublicNav.jsx'
import SectionThemeBoundary from '../../src/public/components/system/SectionThemeBoundary.jsx'

it('exposes semantic section themes and lets the editorial nav switch treatment', () => {
  const { container } = render(
    <MemoryRouter>
      <SectionThemeBoundary theme="light" id="trust-reset">
        <p>Trust chapter</p>
      </SectionThemeBoundary>
      <PublicNav theme="light" />
    </MemoryRouter>,
  )

  expect(container.querySelector('#trust-reset')).toHaveAttribute('data-public-theme', 'light')
  expect(container.querySelector('[data-public-nav]')).toHaveAttribute('data-nav-theme', 'light')
})

it('opens a full public mobile menu and exposes an explicit close path', () => {
  render(
    <MemoryRouter>
      <PublicNav theme="dark" />
    </MemoryRouter>,
  )

  const button = screen.getByRole('button', { name: /menu/i })
  fireEvent.click(button)

  expect(button).toHaveAttribute('aria-expanded', 'true')
  const mobileNav = screen.getByRole('navigation', { name: /public mobile/i })
  expect(mobileNav).toBeInTheDocument()
  expect(within(mobileNav).getByRole('link', { name: /start screening/i })).toHaveAttribute('href', '/scan')
})
