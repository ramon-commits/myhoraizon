/* ============================================================
   CRM-pagina (uit de Claude Design-blauwdruk, salescrm.jsx · CrmModule2):
   CRM-tegelbord (bewerkbaar) + instelbare kolommen/filters/sorteer +
   de KvK-nieuwe-klant-flow (NewClientFlow). Eén klantkaart per relatie —
   elke rij opent de gedeelde klantkaart (openKlantCard -> crm.full ->
   ClientFullHost). Velden/filters/eigen-velden via crmfields.jsx.
   Adaptaties t.o.v. de bron: window-globals -> imports; ClientCard ->
   de gedeelde openKlantCard; het bord/edit/widget-markt loopt via de
   AppShell-Outlet-context (zoals /sales en /pipeline), niet via lokale
   shell-state. kvkSearch/matchExisting zijn demo-equivalenten (de
   blauwdruk-bron zat niet in de opgehaalde MCP-bestanden). Demo-data
   uit customers.js/sales.jsx.
   ============================================================ */
import React from 'react'
import { ICONS } from './icons'
import { useStore, setState, toast, Modal, Field } from './store.jsx'
import { AC, ACsoft, Btn, Panel } from './components.jsx'
import { allCustomers } from './customers.js'
import { openKlantCard } from './objectactions.jsx'
import { TileGrid } from './tiles.jsx'
import {
  STATUS_META, custAttention, custIdleMonths, riskValue, eur, addCustLog,
  custKvk, custAddress, custLegal, addCustContact,
} from './sales.jsx'
import { allFields, fldGet, applyFilters, ColumnsBtn, FilterBtn, FilterChips } from './crmfields.jsx'

const { useState, useMemo, useEffect } = React

/* ---------- KvK-demo: Kai "doorzoekt het Handelsregister" ----------
   Demo-equivalent: levert dezelfde vorm die NewClientFlow verwacht. Een paar
   vaste Amsterdamse bedrijven (waarvan Hotel Okura al in het CRM staat, zodat de
   "Al in CRM"-koppelflow zichtbaar is) + altijd het getypte bedrijf zelf. */
const KVK_DEMO = [
  { company_name: "Hotel Okura Amsterdam", kvk: "33129611", address: "Ferdinand Bolstraat 333, Amsterdam", legal_form: "B.V.", city: "Amsterdam", sector: "Hospitality" },
  { company_name: "Restaurant De Kas", kvk: "34216475", address: "Kamerlingh Onneslaan 3, Amsterdam", legal_form: "B.V.", city: "Amsterdam", sector: "Horeca" },
  { company_name: "Hotel Arena", kvk: "33287654", address: "'s-Gravesandestraat 55, Amsterdam", legal_form: "B.V.", city: "Amsterdam", sector: "Hospitality" },
  { company_name: "Brouwerij 't IJ", kvk: "34141980", address: "Funenkade 7, Amsterdam", legal_form: "B.V.", city: "Amsterdam", sector: "Horeca" },
  { company_name: "Lloyd Hotel", kvk: "34192847", address: "Oostelijke Handelskade 34, Amsterdam", legal_form: "B.V.", city: "Amsterdam", sector: "Hospitality" },
]
function kvkSearch(q) {
  const t = q.trim().toLowerCase()
  const hits = KVK_DEMO.filter((r) => r.company_name.toLowerCase().includes(t))
  if (hits.length) return hits
  let h = 0; for (const ch of t) h = (h * 31 + ch.charCodeAt(0)) >>> 0
  return [{ company_name: q.trim(), kvk: String(30000000 + (h % 9000000)), address: "Amsterdam", legal_form: "B.V.", city: "Amsterdam", sector: "Onbekend" }]
}
function matchExisting(store, r) {
  const t = r.company_name.toLowerCase()
  return allCustomers(store).find((c) => {
    const n = c.name.toLowerCase()
    return n === t || n.includes(t) || t.includes(n)
  }) || null
}

