import { Link, useParams } from 'react-router-dom'
import { ArrowLeft } from 'lucide-react'
import { useMyQuote } from '../hooks/useMine'
import { formatMoney, formatDate } from '../lib/format'

export default function QuoteDetailPage() {
  const { id } = useParams()
  const { data: quote, isLoading, error } = useMyQuote(id)

  if (isLoading) return <Centered>Laden…</Centered>
  if (error) return <Centered tone="err">{error.message}</Centered>
  if (!quote) return <Centered>Niet gevonden.</Centered>

  const s = quote.session || {}

  return (
    <div style={{ padding: '24px 36px', maxWidth: 900, margin: '0 auto' }}>
      <Link to="/offertes" style={{ display: 'inline-flex', alignItems: 'center', gap: 6, color: 'var(--color-ink-dim)', textDecoration: 'none', fontSize: 13, marginBottom: 16 }}>
        <ArrowLeft size={14} /> Alle offertes
      </Link>

      <div style={{ background: '#fff', border: '1px solid var(--color-line)', borderRadius: 14, padding: 32 }}>
        <div className="hz-kicker">je offerte van Kyano</div>
        <h1 style={{ marginTop: 8, font: '700 28px/1.1 var(--font-display)', letterSpacing: '-0.025em' }}>
          Kyano <span className="italic-accent">{quote.package === 'business' ? 'Business' : quote.package === 'enterprise' ? 'Enterprise' : 'Starter'}</span>
        </h1>
        <p style={{ marginTop: 6, color: 'var(--color-ink-soft)', fontSize: 14 }}>
          Voor {s.prospect_company || 'je bedrijf'}. Aangemaakt {formatDate(quote.created_at)}.
        </p>

        <div style={{
          marginTop: 24, padding: 20, borderRadius: 12,
          background: 'var(--color-cream)',
          display: 'flex', justifyContent: 'space-between', alignItems: 'center',
        }}>
          <div>
            <div style={{ fontSize: 11, color: 'var(--color-ink-dim)', letterSpacing: '0.08em', textTransform: 'uppercase' }}>Maandprijs</div>
            <div style={{ fontSize: 26, fontWeight: 700, marginTop: 4 }}>{formatMoney(quote.monthly_price)}</div>
            <div style={{ fontSize: 11, color: 'var(--color-ink-dim)' }}>excl. BTW, maandelijks opzegbaar</div>
          </div>
          <div style={{ textAlign: 'right' }}>
            <div style={{ fontSize: 11, color: 'var(--color-ink-dim)', letterSpacing: '0.08em', textTransform: 'uppercase' }}>Status</div>
            <div style={{ fontSize: 16, fontWeight: 600, marginTop: 4, color: 'var(--color-kyano)' }}>
              {quote.status === 'accepted' ? 'Geaccepteerd' : quote.status === 'sent' ? 'Naar jou gestuurd' : 'In behandeling'}
            </div>
          </div>
        </div>

        {Array.isArray(quote.scope_items) && quote.scope_items.length > 0 && (
          <>
            <h2 style={{ marginTop: 28, font: '700 16px/1 var(--font-display)' }}>Wat je krijgt</h2>
            <ol style={{ listStyle: 'none', padding: 0, margin: '12px 0 0' }}>
              {quote.scope_items.map((item, i) => (
                <li key={i} style={{ display: 'flex', gap: 12, padding: '8px 0', borderBottom: '1px solid var(--color-line)', fontSize: 14 }}>
                  <span style={{ color: 'var(--color-kyano)', fontWeight: 700, fontFamily: 'var(--font-mono)', fontSize: 13, flex: '0 0 28px' }}>{String(i + 1).padStart(2, '0')}</span>
                  <span>{item}</span>
                </li>
              ))}
            </ol>
          </>
        )}

        {quote.rationale && (
          <>
            <h2 style={{ marginTop: 28, font: '700 16px/1 var(--font-display)' }}>Waarom dit voorstel</h2>
            <p style={{ marginTop: 12, fontSize: 14, lineHeight: 1.6, color: 'var(--color-ink-soft)', whiteSpace: 'pre-wrap' }}>
              {quote.rationale}
            </p>
          </>
        )}

        <div style={{ marginTop: 32, padding: 16, borderRadius: 10, background: 'rgba(79,184,178,0.08)', border: '1px solid rgba(79,184,178,0.25)' }}>
          <strong style={{ fontSize: 14 }}>Vragen of opmerkingen?</strong>
          <p style={{ marginTop: 6, fontSize: 13, color: 'var(--color-ink-soft)', lineHeight: 1.5 }}>
            Mail of bel Ramon op <a href="mailto:ramon@endlessminds.nl" style={{ color: 'var(--color-kyano)' }}>ramon@endlessminds.nl</a>. Dan lopen we het samen door.
          </p>
        </div>
      </div>
    </div>
  )
}

function Centered({ children, tone }) {
  return (
    <div style={{ padding: 32, color: tone === 'err' ? 'var(--color-miss)' : 'var(--color-ink-dim)' }}>{children}</div>
  )
}
