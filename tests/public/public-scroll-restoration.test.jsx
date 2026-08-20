import { fireEvent, render, screen } from '@testing-library/react'
import { Link, MemoryRouter, Route, Routes } from 'react-router-dom'
import PublicLayout from '../../src/public/PublicLayout.jsx'

function AlphaPage() {
  return (
    <section>
      <h1>Alpha public page</h1>
      <Link to="/beta">Go to Beta</Link>
    </section>
  )
}

function BetaPage() {
  return (
    <section>
      <h1>Beta public page</h1>
      <Link to="/beta#details">Same pathname detail</Link>
    </section>
  )
}

function renderPublicRoutes() {
  return render(
    <MemoryRouter initialEntries={['/alpha']}>
      <Routes>
        <Route element={<PublicLayout />}>
          <Route path="alpha" element={<AlphaPage />} />
          <Route path="beta" element={<BetaPage />} />
        </Route>
      </Routes>
    </MemoryRouter>,
  )
}

test('public layout restores the top on initial entry and pathname changes only', () => {
  const scrollTo = vi.fn()
  Object.defineProperty(window, 'scrollTo', {
    configurable: true,
    writable: true,
    value: scrollTo,
  })

  const { container } = renderPublicRoutes()

  expect(scrollTo).toHaveBeenCalledTimes(1)
  expect(scrollTo).toHaveBeenLastCalledWith(0, 0)
  expect(container.querySelector('[data-public-route-transition]')).not.toBeInTheDocument()

  fireEvent.click(screen.getByRole('link', { name: /go to beta/i }))
  expect(screen.getByRole('heading', { level: 1, name: /beta public page/i })).toBeInTheDocument()
  expect(scrollTo).toHaveBeenCalledTimes(2)
  expect(scrollTo).toHaveBeenLastCalledWith(0, 0)

  fireEvent.click(screen.getByRole('link', { name: /same pathname detail/i }))
  expect(scrollTo).toHaveBeenCalledTimes(2)
})
