/* ============================================================
   Vandaag-module uit de Claude Design-blauwdruk (pages.jsx).
   Taken-lijst (CeoProposal), toewijzen (AssignAction/TeamAssignedSection),
   eigen taken (UserTaskRow) en de bordkop. ESM-port: window-globals ->
   imports, body letterlijk. Draait op demo-data uit data.js.
   ============================================================ */
import React from 'react'
import { ICONS } from './icons'
import { KYANO } from './data'
import { useStore, getState, setState, toast } from './store.jsx'
import { AC, ACsoft, Avatar, Btn, Panel } from './components.jsx'
import { useSmartMenu } from './menus'
import { ObjectActions } from './objectactions.jsx'
import { isAssigned, scopeWorkflow, currentActor, asgFirst, logToMember, logToCustomer, TeamAssignedSection, ReturnedBanner } from './assign.jsx'
import { SnoozeMenu } from './snooze.jsx'
import { clientFirst } from './dashboard.jsx'

const { useState, useRef, useEffect } = React

const MOD = {}
KYANO.modules.forEach((m) => { MOD[m.id] = m })

function taskKlant(t) {
  if (t.klant) return t.klant;
  if (t.desc) {
    const parts = t.desc.split("·").map((s) => s.trim());
    const name = parts.find((p) => p && !/^€/.test(p) && !/^\d/.test(p) && !/concept|uit|open|status|deze|vorige|week|maand/i.test(p));
    if (name) return name;
  }
  if (t.draft && t.draft.to && t.draft.to.indexOf("@") > -1) return t.draft.to;
  return null;
}
/* desc-pagina ('Contact · CRO') -> CMS-pagina-id ('contact') voor de Groei/SEO/CRO/AI-taken */
const SEO_PAGE = { "home": "home", "het spel": "het-spel", "locaties": "locaties", "prijzen": "prijzen", "over ons": "over", "over": "over", "contact": "contact", "blog": "blog" };
function cmsPageOf(t) {
  const seg = String(t.desc || "").split("\u00b7")[0].trim().toLowerCase();
  return SEO_PAGE[seg] || null;
}

/* slimme sprongen per taak: waar moet de ondernemer eventueel heen */

