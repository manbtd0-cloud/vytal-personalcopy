import { fireEvent, render, screen } from '@testing-library/react'
import { MemoryRouter } from 'react-router-dom'
import LandingPage from '../../src/public/pages/LandingPage.jsx'

test('AI section keeps measurements primary and explanation secondary', () => {
  render(
    <MemoryRouter>
      <LandingPage />
    </MemoryRouter>,
  )

  expect(
    screen.getByRole('heading', { name: /measurements first\. explanation second/i }),
  ).toBeInTheDocument()
  expect(screen.getByText(/ai explains the measurements\. it doesn’t invent them/i)).toBeInTheDocument()
  expect(screen.getByRole('tabpanel', { name: 'Raw reading' })).toBeInTheDocument()

  fireEvent.click(screen.getByRole('tab', { name: 'Explained' }))

  expect(screen.getByRole('tab', { name: 'Explained' })).toHaveAttribute('aria-selected', 'true')
  expect(screen.getByRole('tabpanel', { name: 'Explained' })).toBeInTheDocument()
  expect(screen.getByText('EXAMPLE READING')).toBeInTheDocument()
})
