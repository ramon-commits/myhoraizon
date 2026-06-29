/* ============================================================
   KYANO AI STUDIO · BEHEER — deel 1 (de kapstok)
   Bureau-niveau scherm voor Kyano zelf: beheert de KLANT-DASHBOARDS.
   ESM-port van de blauwdruk (dashboard/kyanobeheer.jsx · KyanoBeheer +
   KbClientCard) — exact de Team-pagina-vorm (tm-head, tm-roles, tm-grid +
   kaarten). De klantenlijst wordt gevoed uit de echte tenant-data (tenants.js)
   + demo-velden voor de Discovery-keten-status en MRR.

   Deel 1 = lijst + zoek + pakket-filter + verwijderen. De klant-detail
   (KbClientPage: Modules/Gegevens/Agents/Koppelingen) en de modals (beheer/
   nieuw/koppel) komen in deel 2; hier tonen Open/Beheer/Nieuwe klant een
   notImplemented(), nooit een dode klik.

   Aanpassing t.o.v. de bron: de `kb-*`-klassen heten hier `kyb-*` (de repo
   gebruikt `.kb-*` al voor de kanban-board); de Team-look komt uit `tm-*`.
   ============================================================ */
import React from 'react'
import { ICONS } from './icons'
import { KYANO } from './data'
import { useStore, setState, toast, confirmAsk, notImplemented } from './store.jsx'
import { AC, ACsoft } from './components.jsx'
import { TENANTS } from '../tenant/tenants'

const { useState } = React

// module-registry op id (zoals de shell/pages dat doen)
const MOD = {}
KYANO.modules.forEach((m) => (MOD[m.id] = m))

/* ---- pakketten (brein: starter | business | enterprise) ---- */
const KB_PKG = {
  starter: { key: 'starter', label: 'Starter', accent: 'navy', icon: 'spark' },
  business: { key: 'business', label: 'Business', accent: 'teal', icon: 'bars' },
  enterprise: { key: 'enterprise', label: 'Enterprise', accent: 'gold', icon: 'star' },
}
const KB_PKG_ORDER = ['starter', 'business', 'enterprise']

/* ---- provisioning-status ---- */
const KB_PROV = {
  active: { key: 'active', label: 'Live', accent: 'green' },
  trial: { key: 'trial', label: 'Trial', accent: 'gold' },
}

/* ---- Discovery-keten-status (demo-label, mapt op de brein-status-flow) ---- */
const KB_DISCOVERY = {
  accepted: { label: 'Afgerond', accent: 'green' },
  proposed: { label: 'Voorstel klaar', accent: 'gold' },
  drilling: { label: 'In gesprek', accent: 'aqua' },
  hypothesizing: { label: 'In kaart', accent: 'navy' },
}

const KB_CORE_MODS = ['vandaag', 'postvak', 'agenda']
function kbClientMods(c) { return c.mods === 'all' ? KYANO.modules.map((m) => m.id) : (c.mods || []) }
function kbModCount(c) { return KB_CORE_MODS.length + kbClientMods(c).length }
const kbInit = (name) => { const p = (name || '').trim().split(/\s+/); return ((p[0]?.[0] || '') + (p[1]?.[0] || '')).toUpperCase() }
const eur = (n) => '€ ' + (Number(n) || 0).toLocaleString('nl-NL')

/* ============================================================
   SEED-KLANTEN — uit de echte tenant-data (tenants.js) + demo Discovery/MRR.
   SEAM: vervang KB_DEMO + deze map door de brain-koppeling (deel 2+).
   ============================================================ */
const KB_DEMO = {
  t_endlessminds: { discovery: 'accepted', mrr: 1850, active: '12 min', color: 'navy' },
  t_knipenco: { discovery: 'drilling', mrr: 0, active: 'vandaag', color: 'mila' },
}
function seedClients() {
  return TENANTS.map((t) => {
    const d = KB_DEMO[t.id] || {}
    return {
      id: t.id,
      company: t.display_name,
      contact: t.primary_contact_name || '—',
      email: t.primary_contact_email || '',
      color: d.color || (t.package === 'enterprise' ? 'navy' : t.package === 'business' ? 'gold' : 'mila'),
      package: t.package || 'starter',
      status: t.status || 'trial',
      mods: t.package === 'enterprise' ? 'all' : (t.custom_modules || []),
      agents: t.active_agents || ['iris'],
      discovery: d.discovery || 'proposed',
      mrr: d.mrr || 0,
      active: d.active || '—',
    }
  })
}

