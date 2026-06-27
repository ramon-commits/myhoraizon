/* Gedeelde UI-bouwstenen uit de Claude Design-blauwdruk. Letterlijke port:
   alleen window-globals zijn imports/exports geworden, bodies ongewijzigd. */
import React from 'react'
import { ICONS } from './icons'
import { KYANO } from './data'
import { useStore, setState, confirmAsk, toast } from './store.jsx'

const { useState, useEffect } = React;

/* Delta-chip met richting-pijl (groen = goed) */
function Delta({ d, size }) {
  if (!d) return null;
  return (
    <span className={"delta " + (d.good ? "good" : "bad") + (size === "sm" ? " sm" : "")}>
      <span className="delta-arrow">{d.dir === "down" ? "▼" : "▲"}</span>{d.v}
    </span>);

}

/* Statblok: groot tabulair cijfer + delta + sublabel */
function StatBlock({ value, sub, delta, money, size }) {
  return (
    <div className={"statblock" + (size === "sm" ? " sm" : "")}>
      <div className="sb-row">
        <span className={"stat-num" + (money ? " money" : "")}>{value}</span>
        <Delta d={delta} />
      </div>
      {sub && <div className="stat-sub">{sub}</div>}
    </div>);

}

/* vloeiende (catmull-rom) pad-helper voor area/lijn-grafieken */
function smoothPath(pts) {
  if (!pts.length) return "";
  if (pts.length < 2) return `M${pts[0][0]} ${pts[0][1]}`;
  let d = `M${pts[0][0].toFixed(2)} ${pts[0][1].toFixed(2)}`;
  for (let i = 0; i < pts.length - 1; i++) {
    const p0 = pts[i - 1] || pts[i],p1 = pts[i],p2 = pts[i + 1],p3 = pts[i + 2] || p2;
    const c1x = p1[0] + (p2[0] - p0[0]) / 6,c1y = p1[1] + (p2[1] - p0[1]) / 6;
    const c2x = p2[0] - (p3[0] - p1[0]) / 6,c2y = p2[1] - (p3[1] - p1[1]) / 6;
    d += ` C${c1x.toFixed(2)} ${c1y.toFixed(2)} ${c2x.toFixed(2)} ${c2y.toFixed(2)} ${p2[0].toFixed(2)} ${p2[1].toFixed(2)}`;
  }
  return d;
}

