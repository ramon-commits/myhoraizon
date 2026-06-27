/* ============================================================
   Interactie-laag: persistente store + toasts + feature-flags
   Maakt het prototype écht klikbaar (statussen blijven bewaard).
   ============================================================ */
import React from 'react'
import ReactDOM from 'react-dom'
import { ICONS } from './icons'
import { KYANO } from './data'
import { Avatar } from './components.jsx'

const { useState: useStateC, useEffect: useEffectC } = React;

/* ---------- persistente key/value store met reactiviteit ---------- */
const STORE_KEY = "myhoraizon.state.v1";
/* strijk em-dashes uit eerder bewaarde state (seeds uit oude sessies):
   " — " wordt ", ", losse "—" placeholder wordt "–". */
function _deDash(v) {
  if (typeof v === "string") return v.replace(/\s\u2014\s/g, ", ").replace(/\u2014/g, "\u2013");
  if (Array.isArray(v)) return v.map(_deDash);
  if (v && typeof v === "object") { const o = {}; for (const k in v) o[k] = _deDash(v[k]); return o; }
  return v;
}
let _state = (() => { try { return _deDash(JSON.parse(localStorage.getItem(STORE_KEY)) || {}); } catch (e) { return {}; } })();
const _subs = new Set();
function _persist() { try { localStorage.setItem(STORE_KEY, JSON.stringify(_state)); } catch (e) {} }
_persist();
function setState(k, v) { _state = { ..._state, [k]: v }; _persist(); _subs.forEach((f) => f()); }
function getState(k, def) { return k in _state ? _state[k] : def; }
function useStore() {
  const [, force] = useStateC(0);
  useEffectC(() => { const s = () => force((x) => x + 1); _subs.add(s); return () => _subs.delete(s); }, []);
  return { get: getState, set: setState };
}
function resetStore() {
  _state = {}; _persist();
  ["myhoraizon.layout.v2", "myhoraizon.kpis.v1", "myhoraizon.flags.v1"].forEach((k) => { try { localStorage.removeItem(k); } catch (e) {} });
  location.reload();
}

/* ---------- gedeelde records-laag (één bron die modules koppelt) ----------
   Elke collectie ('crm','offerte','factuur','afspraak','taak'…) is een lijst
   onder sleutel 'rec.<coll>'. Modules tonen [...getRecords(coll), ...seeds].
   addRecord prepend't + geeft 't record terug (met id/ts). Zo schrijft Nieuw
   in dezelfde bron die de modules lezen, later triviaal aan een echte API te
   koppelen (vervang get/addRecord door fetch). */
function getRecords(coll) { return getState("rec." + coll, []); }
function addRecord(coll, rec) {
  const r = { id: "r" + Date.now().toString(36) + Math.random().toString(36).slice(2, 5), _new: true, ts: Date.now(), ...rec };
  setState("rec." + coll, [r, ...getRecords(coll)]);
  return r;
}
function updateRecord(coll, id, patch) {
  setState("rec." + coll, getRecords(coll).map((r) => r.id === id ? { ...r, ...patch } : r));
}
function removeRecord(coll, id) { setState("rec." + coll, getRecords(coll).filter((r) => r.id !== id)); }

/* vraag een module om een specifiek record te openen (zoekresultaat → detail) */
function focusRecord(mod, name) { setState("focus." + mod, { name, ts: Date.now() }); }

/* ---------- toasts ---------- */
const _toastSubs = new Set();
function toast(msg, opts) { _toastSubs.forEach((f) => f(msg, opts || {})); }

/* Knoppen-poort: elke nog-niet-afgebouwde actie roept dit aan i.p.v. een stille
   no-op. Toont een nette "komt binnenkort"-toast. NOOIT een lege onClick. */
function notImplemented(label) { toast((label || "Deze actie") + " komt binnenkort", { icon: "spark", kind: "muted" }); }
function ToastHost() {
  const [items, setItems] = useStateC([]);
  useEffectC(() => {
    const l = (msg, opts) => {
      const id = Math.random().toString(36).slice(2);
      setItems((x) => [...x, { id, msg, kind: opts.kind || "ok", icon: opts.icon || "check", agent: opts.agent }]);
      setTimeout(() => setItems((x) => x.filter((i) => i.id !== id)), opts.ms || 2800);
    };
    _toastSubs.add(l); return () => _toastSubs.delete(l);
  }, []);
  return (
    <div className="toast-host">
      {items.map((t) => (
        <div key={t.id} className={"toast toast-" + t.kind}>
          {t.agent
            ? <Avatar agent={t.agent} size={26} />
            : <span className="toast-ic" dangerouslySetInnerHTML={{ __html: ICONS(t.icon, { sw: 2.2 }) }} />}
          <span className="toast-msg">{t.msg}</span>
        </div>
      ))}
    </div>
  );
}

