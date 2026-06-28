/* FinderPage — /finder: de Leadfinder uit de Claude Design-blauwdruk
   (salescrm.jsx · FinderModule): branche-keuze → namaak-Maps met lat/lng-pins →
   leads goedkeuren naar het CRM. Werkvlak van de Sales-module
   (gate via ModuleGate -> 'sales', zie tenant/modules.js ROUTE_MODULE). */
import { useNavigate } from 'react-router-dom'
import { FinderModule } from '../design/leadfinder.jsx'
import { useModuleSettings } from '../tenant/TenantProvider'
import ModuleOff from '../tenant/ModuleOff'

export default function FinderPage() {
  const navigate = useNavigate()
  const go = (id) => { if (id) navigate('/' + id) }
  const { enabled } = useModuleSettings('sales')
  if (!enabled) return <ModuleOff label="Leadfinder" />

  return <FinderModule onOpen={go} />
}
