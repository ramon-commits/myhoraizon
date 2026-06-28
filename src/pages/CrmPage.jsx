/* CrmPage — /crm: de volledige CRM uit de blauwdruk (salescrm.jsx · CrmModule2):
   tegelbord + instelbare kolommen/filters + KvK-nieuwe-klant-flow. 'clients' is
   core (altijd aan); de klantkaart die hier opent is gedeeld over alle modules.
   edit/layout/widget-markt komen via de AppShell-Outlet-context (board="crm"). */
import { useOutletContext } from 'react-router-dom'
import { CrmPage as CrmView } from '../design/crm.jsx'
import { useModuleSettings } from '../tenant/TenantProvider'
import ModuleOff from '../tenant/ModuleOff'

export default function CrmPage() {
  const ctx = useOutletContext()
  const { enabled } = useModuleSettings('clients')
  if (!enabled) return <ModuleOff label="CRM" />
  return <CrmView {...ctx} />
}
