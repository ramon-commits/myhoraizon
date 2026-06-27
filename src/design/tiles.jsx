/* ============================================================
   Dashboard-grid: slepen + wiebel-modus + S/M/L resize
   ============================================================ */
import React from 'react'
import { ICONS } from './icons'
import { KYANO } from './data'
import { useStore, setState, confirmAsk, toast } from './store.jsx'
import { AC, ACsoft, KpiStrip, StatBlock, Sparkline, AreaChart, BarChart, Avatar, Delta, Bar, ChannelIcon, Eyebrow } from './components.jsx'
import { useSmartMenu } from './menus'
import { WidgetChart, syncedNums, monthSeries, secondAccent } from './charts.jsx'
import { CompactView, DayView, WeekView, AgentStatusView, ChannelVolView } from './altviews.jsx'
import { IrisVoorstellen } from './dashboard.jsx'

const { useState, useRef, useEffect, useCallback } = React

/* Iris-aandacht als losse, aanpasbare dashboard-widget (geen echte module) */
const IRIS_TILE = { id: "irisattn", tile: "IRIS", name: "Iris vraagt aandacht", icon: "spark", accent: "teal", size: "large", tileKind: "irisattn", openTarget: "iris" };
/* KPI-overzicht als volwaardige (volle-breedte) widget */
const KPIS_TILE = { id: "kpis", tile: "KPI'S", name: "Kerncijfers (KPI's)", icon: "bars", accent: "navy", size: "wide", tileKind: "kpis", sizes: ["wide"], noNav: true };
/* ---- Iris-board widgets (alleen op de Iris-pagina beschikbaar) ---- */
const IRISCHAT_TILE = { id: "irischat", tile: "CHAT MET IRIS", name: "Chat met Iris", icon: "spark", accent: "teal", size: "large", tileKind: "irischat", noNav: true };
const IRISBRIEF_TILE = { id: "irisbrief", tile: "BRIEFING", name: "Iris ochtendbriefing", icon: "sun", accent: "teal", size: "xl", tileKind: "irisbrief", noNav: true };
const IRISFLAGS_TILE = { id: "irisflags", tile: "RODE VLAGGEN", name: "Rode vlaggen", icon: "bell", accent: "red", size: "medium", tileKind: "irisflags", noNav: true };
/* ---- Vandaag-bord widgets (Vandaag-specifiek) ---- */
const VOORSTEL_TILE = { id: "voorstel", tile: "TAKEN", name: "Taken", icon: "check", accent: "teal", size: "xl", tileKind: "voorstel", noNav: true, group: "Vandaag" };
const SNELACT_TILE = { id: "snelacties", tile: "SNELLE ACTIES", name: "Snelle acties", icon: "grid", accent: "navy", size: "large", tileKind: "snelacties", noNav: true, group: "Vandaag" };
/* ---- Sales-bord widgets (Sales-specifiek) ---- */
const SALESKPIS_TILE = { id: "saleskpis", tile: "KPI'S", name: "Sales-kerncijfers (KPI's)", icon: "bars", accent: "red", size: "wide", tileKind: "kpis", sizes: ["wide"], noNav: true, group: "Sales", kpiStoreKey: "myhoraizon.saleskpis.v1", kpiCountKey: "saleskpis.count", kpiDefault: ["pipeline", "deals", "gewonnen", "conversie"] };
const SALESTAKEN_TILE = { id: "salestaken", tile: "SALES-TAKEN", name: "Sales-taken", icon: "check", accent: "red", size: "xl", tileKind: "salestaken", noNav: true, group: "Sales", scope: "sales" };
const SALESKANSEN_TILE = { id: "saleskansen", tile: "SALESKANSEN", name: "Nieuwe saleskansen", icon: "spark", accent: "red", size: "xl", tileKind: "saleskansen", noNav: true, group: "Sales" };
const PIPETAKEN_TILE = { id: "pipelinetaken", tile: "PIPELINE-TAKEN", name: "Pipeline-taken", icon: "check", accent: "red", size: "xl", tileKind: "pipelinetaken", noNav: true, group: "Sales" };
const RELTAKEN_TILE = { id: "relatietaken", tile: "RELATIE-TAKEN", name: "Relatie-taken (CRM-signalen)", icon: "spark", accent: "red", size: "xl", tileKind: "relatietaken", noNav: true, group: "Sales" };
const RELKPIS_TILE = { id: "relatiekpis", tile: "KPI'S", name: "Relatie-kerncijfers (KPI's)", icon: "bars", accent: "red", size: "wide", tileKind: "kpis", sizes: ["wide"], noNav: true, group: "Sales", kpiStoreKey: "myhoraizon.relatiekpis.v1", kpiCountKey: "relatiekpis.count", kpiDefault: ["contacten", "stil", "omzet", "gewonnen"] };
/* ---- Website-bord widgets (Website-specifiek) ---- */
const WEBKPIS_TILE = { id: "webkpis", tile: "KPI'S", name: "Website-kerncijfers (KPI's)", icon: "bars", accent: "gold", size: "wide", tileKind: "kpis", sizes: ["wide"], noNav: true, group: "Website", kpiStoreKey: "myhoraizon.webkpis.v1", kpiCountKey: "webkpis.count", kpiDefault: ["bezoekers", "aanvragen", "top10", "conversie"] };
const WEBTAKEN_TILE = { id: "websitetaken", tile: "WEBSITE-TAKEN", name: "Website-taken", icon: "check", accent: "gold", size: "xl", tileKind: "salestaken", noNav: true, group: "Website", scope: ["website", "beheer", "seo", "studio", "analytics"] };

/* ---- Groei-bord widget (Groei-specifiek) ---- */
const GROEITAKEN_TILE = { id: "groeitaken", tile: "GROEI-VOORSTELLEN", name: "Groei-voorstellen", icon: "spark", accent: "purple", size: "xl", tileKind: "salestaken", noNav: true, group: "Groei", scope: "seo" };
const GROEIKPIS_TILE = { id: "groeikpis", tile: "KPI'S", name: "Groei-kerncijfers · Semrush &amp; Clarity", icon: "bars", accent: "gold", size: "wide", tileKind: "kpis", sizes: ["wide"], noNav: true, group: "Groei", kpiStoreKey: "myhoraizon.groeikpis.v1", kpiCountKey: "groeikpis.count", kpiDefault: ["organic", "kwpos", "claritysessies", "scroll"] };

/* ---- Studio-bord widgets (Studio-specifiek) ---- */
const STUDIOCONCEPTEN_TILE = { id: "studioconcepten", tile: "CONCEPTEN VAN MILA", name: "Concepten van Mila", icon: "pencil", accent: "mila", size: "xl", tileKind: "salestaken", noNav: true, group: "Studio", scope: ["studio"] };
const STUDIOKPIS_TILE = { id: "studiokpis", tile: "KPI'S", name: "Studio-kerncijfers (KPI's)", icon: "bars", accent: "mila", size: "wide", tileKind: "kpis", sizes: ["wide"], noNav: true, group: "Studio", kpiStoreKey: "myhoraizon.studiokpis.v1", kpiCountKey: "studiokpis.count", kpiDefault: ["concepten", "blogslive", "pageviewsblog", "conceptdraait"] };

/* ---- Taken-log: centrale, samengevoegde takenlijst, op elk board te plaatsen ---- */
const TAKENLOG_TILE = { id: "takenlog", tile: "TAKEN-LOG", name: "Taken-log", icon: "li", accent: "navy", size: "xl", tileKind: "takenlog", noNav: true, sizes: ["medium", "large", "xl", "wide"] };

const EXTRA_TILES = [KPIS_TILE, IRIS_TILE, IRISCHAT_TILE, IRISBRIEF_TILE, IRISFLAGS_TILE, VOORSTEL_TILE, SNELACT_TILE, SALESKPIS_TILE, SALESTAKEN_TILE, GROEITAKEN_TILE, GROEIKPIS_TILE, SALESKANSEN_TILE, PIPETAKEN_TILE, RELTAKEN_TILE, RELKPIS_TILE, WEBKPIS_TILE, WEBTAKEN_TILE, STUDIOCONCEPTEN_TILE, STUDIOKPIS_TILE, TAKENLOG_TILE];

