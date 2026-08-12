import './App.css'
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom'

import Home from './assets/PAGES/HOME_PAGE/Home'
import Navbar from './assets/COMPONENTS/NAV_BAR/Navbar'
import Loginout from './assets/PAGES/LOGINOUT_PAGE/Loginout'

import Dashboard from './assets/PAGES/DASH_BOARDS/Dashboard'

const isAuthenticated = () => Boolean(localStorage.getItem('eps_access_token'))

function ProtectedDashboard() {
  return isAuthenticated()
    ? <Dashboard />
    : <Navigate to="/login" replace />
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
        <Route path="/login" element={<PublicOnly><Loginout /></PublicOnly>} />
        <Route path="/dashboard" element={<ProtectedDashboard />} />
        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
    </BrowserRouter>
  )
}

export default App
