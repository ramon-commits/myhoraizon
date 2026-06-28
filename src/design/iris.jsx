/* ============================================================
   Iris, eigen tab met volledig chatscherm + aandachtskaarten
   (herbruikbaar in de Vandaag-/Iris-board-widgets).
   Letterlijke ESM-port van de Claude Design-blauwdruk (dashboard/iris.jsx):
   window-globals -> imports; window.irisSchedule/irisApplyEvent -> directe
   aanroepen binnen deze module; bodies 1:1.
   ============================================================ */
import React from 'react'
import { ICONS } from './icons'
import { KYANO } from './data'
import { getState, setState, toast } from './store.jsx'
import { AC, ACsoft, Avatar } from './components.jsx'
import { useSmartMenu } from './menus'
import { allCustomers } from './customers.js'

const { useState, useEffect, useRef } = React

/* Eén bron voor de tijdsbewuste groet, header, briefing en chat blijven zo gelijk */
function irisGreet() {
  const h = new Date().getHours()
  return h < 6 ? "Goedenacht" : h < 12 ? "Goedemorgen" : h < 18 ? "Goedemiddag" : "Goedenavond"
}

/* Volledige Nederlandse datum, bv. "Donderdag 19 juni" */
function irisDateLabel() {
  const d = new Date()
  const days = ["zondag", "maandag", "dinsdag", "woensdag", "donderdag", "vrijdag", "zaterdag"]
  const months = ["januari", "februari", "maart", "april", "mei", "juni", "juli", "augustus", "september", "oktober", "november", "december"]
  return days[d.getDay()].charAt(0).toUpperCase() + days[d.getDay()].slice(1) + " " + d.getDate() + " " + months[d.getMonth()]
}

function useIrisCards() {
  const [cards, setCards] = useState(KYANO.irisCards)
  const [done, setDone] = useState({})
  const resolve = (i, label) => {
    setDone((d) => ({ ...d, [i]: label }))
    setTimeout(() => setCards((cs) => cs.filter((_, idx) => idx !== i)), 1400)
  }
  return { cards, done, resolve }
}

/* Snooze-opties, gelijk aan inbox & communicatie-hub */
const SNOOZE_OPTS = [
  { id: "tomorrow", label: "Morgenochtend", sub: "09:00", icon: "calendar" },
  { id: "dayafter", label: "Overmorgen", sub: "09:00", icon: "calendar" },
  { id: "3days", label: "Over 3 dagen", sub: "09:00", icon: "calendar" },
  { id: "nextweek", label: "Volgende week", sub: "maandag 09:00", icon: "calendar" },
  { id: "nextmonth", label: "Volgende maand", sub: "+30 dagen", icon: "clock" },
]
function SnoozeMenu({ onPick }) {
  const smRef = useSmartMenu({ align: "start", margin: 12 })
  return (
    <div className="snooze-menu" ref={smRef} onClick={(e) => e.stopPropagation()} onPointerDown={(e) => e.stopPropagation()}>
      <div className="snooze-head mono">Stel uit tot…</div>
      {SNOOZE_OPTS.map((o) => (
        <button key={o.id} className="snooze-item" onClick={() => onPick(o)}>
          <span className="snooze-ic" dangerouslySetInnerHTML={{ __html: ICONS(o.icon, { sw: 2 }) }} />
          <span className="snooze-lbl">{o.label}</span>
          <span className="snooze-sub mono">{o.sub}</span>
        </button>
      ))}
    </div>
  )
}

