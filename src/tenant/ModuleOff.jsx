/* Kleine "module staat uit"-notitie voor wanneer een module via de tenant-config
   is uitgezet (module_settings.enabled === false). Gedeeld door alle pagina's.
   Stijl: inline + blueprint.css-tokens. */
import { ICONS } from '../design/icons'

export default function ModuleOff({ label }) {
  return (
    <div style={{ padding: '60px 34px', display: 'grid', placeItems: 'center' }}>
      <div style={{
        maxWidth: 420, textAlign: 'center', background: 'var(--card)',
        border: '1px solid var(--line)', borderRadius: 16, boxShadow: 'var(--sh-sm)', padding: '32px 28px',
      }}>
        <span style={{
          display: 'grid', placeItems: 'center', width: 48, height: 48, margin: '0 auto 14px',
          borderRadius: 12, color: 'var(--ink3)', background: 'var(--bg-deep)',
        }} dangerouslySetInnerHTML={{ __html: ICONS('lock', { sw: 1.8 }) }} />
        <h2 style={{ font: '700 18px/1.2 var(--font-display, inherit)', color: 'var(--ink)', margin: 0 }}>{label} staat uit</h2>
        <p style={{ marginTop: 8, font: '400 13.5px/1.5 var(--font-body, inherit)', color: 'var(--ink2)' }}>
          Deze module is voor deze werkruimte uitgezet in de instellingen.
        </p>
      </div>
    </div>
  )
}