const MOD = {};
KYANO.modules.forEach((m) => (MOD[m.id] = m));
EXTRA_TILES.forEach((t) => (MOD[t.id] = t));

/* ===== boards: 'dashboard' en 'iris', elk eigen opslag + widgetpool ===== */
const DASH_ORDER = [
  "kpis", "irisattn", "omzet", "agenda", "vandaag", "sales", "crm", "facturen",
  "exact", "social", "finder", "agents", "analytics", "offertes",
  "contracten", "website", "seo", "studio", "people", "club",
];
/* Iris-board: alleen widgets van de Iris-module zelf */
const IRIS_POOL = ["irischat", "irisbrief", "irisattn", "irisflags", "takenlog"];
const IRIS_ORDER = ["irisbrief", "irischat", "irisattn", "irisflags"];
/* Vandaag-board: voorstellen (specifiek) + ondersteunende widgets */
const VANDAAG_POOL = ["voorstel", "kpis", "agenda", "postvak", "irisbrief", "irisattn", "snelacties", "irisflags", "takenlog"];
const VANDAAG_ORDER = ["voorstel", "kpis", "agenda", "postvak", "irisbrief", "irisattn", "snelacties", "irisflags"];
const SINGLE_TILES = new Set(["kpis", "irisattn", "irischat", "irisbrief", "irisflags", "voorstel", "snelacties", "saleskpis", "salestaken", "groeitaken", "groeikpis", "saleskansen", "pipelinetaken", "relatietaken", "relatiekpis", "webkpis", "websitetaken", "studioconcepten", "studiokpis", "takenlog"]);
/* Sales-board: KPI + sales-taken + iris + de sales-deelmodules als widgets */
const SALES_POOL = ["saleskpis", "salestaken", "irisattn", "pipeline", "crm", "relatiebeheer", "finder", "omzet", "agenda", "offertes", "facturen", "contracten", "analytics", "takenlog"];
const SALES_ORDER = ["omzet", "saleskpis", "salestaken", "irisattn", "pipeline", "crm", "relatiebeheer", "finder"];
/* Pipeline-board: ondersteunende widgets onder de pijplijn (taken + bord staan vast in de kop) */
const PIPE_POOL = ["saleskansen", "pipelinetaken", "saleskpis", "omzet", "crm", "relatiebeheer", "finder", "analytics", "agenda", "irisattn", "salestaken", "offertes", "facturen", "contracten", "takenlog"];
const PIPE_ORDER = ["saleskansen", "pipelinetaken", "saleskpis", "omzet", "crm", "finder", "relatiebeheer", "analytics"];
/* Relatiebeheer-board: CRM-signalen (relatie-taken) + retentie-KPI's + ondersteunende widgets */
const REL_POOL = ["relatietaken", "relatiekpis", "saleskpis", "omzet", "crm", "finder", "analytics", "agenda", "irisattn", "salestaken", "facturen", "contracten", "offertes", "takenlog"];
const REL_ORDER = ["relatietaken", "relatiekpis", "omzet", "crm", "analytics", "finder", "agenda", "irisattn"];
/* CRM-board: dezelfde KPI- en snelle-acties-widgets als op dashboard/vandaag + ondersteunende relatie-widgets */
const CRM_POOL = ["relatiekpis", "snelacties", "relatietaken", "saleskpis", "salestaken", "agenda", "irisattn", "omzet", "analytics", "finder", "takenlog"];
const CRM_ORDER = ["relatiekpis", "snelacties"];
/* Website-board: KPI + website-taken + iris + de website-deelmodules als widgets */
const WEB_POOL = ["webkpis", "websitetaken", "irisattn", "analytics", "seo", "studio", "paginas", "editor", "domein", "social", "omzet", "agenda", "takenlog"];
const WEB_ORDER = ["webkpis", "websitetaken", "irisattn", "analytics", "seo", "studio", "paginas", "editor"];
/* Groei-board: alle SEO/CRO/AI-voorstellen in de taken-widget + ondersteunende widgets */
const GROEI_POOL = ["groeikpis", "groeitaken", "irisattn", "analytics", "paginas", "editor", "omzet", "agenda", "takenlog"];
const GROEI_ORDER = ["groeikpis", "groeitaken", "irisattn", "analytics", "paginas"];
/* Studio-board: concepten van Mila + KPI + iris + de gerelateerde modules als widgets */
const STUDIO_POOL = ["studiokpis", "studioconcepten", "irisattn", "editor", "seo", "analytics", "paginas", "omzet", "agenda", "takenlog"];
const STUDIO_ORDER = ["studiokpis", "studioconcepten", "irisattn", "editor", "seo"];

const BOARDS = {
  dashboard: {
    key: "myhoraizon.layout.v2",
    ids: () => [...KYANO.modules.map((m) => m.id), "kpis", "irisattn", "takenlog"],
    order: DASH_ORDER, pin: ["irisattn", "kpis"], autofill: true, market: ["takenlog"],
  },
  iris: {
    key: "myhoraizon.iris.layout.v1",
    ids: () => IRIS_POOL.filter((id) => MOD[id]),
    order: IRIS_ORDER, pin: ["irisbrief", "irischat"], autofill: false,
  },
  vandaag: {
    key: "myhoraizon.vandaag.layout.v1",
    ids: () => VANDAAG_POOL.filter((id) => MOD[id]),
    order: VANDAAG_ORDER, pin: ["voorstel"], autofill: false,
  },
  sales: {
    key: "myhoraizon.sales.layout.v2",
    ids: () => SALES_POOL.filter((id) => MOD[id]),
    order: SALES_ORDER, pin: ["saleskpis", "salestaken"], autofill: false,
  },
  pipeline: {
    key: "myhoraizon.pipeline.layout.v3",
    ids: () => PIPE_POOL.filter((id) => MOD[id]),
    order: PIPE_ORDER, pin: ["saleskansen", "pipelinetaken", "saleskpis"], autofill: false,
  },
  relatiebeheer: {
    key: "myhoraizon.relatie.layout.v2",
    ids: () => REL_POOL.filter((id) => MOD[id]),
    order: REL_ORDER, pin: ["relatietaken", "relatiekpis"], autofill: false,
  },
  crm: {
    key: "myhoraizon.crm.layout.v1",
    ids: () => CRM_POOL.filter((id) => MOD[id]),
    order: CRM_ORDER, pin: ["relatiekpis", "snelacties"], autofill: false,
  },
  website: {
    key: "myhoraizon.website.layout.v1",
    ids: () => WEB_POOL.filter((id) => MOD[id]),
    order: WEB_ORDER, pin: ["webkpis", "websitetaken"], autofill: false,
  },
  seo: {
    key: "myhoraizon.seo.layout.v1",
    ids: () => GROEI_POOL.filter((id) => MOD[id]),
    order: GROEI_ORDER, pin: ["groeikpis", "groeitaken"], autofill: false,
  },
  studio: {
    key: "myhoraizon.studio.layout.v1",
    ids: () => STUDIO_POOL.filter((id) => MOD[id]),
    order: STUDIO_ORDER, pin: ["studiokpis", "studioconcepten"], autofill: false,
  },
};

