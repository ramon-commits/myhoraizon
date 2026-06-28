import { Outlet, useNavigate, useLocation } from 'react-router-dom'
import { useState, useMemo, useEffect } from 'react'
import { useAuth } from '../contexts/AuthContext'
import { Sidebar, TopBar } from '../design/shell.jsx'
import { ToastHost, ConfirmHost, toast } from '../design/store.jsx'
import { loadLayout, saveLayout, buildDefault, WidgetLibrary, BOARDS } from '../design/tiles.jsx'
import IrisChatPanel from './IrisChatPanel'
import { useTenant } from '../tenant/TenantProvider'
import { MODULES, ROUTE_MODULE } from '../tenant/modules'
import { checkModuleAccess } from '../tenant/access'
import ModuleGate from '../tenant/ModuleGate'
import TenantSwitcher from '../tenant/TenantSwitcher'

// Sidebar-flags uit dezelfde tenant-config als de ModuleGate (één bron).
// Verberg custom-modules die niet aanstaan voor de actieve tenant (cosmetisch);
// de gate is de echte poort. CEO (null) → niets verbergen.
function tenantFlags(activeTenant) {
  const flags = {}
  if (!activeTenant) return flags
  for (const m of MODULES) {
    if (m.kind === 'custom' && !checkModuleAccess(activeTenant, m.key).allowed) flags[m.route] = false
  }
  // sub-routes (pipeline/crm/...) volgen de zichtbaarheid van hun module
  for (const [route, key] of Object.entries(ROUTE_MODULE)) {
    if (!checkModuleAccess(activeTenant, key).allowed) flags[route] = false
  }
  return flags
}

// AppShell: de werkruimte-shell uit de Claude Design-blauwdruk (app.jsx).
// Sidebar + topbar + scroll-container; de pagina rendert via <Outlet/>.
// Boards (dashboard, vandaag, ...) zijn sleepbare tegelborden: layout, edit-modus
// en de widget-markt leven hier en gaan via Outlet-context naar de board-pagina.
export default function AppShell() {
  const { email, signOut } = useAuth()
  const { activeTenant } = useTenant()
  const navigate = useNavigate()
  const location = useLocation()
  const [edit, setEdit] = useState(false)
  const [libOpen, setLibOpen] = useState(false)

  const seg = location.pathname.split('/')[1] || ''
  const view = seg === '' ? 'dashboard' : seg
  const board = BOARDS[view] ? view : null

  // layout van het huidige bord; override (lokaal bewerkt) wint zolang je op
  // hetzelfde bord blijft, daarna valt 'ie terug op de opgeslagen layout.
  const baseLayout = useMemo(() => (board ? loadLayout(board) : null), [board])
  const [override, setOverride] = useState(null)
  const layout = board ? (override && override.board === board ? override.layout : baseLayout) : null
  const setLayout = (next) => setOverride((prev) => {
    const cur = prev && prev.board === board ? prev.layout : baseLayout
    const val = typeof next === 'function' ? next(cur) : next
    return { board, layout: val }
  })

  // edit-modus en markt sluiten zodra je van bord wisselt
  // eslint-disable-next-line react-hooks/set-state-in-effect
  useEffect(() => { setEdit(false); setLibOpen(false) }, [board])

  const go = (id) => { navigate(id === 'dashboard' ? '/' : '/' + id) }
  const onLogout = async () => { await signOut(); navigate('/login') }
  const openLib = () => setLibOpen(true)
  const onReset = () => {
    if (!board) return
    const def = buildDefault(board)
    setOverride({ board, layout: def })
    saveLayout(def, board)
    toast('Indeling hersteld', { icon: 'refresh' })
  }

  // sidebar-flags uit de actieve tenant (CEO → alles zichtbaar)
  const flags = useMemo(() => tenantFlags(activeTenant), [activeTenant])

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
            isBoard={!!board}
            tenantSwitcher={<TenantSwitcher />}
          />
          <ModuleGate>
            <Outlet context={{ edit, layout, setLayout, openLib, go, flags, board }} />
          </ModuleGate>
        </div>
      </div>
      {libOpen && board && (
        <WidgetLibrary layout={layout} setLayout={setLayout} flags={flags} board={board} onClose={() => setLibOpen(false)} />
      )}
      <IrisChatPanel />
      <ToastHost />
      <ConfirmHost />
    </div>
  )
}
