/* ============================================================
   Gedeeld TOEWIJS-SYSTEEM — één herkenbaar patroon door de hele app.
   Sluit aan op het bestaande rollen-/rechtensysteem (team.jsx) en op
   de bestaande logs (klant-tijdlijn + activiteiten-log per teamlid).

   Exporteert:
   • TeamPicker        — gedeeld teamlid-kies-menu (avatar + naam + rol)
   • AssignAction      — "Wijs toe aan…"-knop op elke taak-kaart (gated)
   • TeamAssignedSection — "Aan mij toegewezen" + "Bij het team" met teruggeven
   • OwnerField        — Eigenaar-veld (avatar) op klantkaart & deal (gated)
   • canAssign / currentActor / assignPolicy / setAssignPolicy
   ESM-port van de blauwdruk: window-globals -> imports/exports, body letterlijk.
   ============================================================ */
import React from 'react'
import { ICONS } from './icons'
import { KYANO } from './data'
import { getState, setState, toast, useStore } from './store.jsx'
import { Avatar } from './components.jsx'
import { useSmartMenu } from './menus'

const { useState: useStateASG, useEffect: useEffectASG } = React;

/* ---- team-roster uit de bestaande team-data ---- */
function asgMembers() {
  const m = getState("team.members", null);
  if (Array.isArray(m) && m.length) return m;
  return [
    { id: "u_ramon", name: "Ramon van Dijk", role: "eigenaar", color: "navy", me: true },
    { id: "u_sanne", name: "Sanne Bakker", role: "manager", color: "teal" },
    { id: "u_tom", name: "Tom de Wit", role: "medewerker", color: "orange" },
    { id: "u_eva", name: "Eva Jansen", role: "medewerker", color: "mila" },
  ];
}
function asgFirst(name) { return String(name || "").split(" ")[0]; }
function asgRoleLabel(role) { const R = window.TEAM_ROLES; return (R && R[role] && R[role].label) || role; }
const ASG_ROLE_ORDER = ["eigenaar", "beheerder", "manager", "medewerker", "bekijker"];
function asgRoleRank(role) { const i = ASG_ROLE_ORDER.indexOf(role); return i < 0 ? 99 : i; }

/* ---- ingelogde actor (jezelf óf het teamlid waar je 'meekijkt') ---- */
function currentActor() {
  const members = asgMembers();
  const va = window.__viewAs;
  if (va) return members.find((x) => x.id === va.id) || va;
  return members.find((x) => x.me) || members[0];
}
function currentRole() { const a = currentActor(); return (a && a.role) || "eigenaar"; }

/* ---- cascade-recht "mag toewijzen" (door Eigenaar per rol ingesteld) ---- */
const ASSIGN_ROLE_DEFAULTS = { eigenaar: true, beheerder: true, manager: true, medewerker: false, bekijker: false };
function assignPolicy() { return Object.assign({}, ASSIGN_ROLE_DEFAULTS, getState("team.rights.assign", {})); }
function setAssignPolicy(role, on) { const p = Object.assign({}, getState("team.rights.assign", {})); p[role] = on; setState("team.rights.assign", p); }
function canAssignRole(role) { if (role === "eigenaar") return true; return !!assignPolicy()[role]; }
function canAssign() { return canAssignRole(currentRole()); }
/* wie mag het toewijs-recht zelf instellen voor een teamlid:
   de Eigenaar/Kyano (acting), of een hogere rol die zelf mag toewijzen (cascade). */
function canEditAssignRight(memberRole, actingOwner) {
  if (actingOwner) return true;
  return canAssign() && asgRoleRank(currentRole()) < asgRoleRank(memberRole);
}

/* ---- logs: sluit aan op bestaand formaat, altijd mét actor ---- */
function logToCustomer(custId, txt) {
  if (!custId) return;
  const cur = getState("sales.log." + custId, []);
  setState("sales.log." + custId, [{ type: "assign", txt, when: "zojuist", ts: Date.now() }, ...cur]);
}
function logToMember(memberId, entry) {
  if (!memberId) return;
  const members = asgMembers();
  setState("team.members", members.map((x) => x.id === memberId
    ? { ...x, log: [[entry.txt, "zojuist", entry.icon || "users", entry.accent || "navy"], ...(x.log || [])] }
    : x));
}

/* ============================================================
   WERKSTROOM-INDELING — exact dezelfde split als de widget-pools:
   sales-werkstroom vs website-werkstroom, al het andere = algemeen.
   Bepaalt op welk board een toegewezen taak in “Bij het team” /
   “Aan mij toegewezen” mag verschijnen (zoals de widget-markt al
   per board filtert). Verandert NIETS aan het toewijzen zelf.
   ============================================================ */
