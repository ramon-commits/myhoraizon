/* ============================================================
   CRM-velden: gedeelde registry voor instelbare kolommen, filters
   (CRM-tabel) en KPI's + meta-rijen (klantkaart). Elk "veld" weet hoe
   het z'n waarde leest, toont, sorteert en filtert. Persistente keuzes
   leven in de store. ESM-port van de Claude Design-blauwdruk
   (dashboard/crmfields.jsx): window-globals -> imports; crmSignal lokaal.
   ============================================================ */
import React from 'react'
import { ICONS } from './icons'
import { getState, setState } from './store.jsx'
import { AC, ACsoft, Avatar } from './components.jsx'
import {
  StatusDot, STATUS_META, custNext, DUE_META, custDeal, riskValue, riskLabel,
  custAttention, daysSinceContact, eur,
} from './sales.jsx'
import { useSmartMenu } from './menus'

const { useState, useRef, useEffect } = React

/* smart signaal per klant: wat moet je hiermee? (kleur + label + icoon) */
export function crmSignal(c, store) {
  if (c.status === "win-back" || c.status === "old") return { l: "Win-back kans", a: "orange", ic: "refresh" }
  const att = store ? custAttention(store, c) : (c.idle >= 3)
  if (att) return { l: "Vraagt aandacht", a: "orange", ic: "bell" }
  if (c.status === "prospect") return { l: "Opvolgen", a: "aqua", ic: "arrow" }
  if (c.deals > 0) return { l: "Lopende deal", a: "gold", ic: "chartup" }
  return { l: "Op schema", a: "green", ic: "check" }
}

/* ---- losse cel-renderers (herbruiken de bestaande rijke cellen) ---- */
function FcClient(c) {
  return (
    <div className="crm-co"><Avatar name={c.name} size={34} />
      <div className="crm-co-tx"><div className="crm-co-name">{c.name}</div>
        <div className="crm-co-contact mono">{c.sector} · {c.city}</div></div>
    </div>
  )
}
function FcNext(c, store, ctx) {
  const nx = custNext(store, c)
  if (!nx) return <span className="crm-next-add mono" onClick={(e) => { e.stopPropagation(); ctx.setCard(c.id) }}>+ stap plannen</span>
  const dm = (DUE_META || {})[nx.u] || (DUE_META || {}).later || { a: "navy", ic: "clock" }
  return (<><span className="crm-next-txt">{nx.txt}</span><span className="crm-due" style={{ color: AC(dm.a), background: ACsoft(dm.a) }}><span dangerouslySetInnerHTML={{ __html: ICONS(dm.ic, { sw: 2 }) }} />{nx.due}</span></>)
}
function FcValue(c, store) {
  const d = custDeal(store, c); const rv = riskValue(store, c)
  if (c.monthly > 0) return <span className="crm-money"><b className="crm-val">{eur(c.monthly)}</b><span className="crm-mo mono">/mnd</span>{d && <span className="crm-deal" style={{ color: AC("gold"), background: ACsoft("gold") }}>+{eur(d.value)}</span>}</span>
  if (d) return <span className="crm-deal solo" style={{ color: AC("gold"), background: ACsoft("gold") }}>{eur(d.value)} deal</span>
  if (rv > 0) return <span className="crm-risk" style={{ color: AC("orange") }}>{eur(rv)}<span className="crm-mo mono"> {riskLabel(store, c)}</span></span>
  return <span className="mono crm-dim">–</span>
}
function FcSignal(c, store) {
  const sig = crmSignal(c, store)
  return <span className="crm-sig" style={{ color: AC(sig.a), background: ACsoft(sig.a) }}><span dangerouslySetInnerHTML={{ __html: ICONS(sig.ic, { sw: 2 }) }} />{sig.l}</span>
}
function FcActs(c, store, ctx) {
  return (
    <div className="crm-acts" onClick={(e) => e.stopPropagation()}>
      <button className="crm-act" title="E-mailconcept" onClick={() => ctx.quick(c, "mail")}><span dangerouslySetInnerHTML={{ __html: ICONS("gm", { sw: 1.9 }) }} /></button>
      <button className="crm-act" title="WhatsApp" onClick={() => ctx.quick(c, "wa")}><span dangerouslySetInnerHTML={{ __html: ICONS("wa", { sw: 1.9 }) }} /></button>
      <button className="crm-act" title="Bel" onClick={() => ctx.quick(c, "call")}><span dangerouslySetInnerHTML={{ __html: ICONS("phone", { sw: 1.9 }) }} /></button>
    </div>
  )
}
const _eurOrDash = (n) => (n > 0 ? eur(n) : <span className="crm-dim mono">–</span>)