function boardSizes(board) {
  const s = {};
  BOARDS[board].ids().forEach((id) => { s[id] = (MOD[id] && MOD[id].size) || "medium"; });
  if (board === "iris") { s.irischat = "large"; s.irisbrief = "xl"; s.irisattn = "large"; s.irisflags = "medium"; }
  if (board === "vandaag") { s.voorstel = "xl"; s.kpis = "wide"; s.agenda = "large"; s.postvak = "large"; s.irisbrief = "xl"; s.snelacties = "large"; s.irisattn = "large"; s.irisflags = "medium"; }
  if (board === "sales") { s.omzet = "xl"; s.saleskpis = "wide"; s.salestaken = "xl"; s.irisattn = "large"; s.pipeline = "medium"; s.crm = "medium"; s.relatiebeheer = "medium"; s.finder = "medium"; }
  if (board === "pipeline") { s.saleskansen = "xl"; s.pipelinetaken = "xl"; s.saleskpis = "wide"; s.omzet = "xl"; s.crm = "medium"; s.finder = "medium"; s.relatiebeheer = "medium"; s.analytics = "medium"; s.agenda = "large"; s.irisattn = "large"; s.salestaken = "xl"; }
  if (board === "relatiebeheer") { s.relatietaken = "xl"; s.relatiekpis = "wide"; s.saleskpis = "wide"; s.crm = "medium"; s.omzet = "xl"; s.analytics = "medium"; s.finder = "medium"; s.agenda = "large"; s.irisattn = "large"; s.salestaken = "xl"; }
  if (board === "crm") { s.relatiekpis = "wide"; s.snelacties = "xl"; s.relatietaken = "xl"; s.saleskpis = "wide"; s.salestaken = "xl"; s.agenda = "large"; s.irisattn = "large"; s.omzet = "xl"; s.analytics = "medium"; s.finder = "medium"; }
  if (board === "website") { s.webkpis = "wide"; s.websitetaken = "xl"; s.irisattn = "large"; s.analytics = "medium"; s.seo = "medium"; s.studio = "medium"; s.beheer = "medium"; s.social = "medium"; s.omzet = "xl"; s.finder = "medium"; }
  if (board === "seo") { s.groeikpis = "wide"; s.groeitaken = "xl"; s.irisattn = "large"; s.analytics = "medium"; s.paginas = "medium"; s.editor = "medium"; s.omzet = "xl"; s.agenda = "large"; }
  if (board === "studio") { s.studiokpis = "wide"; s.studioconcepten = "xl"; s.irisattn = "large"; s.editor = "medium"; s.seo = "medium"; s.analytics = "medium"; s.paginas = "medium"; s.omzet = "xl"; s.agenda = "large"; }
  return s;
}
function buildDefault(board) {
  const cfg = BOARDS[board];
  const all = cfg.ids();
  const sizes = boardSizes(board);
  let order, hidden;
  const market = cfg.market || [];
  if (cfg.autofill) {
    order = [...cfg.order.filter((id) => all.includes(id)), ...all.filter((id) => !cfg.order.includes(id) && !market.includes(id))];
    hidden = all.filter((id) => !order.includes(id));
  } else {
    order = cfg.order.filter((id) => all.includes(id));
    hidden = all.filter((id) => !order.includes(id));
  }
  return { order, hidden, sizes, views: {} };
}

const DEFAULT_LAYOUT = buildDefault("dashboard");

function loadLayout(board = "dashboard") {
  const cfg = BOARDS[board];
  const def = buildDefault(board);
  try {
    const raw = JSON.parse(localStorage.getItem(cfg.key));
    if (raw && raw.order) {
      const all = cfg.ids();
      const validKey = (k) => all.includes(baseOf(k));
      const knownBases = new Set([...(raw.order || []), ...(raw.hidden || [])].map(baseOf));
      const missing = all.filter((id) => !knownBases.has(id));
      let order = raw.order.filter(validKey);
      let hidden = (raw.hidden || []).filter(validKey);
      if (cfg.autofill) {
        const market = cfg.market || [];
        order = [...order, ...missing.filter((id) => !market.includes(id))];
        hidden = [...hidden, ...missing.filter((id) => market.includes(id) && !order.includes(id))];
      } else hidden = [...hidden, ...missing.filter((id) => !order.includes(id))];
      cfg.pin.forEach((id) => {
        if (missing.includes(id)) {
          hidden = hidden.filter((x) => x !== id);
          if (!order.includes(id)) order.unshift(id);
        }
      });
      return { order, hidden, sizes: { ...def.sizes, ...(raw.sizes || {}) }, views: { ...(raw.views || {}) } };
    }
  } catch (e) {}
  return JSON.parse(JSON.stringify(def));
}
function saveLayout(l, board = "dashboard") { try { localStorage.setItem(BOARDS[board].key, JSON.stringify(l)); } catch (e) {} }

/* instance-sleutels: een widget kan meerdere keren op het dashboard ("crm", "crm#1731…") */
const baseOf = (key) => String(key).split("#")[0];
const newInstanceKey = (base) => base + "#" + Date.now().toString(36) + Math.floor(Math.random() * 1000);

/* ===== per-widget weergaven (views) =====================================
   Volledig data-gedreven: een view verschijnt alleen als de widget de juiste
   data heeft. Tijdreeks-grafieken (area/bar/line) alleen bij een echte trend;
   cirkel alleen bij echte categorische data; compacte lijst alleen bij een
   lijst-bron; dag/week/status/kanalen bij het bijbehorende type.            */
/* elke module-widget met een cijfer (of koppeling met meetbare synced-waarden)
   krijgt grafiek-views; één bron van waarheid = chartable.            */
const NOCHART = new Set(["kpis", "irisattn", "irischat", "irisbrief", "irisflags", "voorstel", "snelacties", "salestaken", "studioconcepten"]);
const STD_LABEL = {
  agenda: "Tijdlijn", today: "Taken", inbox: "Gesprekken", list: "Contacten",
  funnel: "Trechter", hotspots: "Kansen", agents: "Team", invoices: "Facturen",
  spark: "Trend", site: "Status", social: "Kanalen", integration: "Koppeling", barchart: "Overzicht",
  voorstel: "Lijst", salestaken: "Lijst",
};
const VLAB = {
  std: "Overzicht", cijfer: "Cijfer", compact: "Lijst",
  area: "Area", bar: "Staaf", line: "Lijn", pie: "Cirkel",
  kanalen: "Kanalen", status: "Status", dag: "Dagrooster", week: "Week",
  kaarten: "Kaarten",
};
const viewLabel = (v, m) => (v === "std" ? ((m && STD_LABEL[m.tileKind]) || "Overzicht") : (VLAB[v] || v));
function widgetViews(m, size) {
  if (!m) return null;
  /* Taken/Vandaag-widgets: dunne lijst (standaard) of grotere actiekaarten */
  if (m.tileKind === "voorstel" || m.tileKind === "salestaken" || m.tileKind === "pipelinetaken" || m.tileKind === "relatietaken") return ["std", "kaarten"];
  if (NOCHART.has(m.tileKind)) return null;
  /* koppelingen: overzicht + grafieken/lijst zodra er ≥2 meetbare synced-waarden zijn */
  if (m.tileKind === "integration") {
    let io = ["std"];
    const sn = syncedNums ? syncedNums(m) : [];
    if (sn.length >= 2) ["compact", "area", "bar", "line", "pie"].forEach((v) => io.push(v));
    if (m.stat != null && String(m.stat).trim() !== "") io.push("cijfer");
    return io;
  }
  let out = ["std"];
  /* inhoudelijke, type-specifieke views (alleen waar ze betekenis hebben) */
  if (m.tileKind === "agenda" && size !== "small") { out.push("dag"); if (Array.isArray(m.week) && m.week.length) out.push("week"); }
  if (m.tileKind === "inbox" && Array.isArray(m.channels) && m.channels.some((c) => c.n != null)) out.push("kanalen");
  if (m.tileKind === "agents" && Array.isArray(m.roster) && m.roster.length) out.push("status");
  /* universele views, elke widget krijgt lijst, grafieken en cirkel */
  out.push("compact");
  ["area", "bar", "line", "pie"].forEach((v) => out.push(v));
  /* groot cijfer alleen als er een getal is */
  if (m.stat != null && String(m.stat).trim() !== "") out.push("cijfer");
  out = out.filter((v, i) => out.indexOf(v) === i);
  return out.length ? out : ["std"];
}