/* Lijst met aandachtskaarten, gebruikt in Iris-tab én Vandaag-widget */
function IrisAttention() {
  const { cards, done, resolve } = useIrisCards()
  const [snoozeOpen, setSnoozeOpen] = useState(-1)
  useEffect(() => {
    if (snoozeOpen < 0) return
    const close = () => setSnoozeOpen(-1)
    window.addEventListener("pointerdown", close)
    return () => window.removeEventListener("pointerdown", close)
  }, [snoozeOpen])
  const HUB = { postvak: "Inbox", agenda: "Agenda", vandaag: "Vandaag", iris: "Iris" }
  // Sneltoets: handelt de taak direct af (bevestiging + toast), zonder weg te navigeren
  const doAction = (c, i) => {
    if (c.did) { resolve(i, c.did); toast(c.did, { agent: /^[a-z]/.test(c.from) ? undefined : c.from.toLowerCase(), icon: c.icon || "check" }) }
  }
  // Bekijk: opent de module zelf om te bekijken en bewerken
  const viewModule = (c) => { const dest = c.module || c.target; if (dest) location.hash = "#/" + dest }
  if (cards.length === 0) {
    return (
      <div className="iris-empty">
        <span className="iris-check" dangerouslySetInnerHTML={{ __html: ICONS("check", { sw: 2.2 }) }} />
        Alles afgehandeld. Mooi werk, {KYANO.client.person}.
      </div>
    )
  }
  return (
    <div className="iris-cards">
      {cards.map((c, i) => (
        <div className={"iris-card" + (done[i] ? " resolved" : "")} key={i} style={{ "--acc": AC(c.accent) }}>
          {done[i] ? (
            <div className="iris-done"><span dangerouslySetInnerHTML={{ __html: ICONS(/sluimer|komt terug/i.test(done[i]) ? "clock" : "check", { sw: 2.2 }) }} />{done[i]}</div>
          ) : (<>
            <div className="iris-row-top">
              <span className="iris-tag" style={{ background: ACsoft(c.accent), color: AC(c.accent) }}>{c.from}</span>
              {c.ctx && <span className="iris-ctx mono">{c.ctx}</span>}
              {c.target && HUB[c.target] && <span className="iris-arrow mono"><span dangerouslySetInnerHTML={{ __html: ICONS("arrow", { sw: 2 }) }} />{HUB[c.target]}</span>}
            </div>
            <p className="iris-text">{c.text}</p>
            <div className="iris-actions">
              <button className="iris-btn primary" style={{ background: AC("teal") }} onClick={() => doAction(c, i)}>
                <span className="iris-btn-ic" dangerouslySetInnerHTML={{ __html: ICONS(c.icon || "arrow", { sw: 2.2 }) }} />{c.cta || "Handel af"}
              </button>
              <button className="iris-btn ghost" onClick={() => viewModule(c)} title={"Open de module om te bekijken en bewerken"}>
                <span className="iris-btn-ic" dangerouslySetInnerHTML={{ __html: ICONS("docpen", { sw: 2 }) }} />Bekijk
              </button>
              <div className="iris-later-wrap">
                <button className="iris-btn ghost" onClick={(e) => { e.stopPropagation(); setSnoozeOpen(snoozeOpen === i ? -1 : i) }}>
                  <span className="iris-btn-ic" dangerouslySetInnerHTML={{ __html: ICONS("clock", { sw: 2 }) }} />Later
                </button>
                {snoozeOpen === i && (
                  <SnoozeMenu onPick={(o) => { setSnoozeOpen(-1); resolve(i, "Komt terug " + o.label.toLowerCase()); toast("Komt terug " + o.label.toLowerCase(), { icon: "clock", kind: "muted" }) }} />
                )}
              </div>
            </div>
          </>)}
        </div>
      ))}
    </div>
  )
}

/* ============================================================
   Iris-agenda-brein — NL-parsing, conflictcheck & inplannen.
   Leest/schrijft agenda.events via de store.
   ============================================================ */
const IRIS_DOW = { zondag: 0, maandag: 1, dinsdag: 2, woensdag: 3, donderdag: 4, vrijdag: 5, zaterdag: 6 }
const IRIS_DLONG = ["zondag", "maandag", "dinsdag", "woensdag", "donderdag", "vrijdag", "zaterdag"]
const IRIS_MSHORT = ["jan", "feb", "mrt", "apr", "mei", "jun", "jul", "aug", "sep", "okt", "nov", "dec"]
function irisAgendaNow() { return new Date(2026, 5, 17, 10, 30) }
function irisPad2(n) { return String(n).padStart(2, "0") }
function irisYmd(d) { return d.getFullYear() + "-" + irisPad2(d.getMonth() + 1) + "-" + irisPad2(d.getDate()) }
function irisAddD(d, n) { const x = new Date(d); x.setDate(x.getDate() + n); return x }
function irisToMin(t) { const p = String(t || "0:0").split(":"); return (+p[0]) * 60 + (+(p[1] || 0)) }
function irisFmtMin(m) { return irisPad2(Math.floor(m / 60)) + ":" + irisPad2(m % 60) }
function irisDayLabel(ymd) { const [y, mo, d] = ymd.split("-").map(Number); const dt = new Date(y, mo - 1, d); return IRIS_DLONG[dt.getDay()] + " " + d + " " + IRIS_MSHORT[mo - 1] }

