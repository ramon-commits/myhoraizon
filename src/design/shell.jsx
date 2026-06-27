/* Shell uit de Claude Design-blauwdruk (app.jsx): gegroepeerde sidebar met
   card-groepen + Iris-teller + module-tellers, en topbar met breadcrumb, zoek,
   Bewerk/Nieuw/notificaties/account. Markup en classes 1:1 met de blauwdruk;
   navigatie geadapteerd naar react-router (go/view i.p.v. view-state). */
import React from 'react'
import { ICONS } from './icons'
import { KYANO } from './data'
import { useStore, setState, toast } from './store.jsx'
import { AC, ACsoft, HoraizonLogo } from './components.jsx'
import { useSmartMenu } from './menus'

const { useState, useRef, useEffect } = React

// module-registry op id
const MOD = {}
KYANO.modules.forEach((m) => { MOD[m.id] = m })

// Sidebar-blokken (card-groepen), exact uit de blauwdruk.
const NAV = [
  ['sales', 'pipeline', 'relatiebeheer', 'finder', 'crm'],
  ['website', 'paginas', 'editor', 'aanvragen', 'seo', 'studio', 'domein'],
  ['offertes', 'contracten', 'facturen'],
  ['social'],
  ['exact', 'mollie', 'google'],
  ['analytics', 'omzet', 'club', 'agents'],
]
const PRIMARY = ['vandaag', 'postvak', 'agenda']

// live badge-teller per module (zoals Iris z'n 3)
function moduleBadge(id, store) {
  const m = MOD[id]
  if (!m) return 0
  switch (id) {
    case 'vandaag': return KYANO.tasks.filter((_, i) => store.get('task.status.' + i, 'pending') === 'pending').length
    case 'postvak': {
      const conv = (MOD['vandaag'] && MOD['vandaag'].conversations) || []
      return conv.filter((c) => (store.get('hub.status.' + c.id) || (c.status === 'done' ? 'done' : 'open')) === 'open').length
    }
    case 'offertes': return (m.list || []).filter((o) => o.wait && !store.get('offerte.sent.' + o.name)).length
    case 'contracten': return (m.list || []).filter((c) => c.wait && !store.get('contract.signed.' + c.name)).length
    case 'facturen': return (m.list || []).filter((f) => !(f.paid || store.get('factuur.paid.' + f.name))).length
    case 'sales': return (m.deals || []).filter((d) => d.warn).length
    case 'studio': return (m.posts || []).filter((p, i) => p.wait && !store.get('post.ok.' + i)).length
    case 'crm': return (m.list || []).filter((c) => /stil|win-back/i.test(c.tag)).length
    case 'finder': return (m.leads || []).filter((l) => !store.get('lead.crm.' + l.name)).length
    case 'club': return m.questions || 0
    case 'agenda': return (m.today || []).length
    default: return 0
  }
}

function LetterAv({ name, accent, size = 32 }) {
  return (
    <span className="letter-av" style={{ width: size, height: size, fontSize: size * 0.42, background: AC(accent), color: '#fff' }}>{name[0]}</span>
  )
}