/* ---------- compacte tegel-inhoud per type ---------- */
function TileBody({ m, size, onOpen, count, view, edit }) {
  const big = size === "large" || size === "xl", med = size === "medium" || big;

  if (m.tileKind === "kpis") {
    return <div className="kpis-tilebody" onClick={(e) => e.stopPropagation()}><KpiStrip onOpen={onOpen || (() => {})} count={count} editing={edit} storeKey={m.kpiStoreKey} defaultIds={m.kpiDefault} countKey={m.kpiCountKey} /></div>;
  }
  const ALT = { compact: CompactView, dag: DayView, week: WeekView, status: AgentStatusView, kanalen: ChannelVolView };
  if (ALT[view]) { const Alt = ALT[view]; return <Alt m={m} size={size} />; }
  if (view === "cijfer" && m.stat) {
    return (
      <div className="tile-cijfer">
        <StatBlock value={m.stat} sub={m.sub} delta={m.delta} money={m.money} size="lg" />
        {Array.isArray(m.trend) && <div className="tile-spark-foot"><Sparkline data={m.trend} accent={m.accent} h={med ? 48 : 38} /></div>}
      </div>
    );
  }
  const CHART_VIEWS = ["area", "bar", "line", "pie"];
  if (CHART_VIEWS.includes(view) && WidgetChart) {
    return (<>
      {m.stat != null && String(m.stat).trim() !== "" &&
        <StatBlock value={m.stat} sub={m.sub} delta={m.delta} money={m.money} size={med ? "lg" : "sm"} />}
      <div className="tile-spark-foot widget-chart grow"><WidgetChart m={m} view={view} size={size} /></div>
    </>);
  }
  if (m.tileKind === "irischat") {
    return <div className="irischat-tile" onClick={(e) => e.stopPropagation()}>{window.IrisChat ? React.createElement(window.IrisChat, { showActions: false, autoFocus: false }) : null}</div>;
  }
  if (m.tileKind === "irisbrief") {
    return <div className="irisbrief-tile" onClick={(e) => e.stopPropagation()}>{window.IrisBriefing ? React.createElement(window.IrisBriefing, { size, onOpen }) : null}</div>;
  }
  if (m.tileKind === "irisflags") {
    return <div className="irisflags-tile" onClick={(e) => e.stopPropagation()}>{window.IrisFlags ? React.createElement(window.IrisFlags, { size }) : null}</div>;
  }
  if (m.tileKind === "voorstel") {
    return <div className="voorstel-tile" onClick={(e) => e.stopPropagation()}>{window.VoorstellenWidget ? React.createElement(window.VoorstellenWidget, { size, view, onOpen: onOpen || (() => {}) }) : null}</div>;
  }
  if (m.tileKind === "takenlog") {
    return <div className="takenlog-tile" onClick={(e) => e.stopPropagation()}>{window.TakenLogWidget ? React.createElement(window.TakenLogWidget, { size, onOpen: onOpen || (() => {}) }) : null}</div>;
  }
  if (m.tileKind === "salestaken") {
    return <div className="voorstel-tile" onClick={(e) => e.stopPropagation()}>{window.VoorstellenWidget ? React.createElement(window.VoorstellenWidget, { size, view, onOpen: onOpen || (() => {}), scope: m.scope || "sales" }) : null}</div>;
  }
  if (m.tileKind === "saleskansen") {
    return window.SaleskansenWidget ? React.createElement(window.SaleskansenWidget, { onOpen: onOpen || (() => {}) }) : null;
  }
  if (m.tileKind === "pipelinetaken") {
    return window.PipelineTakenWidget ? React.createElement(window.PipelineTakenWidget, { size, view, onOpen: onOpen || (() => {}) }) : null;
  }
  if (m.tileKind === "relatietaken") {
    return window.RelatieTakenWidget ? React.createElement(window.RelatieTakenWidget, { size, view, onOpen: onOpen || (() => {}) }) : null;
  }
  if (m.tileKind === "snelacties") {
    return <div className="snelacties-tile" onClick={(e) => e.stopPropagation()}>{window.SnelleActiesWidget ? React.createElement(window.SnelleActiesWidget, { onOpen: onOpen || (() => {}) }) : null}</div>;
  }
  if (m.tileKind === "irisattn") {
    const Comp = IrisVoorstellen;
    if (!med) {
      const n = KYANO.irisCards ? KYANO.irisCards.length : 0;
      return (
        <div className="irisattn-mini">
          <div className="irisattn-mini-n" style={{ color: AC("teal") }}>{n}</div>
          <div className="irisattn-mini-lbl">openstaand · tik om te bekijken</div>
        </div>
      );
    }
    return <div className="irisattn-body" onClick={(e) => e.stopPropagation()}>{Comp ? <Comp /> : null}</div>;
  }

  const stat = <StatBlock value={m.stat} sub={m.sub} delta={m.delta} money={m.money} size={med ? "lg" : "sm"} />;

  const DEFAULT_TREND = [4, 5, 4.6, 6, 5.4, 6.4, 6, 7.2];
  const CHART_OK = ["omzet", "analytics", "website", "seo", "club", "sales", "facturen", "exact", "mollie", "social", "agents", "finder"];
  const trendData = CHART_OK.includes(m.id) ? (Array.isArray(m.trend) ? m.trend : (m.stat ? DEFAULT_TREND : null)) : null;
  const hasTrend = Array.isArray(trendData);
  const SparkFoot = hasTrend ? (
    <div className={"tile-spark-foot" + (med ? " grow" : "")}>
      <AreaChart data={trendData} accent={m.accent} height={med ? (big ? 150 : 92) : 54} gridlines={med} />
    </div>
  ) : null;

  const Signal = (txt, ac, ic) => (
    <div className="tile-signal" style={{ color: AC(ac || m.accent) }}>
      <span dangerouslySetInnerHTML={{ __html: ICONS(ic || "spark", { sw: 1.7 }) }} />{txt}
    </div>
  );

  // ---------- SMALL ----------
  if (!med) {
    return (<>
      {stat}
      {m.id === "people" ? (
        <div className="mini-avatars">
          {m.team.slice(0, 4).map((p, i) => (
            <span key={i} className="mini-letter" style={{ background: ACsoft(m.accent), color: AC(m.accent) }}>{p.name[0]}</span>
          ))}
        </div>
      ) : hasTrend ? SparkFoot
        : m.signal ? <div className="tile-foot">{Signal(m.signal)}</div>
        : m.note ? <div className="tile-foot tile-note">{m.note}</div> : null}
    </>);
  }

  // ---------- MEDIUM / LARGE ----------
  switch (m.tileKind) {
    case "today":
      return (<>
        {stat}
        <div className="tile-list bordered">
          {KYANO.tasks.slice(0, big ? 5 : 3).map((t, i) => (
            <div className="mini-row" key={i}>
              <Avatar agent={t.agent} size={28} />
              <div className="mini-main">
                <div className="mini-top"><b>{t.title}</b></div>
                <div className="mini-prev">{MOD[t.mod] ? MOD[t.mod].name : t.mod} · {t.desc}</div>
              </div>
              {t.urgent && <span className="dot" style={{ background: AC("orange") }} />}
            </div>
          ))}
        </div>
      </>);

    case "inbox":
      return (<>
        {stat}
        <div className="chan-row">
          {m.channels.map((c) => (
            <span key={c.k} className="chan-pill" style={{ color: AC(c.accent), background: ACsoft(c.accent) }}>
              <b>{c.n}</b> {c.k}
            </span>
          ))}
        </div>
        {big ? (
          <div className="tile-list bordered">
            {m.inbox.slice(0, 5).map((it, i) => (
              <div className="mini-row" key={i}>
                <ChannelIcon ch={it.ch} size={28} />
                <div className="mini-main">
                  <div className="mini-top"><b>{it.from}</b><span className="mini-time">{it.time}</span></div>
                  <div className="mini-prev">{it.prev}</div>
                </div>
              </div>
            ))}
          </div>
        ) : (
          <div className="tile-list bordered">
            {m.inbox.slice(0, 3).map((it, i) => (
              <div className="mini-row" key={i}>
                <ChannelIcon ch={it.ch} size={28} />
                <div className="mini-main">
                  <div className="mini-top"><b>{it.from}</b><span className="mini-time">{it.time}</span></div>
                  <div className="mini-prev">{it.prev}</div>
                </div>
              </div>
            ))}
          </div>
        )}
      </>);

    case "list":
      return (<>
        {stat}
        <div className="tile-list bordered">
          {m.list.slice(0, big ? 5 : 3).map((r, i) => (
            <div className="mini-row" key={i}>
              <Avatar name={r.name} size={28} />
              <div className="mini-main">
                <div className="mini-top"><b>{r.name}</b></div>
                <div className="mini-prev">{r.last}</div>
              </div>
            </div>
          ))}
        </div>
      </>);

    case "funnel":
      return (<>
        {stat}
        <div className="funnel">
          {m.funnel.map((f, i) => {
            const max = Math.max(...m.funnel.map((x) => x.n));
            return (
              <div className="funnel-row" key={i}>
                <span className="funnel-lbl">{f.stage}</span>
                <Bar pct={(f.n / max) * 100} accent={m.accent} />
                <span className="funnel-n">{f.n}</span>
              </div>
            );
          })}
        </div>
        {big && <div className="tile-foot">{Signal(m.signal, "orange", "bell")}</div>}
      </>);

    case "hotspots":
      return (<>
        {stat}
        <div className="tile-list bordered">
          {m.hotspots.slice(0, big ? m.hotspots.length : 3).map((h, i) => (
            <div className="mini-row" key={i}>
              <span className="pin" style={{ background: ACsoft(m.accent), color: AC(m.accent) }}>{i + 1}</span>
              <div className="mini-main"><div className="mini-top"><b>{h.name}</b></div><div className="mini-prev">{h.why}</div></div>
            </div>
          ))}
        </div>
      </>);

    case "agents":
      return (<>
        {stat}
        <div className="agent-avatars">
          {m.roster.map((r) => (
            <span key={r.key} className={"av-dot st-" + r.status}><Avatar agent={r.key} size={big ? 32 : 28} /></span>
          ))}
        </div>
        <div className="tile-list bordered">
          {m.feed.slice(0, big ? 4 : 2).map((f, i) => (
            <div className="mini-row" key={i}>
              <Avatar agent={f.who} size={26} />
              <div className="mini-main"><div className="mini-prev"><b>{KYANO.agents[f.who].name}</b> {f.act}</div></div>
              <span className="mini-time">{f.time}</span>
            </div>
          ))}
        </div>
      </>);

    case "invoices":
      return (<>
        {stat}
        <div className="tile-list bordered">
          {m.list.slice(0, big ? m.list.length : 3).map((x, i) => (
            <div className="mini-row" key={i}>
              <span className="dot lg" style={{ background: x.paid ? AC("green") : AC("orange") }} />
              <div className="mini-main"><div className="mini-top"><b>{x.name}</b><span className="mini-time money">{x.v}</span></div><div className="mini-prev">{x.due}</div></div>
            </div>
          ))}
        </div>
      </>);

    case "spark": {
      const sparkSeries = monthSeries ? monthSeries(m) : null;
      return (<>
        {stat}
        <div className="tile-spark-foot grow widget-chart">
          {sparkSeries
            ? <BarChart data={sparkSeries} accentA={m.accent} accentB={secondAccent ? secondAccent(m.accent) : "aqua"} height="100%" money={false} level={big ? "lg" : "md"} />
            : <AreaChart data={m.spark} accent={m.accent} height={big ? 150 : 92} gridlines />}
        </div>
        {big && (
          <div className="kpi-row">
            {m.kpis.map((k, i) => (<div className="kpi-mini" key={i}><div className="kpi-v">{k.v}</div><div className="kpi-k">{k.k}</div></div>))}
          </div>
        )}
      </>);
    }

    case "site":
      return (<>
        <div className="tile-badge" style={{ color: AC("green"), background: ACsoft("green") }}><span className="live-dot" />live</div>
        {stat}
        {hasTrend ? SparkFoot : null}
      </>);

    case "agenda":
      return (<>
        {stat}
        <div className="agenda-list">
          {m.today.slice(0, big ? 4 : 2).map((e, i) => (
            <div className="agenda-row" key={i}>
              <span className="agenda-time">{e.time}</span>
              <span className="agenda-bar" style={{ background: AC(e.accent) }} />
              <div className="agenda-main">
                <div className="agenda-t">{e.t}</div>
                <div className="agenda-type">{e.type}</div>
              </div>
            </div>
          ))}
        </div>
      </>);

    case "barchart":
      return (<>
        {stat}
        <div className="tile-chart"><BarChart data={m.bars} height={"100%"} /></div>
      </>);

    case "integration":
      return (<>
        <div className="integ-top">
          <span className="integ-logo" style={{ background: m.brand }}>{m.brandLetter}</span>
          <span className="integ-status"><span className="dot" style={{ background: AC("green") }} />{m.status}</span>
          <span className="integ-sync mono">{m.lastSync}</span>
        </div>
        <div className="integ-rows">
          {m.synced.map((s, i) => (
            <div className="integ-row" key={i}><span className="integ-k">{s.k}</span><b className="money">{s.v}</b></div>
          ))}
        </div>
      </>);

    case "social":
      return (<>
        <div className="sb-row" style={{ marginBottom: 2 }}>
          <span className="stat-num" style={{ fontSize: 28 }}>{m.stat}</span>
          <Delta d={m.delta} />
        </div>
        <div className="social-rows">
          {m.channels.map((c, i) => (
            <div className="social-row" key={i}>
              <span className="social-ic" style={{ color: AC(c.accent), background: ACsoft(c.accent) }}>
                <span dangerouslySetInnerHTML={{ __html: ICONS(c.icon) }} />
              </span>
              <span className="social-k">{c.k}</span>
              <b className="social-foll">{c.foll}</b>
              <span className="social-d">{c.d}</span>
            </div>
          ))}
        </div>
      </>);

    default: {
      /* vul de ruimte met de rijkste beschikbare inhoud van de widget */
      const stColor = (s) => {
        s = String(s || "").toLowerCase();
        if (/getekend|geaccepteerd|betaald|actief|akkoord|klaar/.test(s)) return "green";
        if (/concept|wacht|open|verstuurd|verzonden/.test(s)) return "gold";
        if (/te laat|verlopen|afgewezen|vervallen/.test(s)) return "red";
        return m.accent;
      };
      const rows = Array.isArray(m.list) ? m.list.map((x) => ({ title: x.name, sub: [x.pkg, x.contact || x.company].filter(Boolean).join(" · "), right: x.v, status: x.status }))
        : Array.isArray(m.posts) ? m.posts.map((x) => ({ title: x.t, sub: [x.ch, x.when].filter(Boolean).join(" · "), status: x.wait ? "wacht" : "klaar" }))
        : Array.isArray(m.team) ? m.team.map((x) => ({ title: x.name, sub: x.role, right: x.access }))
        : Array.isArray(m.keywords) ? m.keywords.map((x) => ({ title: x.kw, sub: x.move != null ? ((x.move > 0 ? "▲ " + x.move : x.move < 0 ? "▼ " + Math.abs(x.move) : "·") + " posities") : null, right: "#" + x.pos }))
        : null;
      if (rows && rows.length) {
        return (<>
          {stat}
          <div className="tile-list bordered">
            {rows.slice(0, big ? 5 : 3).map((r, i) => (
              <div className="mini-row" key={i}>
                <span className="dot lg" style={{ background: AC(stColor(r.status)) }} />
                <div className="mini-main">
                  <div className="mini-top"><b>{r.title}</b>{r.right != null && <span className="mini-time money">{r.right}</span>}</div>
                  {r.sub && <div className="mini-prev">{r.sub}</div>}
                </div>
              </div>
            ))}
          </div>
        </>);
      }
      if (hasTrend) return (<>{stat}{SparkFoot}</>);
      return (<>
        {stat}
        {m.signal && <div className="tile-foot">{Signal(m.signal)}</div>}
      </>);
    }
  }
}

