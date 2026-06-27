/* ============================================================
   Inbox-module uit de Claude Design-blauwdruk (05-inbox). Postvak met meerdere
   kanalen, gesprekkenlijst, full-screen thread + contactpaneel (klantkaart naast
   het gesprek). Kanalen via channels.js (adapter), klantdata via customers.js
   (gedeelde bron), aanmaken via ObjectActions. ESM-port: window -> imports,
   body letterlijk (m.u.v. QuickCreateModal -> ObjectActions). Demo-data.
   ============================================================ */
import React from 'react'
import { ICONS } from './icons'
import { KYANO } from './data'
import { useStore, setState, toast, focusRecord } from './store.jsx'
import { AC, ACsoft, Avatar } from './components.jsx'
import { useSmartMenu } from './menus'
import { ObjectActions, openKlantCard } from './objectactions.jsx'
import { currentActor, asgFirst, logToCustomer } from './assign.jsx'
import { clientFirst } from './dashboard.jsx'
import { CH_META, ChannelAvatar } from './channels.jsx'
import { allCustomers } from './customers.js'

const { useState: useStateH, useRef: useRefH, useEffect: useEffectH } = React;

/* lokale veld-popover-haak (CRM FieldPicker volgt later; knop werkt nu al) */
function useFieldPop() {
  const [open, setOpen] = useStateH(false);
  const ref = useRefH(null);
  useEffectH(() => {
    if (!open) return;
    const h = (e) => { if (ref.current && !ref.current.contains(e.target)) setOpen(false); };
    window.addEventListener("pointerdown", h);
    return () => window.removeEventListener("pointerdown", h);
  }, [open]);
  return [open, setOpen, ref];
}


const SNOOZE_OPTIONS = [
  { id: "tomorrow", label: "Morgen ochtend", sub: "09:00", icon: "clock" },
  { id: "day-after", label: "Overmorgen", sub: "09:00", icon: "calendar" },
  { id: "three-days", label: "Over 3 dagen", sub: "09:00", icon: "calendar" },
  { id: "next-week", label: "Volgende week", sub: "maandag 09:00", icon: "calendar" },
  { id: "next-month", label: "Volgende maand", sub: "+30 dagen", icon: "calendar" },
  { id: "reply", label: "Tot ze reageren", sub: "Status wordt 'Wacht op reactie'", icon: "clock", special: true },
];
const LANGS = [["en", "Engels"], ["de", "Duits"], ["fr", "Frans"], ["es", "Spaans"], ["it", "Italiaans"]];
const CANNED_TL = {
  en: "Hi! Yes, that works for us. Let me confirm the details and get back to you shortly. Best, Ramon",
  de: "Hallo! Ja, das passt für uns. Ich bestätige die Details und melde mich in Kürze. Beste Grüße, Ramon",
  fr: "Bonjour ! Oui, cela nous convient. Je confirme les détails et reviens vers vous rapidement. Cordialement, Ramon",
  es: "¡Hola! Sí, nos viene bien. Confirmo los detalles y te respondo en breve. Un saludo, Ramon",
  it: "Ciao! Sì, per noi va bene. Confermo i dettagli e ti rispondo a breve. Cordiali saluti, Ramon",
};

/* ── Templates / snelle antwoorden (/) ── */
const TEMPLATES = [
  { k: "offerte", title: "Offerte volgt", body: "Bedankt voor je bericht! Ik stel vandaag de offerte op en stuur 'm je vóór het einde van de dag toe.", icon: "doc" },
  { k: "bevestig", title: "Datum bevestigen", body: "Top, de datum staat genoteerd! Je ontvangt zo de bevestiging met alle details. Tot dan!", icon: "check" },
  { k: "bellen", title: "Belmoment voorstellen", body: "Zullen we even kort bellen om het door te nemen? Ik kan morgen tussen 10:00 en 12:00, schikt dat?", icon: "phone" },
  { k: "dank", title: "Bedankt, kom erop terug", body: "Dank voor je bericht! Ik duik erin en kom er uiterlijk morgen bij je op terug.", icon: "reply" },
  { k: "factuur", title: "Betaalherinnering", body: "Een vriendelijke herinnering: de factuur staat nog open. Lukt het om deze week te voldoen? Alvast bedankt!", icon: "invoice" },
  { k: "afwezig", title: "Even niet bereikbaar", body: "Ik ben deze week beperkt bereikbaar, maar pak je vraag uiterlijk maandag op. Bedankt voor je geduld!", icon: "clock" },
];

/* ── Slimme triage: AI-categorie per gesprek ── */
const CATEGORIES = [
  { k: "lead", label: "Lead", accent: "blue", match: ["lead", "warm"] },
  { k: "klant", label: "Klant", accent: "green", match: ["klant"] },
  { k: "offerte", label: "Offerte", accent: "teal", match: ["offerte"] },
  { k: "factuur", label: "Factuur", accent: "orange", match: ["factuur"] },
];
function catOf(conv) {
  const tags = (conv.tags || []).map((t) => t.toLowerCase());
  for (const c of CATEGORIES) if (c.match.some((m) => tags.some((t) => t.includes(m)))) return c;
  return { k: "algemeen", label: "Algemeen", accent: "navy", match: [] };
}

/* ── Team voor toewijzen ── */
const TEAM = [
  { k: "ramon", name: "Ramon", role: "Jij", accent: "teal" },
  { k: "iris", name: "Iris", role: "Directiesecretaresse", accent: "teal" },
  { k: "hugo", name: "Hugo", role: "Sales", accent: "red" },
  { k: "sam", name: "Sam", role: "Communicatie", accent: "blue" },
  { k: "mila", name: "Mila", role: "Marketing", accent: "purple" },
];

/* ── Instelbare snelle knoppen op de rij (hergebruikt het CRM-veldkiezer-patroon) ──
   Cascade: de tenant (Kyano) zet de basis-set van beschikbare knoppen, de
   ondernemer fijnregelt daarbinnen welke hij ziet — net als bij het toewijs-recht.
   De functionaliteit van de acties zelf verandert niet. */
const INBOX_QUICKACT_DEFS = [
  { key: "done", label: "Afhandelen", icon: "check", accent: "green", group: "Snelle knoppen", title: "Afhandelen",
    run: (c, h) => { h.setStatus(c.id, "done", "Beantwoord"); toast("Afgehandeld", { icon: "check" }); } },
  { key: "snooze", label: "Snooze / opvolgen", icon: "snooze", accent: "orange", group: "Snelle knoppen", title: "Opvolgen / snooze",
    run: (c, h) => h.setSnoozeFor(c) },
  { key: "share", label: "Doorsturen", icon: "share", accent: "teal", group: "Snelle knoppen", title: "Doorsturen",
    run: (c) => toast("Doorsturen " + c.name + "…", { icon: "share" }) },
  { key: "archive", label: "Archiveren", icon: "box", accent: "navy", group: "Snelle knoppen", title: "Archiveren",
    run: (c, h) => { h.setStatus(c.id, "archived", ""); toast("Gearchiveerd", { icon: "box", kind: "muted" }); } },
];
const INBOX_QUICKACT_BY = Object.fromEntries(INBOX_QUICKACT_DEFS.map((d) => [d.key, d]));
const INBOX_QUICKACT_BASE = ["done", "snooze", "share", "archive"];      // tenant-basis (beschikbaar)
const INBOX_QUICKACT_DEFAULT = ["done", "snooze", "share", "archive"];   // ondernemer-default (zichtbaar)

/* ── Instelbare meta-velden in de rij (zelfde veldkiezer-stijl als CRM-kolommen) ── */
const INBOX_META_DEFS = [
  { key: "assignee", label: "Toegewezene", group: "Meta-velden" },
  { key: "company", label: "Bedrijf", group: "Meta-velden" },
  { key: "channel", label: "Kanaal", group: "Meta-velden" },
  { key: "date", label: "Datum", group: "Meta-velden" },
  { key: "time", label: "Tijd", group: "Meta-velden" },
];
const INBOX_META_DEFAULT = ["assignee", "company", "date", "time"];

/* knop + popover in CRM-stijl, hergebruikt window.FieldPicker + useFieldPop */
function InboxToolBtn({ icon, label, sel, pool, onChange, title, hint, lockKeys }) {
  const [open, setOpen, ref] = useFieldPop();
  const FP = window.FieldPicker;
  return (
    <div className="crm-tool-wrap" ref={ref}>
      <button className={"crm-tool-btn" + (open ? " on" : "")} onClick={() => setOpen((v) => !v)}>
        <span dangerouslySetInnerHTML={{ __html: ICONS(icon, { sw: 1.9 }) }} />{label}<span className="crm-tool-n">{sel.length}</span>
      </button>
      {open && FP && <FP pool={pool} sel={sel} onChange={onChange} lockKeys={lockKeys} title={title} hint={hint} />}
    </div>
  );
}