function CeoProposal({ t, i, onOpen, card }) {
  const store = useStore();
  const status = store.get("task.status." + i, "pending");
  const [open, setOpen] = useState(false);
  const [snoozeOpen, setSnoozeOpen] = useState(false);
  const ag = KYANO.agents[t.agent];
  useEffect(() => {
    if (!snoozeOpen) return;
    const close = () => setSnoozeOpen(false);
    window.addEventListener("pointerdown", close);
    return () => window.removeEventListener("pointerdown", close);
  }, [snoozeOpen]);

  if (isAssigned && isAssigned("task:" + i)) return null;

  if (status !== "pending") {
    const snoozed = status === "snoozed";
    const snoozeLbl = store.get("task.snooze." + i, "");
    return (
      <div className={"prop-row resolved " + status}>
        <Avatar agent={t.agent} size={32} />
        <div className="prop-resolved-main">
          <span className="prop-resolved-title">{t.title}</span>
          <span className={"prop-resolved-tag " + status}>
            {snoozed ? "\uD83D\uDD52 " + (snoozeLbl || "komt later terug") : status === "approved" ? "✓ Goedgekeurd, " + ag.name + " voert het uit" : "Afgewezen"}
          </span>
        </div>
        <button className="prop-undo mono" onClick={() => setState("task.status." + i, "pending")}>Terugzetten</button>
      </div>
    );
  }

  const mm = MOD[t.mod];
  const klant = taskKlant(t);
  const CUSTOMER_MODS = ["sales", "offertes", "contracten", "facturen", "crm", "club"];
  const showKlant = klant && CUSTOMER_MODS.indexOf(t.mod) > -1;
  const custMatch = (showKlant && window.allCustomers) ? (function () {
    const hay = ((t.title || "") + " " + (t.desc || "") + " " + (t.why || "") + " " + (klant || "")).toLowerCase();
    const list = window.allCustomers(store);
    // eerst directe match op de afgeleide klantnaam, anders klantnaam die in titel/omschrijving/why voorkomt
    return list.find((c) => { const a = (c.name || "").toLowerCase().trim(), b = String(klant).toLowerCase().trim(); return a && b && (a === b || a.indexOf(b) > -1 || b.indexOf(a) > -1); })
      || list.find((c) => { const n = (c.name || "").toLowerCase().split(",")[0].trim(); return n.length > 3 && hay.indexOf(n) > -1; })
      || null;
  })() : null;
  const openConcept = (e) => { e && e.stopPropagation(); setState("web.gotopage", t.openPage); setState("web.editortab", "bewerken"); onOpen("editor"); toast("Geopend in de editor · " + (t.title || "concept"), { agent: t.agent, icon: "brush" }); };
  /* Groei/SEO/CRO/AI-taak: open de CMS-editor op de juiste pagina (zelfde flow als de Groei-module 'Open in CMS') */
  const goCms = () => { const pg = cmsPageOf(t); if (pg) setState("web.gotopage", pg); setState("web.editortab", "bewerken"); onOpen("editor"); };
  const cmsPageLabel = () => (String(t.desc || "").split("\u00b7")[0].trim() || "de pagina");
  const doApprove = (e) => { e && e.stopPropagation(); if (t.openPage) return openConcept(e); if (t.mod === "seo") { goCms(); setState("task.status." + i, "approved"); toast((t.approveLabel || "Toegepast in de CMS") + " · " + ag.name, { agent: t.agent, icon: "brush" }); return; } setState("task.status." + i, "approved"); toast((t.approveLabel || "Goedgekeurd") + " · " + ag.name, { agent: t.agent }); };
  const doReject = (e) => { e && e.stopPropagation(); setState("task.status." + i, "rejected"); toast("Afgewezen en afgerond", { icon: "close", kind: "muted" }); };

  const isOpen = card || open;
  return (<>
    <div className={"tk-task" + (isOpen ? " open" : "") + (t.overdue ? " urgent" : "") + (card ? " card" : "")}>
      {/* compacte regel, altijd zichtbaar, klik = openklappen */}
      <div className="tk-task-row" onClick={card ? undefined : () => setOpen((v) => !v)}>
        {t.overdue && <span className="tk-task-flag" title="Over de vervaldatum" />}
        <Avatar agent={t.agent} size={34} />
        <div className="tk-task-mid">
          <div className="tk-task-title">{t.title}</div>
          <div className="tk-task-meta">
            {mm && <span className="tk-task-mod" style={{ color: AC(t.accent), background: ACsoft(t.accent) }}>
              <span dangerouslySetInnerHTML={{ __html: ICONS(mm.icon, { sw: 2 }) }} />{mm.name}
            </span>}
            <span className="tk-task-by"><b>{ag.name}</b>{t.desc ? " · " + t.desc : ""}</span>
          </div>
        </div>
        {!card && (
          <button className="tk-task-view" onClick={(e) => { e.stopPropagation(); setOpen((v) => !v); }}>
            {open ? "Sluiten" : "Bekijk"}
            <span className="tk-task-chev" dangerouslySetInnerHTML={{ __html: ICONS("chevron", { sw: 2.2 }) }} />
          </button>
        )}
      </div>

      {/* uitgeklapt, samenvatting + slimme acties */}
      {isOpen && (
        <div className="tk-task-body">
          {<ReturnedBanner taskKey={"task:" + i} />}
          <div className="tk-task-why">
            <span className="tk-why-k mono">Samenvatting</span>
            <p className="tk-why-t">{t.why}</p>
            <div className="tk-why-src mono"><span dangerouslySetInnerHTML={{ __html: ICONS("link", { sw: 2 }) }} />{t.source}</div>
          </div>

          <div className="tk-actions">
            <button className="tk-act prim" style={{ background: AC(t.accent) }} onClick={doApprove}>
              <span dangerouslySetInnerHTML={{ __html: ICONS(t.icon || "check", { sw: 2.1 }) }} />{t.action || "Keur goed"}
            </button>
            {t.openPage ? <button className="tk-act" onClick={openConcept}>
              <span dangerouslySetInnerHTML={{ __html: ICONS("eye", { sw: 1.9 }) }} />Bekijk in editor
            </button> : t.mod === "seo" ? <button className="tk-act" onClick={(e) => { e.stopPropagation(); goCms(); toast("Open in CMS · " + cmsPageLabel(), { agent: t.agent, icon: "pencil" }); }}>
              <span dangerouslySetInnerHTML={{ __html: ICONS("pencil", { sw: 1.9 }) }} />Open in CMS
            </button> : mm && <button className="tk-act" onClick={() => onOpen(t.mod)}>
              <span dangerouslySetInnerHTML={{ __html: ICONS("eye", { sw: 1.9 }) }} />Bekijk
            </button>}
            <div className="prop-later-wrap">
              <button className="tk-act" onClick={(e) => { e.stopPropagation(); setSnoozeOpen((v) => !v); }}>
                <span dangerouslySetInnerHTML={{ __html: ICONS("clock", { sw: 1.9 }) }} />Later
              </button>
              {snoozeOpen && (
                <SnoozeMenu onPick={(o) => {
                  setSnoozeOpen(false);
                  setState("task.status." + i, "snoozed");
                  setState("task.snooze." + i, "komt terug " + o.label.toLowerCase());
                  toast("Komt terug " + o.label.toLowerCase(), { icon: "clock", kind: "muted" });
                }} />
              )}
            </div>
            <button className="tk-act" onClick={doReject}>
              <span dangerouslySetInnerHTML={{ __html: ICONS("close", { sw: 2 }) }} />Afwijzen &amp; afronden
            </button>
            {<ObjectActions obj={{ type: "task", key: "task:" + i, title: t.title, agent: t.agent, accent: t.accent, custId: (showKlant && custMatch) ? custMatch.id : null }} />}
          </div>
        </div>
      )}
    </div>
  </>);
}


