import { lazy, Suspense } from 'react'
import { Routes, Route } from 'react-router-dom'
import ClinicalLayout from './layouts/ClinicalLayout.jsx'
import ScanPage from './pages/ScanPage.jsx'
import DashboardPage from './pages/DashboardPage.jsx'
import ReportPage from './pages/ReportPage.jsx'

const PublicSite = lazy(() => import('./public/PublicSite.jsx'))

function PublicRouteFallback() {
  return (
    <div className="public-route-fallback" role="status">
      <span>VYTAL</span>
    </div>
  )
}

export default function App() {
  return (
    <Routes>
      <Route element={<ClinicalLayout />}>
        <Route path="/scan" element={<ScanPage />} />
        <Route path="/dashboard" element={<DashboardPage />} />
        <Route path="/report" element={<ReportPage />} />
      </Route>

      <Route
        path="/*"
        element={
          <Suspense fallback={<PublicRouteFallback />}>
            <PublicSite />
          </Suspense>
        }
      />
    </Routes>
  )
}
