import MediaFrame from '../system/MediaFrame.jsx'
import SectionThemeBoundary from '../system/SectionThemeBoundary.jsx'
import SignalThread from '../system/SignalThread.jsx'
import { getMediaSlotById } from '../../content/mediaSlots.js'
import { screeningGroups } from '../../content/screenings.js'

export const screeningGroupId = (title) =>
  `screening-${title.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)/g, '')}`

const mediaSlotBySlug = {
  'heart-rate': 'SCR-HR-01',
  'breathing-rate': 'SCR-BR-01',
  'pulse-variability': 'SCR-HRV-01',
  'spo2-proxy': 'SCR-SPO2-01',
  'irregular-rhythm': 'SCR-RHYTHM-01',
  'anemia-indicators': 'SCR-ANEMIA-01',
  'jaundice-indicators': 'SCR-JAUNDICE-01',
  'blood-pressure-trends': 'SCR-BP-01',
  'malnutrition-bmi-proxy': 'SCR-BMI-01',
  'ble-oximeter': 'SCR-BLE-01',
  'thermal-sensing': 'SCR-THERMAL-01',
  'wearable-baseline': 'SCR-WEARABLE-01',
}

const groupModes = [
  { key: 'core', theme: 'dark', signal: 'trusted', tone: 'mint' },
  { key: 'research', theme: 'light', signal: 'raw', tone: 'coral' },
  { key: 'context', theme: 'dark', signal: 'context', tone: 'amber' },
  { key: 'future', theme: 'coral', signal: 'network', tone: 'ink' },
]

function StatusChip({ status }) {
  const statusClass = status.toLowerCase().replace(/[^a-z0-9]+/g, '-')
  return <span className={`status-chip status-chip--${statusClass}`}>{status}</span>
}

function ScreeningEditorialItem({ item, groupKey, index }) {
  const mediaSlotId = mediaSlotBySlug[item.slug]
  const slot = mediaSlotId ? getMediaSlotById(mediaSlotId) : null

  return (
    <article
      className={`screening-editorial-item screening-editorial-item--${groupKey} screening-editorial-item--${index + 1}`}
      data-screening-item={item.slug}
      data-status={item.status}
    >
      <header className="screening-editorial-item__header">
        <StatusChip status={item.status} />
        <h3>{item.title}</h3>
      </header>

      {slot ? <MediaFrame slot={slot} className="screening-editorial-item__media" /> : null}

      <dl className="screening-editorial-item__facts">
        <div><dt>Input</dt><dd>{item.input}</dd></div>
        {item.looksFor ? <div><dt>Looks for</dt><dd>{item.looksFor}</dd></div> : null}
        {item.method ? <div><dt>Method</dt><dd>{item.method}</dd></div> : null}
        {item.output ? <div><dt>Output</dt><dd>{item.output}</dd></div> : null}
        {item.direction ? <div><dt>Direction</dt><dd>{item.direction}</dd></div> : null}
      </dl>

      <div className="screening-editorial-item__boundary">
        <p className="screening-editorial-item__limitation">{item.limitation}</p>
        {item.confirmation ? (
          <p className="screening-editorial-item__confirmation">{item.confirmation}</p>
        ) : null}
      </div>
    </article>
  )
}

function ScreeningGroupChapter({ group, index }) {
  const mode = groupModes[index]
  const contextSlot = mode.key === 'context' ? getMediaSlotById('SCR-CONTEXT-01') : null

  return (
    <SectionThemeBoundary
      id={screeningGroupId(group.title)}
      theme={mode.theme}
      as="section"
      className={`screening-group screening-group--${mode.key}`}
      data-screening-group={group.title}
    >
      <div className="public-shell screening-group__intro">
        <div className="screening-group__index">0{index + 1}</div>
        <div className="screening-group__title-block">
          <p className="ref-kicker">CAPABILITY / {mode.key.toUpperCase()}</p>
          <h2>{group.title}</h2>
        </div>
        <div className="screening-group__signal" aria-hidden="true">
          <SignalThread variant={mode.signal} tone={mode.tone} density={mode.key === 'research' ? 'dense' : 'quiet'} />
        </div>
      </div>

      {contextSlot ? (
        <div className="public-shell screening-group__context-visual">
          <MediaFrame slot={contextSlot} className="screening-group__shared-media" />
        </div>
      ) : null}

      <div className="public-shell screening-group__items">
        {group.items.map((item, itemIndex) => (
          <ScreeningEditorialItem item={item} groupKey={mode.key} index={itemIndex} key={item.slug} />
        ))}
      </div>
    </SectionThemeBoundary>
  )
}

export default function ScreeningSpine() {
  return (
    <div className="screening-spine" data-screening-spine>
      {screeningGroups.map((group, index) => (
        <ScreeningGroupChapter group={group} index={index} key={group.title} />
      ))}
    </div>
  )
}