/* ---------- Nieuwe klant: KvK-koppeling + aan bestaand bedrijf koppelen ---------- */
function NewClientFlow({ store, onClose, onOpenCust }) {
  const [step, setStep] = useState("search")
  const [q, setQ] = useState("")
  const [searching, setSearching] = useState(false)
  const [results, setResults] = useState(null)
  const [linkTo, setLinkTo] = useState(null)
  const [form, setForm] = useState({ company_name: "", kvk: "", address: "", legal_form: "B.V.", city: "Amsterdam", sector: "Hospitality", status: "prospect", contact_name: "", contact_role: "", contact_email: "", contact_phone: "" })

  const search = () => {
    if (!q.trim()) { toast("Vul een bedrijfsnaam in", { icon: "close", kind: "muted" }); return }
    setSearching(true); setResults(null)
    setTimeout(() => { setResults(kvkSearch(q)); setSearching(false) }, 720)
  }
  const pick = (r) => {
    const ex = matchExisting(store, r)
    if (ex) { setLinkTo(ex); setForm((f) => ({ ...f, company_name: ex.name, kvk: custKvk(ex), address: custAddress(ex), legal_form: custLegal(ex), city: ex.city, sector: ex.sector, status: ex.status })); setStep("details"); return }
    setForm((f) => ({ ...f, company_name: r.company_name, kvk: r.kvk, address: r.address, legal_form: r.legal_form, city: r.city, sector: r.sector !== "Onbekend" ? r.sector : f.sector }))
    setLinkTo(null); setStep("details")
  }
  const save = () => {
    if (!form.company_name.trim()) { toast("Vul een bedrijfsnaam in", { icon: "close", kind: "muted" }); return }
    if (linkTo) {
      if (form.contact_name.trim()) addCustContact(store, linkTo.id, { name: form.contact_name, role: form.contact_role || "Contactpersoon", email: form.contact_email, phone: form.contact_phone })
      toast(form.contact_name ? (form.contact_name + " gekoppeld aan " + linkTo.name) : (linkTo.name + " geopend"), { icon: "link" })
      onClose(); onOpenCust(linkTo.id); return
    }
    const cust = {
      id: "nc" + Date.now().toString(36), name: form.company_name, contact: form.contact_name || form.company_name, city: form.city,
      x: 44 + Math.random() * 8, y: 38 + Math.random() * 8, sector: form.sector, status: form.status,
      monthly: 0, since: form.status === "active" ? 2026 : null, idle: 0, employees: "–",
      email: form.contact_email, phone: form.contact_phone || "–", kvk: form.kvk, legalForm: form.legal_form, address: form.address,
      contacts: form.contact_name ? [{ name: form.contact_name, role: form.contact_role || "Hoofdcontact", email: form.contact_email, phone: form.contact_phone, primary: true }] : [],
      iris: "Nieuw aangemaakt in het CRM via KvK-koppeling. Voeg een eerste actie toe om de relatie te starten.", deals: 0,
    }
    setState("sales.customers", [cust, ...store.get("sales.customers", [])])
    toast(form.company_name + " toegevoegd aan het CRM", { icon: "check" })
    onClose(); onOpenCust(cust.id)
  }

  return (
    <Modal title="Nieuwe klant" eyebrow={step === "search" ? "CRM · Bedrijf opzoeken via KvK" : (linkTo ? "CRM · Koppelen aan bestaand bedrijf" : "CRM · Bedrijfsgegevens")} accent="red" onClose={onClose}
      footer={step === "search"
        ? <><Btn kind="ghost" onClick={() => { setLinkTo(null); setStep("details") }}>Handmatig invoeren</Btn><Btn kind="solid" accent="red" icon="search" onClick={search}>{searching ? "Zoeken…" : "Zoek in KvK"}</Btn></>
        : <><Btn kind="ghost" onClick={() => setStep("search")}>Terug</Btn><Btn kind="solid" accent="red" icon={linkTo ? "link" : "check"} onClick={save}>{linkTo ? (form.contact_name ? "Koppel contactpersoon" : "Open klant") : "Klant opslaan"}</Btn></>}>
      {step === "search" ? (
        <div className="ncf-search">
          <div className="ncf-kvk-row">
            <input className="field-in" autoFocus value={q} onChange={(e) => setQ(e.target.value)} placeholder="Bedrijfsnaam, bv. Hotel Arena of De Kas" onKeyDown={(e) => { if (e.key === "Enter") search() }} />
            <Btn kind="solid" accent="red" icon="search" onClick={search}>{searching ? "…" : "Zoek"}</Btn>
          </div>
          <div className="ncf-hint mono">Kai doorzoekt het Handelsregister (KvK) en vult bedrijfsnaam, nummer, adres en rechtsvorm automatisch in.</div>
          {searching && <div className="ncf-loading mono"><span className="ncf-spin" />Kai doorzoekt het Handelsregister…</div>}
          {results && results.length > 0 && (
            <div className="ncf-results">
              {results.map((r, i) => { const ex = matchExisting(store, r); return (
                <button className="ncf-res" key={i} onClick={() => pick(r)}>
                  <span className="ncf-res-ic" style={{ color: AC(ex ? "orange" : "navy"), background: ACsoft(ex ? "orange" : "navy") }} dangerouslySetInnerHTML={{ __html: ICONS("box") }} />
                  <div className="ncf-res-main">
                    <div className="ncf-res-name">{r.company_name}{ex && <span className="ncf-badge" style={{ color: AC("orange"), background: ACsoft("orange") }}>Al in CRM</span>}</div>
                    <div className="ncf-res-sub mono">KvK {r.kvk} · {r.city} · {r.legal_form}</div>
                  </div>
                  <span className="ncf-res-cta mono">{ex ? "Koppelen" : "Selecteer"}</span>
                </button>
              ) })}
            </div>
          )}
          {results && results.length === 0 && <div className="ncf-empty mono">Niets gevonden. Probeer een andere naam of voer handmatig in.</div>}
        </div>
      ) : (
        <div className="ncf-details">
          {linkTo && <div className="ncf-link-note"><span dangerouslySetInnerHTML={{ __html: ICONS("link") }} /><div><b>{linkTo.name}</b> staat al in je CRM. Voeg hieronder een contactpersoon toe om aan dit bedrijf te koppelen, of laat leeg en open de klant.</div></div>}
          <div className="ncf-sec mono">Bedrijfsgegevens{linkTo ? " · vergrendeld" : ""}</div>
          <div className="ncf-grid">
            <Field span={2} label="Officiële bedrijfsnaam" value={form.company_name} onChange={(v) => setForm({ ...form, company_name: v })} disabled={!!linkTo} />
            <Field label="KvK-nummer" value={form.kvk} onChange={(v) => setForm({ ...form, kvk: v })} disabled={!!linkTo} />
            <Field label="Rechtsvorm" value={form.legal_form} onChange={(v) => setForm({ ...form, legal_form: v })} disabled={!!linkTo} />
            <Field span={2} label="Adres" value={form.address} onChange={(v) => setForm({ ...form, address: v })} disabled={!!linkTo} />
            {!linkTo && <Field label="Sector" value={form.sector} onChange={(v) => setForm({ ...form, sector: v })} />}
            {!linkTo && <label className="field"><span className="field-lbl">Status</span>
              <div className="seg-pick">{["prospect", "active", "win-back"].map((s) => <button key={s} className={"seg-opt" + (form.status === s ? " on" : "")} style={form.status === s ? { background: AC("red"), color: "#fff" } : null} onClick={() => setForm({ ...form, status: s })}>{STATUS_META[s].label}</button>)}</div>
            </label>}
          </div>
          <div className="ncf-sec mono">Contactpersoon{linkTo ? "" : " (optioneel)"}</div>
          <div className="ncf-grid">
            <Field label="Naam" value={form.contact_name} onChange={(v) => setForm({ ...form, contact_name: v })} placeholder="bv. Lin Tan" />
            <Field label="Rol" value={form.contact_role} onChange={(v) => setForm({ ...form, contact_role: v })} placeholder="bv. Inkoop" />
            <Field label="E-mail" value={form.contact_email} onChange={(v) => setForm({ ...form, contact_email: v })} placeholder="naam@bedrijf.nl" />
            <Field label="Telefoon" value={form.contact_phone} onChange={(v) => setForm({ ...form, contact_phone: v })} placeholder="+31 …" />
          </div>
        </div>
      )}
    </Modal>
  )
}

