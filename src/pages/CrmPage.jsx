/* CrmPage — /crm: de CRM-pagina (NL-kaart + klantenlijst). 'clients' is core
   (altijd aan); de klantkaart die hier opent is gedeeld over alle modules. */
import { CrmPage as CrmView } from '../design/crm.jsx'
import { useModuleSettings } from '../tenant/TenantProvider'
import ModuleOff from '../tenant/ModuleOff'

export default function CrmPage() {
  const { enabled } = useModuleSettings('clients')
  if (!enabled) return <ModuleOff label="CRM" />
  return <CrmView />
}
