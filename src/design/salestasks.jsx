/* ============================================================
   salestasks.jsx, Pipeline als slimme "Vandaag"-takenlijst + het
   Pipeline-paginakader met tabs (Vandaag / Bord). ESM-port van de
   Claude Design-blauwdruk (dashboard/salestasks.jsx). Alleen het
   pipeline-deel: SalesPipelinePage, SaleskansenWidget, PipelineTakenWidget
   (+ hun kaarten). Relatiebeheer-signalen vallen buiten deze board-steen.
   Aanpassingen t.o.v. de bron: window-globals -> imports; de losse
   ClientCard-modal -> de gedeelde openKlantCard / LeadPreviewModal.
   ============================================================ */
import React from 'react'
import { ICONS } from './icons'
import { KYANO } from './data'
import { useStore, setState, toast, confirmAsk, Modal } from './store.jsx'
import { AC, ACsoft, Avatar, Btn } from './components.jsx'
import { allCustomers } from './customers.js'
import { SALES_PIPELINE, dealStage, stageByKey, stageTarget, daysSinceContact, custIdleMonths, eur, addCustLog, SalesPipeline, NewDealModal, PipelineFlowEditor, custAttention, custIdleLabel, riskValue, StatusDot } from './sales.jsx'
import { ObjectActions, openKlantCard } from './objectactions.jsx'
import { SnoozeMenu } from './iris.jsx'
import { useSmartMenu } from './menus'

const { useState, useMemo, useEffect } = React

/* ---------- inkomende saleskansen (wachten op goedkeuring) ---------- */
const INCOMING_LEADS = [
  { id: "il_dakhuis", name: "Het Dakhuis", contact: "Noor Vermeer", city: "Amsterdam", source: "Leadfinder", from: "Hugo", agent: "hugo", value: 2200, score: 90, sector: "Hospitality",
    why: "Rooftop-locatie aan het IJ, organiseert maandelijks events. Sterke match op locatie en doelgroep, sloep-arrangement past perfect." },
  { id: "il_canvas", name: "Canvas op de 7e", contact: "Bram de Leeuw", city: "Amsterdam", source: "Leadfinder", from: "Hugo", agent: "hugo", value: 1800, score: 86, sector: "Horeca",
    why: "Populaire dakbar met veel zakelijke borrels. Warme match; vergelijkbaar profiel als The Hoxton." },
  { id: "il_devries", name: "Lisa de Vries, teamuitje", contact: "Lisa de Vries", city: "Amsterdam", source: "Contactformulier", from: "Website", agent: "iris", value: 1400, score: 78, sector: "Zakelijk",
    why: "Vroeg via het contactformulier een offerte voor een teamuitje (20 personen) in juli. Reageert het snelst nu." },
  { id: "il_harbor", name: "Harbor Club Oost", contact: "Sander Bos", city: "Amsterdam", source: "Win-back · Scraper", from: "Iris", agent: "iris", value: 0, score: 70, sector: "Hospitality",
    why: "Was klant in 2023, 9 maanden stil. Scraper ziet een nieuwe events-pagina, waarschijnlijk weer budget." },
]
function incomingLeads(store) {
  return INCOMING_LEADS.filter((l) => !store.get("pipe.lead.done." + l.id, 0))
}

/* ---------- taak-generatie: PIPELINE (acquisitie) ---------- */
function pipelineTasks(store) {
  const custs = allCustomers(store)
  const by = (id) => custs.find((c) => c.id === id)
  const userDeals = store.get("pipe.deals", [])
  const deals = [...userDeals, ...SALES_PIPELINE]
    .map((d) => ({ ...d, stage: dealStage(store, d), days: store.get("pipe.days." + d.id, d.days) }))
    .filter((d) => d.stage !== "gewonnen")
  const out = []

  deals.forEach((d) => {
    const c = by(d.cust); if (!c) return
    const st = stageByKey(store, d.stage)
    const target = stageTarget(store, d.stage)
    const since = daysSinceContact(store, c)
    if (!(since > target)) return
    const sinceTxt = since >= 9000 ? "nog geen contact gelogd" : ("laatste contact " + since + (since === 1 ? " dag" : " dagen") + " geleden")
    if (d.stage === "nieuw") {
      out.push({ id: "pt_" + d.id, cust: c.id, from: "Hugo", agent: "hugo", icon: "send", accent: "navy", urgent: false,
        title: "Eerste contact · " + c.name, why: (d.note || "Verse lead.") + " " + sinceTxt + ". " + (c.iris || ""),
        cta: "Openingsmail klaarzetten", did: "Openingsmail klaargezet voor " + c.name, logType: "mail" })
    } else if (d.stage === "offerte") {
      out.push({ id: "pt_" + d.id, cust: c.id, from: "Hugo", agent: "hugo", icon: "doc", accent: "gold", urgent: true,
        title: "Offerte opvolgen · " + c.name, why: eur(d.value) + " verstuurd, " + sinceTxt + ", langer dan de wachttijd (" + target + " dgn). Een korte check verhoogt de kans op akkoord.",
        cta: "Reminder sturen", did: "Reminder klaargezet voor " + c.name, logType: "mail" })
    } else {
      out.push({ id: "pt_" + d.id, cust: c.id, from: "Hugo", agent: "hugo", icon: "bell", accent: "orange", urgent: true,
        title: "Loopt vast · " + c.name, why: sinceTxt + " in “" + st.label + "” (" + eur(d.value) + "), langer dan de wachttijd van " + target + " dgn. " + (c.iris || ""),
        cta: "Bel nu", did: "Belactie genoteerd voor " + c.name, logType: "call" })
    }
  })

  custs.filter((c) => c.status === "win-back").forEach((c) => {
    out.push({ id: "pt_wb_" + c.id, cust: c.id, from: "Scraper", agent: "iris", icon: "refresh", accent: "red", urgent: false,
      title: "Win-back kans · " + c.name, why: (c.churn ? c.churn + ". " : "") + custIdleMonths(store, c) + " maanden stil. " + (c.iris || ""),
      cta: "Win-back mail klaarzetten", did: "Win-back mail klaargezet voor " + c.name, logType: "mail" })
  })

  return out
}

