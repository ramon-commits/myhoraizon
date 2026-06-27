/* ============================================================
   charts.jsx, kiesbare widget-views (shadcn-stijl)
   • Tekst & cijfers · Area · Staaf · Lijn · Cirkel
   • Beschikbare views hangen af van widgetgrootte (S/M/L)
   • Realistische 12-maands data + categorische verdeling per widget
   ESM-port van de blauwdruk: window-globals -> imports/exports, body letterlijk.
   ============================================================ */
import React from 'react'
import { AC, smoothPath, BarChart, Donut } from './components.jsx'

const CHART_MONTHS = ["jan", "feb", "mrt", "apr", "mei", "jun", "jul", "aug", "sep", "okt", "nov", "dec"];
const PIE_ACCENTS = ["blue", "aqua", "teal", "gold", "orange", "purple"];

const round1 = (v) => Math.round(v * 10) / 10;
function hashStr(s) { let h = 2166136261; s = String(s); for (let i = 0; i < s.length; i++) { h ^= s.charCodeAt(i); h = Math.imul(h, 16777619); } return h >>> 0; }
function seedRand(seed) { let t = seed >>> 0; return () => { t += 0x6D2B79F5; let r = Math.imul(t ^ t >>> 15, 1 | t); r ^= r + Math.imul(r ^ r >>> 7, 61 | r); return ((r ^ r >>> 14) >>> 0) / 4294967296; }; }

/* numerieke parser: "€ 84,2k"→84200 · "4.350"→4350 · "31%"→31 · "09:30"→NaN (tijd) */
function statNum(s) {
  s = String(s == null ? "" : s).trim();
  if (!s || /\d:\d/.test(s)) return NaN;
  const k = /k\b/i.test(s);
  let t = s.replace(/[€$%\s]/g, "").replace(/\.(?=\d{3}(\D|$))/g, "").replace(",", ".").replace(/[^\d.]/g, "");
  let n = parseFloat(t);
  if (!isFinite(n)) return NaN;
  return k ? n * 1000 : n;
}

/* numerieke synced-waarden van een koppeling (Mollie, Google…) als verdeling */
function syncedNums(m) {
  if (!Array.isArray(m.synced)) return [];
  return m.synced.map((x, i) => ({ k: x.k, v: statNum(x.v), accent: PIE_ACCENTS[i % PIE_ACCENTS.length] }))
    .filter((x) => isFinite(x.v) && x.v > 0);
}

/* welke widgets kunnen een grafiek tonen?
   ELKE module-widget met een cijfer, plus koppelingen met meetbare synced-waarden.
   Ontbrekende reeksen worden realistisch afgeleid (zie monthSeries).        */
function chartable(m) {
  if (!m) return false;
  if (m.tileKind === "kpis" || m.tileKind === "irisattn" || m.tileKind === "integration") return false;
  if (m.stat != null && String(m.stat).trim() !== "") return true;
  return syncedNums(m).length >= 2;
}

/* leid een realistisch basisgetal af uit het cijfer (of synced-waarden) */
function statBase(m) {
  const n = statNum(m && m.stat);
  if (isFinite(n) && n > 0) return n;
  const sn = syncedNums(m);
  if (sn.length) return sn.reduce((a, s) => a + s.v, 0);
  return 100;
}

/* tweede serie-accent (voor 2-serie grafieken) */
const SECOND_ACCENT = { blue: "aqua", aqua: "blue", teal: "aqua", purple: "blue", gold: "teal", orange: "gold", red: "orange", navy: "blue", green: "teal", mila: "aqua" };
const secondAccent = (a) => SECOND_ACCENT[a] || "aqua";

/* 12-maands, 2-serie reeks [{m,a,b}], deterministisch per widget */
function monthSeries(m) {
  if (Array.isArray(m.bars) && m.bars[0] && "a" in m.bars[0]) {
    const src = m.bars;
    return CHART_MONTHS.map((mo, i) => { const s = src[i % src.length]; return { m: mo, a: s.a, b: s.b }; });
  }
  const arr = m.trend || m.spark || m.sparkk;
  const base = Array.isArray(arr) && arr.length ? arr[arr.length - 1] : statBase(m);
  const rnd = seedRand(hashStr(m.id || m.tile || "x"));
  const dir = m.delta ? (m.delta.dir === "down" ? -1 : 1) : 1;
  const startFactor = dir > 0 ? 0.6 : 1.32;
  const out = [];
  for (let i = 0; i < 12; i++) {
    const t = i / 11;
    const trendVal = base * (startFactor + (1 - startFactor) * t);
    const noise = 1 + (rnd() - 0.5) * 0.2;
    const total = Math.max(trendVal * noise, base * 0.18);
    const a = total * (0.56 + rnd() * 0.12);
    out.push({ m: CHART_MONTHS[i], a: round1(a), b: round1(Math.max(total - a, total * 0.12)) });
  }
  return out;
}