function UserTasksPanel({ onOpen }) {
  const store = useStore();
  const tasks = store.get("user.tasks", []);
  if (!tasks.length) return null;
  const open = tasks.filter((t) => !t.done && !(isAssigned && isAssigned("utask:" + t.id)));
  return (
    <Panel eyebrow="Door jou aangemaakt vanuit de inbox" title="Mijn taken" accent="navy"
      right={<span className="task-count">{open.length}</span>}>
      <div className="tk-cards solo">
        {tasks.filter((t) => !(isAssigned && isAssigned("utask:" + t.id))).map((t) => (
          <UserTaskRow key={t.id} t={t} onOpen={onOpen} />
        ))}
      </div>
    </Panel>
  );
}


function vdGreet() {
  const h = new Date().getHours();
  return h < 6 ? "Goedenacht" : h < 12 ? "Goedemorgen" : h < 18 ? "Goedemiddag" : "Goedenavond";
}
/* naam in begroetingen, tijdens 'meekijken' de naam van het teamlid */

function vdDateLabel() {
  const d = new Date();
  const days = ["zondag", "maandag", "dinsdag", "woensdag", "donderdag", "vrijdag", "zaterdag"];
  const months = ["januari", "februari", "maart", "april", "mei", "juni", "juli", "augustus", "september", "oktober", "november", "december"];
  return days[d.getDay()].charAt(0).toUpperCase() + days[d.getDay()].slice(1) + " " + d.getDate() + " " + months[d.getMonth()];
}


function VandaagBoardHeader({ onOpen }) {
  const store = useStore();
  const items = KYANO.tasks.map((t, i) => ({ t, i, st: store.get("task.status." + i, "pending") }));
  const pending = items.filter((x) => x.st === "pending");
  const urgentPending = pending.filter((x) => x.t.urgent);
  const total = KYANO.tasks.length;
  const reviewed = total - pending.length;
  const pct = total ? Math.round((reviewed / total) * 100) : 0;
  const approveAll = () => { pending.forEach((x) => setState("task.status." + x.i, "approved")); toast("Alle " + pending.length + " taken afgehandeld · je agents pakken het op", { agent: "iris" }); };
  return (
    <header className="vdb-head">
      <div className="vdb-id">
        <Avatar agent="iris" size={54} ring />
        <div className="vdb-id-txt">
          <h1 className="greet-h1">{vdGreet()}, <em>{clientFirst()}</em></h1>
          <p className="vdb-sub">{vdDateLabel()} · <span className="mono">{pending.length > 0 ? pending.length + (pending.length === 1 ? " taak te doen vandaag" : " taken te doen vandaag") : "alles op nul, mooi werk"}</span></p>
        </div>
      </div>
      <div className={"vdb-command" + (pending.length === 0 ? " clear" : "")}>
        <div className="vdb-command-main">
          <div className="vdb-command-text">
            {pending.length > 0
              ? <>Je agents zetten vannacht <b>{pending.length} {pending.length === 1 ? "taak" : "taken"}</b> voor je klaar.{urgentPending.length > 0 && <> Begin bij <b>{urgentPending.length} urgent {urgentPending.length === 1 ? "punt" : "punten"}</b>.</>} Werk de lijst naar nul.</>
              : <><b>Top werk, {clientFirst()}.</b> Je lijst staat op nul, je agents voeren de afgehandelde taken uit.</>}
          </div>
          <div className="vdb-progress">
            <div className="vdb-progress-bar"><span style={{ width: pct + "%" }} /></div>
            <span className="vdb-progress-lbl mono">{reviewed} / {total} gedaan</span>
          </div>
        </div>
        <div className="vdb-command-acts">
          {pending.length > 0 && <Btn kind="solid" accent="teal" icon="check" size="sm" onClick={approveAll}>Alles afhandelen</Btn>}
          <Btn kind="soft" accent="teal" icon="spark" size="sm" onClick={() => onOpen("iris")}>Chat met Iris</Btn>
        </div>
      </div>
    </header>
  );
}

function utaskLog(task, verb, opts) {
  opts = opts || {};
  const actor = (currentActor && currentActor()) || null;
  const first = asgFirst ? asgFirst(actor && actor.name) : ((actor && actor.name) || "Iemand");
  const title = task.title || "taak";
  const L = {
    create: { mem: "Eigen taak aangemaakt: " + title, cust: first + " maakte een eigen taak aan: " + title, icon: "check", accent: "navy" },
    done:   { mem: "Eigen taak afgerond: " + title, cust: first + " rondde een eigen taak af: " + title, icon: "check", accent: "teal" },
    reopen: { mem: "Eigen taak heropend: " + title, cust: first + " heropende een eigen taak: " + title, icon: "arrow", accent: "orange" },
    edit:   { mem: "Eigen taak bewerkt: " + title, cust: first + " bewerkte een eigen taak: " + title, icon: "pencil", accent: "navy" },
    link:   { mem: "Eigen taak gekoppeld: " + title, cust: first + " koppelde een eigen taak: " + title, icon: "link", accent: "navy" },
  };
  const e = L[verb]; if (!e) return;
  if (actor && logToMember) logToMember(actor.id, { txt: e.mem, icon: e.icon, accent: e.accent });
  const cid = (opts.custId !== undefined) ? opts.custId : task.custId;
  if (cid && logToCustomer) logToCustomer(cid, e.cust);
}