/* één saleskans als tk-task-kaart */
function ApprovalLeadCard({ l, approve, dismiss, onCard }) {
  const [open, setOpen] = useState(false)
  return (
    <div className={"tk-task" + (open ? " open" : "")}>
      <div className="tk-task-row" onClick={() => setOpen((v) => !v)}>
        <Avatar name={l.name} size={34} />
        <div className="tk-task-mid">
          <div className="tk-task-title">{l.name}</div>
          <div className="tk-task-meta">
            <span className="tk-task-mod" style={{ color: AC("red"), background: ACsoft("red") }}>
              <span dangerouslySetInnerHTML={{ __html: ICONS("spark", { sw: 2 }) }} />Kans · {l.score}
            </span>
            <span className="tk-task-by">via <b>{l.from}</b> · {l.source}{l.value > 0 ? " · " + eur(l.value) : ""}</span>
          </div>
        </div>
        <button className="tk-task-view" onClick={(e) => { e.stopPropagation(); setOpen((v) => !v) }}>
          {open ? "Sluiten" : "Bekijk"}
          <span className="tk-task-chev" dangerouslySetInnerHTML={{ __html: ICONS("chevron", { sw: 2.2 }) }} />
        </button>
      </div>
      {open && (
        <div className="tk-task-body">
          <div className="tk-task-why">
            <span className="tk-why-k mono">Waarom deze kans</span>
            <p className="tk-why-t">{l.why}</p>
          </div>
          <div className="tk-actions">
            <button className="tk-act prim" style={{ background: AC("green") }} onClick={() => approve(l)}>
              <span dangerouslySetInnerHTML={{ __html: ICONS("check", { sw: 2.2 }) }} />In de pijplijn
            </button>
            <button className="tk-act" onClick={() => onCard && onCard(l)}>
              <span dangerouslySetInnerHTML={{ __html: ICONS("eye", { sw: 1.9 }) }} />Bekijk
            </button>
            <button className="tk-act" onClick={() => dismiss(l)}>
              <span dangerouslySetInnerHTML={{ __html: ICONS("close", { sw: 2 }) }} />Afwijzen
            </button>
            <ObjectActions only={["assign"]} obj={{ key: "lead:" + l.id, title: l.name, name: l.name, accent: "red" }} />
          </div>
        </div>
      )}
    </div>
  )
}

/* gedeelde slimme taakkaart (tk-task-widget) */
function SalesTaskCard({ t, done, onResolve, onCard, onOpen }) {
  const [open, setOpen] = useState(false)
  const [snooze, setSnooze] = useState(false)
  if (done) {
    return (
      <div className="st-card resolved">
        <span className="st-done-ic" dangerouslySetInnerHTML={{ __html: ICONS(/terug/i.test(done) ? "clock" : "check", { sw: 2.2 }) }} />
        <span className="st-done-txt">{done}</span>
        <button className="st-undo" onClick={() => onResolve(t.id, null)}>Terug</button>
      </div>
    )
  }
  const ag = t.agent && KYANO.agents[t.agent]
  return (
    <div className={"tk-task" + (open ? " open" : "") + (t.urgent ? " urgent" : "")}>
      <div className="tk-task-row" onClick={() => setOpen((v) => !v)}>
        {t.urgent && <span className="tk-task-flag" title="Vraagt nu je aandacht" />}
        <Avatar agent={t.agent} name={ag ? undefined : t.from} size={34} />
        <div className="tk-task-mid">
          <div className="tk-task-title">{t.title}</div>
          <div className="tk-task-meta">
            <span className="tk-task-mod" style={{ color: AC(t.accent), background: ACsoft(t.accent) }}>
              <span dangerouslySetInnerHTML={{ __html: ICONS(t.icon || "check", { sw: 2 }) }} />{t.signal || "Sales"}
            </span>
            <span className="tk-task-by"><b>{ag ? ag.name : t.from}</b></span>
          </div>
        </div>
        <button className="tk-task-view" onClick={(e) => { e.stopPropagation(); setOpen((v) => !v) }}>
          {open ? "Sluiten" : "Bekijk"}
          <span className="tk-task-chev" dangerouslySetInnerHTML={{ __html: ICONS("chevron", { sw: 2.2 }) }} />
        </button>
      </div>
      {open && (
        <div className="tk-task-body">
          <div className="tk-task-why">
            <span className="tk-why-k mono">Samenvatting</span>
            <p className="tk-why-t">{t.why}</p>
          </div>
          <div className="tk-actions">
            <button className="tk-act prim" style={{ background: AC("red") }} onClick={() => onResolve(t.id, t.did, t)}>
              <span dangerouslySetInnerHTML={{ __html: ICONS(t.logType === "call" ? "phone" : t.logType === "mail" ? "gm" : "check", { sw: 2 }) }} />{t.cta}
            </button>
            <div className="prop-later-wrap">
              <button className="tk-act" onClick={(e) => { e.stopPropagation(); setSnooze((v) => !v) }}>
                <span dangerouslySetInnerHTML={{ __html: ICONS("clock", { sw: 1.9 }) }} />Later
              </button>
              {snooze && (
                <SnoozeMenu onPick={(o) => { setSnooze(false); onResolve(t.id, "Komt terug " + o.label.toLowerCase()) }} />
              )}
            </div>
            <button className="tk-act" onClick={async () => { if (await confirmAsk({ title: "Taak afwijzen?", sub: t.title + " verdwijnt uit je lijst. Je kunt 'm altijd terugzetten.", confirmLabel: "Afwijzen" })) onResolve(t.id, "Afgewezen") }}>
              <span dangerouslySetInnerHTML={{ __html: ICONS("close", { sw: 2 }) }} />Afwijzen &amp; afronden
            </button>
            <ObjectActions obj={{ type: "task", key: "stask:" + t.id, title: t.title, agent: t.agent, accent: t.accent, custId: t.cust }} />
          </div>
        </div>
      )}
    </div>
  )
}