/* categorische verdeling [{k,v,accent}], voor cirkel/staaf-verdeling */
const accentForStatus = (s) => {
  s = String(s).toLowerCase();
  if (/betaald|getekend|geaccepteerd|actief/.test(s)) return "green";
  if (/open|wacht|concept/.test(s)) return "gold";
  if (/te laat|verlopen|geblok/.test(s)) return "red";
  if (/verstuurd|verzonden/.test(s)) return "blue";
  return "aqua";
};
function breakdown(m, series) {
  if (m.tileKind === "integration") { const sn = syncedNums(m); if (sn.length >= 2) return sn; }
  if (Array.isArray(m.funnel)) return m.funnel.map((f, i) => ({ k: f.stage, v: f.n, accent: PIE_ACCENTS[i % PIE_ACCENTS.length] }));
  if (Array.isArray(m.channels) && m.channels.some((c) => c.foll != null)) return m.channels.map((c, i) => ({ k: c.k, v: parseFloat(String(c.foll).replace(/\./g, "")) || c.n || 1, accent: c.accent || PIE_ACCENTS[i % PIE_ACCENTS.length] }));
  if (Array.isArray(m.split)) return m.split.map((s, i) => ({ k: s.k, v: s.n, accent: PIE_ACCENTS[i % PIE_ACCENTS.length] }));
  /* echte status-verdeling uit een lijst (bv. facturen: open/betaald/te laat) */
  if (Array.isArray(m.list) && m.list.some((x) => x.status)) {
    const by = {};
    m.list.forEach((x) => { const k = x.status || "Overig"; by[k] = (by[k] || 0) + 1; });
    return Object.keys(by).map((k) => ({ k, v: by[k], accent: accentForStatus(k) }));
  }
  /* tijdreeks zonder categorieën → verdeling per kwartaal */
  const q = [0, 0, 0, 0];
  (series || monthSeries(m)).forEach((s, i) => { q[Math.min(3, Math.floor(i / 3))] += s.a + s.b; });
  return ["1e kwartaal", "2e kwartaal", "3e kwartaal", "4e kwartaal"].map((k, i) => ({ k, v: round1(q[i]), accent: PIE_ACCENTS[i % PIE_ACCENTS.length] }));
}

/* waarde-formatter: detecteert €/k op basis van schaal */
function fmtVal(v, money, max) {
  const nl = (n) => String(n).replace(".", ",");
  if (!money) return nl(Math.round(v * 10) / 10);
  if (Math.round(v) === 0) return "€ 0";
  if (max < 100) return "€ " + nl(Math.round(v * 10) / 10) + "k";
  if (max >= 1000) {
    const k = Math.round(v / 100) / 10;
    return "€ " + nl(Number.isInteger(k) ? String(k) : k.toFixed(1)) + "k";
  }
  return "€ " + Math.round(v);
}

/* ---------- Verticale staafgrafiek (shadcn) ---------- */
function VBars({ series, grouped, accentA = "blue", accentB = "aqua", height = 150, money = false, compact = false, level }) {
  const [hover, setHover] = React.useState(-1);
  const showY = level ? level === "lg" : !compact;
  const showX = level ? level !== "sm" : !compact;
  const compactCls = level ? level !== "lg" : compact;
  const totals = series.map((s) => grouped ? Math.max(s.a, s.b) : s.a + s.b);
  const max = Math.max(...totals) * 1.1 || 1;
  const ticks = 4;
  const gA = AC(accentA), gB = AC(accentB);
  return (
    <div className={"vbarc" + (compactCls ? " compact" : "")} style={{ height }}>
      {showY && <div className="vbarc-yaxis">{Array.from({ length: ticks + 1 }, (_, i) => <span key={i} className="vbarc-ytick">{fmtVal(max - max / ticks * i, money, max)}</span>)}</div>}
      <div className="vbarc-right">
        <div className="vbarc-plot">
          <div className="vbarc-grid">{Array.from({ length: ticks + 1 }, (_, i) => <span key={i} />)}</div>
          <div className="vbarc-bars" onMouseLeave={() => setHover(-1)}>
            {series.map((s, i) => (
              <div key={i} className={"vbarc-col" + (hover === i ? " on" : "")} onMouseEnter={() => setHover(i)}>
                <div className="vbarc-stack">
                  {grouped ? (<>
                    <span className="vbarc-bar" style={{ height: (s.a / max * 100) + "%", background: gA }} />
                    <span className="vbarc-bar" style={{ height: (s.b / max * 100) + "%", background: gB }} />
                  </>) : (
                    <span className="vbarc-bar solo" style={{ height: ((s.a + s.b) / max * 100) + "%", background: gA }} />
                  )}
                </div>
                {hover === i && (
                  <div className={"vbarc-tip" + (i > series.length - 3 ? " left" : "")}>
                    <div className="vbarc-tip-m">{s.m}</div>
                    {grouped ? (<>
                      <div className="vbarc-tip-row"><span className="vbarc-tip-dot" style={{ background: gA }} />Geboekt<b>{fmtVal(s.a, money, max)}</b></div>
                      <div className="vbarc-tip-row"><span className="vbarc-tip-dot" style={{ background: gB }} />Verwacht<b>{fmtVal(s.b, money, max)}</b></div>
                    </>) : (
                      <div className="vbarc-tip-row"><span className="vbarc-tip-dot" style={{ background: gA }} />Totaal<b>{fmtVal(s.a + s.b, money, max)}</b></div>
                    )}
                  </div>
                )}
              </div>
            ))}
          </div>
        </div>
        {showX && <div className="vbarc-x">{series.map((s, i) => <span key={i} className={hover === i ? "on" : ""}>{s.m}</span>)}</div>}
      </div>
    </div>
  );
}

