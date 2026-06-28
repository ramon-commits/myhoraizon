/* ============================================================
   Sales-suite, deel 1: Pipeline. Letterlijk uit de Claude Design-blauwdruk
   (sales.jsx + sales2.jsx). Gedeelde sales-data/helpers + de Trello-kanban
   (sleepbare deal-kaarten, fase-flow, stale-signaal log-gebaseerd) en het
   Sales-overzicht. Klantkaart-clicks via openKlantCard (komt met de CRM-deel).
   ESM-port: window-globals -> imports. Demo-data uit data.js/customers.js.
   ============================================================ */
import React from 'react'
import { ICONS } from './icons'
import { setState, getState, useStore, toast, confirmAsk, Modal, Field } from './store.jsx'
import { AC, ACsoft, Avatar, Btn, Panel, AreaChart, KyanoMark } from './components.jsx'
import { allCustomers, custById } from './customers.js'
import { OwnerField, currentActor, logToMember } from './assign.jsx'
import { ObjectActions, openKlantCard } from './objectactions.jsx'
import { WidgetsProvider, HiddenTray } from './widgets.jsx'

const { useState: useStateS2 } = React

/* ---------- pijplijn-fasen (nieuwe klanten) ---------- */
const PIPE_STAGES = [
  { key: "nieuw",   label: "Nieuw",          accent: "navy",   target: 3 },
  { key: "contact", label: "Eerste contact", accent: "aqua",   target: 5 },
  { key: "offerte", label: "Offerte uit",    accent: "gold",   target: 7 },
  { key: "deal",    label: "Onderhandeling", accent: "orange", target: 7 },
  { key: "gewonnen",label: "Gewonnen",       accent: "green",  target: 0 },
];
const STAGE_BY = Object.fromEntries(PIPE_STAGES.map((s) => [s.key, s]));

/* ---------- instelbare pijplijn-FLOW ----------
   Eén bron voor zowel het Bord (kolommen) als de taken: elke stap is een
   fase met een wachttijd (dagen) en de actie die Hugo inschiet als een deal
   te lang blijft liggen. De ondernemer schrijft hier zijn hele flow uit. */
const ACCENT_CYCLE = ["navy", "aqua", "gold", "orange", "purple", "red", "green"];
const FLOW_ACTIONS = [
  { key: "mail",  label: "Mail klaarzetten",   icon: "send",  logType: "mail" },
  { key: "call",  label: "Bellen",             icon: "phone", logType: "call" },
  { key: "doc",   label: "Offerte / voorstel", icon: "doc",   logType: "mail" },
  { key: "visit", label: "Afspraak plannen",   icon: "calendar",logType: "note" },
  { key: "stage", label: "Volgende stap",      icon: "arrow", logType: "stage" },
];
const DEFAULT_FLOW = [
  { key: "nieuw",    label: "Nieuw",          accent: "navy",   target: 2, act: "mail",  cta: "Openingsmail klaarzetten" },
  { key: "contact",  label: "Eerste contact", accent: "aqua",   target: 4, act: "call",  cta: "Opvolgen, bel of mail" },
  { key: "offerte",  label: "Offerte uit",    accent: "gold",   target: 5, act: "doc",   cta: "Reminder sturen" },
  { key: "deal",     label: "Onderhandeling", accent: "orange", target: 6, act: "stage", cta: "Volgende stap zetten" },
  { key: "gewonnen", label: "Gewonnen",       accent: "green",  target: 0, terminal: true },
];
/* live flow uit de store (of standaard). 'gewonnen' staat altijd als laatste. */
function getFlow(store) {
  const f = store.get("pipe.flow", null);
  if (!f || !f.length) return DEFAULT_FLOW;
  // borg dat er altijd precies één terminal-stap (gewonnen) achteraan staat
  const body = f.filter((s) => !s.terminal);
  const won = f.find((s) => s.terminal) || DEFAULT_FLOW[DEFAULT_FLOW.length - 1];
  return [...body, won];
}
function saveFlow(store, flow) { setState("pipe.flow", flow); }
function flowBody(store) { return getFlow(store).filter((s) => !s.terminal); }
function stageByKey(store, key) { return getFlow(store).find((s) => s.key === key) || STAGE_BY[key]; }
/* doel-duur per fase (komt uit de flow; los override via stepper blijft mogelijk) */
function stageTarget(store, key) {
  const ov = store.get("pipe.target." + key, null);
  if (ov != null) return ov;
  const s = stageByKey(store, key);
  return s ? s.target : 7;
}

/* nieuwe deals voor de pipeline (verwijzen naar klant) */
const SALES_PIPELINE = [
  { id: "d1", cust: "c_nieuwevaart", value: 4400, stage: "deal",    days: 14, owner: "Ramon", note: "Offerte uit, wacht op akkoord. 2x herinnerd." },
  { id: "d2", cust: "c_okura",       value: 2800, stage: "offerte", days: 3,  owner: "Iris",  note: "Teamuitje Q3, offerte vandaag verstuurd." },
  { id: "d3", cust: "c_conservatorium", value: 3900, stage: "contact", days: 2, owner: "Ramon", note: "Kennismaking ingepland voor donderdag." },
  { id: "d4", cust: "c_okura2",      value: 1600, stage: "nieuw",   days: 1,  owner: "Hugo",  note: "Lead uit Finder. Eerste mail klaargezet." },
  { id: "d5", cust: "c_okura3",      value: 2400, stage: "nieuw",   days: 4,  owner: "Hugo",  note: "Lead uit Finder. Referentie Okura meesturen." },
  { id: "d6", cust: "c_hoxton",      value: 1800, stage: "offerte", days: 6,  owner: "Ramon", note: "Upgrade naar Business, voorstel ligt er." },
  { id: "d7", cust: "c_rotterdam",   value: 2100, stage: "deal",    days: 5,  owner: "Iris",  note: "Rotterdam-route, prijs bijna rond." },
];

