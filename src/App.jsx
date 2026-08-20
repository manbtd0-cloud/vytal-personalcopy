import { lazy, Suspense, useState } from 'react'
import { Routes, Route, useLocation } from 'react-router-dom'
import NavBar from './components/NavBar.jsx'
import SplashAnimation from './components/SplashAnimation.jsx'

const ScanPage = lazy(() => import('./pages/ScanPage.jsx'))
const DashboardPage = lazy(() => import('./pages/DashboardPage.jsx'))
const ReportPage = lazy(() => import('./pages/ReportPage.jsx'))
const AccountPage = lazy(() => import('./pages/AccountPage.jsx'))
const BillingPage = lazy(() => import('./pages/BillingPage.jsx'))
const PatientsPage = lazy(() => import('./pages/PatientsPage.jsx'))

export default function App() {
  const [showSplash, setShowSplash] = useState(true)
  const location = useLocation()

  return (
    <div className="app-shell">
      <div className="app-ambient" aria-hidden="true">
        <span className="app-ambient__orb app-ambient__orb--a" />
        <span className="app-ambient__orb app-ambient__orb--b" />
      </div>
      {showSplash && <SplashAnimation onFinish={() => setShowSplash(false)} />}
      <NavBar onReplayIntro={() => setShowSplash(true)} />
      <Suspense fallback={<main className="main page-loading" aria-live="polite">Loading VYTAL…</main>}>
        <Routes location={location} key={`${location.pathname}${location.search}`}>
          <Route path="/" element={<ScanPage />} />
          <Route path="/dashboard" element={<DashboardPage />} />
          <Route path="/patients" element={<PatientsPage />} />
          <Route path="/report" element={<ReportPage />} />
          <Route path="/account" element={<AccountPage />} />
          <Route path="/billing" element={<BillingPage />} />
        </Routes>
      </Suspense>
    </div>
  )
}
