import { Link, useParams } from 'react-router-dom'
import { ArrowLeft, Check, AlertTriangle } from 'lucide-react'
import { useMyInvoice } from '../hooks/useMine'
import { formatDate, formatMoney } from '../lib/format'

export default function InvoiceDetailPage() {
  const { id } = useParams()
  const { data: invoice, isLoading, error } = useMyInvoice(id)

  if (isLoading) return <div style={{ padding: 32 }}>Laden…</div>
  if (error) return <div style={{ padding: 32, color: 'var(--color-miss)' }}>{error.message}</div>
  if (!invoice) return <div style={{ padding: 32 }}>Niet gevonden.</div>

  const isOverdue = invoice.status === 'sent' && invoice.due_date && new Date(invoice.due_date) < new Date()

  return (
    <div style={{ padding: '24px 36px', maxWidth: 1000, margin: '0 auto' }}>
      <div style={{ display: 'flex', alignItems: 'center', gap: 12, marginBottom: 16, flexWrap: 'wrap' }}>
        <Link to="/facturen" style={{ display: 'inline-flex', alignItems: 'center', gap: 6, color: 'var(--color-ink-dim)', textDecoration: 'none', fontSize: 13 }}>
          <ArrowLeft size={14} /> Terug
        </Link>
        <span style={{ color: 'var(--color-line)' }}>·</span>
        <strong style={{ fontSize: 17 }}>{invoice.invoice_number}</strong>
        <span style={{ color: 'var(--color-ink-dim)', fontSize: 14 }}>{formatMoney(invoice.total)} incl. BTW</span>
        {invoice.paid_at && (
          <span style={{ display: 'inline-flex', alignItems: 'center', gap: 4, color: '#2F7A4A', fontSize: 12 }}>
            <Check size={12} /> Betaald {formatDate(invoice.paid_at)}
          </span>
        )}
        {isOverdue && (
          <span style={{ display: 'inline-flex', alignItems: 'center', gap: 4, color: 'var(--color-miss)', fontSize: 12 }}>
            <AlertTriangle size={12} /> Vervallen op {formatDate(invoice.due_date)}
          </span>
        )}
      </div>

      <div style={{ background: '#fff', border: '1px solid var(--color-line)', borderRadius: 14, overflow: 'hidden' }}>
        {invoice.invoice_html ? (
          <iframe srcDoc={invoice.invoice_html} title="Factuur" style={{ width: '100%', minHeight: '90vh', border: 'none', display: 'block' }} />
        ) : (
          <div style={{ padding: 32, color: 'var(--color-ink-dim)' }}>Geen factuur-inhoud.</div>
        )}
      </div>

      {invoice.status !== 'paid' && (
        <div style={{ marginTop: 14, padding: 16, borderRadius: 10, background: 'rgba(79,184,178,0.08)', border: '1px solid rgba(79,184,178,0.25)', fontSize: 13.5, lineHeight: 1.55 }}>
          <strong>Hoe te betalen:</strong> maak het bedrag over naar het IBAN op de factuur onder vermelding van het factuurnummer.
          Zodra de betaling binnen is, zet Ramon je factuur op <em>betaald</em> en gaan we door met de kick-off.
        </div>
      )}
    </div>
  )
}
