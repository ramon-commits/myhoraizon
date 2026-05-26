import { Link } from 'react-router-dom'
import { ClipboardList, ChevronRight } from 'lucide-react'
import { useMyQuotes } from '../hooks/useMine'
import { formatMoney, formatDate } from '../lib/format'
import PageHeader from '../components/PageHeader'
import EmptyState from '../components/EmptyState'

const PKG_LABEL = { starter: 'Starter', business: 'Business', enterprise: 'Enterprise' }
const STATUS = {
  draft: { label: 'Concept', bg: 'rgba(0,0,0,0.06)', fg: '#5C648A' },
  reviewed: { label: 'Beoordeeld', bg: 'rgba(79,184,178,0.15)', fg: '#0E7C77' },
  sent: { label: 'Verzonden', bg: 'rgba(79,184,178,0.15)', fg: '#0E7C77' },
  accepted: { label: 'Geaccepteerd', bg: 'rgba(47,122,74,0.12)', fg: '#2F7A4A' },
  rejected: { label: 'Afgewezen', bg: 'rgba(193,58,51,0.12)', fg: '#C13A33' },
}

export default function QuotesListPage() {
  const { data, isLoading, error } = useMyQuotes()

  return (
    <div style={{ padding: '32px 36px', maxWidth: 960, margin: '0 auto' }}>
      <PageHeader kicker="jouw offertes" title="Offertes" />
      {isLoading ? (
        <p style={{ color: 'var(--color-ink-dim)' }}>Laden…</p>
      ) : error ? (
        <p style={{ color: 'var(--color-miss)' }}>{error.message}</p>
      ) : !data?.length ? (
        <EmptyState
          icon={ClipboardList}
          title="Nog geen offertes voor je"
          description="Zodra Ramon je offerte verstuurt verschijnt hij hier. Vragen tussendoor? Mail ramon@endlessminds.nl."
        />
      ) : (
        <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
          {data.map((q) => {
            const s = STATUS[q.status] || STATUS.draft
            return (
              <Link key={q.id} to={`/offertes/${q.id}`} style={cardLink}>
                <div style={{ flex: 1, minWidth: 0 }}>
                  <div style={{ display: 'flex', alignItems: 'baseline', gap: 10, marginBottom: 4 }}>
                    <strong style={{ fontSize: 15 }}>{q.session?.prospect_company || 'Offerte'}</strong>
                    <span style={{ color: 'var(--color-ink-dim)', fontSize: 12 }}>{q.session?.prospect_name}</span>
                  </div>
                  <div style={{ display: 'flex', gap: 14, fontSize: 13, color: 'var(--color-ink-dim)' }}>
                    <span>{PKG_LABEL[q.package] || q.package || '—'}</span>
                    <span>{formatMoney(q.monthly_price)}/mo</span>
                    <span>{formatDate(q.created_at)}</span>
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
