import { Link } from 'react-router-dom'
import { ClipboardList, FileSignature, Receipt, ArrowUpRight } from 'lucide-react'
import { useAuth } from '../contexts/AuthContext'
import { useMyQuotes, useMyContracts, useMyInvoices } from '../hooks/useMine'
import { formatMoney, formatDate } from '../lib/format'

export default function DashboardPage() {
  const { email } = useAuth()
  const quotes = useMyQuotes()
  const contracts = useMyContracts()
  const invoices = useMyInvoices()

  const companyName = quotes.data?.[0]?.session?.prospect_company
    || contracts.data?.[0]?.client_company
    || 'daar'

  const openQuotes = (quotes.data ?? []).filter((q) => q.status === 'sent' || q.status === 'reviewed')
  const openInvoices = (invoices.data ?? []).filter((i) => i.status === 'sent' || (i.status !== 'paid' && i.status !== 'cancelled'))
  const outstanding = openInvoices.reduce((sum, i) => sum + Number(i.total || 0), 0)

  return (
    <div style={{ padding: '32px 36px', maxWidth: 1100, margin: '0 auto' }}>
      <header style={{ marginBottom: 28 }}>
        <div className="hz-kicker">welkom terug</div>
        <h1 style={{ marginTop: 8, font: '700 32px/1.1 var(--font-display)', letterSpacing: '-0.025em' }}>
          Hoi <span className="italic-accent">{companyName}.</span>
        </h1>
        <p style={{ marginTop: 8, color: 'var(--color-ink-soft)', fontSize: 14 }}>
          Hier staat alles wat Kyano voor je doet. Ingelogd als <code style={{ background: 'var(--color-cream)', padding: '2px 6px', borderRadius: 4 }}>{email}</code>.
        </p>
      </header>

      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: 14, marginBottom: 28 }}>
        <StatCard
          to="/offertes"
          icon={ClipboardList}
          label="Offertes"
          value={quotes.data?.length ?? 0}
          hint={openQuotes.length > 0 ? `${openQuotes.length} openstaand` : 'allemaal afgehandeld'}
          accent="#4FB8B2"
        />
        <StatCard
          to="/contracten"
          icon={FileSignature}
          label="Contracten"
          value={contracts.data?.length ?? 0}
          hint={`${(contracts.data ?? []).filter((c) => c.status === 'signed').length} getekend`}
          accent="#2F7A4A"
        />
        <StatCard
          to="/facturen"
          icon={Receipt}
          label="Facturen"
          value={invoices.data?.length ?? 0}
          hint={outstanding > 0 ? `${formatMoney(outstanding)} openstaand` : 'niets openstaand'}
          accent="#A66020"
          highlight={outstanding > 0}
        />
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 14 }}>
        <SectionCard title="Laatste offertes" to="/offertes" empty="Nog geen offertes — start een Discovery op kyano.app">
          {(quotes.data ?? []).slice(0, 3).map((q) => (
            <Row
              key={q.id}
              to={`/offertes/${q.id}`}
              title={q.session?.prospect_company || 'Offerte'}
              meta={[
                q.package && `${q.package}`,
                q.monthly_price && `${formatMoney(q.monthly_price)}/mo`,
                formatDate(q.created_at),
              ].filter(Boolean).join(' · ')}
              badge={statusLabel('quote', q.status)}
            />
          ))}
        </SectionCard>
        <SectionCard title="Laatste facturen" to="/facturen" empty="Nog geen facturen">
          {(invoices.data ?? []).slice(0, 3).map((i) => (
            <Row
              key={i.id}
              to={`/facturen/${i.id}`}
              title={i.invoice_number}
              meta={[
                formatMoney(i.total),
                `Vervalt ${formatDate(i.due_date)}`,
              ].join(' · ')}
              badge={statusLabel('invoice', i.status)}
            />
          ))}
        </SectionCard>
      </div>
    </div>
  )
}

