import { NavLink, Outlet, useNavigate } from 'react-router-dom'
import { LogOut } from 'lucide-react'
import { useAuth } from '../contexts/AuthContext'
import { NAV_GROUPS } from '../nav'
import IrisChatPanel from './IrisChatPanel'
import { ToastHost, ConfirmHost } from '../design/store.jsx'

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
        display: 'flex', flexDirection: 'column',
        height: '100vh', position: 'sticky', top: 0,
      }}>
        <div style={{ padding: '20px 16px 12px' }}>
          <div style={{ font: '700 18px/1 var(--font-display)', letterSpacing: '-0.02em' }}>
            My<span className="italic-accent">HorAIzon</span>
          </div>
          <div style={{ marginTop: 4, fontSize: 11, color: 'var(--color-ink-dim)', letterSpacing: '0.08em', textTransform: 'uppercase' }}>
            klant-werkruimte
          </div>
        </div>

        <nav style={{ flex: 1, minHeight: 0, overflowY: 'auto', padding: '4px 16px 16px' }}>
          {NAV_GROUPS.map((group, gi) => (
            <div key={group.label}>
              <div style={{ ...groupLabelStyle, marginTop: gi === 0 ? 0 : 18 }}>{group.label}</div>
              <div style={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
                {group.items.map(({ to, label, icon: Icon, end }) => (
                  <NavLink
                    key={to}
                    to={to}
                    end={end}
                    style={({ isActive }) => ({
                      display: 'flex', alignItems: 'center', gap: 10,
                      padding: '8px 12px', borderRadius: 8,
                      textDecoration: 'none', fontSize: 13.5, fontWeight: 500,
                      background: isActive ? 'var(--color-ink)' : 'transparent',
                      color: isActive ? '#fff' : 'var(--color-ink)',
                      transition: 'background 120ms',
                    })}
                  >
                    <Icon size={16} strokeWidth={1.8} style={{ flex: '0 0 auto' }} />
                    {label}
                  </NavLink>
                ))}
              </div>
            </div>
          ))}
        </nav>

        <div style={{ borderTop: '1px solid var(--color-line)', padding: '14px 16px' }}>
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
      <ToastHost />
      <ConfirmHost />
    </div>
  )
}

const groupLabelStyle = {
  fontFamily: 'var(--font-mono)',
  fontSize: 10,
  fontWeight: 700,
  letterSpacing: '0.14em',
  textTransform: 'uppercase',
  color: 'var(--color-ink-dim)',
  padding: '0 12px',
  marginBottom: 6,
}
