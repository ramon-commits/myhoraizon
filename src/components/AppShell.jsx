import { Outlet, useNavigate, useLocation } from 'react-router-dom'
import { useState, useMemo, useEffect } from 'react'
import { useAuth } from '../contexts/AuthContext'
import { Sidebar, TopBar, ViewAsBanner } from '../design/shell.jsx'
import { ToastHost, ConfirmHost, toast, setState } from '../design/store.jsx'
import { KYANO } from '../design/data'
import { loadLayout, saveLayout, buildDefault, WidgetLibrary, BOARDS } from '../design/tiles.jsx'
import IrisChatPanel from './IrisChatPanel'
import { ClientFullHost } from '../design/klantkaart.jsx'
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

// View-as: bouwt een flags-set voor het meekijken in de werkruimte van een
// teamlid — alleen de modules die dat lid mag zien (1:1 uit de Design-shell ·
// flagsForView). allowed = array module-ids (zonder kern), of null = alles.
const VA_PRIMARY = ['vandaag', 'postvak', 'agenda']
function flagsForView(allowed) {
  if (!allowed) return null
  const set = new Set([...allowed, ...VA_PRIMARY, 'people', 'agents'])
  const f = {}
  KYANO.modules.forEach((m) => { f[m.id] = set.has(m.id) })
  return f
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
  const [viewAs, setViewAs] = useState(null)     // { mem, allowed }, null = jezelf
  const [viewAsAll, setViewAsAll] = useState(false)

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

  // gedeelde klantkaart sluiten zodra je van route wisselt — de kaart hoort niet
  // open te blijven hangen als je wegnavigeert (en houdt zo de poort-test schoon)
  useEffect(() => { setState('crm.full', null) }, [location.pathname])

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

  // View-as-lijm (1:1 uit de Design-shell): de "Bekijk"-knop op een teamlid
  // roept window.startViewAs(mem, allowed) aan. We zetten window.__viewAs zodat
  // assign.jsx (currentActor) de ingelogde rol meeneemt, tonen de ViewAsBanner
  // en filteren de sidebar tot de modules van dat lid.
  useEffect(() => {
    window.startViewAs = (mem, allowed) => {
      window.__viewAs = mem
      setViewAsAll(false)
      setEdit(false)
      setViewAs({ mem, allowed: allowed || null })
      navigate('/')
    }
    window.stopViewAs = () => { window.__viewAs = null; setViewAs(null); navigate('/people') }
    return () => { delete window.startViewAs; delete window.stopViewAs }
  }, [navigate])

  // tijdens view-as: tenant-hides behouden én extra de niet-toegestane modules
  // van het teamlid verbergen (tenzij "Alle modules" aanstaat).
  const effFlags = useMemo(() => {
    if (!viewAs || viewAsAll) return flags
    const mf = flagsForView(viewAs.allowed)
    if (!mf) return flags
    const out = { ...flags }
    KYANO.modules.forEach((m) => { if (mf[m.id] === false) out[m.id] = false })
    return out
  }, [viewAs, viewAsAll, flags])
  const vaReadonly = !!(viewAs && viewAs.mem && viewAs.mem.cap === 'view')
  const vaRole = viewAs ? (window.TEAM_ROLES && window.TEAM_ROLES[viewAs.mem.role]) : null

  return (
    <div className={'app' + (viewAs ? ' viewas' : '') + (vaReadonly ? ' viewas-ro' : '')} style={{ zoom: 0.9 }}>
      <Sidebar view={view} go={go} flags={effFlags} email={email} onLogout={onLogout} />
      <div className="main">
        {viewAs && <ViewAsBanner va={viewAs} all={viewAsAll} setAll={setViewAsAll} role={vaRole} readonly={vaReadonly} />}
        <div className="main-scroll">
          <TopBar
            view={view}
            go={go}
            edit={edit}
            setEdit={setEdit}
            onReset={onReset}
            openLib={openLib}
            flags={effFlags}
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
      <ClientFullHost onOpen={go} />
      <ToastHost />
      <ConfirmHost />
    </div>
  )
}
