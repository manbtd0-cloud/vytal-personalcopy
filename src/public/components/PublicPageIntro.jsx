export default function PublicPageIntro({ eyebrow, title, body }) {
  return (
    <header className="public-page-intro">
      <p className="public-eyebrow">{eyebrow}</p>
      <h1>{title}</h1>
      <p className="public-page-intro__body">{body}</p>
    </header>
  )
}
