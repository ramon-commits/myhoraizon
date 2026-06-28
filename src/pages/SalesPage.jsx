/* SalesPage — /sales: het echte Sales-WIDGET-BORD uit de Claude Design-blauwdruk
   (dashboard/shell.jsx, view === "sales"): sx-hero + <TileGrid board="sales">.
   De widgets (saleskpis, salestaken, irisattn, pipeline, crm, relatiebeheer,
   finder, omzet) en de standaard-volgorde/pinning komen uit tiles.jsx (BOARDS.sales).
   Edit-modus, layout en de widget-markt leven in de shell en komen via Outlet-context,
   net als Dashboard en Vandaag. Sales blijft een custom-module achter ModuleGate
   (tenant 1 aan, tenant 2 403); de gate is de echte poort. */
import { useOutletContext } from 'react-router-dom'
import { ICONS } from '../design/icons'
import { AC, ACsoft, KyanoMark } from '../design/components.jsx'
import { TileGrid } from '../design/tiles.jsx'
import { useModuleSettings } from '../tenant/TenantProvider'
import ModuleOff from '../tenant/ModuleOff'

export default function SalesPage() {
  const { edit, layout, setLayout, openLib, go, flags, board } = useOutletContext()
  const { enabled } = useModuleSettings('sales')
  if (!enabled) return <ModuleOff label="Sales" />

  return (
    <div className="dash sales-board">
      <header className="sx-hero">
        <div className="sx-hero-logo" style={{ '--acc': AC('red'), '--acc-soft': ACsoft('red') }}>
          <span className="sx-hero-mark"><KyanoMark size={26} color={AC('red')} /></span>
        </div>
        <div className="sx-hero-id">
          <h1 className="sx-hero-h1">Sales</h1>
          <p className="sx-hero-sub mono">Je sales-overzicht, pipeline, klanten en omzet, aangestuurd door Hugo en Iris</p>
        </div>
      </header>
      {edit && (
        <div className="edit-hint mono">
          <span dangerouslySetInnerHTML={{ __html: ICONS('drag') }} />
          <span>Je Sales-werkruimte · sleep om te ordenen · tik <b>S / M / L / XL</b> voor de maat · <b>Widget toevoegen</b> opent de sales-widgets</span>
        </div>
      )}
      {layout && <TileGrid board={board} edit={edit} onOpen={go} layout={layout} setLayout={setLayout} flags={flags} onAddWidget={openLib} />}
    </div>
  )
}
