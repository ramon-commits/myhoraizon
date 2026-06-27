# LOGBOEK MyHorAIzon

Bouwlog per afgeronde stap. Nieuwste bovenaan.

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
