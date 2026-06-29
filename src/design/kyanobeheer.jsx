/* ============================================================
   KYANO AI STUDIO · BEHEER — deel 1 (lijst) + deel 2 (klant-detailpagina)
   ESM-port van de blauwdruk (dashboard/kyanobeheer.jsx · KyanoBeheer +
   KbClientCard + KbClientPage + KbKoppelModal + KbNewModal). Exact de
   Team-pagina-vorm (tm-head, tm-roles, tm-grid + kaarten; detail in
   ManageModal-stijl met panelen Modules · Gegevens · Agents · Koppelingen).

   Integratie (deel 2): de lijst en de toggles draaien op de ECHTE tenant-config
   (TenantProvider). De component is prop-driven: `tenants` + `onPatch(id, patch)`
   (= updateTenant) + onAdd/onRemove/onOpenDashboard komen uit BeheerPage. Een
   module-/agent-toggle schrijft naar tenant.custom_modules / active_agents, en
   dat is meteen de gate voor die klant (checkModuleAccess). De brain-panelen
   (IST/SOLL/Bouwplan) zijn deel 3.

   Naamgeving: de `kb-*`-klassen uit de bron botsen met de kanban-`kb-*` in deze
   repo; de Team-look komt uit `tm-*`, beheer-specifieke bits zijn inline of `kyb-*`.
   ============================================================ */
import React from 'react'
import { ICONS } from './icons'
import { toast, confirmAsk, notImplemented, Modal, Field } from './store.jsx'
import { AC, ACsoft, Avatar, Btn, Panel } from './components.jsx'
import { MODULES } from '../tenant/modules'
import { getDiscovery } from './discovery-demo.js'

const { useState } = React

/* SOLL change-badge per stap (blijft | automatisch | vervalt | nieuw) */
const SOLL_CHANGE = {
  blijft: { label: 'Blijft', accent: 'navy', icon: 'check' },
  automatisch: { label: 'Automatisch', accent: 'green', icon: 'spark' },
  vervalt: { label: 'Vervalt', accent: 'red', icon: 'close' },
  nieuw: { label: 'Nieuw', accent: 'aqua', icon: 'plus' },
}
const OPP_LABEL = { repetitief: 'terugkerend handwerk', wachttijd: 'wachttijd' }

/* ---- de 8 agents (canoniek; iris altijd aan) ---- */
const KB_AGENTS = {
  iris: { key: 'iris', naam: 'Iris', rol: 'Directiesecretaresse · synthese' },
  hugo: { key: 'hugo', naam: 'Hugo', rol: 'Sales & relatiebeheer' },
  kai: { key: 'kai', naam: 'Kai', rol: 'Leadfinder · prospects' },
  sam: { key: 'sam', naam: 'Sam', rol: 'Inbox & Vandaag' },
  mila: { key: 'mila', naam: 'Mila', rol: 'Content & studio' },
  max: { key: 'max', naam: 'Max', rol: 'Website & groei' },
  daan: { key: 'daan', naam: 'Daan', rol: 'Analytics & omzet' },
  juris: { key: 'juris', naam: 'Juris', rol: 'Contracten & facturen' },
}
const KB_AGENT_ORDER = ['iris', 'hugo', 'kai', 'sam', 'mila', 'max', 'daan', 'juris']

const KB_PKG = {
  starter: { key: 'starter', label: 'Starter', accent: 'navy', icon: 'spark', sub: 'Basis: Vandaag, Inbox, CRM' },
  business: { key: 'business', label: 'Business', accent: 'teal', icon: 'bars', sub: 'Sales, groei en analytics erbij' },
  enterprise: { key: 'enterprise', label: 'Enterprise', accent: 'gold', icon: 'star', sub: 'Alles, inclusief maatwerk' },
}
const KB_PKG_ORDER = ['starter', 'business', 'enterprise']
const KB_PROV = {
  active: { key: 'active', label: 'Live', accent: 'green' },
  trial: { key: 'trial', label: 'Trial', accent: 'gold' },
}
const KB_DISCOVERY = {
  accepted: { label: 'Afgerond', accent: 'green' },
  proposed: { label: 'Voorstel klaar', accent: 'gold' },
  drilling: { label: 'In gesprek', accent: 'aqua' },
  hypothesizing: { label: 'In kaart', accent: 'navy' },
}
const KB_TOOL = {
  gekoppeld: { key: 'gekoppeld', label: 'Gekoppeld', accent: 'green' },
  klaar: { key: 'klaar', label: 'Klaar om te koppelen', accent: 'gold' },
  bouwen: { key: 'bouwen', label: 'Nog te bouwen', accent: 'navy' },
}
const KB_CAT = { payments: 'Betalingen', accounting: 'Boekhouding', agenda: 'Agenda', communicatie: 'Communicatie', social: 'Social media', reservations: 'Reserveringen' }
/* icoon/accent per custom-module-key (modules.js heeft geen icoon) */
const KB_MOD_META = {
  sales: { icon: 'chartup', accent: 'red' },
  website: { icon: 'globe', accent: 'gold' },
  social: { icon: 'share', accent: 'purple' },
  contracts: { icon: 'doc', accent: 'teal' },
  club: { icon: 'star', accent: 'orange' },
  events: { icon: 'calendar', accent: 'navy' },
}
const CUSTOM_MODS = MODULES.filter((m) => m.kind === 'custom')
const MODULE_LABEL = Object.fromEntries(MODULES.map((m) => [m.key, m.label]))

