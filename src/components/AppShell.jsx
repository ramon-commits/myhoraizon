import { Outlet, useNavigate, useLocation } from 'react-router-dom'
import { useState } from 'react'
import { useAuth } from '../contexts/AuthContext'
import { Sidebar, TopBar } from '../design/shell.jsx'
import { ToastHost, ConfirmHost, toast } from '../design/store.jsx'
import { loadLayout, saveLayout, buildDefault, WidgetLibrary } from '../design/tiles.jsx'
import IrisChatPanel from './IrisChatPanel'

// AppShell: de werkruimte-shell uit de Claude Design-blauwdruk (app.jsx).
// Sidebar + topbar + scroll-container; de pagina rendert via <Outlet/>.
// Het dashboard-bord (sleepbare tegels) leeft hier: layout, edit-modus en de
// widget-markt worden via Outlet-context aan DashboardPage doorgegeven.
export default function AppShell() {
  const { email, signOut } = useAuth()
  const navigate = useNavigate()
  const location = useLocation()
  const [edit, setEdit] = useState(false)
  const [libOpen, setLibOpen] = useState(false)
  const [layout, setLayout] = useState(() => loadLayout('dashboard'))

  const seg = location.pathname.split('/')[1] || ''
  const view = seg === '' ? 'dashboard' : seg

  const go = (id) => { navigate(id === 'dashboard' ? '/' : '/' + id) }
  const onLogout = async () => { await signOut(); navigate('/login') }
  const openLib = () => setLibOpen(true)
  const onReset = () => {
    const def = buildDefault('dashboard')
    setLayout(def); saveLayout(def, 'dashboard')
    toast('Dashboard-indeling hersteld', { icon: 'refresh' })
  }

  // flags leeg = alle modules zichtbaar (feature-flags-UI volgt later)
  const flags = {}

  return (
    <div className="app" style={{ zoom: 0.9 }}>
      <Sidebar view={view} go={go} flags={flags} email={email} onLogout={onLogout} />
      <div className="main">
        <div className="main-scroll">
          <TopBar
            view={view}
            go={go}
            edit={edit}
            setEdit={setEdit}
            onReset={onReset}
            openLib={openLib}
            flags={flags}
            onLogout={onLogout}
          />
          <Outlet context={{ edit, layout, setLayout, openLib, go, flags }} />
        </div>
      </div>
      {libOpen && (
        <WidgetLibrary layout={layout} setLayout={setLayout} flags={flags} board="dashboard" onClose={() => setLibOpen(false)} />
      )}
      <IrisChatPanel />
      <ToastHost />
      <ConfirmHost />
    </div>
  )
}
