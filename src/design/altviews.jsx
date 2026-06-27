/* ============================================================
   altviews.jsx, inhoudelijke widget-weergaven (geen grafieken)
   Per widgettype passende views: Lijst (compact), Dagrooster,
   Week, Team-status, Kanaalvolume.
   ESM-port van de blauwdruk: window-globals -> imports/exports, body letterlijk.
   ============================================================ */
import { KYANO } from './data'
import { AC, ACsoft, StatBlock, Avatar } from './components.jsx'
import { breakdown } from './charts.jsx'

/* compacte rij-bron per widgettype */
function compactRows(m) {
  const K = KYANO || {};
  switch (m.tileKind) {
    case "today":
      return (K.tasks || []).slice(0, 7).map((t) => ({
        primary: t.title, secondary: t.desc, dot: t.urgent ? AC("orange") : null,
      }));
    case "agenda":
      return (m.today || []).slice(0, 7).map((e) => ({
        lead: e.time, primary: e.t, secondary: e.type, accent: e.accent,
      }));
    case "list":
      return (m.recent || []).slice(0, 7).map((r) => ({
        primary: r.name, secondary: r.last, meta: r.co,
      }));
    case "inbox":
      return (m.inbox || []).slice(0, 7).map((it) => ({
        primary: it.from, secondary: it.prev, meta: it.time, dot: it.urgent ? AC("orange") : null,
      }));
    case "invoices":
      return (m.list || []).slice(0, 7).map((x) => ({
        primary: x.name, secondary: x.company, meta: x.v, dot: x.paid ? AC("green") : AC("orange"),
      }));
    case "hotspots":
      return (m.hotspots || []).slice(0, 7).map((h, i) => ({
        lead: String(i + 1), primary: h.name, secondary: h.why,
      }));
    case "funnel":
      return (m.funnel || []).slice(0, 7).map((f) => ({
        primary: f.stage, meta: String(f.n) + (f.v ? " · " + f.v : ""),
      }));
    default:
      /* stat-kind widgets met een eigen lijst (offertes/contracten/studio/people) */
      if (Array.isArray(m.list)) return m.list.slice(0, 7).map((x) => ({
        primary: x.name, secondary: x.status, meta: x.v,
        dot: x.wait ? AC("gold") : (x.status && /getekend|geaccepteerd/i.test(x.status) ? AC("green") : null),
      }));
      if (Array.isArray(m.posts)) return m.posts.slice(0, 7).map((p) => ({
        primary: p.t, secondary: p.ch, meta: p.when, dot: p.wait ? AC("gold") : null,
      }));
      if (Array.isArray(m.team)) return m.team.slice(0, 7).map((t) => ({
        primary: t.name, secondary: t.access, meta: t.role,
      }));
      return [];
  }
}

function CompactView({ m, size }) {
  const med = size === "medium" || size === "large";
  let rows = compactRows(m);
  if (!rows.length && breakdown) {
    /* widget zonder eigen lijst, leid een betekenisvolle verdeling af */
    const bd = breakdown(m) || [];
    const fmt = (v) => (typeof v === "number"
      ? (m.money ? "€ " + String(Math.round(v)).replace(/\B(?=(\d{3})+(?!\d))/g, ".") : String(Math.round(v * 10) / 10).replace(".", ","))
      : v);
    rows = bd.slice(0, 7).map((b) => ({ primary: b.k, meta: fmt(b.v), dot: AC(b.accent || m.accent) }));
  }
  return (
    <>
      <StatBlock value={m.stat} sub={m.sub} delta={m.delta} money={m.money} size={med ? "lg" : "sm"} />
      {rows.length ? (
        <div className="cmp-list grow">
          {rows.map((r, i) => (
            <div className="cmp-row" key={i}>
              {r.lead != null && <span className="cmp-lead mono" style={r.accent ? { color: AC(r.accent) } : null}>{r.lead}</span>}
              {r.dot && <span className="cmp-dot" style={{ background: r.dot }} />}
              <span className="cmp-main">
                <b className="cmp-prim">{r.primary}</b>
                {r.secondary && <span className="cmp-sec">{r.secondary}</span>}
              </span>
              {r.meta && <span className="cmp-meta mono">{r.meta}</span>}
            </div>
          ))}
        </div>
      ) : <div className="cmp-empty mono">Geen items.</div>}
    </>
  );
}