export function Sidebar({ view, go, flags, email, onLogout }) {
  const store = useStore()
  const irisN = (KYANO.tasks || []).filter((_, i) => store.get('task.status.' + i, 'pending') === 'pending').length

  const NavBtn = (id, opts = {}) => {
    const m = MOD[id]
    if (!m) return null
    const n = moduleBadge(id, store)
    return (
      <button key={id} className={'sb-item' + (opts.primary ? ' primary' : '') + (view === id ? ' on' : '')} onClick={() => go(id)}>
        <span className="sb-ic" style={view === id ? null : { color: opts.primary ? AC('aqua') : AC(m.accent) }}>
          <span dangerouslySetInnerHTML={{ __html: ICONS(m.icon) }} />
        </span>
        <span className="sb-lbl">{m.name}</span>
        {n > 0 && <span className="sb-badge" style={view === id ? null : { color: AC(m.accent), background: ACsoft(m.accent) }}>{n}</span>}
      </button>
    )
  }

  return (
    <nav className="sidebar">
      <div className="sb-logo">
        <div className="sb-brand">
          <HoraizonLogo size={28} />
          <span className="sb-word">MyHor<span className="ai">AI</span>zon</span>
        </div>
        <span className="sb-sub">Klant-werkruimte</span>
      </div>

      <div className="sb-scroll">
        <button className={'sb-item home' + (view === 'dashboard' ? ' on' : '')} onClick={() => go('dashboard')}>
          <span className="sb-ic"><span dangerouslySetInnerHTML={{ __html: ICONS('grid') }} /></span>
          <span className="sb-lbl">Dashboard</span>
        </button>

        <div className="sb-primary">
          <button className={'sb-item iris-nav primary' + (view === 'iris' ? ' on' : '')} onClick={() => go('iris')}>
            <span className="sb-ic iris-ic"><img className="sb-ic-logo" src="/brand/horaizon-teal-1e7f75.svg" alt="Iris" width={24} height={24} /></span>
            <span className="sb-lbl">Iris</span>
            {irisN > 0 && <span className="iris-badge">{irisN}</span>}
          </button>
          {PRIMARY.filter((id) => flags[id] !== false).map((id) => NavBtn(id, { primary: true }))}
          {flags['people'] !== false && NavBtn('people', { primary: true })}
        </div>

        {NAV.map((grp, gi) => {
          const items = grp.filter((id) => flags[id] !== false)
          const last = gi === NAV.length - 1
          if (items.length === 0 && !last) return null
          return (
            <div className="sb-group" key={gi}>
              {items.map((id) => NavBtn(id))}
              {last && (
                <button className={'sb-item' + (view === 'settings' ? ' on' : '')} onClick={() => go('settings')}>
                  <span className="sb-ic" style={view === 'settings' ? null : { color: 'var(--ink2)' }}>
                    <span dangerouslySetInnerHTML={{ __html: ICONS('sliders') }} />
                  </span>
                  <span className="sb-lbl">Instellingen</span>
                </button>
              )}
            </div>
          )
        })}
      </div>

      <div className="sb-user">
        <div className="sb-uline mono">Ingelogd als</div>
        <div className="sb-umail">{email || KYANO.client.email}</div>
        <button className="sb-logout" onClick={onLogout}>
          <span dangerouslySetInnerHTML={{ __html: ICONS('logout') }} />Uitloggen
        </button>
      </div>
    </nav>
  )
}

/* sluit een menu bij klik buiten */
function useMenu() {
  const [open, setOpen] = useState(false)
  const ref = useRef(null)
  useEffect(() => {
    if (!open) return
    const h = (e) => { if (ref.current && !ref.current.contains(e.target)) setOpen(false) }
    window.addEventListener('pointerdown', h)
    return () => window.removeEventListener('pointerdown', h)
  }, [open])
  return [open, setOpen, ref]
}

function buildSearch(flags) {
  const srcs = [
    { mod: 'crm', arr: (MOD.crm && MOD.crm.list) || [], kind: 'Contact', sub: (x) => (x.co || '') + (x.tag ? ' · ' + x.tag : '') },
    { mod: 'sales', arr: (MOD.sales && MOD.sales.deals) || [], kind: 'Deal', sub: (x) => (x.v || '') + (x.stage ? ' · ' + x.stage : '') },
    { mod: 'offertes', arr: (MOD.offertes && MOD.offertes.list) || [], kind: 'Offerte', sub: (x) => (x.v || '') + (x.status ? ' · ' + x.status : '') },
    { mod: 'facturen', arr: (MOD.facturen && MOD.facturen.list) || [], kind: 'Factuur', sub: (x) => (x.v || x.amount || '') + (x.status ? ' · ' + x.status : '') },
    { mod: 'finder', arr: (MOD.finder && MOD.finder.leads) || [], kind: 'Lead', sub: (x) => x.area || '' },
  ]
  const out = []
  srcs.forEach((s) => {
    if (flags[s.mod] === false) return
    const m = MOD[s.mod]; if (!m) return
    s.arr.forEach((x) => { if (x && x.name) out.push({ name: x.name, sub: s.sub(x), kind: s.kind, mod: s.mod, icon: m.icon, accent: m.accent }) })
  })
  return out
}

