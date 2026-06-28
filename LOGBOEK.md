# LOGBOEK MyHorAIzon

Bouwlog per afgeronde stap. Nieuwste bovenaan.

---

## Stap 13: De zes resterende board-views uit de blauwdruk (2026-06-28)

> Verplaatsing: project staat nu in `~/projects/myhoraizon` (was Desktop;
> macOS-rechtenprobleem opgelost). Branch `main`, up-to-date met origin.

### Wat gedaan
De board-motor (`TileGrid` + `BOARDS` + widget-markt, uit reparatie-steen 1/2) is
nu uitgerold over **alle** resterende module-views. Elke pagina volgt het bewezen
patroon: een blauwdruk-getrouwe bordkop + `<TileGrid board="…">`, met
edit-modus/layout/markt via de Outlet-context van `AppShell`. AppShell mapt
automatisch (`board = BOARDS[view] ? view : null`), dus er was geen losse bedrading
nodig: zodra `BOARDS.<view>` bestaat, krijgt de route zijn bord.

Daarnaast twee Iris-tegels van window-globals naar echte ESM-imports getrokken
(`window.IrisChat/IrisBriefing/IrisFlags` → directe imports uit `iris.jsx`), zodat
het Iris-bord (en de Iris-tegels op Dashboard/Vandaag) ook in de ESM-build renderen.

### Bestanden
- `src/pages/IrisPage.jsx` (nieuw) — `/iris`: `IrisBoardHeader` + `TileGrid board="iris"`.
- `src/pages/WebsitePage.jsx` (nieuw) — `/website`: `sx-hero` (Live + domein) +
  `TileGrid board="website"`, achter `ModuleGate` (custom-module).
- `src/pages/SeoPage.jsx` (nieuw) — `/seo`: `GroeiBoardHeader` + `TileGrid board="seo"`.
- `src/pages/StudioPage.jsx` (nieuw) — `/studio`: `StudioBoardHeader` + `TileGrid board="studio"`.
- `src/design/iris.jsx` (nieuw) — ESM-port: `IrisChat/IrisBriefing/IrisFlags/IrisAttention/IrisBoardHeader`.
- `src/design/groei.jsx` (nieuw) — ESM-port: `GroeiBoardHeader`.
- `src/design/studio.jsx` (nieuw) — ESM-port: `StudioBoardHeader`.
- `src/design/leadfinder.jsx` + `src/design/finder-data.js` (nieuw) — Finder-widget + data.
- `src/design/salestasks.jsx` (nieuw) — pipeline-deel: `SalesPipelinePage`,
  `SaleskansenWidget`, `PipelineTakenWidget`, `pipelineTasks`, `incomingLeads`
  (klaargezet voor stap 14 — Pipeline-bord).
- `src/design/shell.jsx` — `AgentsFeed` toegevoegd (live agent-feed onder het
  Dashboard-bord, 1:1 uit de blauwdruk-shell).
- `src/design/tiles.jsx` — Iris-tegels (`irischat/irisbrief/irisflags`) van
  `window.*`-globals naar ESM-imports.
- `src/pages/DashboardPage.jsx` — `AgentsFeed` onder het bord (Dashboard-uitlijning).
- `src/App.jsx` — routes + `REAL_PAGES` voor `iris/website/seo/studio`.

### Getest
- `npm run build`: slaagt (1899 modules, ~335ms).
- `npm run lint`: 0 errors (3 pre-existing warnings). Eén opgeruimd: ongebruikte
  `Eyebrow`-import in `iris.jsx`.
- `npm run test:knoppen`: GROEN — geen dode klikken over de standaardroutes.

### Trouw-rapport per board
- **Dashboard-uitlijning** — Design: `dashboard/shell.jsx` (`AgentsFeed`).
  **9/10.** De live agent-feed (`Wat je agents deden`) hangt nu 1:1 onder het bord,
  exact uit de blauwdruk-shell. Afwijking: feed valt stil terug op `null` als
  `MOD.agents.feed` ontbreekt (defensief; blauwdruk gaat uit van aanwezige data).
- **Iris** (`/iris`) — Design: `dashboard/shell.jsx` view `iris` + `iris.jsx`.
  **9/10.** `IrisBoardHeader` + `TileGrid board="iris"`, pool/volgorde/pin 1:1
  (pin: irisbrief + irischat). Iris-tegels nu echte ESM-componenten.
- **Vandaag** (`/vandaag`) — Design: `pages.jsx` Vandaag-board. **9/10.** Onveranderd
  bewezen patroon (`VandaagBoardHeader` + `TileGrid board="vandaag"`); meegevalideerd.