/* Aantal-kiezer voor de KPI-widget (1–16) */
function KpiCountStepper({ className, countKey }) {
  const store = useStore();
  const KEY = countKey || "kpis.count";
  const n = Math.max(1, Math.min(16, store.get(KEY, 4)));
  const set = (v) => setState(KEY, Math.max(1, Math.min(16, v)));
  return (
    <div className={"kpi-count " + (className || "")} onPointerDown={(e) => e.stopPropagation()} onClick={(e) => e.stopPropagation()}>
      <button className="kpi-count-btn" onClick={() => set(n - 1)} disabled={n <= 1} aria-label="Minder">–</button>
      <span className="kpi-count-n">{n} <span className="kpi-count-lbl">{n === 1 ? "cijfer" : "cijfers"}</span></span>
      <button className="kpi-count-btn" onClick={() => set(n + 1)} disabled={n >= 16} aria-label="Meer">+</button>
    </div>
  );
}

function Tile({ id, m, size, view, edit, onOpen, onResize, onHide, onView, dragHandlers, dragging, placeholder, board }) {
  const key = id || m.id;
  const attn = m.attention;
  const noNav = m.noNav || (board === "iris" && key === "irisattn");
  const cls = ["tile", "tile-" + size];
  if (m.tileKind) cls.push("tk-" + m.tileKind);
  if (edit) cls.push("is-edit");
  if (dragging) cls.push("is-dragging");
  if (placeholder) cls.push("is-placeholder");
  if (attn) cls.push("attn-" + attn);
  const sizeOpts = m.sizes || ["small", "medium", "large", "xl"];
  const bare = m.tileKind === "kpis";
  const views = widgetViews(m, size);
  const curView = views && views.includes(view) ? view : (views ? views[0] : "std");
  const cycleView = (dir) => { const i = views.indexOf(curView); onView(key, views[(i + dir + views.length) % views.length]); };

  return (
    <div className={cls.join(" ") + (bare ? " tile-bare" : "")} data-id={key} data-size={size}
      style={attn ? { "--attn": AC(attn) } : null}
      onPointerDown={edit ? dragHandlers.onPointerDown : undefined}
      onClick={!edit && !noNav ? () => onOpen(m.openTarget || m.id) : undefined}>
      {placeholder ? null : (<>
        {edit && (
          <button className="tile-remove" onClick={(e) => { e.stopPropagation(); onHide(key); }} aria-label="Verbergen">
            <span dangerouslySetInnerHTML={{ __html: ICONS("close", { sw: 2.4 }) }} />
          </button>
        )}
        {!bare && (
          <header className="tile-head">
            <span className="tile-chip sm" style={{ color: AC(m.accent), background: ACsoft(m.accent) }}>
              <span dangerouslySetInnerHTML={{ __html: ICONS(m.icon) }} />
            </span>
            <span className="tile-label">{m.tile}</span>
            {!edit && !noNav && <span className="tile-arrow" dangerouslySetInnerHTML={{ __html: ICONS("arrow") }} />}
          </header>
        )}
        <div className="tile-content" key={curView}><TileBody m={m} size={size} view={curView} onOpen={onOpen} edit={edit} /></div>
        {edit && m.tileKind === "kpis" && <KpiCountStepper className="tile-kpicount" countKey={m.kpiCountKey} />}
        {edit && (views || sizeOpts.length > 1) && (
          <div className="tile-edit-ctrls" onPointerDown={(e) => e.stopPropagation()} onClick={(e) => e.stopPropagation()}>
            {sizeOpts.length > 1 && (
              <div className="size-pills">
                {sizeOpts.map((s) => (
                  <button key={s} className={"size-pill" + (s === size ? " on" : "")} onClick={() => onResize(key, s)}>
                    {s === "small" ? "S" : s === "medium" ? "M" : s === "large" ? "L" : s === "xl" ? "XL" : "▭"}
                  </button>
                ))}
              </div>
            )}
            {views && views.length > 1 && (
              <div className="view-cycler" title="Wissel weergave">
                <button className="view-arrow" onClick={() => cycleView(-1)} aria-label="Vorige weergave"><span dangerouslySetInnerHTML={{ __html: ICONS("chevron", { sw: 2.4 }) }} style={{ transform: "rotate(180deg)" }} /></button>
                <span className="view-now">{viewLabel(curView, m)}</span>
                <button className="view-arrow" onClick={() => cycleView(1)} aria-label="Volgende weergave"><span dangerouslySetInnerHTML={{ __html: ICONS("chevron", { sw: 2.4 }) }} /></button>
              </div>
            )}
          </div>
        )}
      </>)}
    </div>
  );
}