function TopSearch({ go, flags }) {
  const [q, setQ] = useState('')
  const [open, setOpen, ref] = useMenu()
  const ql = q.trim().toLowerCase()
  const results = ql ? buildSearch(flags).filter((r) => r.name.toLowerCase().includes(ql) || (r.sub || '').toLowerCase().includes(ql)).slice(0, 8) : []
  return (
    <div className="tb-search" ref={ref}>
      <span className="tb-search-ic" dangerouslySetInnerHTML={{ __html: ICONS('search') }} />
      <input className="tb-search-in" placeholder="Zoek klant, deal, offerte of factuur…"
        value={q} onChange={(e) => { setQ(e.target.value); setOpen(true) }} onFocus={() => setOpen(true)} />
      {q && <button className="tb-search-x" onClick={() => { setQ(''); setOpen(false) }} dangerouslySetInnerHTML={{ __html: ICONS('close', { sw: 2.2 }) }} />}
      {open && ql && (
        <div className="tb-pop tb-search-pop">
          {results.length === 0 ? (
            <div className="tb-empty mono">Niets gevonden voor “{q}”</div>
          ) : results.map((r, i) => (
            <button key={i} className="tb-res" onClick={() => { go(r.mod); setOpen(false); setQ('') }}>
              <span className="tb-res-ic" style={{ color: AC(r.accent), background: ACsoft(r.accent) }} dangerouslySetInnerHTML={{ __html: ICONS(r.icon) }} />
              <span className="tb-res-main"><span className="tb-res-name">{r.name}</span><span className="tb-res-sub mono">{r.sub}</span></span>
              <span className="tb-res-kind mono">{r.kind}</span>
            </button>
          ))}
        </div>
      )}
    </div>
  )
}

function NieuwMenu({ go, onAddWidget }) {
  const [open, setOpen, ref] = useMenu()
  const popRef = useSmartMenu({ dep: open, align: 'end', margin: 12 })
  const items = [
    { k: 'Taak', icon: 'check', accent: 'navy', mod: 'vandaag', task: true, msg: "Nieuwe taak, zet 'm voor jezelf klaar in Vandaag" },
    { k: 'Klant', icon: 'people', accent: 'red', mod: 'crm', msg: 'Nieuw contact, vul de gegevens aan in het CRM' },
    { k: 'Offerte', icon: 'doc', accent: 'teal', mod: 'offertes', msg: 'Nieuwe offerte, kies de klant en het pakket' },
    { k: 'Afspraak', icon: 'calendar', accent: 'purple', mod: 'agenda', msg: 'Nieuwe afspraak, kies een tijd in de agenda' },
  ]
  return (
    <div className="tb-menu-wrap" ref={ref}>
      <button className={'tb-btn nieuw' + (open ? ' on' : '')} onClick={() => setOpen((o) => !o)}>
        <span dangerouslySetInnerHTML={{ __html: ICONS('plus', { sw: 2.2 }) }} />Nieuw
      </button>
      {open && (
        <div className="tb-pop tb-nieuw-pop" ref={popRef}>
          <div className="tb-pop-head mono">Snel aanmaken</div>
          {items.map((it) => (
            <button key={it.k} className="tb-pop-item" onClick={() => { setOpen(false); go(it.mod); if (it.task) { setState('ui.openTaskAdd', Date.now()) } else { toast(it.msg, { icon: 'spark' }) } }}>
              <span className="tb-pop-ic" style={{ color: AC(it.accent), background: ACsoft(it.accent) }} dangerouslySetInnerHTML={{ __html: ICONS(it.icon) }} />
              <span className="tb-pop-lbl">{it.k}</span>
            </button>
          ))}
          <div className="tb-pop-div" />
          <button className="tb-pop-item" onClick={() => { setOpen(false); onAddWidget && onAddWidget() }}>
            <span className="tb-pop-ic" style={{ color: AC('gold'), background: ACsoft('gold') }} dangerouslySetInnerHTML={{ __html: ICONS('grid') }} />
            <span className="tb-pop-lbl">Widget op dashboard</span>
          </button>
        </div>
      )}
    </div>
  )
}

