import MediaFrame from '../system/MediaFrame.jsx'
import SectionThemeBoundary from '../system/SectionThemeBoundary.jsx'
import SignalThread from '../system/SignalThread.jsx'
import SplitText from '../reactbits/SplitText.jsx'
import { mediaSlots } from '../../content/mediaSlots.js'
import { homeReference } from '../../content/homeReference.js'

const HERO_FROM = { opacity: 0, y: 42 }
const HERO_TO = { opacity: 1, y: 0 }

export default function HeroMediaChapter() {
  const hero = homeReference.hero

  return (
    <SectionThemeBoundary
      theme="media-dark"
      as="section"
      className="ref-hero"
      data-home-chapter="hero"
    >
      <MediaFrame slot={mediaSlots.HOME_HERO_01} className="ref-hero__media" />
      <div className="ref-hero__scrim" aria-hidden="true" />
      <SignalThread
        variant="raw"
        tone="coral"
        density="dense"
        className="ref-hero__signal"
      />

      <div className="public-shell ref-hero__content">
        <p className="ref-kicker ref-hero__kicker">{hero.kicker}</p>
        <SplitText
          text={hero.title}
          tag="h1"
          className="ref-hero__title"
          splitType="words"
          delay={78}
          duration={0.95}
          ease="power4.out"
          from={HERO_FROM}
          to={HERO_TO}
          threshold={0}
          animateOnMount
        />
        <p className="ref-hero__reveal">{hero.reveal}</p>
        <a className="ref-scroll-cue" href="#access-thesis">
          <span>{hero.scrollCue}</span>
          <span aria-hidden="true">↓</span>
        </a>
      </div>
    </SectionThemeBoundary>
  )
}
