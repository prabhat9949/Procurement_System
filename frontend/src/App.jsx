import './App.css'
import { useEffect, useState } from 'react'
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom'

import Home from './assets/PAGES/HOME_PAGE/Home'
import PublicInfo from './assets/PAGES/HOME_PAGE/PublicInfo'
import Navbar from './assets/COMPONENTS/NAV_BAR/Navbar'
import Loginout from './assets/PAGES/LOGINOUT_PAGE/Loginout'

import Dashboard from './assets/PAGES/DASH_BOARDS/Dashboard'
import { clearSession, loadVerifiedSession } from './services/session'

const isAuthenticated = () => Boolean(localStorage.getItem('eps_access_token'))

function ProtectedDashboard() {
  const [state, setState] = useState(() => isAuthenticated() ? 'checking' : 'signed-out')

  useEffect(() => {
    let active = true
    if (!isAuthenticated()) return undefined

    loadVerifiedSession()
      .then(() => active && setState('ready'))
      .catch(() => {
        clearSession()
        if (active) setState('signed-out')
      })

    return () => { active = false }
  }, [])

  useEffect(() => {
    const expireSession = () => {
      clearSession()
      setState('signed-out')
    }
    window.addEventListener('eps:session-expired', expireSession)
    return () => window.removeEventListener('eps:session-expired', expireSession)
  }, [])

  if (state === 'signed-out') return <Navigate to="/login" replace />
  if (state === 'checking') return <div className="eps-session-loading" role="status">Verifying your session…</div>
  return <Dashboard />
}

// Logged-in users should stay inside the app: visiting the home or login page
// while authenticated bounces straight back to the dashboard (so pressing the
// browser Back button never "logs you out").
function PublicOnly({ children }) {
  return isAuthenticated()
    ? <Navigate to="/dashboard" replace />
    : children
}

function App() {
  return (
    <BrowserRouter>
      <Navbar />
      <Routes>
        <Route path="/" element={<PublicOnly><Home /></PublicOnly>} />
        <Route path="/platform" element={<PublicOnly><PublicInfo /></PublicOnly>} />
        <Route path="/solutions" element={<PublicOnly><PublicInfo /></PublicOnly>} />
        <Route path="/governance" element={<PublicOnly><PublicInfo /></PublicOnly>} />
        <Route path="/login" element={<PublicOnly><Loginout /></PublicOnly>} />
        <Route path="/dashboard" element={<ProtectedDashboard />} />
        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
    </BrowserRouter>
  )
}

export default App