/* ── Mini-CRM context: koppel gesprek aan deal + offerte ── */
function findModule(id) { try { return KYANO.modules.find((m) => m.id === id); } catch (e) { return null; } }
function ctxLookup(conv) {
  const key = conv.name.toLowerCase().split(" ")[0];
  const sales = findModule("sales");
  const offM = findModule("offertes");
  const norm = (s) => (s || "").toLowerCase();
  const deal = sales && sales.deals && sales.deals.find((d) => norm(d.name).includes(key) || norm(conv.name).includes(norm(d.name).split(",")[0]));
  const offerte = offM && offM.list && offM.list.find((o) => norm(o.name).includes(key) || norm(o.contact).includes(key));
  return { deal, offerte };
}

/* koppel een gesprek aan een bestaande klant in het gedeelde CRM, op
   opgeslagen link, e-mail of naam/bedrijf (zo komt alle klantdata uit
   de gedeelde klantkaart i.p.v. een eigen mini-versie). */
const _FC_STOP = new Set(["hotel", "events", "event", "group", "retail", "horeca", "hospitality", "partnership", "partnerships", "bureau", "amsterdam", "the", "van", "der", "pers", "priv"]);
function findCustomer(store, conv) {
  const all = allCustomers(store);
  const norm = (s) => (s || "").toLowerCase().trim();
  const linked = store.get("hub.custlink." + conv.id, null);
  if (linked) { const m = all.find((c) => c.id === linked); if (m) return m; }
  if (conv.custId) { const m = all.find((c) => c.id === conv.custId); if (m) return m; }
  const email = norm(conv.email);
  if (email) { const m = all.find((c) => norm(c.email) === email); if (m) return m; }
  const nm = norm(conv.name), co = norm(conv.company);
  let m = all.find((c) => { const cn = norm(c.name); return cn && (cn === nm || cn === co); });
  if (m) return m;
  const toks = (nm + " " + co).split(/[^a-z0-9]+/).filter((t) => t.length > 3 && !_FC_STOP.has(t));
  m = all.find((c) => { const cn = norm(c.name); return toks.some((t) => cn.includes(t)); });
  return m || null;
}

/* maak een nieuwe klant uit de afzender van een gesprek: persisteer in de
   gedeelde klantenlijst (sales.customers), koppel het gesprek en log het op
   de klant-tijdlijn met actor + tijd. Geeft het nieuwe klant-id terug. */
function makeCustomerFromConv(store, conv) {
  const id = "nc" + Date.now().toString(36);
  const cust = {
    id, name: conv.name, contact: conv.name, company: conv.company || "",
    city: "Amsterdam", x: 44 + Math.random() * 8, y: 38 + Math.random() * 8,
    sector: "Nieuw", status: "prospect", monthly: 0, since: null, idle: 0,
    employees: "–", email: conv.email || "", phone: conv.phone || "", deals: 0,
    iris: "Aangemaakt vanuit de inbox, vanuit het gesprek met " + conv.name + ".",
  };
  setState("sales.customers", [cust, ...store.get("sales.customers", [])]);
  setState("hub.custlink." + conv.id, id);   // koppel gesprek ↔ klant
  const actor = (currentActor && currentActor()) || { name: "Ramon" };
  const who = asgFirst ? asgFirst(actor.name) : actor.name.split(" ")[0];
  if (logToCustomer) logToCustomer(id, who + " maakte de klant aan vanuit de inbox");
  return id;
}

/* Heldere datum + tijd per rij, afgeleid van het 'time'-veld (referentie: wo 17 jun 2026) */
const HUB_NOW = new Date(2026, 5, 17, 10, 30);
const HUB_MM = ["jan", "feb", "mrt", "apr", "mei", "jun", "jul", "aug", "sep", "okt", "nov", "dec"];
const HUB_DOW = { zo: 0, ma: 1, di: 2, wo: 3, do: 4, vr: 5, za: 6 };
function hubFmtDate(d) {
  const same = (a, b) => a.getDate() === b.getDate() && a.getMonth() === b.getMonth() && a.getFullYear() === b.getFullYear();
  const y = new Date(HUB_NOW); y.setDate(y.getDate() - 1);
  if (same(d, HUB_NOW)) return "Vandaag";
  if (same(d, y)) return "Gisteren";
  return d.getDate() + " " + HUB_MM[d.getMonth()];
}
function hubRowDateTime(c) {
  const t = (c.time || "").trim();
  const grabTime = (s) => { const m = (s || "").match(/(\d{1,2}:\d{2})/); return m ? m[1] : null; };
  const lastMsg = (c.messages && c.messages.length) ? c.messages[c.messages.length - 1] : null;
  const clock = grabTime(t) || (lastMsg && grabTime(lastMsg.time)) || null;
  let date = null;
  if (/^\d{1,2}:\d{2}$/.test(t)) { date = new Date(HUB_NOW); }
  else if (/^gisteren/i.test(t)) { date = new Date(HUB_NOW); date.setDate(date.getDate() - 1); }
  else if (/^vandaag/i.test(t)) { date = new Date(HUB_NOW); }
  else if (/^(\d+)\s*d$/.test(t)) { const n = +t.match(/^(\d+)/)[1]; date = new Date(HUB_NOW); date.setDate(date.getDate() - n); }
  else if (/^(\d+)\s*(dag|dagen)/i.test(t)) { const n = +t.match(/^(\d+)/)[1]; date = new Date(HUB_NOW); date.setDate(date.getDate() - n); }
  else if (HUB_DOW[t.toLowerCase().slice(0, 2)] !== undefined && t.length <= 3) {
    date = new Date(HUB_NOW); const want = HUB_DOW[t.toLowerCase().slice(0, 2)];
    let diff = (date.getDay() - want + 7) % 7; if (diff === 0) diff = 7; date.setDate(date.getDate() - diff);
  }
  return { date: date ? hubFmtDate(date) : (t || "–"), time: clock };
}

function Pop({ open, onClose, children, className }) {
  useEffectH(() => {
    if (!open) return;
    const h = () => onClose();
    window.addEventListener("pointerdown", h);
    return () => window.removeEventListener("pointerdown", h);
  }, [open]);
  const smRef = useSmartMenu({ dep: open, align: "start", margin: 12 });
  if (!open) return null;
  return <div className={"hub-pop " + (className || "")} ref={smRef} onPointerDown={(e) => e.stopPropagation()}>{children}</div>;
}

function SnoozeModal({ name, onPick, onClose }) {
  const [date, setDate] = useStateH("2026-06-17");
  const [time, setTime] = useStateH("09:00");
  return (
    <div className="modal-overlay" onPointerDown={onClose}>
      <div className="snooze-modal" onPointerDown={(e) => e.stopPropagation()}>
        <header className="snooze-head">
          <div><div className="snooze-title">Snooze bericht</div><div className="snooze-sub">Verberg {name} tijdelijk uit je inbox</div></div>
          <button className="icon-btn" onClick={onClose}><span dangerouslySetInnerHTML={{ __html: ICONS("close", { sw: 2 }) }} /></button>
        </header>
        <div className="snooze-list">
          {SNOOZE_OPTIONS.map((o) => (
            <button key={o.id} className={"snooze-opt" + (o.special ? " special" : "")} onClick={() => onPick(o.label)}>
              <span className="snooze-ic"><span dangerouslySetInnerHTML={{ __html: ICONS(o.icon) }} /></span>
              <span className="snooze-opt-main"><b>{o.label}</b><span>{o.sub}</span></span>
              <span className="snooze-arrow" dangerouslySetInnerHTML={{ __html: ICONS("arrow") }} />
            </button>
          ))}
        </div>
        <div className="snooze-manual">
          <div className="snooze-manual-h mono">📌 Kies datum &amp; tijd</div>
          <div className="snooze-manual-row">
            <input type="date" value={date} onChange={(e) => setDate(e.target.value)} />
            <input type="time" value={time} onChange={(e) => setTime(e.target.value)} />
            <button className="snooze-go" onClick={() => onPick(date.split("-").reverse().join("/") + " " + time)}>Snooze</button>
          </div>
        </div>
      </div>
    </div>
  );
}