function SalesTaskList({ tasks, storeKey, onCard, onOpen, emptyTitle, emptySub, view }) {
  const store = useStore()
  const resolve = (id, label, t) => {
    if (label === null) { setState(storeKey + "." + id, 0); return }
    setState(storeKey + "." + id, label)
    if (t && t.cust) addCustLog(store, t.cust, { type: t.logType || "note", txt: label })
    const agent = t && t.agent
    toast(label, agent ? { agent } : { icon: "check" })
  }
  const doneOf = (id) => store.get(storeKey + "." + id, 0)
  const isAsg = (id) => window.isAssigned && window.isAssigned("stask:" + id)
  const open = tasks.filter((t) => !doneOf(t.id) && !isAsg(t.id))
  const resolved = tasks.filter((t) => doneOf(t.id) && !isAsg(t.id))
  const urgent = open.filter((t) => t.urgent)
  const rest = open.filter((t) => !t.urgent)

  if (open.length === 0 && resolved.length === 0) {
    return (
      <div className="st-empty">
        <span className="st-empty-ic" dangerouslySetInnerHTML={{ __html: ICONS("check", { sw: 2.2 }) }} />
        <div className="st-empty-t">{emptyTitle}</div>
        <div className="st-empty-s mono">{emptySub}</div>
      </div>
    )
  }

  const allOpen = [...urgent, ...rest]
  return (
    <div className="st-list">
      {open.length === 0 && (
        <div className="st-allclear">
          <span dangerouslySetInnerHTML={{ __html: ICONS("check", { sw: 2.2 }) }} />
          Alles van vandaag afgehandeld. {resolved.length} {resolved.length === 1 ? "taak" : "taken"} gelogd in het CRM.
        </div>
      )}
      {allOpen.length > 0 && (
        <div className="st-group">
          <div className={"st-group-h" + (urgent.length > 0 ? " urgent" : "")}>
            {urgent.length > 0 && <span className="st-group-dot" />}
            Vandaag oppakken<span className="st-group-n">{allOpen.length}</span>
          </div>
          <div className="pipe-tasks">
            {allOpen.map((t) => <SalesTaskCard key={t.id} t={t} done={doneOf(t.id)} onResolve={resolve} onCard={onCard} onOpen={onOpen} />)}
          </div>
        </div>
      )}
      {resolved.length > 0 && (
        <div className="st-group">
          <div className="st-group-h done">Afgehandeld<span className="st-group-n">{resolved.length}</span></div>
          <div className="pipe-tasks">
            {resolved.map((t) => <SalesTaskCard key={t.id} t={t} done={doneOf(t.id)} onResolve={resolve} onCard={onCard} onOpen={onOpen} />)}
          </div>
        </div>
      )}
    </div>
  )
}

/* kleine detail-pop-up voor een inkomende kans (Bekijk) */
function LeadPreviewModal({ lead, store, onClose }) {
  const approve = () => {
    const custId = "uc" + Date.now().toString(36)
    const cust = { id: custId, name: lead.name, contact: lead.contact, city: lead.city, x: 46, y: 42, sector: lead.sector, status: "prospect", monthly: 0, since: null, idle: 0, employees: "–", email: "", phone: "–", iris: lead.why, deals: 1 }
    setState("sales.customers", [cust, ...store.get("sales.customers", [])])
    setState("pipe.deals", [{ id: "ud" + Date.now().toString(36), cust: custId, value: lead.value, stage: "nieuw", days: 0, owner: "Ramon", note: lead.source + " · " + lead.why.split(".")[0] + "." }, ...store.get("pipe.deals", [])])
    addCustLog(store, custId, { type: "stage", txt: "Goedgekeurd uit " + lead.source })
    setState("pipe.lead.done." + lead.id, "approved")
    toast(lead.name + " staat nu in de pijplijn", { icon: "check" })
    onClose()
  }
  return (
    <Modal title={lead.name} eyebrow={"Saleskans · " + lead.source} accent="red" onClose={onClose}
      footer={<><Btn kind="ghost" onClick={onClose}>Sluit</Btn><Btn kind="solid" accent="red" icon="check" onClick={approve}>Goedkeuren</Btn></>}>
      <div className="lp-grid">
        <div className="lp-cell"><span className="lp-l mono">Contactpersoon</span><span className="lp-v">{lead.contact}</span></div>
        <div className="lp-cell"><span className="lp-l mono">Plaats</span><span className="lp-v">{lead.city}</span></div>
        <div className="lp-cell"><span className="lp-l mono">Sector</span><span className="lp-v">{lead.sector}</span></div>
        <div className="lp-cell"><span className="lp-l mono">Match-score</span><span className="lp-v">{lead.score}/100</span></div>
        {lead.value > 0 && <div className="lp-cell"><span className="lp-l mono">Geschatte waarde</span><span className="lp-v">{eur(lead.value)}</span></div>}
        <div className="lp-cell"><span className="lp-l mono">Aangedragen door</span><span className="lp-v">{lead.from}</span></div>
      </div>
      <div className="lp-why"><b>Waarom deze kans?</b><p>{lead.why}</p></div>
    </Modal>
  )
}