/* ---- demo-velden per tenant (Discovery-status, MRR, tools) ---- SEAM: brain later */
const DEFAULT_TOOLS = [{ naam: 'Mollie', cat: 'payments', status: 'klaar' }, { naam: 'Google Agenda', cat: 'agenda', status: 'bouwen' }]
const KB_DEMO = {
  t_endlessminds: { discovery: 'accepted', mrr: 1850, active: '12 min', color: 'navy', tools: [
    { naam: 'Mollie', cat: 'payments', status: 'gekoppeld' }, { naam: 'Exact Online', cat: 'accounting', status: 'gekoppeld' },
    { naam: 'Google Agenda', cat: 'agenda', status: 'klaar' }, { naam: 'WhatsApp Business', cat: 'communicatie', status: 'bouwen' }] },
  t_knipenco: { discovery: 'drilling', mrr: 0, active: 'vandaag', color: 'mila', tools: [
    { naam: 'Google Agenda', cat: 'agenda', status: 'gekoppeld' }, { naam: 'Mollie', cat: 'payments', status: 'klaar' }, { naam: 'Instagram', cat: 'social', status: 'bouwen' }] },
}

const kbInit = (name) => { const p = (name || '').trim().split(/\s+/); return ((p[0]?.[0] || '') + (p[1]?.[0] || '')).toUpperCase() }
const eur = (n) => '€ ' + (Number(n) || 0).toLocaleString('nl-NL')

/* tenant → weergave-object (merge met demo-velden) */
function clientView(t) {
  const d = KB_DEMO[t.id] || {}
  const meta = t.metadata || {}
  return {
    id: t.id, company: t.display_name || '—', contact: t.primary_contact_name || '—', email: t.primary_contact_email || '',
    package: t.package || 'starter', status: t.status || 'trial',
    custom_modules: t.custom_modules || [], active_agents: t.active_agents || ['iris'],
    tools: meta.tools || d.tools || DEFAULT_TOOLS,
    mrr: meta.mrr ?? d.mrr ?? 0, discovery: meta.discovery || d.discovery || 'proposed',
    active: d.active || 'nieuw', color: meta.color || d.color || 'navy',
  }
}
const SEC = { fontSize: 11, letterSpacing: '.04em', textTransform: 'uppercase', color: 'var(--ink3)', margin: '14px 0 6px', fontFamily: '"Geist Mono",ui-monospace,monospace' }
const TAG = { marginLeft: 7, fontSize: 9.5, fontWeight: 700, letterSpacing: '.03em', textTransform: 'uppercase', color: 'var(--ink3)', background: 'var(--bg-deep)', padding: '2px 6px', borderRadius: 6 }

/* ============================================================
   PAGINA — lijst (Team-vorm) of klant-detail (openId)
   ============================================================ */
export function KyanoBeheer({ tenants, onPatch, onAdd, onRemove, onOpenDashboard }) {
  const [q, setQ] = useState('')
  const [fPkg, setFPkg] = useState(null)
  const [openId, setOpenId] = useState(null)
  const [newOpen, setNewOpen] = useState(false)

  const clients = tenants.map(clientView)
  const openTenant = openId ? tenants.find((t) => t.id === openId) : null

  const removeClient = async (c) => {
    const ok = await confirmAsk({ title: 'Klant-dashboard verwijderen?', sub: c.company + ' verliest direct alle toegang tot deze werkruimte.', confirmLabel: 'Verwijderen' })
    if (!ok) return
    onRemove(c.id)
    toast(c.company + ' verwijderd', { icon: 'trash', kind: 'muted' })
  }

  if (openTenant) {
    return (
      <KbClientPage t={openTenant} onPatch={onPatch}
        onBack={() => setOpenId(null)}
        onOpenDashboard={() => onOpenDashboard(openTenant.id)}
        onRemove={async () => { await removeClient(clientView(openTenant)); setOpenId(null) }} />
    )
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
      <header className="tm-head">
        <div className="tm-head-id">
          <span className="tm-head-ic" dangerouslySetInnerHTML={{ __html: ICONS('shield', { sw: 1.7 }) }} />
          <div>
            <h1 className="tm-head-t">Kyano AI Studio · Beheer</h1>
            <p className="tm-head-s">{clients.length} klant-dashboards · {liveN} live · modules, agents &amp; koppelingen</p>
          </div>
        </div>
        <div className="tm-head-acts">
          <button className="tm-invite" onClick={() => setNewOpen(true)}>
            <span dangerouslySetInnerHTML={{ __html: ICONS('plus', { sw: 2.2 }) }} />Nieuwe klant
          </button>
        </div>
      </header>

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

      <div className="tm-grid">
        {list.map((c) => (
          <KbClientCard key={c.id} c={c} onOpen={() => setOpenId(c.id)} onRemove={() => removeClient(c)} />
        ))}
        {list.length === 0 && <div className="kyb-empty mono">Geen klant-dashboards in deze weergave.</div>}
        {!ql && !fPkg && (
          <button className="tm-ghost" onClick={() => setNewOpen(true)}>
            <span className="tm-ghost-ic" dangerouslySetInnerHTML={{ __html: ICONS('plus', { sw: 2 }) }} />
            <span className="tm-ghost-t">Klant-dashboard toevoegen</span>
            <span className="tm-ghost-s">Zet een nieuwe klant klaar</span>
          </button>
        )}
      </div>

      {newOpen && <KbNewModal onClose={() => setNewOpen(false)}
        onCreate={(t) => { onAdd(t); setNewOpen(false); toast(t.display_name + ' toegevoegd', { icon: 'check' }); setOpenId(t.id) }} />}
    </div>
  )
}

