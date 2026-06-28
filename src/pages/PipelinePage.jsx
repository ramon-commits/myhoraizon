/* PipelinePage — /pipeline: de Trello-kanban uit de blauwdruk (SalesPipeline).
   Kolommen zijn fases, kaarten sleepbaar tussen fases, stale-/follow-up-signaal
   log-gebaseerd. Sub-route van de Sales-module (gate via ModuleGate -> 'sales'). */
import { useNavigate } from 'react-router-dom'
import { SalesPipeline } from '../design/sales.jsx'
import { KyanoMark } from '../design/components.jsx'
import { openKlantCard } from '../design/objectactions.jsx'
import { useModuleSettings } from '../tenant/TenantProvider'
import ModuleOff from '../tenant/ModuleOff'

export default function PipelinePage() {
  const navigate = useNavigate()
  const go = (id) => { if (id) navigate('/' + id) }
  const { enabled } = useModuleSettings('sales')
  if (!enabled) return <ModuleOff label="Pipeline" />

  return (
    <div className="module-page sales-suite">
      <header className="sx-hero">
        <div className="sx-hero-logo" style={{ '--acc': 'var(--a-red)', '--acc-soft': 'var(--a-red-soft)' }}>
          <span className="sx-hero-mark"><KyanoMark size={26} color="var(--a-red)" /></span>
        </div>
        <div className="sx-hero-id">
          <h1 className="sx-hero-h1">Pipeline</h1>
          <p className="sx-hero-sub mono">Sleep deals door je zelf-ingerichte pijplijn. Iris en Vandaag sturen dezelfde pijplijn aan.</p>
        </div>
      </header>
      <SalesPipeline onOpen={go} onCard={openKlantCard} />
    </div>
  )
}
