import { render, within } from '@testing-library/react'
import { MemoryRouter } from 'react-router-dom'
import { expect, test } from 'vitest'
import LandingPage from '../../src/public/pages/LandingPage.jsx'

test('Home follows access with a coral verified-proof field and sourced science lineage', () => {
  const { container } = render(
    <MemoryRouter>
      <LandingPage />
    </MemoryRouter>,
  )

  const proof = container.querySelector('[data-home-chapter="proof"]')
  const science = container.querySelector('[data-home-chapter="science-lineage"]')

  expect(proof).toBeInTheDocument()
  expect(proof).toHaveAttribute('data-public-theme', 'coral')
  expect(proof.querySelector('[data-media-slot="HOME-ACCESS-MAP-01"]')).toBeInTheDocument()
  expect(proof.querySelector('[data-signal-thread]')).toBeInTheDocument()

  const proofQueries = within(proof)
  expect(proofQueries.getByText(/designed for reach — not a deployment map/i)).toBeInTheDocument()
  expect(proofQueries.getByText(/supported explanation languages/i)).toBeInTheDocument()
  expect(proofQueries.getByText(/core physiological screening categories/i)).toBeInTheDocument()
  expect(proofQueries.getByText(/quality factors/i)).toBeInTheDocument()

  expect(science).toBeInTheDocument()
  expect(science.querySelector('[data-media-slot="HOME-SCIENCE-DIAGRAM-01"]')).toBeInTheDocument()
  expect(science.querySelector('[data-signal-thread]')).toHaveAttribute('data-signal-variant', 'timeline')

  const scienceQueries = within(science)
  expect(scienceQueries.getByText('2008')).toBeInTheDocument()
  expect(scienceQueries.getByText('2019')).toBeInTheDocument()
  expect(scienceQueries.getByText('2026')).toBeInTheDocument()
  expect(scienceQueries.getByRole('link', { name: /explore the science/i })).toHaveAttribute('href', '/science')
})