/* ---- klant-kaart (mirror van de Team MemberCard) ---- */
function KbClientCard({ c, onOpen, onRemove }) {
  const pkg = KB_PKG[c.package] || KB_PKG.starter
  const prov = KB_PROV[c.status] || KB_PROV.trial
  const disc = KB_DISCOVERY[c.discovery] || KB_DISCOVERY.proposed
  const allAccess = c.custom_modules.length >= CUSTOM_MODS.length
  const dots = allAccess ? [] : c.custom_modules.slice(0, 6)
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
                <span className="tm-dots">{dots.map((k) => { const md = KB_MOD_META[k]; return md ? <span key={k} className="tm-dot" style={{ background: AC(md.accent) }} title={k} /> : null })}</span>
                {c.custom_modules.length} modules
              </>}
        </span>
        <span className="tm-line-active" style={{ color: prov.key === 'active' ? 'var(--a-green)' : 'var(--a-gold)' }}>{prov.label}</span>
      </div>

      <div className="tm-card-acts">
        <button className="tm-btn" onClick={onOpen}>
          <span dangerouslySetInnerHTML={{ __html: ICONS('arrow', { sw: 1.9 }) }} />Open
        </button>
        <button className="tm-btn ghost" onClick={onOpen}>
          <span dangerouslySetInnerHTML={{ __html: ICONS('sliders', { sw: 1.9 }) }} />Beheer
        </button>
        <button className="tm-btn-x" title={'Verwijder ' + c.company} onClick={onRemove}>
          <span dangerouslySetInnerHTML={{ __html: ICONS('trash', { sw: 1.9 }) }} />
        </button>
      </div>
    </div>
  )
}

/* ============================================================
   KLANT-DETAILPAGINA — vier panelen, toggles op de tenant-config
   ============================================================ */
