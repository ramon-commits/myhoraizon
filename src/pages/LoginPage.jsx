import { useState } from 'react'
import { Navigate } from 'react-router-dom'
import { Mail, Loader2 } from 'lucide-react'
import { supabase } from '../lib/supabase'
import { useAuth } from '../contexts/AuthContext'

export default function LoginPage() {
  const { session, loading } = useAuth()
  const [email, setEmail] = useState('')
  const [submitting, setSubmitting] = useState(false)
  const [sent, setSent] = useState(false)
  const [err, setErr] = useState(null)
  const [devPassword, setDevPassword] = useState('')
  const [devBusy, setDevBusy] = useState(false)

  async function handleDevLogin(e) {
    e.preventDefault()
    setDevBusy(true)
    setErr(null)
    try {
      const { error } = await supabase.auth.signInWithPassword({
        email: email.trim().toLowerCase(),
        password: devPassword,
      })
      if (error) throw error
      // AuthContext pakt de sessie op via onAuthStateChange en redirect naar /.
    } catch (e) {
      setErr(e.message)
    } finally {
      setDevBusy(false)
    }
  }

  if (loading) return null
  if (session) return <Navigate to="/" replace />

  async function handleSubmit(e) {
    e.preventDefault()
    setSubmitting(true)
    setErr(null)
    try {
      const { error } = await supabase.auth.signInWithOtp({
        email: email.trim().toLowerCase(),
        options: {
          emailRedirectTo: window.location.origin + '/auth/callback',
        },
      })
      if (error) throw error
      setSent(true)
    } catch (e) {
      setErr(e.message)
    } finally {
      setSubmitting(false)
    }
  }

  return (
    <div style={{
      minHeight: '100vh', display: 'grid', placeItems: 'center',
      background: 'var(--color-bg)', padding: 24,
    }}>
      <div style={{
        width: '100%', maxWidth: 420, background: '#fff',
        border: '1px solid var(--color-line)', borderRadius: 16,
        padding: 36, boxShadow: '0 12px 40px rgba(14,20,48,0.06)',
      }}>
        <div style={{ marginBottom: 28 }}>
          <div className="hz-kicker">welkom bij Kyano</div>
          <h1 style={{
            marginTop: 10, font: '700 28px/1.1 var(--font-display)',
            letterSpacing: '-0.025em',
          }}>
            My<span className="italic-accent">HorAIzon</span>
          </h1>
          <p style={{
            marginTop: 8, fontSize: 14, color: 'var(--color-ink-soft)',
            lineHeight: 1.5,
          }}>
            Je werkruimte bij Kyano: offertes, contracten, facturen en alles wat Iris voor je doet.
          </p>
        </div>

        {sent ? (
          <div style={{
            padding: 16, borderRadius: 12,
            background: 'rgba(79,184,178,0.10)', border: '1px solid rgba(79,184,178,0.35)',
          }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 6 }}>
              <Mail size={16} color="var(--color-kyano)" />
              <strong style={{ fontSize: 14 }}>Check je inbox</strong>
            </div>
            <p style={{ fontSize: 13, color: 'var(--color-ink-soft)', lineHeight: 1.5, margin: 0 }}>
              Ik heb een inlog-link gestuurd naar <strong>{email}</strong>. Klik op de link en je bent binnen.
              De link werkt 1 uur. Niet ontvangen? Check je spam of probeer opnieuw.
            </p>
          </div>
        ) : (
          <form onSubmit={handleSubmit}>
            <label style={{ display: 'block', fontSize: 12, fontWeight: 600, color: 'var(--color-ink-dim)', marginBottom: 6 }}>
              Je email-adres
            </label>
            <input
              type="email"
              required
              autoFocus
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="naam@bedrijf.nl"
              style={{
                width: '100%', padding: '11px 14px',
                border: '1px solid var(--color-line-hi)', borderRadius: 10,
                fontSize: 14, fontFamily: 'var(--font-body)',
              }}
            />
            <p style={{ marginTop: 8, fontSize: 11.5, color: 'var(--color-ink-dim)', lineHeight: 1.4 }}>
              Gebruik hetzelfde email-adres als waarmee je de Discovery hebt gedaan, zodat je je offertes en facturen ziet.
            </p>
            {err && (
              <p style={{ marginTop: 10, fontSize: 13, color: 'var(--color-miss)' }}>{err}</p>
            )}
            <button
              type="submit"
              disabled={submitting || !email.trim()}
              style={{
                marginTop: 18, width: '100%', padding: '12px 16px',
                border: 'none', borderRadius: 10,
                background: submitting || !email.trim() ? '#cbd5e1' : 'var(--color-ink)',
                color: '#fff', fontFamily: 'var(--font-body)', fontWeight: 600, fontSize: 14,
                cursor: submitting || !email.trim() ? 'wait' : 'pointer',
                display: 'inline-flex', alignItems: 'center', justifyContent: 'center', gap: 8,
              }}
            >
              {submitting ? <Loader2 size={14} style={{ animation: 'spin 1s linear infinite' }} /> : <Mail size={14} />}
              {submitting ? 'Versturen…' : 'Stuur me een inlog-link'}
            </button>
            <style>{`@keyframes spin { to { transform: rotate(360deg); } }`}</style>
          </form>
        )}

        {import.meta.env.DEV && (
          <form onSubmit={handleDevLogin} style={{ marginTop: 20, paddingTop: 16, borderTop: '1px dashed var(--color-line-hi)' }}>
            <div style={{ fontSize: 11, fontWeight: 700, color: 'var(--color-ink-dim)', letterSpacing: '0.08em', textTransform: 'uppercase', marginBottom: 8 }}>
              Dev-login (mail omzeilen)
            </div>
            <input
              type="password"
              value={devPassword}
              onChange={(e) => setDevPassword(e.target.value)}
              placeholder="Wachtwoord van de test-user"
              style={{
                width: '100%', padding: '10px 14px',
                border: '1px solid var(--color-line-hi)', borderRadius: 10,
                fontSize: 14, fontFamily: 'var(--font-body)',
              }}
            />
            <button
              type="submit"
              disabled={devBusy || !email.trim() || !devPassword}
              style={{
                marginTop: 10, width: '100%', padding: '10px 16px',
                border: '1px solid var(--color-line-hi)', borderRadius: 10,
                background: '#fff', color: 'var(--color-ink)',
                fontFamily: 'var(--font-body)', fontWeight: 600, fontSize: 13,
                cursor: devBusy || !email.trim() || !devPassword ? 'default' : 'pointer',
                opacity: devBusy || !email.trim() || !devPassword ? 0.5 : 1,
              }}
            >
              {devBusy ? 'Inloggen...' : 'Log in met wachtwoord'}
            </button>
            <p style={{ marginTop: 8, fontSize: 11, color: 'var(--color-ink-dim)', lineHeight: 1.4 }}>
              Alleen zichtbaar in dev. Vul hierboven je email in plus dit wachtwoord.
            </p>
          </form>
        )}
      </div>
    </div>
  )
}