function eur(n) { return "€ " + (n || 0).toLocaleString("nl-NL"); }
function idleLabel(c) {
  if (c.status === "prospect") return "nog geen order";
  if (!c.idle) return "deze maand besteld";
  return c.idle + (c.idle === 1 ? " maand" : " maanden") + " stil";
}

function dealStage(store, d) { return store.get("pipe.stage." + d.id, d.stage); }
/* Elke log-regel krijgt een ECHTE timestamp (ts) naast het leesbare label (when).
   Bestaande weergave (l.when) blijft; ts is er puur om mee te rekenen. */
function addCustLog(store, id, entry) {
  const cur = store.get("sales.log." + id, []);
  setState("sales.log." + id, [{ ...entry, when: entry.when || "zojuist", ts: entry.ts != null ? entry.ts : Date.now() }, ...cur]);
}

/* ============================================================
   GEDEELDE BRON VAN WAARHEID: het laatste contact uit de klant-tijdlijn.
   Pipeline, relatiebeheer, Iris en Hugo lezen allemaal hetzelfde.
   ============================================================ */
const DAY_MS = 86400000;
/* welk type log-regel telt als een écht contactmoment (reset 'stil') —
   administratieve regels (toewijzen, eigenaar, naar-Vandaag, fase-zet) niet. */
const CONTACT_TYPES = new Set(["mail", "wa", "call", "order", "meeting", "offerte", "factuur", "note", "deal"]);
/* fase → soort contact dat een lopende deal als 'laatste touch' in de tijdlijn zet */
const DEAL_LOG_TYPE = { nieuw: "mail", contact: "call", offerte: "offerte", deal: "mail" };

/* leesbaar 'when'-label → echte ts (best effort, voor de demo-seed-data). */
function whenToTs(when) {
  if (when == null) return null;
  if (typeof when === "number") {
    if (when > 1e11) return when;                                   // al een epoch-ms
    if (when >= 1900 && when <= 2100) return Date.now() - (2026 - when) * 365 * DAY_MS; // jaartal
    return Date.now() - when * DAY_MS;                              // aantal dagen
  }
  const s = String(when).toLowerCase().trim();
  if (!s) return null;
  if (s.includes("zojuist") || s.includes("vandaag") || s === "nu") return Date.now();
  if (s.includes("eergisteren")) return Date.now() - 2 * DAY_MS;
  if (s.includes("gisteren")) return Date.now() - 1 * DAY_MS;
  if (s.includes("volgende")) return null;                          // toekomst → geen contact
  if (s.includes("deze week")) return Date.now() - 3 * DAY_MS;
  if (s.includes("vorige week")) return Date.now() - 9 * DAY_MS;
  if (s.includes("deze maand")) return Date.now() - 10 * DAY_MS;
  if (s.includes("vorige maand")) return Date.now() - 38 * DAY_MS;
  let m;
  if ((m = s.match(/(\d+)\s*(dagen|dag|d)\b/))) return Date.now() - (+m[1]) * DAY_MS;
  if ((m = s.match(/(\d+)\s*(weken|week|wk)\b/))) return Date.now() - (+m[1]) * 7 * DAY_MS;
  if ((m = s.match(/(\d+)\s*(maanden|maand|mnd|mns)\b/))) return Date.now() - (+m[1]) * 30 * DAY_MS;
  if ((m = s.match(/sinds\s*(\d{4})/))) return Date.now() - (2026 - (+m[1])) * 365 * DAY_MS;
  if ((m = s.match(/(\d{4})/))) return Date.now() - (2026 - (+m[1])) * 365 * DAY_MS;
  return null;                                                      // 'bij start','notitie','automatisch…' → niet meetbaar
}
function logEntryTs(e) { return (e && e.ts != null) ? e.ts : whenToTs(e && e.when); }
function custLiveLog(store, id) { return (store && store.get) ? store.get("sales.log." + id, []) : getState("sales.log." + id, []); }
/* volledige tijdlijn = live log (echte ts) + seed-historie (afgeleide ts) */
function custTimeline(store, c) { return [...custLiveLog(store, c.id), ...(c.seedLog || buildSeedTimeline(c))]; }
/* ts van het LAATSTE echte contactmoment (of null) */
function lastContactTs(store, c) {
  let best = null;
  for (const e of custTimeline(store, c)) {
    if (!CONTACT_TYPES.has(e.type)) continue;
    const t = logEntryTs(e);
    if (t == null) continue;
    if (best == null || t > best) best = t;
  }
  return best;
}
/* hoeveel dagen geleden was het laatste contact (groot getal = nooit) */
function daysSinceContact(store, c) {
  const t = lastContactTs(store, c);
  if (t == null) return 99999;
  return Math.max(0, Math.floor((Date.now() - t) / DAY_MS));
}
/* drempel waarboven een relatie 'vraagt aandacht' (≈ 2,5 maand geen contact) */
/* leesbaar 'laatste contact'-label, log-gebaseerd (vervangt idleLabel in lijsten) */
function custIdleLabel(store, c) {
  if (c.status === "prospect") return "nog geen order";
  const d = daysSinceContact(store, c);
  if (d >= 9000) return "geen contact gelogd";
  if (d <= 1) return "vandaag contact";
  if (d < 14) return d + " dagen geleden contact";
  const mo = Math.round(d / 30);
  return mo <= 0 ? "deze maand contact" : mo + (mo === 1 ? " maand" : " maanden") + " stil";
}