function KbClientPage({ t, onPatch, onBack, onRemove, onOpenDashboard }) {
  const c = clientView(t)
  const pkg = KB_PKG[c.package] || KB_PKG.starter
  const prov = KB_PROV[c.status] || KB_PROV.trial
  const disc = KB_DISCOVERY[c.discovery] || KB_DISCOVERY.proposed
  const live = CUSTOM_MODS.filter((m) => m.status === 'live')
  const gepland = CUSTOM_MODS.filter((m) => m.status === 'gepland')

  // gegevens-bewerking (inline)
  const [editG, setEditG] = useState(false)
  const [company, setCompany] = useState(c.company)
  const [contact, setContact] = useState(c.contact)
  const [email, setEmail] = useState(c.email)
  const [mrr, setMrr] = useState(String(c.mrr))
  const [pkgSel, setPkgSel] = useState(c.package)
  const [statusSel, setStatusSel] = useState(c.status)
  const [koppel, setKoppel] = useState(null)
  const [provOpen, setProvOpen] = useState(false)

  // SEAM: demo-Discovery in de echte brain-vorm (discovery-demo.js). Deel 4
  // vervangt getDiscovery() door een query op discovery_sessions.metadata.
  const discovery = getDiscovery(t.id)

  // "Zet klant klaar": pas de provisioning uit het bouwplan toe op de tenant
  // (union, dus we zetten de aanbevolen modules/agents AAN, halen niets weg).
  const applyProvisioning = () => {
    const prov = (discovery && discovery.build_plan && discovery.build_plan.provisioning) || null
    if (!prov) return
    const nextMods = [...new Set([...(t.custom_modules || []), ...(prov.custom_modules || [])])]
    const nextAgents = [...new Set([...(t.active_agents || ['iris']), ...(prov.active_agents || [])])]
    const ms = { ...(t.module_settings || {}) }
    ;(prov.custom_modules || []).forEach((k) => { ms[k] = { enabled: true, settings: ms[k]?.settings || {} } })
    onPatch(t.id, { custom_modules: nextMods, active_agents: nextAgents, module_settings: ms })
    setProvOpen(false)
    toast(c.company + ' klaargezet · ' + (prov.custom_modules || []).length + ' modules aan, ' + nextAgents.length + ' agents', { icon: 'check' })
  }

  const toggleModule = (key) => {
    const on = c.custom_modules.includes(key)
    const next = on ? c.custom_modules.filter((k) => k !== key) : [...c.custom_modules, key]
    const nextMS = { ...(t.module_settings || {}), [key]: { enabled: !on, settings: (t.module_settings || {})[key]?.settings || {} } }
    onPatch(t.id, { custom_modules: next, module_settings: nextMS })
    toast((MODULE_LABEL[key] || key) + (on ? ' uitgezet voor ' : ' aangezet voor ') + c.company, { icon: on ? 'info' : 'check', kind: on ? 'muted' : undefined })
  }
  const toggleAgent = (key) => {
    if (key === 'iris') return
    const on = c.active_agents.includes(key)
    const next = on ? c.active_agents.filter((k) => k !== key) : [...c.active_agents, key]
    onPatch(t.id, { active_agents: next })
    toast(KB_AGENTS[key].naam + (on ? ' uitgezet' : ' geactiveerd'), { icon: on ? 'info' : 'check', kind: on ? 'muted' : undefined })
  }
  const setToolStatus = (i, val) => {
    const next = c.tools.map((x, j) => (j === i ? { ...x, status: val } : x))
    onPatch(t.id, { metadata: { ...(t.metadata || {}), tools: next } })
  }
  const saveGegevens = () => {
    if (!company.trim()) { toast('Vul de bedrijfsnaam in', { icon: 'info', kind: 'muted' }); return }
    onPatch(t.id, {
      display_name: company.trim(), primary_contact_name: contact.trim(), primary_contact_email: email.trim().toLowerCase(),
      package: pkgSel, status: statusSel, metadata: { ...(t.metadata || {}), mrr: Number(mrr) || 0 },
    })
    setEditG(false); toast(company.trim() + ' bijgewerkt', { icon: 'check' })
  }

  const ModRow = ({ m, planned }) => {
    const on = c.custom_modules.includes(m.key); const meta = KB_MOD_META[m.key] || { icon: 'grid', accent: 'navy' }
    return (
      <div className={'tm-modrow' + (on ? ' on' : '')} onClick={() => toggleModule(m.key)}>
        <span className="tm-modrow-ic" style={{ color: AC(meta.accent), background: ACsoft(meta.accent) }} dangerouslySetInnerHTML={{ __html: ICONS(meta.icon, { sw: 1.9 }) }} />
        <div className="tm-modrow-main"><div className="tm-modrow-name">{m.label}{planned && <span style={TAG}>nog te bouwen</span>}</div><div className="tm-modrow-grp">{m.route ? '/' + m.route : 'dashboard'}</div></div>
        <button className={'tm-toggle' + (on ? ' on' : '')} onClick={(e) => { e.stopPropagation(); toggleModule(m.key) }}><span className="tm-toggle-knob" /></button>
      </div>
    )
  }

  return (
    <div className="tm kyb">
      <button className="tm-btn ghost" style={{ marginBottom: 12 }} onClick={onBack}>
        <span style={{ display: 'inline-flex', transform: 'scaleX(-1)' }} dangerouslySetInnerHTML={{ __html: ICONS('arrow', { sw: 2 }) }} />Alle klant-dashboards
      </button>

      <header style={{ display: 'flex', gap: 16, alignItems: 'center', padding: '2px 2px 10px', flexWrap: 'wrap' }}>
        <span className="tm-av" style={{ width: 54, height: 54, fontSize: 20, background: AC(c.color || 'navy') }} data-status={c.status}>
          {kbInit(c.company)}<span className="tm-av-dot" style={{ background: AC(prov.accent) }} />
        </span>
        <div style={{ flex: 1, minWidth: 200 }}>
          <div style={{ display: 'flex', gap: 8, alignItems: 'center', flexWrap: 'wrap', marginBottom: 4 }}>
            <span className="tm-rolebadge" style={{ color: AC(pkg.accent), background: ACsoft(pkg.accent) }}><span dangerouslySetInnerHTML={{ __html: ICONS(pkg.icon, { sw: 2 }) }} />{pkg.label}</span>
            <span className="kyb-badge" style={{ color: AC(prov.accent), background: ACsoft(prov.accent) }}><span className="kyb-badge-dot" style={{ background: AC(prov.accent) }} />{prov.label}</span>
            <span className="kyb-badge" style={{ color: AC(disc.accent), background: ACsoft(disc.accent) }}><span className="kyb-badge-dot" style={{ background: AC(disc.accent) }} />{disc.label}</span>
          </div>
          <h1 style={{ font: '700 24px/1.1 var(--font-display,inherit)', letterSpacing: '-.02em', margin: 0, color: 'var(--ink)' }}>{c.company}</h1>
          <div className="mono" style={{ fontSize: 12, color: 'var(--ink3)', marginTop: 3 }}>{c.contact} · {c.custom_modules.length} modules · {c.active_agents.length}/8 agents · {eur(c.mrr)}/mnd</div>
        </div>
        <div style={{ display: 'flex', gap: 8 }}>
          <Btn kind="soft" accent="navy" icon="eye" size="sm" onClick={onOpenDashboard}>Bekijk in dashboard</Btn>
          <Btn kind="solid" accent="red" icon="trash" size="sm" onClick={onRemove}>Verwijderen</Btn>
        </div>
      </header>

      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit,minmax(320px,1fr))', gap: 16 }}>
        {/* Modules — toggles op tenant.custom_modules */}
        <Panel title="Modules" eyebrow="Wat deze klant mag" accent="navy">
          <div className="tm-core-note">
            <span dangerouslySetInnerHTML={{ __html: ICONS('lock', { sw: 1.9 }) }} />
            Dashboard, Vandaag, Inbox, CRM en Iris zijn kern-modules en staan altijd aan.
          </div>
          <div style={SEC}>Beschikbaar · meteen aanzetten</div>
          {live.map((m) => <ModRow key={m.key} m={m} />)}
          <div style={SEC}>Nog te bouwen</div>
          {gepland.map((m) => <ModRow key={m.key} m={m} planned />)}
        </Panel>

        {/* Gegevens */}
        <Panel title="Gegevens" eyebrow="Klantgegevens" accent="teal"
          right={<button className="tm-allbtn" onClick={() => { if (editG) saveGegevens(); else setEditG(true) }}>{editG ? 'Opslaan' : 'Bewerk'}</button>}>
          {editG ? (
            <>
              <div className="tm-fgrid">
                <Field label="Bedrijfsnaam" value={company} onChange={setCompany} placeholder="Bijv. Sloepenspel Amsterdam" />
                <Field label="Contactpersoon" value={contact} onChange={setContact} placeholder="Voor- en achternaam" />
                <Field label="E-mailadres" value={email} onChange={setEmail} placeholder="naam@bedrijf.nl" type="email" />
                <Field label="MRR (€ per maand)" value={mrr} onChange={setMrr} placeholder="0" type="number" />
              </div>
              <div style={SEC}>Pakket</div>
              <div className="tm-rolepick">
                {KB_PKG_ORDER.map((pk) => { const p = KB_PKG[pk]; const on = pkgSel === pk; return (
                  <button key={pk} className={'tm-rolepick-b' + (on ? ' on' : '')} onClick={() => setPkgSel(pk)} style={on ? { borderColor: AC(p.accent), background: ACsoft(p.accent) } : null}>
                    <span className="tm-rolepick-ic" style={{ color: AC(p.accent) }} dangerouslySetInnerHTML={{ __html: ICONS(p.icon, { sw: 1.9 }) }} />
                    <span className="tm-rolepick-txt"><b>{p.label}</b><span>{p.sub}</span></span>
                    {on && <span className="tm-rolepick-chk" style={{ color: AC(p.accent) }} dangerouslySetInnerHTML={{ __html: ICONS('check', { sw: 2.6 }) }} />}
                  </button>
                ) })}
              </div>
              <div style={SEC}>Status</div>
              <div className="tm-capseg">
                {Object.values(KB_PROV).map((s) => (
                  <button key={s.key} className={'tm-capseg-b' + (statusSel === s.key ? ' on' : '')} onClick={() => setStatusSel(s.key)}>
                    <span dangerouslySetInnerHTML={{ __html: ICONS(s.key === 'active' ? 'check' : 'clock', { sw: 2 }) }} />
                    <b>{s.label}</b><span>{s.key === 'active' ? 'Betalend, live' : 'Proefperiode'}</span>
                  </button>
                ))}
              </div>
            </>
          ) : (
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px 18px' }}>
              {[['Contactpersoon', c.contact], ['E-mail', c.email || '—'], ['Pakket', pkg.label], ['Status', prov.label], ['MRR', eur(c.mrr) + '/mnd'], ['Laatst actief', c.active]].map(([k, v]) => (
                <div key={k}><div className="mono" style={{ fontSize: 10.5, letterSpacing: '.04em', textTransform: 'uppercase', color: 'var(--ink3)' }}>{k}</div><div style={{ fontSize: 13.5, color: 'var(--ink)', marginTop: 2 }}>{v}</div></div>
              ))}
            </div>
          )}
        </Panel>

        {/* Agents — toggles op tenant.active_agents */}
        <Panel title="Agents" eyebrow={c.active_agents.length + ' van 8 actief'} accent="aqua">
          <div className="tm-core-note">
            <span dangerouslySetInnerHTML={{ __html: ICONS('spark', { sw: 1.9 }) }} />
            Iris stuurt de andere agents aan en staat altijd aan. Zet alleen de agents aan die deze klant nodig heeft.
          </div>
          {KB_AGENT_ORDER.map((k) => { const a = KB_AGENTS[k]; const on = c.active_agents.includes(k); const locked = k === 'iris'; return (
            <div className={'tm-modrow' + (on ? ' on' : '')} key={k} onClick={() => toggleAgent(k)}>
              <span style={{ flex: '0 0 auto', marginRight: 2 }}><Avatar agent={k} size={30} /></span>
              <div className="tm-modrow-main"><div className="tm-modrow-name">{a.naam}{locked && <span style={TAG}>altijd aan</span>}</div><div className="tm-modrow-grp">{a.rol}</div></div>
              <button className={'tm-toggle' + (on ? ' on' : '')} disabled={locked} onClick={(e) => { e.stopPropagation(); toggleAgent(k) }}><span className="tm-toggle-knob" /></button>
            </div>
          ) })}
        </Panel>

        {/* Koppelingen */}
        <Panel title="Koppelingen" eyebrow="Tools van de klant" accent="green">
          <div className="tm-core-note">
            <span dangerouslySetInnerHTML={{ __html: ICONS('share', { sw: 1.9 }) }} />
            Koppel de tools die de klant gebruikt. Wat nog niet bestaat, zet je op de roadmap.
          </div>
          {c.tools.map((tool, i) => { const ts = KB_TOOL[tool.status] || KB_TOOL.bouwen; return (
            <div className="tm-modrow" style={{ cursor: 'default' }} key={i}>
              <span className="tm-modrow-ic" style={{ color: AC('green'), background: ACsoft('green') }} dangerouslySetInnerHTML={{ __html: ICONS('share', { sw: 1.9 }) }} />
              <div className="tm-modrow-main"><div className="tm-modrow-name">{tool.naam}</div><div className="tm-modrow-grp">{KB_CAT[tool.cat] || tool.cat}</div></div>
              <span className="kyb-badge" style={{ color: AC(ts.accent), background: ACsoft(ts.accent) }}><span className="kyb-badge-dot" style={{ background: AC(ts.accent) }} />{ts.label}</span>
              <span style={{ display: 'flex', gap: 6, marginLeft: 8, flex: '0 0 auto' }}>
                {tool.status === 'gekoppeld' && <button className="tm-allbtn" onClick={() => { setToolStatus(i, 'klaar'); toast(tool.naam + ' ontkoppeld', { icon: 'info', kind: 'muted' }) }}>Ontkoppelen</button>}
                {tool.status === 'klaar' && <button className="tm-allbtn" onClick={() => setKoppel(i)}>Koppelen</button>}
                {tool.status === 'bouwen' && <button className="tm-allbtn" onClick={() => notImplemented(tool.naam + ' aanvragen · op de roadmap')}>Aanvragen</button>}
              </span>
            </div>
          ) })}
          {c.tools.length === 0 && <div className="kyb-empty mono" style={{ padding: 14 }}>Nog geen tools om te koppelen.</div>}
        </Panel>
      </div>

      <div style={{ ...SEC, fontSize: 12, margin: '22px 0 8px' }}>Discovery · onboarding {discovery ? '' : '(nog geen)'} · demo-data in de echte brein-vorm</div>
      {discovery ? (
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit,minmax(340px,1fr))', gap: 16 }}>
          <IstPanel disc={discovery} />
          <SollPanel soll={discovery.soll} />
          <BouwplanPanel plan={discovery.build_plan} onZetKlaar={() => setProvOpen(true)} />
        </div>
      ) : (
        <Panel title="Discovery" eyebrow="IST · SOLL · Bouwplan" accent="navy">
          <div className="kyb-empty mono" style={{ padding: 14 }}>Nog geen Discovery voor deze klant. Start een Discovery-gesprek om de processen in kaart te brengen.</div>
        </Panel>
      )}

      {provOpen && discovery && <KbProvisionModal company={c.company} plan={discovery.build_plan} onClose={() => setProvOpen(false)} onConfirm={applyProvisioning} />}

      {koppel != null && c.tools[koppel] && <KbKoppelModal tool={c.tools[koppel]} onClose={() => setKoppel(null)}
        onDone={() => { setToolStatus(koppel, 'gekoppeld'); toast(c.tools[koppel].naam + ' gekoppeld', { icon: 'check' }); setKoppel(null) }} />}
    </div>
  )
}