function kbGetClients(store) { return store.get('kyano.beheer.clients', seedClients()) }

/* ============================================================
   PAGINA — exact de vorm van de Team-pagina (tm-head + tm-roles + tm-grid)
   ============================================================ */
export function KyanoBeheer({ onOpen }) {
  const store = useStore()
  const clients = kbGetClients(store)
  const setClients = (next) => setState('kyano.beheer.clients', next)

  const [q, setQ] = useState('')
  const [fPkg, setFPkg] = useState(null)

  const removeClient = async (c) => {
    const ok = await confirmAsk({ title: 'Klant-dashboard verwijderen?', sub: c.company + ' verliest direct alle toegang tot deze werkruimte.', confirmLabel: 'Verwijderen' })
    if (!ok) return
    setClients(clients.filter((x) => x.id !== c.id))
    toast(c.company + ' verwijderd', { icon: 'trash', kind: 'muted' })
  }

  const pkgCounts = {}
  KB_PKG_ORDER.forEach((p) => { pkgCounts[p] = clients.filter((c) => c.package === p).length })

  const ql = q.trim().toLowerCase()
  let list = clients
  if (ql) list = list.filter((c) => (c.company + ' ' + c.contact).toLowerCase().includes(ql))
  if (fPkg) list = list.filter((c) => c.package === fPkg)

  const liveN = clients.filter((c) => c.status === 'active').length

  return (
    <div className="tm kyb">
      {/* paginakop, zelfde als Team */}
      <header className="tm-head">
        <div className="tm-head-id">
          <span className="tm-head-ic" dangerouslySetInnerHTML={{ __html: ICONS('shield', { sw: 1.7 }) }} />
          <div>
            <h1 className="tm-head-t">Kyano AI Studio · Beheer</h1>
            <p className="tm-head-s">{clients.length} klant-dashboards · {liveN} live · modules, agents &amp; koppelingen</p>
          </div>
        </div>
        <div className="tm-head-acts">
          <button className="tm-invite" onClick={() => notImplemented('Nieuwe klant aanmaken')}>
            <span dangerouslySetInnerHTML={{ __html: ICONS('plus', { sw: 2.2 }) }} />Nieuwe klant
          </button>
        </div>
      </header>

      {/* zoekbalk + pakket-filter, in de stijl van de Team-filterbalk */}
      <div className="kyb-bar">
        <label className="sx-search kyb-search">
          <span dangerouslySetInnerHTML={{ __html: ICONS('search') }} />
          <input placeholder="Zoek klant of contactpersoon…" value={q} onChange={(e) => setQ(e.target.value)} />
        </label>
        <div className="tm-roles kyb-roles">
          <button className={'tm-role' + (!fPkg ? ' on' : '')} role="tab" aria-selected={!fPkg} onClick={() => setFPkg(null)}>
            <span className="tm-role-n">{clients.length}</span>Alle pakketten
          </button>
          {KB_PKG_ORDER.filter((p) => pkgCounts[p] > 0).map((p) => {
            const pk = KB_PKG[p]; const on = fPkg === p
            return (
              <button key={p} className={'tm-role' + (on ? ' on' : '')} role="tab" aria-selected={on} onClick={() => setFPkg(on ? null : p)}
                style={on ? { borderColor: AC(pk.accent), color: AC(pk.accent) } : null}>
                <span className="tm-role-dot" style={{ background: AC(pk.accent) }} />{pk.label}
                <span className="tm-role-n">{pkgCounts[p]}</span>
              </button>
            )
          })}
        </div>
      </div>

      {/* kaarten-grid, zelfde als Team */}
      <div className="tm-grid">
        {list.map((c) => (
          <KbClientCard key={c.id} c={c}
            onOpen={() => notImplemented('Klant-dashboard van ' + c.company + ' openen')}
            onManage={() => notImplemented('Beheer-paneel van ' + c.company)}
            onRemove={() => removeClient(c)} />
        ))}
        {list.length === 0 && <div className="kyb-empty mono">Geen klant-dashboards in deze weergave.</div>}
        {!ql && !fPkg && (
          <button className="tm-ghost" onClick={() => notImplemented('Klant-dashboard toevoegen')}>
            <span className="tm-ghost-ic" dangerouslySetInnerHTML={{ __html: ICONS('plus', { sw: 2 }) }} />
            <span className="tm-ghost-t">Klant-dashboard toevoegen</span>
            <span className="tm-ghost-s">Zet een nieuwe klant klaar</span>
          </button>
        )}
      </div>
    </div>
  )
}

