import { useEffect, useRef, useState } from 'react'
import { useLocation, useNavigate } from 'react-router-dom'
import { X, Send, Loader2, MessageCircle } from 'lucide-react'
import IrisMark from './IrisMark'
import { useIrisChat } from '../hooks/useIrisChat'

// IrisChatPanel — floating chat-widget rechtsonder. Klik op bubble → opent
// panel. Verbind met iris-client-chat edge fn. Snelkoppelingen op basis van
// huidige route.
export default function IrisChatPanel() {
  const [open, setOpen] = useState(false)
  const location = useLocation()
  const navigate = useNavigate()
  const { messages, loading, sending, err, meta, loadHistory, sendMessage } = useIrisChat()
  const [input, setInput] = useState('')
  const scrollRef = useRef(null)

  // Open → laad history éénmalig
  useEffect(() => {
    if (open) loadHistory()
  }, [open, loadHistory])

  // Auto-scroll naar laatste bericht bij elke verandering
  useEffect(() => {
    if (open && scrollRef.current) {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight
    }
  }, [messages, sending, open])

  // Snelkoppelingen per pagina
  const quickPrompts = pageQuickPrompts(location.pathname)

  function handleSend(e) {
    e?.preventDefault()
    const text = input.trim()
    if (!text) return
    sendMessage(text, { current_page: location.pathname })
    setInput('')
  }
  function handleQuick(prompt) {
    sendMessage(prompt, { current_page: location.pathname })
  }

  return (
    <>
      {/* Floating bubble */}
      <button
        onClick={() => setOpen((o) => !o)}
        title={open ? 'Sluit chat' : 'Vraag het Iris'}
        aria-label={open ? 'Sluit chat met Iris' : 'Open chat met Iris'}
        style={{
          position: 'fixed', bottom: 22, right: 22,
          width: 56, height: 56, borderRadius: '50%',
          background: open ? '#fff' : 'linear-gradient(135deg, var(--color-kyano), var(--color-aqua-deep))',
          border: open ? '1px solid var(--color-line-hi)' : 'none',
          color: open ? 'var(--color-ink)' : '#fff', cursor: 'pointer',
          boxShadow: '0 8px 24px rgba(79,184,178,0.40)',
          display: 'grid', placeItems: 'center', zIndex: 60,
          transition: 'transform 150ms',
        }}
      >
        {open ? <X size={22} /> : <MessageCircle size={22} />}
      </button>

      {/* Panel */}
      {open && (
        <div style={panelStyle}>
          {/* Header */}
          <header style={headerStyle}>
            <IrisMark size={36} />
            <div style={{ flex: 1, minWidth: 0 }}>
              <div style={{ fontSize: 10.5, color: 'var(--color-kyano)', letterSpacing: '0.14em', textTransform: 'uppercase', fontWeight: 700 }}>
                Chat met Iris
              </div>
              <div style={{ font: '700 16px/1.15 var(--font-display)', letterSpacing: '-0.02em', marginTop: 2 }}>
                {meta?.company ? <>Hoi <span className="italic-accent">{meta.company.split(' ')[0]}.</span></> : 'Een moment.'}
              </div>
            </div>
            <button onClick={() => setOpen(false)} aria-label="Sluiten" style={closeButtonStyle}>
              <X size={16} />
            </button>
          </header>

          {/* Messages */}
          <div ref={scrollRef} style={messagesContainerStyle}>
            {loading && messages.length === 0 && (
              <div style={{ display: 'flex', alignItems: 'center', gap: 8, color: 'var(--color-ink-dim)', fontSize: 13 }}>
                <Loader2 size={14} style={{ animation: 'spin 1s linear infinite' }} /> Iris haalt je gesprek op…
              </div>
            )}
            {!loading && messages.length === 0 && (
              <Welcome meta={meta} pathname={location.pathname} navigate={navigate} />
            )}
            {messages.map((m, i) => (
              <Bubble key={i} role={m.role} content={m.content} failed={m._failed} />
            ))}
            {sending && <TypingBubble />}
            {err && (
              <div style={{ padding: 10, borderRadius: 8, background: 'rgba(193,58,51,0.10)', color: 'var(--color-miss)', fontSize: 12.5 }}>
                {err}
              </div>
            )}
          </div>

          {/* Quick prompts */}
          {!sending && messages.length < 6 && quickPrompts.length > 0 && (
            <div style={quickRowStyle}>
              {quickPrompts.map((q, i) => (
                <button key={i} onClick={() => handleQuick(q)} style={quickButtonStyle}>{q}</button>
              ))}
            </div>
          )}

          {/* Composer */}
          <form onSubmit={handleSend} style={composerStyle}>
            <textarea
              value={input}
              onChange={(e) => setInput(e.target.value)}
              onKeyDown={(e) => {
                if (e.key === 'Enter' && !e.shiftKey) { e.preventDefault(); handleSend() }
              }}
              placeholder="Antwoord Iris…"
              rows={1}
              disabled={sending}
              style={textareaStyle}
            />
            <button
              type="submit"
              disabled={!input.trim() || sending}
              aria-label="Versturen"
              style={{
                ...sendButtonStyle,
                background: input.trim() && !sending ? 'var(--color-ink)' : 'rgba(14,20,48,0.18)',
                cursor: input.trim() && !sending ? 'pointer' : 'default',
              }}
            >
              {sending ? <Loader2 size={14} style={{ animation: 'spin 1s linear infinite' }} /> : <Send size={14} />}
            </button>
          </form>

          <style>{`@keyframes spin { to { transform: rotate(360deg); } }
            @keyframes typing { 0%, 80%, 100% { transform: scale(0.7); opacity: 0.4; } 40% { transform: scale(1); opacity: 1; } }
          `}</style>
        </div>
      )}
    </>
  )
}