/* Tijdreeks-grafiek (shadcn-stijl): vloeiende gestapelde area + hover-tooltip */
function BarChart({ data, accentA = "blue", accentB = "aqua", height = 200, money = true, compact = false, level }) {
  const [hover, setHover] = useState(-1);
  const n = data.length;
  /* drie-traps detail: sm (geen assen, dik), md (alleen x-as), lg (volledig) */
  const showY = level ? level === "lg" : !compact;
  const showX = level ? level !== "sm" : !compact;
  const compactCls = level ? level !== "lg" : compact;
  const swA = level === "sm" ? 3 : 2.2, swB = level === "sm" ? 2.5 : 2;
  const max = Math.max(...data.map((d) => d.a + d.b)) * 1.16 || 1;
  const ticks = 4;
  const X = (i) => n > 1 ? i / (n - 1) * 100 : 50;
  const Yp = (v) => (1 - v / max) * 100;
  const lower = data.map((d, i) => [X(i), Yp(d.a)]);
  const upper = data.map((d, i) => [X(i), Yp(d.a + d.b)]);
  const pathLower = smoothPath(lower);
  const pathUpper = smoothPath(upper);
  const revLower = smoothPath([...lower].reverse());
  const areaA = pathLower + " L100 100 L0 100 Z";
  const areaB = pathUpper + " L" + revLower.slice(1) + " Z";
  const fmt = (v) => money ? "€ " + (v >= 1 ? v.toFixed(0) : v.toFixed(1)) + "k" : Math.round(v * 10) / 10;
  const gA = AC(accentA),gB = AC(accentB);
  const tag = String(level || height).replace(/%/g, "");
  const idA = "agA" + accentA + tag,idB = "agB" + accentB + tag;
  const onMove = (e) => {const r = e.currentTarget.getBoundingClientRect();const px = (e.clientX - r.left) / r.width;setHover(Math.max(0, Math.min(n - 1, Math.round(px * (n - 1)))));};
  return (
    <div className={"areac" + (compactCls ? " compact" : "")} style={{ height }}>
      {showY && <div className="areac-yaxis">{Array.from({ length: ticks + 1 }, (_, i) => <span key={i} className="areac-ytick">{fmt(max - max / ticks * i)}</span>)}</div>}
      <div className="areac-right">
        <div className="areac-plot" onMouseMove={onMove} onMouseLeave={() => setHover(-1)}>
          <div className="areac-grid">{Array.from({ length: ticks + 1 }, (_, i) => <span key={i} />)}</div>
          <svg className="areac-svg" viewBox="0 0 100 100" preserveAspectRatio="none">
            <defs>
              <linearGradient id={idA} x1="0" y1="0" x2="0" y2="1"><stop offset="5%" stopColor={gA} stopOpacity="0.8" /><stop offset="95%" stopColor={gA} stopOpacity="0.1" /></linearGradient>
              <linearGradient id={idB} x1="0" y1="0" x2="0" y2="1"><stop offset="5%" stopColor={gB} stopOpacity="0.8" /><stop offset="95%" stopColor={gB} stopOpacity="0.1" /></linearGradient>
            </defs>
            <path d={areaB} fill={`url(#${idB})`} />
            <path d={areaA} fill={`url(#${idA})`} />
            <path d={pathUpper} fill="none" stroke={gB} strokeWidth={swB} vectorEffect="non-scaling-stroke" strokeLinejoin="round" strokeLinecap="round" />
            <path d={pathLower} fill="none" stroke={gA} strokeWidth={swA} vectorEffect="non-scaling-stroke" strokeLinejoin="round" strokeLinecap="round" />
          </svg>
          {hover >= 0 && <>
            <div className="areac-guide" style={{ left: X(hover) + "%" }} />
            <span className="areac-dot" style={{ left: X(hover) + "%", top: Yp(data[hover].a + data[hover].b) + "%", "--c": gB }} />
            <span className="areac-dot" style={{ left: X(hover) + "%", top: Yp(data[hover].a) + "%", "--c": gA }} />
            <div className={"areac-tip" + (X(hover) > 60 ? " left" : "")} style={{ left: X(hover) + "%" }}>
              <div className="areac-tip-m">{data[hover].m}</div>
              <div className="areac-tip-row"><span className="areac-tip-dot" style={{ background: gB }} />Verwacht<b>{fmt(data[hover].b)}</b></div>
              <div className="areac-tip-row"><span className="areac-tip-dot" style={{ background: gA }} />Geboekt<b>{fmt(data[hover].a)}</b></div>
            </div>
          </>}
        </div>
        {showX && <div className="areac-x">{data.map((d, i) => <span key={i} className={hover === i ? "on" : ""}>{d.m}</span>)}</div>}
      </div>
    </div>);

}

