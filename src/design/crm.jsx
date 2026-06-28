/* ============================================================
   CRM-pagina (uit de blauwdruk, salescrm.jsx): NL-kaart met pins +
   klantenlijst. Eén klantkaart per relatie — elke rij/pin opent de
   gedeelde klantkaart (openKlantCard -> crm.full -> ClientFullHost).
   Bounded port: de configureerbare kolommen/filters (crmfields) en de
   KvK-nieuwe-klant-flow volgen later; "Nieuwe klant" toont zolang een
   notImplemented-toast. Demo-data uit customers.js.
   ============================================================ */
import React from 'react'
import { ICONS } from './icons'
import { useStore, toast, notImplemented } from './store.jsx'
import { AC, ACsoft, Avatar, Btn, Panel } from './components.jsx'
import { allCustomers } from './customers.js'
import { openKlantCard } from './objectactions.jsx'
import {
  StatusDot, STATUS_META, custAttention, custIdleMonths, custNext, DUE_META,
  riskValue, eur, addCustLog,
} from './sales.jsx'

const { useState, useMemo } = React

/* NL-kaart met klant-pins (positie uit de x/y-haakjes in customers.js). */
function NLMap({ custs }) {
  return (
    <div className="crm-map">
      <div className="crm-map-inner">
        <svg viewBox="0 0 100 130" className="crm-map-svg" preserveAspectRatio="none">
          <path className="crm-map-land" d="M44 8 L52 6 L58 12 L56 20 L62 22 L66 18 L70 24 L64 32 L70 40 L66 50 L72 58 L68 70 L60 80 L64 92 L56 104 L60 116 L48 124 L40 118 L44 108 L36 100 L40 88 L32 80 L38 68 L30 60 L36 50 L30 40 L38 32 L32 24 L40 20 L38 12 Z" />
        </svg>
        {custs.map((c) => {
          const a = (STATUS_META[c.status] || STATUS_META.prospect).accent;
          return (
            <button key={c.id} className="crm-pin" style={{ left: c.x + "%", top: (c.y / 1.3) + "%", "--pc": AC(a) }} title={c.name + " · " + c.city} onClick={() => openKlantCard(c.id, "de NL-kaart")}>
              <span className="crm-pin-dot" />
            </button>
          );
        })}
      </div>
      <div className="crm-map-legend">
        {Object.entries(STATUS_META).map(([k, m]) => <span key={k} className="crm-leg"><span className="crm-leg-dot" style={{ background: AC(m.accent) }} />{m.label}</span>)}
      </div>
    </div>
  );
}

/* smart signaal per klant: wat moet je hiermee? (kleur + label + icoon) */
function crmSignal(c, store) {
  if (c.status === "win-back" || c.status === "old") return { l: "Win-back kans", a: "orange", ic: "refresh" };
  if (custAttention(store, c)) return { l: "Vraagt aandacht", a: "orange", ic: "bell" };
  if (c.status === "prospect") return { l: "Opvolgen", a: "aqua", ic: "arrow" };
  if (c.deals > 0) return { l: "Lopende deal", a: "gold", ic: "chartup" };
  return { l: "Op schema", a: "green", ic: "check" };
}