function irisGuessTitle(text) {
  let m = text.match(/\b(demo|pitch|presentatie|kennismaking|bespreking|bezichtiging|borrel|lunch|diner|call|meeting|kennismakingsgesprek)\b[^,.?!]*/i)
  if (m) { const t = m[0].trim().replace(/\s+/g, " "); return t.charAt(0).toUpperCase() + t.slice(1) }
  m = text.match(/\b(?:bij|met|voor)\s+([A-ZÀ-Ÿ][\wÀ-ÿ'&.-]+(?:\s+[A-ZÀ-Ÿ][\wÀ-ÿ'&.-]+)?)/)
  if (m) return "Afspraak met " + m[1]
  return "Nieuwe afspraak"
}
function irisMatchCust(text) {
  const s = text.toLowerCase()
  const STOP = new Set(["hotel", "restaurant", "bar", "events", "group", "amsterdam", "rotterdam", "utrecht", "haarlem", "teamuitje", "brouwerij", "club"])
  const list = allCustomers ? allCustomers({ get: (k, d) => getState(k, d) }) : []
  let best = null, bestLen = 0
  list.forEach((c) => {
    (c.name || "").toLowerCase().split(/[^a-zà-ÿ0-9]+/).forEach((w) => {
      if (w.length >= 4 && !STOP.has(w) && s.includes(w) && w.length > bestLen) { best = c; bestLen = w.length }
    })
  })
  return best
}
/* haalt dag + tijd + titel uit een vrije zin; null = geen inplan-verzoek */
function irisParseSchedule(text) {
  const s = text.toLowerCase()
  const wantsPlan = /(plan|inplan|zet|boek|prik|reserveer|afspraak|kan ik|zou ik|wil ik|naar (het|dat|de)|moet ik|maak)/.test(s)
  let mins = null, m
  if ((m = s.match(/\b([01]?\d|2[0-3])[:.u]([0-5]\d)\b/))) mins = (+m[1]) * 60 + (+m[2])
  else if ((m = s.match(/\bom\s+([01]?\d|2[0-3])(?:\s*uur)?\b/))) mins = (+m[1]) * 60
  else if ((m = s.match(/\b([01]?\d|2[0-3])\s*uur\b/))) mins = (+m[1]) * 60
  const now = irisAgendaNow()
  let date = null
  if (/overmorgen/.test(s)) date = irisAddD(now, 2)
  else if (/morgen/.test(s)) date = irisAddD(now, 1)
  else if (/vandaag/.test(s)) date = new Date(now)
  else {
    for (const name in IRIS_DOW) {
      if (s.includes(name)) {
        let delta = (IRIS_DOW[name] - now.getDay() + 7) % 7
        if (delta === 0) delta = 7
        if (/volgende week/.test(s)) delta += 7
        date = irisAddD(now, delta)
        break
      }
    }
  }
  if (!date && mins == null) return null
  if (!wantsPlan && mins == null) return null
  return { date: date ? irisYmd(date) : null, mins, title: irisGuessTitle(text) }
}
function irisFindConflict(ymd, startMin, durMin) {
  const evs = getState("agenda.events", [])
  const end = startMin + durMin
  return evs.find((e) => e.date === ymd && !e.allDay && e.start && irisToMin(e.start) < end && irisToMin(e.end || e.start) > startMin) || null
}
function irisFreeSlot(ymd, durMin, fromMin) {
  for (let t = Math.max(fromMin, 8 * 60); t + durMin <= 18 * 60; t += 30) {
    if (!irisFindConflict(ymd, t, durMin)) return t
  }
  return null
}
function irisBuildEvent(ymd, startMin, durMin, title, cust) {
  return {
    id: "e" + Date.now() + Math.floor(Math.random() * 99), cal: "iris", title,
    date: ymd, start: irisFmtMin(startMin), end: irisFmtMin(startMin + durMin),
    allDay: false, location: "", notes: "Ingepland door Iris.", guests: [], video: "",
    repeat: "none", reminder: "15", custId: cust ? cust.id : null, custName: cust ? cust.name : null, assignee: null,
  }
}
/* voegt de afspraak toe aan de "iris"-kalender + logt op de klant-tijdlijn */
function irisApplyEvent(ev) {
  setState("agenda.events", [...getState("agenda.events", []), ev])
  if (ev.custId && window.logToCustomer) window.logToCustomer(ev.custId, "Iris plande een afspraak in de agenda: “" + ev.title + "” op " + irisDayLabel(ev.date) + " om " + ev.start)
  toast("Iris zette “" + ev.title + "” in je Iris-agenda", { agent: "iris", icon: "calendar" })
}
/* hoofd-handler: { text, apply?, proposal? } */
function irisSchedule(text) {
  const p = irisParseSchedule(text)
  if (!p) return null
  if (!p.date || p.mins == null) {
    return { text: "Dat plan ik graag voor je in. Noem even een dag én tijd, bijvoorbeeld “dinsdag 14:00”." }
  }
  const dur = 60
  const cust = irisMatchCust(text)
  const conflict = irisFindConflict(p.date, p.mins, dur)
  if (conflict) {
    const alt = irisFreeSlot(p.date, dur, irisToMin(conflict.end || conflict.start))
    if (alt == null) return { text: "Je hebt op " + irisDayLabel(p.date) + " om " + irisFmtMin(p.mins) + " al “" + conflict.title + "” (" + conflict.start + "–" + conflict.end + ") en die dag zit verder vol. Zal ik een andere dag pakken?" }
    const ev = irisBuildEvent(p.date, alt, dur, p.title, cust)
    return { text: "Je hebt dan al “" + conflict.title + "” staan (" + conflict.start + "–" + conflict.end + "). Om " + irisFmtMin(alt) + " ben je wel vrij — zal ik het dan zetten?", proposal: { ev, when: irisFmtMin(alt) } }
  }
  const ev = irisBuildEvent(p.date, p.mins, dur, p.title, cust)
  return { text: "Je bent vrij op " + irisDayLabel(p.date) + " om " + irisFmtMin(p.mins) + ". Ik heb “" + ev.title + "” in je Iris-agenda gezet" + (cust ? " en aan " + cust.name + " gekoppeld" : "") + ".", apply: ev }
}