/* KPI-strip kaart (boardroom-cijfer), klikbaar + bewerkbaar */
function KpiCard({ kpi, onOpen, onPick, menuOpen, onToggleMenu, current, onDelete, editing }) {
  return (
    <div className="kpi-card">
      {editing && (
        <button className="kpi-del" onClick={(e) => { e.stopPropagation(); onDelete && onDelete(); }} title="Cijfer verwijderen" aria-label="Verwijderen">
          <span dangerouslySetInnerHTML={{ __html: ICONS("close", { sw: 2.6 }) }} />
        </button>
      )}
      <button className="kpi-edit" onClick={(e) => {e.stopPropagation();onToggleMenu();}} title="Ander cijfer kiezen">
        <span dangerouslySetInnerHTML={{ __html: ICONS("dots") }} />
      </button>
      <div className="kpi-card-click" onClick={() => onOpen(kpi.link)}>
        <div className="kpi-card-head">
          <span className="kpi-ic" style={{ color: AC("teal"), background: ACsoft("teal") }}>
            <span dangerouslySetInnerHTML={{ __html: ICONS(kpi.icon) }} />
          </span>
          <span className="kpi-card-k">{kpi.k}</span>
        </div>
        <div className="kpi-card-num-row">
          <span className="kpi-card-num">{kpi.v}</span>
          <Delta d={kpi.d} />
        </div>
        <div className="kpi-card-sub">{kpi.sub}<span className="kpi-go" dangerouslySetInnerHTML={{ __html: ICONS("arrow") }} /></div>
      </div>
      {menuOpen &&
      <div className="kpi-menu" onClick={(e) => e.stopPropagation()}>
          <div className="kpi-menu-head mono">Kies een cijfer</div>
          {Object.values(KYANO.kpiCatalog).map((o) =>
        <button key={o.id} className={"kpi-menu-item" + (o.id === current ? " on" : "")} onClick={() => onPick(o.id)}>
              <span className="kpi-menu-ic" style={{ color: AC(o.accent), background: ACsoft(o.accent) }}>
                <span dangerouslySetInnerHTML={{ __html: ICONS(o.icon) }} />
              </span>
              {o.k}
              {o.id === current && <span className="kpi-menu-check" dangerouslySetInnerHTML={{ __html: ICONS("check", { sw: 2.4 }) }} />}
            </button>
        )}
        </div>
      }
    </div>);

}
function KpiStrip({ onOpen, count, editing, storeKey, defaultIds, countKey }) {
  const store = useStore();
  const KEY = storeKey || "myhoraizon.kpis.v1";
  const CNT_KEY = countKey || "kpis.count";
  const DEF = defaultIds || KYANO.kpiDefault;
  const catKeys = Object.keys(KYANO.kpiCatalog);
  const n = Math.max(1, Math.min(16, count != null ? count : store.get(CNT_KEY, DEF.length || 4)));
  const [slots, setSlots] = useState(() => {
    try {
      const s = JSON.parse(localStorage.getItem(KEY));
      if (Array.isArray(s) && s.every((id) => KYANO.kpiCatalog[id])) return s;
    } catch (e) {}
    return [...DEF];
  });
  const [menu, setMenu] = useState(-1);
  const [addOpen, setAddOpen] = useState(false);

  useEffect(() => {
    const close = () => { setMenu(-1); setAddOpen(false); };
    if (menu >= 0 || addOpen) { window.addEventListener("pointerdown", close); return () => window.removeEventListener("pointerdown", close); }
  }, [menu, addOpen]);

  const pick = (i, id) => {
    setSlots((prev) => {const a = [...prev];while (a.length <= i) a.push(catKeys[a.length % catKeys.length]);a[i] = id;try {localStorage.setItem(KEY, JSON.stringify(a));} catch (e) {}return a;});
    setMenu(-1);
  };

  const addKpi = (id) => {
    setSlots((prev) => { const a = [...prev]; while (a.length < n) a.push(catKeys[a.length % catKeys.length]); a[n] = id; try { localStorage.setItem(KEY, JSON.stringify(a)); } catch (e) {} return a; });
    setState(CNT_KEY, Math.min(16, n + 1));
    setAddOpen(false);
  };

  const removeKpi = async (i) => {
    const kpi = KYANO.kpiCatalog[cells[i]];
    const ok = await confirmAsk({ title: "Cijfer verwijderen?", sub: "\u201C" + (kpi ? kpi.k : "Dit cijfer") + "\u201D wordt van je dashboard verwijderd. Je kunt het later opnieuw toevoegen.", confirmLabel: "Verwijderen" });
    if (!ok) return;
    setSlots((prev) => { const a = [...prev]; while (a.length < n) a.push(catKeys[a.length % catKeys.length]); a.splice(i, 1); try { localStorage.setItem(KEY, JSON.stringify(a)); } catch (e) {} return a; });
    setState(CNT_KEY, Math.max(1, n - 1));
    setMenu(-1);
    toast("Cijfer verwijderd", { icon: "close", kind: "muted" });
  };

  const cells = Array.from({ length: n }, (_, i) => slots[i] && KYANO.kpiCatalog[slots[i]] ? slots[i] : catKeys[i % catKeys.length]);
  const shownSet = new Set(cells);
  const cols = Math.min(n, 4);
  const modName = (link) => { const m = (KYANO.modules || []).find((x) => x.id === link); return m ? m.name : link; };

  // catalogus gegroepeerd per module voor de kiezer
  const groups = {};
  Object.values(KYANO.kpiCatalog).forEach((o) => { (groups[o.link] = groups[o.link] || []).push(o); });

  return (
    <div className="kpi-strip" style={{ gridTemplateColumns: `repeat(${cols},1fr)` }} data-comment-anchor="8e11934fd2-div-158-5">
      {cells.map((id, i) =>
      <KpiCard key={i} kpi={KYANO.kpiCatalog[id]} current={id} onOpen={onOpen}
      menuOpen={menu === i}
      editing={editing}
      onDelete={() => removeKpi(i)}
      onToggleMenu={() => { setMenu(menu === i ? -1 : i); setAddOpen(false); }}
      onPick={(nid) => pick(i, nid)} />
      )}
      {editing && n < 16 && (
        <div className="kpi-card kpi-add">
          <button className="kpi-add-btn" onClick={(e) => { e.stopPropagation(); setAddOpen((v) => !v); setMenu(-1); }}>
            <span className="kpi-add-plus" dangerouslySetInnerHTML={{ __html: ICONS("plus", { sw: 2.2 }) }} />
            <span className="kpi-add-lbl">Cijfer toevoegen</span>
            <span className="kpi-add-sub mono">uit een module</span>
          </button>
          {addOpen && (
            <div className="kpi-menu kpi-add-menu" onClick={(e) => e.stopPropagation()} onPointerDown={(e) => e.stopPropagation()}>
              <div className="kpi-menu-head mono">Kies een kerncijfer</div>
              {Object.keys(groups).map((link) => (
                <div className="kpi-mgroup" key={link}>
                  <div className="kpi-mgroup-lbl mono">{modName(link)}</div>
                  {groups[link].map((o) => (
                    <button key={o.id} className={"kpi-menu-item" + (shownSet.has(o.id) ? " dim" : "")} onClick={() => addKpi(o.id)}>
                      <span className="kpi-menu-ic" style={{ color: AC(o.accent), background: ACsoft(o.accent) }}>
                        <span dangerouslySetInnerHTML={{ __html: ICONS(o.icon) }} />
                      </span>
                      <span className="kpi-menu-txt"><span className="kpi-menu-k">{o.k}</span><span className="kpi-menu-v mono">{o.v}</span></span>
                      {shownSet.has(o.id) && <span className="kpi-menu-tag mono">al zichtbaar</span>}
                    </button>
                  ))}
                </div>
              ))}
            </div>
          )}
        </div>
      )}
    </div>);

}