/* ============================================================
   NL-kaart met klant-pins (uit de blauwdruk, salescrm.jsx · NLMap). De
   pin-positie komt uit de x/y-haakjes per klant in customers.js — niet in
   de kaart hardcoded; vervang die door echte lat/lng en de pins verschuiven mee.
   ============================================================ */
function NLMap({ custs }) {
  return (
    <div className="crm-map">
      <div className="crm-map-inner">
        <svg viewBox="0 0 100 130" className="crm-map-svg" preserveAspectRatio="none">
          <path className="crm-map-land" d="M44 8 L52 6 L58 12 L56 20 L62 22 L66 18 L70 24 L64 32 L70 40 L66 50 L72 58 L68 70 L60 80 L64 92 L56 104 L60 116 L48 124 L40 118 L44 108 L36 100 L40 88 L32 80 L38 68 L30 60 L36 50 L30 40 L38 32 L32 24 L40 20 L38 12 Z" />
        </svg>
        {custs.map((c) => {
          const a = (STATUS_META[c.status] || STATUS_META.prospect).accent
          return (
            <button key={c.id} className="crm-pin" style={{ left: c.x + '%', top: (c.y / 1.3) + '%', '--pc': AC(a) }} title={c.name + ' · ' + c.city} onClick={() => openKlantCard(c.id, 'de NL-kaart')}>
              <span className="crm-pin-dot" />
            </button>
          )
        })}
      </div>
      <div className="crm-map-legend">
        {Object.entries(STATUS_META).map(([k, m]) => <span key={k} className="crm-leg"><span className="crm-leg-dot" style={{ background: AC(m.accent) }} />{m.label}</span>)}
      </div>
    </div>
  )
}

