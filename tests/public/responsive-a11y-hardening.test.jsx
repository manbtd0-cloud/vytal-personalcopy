import { fireEvent, render, screen, within } from '@testing-library/react'
import { readFileSync } from 'node:fs'
import { MemoryRouter } from 'react-router-dom'
import PublicNav from '../../src/public/components/PublicNav.jsx'
import LoopBand from '../../src/public/components/system/LoopBand.jsx'

test('mobile menu focus trap includes the visible close control and restores focus on Escape', () => {
  const previousOverflow = document.body.style.overflow

  render(
    <MemoryRouter>
      <PublicNav theme="dark" />
    </MemoryRouter>,
  )

  const menuButton = screen.getByRole('button', { name: /^menu$/i })
  fireEvent.click(menuButton)

  const closeButton = screen.getByRole('button', { name: /close menu/i })
  const mobileNav = screen.getByRole('navigation', { name: /public mobile/i })
  const firstMenuLink = within(mobileNav).getAllByRole('link')[0]

  expect(firstMenuLink).toHaveFocus()
  expect(document.body.style.overflow).toBe('hidden')

  fireEvent.keyDown(document, { key: 'Tab', shiftKey: true })
  expect(closeButton).toHaveFocus()

  fireEvent.keyDown(document, { key: 'Tab' })
  expect(firstMenuLink).toHaveFocus()

  fireEvent.keyDown(document, { key: 'Escape' })
  expect(screen.queryByRole('navigation', { name: /public mobile/i })).not.toBeInTheDocument()
  expect(menuButton).toHaveFocus()
  expect(document.body.style.overflow).toBe(previousOverflow)
})

test('public shell clips accidental page-level horizontal overflow', () => {
  const css = readFileSync(
    new URL('../../src/public/styles/public-layout.css', import.meta.url),
    'utf8',
  )

  const publicSiteRule = css.match(/\.public-site\s*\{[^}]*\}/)?.[0] ?? ''
  expect(publicSiteRule).toMatch(/overflow-x:\s*clip\s*;/)
})

test('LoopBand becomes one static visual segment when reduced motion is requested', () => {
  const originalMatchMedia = window.matchMedia
  window.matchMedia = vi.fn((query) => ({
    matches: query === '(prefers-reduced-motion: reduce)',
    media: query,
    onchange: null,
    addEventListener: vi.fn(),
    removeEventListener: vi.fn(),
    addListener: vi.fn(),
    removeListener: vi.fn(),
    dispatchEvent: () => false,
  }))

  const { container, unmount } = render(
    <LoopBand items={['Heart rate', 'Breathing']} ariaLabel="Signals" />,
  )

  expect(container.querySelector('[data-loop-band]')).toHaveClass('is-static')
  expect(container.querySelectorAll('[data-loop-segment]')).toHaveLength(1)

  unmount()
  window.matchMedia = originalMatchMedia
})
