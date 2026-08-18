import { Link } from 'react-router-dom'

export default function PublicNotFoundPage() {
  return (
    <section>
      <h1>Page not found</h1>
      <Link to="/">Back to Home</Link>
      <Link to="/scan">Start Screening</Link>
    </section>
  )
}
