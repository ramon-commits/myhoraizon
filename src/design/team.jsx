/* ============================================================
   TEAM, rollen, rechten & gebruikersbeheer
   Twee niveaus: Kyano (superadmin, wij) + organisatie-rollen.
   Per teamlid: rol, rechtenniveau en per-module toegang.
   "Bekijk view" = kijk mee in de werkruimte van een teamlid.

   ESM-port van de blauwdruk (dashboard/team.jsx): window-globals ->
   imports/exports, body letterlijk. De cascade (currentRole/canAssignRole/
   setAssignPolicy) komt uit de bestaande assign.jsx; TEAM_ROLES wordt ook op
   window gezet zodat assign.jsx (asgRoleLabel) en de shell (view-as) het lezen.
   De dode __people_old-tak uit pages.jsx is niet overgenomen.
   ============================================================ */
import React from 'react'
import { ICONS } from './icons'
import { KYANO } from './data'
import { useStore, setState, toast, confirmAsk, Modal, Field } from './store.jsx'
import { AC, ACsoft, Avatar } from './components.jsx'
import { currentRole, canAssignRole, setAssignPolicy } from './assign.jsx'

const { useState } = React

// module-registry op id (zoals de shell/pages dat doen)
const MOD = {}
KYANO.modules.forEach((m) => (MOD[m.id] = m))

/* ---- Rollen-model ---- */
const TEAM_ROLES = {
  kyano:      { key: "kyano",      label: "Kyano Superadmin", short: "KYANO",   accent: "aqua",   icon: "shield", scope: "kyano", desc: "Volledige controle over álle klant-organisaties. Beheert modules, rechten en support.", caps: "Alles · alle organisaties" },
  eigenaar:   { key: "eigenaar",   label: "Eigenaar",         short: "EIGENAAR", accent: "navy",   icon: "crown",  scope: "org",  desc: "Volledige toegang binnen de eigen organisatie. Beheert team, rechten, facturatie en abonnement.", caps: "Alles binnen deze organisatie" },
  beheerder:  { key: "beheerder",  label: "Beheerder",        short: "BEHEER",   accent: "mila",   icon: "sliders",scope: "org",  desc: "Beheert modules en teamleden, maar niet de facturatie of het abonnement.", caps: "Beheer · geen facturatie" },
  manager:    { key: "manager",    label: "Manager",          short: "MANAGER",  accent: "teal",   icon: "users",  scope: "org",  desc: "Stuurt het dagelijks werk aan en ziet het teamoverzicht. Geen instellingen.", caps: "Operationeel · teamoverzicht" },
  medewerker: { key: "medewerker", label: "Medewerker",       short: "LID",      accent: "orange", icon: "people", scope: "org",  desc: "Werkt in de toegewezen modules en ziet vooral het eigen werk.", caps: "Toegewezen modules" },
  bekijker:   { key: "bekijker",   label: "Bekijker",         short: "READ",     accent: "green",  icon: "eye",    scope: "org",  desc: "Alleen-lezen toegang tot de toegewezen modules.", caps: "Alleen-lezen" },
}
const ORG_ROLE_ORDER = ["eigenaar", "beheerder", "manager", "medewerker", "bekijker"]

const CAPS = {
  view: { key: "view", label: "Bekijken", desc: "Alleen lezen", icon: "eye" },
  edit: { key: "edit", label: "Bewerken", desc: "Lezen + wijzigen", icon: "docpen" },
  full: { key: "full", label: "Volledig", desc: "Wijzigen + verwijderen", icon: "check" },
}

const STATUS = {
  active:   { key: "active",   label: "Actief",       color: "green",  dot: "var(--a-green)" },
  invited:  { key: "invited",  label: "Uitgenodigd",  color: "mila",   dot: "var(--a-mila)" },
  inactive: { key: "inactive", label: "Inactief",     color: "ink3",   dot: "var(--ink3)" },
}
function memStatus(mem) { return STATUS[mem.status] || STATUS.active }

/* Kern-modules: heeft iedereen, niet uit te zetten */
const CORE_MODS = ["vandaag", "postvak", "agenda"]
/* Niet als individueel recht (org-breed of integratie) */
const HIDE_FROM_RIGHTS = ["exact", "social", "mollie", "google", "people"]

function toggleableModules() {
  return KYANO.modules.filter((m) => !CORE_MODS.includes(m.id) && !HIDE_FROM_RIGHTS.includes(m.id))
}
function rightsGroups() {
  const groups = {}
  toggleableModules().forEach((m) => { (groups[m.group] = groups[m.group] || []).push(m) })
  return Object.keys(groups).map((g) => ({ group: g, items: groups[g] }))
}
function allToggleableIds() { return toggleableModules().map((m) => m.id) }

