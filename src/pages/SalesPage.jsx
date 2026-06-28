/* SalesPage — /sales: het Sales-overzicht uit de blauwdruk (SalesDash). Custom
   module 'sales': aan/uit via de tenant-config; ModuleGate is de echte poort. */
import { useNavigate } from 'react-router-dom'
import { SalesDash } from '../design/sales.jsx'
import { useModuleSettings } from '../tenant/TenantProvider'
import ModuleOff from '../tenant/ModuleOff'

export default function SalesPage() {
  const navigate = useNavigate()
  const go = (id) => { if (id) navigate('/' + id) }
  const { enabled } = useModuleSettings('sales')
  if (!enabled) return <ModuleOff label="Sales" />
  return <SalesDash onOpen={go} />
}
