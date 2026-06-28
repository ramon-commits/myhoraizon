/* ============================================================
   Studio-board hero (Mila's landingspagina's & blogposts).
   ESM-port van StudioBoardHeader uit de Claude Design-blauwdruk
   (dashboard/studio.jsx). De concepten zelf zijn een widget op
   het studio-bord (tiles.jsx, tileKind "salestaken" scope "studio");
   dit is alleen de vaste bordkop, 1:1 met de bron.
   ============================================================ */
import React from 'react'
import { KYANO } from './data'
import { useStore, toast } from './store.jsx'
import { Avatar, Btn } from './components.jsx'
import { clientFirst } from './dashboard.jsx'

const { useState } = React

function stGreet() { const h = new Date().getHours(); return h < 6 ? 'Goedenacht' : h < 12 ? 'Goedemorgen' : h < 18 ? 'Goedemiddag' : 'Goedenavond' }

/* Studio-bordkop: groet + commandoregel met voortgang over de concepten van Mila
   (zelfde patroon als Groei/Vandaag) */
export function StudioBoardHeader({ onOpen }) {
  const store = useStore()
  const [busy, setBusy] = useState(false)
  const cids = window.SSP_CONCEPTS ? Object.keys(window.SSP_CONCEPTS) : []
  const live = cids.filter((id) => store.get('studio.concept.live.' + id)).length
  const total = cids.length
  const conceptTasks = KYANO.tasks.map((t, i) => ({ t, i })).filter((x) => x.t.mod === 'studio')
  const klaar = conceptTasks.filter((x) => store.get('task.status.' + x.i, 'pending') === 'pending').length
  const pct = total ? Math.round((live / total) * 100) : 0
  const genereer = () => {
    setBusy(true)
    toast('Mila schrijft een nieuw concept…', { agent: 'mila' })
    setTimeout(() => { setBusy(false); toast('Nieuw concept klaar om te bekijken', { agent: 'mila', icon: 'spark' }) }, 1700)
  }
  return (
    <header className="vdb-head">
      <div className="vdb-id">
        <Avatar agent="mila" size={54} ring />
        <div className="vdb-id-txt">
          <h1 className="greet-h1">{stGreet()}, <em>{clientFirst()}</em></h1>
          <p className="vdb-sub">Studio · landingspagina's &amp; blogposts · <span className="mono">{klaar > 0 ? klaar + (klaar === 1 ? ' concept klaar' : ' concepten klaar') : 'alles verwerkt'}</span></p>
        </div>
      </div>
      <div className={"vdb-command" + (klaar === 0 ? " clear" : "")}>
        <div className="vdb-command-main">
          <div className="vdb-command-text">
            {klaar > 0
              ? <><b>Mila</b> zette <b>{klaar} {klaar === 1 ? 'concept' : 'concepten'}</b> voor je klaar op basis van zoekkansen. Open er een in de editor, pas 'm aan met je vertrouwde tools en zet 'm live.</>
              : <><b>Top, {clientFirst()}.</b> Je hebt alle concepten verwerkt. Mila houdt de zoekkansen in de gaten en zet nieuwe concepten klaar.</>}
          </div>
          <div className="vdb-progress">
            <div className="vdb-progress-bar"><span style={{ width: pct + "%" }} /></div>
            <span className="vdb-progress-lbl mono">{live} / {total} live</span>
          </div>
        </div>
        <div className="vdb-command-acts">
          <Btn kind="solid" accent="mila" icon={busy ? 'sync' : 'spark'} size="sm" onClick={genereer}>{busy ? 'Bezig…' : 'Mila schrijft iets nieuws'}</Btn>
          <Btn kind="soft" accent="navy" icon="brush" size="sm" onClick={() => onOpen('editor')}>Open de builder</Btn>
        </div>
      </div>
    </header>
  )
}