/* default-rechten per rol */
function defaultMods(role) {
  switch (role) {
    case "eigenaar": case "beheerder": case "kyano": return "all"
    case "manager":    return ["crm", "sales", "offertes", "finder", "agents", "analytics", "omzet", "club"]
    case "medewerker": return ["crm", "finder", "sales"]
    case "bekijker":   return ["analytics", "omzet", "website"]
    default: return []
  }
}
function defaultCap(role) {
  if (role === "bekijker") return "view"
  if (role === "eigenaar" || role === "beheerder" || role === "kyano") return "full"
  return "edit"
}

/* ---- Seed-team ---- */
const SEED_TEAM = [
  { id: "u_ramon", name: "Ramon van Dijk", email: "ramon@endlessminds.nl", phone: "+31 6 28 41 55 90", address: "Keizersgracht 124, 1015 CW Amsterdam", title: "Oprichter", role: "eigenaar", cap: "full", mods: "all", color: "navy", active: "nu", status: "active", me: true,
    log: [["Keurde 3 voorstellen goed", "vandaag · 09:12", "check", "teal"], ["Paste rechten van Tom aan", "gisteren · 16:40", "sliders", "navy"], ["Nodigde Lisa Vermeer uit", "3 dagen · 11:02", "send", "mila"]] },
  { id: "u_sanne", name: "Sanne Bakker",   email: "sanne@sloepenspel.nl",  phone: "+31 6 19 22 84 71", address: "Westerkade 9, 3016 CL Rotterdam", title: "Sales & accounts", role: "manager", cap: "edit", mods: ["crm", "sales", "offertes", "finder", "agents", "analytics", "omzet", "club"], color: "teal", active: "12 min", status: "active",
    log: [["Verstuurde offerte #2041 (€4.850)", "vandaag · 11:48", "send", "teal"], ["Voegde 4 leads toe in CRM", "vandaag · 10:15", "people", "orange"], ["Belde met Hotel Okura", "gisteren · 14:20", "phone", "navy"]] },
  { id: "u_tom",   name: "Tom de Wit",     email: "tom@sloepenspel.nl",    phone: "+31 6 41 07 36 12", address: "Havenstraat 22, 1271 AB Huizen", title: "Operatie & planning", role: "medewerker", cap: "edit", mods: ["crm", "finder", "sales"], color: "orange", active: "vandaag", status: "active",
    log: [["Plande 6 boekingen in", "vandaag · 08:30", "calendar", "teal"], ["Wijzigde klantgegevens", "gisteren · 17:05", "docpen", "navy"]] },
  { id: "u_eva",   name: "Eva Jansen",     email: "eva@sloepenspel.nl",    phone: "+31 6 53 88 90 04", address: "Stationsplein 5, 3818 LE Amersfoort", title: "Finance", role: "medewerker", cap: "edit", mods: ["facturen", "contracten", "omzet", "offertes"], color: "mila", active: "gisteren", status: "active",
    log: [["Verstuurde 12 facturen", "gisteren · 15:30", "send", "teal"], ["Markeerde 3 betalingen ontvangen", "gisteren · 11:10", "check", "green"]] },
  { id: "u_lisa",  name: "Lisa Vermeer",   email: "lisa@sloepenspel.nl",   phone: "+31 6 24 65 11 38", address: "Prinsengracht 301, 1016 GZ Amsterdam", title: "Marketing (extern)", role: "bekijker", cap: "view", mods: ["analytics", "omzet", "website", "seo"], color: "green", active: "3 dagen", status: "inactive",
    log: [["Bekeek het analytics-rapport", "3 dagen · 09:40", "eye", "green"], ["Exporteerde SEO-overzicht", "1 week · 13:22", "doc", "mila"]] },
]

function memberMods(member) {
  return member.mods === "all" ? allToggleableIds() : (member.mods || [])
}
function memberModCount(member) {
  return CORE_MODS.length + memberMods(member).length
}
function initials(name) {
  const p = (name || "").trim().split(/\s+/)
  return ((p[0]?.[0] || "") + (p[1]?.[0] || "")).toUpperCase()
}

