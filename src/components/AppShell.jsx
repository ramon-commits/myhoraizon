import { NavLink, Outlet, useNavigate } from 'react-router-dom'
import { LayoutDashboard, FileSignature, Receipt, ClipboardList, LogOut } from 'lucide-react'
import { useAuth } from '../contexts/AuthContext'
import IrisChatPanel from './IrisChatPanel'

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

      <IrisChatPanel />
    </div>
  )
}
