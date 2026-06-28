/* ============================================================
   widgets.jsx, bewerkbare widgets op élke modulepagina
   ------------------------------------------------------------
   • WidgetsProvider levert de context die <Panel> bewerkbaar maakt
     (wiebelen, Klein/Groot, verbergen, slepen om te ordenen).
   • Per module bewaard in localStorage: myhoraizon.pagelayout.<id>
   • WidgetsAdmin: centrale lijst om per module elke widget aan/uit
     te zetten (gebruikt in de Admin/Beheer-module).
   Vereist WidgetCtx (gedefinieerd in components.jsx) + <Panel>.
   ESM-port van blauwdruk-module 31-widgets: window-globals -> imports.
   Bodies 1:1; alleen window.WidgetCtx -> WidgetCtx en window.MOD -> MOD.
   ============================================================ */
import React from 'react'
import { ICONS } from './icons'
import { KYANO } from './data'
import { useStore, toast } from './store.jsx'
import { AC, ACsoft, WidgetCtx, Panel } from './components.jsx'

/* MOD: module-registry op id (zoals de andere bestanden) voor chip + label */
const MOD = {}
KYANO.modules.forEach((m) => { MOD[m.id] = m })

const PW_BASE = 10;
const pwKey = (id) => "myhoraizon.pagelayout." + id;
function loadPW(id) { try { return JSON.parse(localStorage.getItem(pwKey(id))) || {}; } catch (e) { return {}; } }
function savePW(id, v) { try { localStorage.setItem(pwKey(id), JSON.stringify(v)); } catch (e) {} }
function resetPW(id) { try { localStorage.removeItem(pwKey(id)); } catch (e) {} window.dispatchEvent(new CustomEvent("pw-reset", { detail: id })); }

/* registratie-cache: welke widgets heeft elke (bezochte) module */
window.__widgetReg = window.__widgetReg || {};

function WidgetsProvider({ moduleId, editing, children }) {
  const [pw, setPw] = React.useState(() => loadPW(moduleId));
  const regRef = React.useRef([]);
  const dragRef = React.useRef(null);

  React.useEffect(() => { setPw(loadPW(moduleId)); regRef.current = []; }, [moduleId]);
  React.useEffect(() => {
    const h = (e) => { if (e.detail === moduleId) setPw(loadPW(moduleId)); };
    window.addEventListener("pw-reset", h);
    return () => window.removeEventListener("pw-reset", h);
  }, [moduleId]);

  const update = React.useCallback((mut) => {
    setPw((prev) => {
      const n = { hidden: { ...(prev.hidden || {}) }, sizes: { ...(prev.sizes || {}) }, order: prev.order ? [...prev.order] : null };
      mut(n); savePW(moduleId, n); return n;
    });
  }, [moduleId]);

  const startDrag = React.useCallback((e, wid) => {
    if (e.target.closest(".pw-sizes") || e.target.closest(".pw-remove")) return;
    const grid = e.currentTarget.closest(".pw-grid"); if (!grid) return;
    dragRef.current = { wid, start: { x: e.clientX, y: e.clientY }, moved: false };
    const move = (ev) => {
      const ds = dragRef.current; if (!ds) return;
      if (!ds.moved && Math.hypot(ev.clientX - ds.start.x, ev.clientY - ds.start.y) < 6) return;
      ds.moved = true;
      const els = [...grid.querySelectorAll(".panel[data-wid]")];
      let target = null;
      for (const el of els) {
        const w = el.dataset.wid; if (w === wid) continue;
        const r = el.getBoundingClientRect();
        if (ev.clientY >= r.top && ev.clientY <= r.bottom && ev.clientX >= r.left && ev.clientX <= r.right) {
          target = { w, before: ev.clientY < r.top + r.height / 2 }; break;
        }
      }
      if (target) update((n) => {
        const base = (n.order && n.order.length) ? n.order : regRef.current.map((x) => x.wid);
        const cur = base.filter((x) => x !== wid);
        let idx = cur.indexOf(target.w); if (idx < 0) idx = cur.length;
        if (!target.before) idx += 1;
        cur.splice(idx, 0, wid); n.order = cur;
      });
    };
    const up = () => { window.removeEventListener("pointermove", move); window.removeEventListener("pointerup", up); dragRef.current = null; };
    window.addEventListener("pointermove", move);
    window.addEventListener("pointerup", up);
  }, [update]);

  const api = React.useMemo(() => ({
    editing,
    moduleId,
    register: (wid, icon) => {
      const r = regRef.current;
      if (!r.find((x) => x.wid === wid)) { r.push({ wid, icon }); window.__widgetReg[moduleId] = r.slice(); }
    },
    isHidden: (wid) => !!(pw.hidden && pw.hidden[wid]),
    sizeOf: (wid) => (pw.sizes && pw.sizes[wid]) || "full",
    orderOf: (wid) => {
      const ord = (pw.order && pw.order.length) ? pw.order : regRef.current.map((x) => x.wid);
      const i = ord.indexOf(wid);
      return PW_BASE + (i < 0 ? regRef.current.findIndex((x) => x.wid === wid) : i);
    },
    setSize: (wid, s) => update((n) => { n.sizes[wid] = s; }),
    hide: (wid) => update((n) => { n.hidden[wid] = true; }),
    show: (wid) => update((n) => { delete n.hidden[wid]; }),
    onPointerDown: startDrag,
    hiddenList: () => regRef.current.filter((x) => pw.hidden && pw.hidden[x.wid]),
  }), [editing, pw, moduleId, update, startDrag]);

  return React.createElement(WidgetCtx.Provider, { value: api }, children);
}

