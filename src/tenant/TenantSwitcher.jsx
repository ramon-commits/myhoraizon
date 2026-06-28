/* TenantSwitcher — kies "Alle (CEO)" of een tenant. Switchen verandert direct de
   zichtbare modules (sidebar + ModuleGate lezen dezelfde tenant-config).
   Stijl: alleen inline + blueprint.css-tokens (var(--...)), geen brain-namen. */
import { useState, useRef, useEffect } from 'react'
import { ICONS } from '../design/icons'
import { useTenant } from './TenantProvider'

export default function TenantSwitcher() {
  const { tenants, activeTenant, switchTenant } = useTenant()
  const [open, setOpen] = useState(false)
  const ref = useRef(null)
  useEffect(() => {
    if (!open) return
    const h = (e) => { if (ref.current && !ref.current.contains(e.target)) setOpen(false) }
    window.addEventListener('pointerdown', h)
    return () => window.removeEventListener('pointerdown', h)
  }, [open])

  const label = activeTenant ? activeTenant.display_name : 'Alle (CEO)'
  const dot = activeTenant ? 'var(--a-teal)' : 'var(--a-purple)'

  const pick = (id) => { switchTenant(id); setOpen(false) }

  return (
    <div ref={ref} style={{ position: 'relative' }}>
      <button
        onClick={() => setOpen((v) => !v)}
        title="Wissel van werkruimte (tenant)"
        style={{
          display: 'inline-flex', alignItems: 'center', gap: 8,
          height: 30, padding: '0 10px', borderRadius: 9,
          background: 'var(--card)', border: '1px solid var(--line)',
          color: 'var(--ink)', font: '600 12.5px/1 var(--font-body, inherit)', cursor: 'pointer',
        }}
      >
        <span style={{ width: 7, height: 7, borderRadius: '50%', background: dot, flex: '0 0 auto' }} />
        <span style={{ maxWidth: 160, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{label}</span>
        <span style={{ display: 'inline-flex', width: 14, height: 14, color: 'var(--ink3)' }} dangerouslySetInnerHTML={{ __html: ICONS('chevron', { sw: 2.2 }) }} />
      </button>
      {open && (
        <div style={{
          position: 'absolute', top: 'calc(100% + 6px)', left: 0, zIndex: 70,
          minWidth: 240, background: 'var(--card)', border: '1px solid var(--line)',
          borderRadius: 12, boxShadow: 'var(--sh-lg)', padding: 6,
        }}>
          <div style={{ font: '700 10px/1 var(--font-mono, monospace)', letterSpacing: '.13em', textTransform: 'uppercase', color: 'var(--ink3)', padding: '6px 9px 8px' }}>
            Werkruimte
          </div>
          <SwitchRow label="Alle (CEO)" sub="ziet alles, geen filter" dot="var(--a-purple)" active={!activeTenant} onClick={() => pick(null)} />
          <div style={{ height: 1, background: 'var(--line)', margin: '6px 8px' }} />
          {tenants.map((t) => (
            <SwitchRow
              key={t.id}
              label={t.display_name}
              sub={t.package + ' · ' + t.custom_modules.length + ' extra modules'}
              dot="var(--a-teal)"
              active={activeTenant && activeTenant.id === t.id}
              onClick={() => pick(t.id)}
            />
          ))}
        </div>
      )}
    </div>
  )
}

function SwitchRow({ label, sub, dot, active, onClick }) {
  return (
    <button
      onClick={onClick}
      style={{
        display: 'flex', alignItems: 'center', gap: 10, width: '100%',
        padding: '8px 9px', borderRadius: 9, textAlign: 'left',
        background: active ? 'var(--bg-deep)' : 'transparent', border: 'none', cursor: 'pointer',
      }}
    >
      <span style={{ width: 8, height: 8, borderRadius: '50%', background: dot, flex: '0 0 auto' }} />
      <span style={{ flex: 1, minWidth: 0 }}>
        <span style={{ display: 'block', font: '600 13px/1.2 var(--font-body, inherit)', color: 'var(--ink)', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{label}</span>
        <span style={{ display: 'block', font: '500 11px/1.3 var(--font-mono, monospace)', color: 'var(--ink3)' }}>{sub}</span>
      </span>
      {active && <span style={{ display: 'inline-flex', width: 15, height: 15, color: 'var(--a-teal)' }} dangerouslySetInnerHTML={{ __html: ICONS('check', { sw: 2.4 }) }} />}
    </button>
  )
}