/* ── In-thread media (spraakbericht · bijlage · afbeelding) ── */
function MsgAttach({ attach }) {
  if (!attach) return null;
  if (attach.type === "voice") {
    return (
      <div className="msg-voice">
        <button className="msg-voice-play" dangerouslySetInnerHTML={{ __html: ICONS("play", { sw: 0 }) }} />
        <span className="msg-voice-wave">{[6, 12, 8, 16, 10, 18, 9, 14, 7, 13, 6, 11, 8].map((h, i) => <i key={i} style={{ height: h }} />)}</span>
        <span className="msg-voice-dur mono">{attach.dur}</span>
      </div>
    );
  }
  if (attach.type === "file") {
    return (
      <div className="msg-file">
        <span className="msg-file-ic" dangerouslySetInnerHTML={{ __html: ICONS("doc", { sw: 1.8 }) }} />
        <span className="msg-file-meta"><b>{attach.name}</b><span className="mono">{attach.size}</span></span>
        <button className="msg-file-dl" title="Download" dangerouslySetInnerHTML={{ __html: ICONS("download", { sw: 1.9 }) }} />
      </div>
    );
  }
  return null;
}
function TypingDots({ name }) {
  return <div className="typing-row"><span className="typing-bubble"><i /><i /><i /></span><span className="typing-lbl mono">{name} is aan het typen…</span></div>;
}

/* Inklapbare sectie binnen de CRM-kaart */
function CpSec({ title, count, defaultOpen = true, children }) {
  const [open, setOpen] = useStateH(defaultOpen);
  return (
    <div className={"cp-sec" + (open ? " open" : " closed")}>
      <button className="cp-sec-h mono" onClick={() => setOpen(!open)}>
        <span className="cp-sec-t">{title}{count != null && <span className="cp-note-n">{count}</span>}</span>
        <span className="cp-sec-caret" dangerouslySetInnerHTML={{ __html: ICONS("chevron", { sw: 2.2 }) }} />
      </button>
      {open && <div className="cp-sec-body">{children}</div>}
    </div>
  );
}

/* ── Mini-CRM contactpaneel naast de thread ── */
function ContactPanel({ conv, onClose, onOpen }) {
  const store = useStore();
  const assignee = store.get("hub.assignee." + conv.id, "ramon");
  const notes = store.get("hub.notes." + conv.id, []);
  const [pickAssign, setPickAssign] = useStateH(false);
  const { deal, offerte } = ctxLookup(conv);
  const cat = catOf(conv);
  const assignT = TEAM.find((t) => t.k === assignee) || TEAM[0];
  const cust = findCustomer(store, conv);
  const createClient = () => {
    const id = makeCustomerFromConv(store, conv);
    toast(conv.name + " toegevoegd aan het CRM", { icon: "check", agent: "iris" });
    if (openKlantCard) openKlantCard(id); else setState("crm.full", id);                   // open meteen de gedeelde kaart
  };
  return (
    <aside className="contact-panel">
      <div className="cp-top">
        <ChannelAvatar ch={conv.ch} size={52} />
        <div className="cp-id">
          <div className="cp-name">{conv.name}</div>
          <div className="cp-co mono">{conv.company}</div>
        </div>
        <button className="icon-btn cp-close" onClick={onClose} title="Paneel verbergen"><span dangerouslySetInnerHTML={{ __html: ICONS("close", { sw: 2 }) }} /></button>
      </div>

      {/* korte context: kanaal + categorie + labels — volledige gegevens komen uit de gedeelde klantkaart */}
      <div className="cp-tags">
        <span className="cp-chan" style={{ color: AC(CH_META[conv.ch].accent), background: ACsoft(CH_META[conv.ch].accent) }}>{CH_META[conv.ch].label}</span>
        <span className="cp-cat" style={{ color: AC(cat.accent), background: ACsoft(cat.accent) }}>{cat.label}</span>
        {(conv.tags || []).map((t, i) => <span key={i} className="cp-tag">{t}</span>)}
      </div>

      <div className="cp-openrow">
        {cust ? (
          <ObjectActions only={["klant", "vandaag"]} klantLabel="Volledige klantkaart openen"
            obj={{ type: "conversation", key: "hubconv:" + conv.id, title: conv.subject || conv.name, custId: cust.id, custName: conv.name }} />
        ) : (
          <button className="cp-open-crm cp-new" onClick={createClient}>
            <span dangerouslySetInnerHTML={{ __html: ICONS("plus", { sw: 2 }) }} />Nieuwe klant aanmaken
            <span className="cp-open-go" dangerouslySetInnerHTML={{ __html: ICONS("arrow", { sw: 2 }) }} />
          </button>
        )}
        {!cust && <div className="cp-new-hint mono">Deze afzender staat nog niet in je CRM.</div>}
      </div>

      {(deal || offerte) && (
        <CpSec title="Gekoppeld">
          {deal && (
            <button className="cp-link" onClick={() => { focusRecord("sales", deal.name); onOpen && onOpen("sales"); }}>
              <span className="cp-link-ic" style={{ color: AC("red"), background: ACsoft("red") }} dangerouslySetInnerHTML={{ __html: ICONS("chartup", { sw: 1.8 }) }} />
              <span className="cp-link-main"><b>{deal.name}</b><span className="mono">{deal.v} · {deal.stage}</span></span>
              <span className="cp-link-go" dangerouslySetInnerHTML={{ __html: ICONS("arrow", { sw: 2 }) }} />
            </button>
          )}
          {offerte && (
            <button className="cp-link" onClick={() => { focusRecord("offertes", offerte.name); onOpen && onOpen("offertes"); }}>
              <span className="cp-link-ic" style={{ color: AC("teal"), background: ACsoft("teal") }} dangerouslySetInnerHTML={{ __html: ICONS("doc", { sw: 1.8 }) }} />
              <span className="cp-link-main"><b>Offerte · {offerte.pkg}</b><span className="mono">{offerte.v} · {offerte.status}</span></span>
              <span className="cp-link-go" dangerouslySetInnerHTML={{ __html: ICONS("arrow", { sw: 2 }) }} />
            </button>
          )}
        </CpSec>
      )}

      <CpSec title="Toegewezen aan" defaultOpen={false}>
        <div className="hub-act-wrap">
          <button className="cp-assign" onClick={() => setPickAssign(!pickAssign)}>
            <Avatar agent={assignT.k === "ramon" ? null : assignT.k} accent={assignT.accent} size={26} />
            <span className="cp-assign-name">{assignT.name}</span>
            <span className="cp-assign-role mono">{assignT.role}</span>
            <span className="cp-assign-caret" dangerouslySetInnerHTML={{ __html: ICONS("arrow", { sw: 2 }) }} />
          </button>
          <Pop open={pickAssign} onClose={() => setPickAssign(false)}>
            {TEAM.map((t) => (
              <button key={t.k} className="hub-pop-item" onClick={() => { setState("hub.assignee." + conv.id, t.k); setPickAssign(false); toast("Toegewezen aan " + t.name, { icon: "check" }); }}>
                <Avatar agent={t.k === "ramon" ? null : t.k} accent={t.accent} size={22} />
                <span className="hub-pop-lbl">{t.name}</span><span className="lang-code mono">{t.role}</span>
              </button>
            ))}
          </Pop>
        </div>
      </CpSec>

      <CpSec title="Interne notities" count={notes.length} defaultOpen={notes.length > 0}>
        {notes.length === 0 && <div className="cp-note-empty mono">Nog geen notities. Schrijf een privé-notitie via 🗒 in de balk onderaan.</div>}
        {notes.map((n, i) => {
          const a = TEAM.find((t) => t.k === n.author) || TEAM[0];
          return (
            <div key={i} className="cp-note">
              <div className="cp-note-head"><Avatar agent={a.k === "ramon" ? null : a.k} accent={a.accent} size={18} /><b>{a.name}</b><span className="mono">{n.time}</span></div>
              <p>{n.text}</p>
            </div>
          );
        })}
      </CpSec>
    </aside>
  );
}

/* ── Nieuw bericht: kies kanaal → ontvanger (CRM of nieuw) → schrijf → versturen.
   Eén rustig opstel-venster, sluit aan op de bestaande compose-stijl + kanalen.
   Een verstuurd bericht wordt een nieuw gesprek (hub.newConvos) en logt op de
   klant-tijdlijn als het aan een bekende klant is gekoppeld. ── */