/* Vloeiende area-grafiek met assen + gridlines */
function AreaChart({ data, accent = "blue", height = 220, labels, yfmt, gridlines }) {
  const w = 720,h = height,padL = 8,padB = labels ? 22 : 2,padT = 8;
  const max = Math.max(...data) * 1.12,min = 0;
  const rng = max - min || 1;
  const X = (i) => padL + i / (data.length - 1) * (w - padL * 2);
  const Y = (v) => padT + (1 - (v - min) / rng) * (h - padT - padB);
  const pts = data.map((v, i) => [X(i), Y(v)]);
  const line = smoothPath(pts);
  const area = line + ` L${X(data.length - 1)} ${h - padB} L${X(0)} ${h - padB} Z`;
  const id = "ar" + accent + height;
  const grid = [0.33, 0.66, 1];
  return (
    <svg width="100%" viewBox={`0 0 ${w} ${h}`} preserveAspectRatio="none" className="areachart">
      <defs>
        <linearGradient id={id} x1="0" y1="0" x2="0" y2="1">
          <stop offset="0%" stopColor={AC(accent)} stopOpacity="0.5" />
          <stop offset="100%" stopColor={AC(accent)} stopOpacity="0.06" />
        </linearGradient>
      </defs>
      {(labels || gridlines) && grid.map((g, i) => <line key={i} x1={padL} x2={w - padL} y1={padT + g * (h - padT - padB)} y2={padT + g * (h - padT - padB)} stroke="var(--line)" />)}
      <path d={area} fill={`url(#${id})`} />
      <path d={line} fill="none" stroke={AC(accent)} strokeWidth="2.4" vectorEffect="non-scaling-stroke" strokeLinecap="round" strokeLinejoin="round" />
      {labels && labels.map((l, i) => <text key={i} x={X(i)} y={h - 6} textAnchor="middle" className="chart-x">{l}</text>)}
    </svg>);

}