function Welcome({ meta, pathname, navigate }) {
  return (
    <div style={{ padding: 12, borderRadius: 12, background: 'rgba(79,184,178,0.08)', border: '1px solid rgba(79,184,178,0.25)' }}>
      <div style={{ fontSize: 13.5, color: 'var(--color-ink)', lineHeight: 1.5 }}>
        {meta?.name ? `Hoi ${String(meta.name).split(' ')[0]},` : 'Hoi,'} ik ben Iris. Vraag me iets over je offertes, contracten of facturen.
        {meta?.open_invoice && (
          <> Je hebt overigens een <strong>openstaande factuur</strong>, wil je de betaalgegevens zien?</>
        )}
      </div>
    </div>
  )
}

function Bubble({ role, content, failed }) {
  const isIris = role === 'assistant'
  return (
    <div style={{
      display: 'flex', alignItems: 'flex-end', gap: 8,
      alignSelf: isIris ? 'flex-start' : 'flex-end',
      maxWidth: '92%',
    }}>
      {isIris && <IrisMark size={20} />}
      <div style={{
        padding: '10px 13px', borderRadius: 14,
        background: isIris ? '#fff' : 'rgba(79,184,178,0.14)',
        border: `1px solid ${isIris ? 'var(--color-line)' : 'rgba(79,184,178,0.4)'}`,
        borderBottomLeftRadius: isIris ? 4 : 14,
        borderBottomRightRadius: isIris ? 14 : 4,
        font: '400 13.5px/1.5 var(--font-body)',
        color: failed ? 'var(--color-miss)' : 'var(--color-ink)',
        wordBreak: 'break-word', whiteSpace: 'pre-wrap',
        boxShadow: isIris ? '0 1px 3px rgba(14,20,48,0.04)' : 'none',
        opacity: failed ? 0.6 : 1,
      }}>
        {content}
        {failed && <div style={{ marginTop: 6, fontSize: 11, color: 'var(--color-miss)' }}>Niet verstuurd</div>}
      </div>
    </div>
  )
}

