/* Dashboard-blokken, letterlijk uit de Claude Design-blauwdruk (Klant-dashboard
   / pages.jsx / tiles.jsx). Gebouwd op de gedeelde bouwstenen + demo-data uit
   data.js. De diepste prototype-deps (CMS/SEO-sprongen, custMatch, SnoozeMenu)
   zijn weggelaten; markup en classes zijn 1:1 met de blauwdruk. */
import React from 'react'
import { ICONS } from './icons'
import { KYANO } from './data'
import { useStore, setState, toast } from './store.jsx'
import { Avatar, AC, ACsoft } from './components.jsx'
import { ObjectActions } from './objectactions.jsx'

const { useState } = React

// MOD: module-registry op id (zoals tiles.jsx) voor chips en labels.
const MOD = {}
KYANO.modules.forEach((m) => { MOD[m.id] = m })

// agenda-afspraken van vandaag uit de agenda-module
const AGENDA_TODAY = (MOD.agenda && MOD.agenda.today) || []

export function clientFirst() {
  return KYANO.client.person
}

/* Begroeting, exact uit de blauwdruk (app-shell Greeting). */
export function Greeting() {
  return (
    <h1 className="greet-h1">Hoi <em>{clientFirst()}</em>, <span className="greet-light">welkom terug</span></h1>
  )
}

/* Taak-rij voor het Vandaag-blok (CeoProposal uit pages.jsx, getrimd). */
export function DashboardTaskRow({ t, i, onOpen }) {
  const store = useStore()
  const status = store.get('task.status.' + i, 'pending')
  const [open, setOpen] = useState(false)
  const ag = KYANO.agents[t.agent] || { name: t.agent }
  const mm = MOD[t.mod]

  if (status !== 'pending') {
    const snoozed = status === 'snoozed'
    const snoozeLbl = store.get('task.snooze.' + i, '')
    return (
      <div className={'prop-row resolved ' + status}>
        <Avatar agent={t.agent} size={32} />
        <div className="prop-resolved-main">
          <span className="prop-resolved-title">{t.title}</span>
          <span className={'prop-resolved-tag ' + status}>
            {snoozed ? '🕒 ' + (snoozeLbl || 'komt later terug') : status === 'approved' ? '✓ Goedgekeurd, ' + ag.name + ' voert het uit' : 'Afgewezen'}
          </span>
        </div>
        <button className="prop-undo mono" onClick={() => setState('task.status.' + i, 'pending')}>Terugzetten</button>
      </div>
    )
  }

  const doApprove = (e) => { e && e.stopPropagation(); setState('task.status.' + i, 'approved'); toast((t.approveLabel || 'Goedgekeurd') + ' · ' + ag.name, { agent: t.agent }) }
  const doReject = (e) => { e && e.stopPropagation(); setState('task.status.' + i, 'rejected'); toast('Afgewezen en afgerond', { icon: 'close', kind: 'muted' }) }
  const doLater = (e) => { e && e.stopPropagation(); setState('task.status.' + i, 'snoozed'); setState('task.snooze.' + i, 'komt later terug'); toast('Komt later terug', { icon: 'clock', kind: 'muted' }) }

  return (
    <div className={'tk-task' + (open ? ' open' : '') + (t.overdue ? ' urgent' : '')}>
      <div className="tk-task-row" onClick={() => setOpen((v) => !v)}>
        {t.overdue && <span className="tk-task-flag" title="Over de vervaldatum" />}
        <Avatar agent={t.agent} size={34} />
        <div className="tk-task-mid">
          <div className="tk-task-title">{t.title}</div>
          <div className="tk-task-meta">
            {mm && (
              <span className="tk-task-mod" style={{ color: AC(t.accent), background: ACsoft(t.accent) }}>
                <span dangerouslySetInnerHTML={{ __html: ICONS(mm.icon, { sw: 2 }) }} />{mm.name}
              </span>
            )}
            <span className="tk-task-by"><b>{ag.name}</b>{t.desc ? ' · ' + t.desc : ''}</span>
          </div>
        </div>
        <button className="tk-task-view" onClick={(e) => { e.stopPropagation(); setOpen((v) => !v) }}>
          {open ? 'Sluiten' : 'Bekijk'}
          <span className="tk-task-chev" dangerouslySetInnerHTML={{ __html: ICONS('chevron', { sw: 2.2 }) }} />
        </button>
      </div>

      {open && (
        <div className="tk-task-body">
          <div className="tk-task-why">
            <span className="tk-why-k mono">Samenvatting</span>
            <p className="tk-why-t">{t.why}</p>
            {t.source && <div className="tk-why-src mono"><span dangerouslySetInnerHTML={{ __html: ICONS('link', { sw: 2 }) }} />{t.source}</div>}
          </div>
          <div className="tk-actions">
            <button className="tk-act prim" style={{ background: AC(t.accent) }} onClick={doApprove}>
              <span dangerouslySetInnerHTML={{ __html: ICONS(t.icon || 'check', { sw: 2.1 }) }} />{t.action || 'Keur goed'}
            </button>
            {mm && (
              <button className="tk-act" onClick={() => onOpen && onOpen(t.mod)}>
                <span dangerouslySetInnerHTML={{ __html: ICONS('eye', { sw: 1.9 }) }} />Bekijk
              </button>
            )}
            <button className="tk-act" onClick={doLater}>
              <span dangerouslySetInnerHTML={{ __html: ICONS('clock', { sw: 1.9 }) }} />Later
            </button>
            <button className="tk-act" onClick={doReject}>
              <span dangerouslySetInnerHTML={{ __html: ICONS('close', { sw: 2 }) }} />Afwijzen
            </button>
            <ObjectActions obj={{ type: 'task', key: 'task:' + i, title: t.title, agent: t.agent, accent: t.accent, custId: null }} />
          </div>
        </div>
      )}
    </div>
  )
}

