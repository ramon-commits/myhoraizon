import { useCallback, useEffect, useRef, useState } from 'react'
import { supabase } from '../lib/supabase'

const SUPABASE_URL = import.meta.env.VITE_SUPABASE_URL
const SUPABASE_ANON = import.meta.env.VITE_SUPABASE_ANON_KEY

// useIrisChat — beheert klant <-> Iris conversation via iris-client-chat
// edge fn. Houdt local message-state + Supabase auth-token bij elke call.
export function useIrisChat() {
  const [messages, setMessages] = useState([])
  const [loading, setLoading] = useState(false)
  const [sending, setSending] = useState(false)
  const [err, setErr] = useState(null)
  const [meta, setMeta] = useState(null) // { company, name, first_name, open_invoice, signed_contract }
  const loadedRef = useRef(false)

  const fetchToken = useCallback(async () => {
    const { data } = await supabase.auth.getSession()
    return data.session?.access_token ?? null
  }, [])

  const call = useCallback(async (body) => {
    const token = await fetchToken()
    if (!token) throw new Error('niet ingelogd')
    const r = await fetch(`${SUPABASE_URL}/functions/v1/iris-client-chat`, {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${token}`,
        'apikey': SUPABASE_ANON,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(body),
    })
    const j = await r.json().catch(() => ({}))
    if (!r.ok) throw new Error(j.error || `HTTP ${r.status}`)
    return j
  }, [fetchToken])

  // Laad history bij eerste open
  const loadHistory = useCallback(async () => {
    if (loadedRef.current) return
    loadedRef.current = true
    setLoading(true)
    setErr(null)
    try {
      const r = await call({ load_history: true })
      const conv = Array.isArray(r.conversation) ? r.conversation : []
      setMessages(conv.map((m) => ({ role: m.role, content: m.content, at: m.at })))
      setMeta({ company: r.company, name: r.name, first_name: r.first_name })
    } catch (e) {
      setErr(e.message)
    } finally {
      setLoading(false)
    }
  }, [call])

  const sendMessage = useCallback(async (text, options = {}) => {
    const trimmed = String(text || '').trim()
    if (!trimmed || sending) return
    setSending(true)
    setErr(null)
    const nowIso = new Date().toISOString()
    // optimistic add
    setMessages((prev) => [...prev, { role: 'user', content: trimmed, at: nowIso }])
    try {
      const r = await call({
        message: trimmed,
        current_page: options.current_page,
      })
      setMessages((prev) => [...prev, {
        role: 'assistant',
        content: r.response,
        at: new Date().toISOString(),
        classification: r.classification,
      }])
      if (r.context_summary) setMeta((m) => ({ ...m, ...r.context_summary }))
    } catch (e) {
      setErr(e.message)
      // Marker laatste user-bericht als faal
      setMessages((prev) => prev.map((m, i) =>
        i === prev.length - 1 && m.role === 'user' ? { ...m, _failed: true } : m,
      ))
    } finally {
      setSending(false)
    }
  }, [call, sending])

  return { messages, loading, sending, err, meta, loadHistory, sendMessage }
}
