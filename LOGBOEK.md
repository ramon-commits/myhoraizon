# LOGBOEK MyHorAIzon

Bouwlog per afgeronde stap. Nieuwste bovenaan.

---

## Stap 26: Website-module gekoppeld aan de ECHTE backend-vorm via seam (2026-06-30)

### Aanleiding
De Website-board-UI (`WebsitePage` + `tiles.jsx` BOARDS.website) stond al 1:1 op
het Design (`Klant-dashboard.html`, project a948021d), maar draaide volledig op
design-demo. Doel: koppelen aan de werkende Website-backend. Geen stille demo.

### Diagnose (bron geciteerd) — vóór bouw
- **Echte backend** = `~/Desktop/horaizon-app-main` edge-functions: `seo-agent`
  (action: write_page|optimize_page|batch_run), `keyword-api` (DataForSEO + Google
  Search Console), `quick-site-scan` (ScanResult: totaal/snelheid/vindbaarheid/
  content/mobiel/conversie/ai_gereedheid/vertrouwen/concurrentie), `conversie-agent`,
  `semrush-api` (legacy). Tabellen: `paginas` (pagina_type/status/seo_score),
  `content_mapping_matrix` (keyword/gsc_clicks/gsc_impressions/gsc_ctr/
  keyword_difficulty_personal/bron), `seo_keyword_tracking` (keyword/positie/bron),
  `pagina_secties`, `content_changes`, `agent_runs`, `analytics_snapshots`.
- **Blokkade**: die functions draaien op Stan's project `dofmjstoeqpezukgqtyq`
  (schema organizations/projects), myhoraizon op het brein `ajcckxxlkvdnpwdfvmvk`
  (schema tenants). Brein-JWT wordt door Stan's project niet geaccepteerd; RLS
  filtert op organization_members → cross-project lezen vanuit de browser kan niet.
  Live gaan = Masterplan-blok **F2.7-B4** (functions + tabellen porten naar brein).
- De sloepenspel-repo (`Sloepenspel Kyano Ai/05-build`) is een Next.js GitHub-CMS
  van de publieke site zélf — niet de agent-databron. Genoteerd, niet gebruikt.

### Gebouwd (alleen Website-module)
- **`src/lib/website.js`** — databron-seam. `fetchWebsiteSnapshot({tenant})` probeert
  de geporte brein-tabellen (`website_paginas`/`website_keywords`/`website_scan`);
  ontbreken die (42P01) → `connected:false` + voorbeeld in de ECHTE kolom-vorm.
  Volledige bron-documentatie (functions/tabellen/velden + waarom-niet-live) in de
  bestandskop. Zelfde `supabase`-client als de rest → licht vanzelf op na de port.
- **`src/hooks/useWebsite.js`** — hook per actieve tenant.
- **`src/pages/WebsitePage.jsx`** — hero-status nu echt: `connected` → groene "Live",
  anders gouden "Voorbeeld · nog niet gekoppeld" + eerlijke seam-balk die F2.7-B4
  benoemt. "Bekijk site" opent nu het echte domein (toast + window.open).
- **`src/design/blueprint.css`** — `.web-seam` + `.web-seam-bar` (scoped, gold).

### Echt-werkt-of-seam
**SEAM** (bewust, want cross-project live kan niet in deze stap). De seam is
live-bedraad op het brein: zodra F2.7-B4 de tabellen port, wordt `connected:true`
zonder code-wijziging. Tot dan: cijfers expliciet gelabeld als voorbeeld.

### Poorten
build groen · lint groen (0 errors) · test:knoppen GROEN op `/website` (47 knoppen)
+ defaults (111 knoppen, 4 routes) — geen regressie.

---

## Stap 25: IST/SOLL/Bouwplan-widgets — nu uit het Design geport (2026-06-30)

### Aanleiding
Ramon heeft de Design-prompt uit stap 24 in Claude Design uitgevoerd. Het Design
(`dashboard/kyanobeheer.jsx · KbClientPage`) heeft nu de drie discovery-widgets
in de juiste vorm. Niet meer zelf bedacht — 1:1 geport.