/* sales-werkstroom: dezelfde modules die op de sales-borden leven
   (deals/pipeline, CRM/relatiebeheer, leadfinder, offertes, facturen, contracten) */
const ASG_SALES_MODS = new Set(["sales", "deals", "pipeline", "crm", "relatiebeheer", "finder", "leadfinder", "offertes", "facturen", "contracten"]);
/* website-werkstroom: dezelfde modules die op het website-/groei-/studio-bord leven */
const ASG_WEB_MODS = new Set(["website", "beheer", "seo", "groei", "studio", "analytics", "paginas", "editor", "domein", "social"]);
function taskWorkflow(mod) {
  if (!mod) return "algemeen";
  if (ASG_SALES_MODS.has(mod)) return "sales";
  if (ASG_WEB_MODS.has(mod)) return "website";
  return "algemeen";
}
/* een tile-scope (mod of mod-lijst) -> werkstroom van dat board */
function scopeWorkflow(scope) {
  if (!scope) return null;
  return taskWorkflow(Array.isArray(scope) ? scope[0] : scope);
}
/* werkstroom van een toegewezen taak, afgeleid uit zijn key (geen mod op de record) */
function entryWorkflow(entry) {
  const key = String((entry && entry.key) || "");
  const ci = key.indexOf(":");
  const type = ci > -1 ? key.slice(0, ci) : key;
  const id = ci > -1 ? key.slice(ci + 1) : "";
  if (type === "task") { const t = KYANO.tasks && KYANO.tasks[+id]; return taskWorkflow(t && t.mod); }
  if (type === "utask") { const ut = (getState("user.tasks", []) || []).find((x) => String(x.id) === id); return taskWorkflow(ut && ut.mod); }
  /* sales-objecten (deal, klant, lead, sales-/pipeline-/relatie-taak) horen bij de sales-werkstroom */
  if (type === "deal" || type === "cust" || type === "lead" || type === "stask") return "sales";
  /* afspraak, gesprek e.d. -> algemeen (alleen op het hoofd-dashboard) */
  return "algemeen";
}

/* ---- assign-store ---- */
function assignedList() { return getState("assign.list", []); }
function isAssigned(key) { return assignedList().some((e) => e.key === key); }
function returnNote(key) { return getState("assign.returns", {})[key] || null; }
function clearReturn(key) { const r = Object.assign({}, getState("assign.returns", {})); if (key in r) { delete r[key]; setState("assign.returns", r); } }

function assignTaskTo(entry, member) {
  const actor = currentActor();
  const list = assignedList().filter((e) => e.key !== entry.key);
  const rec = {
    key: entry.key, title: entry.title, agent: entry.agent || null, name: entry.name || null,
    accent: entry.accent || "navy", custId: entry.custId || null,
    toId: member.id, toName: asgFirst(member.name), toRole: member.role,
    byId: actor.id, byName: asgFirst(actor.name), ts: Date.now(),
  };
  setState("assign.list", [rec, ...list]);
  clearReturn(entry.key);
  logToMember(member.id, { txt: "Taak van " + asgFirst(actor.name) + ": " + entry.title, icon: "inbox", accent: "navy" });
  logToMember(actor.id, { txt: "Toegewezen aan " + asgFirst(member.name) + ": " + entry.title, icon: "send", accent: "teal" });
  if (entry.custId) logToCustomer(entry.custId, asgFirst(actor.name) + " wees toe aan " + asgFirst(member.name) + ": " + entry.title);
  toast("Toegewezen aan " + asgFirst(member.name), { icon: "check" });
}
function pullBackTask(key) {
  const e = assignedList().find((x) => x.key === key);
  setState("assign.list", assignedList().filter((x) => x.key !== key));
  if (e) {
    const actor = currentActor();
    logToMember(e.toId, { txt: asgFirst(actor.name) + " trok de taak terug: " + e.title, icon: "arrow", accent: "orange" });
    if (e.custId) logToCustomer(e.custId, asgFirst(actor.name) + " zette taak terug van " + e.toName + ": " + e.title);
  }
}
function returnTaskWithNote(key, note) {
  const e = assignedList().find((x) => x.key === key);
  if (!e) return;
  const actor = currentActor();
  setState("assign.list", assignedList().filter((x) => x.key !== key));
  const r = Object.assign({}, getState("assign.returns", {}));
  r[key] = { note, byId: actor.id, byName: asgFirst(actor.name), toId: e.byId, toName: e.byName, ts: Date.now() };
  setState("assign.returns", r);
  logToMember(e.byId, { txt: asgFirst(actor.name) + " gaf terug: " + e.title + " — “" + note + "”", icon: "arrow", accent: "orange" });
  logToMember(actor.id, { txt: "Teruggegeven aan " + e.byName + ": " + e.title, icon: "arrow", accent: "orange" });
  if (e.custId) logToCustomer(e.custId, actor.name.split(" ")[0] + " gaf taak terug aan " + e.byName + ": “" + note + "”");
  toast("Teruggegeven aan " + e.byName, { icon: "arrow", kind: "muted" });
}

