import { useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { useAuth } from '../contexts/AuthContext'

// Supabase magic-link landing. Auth-detect-in-url=true (default in lib/supabase)
// pakt de hash op en stelt session in. Wij wachten tot session loads
// en redirecten dan naar dashboard.
export default function AuthCallback() {
  const { session, loading } = useAuth()
  const navigate = useNavigate()

  useEffect(() => {
    if (!loading) {
      navigate(session ? '/' : '/login', { replace: true })
    }
  }, [session, loading, navigate])

  return (
    <div style={{ minHeight: '100vh', display: 'grid', placeItems: 'center' }}>
      <div style={{ color: 'var(--color-ink-dim)', fontSize: 14 }}>Even inloggen…</div>
    </div>
  )
}