function TileGrid({ edit, onOpen, layout, setLayout, flags, onAddWidget, board = "dashboard" }) {
  const gridRef = useRef(null);
  const overlayRef = useRef(null);
  const [drag, setDrag] = useState(null); // {id, dx, dy, w, h}
  const dragState = useRef(null);

  const setSize = (id, s) => {
    setLayout((L) => { const n = { ...L, sizes: { ...L.sizes, [id]: s } }; saveLayout(n, board); return n; });
  };
  const setViewFn = (id, v) => {
    setLayout((L) => { const n = { ...L, views: { ...(L.views || {}), [id]: v } }; saveLayout(n, board); return n; });
  };
  const hide = async (id) => {
    const m = MOD[baseOf(id)];
    const naam = m ? (m.name || m.tile || "deze widget") : "deze widget";
    const ok = await confirmAsk({ title: "Widget verwijderen?", sub: "\u201C" + naam + "\u201D wordt van je dashboard verwijderd. Je vindt 'm terug onderaan bij verborgen widgets.", confirmLabel: "Verwijderen" });
    if (!ok) return;
    setLayout((L) => {
      const n = { ...L, order: L.order.filter((x) => x !== id), hidden: [...L.hidden, id] };
      saveLayout(n, board); return n;
    });
  };
  const unhide = (id) => {
    setLayout((L) => {
      const n = { ...L, hidden: L.hidden.filter((x) => x !== id), order: [...L.order, id] };
      saveLayout(n, board); return n;
    });
  };

  // ---- drag ----
  const onPointerDown = useCallback((e) => {
    if (e.target.closest(".size-pills") || e.target.closest(".tile-remove")) return;
    const tileEl = e.target.closest(".tile");
    if (!tileEl) return;
    const id = tileEl.dataset.id;
    const rect = tileEl.getBoundingClientRect();
    const start = { x: e.clientX, y: e.clientY };
    dragState.current = {
      id, rect, offX: e.clientX - rect.left, offY: e.clientY - rect.top,
      moved: false, start, lastTarget: id,
    };
    const move = (ev) => {
      const ds = dragState.current; if (!ds) return;
      const dist = Math.hypot(ev.clientX - ds.start.x, ev.clientY - ds.start.y);
      if (!ds.moved && dist < 6) return;
      if (!ds.moved) {
        ds.moved = true;
        setDrag({ id, w: ds.rect.width, h: ds.rect.height });
      }
      // overlay positie
      if (overlayRef.current) {
        overlayRef.current.style.transform =
          `translate(${ev.clientX - ds.offX}px, ${ev.clientY - ds.offY}px) rotate(2.5deg)`;
      }
      // doel-index bepalen
      const els = [...gridRef.current.querySelectorAll(".tile[data-id]")];
      let target = null;
      for (const el of els) {
        if (el.dataset.id === id) continue;
        const r = el.getBoundingClientRect();
        if (ev.clientX >= r.left && ev.clientX <= r.right && ev.clientY >= r.top && ev.clientY <= r.bottom) {
          const beforeIt = (ev.clientY < r.top + r.height / 2) || (ev.clientX < r.left + r.width / 2 && ev.clientY < r.bottom);
          target = { id: el.dataset.id, before: beforeIt };
          break;
        }
      }
      if (target) {
        setLayout((L) => {
          const order = L.order.filter((x) => x !== id);
          let idx = order.indexOf(target.id);
          if (!target.before) idx += 1;
          order.splice(idx, 0, id);
          if (order.join() === L.order.join()) return L;
          return { ...L, order };
        });
      }
    };
    const up = () => {
      window.removeEventListener("pointermove", move);
      window.removeEventListener("pointerup", up);
      const ds = dragState.current;
      if (ds && ds.moved) setLayout((L) => { saveLayout(L, board); return L; });
      dragState.current = null;
      setDrag(null);
    };
    window.addEventListener("pointermove", move);
    window.addEventListener("pointerup", up);
  }, [setLayout]);

  const dragHandlers = { onPointerDown };

  return (
    <>
      <div className={"tile-grid" + (edit ? " editing" : "")} ref={gridRef}>
        {edit && (
          <button className="tile-add tile-add-top" onClick={onAddWidget}>
            <span className="tile-add-ic" dangerouslySetInnerHTML={{ __html: ICONS("plus", { sw: 2 }) }} />
            <span className="tile-add-txt">
              <span className="tile-add-lbl">Widget toevoegen</span>
              <span className="tile-add-sub">uit de widgetmarkt</span>
            </span>
          </button>
        )}
        {layout.order.map((id) => {
          const m = MOD[baseOf(id)]; if (!m) return null;
          if (flags && flags[baseOf(id)] === false) return null;
          const size = layout.sizes[id] || m.size;
          const view = (layout.views && layout.views[id]) || "std";
          const isDrag = drag && drag.id === id;
          return (
            <Tile key={id} id={id} m={m} size={size} view={view} edit={edit} onOpen={onOpen}
              onResize={setSize} onHide={hide} onView={setViewFn} dragHandlers={dragHandlers}
              placeholder={isDrag} dragging={false} board={board} />
          );
        })}
      </div>

      {drag && (() => {
        const m = MOD[baseOf(drag.id)];
        return (
          <div className="drag-overlay" ref={overlayRef} style={{ width: drag.w, height: drag.h }}>
            <Tile id={drag.id} m={m} size={layout.sizes[drag.id] || m.size} view={(layout.views && layout.views[drag.id]) || "std"} edit={false} onOpen={() => {}}
              onResize={() => {}} onHide={() => {}} onView={() => {}} dragHandlers={{}} />
          </div>
        );
      })()}

      {edit && layout.hidden.length > 0 && (
        <div className="hidden-tray">
          <Eyebrow dot accent="purple">Verborgen widgets · tik om toe te voegen</Eyebrow>
          <div className="tray-row">
            {layout.hidden.map((id) => {
              const m = MOD[baseOf(id)];
              return (
                <button key={id} className="tray-chip" onClick={() => unhide(id)}>
                  <span className="tile-chip sm" style={{ color: AC(m.accent), background: ACsoft(m.accent) }}>
                    <span dangerouslySetInnerHTML={{ __html: ICONS(m.icon) }} />
                  </span>
                  {m.name}
                  <span className="tray-plus" dangerouslySetInnerHTML={{ __html: ICONS("plus", { sw: 2.2 }) }} />
                </button>
              );
            })}
          </div>
        </div>
      )}
    </>
  );
}