/* Widget: Nieuwe saleskansen, inkomende leads, goedkeuren/afwijzen */
function SaleskansenWidget({ onOpen }) {
  const store = useStore()
  const [preview, setPreview] = useState(null)
  const leads = incomingLeads(store)
  const approve = (l) => {
    const custId = "uc" + Date.now().toString(36)
    const cust = { id: custId, name: l.name, contact: l.contact, city: l.city, x: 46, y: 42, sector: l.sector, status: "prospect", monthly: 0, since: null, idle: 0, employees: "–", email: "", phone: "—", iris: l.why, deals: 1 }
    setState("sales.customers", [cust, ...store.get("sales.customers", [])])
    setState("pipe.deals", [{ id: "ud" + Date.now().toString(36), cust: custId, value: l.value, stage: "nieuw", days: 0, owner: "Ramon", note: l.source + " · " + l.why.split(".")[0] + "." }, ...store.get("pipe.deals", [])])
    addCustLog(store, custId, { type: "stage", txt: "Goedgekeurd uit " + l.source + ", in de pijplijn gezet als “Nieuw”" })
    setState("pipe.lead.done." + l.id, "approved")
    toast(l.name + " staat nu in de pijplijn", { icon: "check" })
  }
  const dismiss = async (l) => {
    if (await confirmAsk({ title: "Kans afwijzen?", sub: l.name + " verdwijnt uit de wachtrij. Je kunt 'm later altijd handmatig toevoegen.", confirmLabel: "Afwijzen" })) {
      setState("pipe.lead.done." + l.id, "dismissed")
      toast(l.name + " afgewezen", { icon: "close", kind: "muted" })
    }
  }
  return (
    <div className="voorstel-tile saleskansen-w" onClick={(e) => e.stopPropagation()}>
      <div className="voorstel-widget">
        <div className="appr-head skw-head">
          <span className="appr-dot" />
          <span className="appr-title">Nieuwe saleskansen</span>
          <span className="appr-n">{leads.length}</span>
          <span className="appr-sub mono">Keur goed om in de pijplijn te zetten</span>
        </div>
        {leads.length === 0 ? (
          <div className="st-empty">
            <span className="st-empty-ic" dangerouslySetInnerHTML={{ __html: ICONS("check", { sw: 2.2 }) }} />
            <div className="st-empty-t">Geen nieuwe kansen</div>
            <div className="st-empty-s mono">Leads uit Leadfinder, je site en win-back verschijnen hier automatisch.</div>
          </div>
        ) : (
          <div className="pipe-tasks">
            {leads.map((l) => <ApprovalLeadCard key={l.id} l={l} approve={approve} dismiss={dismiss} onCard={setPreview} />)}
          </div>
        )}
      </div>
      {preview && <LeadPreviewModal lead={preview} store={store} onClose={() => setPreview(null)} />}
    </div>
  )
}

/* Widget: Pipeline-taken, vandaag oppakken */
function PipelineTakenWidget({ onOpen, view }) {
  const store = useStore()
  const tasks = useMemo(() => pipelineTasks(store), [store])
  return (
    <div className="voorstel-tile" onClick={(e) => e.stopPropagation()}>
      <div className="voorstel-widget">
        <SalesTaskList tasks={tasks} storeKey="stask.pipe" onCard={(id) => openKlantCard(id)} onOpen={onOpen} view={view}
          emptyTitle="Niets in de pipeline vandaag" emptySub="Nieuwe leads en win-back kansen verschijnen hier automatisch." />
      </div>
    </div>
  )
}

/* ============================================================
   PIPELINE-pagina, tabs: Vandaag (taken via het bord) · Bord (kanban)
   ============================================================ */
