/* StudioPage — /studio: het Studio-bord uit de Claude Design-blauwdruk
   (dashboard/shell.jsx, view === "studio"): StudioBoardHeader + <TileGrid board="studio">.
   Widgets (studiokpis, studioconcepten, irisattn, editor, seo) komen uit
   tiles.jsx (BOARDS.studio); edit-modus/layout/markt via de Outlet-context. */
import { useOutletContext } from 'react-router-dom'
import { ICONS } from '../design/icons'
import { StudioBoardHeader } from '../design/studio.jsx'
import { TileGrid } from '../design/tiles.jsx'

export default function StudioPage() {
  const { edit, layout, setLayout, openLib, go, flags, board } = useOutletContext()
  return (
    <div className="dash vandaag-board studio-board">
      <StudioBoardHeader onOpen={go} />
      {edit && (
        <div className="edit-hint mono">
          <span dangerouslySetInnerHTML={{ __html: ICONS('drag') }} />
          <span>Je Studio-werkruimte · sleep om te ordenen · tik <b>S / M / L / XL</b> voor de maat · <b>Widget toevoegen</b> opent de markt</span>
        </div>
      )}
      {layout && <TileGrid board={board} edit={edit} onOpen={go} layout={layout} setLayout={setLayout} flags={flags} onAddWidget={openLib} />}
    </div>
  )
}
