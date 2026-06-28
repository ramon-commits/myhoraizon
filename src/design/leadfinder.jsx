/* ============================================================
   Leadfinder (uit de blauwdruk salescrm.jsx): branche-keuze via Google
   place-types + namaak-Maps met lat/lng-pins. Onderdeel van de Sales-suite.
   ESM-port: window-globals -> imports/exports, body letterlijk.

   Alle branche-keys, geocoding en demo-leads komen uit ./finder-data.js
   (de SEAM). Hier staat alleen de UI + de demo-aanroep-flow; vervang
   finder-data.js door de echte Google Places-call en deze UI werkt door.
   De namaak-kaart projecteert de lat/lng zelf, zodat 'ie 1-op-1 door echte
   Google Maps vervangen kan worden zonder de data te raken.
   ============================================================ */
import React from 'react'
import { ICONS } from './icons'
import { useStore, setState, toast } from './store.jsx'
import { AC, ACsoft, Btn, Panel } from './components.jsx'
import { useSmartMenu } from './menus.js'
import { ObjectActions } from './objectactions.jsx'
import { allCustomers } from './customers.js'
import {
  PLACE_GROUPS, placeLabel, pinAccent, geocodeCenter, offsetLatLng, haversine,
  FINDER_RESULTS, BRON_BADGE, MATCH_BADGE,
} from './finder-data.js'

const { useState: useStateCR, useEffect: useEffectCR, useMemo: useMemoCR, useRef: useRefCR } = React

/* ---- kaart-laag (Google-Maps-namaak) ---- */
/* deterministische straatkaart-achtergrond (alleen lijnen + vlakken, geen NL-omtrek) */
function buildMapSvg() {
  const W = 1000, H = 640; let seed = 7
  const rnd = () => { seed = (seed * 1103515245 + 12345) & 0x7fffffff; return seed / 0x7fffffff }
  let bg = `<rect width="${W}" height="${H}" fill="#e9eaec"/>`
  bg += `<rect x="${W * 0.04}" y="${H * 0.60}" width="${W * 0.27}" height="${H * 0.34}" rx="26" fill="#c7e7c9"/>`
  bg += `<rect x="${W * 0.70}" y="${H * 0.04}" width="${W * 0.26}" height="${H * 0.22}" rx="22" fill="#cce9cd"/>`
  bg += `<path d="M-20 ${H * 0.18} C ${W * 0.3} ${H * 0.30}, ${W * 0.55} ${H * 0.04}, ${W + 20} ${H * 0.16} L ${W + 20} ${H * 0.30} C ${W * 0.55} ${H * 0.18}, ${W * 0.3} ${H * 0.44}, -20 ${H * 0.32} Z" fill="#a9d6f5"/>`
  const seg = (x1, y1, x2, y2, wd, major) => {
    let s = ""
    if (major) s += `<line x1="${x1}" y1="${y1}" x2="${x2}" y2="${y2}" stroke="#d6d9de" stroke-width="${wd + 3}" stroke-linecap="round"/>`
    s += `<line x1="${x1}" y1="${y1}" x2="${x2}" y2="${y2}" stroke="#ffffff" stroke-width="${wd}" stroke-linecap="round"/>`
    return s
  }
  let roads = ""
  for (let i = 1; i < 8; i++) { const y = H * i / 8 + (rnd() - 0.5) * 26; roads += seg(-20, y, W + 20, y + (rnd() - 0.5) * 36, i % 3 === 0 ? 6 : 2.6, i % 3 === 0) }
  for (let i = 1; i < 11; i++) { const x = W * i / 11 + (rnd() - 0.5) * 26; roads += seg(x, -20, x + (rnd() - 0.5) * 36, H + 20, i % 3 === 0 ? 6 : 2.6, i % 3 === 0) }
  roads += seg(-20, H * 0.08, W * 0.72, H + 20, 5, true)
  roads += seg(W * 0.18, -20, W + 20, H * 0.82, 4.5, true)
  return `<svg viewBox="0 0 ${W} ${H}" preserveAspectRatio="xMidYMid slice" xmlns="http://www.w3.org/2000/svg">${bg}<g>${roads}</g></svg>`
}