function UTaskLinkMenu({ t }) {
  const store = useStore();
  const custs = (window.allCustomers ? window.allCustomers(store) : []).filter((c) => c.status !== "prospect");
  const mods = (KYANO.modules || []).filter((m) => m.id !== "vandaag" && m.id !== "postvak");
  const apply = (patch, custIdForLog) => {
    setState("user.tasks", getState("user.tasks", []).map((x) => x.id === t.id ? { ...x, ...patch } : x));
    utaskLog({ ...t, ...patch }, "link", { custId: custIdForLog });
  };
  const pickCust = (c) => { apply(t.custId === c.id ? { custId: null, custName: null } : { custId: c.id, custName: c.name }, t.custId === c.id ? null : c.id); toast(t.custId === c.id ? "Klant ontkoppeld" : "Gekoppeld aan " + c.name, { icon: "link" }); };
  const pickMod = (m) => { apply(t.mod === m.id ? { mod: null } : { mod: m.id }, t.custId); toast(t.mod === m.id ? "Module ontkoppeld" : "Gekoppeld aan " + m.name, { icon: "link" }); };
  const smRef = useSmartMenu({ align: "start", margin: 12 });
  return (
    <div className="assign-menu utask-linkmenu" ref={smRef} onClick={(e) => e.stopPropagation()} onPointerDown={(e) => e.stopPropagation()}>
      <div className="assign-head mono">Koppel aan klant</div>
      <div className="utask-linkscroll">
        {custs.map((c) => (
          <button key={c.id} className={"assign-item" + (t.custId === c.id ? " on" : "")} onClick={() => pickCust(c)}>
            <Avatar name={c.name} size={22} />
            <span className="assign-lbl">{c.name}</span>
            {t.custId === c.id && <span className="assign-role mono">gekoppeld</span>}
          </button>
        ))}
        {custs.length === 0 && <div className="assign-empty mono">Geen klanten.</div>}
      </div>
      <div className="assign-head mono">Koppel aan module</div>
      <div className="utask-linkscroll">
        {mods.map((m) => (
          <button key={m.id} className={"assign-item" + (t.mod === m.id ? " on" : "")} onClick={() => pickMod(m)}>
            <span className="utask-modic" style={{ color: AC(m.accent), background: ACsoft(m.accent) }} dangerouslySetInnerHTML={{ __html: ICONS(m.icon, { sw: 2 }) }} />
            <span className="assign-lbl">{m.name}</span>
            {t.mod === m.id && <span className="assign-role mono">gekoppeld</span>}
          </button>
        ))}
      </div>
    </div>
  );
}

/* Eigen taak — volwaardige taak-kaart, identiek aan een agent-taak (CeoProposal):
   zelfde stijl, uitklapbaar, dezelfde acties minus Goedkeuren. Het "Eigen taak"-merkje
   staat op de plek van de agent-avatar. */
