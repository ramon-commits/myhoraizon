/* ============================================================
   Gedeelde klantkaart (clientfull.jsx). EEN component die overal opent:
   Inbox-gesprek, Pipeline-kaart, CRM-lijst -> allemaal via openKlantCard ->
   crm.full -> ClientFullHost rendert deze overlay. Bedrijf (CompanyFull,
   met contactpersonen) of particulier (PersonFull). Letterlijk uit de
   blauwdruk; ESM-port. Demo-data uit customers.js/sales.jsx.
   ============================================================ */
import React from 'react'
import ReactDOM from 'react-dom'
import { ICONS } from './icons'
import { KYANO } from './data'
import { setState, useStore, toast } from './store.jsx'
import { AC, ACsoft, Avatar, Btn } from './components.jsx'
import { ObjectActions } from './objectactions.jsx'
import { allCustomers } from './customers.js'
import { StatusDot, STATUS_META, custKind, custContacts, addCustContact, custKvk, custLegal, custAddress, custWebsite, custDeal, custNext, setCustNext, DUE_META, eur, addCustLog, buildSeedTimeline, LOG_AC, LOG_IC } from './sales.jsx'

const { useState: useStateCF, useEffect: useEffectCF } = React;

/* ---------- live-status + relatie-taken per persoon ----------
   Een bedrijf heeft meerdere medewerkers; per persoon houden we bij of
   die nog 'live' is (in dienst/bereikbaar) en hangen we relatie-taken op.
   Bij een particulier is er één persoon (de klant zelf). */
const LIVE_META = {
  live:         { label: "Actief",       sub: "Werkt hier · bereikbaar",       col: "var(--a-green)",  bg: "color-mix(in oklab,var(--a-green) 14%,transparent)" },
  weg:          { label: "Uit dienst",   sub: "Werkt hier niet meer",          col: "#94a3b8",         bg: "rgba(148,163,184,.16)" },
  onbereikbaar: { label: "Onbereikbaar", sub: "Nog geen reactie ontvangen",    col: "var(--a-orange)", bg: "color-mix(in oklab,var(--a-orange) 14%,transparent)" },
};
function ctKey(c, p) { return c.id + "|" + (p.name || ""); }
function ctLive(store, c, p) {
  const v = store.get("sales.clive." + ctKey(c, p), null);
  if (v) return v;
  if (p.live) return p.live;
  if (p.primary) return "live";
  let h = 0; for (const ch of (p.name || "")) h = (h * 31 + ch.charCodeAt(0)) >>> 0;
  const r = h % 10; return r < 8 ? "live" : (r === 8 ? "weg" : "onbereikbaar");
}
function setCtLive(store, c, p, v) { setState("sales.clive." + ctKey(c, p), v); }
function ctTasks(store, c, p) { return store.get("sales.ctask." + ctKey(c, p), p.seedTasks || []); }
function addCtTask(store, c, p, txt) { setState("sales.ctask." + ctKey(c, p), [{ txt, done: false, when: "zojuist" }, ...ctTasks(store, c, p)]); }
function toggleCtTask(store, c, p, i) { const cur = [...ctTasks(store, c, p)]; cur[i] = { ...cur[i], done: !cur[i].done }; setState("sales.ctask." + ctKey(c, p), cur); }
function custLogCF(store, id) { return store.get("sales.log." + id, []); }

/* persoon afgeleid uit een particulier-klant */
function personFromCust(c) {
  return { name: c.name, role: "Particulier", email: c.email, phone: c.phone, primary: true, seedTasks: c.seedTasks || [] };
}

/* gedeelde tijdlijn + documenten (zelfde bron als bedrijf) */
function cfTimeline(store, c) {
  const log = custLogCF(store, c.id);
  const seed = c.seedLog || buildSeedTimeline(c);
  return [...log, ...seed];
}
function cfDocs(c) {
  return [
    ...(c.deals > 0 ? [{ kind: "Offerte", name: custKind(c) === "particulier" ? "Sloep-arrangement op maat" : "Kyano Business-arrangement", when: "deze maand", accent: "gold" }] : []),
    ...(c.status === "active" ? [{ kind: "Contract", name: custKind(c) === "particulier" ? "Boekingsbevestiging 2026" : "Jaarafspraak 2026", when: c.since, accent: "green" }] : []),
  ];
}