function NotifBell({ go }) {
  const [open, setOpen, ref] = useMenu()
  const popRef = useSmartMenu({ dep: open, align: 'end', margin: 12 })
  const feed = (MOD.agents && MOD.agents.feed) || []
  return (
    <div className="tb-menu-wrap" ref={ref}>
      <button className={'tb-icon-btn' + (open ? ' on' : '')} onClick={() => setOpen((o) => !o)} aria-label="Meldingen">
        <span dangerouslySetInnerHTML={{ __html: ICONS('bell') }} />
        {feed.length > 0 && <span className="tb-dot" />}
      </button>
      {open && (
        <div className="tb-pop tb-notif-pop" ref={popRef}>
          <div className="tb-pop-head mono">Wat je agents deden</div>
          <div className="tb-notif-list">
            {feed.map((f, i) => {
              const a = KYANO.agents[f.who] || { name: f.who, accent: 'navy' }
              return (
                <div className="tb-notif" key={i}>
                  <LetterAv name={a.name} accent={a.accent} size={28} />
                  <div className="tb-notif-main"><span><b>{a.name}</b> {f.act}</span><span className="tb-notif-time mono">{f.time}</span></div>
                </div>
              )
            })}
          </div>
          <button className="tb-pop-foot" onClick={() => { setOpen(false); go('agents') }}>Alles bekijken →</button>
        </div>
      )}
    </div>
  )
}

function AccountMenu({ go, onLogout }) {
  const [open, setOpen, ref] = useMenu()
  const popRef = useSmartMenu({ dep: open, align: 'end', margin: 12 })
  const c = KYANO.client
  return (
    <div className="tb-menu-wrap" ref={ref}>
      <button className="tb-avatar" onClick={() => setOpen((o) => !o)} aria-label="Account">{c.initials}</button>
      {open && (
        <div className="tb-pop tb-acct-pop" ref={popRef}>
          <div className="tb-acct-head">
            <span className="tb-acct-av">{c.initials}</span>
            <div><div className="tb-acct-name">{c.person}</div><div className="tb-acct-mail mono">{c.email}</div></div>
          </div>
          <button className="tb-pop-item" onClick={() => { setOpen(false); go('settings') }}>
            <span className="tb-pop-ic" style={{ color: AC('teal'), background: ACsoft('teal') }} dangerouslySetInnerHTML={{ __html: ICONS('sliders') }} />
            <span className="tb-pop-lbl">Beheer &amp; voorkeuren</span>
          </button>
          <div className="tb-pop-div" />
          <button className="tb-pop-item danger" onClick={() => { setOpen(false); onLogout && onLogout() }}>
            <span className="tb-pop-ic" style={{ color: AC('red'), background: ACsoft('red') }} dangerouslySetInnerHTML={{ __html: ICONS('logout') }} />
            <span className="tb-pop-lbl">Uitloggen</span>
          </button>
        </div>
      )}
    </div>
  )
}

export function TopBar({ view, go, edit, setEdit, onReset, openLib, flags, onLogout, isBoard }) {
  const crumb = view === 'dashboard' ? 'Dashboard' : view === 'iris' ? 'Iris' : view === 'settings' ? 'Beheer' : (MOD[view] ? MOD[view].name : view)
  return (
    <header className="topbar">
      <div className="tb-left">
        {view !== 'dashboard' && (
          <button className="tb-back" onClick={() => go('dashboard')}>
            <span style={{ display: 'inline-flex', transform: 'scaleX(-1)' }} dangerouslySetInnerHTML={{ __html: ICONS('chevron', { sw: 2.2 }) }} />
          </button>
        )}
        <span className="tb-crumb mono"><span className="crumb-co">{KYANO.client.company}</span> · {crumb}</span>
      </div>
      <div className="tb-mid"><TopSearch go={go} flags={flags} /></div>
      <div className="tb-actions">
        {isBoard && edit ? (
          <>
            <button className="tb-btn ghost" onClick={onReset}>Herstel</button>
            <button className="tb-btn" onClick={openLib}>
              <span dangerouslySetInnerHTML={{ __html: ICONS('grid') }} />Widget toevoegen
            </button>
            <button className="tb-btn solid" onClick={() => setEdit(false)}>
              <span dangerouslySetInnerHTML={{ __html: ICONS('check', { sw: 2.2 }) }} />Klaar
            </button>
          </>
        ) : (
          <>
            {isBoard && (
              <button className="tb-btn" onClick={() => setEdit(true)}>
                <span dangerouslySetInnerHTML={{ __html: ICONS('sliders') }} />Bewerk
              </button>
            )}
            <NieuwMenu go={go} onAddWidget={openLib} />
            <NotifBell go={go} />
            <AccountMenu go={go} onLogout={onLogout} />
          </>
        )}
      </div>
    </header>
  )
}