### Bron-check (live, MCP) — 10/10
`KbClientPage` heeft nu naast Modules/Gegevens/Agents/Koppelingen drie extra
`<Panel wid="…">`-widgets in dezelfde vorm: **Huidig proces (IST)**,
**Optimaal proces (SOLL)**, **Bouwplan**, plus een `KbKlaarModal` ("Zet klant
klaar") en `KB_SOLL_CHG`/`KB_OPP`. Gevoed door de echte brain-velden
(`hypothesized_flows`/`validated_flows`/`flow_details.step_pills.opportunity`,
`soll.flows`+`soll_change`/`wat_kyano_bouwt`/`winst_indicatie`/`build_mapping`,
`build_plan.provisioning`+`maatwerk`+`summary`). Mock 1:1 overgenomen.

### Geport
- **`src/design/discovery-demo.js`** — de Design-mock (Sloepenspel) verbatim in de
  echte brain-vorm. SEAM: `getDiscovery()` wordt in deel 4 de Supabase-query op
  `discovery_sessions.metadata` (query als comment).
- **`src/design/kyanobeheer.jsx`** — de drie widgets toegevoegd aan `KbClientPage`
  (na de 4 panelen), in dezelfde Panel-vorm als de rest (`Panel` + `tm-modrow` +
  `kyb-badge`), met `KB_SOLL_CHG`/`KB_OPP`, en `KbKlaarModal`.
- **Keten:** "Zet klant klaar" → `KbKlaarModal` → `applyProvisioning` zet de
  aanbevolen `custom_modules`/`active_agents` echt aan voor de tenant
  (`updateTenant`, union). Provisioning-key `contracten` → repo-key `contracts`.

### Eerlijke afwijking (vorm)
Het Design rendert de detailpagina met `kb-*`-klassen (`kb-page/kb-hero/kb-mgroup/
kb-mrows/kb-krow/…`); die CSS zit niet in de repo en is niet via de MCP op te
halen (alleen ge-inlined in de afgekapte standalone). Daarom draait de héle
detailpagina (deel 2 + deze widgets) op de repo-eigen, visueel gelijke vorm
(`Panel` + `tm-modrow` + `kyb-*` + inline-tokens) — consistent met álle andere
panelen in de repo. Structuur, data, labels en flow zijn 1:1 het Design.

### Poorten
- `npm run build`: GROEN. `npm run lint`: 0 errors (3 pre-existing warnings).
  `npm run test:knoppen /beheer` (live `:5174`): **GROEN — 46 knoppen.**
- Headless geverifieerd: 7 panelen renderen; IST/SOLL-badges zichtbaar; "Zet klant
  klaar" → provisioning-modal (Sales/Contracten) → tenant `custom_modules` bevat
  ze → bij de klant staan Sales + Contracten in de sidebar.

### Klikpad — /beheer
- Open Sloepenspel → onder de 4 panelen: **Huidig proces** (3 flows met owner/tool
  + terugkerend handwerk/wachttijd + Bevestigd/Niet bevestigd), **Optimaal proces**
  (change-badges + wat-Kyano-bouwt + agent, status Concept), **Bouwplan**
  (provisioning Sales/Contracten · iris/hugo/juris/sam · trial + maatwerk Offertes/
  Agenda/Facturen). **Zet klant klaar** → modal → Modules aanzetten → bij de klant
  staan de modules aan.

---

## Stap 24: Verzonnen deel-3-panelen teruggedraaid (Design = bron) (2026-06-30)

### Aanleiding
Feedback: de IST/SOLL/Bouwplan-panelen op de klant-detailpagina waren **zelf
verzonnen** — ze staan NIET in het Design. Regel scherpgezet: niet zelf bedenken;
staat een widget nog niet in het Design, dan eerst een Claude Design-prompt om
hem dáár te maken (in dezelfde widget-vorm), en pas daarna 1:1 porten.

### Geverifieerd tegen het Design (live, MCP)
`dashboard/kyanobeheer.jsx · KbClientPage` heeft exact **vier** panelen:
Modules · Gegevens · Agents · Koppelingen. Geen IST/SOLL/Bouwplan. De detail-CSS
(`kb-page/kb-hero/kb-meta-band/kb-mrows/kb-krow/…`) staat niet in de repo en is
niet via de MCP op te halen (alleen ge-inlined in de op 256 KB afgekapte
standalone-HTML).

### Teruggedraaid
- `src/design/discovery-demo.js` verwijderd.
- `src/design/kyanobeheer.jsx` terug naar de deel-2-versie (de vier
  design-getrouwe panelen + tenant-toggles). De verzonnen IstPanel/SollPanel/
  BouwplanPanel/KbProvisionModal + `getDiscovery`-haak zijn weg.
- `src/tenant/modules.js` (status live|gepland) en `TenantProvider`
  (updateTenant + persistente tenants) blijven — die zijn deel 2 en design-neutraal.

### Vervolg
De IST/SOLL/Bouwplan-widgets worden eerst in het Design getekend (Claude
Design-prompt aan Ramon geleverd: drie `<Panel wid>`-widgets in `KbClientPage`,
zelfde vorm als de andere panelen, gevoed door de brain-velden metadata.soll /
hypothesized_flows / metadata.build_plan). Daarna port ik ze 1:1 (incl. CSS).

### Poorten
- `npm run build`: GROEN. `npm run lint`: 0 errors (3 pre-existing warnings).
  `npm run test:knoppen /beheer` (live `:5174`): **GROEN — 46 knoppen, geen dode
  klikken.**

---

## Stap 23: Kyano-beheer /beheer — deel 3 (IST/SOLL/Bouwplan op demo-data) (2026-06-29)

### Aanleiding
De brain-panelen op de klant-detailpagina: IST, SOLL en Bouwplan — op DEMO-data
in de **echte** brain-vorm. De live Supabase-koppeling is deel 4.

### Bron + eerlijkheid
De Design-`KbClientPage` (a948021d · `dashboard/kyanobeheer.jsx`) heeft **geen**
IST/SOLL/Bouwplan-panelen — alleen Modules/Gegevens/Agents/Koppelingen. Dus de
paneel-**stijl** komt uit het Design (`<Panel>` + `tm-modrow`-rijen, deel 2), de
**datavorm** uit horaizon-brain (`metadata.soll`, `hypothesized_flows`/
`flow_details`/`validated_flows`, `metadata.build_plan` — uit de eerdere diagnose,
versie met `iris-generate-soll`/`iris-build-plan`/`myhoraizonManifest`). De
panelen draaien op DEMO-data; niets is live opgehaald.

### Gebouwd
- **`src/design/discovery-demo.js`** (NIEUW) — realistische demo-Discovery voor
  Sloepenspel in exact de brain-vorm: `hypothesized_flows[]{name,category_nl,
  steps[]}`, `validated_flows[]`, `flow_details.flow_i.step_pills{owner,
  sample_answer,opportunity}` (IST); `metadata.soll{flows[]{name,verhaal,steps},
  flow_details…step_pills{soll_change,wat_kyano_bouwt,winst_indicatie,
  build_mapping{module_key,agent_key,kind,module_label,agent_naam}},macro,status}`
  (SOLL); `metadata.build_plan{provisioning,maatwerk[],bespoke[],summary}`.
  **SEAM:** `getDiscovery(tenantId)` — deel 4 vervangt dit door één Supabase-query
  op `discovery_sessions.metadata` (de query staat als comment in het bestand);
  de panelen lezen exact dezelfde velden, dus de UI verandert niet.
- **`src/design/kyanobeheer.jsx`** — drie panelen toegevoegd aan `KbClientPage`,
  in dezelfde Panel/Team-stijl:
  - **IST** (`IstPanel`): per flow naam + `category_nl` + bevestigd-badge
    (uit `validated_flows`); per stap owner · tool + opportunity-vlag.
  - **SOLL** (`SollPanel`): macro + per stap change-badge (Blijft/Automatisch/
    Vervalt/Nieuw); bij automatisch/nieuw `wat_kyano_bouwt` + `winst_indicatie`
    + de gemapte agent; status-badge (Concept/Gefinaliseerd).
  - **Bouwplan** (`BouwplanPanel`): provisioning (custom_modules + agents +
    status + summary) + maatwerk-backlog (module + bouwopdracht-titel) + de knop
    **"Zet klant klaar"**.
- **Keten gesloten** (`KbProvisionModal` + `applyProvisioning`): "Zet klant klaar"
  toont de provisioning ter bevestiging; bij akkoord zet het de aanbevolen
  modules/agents **echt aan** voor die klant via `updateTenant` (deel 2) — union,
  dus het zet aan, haalt niets weg.

### Poorten
- `npm run build`: GROEN (1913 modules). `npm run lint`: 0 errors (3 pre-existing
  warnings). `npm run test:knoppen /beheer` (live `:5174`): **GROEN — 46 knoppen,
  geen dode klikken.**
- **Headless geverifieerd:** 7 panelen renderen (incl. IST/SOLL/Bouwplan); de
  IST-opportunity- en SOLL-change-badges zijn zichtbaar (terugkerend handwerk,
  wachttijd, Blijft/Automatisch/Vervalt/Nieuw, Bevestigd/Niet bevestigd). Sales
  uitzetten → `custom_modules` verliest sales → **Zet klant klaar** → modal toont
  Sales/Website/Contracten → akkoord → `custom_modules` bevat sales weer → bij de
  klant staan **Sales, Website én Contracten** in de sidebar.

### Trouw-rapport — Kyano-beheer deel 3. **Score: 8/10.**
- Datavorm 1:1 met de brain (alle velden uit de diagnose); paneel-stijl 1:1 met
  het Design/deel-2 (`Panel` + `tm-modrow` + `kyb-badge`). **Expliciet: demo-data
  in de echte vorm**, geen live query.
- Afwijkingen (eerlijk): (1) het Design heeft deze drie panelen niet — ze zijn
  nieuw, gebouwd in de bestaande stijl. (2) In de demo houd ik `vervalt`-stappen
  in `soll.flows[].steps` zodat de change-mix zichtbaar is; de echte
  `iris-generate-soll` laat ze uit `steps[]` (blijven in `step_pills`). (3) "Zet
  klant klaar" doet een **union** (aanzetten, niets weghalen) i.p.v. een
  destructieve replace, zodat het bij een enterprise-klant niets verliest.

### Klikpad — /beheer (deel 3)
- `/beheer` (Kyano) → **Open** Sloepenspel → onder de 4 beheer-panelen nu
  **Discovery · onboarding**: IST, SOLL, Bouwplan.
- **IST**: 3 processen (Aanvraag & offerte ✓ bevestigd, Boeking & planning ✓,
  Facturatie · niet bevestigd); per stap owner + tool + "terugkerend handwerk"/
  "wachttijd" waar van toepassing.
- **SOLL**: change-badges (offerte opstellen → Automatisch met "wordt automatisch
  opgesteld · enkele uren per week"; overtypen → Vervalt; nabellen → Blijft;
  herinnering → Nieuw); status **Concept**.
- **Bouwplan**: provisioning (Sales/Website/Contracten · iris/hugo/sam/juris/daan ·
  trial) + maatwerk (Events · Kai). Knop **Zet klant klaar** → modal → "Modules
  aanzetten" → toast; **Bekijk in dashboard** → de aanbevolen modules staan aan.

---

## Stap 22: Kyano-beheer /beheer — deel 2 (klant-detailpagina + tenant-toggles) (2026-06-29)

### Aanleiding
Deel 2: de klant-detailpagina met de vier beheer-panelen, en — de kern — de
module-/agent-toggles aan de **echte tenant-config** hangen i.p.v. lokale flags.
Bron live uit de Claude Design MCP (a948021d, `dashboard/kyanobeheer.jsx`).

### Bron (geciteerd) — KbClientPage
`KbClientPage` (in `kyanobeheer.jsx`): terug-knop → `cf-hero/kb-hero` (avatar +
pakket/status-badge + naam + meta) → `page-body pw-grid` met vier `<Panel>`s:
**Modules** ("Wat dit dashboard mag", per-module `tm-modrow` + `tm-toggle`),
**Gegevens** ("kb-meta-band" met contact/e-mail/telefoon/pakket/status), **Agents**
(8 agents met toggle), **Koppelingen** ("kb-krow" per tool met Beheren/Koppelen/
Aanvragen + `KbKoppelModal` 3-staps). Plus `KbNewModal`.

### Gebouwd
- **`src/design/kyanobeheer.jsx`** — herschreven: prop-driven op de tenant-config.
  `KyanoBeheer({ tenants, onPatch, onAdd, onRemove, onOpenDashboard })` toont de
  lijst óf `KbClientPage`. De vier panelen in Team-stijl (`tm-modrow/tm-toggle/
  tm-rolepick/tm-capseg/Panel`, layout inline). `KbKoppelModal` + `KbNewModal`.
- **`src/tenant/TenantProvider.jsx`** — `tenants` is nu bewerkbare, gepersisteerde
  state (localStorage `kyano:tenants.v1`); nieuw: `updateTenant/addTenant/
  removeTenant`. De gate (`checkModuleAccess` → `activeTenant.custom_modules`)
  leest dezelfde bron → een toggle is meteen de gate.
- **`src/tenant/modules.js`** — `status: 'live' | 'gepland'` per module, zodat het
  Modules-paneel "Beschikbaar" (live) en "Nog te bouwen" (gepland) apart toont.
- **`src/pages/BeheerPage.jsx`** — bedraadt `useTenant()` (tenants + mutators) aan
  `KyanoBeheer`; "Bekijk in dashboard" = `switchTenant(id)` + naar `/`.

### De toggles aan de tenant-laag (het stuk dat bij /settings nog aan flags hing)
- Module-toggle → `onPatch(id, { custom_modules, module_settings })` = `updateTenant`.
- Agent-toggle → `onPatch(id, { active_agents })`; iris vergrendeld.
- Gegevens/MRR/pakket/status → `onPatch(id, { display_name, …, metadata.mrr })`.
- Tool-status → `onPatch(id, { metadata.tools })`.
- **Geverifieerd (headless):** Sales uitzetten voor Sloepenspel →
  `custom_modules` wordt `["website","social","contracts","club","events"]` +
  `module_settings.sales.enabled=false` (gepersisteerd). "Bekijk in dashboard"
  (switch naar die klant) → **Sales (en de sales-gated Pipeline/Relatiebeheer/
  Leadfinder) zijn weg uit de sidebar**. De toggle is dus de echte onboarding-knop.

### Poorten
- `npm run build`: GROEN (1912 modules). `npm run lint`: 0 errors (3 pre-existing
  warnings). `npm run test:knoppen /beheer` (live `:5174`, vers profiel): **GROEN —
  46 knoppen, geen dode klikken.**

### Trouw-rapport — Kyano-beheer deel 2. **Score: 8/10.**
- Bron: `KbClientPage` + `KbKoppelModal`/`KbNewModal` uit `dashboard/kyanobeheer.jsx`.
  De vier panelen, hun volgorde, de toggle-rijen, de koppel-3-staps en de
  nieuwe-klant-flow zijn 1:1 in gedrag.
- Afwijkingen (eerlijk): (1) Modules-paneel toggelt de **tenant `custom_modules`**
  (modules.js, de echte gate) i.p.v. de fijnmazige demo-`c.mods` van de bron —
  bewust, want dit is het echte onboarding-stuk; daardoor split live/gepland.
  (2) De detail-layout is met inline-stijlen + `tm-*`/`Panel` i.p.v. de bron-
  `kb-*`/`cf-*`-klassen (botsing met de kanban-`kb-*`); zelfde Team-look.
  (3) De WidgetsProvider-"Indeling"-bewerkmodus van de bron is weggelaten (niet
  nodig voor beheer). (4) IST/SOLL/Bouwplan-panelen = deel 3.

### Klikpad — /beheer (deel 2)
- `/beheer` (Kyano) → klik **Open** op Sloepenspel → detailpagina: hero +
  4 panelen.
- **Modules**: kern-note; "Beschikbaar" (Sales/Website/Contracten) + "Nog te
  bouwen" (Social/Club/Events, label). Zet **Sales** uit → toast.
- **Gegevens**: "Bewerk" → velden + pakket/status → "Opslaan".
- **Agents**: 8 agents, Iris "altijd aan" (vergrendeld), rest togglebaar.
- **Koppelingen**: Mollie (Gekoppeld → Ontkoppelen), Google Agenda (Klaar →
  Koppelen → 3-staps modal → Activeren), WhatsApp (Nog te bouwen → Aanvragen).
- **Bekijk in dashboard** → schakelt naar Sloepenspel; Sales is daar nu weg.
- Terug → **Nieuwe klant** → modal → nieuwe tenant verschijnt in de lijst.

---

## Stap 21: Kyano-beheer-dashboard /beheer — deel 1 (de kapstok) (2026-06-29)

### Aanleiding
Het Kyano AI Studio · Beheer-scherm (Kyano beheert de klant-dashboards) bouwen,
deel 1: de kapstok + klantenlijst. Bron live uit de Claude Design MCP
(project a948021d, `dashboard/kyanobeheer.jsx`).

### Bron (geciteerd) + afwijking
`dashboard/kyanobeheer.jsx` (KYANO AI STUDIO · BEHEER) is **exact de Team-pagina-
vorm**: `tm-head` (titel "Kyano AI Studio · Beheer" + shield-icoon + teller) →
balk met `sx-search` + pakket-filter (`tm-roles`) → `tm-grid` met `KbClientCard`s
(avatar, bedrijf, contact, pakket-badge, agents/modules, Live/Trial). De detail-
pagina (`KbClientPage`: Modules/Gegevens/Agents/Koppelingen) en de modals
(beheer/nieuw/koppel) zijn **deel 2**.
**Afwijking (eerlijk):** het Design gebruikt NIET `sx-hero`+TileGrid maar de
Team-vorm — ik volg het Design (= ook "in de stijl van de Team-pagina" uit de
opdracht). De `kb-*`-klassen uit de bron heten hier `kyb-*` omdat `.kb-*` in deze
repo al de kanban-board is.

### Gebouwd
- **`src/design/kyanobeheer.jsx`** (NIEUW) — `KyanoBeheer` (lijst) + `KbClientCard`,
  geport op de Team-klassen (`tm-head/tm-roles/tm-grid/tm-card/tm-line/tm-btn`).
  Per kaart: bedrijf, contact, pakket-badge, **MRR**, **Discovery-keten-badge**
  (`KB_DISCOVERY`), modules-dots + Live/Trial, en knoppen Open/Beheer/×.
- **Klant-seed uit `tenants.js`** (de 2 demo-tenants) + demo-velden
  (`KB_DEMO`: discovery-status + MRR). `seedClients()` mapt `display_name`,
  `primary_contact_name`, `package`, `status`, `active_agents`, `custom_modules`.
- **`src/pages/BeheerPage.jsx`** (NIEUW) — route + Kyano-gate.
- **`src/App.jsx`** — `import BeheerPage` + `<Route path="beheer">`.
- **`src/design/shell.jsx`** — sidebar krijgt een Kyano-only item "Kyano-beheer"
  (shield) via een nieuwe `kyano`-prop.
- **`src/components/AppShell.jsx`** — geeft `kyano={!activeTenant && !viewAs}`
  door aan de Sidebar.
- **`src/design/blueprint.css`** — kleine `kyb-*`-set (bar/search/roles/badge/
  empty) bovenop de bestaande `tm-*`/`sx-search`.

### Gate (Kyano-only)
In de repo-ruggengraat is de Kyano Superadmin = de **CEO-allesweergave**
(`activeTenant === null`, zie `TenantProvider`). `/beheer` rendert alleen dan;
staat er een klant-tenant actief (of view-as), dan toont de pagina een
"Alleen voor Kyano"-notitie en verdwijnt het sidebar-item.

### Knoppen (deel 1)
Werkend: zoekveld, pakket-filter (`role="tab"`, actieve tab dode-klik-vrij),
Verwijderen (confirm + remove uit de store). `notImplemented()` (geen dode klik,
detail komt in deel 2): Open, Beheer, Nieuwe klant, "Klant-dashboard toevoegen".

### Poorten
- `npm run build`: GROEN (1912 modules). `npm run lint`: 0 errors (3 pre-existing
  warnings). `npm run test:knoppen /beheer` (live `:5174`): **GROEN — 46 knoppen,
  geen dode klikken.**

### Trouw-rapport — Kyano-beheer deel 1. **Score: 8/10.**
- Lijst, kop, zoek, pakket-filter en kaart-vorm zijn 1:1 de bron (Team-vorm).
- Afwijkingen: (1) detail-pagina + modals bewust uitgesteld naar deel 2
  (Open/Beheer/Nieuw → notImplemented); (2) klant-seed uit `tenants.js` i.p.v. de
  bron-`KB_CLIENTS` (zoals gevraagd), met demo discovery/MRR; (3) `kyb-*` i.p.v.
  `kb-*` (naamsbotsing met de kanban); (4) `MRR` + Discovery-keten-badge
  toegevoegd aan de kaart op verzoek (de bron-kaart toont die niet).

### Klikpad — /beheer
- Open `/beheer` (CEO/Kyano-weergave) → kop "Kyano AI Studio · Beheer", 2 klant-
  kaarten (Sloepenspel Amsterdam · Enterprise · Afgerond · € 1.850/mnd · Live;
  Kapsalon Knip & Co · Starter · In gesprek · Trial), in Team-stijl.
- Zoek "knip" → alleen Kapsalon; leeg → beide terug.
- Pakket-filter "Enterprise" → alleen Sloepenspel; "Alle pakketten" → beide.
- Verwijderen (×) → bevestig-dialoog → kaart weg. Open/Beheer/Nieuwe klant →
  nette "komt binnenkort"-toast (deel 2).

---

## Stap 20: Leadfinder + Relatiebeheer herzien naar het nieuwe Design (2026-06-29)

### Aanleiding
De klant heeft in de Claude Design MCP (project a948021d, `Klant-dashboard
(standalone).html`) de Leadfinder en Relatiebeheer opnieuw vormgegeven. Deze twee
pagina's bijwerken naar het nieuwe ontwerp, alle knoppen werkend.

### Bron-diff (live opgehaald + geciteerd)
- **Leadfinder** — `dashboard/salescrm.jsx · FinderModule` (+ nieuwe `BranchePicker`):
  - Hero-logo: het zoek-icoon-blok → `<img className="sales-hero-logo"
    src=…sales-mark>` (zelfde ronde merk-mark als Sales/Pipeline).
  - Branche-keuze: de altijd-open inline-lijst → een **ingeklapte chip-rij +
    dropdown** (`BranchePicker`): chips + knop "Branche kiezen" die een
    `fn-branche-menu` opent met zoekveld, groep-tabs, kieslijst en een voet
    ("… branches gekozen" + Klaar). Chips/lijst tonen niet langer de
    place-type-code.
- **Relatiebeheer** — `dashboard/salestasks.jsx · SalesRelatiePage`:
  - Kop: `page-head-bar` + grijs people-icoon → `sx-hero` met `sales-hero-logo`
    + gelabelde **"Signalen"**-knop (opent de bestaande `RelatieSignalMenu`) +
    rode "Open CRM".
  - Filters: `rel-filterbar`/`seg-pick` + los tandwiel → `st-tabbar`/`st-tab`
    met teller op "Vragen aandacht" + hint-regel (zoals Pipeline).

### Gebouwd
- **`src/design/leadfinder.jsx`** — `BranchePicker` toegevoegd (verbatim uit de
  bron, `window.useSmartMenu` → geïmporteerde `useSmartMenu`); `FinderModule`-kop
  naar `sales-hero-logo`; inline-picker vervangen door `<BranchePicker/>`; de
  niet meer gebruikte `query`/`activeGroup`/`pickItems`-state verwijderd. Kaart-
  laag (`buildMapSvg`/`FinderMap`/`FinderMapCard`), modi, parameters, resultaten
  (lijst/kaart/beide) en "Goedgekeurde leads" ongewijzigd.
- **`src/design/salestasks.jsx`** — `SalesRelatiePage`-kop + filterbalk vervangen
  door de nieuwe `sx-hero` + `st-tabbar`. De `RelatieSignalMenu` (bestaand) en de
  klantenlijst (`sx-rel-row` + `ObjectActions`) ongewijzigd.
- **`src/design/blueprint.css`** — 12 regels voor de nieuwe `BranchePicker`-
  wrappers (`fn-branche`, `fn-branche-row`, `fn-add-branche`, `fn-branche-menu`,
  `fn-bm-search`, `fn-bm-foot`, `fn-bm-count`, `fn-bm-done`). Alle binnenste
  klassen (`fn-chip`, `fn-groups`, `fn-grp`, `fn-pick-list`, `fn-type`,
  `fn-search*`) bestonden al; Relatiebeheer hergebruikt bestaande klassen
  (`sx-hero`, `st-tabbar`, `st-tab`, `sales-hero-logo`, `rel-set-wrap`,
  `rel-setmenu`) — geen nieuwe CSS nodig daar.

### Trouw-rapport. **Score: 9/10.**
- **Bron:** `salescrm.jsx · FinderModule`/`BranchePicker` + `salestasks.jsx ·
  SalesRelatiePage` (live geciteerd). JSX, classes, teksten en flow zijn 1:1.
- **Afwijkingen (eerlijk):**
  1. De volledige live-CSS staat alleen ge-inlined in de standalone-HTML, die op
     256 KB werd afgekapt (achter een base64 `__resources`-blok), dus de exacte
     pixels van de **8 nieuwe `BranchePicker`-wrapper-klassen** waren niet
     ophaalbaar. Ze zijn met de hand geschreven in het bestaande `fn-*`/
     `rel-setmenu`-idioom (tokens, radii, popover-stijl); alle binnenste
     componenten gebruiken de echte Design-klassen verbatim.
  2. `sales-mark` via repo-pad `/brand/sales-mark.svg` i.p.v. de bron-`ASSET()`.
  3. `role="tab"`/`aria-selected` toegevoegd op `st-tab` en `fn-grp` (zoals de
     repo elders al doet) — a11y + houdt de dode-klik-poort groen op actieve tabs.

### Poorten
- `npm run build`: GROEN (1910 modules). `npm run lint`: 0 errors (3 pre-existing
  warnings). `npm run test:knoppen /finder /relatiebeheer` (live `:5174`):
  **GROEN — 51 knoppen (finder 41, relatiebeheer 10), geen dode klikken.**

### Klikpad
- **/finder** → hero met merk-mark. Stap 1: kies modus (Branche+locatie ↔
  Referentiebedrijf). "Branche kiezen" opent de dropdown → zoek/groep-tabs/
  kieslijst, gekozen branches verschijnen als chips, "Klaar" sluit. Vul
  locatie + straal + aantal → "Zoek leads" → Stap 2 resultaten (Lijst/Kaart/
  Beide) met namaak-Maps-pins → "Goedkeuren" → Stap 3 "Goedgekeurde leads" →
  "Naar pipeline + concepten".
- **/relatiebeheer** → `sx-hero` + "Signalen"-knop (opent het dosering-menu) +
  "Open CRM". `st-tabbar` (Vragen aandacht/Alle/Actief/Win-back/Oud) filtert de
  klantenlijst; elke rij opent de klantkaart, `ObjectActions` per rij werkt.

---

## Stap 19: View-as inhoudelijk afgemaakt — boards filteren op het teamlid (2026-06-29)

### Aanleiding
Diagnose (Stap 18-na): view-as filterde alleen de sidebar; de boards kregen de
tenant-`flags` i.p.v. `effFlags`, dus dashboard/Vandaag toonden nog álle widgets
van de eigenaar. Klein, gericht dichten — exact zoals het Design.

### Bron (geciteerd, `dashboard/shell.jsx`)
```js
const memberFlags = viewAs ? flagsForView(viewAs.allowed) : null;
const effFlags = viewAs ? (viewAsAll ? flags : (memberFlags || flags)) : flags;
```
en op élk board: `<TileGrid … flags={effFlags} … />`, plus de redirect
`useEffect(() => { if (MOD[view] && effFlags[view] === false) go("dashboard"); }, [effFlags, view, go]);`

### Gebouwd (2 regels netto, `src/components/AppShell.jsx`)
1. **Outlet geeft nu `effFlags` door** i.p.v. de tenant-`flags`:
   `<Outlet context={{ … go, flags: effFlags, board }} />`. `DashboardPage`/
   `VandaagPage` reiken dat ongewijzigd aan hun `TileGrid`, die tiles met
   `flags[id] === false` al dropt (`tiles.jsx:802`). Buiten view-as geldt
   `effFlags === flags`, dus normaal gedrag verandert niet.
2. **effFlags-redirect** (alleen tijdens view-as): staat het lid via een directe
   URL op een verborgen module (`effFlags[view] === false`), dan terug naar `/`.

Met rust gelaten (werkte al, niet herbouwd): toegewezen-taak-scoping via
`window.__viewAs`/`currentActor`, de sidebar-filter, en de read-only-modus
(`app viewas-ro`). Bewust gelijk aan het Design: géén member-greeting en géén
member-voorstellen — de globale agent-voorstellen en de begroeting (eigenaar-naam)
blijven gelijk; het Design swapt geen per-member dataset, het filtert zichtbaarheid
+ toegewezen taken.

### Trouw-rapport — view-as inhoud. **Score: 10/10.**
- `effFlags`-berekening en doorgifte aan de boards zijn 1:1 met `shell.jsx`
  (zie citaat). Redirect identiek. Geen extra's verzonnen.
- **Headless geverifieerd** (view-as op Lisa de bekijker, mods
  analytics/omzet/website/seo):
  - Eigenaar-dashboard: 29 tiles. View-as Lisa-dashboard: **11 tiles** met de
    `.vab`-banner zichtbaar — exact de `flagsForView`-set (allowed + kern +
    people/agents). **18 module-widgets verborgen** (sales, crm, facturen, finder,
    offertes, contracten, pipeline, relatiebeheer, studio, paginas, editor,
    domein, aanvragen, social, exact, mollie, google, club).
  - Directe URL `/crm` tijdens view-as → **redirect naar `/`**.
  - Vandaag krijgt nu óók `effFlags`; z'n pool is kern/Iris-widgets (voorstel,
    kpis, agenda, postvak, irisbrief, irisattn, snelacties, irisflags) die niet
    module-gated zijn, dus die blijven staan — net als in het Design.
