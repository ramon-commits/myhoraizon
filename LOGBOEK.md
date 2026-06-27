# LOGBOEK MyHorAIzon

Bouwlog per afgeronde stap. Nieuwste bovenaan.

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
