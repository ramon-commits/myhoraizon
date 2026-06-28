/* VandaagPage — het Vandaag-bord uit de Claude Design-blauwdruk (pages.jsx):
   vaste bordkop (groet + commando) + sleepbaar tegelbord. De "Taken"-tegel is
   de VoorstellenWidget: agent-taken (CeoProposal), toewijzen aan teamleden
   (AssignAction), "Bij het team" (TeamAssignedSection), eigen taken en de
   taken-log. Edit-modus, layout en widget-markt komen via de shell. */
import { useOutletContext } from 'react-router-dom'
import { ICONS } from '../design/icons'
import { VandaagBoardHeader } from '../design/vandaag.jsx'
import { TileGrid } from '../design/tiles.jsx'
import { useModuleSettings } from '../tenant/TenantProvider'
import ModuleOff from '../tenant/ModuleOff'

export default function VandaagPage() {
  const { edit, layout, setLayout, openLib, go, flags, board } = useOutletContext()
  const { enabled } = useModuleSettings('vandaag')
  if (!enabled) return <ModuleOff label="Vandaag" />

  return (
    <div className="dash vandaag-board">
      <VandaagBoardHeader onOpen={go} />
      {edit && (
        <div className="edit-hint mono">
          <span dangerouslySetInnerHTML={{ __html: ICONS('drag') }} />
          <span>Je Vandaag-werkruimte · sleep om te ordenen · tik <b>S / M / L / XL</b> voor de maat · <b>Widget toevoegen</b> opent de markt</span>
        </div>
      )}
      {layout && <TileGrid board={board} edit={edit} onOpen={go} layout={layout} setLayout={setLayout} flags={flags} onAddWidget={openLib} />}
    </div>
  )
}