function buildSeedTimeline(c) {
  const who = (c.contact || c.name).split(" ")[0];
  const out = [];
  if (c.status === "active") {
    out.push({ type: "order",   txt: "Laatste order verwerkt, " + eur(c.monthly), when: c.idle ? c.idle + (c.idle === 1 ? " mnd" : " mnd") + " geleden" : "deze maand" });
    out.push({ type: "factuur", txt: "Factuur " + eur(c.monthly) + " voldaan", when: "vorige maand" });
    out.push({ type: "meeting", txt: "Kwartaalcheck met " + who, when: "2 mnd geleden" });
    out.push({ type: "mail",    txt: "Nieuwsbrief geopend", when: "3 mnd geleden" });
    if (c.since) out.push({ type: "order", txt: "Eerste boeking", when: "sinds " + c.since });
  } else if (c.status === "win-back" || c.status === "old") {
    out.push({ type: "stil",    txt: idleLabel(c), when: "automatisch gesignaleerd" });
    out.push({ type: "mail",    txt: "Win-back-mail verstuurd door Iris", when: "vorige maand" });
    out.push({ type: "factuur", txt: "Laatste factuur voldaan", when: (c.idle + 1) + " mnd geleden" });
    out.push({ type: "order",   txt: "Laatste order", when: c.idle + " mnd geleden" });
    out.push({ type: "note",    txt: c.churn ? ("Reden vertrek: " + c.churn) : "Relatie bekoeld", when: "notitie" });
  } else {
    if (c.deals > 0) out.push({ type: "offerte", txt: "Offerte opgesteld", when: "deze week" });
    out.push({ type: "mail", txt: "Eerste contactmail verstuurd", when: "deze week" });
    out.push({ type: "note", txt: "Toegevoegd als prospect", when: "bij start" });
  }
  /* lopende deal = meest recente contactmoment, met een ECHTE datum (days geleden) */
  const deal = SALES_PIPELINE.find((d) => d.cust === c.id && d.stage !== "gewonnen");
  if (deal) {
    const dt = DEAL_LOG_TYPE[deal.stage] || "mail";
    out.unshift({ type: dt, txt: deal.note || "Laatste opvolging", when: deal.days === 0 ? "vandaag" : deal.days + (deal.days === 1 ? " dag" : " dagen") + " geleden", ts: Date.now() - deal.days * DAY_MS });
  }
  /* borg een echte ts op elke seed-regel zodat ermee gerekend kan worden */
  return out.map((e) => (e.ts != null ? e : { ...e, ts: whenToTs(e.when) }));
}

const ATTENTION_DAYS = 75;
/* ---------- klant-status + CRM-helpers (gedeeld met de klantkaart) ---------- */
const STATUS_META = {
  active:    { label: "Actief",    accent: "green" },
  "win-back":{ label: "Win-back",  accent: "orange" },
  old:       { label: "Oud",       accent: "navy" },
  prospect:  { label: "Prospect",  accent: "aqua" },
};
function StatusDot({ status }) {
  const m = STATUS_META[status] || STATUS_META.prospect;
  return <span className="sx-status" style={{ color: AC(m.accent), background: ACsoft(m.accent) }}><span className="sx-status-dot" style={{ background: AC(m.accent) }} />{m.label}</span>;
}
function custAttention(store, c) {
  if (!c || c.status === "prospect") return false;
  if (c.status === "win-back" || c.status === "old") return true;   // win-back-segment vraagt altijd aandacht
  return daysSinceContact(store, c) >= ATTENTION_DAYS;               // actieve klant die stil valt → uit de log
}
function custIdleMonths(store, c) {
  const d = daysSinceContact(store, c);
  if (d >= 9000) return c.idle || 0;
  return Math.round(d / 30);
}
/* volgende stap per relatie: één afgesproken vervolgactie + termijn.
   u = urgentie: over | today | soon | later. Override leeft in store. */
const CRM_NEXT = {
  c_okura:         { txt: "Jaarcontract-voorstel nabellen",        due: "vandaag",       u: "today" },
  c_nieuwevaart:   { txt: "Offerte \u20ac 4.400 afronden, 2\u00d7 herinnerd", due: "te laat", u: "over" },
  c_hoxton:        { txt: "Business-upgrade voorstel sturen",       due: "deze week",     u: "soon" },
  c_pllek:         { txt: "Bedankje voor doorverwijzing sturen",     due: "volgende week", u: "later" },
  c_conservatorium:{ txt: "Kennismaking donderdag voorbereiden",     due: "do 25 jun",     u: "soon" },
  c_marqt:         { txt: "Win-back-aanbieding bellen",              due: "vandaag",       u: "today" },
  c_hotelv:        { txt: "Persoonlijk belletje van Ramon",          due: "deze week",     u: "soon" },
  c_okura2:        { txt: "Eerste mail opvolgen",                    due: "morgen",        u: "soon" },
  c_okura3:        { txt: "Referentie Okura meesturen",             due: "deze week",     u: "soon" },
  c_rotterdam:     { txt: "Rotterdam-route prijs rondmaken",         due: "morgen",        u: "soon" },
  c_utrecht:       { txt: "Laatste win-back-mail, of afsluiten", due: "deze maand",  u: "later" },
  c_haarlem:       { txt: "Najaarsarrangement herinneren",           due: "volgende maand",u: "later" },
  p_lisa:          { txt: "Mei-herinnering verjaardagstocht sturen",  due: "volgende maand",u: "later" },
  p_youssef:       { txt: "Offerte vrijgezellenfeest sturen",        due: "vandaag",       u: "today" },
};
function custNext(store, c) {
  const o = store.get("crm.next." + c.id, undefined);
  if (o !== undefined) return o;
  return CRM_NEXT[c.id] || null;
}
function setCustNext(store, c, val) { setState("crm.next." + c.id, val); }
const DUE_META = {
  over:  { a: "red",    ic: "clock" },
  today: { a: "orange", ic: "clock" },
  soon:  { a: "gold",   ic: "calendar" },
  later: { a: "navy",   ic: "calendar" },
};
/* ---------- omzet-impact: lopende deal + jaarwaarde-at-risk ---------- */
function custDeal(store, c) {
  const deals = store.get("pipe.deals", SALES_PIPELINE);
  return deals.find((d) => d.cust === c.id) || null;
}
/* historische maandwaarde van weggelopen klanten (winbaar) */
const WAS_MONTHLY = { c_marqt: 1200, c_hotelv: 950, c_utrecht: 800 };
function riskValue(store, c) {
  if (c.status === "win-back" || c.status === "old") return (WAS_MONTHLY[c.id] || 600) * 12;
  if (c.status === "active" && custAttention(store, c)) return (c.monthly || 0) * 12;
  return 0;
}
function riskLabel(store, c) {
  if (c && (c.status === "win-back" || c.status === "old")) return "winbaar/jr";
  if (c && c.status === "active" && custAttention(store, c)) return "omzet-at-risk";
  return null;
}
/* ---------- bedrijfs- & contactgegevens (CRM-backend-model) ----------
   Elke klant = één bedrijf (Handelsregister-gegevens) met één of meer
   contactpersonen. Seeds krijgen afgeleide velden zodat alles gevuld is. */