function irisReply(t) {
  const s = t.toLowerCase()
  if (s.includes("belangrijk") || s.includes("vandaag")) return "Drie dingen wachten op je: Lisa de Vries wil de sloepen voor 28 juni vastleggen, de offerte voor Nieuwe Vaart staat 14 dagen stil, en factuur #2026-014 is over de vervaldatum. Zal ik bij de eerste beginnen?"
  if (s.includes("follow") || s.includes("stuur")) return "Doe ik. Hugo stuurt de follow-up naar Nieuwe Vaart en ik zet een herinnering klaar voor Hotel Okura. Je krijgt beide ter goedkeuring."
  if (s.includes("plan") || s.includes("dag") || s.includes("agenda")) return "Ik blok 09:30 voor Lisa terugbellen, 11:00 voor de offertes en hou je middag vrij. Akkoord?"
  if (s.includes("offerte")) return "De offerte voor Nieuwe Vaart Events (€ 4.400) ligt klaar als concept. Wil je dat ik 'm verstuur of eerst zelf laat nakijken?"
  if (s.includes("factuur") || s.includes("betaal")) return "Factuur #2026-014 van Hotel Okura (€ 603,79) is 5 dagen over de vervaldatum. Ik kan een vriendelijke herinnering sturen, zal ik?"
  return "Genoteerd, Ramon. Ik kom hier vandaag nog op terug."
}

