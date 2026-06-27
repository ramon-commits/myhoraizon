import {
  LayoutDashboard, Sun, Inbox, Calendar, Users,
  TrendingUp, Workflow, Handshake, Radar, Contact,
  Globe, Files, Pencil, FileQuestion, Sprout, Network,
  ClipboardList, Receipt, FileSignature, Folder, BookOpen,
  Share2, Star, Compass,
  FolderKanban, CalendarDays,
  BarChart3, Puzzle, Settings, Shield, Bot,
} from 'lucide-react'

// Eén centrale navigatie-bron. De sidebar (AppShell) en de placeholder-routes
// (App.jsx) lezen allebei uit deze lijst, zodat structuur en routes nooit
// uit elkaar lopen. ready: true betekent dat er een echte pagina achter zit;
// de rest valt terug op de "binnenkort"-lege staat.
export const NAV_GROUPS = [
  {
    label: 'Algemeen',
    items: [
      { to: '/', label: 'Dashboard', icon: LayoutDashboard, end: true, ready: true },
      { to: '/vandaag', label: 'Vandaag', icon: Sun },
      { to: '/inbox', label: 'Inbox', icon: Inbox },
      { to: '/agenda', label: 'Agenda', icon: Calendar },
      { to: '/team', label: 'Team', icon: Users },
    ],
  },
  {
    label: 'Sales',
    items: [
      { to: '/sales', label: 'Sales', icon: TrendingUp },
      { to: '/pipeline', label: 'Pipeline', icon: Workflow },
      { to: '/relatiebeheer', label: 'Relatiebeheer', icon: Handshake },
      { to: '/leadfinder', label: 'Leadfinder', icon: Radar },
      { to: '/crm', label: 'CRM', icon: Contact },
    ],
  },
  {
    label: 'Website',
    items: [
      { to: '/website', label: 'Website', icon: Globe },
      { to: '/paginas', label: "Pagina's", icon: Files },
      { to: '/editor', label: 'Editor', icon: Pencil },
      { to: '/aanvragen', label: 'Aanvragen', icon: FileQuestion },
      { to: '/groei', label: 'Groei', icon: Sprout },
      { to: '/domein', label: 'Domein', icon: Network },
    ],
  },
  {
    label: 'Documenten',
    items: [
      { to: '/offertes', label: 'Offertes', icon: ClipboardList, ready: true },
      { to: '/facturen', label: 'Facturen', icon: Receipt, ready: true },
      { to: '/contracten', label: 'Contracten', icon: FileSignature, ready: true },
      { to: '/documenten', label: 'Documenten', icon: Folder },
      { to: '/brochures', label: 'Brochures', icon: BookOpen },
    ],
  },
  {
    label: 'Social',
    items: [
      { to: '/social', label: 'Social media', icon: Share2 },
      { to: '/reviews', label: 'Reviews', icon: Star },
      { to: '/trendspotter', label: 'Trendspotter', icon: Compass },
    ],
  },
  {
    label: 'Projecten',
    items: [
      { to: '/projecten', label: 'Projecten', icon: FolderKanban },
      { to: '/events', label: 'Events', icon: CalendarDays },
    ],
  },
  {
    label: 'Systeem',
    items: [
      { to: '/analytics', label: 'Analytics', icon: BarChart3 },
      { to: '/integraties', label: 'Integraties', icon: Puzzle },
      { to: '/instellingen', label: 'Instellingen', icon: Settings },
      { to: '/beheer', label: 'Beheer', icon: Shield },
      { to: '/agents', label: 'Agents', icon: Bot },
    ],
  },
]

// Platte lijst van alle items die nog geen echte pagina hebben. App.jsx maakt
// hier placeholder-routes van.
export const PLACEHOLDER_ITEMS = NAV_GROUPS
  .flatMap((g) => g.items)
  .filter((it) => !it.ready && it.to !== '/')
