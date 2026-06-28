/* ModuleGate — de echte toegangspoort. Wrapt de route-inhoud: leidt de huidige
   route af naar een module-key, draait checkModuleAccess tegen de actieve tenant.
   allowed → render children. module_not_enabled → nette 403-panel.
   CEO-allesweergave (tenant null) → altijd toegang.
   Stijl: alleen inline + blueprint.css-tokens, geen brain-var-namen. */
import { useLocation } from 'react-router-dom'
import { ICONS } from '../design/icons'
import { useTenant } from './TenantProvider'
import { moduleByRoute } from './modules'
import { checkModuleAccess } from './access'

export default function ModuleGate({ children }) {
  const location = useLocation()
  const { activeTenant } = useTenant()

  const seg = location.pathname.split('/')[1] || ''
  const mod = moduleByRoute(seg)
  // Geen getenant-gate-module (bv. /offertes, /agenda) → vrij toegankelijk.
  if (!mod) return children

  const res = checkModuleAccess(activeTenant, mod.key)
  if (res.allowed) return children

  return (
    <div style={{ padding: '60px 34px', display: 'grid', placeItems: 'center' }}>
      <div style={{
        maxWidth: 460, width: '100%', textAlign: 'center',
        background: 'var(--card)', border: '1px solid var(--line)',
        borderRadius: 18, boxShadow: 'var(--sh-md)', padding: '36px 32px',
      }}>
        <span style={{
          display: 'grid', placeItems: 'center', width: 52, height: 52, margin: '0 auto 16px',
          borderRadius: 14, color: 'var(--a-orange)', background: 'var(--a-orange-soft)',
        }} dangerouslySetInnerHTML={{ __html: ICONS('lock', { sw: 1.8 }) }} />
        <h2 style={{ font: '700 20px/1.2 var(--font-display, inherit)', color: 'var(--ink)', margin: 0 }}>
          {mod.label} staat niet aan
        </h2>
        <p style={{ marginTop: 10, font: '400 14px/1.55 var(--font-body, inherit)', color: 'var(--ink2)' }}>
          Deze module is niet geactiveerd voor <b>{activeTenant ? activeTenant.display_name : 'deze werkruimte'}</b>.
          Activeer hem in het pakket om hem te gebruiken.
        </p>
        <div style={{
          marginTop: 16, display: 'inline-flex', gap: 8, alignItems: 'center',
          font: '600 11px/1 var(--font-mono, monospace)', letterSpacing: '.06em',
          color: 'var(--ink3)', background: 'var(--bg-deep)', padding: '7px 11px', borderRadius: 8,
        }}>
          <span>reden: {res.reason}</span>
          <span style={{ color: 'var(--line2)' }}>·</span>
          <span>module: {mod.key}</span>
          <span style={{ color: 'var(--line2)' }}>·</span>
          <span>{res.module_kind}</span>
        </div>
      </div>
    </div>
  )
}
