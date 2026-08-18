import HeroSection from '../components/home/HeroSection.jsx'
import CameraScienceSection from '../components/home/CameraScienceSection.jsx'
import ProcessSection from '../components/home/ProcessSection.jsx'

export default function LandingPage() {
  return (
    <div className="landing-page">
      <HeroSection />
      <CameraScienceSection />
      <ProcessSection />
    </div>
  )
}
