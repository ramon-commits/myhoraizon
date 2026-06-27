/* InboxPage — het postvak uit de Claude Design-blauwdruk (CommHub): meerdere
   kanalen, gesprekkenlijst, full-screen thread + contactpaneel. Draait op de
   demo-gesprekken uit data.js. De sidebar linkt hierheen via /postvak; /inbox
   is een alias. */
import { useNavigate } from 'react-router-dom'
import { KYANO } from '../design/data'
import { CommHub } from '../design/inbox.jsx'

// De gesprekken-bron uit de demo-data (KYANO).
const CONVERSATIONS = (KYANO.modules.find((m) => m.id === 'vandaag') || {}).conversations || []

export default function InboxPage() {
  const navigate = useNavigate()
  const go = (id) => { if (id) navigate('/' + id) }
  return <CommHub m={{ conversations: CONVERSATIONS }} onOpen={go} />
}