/* ---- de registry. num() = sorteer/filter-getal, txt() = filtertekst ---- */
const CRM_FIELDS = [
  { key: "name", label: "Klant", group: "Basis", pinned: true, w: "minmax(180px,2fr)",
    cell: (c) => FcClient(c), kpi: null },
  { key: "next", label: "Volgende stap", group: "Sales", w: "minmax(150px,1.75fr)", cls: "crm-nextc",
    cell: (c, s, ctx) => FcNext(c, s, ctx), filter: "text", txt: (c, s) => { const n = custNext(s, c); return n ? n.txt : "" },
    kpi: { lbl: "Volgende stap", val: (c, s) => { const n = custNext(s, c); return n ? n.txt : "–" } } },
  { key: "value", label: "Waarde", group: "Omzet", w: "minmax(96px,1fr)",
    cell: (c, s) => FcValue(c, s), num: (c) => c.monthly || 0, filter: "number", unit: "/mnd",
    kpi: { lbl: "Omzet/mnd", val: (c) => _eurOrDash(c.monthly || 0) } },
  { key: "signal", label: "Signaal", group: "Sales", w: "minmax(120px,1.1fr)",
    cell: (c, s) => FcSignal(c, s), filter: "enum", enum: () => ["Win-back kans", "Vraagt aandacht", "Opvolgen", "Lopende deal", "Op schema"], txt: (c, s) => crmSignal(c, s).l,
    kpi: { lbl: "Signaal", val: (c, s) => crmSignal(c, s).l, accentFn: (c, s) => crmSignal(c, s).a } },
  { key: "status", label: "Status", group: "Basis", w: ".7fr", align: "left",
    cell: (c) => <StatusDot status={c.status} />, filter: "enum",
    enum: () => ["active", "prospect", "win-back", "old"], enumLabel: (v) => (STATUS_META[v] || {}).label || v, txt: (c) => c.status,
    kpi: { lbl: "Status", val: (c) => (STATUS_META[c.status] || {}).label || c.status } },
  { key: "acts", label: "Acties", group: null, pinned: true, w: "112px",
    cell: (c, s, ctx) => FcActs(c, s, ctx) },

  /* ---- optionele kolommen / KPI's ---- */
  { key: "sector", label: "Sector", group: "Basis", w: "minmax(110px,1fr)",
    cell: (c) => <span className="crm-cell">{c.sector}</span>, filter: "enum",
    enum: (all) => [...new Set(all.map((c) => c.sector))].sort(), txt: (c) => c.sector,
    kpi: { lbl: "Sector", val: (c) => c.sector } },
  { key: "city", label: "Plaats", group: "Basis", w: "minmax(100px,1fr)",
    cell: (c) => <span className="crm-cell">{c.city}</span>, filter: "enum",
    enum: (all) => [...new Set(all.map((c) => c.city))].sort(), txt: (c) => c.city,
    kpi: { lbl: "Plaats", val: (c) => c.city } },
  { key: "contact", label: "Contactpersoon", group: "Basis", w: "minmax(120px,1.2fr)",
    cell: (c) => <span className="crm-cell">{c.contact}</span>, filter: "text", txt: (c) => c.contact,
    kpi: { lbl: "Contactpersoon", val: (c) => c.contact } },
  { key: "phone", label: "Telefoon", group: "Basis", w: "minmax(120px,1fr)",
    cell: (c) => <span className="crm-cell mono">{c.phone || "–"}</span>, txt: (c) => c.phone || "",
    kpi: { lbl: "Telefoon", val: (c) => c.phone || "–" } },
  { key: "employees", label: "Medewerkers", group: "Bedrijf", w: ".8fr", align: "right",
    cell: (c) => <span className="crm-cell">{c.employees || "–"}</span>,
    kpi: { lbl: "Medewerkers", val: (c) => c.employees || "–" } },
  { key: "since", label: "Klant sinds", group: "Bedrijf", w: ".8fr", align: "right",
    cell: (c) => <span className="crm-cell">{c.since || "–"}</span>, num: (c) => c.since || 0, filter: "number",
    kpi: { lbl: "Klant sinds", val: (c) => (c.since ? c.since + (c.since ? " · " + (2026 - c.since) + " jr" : "") : "–") } },
  { key: "idle", label: "Dagen stil", group: "Sales", w: ".7fr", align: "right",
    cell: (c, s) => { const d = s ? daysSinceContact(s, c) : (c.idle || 0); return <span className="crm-cell">{d >= 9000 ? "–" : d}</span> }, num: (c, s) => { const d = s ? daysSinceContact(s, c) : (c.idle || 0); return d >= 9000 ? 0 : d }, filter: "number",
    kpi: { lbl: "Dagen stil", val: (c, s) => { const d = s ? daysSinceContact(s, c) : (c.idle || 0); return d >= 9000 ? "–" : d + (d === 1 ? " dag" : " dgn") } } },
  { key: "yearly", label: "Jaarwaarde", group: "Omzet", w: "minmax(96px,1fr)", align: "right",
    cell: (c) => <span className="crm-cell crm-num">{_eurOrDash((c.monthly || 0) * 12)}</span>, num: (c) => (c.monthly || 0) * 12, filter: "number",
    kpi: { lbl: "Jaarwaarde", val: (c) => _eurOrDash((c.monthly || 0) * 12) } },
  { key: "deal", label: "Lopende deal", group: "Omzet", w: "minmax(96px,1fr)", align: "right",
    cell: (c, s) => { const d = custDeal(s, c); return <span className="crm-cell crm-num">{d ? eur(d.value) : <span className="crm-dim mono">–</span>}</span> },
    num: (c, s) => { const d = custDeal(s, c); return d ? d.value : 0 }, filter: "number",
    kpi: { lbl: "Lopende deal", val: (c, s) => { const d = custDeal(s, c); return d ? eur(d.value) : "–" } } },
  { key: "risk", label: "At-risk", group: "Omzet", w: "minmax(96px,1fr)", align: "right",
    cell: (c, s) => { const rv = riskValue(s, c); return <span className="crm-cell crm-num" style={rv > 0 ? { color: AC("orange") } : null}>{rv > 0 ? eur(rv) : <span className="crm-dim mono">–</span>}</span> },
    num: (c, s) => riskValue(s, c), filter: "number",
    kpi: { lbl: "At-risk", val: (c, s) => { const rv = riskValue(s, c); return rv > 0 ? eur(rv) : "–" }, accent: "orange" } },
  { key: "deals", label: "Deals", group: "Sales", w: ".6fr", align: "right",
    cell: (c) => <span className="crm-cell crm-num">{c.deals || 0}</span>, num: (c) => c.deals || 0, filter: "number",
    kpi: { lbl: "Aantal deals", val: (c) => c.deals || 0 } },
]
const FIELD_BY = Object.fromEntries(CRM_FIELDS.map((f) => [f.key, f]))