/* ---------- Volgende stap: één afgesproken vervolgactie + termijn per relatie ---------- */
function NextStepCard({ cust, store }) {
  const nx = custNext(store, cust);
  const [editing, setEditing] = useStateCF(!nx);
  const [txt, setTxt] = useStateCF(nx ? nx.txt : "");
  const [due, setDue] = useStateCF(nx ? { due: nx.due, u: nx.u } : { due: "deze week", u: "soon" });
  const PRESETS = [["vandaag", "today"], ["morgen", "soon"], ["deze week", "soon"], ["volgende week", "later"], ["deze maand", "later"]];
  const dm = nx ? (DUE_META[nx.u] || DUE_META.later) : DUE_META.later;
  const save = () => {
    if (!txt.trim()) { toast("Omschrijf de volgende stap", { icon: "close", kind: "muted" }); return; }
    setCustNext(store, cust, { txt: txt.trim(), due: due.due, u: due.u });
    toast("Volgende stap gepland · " + due.due, { icon: "check" });
    setEditing(false);
  };
  const done = () => {
    addCustLog(store, cust.id, { type: "done", txt: "Afgerond: " + nx.txt });
    setCustNext(store, cust, null);
    toast("Stap afgerond, plan de volgende", { icon: "check" });
    setTxt(""); setDue({ due: "deze week", u: "soon" }); setEditing(true);
  };
  return (
    <section className="cf-card cf-next">
      <div className="cf-card-head"><h2 className="cf-card-h">Volgende stap</h2>{nx && !editing && <button className="cf-next-edit" onClick={() => { setTxt(nx.txt); setDue({ due: nx.due, u: nx.u }); setEditing(true); }}>Wijzig</button>}</div>
      {(!editing && nx) ? (
        <div className="cf-next-view">
          <div className="cf-next-main"><span className="cf-next-dot" style={{ background: AC(dm.a) }} /><span className="cf-next-txt">{nx.txt}</span></div>
          <div className="cf-next-row"><span className="cf-next-due" style={{ color: AC(dm.a), background: ACsoft(dm.a) }}><span dangerouslySetInnerHTML={{ __html: ICONS(dm.ic, { sw: 2 }) }} />{nx.due}</span><button className="cf-next-done" onClick={done}><span dangerouslySetInnerHTML={{ __html: ICONS("check", { sw: 2.4 }) }} />Afgerond</button></div>
        </div>
      ) : (
        <div className="cf-next-edit-body">
          <input className="cf-in" autoFocus placeholder="Wat is de volgende actie?" value={txt} onChange={(e) => setTxt(e.target.value)} onKeyDown={(e) => { if (e.key === "Enter") save(); }} />
          <div className="cf-next-presets">{PRESETS.map(([d, u]) => <button key={d} className={"cf-next-preset" + (due.due === d ? " on" : "")} onClick={() => setDue({ due: d, u })}>{d}</button>)}</div>
          <div className="cf-next-edit-acts">{nx && <Btn kind="ghost" size="sm" onClick={() => setEditing(false)}>Annuleer</Btn>}<Btn kind="solid" accent="red" icon="check" size="sm" onClick={save}>Plannen</Btn></div>
        </div>
      )}
    </section>
  );
}

