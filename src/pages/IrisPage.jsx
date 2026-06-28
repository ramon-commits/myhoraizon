/* IrisPage — /iris: het Iris-bord uit de Claude Design-blauwdruk
   (dashboard/shell.jsx, view === "iris"): IrisBoardHeader + <TileGrid board="iris">.
   Widgets (irisbrief, irischat, irisattn, irisflags, takenlog) komen uit
   tiles.jsx (BOARDS.iris); edit-modus/layout/markt via de Outlet-context.
   Iris is een core-view; de shell-ModuleGate regelt toegang. */
import { useOutletContext } from 'react-router-dom'
import { ICONS } from '../design/icons'
import { IrisBoardHeader } from '../design/iris.jsx'
import { TileGrid } from '../design/tiles.jsx'

export default function IrisPage() {
  const { edit, layout, setLayout, openLib, go, flags, board } = useOutletContext()
  return (
    <div className="dash iris-board">
      <IrisBoardHeader />
      {edit && (
        <div className="edit-hint mono">
          <span dangerouslySetInnerHTML={{ __html: ICONS('drag') }} />
          <span>Je Iris-werkruimte · sleep om te ordenen · tik <b>S / M / L / XL</b> voor de maat · <b>Widget toevoegen</b> opent de Iris-widgets</span>
        </div>
      )}
      {layout && <TileGrid board={board} edit={edit} onOpen={go} layout={layout} setLayout={setLayout} flags={flags} onAddWidget={openLib} />}
    </div>
  )
}
