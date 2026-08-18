export default function ProcessCard({ number, title, body, index }) {
  return (
    <article className="process-card" style={{ '--process-index': index }}>
      <div className="process-card__meta">
        <span>{number}</span>
        <span>SCREENING PIPELINE</span>
      </div>
      <div className={`process-card__glyph process-card__glyph--${title.toLowerCase()}`} aria-hidden="true">
        <span />
        <span />
        <span />
      </div>
      <div className="process-card__copy">
        <h3>{title}</h3>
        <p>{body}</p>
      </div>
    </article>
  )
}
