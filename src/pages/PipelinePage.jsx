/* PipelinePage — /pipeline: het Pipeline-bord uit de Claude Design-blauwdruk
   (dashboard/salestasks.jsx · SalesPipelinePage). De pagina behoudt de TABS:
   - "Vandaag" = het bewerkbare tegelbord (<TileGrid board="pipeline">): de
     ApprovalQueue (SaleskansenWidget) + pipeline-taken (PipelineTakenWidget) +
     KPI's, met edit-modus/markt via de Outlet-context van AppShell.
   - "Bord"    = de Trello-kanban (SalesPipeline): deals slepen door de fases.
   Niet platgeslagen tot alleen de kanban. Sub-route van de Sales-module
   (gate via ModuleGate -> 'sales'). */
import { useOutletContext } from 'react-router-dom'
import { ICONS } from '../design/icons'
import { SalesPipelinePage } from '../design/salestasks.jsx'
import { TileGrid } from '../design/tiles.jsx'
import { openKlantCard } from '../design/objectactions.jsx'
import { useModuleSettings } from '../tenant/TenantProvider'
import ModuleOff from '../tenant/ModuleOff'

export default function PipelinePage() {
  const { edit, layout, setLayout, openLib, go, flags, board } = useOutletContext()
  const { enabled } = useModuleSettings('sales')
  if (!enabled) return <ModuleOff label="Pipeline" />

  return (
    <SalesPipelinePage
      onOpen={go}
      onCard={(id) => openKlantCard(id)}
      vandaagSlot={
        <>
          {edit && (
            <div className="edit-hint mono">
              <span dangerouslySetInnerHTML={{ __html: ICONS('drag') }} />
              <span>Je Pipeline-werkruimte · sleep om te ordenen · tik <b>S / M / L / XL</b> voor de maat · <b>Widget toevoegen</b> opent de pipeline-widgets</span>
            </div>
          )}
          {layout && <TileGrid board={board} edit={edit} onOpen={go} layout={layout} setLayout={setLayout} flags={flags} onAddWidget={openLib} />}
        </>
      }
    />
  )
}
