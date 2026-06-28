/* ============================================================
   Groei-board hero (SEO · CRO · AI-vindbaarheid).
   ESM-port van GroeiBoardHeader uit de Claude Design-blauwdruk
   (dashboard/pages.jsx). De voorstellen zelf zijn een widget op
   het seo-bord (tiles.jsx, tileKind "salestaken" scope "seo");
   dit is alleen de vaste bordkop, 1:1 met de bron.
   ============================================================ */
import { KYANO } from './data'
import { useStore, setState, toast } from './store.jsx'
import { Avatar, Btn } from './components.jsx'
import { clientFirst } from './dashboard.jsx'

function grGreet() { const h = new Date().getHours(); return h < 6 ? 'Goedenacht' : h < 12 ? 'Goedemorgen' : h < 18 ? 'Goedemiddag' : 'Goedenavond' }

export function GroeiBoardHeader({ onOpen }) {
  const store = useStore()
  const seoTasks = KYANO.tasks.map((t, i) => ({ t, i })).filter((x) => x.t.mod === 'seo')
  const items = seoTasks.map((x) => ({ ...x, st: store.get('task.status.' + x.i, 'pending') }))
  const pending = items.filter((x) => x.st === 'pending')
  const total = seoTasks.length
  const reviewed = total - pending.length
  const pct = total ? Math.round((reviewed / total) * 100) : 0
  const approveAll = () => { pending.forEach((x) => setState('task.status.' + x.i, 'approved')); toast('Alle ' + pending.length + ' voorstellen toegepast · je agents voeren ze uit', { agent: 'iris' }) }
  return (
    <header className="vdb-head">
      <div className="vdb-id">
        <Avatar agent="iris" size={54} ring />
        <div className="vdb-id-txt">
          <h1 className="greet-h1">{grGreet()}, <em>{clientFirst()}</em></h1>
          <p className="vdb-sub">Groei · SEO · CRO · AI-vindbaarheid · <span className="mono">{pending.length > 0 ? pending.length + (pending.length === 1 ? ' voorstel open' : ' voorstellen open') : 'alles afgehandeld'}</span></p>
        </div>
      </div>
      <div className={"vdb-command" + (pending.length === 0 ? " clear" : "")}>
        <div className="vdb-command-main">
          <div className="vdb-command-text">
            {pending.length > 0
              ? <>Je agents <b>Max</b>, <b>Mila</b> en <b>Iris</b> onderzochten je site en zetten <b>{pending.length} {pending.length === 1 ? 'voorstel' : 'voorstellen'}</b> klaar. Jij keurt goed, zij voeren uit.</>
              : <><b>Top werk, {clientFirst()}.</b> Alle voorstellen afgehandeld, je agents kijken verder mee met je site.</>}
          </div>
          <div className="vdb-progress">
            <div className="vdb-progress-bar"><span style={{ width: pct + "%" }} /></div>
            <span className="vdb-progress-lbl mono">{reviewed} / {total} afgehandeld</span>
          </div>
        </div>
        <div className="vdb-command-acts">
          {pending.length > 0 && <Btn kind="solid" accent="teal" icon="check" size="sm" onClick={approveAll}>Alles toepassen</Btn>}
          <Btn kind="soft" accent="navy" icon="brush" size="sm" onClick={() => onOpen('editor')}>Open CMS</Btn>
          <Btn kind="soft" accent="teal" icon="spark" size="sm" onClick={() => onOpen('iris')}>Chat met Iris</Btn>
        </div>
      </div>
    </header>
  )
}