/* ---------- Tijdlijn met inline composer: leg elk contactmoment vast ---------- */
function CfTimelineCard({ cust, store }) {
  const fullLog = cfTimeline(store, cust);
  const [type, setType] = useStateCF("note");
  const [txt, setTxt] = useStateCF("");
  const TYPES = [["note", "Notitie"], ["mail", "Mail"], ["call", "Beld"], ["wa", "App"], ["meeting", "Gesprek"]];
  const add = () => {
    if (!txt.trim()) return;
    addCustLog(store, cust.id, { type, txt: txt.trim() });
    toast("Toegevoegd aan tijdlijn", { icon: "check" });
    setTxt("");
  };
  return (
    <section className="cf-card">
      <div className="cf-card-head"><h2 className="cf-card-h">Tijdlijn</h2><span className="cf-card-n mono">{fullLog.length}</span></div>
      <div className="cf-logadd">
        <div className="cf-logadd-types">{TYPES.map(([k, l]) => <button key={k} className={"cf-logadd-type" + (type === k ? " on" : "")} style={type === k ? { color: AC(LOG_AC[k]), background: ACsoft(LOG_AC[k]), borderColor: "transparent" } : null} onClick={() => setType(k)}><span dangerouslySetInnerHTML={{ __html: ICONS(LOG_IC[k], { sw: 2 }) }} />{l}</button>)}</div>
        <div className="cf-logadd-row"><input className="cf-in" placeholder="Leg een contactmoment of notitie vast…" value={txt} onChange={(e) => setTxt(e.target.value)} onKeyDown={(e) => { if (e.key === "Enter") add(); }} /><button className="cf-rt-go" onClick={add} style={{ color: AC("red") }} dangerouslySetInnerHTML={{ __html: ICONS("plus", { sw: 2.2 }) }} /></div>
      </div>
      <div className="cf-log">
        {fullLog.map((l, i) => (
          <div className="cf-log-row" key={i}>
            <span className="cf-log-ic" style={{ color: AC(LOG_AC[l.type] || "navy"), background: ACsoft(LOG_AC[l.type] || "navy") }} dangerouslySetInnerHTML={{ __html: ICONS(LOG_IC[l.type] || "dot") }} />
            <div className="cf-log-main"><div className="cf-log-txt">{l.txt}</div><div className="cf-log-when mono">{l.when}</div></div>
          </div>
        ))}
      </div>
    </section>
  );
}

/* ============================================================
   PersonFull, kaart van één persoon (contactpersoon óf particulier)
   ============================================================ */