/* ---- eigen velden: door de gebruiker zelf gemaakt, per klant invulbaar ---- */
const cfv = (store, c, key) => store.get("cf.v." + c.id + "." + key, "")
const cfSet = (c, key, val) => setState("cf.v." + c.id + "." + key, val)
let _customMap = {}
function customFields(store) {
  const defs = store.get("cf.custom", [])
  const out = defs.map((d) => {
    const isNum = d.type === "number"
    const f = {
      key: d.key, label: d.label, group: "Eigen velden", custom: true, type: d.type,
      w: isNum ? ".8fr" : "minmax(110px,1fr)", align: isNum ? "right" : "left",
      cell: (c, s) => { const v = cfv(s, c, d.key); return <span className={"crm-cell" + (v ? "" : " crm-dim")}>{v || "–"}</span> },
      filter: isNum ? "number" : "text",
      txt: (c, s) => String(cfv(s, c, d.key) || ""),
      kpi: { lbl: d.label, val: (c, s) => { const v = cfv(s, c, d.key); return v || "–" }, editable: true, type: d.type },
    }
    if (isNum) f.num = (c, s) => Number(cfv(s, c, d.key)) || 0
    return f
  })
  _customMap = Object.fromEntries(out.map((f) => [f.key, f]))
  return out
}
function allFields(store) { customFields(store); return [...CRM_FIELDS, ...Object.values(_customMap)] }
const fld = (k) => FIELD_BY[k] || _customMap[k]