/* ============================================================
   CRM-pagina, bord + instelbare tabel. edit/layout/markt via Outlet-context
   (AppShell), zoals /sales en /pipeline.
   ============================================================ */
export function CrmPage({ edit, layout, setLayout, openLib, go, flags, board }) {
  const store = useStore()
  const [q, setQ] = useState("")
  const [status, setStatus] = useState("")
  const [sort, setSort] = useState("aandacht")
  const [adding, setAdding] = useState(false)
  const DEFAULT_COLS = ["name", "next", "value", "signal", "status", "acts"]
  const [cols, setCols] = useState(() => store.get("crm.cols", DEFAULT_COLS))
  const [rules, setRules] = useState(() => store.get("crm.filters", []))
  useEffect(() => { setState("crm.cols", cols) }, [cols])
  useEffect(() => { setState("crm.filters", rules) }, [rules])
  const custs = allCustomers(store)

  const isAtt = (c) => c.status === "win-back" || c.status === "old" || custAttention(store, c)
  const TABS = [["", "Alle"], ["active", "Actief"], ["aandacht", "Vraagt aandacht"], ["win-back", "Win-back"], ["prospect", "Prospect"]]
  const list = useMemo(() => {
    let r = custs
    if (status === "aandacht") r = r.filter(isAtt)
    else if (status === "win-back") r = r.filter((c) => c.status === "win-back" || c.status === "old")
    else if (status) r = r.filter((c) => c.status === status)
    const term = q.toLowerCase().trim()
    if (term) r = r.filter((c) => (c.name + " " + c.contact + " " + c.city + " " + c.sector).toLowerCase().includes(term))
    const att = (c) => (c.status === "win-back" || c.status === "old" ? 1000 : 0) + (c.status === "prospect" ? 5 : custIdleMonths(store, c) * 10)
    r = [...r]
    if (sort === "aandacht") r.sort((a, b) => att(b) - att(a) || b.monthly - a.monthly)
    else if (sort === "waarde") r.sort((a, b) => b.monthly - a.monthly)
    else if (sort === "risico") r.sort((a, b) => riskValue(store, b) - riskValue(store, a) || att(b) - att(a))
    else if (sort === "naam") r.sort((a, b) => a.name.localeCompare(b.name))
    r = applyFilters(rules, r, store)
    return r
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [custs, status, q, sort, rules, store])

  const counts = { all: custs.length, active: custs.filter((c) => c.status === "active").length, prospect: custs.filter((c) => c.status === "prospect").length, wb: custs.filter((c) => c.status === "win-back" || c.status === "old").length, att: custs.filter(isAtt).length }
  const recurring = custs.filter((c) => c.status === "active").reduce((s, c) => s + c.monthly, 0)
  const atRisk = custs.reduce((s, c) => s + riskValue(store, c), 0)
  const countFor = (k) => k === "" ? counts.all : k === "active" ? counts.active : k === "aandacht" ? counts.att : k === "win-back" ? counts.wb : k === "prospect" ? counts.prospect : 0
  const quick = (c, type) => {
    const M = { mail: ["mail", "E-mailconcept klaargezet voor " + c.name, "iris"], wa: ["wa", "WhatsApp geopend naar " + c.contact, null], call: ["call", "Belactie genoteerd voor " + c.name, null] }
    const [lt, txt, agent] = M[type]
    addCustLog(store, c.id, { type: lt, txt })
    toast(txt + (agent ? " · Iris" : ""), agent ? { agent } : { icon: "check" })
  }

  allFields(store)
  const shown = cols.map((k) => fldGet(k)).filter(Boolean)
  const grid = shown.map((f) => f.w || "1fr").join(" ")
  const ctx = { setCard: (id) => openKlantCard(id, "het CRM"), quick }

  return (
    <div className="module-page sales-suite" key="crm">
      <header className="sx-hero">
        <div className="sx-hero-logo" style={{ "--acc": "var(--a-red)", "--acc-soft": "var(--a-red-soft)" }}>
          <span className="sx-hero-mark" dangerouslySetInnerHTML={{ __html: ICONS("people", { sw: 1.8 }) }} style={{ color: "var(--a-red)" }} />
        </div>
        <div className="sx-hero-id"><h1 className="sx-hero-h1">CRM</h1><p className="sx-hero-sub mono">Eén klantkaart per relatie, alles gelogd, gekoppeld aan offertes &amp; documenten</p></div>
        <div className="sx-hero-acts">
          <Btn kind="solid" accent="red" icon="plus" size="sm" onClick={() => setAdding(true)}>Nieuwe klant</Btn>
        </div>
      </header>

      {edit && (
        <div className="edit-hint mono">
          <span dangerouslySetInnerHTML={{ __html: ICONS("drag") }} />
          <span>Je CRM-werkruimte · sleep om te ordenen · tik <b>S / M / L / XL</b> voor de maat · <b>Widget toevoegen</b> opent de widgetmarkt</span>
        </div>
      )}
      {layout && <TileGrid board={board || "crm"} edit={edit} onOpen={go} layout={layout} setLayout={setLayout} flags={flags || {}} onAddWidget={openLib} />}

      <div className="sx-rel-tools">
        <div className="sx-search"><span dangerouslySetInnerHTML={{ __html: ICONS("search") }} /><input placeholder="Zoek op naam, plaats, sector…" value={q} onChange={(e) => setQ(e.target.value)} /></div>
        <div className="sx-tabs sm">{TABS.map(([k, lbl]) => <button key={k || "all"} role="tab" aria-selected={status === k} className={"sx-tab sm" + (status === k ? " on" : "")} style={status === k ? { "--acc": AC("red") } : null} onClick={() => setStatus(k)}>{lbl}<span className="crm-tab-n">{countFor(k)}</span></button>)}</div>
        <div className="crm-sort">
          <span className="crm-sort-l mono">Sorteer</span>
          {[["aandacht", "Aandacht"], ["risico", "Risico"], ["waarde", "Waarde"], ["naam", "Naam"]].map(([k, l]) => <button key={k} role="tab" aria-selected={sort === k} className={"crm-sort-b" + (sort === k ? " on" : "")} onClick={() => setSort(k)}>{l}</button>)}
        </div>
        <div className="crm-tools-r">
          <FilterBtn rules={rules} setRules={setRules} all={custs} store={store} />
          <ColumnsBtn cols={cols} setCols={setCols} store={store} />
        </div>
      </div>
      <FilterChips rules={rules} setRules={setRules} />

      <Panel eyebrow="Op de kaart" title="Klanten in Nederland" accent="red">
        <NLMap custs={custs} />
      </Panel>

      <Panel wid="Klanten" eyebrow={list.length + " klant" + (list.length === 1 ? "" : "en") + " · " + counts.att + " vragen aandacht · " + eur(recurring) + "/mnd terugkerend · " + eur(atRisk) + " at-risk"} title="Alle relaties" accent="red" pad={false}>
        <div className="crm-table cust">
          <div className="crm-th" style={{ gridTemplateColumns: grid }}>{shown.map((f) => <span key={f.key} style={f.align === "right" ? { textAlign: "right" } : null}>{f.group === null ? "" : f.label}</span>)}</div>
          {list.length === 0 && <div className="sx-col-empty mono" style={{ padding: 28 }}>Geen klanten gevonden.</div>}
          {list.map((c) => { const att = isAtt(c); return (
            <div className={"crm-tr" + (att ? " att" : "")} key={c.id} style={{ gridTemplateColumns: grid }} onClick={() => openKlantCard(c.id, "het CRM")}>
              {shown.map((f) => <div key={f.key} className={"crm-cellwrap " + (f.cls || "") + (f.align === "right" ? " r" : "")}>{f.cell(c, store, ctx)}</div>)}
            </div>
          ) })}
        </div>
      </Panel>

      {adding && <NewClientFlow store={store} onClose={() => setAdding(false)} onOpenCust={(cid) => { setAdding(false); openKlantCard(cid, "het CRM") }} />}
    </div>
  )
}