function custKvk(c) {
  if (c.kvk) return c.kvk;
  let h = 0; for (const ch of (c.id || c.name || "")) h = (h * 31 + ch.charCodeAt(0)) >>> 0;
  return String(60000000 + (h % 39999999));
}
function custKind(c) { return c && c.kind === "particulier" ? "particulier" : "bedrijf"; }
function custLegal(c) { return c.legalForm || "B.V."; }
function custWebsite(c) { return c.website || (c.email && c.email.includes("@") ? c.email.split("@")[1] : null); }
function custAddress(c) { return c.address || c.city; }
function custContacts(c, store) {
  const base = (c.contacts && c.contacts.length) ? c.contacts : [{ name: c.contact, role: "Hoofdcontact", email: c.email, phone: c.phone, primary: true }];
  const extra = store ? store.get("sales.contact." + c.id, []) : [];
  return [...base, ...extra];
}
function addCustContact(store, id, contact) {
  const cur = store.get("sales.contact." + id, []);
  setState("sales.contact." + id, [...cur, contact]);
}
const LOG_AC = { mail: "red", wa: "green", call: "navy", order: "green", stil: "orange", note: "purple", deal: "gold", stage: "aqua", offerte: "gold", factuur: "navy", meeting: "aqua", done: "green", assign: "navy", owner: "navy" };
const LOG_IC = { mail: "gm", wa: "wa", call: "phone", order: "check", stil: "bell", note: "pencil", deal: "chartup", stage: "arrow", offerte: "doc", factuur: "invoice", meeting: "calendar", done: "check", assign: "users", owner: "star" };

function NewDealModal({ store, onClose, defaultStage = "nieuw" }) {
  const [form, setForm] = useStateS2({ name: "", contact: "", value: "", stage: defaultStage, owner: "Ramon", note: "" });
  const body = flowBody(store);
  const save = () => {
    if (!form.name.trim()) { toast("Vul een naam in", { icon: "close", kind: "muted" }); return; }
    const id = "ud" + Date.now().toString(36);
    const custId = "uc" + Date.now().toString(36);
    const cust = { id: custId, name: form.name, contact: form.contact || form.name, city: "Amsterdam", x: 46, y: 42, sector: "Nieuw", status: "prospect", monthly: 0, since: null, idle: 0, employees: "–", email: "", phone: "–", iris: "Vers in de pipeline. Plan een eerste contactmoment.", deals: 1 };
    setState("sales.customers", [cust, ...store.get("sales.customers", [])]);
    setState("pipe.deals", [{ id, cust: custId, value: parseInt(form.value) || 0, stage: form.stage, days: 0, owner: form.owner, note: form.note.trim() || "Handmatig toegevoegd." }, ...store.get("pipe.deals", [])]);
    addCustLog(store, custId, { type: "stage", txt: "Toegevoegd aan de pipeline in \u201C" + (stageByKey(store, form.stage) || {}).label + "\u201D" });
    toast(form.name + " toegevoegd aan de pipeline", { icon: "check" });
    onClose();
  };
  return (
    <Modal title="Nieuwe deal" eyebrow="Pipeline · Sales" accent="red" onClose={onClose}
      footer={<><Btn kind="ghost" onClick={onClose}>Annuleer</Btn><Btn kind="solid" accent="red" icon="check" onClick={save}>Deal aanmaken</Btn></>}>
      <Field label="Klant / bedrijf" value={form.name} onChange={(v) => setForm({ ...form, name: v })} placeholder="bv. Hotel Jakarta" />
      <div className="field-row">
        <Field label="Contactpersoon" value={form.contact} onChange={(v) => setForm({ ...form, contact: v })} placeholder="bv. Lin Tan" />
        <Field label="Geschatte waarde (€)" value={form.value} onChange={(v) => setForm({ ...form, value: v })} placeholder="bv. 2400" />
      </div>
      <label className="field"><span className="field-lbl">Start-fase</span>
        <div className="seg-pick">
          {body.map((s) => (
            <button key={s.key} className={"seg-opt" + (form.stage === s.key ? " on" : "")} style={form.stage === s.key ? { background: AC(s.accent), color: "#fff" } : null} onClick={() => setForm({ ...form, stage: s.key })}>{s.label}</button>
          ))}
        </div>
      </label>
      <Field label="Notitie (optioneel)" value={form.note} onChange={(v) => setForm({ ...form, note: v })} placeholder="Waar komt deze deal vandaan, volgende stap…" textarea />
    </Modal>
  );
}

/* ---------- gedeelde samenvattingsbalk (open deals · waarde · gewonnen + acties) ----------
   Staat zowel boven het bord als boven de Vandaag-taken, zodat de cijfers en
   de knoppen 'Flow & fase-duur' en 'Nieuwe deal' overal binnen handbereik zijn. */
