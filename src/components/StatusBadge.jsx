// StatusBadge — gedeelde pil voor een status-label. De status-naar-label
// vertaling blijft per module (domein-data); alleen de weergave is gedeeld.
export default function StatusBadge({ label, bg, fg }) {
  if (!label) return null
  return (
    <span
      style={{
        padding: '4px 10px',
        borderRadius: 999,
        fontSize: 12,
        fontWeight: 600,
        whiteSpace: 'nowrap',
        background: bg ?? 'rgba(0,0,0,0.06)',
        color: fg ?? 'var(--color-ink-dim)',
      }}
    >
      {label}
    </span>
  )
}
