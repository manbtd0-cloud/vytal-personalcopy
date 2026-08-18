export default function SectionShell({
  id,
  tone = 'dark',
  className = '',
  children,
}) {
  return (
    <section
      id={id}
      className={`public-section public-section--${tone} ${className}`.trim()}
    >
      <div className="public-shell">{children}</div>
    </section>
  )
}