/* Agenda-tijdlijn (tile-body uit tiles.jsx). */
export function AgendaTimeline() {
  return (
    <div className="agenda-list">
      {AGENDA_TODAY.map((e, i) => (
        <div className="agenda-row" key={i}>
          <span className="agenda-time">{e.time}</span>
          <span className="agenda-bar" style={{ background: AC(e.accent) }} />
          <div className="agenda-main">
            <div className="agenda-t">{e.t}</div>
            <div className="agenda-type">{e.type}</div>
          </div>
        </div>
      ))}
    </div>
  )
}

/* Iris-voorstellen (IrisAttention uit de iris-module, getrimd: lokale state
   i.p.v. de gedeelde useIrisCards/SnoozeMenu). */
const HUB = { postvak: 'Inbox', agenda: 'Agenda', vandaag: 'Vandaag', iris: 'Iris', social: 'Social' }
export function IrisVoorstellen({ onOpen }) {
  const [done, setDone] = useState({})
  const cards = KYANO.irisCards || []
  const doAction = (c, i) => {
    setDone((d) => ({ ...d, [i]: c.did || 'Afgehandeld' }))
    toast(c.did || 'Afgehandeld', { agent: /^[A-Z]/.test(c.from) ? c.from.toLowerCase() : undefined, icon: c.icon || 'check' })
  }
  const later = (c, i) => { setDone((d) => ({ ...d, [i]: 'Komt later terug' })); toast('Komt later terug', { icon: 'clock', kind: 'muted' }) }
  return (
    <div className="iris-cards">
      {cards.map((c, i) => (
        <div className={'iris-card' + (done[i] ? ' resolved' : '')} key={i} style={{ '--acc': AC(c.accent) }}>
          {done[i] ? (
            <div className="iris-done"><span dangerouslySetInnerHTML={{ __html: ICONS(/komt terug/i.test(done[i]) ? 'clock' : 'check', { sw: 2.2 }) }} />{done[i]}</div>
          ) : (
            <>
              <div className="iris-row-top">
                <span className="iris-tag" style={{ background: ACsoft(c.accent), color: AC(c.accent) }}>{c.from}</span>
                {c.ctx && <span className="iris-ctx mono">{c.ctx}</span>}
                {c.target && HUB[c.target] && <span className="iris-arrow mono"><span dangerouslySetInnerHTML={{ __html: ICONS('arrow', { sw: 2 }) }} />{HUB[c.target]}</span>}
              </div>
              <p className="iris-text">{c.text}</p>
              <div className="iris-actions">
                <button className="iris-btn primary" style={{ background: AC('teal') }} onClick={() => doAction(c, i)}>
                  <span className="iris-btn-ic" dangerouslySetInnerHTML={{ __html: ICONS(c.icon || 'arrow', { sw: 2.2 }) }} />{c.cta || 'Handel af'}
                </button>
                <button className="iris-btn ghost" onClick={() => onOpen && onOpen(c.module || c.target)}>
                  <span className="iris-btn-ic" dangerouslySetInnerHTML={{ __html: ICONS('docpen', { sw: 2 }) }} />Bekijk
                </button>
                <button className="iris-btn ghost" onClick={() => later(c, i)}>
                  <span className="iris-btn-ic" dangerouslySetInnerHTML={{ __html: ICONS('clock', { sw: 2 }) }} />Later
                </button>
              </div>
            </>
          )}
        </div>
      ))}
    </div>
  )
}
