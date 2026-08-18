import { render, screen, within } from '@testing-library/react'
import { MemoryRouter } from 'react-router-dom'
import PublicSite from '../../src/public/PublicSite.jsx'

test('/screenings separates capability maturity and limitations', () => {
  render(
    <MemoryRouter initialEntries={['/screenings']}>
      <PublicSite />
    </MemoryRouter>,
  )

  expect(
    screen.getByRole('heading', { level: 1, name: /what vytal is designed to screen/i }),
  ).toBeInTheDocument()

  expect(screen.getByRole('heading', { name: /core physiological/i })).toBeInTheDocument()
  expect(screen.getByRole('heading', { name: /optical \/ algorithmic screening research/i })).toBeInTheDocument()
  expect(screen.getByRole('heading', { name: /future sensing extensions/i })).toBeInTheDocument()

  const heartRate = screen.getByRole('article', { name: /heart rate screening/i })
  expect(within(heartRate).getByText('Core')).toBeInTheDocument()
  expect(within(heartRate).getByText(/camera motion, poor lighting and weak signal/i)).toBeInTheDocument()

  const oxygen = screen.getByRole('article', { name: /oxygen saturation proxy screening/i })
  expect(within(oxygen).getByText('Research proxy')).toBeInTheDocument()
  expect(within(oxygen).getByText(/validated pulse oximeter/i)).toBeInTheDocument()

  const rhythm = screen.getByRole('article', { name: /irregular rhythm screening/i })
  expect(within(rhythm).getByText('Experimental')).toBeInTheDocument()
  expect(within(rhythm).getByText(/ecg or clinical confirmation/i)).toBeInTheDocument()

  expect(screen.getByRole('link', { name: /start screening/i })).toHaveAttribute('href', '/scan')
})