/* Donut met segmenten + middenlabel (shadcn-stijl: gaps + ronde caps) */
function Donut({ segments, size = 168, thickness = 26, center }) {
  const total = segments.reduce((a, s) => a + s.v, 0) || 1;
  const r = (size - thickness) / 2,c = size / 2,circ = 2 * Math.PI * r;
  const gap = segments.length > 1 ? circ * 0.012 : 0;
  let off = 0;
  return (
    <div className="donut" style={{ width: size, height: size }}>
      <svg width={size} height={size} viewBox={`0 0 ${size} ${size}`}>
        <circle cx={c} cy={c} r={r} fill="none" stroke="var(--bg-deep)" strokeWidth={thickness} />
        {segments.map((s, i) => {
          const len = Math.max(s.v / total * circ - gap, 0.5);
          const el =
          <circle key={i} cx={c} cy={c} r={r} fill="none" stroke={s.color || AC(s.accent)} strokeWidth={thickness}
          strokeDasharray={`${len} ${circ - len}`} strokeDashoffset={-off}
          transform={`rotate(-90 ${c} ${c})`} strokeLinecap="round"
          style={{ transition: "stroke-dasharray .6s cubic-bezier(.2,.8,.2,1)" }} />;

          off += len + gap;
          return el;
        })}
      </svg>
      {center && <div className="donut-center"><div className="donut-num">{center.v}</div><div className="donut-lbl">{center.k}</div></div>}
    </div>);

}

/* Voortgangsring (1 waarde) */
function Ring({ pct, accent = "green", size = 120, thickness = 12, label, sub }) {
  const r = (size - thickness) / 2,c = size / 2,circ = 2 * Math.PI * r;
  const len = Math.min(pct, 100) / 100 * circ;
  return (
    <div className="ring" style={{ width: size, height: size }}>
      <svg width={size} height={size} viewBox={`0 0 ${size} ${size}`}>
        <circle cx={c} cy={c} r={r} fill="none" stroke="var(--bg-deep)" strokeWidth={thickness} />
        <circle cx={c} cy={c} r={r} fill="none" stroke={AC(accent)} strokeWidth={thickness}
        strokeDasharray={`${len} ${circ - len}`} transform={`rotate(-90 ${c} ${c})`} strokeLinecap="round"
        style={{ transition: "stroke-dasharray .6s cubic-bezier(.2,.8,.2,1)" }} />
      </svg>
      <div className="ring-center"><div className="ring-num">{label != null ? label : pct + "%"}</div>{sub && <div className="ring-sub">{sub}</div>}</div>
    </div>);

}

