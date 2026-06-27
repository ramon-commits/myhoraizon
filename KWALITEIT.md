# Kwaliteitspoorten MyHorAIzon

Harde poorten die elke module moet halen voordat hij "done" is.

## Knoppen-poort (dode-klik-test)

**Regel:** geen module is "done" voordat `npm run test:knoppen` groen is op die
module. **Elke knop doet iets of toont een toast. Geen stille no-ops.**

- Elke nog-niet-afgebouwde actie roept `notImplemented(label)` aan (uit
  `src/design/store.jsx`) → toont "[label] komt binnenkort". NOOIT een lege of
  stille `onClick`.
- De test (`tests/deadclick.mjs`) stuurt headless Chrome via CDP: logt in via de
  dev-login, bezoekt elke route met een **verse pagina per klik** (geen
  state-bleed), klikt elk interactief element (`button`, `[role=button]`,
  `a[href]` intern, `[role=menuitem]`, `[role=tab]`, checkbox/radio/select) en
  checkt of binnen ~500ms IETS verandert: URL-wijziging, DOM-mutatie
  (MutationObserver) of een nieuwe toast.
- Externe links (`target=_blank`, `http(s)`, `mailto`, `tel`) en reeds-actieve
  tabs/chips worden overgeslagen.
- Gedeelde shell (sidebar + topbar) wordt één keer getest (dedup over routes).

**Draaien:**
```
npm run dev            # in een aparte terminal (poort 5174)
npm run test:knoppen   # default: Dashboard, Vandaag, Inbox (+ inbox-gesprek)
npm run test:knoppen /sales /crm   # of specifieke routes
```
Exit 0 = groen. Exit 1 = dode-klik-lijst (route + label). Vereist een dev-login
gebruiker in Supabase (`keuren@test.nl`, Auto Confirm).

### Status per module
- [x] Dashboard — groen
- [x] Vandaag — groen
- [x] Inbox (lijst + gesprek) — groen
- [ ] Sales-suite — nog te bouwen
- [ ] CRM / Relatiebeheer — nog te bouwen
- [ ] overige modules — nog te bouwen

## Build/lint-poort
`npm run build` en `npm run lint` groen (0 errors) voor elke commit.
