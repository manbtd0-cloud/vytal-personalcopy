import { useState } from 'react'
import { Outlet } from 'react-router-dom'
import NavBar from '../components/NavBar.jsx'
import SplashAnimation from '../components/SplashAnimation.jsx'

export default function ClinicalLayout() {
  const [showSplash, setShowSplash] = useState(true)

  return (
    <div className="app-shell app-shell--clinical">
      {showSplash && <SplashAnimation onFinish={() => setShowSplash(false)} />}
      <NavBar onReplayIntro={() => setShowSplash(true)} />
      <Outlet />
    </div>
  )
}