/* accent → css var */
const AC = (a) => `var(--a-${a || "purple"})`;
const ACsoft = (a) => `var(--a-${a || "purple"}-soft)`;
const ACHEX = {
  purple: "#6B3FE4", teal: "#2E9C95", orange: "#E0612F", red: "#C13A33", aqua: "#3FA9A2",
  navy: "#1F2748", mila: "#6B3FE4", green: "#2F7A4A", gold: "#C99437", blue: "#4F6FD6"
};

/* Officieel HorAIzon-logo: gradient-cirkel met ring + balk */
function HoraizonLogo({ size = 28 }) {
  const gid = "rg-" + size;
  const cid = "cc-" + size;
  return (
    <svg width={size} height={size} viewBox="0 0 100 100" style={{ display: "block", flex: "0 0 auto" }}>
      <defs>
        <clipPath id={cid}><circle cx="50" cy="50" r="50" /></clipPath>
        <linearGradient id={gid} x1="0" y1="0" x2="1" y2="0">
          <stop offset="0" stopColor="#EE6A3A" />
          <stop offset="0.14" stopColor="#E0B341" />
          <stop offset="0.28" stopColor="#5DBF92" />
          <stop offset="0.43" stopColor="#4FB8B2" />
          <stop offset="0.57" stopColor="#4A6FD6" />
          <stop offset="0.71" stopColor="#6B3FE4" />
          <stop offset="0.85" stopColor="#C03F7B" />
          <stop offset="1" stopColor="#E58FA8" />
        </linearGradient>
      </defs>
      <circle cx="50" cy="50" r="50" fill={`url(#${gid})`} />
      <g clipPath={`url(#${cid})`}>
        <circle cx="50" cy="42" r="22" fill="none" stroke="#fff" strokeWidth="9" />
        <rect x="0" y="60" width="100" height="9" fill="#fff" />
      </g>
    </svg>);

}

/* Officieel Kyano-merkteken: ring + balk (exact uit de merk-SVG's) */
function KyanoMark({ size = 22, color = "#fff" }) {
  return (
    <svg width={size} height={size} viewBox="0 0 100 100" style={{ display: "block" }}>
      <circle cx="50" cy="42" r="22" fill="none" stroke={color} strokeWidth="9" />
      <rect x="0" y="60" width="100" height="9" fill={color} />
    </svg>);

}

/* Kyano product-badge: gekleurde cirkel met merkteken (zoals het merkboek) */
function KyanoBadge({ accent = "purple", size = 32 }) {
  const hex = ACHEX[accent] || ACHEX.purple;
  return (
    <span className="kbadge" style={{
      width: size, height: size,
      background: `radial-gradient(120% 120% at 32% 24%, color-mix(in oklab, ${hex} 68%, #fff), ${hex})`,
      boxShadow: `inset 0 1px 2px rgba(255,255,255,.45), 0 2px 5px ${hex}44`
    }}>
      <KyanoMark size={size} />
    </span>);

}

/* Agent-avatar = gekleurde cirkel met merkteken */
function avatarInitials(name) {
  const parts = String(name || "").trim().split(/\s+/).filter(Boolean);
  if (!parts.length) return "?";
  if (parts.length === 1) return parts[0].slice(0, 2).toUpperCase();
  return (parts[0][0] + parts[parts.length - 1][0]).toUpperCase();
}
const AVATAR_HUES = ["navy", "aqua", "green", "gold", "purple", "orange", "teal"];
function avatarHue(name) {
  let h = 0; const s = String(name || "");
  for (let i = 0; i < s.length; i++) h = (h * 31 + s.charCodeAt(i)) >>> 0;
  return AVATAR_HUES[h % AVATAR_HUES.length];
}
function Avatar({ agent, accent, name, size = 40, ring = false }) {
  if (name) {
    const ac = avatarHue(name);
    return (
      <span className="avatar avatar-initials" style={{
        width: size, height: size, fontSize: Math.round(size * 0.4),
        color: AC(ac),
        background: `color-mix(in oklab, ${AC(ac)} 16%, var(--card))`,
        boxShadow: ring ? `0 0 0 3px var(--card), 0 0 0 4.5px ${ACsoft(ac)}` : `inset 0 0 0 1px color-mix(in oklab, ${AC(ac)} 26%, transparent)`
      }}>{avatarInitials(name)}</span>);
  }
  const ac = accent || KYANO.agents[agent] && KYANO.agents[agent].accent || "purple";
  return (
    <span className="avatar" style={{
      width: size, height: size,
      background: `radial-gradient(120% 120% at 30% 25%, color-mix(in oklab, ${AC(ac)} 76%, #fff), ${AC(ac)})`,
      boxShadow: ring ? `0 0 0 3px var(--card), 0 0 0 4.5px ${ACsoft(ac)}` : "inset 0 1px 2px rgba(255,255,255,.3)"
    }}>
      <KyanoMark size={size} />
    </span>);

}

