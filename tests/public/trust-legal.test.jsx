import { render, screen, within } from '@testing-library/react'
import { MemoryRouter } from 'react-router-dom'
import App from '../../src/App.jsx'
import PrivacyPage from '../../src/public/pages/PrivacyPage.jsx'
import MedicalDisclaimerPage from '../../src/public/pages/MedicalDisclaimerPage.jsx'

vi.mock('../../src/pages/ScanPage.jsx', () => ({ default: () => <div>CLINICAL_SCAN_PAGE</div> }))
vi.mock('../../src/pages/DashboardPage.jsx', () => ({ default: () => <div>CLINICAL_DASHBOARD_PAGE</div> }))
vi.mock('../../src/pages/ReportPage.jsx', () => ({ default: () => <div>CLINICAL_REPORT_PAGE</div> }))
vi.mock('../../src/components/SplashAnimation.jsx', () => ({ default: () => null }))

test('Privacy documents the current prototype data path without inventing a future backend', () => {
  const { container } = render(
    <MemoryRouter>
      <PrivacyPage />
    </MemoryRouter>,
  )

  const document = container.querySelector('[data-legal-document="privacy"]')
  expect(document).toBeInTheDocument()
  expect(within(document).getByRole('heading', { level: 1, name: /^privacy$/i })).toBeInTheDocument()
  expect(within(document).getByText(/browser localStorage/i)).toBeInTheDocument()
  expect(within(document).getByText(/camera processing happens in the browser/i)).toBeInTheDocument()
  expect(within(document).getByText(/Groq or Qwen/i)).toBeInTheDocument()
  expect(within(document).getByText(/configured cloud sync endpoint/i)).toBeInTheDocument()

  const prototypeStatus = document.querySelector('#privacy-status')
  expect(prototypeStatus).toBeInTheDocument()
  expect(within(prototypeStatus).getByText(/prototype behavior/i)).toBeInTheDocument()
})

test('Medical Disclaimer makes diagnosis, uncertainty and urgent-care boundaries first-class', () => {
  const { container } = render(
    <MemoryRouter>
      <MedicalDisclaimerPage />
    </MemoryRouter>,
  )

  const document = container.querySelector('[data-legal-document="medical-disclaimer"]')
  expect(document).toBeInTheDocument()
  expect(within(document).getByRole('heading', { level: 1, name: /medical disclaimer/i })).toBeInTheDocument()
  expect(within(document).getByText(/not a medical diagnosis/i)).toBeInTheDocument()
  expect(within(document).getByText(/experimental or research/i)).toBeInTheDocument()
  expect(within(document).getByText(/low confidence/i)).toBeInTheDocument()

  const urgent = document.querySelector('#medical-urgent')
  expect(urgent).toBeInTheDocument()
  expect(
    within(urgent).getByRole('heading', { name: /urgent symptoms override the app/i }),
  ).toBeInTheDocument()
  expect(within(urgent).getByText(/seek appropriate urgent medical care/i)).toBeInTheDocument()

  const confirmation = document.querySelector('#medical-confirmation')
  expect(confirmation).toBeInTheDocument()
  expect(within(confirmation).getByText(/clinical confirmation/i)).toBeInTheDocument()
})

test('Unknown public routes resolve to a useful branded 404 without capturing clinical paths', async () => {
  render(
    <MemoryRouter initialEntries={['/this-route-does-not-exist']}>
      <App />
    </MemoryRouter>,
  )

  const notFound = await screen.findByRole('region', { name: /page not found/i })
  expect(within(notFound).getByRole('heading', { level: 1, name: /page not found/i })).toBeInTheDocument()
  expect(within(notFound).getByRole('link', { name: /back to home/i })).toHaveAttribute('href', '/')
  expect(within(notFound).getByRole('link', { name: /start screening/i })).toHaveAttribute('href', '/scan')
})
