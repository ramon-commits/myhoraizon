/* ============================================================
   Taken-log — centrale, samengevoegde lijst van álle taken,
   ongeacht herkomst: agent-taken (task.status.{i}), eigen taken
   (user.tasks) en toegewezen taken (assign-laag). Toont + filtert
   alleen; verandert niets aan de taken zelf. Klik op een regel
   opent de taak via de bestaande onOpen/drawer-logica.
   Sluit aan op bestaande stijl (sx-search + seg/chip-stijl).
   ESM-port van de blauwdruk: window-globals -> imports/exports, body letterlijk.
   ============================================================ */
import React from 'react'
import { ICONS } from './icons'
import { KYANO } from './data'
import { useStore } from './store.jsx'
import { AC, ACsoft, Avatar } from './components.jsx'
import { assignedList } from './assign.jsx'
import { openKlantCard } from './objectactions.jsx'

const { useState: useStateTL } = React;

const MOD = {};
KYANO.modules.forEach((m) => { MOD[m.id] = m; });

const TLOG_SEED = Date.now();
const TLOG_MONTHS = ["jan", "feb", "mrt", "apr", "mei", "jun", "jul", "aug", "sep", "okt", "nov", "dec"];
function tlogRel(ts) {
  if (!ts) return "";
  const diff = TLOG_SEED - ts;
  const min = Math.round(diff / 60000), hr = Math.round(diff / 3600000), day = Math.round(diff / 86400000);
  if (min < 1) return "zojuist";
  if (min < 60) return min + " min geleden";
  if (hr < 24) return hr + " u geleden";
  if (day === 1) return "gisteren";
  if (day < 30) return day + " dgn geleden";
  const d = new Date(ts);
  return d.getDate() + " " + TLOG_MONTHS[d.getMonth()];
}

/* status → label + accent (accents bestaan al als --a-…) */
const TLOG_ST = {
  open:        { label: "Open", accent: "navy" },
  afgehandeld: { label: "Afgehandeld", accent: "green" },
  toegewezen:  { label: "Toegewezen", accent: "blue" },
  gesnoozed:   { label: "Gesnoozed", accent: "gold" },
  afgewezen:   { label: "Afgewezen", accent: "red" },
};
const TLOG_ORDER = ["open", "afgehandeld", "toegewezen", "gesnoozed", "afgewezen"];

/* alle bronnen samenvoegen tot één lijst (gededupliceerd: een toegewezen
   taak verschijnt als 'toegewezen', niet ook nog onder zijn bron). */
function tlogBuild(store) {
  const out = [];
  const assigned = assignedList();
  const assignedKeys = new Set(assigned.map((e) => e.key));

  (KYANO.tasks || []).forEach((t, i) => {
    const key = "task:" + i;
    if (assignedKeys.has(key)) return;
    const st = store.get("task.status." + i, "pending");
    const status = st === "approved" ? "afgehandeld" : st === "snoozed" ? "gesnoozed" : st === "rejected" ? "afgewezen" : "open";
    out.push({
      key, kind: "agent", title: t.title, agent: t.agent, accent: t.accent || "navy",
      status, assignedTo: null, custId: null, custName: null, modId: t.mod,
      ts: TLOG_SEED - 6 * 3600000 - i * 1500000, // recent, vannacht klaargezet, gespreid
      snoozeLabel: status === "gesnoozed" ? store.get("task.snooze." + i, "") : "",
    });
  });

  (store.get("user.tasks", []) || []).forEach((t) => {
    const key = "utask:" + t.id;
    if (assignedKeys.has(key)) return;
    const status = t.done ? "afgehandeld" : t.snooze ? "gesnoozed" : "open";
    const num = parseInt(String(t.id).replace(/\D/g, ""), 10);
    out.push({
      key, kind: "eigen", title: t.title, agent: null, accent: "navy",
      status, assignedTo: null, custId: t.custId || null, custName: t.custName || null, modId: t.mod || null,
      ts: num || TLOG_SEED, snoozeLabel: t.snooze || "",
    });
  });

  assigned.forEach((e) => {
    out.push({
      key: e.key, kind: e.key.indexOf("utask:") === 0 ? "eigen" : "agent",
      title: e.title, agent: e.agent || null, accent: e.accent || "blue",
      status: "toegewezen", assignedTo: e.toName || null, custId: e.custId || null, custName: null,
      modId: null, ts: e.ts || TLOG_SEED, byName: e.byName || null,
    });
  });

  return out.sort((a, b) => (b.ts || 0) - (a.ts || 0));
}