function UserTaskRow({ t, onOpen }) {
  const DUE = { "vandaag": "Vandaag", "morgen": "Morgen", "deze-week": "Deze week" };
  const store = useStore();
  const [open, setOpen] = useState(false);
  const [editing, setEditing] = useState(false);
  const [eTitle, setETitle] = useState(t.title);
  const [eNote, setENote] = useState(t.note || "");
  const [snoozeOpen, setSnoozeOpen] = useState(false);
  const [linkOpen, setLinkOpen] = useState(false);
  useEffect(() => {
    if (!snoozeOpen && !linkOpen) return;
    const close = () => { setSnoozeOpen(false); setLinkOpen(false); };
    window.addEventListener("pointerdown", close);
    return () => window.removeEventListener("pointerdown", close);
  }, [snoozeOpen, linkOpen]);

  const patch = (p) => setState("user.tasks", store.get("user.tasks", []).map((x) => x.id === t.id ? { ...x, ...p } : x));
  const remove = () => setState("user.tasks", store.get("user.tasks", []).filter((x) => x.id !== t.id));

  /* snoozed — zelfde 'resolved' weergave als een agent-taak */
  if (t.snooze && !t.done) {
    return (
      <div className="prop-row resolved snoozed">
        <div className="utask-mark sm" style={{ color: AC("navy"), background: ACsoft("navy") }} dangerouslySetInnerHTML={{ __html: ICONS("check", { sw: 2.4 }) }} />
        <div className="prop-resolved-main">
          <span className="prop-resolved-title">{t.title}</span>
          <span className="prop-resolved-tag snoozed">{"\uD83D\uDD52 " + t.snooze}</span>
        </div>
        <button className="prop-undo mono" onClick={() => patch({ snooze: null })}>Terugzetten</button>
      </div>
    );
  }

  const setDone = (v) => {
    patch({ done: v });
    utaskLog(t, v ? "done" : "reopen");
    toast(v ? "Taak afgerond" : "Taak heropend", { icon: v ? "check" : "arrow", kind: v ? undefined : "muted" });
  };
  const saveEdit = () => {
    const title = eTitle.trim();
    if (!title) { toast("Geef de taak een titel", { icon: "pencil", kind: "muted" }); return; }
    patch({ title, note: eNote.trim() });
    setEditing(false);
    utaskLog({ ...t, title }, "edit");
    toast("Taak bijgewerkt", { icon: "check" });
  };

  const linkedCust = (t.custId && window.allCustomers) ? window.allCustomers(store).find((c) => c.id === t.custId) : null;
  const linkedMod = t.mod ? MOD[t.mod] : null;

  return (<>
    <div className={"tk-task utask-full" + (open ? " open" : "") + (t.done ? " done" : "")}>
      <div className="tk-task-row" onClick={() => setOpen((v) => !v)}>
        <button className={"utask-check" + (t.done ? " on" : "")} onClick={(e) => { e.stopPropagation(); setDone(!t.done); }} title={t.done ? "Heropen" : "Afronden"}>
          {t.done && <span dangerouslySetInnerHTML={{ __html: ICONS("check", { sw: 2.6 }) }} />}
        </button>
        <div className="utask-mark" style={{ color: AC("navy"), background: ACsoft("navy") }} title="Eigen taak" dangerouslySetInnerHTML={{ __html: ICONS("check", { sw: 2.2 }) }} />
        <div className="tk-task-mid">
          <div className="tk-task-title">{t.title}</div>
          <div className="tk-task-meta">
            <span className="tk-task-mod" style={{ color: AC("navy"), background: ACsoft("navy") }}><span dangerouslySetInnerHTML={{ __html: ICONS("check", { sw: 2 }) }} />Eigen taak</span>
            {linkedMod && <span className="tk-task-mod" style={{ color: AC(linkedMod.accent), background: ACsoft(linkedMod.accent) }}><span dangerouslySetInnerHTML={{ __html: ICONS(linkedMod.icon, { sw: 2 }) }} />{linkedMod.name}</span>}
            <span className="tk-task-by">{linkedCust ? linkedCust.name : (t.from ? "via " + t.from : "handmatig")}{t.note ? " · " + t.note : ""}</span>
          </div>
        </div>
        <span className="utask-due mono" style={{ color: AC("navy"), background: ACsoft("navy") }}>{DUE[t.due] || t.due}</span>
        <button className="tk-task-view" onClick={(e) => { e.stopPropagation(); setOpen((v) => !v); }}>
          {open ? "Sluiten" : "Bekijk"}
          <span className="tk-task-chev" dangerouslySetInnerHTML={{ __html: ICONS("chevron", { sw: 2.2 }) }} />
        </button>
      </div>

      {open && (
        <div className="tk-task-body">
          {<ReturnedBanner taskKey={"utask:" + t.id} />}
          {editing ? (
            <div className="utask-edit">
              <input className="taken-add-in" value={eTitle} placeholder="Titel van de taak"
                onChange={(e) => setETitle(e.target.value)} onKeyDown={(e) => { if (e.key === "Enter") saveEdit(); if (e.key === "Escape") { setEditing(false); setETitle(t.title); setENote(t.note || ""); } }} />
              <textarea className="utask-edit-note" rows={2} value={eNote} placeholder="Notitie (optioneel)" onChange={(e) => setENote(e.target.value)} />
              <div className="utask-edit-acts">
                <button className="asg-return-cancel" onClick={() => { setEditing(false); setETitle(t.title); setENote(t.note || ""); }}>Annuleren</button>
                <Btn kind="solid" accent="navy" icon="check" size="sm" onClick={saveEdit}>Bewaren</Btn>
              </div>
            </div>
          ) : (
            <div className="tk-task-why">
              <span className="tk-why-k mono">Eigen taak</span>
              <p className="tk-why-t">{t.note ? t.note : "Geen notitie toegevoegd. Klik op Bewerken om details te geven."}</p>
              <div className="tk-why-src mono"><span dangerouslySetInnerHTML={{ __html: ICONS("link", { sw: 2 }) }} />{linkedCust ? "Klant · " + linkedCust.name : (t.from ? "Aangemaakt via " + t.from : "Handmatig aangemaakt")}{linkedMod ? " · " + linkedMod.name : ""}</div>
            </div>
          )}

          {!editing && (
            <div className="tk-actions">
              <button className="tk-act prim" style={{ background: AC("navy") }} onClick={(e) => { e.stopPropagation(); setDone(true); }}>
                <span dangerouslySetInnerHTML={{ __html: ICONS("check", { sw: 2.1 }) }} />Afronden
              </button>
              <div className="prop-later-wrap">
                <button className="tk-act" onClick={(e) => { e.stopPropagation(); setLinkOpen(false); setSnoozeOpen((v) => !v); }}>
                  <span dangerouslySetInnerHTML={{ __html: ICONS("clock", { sw: 1.9 }) }} />Later
                </button>
                {snoozeOpen && (
                  <SnoozeMenu onPick={(o) => { setSnoozeOpen(false); patch({ snooze: "komt terug " + o.label.toLowerCase() }); toast("Komt terug " + o.label.toLowerCase(), { icon: "clock", kind: "muted" }); }} />
                )}
              </div>
              <button className="tk-act" onClick={(e) => { e.stopPropagation(); setEditing(true); }}>
                <span dangerouslySetInnerHTML={{ __html: ICONS("pencil", { sw: 1.9 }) }} />Bewerken
              </button>
              <div className="prop-later-wrap">
                <button className="tk-act" onClick={(e) => { e.stopPropagation(); setSnoozeOpen(false); setLinkOpen((v) => !v); }}>
                  <span dangerouslySetInnerHTML={{ __html: ICONS("link", { sw: 1.9 }) }} />Koppelen
                </button>
                {linkOpen && <UTaskLinkMenu t={t} />}
              </div>
              <button className="tk-act" onClick={(e) => { e.stopPropagation(); remove(); }}>
                <span dangerouslySetInnerHTML={{ __html: ICONS("close", { sw: 2 }) }} />Verwijderen
              </button>
              {<ObjectActions obj={{ type: "task", key: "utask:" + t.id, title: t.title, name: "Eigen taak", accent: "navy", custId: t.custId || null, custName: t.custName || null, onAssigned: (mm) => patch({ assignedTo: { id: mm.id, name: asgFirst ? asgFirst(mm.name) : mm.name } }) }} />}
            </div>
          )}
        </div>
      )}
    </div>
  </>);
}