/* Het chatgesprek met Iris (vult de hoogte van z'n container) */
function IrisChat({ showActions, autoFocus = true }) {
  const [msgs, setMsgs] = useState(() =>
    (KYANO.irisChat || []).map((m) =>
      m.opener ? { ...m, text: irisGreet() + " " + KYANO.client.person + ". " + m.text } : m
    )
  )
  const [val, setVal] = useState("")
  const [typing, setTyping] = useState(false)
  const bodyRef = useRef(null)

  useEffect(() => {
    if (bodyRef.current) bodyRef.current.scrollTop = bodyRef.current.scrollHeight
  }, [msgs, typing])

  const send = (text) => {
    const t = (text || val).trim()
    if (!t) return
    setMsgs((m) => [...m, { who: "me", text: t }])
    setVal("")
    setTyping(true)
    setTimeout(() => {
      setTyping(false)
      const sched = irisSchedule(t)
      if (sched) {
        if (sched.apply) irisApplyEvent(sched.apply)
        setMsgs((m) => [...m, { who: "iris", text: sched.text, proposal: sched.proposal || null }])
      } else {
        setMsgs((m) => [...m, { who: "iris", text: irisReply(t) }])
      }
    }, 850)
  }

  const quick = ["Wat is belangrijk vandaag?", "Stuur de follow-ups", "Plan mijn dag", "Hoe staat de offerte erbij?"]
  const fresh = !showActions && msgs.length <= 1 && !typing

  return (
    <div className="ichat">
      <div className="ichat-body" ref={bodyRef}>
        {showActions && (
          <div className="ichat-actions">
            <div className="ichat-actions-h mono"><span dangerouslySetInnerHTML={{ __html: ICONS("spark", { sw: 1.8 }) }} />Handel direct af</div>
            <IrisAttention />
          </div>
        )}
        {msgs.map((m, i) => (
          <div key={i} className={"bubble " + (m.who === "me" ? "me" : "iris")}>
            {m.who === "iris" && <Avatar agent="iris" size={28} />}
            <span className="bubble-txt">{m.text}
              {m.who === "iris" && m.proposal && !m.proposalDone && (
                <button className="bubble-confirm" onClick={() => {
                  irisApplyEvent(m.proposal.ev)
                  setMsgs((ms) => ms.map((x, xi) => xi === i ? { ...x, proposalDone: true } : x).concat([{ who: "iris", text: "Genoteerd — ik heb het om " + m.proposal.when + " in je Iris-agenda gezet." }]))
                }}>
                  <span dangerouslySetInnerHTML={{ __html: ICONS("calendar", { sw: 2 }) }} />Ja, zet om {m.proposal.when}
                </button>
              )}
              {m.who === "iris" && m.proposalDone && <span className="bubble-confirmed mono"><span dangerouslySetInnerHTML={{ __html: ICONS("check", { sw: 2.4 }) }} />Ingepland</span>}
            </span>
          </div>
        ))}
        {typing && (
          <div className="bubble iris">
            <Avatar agent="iris" size={28} />
            <span className="bubble-txt typing"><i></i><i></i><i></i></span>
          </div>
        )}
        {fresh && (
          <div className="ichat-suggest">
            <div className="ichat-suggest-h mono">Of begin hiermee</div>
            <div className="ichat-suggest-grid">
              {quick.map((q) => (
                <button key={q} className="ichat-suggest-card" onClick={() => send(q)}>
                  <span className="ichat-suggest-ic" dangerouslySetInnerHTML={{ __html: ICONS("spark", { sw: 1.8 }) }} />
                  <span>{q}</span>
                  <span className="ichat-suggest-go" dangerouslySetInnerHTML={{ __html: ICONS("arrow", { sw: 2 }) }} />
                </button>
              ))}
            </div>
          </div>
        )}
      </div>
      <div className="ichat-quick">
        {quick.map((q) => <button key={q} className="quick-chip" onClick={() => send(q)}>{q}</button>)}
      </div>
      <div className="ichat-input">
        <input value={val} placeholder="Vraag of vertel Iris iets…" onChange={(e) => setVal(e.target.value)}
          onKeyDown={(e) => e.key === "Enter" && send()} autoFocus={autoFocus} />
        <button className="send-btn" aria-label="Verstuur" title="Verstuur" disabled={!val.trim()} onClick={() => send()}><span dangerouslySetInnerHTML={{ __html: ICONS("send", { sw: 1.8 }) }} /></button>
      </div>
    </div>
  )
}