/* ============================================================ */
function TeamModule({ onOpen }) {
  const store = useStore()
  const members = store.get("team.members", SEED_TEAM)
  const acting = store.get("team.acting", "eigenaar")      // eigenaar | kyano
  const isKyano = acting === "kyano"
  /* Meekijken in het dashboard van een teamlid mag alleen de Eigenaar, Beheerder of Kyano
     superadmin — net zoals het toewijs-recht conditioneel verschijnt via currentRole(). */
  const actorRole = currentRole() || "eigenaar"
  const canViewAs = isKyano || actorRole === "eigenaar" || actorRole === "beheerder"
  const [manageFor, setManageFor] = useState(null)
  const [manageTab, setManageTab] = useState("profiel")
  const [inviteOpen, setInviteOpen] = useState(false)
  const [selMode, setSelMode] = useState(false)
  const [sel, setSel] = useState([])
  const [bulkRole, setBulkRole] = useState(false)

  const setMembers = (next) => setState("team.members", next)
  const updateMember = (id, patch) => setMembers(members.map((x) => x.id === id ? { ...x, ...patch } : x))
  const removeMember = async (mem) => {
    const ok = await confirmAsk({ title: "Teamlid verwijderen?", sub: mem.name + " verliest direct alle toegang tot deze werkruimte.", confirmLabel: "Verwijderen" })
    if (!ok) return
    setMembers(members.filter((x) => x.id !== mem.id))
    toast(mem.name + " verwijderd uit het team", { icon: "trash", kind: "muted" })
  }
  const openManage = (mem, tab) => { setManageTab(tab || "profiel"); setManageFor(mem) }

  const orgCounts = {}
  ORG_ROLE_ORDER.forEach((r) => { orgCounts[r] = members.filter((x) => x.role === r).length })

  const [filterRole, setFilterRole] = useState(null)
  const shownMembers = filterRole ? members.filter((x) => x.role === filterRole) : members

  const toggleSel = (id) => setSel((s) => s.includes(id) ? s.filter((x) => x !== id) : [...s, id])
  const exitSelect = () => { setSelMode(false); setSel([]); setBulkRole(false) }
  const bulkSetRole = (rk) => {
    setMembers(members.map((x) => sel.includes(x.id) ? { ...x, role: rk, cap: defaultCap(rk), mods: defaultMods(rk) } : x))
    toast(sel.length + " leden ingesteld als " + TEAM_ROLES[rk].label, { icon: "check" })
    exitSelect()
  }
  const bulkRemove = async () => {
    const ok = await confirmAsk({ title: sel.length + " teamleden verwijderen?", sub: "Zij verliezen direct alle toegang tot deze werkruimte.", confirmLabel: "Verwijderen" })
    if (!ok) return
    setMembers(members.filter((x) => !sel.includes(x.id)))
    toast(sel.length + " teamleden verwijderd", { icon: "trash", kind: "muted" })
    exitSelect()
  }

  return (
    <div className="tm">
      {/* Eigen, schone paginakop */}
      <header className="tm-head">
        <div className="tm-head-id">
          <span className="tm-head-ic" dangerouslySetInnerHTML={{ __html: ICONS("network", { sw: 1.7 }) }} />
          <div>
            <h1 className="tm-head-t">Team</h1>
            <p className="tm-head-s">{members.length} leden · rollen &amp; toegang</p>
          </div>
        </div>
        <div className="tm-head-acts">
          <div className="tm-seg" title="Beheerniveau">
            <button className={"tm-seg-b" + (!isKyano ? " on" : "")} onClick={() => setState("team.acting", "eigenaar")}>Eigenaar</button>
            <button className={"tm-seg-b kyano" + (isKyano ? " on" : "")} onClick={() => setState("team.acting", "kyano")}>
              <span dangerouslySetInnerHTML={{ __html: ICONS("shield", { sw: 1.9 }) }} />Kyano
            </button>
          </div>
          <button className={"tm-selbtn" + (selMode ? " on" : "")} onClick={() => selMode ? exitSelect() : setSelMode(true)}>
            <span dangerouslySetInnerHTML={{ __html: ICONS(selMode ? "close" : "check", { sw: 2 }) }} />{selMode ? "Klaar" : "Selecteren"}
          </button>
          <button className="tm-invite" onClick={() => setInviteOpen(true)}>
            <span dangerouslySetInnerHTML={{ __html: ICONS("plus", { sw: 2.2 }) }} />Uitnodigen
          </button>
        </div>
      </header>

      {/* Kyano-modus: subtiele context-balk, alleen wanneer actief */}
      {isKyano && (
        <div className="tm-kyano on">
          <span className="tm-kyano-ic" dangerouslySetInnerHTML={{ __html: ICONS("shield", { sw: 1.7 }) }} />
          <div className="tm-kyano-txt">
            <div className="tm-kyano-t">Je beheert deze werkruimte als Kyano</div>
            <div className="tm-kyano-s">Je kunt elke rol toewijzen en modules organisatie-breed regelen.</div>
          </div>
          <button className="tm-kyano-exit" onClick={() => setState("team.acting", "eigenaar")}>Verlaat</button>
        </div>
      )}

      {/* Rollen-filterbalk: klik om te filteren */}
      {!selMode && (
        <div className="tm-roles">
          <button className={"tm-role" + (!filterRole ? " on" : "")} onClick={() => setFilterRole(null)}>
            <span className="tm-role-n">{members.length}</span>Iedereen
          </button>
          {ORG_ROLE_ORDER.filter((rk) => orgCounts[rk] > 0).map((rk) => {
            const r = TEAM_ROLES[rk]; const on = filterRole === rk
            return (
              <button key={rk} className={"tm-role" + (on ? " on" : "")} title={r.desc}
                onClick={() => setFilterRole(on ? null : rk)}
                style={on ? { borderColor: AC(r.accent), color: AC(r.accent) } : null}>
                <span className="tm-role-dot" style={{ background: AC(r.accent) }} />{r.label}
                <span className="tm-role-n">{orgCounts[rk]}</span>
              </button>
            )
          })}
        </div>
      )}

      {/* Bulk-actiebalk */}
      {selMode && (
        <div className="tm-bulk">
          <span className="tm-bulk-n">{sel.length} geselecteerd</span>
          <button className="tm-bulk-all" onClick={() => setSel(members.filter((x) => !x.me).map((x) => x.id))}>Alles</button>
          <button className="tm-bulk-all" onClick={() => setSel([])}>Wis</button>
          <span className="tm-bulk-sep" />
          <div className="tm-bulk-rolewrap">
            <button className="tm-bulk-btn" disabled={!sel.length} onClick={() => setBulkRole((v) => !v)}>
              <span dangerouslySetInnerHTML={{ __html: ICONS("sliders", { sw: 2 }) }} />Rol toewijzen
              <span className="tm-bulk-chev" dangerouslySetInnerHTML={{ __html: ICONS("chevron", { sw: 2.2 }) }} />
            </button>
            {bulkRole && (
              <div className="tm-bulk-menu">
                {(isKyano ? [...ORG_ROLE_ORDER, "kyano"] : ORG_ROLE_ORDER).map((rk) => { const r = TEAM_ROLES[rk]; return (
                  <button key={rk} className="tm-bulk-menu-i" onClick={() => bulkSetRole(rk)}>
                    <span style={{ color: AC(r.accent) }} dangerouslySetInnerHTML={{ __html: ICONS(r.icon === "crown" ? "star" : r.icon, { sw: 1.9 }) }} />{r.label}
                  </button>
                ) })}
              </div>
            )}
          </div>
          <button className="tm-bulk-btn danger" disabled={!sel.length} onClick={bulkRemove}>
            <span dangerouslySetInnerHTML={{ __html: ICONS("trash", { sw: 2 }) }} />Verwijderen
          </button>
        </div>
      )}

      <div className="tm-grid">
        {shownMembers.map((mem) => (
          <MemberCard key={mem.id} mem={mem} isKyano={isKyano} canViewAs={canViewAs}
            selectMode={selMode} selected={sel.includes(mem.id)} onSelect={() => !mem.me && toggleSel(mem.id)}
            onView={() => window.startViewAs && window.startViewAs(mem, mem.mods === "all" ? null : memberMods(mem))}
            onRights={() => openManage(mem, "profiel")} onRemove={() => removeMember(mem)} />
        ))}
        {!filterRole && !selMode && <AiCard onOpen={onOpen} />}
        {!filterRole && !selMode && (
          <button className="tm-ghost" onClick={() => setInviteOpen(true)}>
            <span className="tm-ghost-ic" dangerouslySetInnerHTML={{ __html: ICONS("plus", { sw: 2 }) }} />
            <span className="tm-ghost-t">Teamlid uitnodigen</span>
            <span className="tm-ghost-s">Voeg een collega toe</span>
          </button>
        )}
      </div>

      {manageFor && <ManageModal mem={manageFor} isKyano={isKyano} tab={manageTab} setTab={setManageTab}
        onClose={() => setManageFor(null)}
        onSave={(patch) => { updateMember(manageFor.id, patch); setManageFor(null); toast(manageFor.name.split(" ")[0] + " bijgewerkt", { icon: "check" }) }} />}
      {inviteOpen && <InviteModal isKyano={isKyano} onClose={() => setInviteOpen(false)}
        onInvite={(mem) => { setMembers([...members, mem]); setInviteOpen(false); toast(mem.name + " uitgenodigd als " + TEAM_ROLES[mem.role].label, { icon: "send" }) }} />}
    </div>
  )
}