/* Mono eyebrow-label */
function Eyebrow({ children, dot, accent, style }) {
  return (
    <div className="eyebrow" style={style}>
      {dot && <span className="eyebrow-dot" style={{ background: AC(accent) }} />}
      {children}
    </div>);

}

function Icon({ name, sw, fill, style, className }) {
  return <span className={"icon-wrap " + (className || "")} style={style}
  dangerouslySetInnerHTML={{ __html: ICONS(name, { sw, fill }) }} />;
}

/* Knoppen, groot, iPhone-achtig */
function Btn({ children, kind = "ghost", accent, icon, onClick, full, size = "md" }) {
  const styles = {};
  if (kind === "solid") {styles.background = AC(accent);styles.color = "#fff";styles.borderColor = "transparent";}
  if (kind === "soft") {styles.background = ACsoft(accent);styles.color = AC(accent);styles.borderColor = "transparent";}
  if (kind === "tint") {styles.color = AC(accent);}
  return (
    <button className={`btn btn-${kind} btn-${size}`} style={{ ...styles, width: full ? "100%" : undefined }} onClick={onClick}>
      {icon && <Icon name={icon} />}
      {children}
    </button>);

}

/* Status-chip */
function Chip({ children, accent, tone = "soft" }) {
  const st = tone === "soft" ?
  { background: ACsoft(accent), color: AC(accent) } :
  { background: "transparent", color: "var(--ink2)", border: "1px solid var(--line)" };
  return <span className="chip" style={st}>{children}</span>;
}

/* Sparkline */
function Sparkline({ data, accent = "blue", w = 220, h = 56, fill = true }) {
  const max = Math.max(...data),min = Math.min(...data);
  const rng = max - min || 1;
  const pts = data.map((v, i) => [
  i / (data.length - 1) * w,
  h - 6 - (v - min) / rng * (h - 12)]
  );
  const line = smoothPath(pts);
  const area = line + ` L${w} ${h} L0 ${h} Z`;
  const id = "sg" + accent;
  return (
    <svg width="100%" viewBox={`0 0 ${w} ${h}`} preserveAspectRatio="none" style={{ display: "block" }}>
      <defs>
        <linearGradient id={id} x1="0" y1="0" x2="0" y2="1">
          <stop offset="5%" stopColor={AC(accent)} stopOpacity="0.75" />
          <stop offset="95%" stopColor={AC(accent)} stopOpacity="0.08" />
        </linearGradient>
      </defs>
      {fill && <path d={area} fill={`url(#${id})`} />}
      <path d={line} fill="none" stroke={AC(accent)} strokeWidth="2.8" strokeLinecap="round" strokeLinejoin="round" />
      <circle cx={pts[pts.length - 1][0]} cy={pts[pts.length - 1][1]} r="3.4" fill={AC(accent)} />
      <circle cx={pts[pts.length - 1][0]} cy={pts[pts.length - 1][1]} r="6" fill={AC(accent)} fillOpacity="0.18" />
    </svg>);

}