/* ---- IST-paneel: huidige processen, per stap owner/tool + opportunity ---- */
function IstPanel({ disc }) {
  const vmap = {}; (disc.validated_flows || []).forEach((v) => { vmap[v.flow_index] = v.validated })
  return (
    <Panel title="Huidig proces (IST)" eyebrow="Wat de klant nu doet" accent="navy">
      {disc.hypothesized_flows.map((f, i) => {
        const pills = (disc.flow_details && disc.flow_details['flow_' + i] && disc.flow_details['flow_' + i].step_pills) || {}
        const val = vmap[i]
        return (
          <div key={i} style={{ marginBottom: 14 }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: 8, margin: '4px 0 6px', flexWrap: 'wrap' }}>
              <b style={{ fontSize: 13.5 }}>{f.name}</b>
              <span className="kyb-badge" style={{ color: AC('navy'), background: ACsoft('navy') }}>{f.category_nl}</span>
              <span className="kyb-badge" style={{ color: AC(val ? 'green' : 'gold'), background: ACsoft(val ? 'green' : 'gold') }}><span className="kyb-badge-dot" style={{ background: AC(val ? 'green' : 'gold') }} />{val ? 'Bevestigd' : 'Niet bevestigd'}</span>
            </div>
            {f.steps.map((s, j) => { const p = pills[s] || {}; return (
              <div key={j} className="tm-modrow" style={{ cursor: 'default' }}>
                <span className="tm-modrow-ic" style={{ color: AC('navy'), background: ACsoft('navy'), fontSize: 11, fontWeight: 700 }}>{j + 1}</span>
                <div className="tm-modrow-main"><div className="tm-modrow-name">{s}</div><div className="tm-modrow-grp">{p.owner || '—'} · {p.sample_answer || '—'}</div></div>
                {p.opportunity && <span className="kyb-badge" style={{ color: AC('orange'), background: ACsoft('orange') }}>{OPP_LABEL[p.opportunity] || p.opportunity}</span>}
              </div>
            ) })}
          </div>
        )
      })}
    </Panel>
  )
}