function FinderMapCard({ lead, center, onApprove }) {
  const ref = useSmartMenu({ align: "center", margin: 12 })
  const dist = haversine(center.lat, center.lng, lead.lat, lead.lng)
  const b = BRON_BADGE[lead.bron] || BRON_BADGE.notfound
  const ac = AC(lead.accent || pinAccent(lead.type))
  return (
    <div className="fn-map-card" ref={ref} onClick={(e) => e.stopPropagation()} onPointerDown={(e) => e.stopPropagation()}>
      <div className="fn-mc-top">
        <span className="fn-mc-dot" style={{ background: ac }} />
        <div className="fn-mc-id"><div className="fn-mc-name">{lead.bedrijf}</div><div className="fn-mc-sub mono">{placeLabel(lead.type)} · {dist.toFixed(1)} km</div></div>
        <span className="fn-score" style={{ color: AC(lead.score >= 85 ? "green" : lead.score >= 78 ? "gold" : "navy") }}>{lead.score}</span>
      </div>
      <div className="fn-mc-adr mono">{lead.adres}</div>
      <div className="fn-mc-act">
        <span className="fn-badge" style={{ color: AC(b.a), background: ACsoft(b.a) }}>{b.l}</span>
        <Btn kind="solid" accent="green" size="sm" onClick={() => onApprove(lead)}>Goedkeuren</Btn>
      </div>
    </div>
  )
}
function FinderMap({ center, leads, straal, selected, onSelect, onApprove }) {
  const wrapRef = useRefCR(null)
  const [size, setSize] = useStateCR({ w: 640, h: 430 })
  useEffectCR(() => {
    const el = wrapRef.current; if (!el || typeof ResizeObserver === "undefined") return
    const ro = new ResizeObserver(() => setSize({ w: el.clientWidth, h: el.clientHeight }))
    ro.observe(el); setSize({ w: el.clientWidth, h: el.clientHeight })
    return () => ro.disconnect()
  }, [])
  const svg = useMemoCR(() => buildMapSvg(), [])
  const { w, h } = size
  const mpp = (straal * 1000) / (0.40 * Math.min(w, h)) // meters per pixel
  const project = (lat, lng) => {
    const dxM = (lng - center.lng) * 111320 * Math.cos(center.lat * Math.PI / 180)
    const dyM = (lat - center.lat) * 110574
    return { x: w / 2 + dxM / mpp, y: h / 2 - dyM / mpp }
  }
  const radiusPx = (straal * 1000) / mpp
  return (
    <div className="fn-map" ref={wrapRef} onClick={() => onSelect(null)}>
      <div className="fn-map-streets" dangerouslySetInnerHTML={{ __html: svg }} />
      <div className="fn-map-radius" style={{ width: radiusPx * 2, height: radiusPx * 2, left: w / 2, top: h / 2 }} />
      <div className="fn-map-me" style={{ left: w / 2, top: h / 2 }}><span className="fn-map-me-pulse" /><span className="fn-map-me-dot" /></div>
      <div className="fn-map-me-lbl" style={{ left: w / 2, top: h / 2 }}>Jij bent hier{center.label ? " · " + center.label : ""}</div>
      {leads.map((l) => {
        const p = project(l.lat, l.lng); const on = selected === l.id
        return (
          <React.Fragment key={l.id}>
            <button type="button" className={"fn-map-pin" + (on ? " on" : "")} style={{ left: p.x, top: p.y, "--pc": AC(l.accent || pinAccent(l.type)) }}
              onClick={(e) => { e.stopPropagation(); onSelect(on ? null : l.id) }} title={l.bedrijf}>
              <span className="fn-map-pin-dot" />
            </button>
            {on && <FinderMapCard lead={l} center={center} onApprove={onApprove} />}
          </React.Fragment>
        )
      })}
    </div>
  )
}

