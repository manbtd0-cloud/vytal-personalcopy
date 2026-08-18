import { Routes, Route } from 'react-router-dom'
import PublicLayout from './PublicLayout.jsx'
import LandingPage from './pages/LandingPage.jsx'
import PublicNotFoundPage from './pages/PublicNotFoundPage.jsx'

export default function PublicSite() {
  return (
    <Routes>
      <Route element={<PublicLayout />}>
        <Route index element={<LandingPage />} />
        <Route path="*" element={<PublicNotFoundPage />} />
      </Route>
    </Routes>
  )
}
