import MediaFrame from '../system/MediaFrame.jsx'
import SectionThemeBoundary from '../system/SectionThemeBoundary.jsx'
import ScrollReveal from '../reactbits/ScrollReveal.jsx'
import { mediaSlots } from '../../content/mediaSlots.js'
import { homeReference } from '../../content/homeReference.js'

export default function AccessThesisChapter() {
  const content = homeReference.accessThesis

  return (
    <SectionThemeBoundary
      id="access-thesis"
      theme="dark"
      as="section"
      className="ref-access"
      data-home-chapter="access-thesis"
    >
      <div className="public-shell ref-access__grid">
        <div className="ref-access__copy">
          <p className="ref-kicker">{content.kicker}</p>
          <ScrollReveal tag="h2" className="ref-access__statement" baseOpacity={0.2} baseRotation={1.2} blurStrength={2}>
            {content.statement}
          </ScrollReveal>
          <p className="ref-access__body">{content.body}</p>
        </div>

        <MediaFrame
          slot={mediaSlots.HOME_ACCESS_DETAIL_01}
          className="ref-access__media"
        />
      </div>
    </SectionThemeBoundary>
  )
}
