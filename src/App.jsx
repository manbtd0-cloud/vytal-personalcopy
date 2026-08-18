import { useState } from 'react'
import { Routes, Route } from 'react-router-dom'
import NavBar from './components/NavBar.jsx'
import ScanPage from './pages/ScanPage.jsx'
import DashboardPage from './pages/DashboardPage.jsx'
import ReportPage from './pages/ReportPage.jsx'
import SplashAnimation from './components/SplashAnimation.jsx'

export default function App() {
  const [showSplash, setShowSplash] = useState(true)

  return (
    <div className="app-shell">
      {showSplash && <SplashAnimation onFinish={() => setShowSplash(false)} />}
      <NavBar onReplayIntro={() => setShowSplash(true)} />
      <Routes>
        <Route path="/" element={<ScanPage />} />
        <Route path="/dashboard" element={<DashboardPage />} />
        <Route path="/report" element={<ReportPage />} />
      </Routes>
    </div>
  )
}
