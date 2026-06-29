import { useState } from 'react'
import { AuthProvider, useAuth } from './hooks/useAuth'
import Login from './components/Login'
import Today from './pages/Today'
import Routines from './pages/Routines'
import History from './pages/History'
import Progress from './pages/Progress'
import './styles/main.css'

function NavIcon({ name }) {
  const icons = {
    today: <><rect x="3" y="4" width="18" height="18" rx="2"/><line x1="3" y1="9" x2="21" y2="9"/><line x1="8" y1="2" x2="8" y2="6"/><line x1="16" y1="2" x2="16" y2="6"/></>,
    routines: <><line x1="8" y1="6" x2="21" y2="6"/><line x1="8" y1="12" x2="21" y2="12"/><line x1="8" y1="18" x2="21" y2="18"/><line x1="3" y1="6" x2="3.01" y2="6"/><line x1="3" y1="12" x2="3.01" y2="12"/><line x1="3" y1="18" x2="3.01" y2="18"/></>,
    history: <><polyline points="12 8 12 12 14 14"/><path d="M3.05 11a9 9 0 1 0 .5-4.5"/><polyline points="3 3 3 7 7 7"/></>,
    progress: <><polyline points="22 12 18 12 15 21 9 3 6 12 2 12"/></>
  }
  return <svg viewBox="0 0 24 24">{icons[name]}</svg>
}

function App() {
  const { user } = useAuth()
  const [tab, setTab] = useState('today')

  if (user === undefined) {
    return <div className="loading-screen"><div className="spinner" /></div>
  }

  if (!user) return <Login />

  const pages = { today: Today, routines: Routines, history: History, progress: Progress }
  const Page = pages[tab]

  return (
    <div className="app">
      <Page />
      <nav className="bottom-nav">
        {[
          { key: 'today', label: 'Hoy' },
          { key: 'routines', label: 'Rutinas' },
          { key: 'history', label: 'Historial' },
          { key: 'progress', label: 'Progreso' }
        ].map(item => (
          <button
            key={item.key}
            className={`nav-btn ${tab === item.key ? 'active' : ''}`}
            onClick={() => setTab(item.key)}
          >
            <NavIcon name={item.key} />
            {item.label}
          </button>
        ))}
      </nav>
    </div>
  )
}

export default function Root() {
  return (
    <AuthProvider>
      <App />
    </AuthProvider>
  )
}