function PersonFull({ cust, contact, store, onClose, onOpen, onBackToCompany, onSwitchPerson, colleagues }) {
  const ct = contact;
  const isParticulier = custKind(cust) === "particulier";
  const live = ctLive(store, cust, ct);
  const lm = LIVE_META[live];
  const taskList = ctTasks(store, cust, ct);
  const [taskDraft, setTaskDraft] = useStateCF("");
  const docs = cfDocs(cust);
  const act = (type, txt, agent) => { addCustLog(store, cust.id, { type, txt }); toast(txt + (agent ? " · " + KYANO.agents[agent].name : ""), agent ? { agent } : { icon: "check" }); };

  return (
    <div className="cf-scroll" key={ctKey(cust, ct)}>
      <header className="cf-hero">
        <span className="cf-contact-av"><Avatar name={ct.name} size={64} /><span className="cf-live-dot xl" style={{ background: lm.col }} /></span>
        <div className="cf-hero-id">
          <div className="cf-hero-row">
            {isParticulier
              ? <span className="cf-sector" style={{ color: AC("aqua"), background: ACsoft("aqua") }}>Particulier</span>
              : <button className="cf-backlink" onClick={onBackToCompany}><span className="cf-backlink-ic" dangerouslySetInnerHTML={{ __html: ICONS("box", { sw: 1.8 }) }} />{cust.name}<span className="cf-backlink-go" dangerouslySetInnerHTML={{ __html: ICONS("arrow", { sw: 2 }) }} /></button>}
            <span className="cf-live-chip" style={{ color: lm.col, background: live === "weg" ? lm.bg : "color-mix(in oklab," + lm.col + " 13%,transparent)" }}><span className="cf-live-chip-dot" style={{ background: lm.col }} />{lm.label}</span>
          </div>
          <h1 className="cf-name">{ct.name}</h1>
          <div className="cf-person-sub mono">{ct.role}{ct.primary && !isParticulier ? " · primair contact" : ""}{isParticulier ? "" : " bij " + cust.name}</div>
        </div>
        <div className="cf-hero-val">
          {isParticulier
            ? <span className="cf-val-prospect mono">{cust.occasion || "Particuliere klant"}</span>
            : <><span className="cf-val-role" style={{ color: AC("navy") }}>{ct.primary ? "Hoofdcontact" : "Contactpersoon"}</span><span className="cf-val-unit mono">{cust.sector}</span></>}
        </div>
      </header>

      <div className="cf-grid">
        <div className="cf-main">
          {(isParticulier && cust.iris) && (
            <section className="cf-card cf-iris">
              <div className="cf-iris-head"><Avatar agent="iris" size={26} /><span className="cf-iris-pill">Iris-analyse</span></div>
              <p className="cf-iris-txt">{cust.iris}</p>
            </section>
          )}

          <section className="cf-card">
            <div className="cf-card-head"><h2 className="cf-card-h">Contactgegevens</h2></div>
            <div className="cf-person-fields">
              {ct.email && <a className="cf-pf" href={"mailto:" + ct.email}><span className="cf-pf-ic" dangerouslySetInnerHTML={{ __html: ICONS("gm") }} /><div className="cf-pf-tx"><span className="cf-pf-l mono">E-mail</span><span className="cf-pf-v">{ct.email}</span></div></a>}
              {ct.phone && <a className="cf-pf" href={"tel:" + ct.phone}><span className="cf-pf-ic" dangerouslySetInnerHTML={{ __html: ICONS("phone") }} /><div className="cf-pf-tx"><span className="cf-pf-l mono">Telefoon</span><span className="cf-pf-v">{ct.phone}</span></div></a>}
              {isParticulier && custAddress(cust) && <div className="cf-pf static"><span className="cf-pf-ic" dangerouslySetInnerHTML={{ __html: ICONS("pin") }} /><div className="cf-pf-tx"><span className="cf-pf-l mono">Adres</span><span className="cf-pf-v">{custAddress(cust)}</span></div></div>}
            </div>
            <div className="cf-person-acts">
              <Btn kind="solid" accent="red" icon="gm" size="sm" onClick={() => act("mail", "E-mailconcept gegenereerd voor " + ct.name, "iris")}>E-mail</Btn>
              <Btn kind="soft" accent="green" icon="wa" size="sm" onClick={() => act("wa", "WhatsApp geopend naar " + ct.name)}>WhatsApp</Btn>
              <Btn kind="soft" accent="navy" icon="phone" size="sm" onClick={() => act("call", "Belactie genoteerd voor " + ct.name)}>Bel</Btn>
            </div>
            {<ObjectActions only={["assign", "vandaag"]} className="cf-objacts" obj={{ type: "klant", key: "cust:" + cust.id, title: cust.name, custId: cust.id, custName: cust.name }} />}
          </section>

          <CfTimelineCard cust={cust} store={store} />

          {isParticulier && docs.length > 0 && (
            <section className="cf-card">
              <div className="cf-card-head"><h2 className="cf-card-h">Documenten</h2><span className="cf-card-n mono">{docs.length}</span></div>
              <div className="cf-docs">
                {docs.map((d, i) => (
                  <button className="cf-doc" key={i} onClick={() => { onClose(); onOpen && onOpen(d.kind === "Offerte" ? "offertes" : "contracten"); }}>
                    <span className="cf-doc-ic" style={{ color: AC(d.accent), background: ACsoft(d.accent) }} dangerouslySetInnerHTML={{ __html: ICONS(d.kind === "Offerte" ? "doc" : "docpen") }} />
                    <div className="cf-doc-main"><div className="cf-doc-name">{d.name}</div><div className="cf-doc-sub mono">{d.kind} · {d.when}</div></div>
                    <span className="cf-doc-chev" dangerouslySetInnerHTML={{ __html: ICONS("arrow") }} />
                  </button>
                ))}
              </div>
            </section>
          )}
        </div>

        <aside className="cf-aside">
          <NextStepCard cust={cust} store={store} />
          <section className="cf-card cf-person">
            <div className="cf-live-row">
              <span className="cf-live-lbl mono">{isParticulier ? "Status klant" : "Status medewerker"}</span>
              <div className="cf-live-seg">
                {["live", "weg", "onbereikbaar"].map((s) => (
                  <button key={s} className={"cf-live-opt" + (live === s ? " on" : "")} style={live === s ? { color: "#fff", background: LIVE_META[s].col, borderColor: LIVE_META[s].col } : null} onClick={() => { setCtLive(store, cust, ct, s); toast(ct.name + " → " + LIVE_META[s].label, { icon: s === "live" ? "check" : "bell" }); }}>{LIVE_META[s].label}</button>
                ))}
              </div>
              <div className="cf-live-sub mono">{lm.sub}</div>
            </div>
            {live !== "live" && <div className="cf-person-warn" style={{ color: lm.col, background: lm.bg }}><span dangerouslySetInnerHTML={{ __html: ICONS("bell") }} />{live === "weg" ? (isParticulier ? "Deze klant is niet meer actief." : "Deze persoon werkt hier niet meer, zoek een nieuwe contactpersoon.") : "Nog geen reactie ontvangen, probeer een ander kanaal."}</div>}

            <div className="cf-rt">
              <div className="cf-rt-head"><span className="cf-rt-h">Relatie-taken</span>{taskList.length > 0 && <span className="cf-card-n mono">{taskList.filter((t) => !t.done).length} open</span>}</div>
              <div className="cf-rt-list">
                {taskList.length === 0 && <div className="cf-rt-empty mono">Nog geen taken voor {ct.name.split(" ")[0]}.</div>}
                {taskList.map((t, i) => (
                  <div className={"cf-rt-row" + (t.done ? " done" : "")} key={i}>
                    <button className="cf-rt-check" onClick={() => toggleCtTask(store, cust, ct, i)} aria-label="Afvinken">{t.done && <span dangerouslySetInnerHTML={{ __html: ICONS("check", { sw: 2.6 }) }} />}</button>
                    <span className="cf-rt-txt">{t.txt}</span>
                    <span className="cf-rt-when mono">{t.when}</span>
                  </div>
                ))}
              </div>
              <div className="cf-rt-add">
                <input className="cf-in" placeholder={"Relatie-taak voor " + ct.name.split(" ")[0] + "…"} value={taskDraft} onChange={(e) => setTaskDraft(e.target.value)} onKeyDown={(e) => { if (e.key === "Enter" && taskDraft.trim()) { addCtTask(store, cust, ct, taskDraft.trim()); toast("Relatie-taak toegevoegd voor " + ct.name, { icon: "check" }); setTaskDraft(""); } }} />
                <button className="cf-rt-go" onClick={() => { if (taskDraft.trim()) { addCtTask(store, cust, ct, taskDraft.trim()); toast("Relatie-taak toegevoegd voor " + ct.name, { icon: "check" }); setTaskDraft(""); } }} style={{ color: AC("red") }} dangerouslySetInnerHTML={{ __html: ICONS("plus", { sw: 2.2 }) }} />
              </div>
            </div>
          </section>

          {!isParticulier && (
            <section className="cf-card">
              <div className="cf-card-head"><h2 className="cf-card-h">Bedrijf</h2></div>
              <button className="cf-company-link" onClick={onBackToCompany}>
                <Avatar name={cust.name} size={38} />
                <div className="cf-company-link-tx"><div className="cf-company-link-name">{cust.name}</div><div className="cf-company-link-sub mono">{cust.sector} · {cust.city}</div></div>
                <span className="cf-doc-chev" dangerouslySetInnerHTML={{ __html: ICONS("arrow") }} />
              </button>
              {colleagues && colleagues.length > 0 && (<>
                <div className="cf-coll-lbl mono">Andere contactpersonen</div>
                <div className="cf-contacts">
                  {colleagues.map((p) => {
                    const lv = ctLive(store, cust, p); const cm = LIVE_META[lv];
                    return (
                      <button key={ctKey(cust, p)} className={"cf-contact" + (lv !== "live" ? " is-off" : "")} onClick={() => onSwitchPerson(p)}>
                        <span className="cf-contact-av"><Avatar name={p.name} size={32} /><span className="cf-live-dot" style={{ background: cm.col }} /></span>
                        <div className="cf-contact-tx"><div className="cf-contact-name">{p.name}{p.primary && <span className="cf-prim">primair</span>}</div><div className="cf-contact-role mono">{p.role}</div></div>
                        <span className="cf-doc-chev" dangerouslySetInnerHTML={{ __html: ICONS("arrow") }} />
                      </button>
                    );
                  })}
                </div>
              </>)}
            </section>
          )}
        </aside>
      </div>
    </div>
  );
}