/* module-scoped "Widget toevoegen"-markt onderaan de pagina (in bewerkmodus) */
function HiddenTray() {
  const ctx = React.useContext(WidgetCtx);
  if (!ctx || !ctx.editing) return null;
  const hidden = ctx.hiddenList();
  const mod = MOD[ctx.moduleId] || {};
  const accent = mod.accent || "purple";
  const naam = mod.name || "deze module";
  return (
    <div className="modmarket">
      <div className="modmarket-head">
        <span className="mm-ic" style={{ color: AC(accent), background: ACsoft(accent) }} dangerouslySetInnerHTML={{ __html: ICONS("plus", { sw: 2.4 }) }} />
        <div className="mm-head-txt">
          <div className="mm-title">Widget toevoegen</div>
          <div className="mm-sub mono">Alleen widgets van {naam}</div>
        </div>
      </div>
      {hidden.length === 0 ? (
        <div className="mm-empty mono">Alle widgets van {naam} staan al op de pagina. Tik <b>×</b> op een widget om 'm hier te parkeren.</div>
      ) : (
        <div className="mm-grid">
          {hidden.map((x) => (
            <button key={x.wid} className="mm-card" onClick={() => { ctx.show(x.wid); toast(x.wid + " toegevoegd", { icon: "check" }); }}>
              <span className="mm-card-ic" style={{ color: AC(accent), background: ACsoft(accent) }} dangerouslySetInnerHTML={{ __html: ICONS(x.icon || "grid", { sw: 1.8 }) }} />
              <span className="mm-card-name">{x.wid}</span>
              <span className="mm-card-add" style={{ color: AC(accent) }}>+ Toevoegen</span>
            </button>
          ))}
        </div>
      )}
    </div>
  );
}

/* ===== Admin: centrale widget-schakelaars per module ===== */
function WidgetsAdmin({ flags, go }) {
  const store = useStore();
  const mods = KYANO.modules.filter((m) => flags[m.id] !== false && m.id !== "vandaag" && m.id !== "postvak");
  const [openId, setOpenId] = React.useState(null);

  return (
    <Panel eyebrow="Per module · zet widgets aan of uit" title="Widgets beheren" accent="purple">
      <div className="set-hint mono">Open een module om z'n widgets te laden, of bewerk ze direct op de pagina met de knop <b>Bewerk</b>. Hier zet je ze centraal aan/uit.</div>
      {mods.map((m) => {
        const reg = window.__widgetReg[m.id] || [];
        const pw = loadPW(m.id);
        const hiddenCount = reg.filter((w) => pw.hidden && pw.hidden[w.wid]).length;
        const isOpen = openId === m.id;
        return (
          <div className="wadm" key={m.id}>
            <button className="wadm-head" onClick={() => setOpenId(isOpen ? null : m.id)}>
              <span className="tile-chip sm" style={{ color: AC(m.accent), background: ACsoft(m.accent) }}><span dangerouslySetInnerHTML={{ __html: ICONS(m.icon) }} /></span>
              <div className="wadm-id">
                <div className="wadm-name">{m.name}</div>
                <div className="wadm-sub mono">{reg.length ? `${reg.length} widgets · ${hiddenCount} verborgen` : "nog niet geladen, open de module"}</div>
              </div>
              <span className="wadm-chev" style={{ transform: isOpen ? "rotate(90deg)" : "none" }} dangerouslySetInnerHTML={{ __html: ICONS("chevron") }} />
            </button>
            {isOpen && (
              <div className="wadm-body">
                {reg.length === 0 && (
                  <button className="wadm-open" onClick={() => go(m.id)}>
                    <span dangerouslySetInnerHTML={{ __html: ICONS("arrow") }} />Open {m.name} om de widgets te laden
                  </button>
                )}
                {reg.map((w) => {
                  const on = !(pw.hidden && pw.hidden[w.wid]);
                  return (
                    <div className="wadm-row" key={w.wid}>
                      <span className="wadm-wic" dangerouslySetInnerHTML={{ __html: ICONS(w.icon || "grid", { sw: 1.8 }) }} />
                      <span className="wadm-wname">{w.wid}</span>
                      <button className={"toggle sm" + (on ? " on" : "")} onClick={() => {
                        const cur = loadPW(m.id); const nh = { ...(cur.hidden || {}) };
                        if (on) nh[w.wid] = true; else delete nh[w.wid];
                        savePW(m.id, { ...cur, hidden: nh });
                        window.dispatchEvent(new CustomEvent("pw-reset", { detail: m.id }));
                        store.set("__wadm_tick", Math.random());
                        toast(w.wid + (on ? " verborgen" : " getoond") + " · " + m.name, { icon: on ? "close" : "check" });
                      }}><span className="toggle-knob" /></button>
                    </div>
                  );
                })}
                {reg.length > 0 && (
                  <div className="wadm-actions">
                    <button className="wadm-reset" onClick={() => { resetPW(m.id); store.set("__wadm_tick", Math.random()); toast(m.name + " · widgets hersteld", { icon: "check" }); }}>Alles tonen</button>
                    <button className="wadm-open ghost" onClick={() => go(m.id)}>Open & bewerk →</button>
                  </div>
                )}
              </div>
            )}
          </div>
        );
      })}
    </Panel>
  );
}

export { WidgetsProvider, HiddenTray, WidgetsAdmin, loadPW, savePW, resetPW };
