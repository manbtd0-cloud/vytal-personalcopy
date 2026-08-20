import MediaFrame from '../system/MediaFrame.jsx'
import SectionThemeBoundary from '../system/SectionThemeBoundary.jsx'
import SignalThread from '../system/SignalThread.jsx'
import { getMediaSlotById } from '../../content/mediaSlots.js'
import { screeningGroups } from '../../content/screenings.js'

const researchGroup = screeningGroups.find(
  (group) => group.title === 'Optical / algorithmic screening research',
)

const branchSlotIds = Array.from(
  { length: 6 },
  (_, index) => `SCI-RESEARCH-BRANCHES-${String(index + 1).padStart(2, '0')}`,
)

export const scienceResearchItems = researchGroup?.items ?? []

export default function ScienceResearchBranches() {
  return (
    <SectionThemeBoundary
      theme="dark"
      as="section"
      className="science-research-branches"
      data-science-chapter="research-branches"
    >
      <SignalThread
        variant="network"
        tone="coral"
        density="dense"
        className="science-research-branches__network"
      />

      <div className="public-shell science-research-branches__intro">
        <p className="ref-kicker">RESEARCH / SCREENING BRANCHES</p>
        <h2>One optical signal can lead to very different research questions.</h2>
        <p>
          These directions do not share the same maturity or clinical meaning. Each branch keeps its current status and limitation visible rather than collapsing research into one promise.
        </p>
      </div>

      <div className="public-shell science-research-branches__grid">
        {scienceResearchItems.map((item, index) => {
          const slot = getMediaSlotById(branchSlotIds[index])

          return (
            <article
              className={`science-research-branch science-research-branch--${index + 1}`}
              data-science-research-branch={item.slug}
              key={item.slug}
            >
              {slot ? <MediaFrame slot={slot} className="science-research-branch__media" /> : null}

              <div className="science-research-branch__copy">
                <div className="science-research-branch__meta">
                  <span>{String(index + 1).padStart(2, '0')}</span>
                  <span>{item.status}</span>
                </div>
                <h3>{item.title}</h3>
                <p className="science-research-branch__method">{item.method}</p>
                <p className="science-research-branch__limitation">{item.limitation}</p>
              </div>
            </article>
          )
        })}
      </div>
    </SectionThemeBoundary>
  )
}

export function ScienceClaimBoundaries() {
  return (
    <SectionThemeBoundary
      theme="light"
      as="section"
      className="science-claim-boundaries"
      data-science-chapter="claim-boundaries"
    >
      <div className="public-shell science-claim-boundaries__intro">
        <p className="ref-kicker">BOUNDARIES / CURRENT CLAIMS</p>
        <h2>What We Do Not Claim</h2>
        <p>
          The current research-screening limits are stated below in the same language used by the capability model.
        </p>
      </div>

      <ol className="public-shell science-claim-boundaries__list">
        {scienceResearchItems.map((item, index) => (
          <li key={item.slug}>
            <span>{String(index + 1).padStart(2, '0')}</span>
            <div>
              <strong>{item.title}</strong>
              <small>{item.status}</small>
            </div>
            <p>{item.limitation}</p>
          </li>
        ))}
      </ol>
    </SectionThemeBoundary>
  )
}