/* ============================================================
   CompanyFull, bedrijfskaart met contactpersonen
   ============================================================ */
function CompanyFull({ c, store, onClose, onOpen, onOpenPerson }) {
  const contacts = custContacts(c, store);
  const [adding, setAdding] = useStateCF(false);
  const [nc, setNc] = useStateCF({ name: "", role: "", email: "", phone: "" });
  const m = STATUS_META[c.status] || STATUS_META.prospect;
  const years = c.since ? (2026 - c.since) : null;
  const docs = cfDocs(c);
  const deal = custDeal(store, c);
  const liveCount = contacts.filter((p) => ctLive(store, c, p) === "live").length;
  const act = (type, txt, agent) => { addCustLog(store, c.id, { type, txt }); toast(txt + (agent ? " · " + KYANO.agents[agent].name : ""), agent ? { agent } : { icon: "check" }); };
  const saveContact = () => {
    if (!nc.name.trim()) { toast("Vul een naam in", { icon: "close", kind: "muted" }); return; }
    addCustContact(store, c.id, { name: nc.name, role: nc.role || "Contactpersoon", email: nc.email, phone: nc.phone });
    toast(nc.name + " toegevoegd als contactpersoon", { icon: "check" });
    setNc({ name: "", role: "", email: "", phone: "" }); setAdding(false);
  };
  const meta = [
    ["KvK", custKvk(c)],
    ["Rechtsvorm", custLegal(c)],
    ["Adres", custAddress(c)],
    custWebsite(c) ? ["Website", custWebsite(c)] : null,
    ["Klant sinds", c.since ? c.since + (years ? " · " + years + " jr" : "") : "–"],
    ["Medewerkers", c.employees],
  ].filter(Boolean);

  return (
    <div className="cf-scroll">
      <header className="cf-hero">
        <Avatar name={c.name} size={64} />
        <div className="cf-hero-id">
          <div className="cf-hero-row">
            <span className="cf-sector" style={{ color: AC("red"), background: ACsoft("red") }}>{c.sector}</span>
            <StatusDot status={c.status} />
          </div>
          <h1 className="cf-name">{c.name}</h1>
          <div className="cf-meta">
            {meta.map(([k, v]) => <div className="cf-meta-i" key={k}><span className="cf-meta-l mono">{k}</span><span className="cf-meta-v">{v}</span></div>)}
          </div>
        </div>
        <div className="cf-hero-val">
          {c.monthly > 0
            ? (<><span className="cf-val-big">{eur(c.monthly)}</span><span className="cf-val-unit mono">per maand</span><span className="cf-val-yr mono">{eur(c.monthly * 12)} per jaar</span></>)
            : <span className="cf-val-prospect mono">Nog geen omzet, {m.label.toLowerCase()}</span>}
          {deal && <span className="cf-val-deal" style={{ color: AC("gold"), background: ACsoft("gold") }}><span dangerouslySetInnerHTML={{ __html: ICONS("chartup", { sw: 2 }) }} />Lopende deal {eur(deal.value)}</span>}
        </div>
      </header>

      <div className="cf-grid">
        <div className="cf-main">
          {c.iris && (
            <section className="cf-card cf-iris">
              <div className="cf-iris-head"><Avatar agent="iris" size={26} /><span className="cf-iris-pill">Iris-analyse</span></div>
              <p className="cf-iris-txt">{c.iris}</p>
              {c.churn && <div className="cf-iris-churn"><b>Vermoedelijke reden:</b> {c.churn}</div>}
            </section>
          )}

          <CfTimelineCard cust={c} store={store} />

          <section className="cf-card">
            <div className="cf-card-head"><h2 className="cf-card-h">Documenten</h2><span className="cf-card-n mono">{docs.length}</span></div>
            {docs.length === 0 ? <div className="cf-empty mono">Nog geen documenten gekoppeld.</div> : (
              <div className="cf-docs">
                {docs.map((d, i) => (
                  <button className="cf-doc" key={i} onClick={() => { onClose(); onOpen && onOpen(d.kind === "Offerte" ? "offertes" : "contracten"); }}>
                    <span className="cf-doc-ic" style={{ color: AC(d.accent), background: ACsoft(d.accent) }} dangerouslySetInnerHTML={{ __html: ICONS(d.kind === "Offerte" ? "doc" : "docpen") }} />
                    <div className="cf-doc-main"><div className="cf-doc-name">{d.name}</div><div className="cf-doc-sub mono">{d.kind} · {d.when}</div></div>
                    <span className="cf-doc-chev" dangerouslySetInnerHTML={{ __html: ICONS("arrow") }} />
                  </button>
                ))}
              </div>
            )}
          </section>
        </div>

        <aside className="cf-aside">
          <NextStepCard cust={c} store={store} />
          <section className="cf-card">
            <div className="cf-card-head"><h2 className="cf-card-h">Contactpersonen</h2><span className="cf-card-n mono">{liveCount}/{contacts.length} actief</span></div>
            <div className="cf-coll-hint mono">Open een persoon voor de volledige contactkaart.</div>
            <div className="cf-contacts">
              {contacts.map((p, i) => {
                const lv = ctLive(store, c, p); const lm2 = LIVE_META[lv];
                const tn = ctTasks(store, c, p).filter((t) => !t.done).length;
                return (
                  <button key={i} className={"cf-contact nav" + (lv !== "live" ? " is-off" : "")} onClick={() => onOpenPerson(i)}>
                    <span className="cf-contact-av"><Avatar name={p.name} size={32} /><span className="cf-live-dot" style={{ background: lm2.col }} title={lm2.label} /></span>
                    <div className="cf-contact-tx">
                      <div className="cf-contact-name">{p.name}{p.primary && <span className="cf-prim">primair</span>}</div>
                      <div className="cf-contact-role mono">{p.role}{lv !== "live" ? " · " + lm2.label.toLowerCase() : ""}</div>
                    </div>
                    {tn > 0 && <span className="cf-contact-tn" style={{ color: AC("red"), background: ACsoft("red") }}>{tn}</span>}
                    <span className="cf-doc-chev" dangerouslySetInnerHTML={{ __html: ICONS("arrow") }} />
                  </button>
                );
              })}
            </div>
            {adding ? (
              <div className="cf-addform">
                <input className="cf-in" placeholder="Naam" value={nc.name} onChange={(e) => setNc({ ...nc, name: e.target.value })} />
                <input className="cf-in" placeholder="Rol (bv. Inkoop)" value={nc.role} onChange={(e) => setNc({ ...nc, role: e.target.value })} />
                <input className="cf-in" placeholder="E-mail" value={nc.email} onChange={(e) => setNc({ ...nc, email: e.target.value })} />
                <input className="cf-in" placeholder="Telefoon" value={nc.phone} onChange={(e) => setNc({ ...nc, phone: e.target.value })} />
                <div className="cf-addform-acts"><Btn kind="ghost" size="sm" onClick={() => setAdding(false)}>Annuleer</Btn><Btn kind="solid" accent="red" icon="check" size="sm" onClick={saveContact}>Opslaan</Btn></div>
              </div>
            ) : (
              <button className="cf-add" onClick={() => setAdding(true)}><span dangerouslySetInnerHTML={{ __html: ICONS("plus", { sw: 2 }) }} />Medewerker toevoegen</button>
            )}
          </section>

          <section className="cf-card cf-person">
            <div className="cf-card-head"><h2 className="cf-card-h">Snelle actie</h2></div>
            <div className="cf-person-acts">
              <Btn kind="solid" accent="red" icon="gm" size="sm" onClick={() => act("mail", "E-mailconcept gegenereerd voor " + c.name, "iris")}>E-mail</Btn>
              <Btn kind="soft" accent="green" icon="wa" size="sm" onClick={() => act("wa", "WhatsApp geopend naar " + c.contact)}>WhatsApp</Btn>
              <Btn kind="soft" accent="navy" icon="phone" size="sm" onClick={() => act("call", "Belactie genoteerd voor " + c.name)}>Bel</Btn>
              {onOpen && <Btn kind="tint" accent="gold" icon="doc" size="sm" onClick={() => { onClose(); onOpen("offertes"); }}>Offerte</Btn>}
            </div>
            {<ObjectActions only={["assign", "vandaag"]} className="cf-objacts" obj={{ type: "klant", key: "cust:" + c.id, title: c.name, custId: c.id, custName: c.name }} />}
          </section>
        </aside>
      </div>
    </div>
  );
}

