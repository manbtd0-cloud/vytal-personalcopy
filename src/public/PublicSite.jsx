import { Routes, Route } from 'react-router-dom'
import PublicLayout from './PublicLayout.jsx'
import LandingPage from './pages/LandingPage.jsx'
import PublicNotFoundPage from './pages/PublicNotFoundPage.jsx'
import './styles/public-tokens.css'
import './styles/public-layout.css'
import './styles/landing.css'
import './styles/supporting-pages.css'
import './styles/responsive.css'

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
