import { Outlet, useNavigate, useLocation } from 'react-router-dom'
import { useState } from 'react'
import { useAuth } from '../contexts/AuthContext'
import { Sidebar, TopBar } from '../design/shell.jsx'
import { ToastHost, ConfirmHost, toast } from '../design/store.jsx'
import IrisChatPanel from './IrisChatPanel'

// AppShell: de werkruimte-shell uit de Claude Design-blauwdruk (app.jsx).
// Sidebar + topbar + scroll-container; de pagina rendert via <Outlet/>.
export default function AppShell() {
  const { email, signOut } = useAuth()
  const navigate = useNavigate()
  const location = useLocation()
  const [edit, setEdit] = useState(false)

  // route -> view-id zoals de blauwdruk (dashboard op '/')
  const seg = location.pathname.split('/')[1] || ''
  const view = seg === '' ? 'dashboard' : seg

  const go = (id) => { navigate(id === 'dashboard' ? '/' : '/' + id) }
  const onLogout = async () => { await signOut(); navigate('/login') }
  // tegel-bewerken (Widget-markt / herstel) komt in de tegel-laag-stap
  const openLib = () => toast('De widget-markt komt in de volgende stap', { icon: 'grid' })
  const onReset = () => toast('Indeling herstellen komt met de tegel-laag', { icon: 'refresh' })

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
          <Outlet />
        </div>
      </div>
      <IrisChatPanel />
      <ToastHost />
      <ConfirmHost />
    </div>
  )
}