function TypingBubble() {
  return (
    <div style={{ display: 'flex', alignItems: 'flex-end', gap: 8, alignSelf: 'flex-start' }}>
      <IrisMark size={20} />
      <div style={{
        padding: '10px 14px', borderRadius: 14, borderBottomLeftRadius: 4,
        background: '#fff', border: '1px solid var(--color-line)',
        display: 'flex', gap: 4, alignItems: 'center',
      }}>
        {[0, 1, 2].map((i) => (
          <span key={i} style={{
            display: 'inline-block', width: 5, height: 5, borderRadius: '50%',
            background: 'var(--color-ink-dim)',
            animation: `typing 1.2s ${i * 0.15}s infinite ease-in-out`,
          }} />
        ))}
      </div>
    </div>
  )
}

function pageQuickPrompts(pathname) {
  if (pathname.startsWith('/offertes')) {
    return [
      'Wat staat er nog open?',
      'Wanneer hoor ik van Ramon?',
    ]
  }
  if (pathname.startsWith('/contracten')) {
    return [
      'Wat houdt mijn opzegtermijn in?',
      'Hoe teken ik?',
    ]
  }
  if (pathname.startsWith('/facturen')) {
    return [
      'Naar welk IBAN moet ik overmaken?',
      'Heb ik nog openstaande facturen?',
    ]
  }
  // Dashboard / overige
  return [
    'Wat is mijn pakket?',
    'Welke modules heb ik?',
    'Wanneer is mijn kick-off?',
  ]
}

// ─────────────────────────────────────────────────────────────────────
// Styles
// ─────────────────────────────────────────────────────────────────────

const panelStyle = {
  position: 'fixed',
  bottom: 90, right: 22,
  width: 'min(400px, calc(100vw - 32px))',
  height: 'min(580px, calc(100vh - 120px))',
  background: '#fff',
  border: '1px solid var(--color-line-hi)',
  borderRadius: 16,
  boxShadow: '0 16px 48px rgba(14,20,48,0.18)',
  zIndex: 60,
  display: 'flex', flexDirection: 'column',
  overflow: 'hidden',
}

const headerStyle = {
  display: 'flex', alignItems: 'center', gap: 12,
  padding: '14px 16px',
  borderBottom: '1px solid var(--color-line)',
  background: '#fff',
  flex: '0 0 auto',
}

const closeButtonStyle = {
  background: 'transparent', border: 'none', cursor: 'pointer',
  width: 28, height: 28, borderRadius: 8,
  color: 'var(--color-ink-dim)',
  display: 'grid', placeItems: 'center',
}

const messagesContainerStyle = {
  flex: 1, minHeight: 0,
  padding: '14px 16px',
  overflowY: 'auto',
  display: 'flex', flexDirection: 'column', gap: 8,
  background: 'var(--color-bg)',
}

const quickRowStyle = {
  display: 'flex', gap: 6,
  padding: '8px 12px',
  borderTop: '1px solid var(--color-line)',
  background: '#fff',
  flexWrap: 'wrap', flex: '0 0 auto',
}

const quickButtonStyle = {
  background: 'transparent',
  border: '1px solid var(--color-line)',
  borderRadius: 999,
  padding: '6px 12px',
  fontSize: 12, fontWeight: 500,
  color: 'var(--color-ink-soft)',
  cursor: 'pointer',
  whiteSpace: 'nowrap',
}

const composerStyle = {
  display: 'flex', alignItems: 'flex-end', gap: 8,
  padding: '12px 14px',
  borderTop: '1px solid var(--color-line)',
  background: '#fff',
  flex: '0 0 auto',
}

const textareaStyle = {
  flex: 1,
  border: '1px solid var(--color-line)',
  borderRadius: 10,
  padding: '10px 12px',
  fontFamily: 'var(--font-body)',
  fontSize: 13.5, lineHeight: 1.4,
  resize: 'none',
  maxHeight: 100,
  outline: 'none',
}

const sendButtonStyle = {
  width: 38, height: 38, borderRadius: 10,
  border: 'none',
  color: '#fff',
  display: 'grid', placeItems: 'center',
}