/* ---------- Lijngrafiek (shadcn): enkel of meervoudig ---------- */
function LineC({ series, multi, accentA = "blue", accentB = "aqua", height = 150, money = false, compact = false, level }) {
  const [hover, setHover] = React.useState(-1);
  const showY = level ? level === "lg" : !compact;
  const showX = level ? level !== "sm" : !compact;
  const compactCls = level ? level !== "lg" : compact;
  const swA = level === "sm" ? 3.2 : 2.4, swB = level === "sm" ? 2.6 : 2;
  const n = series.length;
  const seriesA = series.map((s) => multi ? s.a : s.a + s.b);
  const seriesB = series.map((s) => s.b);
  const max = Math.max(...seriesA, ...(multi ? seriesB : [0])) * 1.1 || 1;
  const ticks = 4;
  const X = (i) => n > 1 ? i / (n - 1) * 100 : 50;
  const Yp = (v) => (1 - v / max) * 100;
  const gA = AC(accentA), gB = AC(accentB);
  const lineA = smoothPath(seriesA.map((v, i) => [X(i), Yp(v)]));
  const lineB = multi ? smoothPath(seriesB.map((v, i) => [X(i), Yp(v)])) : null;
  const onMove = (e) => { const r = e.currentTarget.getBoundingClientRect(); const px = (e.clientX - r.left) / r.width; setHover(Math.max(0, Math.min(n - 1, Math.round(px * (n - 1))))); };
  return (
    <div className={"areac linec" + (compactCls ? " compact" : "")} style={{ height }}>
      {showY && <div className="areac-yaxis">{Array.from({ length: ticks + 1 }, (_, i) => <span key={i} className="areac-ytick">{fmtVal(max - max / ticks * i, money, max)}</span>)}</div>}
      <div className="areac-right">
        <div className="areac-plot" onMouseMove={onMove} onMouseLeave={() => setHover(-1)}>
          <div className="areac-grid">{Array.from({ length: ticks + 1 }, (_, i) => <span key={i} />)}</div>
          <svg className="areac-svg" viewBox="0 0 100 100" preserveAspectRatio="none">
            {multi && <path d={lineB} fill="none" stroke={gB} strokeWidth={swB} vectorEffect="non-scaling-stroke" strokeLinejoin="round" strokeLinecap="round" />}
            <path d={lineA} fill="none" stroke={gA} strokeWidth={swA} vectorEffect="non-scaling-stroke" strokeLinejoin="round" strokeLinecap="round" />
          </svg>
          {hover >= 0 && <>
            <div className="areac-guide" style={{ left: X(hover) + "%" }} />
            {multi && <span className="areac-dot" style={{ left: X(hover) + "%", top: Yp(seriesB[hover]) + "%", "--c": gB }} />}
            <span className="areac-dot" style={{ left: X(hover) + "%", top: Yp(seriesA[hover]) + "%", "--c": gA }} />
            <div className={"areac-tip" + (X(hover) > 60 ? " left" : "")} style={{ left: X(hover) + "%" }}>
              <div className="areac-tip-m">{series[hover].m}</div>
              <div className="areac-tip-row"><span className="areac-tip-dot" style={{ background: gA }} />{multi ? "Geboekt" : "Totaal"}<b>{fmtVal(seriesA[hover], money, max)}</b></div>
              {multi && <div className="areac-tip-row"><span className="areac-tip-dot" style={{ background: gB }} />Verwacht<b>{fmtVal(seriesB[hover], money, max)}</b></div>}
            </div>
          </>}
        </div>
        {showX && <div className="areac-x">{series.map((s, i) => <span key={i} className={hover === i ? "on" : ""}>{s.m}</span>)}</div>}
      </div>
    </div>
  );
}

