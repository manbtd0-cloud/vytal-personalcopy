import { Outlet } from 'react-router-dom'
import PublicNav from './components/PublicNav.jsx'
import PublicFooter from './components/PublicFooter.jsx'

export default function PublicLayout() {
  return (
    <div className="public-site">
      <a className="public-skip-link" href="#public-main">
        Skip to content
      </a>
      <PublicNav />
      <main id="public-main">
        <Outlet />
      </main>
      <PublicFooter />
    </div>
  )
}