function SalesPipelinePage({ onOpen, tab: tabProp, onTab, vandaagSlot }) {
  const store = useStore()
  const [tabLocal, setTabLocal] = useState("vandaag")
  const tab = tabProp !== undefined ? tabProp : tabLocal
  const setTab = onTab || setTabLocal
  const [adding, setAdding] = useState(false)
  const [flowOpen, setFlowOpen] = useState(false)
  const tasks = useMemo(() => pipelineTasks(store), [store])
  const openN = tasks.filter((t) => !store.get("stask.pipe." + t.id, 0)).length
  const inboxN = incomingLeads(store).length

  return (
    <div className="module-page sales-suite" key="pipeline">
      <header className="sx-hero">
        <div className="sx-hero-logo" style={{ '--acc': AC('red'), '--acc-soft': ACsoft('red') }}>
          <span className="sx-hero-mark"><span dangerouslySetInnerHTML={{ __html: ICONS('chartup', { sw: 1.9 }) }} /></span>
        </div>
        <div className="sx-hero-id">
          <h1 className="sx-hero-h1">Pipeline</h1>
          <p className="sx-hero-sub mono">Acquisitie van vandaag, nieuwe klanten, follow-ups en win-back. Alles wordt gelogd in het CRM.</p>
        </div>
        <div className="sx-hero-acts">
          <Btn kind="soft" accent="navy" icon="sliders" size="sm" onClick={() => setFlowOpen(true)}>Flow &amp; fase-duur</Btn>
          <Btn kind="solid" accent="red" icon="plus" size="sm" onClick={() => setAdding(true)}>Nieuwe deal</Btn>
        </div>
      </header>

      <div className="st-tabbar" role="tablist">
        <button role="tab" aria-selected={tab === "vandaag"} className={"st-tab" + (tab === "vandaag" ? " on" : "")} onClick={() => setTab("vandaag")}>
          <span dangerouslySetInnerHTML={{ __html: ICONS("check", { sw: 2 }) }} />Vandaag
          {(openN + inboxN) > 0 && <span className="st-tab-n">{openN + inboxN}</span>}
        </button>
        <button role="tab" aria-selected={tab === "bord"} className={"st-tab" + (tab === "bord" ? " on" : "")} onClick={() => setTab("bord")}>
          <span dangerouslySetInnerHTML={{ __html: ICONS("grid", { sw: 2 }) }} />Bord
        </button>
        <span className="st-tab-hint mono">{tab === "vandaag" ? "Keur kansen goed en werk je acties af, slim uit het CRM" : "Sleep deals door je zelf-ingerichte pijplijn"}</span>
      </div>

      {tab === "vandaag" && (vandaagSlot || (
        <div className="st-pipe-vandaag">
          <SaleskansenWidget onOpen={onOpen} />
          <PipelineTakenWidget onOpen={onOpen} />
        </div>
      ))}

      {tab === "bord" && <SalesPipeline onOpen={onOpen} onCard={(id) => openKlantCard(id)} summary={false} />}

      {adding && <NewDealModal store={store} defaultStage="nieuw" onClose={() => setAdding(false)} />}
      {flowOpen && <PipelineFlowEditor store={store} onClose={() => setFlowOpen(false)} />}
    </div>
  )
}

/* ============================================================
   RELATIEBEHEER — instelbare, gedoseerde signalen uit CRM-analyse.
   ESM-port van de Claude Design-blauwdruk (dashboard/salestasks.jsx):
   window-globals -> imports; ClientCard -> de gedeelde openKlantCard.
   ============================================================ */
const REL_SIG_TYPES = [
  { key: "stil",     label: "Klant stil gevallen",          desc: "Actieve klant zonder contact in de tijdlijn",      accent: "orange", icon: "clock",   threshold: 60,   on: true },
  { key: "winback",  label: "Win-back kans",                desc: "Oud-klant die opnieuw benaderd kan worden",        accent: "red",    icon: "refresh", threshold: null, on: true },
  { key: "occasion", label: "Jaarlijks moment",             desc: "Verjaardag of seizoen uit het klantprofiel",       accent: "gold",   icon: "trophy",  threshold: null, on: true },
  { key: "deal",     label: "Deal te lang open",            desc: "Lopende deal zonder beweging in de tijdlijn",      accent: "navy",   icon: "bell",    threshold: 21,   on: true },
  { key: "offerte",  label: "Openstaande offerte",          desc: "Verstuurde offerte zonder reactie",                accent: "gold",   icon: "doc",     threshold: 10,   on: true },
  { key: "factuur",  label: "Factuur over vervaldatum",     desc: "Openstaande factuur voorbij de vervaldatum",       accent: "orange", icon: "invoice", threshold: 14,   on: true },
  { key: "review",   label: "Opdracht afgerond → review", desc: "Recent afgeronde opdracht, vraag om een review", accent: "green",  icon: "star",    threshold: null, on: true },
]
const REL_SIG_BY = {}; REL_SIG_TYPES.forEach((t) => { REL_SIG_BY[t.key] = t })
function relSigOn(store, key)   { return store.get("rel.sig." + key + ".on", REL_SIG_BY[key].on) }
function relSigDays(store, key) { return store.get("rel.sig." + key + ".days", REL_SIG_BY[key].threshold) }
function relDose(store)         { return store.get("rel.dose", 5) }

/* demo-backing voor signaal-typen zonder eigen klantveld (factuur/review/occasion-curatie).
   Bij de overzet naar code komen deze uit de facturen-, project- en agenda-data. */
const REL_INVOICE = { c_nieuwevaart: { amount: 1450, over: 19 }, c_pllek: { amount: 880, over: 9 } }
const REL_REVIEW  = { c_hoxton: { what: "de borrel van vorige week" } }
const REL_OCCASION = {
  p_lisa:    { title: "Verjaardags-sloeptocht · Lisa de Vries", why: "Boekt elk jaar in juni een sloeptocht voor haar verjaardag. Stuur nu proactief de nieuwe vaarroute, voordat ze er zelf om vraagt." },
  c_okura:   { title: "10e teamuitje · Hotel Okura", why: "Net hun 10e boeking in 4 jaar trouwe afname. Een attentie plus een jaarcontract-voorstel met korting beloont de trouw en bindt ze langer." },
  c_haarlem: { title: "Najaarsarrangement · Brouwerij Jopen", why: "Boekt seizoensgebonden. Het najaar komt eraan, herinner ze nu er nog plek is, voordat een concurrent erbij is." },
}