/* ===== Widget-bibliotheek (Apple-stijl), via "Nieuw" ===== */
const SIZE_LABEL = { small: "Klein", medium: "Middel", large: "Groot", xl: "Volledig" };

function WidgetLibrary({ layout, setLayout, flags, onClose, board = "dashboard" }) {
  const store = useStore();
  const widgets = BOARDS[board].ids().map((id) => MOD[id]).filter((m) => m && !(flags && flags[m.id] === false));
  const [sel, setSel] = useState("all");
  const [picks, setPicks] = useState({});
  const [views, setViews] = useState({});
  const [kpiCount, setKpiCount] = useState(() => Math.max(1, Math.min(16, store.get("kpis.count", 4))));
  const [query, setQuery] = useState("");
  useEffect(() => { const k = (e) => { if (e.key === "Escape") onClose(); }; window.addEventListener("keydown", k); return () => window.removeEventListener("keydown", k); }, []);

  const countOf = (id) => layout.order.filter((k) => baseOf(k) === id).length;
  const onDash = (id) => countOf(id) > 0;
  const pickSize = (id) => picks[id] || MOD[id].size;
  const setPick = (id, s) => setPicks((p) => ({ ...p, [id]: s }));
  const viewOf = (id) => views[id] || "std";
  const setViewL = (id, v) => setViews((p) => ({ ...p, [id]: v }));

  const add = (id) => {
    if (id === "kpis") setState("kpis.count", kpiCount);
    const s = pickSize(id);
    const v = viewOf(id);
    // uniek/herplaatsbaar: bestaande basis → nieuwe instance-sleutel
    const single = SINGLE_TILES.has(id);
    const exists = layout.order.includes(id) || layout.hidden.includes(id);
    const key = (single || !exists) ? id : newInstanceKey(id);
    setLayout((L) => {
      const order = L.order.includes(key) ? L.order : [key, ...L.order];
      const hidden = L.hidden.filter((x) => x !== key);
      const n = { ...L, order, hidden, sizes: { ...L.sizes, [key]: s }, views: { ...(L.views || {}), [key]: v } };
      saveLayout(n, board); return n;
    });
    const extra = id === "kpis" ? kpiCount + " cijfers" : SIZE_LABEL[s] + (widgetViews(MOD[id], s) ? " · " + viewLabel(v, MOD[id]) : "");
    toast(MOD[id].name + " toegevoegd · " + extra, { icon: "plus" });
  };

  let shown = sel === "all" ? widgets : widgets.filter((w) => w.id === sel);
  const q = query.toLowerCase().trim();
  if (q) shown = shown.filter((w) => (w.name + " " + (w.tile || "") + " " + (w.group || "")).toLowerCase().includes(q));

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div className="wlib" onClick={(e) => e.stopPropagation()}>
        <header className="wlib-head">
          <div>
            <div className="wlib-eyebrow mono">Widget-bibliotheek</div>
            <h3 className="wlib-title">Widgets toevoegen</h3>
          </div>
          <div className="wlib-search">
            <span dangerouslySetInnerHTML={{ __html: ICONS("search") }} />
            <input placeholder="Zoek widget…" value={query} onChange={(e) => setQuery(e.target.value)} />
          </div>
          <button className="icon-btn" onClick={onClose}><span dangerouslySetInnerHTML={{ __html: ICONS("close", { sw: 2 }) }} /></button>
        </header>
        <div className="wlib-body">
          <aside className="wlib-rail">
            <button className={"wlib-cat" + (sel === "all" ? " on" : "")} onClick={() => setSel("all")}>
              <span className="wlib-cat-ic" style={{ color: AC("navy"), background: ACsoft("navy") }}><span dangerouslySetInnerHTML={{ __html: ICONS("grid") }} /></span>
              <span className="wlib-cat-lbl">Alle widgets</span>
              <span className="wlib-cat-n">{widgets.length}</span>
            </button>
            <div className="wlib-rail-h mono">Per module</div>
            <div className="wlib-rail-list">
              {widgets.map((w) => (
                <button key={w.id} className={"wlib-cat" + (sel === w.id ? " on" : "")} onClick={() => setSel(w.id)}>
                  <span className="wlib-cat-ic" style={{ color: AC(w.accent), background: ACsoft(w.accent) }}><span dangerouslySetInnerHTML={{ __html: ICONS(w.icon) }} /></span>
                  <span className="wlib-cat-lbl">{w.name}</span>
                  {onDash(w.id) && <span className="wlib-cat-dot" title="Op dashboard" style={{ background: AC("green") }} />}
                </button>
              ))}
            </div>
          </aside>
          <div className="wlib-main">
            <div className="wlib-grid">
              {shown.map((w) => (
                <WidgetCard key={w.id} m={w} size={pickSize(w.id)} onSize={(s) => setPick(w.id, s)} onAdd={() => add(w.id)}
                  placed={countOf(w.id)} view={viewOf(w.id)} onView={(v) => setViewL(w.id, v)}
                  kpiCount={kpiCount} onKpiCount={setKpiCount} />
              ))}
              {shown.length === 0 && <div className="list-empty mono">Geen widgets gevonden.</div>}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

/* 3D-tilt preview (vanilla, geen extra deps), Apple-galerij-gevoel */
function TiltPreview({ className, children, style, outerRef }) {
  const wrapRef = useRef(null);
  const innerRef = useRef(null);
  const setWrap = (el) => { wrapRef.current = el; if (typeof outerRef === "function") outerRef(el); else if (outerRef) outerRef.current = el; };
  const onMove = (e) => {
    const el = wrapRef.current, inner = innerRef.current; if (!el || !inner) return;
    const r = el.getBoundingClientRect();
    const px = (e.clientX - r.left) / r.width - 0.5;
    const py = (e.clientY - r.top) / r.height - 0.5;
    inner.style.transform = `rotateX(${(-py * 13).toFixed(2)}deg) rotateY(${(px * 13).toFixed(2)}deg) scale(1.05)`;
    el.style.setProperty("--gx", ((px + 0.5) * 100).toFixed(1) + "%");
    el.style.setProperty("--gy", ((py + 0.5) * 100).toFixed(1) + "%");
    el.classList.add("is-tilting");
  };
  const onLeave = () => {
    const el = wrapRef.current, inner = innerRef.current;
    if (inner) inner.style.transform = "";
    if (el) el.classList.remove("is-tilting");
  };
  return (
    <div ref={setWrap} className={"wcard-prev tilt " + (className || "")} style={style} onMouseMove={onMove} onMouseLeave={onLeave}>
      <div ref={innerRef} className="tilt-inner">{children}</div>
      <span className="tilt-glare" aria-hidden="true" />
    </div>
  );
}

/* instellingen-popover: bepaal wat de widget toont */
function WidgetSettingsPopover({ m, view, onView, count, onCount, onClose, size }) {
  const views = widgetViews(m, size);
  const multiView = !!(views && views.length > 1);
  const isKpi = m.tileKind === "kpis";
  const has = isKpi || multiView;
  const ref = useSmartMenu({ align: "end", margin: 10 });
  return (
    <div className="wset-pop" ref={ref} onPointerDown={(e) => e.stopPropagation()} onClick={(e) => e.stopPropagation()}>
      <div className="wset-head"><span className="wset-title">Instellingen</span><button className="wset-x" onClick={onClose}><span dangerouslySetInnerHTML={{ __html: ICONS("close", { sw: 2.2 }) }} /></button></div>
      <div className="wset-sub mono">Bepaal wat “{m.name}” laat zien</div>
      {isKpi && (
        <div className="wset-block">
          <span className="wset-lbl">Aantal cijfers</span>
          <div className="wcard-count">
            <button className="wcard-count-btn" onClick={() => onCount(Math.max(1, count - 1))} disabled={count <= 1}>–</button>
            <span className="wcard-count-n">{count}</span>
            <button className="wcard-count-btn" onClick={() => onCount(Math.min(16, count + 1))} disabled={count >= 16}>+</button>
          </div>
        </div>
      )}
      {multiView && (
        <div className="wset-block col">
          <span className="wset-lbl">Weergave</span>
          <div className="wset-opts">
            {views.map((v) => (
              <button key={v} className={"wset-opt" + ((view || "std") === v ? " on" : "")} onClick={() => onView(v)}>
                <span className="wset-opt-dot" />{viewLabel(v, m)}
              </button>
            ))}
          </div>
        </div>
      )}
      {!has && <div className="wset-empty mono">Deze widget heeft geen extra opties.</div>}
    </div>
  );
}

function WidgetCard({ m, size, onSize, onAdd, placed, view, onView, kpiCount, onKpiCount }) {
  const [setOpen, setSetOpen] = useState(false);
  const sizeOpts = m.sizes || ["small", "medium", "large", "xl"];
  const bare = m.tileKind === "kpis";
  const cnt = Math.max(1, Math.min(16, kpiCount || 4));
  /* echte dashboard-voetafdruk per maat → schaalgetrouwe thumbnail (zelfde verhoudingen als op het dashboard) */
  const FOOT = { small: { c: 1, r: 2 }, medium: { c: 2, r: 2 }, large: { c: 2, r: 4 }, xl: { c: 4, r: 3 }, wide: { c: 4, r: 1 } };
  const kpiCols = Math.min(4, Math.max(2, Math.ceil(cnt / 2)));
  const fp = bare ? { c: kpiCols, r: Math.max(1, Math.ceil(cnt / kpiCols)) } : (FOOT[size] || FOOT.medium);
  const CW = 232, RH = 117, G = 18;
  const tW = fp.c * CW + (fp.c - 1) * G;
  const tH = fp.r * RH + (fp.r - 1) * G;
  /* alle kaarten zijn even groot; alleen de preview-inhoud schaalt mee met de maat (Apple-galerij) */
  const FRAME_H = 190;
  const frameRef = useRef(null);
  const [fw, setFw] = useState(296);
  React.useLayoutEffect(() => {
    const el = frameRef.current; if (!el) return;
    const read = () => setFw(el.clientWidth || 296);
    read();
    const ro = new ResizeObserver(read); ro.observe(el);
    return () => ro.disconnect();
  }, []);
  /* schaal de échte voetafdruk zó dat hij gecentreerd binnen het vaste venster past (nooit eruit) */
  const scale = Math.max(0.16, Math.min(1, (fw - 34) / tW, (FRAME_H - 34) / tH));
  useEffect(() => {
    if (!setOpen) return;
    const h = () => setSetOpen(false);
    window.addEventListener("pointerdown", h);
    const main = document.querySelector(".wlib-main");
    if (main) main.addEventListener("scroll", h, { passive: true });
    return () => { window.removeEventListener("pointerdown", h); if (main) main.removeEventListener("scroll", h); };
  }, [setOpen]);
  return (
    <div className={"wcard" + (placed > 0 ? " is-added" : "")}>
      <TiltPreview className="wcard-prev-thumb" outerRef={frameRef} style={{ height: FRAME_H }}>
        {placed > 0 && <span className="wcard-flag"><span dangerouslySetInnerHTML={{ __html: ICONS("check", { sw: 2.6 }) }} />{placed}× op dashboard</span>}
        <div className="thumb-tile" style={{ width: tW, height: tH, transform: "translate(-50%,-50%) scale(" + scale + ")" }}>
          <div className={"tile tile-" + (bare ? "wide" : size) + " wcard-tile" + (bare ? " tile-bare" : "")}>
            {!bare && (
              <header className="tile-head">
                <span className="tile-chip sm" style={{ color: AC(m.accent), background: ACsoft(m.accent) }}><span dangerouslySetInnerHTML={{ __html: ICONS(m.icon) }} /></span>
                <span className="tile-label">{m.tile || m.name}</span>
              </header>
            )}
            <div className="tile-content"><TileBody m={m} size={size} count={bare ? cnt : undefined} view={view} /></div>
          </div>
        </div>
      </TiltPreview>
      <div className="wcard-foot">
        <div className="wcard-id">
          <div className="wcard-name">{m.name}</div>
          <div className="wcard-grp mono">{m.group || "Widget"}</div>
        </div>
        <div className="wcard-set-wrap" onPointerDown={(e) => e.stopPropagation()}>
          <button className={"wcard-set" + (setOpen ? " on" : "")} title="Instellingen" onClick={() => setSetOpen((o) => !o)}>
            <span dangerouslySetInnerHTML={{ __html: ICONS("sliders", { sw: 1.9 }) }} />
          </button>
          {setOpen && <WidgetSettingsPopover m={m} view={view} onView={onView} count={cnt} onCount={onKpiCount} onClose={() => setSetOpen(false)} size={size} />}
        </div>
        {!bare && sizeOpts.length > 1 && (
          <div className="wcard-sizes">
            {sizeOpts.map((s) => (
              <button key={s} className={"wcard-size" + (s === size ? " on" : "")} onClick={() => onSize(s)} title={SIZE_LABEL[s] || "Volledig"}>
                {s === "small" ? "S" : s === "medium" ? "M" : s === "large" ? "L" : s === "xl" ? "XL" : "▭"}
              </button>
            ))}
          </div>
        )}
        <button className="wcard-add" onClick={onAdd}>
          <span dangerouslySetInnerHTML={{ __html: ICONS("plus", { sw: 2.2 }) }} />
          {placed > 0 ? "Nog een" : "Toevoegen"}
        </button>
      </div>
    </div>
  );
}

export { TileGrid, MOD, loadLayout, saveLayout, DEFAULT_LAYOUT, buildDefault, WidgetLibrary };
