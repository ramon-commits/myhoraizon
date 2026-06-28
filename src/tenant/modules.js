/* ============================================================
   MODULES-registry — spiegelt de module-vorm uit horaizon-brain.
   Elke module: { key, kind: 'core'|'custom', label, route }.
   - 'route' = het myhoraizon-routesegment ('' = index/dashboard).
   - core: nooit uit te zetten per tenant (brein-regel).
   - custom: alleen actief als tenant.custom_modules de key bevat.

   Core-set 1:1 uit het brein (dashboard, settings, iris, clients, team,
   library, radar, patterns) + de myhoraizon-core (vandaag, postvak).
   Custom = alles wat nog komt: sales, website, social, contracts, club, events.
   ============================================================ */
export const MODULES = [
  // ── core (brein) ──
  { key: 'dashboard', kind: 'core', label: 'Dashboard', route: '' },
  { key: 'settings', kind: 'core', label: 'Beheer', route: 'settings' },
  { key: 'iris', kind: 'core', label: 'Iris', route: 'iris' },
  { key: 'clients', kind: 'core', label: 'Klanten', route: 'crm' },
  { key: 'team', kind: 'core', label: 'Team', route: 'people' },
  { key: 'library', kind: 'core', label: 'Bibliotheek', route: 'library' },
  { key: 'radar', kind: 'core', label: 'Radar', route: 'radar' },
  { key: 'patterns', kind: 'core', label: 'Patronen', route: 'patterns' },
  // ── core (myhoraizon) ──
  { key: 'vandaag', kind: 'core', label: 'Vandaag', route: 'vandaag' },
  { key: 'postvak', kind: 'core', label: 'Inbox', route: 'postvak' },
  // ── custom (komt nog) ──
  { key: 'sales', kind: 'custom', label: 'Sales', route: 'sales' },
  { key: 'website', kind: 'custom', label: 'Website', route: 'website' },
  { key: 'social', kind: 'custom', label: 'Social media', route: 'social' },
  { key: 'contracts', kind: 'custom', label: 'Contracten', route: 'contracten' },
  { key: 'club', kind: 'custom', label: 'Club Kyano', route: 'club' },
  { key: 'events', kind: 'custom', label: 'Events', route: 'events' },
]

export const MODULE_BY_KEY = Object.fromEntries(MODULES.map((m) => [m.key, m]))
export const CORE_KEYS = MODULES.filter((m) => m.kind === 'core').map((m) => m.key)

export function isCore(moduleKey) {
  const m = MODULE_BY_KEY[moduleKey]
  return m ? m.kind === 'core' : false
}

// route-segment ('' = dashboard) -> module-entry; null als de route geen
// getenant-gate-module is (dan altijd toegankelijk).
export function moduleByRoute(routeId) {
  const seg = routeId === '/' ? '' : String(routeId || '').replace(/^\//, '')
  return MODULES.find((m) => m.route === seg) || null
}