function PipelineSummaryBar({ store }) {
  const [flowOpen, setFlowOpen] = useStateS2(false);
  const [adding, setAdding] = useStateS2(false);
  const userDeals = store.get("pipe.deals", []);
  const deals = [...userDeals, ...SALES_PIPELINE].map((d) => ({ ...d, stage: dealStage(store, d) }));
  const totalOpen = deals.filter((d) => d.stage !== "gewonnen").reduce((a, d) => a + d.value, 0);
  const wonVal = deals.filter((d) => d.stage === "gewonnen").reduce((a, d) => a + d.value, 0);
  const openN = deals.filter((d) => d.stage !== "gewonnen").length;
  return (<>
    <div className="kb-summary">
      <div className="kb-sum-stat"><div className="kb-sum-v">{openN}</div><div className="kb-sum-l mono">open deals</div></div>
      <div className="kb-sum-stat"><div className="kb-sum-v" style={{ color: AC("red") }}>{eur(totalOpen)}</div><div className="kb-sum-l mono">open waarde</div></div>
      <div className="kb-sum-stat"><div className="kb-sum-v" style={{ color: AC("green") }}>{eur(wonVal)}</div><div className="kb-sum-l mono">gewonnen</div></div>
      <div className="kb-sum-spacer" />
      <button className="tb-btn" onClick={() => setFlowOpen(true)}><span dangerouslySetInnerHTML={{ __html: ICONS("sliders", { sw: 2 }) }} />Flow &amp; fase-duur</button>
      <button className="inbox-new" onClick={() => setAdding(true)}><span dangerouslySetInnerHTML={{ __html: ICONS("plus", { sw: 2 }) }} />Nieuwe deal</button>
    </div>
    {adding && <NewDealModal store={store} defaultStage="nieuw" onClose={() => setAdding(false)} />}
    {flowOpen && <PipelineFlowEditor store={store} onClose={() => setFlowOpen(false)} />}
  </>);
}

/* ---------- PIPELINE: Trello-bord met sleep-en-neerzet, fase-flow & waarde ---------- */
function SalesPipeline({ onOpen, onCard, summary = true }) {
  const store = useStore();
  const [adding, setAdding] = useStateS2(false);
  const [addStage, setAddStage] = useStateS2("nieuw");
  const [drag, setDrag] = useStateS2(null);     // deal-id die gesleept wordt
  const [over, setOver] = useStateS2(null);      // kolom-key waarboven gehangen wordt

  const userDeals = store.get("pipe.deals", []);
  const deals = [...userDeals, ...SALES_PIPELINE].map((d) => ({ ...d, stage: dealStage(store, d) }));
  const cols = getFlow(store);

  const setStage = (d, key) => {
    if (!d || d.stage === key) return;
    const next = stageByKey(store, key);
    setState("pipe.stage." + d.id, key);
    setState("pipe.days." + d.id, 0);
    const c = custById(store, d.cust);
    addCustLog(store, d.cust, { type: "stage", txt: "Verplaatst naar \u201C" + next.label + "\u201D in de pipeline" });
    if (key === "gewonnen") toast((c ? c.name : "Deal") + " gewonnen! \uD83C\uDF89 Juris maakt het contract", { agent: "juris" });
    else toast((c ? c.name : "Deal") + " → " + next.label, { icon: "arrow" });
  };
  const move = (d, dir) => {
    const idx = cols.findIndex((s) => s.key === d.stage);
    const next = cols[Math.max(0, Math.min(cols.length - 1, idx + dir))];
    if (next) setStage(d, next.key);
  };
  const drop = (key) => { const d = deals.find((x) => x.id === drag); if (d) setStage(d, key); setDrag(null); setOver(null); };
  const changeDealOwner = (d, mm) => {
    const actor = currentActor() ? currentActor() : { name: "Ramon" };
    setState("pipe.owner." + d.id, mm.name);
    const c = custById(store, d.cust);
    addCustLog(store, d.cust, { type: "owner", txt: actor.name.split(" ")[0] + " maakte " + mm.name.split(" ")[0] + " eigenaar van de deal" });
    logToMember(mm.id, { txt: "Eigenaar van deal " + (c ? c.name : ""), icon: "star", accent: "navy" });
    if (actor.id && actor.id !== mm.id) logToMember(actor.id, { txt: mm.name.split(" ")[0] + " als eigenaar gezet op deal " + (c ? c.name : ""), icon: "star", accent: "teal" });
    toast(mm.name.split(" ")[0] + " is nu eigenaar van de deal", { icon: "star" });
  };

  return (<>
    {summary && <PipelineSummaryBar store={store} />}
    <div className="kb-hint mono">Sleep een kaart naar een andere kolom om de fase te wijzigen, of gebruik de pijlen. Iris en Vandaag sturen dezelfde pijplijn aan.</div>

    <div className="kb-board">
      {cols.map((s) => {
        const list = deals.filter((d) => d.stage === s.key);
        const val = list.reduce((a, d) => a + d.value, 0);
        const idx = cols.findIndex((x) => x.key === s.key);
        return (
          <div className={"kb-col" + (over === s.key ? " over" : "") + (s.terminal ? " won" : "")} key={s.key}
            onDragOver={(e) => { if (drag) { e.preventDefault(); setOver(s.key); } }}
            onDragLeave={(e) => { if (e.currentTarget === e.target) setOver(null); }}
            onDrop={() => drop(s.key)}>
            <div className="kb-col-head" style={{ "--acc": AC(s.accent) }}>
              <span className="kb-col-bar" style={{ background: AC(s.accent) }} />
              <span className="kb-col-name">{s.label}</span>
              <span className="kb-col-n">{list.length}</span>
              <span className="kb-col-v mono">{eur(val)}</span>
            </div>
            <div className="kb-col-body">
              {list.map((d) => {
                const c = custById(store, d.cust); if (!c) return null;
                const since = daysSinceContact(store, c);
                const stale = !s.terminal && since > stageTarget(store, s.key);
                return (
                  <div className={"kb-card" + (stale ? " stale" : "") + (drag === d.id ? " dragging" : "")} key={d.id}
                    draggable onDragStart={(e) => { setDrag(d.id); e.dataTransfer.effectAllowed = "move"; }} onDragEnd={() => { setDrag(null); setOver(null); }}>
                    <div className="kb-card-top" onClick={() => onCard(d.cust)}>
                      <Avatar name={c.name} size={26} />
                      <span className="kb-card-name">{c.name}</span>
                      <span className="kb-card-val" style={{ color: AC(s.accent), background: ACsoft(s.accent) }}>{eur(d.value)}</span>
                    </div>
                    {d.note && <div className="kb-card-note" onClick={() => onCard(d.cust)}>{d.note}</div>}
                    <div className="kb-card-foot">
                      <span className={"kb-age" + (stale ? " stale" : "")}>
                        {stale && <span dangerouslySetInnerHTML={{ __html: ICONS("bell", { sw: 2.2 }) }} />}
                        {s.terminal ? "gewonnen" : (since >= 9000 ? "nog geen contact" : since + " " + (since === 1 ? "dag" : "dagen"))}
                      </span>
                      {OwnerField
                        ? <span className="kb-owner-f" onClick={(e) => e.stopPropagation()}><OwnerField owner={store.get("pipe.owner." + d.id, d.owner)} onChange={(mm) => changeDealOwner(d, mm)} compact /></span>
                        : <span className="kb-owner mono">{d.owner}</span>}
                      <div className="kb-move">
                        <button disabled={idx === 0} onClick={() => move(d, -1)} title="Fase terug"><span style={{ transform: "rotate(180deg)", display: "flex" }} dangerouslySetInnerHTML={{ __html: ICONS("chevron", { sw: 2.6 }) }} /></button>
                        <button disabled={idx === cols.length - 1} onClick={() => move(d, 1)} title="Fase verder" className="fwd"><span dangerouslySetInnerHTML={{ __html: ICONS("chevron", { sw: 2.6 }) }} /></button>
                      </div>
                    </div>
                    {(
                      <div className="kb-card-acts" draggable={false} onDragStart={(e) => e.stopPropagation()} onClick={(e) => e.stopPropagation()}>
                        <ObjectActions only={["vandaag", "assign", "klant"]} className="oa-compact"
                          obj={{ type: "deal", key: "deal:" + d.id, title: c.name, accent: s.accent, custId: d.cust, custName: c.name }} />
                      </div>
                    )}
                  </div>
                );
              })}
              {list.length === 0 && !s.terminal && (
                <div className="kb-col-empty mono">
                  <span dangerouslySetInnerHTML={{ __html: ICONS("inbox", { sw: 1.8 }) }} />
                  Nog geen deals in deze fase
                </div>
              )}
              {!s.terminal && (
                <button className="kb-add" onClick={() => { setAddStage(s.key); setAdding(true); }}>
                  <span dangerouslySetInnerHTML={{ __html: ICONS("plus", { sw: 2.2 }) }} />deal
                </button>
              )}
              {list.length === 0 && s.terminal && <div className="kb-empty mono">nog geen gewonnen deals</div>}
            </div>
          </div>
        );
      })}
    </div>

    {adding && <NewDealModal store={store} defaultStage={addStage} onClose={() => setAdding(false)} />}
  </>);
}

