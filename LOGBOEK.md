# LOGBOEK MyHorAIzon

Bouwlog per afgeronde stap. Nieuwste bovenaan.

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
