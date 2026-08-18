import HeroSection from '../components/home/HeroSection.jsx'
import CameraScienceSection from '../components/home/CameraScienceSection.jsx'
import ProcessSection from '../components/home/ProcessSection.jsx'
import ProductProofSection from '../components/home/ProductProofSection.jsx'
import ScreeningEcosystemSection from '../components/home/ScreeningEcosystemSection.jsx'
import TrustSection from '../components/home/TrustSection.jsx'
import AiExplanationSection from '../components/home/AiExplanationSection.jsx'
import LongitudinalSection from '../components/home/LongitudinalSection.jsx'
import ImpactSection from '../components/home/ImpactSection.jsx'
import SciencePreviewSection from '../components/home/SciencePreviewSection.jsx'

export default function LandingPage() {
  return (
    <div className="landing-page">
      <HeroSection />
      <CameraScienceSection />
      <ProcessSection />
      <ProductProofSection />
      <ScreeningEcosystemSection />
      <TrustSection />
      <AiExplanationSection />
      <LongitudinalSection />
      <ImpactSection />
      <SciencePreviewSection />
    </div>
  )
}
