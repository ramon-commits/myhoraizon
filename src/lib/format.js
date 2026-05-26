const DATE_FMT = new Intl.DateTimeFormat('nl-NL', {
  day: 'numeric',
  month: 'short',
  year: 'numeric',
})

const DATE_FMT_LONG = new Intl.DateTimeFormat('nl-NL', {
  weekday: 'short',
  day: 'numeric',
  month: 'long',
  year: 'numeric',
})

export function formatDate(value, { long = false } = {}) {
  if (!value) return null
  const d = typeof value === 'string' ? new Date(value) : value
  if (Number.isNaN(d.getTime())) return null
  return (long ? DATE_FMT_LONG : DATE_FMT).format(d)
}

const EUR_FMT = new Intl.NumberFormat('nl-NL', {
  style: 'currency',
  currency: 'EUR',
})

export function formatMoney(value) {
  if (value == null || Number.isNaN(Number(value))) return '—'
  return EUR_FMT.format(Number(value))
}
