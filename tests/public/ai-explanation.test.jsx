import { fireEvent, render, screen, within } from '@testing-library/react'
import { MemoryRouter } from 'react-router-dom'
import LandingPage from '../../src/public/pages/LandingPage.jsx'

test('AI section keeps measurements primary and explanation secondary', () => {
  render(
    <MemoryRouter>
      <LandingPage />
    </MemoryRouter>,
  )

  const heading = screen.getByRole('heading', { name: /measurements first\. explanation second/i })
  expect(heading).toBeInTheDocument()

  const legacyAiSection = heading.closest('section')
  expect(legacyAiSection).not.toBeNull()
  const aiQueries = within(legacyAiSection)

  expect(aiQueries.getByText(/ai explains the measurements\. it doesn’t invent them/i)).toBeInTheDocument()
  expect(aiQueries.getByRole('tabpanel', { name: 'Raw reading' })).toBeInTheDocument()

  fireEvent.click(aiQueries.getByRole('tab', { name: 'Explained' }))

  expect(aiQueries.getByRole('tab', { name: 'Explained' })).toHaveAttribute('aria-selected', 'true')
  expect(aiQueries.getByRole('tabpanel', { name: 'Explained' })).toBeInTheDocument()
  expect(aiQueries.getByText('EXAMPLE READING')).toBeInTheDocument()
})