/* alle gedetecteerde signalen (drempel gehaald), elk met type + aan/uit-vlag. */
function relatieSignals(store) {
  const custs = allCustomers(store)
  const by = (id) => custs.find((c) => c.id === id)
  const out = []
  const push = (type, c, x, priority) => {
    const m = REL_SIG_BY[type]
    out.push({ type, id: "rt_" + type + "_" + c.id, cust: c.id, enabled: relSigOn(store, type),
      icon: m.icon, accent: m.accent, signal: m.label, from: x.from || "Iris", agent: x.agent || "iris",
      urgent: !!x.urgent, title: x.title, why: x.why, cta: x.cta, did: x.did, logType: x.logType || "note",
      priority: priority || 0, statusInfo: x.statusInfo || "" })
  }

  custs.forEach((c) => {
    const since = daysSinceContact(store, c)
    const months = custIdleMonths(store, c)
    const yearly = (c.monthly || 0) * 12

    if (c.status === "active" && since >= relSigDays(store, "stil") && since < 9000) {
      push("stil", c, { from: "Iris", agent: "iris", urgent: months >= 3, logType: "call",
        title: "Even inchecken · " + c.name,
        why: months + (months === 1 ? " maand" : " maanden") + " geen contact in de tijdlijn, terwijl ze normaal vaker bestellen. Een after-sales belletje voorkomt stilletjes afhaken.",
        cta: "Check-in plannen", did: "Check-in ingepland voor " + c.name, statusInfo: since + " dgn stil" }, yearly + since * 8)
    }
    if (c.status === "win-back" || c.status === "old") {
      push("winback", c, { from: "Iris", agent: "iris", urgent: false, logType: "mail",
        title: "Win-back kans · " + c.name,
        why: (c.churn ? c.churn + ". " : "") + months + " maanden stil. " + (c.iris || "Een persoonlijke win-back-mail kost niets en kan de relatie heropenen."),
        cta: "Win-back mail klaarzetten", did: "Win-back mail klaargezet voor " + c.name, statusInfo: "winbaar" }, riskValue(store, c) || 6000)
    }
    const occ = REL_OCCASION[c.id] || (c.occasion ? { title: "Jaarlijks moment · " + c.name, why: c.occasion + ". Stuur proactief een herinnering; een persoonlijk bericht op het juiste moment maakt het verschil." } : null)
    if (occ && c.status !== "win-back" && c.status !== "old") {
      push("occasion", c, { from: "Iris", agent: "iris", urgent: false, logType: "mail",
        title: occ.title, why: occ.why, cta: "Herinnering klaarzetten", did: "Herinnering klaargezet voor " + c.name, statusInfo: "jaarlijks" }, 2000 + yearly * 0.2)
    }
    const inv = REL_INVOICE[c.id]
    if (inv && inv.over >= relSigDays(store, "factuur")) {
      push("factuur", c, { from: "Juris", agent: "juris", urgent: true, logType: "mail",
        title: "Factuur over datum · " + c.name,
        why: eur(inv.amount) + " staat " + inv.over + " dagen over de vervaldatum. Een vriendelijke herinnering nu voorkomt dat het verder uitloopt.",
        cta: "Herinnering sturen", did: "Betaalherinnering klaargezet voor " + c.name, statusInfo: inv.over + " dgn over datum" }, inv.amount * 4)
    }
    const rv = REL_REVIEW[c.id]
    if (rv) {
      push("review", c, { from: "Iris", agent: "iris", urgent: false, logType: "mail",
        title: "Vraag een review · " + c.name,
        why: rv.what.charAt(0).toUpperCase() + rv.what.slice(1) + " is net afgerond. Vraag nu om een review nu de ervaring vers is, dan is de kans op een mooie beoordeling het grootst.",
        cta: "Review-verzoek klaarzetten", did: "Review-verzoek klaargezet voor " + c.name, statusInfo: "net afgerond" }, 1500 + yearly * 0.1)
    }
  })

  const deals = [...store.get("pipe.deals", []), ...SALES_PIPELINE]
    .map((d) => ({ ...d, stage: dealStage(store, d) }))
    .filter((d) => d.stage !== "gewonnen")
  deals.forEach((d) => {
    const c = by(d.cust); if (!c || c.status !== "active") return
    const since = daysSinceContact(store, c)
    if (d.stage === "offerte") {
      if (since < relSigDays(store, "offerte")) return
      push("offerte", c, { from: "Hugo", agent: "hugo", urgent: true, logType: "mail",
        title: "Offerte opvolgen · " + c.name,
        why: eur(d.value) + " verstuurd en " + since + " dagen geen reactie. Een korte check verhoogt de kans op akkoord.",
        cta: "Reminder sturen", did: "Reminder klaargezet voor " + c.name, statusInfo: since + " dgn open" }, d.value || 1000)
    } else {
      if (since < relSigDays(store, "deal")) return
      const st = stageByKey(store, d.stage)
      push("deal", c, { from: "Hugo", agent: "hugo", urgent: true, logType: "call",
        title: "Deal loopt vast · " + c.name,
        why: eur(d.value) + " staat " + since + " dagen stil in “" + (st ? st.label : d.stage) + "”. Bel om de deal weer in beweging te krijgen.",
        cta: "Bel nu", did: "Belactie genoteerd voor " + c.name, statusInfo: since + " dgn stil" }, (d.value || 1000) + since * 6)
    }
  })

  return out
}

