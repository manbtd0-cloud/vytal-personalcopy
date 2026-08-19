import HeroMediaChapter from '../components/home-reference/HeroMediaChapter.jsx'
import AccessThesisChapter from '../components/home-reference/AccessThesisChapter.jsx'
import ProofFieldChapter from '../components/home-reference/ProofFieldChapter.jsx'
import ScienceLineageChapter from '../components/home-reference/ScienceLineageChapter.jsx'
import CameraScienceSection from '../components/home/CameraScienceSection.jsx'
import ProcessSection from '../components/home/ProcessSection.jsx'
import ProductProofSection from '../components/home/ProductProofSection.jsx'
import ScreeningEcosystemSection from '../components/home/ScreeningEcosystemSection.jsx'
import TrustSection from '../components/home/TrustSection.jsx'
import AiExplanationSection from '../components/home/AiExplanationSection.jsx'
import LongitudinalSection from '../components/home/LongitudinalSection.jsx'
import ImpactSection from '../components/home/ImpactSection.jsx'
import SciencePreviewSection from '../components/home/SciencePreviewSection.jsx'
import FutureVisionSection from '../components/home/FutureVisionSection.jsx'
import FinalCtaSection from '../components/home/FinalCtaSection.jsx'

export default function LandingPage() {
  return (
    <div className="landing-page reference-home">
      <HeroMediaChapter />
      <AccessThesisChapter />
      <ProofFieldChapter />
      <ScienceLineageChapter />
      <CameraScienceSection />
      <ProcessSection />
      <ProductProofSection />
      <ScreeningEcosystemSection />
      <TrustSection />
      <AiExplanationSection />
      <LongitudinalSection />
      <ImpactSection />
      <SciencePreviewSection />
      <FutureVisionSection />
      <FinalCtaSection />
    </div>
  )
}