export function CrmPage() {
  const store = useStore();
  const [q, setQ] = useState("");
  const [status, setStatus] = useState("");
  const [sort, setSort] = useState("aandacht");
  const custs = allCustomers(store);

  const isAtt = (c) => c.status === "win-back" || c.status === "old" || custAttention(store, c);
  const TABS = [["", "Alle"], ["active", "Actief"], ["aandacht", "Vraagt aandacht"], ["win-back", "Win-back"], ["prospect", "Prospect"]];
  const list = useMemo(() => {
    let r = custs;
    if (status === "aandacht") r = r.filter(isAtt);
    else if (status === "win-back") r = r.filter((c) => c.status === "win-back" || c.status === "old");
    else if (status) r = r.filter((c) => c.status === status);
    const term = q.toLowerCase().trim();
    if (term) r = r.filter((c) => (c.name + " " + c.contact + " " + c.city + " " + c.sector).toLowerCase().includes(term));
    const att = (c) => (c.status === "win-back" || c.status === "old" ? 1000 : 0) + (c.status === "prospect" ? 5 : custIdleMonths(store, c) * 10);
    r = [...r];
    if (sort === "aandacht") r.sort((a, b) => att(b) - att(a) || b.monthly - a.monthly);
    else if (sort === "waarde") r.sort((a, b) => b.monthly - a.monthly);
    else if (sort === "risico") r.sort((a, b) => riskValue(store, b) - riskValue(store, a) || att(b) - att(a));
    else if (sort === "naam") r.sort((a, b) => a.name.localeCompare(b.name));
    return r;
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [custs, status, q, sort]);

  const counts = { all: custs.length, active: custs.filter((c) => c.status === "active").length, prospect: custs.filter((c) => c.status === "prospect").length, wb: custs.filter((c) => c.status === "win-back" || c.status === "old").length, att: custs.filter(isAtt).length };
  const recurring = custs.filter((c) => c.status === "active").reduce((s, c) => s + c.monthly, 0);
  const atRisk = custs.reduce((s, c) => s + riskValue(store, c), 0);
  const countFor = (k) => k === "" ? counts.all : k === "active" ? counts.active : k === "aandacht" ? counts.att : k === "win-back" ? counts.wb : k === "prospect" ? counts.prospect : 0;
  const quick = (c, type) => {
    const M = { mail: ["mail", "E-mailconcept klaargezet voor " + c.name, "iris"], wa: ["wa", "WhatsApp geopend naar " + c.contact, null], call: ["call", "Belactie genoteerd voor " + c.name, null] };
    const [lt, txt, agent] = M[type];
    addCustLog(store, c.id, { type: lt, txt });
    toast(txt + (agent ? " · Iris" : ""), agent ? { agent } : { icon: "check" });
  };

  return (
    <div className="module-page sales-suite" key="crm">
      <header className="sx-hero">
        <div className="sx-hero-logo" style={{ "--acc": "var(--a-red)", "--acc-soft": "var(--a-red-soft)" }}>
          <span className="sx-hero-mark" dangerouslySetInnerHTML={{ __html: ICONS("people", { sw: 1.8 }) }} style={{ color: "var(--a-red)" }} />
        </div>
        <div className="sx-hero-id"><h1 className="sx-hero-h1">CRM</h1><p className="sx-hero-sub mono">Eén klantkaart per relatie, alles gelogd, gekoppeld aan offertes &amp; documenten</p></div>
        <div className="sx-hero-acts">
          <Btn kind="solid" accent="red" icon="plus" size="sm" onClick={() => notImplemented("Nieuwe klant aanmaken")}>Nieuwe klant</Btn>
        </div>
      </header>

      <Panel eyebrow="Op de kaart" title="Klanten in Nederland" accent="red">
        <NLMap custs={custs} />
      </Panel>

      <div className="sx-rel-tools">
        <div className="sx-search"><span dangerouslySetInnerHTML={{ __html: ICONS("search") }} /><input placeholder="Zoek op naam, plaats, sector…" value={q} onChange={(e) => setQ(e.target.value)} /></div>
        <div className="sx-tabs sm">{TABS.map(([k, lbl]) => <button key={k || "all"} className={"sx-tab sm" + (status === k ? " on" : "")} style={status === k ? { "--acc": AC("red") } : null} onClick={() => setStatus(k)}>{lbl}<span className="crm-tab-n">{countFor(k)}</span></button>)}</div>
        <div className="crm-sort">
          <span className="crm-sort-l mono">Sorteer</span>
          {[["aandacht", "Aandacht"], ["risico", "Risico"], ["waarde", "Waarde"], ["naam", "Naam"]].map(([k, l]) => <button key={k} className={"crm-sort-b" + (sort === k ? " on" : "")} onClick={() => setSort(k)}>{l}</button>)}
        </div>
      </div>

      <Panel wid="Klanten" eyebrow={list.length + " klant" + (list.length === 1 ? "" : "en") + " · " + counts.att + " vragen aandacht · " + eur(recurring) + "/mnd terugkerend · " + eur(atRisk) + " at-risk"} title="Alle relaties" accent="red" pad={false}>
        <div className="crm-table cust">
          <div className="crm-th" style={{ gridTemplateColumns: "2fr 2fr 1fr 1.3fr 1fr 1.2fr" }}>
            <span>Klant</span><span>Volgende stap</span><span style={{ textAlign: "right" }}>Waarde</span><span>Signaal</span><span>Status</span><span style={{ textAlign: "right" }}>Acties</span>
          </div>
          {list.length === 0 && <div className="sx-col-empty mono" style={{ padding: 28 }}>Geen klanten gevonden.</div>}
          {list.map((c) => {
            const att = isAtt(c);
            const nx = custNext(store, c);
            const dm = nx ? (DUE_META[nx.u] || DUE_META.later) : null;
            const sig = crmSignal(c, store);
            return (
              <div className={"crm-tr" + (att ? " att" : "")} key={c.id} style={{ gridTemplateColumns: "2fr 2fr 1fr 1.3fr 1fr 1.2fr" }} onClick={() => openKlantCard(c.id, "de CRM-lijst")}>
                <div className="crm-cellwrap">
                  <div style={{ display: "flex", alignItems: "center", gap: 10, minWidth: 0 }}>
                    <Avatar name={c.name} size={32} />
                    <div style={{ minWidth: 0 }}>
                      <div style={{ fontWeight: 650, fontSize: 13.5, color: "var(--ink)", overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>{c.name}</div>
                      <div className="mono" style={{ fontSize: 11, color: "var(--ink3)" }}>{c.contact} · {c.city}</div>
                    </div>
                  </div>
                </div>
                <div className="crm-cellwrap">
                  {nx ? (
                    <div style={{ minWidth: 0 }}>
                      <div style={{ fontSize: 13, color: "var(--ink)", overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>{nx.txt}</div>
                      <span className="mono" style={{ fontSize: 11, color: AC(dm.a) }}>{nx.due}</span>
                    </div>
                  ) : <span className="mono" style={{ fontSize: 12, color: "var(--ink3)" }}>geen actie gepland</span>}
                </div>
                <div className="crm-cellwrap r" style={{ textAlign: "right" }}>
                  {c.monthly > 0 ? <b className="mono" style={{ color: "var(--ink)" }}>{eur(c.monthly)}<span style={{ color: "var(--ink3)", fontWeight: 400 }}>/mnd</span></b> : <span className="mono" style={{ color: "var(--ink3)" }}>—</span>}
                </div>
                <div className="crm-cellwrap">
                  <span style={{ display: "inline-flex", alignItems: "center", gap: 5, fontSize: 12, fontWeight: 600, padding: "3px 9px", borderRadius: 999, color: AC(sig.a), background: ACsoft(sig.a) }}>
                    <span style={{ display: "inline-flex", width: 13, height: 13 }} dangerouslySetInnerHTML={{ __html: ICONS(sig.ic, { sw: 2 }) }} />{sig.l}
                  </span>
                </div>
                <div className="crm-cellwrap"><StatusDot status={c.status} /></div>
                <div className="crm-cellwrap r" style={{ textAlign: "right" }} onClick={(e) => e.stopPropagation()}>
                  <div style={{ display: "inline-flex", gap: 6, justifyContent: "flex-end" }}>
                    <button className="sx-act red" title="E-mail" onClick={() => quick(c, "mail")}><span dangerouslySetInnerHTML={{ __html: ICONS("gm") }} /></button>
                    <button className="sx-act green" title="WhatsApp" onClick={() => quick(c, "wa")}><span dangerouslySetInnerHTML={{ __html: ICONS("wa") }} /></button>
                    <button className="sx-act navy" title="Bel" onClick={() => quick(c, "call")}><span dangerouslySetInnerHTML={{ __html: ICONS("phone") }} /></button>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      </Panel>
    </div>
  );
}