function fieldNum(f, c, store) { return f.num ? f.num(c, store) : 0 }
function fieldTxt(f, c, store) { return f.txt ? String(f.txt(c, store) || "") : "" }

function ruleMatch(rule, c, store) {
  const f = fld(rule.field); if (!f) return true
  if (f.filter === "number") {
    const v = fieldNum(f, c, store); const t = Number(rule.val)
    if (isNaN(t)) return true
    return rule.op === "gte" ? v >= t : rule.op === "lte" ? v <= t : v === t
  }
  const v = fieldTxt(f, c, store).toLowerCase()
  const t = String(rule.val || "").toLowerCase()
  if (!t) return true
  return f.filter === "enum" ? v === t : v.includes(t)
}
function applyFilters(rules, list, store) {
  if (!rules || !rules.length) return list
  return list.filter((c) => rules.every((r) => ruleMatch(r, c, store)))
}

/* oplopende id voor nieuwe filterregels (geen Date.now/Math.random in render) */
let _ruleSeq = 1
function nextRuleId() { return _ruleSeq++ }

/* ============================================================
   UI: generieke veld-kiezer (kolommen / KPI's / meta-rijen)
   ============================================================ */
function usePop() {
  const [open, setOpen] = useState(false)
  const ref = useRef(null)
  useEffect(() => {
    if (!open) return
    const h = (e) => { if (ref.current && !ref.current.contains(e.target)) setOpen(false) }
    window.addEventListener("pointerdown", h); return () => window.removeEventListener("pointerdown", h)
  }, [open])
  return [open, setOpen, ref]
}

