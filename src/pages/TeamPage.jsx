/* TeamPage — /people: de volledige Team-module uit de Claude Design-blauwdruk
   (dashboard/team.jsx · TeamModule), gedispatcht zoals pages.jsx dat doet
   (id === "people" -> <div className="module-page"><TeamModule/></div>). Team is
   een kern-module (modules.js: key "team", route "people"), dus altijd aan. De
   "Bekijk"-knop start view-as via de shell-lijm (window.startViewAs). */
import { useOutletContext } from 'react-router-dom'
import { TeamModule } from '../design/team.jsx'
import { useModuleSettings } from '../tenant/TenantProvider'
import ModuleOff from '../tenant/ModuleOff'

export default function TeamPage() {
  const { go } = useOutletContext()
  const { enabled } = useModuleSettings('team')
  if (!enabled) return <ModuleOff label="Team" />
  return (
    <div className="module-page" key="people">
      <TeamModule onOpen={go} />
    </div>
  )
}
