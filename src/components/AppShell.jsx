import { NavLink, Outlet, useNavigate } from 'react-router-dom'
import { LayoutDashboard, FileSignature, Receipt, ClipboardList, LogOut, MessageCircle } from 'lucide-react'
import { useAuth } from '../contexts/AuthContext'
import { useState } from 'react'

const NAV = [
  { to: '/', label: 'Dashboard', icon: LayoutDashboard, end: true },
  { to: '/offertes', label: 'Offertes', icon: ClipboardList },
  { to: '/contracten', label: 'Contracten', icon: FileSignature },
  { to: '/facturen', label: 'Facturen', icon: Receipt },
]

export default function AppShell() {
  const { email, signOut } = useAuth()
  const navigate = useNavigate()

  async function handleSignOut() {
    await signOut()
    navigate('/login')
  }

  return (
    <div style={{ minHeight: '100vh', display: 'grid', gridTemplateColumns: '240px 1fr', background: 'var(--color-bg)' }}>
      <aside style={{
        background: '#fff', borderRight: '1px solid var(--color-line)',
        display: 'flex', flexDirection: 'column', padding: '20px 16px',
      }}>
        <div style={{ marginBottom: 28 }}>
          <div style={{ font: '700 18px/1 var(--font-display)', letterSpacing: '-0.02em' }}>
            My<span className="italic-accent">HorAIzon</span>
          </div>
          <div style={{ marginTop: 4, fontSize: 11, color: 'var(--color-ink-dim)', letterSpacing: '0.08em', textTransform: 'uppercase' }}>
            klant-werkruimte
          </div>
        </div>

        <nav style={{ display: 'flex', flexDirection: 'column', gap: 4, flex: 1 }}>
          {NAV.map(({ to, label, icon: Icon, end }) => (
            <NavLink
              key={to}
              to={to}
              end={end}
              style={({ isActive }) => ({
                display: 'flex', alignItems: 'center', gap: 10,
                padding: '10px 12px', borderRadius: 8,
                textDecoration: 'none', fontSize: 14, fontWeight: 500,
                background: isActive ? 'var(--color-ink)' : 'transparent',
                color: isActive ? '#fff' : 'var(--color-ink)',
                transition: 'background 120ms',
              })}
            >
              <Icon size={16} strokeWidth={1.8} />
              {label}
            </NavLink>
          ))}
        </nav>

        <div style={{ borderTop: '1px solid var(--color-line)', paddingTop: 14, marginTop: 14 }}>
          <div style={{ fontSize: 11, color: 'var(--color-ink-dim)', marginBottom: 6 }}>Ingelogd als</div>
          <div style={{ fontSize: 13, fontWeight: 600, marginBottom: 10, overflowWrap: 'anywhere' }}>{email}</div>
          <button
            onClick={handleSignOut}
            style={{
              display: 'inline-flex', alignItems: 'center', gap: 6,
              background: 'transparent', border: '1px solid var(--color-line)',
              padding: '6px 12px', borderRadius: 8, fontSize: 12,
              color: 'var(--color-ink-dim)', cursor: 'pointer',
            }}
          >
            <LogOut size={12} /> Uitloggen
          </button>
        </div>
      </aside>

      <main style={{ minWidth: 0 }}>
        <Outlet />
      </main>

      <IrisWidget />
    </div>
  )
}

// Iris-widget — placeholder voor F4.5 / WhatsApp-koppeling. Voor nu een
// floating bubble rechtsonder die opent met een teaser-bericht.
function IrisWidget() {
  const [open, setOpen] = useState(false)
  return (
    <>
      <button
        onClick={() => setOpen((o) => !o)}
        title="Vraag het Iris"
        style={{
          position: 'fixed', bottom: 22, right: 22,
          width: 56, height: 56, borderRadius: '50%',
          background: 'linear-gradient(135deg, var(--color-kyano), var(--color-aqua-deep))',
          border: 'none', color: '#fff', cursor: 'pointer',
          boxShadow: '0 8px 24px rgba(79,184,178,0.40)',
          display: 'grid', placeItems: 'center', zIndex: 50,
        }}
      >
        <MessageCircle size={22} />
      </button>
      {open && (
        <div style={{
          position: 'fixed', bottom: 90, right: 22,
          width: 320, padding: 18, borderRadius: 14,
          background: '#fff', border: '1px solid var(--color-line-hi)',
          boxShadow: '0 16px 40px rgba(14,20,48,0.16)', zIndex: 50,
        }}>
          <div style={{ fontSize: 11, color: 'var(--color-kyano)', letterSpacing: '0.16em', textTransform: 'uppercase', fontWeight: 700 }}>
            Iris
          </div>
          <div style={{ marginTop: 8, font: '700 18px/1.2 var(--font-display)', letterSpacing: '-0.02em' }}>
            Hoi, ik kom <span className="italic-accent">eraan.</span>
          </div>
          <p style={{ marginTop: 10, fontSize: 13.5, color: 'var(--color-ink-soft)', lineHeight: 1.5 }}>
            Mijn chat-knop is bijna klaar. Stuur nu nog een mail of WhatsApp naar Ramon op{' '}
            <a href="mailto:ramon@endlessminds.nl" style={{ color: 'var(--color-kyano)' }}>ramon@endlessminds.nl</a>.
          </p>
          <div style={{ marginTop: 14, fontSize: 11, color: 'var(--color-ink-dim)' }}>
            Comt live in Fase 3 — directe chat met de directiesecretaresse.
          </div>
        </div>
      )}
    </>
  )
}
