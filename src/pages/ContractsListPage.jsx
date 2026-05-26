import { Link } from 'react-router-dom'
import { FileSignature, ChevronRight, Check } from 'lucide-react'
import { useMyContracts } from '../hooks/useMine'
import { formatMoney, formatDate } from '../lib/format'
import PageHeader from '../components/PageHeader'
import EmptyState from '../components/EmptyState'

const STATUS = {
  draft: { label: 'Concept', bg: 'rgba(0,0,0,0.06)', fg: '#5C648A' },
  sent: { label: 'Wacht op tekenen', bg: 'rgba(238,160,58,0.15)', fg: '#A66020' },
  signed: { label: 'Getekend', bg: 'rgba(47,122,74,0.12)', fg: '#2F7A4A' },
  rejected: { label: 'Afgewezen', bg: 'rgba(193,58,51,0.12)', fg: '#C13A33' },
}

export default function ContractsListPage() {
  const { data, isLoading, error } = useMyContracts()

  return (
    <div style={{ padding: '32px 36px', maxWidth: 960, margin: '0 auto' }}>
      <PageHeader kicker="jouw contracten" title="Contracten" />
      {isLoading ? (
        <p style={{ color: 'var(--color-ink-dim)' }}>Laden…</p>
      ) : error ? (
        <p style={{ color: 'var(--color-miss)' }}>{error.message}</p>
      ) : !data?.length ? (
        <EmptyState
          icon={FileSignature}
          title="Nog geen contracten"
          description="Zodra je akkoord gaat met een offerte stelt Juris een contract op."
        />
      ) : (
        <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
          {data.map((c) => {
            const s = STATUS[c.status] || STATUS.draft
            const t = c.contract_terms || {}
            return (
              <Link key={c.id} to={`/contracten/${c.id}`} style={cardLink}>
                <div style={{ flex: 1, minWidth: 0 }}>
                  <div style={{ display: 'flex', alignItems: 'baseline', gap: 10, marginBottom: 4 }}>
                    <strong style={{ fontSize: 15 }}>{c.client_company || 'Contract'}</strong>
                    <span style={{ color: 'var(--color-ink-dim)', fontSize: 12 }}>{t.package_label}</span>
                  </div>
                  <div style={{ display: 'flex', gap: 14, fontSize: 13, color: 'var(--color-ink-dim)' }}>
                    {t.monthly_price_eur && <span>{formatMoney(t.monthly_price_eur)}/mo</span>}
                    <span>Aangemaakt {formatDate(c.created_at)}</span>
                    {c.signed_at && (
                      <span style={{ color: '#2F7A4A', display: 'inline-flex', alignItems: 'center', gap: 4 }}>
                        <Check size={12} /> getekend {formatDate(c.signed_at)}
                      </span>
                    )}
                  </div>
                </div>
                {c.status === 'sent' && c.signature_token && (
                  <a
                    href={`/sign/${c.signature_token}`}
                    onClick={(e) => e.stopPropagation()}
                    style={{ padding: '6px 12px', borderRadius: 999, background: '#2F7A4A', color: '#fff', fontSize: 12, fontWeight: 600, textDecoration: 'none' }}
                  >
                    Tekenen
                  </a>
                )}
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