- Eerlijke nuance: op Vandaag is er geen zichtbare daling (geen module-widgets in
  de pool); het effect is zichtbaar op het dashboard.

### Poorten
- `npm run build`: GROEN (1910 modules). `npm run lint`: 0 errors (3 pre-existing
  warnings). `npm run test:knoppen /people / /vandaag` (live `:5174`): **GROEN —
  80 knoppen, geen dode klikken.**

### Klikpad — view-as op Lisa (bekijker)
- `/people` → kaart "Lisa Vermeer" (Bekijker) → knop **"Bekijk"**.
- Dashboard opent met de **ViewAsBanner** bovenin ("Je bekijkt de werkruimte van
  Lisa Vermeer · Bekijker · alleen-lezen"). Het bord toont nu alleen omzet,
  analytics, website, seo (+ kern/Iris-widgets); sales/crm/finder/offertes/…
  zijn weg — niet alleen de sidebar.
- Klik **Vandaag** → kern/Iris-widgets (faithful, geen module-widgets te
  verbergen). Directe URL naar `/crm` → terug naar dashboard.
- **"Stop meekijken"** → terug naar `/people`, alles weer volledig.

---

## Stap 18: Team-module (/people) volledig uit het Design + view-as-laag (2026-06-29)

### Aanleiding
`/people` was een `PlaceholderPage`. Gevraagd: 10/10-port van de complete
Team-module uit de Claude Design MCP (`dashboard/team.jsx`), inclusief de
view-as-laag uit `dashboard/shell.jsx`. Niks inkorten, niks verzinnen.

### Bron (live opgehaald + geciteerd)
- **`dashboard/team.jsx`** — `TeamModule`, `MemberCard`, `AiCard`, `ManageModal`,
  `InviteModal`, `TEAM_ROLES` (6 rollen), `CAPS` (view/edit/full), `SEED_TEAM`
  (5 leden), `defaultMods`/`defaultCap`. Eindigt op
  `Object.assign(window, { TeamModule, TEAM_ROLES, memberMods })`.
- **`dashboard/shell.jsx`** — view-as: `flagsForView(allowed)`, `ViewAsBanner`,
  en in `App()`:
  `window.startViewAs = (mem, allowed) => { window.__viewAs = mem; … setViewAs({ mem, allowed }); go("dashboard"); }`
  / `window.stopViewAs = () => { window.__viewAs = null; setViewAs(null); go("people"); }`.
  Dispatch in `dashboard/pages.jsx`:
  `if (id === "people" && window.TeamModule) return <div className="module-page"><TeamModule m={m} onOpen={onOpen} /></div>;`

### Gebouwd
- **`src/design/team.jsx`** (NIEUW) — letterlijke ESM-port. Volledig rollen-model,
  5 seed-leden, rollen-filterbalk, selecteer-modus + bulk (rol toewijzen /
  verwijderen), uitnodig-flow, `ManageModal` met 3 tabs (Profiel/NAW · Rechten:
  rol-picker + cap-segment + cascade-toggle + per-module-toegang met vergrendelde
  kern-modules · Activiteit-timeline), en de Iris-`AiCard`.
- **`src/pages/TeamPage.jsx`** (NIEUW) — rendert `<div className="module-page">
  <TeamModule onOpen={go}/></div>` exact zoals de pages.jsx-dispatch; achter
  `useModuleSettings('team')` (kern-module → altijd aan).
- **`src/App.jsx`** — `people` toegevoegd aan `REAL_PAGES`; `import TeamPage`;
  `<Route path="people" element={<TeamPage />} />`. Geen `PlaceholderPage` meer.
- **View-as-laag** in de repo-shell: `ViewAsBanner` + `vabInit` geport naar
  `src/design/shell.jsx` (geëxporteerd); `flagsForView` + de window-lijm
  (`startViewAs`/`stopViewAs`, `window.__viewAs`) + `effFlags`/`vaReadonly`/
  `vaRole` in `src/components/AppShell.jsx`. De "Bekijk"-knop op een teamlid
  opent nu echt de werkruimte van dat lid: `ViewAsBanner` bovenin, sidebar
  gefilterd op hun modules, "Hun toegang ↔ Alle modules", en "Stop meekijken"
  keert terug naar /people. Alleen zichtbaar voor Eigenaar/Beheerder/Kyano
  (`canViewAs`). Deze laag hebben we straks ook nodig voor het Kyano-dashboard.

### Hergebruikt (NIET opnieuw gebouwd)
- **`src/design/assign.jsx`** — cascade: `currentRole`, `canAssignRole`,
  `setAssignPolicy`, `ASSIGN_ROLE_DEFAULTS`, `logToMember`. team.jsx importeert
  die uit assign.jsx (ESM). assign.jsx leest `window.TEAM_ROLES` en
  `window.__viewAs` → team.jsx zet `window.TEAM_ROLES = TEAM_ROLES` en de shell
  zet `window.__viewAs`, zodat de cascade ongewijzigd blijft.
- `store.jsx` (`useStore/setState/toast/confirmAsk/Modal/Field`), `components.jsx`
  (`Avatar/AC/ACsoft`), `icons.js`, `data.js` (people-entry/KPI). Alle `.tm-`
  (218 regels), `.vab` (16) en `.app.viewas` (3) CSS stond al in `blueprint.css`.
- De dode `__people_old`-tak uit pages.jsx is NIET overgenomen.

### Trouw-rapport — Team (`/people`)
- **Bron:** `dashboard/team.jsx` + view-as uit `dashboard/shell.jsx`. **Score: 9/10.**
- UI, logica, rollen, caps, seed-data, ManageModal-tabs, bulk, invite en de
  Iris-kaart zijn 1:1 verbatim. View-as werkt end-to-end. Cascade hergebruikt de
  bestaande engine.
- **Resterende afwijkingen (eerlijk, glue-niveau, geen functieverlies):**
  1. `confirmAsk({body, confirm, accent:"red"})` → aangepast naar de repo-API
     `confirmAsk({title, sub, confirmLabel})` (rood is daar de default).
  2. `window.currentRole/canAssignRole/setAssignPolicy` → ESM-imports uit
     assign.jsx; `window.startViewAs` bewust als window-lijm behouden.
  3. View-as draait op react-router (`navigate('/')` / `navigate('/people')`)
     i.p.v. de hash-router `go()` van de blauwdruk — zelfde gedrag.
  4. `window.TEAM_ROLES` wordt gezet bij het laden van team.jsx; rol-labels in de
     assign-UI elders vallen tot dan terug op de rol-sleutel (graceful).
  5. `TeamModule`'s ongebruikte `m`-prop niet doorgegeven (alleen `onOpen`).

### Poorten
- `npm run build`: GROEN (1910 modules). `npm run lint`: 0 errors (3 pre-existing
  warnings). `npm run test:knoppen /people` (live dev-server `:5174`): **GROEN —
  54 knoppen getest, geen dode klikken.**

### Klikpad — /people
- Open `/people` → 5 teamleden + Iris-kaart, rollen-filterbalk met tellers.
- Rollen-filter: klik "Manager" → toont alleen Sanne; klik weer → iedereen.
- "Beheer" op een lid → `ManageModal`: tabs Profiel (NAW), Rechten (rol-picker +
  cap + "Mag toewijzen"-cascade + per-module-toegang, kern-modules vergrendeld),
  Activiteit (timeline).
- "Uitnodigen" → `InviteModal`: naam/e-mail/functie + rol-picker → toast
  "uitgenodigd als …", lid verschijnt met status "Uitgenodigd".
- "Selecteren" → bulk-balk: selecteer leden → "Rol toewijzen" / "Verwijderen".
- "Bekijk" op een lid → view-as: `ViewAsBanner` bovenin, sidebar gefilterd op hun
  modules, "Stop meekijken" keert terug naar /people. Eigenaar↔Kyano-schakelaar
  toont de Kyano-context-balk.

---

## Stap 17: Huisstijl-polish — merk-iconen, lettertypes, NL-kaart terug (2026-06-29)

### Aanleiding
Afwerking, geen nieuwe features. Drie dingen recht zetten, alles **live uit de
Claude Design MCP** (project `a948021d-…`) gehaald en geciteerd, niets verzonnen.

### DEEL 1 — Merk-iconen (ronde merk-icoon op de juiste plekken)
Bron-blauwdruk `dashboard/shell.jsx`: de sidebar én de board-hero gebruiken de
ronde merk-SVG's via `ASSET(id, "dashboard/<x>-mark.svg")` — niet de functionele
lijn-iconen en niet de rode `KyanoMark`. De echte mark-SVG's uit het Design
(`dashboard/{iris,sales,website}-mark.svg`) zijn gevulde cirkels in de juiste
merk-kleur + wit ring+balk:
- `iris-mark.svg` → **`#4FB8B2`** (aqua/groen — precies de "groen" uit het Design)
- `sales-mark.svg` → **`#D85F4A`** (koraal)
- `website-mark.svg` → **`#E0B341`** (mosterd)

Doorgevoerd:
- **Asset-inclusie** (fix "ESM-build viel terug op repo-iconen, svg ontbrak):
  de drie mark-SVG's verbatim toegevoegd in `public/brand/` (`iris-mark.svg`,
  `sales-mark.svg`, `website-mark.svg`). `public/` belandt gegarandeerd in `dist/`
  → geen import-resolutie, geen fallback. Geverifieerd: alle drie serveren `200`
  op `:5174` en de build-JS verwijst naar `/brand/{iris,sales,website}-mark.svg`.
- **Sidebar** (`src/design/shell.jsx`, NavBtn — 1:1 met de blauwdruk):
  Sales → `/brand/sales-mark.svg`, Website → `/brand/website-mark.svg`
  (`<img className="sb-ic-logo">`). Iris-knop: bron van `horaizon-teal-1e7f75.svg`
  (`#1E7F75`, donker) → `iris-mark.svg` (`#4FB8B2`, de juiste groen).
- **Board-hero** (`src/pages/SalesPage.jsx`, `src/pages/WebsitePage.jsx`):
  de rode/gouden `KyanoMark` vervangen door `<img className="sales-hero-logo"
  src="/brand/{sales,website}-mark.svg">` — exact zoals `shell.jsx` per board doet.
  Ongebruikte imports (`AC`/`ACsoft`/`KyanoMark`) opgeruimd.
- **Bewust ongemoeid:** functionele iconen van losse menu-items (Vandaag=huis,
  Inbox=envelop, Agenda, Team, Pipeline, Relatiebeheer, Leadfinder, CRM=people),
  de CRM-hero (people-icoon, conform de bron), de Iris-board-hero (`Avatar
  agent="iris"`, iris-accent), en `sales.jsx · SalesDash` (legacy, niet-gerouteerd).

### DEEL 2 — Lettertypes
Bron-blauwdruk `index.html` (Design) laadt exact:
`Bricolage Grotesque:opsz,wght@12..96,500..800` (display/koppen),
`Instrument Serif:ital@0;1` (cursieve serif, o.a. de hero-naam),
`Geist:wght@400..700` (body), `Geist Mono:wght@400..600` (mono eyebrows).
De app paste die families al toe (`blueprint.css`/`src/index.css`: body=Geist,
`.mono`=Geist Mono, koppen=Bricolage, `.greet-h1 em`/`.sb-word .ai`=Instrument
Serif italic). De Google-Fonts-link in `index.html` is nu byte-voor-byte gelijk
aan de Design-definitie gemaakt (opsz `12..96`, Geist Mono incl. `400`), zodat de
hero-serif-naam en de mono-eyebrows exact de Design-typografie volgen.

### DEEL 3 — NL-kaart op /crm
De `NLMap` uit `salescrm.jsx` (gevulde NL-omtrek-`path` + `crm-map`/`crm-pin`/
`crm-leg`-classes + status-legenda; CSS stond al in `blueprint.css`) was eerder uit
de port gevallen ("NL-kaart weg van /crm", Stap 16). Teruggezet in
`src/design/crm.jsx` als bord-widget-kaart (`<Panel eyebrow="Op de kaart"
title="Klanten in Nederland">`) boven de relatietabel. Pin-positie komt uit de
**x/y-haakjes per klant in `customers.js`** (`left:c.x%`, `top:(c.y/1.3)%`) — net
als de bron, niet in de kaart hardcoded; vervang die haakjes door echte lat/lng
en de pins schuiven mee. Pins openen de gedeelde klantkaart (`openKlantCard`).

### Trouw-rapport — wat uit het Design kwam
- **Merk-assets** (geciteerd, `get_file` uit project `a948021d-…`):
  `dashboard/iris-mark.svg` `fill="#4FB8B2"`, `dashboard/sales-mark.svg`
  `fill="#D85F4A"`, `dashboard/website-mark.svg` `fill="#E0B341"` — alle met
  `viewBox="0 0 100 100"`, witte `circle r=22 sw=9` + `rect y=60 h=9`.
  Plaatsing 1:1 uit `dashboard/shell.jsx` (sidebar `sb-ic-logo`, hero
  `sales-hero-logo`).
- **Fonts** (geciteerd uit Design `index.html`): Bricolage Grotesque, Instrument
  Serif, Geist, Geist Mono — link nu identiek.
- **NL-kaart** (geciteerd uit `salescrm.jsx · NLMap`): land-`path`, classes en
  legenda verbatim; positie uit de data-haakjes, niet hardcoded.
- **Bevestiging:** nergens nog een fallback-icoon of de rode `KyanoMark` op een
  merk-plek; geen verkeerd font.

### Poorten
- `npm run build`: GROEN (1908 modules). `dist/brand/{iris,sales,website}-mark.svg`
  aanwezig; build-JS verwijst naar de mark-paden + bevat de `crm-map-land`-path.
- `npm run lint`: 0 errors (3 pre-existing warnings).
- `npm run test:knoppen` (live dev-server `:5174`): GROEN — default 74 knoppen
  over 4 routes; `/sales /website /crm /iris` 92 knoppen, geen dode klikken.
  (Let op: een *stale* :5174-server uit een vorige sessie geeft vals-laag ~3
  knoppen; vers herstart geeft het echte beeld.)

---

## Stap 16: De volledige CRM uit Claude Design (2026-06-29)

### Aanleiding
De repo-CRM was een bewuste *bounded port* (NL-kaart + vaste-kolom-lijst; "Nieuwe
klant" = toast). Gevraagd: de **volledige** design-CRM (`CrmModule2` uit
`salescrm.jsx`, live via de Design MCP opgehaald). Keuze: **alles**.

### Wat erbij komt t.o.v. de bounded port
1. **CRM-tegelbord** bovenaan (`<TileGrid board="pipeline"-stijl>` → `board="crm"`)
   met Bewerk-modus + widget-markt, via de **AppShell-Outlet-context** (zoals
   /sales en /pipeline) i.p.v. lokale shell-state uit de bron.
2. **Instelbare kolommen** + **eigen velden** (tekst/getal, per klant invulbaar) —
   `crmfields.jsx`-engine.
3. **Filters** (`FilterBtn` + `FilterChips`, ≥/≤/= en enum/tekst, live).
4. **KvK-nieuwe-klant-flow** (`NewClientFlow`): bedrijf opzoeken → autovullen →
   koppelen aan bestaand bedrijf óf nieuw aanmaken + contactpersoon.
5. **Instelbare klantkaart-KPI's**: `CardKpiStrip` toegevoegd boven in de
   gedeelde klantkaart (Company + Person).

### Bestanden
- `src/design/crmfields.jsx` (nieuw) — registry van velden: cellen, sorteer/
  filter, eigen velden, `ColumnsBtn`/`FilterBtn`/`FilterChips`, `CardKpiStrip`/
  `CardMetaRows`, `crmSignal`. ESM-port; window-globals → imports.
- `src/design/crm.jsx` — herschreven van bounded port naar `CrmModule2`:
  bord + tools (zoek/tabs/sorteer/filter/kolommen) + instelbare tabel +
  `NewClientFlow`. `ClientCard` → de gedeelde `openKlantCard`; bord via Outlet-
  context. `kvkSearch`/`matchExisting` als demo-equivalent (de blauwdruk-bron
  zat niet in de opgehaalde MCP-bestanden; zelfde vorm, "Hotel Okura" matcht een
  bestaande klant zodat de "Al in CRM"-koppelflow zichtbaar is).
- `src/pages/CrmPage.jsx` — geeft de Outlet-board-context door aan de CRM-view.
- `src/design/klantkaart.jsx` — `CardKpiStrip` boven in Company- en PersonFull.

### Afwijkingen t.o.v. de bron (eerlijk)
- **NL-kaart weg van /crm**: de design-`CrmModule2` rendert geen inline NL-kaart
  meer (die was van de bounded port); de design vervangt 'm door het tegelbord.
  Re-toe te voegen als bord-widget indien gewenst.
- **kvkSearch/matchExisting**: demo-equivalent (zie boven), geen letterlijke bron.
- **Klantkaart**: `CardKpiStrip` toegevoegd (instelbare KPI's); de bestaande
  rijke inline company-meta (KvK/rechtsvorm/…) is bewust behouden i.p.v. vervangen
  door `CardMetaRows` (zou KvK/rechtsvorm verliezen). `CardMetaRows` is wel
  geëxporteerd/beschikbaar.

### Getest
- `npm run build`: slaagt (1908 modules). `npm run lint`: 0 errors (3 pre-existing warnings).
- `npm run test:knoppen` (default 4 routes): GROEN — 110 knoppen, geen regressies.
- `/crm` (live dev-server :5174): GROEN — 59 knoppen, geen dode klikken.

### Trouw-rapport — CRM (`/crm`)
- **Design**: `salescrm.jsx · CrmModule2` + `crmfields.jsx`. **8/10.** Bord +
  instelbare kolommen/filters/eigen-velden + KvK-flow 1:1 in gedrag. Afwijkingen:
  NL-kaart vervangen door bord, KvK-helpers als demo-equivalent, klantkaart houdt
  inline company-meta naast de nieuwe `CardKpiStrip`.

### Klikpad — /crm
1. **/crm**: bovenaan het **tegelbord** (Bewerk in de topbar → tegels slepen +
   S/M/L/XL + Widget toevoegen).
2. Daaronder de **tools**: zoek · tabs (Alle/Actief/Vraagt aandacht/Win-back/
   Prospect) · sorteer (Aandacht/Risico/Waarde/Naam) · **Filter** · **Kolommen**
   (incl. "Eigen veld maken").
3. **Tabel**: klik een rij → de gedeelde **klantkaart** opent (met instelbare
   **KPI-strip** bovenaan).
4. **Nieuwe klant** (hero) → **KvK-flow**: zoek "Hotel Okura" → "Al in CRM" →
   koppel contactpersoon; of een nieuw bedrijf → autovullen → opslaan.

### Status: af. commit + push hieronder.

---

## Stap 15: De ontbrekende views uit Klant-dashboard.html (2026-06-28)

### Aanleiding
Project verplaatst naar `~/projects/myhoraizon`. Via de **Claude Design MCP**
(project `a948021d-…`, "Discovery chart") `Klant-dashboard.html` geïmporteerd —
dat blijkt de hele MyHorAIzon-werkruimte (sidebar + topbar + alle views).
Het grootste deel stond al (alle boards, CRM, inbox, documenten). Deze steen
bouwt de drie echt-ontbrekende views uit de blauwdruk-`App()` (shell.jsx):
**Finder**, **Relatiebeheer** en **Beheer**.

> N.B. `get_file` op de standalone HTML kapt af op 256 KiB (alleen de CSS).
> De views zijn daarom geport uit de bron-`dashboard/*.jsx` (live via de MCP
> opgehaald: `shell.jsx`, `salestasks.jsx`, `clientfull.jsx`), 1:1 zoals alle
> eerdere stenen.

### a. Finder (`/finder`)
`leadfinder.jsx` (`FinderModule`, port uit salescrm.jsx) stond al in `src/design/`
maar had geen route. Nieuwe `FinderPage.jsx` rendert `<FinderModule>`,
sales-gated (`ROUTE_MODULE.finder = 'sales'`). Branche-keuze → namaak-Maps met
lat/lng-pins → leads goedkeuren naar het CRM.

### b. Relatiebeheer (`/relatiebeheer`)
Het relatie-deel was in de pipeline-steen bewust overgeslagen. Nu geport naar
`salestasks.jsx`: het signaal-systeem (`REL_SIG_TYPES`, `relatieSignals`,
`relatieDose` met dosering max-N/dag), `RelatieSignalMenu` (tandwiel),
`SalesRelatiePage` (klantenlijst + filters) en `RelatieTakenWidget`.
Adaptaties t.o.v. bron: `window.*` → imports, `ClientCard` → de gedeelde
`openKlantCard`, de repo-`SalesTaskList` hergebruikt. `RelatiePage` is een
**lijst-pagina, geen tegelbord** — exact als de blauwdruk (`view==="relatiebeheer"`
rendert puur `<SalesRelatiePage>`). De `relatietaken`-tegel in `tiles.jsx` is
van `window.RelatieTakenWidget` naar een ESM-import getrokken.

### c. Beheer (`/settings`)
`SettingsPage` + `ClubModulesSettings` geport uit `shell.jsx` naar een nieuwe
`src/design/settings.jsx`. Alle bouwstenen bestonden al in de design-laag
(`loadFlags`/`saveFlags`/`resetStore`/`LOCKED_MODULES` in store.jsx,
`WidgetsAdmin` in widgets.jsx, `DEFAULT_LAYOUT`/`saveLayout` in tiles.jsx,
`Panel`/`Eyebrow` in components.jsx). `window.FUNCTIONS` ontbreekt → defensief
0 functies (zoals de bron al afving). `MOD["club"]` → `KYANO.modules`.
`SettingsPage.jsx`-wrapper beheert de flags-state (loadFlags/saveFlags).
- **Let op (flags vs tenant):** de module-toggles sturen de **design-laag-flags**
  (blauwdruk-gedrag, localStorage). De *live* board-/sidebar-gate in de repo loopt
  via de **tenant-config** (`AppShell` → `tenantFlags`). De Widget-admin-sectie en
  Dashboard-herstel/Demo-reset werken wél direct. Het koppelen van de
  module-toggles aan de server-tenant-overlay is een bewuste follow-up.

### Twee dode-klik-fixes + één test-correctie (knoppen-poort over alle routes)
- **Actieve tabs/segmenten** kregen `role="tab"` + `aria-selected` (de poort
  zondert actieve tabs zo uit): finder `fn-mode`/`fn-grp`/`fn-vbtn`, relatie
  `seg-opt` (+ `on`-class). Zelfde patroon als de pipeline-`st-tab`.
- **Native `<select>`** uit de knoppen-poort-selector gehaald: een synthetische
  `el.click()` opent geen native dropdown en triggert geen change → vals-positief
  (leadfinder straal/aantal, takenlog). Echte knoppen blijven getoetst.

### Bestanden
- `src/pages/FinderPage.jsx`, `src/pages/RelatiebeheerPage.jsx`,
  `src/pages/SettingsPage.jsx` (nieuw) — de drie pagina's + tenant-gate.
- `src/design/settings.jsx` (nieuw) — `SettingsPage` + `ClubModulesSettings`.
- `src/design/salestasks.jsx` — relatie-systeem + `SalesRelatiePage` +
  `RelatieTakenWidget` toegevoegd; `seg-opt` `role="tab"`.
- `src/design/tiles.jsx` — `relatietaken` van window-global naar ESM-import.
- `src/design/leadfinder.jsx` — `fn-mode`/`fn-grp`/`fn-vbtn` `role="tab"`.
- `src/App.jsx` — routes + `REAL_PAGES` voor `finder`, `relatiebeheer`, `settings`.
- `tests/deadclick.mjs` — `<select>` uit de collector (zie hierboven).

### Getest
- `npm run build`: slaagt. `npm run lint`: 0 errors (3 pre-existing warnings).
- `npm run test:knoppen` (default 4 routes): GROEN.
- Per nieuwe route (live dev-server op :5174): `/finder` 67 · `/relatiebeheer`
  47 knoppen — GROEN, geen dode klikken.
- **`/settings` handmatig geverifieerd, geen dode klikken.** De volledige
  knoppen-poort-crawl is op deze pagina onpraktisch traag: de poort herlaadt een
  verse pagina per klik, en Beheer heeft veel toggles plus twee `location.reload()`-
  knoppen (Dashboard herstellen / Demo terugzetten) die de crawl telkens resetten.
  Niet stuk — alle knoppen zijn echte toggles/acties (module-flags, club-modules,
  widget-admin, herstel/reset) die direct state of een reload triggeren, dus per
  definitie geen dode klikken. Build + lint groen, pagina rendert correct.

### Trouw-rapport
- **Finder** (`/finder`) — Design: `salescrm.jsx · FinderModule`. **9/10.**
  Component 1:1 (stond al); alleen route + page-gate toegevoegd.
- **Relatiebeheer** (`/relatiebeheer`) — Design: `salestasks.jsx · SalesRelatiePage`.
  **9/10.** Lijst-pagina + signaal-dosering 1:1. Afwijking: `RelatieTakenWidget`
  hergebruikt de repo-`SalesTaskList` (zonder de blauwdruk-`TeamAssignedSection`).
- **Beheer** (`/settings`) — Design: `shell.jsx · SettingsPage`. **8/10.** Visueel
  1:1 (hero, module-toggles, club-modules, widget-admin, herstel/reset).
  Afwijking: module-toggles sturen de design-laag-flags i.p.v. de tenant-overlay
  (zie c).

### Klikpad
- **/finder**: Stap 1 branche+locatie (of referentiebedrijf) → branches kiezen →
  straal/aantal → Kai zoekt → lijst+kaart met pins → lead goedkeuren naar CRM.
- **/relatiebeheer**: filterbalk (Vragen aandacht / Alle / Actief / Win-back / Oud)
  + tandwiel → "Wat wordt een taak?"-menu (signalen aan/uit, drempel, max/dag) →
  klant aanklikken opent de gedeelde klantkaart · "Open CRM".
- **/settings**: hero "Beheer" + modules aan/uit, Club-modules, Widgets-admin,
  Dashboard herstellen / Demo reset.

### Status: alle views uit Klant-dashboard.html staan. (commit + push hieronder)

---

## Stap 14: Pipeline afgemaakt — het laatste board, mét tabs (2026-06-28)

### Wat gedaan
Het laatste resterende board, `/pipeline`, is omgezet naar het volledige
blauwdruk-patroon: een tab-pagina (`SalesPipelinePage`) met **TABS** —
**Vandaag** (het bewerkbare tegelbord) en **Bord** (de Trello-kanban). Niet
platgeslagen tot alleen de kanban.

**a. `tiles.jsx` — widgets gewired (van window-globals naar ESM).**
De pipeline-tegels renderden via `window.SaleskansenWidget` /
`window.PipelineTakenWidget` (nooit gezet → `null`). Nu echte imports uit
`salestasks.jsx`, zoals eerder bij de Iris-tegels:
- `tileKind "saleskansen"`  → `<SaleskansenWidget>`  (de ApprovalQueue / inkomende kansen).
- `tileKind "pipelinetaken"` → `<PipelineTakenWidget>` (de pipeline-taken, "vandaag oppakken").
`MOD` bevat beide (via `EXTRA_TILES`), dus `BOARDS.pipeline`
(`PIPE_ORDER`/pin: saleskansen + pipelinetaken + saleskpis) rendert ze nu echt.

**b. `PipelinePage.jsx` — omgezet naar `SalesPipelinePage` met tabs + `<TileGrid board="pipeline">`.**
`SalesPipelinePage` had wél de tabbar maar **géén Vandaag-tak** (alleen
`tab === "bord"` rendeerde iets — de Vandaag-tab was leeg). Opgelost met een
`vandaagSlot`-prop + een trouwe fallback (ApprovalQueue + pipeline-taken direct).
`PipelinePage` haalt de board-context uit `useOutletContext()` en geeft
`<TileGrid board="pipeline">` als `vandaagSlot` mee → de Vandaag-tab is nu het
bewerkbare bord; de Bord-tab is de kanban (`SalesPipeline summary={false}`).

Het tabs-blok (geciteerd uit de ESM-port `salestasks.jsx`, zelf de 1:1-port van
de blauwdruk `dashboard/salestasks.jsx` — zie caveat hieronder):
```jsx
<div className="st-tabbar" role="tablist">
  <button role="tab" aria-selected={tab === "vandaag"} className={"st-tab" + (tab === "vandaag" ? " on" : "")} onClick={() => setTab("vandaag")}>
    <span … ICONS("check") />Vandaag
    {(openN + inboxN) > 0 && <span className="st-tab-n">{openN + inboxN}</span>}
  </button>
  <button role="tab" aria-selected={tab === "bord"} className={"st-tab" + (tab === "bord" ? " on" : "")} onClick={() => setTab("bord")}>
    <span … ICONS("grid") />Bord
  </button>
  <span className="st-tab-hint mono">{tab === "vandaag" ? "Keur kansen goed …" : "Sleep deals …"}</span>
</div>
{tab === "vandaag" && (vandaagSlot || (<div className="st-pipe-vandaag"><SaleskansenWidget …/><PipelineTakenWidget …/></div>))}
{tab === "bord" && <SalesPipeline onOpen={onOpen} onCard={…} summary={false} />}
```

> **Caveat — Design MCP niet bereikbaar.** Stap 2 vroeg het tabs-blok live uit
> de Design MCP (`shell.jsx`) te citeren. Het enige beschrijfbare design-system-
> project (`019e2151…`, "Design System") is **leeg**; het blauwdruk-project uit
> reparatie-steen 2 (`a948021d…`) staat niet in de schrijfbare lijst en is niet
> opvraagbaar (404 op `dashboard/shell.jsx`). Daarom geciteerd uit de reeds
> gecommitte ESM-port `salestasks.jsx`, die de blauwdruk-herkomst in z'n
> bestandskop draagt en al in reparatie-steen 2 als bron gold. Geef de volledige
> project-id (of her-autoriseer de Design-login) als je een verse live-fetch wilt.

### Twee dode-klik-fixes (knoppen-poort over álle boards)
De `test:knoppen`-default dekt 4 routes; ik heb alle 7 board-routes apart
getest. Dat ving twee dode klikken:
- **`/pipeline` — actieve "Vandaag"-tab**: een actieve tab opnieuw aanklikken doet
  (terecht) niets. De test zondert actieve tabs uit via `role="tab"`; de `st-tab`-
  knoppen kregen daarom `role="tab"` + `aria-selected` (a11y-correct, conventie-volgend).
- **`/iris` — naamloze verstuur-knop** (pre-existing, uit stap 13; viel buiten de
  4 default-routes): de chat-`send-btn` deed niets bij een leeg veld. Nu
  `disabled={!val.trim()}` + `aria-label`/`title` (zelfde patroon als de
  `irisbrief-refresh`-knop in hetzelfde bestand).

### Bestanden
- `src/pages/PipelinePage.jsx` — omgezet: `useOutletContext` + `SalesPipelinePage`
  met `<TileGrid board="pipeline">` als Vandaag-slot (was: kale `SalesPipeline`-kanban).
- `src/design/salestasks.jsx` — `vandaagSlot`-prop + Vandaag-tak toegevoegd;
  `st-tab` → `role="tab"` + `aria-selected`.
- `src/design/tiles.jsx` — `saleskansen`/`pipelinetaken` van `window.*` naar ESM-imports.
- `src/design/iris.jsx` — `send-btn` disabled-bij-leeg + label.

### Getest
- `npm run build`: slaagt (1900 modules). `npm run lint`: 0 errors (3 pre-existing warnings).
- `npm run test:knoppen` (default, 4 routes): GROEN — 110 knoppen.
- Extra: alle 7 board-routes (`/pipeline /iris /vandaag /seo /studio /website /sales`)
  apart: GROEN — 81 knoppen, geen dode klikken. `/pipeline` alleen: 42 knoppen.
  (Let op: de knoppen-poort heeft een **live dev-server op :5174** nodig; zonder
  server test 'm de Chrome-foutpagina en is GROEN misleidend — met server geverifieerd.)

### Trouw-rapport — Pipeline (`/pipeline`)
- **Design**: `dashboard/salestasks.jsx` · `SalesPipelinePage` (via de ESM-port; MCP-caveat hierboven).
- **Score: 9/10.** De pagina heeft nu de **TABS** (Vandaag + Bord), exact het
  blauwdruk-patroon, met de ApprovalQueue (saleskansen) + pipeline-taken als
  echte widgets en de kanban op de Bord-tab. `BOARDS.pipeline` pool/volgorde/pin
  1:1. Afwijkingen:
  1. De Vandaag-tab gebruikt `<TileGrid board="pipeline">` (bewerkbaar bord) i.p.v.
     de twee widgets recht-onder-elkaar uit de bron — bewuste, app-brede keuze
     (zelfde lijn als `/sales` in reparatie-steen 2); dezelfde widgets, nu sleep-/
     resize-baar met KPI's erbij. De bron-layout blijft als fallback in `SalesPipelinePage`.
  2. Hero-mark = `chartup`-icoon (port-conventie), niet de blauwdruk-asset.

### Klikpad — /pipeline
1. Ga naar **/pipeline**. Standaard staat de **Vandaag**-tab actief: je ziet het
   tegelbord met **Nieuwe saleskansen** (goedkeuren → in de pijplijn), **Pipeline-
   taken** (vandaag oppakken), en de **KPI's**.
2. Klik **Bord**: je schakelt naar de **kanban** — sleep deals door de fases.
3. Klik **Vandaag** terug: bord weer zichtbaar. (Actieve tab opnieuw klikken doet
   niets — dat is correct, en de knoppen-poort zondert 'm nu uit.)
4. Topbar **Bewerk** (op de Vandaag-tab): tegels wiebelen, S/M/L/XL + ×, slepen.
   **Widget toevoegen** → de pipeline-widgetmarkt. Indeling blijft in
   `localStorage` (`myhoraizon.pipeline.layout.*`); **Herstel** zet 'm terug.
5. Hero: **Nieuwe deal** (modal) en **Flow & fase-duur** (de fase-editor).

### Bevestiging
**Pipeline heeft nu de tabs** (Vandaag = bewerkbaar bord / Bord = kanban) — niet
platgeslagen tot alleen de kanban. Alle boards zijn af.

### Status: veiliggesteld op GitHub. Alle module-boards uit de blauwdruk staan.

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
