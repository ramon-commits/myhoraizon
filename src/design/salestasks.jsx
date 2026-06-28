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
import { SALES_PIPELINE, dealStage, stageByKey, stageTarget, daysSinceContact, custIdleMonths, eur, addCustLog, SalesPipeline, NewDealModal, PipelineFlowEditor } from './sales.jsx'
import { ObjectActions, openKlantCard } from './objectactions.jsx'
import { SnoozeMenu } from './iris.jsx'

const { useState, useMemo } = React

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
function SalesPipelinePage({ onOpen, tab: tabProp, onTab }) {
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

      <div className="st-tabbar">
        <button className={"st-tab" + (tab === "vandaag" ? " on" : "")} onClick={() => setTab("vandaag")}>
          <span dangerouslySetInnerHTML={{ __html: ICONS("check", { sw: 2 }) }} />Vandaag
          {(openN + inboxN) > 0 && <span className="st-tab-n">{openN + inboxN}</span>}
        </button>
        <button className={"st-tab" + (tab === "bord" ? " on" : "")} onClick={() => setTab("bord")}>
          <span dangerouslySetInnerHTML={{ __html: ICONS("grid", { sw: 2 }) }} />Bord
        </button>
        <span className="st-tab-hint mono">{tab === "vandaag" ? "Keur kansen goed en werk je acties af, slim uit het CRM" : "Sleep deals door je zelf-ingerichte pijplijn"}</span>
      </div>

      {tab === "bord" && <SalesPipeline onOpen={onOpen} onCard={(id) => openKlantCard(id)} summary={false} />}

      {adding && <NewDealModal store={store} defaultStage="nieuw" onClose={() => setAdding(false)} />}
      {flowOpen && <PipelineFlowEditor store={store} onClose={() => setFlowOpen(false)} />}
    </div>
  )
}

export { SalesPipelinePage, SaleskansenWidget, PipelineTakenWidget, pipelineTasks, incomingLeads }