export function FinderModule({ onOpen }) {
  const store = useStore()
  const [mode, setMode] = useStateCR("branche") // branche | ref
  const [ref, setRef] = useStateCR("")
  const [locatie, setLocatie] = useStateCR("")
  const [query, setQuery] = useStateCR("")
  const [activeGroup, setActiveGroup] = useStateCR(0)
  const [phase, setPhase] = useStateCR("idle") // idle|detecting|detected|searching|results
  const [refCo, setRefCo] = useStateCR(null)
  const [types, setTypes] = useStateCR([]) // Google place-type-keys
  const [straal, setStraal] = useStateCR(5)
  const [aantal, setAantal] = useStateCR(15)
  const [leads, setLeads] = useStateCR([])
  const [enriching, setEnriching] = useStateCR(false)
  const [view, setView] = useStateCR("beide") // lijst | kaart | beide
  const [selected, setSelected] = useStateCR(null)
  const [center, setCenter] = useStateCR(null)

  // branche-keuze: zoekresultaten over alle groepen, anders de actieve groep
  const pickItems = useMemoCR(() => {
    const q = query.trim().toLowerCase()
    if (q) {
      const out = []
      PLACE_GROUPS.forEach((grp) => grp.items.forEach((it) => {
        if (it[0].toLowerCase().includes(q) || it[1].includes(q)) out.push(it)
      }))
      return out.slice(0, 60)
    }
    return (PLACE_GROUPS[activeGroup] || PLACE_GROUPS[0]).items
  }, [query, activeGroup])
  const showPicker = mode === "branche" || (mode === "ref" && !!refCo && phase !== "detecting")

  const approved = store.get("finder.approved", [])
  const winBack = allCustomers(store).filter((c) => c.status === "win-back").slice(0, 3)

  // SEAM: detect/search simuleren nu de Places-call met demo-data (finder-data.js).
  // Vervang de setTimeout-blokken door de echte Geocoding + Nearby Search (New)
  // met `includedTypes: types`; de rest van de UI blijft identiek.
  const detect = () => {
    if (!ref.trim()) { toast("Vul een bedrijf + plaats in", { icon: "close", kind: "muted" }); return }
    setPhase("detecting"); setRefCo(null); setLeads([])
    setTimeout(() => {
      setRefCo({ naam: ref.trim(), adres: ref.includes(",") ? ref.split(",").slice(1).join(",").trim() : "Amsterdam", type: "Horeca aan het water" })
      setTypes(["hotel", "restaurant", "bar", "event_venue"])
      setPhase("detected")
    }, 850)
  }
  const search = () => {
    if (types.length === 0) { toast("Kies eerst één of meer branches", { icon: "close", kind: "muted" }); return }
    if (mode === "branche" && !locatie.trim()) { toast("Vul een locatie of gebied in", { icon: "close", kind: "muted" }); return }
    setPhase("searching"); setLeads([]); setEnriching(true); setSelected(null)
    const ctr = geocodeCenter(mode === "branche" ? locatie : (refCo ? refCo.naam + " " + refCo.adres : ""))
    setCenter(ctr)
    setTimeout(() => {
      const found = FINDER_RESULTS.slice(0, Math.min(FINDER_RESULTS.length, aantal)).map((l) => {
        const co = offsetLatLng(ctr.lat, ctr.lng, l.d, l.b)
        return { ...l, lat: co.lat, lng: co.lng, accent: pinAccent(l.type), _loading: true }
      })
      setLeads(found); setPhase("results")
      // simuleer e-mail-verrijking per lead
      found.forEach((l, i) => setTimeout(() => {
        setLeads((prev) => prev.map((p) => p.id === l.id ? { ...p, _loading: false } : p))
        if (i === found.length - 1) setEnriching(false)
      }, 500 + i * 350))
    }, 900)
  }
  const toggleType = (t) => setTypes((cur) => cur.includes(t) ? cur.filter((x) => x !== t) : [...cur, t])
  const approve = (l) => {
    if (!l.email) { toast("Vul eerst een e-mail in", { icon: "close", kind: "muted" }); return }
    setState("finder.approved", [{ ...l, status: "pending" }, ...approved.filter((a) => a.id !== l.id)])
    setLeads((prev) => prev.filter((p) => p.id !== l.id))
    setSelected((s) => s === l.id ? null : s)
    toast(l.bedrijf + " goedgekeurd", { icon: "check" })
  }
  const processAll = () => {
    approved.forEach((l) => {
      const cust = { id: "fl" + l.id, name: l.bedrijf, contact: "–", city: "Amsterdam", x: 44 + (l.id % 5), y: 39 + (l.id % 4), sector: "Horeca", status: "prospect", monthly: 0, since: null, idle: 0, employees: "–", email: l.email, phone: l.tel, iris: "Nieuwe lead uit Finder. Eerste contactmail klaargezet door Hugo.", deals: 1 }
      setState("sales.customers", [cust, ...store.get("sales.customers", []).filter((c) => c.id !== cust.id)])
      setState("pipe.deals", [{ id: "fd" + l.id, cust: cust.id, value: 0, stage: "nieuw", days: 0, owner: "Hugo", note: "Lead uit Finder, eerste mail klaar." }, ...store.get("pipe.deals", []).filter((d) => d.id !== "fd" + l.id)])
    })
    toast(approved.length + " leads in de pipeline gezet + concepten klaar · Hugo", { agent: "hugo" })
    setState("finder.approved", [])
  }

  return (
    <div className="module-page sales-suite" key="finder">
      <header className="sx-hero">
        <div className="sx-hero-logo" style={{ "--acc": "var(--a-red)", "--acc-soft": "var(--a-red-soft)" }}>
          <span className="sx-hero-mark" dangerouslySetInnerHTML={{ __html: ICONS("search", { sw: 1.8 }) }} style={{ color: "var(--a-red)" }} />
        </div>
        <div className="sx-hero-id"><h1 className="sx-hero-h1">Leadfinder</h1><p className="sx-hero-sub mono">Vind nieuwe klanten in de buurt, Kai scrapet bedrijven, vindt e-mails en checkt je CRM</p></div>
      </header>

      {winBack.length > 0 && (
        <div className="fn-winback">
          <span className="fn-wb-ic" style={{ color: AC("orange"), background: ACsoft("orange") }} dangerouslySetInnerHTML={{ __html: ICONS("refresh") }} />
          <div className="fn-wb-main"><b>Eerst je eigen klanten?</b> {winBack.length} oud-klant{winBack.length === 1 ? "" : "en"} ({winBack.map((c) => c.name).join(", ")}) {winBack.length === 1 ? "is" : "zijn"} een win-back waard, vaak makkelijker dan koud werven.</div>
          <Btn kind="soft" accent="orange" size="sm" onClick={() => onOpen("crm")}>Naar CRM</Btn>
        </div>
      )}

      <Panel wid="Zoeken" eyebrow="Stap 1 · branche & locatie" title="Waar zoek je naar?" accent="red">
        <div className="fn-modes">
          <button type="button" role="tab" aria-selected={mode === "branche"} className={"fn-mode" + (mode === "branche" ? " on" : "")} onClick={() => setMode("branche")}>
            <b>Branche + locatie</b><span className="mono">Kies branches uit de lijst en een gebied</span>
          </button>
          <button type="button" role="tab" aria-selected={mode === "ref"} className={"fn-mode" + (mode === "ref" ? " on" : "")} onClick={() => setMode("ref")}>
            <b>Referentiebedrijf</b><span className="mono">Kai leidt branches af uit een voorbeeld</span>
          </button>
        </div>

        {mode === "ref" && (<>
          <div className="fn-row">
            <label className="field" style={{ flex: 1 }}><span className="field-lbl">Bedrijf + plaats (lijkt op je ideale klant)</span>
              <input className="fn-input" value={ref} onChange={(e) => setRef(e.target.value)} placeholder="bv. Hotel Okura, Amsterdam" onKeyDown={(e) => { if (e.key === "Enter") detect() }} />
            </label>
            <Btn kind="solid" accent="red" icon="search" onClick={detect}>{phase === "detecting" ? "Analyseren…" : "Opzoeken"}</Btn>
          </div>
          {phase === "detecting" && <div className="fn-loading mono"><span className="fn-spin" />Kai analyseert het bedrijf…</div>}
          {refCo && phase !== "detecting" && (
            <div className="fn-refco"><span className="fn-refco-dot" style={{ background: AC("aqua") }} /><div><div className="fn-refco-name">{refCo.naam}</div><div className="fn-refco-adres mono">{refCo.adres} · {refCo.type} · Kai stelde {types.length} branches voor</div></div></div>
          )}
        </>)}

        {showPicker && (
          <div className="fn-picker">
            <div className="fn-types-lbl mono">{mode === "ref" ? "Voorgestelde branches — pas aan of voeg toe:" : "Kies één of meer branches:"}</div>
            {types.length > 0 && (
              <div className="fn-chips">
                {types.map((k) => (
                  <span className="fn-chip" key={k}>
                    <span className="fn-chip-lbl">{placeLabel(k)}</span>
                    <code className="fn-chip-key mono">{k}</code>
                    <button type="button" className="fn-chip-x" aria-label={"Verwijder " + placeLabel(k)} onClick={() => toggleType(k)}>×</button>
                  </span>
                ))}
                <button type="button" className="fn-chip-clear" onClick={() => setTypes([])}>Wis alles</button>
              </div>
            )}
            <div className="fn-search-wrap">
              <span className="fn-search-ic" dangerouslySetInnerHTML={{ __html: ICONS("search", { sw: 2 }) }} />
              <input className="fn-search" value={query} onChange={(e) => setQuery(e.target.value)} placeholder="Zoek een branche, bv. kapper, makelaar, hotel…" />
              {query && <button type="button" className="fn-search-x" onClick={() => setQuery("")} aria-label="Wis zoekopdracht">×</button>}
            </div>
            {!query && (
              <div className="fn-groups">
                {PLACE_GROUPS.map((grp, i) => <button type="button" role="tab" aria-selected={activeGroup === i} key={grp.g} className={"fn-grp" + (activeGroup === i ? " on" : "")} onClick={() => setActiveGroup(i)}>{grp.g}</button>)}
              </div>
            )}
            <div className="fn-pick-list">
              {pickItems.map(([label, key]) => {
                const on = types.includes(key)
                return (
                  <button type="button" key={key + label} className={"fn-type" + (on ? " on" : "")} style={on ? { background: AC("aqua"), color: "#fff", borderColor: "transparent" } : null} onClick={() => toggleType(key)}>
                    <span className="fn-type-mark">{on ? "✓" : "+"}</span>{label}<code className="fn-type-key mono">{key}</code>
                  </button>
                )
              })}
              {pickItems.length === 0 && <div className="fn-no-match mono">Geen branche gevonden voor “{query}”.</div>}
            </div>
          </div>
        )}

        {showPicker && (
          <div className="fn-params">
            {mode === "branche" && (
              <label className="field" style={{ flex: 1, minWidth: 150 }}><span className="field-lbl">Locatie / gebied</span>
                <input className="fn-input" value={locatie} onChange={(e) => setLocatie(e.target.value)} placeholder="bv. Amsterdam Noord" onKeyDown={(e) => { if (e.key === "Enter") search() }} />
              </label>
            )}
            <label className="field"><span className="field-lbl">Straal</span>
              <select className="fn-select" value={straal} onChange={(e) => setStraal(+e.target.value)}>{[2, 5, 10, 25, 50].map((k) => <option key={k} value={k}>{k} km</option>)}</select>
            </label>
            <label className="field"><span className="field-lbl">Aantal leads</span>
              <select className="fn-select" value={aantal} onChange={(e) => setAantal(+e.target.value)}>{[6, 10, 15, 25].map((k) => <option key={k} value={k}>{k}</option>)}</select>
            </label>
            <Btn kind="solid" accent="red" icon="search" onClick={search}>{phase === "searching" ? "Zoeken…" : "Zoek leads"}</Btn>
          </div>
        )}
      </Panel>

      {phase === "searching" && <div className="fn-loading big mono"><span className="fn-spin" />Kai zoekt bedrijven binnen {straal} km en vindt contactgegevens…</div>}

      {phase === "results" && leads.length > 0 && (
        <Panel wid="Resultaten" eyebrow={"Stap 2 · " + leads.length + " gevonden" + (enriching ? " · e-mails laden…" : "")} title="Gevonden leads" accent="red" pad={false}
          right={<div className="fn-viewseg">
            {[["lijst", "Lijst"], ["kaart", "Kaart"], ["beide", "Beide"]].map(([v, l]) => <button type="button" role="tab" aria-selected={view === v} key={v} className={"fn-vbtn" + (view === v ? " on" : "")} onClick={() => setView(v)}>{l}</button>)}
          </div>}>
          <div className="fn-api-note mono">includedTypes → [{types.map((k) => '"' + k + '"').join(", ")}]{mode === "branche" && locatie.trim() ? "  ·  " + locatie.trim() + " · " + straal + " km" : ""}</div>
          <div className={"fn-results fn-view-" + view}>
            {(view === "kaart" || view === "beide") && center && (
              <FinderMap center={center} leads={leads} straal={straal} selected={selected} onSelect={setSelected} onApprove={approve} />
            )}
            {(view === "lijst" || view === "beide") && (
              <div className="fn-table">
                <div className="fn-th"><span>Bedrijf</span><span>E-mail</span><span>Bron</span><span>Score</span><span></span></div>
                {leads.map((l) => { const b = BRON_BADGE[l.bron] || BRON_BADGE.notfound; const mb = l.match && MATCH_BADGE[l.match]; return (
                  <div className={"fn-tr" + (selected === l.id ? " sel" : "")} key={l.id} onClick={() => setSelected(selected === l.id ? null : l.id)}>
                    <div className="fn-co"><span className="fn-co-dot" style={{ background: AC(l.accent || pinAccent(l.type)) }} /><div><div className="fn-co-name">{l.bedrijf}</div><div className="fn-co-adr mono">{placeLabel(l.type)} · {l.adres}</div></div></div>
                    <div>{l._loading ? <span className="fn-mini-spin" /> : <input className="fn-email" defaultValue={l.email} placeholder="e-mail toevoegen…" onClick={(e) => e.stopPropagation()} onChange={(e) => setLeads((prev) => prev.map((p) => p.id === l.id ? { ...p, email: e.target.value } : p))} />}</div>
                    <div>{l._loading ? <span className="fn-badge" style={{ color: AC("navy"), background: ACsoft("navy") }}>…</span> : <span className="fn-badge" style={{ color: AC(b.a), background: ACsoft(b.a) }}>{b.l}</span>}</div>
                    <div><span className="fn-score" style={{ color: AC(l.score >= 85 ? "green" : l.score >= 78 ? "gold" : "navy") }}>{l.score}</span></div>
                    <div className="fn-tr-act">
                      {mb && <span className="fn-badge" style={{ color: AC(mb.a), background: ACsoft(mb.a) }}>{mb.l}</span>}
                      <Btn kind="soft" accent="green" size="sm" onClick={(e) => { if (e && e.stopPropagation) e.stopPropagation(); approve(l) }}>Goedkeuren</Btn>
                    </div>
                  </div>
                ) })}
              </div>
            )}
          </div>
        </Panel>
      )}

      <Panel wid="Goedgekeurd" eyebrow={"Stap 3 · " + approved.length + " klaar"} title="Goedgekeurde leads" accent="green"
        right={approved.length > 0 ? <Btn kind="solid" accent="green" icon="send" size="sm" onClick={processAll}>Naar pipeline + concepten</Btn> : null}>
        {approved.length === 0 ? (
          <div className="fn-empty"><span className="fn-empty-ic" dangerouslySetInnerHTML={{ __html: ICONS("check", { sw: 1.8 }) }} /><div><b>Nog niets goedgekeurd</b><span className="mono">Keur leads goed in de resultaten hierboven.</span></div></div>
        ) : (
          <div className="fn-approved">
            {approved.map((l) => (
              <div className="fn-app-row" key={l.id}>
                <span className="fn-app-dot" style={{ background: AC("green") }} />
                <div className="fn-app-main"><b>{l.bedrijf}</b><span className="mono">{l.email} · {l.tel}</span></div>
                <span className="fn-badge" style={{ color: AC("gold"), background: ACsoft("gold") }}>klaar voor concept</span>
                <ObjectActions only={["assign"]} className="oa-compact" obj={{ key: "flead:" + l.id, title: l.bedrijf, name: l.bedrijf, accent: "green" }} />
              </div>
            ))}
          </div>
        )}
      </Panel>
    </div>
  )
}
