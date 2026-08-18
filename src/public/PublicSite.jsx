import { Routes, Route } from 'react-router-dom'
import PublicLayout from './PublicLayout.jsx'
import LandingPage from './pages/LandingPage.jsx'
import PublicNotFoundPage from './pages/PublicNotFoundPage.jsx'
import './styles/public-tokens.css'
import './styles/public-layout.css'
import './styles/landing.css'
import './styles/home-story.css'
import './styles/product-proof.css'
import './styles/screening-trust.css'
import './styles/ai-explanation.css'
import './styles/supporting-pages.css'
import './styles/responsive.css'
import './components/reactbits/reactbits.css'

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
