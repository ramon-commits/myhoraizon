export default function EmptyState({ icon: Icon, title, description }) {
  return (
    <div style={{
      background: '#fff', border: '1px dashed var(--color-line-hi)',
      borderRadius: 14, padding: '48px 32px', textAlign: 'center',
    }}>
      {Icon && (
        <div style={{
          width: 48, height: 48, borderRadius: 12,
          background: 'rgba(79,184,178,0.12)', color: 'var(--color-kyano)',
          display: 'grid', placeItems: 'center', margin: '0 auto 16px',
        }}>
          <Icon size={22} />
        </div>
      )}
      <h3 style={{ font: '700 18px/1.2 var(--font-display)', margin: 0 }}>{title}</h3>
      {description && (
        <p style={{ marginTop: 8, fontSize: 13.5, color: 'var(--color-ink-soft)', lineHeight: 1.55, maxWidth: 400, marginLeft: 'auto', marginRight: 'auto' }}>
          {description}
        </p>
      )}
    </div>
  )
}