/* ============================================================
   TeamPicker — het gedeelde teamlid-kies-menu (avatar + naam + rol)
   ============================================================ */
function TeamPicker({ onPick, excludeIds, heading }) {
  const members = asgMembers().filter((x) => !(excludeIds || []).includes(x.id));
  const smRef = useSmartMenu({ align: "start", margin: 12 });
  return (
    <div className="assign-menu" ref={smRef} onClick={(e) => e.stopPropagation()} onPointerDown={(e) => e.stopPropagation()}>
      <div className="assign-head mono">{heading || "Kies teamlid"}</div>
      {members.map((mm) => (
        <button key={mm.id} className="assign-item" onClick={() => onPick(mm)}>
          <Avatar name={mm.name} size={22} />
          <span className="assign-lbl">{asgFirst(mm.name)}</span>
          <span className="assign-role mono">{asgRoleLabel(mm.role)}</span>
        </button>
      ))}
      {members.length === 0 && <div className="assign-empty mono">Geen andere teamleden.</div>}
    </div>
  );
}

/* ============================================================
   AssignAction — "Wijs toe aan…" op een taak-kaart. Alleen zichtbaar
   als de ingelogde rol het toewijs-recht heeft.
   entry = { key, title, agent, accent, name, custId }
   ============================================================ */
function AssignAction({ entry, onAssigned }) {
  useStore();
  const [open, setOpen] = useStateASG(false);
  useEffectASG(() => {
    if (!open) return;
    const close = () => setOpen(false);
    window.addEventListener("pointerdown", close);
    return () => window.removeEventListener("pointerdown", close);
  }, [open]);
  if (!canAssign()) return null;
  const actor = currentActor();
  return (
    <div className="assign-wrap">
      <button className="tk-act" onClick={(e) => {
        e.stopPropagation();
        setOpen((v) => !v);
      }}>
        <span dangerouslySetInnerHTML={{ __html: ICONS("users", { sw: 1.9 }) }} />Wijs toe aan…
      </button>
      {open && <TeamPicker excludeIds={[actor.id]} heading="Wijs toe aan teamlid"
        onPick={(mm) => { setOpen(false); assignTaskTo(entry, mm); onAssigned && onAssigned(mm); }} />}
    </div>
  );
}

/* ============================================================
   TeamAssignedSection — "Aan mij toegewezen" (met teruggeven) +
   "Bij het team" (wat ik heb doorgestuurd, met terugzetten).
   ============================================================ */
function ReturnComposer({ entry, onDone, onCancel }) {
  const [note, setNote] = useStateASG("");
  return (
    <div className="asg-return" onClick={(e) => e.stopPropagation()}>
      <div className="asg-return-h mono">Aantekening voor {entry.byName} (verplicht)</div>
      <textarea className="asg-return-in" autoFocus value={note} placeholder="Waarom geef je deze taak terug?"
        onChange={(e) => setNote(e.target.value)} rows={2} />
      <div className="asg-return-acts">
        <button className="asg-return-cancel" onClick={onCancel}>Annuleren</button>
        <button className="asg-return-send" disabled={!note.trim()}
          onClick={() => { if (note.trim()) { returnTaskWithNote(entry.key, note.trim()); onDone && onDone(); } }}>
          <span dangerouslySetInnerHTML={{ __html: ICONS("arrow", { sw: 2 }) }} />Teruggeven
        </button>
      </div>
    </div>
  );
}

