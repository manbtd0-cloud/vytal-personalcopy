import SpotlightCard from '../reactbits/SpotlightCard.jsx'
import StatusChip from '../StatusChip.jsx'

export default function ScreeningTile({ screening, index }) {
  return (
    <SpotlightCard
      className={`screening-tile screening-tile--${index + 1}`}
      spotlightColor={index % 3 === 0 ? 'rgba(255, 77, 94, 0.15)' : index % 3 === 1 ? 'rgba(111, 191, 151, 0.13)' : 'rgba(255, 176, 32, 0.11)'}
    >
      <div className="screening-tile__top">
        <span className="screening-tile__index">{String(index + 1).padStart(2, '0')}</span>
        <StatusChip status={screening.status} />
      </div>

      <div className="screening-tile__body">
        <h3>{screening.title}</h3>
        <p>{screening.homepageSummary ?? screening.looksFor}</p>
      </div>

      <div className="screening-tile__signal" aria-hidden="true">
        <span />
        <span />
        <span />
        <span />
        <span />
      </div>

      <div className="screening-tile__foot">
        <span>{screening.input}</span>
        <span>SCREENING CONTEXT</span>
      </div>
    </SpotlightCard>
  )
}