/* ---- Teamlid-kaart, clean ---- */
function MemberCard({ mem, isKyano, canViewAs, onView, onRights, onRemove, selectMode, selected, onSelect }) {
  const r = TEAM_ROLES[mem.role] || TEAM_ROLES.medewerker
  const cap = CAPS[mem.cap] || CAPS.edit
  const st = memStatus(mem)
  const mods = memberMods(mem)
  const allAccess = mem.mods === "all"
  const dots = allAccess ? [] : mods.slice(0, 5)

  return (
    <div className={"tm-card" + (mem.me ? " me" : "") + (selectMode ? " selectable" : "") + (selected ? " sel" : "")}
      onClick={selectMode && !mem.me ? onSelect : undefined}>
      {selectMode && (
        <span className={"tm-check" + (selected ? " on" : "") + (mem.me ? " dis" : "")}>
          {selected && <span dangerouslySetInnerHTML={{ __html: ICONS("check", { sw: 3 }) }} />}
        </span>
      )}
      <div className="tm-card-top">
        <span className="tm-av" style={{ background: AC(mem.color || r.accent) }} data-status={mem.status || "active"}>
          {initials(mem.name)}
          <span className="tm-av-dot" style={{ background: st.dot }} title={st.label} />
        </span>
        <div className="tm-card-id">
          <div className="tm-card-name">{mem.name}{mem.me && <span className="tm-you">jij</span>}</div>
          <div className="tm-card-mail">{mem.title}</div>
        </div>
        <span className="tm-rolebadge" style={{ color: AC(r.accent), background: ACsoft(r.accent) }}>
          <span dangerouslySetInnerHTML={{ __html: ICONS(r.icon === "crown" ? "star" : r.icon, { sw: 2 }) }} />{r.label}
        </span>
      </div>

      <div className="tm-line">
        <span className="tm-line-cap"><span dangerouslySetInnerHTML={{ __html: ICONS(cap.icon, { sw: 2 }) }} />{cap.label}</span>
        {canAssignRole(mem.role) && (
          <span className="tm-assign-chip" title="Mag taken toewijzen"><span dangerouslySetInnerHTML={{ __html: ICONS("users", { sw: 2 }) }} />toewijzen</span>
        )}
        <span className="tm-line-sep" />
        <span className="tm-line-mods">
          {allAccess
            ? <><span className="tm-line-all" dangerouslySetInnerHTML={{ __html: ICONS("check", { sw: 2.6 }) }} />Alle modules</>
            : <>
                <span className="tm-dots">{dots.map((id) => { const md = MOD[id]; return md ? <span key={id} className="tm-dot" style={{ background: AC(md.accent) }} title={md.name} /> : null })}</span>
                {memberModCount(mem)} modules
              </>}
        </span>
        <span className="tm-line-active" style={mem.status === "invited" ? { color: "var(--a-mila)" } : null}>
          {mem.status === "invited" ? "Uitgenodigd" : st.label === "Inactief" ? "Inactief · " + mem.active : mem.active}
        </span>
      </div>

      <div className="tm-card-acts">
        {canViewAs && (
          <button className="tm-btn ghost" onClick={onView}>
            <span dangerouslySetInnerHTML={{ __html: ICONS("eye", { sw: 1.9 }) }} />Bekijk
          </button>
        )}
        <button className="tm-btn" onClick={onRights} disabled={mem.me && !isKyano}>
          <span dangerouslySetInnerHTML={{ __html: ICONS("sliders", { sw: 1.9 }) }} />Beheer
        </button>
        {!mem.me && (
          <button className="tm-btn-x" title={"Verwijder " + mem.name} onClick={onRemove}>
            <span dangerouslySetInnerHTML={{ __html: ICONS("trash", { sw: 1.9 }) }} />
          </button>
        )}
      </div>
    </div>
  )
}