/* Agenda, dagrooster (uur-grid) */
function DayView({ m, size }) {
  const evs = (m.today || []).map((e) => ({ ...e, h: parseInt(String(e.time), 10) || 9 }));
  if (!evs.length) return <CompactView m={m} size={size} />;
  let start = Math.min(...evs.map((e) => e.h));
  let end = Math.max(...evs.map((e) => e.h)) + 1;
  if (end - start < 4) end = start + 4;
  const hours = [];
  for (let h = start; h <= end; h++) hours.push(h);
  return (
    <div className="day-grid grow">
      {hours.map((h) => {
        const ev = evs.find((e) => e.h === h);
        return (
          <div className="day-row" key={h}>
            <span className="day-h mono">{String(h).padStart(2, "0")}:00</span>
            <span className="day-tick" />
            <div className="day-lane">
              {ev && (
                <div className="day-ev" style={{ background: ACsoft(ev.accent), borderColor: AC(ev.accent) }}>
                  <span className="day-ev-bar" style={{ background: AC(ev.accent) }} />
                  <span className="day-ev-main">
                    <b className="day-ev-t">{ev.t}</b>
                    <span className="day-ev-meta">{ev.time} · {ev.type}</span>
                  </span>
                </div>
              )}
            </div>
          </div>
        );
      })}
    </div>
  );
}

/* Agenda, week-overzicht */
function WeekView({ m, size }) {
  const week = m.week || [];
  if (!week.length) return <CompactView m={m} size={size} />;
  return (
    <div className="week-grid grow">
      {week.map((d, i) => (
        <div className="week-col" key={i}>
          <div className="week-day mono">{d.day}</div>
          <div className="week-items">
            {d.items.map((it, j) => (
              <div className="week-chip" key={j}><span className="week-chip-dot" />{it}</div>
            ))}
          </div>
        </div>
      ))}
    </div>
  );
}

/* Agents, team-status */
const STATUS_META = {
  actief: { lbl: "Actief", ac: "green" },
  wacht: { lbl: "Wacht op input", ac: "gold" },
  slaapt: { lbl: "Slaapt", ac: "navy" },
  pauze: { lbl: "Pauze", ac: "orange" },
};
function AgentStatusView({ m, size }) {
  const med = size === "medium" || size === "large";
  const roster = m.roster || [];
  const groups = {};
  roster.forEach((r) => { (groups[r.status] = groups[r.status] || []).push(r.key); });
  const order = ["actief", "wacht", "pauze", "slaapt"];
  const keys = Object.keys(groups).sort((a, b) => order.indexOf(a) - order.indexOf(b));
  const total = roster.length || 1;
  return (
    <>
      <StatBlock value={m.stat} sub={m.sub} delta={m.delta} money={m.money} size={med ? "lg" : "sm"} />
      <div className="status-list grow">
        {keys.map((st) => {
          const meta = STATUS_META[st] || { lbl: st, ac: "navy" };
          const arr = groups[st];
          return (
            <div className="status-row" key={st}>
              <span className="status-dot" style={{ background: AC(meta.ac) }} />
              <span className="status-lbl">{meta.lbl}</span>
              <div className="status-avs">
                {arr.slice(0, 6).map((k) => (<Avatar key={k} agent={k} size={24} />))}
              </div>
              <b className="status-n">{arr.length}<span className="status-tot">/{total}</span></b>
            </div>
          );
        })}
      </div>
    </>
  );
}

/* Inbox, kanaalvolume (horizontale balken) */
function ChannelVolView({ m, size }) {
  const med = size === "medium" || size === "large";
  const chans = (m.channels || []).filter((c) => c.n != null);
  if (!chans.length) return <CompactView m={m} size={size} />;
  const max = Math.max(...chans.map((c) => c.n)) || 1;
  return (
    <>
      <StatBlock value={m.stat} sub={m.sub} delta={m.delta} money={m.money} size={med ? "lg" : "sm"} />
      <div className="chanvol-list grow">
        {chans.map((c, i) => (
          <div className="chanvol-row" key={i}>
            <span className="chanvol-k">{c.k}</span>
            <span className="chanvol-track">
              <span className="chanvol-fill" style={{ width: (c.n / max * 100) + "%", background: AC(c.accent) }} />
            </span>
            <b className="chanvol-n mono">{c.n}</b>
          </div>
        ))}
      </div>
    </>
  );
}

export { CompactView, DayView, WeekView, AgentStatusView, ChannelVolView, compactRows };
