import { Link, useParams } from 'react-router-dom'
import { ArrowLeft, ExternalLink, Check } from 'lucide-react'
import { useMyContract } from '../hooks/useMine'
import { formatDate } from '../lib/format'

export default function ContractDetailPage() {
  const { id } = useParams()
  const { data: contract, isLoading, error } = useMyContract(id)

  if (isLoading) return <div style={{ padding: 32 }}>Laden…</div>
  if (error) return <div style={{ padding: 32, color: 'var(--color-miss)' }}>{error.message}</div>
  if (!contract) return <div style={{ padding: 32 }}>Niet gevonden.</div>

  return (
    <div style={{ padding: '24px 36px', maxWidth: 1000, margin: '0 auto' }}>
      <div style={{ display: 'flex', alignItems: 'center', gap: 12, marginBottom: 16 }}>
        <Link to="/contracten" style={{ display: 'inline-flex', alignItems: 'center', gap: 6, color: 'var(--color-ink-dim)', textDecoration: 'none', fontSize: 13 }}>
          <ArrowLeft size={14} /> Terug
        </Link>
        <span style={{ color: 'var(--color-line)' }}>·</span>
        <strong style={{ fontSize: 17 }}>{contract.client_company}</strong>
        {contract.signed_at && (
          <span style={{ display: 'inline-flex', alignItems: 'center', gap: 4, color: '#2F7A4A', fontSize: 12 }}>
            <Check size={12} /> Getekend {formatDate(contract.signed_at)} door {contract.signer_name}
          </span>
        )}
      </div>

      {contract.status === 'sent' && contract.signature_token && !contract.signed_at && (
        <div style={{
          marginBottom: 14, padding: 16, borderRadius: 12,
          background: 'rgba(238,160,58,0.10)', border: '1px solid rgba(238,160,58,0.30)',
          display: 'flex', justifyContent: 'space-between', alignItems: 'center', gap: 12,
        }}>
          <div>
            <strong style={{ fontSize: 14 }}>Klaar om te tekenen?</strong>
            <p style={{ margin: '4px 0 0', fontSize: 13, color: 'var(--color-ink-soft)' }}>
              Open de teken-pagina en zet je digitale handtekening. Werkt ook op telefoon.
            </p>
          </div>
          <a
            href={`/sign/${contract.signature_token}`}
            target="_blank" rel="noreferrer"
            style={{
              display: 'inline-flex', alignItems: 'center', gap: 6,
              background: '#2F7A4A', color: '#fff', border: 'none',
              padding: '10px 18px', borderRadius: 10, fontSize: 14, fontWeight: 600,
              textDecoration: 'none', whiteSpace: 'nowrap',
            }}
          >
            <ExternalLink size={14} /> Naar teken-pagina
          </a>
        </div>
      )}

      <div style={{ background: '#fff', border: '1px solid var(--color-line)', borderRadius: 14, overflow: 'hidden' }}>
        {contract.contract_html ? (
          <iframe srcDoc={contract.contract_html} title="Contract" style={{ width: '100%', minHeight: '85vh', border: 'none', display: 'block' }} />
        ) : (
          <div style={{ padding: 32, color: 'var(--color-ink-dim)' }}>Contract wordt nog voorbereid.</div>
        )}
      </div>
    </div>
  )
}
