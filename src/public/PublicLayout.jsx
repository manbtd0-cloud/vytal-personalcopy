import { Outlet } from 'react-router-dom'
import PublicNav from './components/PublicNav.jsx'
import PublicFooter from './components/PublicFooter.jsx'
import PublicScrollRestoration from './components/system/PublicScrollRestoration.jsx'
import useSectionTheme from './hooks/useSectionTheme.js'

export default function PublicLayout() {
  const theme = useSectionTheme('dark')

  return (
    <div className="public-site" data-active-public-theme={theme}>
      <PublicScrollRestoration />
      <a className="public-skip-link" href="#public-main">
        Skip to content
      </a>
      <PublicNav theme={theme} />
      <main id="public-main">
        <Outlet />
      </main>
      <PublicFooter />
    </div>
  )
}