/* ---------- feature-flags (modules aan/uit per klant) ---------- */
const FLAGS_KEY = "myhoraizon.flags.v1";
function loadFlags() {
  let saved = {};
  try { saved = JSON.parse(localStorage.getItem(FLAGS_KEY)) || {}; } catch (e) {}
  const flags = {};
  KYANO.modules.forEach((m) => { flags[m.id] = m.id in saved ? !!saved[m.id] : true; });
  return flags;
}
function saveFlags(f) { try { localStorage.setItem(FLAGS_KEY, JSON.stringify(f)); } catch (e) {} }

/* Vaste modules die je niet kunt uitzetten */
const LOCKED_MODULES = ["vandaag", "agents"];

/* ---------- herbruikbaar modal + invulvelden ---------- */
/* Portal: rendert overlays op <body> zodat position:fixed altijd de échte
   viewport pakt, nooit gevangen in een widget/tegel met transform/filter. */
function Portal({ children }) {
  return ReactDOM.createPortal(children, document.body);
}
function Modal({ title, eyebrow, accent = "teal", onClose, children, footer }) {
  useEffectC(() => {
    const k = (e) => { if (e.key === "Escape") onClose(); };
    window.addEventListener("keydown", k); return () => window.removeEventListener("keydown", k);
  }, []);
  return (
    <Portal>
    <div className="modal-overlay" onClick={onClose}>
      <div className="modal" onClick={(e) => e.stopPropagation()}>
        <header className="modal-head">
          <div>
            {eyebrow && <div className="modal-eyebrow mono" style={{ color: `var(--a-${accent})` }}>{eyebrow}</div>}
            <h3 className="modal-title">{title}</h3>
          </div>
          <button className="icon-btn" onClick={onClose}><span dangerouslySetInnerHTML={{ __html: ICONS("close", { sw: 2 }) }} /></button>
        </header>
        <div className="modal-body">{children}</div>
        {footer && <footer className="modal-foot">{footer}</footer>}
      </div>
    </div>
    </Portal>
  );
}
function Field({ label, value, onChange, placeholder, type = "text", textarea, span, disabled }) {
  return (
    <label className="field" style={span ? { gridColumn: "span " + span } : null}>
      <span className="field-lbl">{label}</span>
      {textarea
        ? <textarea className="field-in" rows={3} value={value} placeholder={placeholder} disabled={disabled} onChange={(e) => onChange(e.target.value)} />
        : <input className="field-in" type={type} value={value} placeholder={placeholder} disabled={disabled} onChange={(e) => onChange(e.target.value)} />}
    </label>
  );
}

/* ---------- bevestig-dialoog (globaal, promise-based) ---------- */
let _confirmSub = null;
function confirmAsk(opts) {
  return new Promise((resolve) => {
    if (!_confirmSub) { resolve(window.confirm((opts && opts.title) || "Weet je het zeker?")); return; }
    _confirmSub({ opts: opts || {}, resolve });
  });
}
function ConfirmHost() {
  const [req, setReq] = useStateC(null);
  useEffectC(() => { _confirmSub = (r) => setReq(r); return () => { _confirmSub = null; }; }, []);
  useEffectC(() => {
    if (!req) return;
    const k = (e) => { if (e.key === "Escape") close(false); };
    window.addEventListener("keydown", k); return () => window.removeEventListener("keydown", k);
  }, [req]);
  if (!req) return null;
  const o = req.opts;
  const close = (val) => { req.resolve(val); setReq(null); };
  const danger = o.danger !== false;
  return (
    <Portal>
    <div className="modal-overlay confirm-overlay" onPointerDown={() => close(false)}>
      <div className="confirm-card" onPointerDown={(e) => e.stopPropagation()}>
        <div className={"confirm-ic " + (danger ? "danger" : "")} dangerouslySetInnerHTML={{ __html: ICONS(o.icon || (danger ? "trash" : "info"), { sw: 2 }) }} />
        <div className="confirm-titel">{o.title || "Weet je het zeker?"}</div>
        {o.sub && <div className="confirm-sub">{o.sub}</div>}
        <div className="confirm-acts">
          <button className="confirm-cancel" onClick={() => close(false)}>{o.cancelLabel || "Annuleren"}</button>
          <button className={"confirm-ok " + (danger ? "danger" : "")} onClick={() => close(true)}>{o.confirmLabel || "Verwijderen"}</button>
        </div>
      </div>
    </div>
    </Portal>
  );
}

export {
  getState, setState, useStore, resetStore,
  getRecords, addRecord, updateRecord, removeRecord, focusRecord,
  toast, notImplemented, ToastHost, confirmAsk, ConfirmHost, loadFlags, saveFlags, LOCKED_MODULES, Modal, Field, Portal,
};