/* ---- Iris always-on kaart, clean ---- */
function AiCard({ onOpen }) {
  return (
    <div className="tm-card ai">
      <div className="tm-card-top">
        <span className="tm-av-iris"><Avatar agent="iris" size={44} /></span>
        <div className="tm-card-id">
          <div className="tm-card-name">Iris<span className="tm-ai-pill">AI</span></div>
          <div className="tm-card-mail">Je digitale teamlid</div>
        </div>
        <span className="tm-online"><span className="tm-online-dot" />Online</span>
      </div>
      <div className="tm-line">
        <span className="tm-line-cap" style={{ color: "var(--a-mila)" }}><span dangerouslySetInnerHTML={{ __html: ICONS("spark", { sw: 2.2 }) }} />Stuurt je agents</span>
        <span className="tm-line-sep" />
        <span className="tm-line-mods">Alle modules</span>
        <span className="tm-line-active">8 taken klaar</span>
      </div>
      <div className="tm-card-acts">
        <button className="tm-btn ghost" style={{ flex: 1 }} onClick={() => onOpen("iris")}>
          <span dangerouslySetInnerHTML={{ __html: ICONS("spark", { sw: 1.9 }) }} />Open Iris
        </button>
      </div>
    </div>
  )
}

/* ---- Beheer-modal: Profiel · Rechten · Activiteit ---- */
function ManageModal({ mem, isKyano, tab, setTab, onClose, onSave }) {
  // Profiel
  const [name, setName] = useState(mem.name || "")
  const [email, setEmail] = useState(mem.email || "")
  const [phone, setPhone] = useState(mem.phone || "")
  const [title, setTitle] = useState(mem.title || "")
  const [address, setAddress] = useState(mem.address || "")
  // Rechten
  const [role, setRole] = useState(mem.role)
  const [cap, setCap] = useState(mem.cap || defaultCap(mem.role))
  const [mods, setMods] = useState(() => mem.mods === "all" ? allToggleableIds() : [...(mem.mods || [])])
  const [allOn, setAllOn] = useState(mem.mods === "all")

  const roleKeys = isKyano ? [...ORG_ROLE_ORDER, "kyano"] : ORG_ROLE_ORDER
  const groups = rightsGroups()
  const r = TEAM_ROLES[mem.role] || TEAM_ROLES.medewerker

  const applyRole = (rk) => {
    setRole(rk)
    const dm = defaultMods(rk)
    if (dm === "all") { setAllOn(true); setMods(allToggleableIds()) }
    else { setAllOn(false); setMods(dm) }
    setCap(defaultCap(rk))
  }
  const toggleMod = (id) => { setAllOn(false); setMods((cur) => cur.includes(id) ? cur.filter((x) => x !== id) : [...cur, id]) }
  const setEverything = (on) => { setAllOn(on); setMods(on ? allToggleableIds() : []) }

  const save = () => {
    if (!name.trim() || !email.trim()) { setTab("profiel"); toast("Vul naam en e-mail in", { icon: "info", kind: "muted" }); return }
    const isAll = allOn || mods.length === allToggleableIds().length
    onSave({ name: name.trim(), email: email.trim().toLowerCase(), phone: phone.trim(), title: title.trim(), address: address.trim(),
      role, cap, mods: isAll ? "all" : mods })
  }

  const TABS = [["profiel", "Profiel", "people"], ["rechten", "Rechten", "sliders"], ["activiteit", "Activiteit", "clock"]]

  return (
    <Modal eyebrow={"Teamlid · " + r.label} title={mem.name} accent="navy" onClose={onClose}
      footer={tab === "activiteit"
        ? <button className="tm-mbtn solid" onClick={onClose}>Sluiten</button>
        : <><button className="tm-mbtn ghost" onClick={onClose}>Annuleren</button>
            <button className="tm-mbtn solid" onClick={save}>Opslaan</button></>}>
      <div className="tm-tabs">
        {TABS.map(([k, lbl, ic]) => (
          <button key={k} className={"tm-tab" + (tab === k ? " on" : "")} onClick={() => setTab(k)}>
            <span dangerouslySetInnerHTML={{ __html: ICONS(ic, { sw: 2 }) }} />{lbl}
          </button>
        ))}
      </div>

      <div className="tm-rm">
        {tab === "profiel" && (
          <>
            <div className="tm-prof-head">
              <span className="tm-prof-av" style={{ background: AC(mem.color || r.accent) }}>{initials(name || mem.name)}</span>
              <div className="tm-prof-meta">
                <div className="tm-prof-name">{name || "–"}</div>
                <div className="tm-prof-sub">{title || r.label} · <span style={{ color: memStatus(mem).dot }}>{memStatus(mem).label}</span></div>
              </div>
            </div>
            <div className="tm-fgrid">
              <Field label="Volledige naam" value={name} onChange={setName} placeholder="Voor- en achternaam" />
              <Field label="Functie" value={title} onChange={setTitle} placeholder="Bijv. Sales" />
              <Field label="E-mailadres" value={email} onChange={setEmail} placeholder="naam@bedrijf.nl" type="email" />
              <Field label="Telefoon" value={phone} onChange={setPhone} placeholder="+31 6 …" />
            </div>
            <Field label="Adres" value={address} onChange={setAddress} placeholder="Straat, postcode, plaats" />
          </>
        )}

        {tab === "rechten" && (
          <>
            <div className="tm-rm-sec mono">Rol</div>
            <div className="tm-rolepick">
              {roleKeys.map((rk) => { const rr = TEAM_ROLES[rk]; const on = role === rk; return (
                <button key={rk} className={"tm-rolepick-b" + (on ? " on" : "")} onClick={() => applyRole(rk)}
                  style={on ? { borderColor: AC(rr.accent), background: ACsoft(rr.accent) } : null}>
                  <span className="tm-rolepick-ic" style={{ color: AC(rr.accent) }} dangerouslySetInnerHTML={{ __html: ICONS(rr.icon === "crown" ? "star" : rr.icon, { sw: 1.9 }) }} />
                  <span className="tm-rolepick-txt"><b>{rr.label}</b><span>{rr.desc}</span></span>
                  {on && <span className="tm-rolepick-chk" style={{ color: AC(rr.accent) }} dangerouslySetInnerHTML={{ __html: ICONS("check", { sw: 2.6 }) }} />}
                </button>
              ) })}
            </div>

            <div className="tm-rm-sec mono">Rechtenniveau in toegestane modules</div>
            <div className="tm-capseg">
              {Object.values(CAPS).map((c) => (
                <button key={c.key} className={"tm-capseg-b" + (cap === c.key ? " on" : "")} onClick={() => setCap(c.key)}>
                  <span dangerouslySetInnerHTML={{ __html: ICONS(c.icon, { sw: 2 }) }} />
                  <b>{c.label}</b><span>{c.desc}</span>
                </button>
              ))}
            </div>

            <div className="tm-rm-sec mono">Acties</div>
            <div className="tm-modrow assignright on">
              <span className="tm-modrow-ic" style={{ color: AC("navy"), background: ACsoft("navy") }} dangerouslySetInnerHTML={{ __html: ICONS("users", { sw: 1.9 }) }} />
              <div className="tm-modrow-main">
                <div className="tm-modrow-name">Mag taken toewijzen</div>
                <div className="tm-modrow-grp">{role === "eigenaar" ? "Eigenaar mag altijd toewijzen" : "Cascade-recht, geldt voor alle " + TEAM_ROLES[role].label + "s"}</div>
              </div>
              <button className={"tm-toggle" + (canAssignRole(role) ? " on" : "")}
                disabled={role === "eigenaar"}
                onClick={(e) => { e.stopPropagation(); if (role === "eigenaar") return; setAssignPolicy(role, !canAssignRole(role)) }}>
                <span className="tm-toggle-knob" />
              </button>
            </div>

            <div className="tm-rm-sec mono">
              Module-toegang
              <button className="tm-allbtn" onClick={() => setEverything(!(allOn || mods.length === allToggleableIds().length))}>
                {allOn || mods.length === allToggleableIds().length ? "Alles uitzetten" : "Alles aanzetten"}
              </button>
            </div>
            <div className="tm-core-note">
              <span dangerouslySetInnerHTML={{ __html: ICONS("lock", { sw: 1.9 }) }} />
              Vandaag, Inbox en Agenda zijn kern-modules, die heeft iedereen altijd.
            </div>
            {groups.map((g) => (
              <div className="tm-modgroup" key={g.group}>
                <div className="tm-modgroup-h mono">{g.group}</div>
                {g.items.map((md) => { const on = allOn || mods.includes(md.id); return (
                  <div className={"tm-modrow" + (on ? " on" : "")} key={md.id} onClick={() => toggleMod(md.id)}>
                    <span className="tm-modrow-ic" style={{ color: AC(md.accent), background: ACsoft(md.accent) }} dangerouslySetInnerHTML={{ __html: ICONS(md.icon, { sw: 1.9 }) }} />
                    <div className="tm-modrow-main"><div className="tm-modrow-name">{md.name}</div><div className="tm-modrow-grp">{md.sub || md.group}</div></div>
                    <button className={"tm-toggle" + (on ? " on" : "")} onClick={(e) => { e.stopPropagation(); toggleMod(md.id) }}><span className="tm-toggle-knob" /></button>
                  </div>
                ) })}
              </div>
            ))}
          </>
        )}

        {tab === "activiteit" && (
          <div className="tm-acts">
            <div className="tm-acts-head">
              <span className="tm-acts-h-t">Recente activiteit</span>
              <span className="tm-acts-h-s">Laatst actief · {mem.active}</span>
            </div>
            <div className="tm-timeline">
              {(mem.log || []).length === 0 && <div className="tm-acts-empty">Nog geen activiteit vastgelegd.</div>}
              {(mem.log || []).map(([txt, when, ic, ac], i) => (
                <div className="tm-tl-row" key={i}>
                  <span className="tm-tl-ic" style={{ color: AC(ac || "navy"), background: ACsoft(ac || "navy") }} dangerouslySetInnerHTML={{ __html: ICONS(ic || "clock", { sw: 1.9 }) }} />
                  <div className="tm-tl-main">
                    <div className="tm-tl-txt">{txt}</div>
                    <div className="tm-tl-when">{when}</div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>
    </Modal>
  )
}

/* ---- Teamlid uitnodigen ---- */
function InviteModal({ isKyano, onClose, onInvite }) {
  const [name, setName] = useState("")
  const [email, setEmail] = useState("")
  const [title, setTitle] = useState("")
  const [role, setRole] = useState("medewerker")
  const roleKeys = isKyano ? [...ORG_ROLE_ORDER, "kyano"] : ORG_ROLE_ORDER
  const COLORS = ["teal", "orange", "mila", "green", "red", "aqua"]

  const invite = () => {
    if (!name.trim() || !email.trim()) { toast("Vul naam en e-mail in", { icon: "info", kind: "muted" }); return }
    onInvite({
      id: "u_" + Math.random().toString(36).slice(2, 7),
      name: name.trim(), email: email.trim().toLowerCase(), title: title.trim() || TEAM_ROLES[role].label,
      role, cap: defaultCap(role), mods: defaultMods(role),
      color: COLORS[Math.floor(Math.random() * COLORS.length)], active: "nog niet ingelogd", status: "invited",
      log: [],
    })
  }

  return (
    <Modal eyebrow="Nieuw teamlid" title="Teamlid uitnodigen" accent="navy" onClose={onClose}
      footer={<>
        <button className="tm-mbtn ghost" onClick={onClose}>Annuleren</button>
        <button className="tm-mbtn solid" onClick={invite}><span dangerouslySetInnerHTML={{ __html: ICONS("send", { sw: 2 }) }} />Uitnodiging sturen</button>
      </>}>
      <div className="tm-rm">
        <Field label="Volledige naam" value={name} onChange={setName} placeholder="Bijv. Noor de Lange" />
        <Field label="E-mailadres" value={email} onChange={setEmail} placeholder="naam@bedrijf.nl" type="email" />
        <Field label="Functie (optioneel)" value={title} onChange={setTitle} placeholder="Bijv. Sales" />
        <div className="tm-rm-sec mono">Rol bij uitnodigen</div>
        <div className="tm-rolepick">
          {roleKeys.map((rk) => { const r = TEAM_ROLES[rk]; const on = role === rk; return (
            <button key={rk} className={"tm-rolepick-b" + (on ? " on" : "")} onClick={() => setRole(rk)}
              style={on ? { borderColor: AC(r.accent), background: ACsoft(r.accent) } : null}>
              <span className="tm-rolepick-ic" style={{ color: AC(r.accent) }} dangerouslySetInnerHTML={{ __html: ICONS(r.icon === "crown" ? "star" : r.icon, { sw: 1.9 }) }} />
              <span className="tm-rolepick-txt"><b>{r.label}</b><span>{r.desc}</span></span>
              {on && <span className="tm-rolepick-chk" style={{ color: AC(r.accent) }} dangerouslySetInnerHTML={{ __html: ICONS("check", { sw: 2.6 }) }} />}
            </button>
          ) })}
        </div>
        <div className="tm-core-note">
          <span dangerouslySetInnerHTML={{ __html: ICONS("info", { sw: 1.9 }) }} />
          Je kunt de exacte module-toegang na uitnodigen fijn afstellen via Rechten.
        </div>
      </div>
    </Modal>
  )
}

/* TEAM_ROLES ook op window: assign.jsx (asgRoleLabel) en de shell-view-as
   (vaRole) lezen window.TEAM_ROLES — zo blijft de cascade heel zonder die te
   herschrijven. */
if (typeof window !== "undefined") window.TEAM_ROLES = TEAM_ROLES

export { TeamModule, TEAM_ROLES, memberMods }
