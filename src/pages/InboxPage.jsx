/* InboxPage — het postvak uit de Claude Design-blauwdruk (CommHub): meerdere
   kanalen, gesprekkenlijst, full-screen thread + contactpaneel. Draait op de
   demo-gesprekken uit data.js. De sidebar linkt hierheen via /postvak; /inbox
   is een alias. */
import { useNavigate } from 'react-router-dom'
import { KYANO } from '../design/data'
import { CommHub } from '../design/inbox.jsx'
import { useModuleSettings } from '../tenant/TenantProvider'
import ModuleOff from '../tenant/ModuleOff'

// De gesprekken-bron uit de demo-data (KYANO).
const CONVERSATIONS = (KYANO.modules.find((m) => m.id === 'vandaag') || {}).conversations || []

export default function InboxPage() {
  const navigate = useNavigate()
  const go = (id) => { if (id) navigate('/' + id) }
  // aan/uit + instellingen uit de tenant-config (SEAM: settings.channels stroomt
  // later naar de comms-engine zodat alleen ingeschakelde kanalen tonen)
  const { enabled } = useModuleSettings('postvak')
  if (!enabled) return <ModuleOff label="Inbox" />
  return <CommHub m={{ conversations: CONVERSATIONS }} onOpen={go} />
}