/* ============================================================
   FLOW-EDITOR, de ondernemer schrijft zijn hele pijplijn uit:
   stappen, wachttijd per stap, en welke actie Hugo inschiet.
   ============================================================ */
function PipelineFlowEditor({ store, onClose }) {
  const [flow, setFlow] = useStateS2(() => getFlow(store).filter((s) => !s.terminal).map((s) => ({ ...s })));
  const won = getFlow(store).find((s) => s.terminal) || DEFAULT_FLOW[DEFAULT_FLOW.length - 1];

  const upd = (i, patch) => setFlow((f) => f.map((s, j) => j === i ? { ...s, ...patch } : s));
  const cycleAccent = (i) => { const cur = flow[i].accent; const ni = (ACCENT_CYCLE.indexOf(cur) + 1) % ACCENT_CYCLE.length; upd(i, { accent: ACCENT_CYCLE[ni] }); };
  const remove = (i) => setFlow((f) => f.length <= 1 ? f : f.filter((_, j) => j !== i));
  const moveStep = (i, dir) => setFlow((f) => { const j = i + dir; if (j < 0 || j >= f.length) return f; const n = [...f]; [n[i], n[j]] = [n[j], n[i]]; return n; });
  const addStep = () => setFlow((f) => [...f, { key: "st" + Date.now().toString(36), label: "Nieuwe fase", accent: ACCENT_CYCLE[f.length % ACCENT_CYCLE.length], target: 3, act: "mail", cta: "Actie klaarzetten" }]);
  const save = () => { saveFlow(store, [...flow, won]); toast("Pijplijn-flow opgeslagen", { icon: "check" }); onClose(); };
  const reset = async () => { if (await confirmAsk({ title: "Flow terugzetten?", sub: "De standaard-pijplijn wordt hersteld. Verplaatste deals blijven staan.", danger: false, confirmLabel: "Terugzetten" })) { setFlow(DEFAULT_FLOW.filter((s) => !s.terminal).map((s) => ({ ...s }))); } };

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div className="modal flow-modal" onClick={(e) => e.stopPropagation()}>
        <header className="modal-head">
          <div>
            <div className="modal-eyebrow mono" style={{ color: "var(--a-red)" }}>Pipeline · Sales</div>
            <h3 className="modal-title">Jouw pijplijn-flow</h3>
          </div>
          <button className="icon-btn" onClick={onClose}><span dangerouslySetInnerHTML={{ __html: ICONS("close", { sw: 2 }) }} /></button>
        </header>
        <div className="modal-body">
          <div className="flow-intro mono">Elke stap is een fase op je bord. De <b>wachttijd</b> bepaalt wanneer Hugo automatisch een taak inschiet als een deal blijft liggen. Sleep met de pijltjes om de volgorde te wijzigen.</div>
          <div className="flow-tl">
            {flow.map((s, i) => (
              <div className="flow-row" key={s.key}>
                <div className="flow-rail">
                  <button className="flow-dot" style={{ background: AC(s.accent) }} onClick={() => cycleAccent(i)} title="Kleur wisselen" />
                  {i < flow.length - 1 && <span className="flow-line" />}
                </div>
                <div className="flow-step" style={{ "--acc": AC(s.accent) }}>
                  <div className="flow-step-top">
                    <span className="flow-step-n mono">Fase {i + 1}</span>
                    <input className="flow-label" value={s.label} onChange={(e) => upd(i, { label: e.target.value })} placeholder="Naam van de fase" />
                    <div className="flow-reorder">
                      <button disabled={i === 0} onClick={() => moveStep(i, -1)} title="Omhoog"><span style={{ transform: "rotate(-90deg)", display: "flex" }} dangerouslySetInnerHTML={{ __html: ICONS("chevron", { sw: 2.6 }) }} /></button>
                      <button disabled={i === flow.length - 1} onClick={() => moveStep(i, 1)} title="Omlaag"><span style={{ transform: "rotate(90deg)", display: "flex" }} dangerouslySetInnerHTML={{ __html: ICONS("chevron", { sw: 2.6 }) }} /></button>
                      <button className="flow-del" disabled={flow.length <= 1} onClick={() => remove(i)} title="Fase verwijderen"><span dangerouslySetInnerHTML={{ __html: ICONS("trash", { sw: 2 }) }} /></button>
                    </div>
                  </div>
                  <div className="flow-step-cfg">
                    <div className="flow-wait">
                      <span className="flow-cfg-lbl mono">Wachttijd</span>
                      <div className="flow-step-num">
                        <button onClick={() => upd(i, { target: Math.max(1, s.target - 1) })}>−</button>
                        <span className="mono">{s.target} {s.target === 1 ? "dag" : "dagen"}</span>
                        <button onClick={() => upd(i, { target: s.target + 1 })}>+</button>
                      </div>
                    </div>
                    <div className="flow-actpick">
                      <span className="flow-cfg-lbl mono">Daarna schiet Hugo in</span>
                      <div className="flow-act-chips">
                        {FLOW_ACTIONS.map((a) => (
                          <button key={a.key} className={"flow-act-chip" + (s.act === a.key ? " on" : "")} onClick={() => upd(i, { act: a.key })}>
                            <span dangerouslySetInnerHTML={{ __html: ICONS(a.icon, { sw: 2 }) }} />{a.label}
                          </button>
                        ))}
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            ))}
            <div className="flow-row">
              <div className="flow-rail"><button className="flow-add-dot" onClick={addStep}><span dangerouslySetInnerHTML={{ __html: ICONS("plus", { sw: 2.4 }) }} /></button></div>
              <button className="flow-add" onClick={addStep}>Fase toevoegen</button>
            </div>
            <div className="flow-row won">
              <div className="flow-rail"><span className="flow-dot" style={{ background: AC(won.accent) }} /></div>
              <div className="flow-won-step"><span dangerouslySetInnerHTML={{ __html: ICONS("trophy", { sw: 2 }) }} /><div><b>{won.label}</b><span className="mono">Deal wordt klant, Juris maakt het contract</span></div></div>
            </div>
          </div>
        </div>
        <footer className="modal-foot" style={{ justifyContent: "space-between" }}>
          <Btn kind="ghost" onClick={reset}>Standaard herstellen</Btn>
          <div style={{ display: "flex", gap: 10 }}>
            <Btn kind="ghost" onClick={onClose}>Annuleer</Btn>
            <Btn kind="solid" accent="red" icon="check" onClick={save}>Flow opslaan</Btn>
          </div>
        </footer>
      </div>
    </div>
  );
}