/* ============================================================
   ClientFullView, bepaalt soort + regelt navigatie bedrijf↔persoon
   ============================================================ */
function ClientFullView({ id, onClose, onOpen }) {
  const store = useStore();
  const c = allCustomers(store).find((x) => x.id === id);
  const isParticulier = c ? custKind(c) === "particulier" : false;
  const contacts = c && !isParticulier ? custContacts(c, store) : [];
  // welke persoon staat open binnen een bedrijf (null = bedrijfskaart)
  const [personIdx, setPersonIdx] = useStateCF(null);

  useEffectCF(() => {
    const k = (e) => { if (e.key === "Escape") { if (personIdx !== null && !isParticulier) setPersonIdx(null); else onClose(); } };
    window.addEventListener("keydown", k); return () => window.removeEventListener("keydown", k);
  }, [onClose, personIdx, isParticulier]);
  useEffectCF(() => { document.body.style.overflow = "hidden"; return () => { document.body.style.overflow = ""; }; }, []);

  if (!c) return null;

  const showPerson = isParticulier || personIdx !== null;
  const personContact = isParticulier ? personFromCust(c) : (contacts[personIdx] || contacts[0]);
  const colleagues = isParticulier ? [] : contacts.filter((_, i) => i !== personIdx);
  const crumb = showPerson ? (isParticulier ? "CRM · Particulier" : "CRM · Contactpersoon") : "CRM · Bedrijfskaart";
  const backLabel = (showPerson && !isParticulier) ? "Terug naar bedrijf" : "Terug naar CRM";
  const onBack = () => { if (showPerson && !isParticulier) setPersonIdx(null); else onClose(); };
  // bar-acties richten zich op de actieve kaart (persoon of bedrijf)
  const barTarget = showPerson ? personContact.name : c.name;
  const act = (type, txt, agent) => { addCustLog(store, c.id, { type, txt }); toast(txt + (agent ? " · " + KYANO.agents[agent].name : ""), agent ? { agent } : { icon: "check" }); };

  return ReactDOM.createPortal((
    <div className="cf-root">
      <div className="cf-bar">
        <button className="cf-back" onClick={onBack}><span dangerouslySetInnerHTML={{ __html: ICONS("arrow", { sw: 2 }) }} style={{ transform: "rotate(180deg)", display: "inline-flex" }} />{backLabel}</button>
        <div className="cf-bar-crumb mono">{crumb}{showPerson && !isParticulier ? " · " + c.name : ""}</div>
        <div className="cf-bar-acts">
          <Btn kind="solid" accent="red" icon="gm" size="sm" onClick={() => act("mail", "E-mailconcept gegenereerd voor " + barTarget, "iris")}>E-mail</Btn>
          <Btn kind="soft" accent="green" icon="wa" size="sm" onClick={() => act("wa", "WhatsApp geopend naar " + barTarget)}>WhatsApp</Btn>
          <Btn kind="soft" accent="navy" icon="phone" size="sm" onClick={() => act("call", "Belactie genoteerd voor " + barTarget)}>Bel</Btn>
          {onOpen && <Btn kind="tint" accent="gold" icon="doc" size="sm" onClick={() => { onClose(); onOpen("offertes"); }}>Offerte</Btn>}
          <button className="cf-x" onClick={onClose} aria-label="Sluiten"><span dangerouslySetInnerHTML={{ __html: ICONS("close", { sw: 2.2 }) }} /></button>
        </div>
      </div>

      {showPerson
        ? <PersonFull cust={c} contact={personContact} store={store} onClose={onClose} onOpen={onOpen} onBackToCompany={() => setPersonIdx(null)} onSwitchPerson={(p) => setPersonIdx(contacts.findIndex((x) => x.name === p.name))} colleagues={colleagues} />
        : <CompanyFull c={c} store={store} onClose={onClose} onOpen={onOpen} onOpenPerson={(i) => setPersonIdx(i)} />}
    </div>
  ), document.body);
}

/* host: staat 1x in de app, leest crm.full uit de store */
function ClientFullHost({ onOpen }) {
  const store = useStore();
  const id = store.get("crm.full", null);
  if (!id) return null;
  return <ClientFullView id={id} onClose={() => setState("crm.full", null)} onOpen={onOpen} />;
}


export { ClientFullHost, ClientFullView };