/* Inline 'taak toevoegen', vanuit Vandaag zelf */
function QuickAddTask({ open, setOpen }) {
  const [title, setTitle] = useState("");
  const [due, setDue] = useState("vandaag");
  const ref = useRef(null);
  useEffect(() => { if (open && ref.current) ref.current.focus(); }, [open]);
  const add = () => {
    if (!title.trim()) { toast("Geef de taak een titel", { icon: "pencil", kind: "muted" }); return; }
    const list = getState("user.tasks", []);
    const task = { id: "ut" + Date.now(), title: title.trim(), note: "", due, from: "", accent: "navy", done: false, custId: null, custName: null, mod: null, assignedTo: null };
    setState("user.tasks", [task, ...list]);
    if (utaskLog) utaskLog(task, "create");
    toast("Taak toegevoegd aan Vandaag", { icon: "check", agent: "iris" });
    setTitle(""); setOpen(false);
  };
  if (!open) return (
    <button className="taken-addbtn" onClick={() => setOpen(true)}>
      <span dangerouslySetInnerHTML={{ __html: ICONS("plus", { sw: 2.2 }) }} />Eigen taak toevoegen
    </button>
  );
  return (
    <div className="taken-add">
      <input ref={ref} className="taken-add-in" placeholder="Wat moet er gebeuren?" value={title}
        onChange={(e) => setTitle(e.target.value)} onKeyDown={(e) => { if (e.key === "Enter") add(); if (e.key === "Escape") setOpen(false); }} />
      <div className="taken-add-due">
        {[["vandaag", "Vandaag"], ["morgen", "Morgen"], ["deze-week", "Deze week"]].map(([k, l]) => (
          <button key={k} className={"taken-add-seg" + (due === k ? " on" : "")} onClick={() => setDue(k)}>{l}</button>
        ))}
      </div>
      <Btn kind="solid" accent="navy" icon="check" size="sm" onClick={add}>Toevoegen</Btn>
      <button className="taken-add-x" onClick={() => setOpen(false)}><span dangerouslySetInnerHTML={{ __html: ICONS("close", { sw: 2 }) }} /></button>
    </div>
  );
}