/* dosering: enabled signalen, belangrijkste eerst, max N open-taken per dag. */
function relatieDose(store) {
  const all = relatieSignals(store)
  const enabled = all.filter((s) => s.enabled)
  const off = all.filter((s) => !s.enabled)
  const isDone = (id) => store.get("stask.rel." + id, 0)
  const openE = enabled.filter((s) => !isDone(s.id)).sort((a, b) => b.priority - a.priority)
  const resolved = enabled.filter((s) => isDone(s.id))
  const dose = relDose(store)
  return { all, off, dose, resolved, tasks: openE.slice(0, dose), waiting: openE.slice(dose) }
}
function relatieTasks(store) { const d = relatieDose(store); return [...d.tasks, ...d.resolved] }

/* "Wat wordt een taak?" — stappers + signaal-instelmenu achter het tandwiel. */
function RelStep({ value, onDec, onInc, min }) {
  return (
    <div className="rsig-step">
      <button type="button" onClick={onDec} disabled={min != null && value <= min}>&minus;</button>
      <span>{value}</span>
      <button type="button" onClick={onInc}>+</button>
    </div>
  )
}
function RelatieSignalMenu({ store }) {
  const smRef = useSmartMenu({ align: "end", margin: 12 })
  const d = relatieDose(store)
  const dose = relDose(store)
  const setOn = (k, v) => setState("rel.sig." + k + ".on", v)
  const setDays = (k, v) => setState("rel.sig." + k + ".days", Math.max(1, v))
  const setDose = (v) => setState("rel.dose", Math.max(1, v))
  const taskN = d.tasks.length, waitN = d.waiting.length, offN = d.off.length
  const soft = [...d.waiting.map((s) => ({ ...s, _st: "wait" })), ...d.off.map((s) => ({ ...s, _st: "off" }))]
  const custs = allCustomers(store)
  return (
    <div className="rel-setmenu" ref={smRef} onClick={(e) => e.stopPropagation()} onPointerDown={(e) => e.stopPropagation()}>
      <div className="rel-setmenu-head">
        <div>
          <div className="rel-setmenu-title">Wat wordt een taak?</div>
          <div className="rel-setmenu-sub mono">Jij doseert welke signalen in Vandaag komen</div>
        </div>
        <div className="rsig-dose"><span className="rsig-dose-l mono">Max/dag</span><RelStep value={dose} min={1} onDec={() => setDose(dose - 1)} onInc={() => setDose(dose + 1)} /></div>
      </div>
      <div className="rel-setmenu-body">
        <div className="rsig-list">
          {REL_SIG_TYPES.map((t) => { const on = relSigOn(store, t.key); return (
            <div className={"rsig-row" + (on ? "" : " off")} key={t.key}>
              <span className="rsig-ic" style={{ color: AC(t.accent), background: ACsoft(t.accent) }} dangerouslySetInnerHTML={{ __html: ICONS(t.icon, { sw: 2 }) }} />
              <div className="rsig-main"><div className="rsig-name">{t.label}</div><div className="rsig-desc mono">{t.desc}</div></div>
              {t.threshold != null && on && (
                <div className="rsig-thr"><span className="mono">na</span><RelStep value={relSigDays(store, t.key)} min={1} onDec={() => setDays(t.key, relSigDays(store, t.key) - 1)} onInc={() => setDays(t.key, relSigDays(store, t.key) + 1)} /><span className="mono">dgn</span></div>
              )}
              <button type="button" className={"rsig-tog" + (on ? " on" : "")} role="switch" aria-checked={on} aria-label={t.label} onClick={() => setOn(t.key, !on)}><span className="rsig-knob" /></button>
            </div>
          ) })}
        </div>
        <div className="rsig-summary">
          <span className="rsig-chip task"><b>{taskN}</b> word{taskN === 1 ? "t" : "en"} taak</span>
          <span className="rsig-chip wait"><b>{waitN}</b> wacht{waitN === 1 ? "" : "en"}</span>
          <span className="rsig-chip off"><b>{offN}</b> uit</span>
        </div>
        {soft.length > 0 && (
          <div className="rel-setmenu-soft">
            <div className="rsig-soft-hint mono">Zachte signalen · vullen Vandaag niet</div>
            <div className="rsig-soft">
              {soft.map((s) => { const c = custs.find((x) => x.id === s.cust); const m = REL_SIG_BY[s.type]; return (
                <div className="rsig-soft-row" key={s.id}>
                  <span className="rsig-soft-dot" style={{ background: AC(m.accent) }} />
                  <div className="rsig-soft-main"><b>{c ? c.name : s.cust}</b><span className="mono">{m.label}{s.statusInfo ? " · " + s.statusInfo : ""}</span></div>
                  <span className={"rsig-soft-badge " + s._st}>{s._st === "off" ? "Uitgezet" : "Wacht"}</span>
                </div>
              ) })}
            </div>
          </div>
        )}
      </div>
    </div>
  )
}

