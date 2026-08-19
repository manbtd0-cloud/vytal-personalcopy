import { render, screen } from '@testing-library/react'
import { MemoryRouter } from 'react-router-dom'
import App from '../../src/App.jsx'

vi.mock('../../src/pages/ScanPage.jsx', () => ({
  default: () => <div>CLINICAL_SCAN_PAGE</div>,
}))

vi.mock('../../src/pages/DashboardPage.jsx', () => ({
  default: () => <div>CLINICAL_DASHBOARD_PAGE</div>,
}))

vi.mock('../../src/pages/ReportPage.jsx', () => ({
  default: () => <div>CLINICAL_REPORT_PAGE</div>,
}))

vi.mock('../../src/components/SplashAnimation.jsx', () => ({
  default: () => null,
}))

function renderAt(path) {
  return render(
    <MemoryRouter initialEntries={[path]}>
      <App />
    </MemoryRouter>,
  )
}

test.each([
  ['/screenings', /what vytal is designed to screen/i],
  ['/science', /measurement problem is not/i],
  ['/impact', /first signal should not depend/i],
  ['/about', /harder to overclaim/i],
  ['/journey', /a result should have to earn its way onto the screen/i],
  ['/platform', /one signal is a fragment/i],
  ['/privacy', /privacy/i],
  ['/medical-disclaimer', /medical disclaimer/i],
])('%s renders its unique public page premise', async (path, premise) => {
  renderAt(path)
  expect(await screen.findByRole('heading', { level: 1, name: premise })).toBeInTheDocument()
})

test('expanded public routes do not capture clinical routes', () => {
  renderAt('/scan')
  expect(screen.getByText('CLINICAL_SCAN_PAGE')).toBeInTheDocument()
})
