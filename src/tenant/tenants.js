/* ============================================================
   Demo-tenants. De tenant-VORM is 1:1 gespiegeld uit horaizon-brain:
     { id, slug, display_name, package, active_agents, custom_modules,
       status, primary_contact_email, primary_contact_name,
       horaizon_org_id, metadata }
   Plus een module_settings-overlay per tenant:
     module_settings: { [module_key]: { enabled: bool, settings: {} } }

   SEAM: deze lijst wordt later vervangen door de echte customer-flow
   (list_tenants uit horaizon-brain). Vorm blijft identiek, alleen de bron
   verandert. Nu demo-data zodat het verschil tussen tenants zichtbaar is.
   ============================================================ */
export const TENANTS = [
  {
    id: 't_endlessminds',
    slug: 'sloepenspel-amsterdam',
    display_name: 'Sloepenspel Amsterdam',
    package: 'enterprise',
    active_agents: ['iris', 'hugo', 'sam', 'mila', 'max', 'daan', 'juris', 'kai'],
    // alle custom-modules aan → de eerste klant heeft de volle suite
    custom_modules: ['sales', 'website', 'social', 'contracts', 'club', 'events'],
    status: 'active',
    primary_contact_email: 'ramon@endlessminds.nl',
    primary_contact_name: 'Ramon Brugman',
    horaizon_org_id: 'org_endlessminds',
    metadata: { agency: 'Endless Minds', first_customer: true },
    module_settings: {
      dashboard: { enabled: true, settings: {} },
      vandaag: { enabled: true, settings: {} },
      postvak: { enabled: true, settings: { channels: ['gm', 'wa', 'li', 'web'] } },
      sales: { enabled: true, settings: {} },
      website: { enabled: true, settings: {} },
      social: { enabled: true, settings: {} },
      contracts: { enabled: true, settings: {} },
      club: { enabled: true, settings: {} },
      events: { enabled: true, settings: {} },
    },
  },
  {
    id: 't_knipenco',
    slug: 'kapsalon-knip-en-co',
    display_name: 'Kapsalon Knip & Co',
    package: 'starter',
    active_agents: ['iris', 'sam'],
    // bewust MINDER custom-modules → social, website, club, events ontbreken
    custom_modules: ['sales', 'contracts'],
    status: 'trial',
    primary_contact_email: 'info@knipenco.nl',
    primary_contact_name: 'Sanne Knip',
    horaizon_org_id: 'org_knipenco',
    metadata: { sector: 'Kapper' },
    module_settings: {
      dashboard: { enabled: true, settings: {} },
      vandaag: { enabled: true, settings: {} },
      postvak: { enabled: true, settings: { channels: ['gm', 'wa'] } },
      sales: { enabled: true, settings: {} },
      contracts: { enabled: true, settings: {} },
    },
  },
]
