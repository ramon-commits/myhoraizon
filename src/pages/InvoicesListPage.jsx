import { Link } from 'react-router-dom'
import { Receipt, ChevronRight, Check, AlertTriangle } from 'lucide-react'
import { useMyInvoices } from '../hooks/useMine'
import { formatMoney, formatDate } from '../lib/format'
import PageHeader from '../components/PageHeader'
import EmptyState from '../components/EmptyState'

const STATUS = {
  draft: { label: 'Concept', bg: 'rgba(0,0,0,0.06)', fg: '#5C648A' },
  sent: { label: 'Te betalen', bg: 'rgba(238,160,58,0.15)', fg: '#A66020' },
  paid: { label: 'Betaald', bg: 'rgba(47,122,74,0.12)', fg: '#2F7A4A' },
  overdue: { label: 'Vervallen', bg: 'rgba(193,58,51,0.12)', fg: '#C13A33' },
}

export default function InvoicesListPage() {
  const { data, isLoading, error } = useMyInvoices()
  const today = new Date()
  const enriched = (data ?? []).map((i) => ({
    ...i,
    _eff: i.status === 'sent' && i.due_date && new Date(i.due_date) < today ? 'overdue' : i.status,
  }))
  const outstanding = enriched.filter((i) => i._eff === 'sent' || i._eff === 'overdue').reduce((s, i) => s + Number(i.total || 0), 0)

  return (
    <div style={{ padding: '32px 36px', maxWidth: 960, margin: '0 auto' }}>
      <PageHeader
        kicker="jouw facturen"
        title="Facturen"
        right={outstanding > 0 ? (
          <div style={{ textAlign: 'right' }}>
            <div style={{ fontSize: 11, color: 'var(--color-ink-dim)', letterSpacing: '0.08em', textTransform: 'uppercase' }}>Openstaand</div>
            <div style={{ fontSize: 18, fontWeight: 700, color: '#A66020' }}>{formatMoney(outstanding)}</div>
          </div>
        ) : null}
      />
      {isLoading ? (
        <p style={{ color: 'var(--color-ink-dim)' }}>Laden…</p>
      ) : error ? (
        <p style={{ color: 'var(--color-miss)' }}>{error.message}</p>
      ) : !enriched.length ? (
        <EmptyState
          icon={Receipt}
          title="Nog geen facturen"
          description="Zodra je contract getekend is verschijnt de eerste factuur hier."
        />
      ) : (
        <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
          {enriched.map((i) => {
            const s = STATUS[i._eff] || STATUS.draft
            return (
              <Link key={i.id} to={`/facturen/${i.id}`} style={cardLink}>
                <div style={{ flex: 1, minWidth: 0 }}>
                  <div style={{ display: 'flex', alignItems: 'baseline', gap: 10, marginBottom: 4 }}>
                    <strong style={{ fontSize: 15 }}>{i.invoice_number}</strong>
                    <span style={{ color: 'var(--color-ink-dim)', fontSize: 12 }}>{i.client_company}</span>
                  </div>
                  <div style={{ display: 'flex', gap: 14, fontSize: 13, color: 'var(--color-ink-dim)' }}>
                    <span>{formatMoney(i.total)} incl. BTW</span>
                    <span>Vervalt {formatDate(i.due_date)}</span>
                    {i.paid_at && <span style={{ color: '#2F7A4A', display: 'inline-flex', alignItems: 'center', gap: 4 }}><Check size={12} /> betaald</span>}
                    {i._eff === 'overdue' && <span style={{ color: 'var(--color-miss)', display: 'inline-flex', alignItems: 'center', gap: 4 }}><AlertTriangle size={12} /> vervallen</span>}
                  </div>
                </div>
                <span style={{ ...badgeStyle, background: s.bg, color: s.fg }}>{s.label}</span>
                <ChevronRight size={18} color="var(--color-ink-dim)" />
              </Link>
            )
          })}
        </div>
      )}
    </div>
  )
}

const cardLink = {
  display: 'flex', alignItems: 'center', gap: 14,
  background: '#fff', border: '1px solid var(--color-line)',
  borderRadius: 10, padding: '14px 16px',
  textDecoration: 'none', color: 'inherit',
}
const badgeStyle = {
  padding: '4px 10px', borderRadius: 999, fontSize: 12, fontWeight: 600, whiteSpace: 'nowrap',
}
