/* ============================================================
   ObjectActions — één gedeelde basis-laag met de vier koppelingen
   die op ELK object kunnen zitten dat een klant, taak of activiteit
   heeft (taak, inbox-gesprek, afspraak, deal, offerte, contract,
   factuur, klant). Bundelt de bestaande losse acties zodat ze niet
   langer per module apart worden ingebouwd:

   1. Ga naar klant  → opent ALTIJD de gedeelde klantkaart via
                       setState("crm.full", id) (nooit een eigen paneel)
   2. Wijs toe aan…  → ALTIJD de bestaande gedeelde AssignAction
                       (met het cascade-toewijs-recht)
   3. Naar Vandaag   → maakt ALTIJD een eigen taak in user.tasks,
                       gekoppeld aan klant/object (verschijnt in
                       Vandaag én de taken-log)
   4. Loggen         → elke actie logt via het bestaande logToCustomer
                       met wie het deed en wanneer

   Input (uniform):
     obj = { key, type, title, custId?, custName?, agent?, accent? }
   Toont alleen de koppelingen die voor dat objecttype zinvol zijn;
   met `only={[...]}` kun je dat per plek nog beperken.
   ============================================================ */
import { ICONS } from './icons'
import { useStore, setState, getState, toast } from './store.jsx'
import { AssignAction, currentActor, asgFirst, logToCustomer, logToMember } from './assign.jsx'

/* welke van de vier per objecttype zinvol zijn */
const OBJ_TYPES = {
  task:         { klant: true, assign: true, vandaag: false },
  conversation: { klant: true, assign: true, vandaag: true },
  event:        { klant: true, assign: true, vandaag: true },
  deal:         { klant: true, assign: true, vandaag: true },
  offerte:      { klant: true, assign: true, vandaag: true },
  contract:     { klant: true, assign: true, vandaag: true },
  factuur:      { klant: true, assign: true, vandaag: true },
  klant:        { klant: false, assign: true, vandaag: true },
  _default:     { klant: true, assign: true, vandaag: true },
};
const OBJ_LABEL = { task: "taak", conversation: "gesprek", event: "afspraak", deal: "deal", offerte: "offerte", contract: "contract", factuur: "factuur", klant: "klant" };
const OBJ_VERB = { event: "Voorbereiden", deal: "Opvolgen", offerte: "Opvolgen", contract: "Nalopen", factuur: "Opvolgen", conversation: "Opvolgen", klant: "Opvolgen", task: "Opvolgen", _default: "Opvolgen" };

function oaActor() { return currentActor() || { name: "Iemand" }; }
function oaFirst() { const a = oaActor(); return asgFirst(a.name); }

/* ── gedeelde helpers, ook los bruikbaar door modules ── */
function openKlantCard(custId, fromLabel) {
  if (!custId) return;
  // Opent de gedeelde klantkaart (ClientFullHost luistert op crm.full).
  setState("crm.full", custId);
  logToCustomer(custId, oaFirst() + " opende de klantkaart" + (fromLabel ? " vanuit " + fromLabel : ""));
}
function sendObjectToVandaag(obj) {
  const verb = OBJ_VERB[obj.type] || OBJ_VERB._default;
  const title = verb + ": " + (obj.title || OBJ_LABEL[obj.type] || "taak");
  const task = {
    id: "ut" + Date.now(), title, note: obj.note || "", due: "vandaag", from: obj.type || "app",
    accent: obj.accent || "navy", done: false, custId: obj.custId || null, custName: obj.custName || null,
    mod: obj.mod || null, assignedTo: null,
  };
  setState("user.tasks", [task, ...getState("user.tasks", [])]);
  const a = oaActor();
  if (a.id) logToMember(a.id, { txt: "In Vandaag gezet: " + title, icon: "check", accent: "navy" });
  if (obj.custId) logToCustomer(obj.custId, oaFirst() + " zette in Vandaag: \u201C" + title + "\u201D");
  toast("Toegevoegd aan Vandaag", { icon: "check", agent: "iris" });
  return task;
}

function ObjectActions({ obj, only, vandaagLabel, klantLabel, className }) {
  useStore(); // abonneer op store-wijzigingen (re-render bij toewijzing/log)
  const T = OBJ_TYPES[obj.type] || OBJ_TYPES._default;
  const want = (a) => only ? only.indexOf(a) > -1 : !!T[a];
  const showKlant = want("klant") && !!obj.custId;
  const showAssign = want("assign");
  const showVandaag = want("vandaag");
  if (!showKlant && !showAssign && !showVandaag) return null;
  const fromLabel = (OBJ_LABEL[obj.type] || "een object") + (obj.title ? " \u201C" + obj.title + "\u201D" : "");

  return (
    <div className={"obj-actions" + (className ? " " + className : "")}>
      {showVandaag && (
        <button className="tk-act" onClick={(e) => { e.stopPropagation(); sendObjectToVandaag(obj); if (obj.onAfter) obj.onAfter(); }}>
          <span dangerouslySetInnerHTML={{ __html: ICONS("check", { sw: 2 }) }} />{vandaagLabel || "Naar Vandaag"}
        </button>
      )}
      {showAssign && <AssignAction entry={{ key: obj.key, title: obj.title, agent: obj.agent, name: obj.name, accent: obj.accent, custId: obj.custId || null }} onAssigned={obj.onAssigned} />}
      {showKlant && (
        <button className="tk-act klant" onClick={(e) => { e.stopPropagation(); openKlantCard(obj.custId, fromLabel); if (obj.onAfter) obj.onAfter(); }}>
          <span dangerouslySetInnerHTML={{ __html: ICONS("people", { sw: 1.9 }) }} />{klantLabel || "Ga naar klant"}
          <span className="tk-act-go" dangerouslySetInnerHTML={{ __html: ICONS("arrow", { sw: 2 }) }} />
        </button>
      )}
    </div>
  );
}

export { ObjectActions, openKlantCard, sendObjectToVandaag, OBJ_TYPES };