function FieldPicker({ pool, sel, onChange, lockKeys, title, hint, store, allowCreate, style }) {
  const [q, setQ] = useState("")
  const [making, setMaking] = useState(false)
  const [nl, setNl] = useState("")
  const [nt, setNt] = useState("text")
  const fpRef = useSmartMenu({ align: "end", margin: 12 })
  const ql = q.trim().toLowerCase()
  const visible = ql ? pool.filter((f) => f.label.toLowerCase().includes(ql)) : pool
  const groups = {}
  visible.forEach((f) => { const g = f.group || "Overig"; (groups[g] = groups[g] || []).push(f) })
  const has = (k) => sel.includes(k)
  const toggle = (k) => {
    if (lockKeys && lockKeys.includes(k)) return
    onChange(has(k) ? sel.filter((x) => x !== k) : [...sel, k])
  }
  const create = () => {
    const label = nl.trim(); if (!label || !store) return
    const key = "cf_" + Date.now().toString(36)
    const defs = store.get("cf.custom", [])
    setState("cf.custom", [...defs, { key, label, type: nt }])
    onChange([...sel, key])
    setNl(""); setNt("text"); setMaking(false); setQ("")
  }
  const order = ["Basis", "Sales", "Omzet", "Bedrijf", "Eigen velden", "Overig"]
  const gk = Object.keys(groups).sort((a, b) => (order.indexOf(a) + 1 || 99) - (order.indexOf(b) + 1 || 99))
  return (
    <div className="fp-pop" ref={fpRef} style={style || undefined}>
      <div className="fp-head"><span className="fp-title">{title}</span>{hint && <span className="fp-hint mono">{hint}</span>}</div>
      <div className="fp-search">
        <span dangerouslySetInnerHTML={{ __html: ICONS("search", { sw: 2 }) }} />
        <input value={q} onChange={(e) => setQ(e.target.value)} placeholder="Zoek een veld of KPI…" autoFocus />
        {q && <button className="fp-search-x" onClick={() => setQ("")} dangerouslySetInnerHTML={{ __html: ICONS("close", { sw: 2.4 }) }} />}
      </div>
      <div className="fp-body">
        {gk.length === 0 && <div className="fp-nohit mono">Geen veld gevonden voor “{q}”.</div>}
        {gk.map((g) => (
          <div className="fp-group" key={g}>
            <div className="fp-group-l mono">{g}</div>
            {groups[g].map((f) => { const locked = lockKeys && lockKeys.includes(f.key); return (
              <label className={"fp-opt" + (locked ? " locked" : "")} key={f.key}>
                <span className={"fp-check" + (has(f.key) ? " on" : "")}>{has(f.key) && <span dangerouslySetInnerHTML={{ __html: ICONS("check", { sw: 3 }) }} />}</span>
                <input type="checkbox" checked={has(f.key)} disabled={locked} onChange={() => toggle(f.key)} />
                <span className="fp-opt-l">{f.label}{f.custom && <span className="fp-tag mono">eigen</span>}</span>
                {locked && <span className="fp-lock mono">vast</span>}
              </label>
            ) })}
          </div>
        ))}
      </div>
      {allowCreate && store && (
        <div className="fp-foot">
          {!making ? (
            <button className="fp-make" onClick={() => setMaking(true)}>
              <span dangerouslySetInnerHTML={{ __html: ICONS("plus", { sw: 2.2 }) }} />Eigen veld maken
            </button>
          ) : (
            <div className="fp-make-form">
              <input className="fp-make-l" value={nl} autoFocus placeholder="Veldnaam, bijv. Voorkeur levering"
                onChange={(e) => setNl(e.target.value)} onKeyDown={(e) => e.key === "Enter" && create()} />
              <div className="fp-make-row">
                <div className="fp-seg">
                  <button className={nt === "text" ? "on" : ""} onClick={() => setNt("text")}>Tekst</button>
                  <button className={nt === "number" ? "on" : ""} onClick={() => setNt("number")}>Getal</button>
                </div>
                <button className="fp-make-go" disabled={!nl.trim()} onClick={create}>Maak veld</button>
                <button className="fp-make-x mono" onClick={() => { setMaking(false); setNl("") }}>Annuleer</button>
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  )
}

/* knop + popover voor kolommenkeuze (CRM-tabel) */
function ColumnsBtn({ cols, setCols, store }) {
  const [open, setOpen, ref] = usePop()
  const lock = ["name", "acts"]
  const pool = store ? allFields(store) : CRM_FIELDS
  const norm = (next) => {
    let r = next.filter((k) => k !== "name" && k !== "acts")
    r = ["name", ...r]
    if (next.includes("acts")) r.push("acts")
    setCols(r)
  }
  return (
    <div className="crm-tool-wrap" ref={ref}>
      <button className={"crm-tool-btn" + (open ? " on" : "")} onClick={() => setOpen((v) => !v)}>
        <span dangerouslySetInnerHTML={{ __html: ICONS("columns", { sw: 1.9 }) }} />Kolommen<span className="crm-tool-n">{cols.length}</span>
      </button>
      {open && <FieldPicker pool={pool} sel={cols} onChange={norm} lockKeys={lock} store={store} allowCreate
        title="Kolommen in je tabel" hint="Klant en Acties staan vast" />}
    </div>
  )
}

/* knop + popover voor filters (CRM-tabel) */
function FilterBtn({ rules, setRules, all, store }) {
  const [open, setOpen, ref] = usePop()
  const filterPopRef = useSmartMenu({ align: "end", margin: 12, dep: open })
  const filterable = (store ? allFields(store) : CRM_FIELDS).filter((f) => f.filter)
  const add = () => { const f = filterable[0]; setRules([...rules, { id: nextRuleId(), field: f.key, op: "gte", val: "" }]) }
  const upd = (id, patch) => setRules(rules.map((r) => r.id === id ? { ...r, ...patch } : r))
  const del = (id) => setRules(rules.filter((r) => r.id !== id))
  return (
    <div className="crm-tool-wrap" ref={ref}>
      <button className={"crm-tool-btn" + (open ? " on" : "") + (rules.length ? " active" : "")} onClick={() => setOpen((v) => !v)}>
        <span dangerouslySetInnerHTML={{ __html: ICONS("filter", { sw: 1.9 }) }} />Filter{rules.length > 0 && <span className="crm-tool-n">{rules.length}</span>}
      </button>
      {open && (
        <div className="fp-pop fp-filter" ref={filterPopRef}>
          <div className="fp-head"><span className="fp-title">Filters</span>{rules.length > 0 && <button className="fp-clear mono" onClick={() => setRules([])}>Wis alles</button>}</div>
          <div className="fp-body">
            {rules.length === 0 && <div className="fp-filter-empty mono">Nog geen filters. Voeg er een toe om je lijst te verfijnen op precies wat jij wilt zien.</div>}
            {rules.map((r) => { const f = fld(r.field); return (
              <div className="fp-rule" key={r.id}>
                <select className="fp-sel" value={r.field} onChange={(e) => { const nf = fld(e.target.value); upd(r.id, { field: e.target.value, op: nf.filter === "number" ? "gte" : "eq", val: "" }) }}>
                  {filterable.map((f) => <option key={f.key} value={f.key}>{f.label}</option>)}
                </select>
                {f.filter === "number" ? (
                  <select className="fp-op" value={r.op} onChange={(e) => upd(r.id, { op: e.target.value })}>
                    <option value="gte">≥</option><option value="lte">≤</option><option value="eq">=</option>
                  </select>
                ) : null}
                {f.filter === "enum" ? (
                  <select className="fp-val" value={r.val} onChange={(e) => upd(r.id, { val: e.target.value })}>
                    <option value="">Kies…</option>
                    {f.enum(all).map((o) => <option key={o} value={o}>{f.enumLabel ? f.enumLabel(o) : o}</option>)}
                  </select>
                ) : f.filter === "number" ? (
                  <input className="fp-val" type="number" value={r.val} placeholder="0" onChange={(e) => upd(r.id, { val: e.target.value })} />
                ) : (
                  <input className="fp-val" value={r.val} placeholder="bevat…" onChange={(e) => upd(r.id, { val: e.target.value })} />
                )}
                <button className="fp-del" onClick={() => del(r.id)} title="Verwijder" dangerouslySetInnerHTML={{ __html: ICONS("close", { sw: 2.4 }) }} />
              </div>
            ) })}
            <button className="fp-add" onClick={add}><span dangerouslySetInnerHTML={{ __html: ICONS("plus", { sw: 2.2 }) }} />Filter toevoegen</button>
          </div>
        </div>
      )}
    </div>
  )
}

/* actieve-filter chips onder de toolbar */
function FilterChips({ rules, setRules }) {
  if (!rules.length) return null
  const opSym = { gte: "≥", lte: "≤", eq: "=" }
  return (
    <div className="crm-chips">
      {rules.map((r) => { const f = fld(r.field); if (!f) return null
        const val = f.filter === "enum" && f.enumLabel ? f.enumLabel(r.val) : r.val
        const txt = f.filter === "number" ? `${f.label} ${opSym[r.op]} ${val || 0}` : `${f.label}: ${val || "leeg"}`
        return <button className="crm-chip" key={r.id} onClick={() => setRules(rules.filter((x) => x.id !== r.id))}>{txt}<span dangerouslySetInnerHTML={{ __html: ICONS("close", { sw: 2.4 }) }} /></button>
      })}
      <button className="crm-chip clear mono" onClick={() => setRules([])}>Wis alles</button>
    </div>
  )
}

/* ============================================================
   Klantkaart: instelbare KPI-strip + meta-rijen
   ============================================================ */
const DEFAULT_KPIS = ["value", "yearly", "idle", "deals"]
const DEFAULT_META = ["value", "yearly", "deals", "since", "city", "employees", "phone", "sector", "contact"]

function kpiVal(f, c, store) { return f.kpi && f.kpi.val ? f.kpi.val(c, store) : "–" }

function CardCustomBtn({ sel, setSel, lock, title, hint, compact, store }) {
  const [open, setOpen, ref] = usePop()
  const [style, setStyle] = useState(null)
  const btnRef = useRef(null)
  const pool = (store ? allFields(store) : CRM_FIELDS).filter((f) => f.kpi)
  useEffect(() => {
    if (!open || !btnRef.current) return
    const r = btnRef.current.getBoundingClientRect()
    const w = 300, gap = 6
    const right = Math.max(12, window.innerWidth - r.right)
    const below = window.innerHeight - r.bottom - 12
    if (below < 280) {
      setStyle({ position: "fixed", width: w, right, bottom: window.innerHeight - r.top + gap, top: "auto", maxHeight: Math.min(window.innerHeight * 0.7, r.top - 12) })
    } else {
      setStyle({ position: "fixed", width: w, right, top: r.bottom + gap, maxHeight: Math.min(window.innerHeight * 0.7, below) })
    }
  }, [open])
  return (
    <div className="crm-tool-wrap" ref={ref}>
      <button ref={btnRef} className={"cf-cust-btn" + (compact ? " sm" : "") + (open ? " on" : "")} onClick={(e) => { e.stopPropagation(); setOpen((v) => !v) }} title={title}>
        <span dangerouslySetInnerHTML={{ __html: ICONS("sliders", { sw: 1.9 }) }} />{!compact && "Aanpassen"}
      </button>
      {open && <FieldPicker pool={pool} sel={sel} onChange={setSel} lockKeys={lock} store={store} allowCreate title={title} hint={hint} style={style} />}
    </div>
  )
}

function CfEditVal({ c, fldDef }) {
  const [editing, setEditing] = useState(false)
  const cur = getState("cf.v." + c.id + "." + fldDef.key, "")
  const [val, setVal] = useState(cur)
  useEffect(() => { setVal(cur) }, [cur, editing])
  const save = () => { cfSet(c, fldDef.key, val); setEditing(false) }
  if (editing) {
    return <input className="cf-edit-in" autoFocus type={fldDef.type === "number" ? "number" : "text"} value={val}
      onChange={(e) => setVal(e.target.value)} onBlur={save}
      onKeyDown={(e) => { if (e.key === "Enter") save(); if (e.key === "Escape") setEditing(false) }} />
  }
  return <button className={"cf-edit-v" + (cur ? "" : " empty")} onClick={(e) => { e.stopPropagation(); setEditing(true) }}>
    {cur || "+ invullen"}</button>
}

function CardKpiStrip({ c, store }) {
  const [kpis, setKpis] = useState(() => store.get("cf.kpis", DEFAULT_KPIS))
  useEffect(() => { setState("cf.kpis", kpis) }, [kpis])
  const shown = kpis.map((k) => fld(k)).filter((f) => f && f.kpi)
  return (
    <div className="cf-kpis">
      {shown.map((f) => { const acc = f.kpi.accent || (f.kpi.accentFn ? f.kpi.accentFn(c) : null)
        return (
          <div className="cf-kpi" key={f.key}>
            <div className="cf-kpi-l mono">{f.kpi.lbl}</div>
            <div className="cf-kpi-v" style={acc ? { color: AC(acc) } : null}>
              {f.custom ? <CfEditVal c={c} fldDef={f} /> : kpiVal(f, c, store)}</div>
          </div>
        ) })}
      <div className="cf-kpi-add">
        <CardCustomBtn sel={kpis} setSel={setKpis} lock={[]} compact store={store}
          title="KPI's op deze kaart" hint="Kies, zoek of maak een KPI" />
      </div>
    </div>
  )
}

function CardMetaRows({ c, store, extra }) {
  const [keys, setKeys] = useState(() => store.get("cf.meta.v2", DEFAULT_META))
  useEffect(() => { setState("cf.meta.v2", keys) }, [keys])
  const shown = keys.map((k) => fld(k)).filter((f) => f && f.kpi)
  return (
    <div className="sx-card-meta cust">
      {shown.map((f) => (
        <div className="sx-meta" key={f.key}><span className="sx-meta-l mono">{f.kpi.lbl}</span>
          <span className="sx-meta-v">{f.custom ? <CfEditVal c={c} fldDef={f} /> : kpiVal(f, c, store)}</span></div>
      ))}
      {(extra || []).map(([l, v], i) => <div className="sx-meta" key={"x" + i}><span className="sx-meta-l mono">{l}</span><span className="sx-meta-v">{v}</span></div>)}
      <div className="sx-meta-cust">
        <CardCustomBtn sel={keys} setSel={setKeys} lock={[]} compact store={store}
          title="Velden op deze kaart" hint="Kies, zoek of maak een veld" />
      </div>
    </div>
  )
}

export {
  CRM_FIELDS, FIELD_BY, fld as fldGet, fieldNum, fieldTxt, applyFilters,
  allFields, cfv, cfSet,
  ColumnsBtn, FilterBtn, FilterChips, FieldPicker,
  CardKpiStrip, CardMetaRows, CardCustomBtn,
}