function ComposeModal({ onClose, onSent }) {
  const store = useStore();
  const [ch, setCh] = useStateH("wa");
  const [mode, setMode] = useStateH("crm");      // crm | new
  const [q, setQ] = useStateH("");
  const [picked, setPicked] = useStateH(null);
  const [addr, setAddr] = useStateH("");
  const [newName, setNewName] = useStateH("");
  const [body, setBody] = useStateH("");
  const [tplOpen, setTplOpen] = useStateH(false);

  const all = allCustomers(store);
  const ql = q.trim().toLowerCase();
  const matches = ql ? all.filter((c) => (c.name + " " + (c.company || "") + " " + (c.email || "")).toLowerCase().includes(ql)).slice(0, 6) : [];
  const chMeta = CH_META[ch];
  const addrPh = ch === "gm" ? "naam@bedrijf.nl" : ch === "wa" ? "+31 6 12 34 56 78" : "Naam of profiel-URL";
  const recipientOk = picked ? true : (newName.trim() && (ch === "li" ? true : addr.trim()));

  const send = () => {
    if (!recipientOk) { toast("Kies of vul een ontvanger in", { icon: "people", kind: "muted" }); return; }
    if (!body.trim()) { toast("Schrijf eerst een bericht", { icon: "pencil", kind: "muted" }); return; }
    const id = "nm" + Date.now().toString(36);
    const now = new Date();
    const clock = String(now.getHours()).padStart(2, "0") + ":" + String(now.getMinutes()).padStart(2, "0");
    const name = picked ? picked.name : newName.trim();
    const company = picked ? (picked.company || picked.sector || "") : "";
    const email = ch === "gm" ? (picked ? picked.email : addr.trim()) : (picked ? picked.email || "" : "");
    const phone = ch === "wa" ? (picked ? picked.phone : addr.trim()) : (picked ? picked.phone || "" : "");
    const conv = {
      id, ch, name, company, account: chMeta.label, email, phone,
      msgCount: 1, time: clock, urgent: false, unread: 0, status: "open", followUp: false,
      tags: [], messages: [], custId: picked ? picked.id : null,
      suggestion: "Bedankt voor je bericht! Ik kom er zo snel mogelijk bij je op terug.",
    };
    setState("hub.newConvos", [conv, ...store.get("hub.newConvos", [])]);
    setState("hub.sent." + id, [{ from: "me", text: body.trim(), time: "nu", read: false }]);
    if (picked && picked.id) {
      setState("hub.custlink." + id, picked.id);
      const actor = (currentActor && currentActor()) || { name: "Ramon" };
      const who = asgFirst ? asgFirst(actor.name) : actor.name.split(" ")[0];
      if (logToCustomer) logToCustomer(picked.id, who + " startte een nieuw gesprek via " + chMeta.label);
    }
    toast("Bericht verstuurd via " + chMeta.label, { icon: "send", agent: "sam" });
    onSent && onSent(id);
    onClose();
  };

  return (
    <div className="modal-overlay" onPointerDown={onClose}>
      <div className="qc-modal cmp-modal" onPointerDown={(e) => e.stopPropagation()}>
        <header className="qc-head">
          <div><div className="qc-title">Nieuw bericht</div><div className="qc-sub mono">via {chMeta.label}{(picked || newName.trim()) ? " · aan " + (picked ? picked.name : newName.trim()) : ""}</div></div>
          <button className="icon-btn" onClick={onClose}><span dangerouslySetInnerHTML={{ __html: ICONS("close", { sw: 2 }) }} /></button>
        </header>
        <div className="qc-body">
          <label className="qc-field"><span className="qc-label mono">Kanaal</span>
            <div className="cmp-channels">
              {["wa", "gm", "li"].map((k) => (
                <button key={k} className={"cmp-ch" + (ch === k ? " on" : "")} onClick={() => { setCh(k); setPicked(null); setAddr(""); }}>
                  <ChannelAvatar ch={k} size={26} />{CH_META[k].label}
                </button>
              ))}
            </div>
          </label>

          <label className="qc-field"><span className="qc-label mono">Aan</span>
            {picked ? (
              <div className="cmp-recip">
                <Avatar name={picked.name} size={28} />
                <div className="cmp-recip-main"><b>{picked.name}</b><span className="mono">{[picked.company || picked.sector, ch === "gm" ? picked.email : picked.phone].filter(Boolean).join(" · ") || "bekende klant"}</span></div>
                <button className="cmp-recip-x" onClick={() => setPicked(null)} title="Wissen"><span dangerouslySetInnerHTML={{ __html: ICONS("close", { sw: 2.2 }) }} /></button>
              </div>
            ) : (<>
              <div className="qc-seg">
                <button className={mode === "crm" ? "on" : ""} onClick={() => setMode("crm")}>Bestaand contact</button>
                <button className={mode === "new" ? "on" : ""} onClick={() => setMode("new")}>Nieuw adres</button>
              </div>
              {mode === "crm" ? (<>
                <input value={q} onChange={(e) => setQ(e.target.value)} placeholder="Zoek een klant in het CRM…" autoFocus />
                {ql && (matches.length ? (
                  <div className="cmp-results">
                    {matches.map((c) => (
                      <button key={c.id} className="cmp-result" onClick={() => { setPicked(c); setQ(""); }}>
                        <Avatar name={c.name} size={26} />
                        <span className="cmp-result-main"><b>{c.name}</b><span className="mono">{[c.company || c.sector, ch === "gm" ? c.email : c.phone].filter(Boolean).join(" · ")}</span></span>
                      </button>
                    ))}
                  </div>
                ) : <div className="cmp-nohit mono">Geen klant gevonden — kies “Nieuw adres”.</div>)}
              </>) : (<>
                <input value={newName} onChange={(e) => setNewName(e.target.value)} placeholder="Naam ontvanger" />
                {ch !== "li" && <input value={addr} onChange={(e) => setAddr(e.target.value)} placeholder={addrPh} inputMode={ch === "wa" ? "tel" : "email"} />}
              </>)}
            </>)}
          </label>

          <label className="qc-field"><span className="qc-label mono">Bericht</span>
            <textarea className="comp-textarea cmp-ta" value={body} onChange={(e) => setBody(e.target.value)} rows={4}
              placeholder={"Schrijf je bericht via " + chMeta.label + "…"} />
            <button className="cmp-tplbtn" onClick={() => setTplOpen(!tplOpen)}><span dangerouslySetInnerHTML={{ __html: ICONS("doc", { sw: 1.8 }) }} />Snelle antwoorden</button>
            {tplOpen && (
              <div className="cmp-tpls">
                {TEMPLATES.map((t) => (
                  <button key={t.k} className="tpl-item" onClick={() => { setBody(t.body); setTplOpen(false); toast("Template '" + t.title + "' ingevoegd", { icon: "doc" }); }}>
                    <span className="tpl-ic" dangerouslySetInnerHTML={{ __html: ICONS(t.icon, { sw: 1.8 }) }} />
                    <span className="tpl-main"><b>{t.title}</b><span>{t.body}</span></span>
                  </button>
                ))}
              </div>
            )}
          </label>
        </div>
        <footer className="qc-foot">
          <button className="qc-cancel" onClick={onClose}>Annuleer</button>
          <button className="qc-go" onClick={send}><span dangerouslySetInnerHTML={{ __html: ICONS("send", { sw: 1.8 }) }} />Versturen</button>
        </footer>
      </div>
    </div>
  );
}