/* Kanaal-icoon voor inbox */
function ChannelIcon({ ch, size = 30 }) {
  const map = { wa: ["wa", "aqua"], gm: ["gm", "red"], li: ["li", "navy"] };
  const [ic, ac] = map[ch] || ["gm", "navy"];
  return (
    <span className="ch-icon" style={{ width: size, height: size, color: AC(ac), background: ACsoft(ac) }}>
      <span dangerouslySetInnerHTML={{ __html: ICONS(ic, { sw: 1.7 }) }} />
    </span>);

}

/* Mini voortgangsbalk */
function Bar({ pct, accent }) {
  return (
    <div className="bar-track">
      <div className="bar-fill" style={{ width: pct + "%", background: AC(accent) }} />
    </div>);

}

/* Kaart-shell voor pagina-secties */
/* Widget-context: maakt <Panel> bewerkbaar op modulepagina's (zie widgets.jsx) */
const WidgetCtx = React.createContext(null);
function panelWidIcon(eyebrow, title) {
  const s = ((title || "") + " " + (eyebrow || "")).toLowerCase();
  if (/omzet|cijfer|kpi|conversie|trend|bereik/.test(s)) return "bars";
  if (/inbox|bericht|communicat/.test(s)) return "inbox";
  if (/agenda|dag|week|event|bijeen/.test(s)) return "calendar";
  if (/team|relatie|contact|leden|lid/.test(s)) return "people";
  if (/offerte|contract|factuur|teken/.test(s)) return "doc";
  if (/lead|hotspot|pijplijn|pipeline|deal|fase/.test(s)) return "chartup";
  if (/post|content|social|kanaal/.test(s)) return "brush";
  return "grid";
}

/* Kaart-shell voor pagina-secties, wordt bewerkbaar binnen een WidgetsProvider */
function Panel({ title, eyebrow, accent, right, children, pad = true, wid }) {
  const ctx = React.useContext(WidgetCtx);
  const label = wid || title || eyebrow || "Onderdeel";
  React.useEffect(() => {if (ctx) ctx.register(label, panelWidIcon(eyebrow, title));}, [ctx, label]);

  if (ctx && ctx.isHidden(label)) return null;

  const editing = ctx && ctx.editing;
  const size = ctx ? ctx.sizeOf(label) : "full";
  const style = ctx ? { order: ctx.orderOf(label), gridColumn: size === "half" ? "span 1" : "span 2" } : undefined;

  return (
    <section className={"panel" + (editing ? " pw-editing" : "")} style={style}
    data-wid={ctx ? label : undefined}
    onPointerDown={editing ? (e) => ctx.onPointerDown(e, label) : undefined}>
      {editing &&
      <button className="tile-remove pw-remove" onPointerDown={(e) => e.stopPropagation()}
      onClick={(e) => {e.stopPropagation();ctx.hide(label);}} aria-label="Verbergen">
          <span dangerouslySetInnerHTML={{ __html: ICONS("close", { sw: 2.4 }) }} />
        </button>
      }
      {(title || eyebrow) &&
      <header className="panel-head">
          <div>
            {eyebrow && <Eyebrow accent={accent} dot>{eyebrow}</Eyebrow>}
            {title && <h3 className="panel-title">{title}</h3>}
          </div>
          {right}
        </header>
      }
      <div className={pad ? "panel-body" : ""}>{children}</div>
      {editing &&
      <div className="pw-sizes" onPointerDown={(e) => e.stopPropagation()}>
          <button className={"pw-size" + (size === "half" ? " on" : "")} onClick={() => ctx.setSize(label, "half")}>Klein</button>
          <button className={"pw-size" + (size === "full" ? " on" : "")} onClick={() => ctx.setSize(label, "full")}>Groot</button>
        </div>
      }
    </section>);

}

export {
  AC, ACsoft, ACHEX, WidgetCtx, HoraizonLogo, KyanoMark, KyanoBadge, Avatar, Eyebrow, Icon, Btn, Chip,
  Sparkline, ChannelIcon, Bar, Panel, Delta, StatBlock, BarChart, KpiStrip, KpiCard,
  AreaChart, Donut, Ring, smoothPath
};