function TeamAssignedSection({ boardWf }) {
  const store = useStore();
  const [returning, setReturning] = useStateASG(null);
  const list = store.get("assign.list", []);
  const actor = currentActor();
  /* op een module-board alleen taken uit de werkstroom van dat board; op het
     hoofd-dashboard (geen boardWf) mag alles — zelfde regel als de widget-markt. */
  const inWf = (e) => !boardWf || entryWorkflow(e) === boardWf;
  const mine = list.filter((e) => e.toId === actor.id && inWf(e));                 // aan mij toegewezen
  const delegated = list.filter((e) => e.byId === actor.id && e.toId !== actor.id && inWf(e)); // door mij doorgestuurd
  if (!mine.length && !delegated.length) return null;

  return (
    <div className="team-assigned">
      {mine.length > 0 && (<>
        <div className="team-assigned-h forme">
          <span className="team-assigned-dot forme" />Aan mij toegewezen<span className="team-assigned-n forme">{mine.length}</span>
        </div>
        {mine.map((e) => (
          <div className="prop-row resolved assigned forme" key={e.key}>
            <Avatar agent={e.agent} name={e.name} accent={e.accent} size={32} />
            <div className="prop-resolved-main">
              <span className="prop-resolved-title">{e.title}</span>
              <span className="prop-resolved-tag forme">Van {e.byName} · jij pakt dit op</span>
              {returning === e.key && <ReturnComposer entry={e} onDone={() => setReturning(null)} onCancel={() => setReturning(null)} />}
            </div>
            {returning !== e.key && <button className="prop-undo mono" onClick={() => setReturning(e.key)}>Teruggeven</button>}
          </div>
        ))}
      </>)}

      {delegated.length > 0 && (<>
        <div className="team-assigned-h">
          <span className="team-assigned-dot" />Bij het team<span className="team-assigned-n">{delegated.length}</span>
        </div>
        {delegated.map((e) => (
          <div className="prop-row resolved assigned" key={e.key}>
            <Avatar agent={e.agent} name={e.name} accent={e.accent} size={32} />
            <div className="prop-resolved-main">
              <span className="prop-resolved-title">{e.title}</span>
              <span className="prop-resolved-tag assigned">Toegewezen aan {e.toName} · {asgRoleLabel(e.toRole)}</span>
            </div>
            <button className="prop-undo mono" onClick={() => pullBackTask(e.key)}>Terugzetten</button>
          </div>
        ))}
      </>)}
    </div>
  );
}

/* Klein bannertje bovenin een taak-kaart wanneer hij is teruggegeven. */
function ReturnedBanner({ taskKey }) {
  const store = useStore();
  const r = store.get("assign.returns", {})[taskKey];
  if (!r) return null;
  return (
    <div className="asg-returned">
      <span className="asg-returned-ic" dangerouslySetInnerHTML={{ __html: ICONS("arrow", { sw: 2 }) }} />
      <div className="asg-returned-main">
        <b>Teruggegeven door {r.byName}</b>
        <span>“{r.note}”</span>
      </div>
      <button className="asg-returned-x" title="Sluiten" onClick={() => clearReturn(taskKey)}>
        <span dangerouslySetInnerHTML={{ __html: ICONS("close", { sw: 2.2 }) }} />
      </button>
    </div>
  );
}

/* ============================================================
   OwnerField — Eigenaar-veld (avatar + naam) op klantkaart & deal.
   Respecteert het toewijs-recht: alleen wie mag toewijzen kan wijzigen.
   ============================================================ */
function OwnerField({ owner, onChange, compact }) {
  useStore();
  const [open, setOpen] = useStateASG(false);
  useEffectASG(() => {
    if (!open) return;
    const close = () => setOpen(false);
    window.addEventListener("pointerdown", close);
    return () => window.removeEventListener("pointerdown", close);
  }, [open]);
  const editable = canAssign();
  const name = owner || "—";
  return (
    <div className={"owner-field" + (compact ? " compact" : "")}>
      {!compact && <span className="owner-field-lbl mono">Eigenaar</span>}
      <button className={"owner-chip" + (editable ? "" : " ro")} disabled={!editable}
        onClick={(e) => { e.stopPropagation(); if (!editable) return; setOpen((v) => !v); }}>
        <Avatar name={name} size={compact ? 20 : 24} />
        <span className="owner-chip-name">{asgFirst(name)}</span>
        {editable && <span className="owner-chip-chev" dangerouslySetInnerHTML={{ __html: ICONS("chevron", { sw: 2.2 }) }} />}
        {!editable && <span className="owner-chip-lock" dangerouslySetInnerHTML={{ __html: ICONS("lock", { sw: 1.9 }) }} />}
      </button>
      {open && editable && <TeamPicker heading="Eigenaar kiezen"
        onPick={(mm) => { setOpen(false); onChange && onChange(mm); }} />}
    </div>
  );
}

export {
  AssignAction, TeamAssignedSection, ReturnedBanner, OwnerField, TeamPicker,
  taskWorkflow, scopeWorkflow, entryWorkflow,
  assignedList, isAssigned, assignTaskTo, pullBackTask, returnTaskWithNote, returnNote, clearReturn,
  canAssign, canAssignRole, canEditAssignRight, currentActor, currentRole,
  assignPolicy, setAssignPolicy, logToCustomer, logToMember, asgMembers, asgFirst, asgRoleLabel,
};