/* ---- SOLL-paneel: per stap change-badge + wat Kyano bouwt + winst ---- */
function SollPanel({ soll }) {
  if (!soll) return null
  const fin = soll.status === 'gefinaliseerd'
  return (
    <Panel title="Optimaal proces (SOLL)" eyebrow="Wat Kyano bouwt" accent="green"
      right={<span className="kyb-badge" style={{ color: AC(fin ? 'green' : 'gold'), background: ACsoft(fin ? 'green' : 'gold') }}>{fin ? 'Gefinaliseerd' : 'Concept'}</span>}>
      {soll.macro && <p style={{ fontSize: 12.5, lineHeight: 1.5, color: 'var(--ink2)', margin: '0 0 12px' }}>{soll.macro}</p>}
      {(soll.flows || []).map((f, i) => {
        const pills = (soll.flow_details && soll.flow_details['flow_' + i] && soll.flow_details['flow_' + i].step_pills) || {}
        return (
          <div key={i} style={{ marginBottom: 14 }}>
            <div style={{ margin: '4px 0 2px' }}><b style={{ fontSize: 13.5 }}>{f.name}</b></div>
            {f.verhaal && <div style={{ fontSize: 11.5, color: 'var(--ink3)', margin: '0 0 6px' }}>{f.verhaal}</div>}
            {(f.steps || []).map((s, j) => { const p = pills[s] || {}; const ch = SOLL_CHANGE[p.soll_change] || SOLL_CHANGE.blijft; const auto = p.soll_change === 'automatisch' || p.soll_change === 'nieuw'; return (
              <div key={j} className="tm-modrow" style={{ cursor: 'default', alignItems: 'flex-start' }}>
                <span className="kyb-badge" style={{ color: AC(ch.accent), background: ACsoft(ch.accent), flex: '0 0 auto', marginTop: 1 }}><span dangerouslySetInnerHTML={{ __html: ICONS(ch.icon, { sw: 2 }) }} />{ch.label}</span>
                <div className="tm-modrow-main">
                  <div className="tm-modrow-name" style={p.soll_change === 'vervalt' ? { textDecoration: 'line-through', opacity: 0.65 } : null}>{s}</div>
                  {auto && p.wat_kyano_bouwt && <div className="tm-modrow-grp">{p.wat_kyano_bouwt}{p.winst_indicatie ? ' · ' + p.winst_indicatie : ''}</div>}
                </div>
                {auto && p.build_mapping && p.build_mapping.agent_naam && <span className="kyb-badge" style={{ color: AC('navy'), background: ACsoft('navy'), flex: '0 0 auto' }}>{p.build_mapping.agent_naam}</span>}
              </div>
            ) })}
          </div>
        )
      })}
    </Panel>
  )
}