function VoorstellenWidget({ size, onOpen, scope, view }) {
  const store = useStore();
  const [filter, setFilter] = useState("all");
  const [sort, setSort] = useState("urgentie"); // urgentie | module
  const [filterOpen, setFilterOpen] = useState(false);
  const filterPopRef = useSmartMenu({ dep: filterOpen, align: "start", margin: 12 });
  const [addOpen, setAddOpen] = useState(false);
  useEffect(() => {
    if (!filterOpen) return;
    const close = () => setFilterOpen(false);
    window.addEventListener("pointerdown", close);
    return () => window.removeEventListener("pointerdown", close);
  }, [filterOpen]);
  const addTrigger = store.get("ui.openTaskAdd", 0);
  useEffect(() => { if (addTrigger) setAddOpen(true); }, [addTrigger]);
  const userTasks = store.get("user.tasks", []);
  const allItems = KYANO.tasks.map((t, i) => ({ t, i, st: store.get("task.status." + i, "pending") }));
  const inScope = Array.isArray(scope) ? (mod) => scope.includes(mod) : (mod) => mod === scope;
  const items = scope ? allItems.filter((x) => inScope(x.t.mod)) : allItems;
  const openUserTasks = scope ? [] : userTasks.filter((t) => !t.done && !(isAssigned && isAssigned("utask:" + t.id)));
  const pending = items.filter((x) => x.st === "pending" && !(isAssigned && isAssigned("task:" + x.i)));
  const resolvedItems = items.filter((x) => x.st !== "pending" && !(isAssigned && isAssigned("task:" + x.i)));
  const approved = items.filter((x) => x.st === "approved").length;

  // modules met openstaande taken (filterbalk)
  const modCounts = {};
  pending.forEach((x) => { modCounts[x.t.mod] = (modCounts[x.t.mod] || 0) + 1; });
  const modIds = Object.keys(modCounts).sort((a, b) => modCounts[b] - modCounts[a]);

  const shown = filter === "all" ? pending : pending.filter((x) => x.t.mod === filter);
  const cards = view === "kaarten";

  // groeperen
  let groups = [];
  if (filter !== "all") {
    groups = [{ key: "flat", label: null, items: [...shown].sort((a, b) => (b.t.urgent ? 1 : 0) - (a.t.urgent ? 1 : 0)) }];
  } else if (sort === "module") {
    groups = modIds.map((mid) => ({ key: mid, label: MOD[mid] ? MOD[mid].name : mid, icon: MOD[mid] && MOD[mid].icon, accent: MOD[mid] && MOD[mid].accent, items: shown.filter((x) => x.t.mod === mid) }));
  } else {
    const urgent = shown.filter((x) => x.t.overdue);
    const normal = shown.filter((x) => !x.t.overdue);
    if (urgent.length) groups.push({ key: "urgent", label: "Vraagt nu je aandacht", urgent: true, items: urgent });
    if (normal.length) groups.push({ key: "normal", label: urgent.length ? "Taken" : null, items: normal });
  }

  return (
    <div className="voorstel-widget">
      <div className="taken-toprow">
        {!scope && <QuickAddTask open={addOpen} setOpen={setAddOpen} />}
      </div>

      {!scope && pending.length > 0 && (
        <div className="taken-filterrow">
          <div className="taken-filter-wrap" onPointerDown={(e) => e.stopPropagation()}>
            <button className={"taken-filterbtn" + (filterOpen ? " on" : "") + (filter !== "all" ? " active" : "")}
              onClick={() => setFilterOpen((v) => !v)}>
              <span dangerouslySetInnerHTML={{ __html: ICONS("sliders", { sw: 1.9 }) }} />
              <span>{filter === "all" ? "Filter" : (MOD[filter] ? MOD[filter].name : filter)}</span>
              {filter !== "all" && <span className="taken-filter-clear" onClick={(e) => { e.stopPropagation(); setFilter("all"); }} dangerouslySetInnerHTML={{ __html: ICONS("close", { sw: 2.4 }) }} />}
            </button>
            {filterOpen && (
              <div className="taken-filter-pop" ref={filterPopRef}>
                <div className="tfp-sec mono">Toon</div>
                <button className={"tfp-item" + (filter === "all" ? " on" : "")} onClick={() => { setFilter("all"); setFilterOpen(false); }}>
                  <span className="tfp-lbl">Alle modules</span><span className="tfp-n">{pending.length}</span>
                </button>
                {modIds.map((mid) => { const mm = MOD[mid]; return (
                  <button key={mid} className={"tfp-item" + (filter === mid ? " on" : "")} onClick={() => { setFilter(mid); setFilterOpen(false); }}>
                    {mm && <span className="tfp-ic" style={{ color: AC(mm.accent), background: ACsoft(mm.accent) }} dangerouslySetInnerHTML={{ __html: ICONS(mm.icon, { sw: 1.9 }) }} />}
                    <span className="tfp-lbl">{mm ? mm.name : mid}</span><span className="tfp-n">{modCounts[mid]}</span>
                  </button>
                ); })}
                {filter === "all" && (<>
                  <div className="tfp-sec mono">Sorteer</div>
                  <button className={"tfp-item" + (sort === "urgentie" ? " on" : "")} onClick={() => setSort("urgentie")}><span className="tfp-lbl">Op urgentie</span>{sort === "urgentie" && <span className="tfp-check" dangerouslySetInnerHTML={{ __html: ICONS("check", { sw: 2.4 }) }} />}</button>
                  <button className={"tfp-item" + (sort === "module" ? " on" : "")} onClick={() => setSort("module")}><span className="tfp-lbl">Op module</span>{sort === "module" && <span className="tfp-check" dangerouslySetInnerHTML={{ __html: ICONS("check", { sw: 2.4 }) }} />}</button>
                </>)}
              </div>
            )}
          </div>
          <span className="taken-count mono">{pending.length} open</span>
        </div>
      )}

      {pending.length === 0 && openUserTasks.length === 0 && (
        <div className="all-clear">
          <span className="ac-ic" dangerouslySetInnerHTML={{ __html: ICONS("check", { sw: 2.2 }) }} />
          Je lijst staat op nul. {approved > 0 && <>Je handelde {approved} {approved === 1 ? "taak" : "taken"} af.</>}
          {resolvedItems.length > 0 && <button className="ac-undo" onClick={() => resolvedItems.forEach((x) => setState("task.status." + x.i, "pending"))}>Alles terugzetten</button>}
        </div>
      )}

      {cards ? (
        <div className="st-list">
          {openUserTasks.length > 0 && filter === "all" && (
            <div className="st-group">
              <div className="st-group-h"><span className="st-group-ic" style={{ color: AC("navy"), background: ACsoft("navy") }} dangerouslySetInnerHTML={{ __html: ICONS("check", { sw: 1.9 }) }} />Door jou aangemaakt<span className="st-group-n">{openUserTasks.length}</span></div>
              <div className="tk-cards solo">{openUserTasks.map((t) => <UserTaskRow key={t.id} t={t} onOpen={onOpen} />)}</div>
            </div>
          )}
          {groups.map((g) => (
            <div className="st-group" key={g.key}>
              {g.label && (
                <div className={"st-group-h" + (g.urgent ? " urgent" : "")}>
                  {g.urgent && <span className="st-group-dot" />}
                  {g.icon && <span className="st-group-ic" style={{ color: AC(g.accent), background: ACsoft(g.accent) }} dangerouslySetInnerHTML={{ __html: ICONS(g.icon, { sw: 1.9 }) }} />}
                  {g.label}<span className="st-group-n">{g.items.length}</span>
                </div>
              )}
              <div className={"tk-cards" + (g.urgent ? " solo" : "")}>{g.items.map((x) => <CeoProposal key={x.i} t={x.t} i={x.i} onOpen={onOpen} card />)}</div>
            </div>
          ))}
          {filter === "all" && <TeamAssignedSection boardWf={scopeWorkflow ? scopeWorkflow(scope) : null} />}
          {resolvedItems.length > 0 && filter === "all" && (
            <div className="st-group">
              <div className="st-group-h done">Afgehandeld vandaag<span className="st-group-n">{resolvedItems.length}</span></div>
              <div className="tk-cards solo">{resolvedItems.map((x) => <CeoProposal key={x.i} t={x.t} i={x.i} onOpen={onOpen} card />)}</div>
            </div>
          )}
        </div>
      ) : (<>

      {openUserTasks.length > 0 && filter === "all" && (
        <>
          <div className="vd-group-h"><span className="vd-group-ic" style={{ color: AC("navy"), background: ACsoft("navy") }} dangerouslySetInnerHTML={{ __html: ICONS("check", { sw: 1.9 }) }} />Door jou aangemaakt<span className="vd-group-n">{openUserTasks.length}</span></div>
          {openUserTasks.map((t) => <UserTaskRow key={t.id} t={t} onOpen={onOpen} />)}
        </>
      )}

      {groups.map((g) => (
        <React.Fragment key={g.key}>
          {g.label && (
            <div className={"vd-group-h" + (g.urgent ? " urgent" : "")}>
              {g.urgent && <span className="vd-group-dot" />}
              {g.icon && <span className="vd-group-ic" style={{ color: AC(g.accent), background: ACsoft(g.accent) }} dangerouslySetInnerHTML={{ __html: ICONS(g.icon, { sw: 1.9 }) }} />}
              {g.label}<span className="vd-group-n">{g.items.length}</span>
            </div>
          )}
          {g.items.map((x) => <CeoProposal key={x.i} t={x.t} i={x.i} onOpen={onOpen} />)}
        </React.Fragment>
      ))}

      {filter === "all" && <TeamAssignedSection boardWf={scopeWorkflow ? scopeWorkflow(scope) : null} />}

      {resolvedItems.length > 0 && filter === "all" && (
        <>
          <div className="vd-group-h done">Afgehandeld vandaag<span className="vd-group-n">{resolvedItems.length}</span></div>
          {resolvedItems.map((x) => <CeoProposal key={x.i} t={x.t} i={x.i} onOpen={onOpen} />)}
        </>
      )}
      </>)}
    </div>
  );
}


