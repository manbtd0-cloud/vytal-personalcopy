import { Outlet } from 'react-router-dom'

export default function PublicLayout() {
  return (
    <div className="public-site">
      <a className="public-skip-link" href="#public-main">
        Skip to content
      </a>
      <main id="public-main">
        <Outlet />
      </main>
    </div>
  )
}