/* ---- klant-kaart, mirror van de Team MemberCard ---- */
function KbClientCard({ c, onOpen, onManage, onRemove }) {
  const pkg = KB_PKG[c.package] || KB_PKG.starter
  const prov = KB_PROV[c.status] || KB_PROV.trial
  const disc = KB_DISCOVERY[c.discovery] || KB_DISCOVERY.proposed
  const allAccess = c.mods === 'all'
  const mods = kbClientMods(c)
  const dots = allAccess ? [] : mods.slice(0, 5)

  return (
    <div className="tm-card kyb-card">
      <div className="tm-card-top kyb-card-open" onClick={onOpen} title="Open klant-dashboard">
        <span className="tm-av" style={{ background: AC(c.color || 'navy') }} data-status={c.status}>
          {kbInit(c.company)}
          <span className="tm-av-dot" style={{ background: AC(prov.accent) }} title={prov.label} />
        </span>
        <div className="tm-card-id">
          <div className="tm-card-name">{c.company}</div>
          <div className="tm-card-mail">{c.contact}</div>
        </div>
        <span className="tm-rolebadge" style={{ color: AC(pkg.accent), background: ACsoft(pkg.accent) }}>
          <span dangerouslySetInnerHTML={{ __html: ICONS(pkg.icon, { sw: 2 }) }} />{pkg.label}
        </span>
      </div>

      <div className="tm-line">
        <span className="tm-line-cap"><span dangerouslySetInnerHTML={{ __html: ICONS('euro', { sw: 2 }) }} />{eur(c.mrr)}/mnd</span>
        <span className="kyb-badge" style={{ color: AC(disc.accent), background: ACsoft(disc.accent) }}>
          <span className="kyb-badge-dot" style={{ background: AC(disc.accent) }} />{disc.label}
        </span>
        <span className="tm-line-sep" />
        <span className="tm-line-mods">
          {allAccess
            ? <><span className="tm-line-all" dangerouslySetInnerHTML={{ __html: ICONS('check', { sw: 2.6 }) }} />Alle modules</>
            : <>
                <span className="tm-dots">{dots.map((id) => { const md = MOD[id]; return md ? <span key={id} className="tm-dot" style={{ background: AC(md.accent) }} title={md.name} /> : null })}</span>
                {kbModCount(c)} modules
              </>}
        </span>
        <span className="tm-line-active" style={{ color: prov.key === 'active' ? 'var(--a-green)' : 'var(--a-gold)' }}>{prov.label}</span>
      </div>

      <div className="tm-card-acts">
        <button className="tm-btn" onClick={onOpen}>
          <span dangerouslySetInnerHTML={{ __html: ICONS('arrow', { sw: 1.9 }) }} />Open
        </button>
        <button className="tm-btn ghost" onClick={onManage}>
          <span dangerouslySetInnerHTML={{ __html: ICONS('sliders', { sw: 1.9 }) }} />Beheer
        </button>
        <button className="tm-btn-x" title={'Verwijder ' + c.company} onClick={onRemove}>
          <span dangerouslySetInnerHTML={{ __html: ICONS('trash', { sw: 1.9 }) }} />
        </button>
      </div>
    </div>
  )
}
