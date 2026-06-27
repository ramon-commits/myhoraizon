import { Link } from 'react-router-dom'
import { ChevronRight } from 'lucide-react'

// ListRow — de gedeelde lijst-rij voor elke lijst-pagina. Avatar (icoon),
// titel met optionele subtitel, een meta-regel, een acties-slot en een badge.
// Wordt een klikbare Link als `to` is gezet, anders een gewone rij.
//
// Props:
//   to        optioneel doel; maakt de hele rij een Link
//   icon      lucide-icoon voor de avatar
//   title     hoofdtekst
//   subtitle  zachte tekst naast de titel
//   meta      array van knopjes/teksten onder de titel (falsy wordt genegeerd)
//   actions   node rechts, voor de badge (bijv. een actieknop)
//   badge     node rechts (bijv. <StatusBadge />)
//   chevron   pijl rechts tonen; standaard aan zodra `to` is gezet
export default function ListRow({
  to,
  icon: Icon,
  title,
  subtitle,
  meta = [],
  actions,
  badge,
  chevron,
}) {
  const showChevron = chevron ?? !!to
  const metaItems = meta.filter(Boolean)

  const inner = (
    <>
      {Icon && (
        <span style={avatarStyle}>
          <Icon size={18} strokeWidth={1.8} />
        </span>
      )}
      <div style={{ flex: 1, minWidth: 0 }}>
        <div style={{ display: 'flex', alignItems: 'baseline', gap: 10, marginBottom: 4 }}>
          <strong style={{ fontSize: 15 }}>{title}</strong>
          {subtitle && (
            <span style={{ color: 'var(--color-ink-dim)', fontSize: 12 }}>{subtitle}</span>
          )}
        </div>
        {metaItems.length > 0 && (
          <div style={{ display: 'flex', gap: 14, flexWrap: 'wrap', fontSize: 13, color: 'var(--color-ink-dim)' }}>
            {metaItems.map((m, i) => (
              <span key={i}>{m}</span>
            ))}
          </div>
        )}
      </div>
      {actions}
      {badge}
      {showChevron && <ChevronRight size={18} color="var(--color-ink-dim)" />}
    </>
  )

  if (to) {
    return (
      <Link to={to} style={rowStyle}>
        {inner}
      </Link>
    )
  }
  return <div style={rowStyle}>{inner}</div>
}

const rowStyle = {
  display: 'flex',
  alignItems: 'center',
  gap: 14,
  background: '#fff',
  border: '1px solid var(--color-line)',
  borderRadius: 10,
  padding: '14px 16px',
  textDecoration: 'none',
  color: 'inherit',
}

const avatarStyle = {
  flex: '0 0 auto',
  width: 40,
  height: 40,
  borderRadius: 10,
  background: 'rgba(79,184,178,0.12)',
  color: 'var(--color-kyano)',
  display: 'grid',
  placeItems: 'center',
}
