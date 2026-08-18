import { Link } from 'react-router-dom'
import OpticalSampleField from '../OpticalSampleField.jsx'
import Magnet from '../reactbits/Magnet.jsx'
import SplitText from '../reactbits/SplitText.jsx'
import { homeContent } from '../../content/home.js'

const HERO_FROM = { opacity: 0, y: 36 }
const HERO_TO = { opacity: 1, y: 0 }

export default function HeroSection() {
  const { hero } = homeContent

  const scrollToScience = () => {
    const reduce = typeof window.matchMedia === 'function' && window.matchMedia('(prefers-reduced-motion: reduce)').matches
    document.getElementById('camera-science')?.scrollIntoView({
      behavior: reduce ? 'auto' : 'smooth',
      block: 'start',
    })
  }

  return (
    <section className="landing-hero">
      <OpticalSampleField />

      <div className="public-shell landing-hero__inner">
        <div className="landing-hero__topline" aria-hidden="true">
          <span>{hero.eyebrow}</span>
          <span>001 / VYTAL</span>
        </div>

        <div className="landing-hero__headline-wrap">
          <SplitText
            text={hero.title}
            tag="h1"
            className="landing-hero__headline"
            splitType="words"
            delay={85}
            duration={0.9}
            ease="power4.out"
            from={HERO_FROM}
            to={HERO_TO}
            threshold={0}
            animateOnMount
          />
        </div>

        <div className="landing-hero__reveal-row">
          <p className="landing-hero__reveal">{hero.reveal}</p>
          <div className="landing-hero__signal-rule" aria-hidden="true">
            <span />
            <span />
            <span />
          </div>
        </div>

        <div className="landing-hero__lower">
          <div className="landing-hero__definition">
            <span className="landing-hero__definition-index">01</span>
            <p>{hero.body}</p>
          </div>

          <div className="landing-hero__actions">
            <Magnet padding={42} magnetStrength={7}>
              <Link className="public-button public-button--primary landing-hero__primary" to="/scan">
                {hero.primary}
                <span aria-hidden="true">↗</span>
              </Link>
            </Magnet>
            <button
              type="button"
              className="public-button public-button--secondary landing-hero__secondary"
              onClick={scrollToScience}
            >
              {hero.secondary}
            </button>
            <p className="landing-hero__disclaimer">{hero.disclaimer}</p>
          </div>
        </div>

        <div className="landing-hero__footerline" aria-hidden="true">
          <span>OBSERVE</span>
          <span>EXTRACT</span>
          <span>CHECK</span>
          <span>UNDERSTAND</span>
        </div>
      </div>
    </section>
  )
}