function StatCard({ to, icon: Icon, label, value, hint, accent, highlight }) {
  return (
    <Link to={to} style={{
      display: 'block', textDecoration: 'none', color: 'inherit',
      background: '#fff', border: `1px solid ${highlight ? accent : 'var(--color-line)'}`,
      borderRadius: 14, padding: 20,
      transition: 'border-color 150ms, transform 150ms',
    }}>
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 14 }}>
        <div style={{
          width: 36, height: 36, borderRadius: 10,
          background: `${accent}1a`, color: accent,
          display: 'grid', placeItems: 'center',
        }}>
          <Icon size={18} />
        </div>
        <ArrowUpRight size={16} color="var(--color-ink-dim)" />
      </div>
      <div style={{ fontSize: 11, color: 'var(--color-ink-dim)', letterSpacing: '0.08em', textTransform: 'uppercase', fontWeight: 600 }}>
        {label}
      </div>
      <div style={{ marginTop: 4, font: '700 28px/1 var(--font-display)', letterSpacing: '-0.02em' }}>
        {value}
      </div>
      <div style={{ marginTop: 6, fontSize: 12.5, color: highlight ? accent : 'var(--color-ink-dim)' }}>
        {hint}
      </div>
    </Link>
  )
}

function SectionCard({ title, to, children, empty }) {
  const hasChildren = Array.isArray(children) ? children.some(Boolean) : !!children
  return (
    <div style={{ background: '#fff', border: '1px solid var(--color-line)', borderRadius: 14, padding: 20 }}>
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 12 }}>
        <h3 style={{ font: '700 14px/1 var(--font-display)', letterSpacing: '-0.01em', margin: 0 }}>{title}</h3>
        <Link to={to} style={{ fontSize: 12, color: 'var(--color-kyano)', textDecoration: 'none', fontWeight: 600 }}>
          alles bekijken →
        </Link>
      </div>
      {hasChildren ? (
        <div style={{ display: 'flex', flexDirection: 'column', gap: 6 }}>{children}</div>
      ) : (
        <p style={{ fontSize: 13, color: 'var(--color-ink-dim)', margin: 0 }}>{empty}</p>
      )}
    </div>
  )
}

function Row({ to, title, meta, badge }) {
  return (
    <Link to={to} style={{
      display: 'flex', alignItems: 'center', gap: 10,
      padding: '8px 0', textDecoration: 'none', color: 'inherit',
      borderBottom: '1px solid var(--color-line)',
    }}>
      <div style={{ flex: 1, minWidth: 0 }}>
        <div style={{ fontSize: 13.5, fontWeight: 600 }}>{title}</div>
        <div style={{ fontSize: 12, color: 'var(--color-ink-dim)', marginTop: 2 }}>{meta}</div>
      </div>
      {badge && (
        <span style={{
          fontSize: 11, fontWeight: 600,
          background: badge.bg, color: badge.fg,
          padding: '3px 8px', borderRadius: 999,
        }}>{badge.label}</span>
      )}
    </Link>
  )
}

function statusLabel(kind, status) {
  const map = {
    quote: {
      draft: { label: 'Concept', bg: 'rgba(0,0,0,0.06)', fg: '#5C648A' },
      reviewed: { label: 'Beoordeeld', bg: 'rgba(79,184,178,0.15)', fg: '#0E7C77' },
      sent: { label: 'Verzonden', bg: 'rgba(79,184,178,0.15)', fg: '#0E7C77' },
      accepted: { label: 'Geaccepteerd', bg: 'rgba(47,122,74,0.12)', fg: '#2F7A4A' },
    },
    invoice: {
      draft: { label: 'Concept', bg: 'rgba(0,0,0,0.06)', fg: '#5C648A' },
      sent: { label: 'Verzonden', bg: 'rgba(79,184,178,0.15)', fg: '#0E7C77' },
      paid: { label: 'Betaald', bg: 'rgba(47,122,74,0.12)', fg: '#2F7A4A' },
      overdue: { label: 'Vervallen', bg: 'rgba(193,58,51,0.12)', fg: '#C13A33' },
    },
  }
  return map[kind]?.[status] || { label: status, bg: 'rgba(0,0,0,0.06)', fg: '#5C648A' }
}
