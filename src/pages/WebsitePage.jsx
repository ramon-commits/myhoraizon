/* WebsitePage — /website: het Website-bord uit de Claude Design-blauwdruk
   (dashboard/shell.jsx, view === "website"): sx-hero (Live + domein) +
   <TileGrid board="website">. Widgets (webkpis, websitetaken, analytics, seo,
   studio, paginas, editor) komen uit tiles.jsx (BOARDS.website); edit-modus/
   layout/markt via de Outlet-context. Website is een custom-module achter
   ModuleGate (tenant-config bepaalt aan/uit). */
import { useOutletContext } from 'react-router-dom'
import { ICONS } from '../design/icons'
import { Btn } from '../design/components.jsx'
import { TileGrid } from '../design/tiles.jsx'
import { toast } from '../design/store.jsx'
import { useModuleSettings } from '../tenant/TenantProvider'
import { useWebsite } from '../hooks/useWebsite'
import ModuleOff from '../tenant/ModuleOff'

export default function WebsitePage() {
  const { edit, layout, setLayout, openLib, go, flags, board } = useOutletContext()
  const { enabled } = useModuleSettings('website')
  const web = useWebsite()
  if (!enabled) return <ModuleOff label="Website" />

  const domein = web.domein || 'sloepenspel.nl'
  const bekijkSite = () => {
    toast(`${domein} openen…`, { icon: 'globe', kind: 'muted' })
    window.open(`https://${domein}`, '_blank', 'noopener')
  }

  return (
    <div className="dash website-board">
      <header className="sx-hero">
        <img className="sales-hero-logo" src="/brand/website-mark.svg" alt="Website" />
        <div className="sx-hero-id">
          <h1 className="sx-hero-h1">Website</h1>
          <p className="sx-hero-sub mono">
            {web.connected ? (
              <span className="web-live"><span className="live-dot" />Live</span>
            ) : (
              <span className="web-seam" title={web.reason || ''}>Voorbeeld · nog niet gekoppeld</span>
            )}
            {' · '}{domein}{' · aangestuurd door Max en Mila'}
          </p>
        </div>
        <div className="sx-hero-acts">
          <Btn kind="soft" accent="gold" icon="globe" size="sm" onClick={bekijkSite}>Bekijk site</Btn>
          <Btn kind="solid" accent="navy" icon="brush" size="sm" onClick={() => go('editor')}>Beheer site</Btn>
        </div>
      </header>
      {!web.loading && !web.connected && (
        <div className="web-seam-bar mono">
          <span dangerouslySetInnerHTML={{ __html: ICONS('info') }} />
          <span>
            <b>Databron-seam.</b> De cijfers hieronder staan in de echte vorm van de
            werkende Website-backend (seo-agent, keyword-api, quick-site-scan op
            project <span className="mono">dofmjstoeqpezukgqtyq</span>), maar die draait op
            een ander project dan het brein. Live gaan vereist <b>F2.7-B4</b>: die
            functies + de <span className="mono">paginas/keyword</span>-tabellen porten naar het
            brein. Daarna licht dit vanzelf op.
          </span>
        </div>
      )}
      {edit && (
        <div className="edit-hint mono">
          <span dangerouslySetInnerHTML={{ __html: ICONS('drag') }} />
          <span>Je Website-werkruimte · sleep om te ordenen · tik <b>S / M / L / XL</b> voor de maat · <b>Widget toevoegen</b> opent de website-widgets</span>
        </div>
      )}
      {layout && <TileGrid board={board} edit={edit} onOpen={go} layout={layout} setLayout={setLayout} flags={flags} onAddWidget={openLib} />}
    </div>
  )
}