function CommHub({ m, onOpen }) {
  const store = useStore();
  const convos = [...store.get("hub.newConvos", []), ...m.conversations];
  const [chFilter, setChFilter] = useStateH("all");
  const [view, setView] = useStateH("open");
  const [query, setQuery] = useStateH("");
  const [activeId, setActiveId] = useStateH(null);
  const [composeOpen, setComposeOpen] = useStateH(false);
  const [draft, setDraft] = useStateH("");
  const [showCc, setShowCc] = useStateH(false);
  const [loadingAct, setLoadingAct] = useStateH(null);
  const [variants, setVariants] = useStateH(null);
  const [pop, setPop] = useStateH(null);
  const [snoozeFor, setSnoozeFor] = useStateH(null);
  const [rowMenu, setRowMenu] = useStateH(null);
  const [catFilter, setCatFilter] = useStateH("all");
  const [noteMode, setNoteMode] = useStateH(false);
  const [showPanel, setShowPanel] = useStateH(false);
  const bodyRef = useRefH(null);

  /* instelbare snelle knoppen + meta-velden (CRM-veldkiezer-patroon, cascade) */
  const quickBase = store.get("inbox.quickacts.base", INBOX_QUICKACT_BASE);
  const quickPool = INBOX_QUICKACT_DEFS.filter((d) => quickBase.includes(d.key));
  const quickActs = store.get("inbox.quickacts", INBOX_QUICKACT_DEFAULT).filter((k) => quickBase.includes(k));
  const metaFields = store.get("inbox.meta", INBOX_META_DEFAULT);

  const notesKey = (id) => "hub.notes." + id;
  const getNotes = (id) => store.get(notesKey(id), []);
  const assigneeOf = (id) => store.get("hub.assignee." + id, "ramon");

  const sentKey = (id) => "hub.sent." + id;
  const readKey = (id) => "hub.read." + id;
  const getSent = (id) => store.get(sentKey(id), []);
  const statusOf = (c) => store.get("hub.status." + c.id) || (c.status === "done" ? "done" : "open");
  const isPinned = (c) => !!store.get("hub.pin." + c.id);
  const isUrgent = (c) => { const o = store.get("hub.urgent." + c.id); return o === undefined ? c.urgent : o; };
  const setStatus = (id, st, extra) => { setState("hub.status." + id, st); if (extra !== undefined) setState("hub.statusmeta." + id, extra); };

  const counts = {
    open: convos.filter((c) => statusOf(c) === "open").length,
    snoozed: convos.filter((c) => statusOf(c) === "snoozed").length,
    done: convos.filter((c) => statusOf(c) === "done").length,
    archived: convos.filter((c) => statusOf(c) === "archived").length,
  };
  const urgentCount = convos.filter((c) => statusOf(c) === "open" && isUrgent(c)).length;
  const chCounts = { all: 0, wa: 0, gm: 0, li: 0, web: 0 };
  convos.forEach((c) => { if (statusOf(c) === view) { chCounts.all++; chCounts[c.ch]++; } });

  let list = convos.filter((c) => statusOf(c) === view);
  if (chFilter !== "all") list = list.filter((c) => c.ch === chFilter);
  const catCounts = { all: list.length };
  CATEGORIES.forEach((c) => { catCounts[c.k] = list.filter((x) => catOf(x).k === c.k).length; });
  if (catFilter !== "all") list = list.filter((c) => catOf(c).k === catFilter);
  const q = query.toLowerCase().trim();
  if (q) list = list.filter((c) => (c.name + " " + c.company).toLowerCase().includes(q));
  const pinned = list.filter(isPinned), unpinned = list.filter((c) => !isPinned(c));
  const ordered = [...pinned, ...unpinned];
  /* tijd-groepering voor niet-vastgezette gesprekken */
  const bucketOf = (c) => /\d:\d/.test(c.time) ? "vandaag" : (c.time === "gisteren" ? "gisteren" : "eerder");
  const BUCKETS = [["vandaag", "Vandaag"], ["gisteren", "Gisteren"], ["eerder", "Eerder"]];
  const grouped = BUCKETS.map(([k, lbl]) => [lbl, unpinned.filter((c) => bucketOf(c) === k)]).filter(([, arr]) => arr.length);

  const active = convos.find((c) => c.id === activeId);
  const activeMsgs = active ? [...active.messages, ...getSent(active.id)] : [];
  const isEmail = active && active.ch === "gm";
  const followUpNeeded = active && (active.followUp || (activeMsgs.length && activeMsgs[activeMsgs.length - 1].from === "me"));

  useEffectH(() => { if (active) setState(readKey(active.id), true); }, [active && active.id]);
  useEffectH(() => {
    const openId = store.get("hub.openConv", null);
    if (openId && convos.some((c) => c.id === openId)) { setActiveId(openId); setState("hub.openConv", null); }
  }, [store.get("hub.openConv", null)]);
  useEffectH(() => { setDraft(""); setVariants(null); setShowCc(false); setPop(null); }, [active && active.id]);
  useEffectH(() => { if (bodyRef.current) bodyRef.current.scrollTop = bodyRef.current.scrollHeight; },
    [active && active.id, active && JSON.stringify(getSent(active.id))]);

  const send = () => {
    const t = draft.trim(); if (!t || !active) return;
    if (noteMode) {
      setState(notesKey(active.id), [...getNotes(active.id), { author: "ramon", text: t, time: "nu" }]);
      setDraft(""); setNoteMode(false); toast("Interne notitie opgeslagen", { icon: "pencil", kind: "muted" });
      return;
    }
    setState(sentKey(active.id), [...getSent(active.id), { from: "me", text: t, time: "nu", read: false }]);
    setDraft(""); toast("Verstuurd via " + (active.account || CH_META[active.ch].label), { icon: "send", agent: "sam" });
  };
  const insertTemplate = (tpl) => { setDraft(tpl.body); setPop(null); toast("Template '" + tpl.title + "' ingevoegd", { icon: "doc" }); };
  const fakeAI = (key, fn, okMsg) => {
    setLoadingAct(key);
    setTimeout(() => { fn(); setLoadingAct(null); if (okMsg) toast(okMsg, { icon: "spark" }); }, 600);
  };
  const improveNL = () => {
    if (!draft.trim()) { toast("Type eerst een bericht", { icon: "pencil", kind: "muted" }); return; }
    fakeAI("improve", () => {
      let t = draft.trim();
      if (!/^(beste|hoi|hallo|hi|geachte)/i.test(t)) t = "Beste " + active.name.split(" ")[0] + ",\n\n" + t;
      if (!/groet/i.test(t)) t += "\n\nMet vriendelijke groet,\nRamon";
      setDraft(t);
    }, "Tekst verbeterd");
  };
  const translate = (lang) => {
    setPop(null);
    if (!draft.trim()) { toast("Type eerst een bericht", { icon: "globe", kind: "muted" }); return; }
    fakeAI("translate", () => setDraft(CANNED_TL[lang] || draft), "Vertaald naar " + lang.toUpperCase());
  };
  const genVariants = () => fakeAI("variants", () => {
    const base = active.suggestion;
    setVariants([
      { label: "Kort & zakelijk", text: base.split(/(?<=[.?!])\s/)[0] },
      { label: "Warm & persoonlijk", text: base + " 😊 Fijne dag alvast!" },
      { label: "Formeel", text: "Geachte heer/mevrouw,\n\n" + base + "\n\nMet vriendelijke groet,\nRamon, Endless Minds" },
    ]);
  });
  const followUp = () => fakeAI("followup", () => setDraft(
    "Hi " + active.name.split(" ")[0] + ", ik wilde even checken of je mijn vorige bericht hebt kunnen bekijken. Hoor graag van je!"
  ), "Follow-up gegenereerd");
  const copy = () => { if (draft.trim()) toast("Tekst staat op je klembord", { icon: "copy" }); };

  const VIEWS = [
    { k: "open", label: "Open", icon: "inbox", accent: "blue", n: counts.open },
    { k: "snoozed", label: "Snoozed", icon: "clock", accent: "orange", n: counts.snoozed },
    { k: "done", label: "Afgehandeld", icon: "check", accent: "green", n: counts.done },
    { k: "archived", label: "Archief", icon: "box", accent: "navy", n: counts.archived },
  ];
  const CH_FILTERS = [
    { k: "all", label: "Alle", icon: "inbox", accent: "navy" },
    { k: "gm", label: "Email", icon: "gm", accent: "red" },
    { k: "wa", label: "WhatsApp", icon: "wa", accent: "aqua" },
    { k: "li", label: "LinkedIn", icon: "li", accent: "navy" },
    { k: "web", label: "Website", icon: "globe", accent: "teal" },
  ];

  /* ── inline rij-actie ── */
  const RowAct = ({ icon, title, accent, on, onClick }) => (
    <button className={"irow-act" + (on ? " on" : "")} title={title}
      style={on ? { color: AC(accent), background: ACsoft(accent) } : { "--ah": AC(accent), "--ahs": ACsoft(accent) }}
      onClick={(e) => { e.stopPropagation(); onClick(); }}>
      <span dangerouslySetInnerHTML={{ __html: ICONS(icon, { sw: 1.9 }) }} />
    </button>
  );

  const renderRow = (c) => {
    const sent = getSent(c.id);
    const last = sent.length ? sent[sent.length - 1] : c.messages[c.messages.length - 1];
    const unread = !store.get(readKey(c.id)) && c.unread > 0;
    const st = statusOf(c);
    const meta = store.get("hub.statusmeta." + c.id);
    const cat = catOf(c);
    const assignK = assigneeOf(c.id);
    const assignT = TEAM.find((t) => t.k === assignK) || TEAM[0];
    const prev = last.attach ? (last.attach.type === "voice" ? "🎙 Spraakbericht · " + last.attach.dur : "📎 " + last.attach.name) : last.text;
    const dt = hubRowDateTime(c);
    return (
      <div className={"irow" + (unread ? " unread" : "")} key={c.id} onClick={() => setActiveId(c.id)}>
        <ChannelAvatar ch={c.ch} size={40} />
        <div className="irow-main">
          <div className="irow-top">
            <span className="irow-name">{isPinned(c) && <span className="hub-pinmark" dangerouslySetInnerHTML={{ __html: ICONS("pin", { sw: 2 }) }} />}{c.name}</span>
            {c.msgCount > 1 && <span className="hub-msgcount">{c.msgCount}</span>}
            <span className="hub-tag cat" style={{ color: AC(cat.accent), background: ACsoft(cat.accent) }}>{cat.label}</span>
            {isUrgent(c) && st === "open" && <span className="hub-tag urgent">● Urgent</span>}
            {c.followUp && st === "open" && <span className="hub-tag followup">⚑ Follow-up</span>}
            {st === "snoozed" && <span className="hub-tag snoozed">snoozed{meta ? " · " + meta.toLowerCase() : ""}</span>}
            {st === "done" && <span className="hub-tag done">{meta || c.doneNote || "afgehandeld"}</span>}
            {st === "archived" && <span className="hub-tag arch">archief</span>}
          </div>
          <div className="irow-prev">{last.from === "me" ? "Jij: " : ""}{prev}</div>
        </div>
        <div className="irow-right">
          {metaFields.includes("assignee") && (assignK !== "ramon"
            ? <span className="irow-meta irow-assignee" title={"Toegewezen aan " + assignT.name}><Avatar agent={assignT.k} accent={assignT.accent} size={22} /></span>
            : <span className="irow-meta irow-assignee empty" aria-hidden="true"><Avatar agent={null} accent="navy" size={22} /></span>)}
          {metaFields.includes("channel") && <span className="irow-meta irow-channel mono">{CH_META[c.ch].label}</span>}
          {metaFields.includes("company") && <span className="irow-meta irow-company mono">{c.company}</span>}
          {(metaFields.includes("date") || metaFields.includes("time")) && (
            <span className="irow-meta irow-when">
              {metaFields.includes("date") && <span className="irow-date">{dt.date}</span>}
              {metaFields.includes("time") && dt.time && <span className="irow-clock mono">{dt.time}</span>}
            </span>
          )}
        </div>
        <div className="irow-acts" onClick={(e) => e.stopPropagation()}>
          {quickActs.map((k) => { const a = INBOX_QUICKACT_BY[k]; if (!a) return null;
            return <RowAct key={k} icon={a.icon} title={a.title} accent={a.accent} onClick={() => a.run(c, { setStatus, setSnoozeFor })} />; })}
          <div className="irow-more-wrap">
            <button className="irow-act" title="Meer acties" onClick={(e) => { e.stopPropagation(); setRowMenu(rowMenu === c.id ? null : c.id); }}>
              <span dangerouslySetInnerHTML={{ __html: ICONS("dots", { sw: 2 }) }} />
            </button>
            <Pop open={rowMenu === c.id} onClose={() => setRowMenu(null)} className="up">
              <button className="hub-pop-item" onClick={() => { setState("hub.urgent." + c.id, !isUrgent(c)); toast(isUrgent(c) ? "Urgent verwijderd" : "Gemarkeerd als urgent", { icon: "bell" }); setRowMenu(null); }}>
                <span className="hub-pop-ic" style={{ color: AC("red"), background: ACsoft("red") }} dangerouslySetInnerHTML={{ __html: ICONS("bell", { sw: 1.9 }) }} />
                <span className="hub-pop-lbl">{isUrgent(c) ? "Urgent weghalen" : "Markeer urgent"}</span>
              </button>
              <button className="hub-pop-item" onClick={() => { setStatus(c.id, "archived", "Spam"); toast("Gemarkeerd als spam", { icon: "spam", kind: "muted" }); setRowMenu(null); }}>
                <span className="hub-pop-ic" style={{ color: AC("orange"), background: ACsoft("orange") }} dangerouslySetInnerHTML={{ __html: ICONS("spam", { sw: 1.9 }) }} />
                <span className="hub-pop-lbl">Markeer als spam</span>
              </button>
              <button className="hub-pop-item" onClick={() => { setStatus(c.id, "archived", "Geblokkeerd"); toast(c.name + " geblokkeerd", { icon: "ban", kind: "muted" }); setRowMenu(null); }}>
                <span className="hub-pop-ic" style={{ color: AC("red"), background: ACsoft("red") }} dangerouslySetInnerHTML={{ __html: ICONS("ban", { sw: 1.9 }) }} />
                <span className="hub-pop-lbl">Blokkeer afzender</span>
              </button>
            </Pop>
          </div>
        </div>
        {unread && <span className="irow-dot" style={{ background: AC(CH_META[c.ch].accent) }} />}
      </div>
    );
  };

  /* ════════════════ THREAD (full-screen) ════════════════ */
  if (active) {
    return (
      <div className={"inbox thread-mode" + (showPanel ? " with-panel" : "")}>
        <div className="thread-full">
          <header className="hub-thread-head">
            <button className="thread-back" onClick={() => setActiveId(null)} title="Terug naar inbox"><span dangerouslySetInnerHTML={{ __html: ICONS("arrow", { sw: 2 }) }} style={{ transform: "rotate(180deg)" }} /></button>
            <ChannelAvatar ch={active.ch} size={42} />
            <div className="hub-th-id">
              <div className="hub-th-name">
                {isEmail && active.subject ? active.subject : active.name}
                <span className="hub-th-badge" style={{ color: AC(CH_META[active.ch].accent), background: ACsoft(CH_META[active.ch].accent) }}>{active.account || CH_META[active.ch].label}</span>
                {isUrgent(active) && <span className="hub-th-urgent">● Urgent</span>}
                {active.msgCount > 1 && <span className="hub-th-count">{active.msgCount} berichten</span>}
              </div>
              <div className="hub-th-sub">
                {isEmail && active.subject ? (active.name + (active.email ? " · " + active.email : ""))
                  : active.group ? "Groepschat · " + active.group + " deelnemers"
                  : [active.company, active.email, active.phone].filter(Boolean).join(" · ")}
              </div>
            </div>
            <button className="icon-btn" title="Bellen" onClick={() => toast("Belt " + active.name + "…", { icon: "phone" })}><span dangerouslySetInnerHTML={{ __html: ICONS("phone") }} /></button>
            <div className="hub-act-wrap">
              <button className="th-assign" title="Toewijzen" onClick={() => setPop(pop === "assign" ? null : "assign")}>
                {(() => { const a = TEAM.find((t) => t.k === assigneeOf(active.id)) || TEAM[0]; return <><Avatar agent={a.k === "ramon" ? null : a.k} accent={a.accent} size={24} /><span className="th-assign-name">{a.name}</span></>; })()}
              </button>
              <Pop open={pop === "assign"} onClose={() => setPop(null)}>
                {TEAM.map((t) => (
                  <button key={t.k} className="hub-pop-item" onClick={() => { setState("hub.assignee." + active.id, t.k); setPop(null); toast("Toegewezen aan " + t.name, { icon: "check" }); }}>
                    <Avatar agent={t.k === "ramon" ? null : t.k} accent={t.accent} size={22} /><span className="hub-pop-lbl">{t.name}</span><span className="lang-code mono">{t.role}</span>
                  </button>
                ))}
              </Pop>
            </div>
            <div className="hub-act-wrap">
              <button className="icon-btn" title="Download thread" onClick={() => setPop(pop === "download" ? null : "download")}><span dangerouslySetInnerHTML={{ __html: ICONS("download") }} /></button>
              <Pop open={pop === "download"} onClose={() => setPop(null)}>
                <button className="hub-pop-item" onClick={() => { toast("Thread gedownload (.txt)", { icon: "download" }); setPop(null); }}><span className="hub-pop-lbl">Download als tekst (.txt)</span></button>
                <button className="hub-pop-item" onClick={() => { toast("Thread gedownload (.html)", { icon: "download" }); setPop(null); }}><span className="hub-pop-lbl">Download als HTML</span></button>
              </Pop>
            </div>
            <button className={"icon-btn" + (isPinned(active) ? " on" : "")} title="Vastzetten" onClick={() => { setState("hub.pin." + active.id, !isPinned(active)); toast(isPinned(active) ? "Losgemaakt" : "Vastgezet", { icon: "pin" }); }}><span dangerouslySetInnerHTML={{ __html: ICONS("pin") }} /></button>
            <button className={"icon-btn" + (showPanel ? " on" : "")} title="Contactpaneel" onClick={() => setShowPanel(!showPanel)}><span dangerouslySetInnerHTML={{ __html: ICONS("people", { sw: 1.9 }) }} /></button>
          </header>

          <div className="thread-scroll">
            {active.ai && (
              <div className="ai-summary">
                <div className="ai-sum-head"><span dangerouslySetInnerHTML={{ __html: ICONS("spark", { sw: 1.8 }) }} />AI thread-samenvatting
                  <button className="ai-sum-refresh" title="Vernieuwen" onClick={() => toast("Samenvatting vernieuwd", { icon: "sync" })}><span dangerouslySetInnerHTML={{ __html: ICONS("sync", { sw: 1.9 }) }} /></button>
                </div>
                <p className="ai-sum-main">{active.ai.samenvatting}</p>
                <p className="ai-sum-status"><span dangerouslySetInnerHTML={{ __html: ICONS("info", { sw: 1.9 }) }} />{active.ai.status}</p>
                <p className={"ai-sum-actie" + (active.ai.actieGoed ? " ok" : "")}><span dangerouslySetInnerHTML={{ __html: ICONS(active.ai.actieGoed ? "check" : "bell", { sw: 1.9 }) }} />{active.ai.actie}</p>
              </div>
            )}
            {followUpNeeded && statusOf(active) === "open" && (
              <div className="followup-banner">
                <span><span dangerouslySetInnerHTML={{ __html: ICONS("bell", { sw: 1.9 }) }} />Geen reactie ontvangen. Wil je een follow-up sturen?</span>
                <button className="fb-btn" onClick={followUp}><span dangerouslySetInnerHTML={{ __html: ICONS("spark", { sw: 1.9 }) }} />Genereer follow-up</button>
              </div>
            )}
            {statusOf(active) !== "open" && (
              <div className={"hub-statusbar " + statusOf(active)}>
                <span dangerouslySetInnerHTML={{ __html: ICONS(statusOf(active) === "snoozed" ? "clock" : statusOf(active) === "done" ? "check" : "box") }} />
                {statusOf(active) === "snoozed" ? "Gesnoozed tot " + (store.get("hub.statusmeta." + active.id) || "").toLowerCase()
                  : statusOf(active) === "done" ? "Afgehandeld" + (store.get("hub.statusmeta." + active.id) ? " · " + store.get("hub.statusmeta." + active.id) : "")
                  : "Gearchiveerd"}
                <button className="hub-reopen" onClick={() => { setStatus(active.id, "open", ""); toast("Terug naar Open", { icon: "inbox" }); }}>Heropen</button>
              </div>
            )}
            <div className={"hub-msgs" + (isEmail ? " email" : "")} ref={bodyRef}>
              {isEmail ? activeMsgs.map((msg, i) => (
                <div key={i} className={"email-msg" + (msg.from === "me" ? " me" : "")}>
                  <div className="email-msg-head">
                    <Avatar agent={null} accent={msg.from === "me" ? "blue" : CH_META[active.ch].accent} size={30} />
                    <div className="email-from"><b>{msg.from === "me" ? "Jij" : active.name}</b>{msg.from === "me" && <span className="email-sent">{msg.read === false ? "verzonden" : "gelezen"}</span>}</div>
                    <span className="email-time">{msg.time}</span>
                  </div>
                  {msg.reply && <div className="msg-quote"><span className="mono">{msg.reply.name}</span>{msg.reply.text}</div>}
                  <p className="email-body">{msg.text}</p>
                  <MsgAttach attach={msg.attach} />
                </div>
              )) : (<>
                <div className="hub-day mono">begin van het gesprek</div>
                {activeMsgs.map((msg, i) => (
                  <div key={i} className={"hub-bubble " + (msg.from === "me" ? "me" : "them")}>
                    {msg.reply && <span className="msg-quote in"><span className="mono">{msg.reply.name}</span>{msg.reply.text}</span>}
                    {msg.text && <span className="hub-bubble-txt">{msg.text}</span>}
                    <MsgAttach attach={msg.attach} />
                    <span className="hub-bubble-meta">
                      <span className="hub-bubble-time">{msg.time}</span>
                      {msg.from === "me" && <span className={"hub-ticks" + (msg.read === false ? "" : " read")}><span dangerouslySetInnerHTML={{ __html: ICONS("checks", { sw: 2 }) }} /></span>}
                    </span>
                  </div>
                ))}
                {active.ch === "wa" && statusOf(active) === "open" && isUrgent(active) && <TypingDots name={active.name.split(" ")[0]} />}
              </>)}
              {getNotes(active.id).map((n, i) => {
                const a = TEAM.find((t) => t.k === n.author) || TEAM[0];
                return (
                  <div key={"note" + i} className="thread-note">
                    <div className="thread-note-head"><span dangerouslySetInnerHTML={{ __html: ICONS("pencil", { sw: 1.9 }) }} />Interne notitie · <b>{a.name}</b><span className="mono">{n.time}</span></div>
                    <p>{n.text}</p>
                  </div>
                );
              })}
            </div>
          </div>

          <div className="hub-composer">
            {isEmail && (
              <div className="comp-from">
                <span className="mono">Van:</span>
                <span className="comp-account">{active.account}</span>
                <button className="comp-cc" onClick={() => setShowCc(!showCc)}>{showCc ? "CC/BCC verbergen" : "CC/BCC tonen"}</button>
              </div>
            )}
            {isEmail && showCc && (
              <div className="comp-ccfields">
                <input placeholder="CC: email@voorbeeld.nl" />
                <input placeholder="BCC: email@voorbeeld.nl" />
              </div>
            )}
            {variants && (
              <div className="comp-variants">
                <div className="cv-head"><span><span dangerouslySetInnerHTML={{ __html: ICONS("spark", { sw: 1.9 }) }} />Kies een variant</span><button onClick={() => setVariants(null)}>Sluiten</button></div>
                {variants.map((v, i) => (
                  <button key={i} className="cv-opt" onClick={() => { setDraft(v.text); setVariants(null); toast("Variant '" + v.label + "' gekozen", { icon: "check" }); }}>
                    <span className="cv-label">{v.label}</span><span className="cv-text">{v.text}</span>
                  </button>
                ))}
              </div>
            )}
            <div className="hub-suggest-row">
              <button className="hub-suggest" onClick={() => setDraft(active.suggestion)}>
                <Avatar agent="sam" size={20} />
                <span><b>Sam stelt voor</b> · {active.suggestion.slice(0, 72)}…</span>
                <span className="hub-suggest-use">gebruik</span>
              </button>
            </div>
            {noteMode && <div className="note-banner"><span dangerouslySetInnerHTML={{ __html: ICONS("pencil", { sw: 1.9 }) }} />Interne notitie, alleen zichtbaar voor je team, wordt niet verstuurd.<button onClick={() => setNoteMode(false)}>Annuleer</button></div>}
            <div className="comp-ta-wrap">
              <textarea className={"comp-textarea" + (noteMode ? " note" : "")} placeholder={noteMode ? "Schrijf een privé-notitie voor je team…" : (isEmail ? "Typ je antwoord… (⌘/Ctrl+Enter om te versturen · / voor templates)" : "Typ je bericht… (/ voor templates)")}
                value={draft} onChange={(e) => { setDraft(e.target.value); if (e.target.value === "/") setPop("tpl"); }}
                onKeyDown={(e) => { if ((e.metaKey || e.ctrlKey) && e.key === "Enter") { e.preventDefault(); send(); } }} />
              <Pop open={pop === "tpl"} onClose={() => setPop(null)} className="up tpl-pop">
                <div className="tpl-pop-h mono">Snelle antwoorden</div>
                {TEMPLATES.map((t) => (
                  <button key={t.k} className="tpl-item" onClick={() => insertTemplate(t)}>
                    <span className="tpl-ic" dangerouslySetInnerHTML={{ __html: ICONS(t.icon, { sw: 1.8 }) }} />
                    <span className="tpl-main"><b>{t.title}</b><span>{t.body}</span></span>
                  </button>
                ))}
              </Pop>
            </div>
            <div className="comp-actions">
              <button className="cbtn send" onClick={send} disabled={!draft.trim()}><span dangerouslySetInnerHTML={{ __html: ICONS(noteMode ? "pencil" : "send", { sw: 1.8 }) }} />{noteMode ? "Notitie opslaan" : "Verstuur"}</button>
              <button className="cbtn" onClick={copy} disabled={!draft.trim()}><span dangerouslySetInnerHTML={{ __html: ICONS("copy", { sw: 1.8 }) }} />Kopieer</button>
              <div className="hub-act-wrap">
                <button className="cbtn" onClick={() => setPop(pop === "tpl" ? null : "tpl")}><span dangerouslySetInnerHTML={{ __html: ICONS("doc", { sw: 1.8 }) }} />Templates</button>
              </div>
              <button className="cbtn ai" onClick={genVariants} disabled={loadingAct === "variants"}><span dangerouslySetInnerHTML={{ __html: ICONS("spark", { sw: 1.8 }) }} />{loadingAct === "variants" ? "Genereren…" : "AI varianten"}</button>
              <span className="comp-div" />
              <button className="cbtn" onClick={improveNL} disabled={loadingAct === "improve"}><span dangerouslySetInnerHTML={{ __html: ICONS("pencil", { sw: 1.8 }) }} />{loadingAct === "improve" ? "Verbeteren…" : "Verbeter NL"}</button>
              <div className="hub-act-wrap">
                <button className="cbtn" onClick={() => setPop(pop === "lang" ? null : "lang")} disabled={loadingAct === "translate"}><span dangerouslySetInnerHTML={{ __html: ICONS("globe", { sw: 1.8 }) }} />{loadingAct === "translate" ? "Vertalen…" : "Vertaal"}</button>
                <Pop open={pop === "lang"} onClose={() => setPop(null)} className="up">
                  {LANGS.map(([code, name]) => (
                    <button key={code} className="hub-pop-item" onClick={() => translate(code)}><span className="lang-code mono">{code}</span><span className="hub-pop-lbl">{name}</span></button>
                  ))}
                </Pop>
              </div>
              <button className="cbtn" onClick={followUp} disabled={loadingAct === "followup"}><span dangerouslySetInnerHTML={{ __html: ICONS("reply", { sw: 1.8 }) }} />{loadingAct === "followup" ? "Genereren…" : "Follow-up"}</button>
              <button className="cbtn ico" title="Bijlage" onClick={() => toast("Bijlage toevoegen", { icon: "clip" })}><span dangerouslySetInnerHTML={{ __html: ICONS("clip", { sw: 1.8 }) }} /></button>
              <button className="cbtn ico" title="Emoji" onClick={() => setDraft(draft + " 😊")}><span dangerouslySetInnerHTML={{ __html: ICONS("smile", { sw: 1.8 }) }} /></button>
              <button className={"cbtn ico note-toggle" + (noteMode ? " on" : "")} title="Interne notitie" onClick={() => setNoteMode(!noteMode)}><span dangerouslySetInnerHTML={{ __html: ICONS("pencil", { sw: 1.8 }) }} /></button>
              {draft.trim() && <span className="comp-chars mono">{draft.trim().length} tekens</span>}
            </div>
          </div>

          <div className="thread-statusbar">
            <button className="tsb-done" onClick={() => { setStatus(active.id, "done", "Beantwoord"); toast("Afgehandeld", { icon: "check" }); setActiveId(null); }}>
              <span dangerouslySetInnerHTML={{ __html: ICONS("check", { sw: 2.2 }) }} />Afgehandeld
            </button>
            <span className="tsb-sep" />
            <ObjectActions className="tsb-objacts" obj={{ type: "conversation", key: "hubconv:" + active.id, title: active.subject || active.name, name: active.name, accent: "navy", custId: (findCustomer(store, active) || {}).id || null }} />
            <button className="tsb-btn" onClick={() => setSnoozeFor(active)}><span dangerouslySetInnerHTML={{ __html: ICONS("snooze", { sw: 1.8 }) }} />Opvolgen</button>
            <button className="tsb-btn" onClick={() => toast("Doorsturen " + active.name + "…", { icon: "share" })}><span dangerouslySetInnerHTML={{ __html: ICONS("share", { sw: 1.8 }) }} />Doorsturen</button>
            <button className="tsb-btn" onClick={() => { setStatus(active.id, "archived", ""); toast("Gearchiveerd", { icon: "box", kind: "muted" }); setActiveId(null); }}><span dangerouslySetInnerHTML={{ __html: ICONS("box", { sw: 1.8 }) }} />Archiveer</button>
            <span className="tsb-spacer" />
            <button className={"tsb-btn urgent" + (isUrgent(active) ? " on" : "")} onClick={() => { setState("hub.urgent." + active.id, !isUrgent(active)); toast(isUrgent(active) ? "Urgent verwijderd" : "Gemarkeerd als urgent", { icon: "bell" }); }}><span className="dot" />Urgent</button>
            <button className={"tsb-btn crm" + (showPanel ? " on" : "")} onClick={() => setShowPanel(!showPanel)}><span dangerouslySetInnerHTML={{ __html: ICONS("people", { sw: 1.8 }) }} />CRM</button>
          </div>
        </div>
        {showPanel && <ContactPanel conv={active} onOpen={onOpen} onClose={() => setShowPanel(false)} />}
        {snoozeFor && <SnoozeModal name={snoozeFor.name} onClose={() => setSnoozeFor(null)}
          onPick={(label) => { setStatus(snoozeFor.id, "snoozed", label); setSnoozeFor(null); setActiveId(null); toast("Gesnoozed tot " + label.toLowerCase(), { icon: "clock", kind: "muted" }); }} />}
      </div>
    );
  }

  /* ════════════════ LIST (full-width) ════════════════ */
  return (
    <div className="inbox list-mode">
      <div className="inbox-bar">
        <div className="inbox-bar-head">
          <span className="inbox-bar-ic" style={{ color: AC("teal"), background: ACsoft("teal") }}><span dangerouslySetInnerHTML={{ __html: ICONS("inbox") }} /></span>
          <div><div className="inbox-bar-title">Inbox</div><div className="inbox-bar-sub mono">{counts.open} open · {urgentCount} urgent · alle kanalen</div></div>
        </div>
        <div className="hub-search">
          <span dangerouslySetInnerHTML={{ __html: ICONS("search") }} />
          <input placeholder="Zoek en druk Enter…" value={query} onChange={(e) => setQuery(e.target.value)} />
        </div>
        <button className="inbox-new" onClick={() => setComposeOpen(true)}><span dangerouslySetInnerHTML={{ __html: ICONS("pencil", { sw: 1.9 }) }} />Nieuw</button>
      </div>

      <div className="inbox-filters">
        <div className="inbox-views">
          {VIEWS.map((v) => (
            <button key={v.k} className={"iview" + (view === v.k ? " on" : "")} onClick={() => { setView(v.k); setChFilter("all"); }}>
              <span dangerouslySetInnerHTML={{ __html: ICONS(v.icon, { sw: 1.8 }) }} />{v.label}<span className="iview-n">{v.n}</span>
            </button>
          ))}
        </div>
        <div className="inbox-filters-r">
          <div className="inbox-chips">
            {CH_FILTERS.map((c) => (
              <button key={c.k} className={"ichip" + (chFilter === c.k ? " on" : "")} onClick={() => setChFilter(c.k)} style={chFilter === c.k ? { color: AC(c.accent), background: ACsoft(c.accent), borderColor: "transparent" } : null}>
                <span dangerouslySetInnerHTML={{ __html: ICONS(c.icon, { sw: 1.8 }) }} />{c.label} {chCounts[c.k]}
              </button>
            ))}
          </div>
          <div className="inbox-tools">
            <InboxToolBtn icon="sliders" label="Knoppen" sel={quickActs} pool={quickPool}
              onChange={(next) => setState("inbox.quickacts", next)}
              title="Snelle knoppen op de rij" hint="Basis door Kyano · jij kiest wat je ziet" />
            <InboxToolBtn icon="columns" label="Velden" sel={metaFields} pool={INBOX_META_DEFS}
              onChange={(next) => setState("inbox.meta", next)}
              title="Meta-velden in de rij" hint="Kies wat je per gesprek ziet" />
          </div>
        </div>
      </div>

      <div className="inbox-rows">
        {ordered.length === 0 && (view === "open" ? (() => {
          const handled = counts.done + counts.snoozed + counts.archived;
          const bits = [
            counts.done ? counts.done + " beantwoord" : null,
            counts.snoozed ? counts.snoozed + " gesnoozed" : null,
            counts.archived ? counts.archived + " gearchiveerd" : null,
          ].filter(Boolean).join(" · ");
          const first = clientFirst();
          return (
            <div className="inbox-zero">
              <span className="ac-ic" dangerouslySetInnerHTML={{ __html: ICONS("check", { sw: 2.2 }) }} />
              <div className="inbox-zero-txt">
                <b>Inbox op nul{first ? " — mooi werk, " + first : " — mooi werk"}.</b>
                <span>{handled > 0
                  ? "Je handelde " + handled + (handled === 1 ? " gesprek" : " gesprekken") + " af" + (bits ? " · " + bits : "") + "."
                  : "Geen open gesprekken meer. Je agents pikken nieuwe berichten meteen op."}</span>
              </div>
            </div>
          );
        })() : <div className="list-empty mono">Niets hier.</div>)}
        {pinned.length > 0 && <><div className="hub-section mono"><span dangerouslySetInnerHTML={{ __html: ICONS("pin", { sw: 1.9 }) }} /> Vastgezet</div>{pinned.map(renderRow)}</>}
        {grouped.map(([lbl, arr]) => <React.Fragment key={lbl}>{arr.map(renderRow)}</React.Fragment>)}
      </div>

      {snoozeFor && <SnoozeModal name={snoozeFor.name} onClose={() => setSnoozeFor(null)}
        onPick={(label) => { setStatus(snoozeFor.id, "snoozed", label); setSnoozeFor(null); toast("Gesnoozed tot " + label.toLowerCase(), { icon: "clock", kind: "muted" }); }} />}
      {composeOpen && <ComposeModal onClose={() => setComposeOpen(false)} onSent={(id) => { setView("open"); setChFilter("all"); setCatFilter("all"); setQuery(""); setActiveId(id); }} />}
    </div>
  );
}

export { CommHub };
