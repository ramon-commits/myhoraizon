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
  { key: 'dashboard', kind: 'core', label: 'Dashboard', route: '', status: 'live' },
  { key: 'settings', kind: 'core', label: 'Beheer', route: 'settings', status: 'live' },
  { key: 'iris', kind: 'core', label: 'Iris', route: 'iris', status: 'live' },
  { key: 'clients', kind: 'core', label: 'Klanten', route: 'crm', status: 'live' },
  { key: 'team', kind: 'core', label: 'Team', route: 'people', status: 'live' },
  { key: 'library', kind: 'core', label: 'Bibliotheek', route: 'library', status: 'gepland' },
  { key: 'radar', kind: 'core', label: 'Radar', route: 'radar', status: 'gepland' },
  { key: 'patterns', kind: 'core', label: 'Patronen', route: 'patterns', status: 'gepland' },
  // ── core (myhoraizon) ──
  { key: 'vandaag', kind: 'core', label: 'Vandaag', route: 'vandaag', status: 'live' },
  { key: 'postvak', kind: 'core', label: 'Inbox', route: 'postvak', status: 'live' },
  // ── custom (per tenant via custom_modules) ── status: live = gebouwd in de repo, gepland = nog te bouwen
  { key: 'sales', kind: 'custom', label: 'Sales', route: 'sales', status: 'live' },
  { key: 'website', kind: 'custom', label: 'Website', route: 'website', status: 'live' },
  { key: 'social', kind: 'custom', label: 'Social media', route: 'social', status: 'gepland' },
  { key: 'contracts', kind: 'custom', label: 'Contracten', route: 'contracten', status: 'live' },
  { key: 'club', kind: 'custom', label: 'Club Kyano', route: 'club', status: 'gepland' },
  { key: 'events', kind: 'custom', label: 'Events', route: 'events', status: 'gepland' },
]

export const MODULE_BY_KEY = Object.fromEntries(MODULES.map((m) => [m.key, m]))
export const CORE_KEYS = MODULES.filter((m) => m.kind === 'core').map((m) => m.key)

export function isCore(moduleKey) {
  const m = MODULE_BY_KEY[moduleKey]
  return m ? m.kind === 'core' : false
}

// Sub-routes die onder een module-package vallen (zelfde gate als hun module).
// Pipeline/Relatiebeheer/Leadfinder/CRM zijn werkvlakken van de Sales-module.
export const ROUTE_MODULE = {
  pipeline: 'sales',
  relatiebeheer: 'sales',
  finder: 'sales',
  // crm = core (clients), niet sales-gated → niet in deze alias
}

// route-segment ('' = dashboard) -> module-entry; null als de route geen
// getenant-gate-module is (dan altijd toegankelijk).
export function moduleByRoute(routeId) {
  const seg = routeId === '/' ? '' : String(routeId || '').replace(/^\//, '')
  if (ROUTE_MODULE[seg]) return MODULE_BY_KEY[ROUTE_MODULE[seg]] || null
  return MODULES.find((m) => m.route === seg) || null
}
