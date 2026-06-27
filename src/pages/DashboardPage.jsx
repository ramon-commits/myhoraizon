/* DashboardPage — de dashboard-content uit de Claude Design-blauwdruk, gebouwd
   op de gedeelde bouwstenen en (voorlopig) de demo-data uit data.js. De echte
   Supabase-koppeling volgt in een latere stap. */
import { useNavigate } from 'react-router-dom'
import { KYANO } from '../design/data'
import { Panel, KpiStrip } from '../design/components.jsx'
import { Greeting, DashboardTaskRow, AgendaTimeline, IrisVoorstellen } from '../design/dashboard.jsx'

export default function DashboardPage() {
  const navigate = useNavigate()
  const go = (id) => { if (id) navigate('/' + id) }
  const tasks = KYANO.tasks || []

  return (
    <div className="dash">
        <Greeting />

        <KpiStrip onOpen={go} count={4} editing={false} />

        <div className="dash-2col">
          <div className="dash-left">
            <Panel eyebrow="Vandaag, jouw acties" title="Wat er op je wacht" accent="teal">
              {tasks.map((t, i) => (
                <DashboardTaskRow key={i} t={t} i={i} onOpen={go} />
              ))}
            </Panel>
          </div>

          <div style={{ display: 'flex', flexDirection: 'column', gap: 22 }}>
            <Panel eyebrow="Vandaag in je agenda" title="Je dag" accent="teal">
              <AgendaTimeline />
            </Panel>
            <Panel eyebrow="Iris vraagt aandacht" title="Voorstellen" accent="purple">
              <IrisVoorstellen onOpen={go} />
            </Panel>
          </div>
        </div>
      </div>
  )
}