/* ---------- Cirkel (donut + legenda, shadcn) ---------- */
function PieView({ m, series, level }) {
  let segs = breakdown(m, series);
  /* klein: ingezoomd op de essentie, top-2 + 'Overig', geen legenda */
  if (level === "sm" && segs.length > 3) {
    const sorted = [...segs].sort((a, b) => b.v - a.v);
    const top = sorted.slice(0, 2);
    const rest = sorted.slice(2).reduce((a, s) => a + s.v, 0);
    segs = [...top, { k: "Overig", v: rest, accent: "navy" }];
  }
  /* één-tint palet uit de module-accent: grootste segment = vol accent, kleinere
     segmenten worden trapsgewijs lichter. Zo zijn de cirkel-kleuren consistent met
     de area/staaf/lijn-views (die ook de module-accent gebruiken).                 */
  const baseAccent = `var(--a-${m.accent || "purple"})`;
  const rank = segs.map((_, i) => i).sort((a, b) => segs[b].v - segs[a].v);
  const denom = Math.max(1, segs.length - 1);
  segs = segs.map((s, i) => {
    const pos = rank.indexOf(i);
    if (pos === 0) return { ...s, color: baseAccent };
    const mix = Math.round(14 + (pos / denom) * 42);
    return { ...s, color: `color-mix(in oklab, ${baseAccent} ${100 - mix}%, #fff ${mix}%)` };
  });
  const total = segs.reduce((a, s) => a + s.v, 0) || 1;
  const size = level === "lg" ? 188 : level === "md" ? 150 : 124;
  const thick = level === "lg" ? 32 : level === "md" ? 27 : 22;
  const lab = m.money && /kwartaal/.test(segs[0] && segs[0].k || "") ? "per kwartaal" : (m.pieLabel || "totaal");
  return (
    <div className={"pieview lvl-" + level}>
      <Donut segments={segs} size={size} thickness={thick} center={{ v: Math.round(total).toLocaleString("nl-NL"), k: lab }} />
      {level !== "sm" && (
        <div className="pie-legend">
          {segs.map((s, i) => (
            <div className="pie-leg-row" key={i}>
              <span className="pie-leg-dot" style={{ background: s.color || AC(s.accent) }} />
              <span className="pie-leg-k">{s.k}</span>
              <b className="pie-leg-v">{Math.round(s.v / total * 100)}%</b>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

/* ---------- view-config: labels + grootte-gating ---------- */
const WIDGET_VIEW_LABEL = { std: "Tekst & cijfers", area: "Area", bar: "Staaf", line: "Lijn", pie: "Cirkel" };
const WIDGET_VIEW_ICON = { std: "bars", area: "trend", bar: "chartup", line: "trend", pie: "donut" };

function widgetChartViews(m, size) {
  if (!chartable(m)) return null;
  return ["std", "area", "bar", "line", "pie"];
}

/* ---------- de renderer ----------
   detail past zich aan de widgetgrootte aan:
   • sm , ingezoomd, dik, geen assen/legenda, laatste 6 maanden
   • md , x-as, geen y-as, 12 maanden, donut + legenda
   • lg , volledige assen + grid + 2 series + tooltip + ruime donut         */
function WidgetChart({ m, view, size }) {
  const level = (size === "large" || size === "xl") ? "lg" : size === "medium" ? "md" : "sm";
  const full = monthSeries(m);
  const series = level === "sm" ? full.slice(-6) : full;
  const accentA = m.accent, accentB = secondAccent(m.accent);
  const money = !!m.money;
  if (view === "area") return <BarChart data={series} accentA={accentA} accentB={accentB} height="100%" money={money} level={level} />;
  if (view === "bar") return <VBars series={series} grouped={level === "lg"} accentA={accentA} accentB={accentB} height="100%" money={money} level={level} />;
  if (view === "line") return <LineC series={series} multi={level === "lg"} accentA={accentA} accentB={accentB} height="100%" money={money} level={level} />;
  if (view === "pie") return <PieView m={m} series={full} level={level} />;
  return null;
}

export { WidgetChart, widgetChartViews, chartable, statBase, statNum, syncedNums, monthSeries, breakdown, VBars, LineC, PieView, WIDGET_VIEW_LABEL, WIDGET_VIEW_ICON, secondAccent };