/* Relatiebeheer-pagina: stille titelbalk, filter-rij met tandwiel, klantenlijst. */
function SalesRelatiePage({ onOpen }) {
  const store = useStore()
  const [filter, setFilter] = useState("aandacht")
  const [setOpen, setSetOpen] = useState(false)
  useEffect(() => {
    if (!setOpen) return
    const close = () => setSetOpen(false)
    window.addEventListener("pointerdown", close)
    return () => window.removeEventListener("pointerdown", close)
  }, [setOpen])

  const custs = allCustomers(store).filter((c) => c.status !== "prospect")
  const activeN = custs.filter((c) => c.status === "active").length
  const activeVal = custs.filter((c) => c.status === "active").reduce((s, c) => s + c.monthly, 0)
  const attention = custs.filter((c) => custAttention(store, c))

  const FILTERS = [["aandacht", "Vragen aandacht"], ["", "Alle klanten"], ["active", "Actief"], ["win-back", "Win-back"], ["old", "Oud"]]
  let list = custs
  if (filter === "aandacht") list = list.filter((c) => custAttention(store, c))
  else if (filter) list = list.filter((c) => c.status === filter)
  list = [...list].sort((a, b) => daysSinceContact(store, b) - daysSinceContact(store, a))

  const onCard = (id) => openKlantCard(id, "Relatiebeheer")

  return (
    <div className="module-page" key="relatiebeheer">
      <div className="page-head-bar">
        <div className="phb-head">
          <span className="phb-ic" style={{ color: AC("red"), background: ACsoft("red") }}><span dangerouslySetInnerHTML={{ __html: ICONS("people") }} /></span>
          <div className="phb-id">
            <div className="phb-title">Relatiebeheer</div>
            <div className="phb-sub mono">{activeN} actieve klanten · {eur(activeVal)}/mnd · {attention.length} vragen aandacht</div>
          </div>
        </div>
        <div className="phb-spacer" />
        <div className="phb-actions">
          <button className="tb-btn" onClick={() => onOpen("crm")}><span dangerouslySetInnerHTML={{ __html: ICONS("people", { sw: 2 }) }} />Open CRM</button>
        </div>
      </div>

      <div className="rel-filterbar">
        <div className="seg-pick">
          {FILTERS.map(([k, lbl]) => <button key={k || "all"} role="tab" aria-selected={filter === k} className={"seg-opt" + (filter === k ? " on" : "")} style={filter === k ? { background: AC("red"), color: "#fff" } : null} onClick={() => setFilter(k)}>{lbl}</button>)}
        </div>
        <div className="phb-spacer" />
        <div className="rel-set-wrap" onPointerDown={(e) => e.stopPropagation()}>
          <button className={"rel-gear" + (setOpen ? " on" : "")} title="Signaal-instellingen" aria-label="Signaal-instellingen" onClick={() => setSetOpen((v) => !v)}><span dangerouslySetInnerHTML={{ __html: ICONS("sliders", { sw: 1.9 }) }} /></button>
          {setOpen && <RelatieSignalMenu store={store} />}
        </div>
      </div>

      <div className="sx-rel-list rel-page-list">
        {list.length === 0 && <div className="sx-col-empty mono" style={{ padding: 28 }}>Geen klanten in deze weergave.</div>}
        {list.map((c) => {
          const att = custAttention(store, c)
          return (
            <div className={"sx-rel-row" + (att ? " att" : "")} key={c.id}>
              <div className="sx-rel-lead" onClick={() => onCard(c.id)}>
                <Avatar name={c.name} size={40} />
                <div className="sx-rel-main">
                  <div className="sx-rel-top"><b>{c.name}</b><StatusDot status={c.status} /></div>
                  <div className="sx-rel-sub mono">{c.contact} · {c.city} · {c.monthly > 0 ? eur(c.monthly) + "/mnd" : "geen omzet"}</div>
                </div>
                <div className="sx-rel-idle">
                  <span className={"sx-rel-idle-v mono" + (att ? " att" : "")}>{custIdleLabel(store, c)}</span>
                  {att && c.churn && <span className="sx-rel-churn mono">{c.churn}</span>}
                </div>
                <span className="sx-rel-chev" dangerouslySetInnerHTML={{ __html: ICONS("arrow") }} />
              </div>
              <div className="sx-rel-objacts" onClick={(e) => e.stopPropagation()}>
                <ObjectActions only={["vandaag", "assign", "klant"]} className="oa-compact"
                  obj={{ type: "klant", key: "cust:" + c.id, title: c.name, accent: "red", custId: c.id, custName: c.name }} />
              </div>
            </div>
          )
        })}
      </div>
    </div>
  )
}

/* Widget: Relatie-taken, CRM-signalen (mijlpalen, after-sales, veranderingen) */
function RelatieTakenWidget({ onOpen, view }) {
  const store = useStore()
  const dose = useMemo(() => relatieDose(store), [store])
  const tasks = [...dose.tasks, ...dose.resolved]
  const waitN = dose.waiting.length
  return (
    <div className="voorstel-tile" onClick={(e) => e.stopPropagation()}>
      <div className="voorstel-widget">
        <SalesTaskList tasks={tasks} storeKey="stask.rel" onCard={(id) => openKlantCard(id)} onOpen={onOpen} view={view}
          emptyTitle="Geen signalen vandaag" emptySub="Iris meldt het zodra een klant aandacht nodig heeft." />
        {waitN > 0 && (
          <div className="rsig-wait-note mono" onClick={() => onOpen && onOpen("relatiebeheer")}>
            <span dangerouslySetInnerHTML={{ __html: ICONS("clock", { sw: 2 }) }} />
            Nog {waitN} {waitN === 1 ? "signaal wacht" : "signalen wachten"} op ruimte · Iris doseert op max {dose.dose}/dag. Werk een taak af om de volgende vrij te geven.
          </div>
        )}
      </div>
    </div>
  )
}

export { SalesPipelinePage, SalesRelatiePage, SaleskansenWidget, PipelineTakenWidget, RelatieTakenWidget, pipelineTasks, relatieTasks, incomingLeads }