/* Widget: snelle acties, stuurt elke module aan */
const QUICK_ACTIONS = [
  { label: "Nieuwe offerte", icon: "doc", accent: "teal", mod: "offertes", t: "Nieuwe offerte starten · Iris", ag: "iris" },
  { label: "Nieuw contact", icon: "people", accent: "red", mod: "crm", t: "Nieuw contact toevoegen" },
  { label: "Factuur sturen", icon: "invoice", accent: "orange", mod: "facturen", t: "Factuur opstellen · Juris", ag: "juris" },
  { label: "Afspraak plannen", icon: "calendar", accent: "teal", mod: "agenda", t: "Afspraak inplannen" },
  { label: "Bericht sturen", icon: "send", accent: "navy", mod: "postvak", t: "Open je inbox" },
  { label: "Leads zoeken", icon: "search", accent: "aqua", mod: "finder", t: "Kai zoekt nieuwe leads", ag: "kai" },
  { label: "Social plannen", icon: "brush", accent: "mila", mod: "studio", t: "Content plannen · Mila", ag: "mila" },
  { label: "Vraag Iris", icon: "spark", accent: "purple", mod: "iris", t: null },
];
function SnelleActiesWidget({ onOpen }) {
  return (
    <div className="quick-grid">
      {QUICK_ACTIONS.map((q) => (
        <button key={q.label} className="quick-btn" onClick={() => { if (q.t) toast(q.t, q.ag ? { agent: q.ag } : { icon: q.icon }); onOpen(q.mod); }}>
          <span className="quick-ic" style={{ color: AC(q.accent), background: ACsoft(q.accent) }}><span dangerouslySetInnerHTML={{ __html: ICONS(q.icon) }} /></span>
          <span className="quick-lbl">{q.label}</span>
        </button>
      ))}
    </div>
  );
}


export { VoorstellenWidget, SnelleActiesWidget, VandaagBoardHeader, UserTasksPanel }
