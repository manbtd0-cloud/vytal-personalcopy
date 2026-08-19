import { lazy, Suspense } from 'react'
import { Routes, Route } from 'react-router-dom'
import PublicLayout from './PublicLayout.jsx'
import LandingPage from './pages/LandingPage.jsx'
import PublicNotFoundPage from './pages/PublicNotFoundPage.jsx'
import './styles/public-tokens.css'
import './styles/public-layout.css'
import './styles/public-motion.css'
import './styles/media-frame.css'
import './styles/signal-thread.css'
import './styles/home-reference.css'
import './styles/home-reference-proof.css'
import './styles/home-reference-context.css'
import './styles/home-reference-media.css'
import './styles/home-reference-trust.css'
import './styles/home-reference-final.css'
import './styles/landing.css'
import './styles/home-story.css'
import './styles/product-proof.css'
import './styles/screening-trust.css'
import './styles/ai-explanation.css'
import './styles/home-lower.css'
import './styles/home-finale.css'
import './styles/supporting-pages.css'
import './styles/responsive.css'
import './components/reactbits/reactbits.css'

const ScreeningsPage = lazy(() => import('./pages/ScreeningsPage.jsx'))
const SciencePage = lazy(() => import('./pages/SciencePage.jsx'))
const ImpactPage = lazy(() => import('./pages/ImpactPage.jsx'))
const AboutPage = lazy(() => import('./pages/AboutPage.jsx'))
const JourneyPage = lazy(() => import('./pages/JourneyPage.jsx'))
const PlatformPage = lazy(() => import('./pages/PlatformPage.jsx'))
const PrivacyPage = lazy(() => import('./pages/PrivacyPage.jsx'))
const MedicalDisclaimerPage = lazy(() => import('./pages/MedicalDisclaimerPage.jsx'))

function PublicRouteFallback() {
  return <div className="public-route-fallback">LOADING</div>
}

export default function PublicSite() {
  return (
    <Suspense fallback={<PublicRouteFallback />}>
      <Routes>
        <Route element={<PublicLayout />}>
          <Route index element={<LandingPage />} />
          <Route path="screenings" element={<ScreeningsPage />} />
          <Route path="science" element={<SciencePage />} />
          <Route path="impact" element={<ImpactPage />} />
          <Route path="about" element={<AboutPage />} />
          <Route path="journey" element={<JourneyPage />} />
          <Route path="platform" element={<PlatformPage />} />
          <Route path="privacy" element={<PrivacyPage />} />
          <Route path="medical-disclaimer" element={<MedicalDisclaimerPage />} />
          <Route path="*" element={<PublicNotFoundPage />} />
        </Route>
      </Routes>
    </Suspense>
  )
}
