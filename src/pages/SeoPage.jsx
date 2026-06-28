/* SeoPage — /seo: het Groei-bord uit de Claude Design-blauwdruk
   (dashboard/shell.jsx, view === "seo"): GroeiBoardHeader + <TileGrid board="seo">.
   Widgets (groeikpis, groeitaken, irisattn, analytics, paginas) komen uit
   tiles.jsx (BOARDS.seo); edit-modus/layout/markt via de Outlet-context. */
import { useOutletContext } from 'react-router-dom'
import { ICONS } from '../design/icons'
import { GroeiBoardHeader } from '../design/groei.jsx'
import { TileGrid } from '../design/tiles.jsx'

export default function SeoPage() {
  const { edit, layout, setLayout, openLib, go, flags, board } = useOutletContext()
  return (
    <div className="dash vandaag-board groei-board">
      <GroeiBoardHeader onOpen={go} />
      {edit && (
        <div className="edit-hint mono">
          <span dangerouslySetInnerHTML={{ __html: ICONS('drag') }} />
          <span>Je Groei-werkruimte · sleep om te ordenen · tik <b>S / M / L / XL</b> voor de maat · <b>Widget toevoegen</b> opent de markt</span>
        </div>
      )}
      {layout && <TileGrid board={board} edit={edit} onOpen={go} layout={layout} setLayout={setLayout} flags={flags} onAddWidget={openLib} />}
    </div>
  )
}
