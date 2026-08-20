import MediaFrame from '../system/MediaFrame.jsx'
import SectionThemeBoundary from '../system/SectionThemeBoundary.jsx'
import { getMediaSlotById } from '../../content/mediaSlots.js'

const documentarySlotIds = Array.from(
  { length: 10 },
  (_, index) => `HOME-MEDIA-${String(index + 1).padStart(2, '0')}`,
)

export default function DocumentaryRunChapter() {
  return (
    <SectionThemeBoundary
      theme="ivory"
      as="section"
      className="ref-documentary-run"
      data-home-chapter="documentary-run"
    >
      <div className="public-shell ref-documentary-run__intro">
        <p className="ref-kicker">DOCUMENTARY / CONTEXT</p>
        <h2>The technology lives in ordinary places.</h2>
        <p>
          These frames reserve the final production geometry for real people, devices and environments. Until sourced media is approved, the composition stays intentionally empty rather than substituting generic stock.
        </p>
      </div>

      <div className="public-shell ref-documentary-run__grid">
        {documentarySlotIds.map((slotId, index) => {
          const slot = getMediaSlotById(slotId)
          if (!slot) return null

          return (
            <MediaFrame
              key={slot.id}
              slot={slot}
              className={`ref-documentary-run__frame ref-documentary-run__frame--${String(index + 1).padStart(2, '0')}`}
            />
          )
        })}
      </div>
    </SectionThemeBoundary>
  )
}