/* ---- Bouwplan-paneel: provisioning + maatwerk-backlog + "Zet klant klaar" ---- */
function BouwplanPanel({ plan, onZetKlaar }) {
  if (!plan) return null
  const prov = plan.provisioning || {}
  const sum = plan.summary || {}
  return (
    <Panel title="Bouwplan" eyebrow="Provisioning &amp; maatwerk" accent="gold">
      <div style={SEC}>Provisioning · {prov.status || '—'}</div>
      <div style={{ display: 'flex', flexWrap: 'wrap', gap: 6, marginBottom: 8 }}>
        {(prov.custom_modules || []).map((k) => <span key={k} className="kyb-badge" style={{ color: AC('gold'), background: ACsoft('gold') }}>{MODULE_LABEL[k] || k}</span>)}
      </div>
      <div className="mono" style={{ fontSize: 11.5, color: 'var(--ink3)' }}>{(prov.active_agents || []).map((k) => KB_AGENTS[k]?.naam || k).join(' · ')}</div>
      {sum.stappen_gemapt != null && <div className="mono" style={{ fontSize: 11, color: 'var(--ink3)', marginTop: 6 }}>{sum.stappen_gemapt} stappen · {sum.config} config · {sum.custom} maatwerk · {sum.live_modules} live · {sum.te_bouwen_modules} te bouwen</div>}

      <div style={SEC}>Maatwerk-backlog</div>
      {(plan.maatwerk || []).map((m, i) => (
        <div key={i} className="tm-modrow" style={{ cursor: 'default' }}>
          <span className="tm-modrow-ic" style={{ color: AC('purple'), background: ACsoft('purple') }} dangerouslySetInnerHTML={{ __html: ICONS('brush', { sw: 1.9 }) }} />
          <div className="tm-modrow-main"><div className="tm-modrow-name">{m.module_label}{m.agent_naam ? ' · ' + m.agent_naam : ''}</div><div className="tm-modrow-grp">{(m.bouwopdracht && m.bouwopdracht.title) || 'Maatwerk'}</div></div>
          <span className="kyb-badge" style={{ color: AC('gold'), background: ACsoft('gold') }}>nog te bouwen</span>
        </div>
      ))}
      {(!plan.maatwerk || plan.maatwerk.length === 0) && <div className="kyb-empty mono" style={{ padding: 12 }}>Geen maatwerk nodig — alles met bestaande modules.</div>}

      <div style={{ marginTop: 12 }}>
        <Btn kind="solid" accent="green" icon="check" full onClick={onZetKlaar}>Zet klant klaar</Btn>
      </div>
    </Panel>
  )
}

/* ---- provisioning-bevestiging: zet de aanbevolen modules/agents echt aan ---- */
function KbProvisionModal({ company, plan, onClose, onConfirm }) {
  const prov = (plan && plan.provisioning) || {}
  return (
    <Modal eyebrow="Zet klant klaar" title={company} accent="green" onClose={onClose}
      footer={<><button className="tm-mbtn ghost" onClick={onClose}>Annuleren</button>
        <button className="tm-mbtn solid" onClick={onConfirm}><span dangerouslySetInnerHTML={{ __html: ICONS('check', { sw: 2 }) }} />Modules aanzetten</button></>}>
      <div className="tm-rm">
        <p style={{ fontSize: 13.5, lineHeight: 1.5, color: 'var(--ink2)', margin: '0 0 6px' }}>Dit zet de aanbevolen modules en agents uit het bouwplan echt aan voor deze klant. Provisioning-status: <b>{prov.status || 'trial'}</b>.</p>
        <div style={SEC}>Modules aan</div>
        <div style={{ display: 'flex', flexWrap: 'wrap', gap: 6 }}>{(prov.custom_modules || []).map((k) => <span key={k} className="kyb-badge" style={{ color: AC('green'), background: ACsoft('green') }}>{MODULE_LABEL[k] || k}</span>)}</div>
        <div style={SEC}>Agents actief</div>
        <div style={{ display: 'flex', flexWrap: 'wrap', gap: 6 }}>{(prov.active_agents || []).map((k) => <span key={k} className="kyb-badge" style={{ color: AC('navy'), background: ACsoft('navy') }}>{KB_AGENTS[k]?.naam || k}</span>)}</div>
      </div>
    </Modal>
  )
}

