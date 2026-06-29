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
import { notImplemented } from '../design/store.jsx'
import { useModuleSettings } from '../tenant/TenantProvider'
import ModuleOff from '../tenant/ModuleOff'

export default function WebsitePage() {
  const { edit, layout, setLayout, openLib, go, flags, board } = useOutletContext()
  const { enabled } = useModuleSettings('website')
  if (!enabled) return <ModuleOff label="Website" />

  return (
    <div className="dash website-board">
      <header className="sx-hero">
        <img className="sales-hero-logo" src="/brand/website-mark.svg" alt="Website" />
        <div className="sx-hero-id">
          <h1 className="sx-hero-h1">Website</h1>
          <p className="sx-hero-sub mono">
            <span className="web-live"><span className="live-dot" />Live</span> · sloepenspel.nl · aangestuurd door Max en Mila
          </p>
        </div>
        <div className="sx-hero-acts">
          <Btn kind="soft" accent="gold" icon="globe" size="sm" onClick={() => notImplemented('Bekijk site')}>Bekijk site</Btn>
          <Btn kind="solid" accent="navy" icon="brush" size="sm" onClick={() => go('editor')}>Beheer site</Btn>
        </div>
      </header>
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