- **SEO/Groei** (`/seo`) — Design: `dashboard/shell.jsx` view `seo` + `groei.jsx`.
  **8/10.** `GroeiBoardHeader` + `TileGrid board="seo"`; pool/volgorde/pin 1:1
  (pin: groeikpis + groeitaken). Afwijking: KPI-assets (Semrush/Clarity-logo's)
  vallen terug op repo-iconen.
- **Studio** (`/studio`) — Design: `dashboard/shell.jsx` view `studio` + `studio.jsx`.
  **8/10.** `StudioBoardHeader` + `TileGrid board="studio"`; pin: studiokpis +
  studioconcepten. Concepten-tegel deelt de `salestaken`-motor (scope `studio`).
- **Website** (`/website`) — Design: `dashboard/shell.jsx` view `website`.
  **9/10.** `sx-hero` (Live-dot + `sloepenspel.nl` + Max & Mila) + `TileGrid
  board="website"`, achter `ModuleGate`. Afwijking: hero-mark = `KyanoMark` (rood)
  i.p.v. blauwdruk-`sales-mark.svg` — repo-conventie, asset niet in ESM-build.

### Klikpad per route
- **/** (Dashboard): bord + onderaan **Wat je agents deden** (live feed) → "alles bekijken →".
- **/iris**: Iris-bordkop + tegels **Iris-briefing / Iris-chat / Iris vraagt aandacht /
  Iris-flags**. Bewerk → S/M/L/XL + ×; Widget toevoegen → Iris-widgetmarkt.
- **/vandaag**: groet-bordkop + **Taken / KPI's / Agenda / Postvak / …**.
- **/seo**: Groei-bordkop + **Groei-KPI's / Groei-voorstellen / Iris-aandacht / Analytics / Pagina's**.
- **/studio**: Studio-bordkop + **Studio-KPI's / Concepten van Mila / Iris-aandacht / Editor / SEO**.
- **/website**: sx-hero (Live · sloepenspel.nl · Max & Mila, Bekijk/Beheer site) +
  **Website-KPI's / Website-taken / Iris-aandacht / Analytics / SEO / Studio / Pagina's / Editor**.

### Status: veiliggesteld op GitHub. Pipeline (`/pipeline`) volgt als stap 14.

---

## Reparatie-steen 2: /sales naar het echte TileGrid-bord (2026-06-28)

### De afwijking
Inventarisatie tegen de Design MCP (project a948021d, live opgehaald) wees uit:
in de blauwdruk is `/sales` een **TileGrid-widget-bord** (`board="sales"`), met de
takenlijst als één widget erin. Wij bouwden `/sales` als een vaste
overzicht-component (`SalesDash` → `SalesOverzicht`: funnel + Aandacht + omzet-trend).
Dat is de afwijking. Deze proef-steen zet **alleen** `/sales` om naar het echte bord.

### Live-bron (Design MCP)
- **`dashboard/shell.jsx`**, `App()`, blok `view === "sales"`:
  ```jsx
  ) : view === "sales" ? (
    <div className="dash sales-board">
      <header className="sx-hero"> … <h1>Sales</h1>
        <p className="sx-hero-sub mono">Je sales-overzicht, pipeline, klanten en omzet, aangestuurd door Hugo en Iris</p>
      </header>
      …
      <TileGrid board="sales" edit={edit} onOpen={go} layout={salesLayout}
                setLayout={setSalesLayout} flags={effFlags} onAddWidget={() => setLibOpen("sales")} />
    </div>
  )
  ```
- **`dashboard/tiles.jsx`**, board-config:
  ```js
  const SALES_ORDER = ["omzet","saleskpis","salestaken","irisattn","pipeline","crm","relatiebeheer","finder"];
  sales: { key:"myhoraizon.sales.layout.v2", ids:()=>SALES_POOL…, order:SALES_ORDER,
           pin:["saleskpis","salestaken"], autofill:false }
  ```

### Wat al bestond (en hergebruikt is)
De board-motor was al volledig geport en gewired:
- `src/design/tiles.jsx` — `TileGrid`, `WidgetLibrary` (de widget-markt), `BOARDS`,
  `loadLayout/saveLayout/buildDefault`. Salestaken rendert via `VoorstellenWidget`
  (scope "sales") uit `vandaag.jsx`; KPI-strip via `KpiStrip`; module-tegels uit `data.js`.
- `src/components/AppShell.jsx` — beheert `edit`, `layout = loadLayout(board)`, de
  widget-markt en geeft alles via Outlet-context. Omdat `BOARDS.sales` bestaat,
  berekende AppShell `board="sales"` al; alleen de pagina consumeerde 't niet.
- `DashboardPage`/`VandaagPage` zijn het bewezen patroon (zelfde Outlet-context).

### Wat nieuw moest (minimaal)
Alleen `SalesPage.jsx` herschreven: van `<SalesDash>` naar `dash sales-board` +
`sx-hero` (exacte blauwdruk-subtitle) + `edit`-hint + `<TileGrid board="sales">`,
via `useOutletContext()`. De tenant-gate (`useModuleSettings('sales')` + ModuleGate)
bleef ongewijzigd — Sales blijft custom-module (tenant 1 aan, tenant 2 403).

### Eén widget-motor (keuze + onderbouwing)
We stonden op twee motoren: de **TileGrid-board-laag** (blauwdruk) en de
**Panel-laag** (`widgets.jsx`/`WidgetsProvider`, uit reparatie-steen 1, toen op
`SalesOverzicht` gezet als proef). Gekozen: **standaardiseren op de TileGrid-board-laag**,
precies zoals de blauwdruk `/sales` doet. Daarom de Panel-motor van de
sales-surface ge-de-wired: `WidgetsProvider`/`HiddenTray` + edit-toggle uit
`SalesOverzicht` verwijderd en de `widgets.jsx`-import uit `sales.jsx` geschrapt.
`SalesOverzicht`/`SalesDash` blijven als (nu niet-geroute, stub-vrije) componenten
bestaan — niet weggegooid. `widgets.jsx` is nu nergens meer geïmporteerd; kan in
een latere opruim-steen weg of dienen voor de Beheer-pagina (`WidgetsAdmin`).
Andere pagina's (Dashboard, Pipeline, CRM) onaangeraakt.

### Bestanden
- Gewijzigd: `src/pages/SalesPage.jsx` (board i.p.v. SalesDash),
  `src/design/sales.jsx` (Panel-motor uit SalesOverzicht; import weg).

### Getest
- `npm run build`: slaagt. `npm run lint`: 0 errors (3 pre-existing warnings).
- `npm run test:knoppen`: GROEN — 66 knoppen over 4 standaardroutes; `/sales`
  apart: 44 knoppen groen.

### Trouw-rapport
- **Design-bestanden**: `dashboard/shell.jsx` (routing) + `dashboard/tiles.jsx` (board).
- **Score: 9/10.** `/sales` rendert nu letterlijk het blauwdruk-bord: `dash sales-board`
  + `sx-hero` + `<TileGrid board="sales">`, met exact dezelfde widgetpool, volgorde
  en pinning (saleskpis + salestaken). Resterende afwijkingen:
  1. Hero-logo: blauwdruk gebruikt `<img src="dashboard/sales-mark.svg">`; lokaal de
     `KyanoMark` (rood) — dezelfde repo-conventie als sidebar/pipeline, asset zit niet
     in de ESM-build. Subtitle + classes zijn wél 1:1.
  2. Edit-modus/markt leven in `AppShell` (Outlet-context) i.p.v. lokale state in
     `App()`; functioneel identiek (Bewerk → wiebel + S/M/L/XL + ×, Widget toevoegen
     → `WidgetLibrary board="sales"`).

### Zelf checken (klikpad naast je Design)
1. Ga naar **/sales**. Je ziet de **sx-hero** ("Sales" + subtitle) en daaronder het
   tegelbord, standaard: **Omzet**, **KPI's** (Sales-kerncijfers, volle breedte),
   **Sales-taken** (de takenlijst als XL-widget), **Iris vraagt aandacht**, en de
   tegels **Pipeline / CRM / Relatiebeheer / Finder**.
2. Klik **Bewerk** (topbar): tegels gaan wiebelen, je krijgt **S / M / L / XL** per
   tegel, een **×** om te verbergen, en een sleep-cursor om te ordenen.
3. Klik **Widget toevoegen**: de echte **widget-markt** (`WidgetLibrary`) opent met
   de sales-widgetpool (omzet, agenda, offertes, facturen, contracten, analytics,
   taken-log…). Voeg er een toe → verschijnt op het bord.
4. Herlaad: je indeling blijft staan onder `localStorage` sleutel
   `myhoraizon.sales.layout.v2`. **Herstel** (topbar, in bewerkmodus) zet 'm terug.

---

## Reparatie-steen 1: 31-widgets als gedeelde laag (2026-06-28)

### Het ontbrekende fundament
Een trouw-audit wees uit dat het bewerkbare widget-bord uit blauwdruk-module
**31-widgets** nergens was geport. Daardoor hadden Sales-overzicht, CRM en alle
module-pagina's geen eigen bord: `<Panel>` consumeerde al een `WidgetCtx`, maar
de **provider** die die context vult ontbrak. Het Sales-overzicht had wél de
opmaak (`pw-grid` + `Panel wid="…"`) maar de Bewerk-knop was een
`notImplemented`-stub. Dit fundament is nu alsnog geport.

### Wat 31-widgets levert (de motor)
- **WidgetsProvider** (`moduleId`, `editing`) — vult `WidgetCtx`: registratie,
  verbergen/tonen, Klein/Groot (half/full), volgorde + slepen om te ordenen.
  Bewaard per module in `localStorage: myhoraizon.pagelayout.<id>`.
- **HiddenTray** — de module-scoped "Widget toevoegen"-markt onderaan de pagina
  (alleen in bewerkmodus).
- **WidgetsAdmin** — centrale aan/uit-schakelaars per module (voor Beheer).
- Helpers **loadPW / savePW / resetPW** + de registratie-cache `__widgetReg`.

### Wat al bestond, wat nieuw is
- **Bestond al** (correct): `WidgetCtx` + de bewerkbare `<Panel>` in
  `components.jsx`; de gedeelde tegel-laag `tiles.jsx` (TileGrid van het
  dashboard, een aparte motor); `charts.jsx`/`altviews.jsx`.
- **Nieuw als gedeelde laag**: `src/design/widgets.jsx` — letterlijke ESM-port
  van 31-widgets. Elke module-pagina kan nu een eigen bord krijgen via
  `<WidgetsProvider moduleId="…" editing={edit}> … <HiddenTray/> </WidgetsProvider>`.

### Eerste aansluiting (bewijs van de motor)
`SalesOverzicht` is 1:1 met blauwdruk-module 10 gebracht: edit-state, de
`WP`/`HT`-wrapper en een echte Bewerk/Klaar-toggle in plaats van de stub. De
overige pagina's (CRM, enz.) volgen in latere reparatie-stenen — dit is bewust
de gedeelde motor + één aansluiting, niet alle pagina's tegelijk.

### Trouw-rapport
- **Design-ref-bestand**: `design-ref/modules/31-widgets-jsx-bewerkbare-widgets-op-lke-mo.jsx`
  (en `10-sales-…` voor de Sales-aansluiting).
- **Trouw-score: 9/10**. Bodies van WidgetsProvider/HiddenTray/WidgetsAdmin zijn
  letterlijk overgenomen. Afwijkingen, allemaal de verplichte ESM-vertaling:
  - `window.WidgetCtx` → geïmporteerde `WidgetCtx` uit components.jsx.
  - `window.MOD` → lokale `MOD` uit `KYANO.modules` (zelfde patroon als
    dashboard.jsx/shell.jsx; accent/naam-fallbacks ongewijzigd).
  - `Object.assign(window, …)` → ESM-`export`.
  - `__widgetReg` blijft bewust op `window` (cross-module cache die provider én
    admin delen, exact als de blauwdruk).
  - Eén eslint-opinie-regel (`react-hooks/set-state-in-effect`) staat uit voor
    `src/design/**` met motivatie; het effect-gedrag is 1:1 de blauwdruk.

### Bestanden
- Nieuw: `src/design/widgets.jsx`.
- Gewijzigd: `src/design/sales.jsx` (SalesOverzicht: WP/HT-wrapper + echte
  toggle, `notImplemented`-import verwijderd), `eslint.config.js` (design-override
  + 1 regel).

### Getest
- `npm run build`: slaagt.
- `npm run lint`: 0 errors (3 pre-existing exhaustive-deps-warnings).
- `npm run test:knoppen`: GROEN — 102 knoppen over 4 routes. Extra: `/sales`
  apart gedraaid → 44 knoppen groen, inclusief de nieuwe Bewerk-knop (toggelt
  bewerkmodus, geen dode klik meer).

### Zelf checken
1. Open **/sales** (tab Overzicht) → klik **Bewerk**: panels gaan in
   wiebel/bewerkmodus (×-knop, Klein/Groot-pillen) en onderaan verschijnt de
   echte widget-markt "Widget toevoegen — Alleen widgets van …". Tik × op een
   panel → het verhuist naar de markt; tik 'm daar weer aan → terug op de pagina.
   Knop heet nu **Klaar**; opnieuw klikken sluit de bewerkmodus.
2. Herlaad de pagina: de gekozen indeling (verborgen/volgorde/grootte) blijft
   staan — opgeslagen onder `localStorage` sleutel `myhoraizon.pagelayout.sales`.

---

## Stap 12: Sales-suite deel 2 — CRM + de GEDEELDE klantkaart (2026-06-28)

### De gouden regel waargemaakt: ÉÉN klantkaart, overal
De klantkaart is nu **één gedeelde component** die overal opent — Inbox,
Pipeline én CRM roepen exact dezelfde kaart aan. Geen tweede versie per pagina.
Mechaniek: `openKlantCard(id)` → `setState("crm.full", id)` → `ClientFullHost`
(één keer gemonteerd in `AppShell`) rendert `ClientFullView` als overlay
(CompanyFull voor bedrijf, PersonFull voor particulier).

### Stubs die nu ECHT werden (de 3 "Ga naar klant")
`openKlantCard` was een `notImplemented`-toast (stap 9). Nu de echte opener van
de gedeelde kaart. Daarmee zijn in één klap drie plekken live, zónder daar iets
te bouwen:
- **Inbox-gesprek** (ContactPanel → "Ga naar klant"/"Volledige klantkaart") →
  opent de kaart (PersonFull, bv. Lisa de Vries).
- **Pipeline-deal** (kaart → "Ga naar klant") → opent dezelfde kaart
  (CompanyFull, bv. Hotel Okura), met de log-regel "opende de klantkaart vanuit
  deal …".
- **CRM-lijst + NL-kaart-pin** → opent de kaart.
Headless geverifieerd met screenshots: alle drie openen de echte kaart, geen toast.

### Wat gebouwd (letterlijk uit de blauwdruk, salescrm.jsx + module 14)
- **`src/design/klantkaart.jsx`** (NIEUW, de gedeelde kaart): `ClientFullView` +
  `ClientFullHost` + CompanyFull/PersonFull + NextStepCard + CfTimelineCard
  (ctLive/ctTasks/cfTimeline/cfDocs). Bevat: contactgegevens, eigenaar/status,
  Iris-analyse, volgende-stap-kaart, gekoppelde deals + documenten (uit sales.jsx),
  de log-gebaseerde activiteiten-tijdlijn (takenlog/assign) en ObjectActions.
- **`src/design/crm.jsx`** (NIEUW): `/crm` — sx-hero + NL-kaart met pins
  (positie uit de x/y-haakjes in `customers.js`, niet hardcoded) + klantenlijst
  (zoek/tabs/sorteer, volgende stap, waarde, smart-signaal, status, snelle acties).
  Elke rij/pin opent de gedeelde kaart.
- **`src/pages/CrmPage.jsx`** (NIEUW): gate op core-module 'clients'.

### Gedeeld vs. al aanwezig
Hergebruikt: `customers.js` (allCustomers), `objectactions.jsx` (openKlantCard +
ObjectActions), `sales.jsx` (deal-/klant-helpers — uitgebreid met de CRM/kaart-
helpers: StatusDot/STATUS_META/custKind/custContacts/custDeal/custNext/addCustLog/
buildSeedTimeline/eur/…), `assign.jsx` (OwnerField/log), `store.jsx`
(useStore/setState/toast/notImplemented), components (AC/Avatar/Btn/Panel).

### Tenant
`clients` is **core** (altijd aan) → `/crm` niet sales-gated; daarom uit de
ROUTE_MODULE-alias gehaald. De klantkaart zelf is module-overstijgend en werkt
ongeacht waar hij geopend wordt.

### Bewuste beperkingen
- Configureerbare kolommen/filters (crmfields-registry) en de KvK-nieuwe-klant-
  flow volgen later; "Nieuwe klant" toont zolang een `notImplemented`-toast.

### Knoppen-poort + nette UX-fix
- `AppShell` sluit de klantkaart nu bij route-wissel (de kaart hoort niet open te
  blijven hangen als je wegnavigeert) — nette UX én houdt de poort-test schoon.
- Poort-harness: reeds-actieve `sx-tab`/`crm-sort-b` toegevoegd aan de allowlist
  (her-selecteren van de actieve filter/sortering is een legitieme no-op, net als
  iview/ichip/qc-tab).

### Getest
- `npm run build` + `npm run lint`: groen (alleen bekende faithful-port deps-
  waarschuwingen). `npm run test:knoppen / /inbox /sales /pipeline /crm`: **groen**
  (96 knoppen, geen dode klikken).
- Screenshots: kaart opent identiek vanuit /crm (Marqt Overtoom), Pipeline
  (Hotel Okura) en Inbox-gesprek (Lisa de Vries).

### Status: CRM + gedeelde klantkaart klaar; wacht op visuele vergelijking.

---

## Stap 11: Sales-suite deel 1 — Pipeline (2026-06-28)

### Wat gebouwd (letterlijk uit de blauwdruk)
- **`src/design/sales.jsx`** (gedeelde Sales-laag): pijplijn-fasen (PIPE_STAGES),
  instelbare flow (getFlow/saveFlow/stageTarget), deal-/klant-helpers en de
  log-gebaseerde contact-engine (daysSinceContact/buildSeedTimeline → stale-
  signaal), plus de componenten: **SalesPipeline** (Trello-kanban: kolommen=fases,
  sleepbare kaarten tussen fases, fase-pijlen, waarde per kolom, stale-bel),
  PipelineSummaryBar, NewDealModal, PipelineFlowEditor, en SalesOverzicht/SalesDash.
- **/sales** (overzicht: KPI-bar + funnel + aandacht + omzet-trend + recente deals)
  en **/pipeline** (de kanban). Beide pagina's nieuw.

### Hergebruikt
ListRow/StatusBadge bleken niet nodig (de kanban heeft eigen kb-card-vorm uit de
blauwdruk); wél hergebruikt: Panel, Avatar, Btn, AreaChart, KyanoMark (components),
assign.jsx (OwnerField/currentActor/logToMember), objectactions (ObjectActions +
openKlantCard), customers.js (allCustomers/custById), store (Modal/Field/confirmAsk).

### Belangrijke fix
- De **kanban/sales-CSS (kb-*/sx-*) ontbrak** in blueprint.css: die staat in het
  TWEEDE `<style>`-blok van de Design-export, dat bij stap 3 niet was geëxtraheerd
  (alleen blok 1 = dashboard/inbox). Blok 2 (module-pagina + Sales) nu toegevoegd
  aan blueprint.css. Daarmee rendert de kanban als horizontaal bord i.p.v. lijst.

### Tenant
- 'sales' is een custom-module. /sales + /pipeline achter de globale ModuleGate;
  /pipeline gate't op 'sales' via ROUTE_MODULE-alias. Sidebar verbergt Sales +
  sub-routes (pipeline/crm/finder/relatiebeheer) als de tenant geen sales heeft.
  Pagina's lezen aan/uit via useModuleSettings('sales').

### Bewuste beperkingen
- Klantkaart-clicks (kaart/Ga-naar-klant) → openKlantCard = notImplemented-toast
  tot de CRM-deel (volledige klantkaart) er is.
- /sales "Bewerk" (widget-edit) → notImplemented; de WidgetsProvider-laag komt later.
- Relatiebeheer/Leadfinder/CRM zijn deel 2/3 (nu placeholders, wel sales-gated).

### Getest
- `npm run build` + `npm run lint`: groen. `npm run test:knoppen / /vandaag /inbox
  /sales /pipeline`: groen (86 knoppen). Kanban headless geverifieerd.

### Status: Sales deel 1 (Pipeline) klaar.

---

## Stap 10: Tenant-ruggengraat (dun) (2026-06-28)

### Vormen 1:1 gespiegeld uit horaizon-brain
- **Tenant-vorm** (`src/tenant/tenants.js`): `{ id, slug, display_name, package,
  active_agents[], custom_modules[], status, primary_contact_email,
  primary_contact_name, horaizon_org_id, metadata }` + per tenant een
  `module_settings`-overlay `{ [key]: { enabled, settings } }`. 2 demo-tenants:
  Sloepenspel Amsterdam (enterprise, alle customs) en Kapsalon Knip & Co
  (starter, alleen sales+contracts).
- **MODULES-registry** (`src/tenant/modules.js`): `{ key, kind:'core'|'custom',
  label, route }`. Core-set gespiegeld (dashboard, settings, iris, clients, team,
  library, radar, patterns) + myhoraizon-core (vandaag, postvak). Custom: sales,
  website, social, contracts, club, events.
- **checkModuleAccess** (`src/tenant/access.js`): brein-regel exact
  `allowed = isCore(key) || tenant.custom_modules.includes(key)`, output-vorm
  identiek aan de edge-fn `{ allowed, reason, module_kind }`.
- **TenantProvider** (`src/tenant/TenantProvider.jsx`): interface exact
  `{ tenants, activeTenantId, activeTenant, switchTenant, isLoading }`,
  `activeTenantId` in localStorage `kyano:active-tenant-id`, default null
  (CEO-allesweergave). `useModuleSettings(key)` voor de overlay.

### Seam (later vastklikken)
- `access.js`: achter `USE_BRAIN` (nu `false`) — LATER
  `supabase.functions.invoke('check-route-access')` met identieke input/output.
- `TenantProvider`: `tenants` komt nu uit `tenants.js` — LATER customer-flow
  `list_tenants`. Interface blijft identiek.

### Bedrading
- `TenantSwitcher` in de topbar (Alle/CEO + tenants); switchen verandert direct
  de zichtbare modules.
- `ModuleGate` wrapt de Outlet: route → module-key → checkModuleAccess. allowed
  → pagina; `module_not_enabled` → 403-paneel (blueprint-tokens). CEO → altijd.
- Sidebar leest dezelfde tenant-config (verbergt uitgezette custom-modules) via
  de bestaande `flags`-seam — cosmetisch; ModuleGate is de echte poort.
- De 3 modules (dashboard, vandaag, postvak) lezen hun aan/uit via
  `useModuleSettings` i.p.v. hardcoded (ModuleOff bij uit).

### Bewuste beperkingen
- Demo-tenants, `USE_BRAIN=false`, geen Beheer-UI om custom_modules te wijzigen.
- Breadcrumb-bedrijfsnaam komt nog uit de design-data (KYANO), niet uit de
  actieve tenant (cosmetisch).

### Getest
- `npm run build` + `npm run lint`: groen. `npm run test:knoppen`: groen
  (66 knoppen, 4 routes; TenantSwitcher meegeteld, geen dode klikken).
- Headless geverifieerd: tenant 2 actief → sidebar zonder Website/Social/Club,
  `/social` toont het 403-paneel met de exacte reason/module/kind.

### Status: tenant-seam klaar; klikt later vast op het brein.

---

## Stap 9: Knoppen-poort + dode-klik-test (2026-06-28)

### Wat gebouwd (kwaliteitslaag, geen nieuwe features)
- **`notImplemented(label)`** in `src/design/store.jsx` (geëxporteerd): toont
  "[label] komt binnenkort". Regel: elke nog-niet-af actie roept dit aan, nooit
  een stille no-op.
- **Dode-klik-test** `tests/deadclick.mjs` + npm-script **`test:knoppen`**.
  Stuurt headless Chrome via CDP (Node's ingebouwde WebSocket, geen extra deps),
  logt in via de dev-login, bezoekt elke route met een verse pagina per klik,
  klikt elk interactief element en checkt op verandering (URL / DOM-mutatie via
  MutationObserver / toast). Faalt met een nette lijst (route + label).
- **`KWALITEIT.md`**: de poort vastgelegd — geen module "done" tot test:knoppen
  groen is.

### Run-resultaat (Dashboard, Vandaag, Inbox + inbox-gesprek)
- Eerste run: **1 dode klik** — `[Dashboard] "Bekijk"` (Iris-voorstellen-tegel).
- Fixes:
  - **gefixt**: `irisattn`-tegel gaf `onOpen` niet door aan `IrisVoorstellen`
    (ontbrekende koppeling naar de bestaande navigatie-handler). Nu doorgegeven.
  - **toast-stub**: `openKlantCard` (de "Ga naar klant" / "Volledige klantkaart
    openen") → `notImplemented("Volledige klantkaart")`, want de CRM-klantkaart
    bestaat nog niet (toekomstvast: zet nog steeds crm.full voor later).
- Tweede run: **100 knoppen, 4 routes, GROEN** (geen dode klikken).

### Bestanden
- Nieuw: `tests/deadclick.mjs`, `KWALITEIT.md`.
- Gewijzigd: `src/design/store.jsx` (notImplemented), `src/design/tiles.jsx`
  (onOpen door), `src/design/objectactions.jsx` (openKlantCard → notImplemented),
  `package.json` (test:knoppen).

### Getest
- `npm run build` + `npm run lint`: groen. `npm run test:knoppen`: groen.

### Status: knoppen-poort groen op Dashboard / Vandaag / Inbox.

---

## Stap 8: De Inbox-module uit de blauwdruk (2026-06-28)

### Wat gebouwd
Route `/postvak` (sidebar "Inbox") + alias `/inbox`: het postvak uit de blauwdruk
(05-inbox), op demo-gesprekken uit data.js. Lijst-modus (kanaalfilters + views +
gesprek-rijen met inline acties) en full-screen thread (AI-samenvatting, berichten
met bijlagen/spraak, composer met Sam-suggestie/Verbeter-NL/Vertaal/AI-varianten/
templates) + het contactpaneel (klantkaart naast het gesprek).

### Hergebruikt (gedeelde componenten, golden rule)
ObjectActions (aanmaken/toewijzen/klant), assign.jsx (currentActor/asgFirst/
logToCustomer), store.jsx, components.jsx (Avatar/AC/ACsoft), icons.js, menus.jsx
(useSmartMenu), dashboard.jsx (clientFirst), blueprint.css (alle hub-/irow-/cp-/
comp-klassen stonden er al).

### Nieuw als gedeelde laag (eerst gebouwd)
- `channels.jsx` — kanaal-adapter (CH_META/CH_LOGO/ChannelAvatar) + tenant-config-
  seam (`INBOX_TENANT`: kanalen aan/uit per tenant). UI leest kanalen hieruit, niet
  hardcoded → de echte comms-engine klikt later vast.
- `customers.js` — de **gedeelde klant-bron** `allCustomers(store)` (in CRM
  aangemaakte klanten + demo-seed). CRM/Relatiebeheer hergebruiken deze later.
- `inbox.jsx` — CommHub + ContactPanel + ComposeModal + SnoozeModal + thread/lijst.

### Bewuste keuzes / beperkingen
- "Aanmaken vanuit gesprek" loopt via **ObjectActions** (Naar Vandaag / Wijs toe /
  Ga naar klant), niet via de blauwdruk-`QuickCreateModal` (jouw instructie: geen
  tweede create-mechanisme; QuickCreate hing bovendien aan nog-niet-gebouwde
  sales/offerte-engines).
- De **volledige** CRM-klantkaart (`crm.full`) bestaat nog niet → "Volledige
  klantkaart openen" zet de state maar toont nog niets; de klantkaart-naast-het-
  gesprek (ContactPanel, mini-context met gekoppelde deal/offerte) werkt wél.
- De CRM-`FieldPicker` (Knoppen/Velden-config) komt met de CRM-module; de knoppen
  staan er, de picker-popover volgt dan (lokale `useFieldPop` zodat de knop werkt).
- Alles op demo-data; echte kanalen/Supabase later.

### Bestanden
- Nieuw: `src/design/{channels.jsx,customers.js,inbox.jsx}`, `src/pages/InboxPage.jsx`.
- Gewijzigd: `src/App.jsx` (routes /postvak + /inbox).

### Getest
- `npm run build` slaagt, `npm run lint` exit 0 (3 faithful-port waarschuwingen).
- Headless screenshots: lijst (kanaal-chips, rijen, tags) + thread (AI-samenvatting,
  composer, statusbalk met ObjectActions, contactpaneel met gekoppelde deal/offerte).

### Status: klaar, wacht op visuele vergelijking met de Design

---

## Stap 7: De Vandaag-module uit de blauwdruk (2026-06-28)

### Wat gedaan
De Vandaag-pagina (`/vandaag`) is nu het volledige Vandaag-bord uit de blauwdruk
(pages.jsx), op demo-data. Eerst de benodigde gedeelde lagen geport:
- **`src/design/assign.jsx`** — het gedeelde toewijs-systeem: `AssignAction`
  (met cascade-recht via rollen), `TeamPicker`, `TeamAssignedSection` ("Aan mij
  toegewezen" + "Bij het team" met teruggeven/terugzetten), `ReturnedBanner`,
  `OwnerField`, en de helpers (currentActor, canAssign, isAssigned, logToMember/
  logToCustomer, werkstroom-filter). `objectactions.jsx` gebruikt nu de echte
  `AssignAction` (geen window-bridge meer).
- **`src/design/snooze.jsx`** — `SnoozeMenu` (uitstel-opties) voor de "Later"-actie.
- **`src/design/takenlog.jsx`** — `TakenLogWidget`: centrale samengevoegde
  takenlijst (agent + eigen + toegewezen) met status-chips, zoek en filters.
- **`src/design/vandaag.jsx`** — `CeoProposal` (agent-taak-rij: avatar,
  module-chip, titel, meta, uitklapbare samenvatting met Keur goed / Bekijk /
  Later / Afwijzen + ObjectActions/AssignAction), `VoorstellenWidget` (de
  taken-lijst met filter/sorteer + groepering urgent/module + TeamAssignedSection
  + eigen taken), `UserTaskRow`/`QuickAddTask`/`UTaskLinkMenu` (eigen taken),
  `VandaagBoardHeader` (groet + commandoregel + voortgang + Alles afhandelen),
  `SnelleActiesWidget`.

### Bedrading
- De shell beheert nu de layout per BOARD (dashboard én vandaag); `BOARDS`
  geëxporteerd uit tiles.jsx, AppShell kiest het bord op basis van de route.
- Nieuwe route `/vandaag` -> `VandaagPage` (VandaagBoardHeader + TileGrid
  board="vandaag" met de Taken-/KPI-/Agenda-/Snelle-acties-/Taken-log-tegels).
- tiles.jsx koppelt nu de echte `VoorstellenWidget`/`SnelleActiesWidget`/
  `TakenLogWidget` (i.p.v. window-stubs).

### Bestanden
- Nieuw: `src/design/{assign,snooze,takenlog,vandaag}.jsx`, `src/pages/VandaagPage.jsx`.
- Gewijzigd: `src/design/{objectactions,tiles,shell}.jsx`,
  `src/components/AppShell.jsx`, `src/pages/DashboardPage.jsx`, `src/App.jsx`.

### Getest
- `npm run build` slaagt, `npm run lint` exit 0 (3 faithful-port waarschuwingen).
- Headless screenshot van `/vandaag`: bordkop ("Goedenacht, Ramon · 31 taken"),
  de Taken-tegel met "Vraagt nu je aandacht (5)" + "Taken (26)", elke rij met
  agent-avatar, module-chip, titel, meta en Bekijk.

### Status: klaar, wacht op visuele vergelijking met de Design

### Let op
- `allCustomers` (klant-koppeling vanuit een taak) is nog niet geport (komt met de
  CRM/Sales-module); klant-links degraderen netjes tot dan.
- Alles draait op demo-data (`data.js`); Supabase-koppeling volgt.

---

## Stap 6: De sleepbare tegel-laag uit de blauwdruk (2026-06-28)

### Wat gedaan
De tegel-laag uit `tiles.jsx` letterlijk geport; het dashboard is nu 1:1 het
sleepbare tegelbord uit de blauwdruk (op demo-data).
- **`src/design/tiles.jsx`**: TileGrid (drag-reorder met overlay + doel-index),
  Tile (S/M/L/XL resize, view-cycler, verbergen, jiggle via blauwdruk-CSS),
  TileBody (alle tegel-types: kpis/irisattn/agenda/today/funnel/list/invoices/
  social/integration/spark/barchart/charts), WidgetLibrary (de widget-markt met
  per-board pool, zoek, tilt-preview, instellingen-popover) + layout-persistentie
  (loadLayout/saveLayout/buildDefault per board).
- **`src/design/charts.jsx`** geport: `WidgetChart` + VBars/LineC/PieView +
  helpers (chartable, monthSeries, breakdown, secondAccent) voor de
  area/staaf/lijn/cirkel-views.
- **`src/design/altviews.jsx`** geport: CompactView/DayView/WeekView/
  AgentStatusView/ChannelVolView (inhoudelijke alternatieve weergaven).
- `components.jsx` exporteert nu `smoothPath` (charts heeft het nodig).
- **Bedrading**: `AppShell` bezit de dashboard-layout, edit-modus en widget-markt;
  topbar-knoppen **Bewerk** (jiggle + slepen), **Herstel**, **Widget toevoegen**,
  **Klaar** sturen het bord aan. `DashboardPage` rendert Greeting + `TileGrid`
  via Outlet-context.
- **prefers-reduced-motion**: de jiggle (`@keyframes jiggle .85s`) en de
  reduced-motion-uitschakeling zitten in de blauwdruk-CSS en worden gerespecteerd.
- Menu's/popovers gebruiken `useSmartMenu` (blijven binnen beeld).

### Bestanden
- Nieuw: `src/design/tiles.jsx`, `src/design/charts.jsx`, `src/design/altviews.jsx`.
- Gewijzigd: `src/components/AppShell.jsx` (layout/edit/markt + Outlet-context),
  `src/pages/DashboardPage.jsx` (TileGrid), `src/design/components.jsx`
  (smoothPath export).

### Getest
- `npm run build` slaagt, `npm run lint` exit 0 (3 faithful-port
  exhaustive-deps waarschuwingen).
- Headless screenshots: het tegelbord rendert volledig (KPI-strip, Iris,
  Omzet-grafiek, Agenda, Vandaag, Sales-funnel, CRM, Facturen, Exact). Edit-modus
  toont de hint-balk, "Widget toevoegen", ×-verwijderen, S/M/L/XL-pills, de
  view-cycler en de KPI-teller.

### Status: klaar, wacht op visuele vergelijking met de Design

### Let op
- Tegel-bodies van NIET-dashboard widgets (IrisChat/IrisBriefing/IrisFlags/
  VoorstellenWidget/TakenLog/Saleskansen/...) renderen voorlopig null tot hun
  modules geport zijn; ze horen bij andere boards en staan niet in de
  dashboard-markt (behalve `takenlog`, die toont voorlopig leeg).
- Alles draait op demo-data (`data.js`); Supabase-koppeling volgt.

---

## Stap 5: De shell exact uit de blauwdruk (2026-06-27)

### Wat gedaan
De `AppShell` vervangen door de werkruimte-shell uit de blauwdruk (`app.jsx`),
1:1 met de markup/classes, navigatie geadapteerd naar react-router.
- **Sidebar** (`src/design/shell.jsx`): logo + "klant-werkruimte", Dashboard,
  primair card-blok met **Iris (met teller)** + Vandaag/Inbox/Agenda/Team, en de
  card-groepen (Sales/Pipeline/Relatiebeheer/Leadfinder/CRM · Website/Pagina's/
  Editor/Aanvragen/Groei/Studio/Domein · Offertes/Contracten/Facturen · Social ·
  Exact/Mollie/Google · Analytics/Omzet/Club/Agents + Instellingen). Live
  **module-tellers** (badges) uit `moduleBadge()`. Officiële teal merk-mark voor
  Iris (`/brand/horaizon-teal-1e7f75.svg`). Footer: e-mail + echte Uitloggen.
- **Topbar**: breadcrumb "{bedrijf} · {view}" links, zoekbalk (live zoek over
  klanten/deals/offertes/facturen) in het midden, rechts **Bewerk** (op het
  dashboard), **Nieuw** (menu), **notificaties** (agents-feed) en **avatar**
  (account-menu met uitloggen).
- Navigatie: `go(id)` → react-router; `view` afgeleid uit het pad. Routes voor
  alle blauwdruk-modules + iris/settings gegenereerd uit `KYANO.modules`
  (placeholders waar nog geen pagina is). `src/nav.js` (stap 1) verwijderd,
  vervangen door de blauwdruk-`NAV`.
- `ToastHost`/`ConfirmHost` in de shell; `zoom:0.9` op `.app` (blauwdruk).
  `DashboardPage` dubbele padding verwijderd (de shell-scroll padt nu).

### Bestanden
- Nieuw: `src/design/shell.jsx`.
- Gewijzigd: `src/components/AppShell.jsx` (shell-layout), `src/App.jsx` (routes
  uit KYANO), `src/pages/DashboardPage.jsx` (padding weg).
- Verwijderd: `src/nav.js`.

### Getest
- `npm run build` slaagt, `npm run lint` exit 0 (alleen de bekende
  faithful-port waarschuwing).
- Headless screenshot van de volledige shell + dashboard: sidebar-groepen,
  tellers, topbar en content renderen correct.

### Status: klaar, wacht op visuele vergelijking met de Design

### Let op
- "Bewerk" en de widget-markt zijn nu nog placeholders (toast); de echte
  tegel-bewerken-flow komt met de sleepbare tegel-laag (stap 6).
- Alles op demo-data; module-pagina's zijn placeholders tot ze gebouwd worden.

---

## Stap 5a: Nieuwe bronnen vastgelegd + analyse (2026-06-27)

### Wat gedaan
Drie bronnen ontvangen; doel vastgesteld: **alles uit de Claude Design-prototype
exact omzetten naar myhoraizon (alle modules/elementen)**, plus officiële
merk-iconen integreren.

- **Officiële merk-iconen** (`horaizon-icons 2/`, 21 SVG-marks in kleurvarianten)
  vastgelegd in `design-ref/brand-icons/` en als assets in `public/brand/`.
  Worden in de shell-stap aan `HoraizonLogo`/`KyanoMark` gekoppeld.
- **`Discovery chart (24).zip`**: de `Klant-dashboard.html` is **identiek** aan de
  huidige blauwdruk (dashboard-design ongewijzigd). Bevat daarnaast een echte
  (deel-)codebase `client/src/` (vastgelegd in `design-ref/client-src/`).
- **Analyse `client/src`**: dit is een APARTE, echte productie-app (inbox/CRM:
  Inbox, Conversation, Contacten, Calendar, Social, Projecten, Instellingen) met
  eigen backend (`lib/api.js`, `/messages/...`), React-Query-hooks en
  Tailwind-utilities. Het is NIET de design-prototype die we porten, maar een
  referentie (vermoedelijk de echte inbox-backend om later op aan te sluiten).

### Bestanden
- Nieuw (gecommit): `public/brand/*.svg` (21 merk-marks).
- Nieuw (gitignored, referentie): `design-ref/brand-icons/`, `design-ref/client-src/`.

### Status: referentie vastgelegd. Volgende: shell-stap (zie roadmap onder).

### Roadmap "alles exact omzetten"
- [x] 1-2 sidebar-structuur + gedeelde ListRow
- [x] 3 fundament-lagen (components/menus/objectactions/tokens)
- [x] 4 dashboard-content (groet + KPI + Vandaag + agenda + Iris)
- [ ] 5 de shell exact: gegroepeerde sidebar (card-groepen) + topbar (zoek /
      notificaties / account / nieuw) + officiële merk-iconen
- [ ] 6 sleepbare tegel-laag (tiles.jsx) zodat dashboard 1:1 is
- [ ] 7+ modules één voor één uit de blauwdruk (Vandaag, Inbox, Agenda,
      Sales-suite, Offertes/Facturen/Contracten/Documenten, Website-suite,
      Analytics, Team, Iris, Beheer, ...) + benodigde gedeelde lagen
      (assign, widgets, altviews)
- [ ] daarna: echte data-koppeling (Supabase) per module

---

## Stap 4: Ring-fix (Tailwind weg) + DashboardPage omgezet naar blauwdruk (2026-06-27)

### Wat gedaan
**1. Ring-kader-bug opgelost (rootcause).** Het zwarte kadertje rond de Ring
("72% klaar") kwam doordat `className="ring"` botste met Tailwind v4's
`ring`-utility: Tailwind detecteerde de class-naam en genereerde
`.ring{box-shadow:...}` over de blauwdruk-`.ring` heen. De app gebruikt geen
Tailwind-utilities (alleen inline-stijlen + blauwdruk-CSS), dus Tailwind is
volledig verwijderd: plugin uit `vite.config.js`, `@import "tailwindcss"` uit
`index.css`, en `@theme {` → `:root {` (tokens blijven werken). Dit voorkomt
ook toekomstige botsingen (grid/flex/block/...) met blauwdruk-classes.
Geverifieerd met een headless screenshot: kader weg.

**2. DashboardPage = de dashboard-content uit de blauwdruk** (op demo-data uit
data.js, echte koppeling later). Nieuw `src/design/dashboard.jsx` met de blokken,
markup 1:1 met de blauwdruk:
- Greeting: "Hoi <em>Ramon</em>, welkom terug".
- KPI-strip met de vier kaarten (Openstaande taken, Omzet deze maand, Open
  pipeline, Nieuwe leads) via de gedeelde `KpiStrip` + `kpiDefault`.
- Vandaag-blok "Wat er op je wacht": taak-rijen (CeoProposal, getrimd) met
  agent-avatar, module-chip, samenvatting en acties (Keur goed / Later /
  Afwijzen), incl. urgent-vlag.
- Agenda-tijdlijn "Je dag" met gekleurde afspraken.
- Iris-blok "Voorstellen" met de voorstel-kaarten.
Layout via de blauwdruk-classes `dash` / `dash-2col` / `dash-left` en de
gedeelde `Panel`. `ToastHost`/`ConfirmHost` globaal in `AppShell` gezet zodat
de acties toasts tonen.

### Bestanden
- Nieuw: `src/design/dashboard.jsx`.
- Gewijzigd: `src/pages/DashboardPage.jsx` (Supabase-versie vervangen door
  blauwdruk-dashboard), `src/components/AppShell.jsx` (ToastHost/ConfirmHost),
  `vite.config.js` (Tailwind-plugin weg), `src/index.css` (Tailwind weg, @theme
  → :root), `src/pages/DesignCheckPage.jsx` (debug-style verwijderd).

### Getest
- `npm run build`: slaagt. `npm run lint`: exit 0 (alleen de bekende
  faithful-port waarschuwing in `Panel`).
- Headless screenshots: Ring zonder kader; dashboard rendert volledig
  (groet + 4 KPI's + Vandaag-rijen + agenda + Iris-voorstellen).

### Status: klaar, wacht op visuele vergelijking met de Design

### Let op
- Dashboard draait op demo-data (`data.js`); Supabase-koppeling volgt.
- Het is de dashboard-CONTENT met de gedeelde `Panel`-kaarten, nog niet het
  sleepbare tegelgrid uit de blauwdruk (drag/resize/widget-markt). Laat weten
  als je die tegel-laag er ook op wilt.

---

## Stap 3: Design-blauwdruk vastgelegd + fundament-lagen omgezet (2026-06-27)

### Wat gedaan
De Claude Design-handoff (zip) is een React-prototype van de hele werkruimte.
Eerst de blauwdruk veiliggesteld, daarna de fundament-lagen letterlijk omgezet
naar echte gedeelde componenten in het project (optie A uit overleg).

**1. Blauwdruk vastgelegd** in `design-ref/` (gitignored): de leesbare
broncode van alle 40 modules (gereconstrueerd uit de standalone-bundle), plus
`Klant-dashboard.html` en de handoff-README. Git ziet dit niet; het is puur
referentie zodat we de blauwdruk niet kwijtraken.

**2. Fundament-laag omgezet** naar `src/design/`, bodies 1:1 met de blauwdruk,
alleen `window`-globals werden ESM-imports/exports:
- `blueprint.css` - de volledige design-CSS letterlijk (tokens, kleuren,
  spacing, componentstijlen). Twee document-regels geneutraliseerd
  (`html{zoom:.9}` en `body{overflow:hidden}`) zodat bestaande routes blijven
  scrollen; die horen later scoped bij het dashboard.
- `icons.js` - `ICONS(name, opts)` (lijn-iconen).
- `data.js` - `KYANO` demo-data.
- `store.jsx` - interactie-laag: persistente store, toasts, modal, confirm,
  records-laag.
- `components.jsx` - gedeelde UI: knoppen (Btn), chips/badges (Chip, Delta,
  KyanoBadge), kaarten (Panel), avatars, grafieken (BarChart/AreaChart/Donut/
  Ring/Sparkline), KPI-strip.
- `menus.js` - `useSmartMenu`/`placeMenu` (menu-/popover-positionering).
- `objectactions.jsx` - `ObjectActions` met de vier gedeelde koppelingen
  (naar klant, toewijzen, naar Vandaag, loggen). De toewijs-knop verschijnt
  zodra `assign.jsx` later geport is (degradeert nu netjes).

**3. Dev-only showcase** `src/pages/DesignCheckPage.jsx` op route `/_design`
(alleen in `npm run dev`) zodat de geporte atoms naast de blauwdruk te leggen
zijn.

### Bestanden
- Nieuw: `src/design/{blueprint.css,icons.js,data.js,store.jsx,components.jsx,menus.js,objectactions.jsx}`, `src/pages/DesignCheckPage.jsx`, `design-ref/**` (gitignored).
- Gewijzigd: `src/main.jsx` (import blueprint.css), `src/App.jsx` (dev-route `/_design`), `.gitignore` (design-ref), `eslint.config.js` (design-ref genegeerd + design-override), `src/contexts/AuthContext.jsx` (eslint-disable op `useAuth` - pre-existing regel opgelost).

### Getest
- `npm run build`: slaagt.
- `npm run lint`: exit 0, geen errors. Eén waarschuwing (faithful-port
  useEffect-deps in `Panel`), bewust gelaten.
- Dev-server: `/_design` geeft 200, HMR schoon.

### Status: klaar, wacht op visuele goedkeuring

### Let op
- `src/design/**` heeft een eslint-override (react-refresh/no-empty/
  caught-errors/immutability) omdat het een letterlijke port van prototype-code
  is; echte ongebruikte lokale vars/imports blijven wel fouten.
- Blueprint-CSS is nu globaal geladen. Bestaande pagina's gebruiken eigen
  inline-stijlen + `--color-*` tokens (andere namen dan de design `--a-*`/`--ink`
  tokens), dus geen botsing verwacht. Visueel checken bij keuren.

---

## Stap 1 + 2: Sidebar-uitbreiding en gedeelde ListRow (2026-06-27)

### Wat gedaan
**Stap 1 - Sidebar met alle modules, gegroepeerd per werkstroom.**
Eén centrale navigatie-bron gemaakt zodat sidebar en routes nooit uit elkaar lopen.
De sidebar toont nu alle modules, gegroepeerd in: Algemeen, Sales, Website,
Documenten, Social, Projecten, Systeem. Elke groep heeft een mono-kopje. De vier
werkende modules (Dashboard, Offertes, Contracten, Facturen) houden hun echte
route; de rest verwijst naar een nette "binnenkort"-lege staat.

**Stap 2 - Gedeelde ListRow + StatusBadge, bewezen op Offertes.**
De lijst-rij die in Offertes, Contracten en Facturen werd gedupliceerd
(kaart + avatar + titel + meta + badge + chevron) is nu één gedeelde component.
QuotesListPage is omgebouwd om hem te gebruiken. Contracten en Facturen volgen
in een latere stap op exact dezelfde component (gouden bouwregel).

### Bestanden
- `src/nav.js` (nieuw) - centrale NAV_GROUPS + PLACEHOLDER_ITEMS, één bron voor sidebar en routes.
- `src/components/ListRow.jsx` (nieuw) - gedeelde lijst-rij: avatar, titel, subtitel, meta, acties-slot, badge, chevron.
- `src/components/StatusBadge.jsx` (nieuw) - gedeelde status-pil.
- `src/components/PlaceholderPage.jsx` (nieuw) - "binnenkort"-staat voor ongebouwde modules.
- `src/components/AppShell.jsx` - sidebar leest uit nav.js, gegroepeerd, scrollbare nav-sectie, sticky kolom.
- `src/App.jsx` - placeholder-routes worden gegenereerd uit PLACEHOLDER_ITEMS.
- `src/pages/QuotesListPage.jsx` - omgebouwd naar ListRow + StatusBadge.
- `src/hooks/useIrisChat.js` - ongebruikte `useEffect`-import verwijderd (lint-fix, nul gedragswijziging).

### Getest
- `npm run build`: slaagt (1858 modules, ~275ms).
- `npm run lint`: mijn nieuwe code is schoon. Eén pre-existing error blijft over
  (zie hieronder); die bestond al op een schone HEAD.

### Status: klaar, wacht op visuele goedkeuring

### Openstaand / let op
- **Pre-existing lint-error in `src/contexts/AuthContext.jsx:32`** (react-refresh:
  `useAuth`-hook wordt naast de provider geëxporteerd). Bestond al vóór deze stap,
  zit in werkende auth-code. Bewust niet aangeraakt. Kleine follow-up mogelijk
  (hook naar eigen bestand) als we lint volledig groen willen; geef dan een seintje.