/* ===== Iris ochtendbriefing (widget) ===== */
function IrisBriefing({ size, onOpen }) {
  const nav = (v) => { if (!v) return; if (onOpen) onOpen(v); else location.hash = "#/" + v }
  const list = KYANO.irisBriefing || []
  const [idx, setIdx] = useState(0)
  const [loading, setLoading] = useState(false)
  const b = list[idx % (list.length || 1)] || { lede: "", meta: [] }
  const refresh = () => {
    if (loading) return
    setLoading(true)
    setTimeout(() => { setIdx((i) => i + 1); setLoading(false); toast("Nieuwe briefing van Iris", { agent: "iris" }) }, 950)
  }
  return (
    <div className="irisbrief">
      <div className="irisbrief-top">
        <Avatar agent="iris" size={36} ring />
        <div className="irisbrief-greet">
          <b>{irisDateLabel()}</b>
          <span className="mono">Iris-briefing · zojuist bijgewerkt</span>
        </div>
        <button className="irisbrief-refresh" onClick={refresh} disabled={loading}>
          <span className={"irisbrief-refresh-ic" + (loading ? " spin" : "")} dangerouslySetInnerHTML={{ __html: ICONS("refresh", { sw: 2 }) }} />
          {loading ? "Iris denkt…" : "Vernieuw"}
        </button>
      </div>
      <p className={"irisbrief-content" + (loading ? " dim" : "")}>{b.lede}</p>
      <div className={"irisbrief-meta" + (loading ? " dim" : "")}>
        {(b.meta || []).map((m, i) => (
          m.to ? (
            <button className="irisbrief-stat is-link" key={i} onClick={() => nav(m.to)} title={"Open " + m.l}>
              <span className="irisbrief-stat-v">{m.v}</span>
              <span className="irisbrief-stat-l mono">{m.l}</span>
              <span className="irisbrief-stat-go" dangerouslySetInnerHTML={{ __html: ICONS("arrow", { sw: 2 }) }} />
            </button>
          ) : (
            <div className="irisbrief-stat" key={i}>
              <span className="irisbrief-stat-v">{m.v}</span>
              <span className="irisbrief-stat-l mono">{m.l}</span>
            </div>
          )
        ))}
      </div>
    </div>
  )
}

/* ===== Rode vlaggen (widget) ===== */
const FLAG_URG = { critical: "red", high: "orange", medium: "gold", low: "navy" }
function IrisFlags({ size }) {
  const flags = KYANO.irisFlags || []
  const big = size === "large"
  const n = size === "small" ? 2 : big ? flags.length : 3
  const go = (t) => { if (t) location.hash = "#/" + t }
  if (!flags.length) {
    return (
      <div className="iris-empty">
        <span className="iris-check" dangerouslySetInnerHTML={{ __html: ICONS("check", { sw: 2.2 }) }} />
        Geen rode vlaggen, alles loopt op rolletjes.
      </div>
    )
  }
  return (
    <div className="iris-flags">
      {flags.slice(0, n).map((f, i) => {
        const ac = FLAG_URG[f.urg] || "navy"
        return (
          <button className="iris-flag" key={i} onClick={() => go(f.target)} style={{ "--acc": AC(ac) }}>
            <span className="iris-flag-ic" style={{ color: AC(ac), background: ACsoft(ac) }}>
              <span dangerouslySetInnerHTML={{ __html: ICONS(f.icon, { sw: 1.9 }) }} />
            </span>
            <div className="iris-flag-main">
              <div className="iris-flag-title">{f.title}</div>
              <div className="iris-flag-meta">
                <span className="iris-flag-who">{f.who}</span>
                <span className="iris-flag-v mono">{f.v}</span>
                <span className="iris-flag-when mono">{f.when}</span>
              </div>
            </div>
            <span className="iris-flag-go" dangerouslySetInnerHTML={{ __html: ICONS("arrow", { sw: 2 }) }} />
          </button>
        )
      })}
    </div>
  )
}

/* ===== Iris-board hero ===== */
function IrisBoardHeader() {
  const greet = irisGreet()
  return (
    <header className="iris-board-head">
      <Avatar agent="iris" size={54} ring />
      <div className="iris-board-id">
        <h1 className="greet-h1">{greet}, <em>{KYANO.client.person}</em></h1>
        <p className="iris-board-sub">Iris, je AI-directiesecretaresse. Ze houdt je agents op koers en jou op de hoogte.</p>
      </div>
    </header>
  )
}

export { IrisAttention, IrisChat, IrisBriefing, IrisFlags, IrisBoardHeader, SnoozeMenu, SNOOZE_OPTS }
