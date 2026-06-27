import { Sparkles } from 'lucide-react'
import PageHeader from './PageHeader'
import EmptyState from './EmptyState'

// PlaceholderPage — nette "binnenkort"-staat voor modules die nog niet
// gebouwd zijn. De sidebar verwijst er via App.jsx naartoe tot de echte
// pagina klaar is.
export default function PlaceholderPage({ title }) {
  return (
    <div style={{ padding: '32px 36px', maxWidth: 960, margin: '0 auto' }}>
      <PageHeader kicker="binnenkort" title={title} />
      <EmptyState
        icon={Sparkles}
        title="Deze module komt eraan"
        description={`${title} is nog in aanbouw. Zodra hij klaar is verschijnt hij hier, op deze plek in je werkruimte.`}
      />
    </div>
  )
}
