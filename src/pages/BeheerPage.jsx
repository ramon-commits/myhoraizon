/* BeheerPage — /beheer: het Kyano AI Studio · Beheer-dashboard uit de Claude
   Design-blauwdruk (dashboard/kyanobeheer.jsx · KyanoBeheer). Alleen voor Kyano
   Superadmin: in de repo-ruggengraat is dat de CEO-allesweergave
   (activeTenant === null). Staat een specifieke klant-tenant actief, dan is dit
   scherm afgeschermd — net als de Team-rollen in het Design. */
import { useNavigate } from 'react-router-dom'
import { ICONS } from '../design/icons'
import { KyanoBeheer } from '../design/kyanobeheer.jsx'
import { useTenant } from '../tenant/TenantProvider'

export default function BeheerPage() {
  const navigate = useNavigate()
  const go = (id) => { if (id) navigate('/' + id) }
  const { activeTenant } = useTenant()

  // Kyano-gate: alleen de CEO/Kyano-allesweergave (geen actieve klant-tenant).
  if (activeTenant) {
    return (
      <div style={{ padding: '60px 34px', display: 'grid', placeItems: 'center' }}>
        <div style={{ maxWidth: 420, textAlign: 'center', background: 'var(--card)', border: '1px solid var(--line)', borderRadius: 16, boxShadow: 'var(--sh-sm)', padding: '32px 28px' }}>
          <span style={{ display: 'grid', placeItems: 'center', width: 48, height: 48, margin: '0 auto 14px', borderRadius: 12, color: 'var(--ink3)', background: 'var(--bg-deep)' }} dangerouslySetInnerHTML={{ __html: ICONS('shield', { sw: 1.8 }) }} />
          <h2 style={{ font: '700 18px/1.2 var(--font-display, inherit)', color: 'var(--ink)', margin: 0 }}>Alleen voor Kyano</h2>
          <p style={{ marginTop: 8, font: '400 13.5px/1.5 var(--font-body, inherit)', color: 'var(--ink2)' }}>
            Het beheer-dashboard is voorbehouden aan de Kyano Superadmin. Schakel via de tenant-switcher naar de Kyano-allesweergave.
          </p>
        </div>
      </div>
    )
  }

  return <KyanoBeheer onOpen={go} />
}