function TakenLogWidget({ size, onOpen }) {
  const store = useStore();
  const [q, setQ] = useStateTL("");
  const [fStatus, setFStatus] = useStateTL("all");
  const [fMember, setFMember] = useStateTL("all");
  const [fMod, setFMod] = useStateTL("all");
  const [showAll, setShowAll] = useStateTL(false);

  const all = tlogBuild(store);
  const counts = { open: 0, afgehandeld: 0, toegewezen: 0, gesnoozed: 0, afgewezen: 0 };
  all.forEach((e) => { counts[e.status] = (counts[e.status] || 0) + 1; });

  // beschikbare modules & teamleden voor de filters (alleen wat voorkomt)
  const modSet = []; const seenMod = {};
  all.forEach((e) => { if (e.modId && MOD[e.modId] && !seenMod[e.modId]) { seenMod[e.modId] = 1; modSet.push(e.modId); } });
  const memSet = []; const seenMem = {};
  all.forEach((e) => { if (e.assignedTo && !seenMem[e.assignedTo]) { seenMem[e.assignedTo] = 1; memSet.push(e.assignedTo); } });

  const cutoff = TLOG_SEED - 30 * 86400000;
  const older = all.filter((e) => e.ts && e.ts < cutoff).length;

  const ql = q.trim().toLowerCase();
  const rows = all.filter((e) => {
    if (!showAll && e.ts && e.ts < cutoff) return false;
    if (fStatus !== "all" && e.status !== fStatus) return false;
    if (fMember !== "all" && e.assignedTo !== fMember) return false;
    if (fMod !== "all" && e.modId !== fMod) return false;
    if (ql && e.title.toLowerCase().indexOf(ql) < 0) return false;
    return true;
  });

  const openRow = (e) => {
    if (e.custId) { openKlantCard(e.custId, "de taken-log"); return; }
    if (e.modId && onOpen) { onOpen(e.modId); return; }
    if (onOpen) onOpen("vandaag");
  };

  const chip = (key, label, n, accent) => (
    <button key={key} className={"tlog-chip" + (fStatus === key ? " on" : "")}
      style={fStatus === key ? { color: "#fff", background: AC(accent), borderColor: "transparent" } : { color: AC(accent), background: ACsoft(accent), borderColor: "transparent" }}
      onClick={() => setFStatus((v) => v === key ? "all" : key)}>
      <span className="tlog-chip-n">{n}</span>{label}
    </button>
  );

  return (
    <div className="tlog" onClick={(e) => e.stopPropagation()}>
      {/* tellers per status, dubbelen als status-filter (chip-stijl) */}
      <div className="tlog-counts seg-pick">
        <button className={"tlog-chip neutral" + (fStatus === "all" ? " on" : "")} onClick={() => setFStatus("all")}>
          <span className="tlog-chip-n">{all.length}</span>Alle
        </button>
        {TLOG_ORDER.map((k) => chip(k, TLOG_ST[k].label, counts[k] || 0, TLOG_ST[k].accent))}
      </div>

      {/* zoeken + filters (teamlid, module) */}
      <div className="tlog-tools">
        <label className="sx-search tlog-search">
          <span dangerouslySetInnerHTML={{ __html: ICONS("search", { sw: 2 }) }} />
          <input value={q} placeholder="Zoek in taaktitel…" onChange={(e) => setQ(e.target.value)} />
          {q && <button className="tlog-search-x" onClick={() => setQ("")} dangerouslySetInnerHTML={{ __html: ICONS("close", { sw: 2.4 }) }} />}
        </label>
        {memSet.length > 0 && (
          <div className="tlog-select-wrap">
            <select className="tlog-select" value={fMember} onChange={(e) => setFMember(e.target.value)}>
              <option value="all">Alle teamleden</option>
              {memSet.map((m) => <option key={m} value={m}>{m}</option>)}
            </select>
          </div>
        )}
        {modSet.length > 0 && (
          <div className="tlog-select-wrap">
            <select className="tlog-select" value={fMod} onChange={(e) => setFMod(e.target.value)}>
              <option value="all">Alle modules</option>
              {modSet.map((m) => <option key={m} value={m}>{MOD[m] ? MOD[m].name : m}</option>)}
            </select>
          </div>
        )}
      </div>

      {/* de lijst */}
      <div className="tlog-list">
        {rows.length === 0 ? (
          <div className="tlog-empty mono">{all.length === 0 ? "Nog geen taken om te tonen." : "Geen taken die aan deze filters voldoen."}</div>
        ) : rows.map((e) => {
          const mm = e.modId ? MOD[e.modId] : null;
          const ag = e.agent && KYANO.agents ? KYANO.agents[e.agent] : null;
          const stm = TLOG_ST[e.status];
          return (
            <button className="tlog-row" key={e.key} onClick={() => openRow(e)}>
              {ag ? <Avatar agent={e.agent} size={32} />
                : <span className="tlog-mark" style={{ color: AC("navy"), background: ACsoft("navy") }} dangerouslySetInnerHTML={{ __html: ICONS("check", { sw: 2.2 }) }} />}
              <div className="tlog-mid">
                <div className="tlog-title">{e.title}</div>
                <div className="tlog-meta">
                  <span className="tlog-by">{ag ? ag.name : "Eigen taak"}</span>
                  {e.assignedTo && <span className="tlog-dot">·</span>}
                  {e.assignedTo && <span className="tlog-assignee"><span dangerouslySetInnerHTML={{ __html: ICONS("users", { sw: 2 }) }} />{e.assignedTo}</span>}
                  {(e.custName || e.custId) && <span className="tlog-dot">·</span>}
                  {(e.custName || e.custId) && <span className="tlog-link"><span dangerouslySetInnerHTML={{ __html: ICONS("people", { sw: 2 }) }} />{e.custName || tlogCustName(store, e.custId)}</span>}
                  {mm && <span className="tlog-dot">·</span>}
                  {mm && <span className="tlog-link" style={{ color: AC(mm.accent) }}><span dangerouslySetInnerHTML={{ __html: ICONS(mm.icon, { sw: 2 }) }} />{mm.name}</span>}
                </div>
              </div>
              <span className="tlog-status" style={{ color: AC(stm.accent), background: ACsoft(stm.accent) }}>{e.status === "gesnoozed" && e.snoozeLabel ? e.snoozeLabel : stm.label}</span>
              <span className="tlog-time mono">{tlogRel(e.ts)}</span>
              <span className="tlog-go" dangerouslySetInnerHTML={{ __html: ICONS("chevron", { sw: 2.2 }) }} />
            </button>
          );
        })}
      </div>

      {/* tijdvenster */}
      <div className="tlog-foot">
        <span className="tlog-foot-lbl mono">{showAll ? "Volledige geschiedenis" : "Laatste 30 dagen"}{rows.length ? " · " + rows.length + (rows.length === 1 ? " taak" : " taken") : ""}</span>
        {(older > 0 || showAll) && (
          <button className="tlog-foot-btn" onClick={() => setShowAll((v) => !v)}>
            {showAll ? "Toon laatste 30 dagen" : "Toon alles" + (older ? " (" + older + " ouder)" : "")}
          </button>
        )}
      </div>
    </div>
  );
}

function tlogCustName(store, id) {
  if (!id) return "";
  const c = window.allCustomers ? window.allCustomers(store).find((x) => x.id === id) : null;
  return c ? c.name : "Klant";
}

export { TakenLogWidget };
