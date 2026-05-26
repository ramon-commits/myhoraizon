export default function PageHeader({ kicker, title, right }) {
  return (
    <header style={{ display: 'flex', alignItems: 'flex-end', justifyContent: 'space-between', marginBottom: 24 }}>
      <div>
        {kicker && <div className="hz-kicker">{kicker}</div>}
        <h1 style={{ marginTop: 8, font: '700 28px/1.1 var(--font-display)', letterSpacing: '-0.025em' }}>{title}</h1>
      </div>
      {right}
    </header>
  )
}