function SalesDash({ onOpen }) {
  return (
    <div className="module-page sales-suite" key="sales">
      <header className="sx-hero">
        <div className="sx-hero-logo" style={{ "--acc": AC("red"), "--acc-soft": ACsoft("red") }}>
          <span className="sx-hero-mark"><KyanoMark size={26} color={AC("red")} /></span>
        </div>
        <div className="sx-hero-id">
          <h1 className="sx-hero-h1">Sales</h1>
          <p className="sx-hero-sub mono">Overzicht van je pipeline en omzet, aangestuurd door Hugo en Iris</p>
        </div>
        <div className="sx-hero-acts">
          <Btn kind="soft" accent="red" icon="bars" size="sm" onClick={() => onOpen("pipeline")}>Pipeline</Btn>
          <Btn kind="solid" accent="red" icon="people" size="sm" onClick={() => onOpen("crm")}>Open CRM</Btn>
        </div>
      </header>

      <SalesOverzicht onOpen={onOpen} onCard={openKlantCard} goTab={() => onOpen("pipeline")} />

    </div>
  );
}

/* ---------- OVERZICHT: widget-bord met marktplaats (zoals dashboard) ---------- */
function SalesOverzicht({ onOpen, onCard, goTab }) {
  const store = useStore();
  const [edit, setEdit] = useStateS2(false);
  const custs = allCustomers(store);
  const pipe = SALES_PIPELINE.map((d) => ({ ...d, stage: dealStage(store, d) }));
  const open = pipe.filter((d) => d.stage !== "gewonnen");
  const openValue = open.reduce((s, d) => s + d.value, 0);
  const wonValue = pipe.filter((d) => d.stage === "gewonnen").reduce((s, d) => s + d.value, 0);
  const winBack = custs.filter((c) => c.status === "win-back" || c.status === "old");
  const stale = open.filter((d) => { const c = custById(store, d.cust); return c && daysSinceContact(store, c) > stageTarget(store, d.stage); });
  const byStage = PIPE_STAGES.filter((s) => s.key !== "gewonnen").map((s) => ({ ...s, n: open.filter((d) => d.stage === s.key).length, v: open.filter((d) => d.stage === s.key).reduce((a, d) => a + d.value, 0) }));

  return (
    <>
      <div className="sx-overz-bar">
        <div className="sx-kpis">
          <div className="sx-kpi"><div className="sx-kpi-v" style={{ color: AC("red") }}>{eur(openValue)}</div><div className="sx-kpi-l mono">open pipeline</div></div>
          <div className="sx-kpi"><div className="sx-kpi-v">{open.length}</div><div className="sx-kpi-l mono">lopende deals</div></div>
          <div className="sx-kpi"><div className="sx-kpi-v" style={{ color: AC("green") }}>{eur(wonValue)}</div><div className="sx-kpi-l mono">gewonnen · mnd</div></div>
          <div className="sx-kpi"><div className="sx-kpi-v" style={{ color: stale.length ? AC("orange") : "var(--ink1)" }}>{stale.length}</div><div className="sx-kpi-l mono">staan stil</div></div>
        </div>
        <button className="tb-btn" onClick={() => setEdit((v) => !v)}>
          <span dangerouslySetInnerHTML={{ __html: ICONS(edit ? "check" : "sliders", { sw: 2 }) }} />{edit ? "Klaar" : "Bewerk"}
        </button>
      </div>

      <WidgetsProvider moduleId="sales" editing={edit}>
        <div className={"page-body pw-grid" + (edit ? " pw-edit" : "")}>
          <Panel wid="Pijplijn" eyebrow="Nieuwe klanten · per fase" title="Pijplijn" accent="red"
            right={<Btn kind="tint" accent="red" size="sm" onClick={() => goTab("pipeline")}>Naar pipeline</Btn>}>
            <div className="sx-funnel">
              {byStage.map((s) => {
                const max = Math.max(...byStage.map((x) => x.v), 1);
                return (
                  <div className="sx-funnel-row" key={s.key}>
                    <span className="sx-funnel-lbl">{s.label}</span>
                    <div className="sx-funnel-track"><span className="sx-funnel-bar" style={{ width: Math.max(6, (s.v / max) * 100) + "%", background: AC(s.accent) }} /></div>
                    <span className="sx-funnel-v mono">{s.n} · {eur(s.v)}</span>
                  </div>
                );
              })}
            </div>
          </Panel>

          <Panel wid="Aandacht" eyebrow="Wat vandaag telt" title="Aandacht van Hugo" accent="orange">
            {stale.length === 0 && winBack.length === 0 && <div className="sx-attn-empty mono">Niets blijft liggen, mooi werk.</div>}
            {stale.slice(0, 2).map((d) => { const c = custById(store, d.cust); const since = daysSinceContact(store, c); return (
              <div className="sx-attn" key={d.id} onClick={() => onCard(d.cust)}>
                <span className="sx-attn-ic" style={{ color: AC("orange"), background: ACsoft("orange") }} dangerouslySetInnerHTML={{ __html: ICONS("bell") }} />
                <div className="sx-attn-main"><b>{c.name}</b><span>{since >= 9000 ? "Nog geen contact gelogd" : "Geen contact in " + since + " " + (since === 1 ? "dag" : "dagen")} · “{STAGE_BY[d.stage].label}” · {eur(d.value)}</span></div>
                <Btn kind="soft" accent="orange" size="sm" onClick={(e) => { e.stopPropagation(); toast("Hugo port " + c.name, { agent: "hugo" }); }}>Por</Btn>
              </div>
            ); })}
            {winBack.slice(0, 2).map((c) => (
              <div className="sx-attn" key={c.id} onClick={() => onCard(c.id)}>
                <span className="sx-attn-ic" style={{ color: AC("red"), background: ACsoft("red") }} dangerouslySetInnerHTML={{ __html: ICONS("refresh") }} />
                <div className="sx-attn-main"><b>{c.name}</b><span>{custIdleLabel(store, c)} · win-back kans</span></div>
                <Btn kind="soft" accent="red" size="sm" onClick={(e) => { e.stopPropagation(); toast("Win-back mail voor " + c.name + " · Iris", { agent: "iris" }); }}>Mail</Btn>
              </div>
            ))}
          </Panel>

          <Panel wid="Omzet-trend" eyebrow="Gewonnen omzet · dit jaar" title="Omzet-trend" accent="green">
            <div style={{ padding: "6px 2px 0" }}>
              <AreaChart data={[6.2, 7.1, 6.8, 8.4, 9.0, 9.1, 11.2]} accent="green" height={180} labels={["jan", "feb", "mrt", "apr", "mei", "jun", "jul"]} gridlines />
            </div>
          </Panel>

          <Panel wid="Recente deals" eyebrow="Laatst bijgewerkt" title="Recente deals" accent="navy">
            {pipe.slice(0, 5).map((d) => { const c = custById(store, d.cust); return (
              <div className="sx-deal-row" key={d.id} onClick={() => onCard(d.cust)}>
                <Avatar name={c.name} size={34} />
                <div className="sx-deal-main"><div className="sx-deal-top"><b>{c.name}</b><span className="sx-deal-stage" style={{ color: AC(STAGE_BY[d.stage].accent), background: ACsoft(STAGE_BY[d.stage].accent) }}>{STAGE_BY[d.stage].label}</span></div><div className="sx-deal-sub mono">{eur(d.value)} · via {d.owner}</div></div>
                <span className="sx-deal-chev" dangerouslySetInnerHTML={{ __html: ICONS("arrow") }} />
              </div>
            ); })}
          </Panel>
        </div>
        <HiddenTray />
      </WidgetsProvider>
    </>
  );
}

export {
  SalesDash, SalesPipeline, SalesOverzicht, PipelineSummaryBar, NewDealModal, PipelineFlowEditor,
  PIPE_STAGES, STAGE_BY, SALES_PIPELINE, eur, dealStage, daysSinceContact, stageTarget, stageByKey,
  StatusDot, STATUS_META, custAttention, custIdleMonths, custIdleLabel, custNext, setCustNext, DUE_META,
  custDeal, riskValue, riskLabel, custKvk, custKind, custLegal, custWebsite, custAddress, custContacts, addCustContact,
  CRM_NEXT, LOG_AC, LOG_IC, idleLabel, addCustLog, buildSeedTimeline, custTimeline,
};