/* ---- koppel-stap (mock): autoriseren → testen → klaar ---- */
function KbKoppelModal({ tool, onClose, onDone }) {
  const [step, setStep] = useState(0)
  const stappen = [
    { t: 'Autoriseren', s: 'Open ' + tool.naam + ' en geef Kyano toegang via de beveiligde koppel-link.' },
    { t: 'Verbinding testen', s: 'We halen een testbericht op om te bevestigen dat de koppeling werkt.' },
    { t: 'Klaar om te activeren', s: tool.naam + ' is geautoriseerd. Activeer de koppeling om gegevens te laten stromen.' },
  ]
  const cur = stappen[step]; const last = step === stappen.length - 1
  return (
    <Modal eyebrow={'Koppelen · ' + (KB_CAT[tool.cat] || tool.cat)} title={tool.naam + ' koppelen'} accent="green" onClose={onClose}
      footer={<>
        <button className="tm-mbtn ghost" onClick={onClose}>Annuleren</button>
        {!last
          ? <button className="tm-mbtn solid" onClick={() => setStep(step + 1)}><span dangerouslySetInnerHTML={{ __html: ICONS('arrow', { sw: 2 }) }} />Volgende stap</button>
          : <button className="tm-mbtn solid" onClick={onDone}><span dangerouslySetInnerHTML={{ __html: ICONS('check', { sw: 2 }) }} />Koppeling activeren</button>}
      </>}>
      <div style={{ display: 'flex', gap: 8, marginBottom: 16, flexWrap: 'wrap' }}>
        {stappen.map((s, i) => (
          <div key={i} className="mono" style={{ display: 'flex', alignItems: 'center', gap: 6, fontSize: 11, padding: '5px 10px', borderRadius: 99, color: i === step ? '#fff' : 'var(--ink2)', background: i === step ? 'var(--a-green)' : i < step ? 'var(--a-green-soft)' : 'var(--bg-deep)' }}>
            <b>{i < step ? '✓' : i + 1}</b>{s.t}
          </div>
        ))}
      </div>
      <div><div style={{ fontSize: 15, fontWeight: 700, color: 'var(--ink)' }}>{cur.t}</div><p style={{ marginTop: 6, fontSize: 13.5, lineHeight: 1.5, color: 'var(--ink2)' }}>{cur.s}</p></div>
    </Modal>
  )
}

/* ---- nieuwe klant → nieuwe tenant ---- */
function KbNewModal({ onClose, onCreate }) {
  const [company, setCompany] = useState('')
  const [contact, setContact] = useState('')
  const [pkg, setPkg] = useState('starter')
  const create = () => {
    if (!company.trim()) { toast('Vul de bedrijfsnaam in', { icon: 'info', kind: 'muted' }); return }
    const rnd = Math.random().toString(36).slice(2, 7)
    const slug = company.trim().toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)/g, '')
    const custom = pkg === 'enterprise' ? CUSTOM_MODS.map((m) => m.key) : pkg === 'business' ? ['sales', 'contracts'] : ['contracts']
    onCreate({
      id: 't_' + rnd, slug, display_name: company.trim(), package: pkg, status: 'trial',
      active_agents: ['iris', 'sam'], custom_modules: custom,
      primary_contact_email: '', primary_contact_name: contact.trim() || '—',
      horaizon_org_id: 'org_' + rnd, module_settings: {},
      metadata: { mrr: 0, discovery: 'proposed', color: ['teal', 'gold', 'mila', 'green', 'aqua'][Math.floor(Math.random() * 5)], tools: [...DEFAULT_TOOLS] },
    })
  }
  return (
    <Modal eyebrow="Nieuw klant-dashboard" title="Klant toevoegen" accent="navy" onClose={onClose}
      footer={<><button className="tm-mbtn ghost" onClick={onClose}>Annuleren</button>
        <button className="tm-mbtn solid" onClick={create}><span dangerouslySetInnerHTML={{ __html: ICONS('plus', { sw: 2 }) }} />Dashboard aanmaken</button></>}>
      <div className="tm-rm">
        <Field label="Bedrijfsnaam" value={company} onChange={setCompany} placeholder="Bijv. Sloepenspel Amsterdam" />
        <Field label="Contactpersoon" value={contact} onChange={setContact} placeholder="Voor- en achternaam" />
        <div style={SEC}>Pakket</div>
        <div className="tm-rolepick">
          {KB_PKG_ORDER.map((pk) => { const p = KB_PKG[pk]; const on = pkg === pk; return (
            <button key={pk} className={'tm-rolepick-b' + (on ? ' on' : '')} onClick={() => setPkg(pk)} style={on ? { borderColor: AC(p.accent), background: ACsoft(p.accent) } : null}>
              <span className="tm-rolepick-ic" style={{ color: AC(p.accent) }} dangerouslySetInnerHTML={{ __html: ICONS(p.icon, { sw: 1.9 }) }} />
              <span className="tm-rolepick-txt"><b>{p.label}</b><span>{p.sub}</span></span>
              {on && <span className="tm-rolepick-chk" style={{ color: AC(p.accent) }} dangerouslySetInnerHTML={{ __html: ICONS('check', { sw: 2.6 }) }} />}
            </button>
          ) })}
        </div>
        <div className="tm-core-note">
          <span dangerouslySetInnerHTML={{ __html: ICONS('info', { sw: 1.9 }) }} />
          Na aanmaken stel je modules, agents en koppelingen fijn af op de klantpagina.
        </div>
      </div>
    </Modal>
  )
}
