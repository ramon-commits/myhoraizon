import { ClipboardList } from 'lucide-react'
import { useMyQuotes } from '../hooks/useMine'
import { formatMoney, formatDate } from '../lib/format'
import PageHeader from '../components/PageHeader'
import EmptyState from '../components/EmptyState'
import ListRow from '../components/ListRow'
import StatusBadge from '../components/StatusBadge'

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
        <p style={{ color: 'var(--color-ink-dim)' }}>Laden...</p>
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
              <ListRow
                key={q.id}
                to={`/offertes/${q.id}`}
                icon={ClipboardList}
                title={q.session?.prospect_company || 'Offerte'}
                subtitle={q.session?.prospect_name}
                meta={[
                  PKG_LABEL[q.package] || q.package,
                  `${formatMoney(q.monthly_price)}/mnd`,
                  formatDate(q.created_at),
                ]}
                badge={<StatusBadge label={s.label} bg={s.bg} fg={s.fg} />}
              />
            )
          })}
        </div>
      )}
    </div>
  )
}
