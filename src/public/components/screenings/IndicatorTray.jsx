import { screeningGroups } from '../../content/screenings.js'
import { screeningGroupId } from './ScreeningSpine.jsx'

export default function IndicatorTray() {
  return (
    <aside className="screenings-indicator" aria-label="Screening atlas indicator">
      <nav className="screenings-indicator__nav" aria-label="Screening atlas sections">
        {screeningGroups.map((group, index) => (
          <a href={`#${screeningGroupId(group.title)}`} key={group.title}>
            <span aria-hidden="true">{String(index + 1).padStart(2, '0')}</span>
            <strong>{group.title}</strong>
          </a>
        ))}
      </nav>
    </aside>
  )
}
