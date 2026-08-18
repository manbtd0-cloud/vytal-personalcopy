import { render, screen } from '@testing-library/react'

function Smoke() {
  return <main>Vytal public-site test harness</main>
}

test('vitest and testing-library are configured', () => {
  render(<Smoke />)
  expect(screen.getByText('Vytal public-site test harness')).toBeInTheDocument()
})
