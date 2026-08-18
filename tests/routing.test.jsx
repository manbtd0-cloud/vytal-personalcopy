import { render, screen } from '@testing-library/react'
import { MemoryRouter } from 'react-router-dom'
import App from '../src/App.jsx'

vi.mock('../src/pages/ScanPage.jsx', () => ({
  default: () => <div>CLINICAL_SCAN_PAGE</div>,
}))

vi.mock('../src/pages/DashboardPage.jsx', () => ({
  default: () => <div>CLINICAL_DASHBOARD_PAGE</div>,
}))

vi.mock('../src/pages/ReportPage.jsx', () => ({
  default: () => <div>CLINICAL_REPORT_PAGE</div>,
}))

vi.mock('../src/components/SplashAnimation.jsx', () => ({
  default: () => null,
}))

function renderAt(path) {
  return render(
    <MemoryRouter initialEntries={[path]}>
      <App />
    </MemoryRouter>,
  )
}

test('/ renders public landing page', async () => {
  renderAt('/')
  expect(await screen.findByRole('heading', { name: /there’s more here than you can see/i })).toBeInTheDocument()
})

test('/scan renders clinical scan page', () => {
  renderAt('/scan')
  expect(screen.getByText('CLINICAL_SCAN_PAGE')).toBeInTheDocument()
})

test('/dashboard keeps clinical dashboard route', () => {
  renderAt('/dashboard')
  expect(screen.getByText('CLINICAL_DASHBOARD_PAGE')).toBeInTheDocument()
})

test('/report keeps clinical report route', () => {
  renderAt('/report')
  expect(screen.getByText('CLINICAL_REPORT_PAGE')).toBeInTheDocument()
})
