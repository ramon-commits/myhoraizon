/* DashboardPage — het sleepbare tegel-dashboard uit de Claude Design-blauwdruk
   (tiles.jsx). Greeting + TileGrid; edit-modus, layout en widget-markt komen via
   de shell (Outlet-context). Draait op de demo-data uit data.js. */
import { useOutletContext } from 'react-router-dom'
import { ICONS } from '../design/icons'
import { Greeting } from '../design/dashboard.jsx'
import { TileGrid } from '../design/tiles.jsx'

export default function DashboardPage() {
  const { edit, layout, setLayout, openLib, go, flags, board } = useOutletContext()

  return (
    <div className="dash">
      <Greeting />
      {edit && (
        <div className="edit-hint mono">
          <span dangerouslySetInnerHTML={{ __html: ICONS('drag') }} />
          <span>Sleep om te ordenen · tik <b>S / M / L / XL</b> voor de maat · <b>×</b> verbergt een widget · <b>Widget toevoegen</b> opent de markt</span>
        </div>
      )}
      {layout && <TileGrid edit={edit} onOpen={go} layout={layout} setLayout={setLayout} flags={flags} onAddWidget={openLib} board={board} />}
    </div>
  )
}
