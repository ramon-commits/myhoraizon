/* RelatiebeheerPage — /relatiebeheer: de Relatiebeheer-pagina uit de Claude
   Design-blauwdruk (salestasks.jsx · SalesRelatiePage): gedoseerde, instelbare
   CRM-signalen (stil gevallen, win-back, jaarlijkse momenten, openstaande
   offertes/facturen, reviews) + de klantenlijst met filters en het
   signaal-instelmenu achter het tandwiel. Geen tegelbord — een rustige
   lijst-pagina, precies als de blauwdruk. Werkvlak van de Sales-module
   (gate via ModuleGate -> 'sales', zie tenant/modules.js ROUTE_MODULE). */
import { useNavigate } from 'react-router-dom'
import { SalesRelatiePage } from '../design/salestasks.jsx'
import { useModuleSettings } from '../tenant/TenantProvider'
import ModuleOff from '../tenant/ModuleOff'

export default function RelatiebeheerPage() {
  const navigate = useNavigate()
  const go = (id) => { if (id) navigate('/' + id) }
  const { enabled } = useModuleSettings('sales')
  if (!enabled) return <ModuleOff label="Relatiebeheer" />

  return <SalesRelatiePage onOpen={go} />
}
