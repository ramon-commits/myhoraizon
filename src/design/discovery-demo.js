/* ============================================================
   discovery-demo — DEMO-Discovery in de ECHTE brain-vorm.

   Vorm 1:1 met horaizon-brain (versie met iris-generate-soll / iris-build-plan):
     • IST   = hypothesized_flows[]{name,category_nl,steps[]}
               × flow_details["flow_i"].step_pills["label"]{owner,sample_answer,opportunity}
               × validated_flows[]{flow_index,validated}
     • SOLL  = metadata.soll { flows[]{name,verhaal,steps[]},
               flow_details["flow_i"].step_pills["label"]{owner,sample_answer,automated,
               soll_change(blijft|automatisch|vervalt|nieuw),wat_kyano_bouwt,winst_indicatie,
               build_mapping{module_key,agent_key,kind:config|custom,module_label,agent_naam,custom_scope}},
               macro, status(concept|gefinaliseerd) }
     • BOUWPLAN = metadata.build_plan { provisioning{custom_modules[],active_agents[],
               module_settings,status}, maatwerk[]{module_key,module_label,agent_naam,
               stappen[],bouwopdracht{title,doel,aanpak}}, bespoke[], summary{...} }

   SEAM (deel 4 = live brein): vervang getDiscovery() door een Supabase-query —
     const { data } = await supabase.from('discovery_sessions')
       .select('status, hypothesized_flows, validated_flows, flow_details, metadata')
       .eq('tenant_id', tenantId).order('created_at',{ascending:false}).limit(1).maybeSingle()
     return data && { status:data.status, hypothesized_flows:data.hypothesized_flows,
       validated_flows:data.validated_flows, flow_details:data.flow_details,
       soll:data.metadata?.soll, build_plan:data.metadata?.build_plan }
   De panelen lezen exact deze velden, dus de UI verandert dan niet.
   ============================================================ */

const SLOEP = {
  status: 'proposed', // discovery_sessions.status
  // ── IST ──────────────────────────────────────────────────
  hypothesized_flows: [
    { name: 'Aanvraag & offerte', category_nl: 'Verkoop', steps: [
      'Aanvraag binnen via contactformulier', 'Aanvraag overtypen in agenda', 'Offerte opstellen', 'Offerte versturen', 'Nabellen bij geen reactie',
    ] },
    { name: 'Boeking & planning', category_nl: 'Operatie', steps: [
      'Boeking bevestigen', 'Schipper inplannen', 'Vaargegevens naar klant',
    ] },
    { name: 'Facturatie', category_nl: 'Administratie', steps: [
      'Factuur maken', 'Betaling controleren', 'Herinnering sturen',
    ] },
  ],
  validated_flows: [
    { flow_index: 0, validated: true },
    { flow_index: 1, validated: true },
    { flow_index: 2, validated: false },
  ],
  flow_details: {
    flow_0: { step_pills: {
      'Aanvraag binnen via contactformulier': { owner: 'Website', sample_answer: 'Contactformulier', opportunity: null },
      'Aanvraag overtypen in agenda': { owner: 'Sanne', sample_answer: 'Google Agenda', opportunity: 'repetitief' },
      'Offerte opstellen': { owner: 'Ramon', sample_answer: 'Word', opportunity: 'repetitief' },
      'Offerte versturen': { owner: 'Ramon', sample_answer: 'Gmail', opportunity: null },
      'Nabellen bij geen reactie': { owner: 'Sanne', sample_answer: 'Telefoon', opportunity: 'wachttijd' },
    } },
    flow_1: { step_pills: {
      'Boeking bevestigen': { owner: 'Sanne', sample_answer: 'Gmail', opportunity: null },
      'Schipper inplannen': { owner: 'Tom', sample_answer: 'Whiteboard', opportunity: 'repetitief' },
      'Vaargegevens naar klant': { owner: 'Sanne', sample_answer: 'Gmail', opportunity: 'repetitief' },
    } },
    flow_2: { step_pills: {
      'Factuur maken': { owner: 'Ramon', sample_answer: 'Moneybird', opportunity: 'repetitief' },
      'Betaling controleren': { owner: 'Ramon', sample_answer: 'Mollie', opportunity: 'wachttijd' },
      'Herinnering sturen': { owner: 'Ramon', sample_answer: 'Gmail', opportunity: 'repetitief' },
    } },
  },
  // ── metadata ─────────────────────────────────────────────
  soll: {
    status: 'concept',
    macro: 'Van aanvraag tot factuur gaat het meeste straks vanzelf: offertes, bevestigingen en facturen lopen automatisch, terwijl het persoonlijke werk (nabellen, varen) bij je team blijft.',
    flows: [
      { name: 'Aanvraag & offerte', verhaal: 'De aanvraag stroomt direct door, de offerte staat klaar zonder overtypen, en niemand vergeet nog na te bellen.', steps: [
        'Aanvraag binnen via contactformulier', 'Aanvraag overtypen in agenda', 'Offerte opstellen', 'Offerte versturen', 'Nabellen bij geen reactie', 'Automatische herinnering na 3 dagen stilte',
      ] },
      { name: 'Boeking & planning', verhaal: 'Bevestigingen en vaargegevens gaan automatisch; de planning zelf blijft jullie vak.', steps: [
        'Boeking bevestigen', 'Schipper inplannen', 'Vaargegevens naar klant',
      ] },
      { name: 'Facturatie', verhaal: 'Facturen en herinneringen lopen vanzelf op basis van de boeking.', steps: [
        'Factuur maken', 'Betaling controleren', 'Herinnering sturen',
      ] },
    ],
    flow_details: {
      flow_0: { step_pills: {
        'Aanvraag binnen via contactformulier': { owner: 'Website', sample_answer: 'Contactformulier', automated: false, soll_change: 'blijft' },
        'Aanvraag overtypen in agenda': { owner: 'Sanne', sample_answer: 'Google Agenda', automated: null, soll_change: 'vervalt' },
        'Offerte opstellen': { owner: 'Ramon', sample_answer: 'Word', automated: true, soll_change: 'automatisch', wat_kyano_bouwt: 'De offerte wordt automatisch opgesteld op basis van de aanvraag.', winst_indicatie: 'enkele uren per week', build_mapping: { module_key: 'sales', agent_key: 'hugo', kind: 'config', module_label: 'Sales', agent_naam: 'Hugo' } },
        'Offerte versturen': { owner: 'Ramon', sample_answer: 'Gmail', automated: true, soll_change: 'automatisch', wat_kyano_bouwt: 'Versturen gaat met één klik, of vanzelf na jouw akkoord.', winst_indicatie: 'sneller bij de klant', build_mapping: { module_key: 'sales', agent_key: 'hugo', kind: 'config', module_label: 'Sales', agent_naam: 'Hugo' } },
        'Nabellen bij geen reactie': { owner: 'Sanne', sample_answer: 'Telefoon', automated: false, soll_change: 'blijft' },
        'Automatische herinnering na 3 dagen stilte': { automated: true, soll_change: 'nieuw', wat_kyano_bouwt: 'Een vriendelijke herinnering gaat vanzelf na 3 dagen stilte.', winst_indicatie: 'minder gemiste deals', build_mapping: { module_key: 'sales', agent_key: 'hugo', kind: 'config', module_label: 'Sales', agent_naam: 'Hugo' } },
      } },
      flow_1: { step_pills: {
        'Boeking bevestigen': { owner: 'Sanne', sample_answer: 'Gmail', automated: true, soll_change: 'automatisch', wat_kyano_bouwt: 'De bevestiging gaat automatisch zodra een boeking rond is.', winst_indicatie: 'minder handwerk', build_mapping: { module_key: 'sales', agent_key: 'sam', kind: 'config', module_label: 'Sales', agent_naam: 'Sam' } },
        'Schipper inplannen': { owner: 'Tom', sample_answer: 'Whiteboard', automated: true, soll_change: 'automatisch', wat_kyano_bouwt: 'Een planningsbord houdt schippers en vaarten bij.', winst_indicatie: 'overzicht, minder dubbel', build_mapping: { module_key: 'events', agent_key: 'kai', kind: 'custom', module_label: 'Events', agent_naam: 'Kai', custom_scope: 'Planningsbord voor schippers en vaarten' } },
        'Vaargegevens naar klant': { owner: 'Sanne', sample_answer: 'Gmail', automated: true, soll_change: 'automatisch', wat_kyano_bouwt: 'De klant krijgt automatisch de vaargegevens voor vertrek.', winst_indicatie: 'minder vragen vooraf', build_mapping: { module_key: 'sales', agent_key: 'sam', kind: 'config', module_label: 'Sales', agent_naam: 'Sam' } },
      } },
      flow_2: { step_pills: {
        'Factuur maken': { owner: 'Ramon', sample_answer: 'Moneybird', automated: true, soll_change: 'automatisch', wat_kyano_bouwt: 'De factuur wordt automatisch opgemaakt na de vaart.', winst_indicatie: 'enkele uren per week', build_mapping: { module_key: 'contracts', agent_key: 'juris', kind: 'config', module_label: 'Contracten', agent_naam: 'Juris' } },
        'Betaling controleren': { owner: 'Ramon', sample_answer: 'Mollie', automated: true, soll_change: 'automatisch', wat_kyano_bouwt: 'Betalingen worden automatisch afgevinkt zodra ze binnen zijn.', winst_indicatie: 'geen handmatig nakijken', build_mapping: { module_key: 'contracts', agent_key: 'daan', kind: 'config', module_label: 'Contracten', agent_naam: 'Daan' } },
        'Herinnering sturen': { owner: 'Ramon', sample_answer: 'Gmail', automated: true, soll_change: 'automatisch', wat_kyano_bouwt: 'Een betaalherinnering gaat vanzelf bij een openstaande factuur.', winst_indicatie: 'sneller betaald', build_mapping: { module_key: 'contracts', agent_key: 'juris', kind: 'config', module_label: 'Contracten', agent_naam: 'Juris' } },
      } },
    },
  },
  build_plan: {
    provisioning: {
      custom_modules: ['sales', 'website', 'contracts'],
      active_agents: ['iris', 'hugo', 'sam', 'juris', 'daan'],
      module_settings: { sales: { enabled: true }, website: { enabled: true }, contracts: { enabled: true } },
      status: 'trial',
    },
    maatwerk: [
      { module_key: 'events', module_label: 'Events', agent_naam: 'Kai',
        stappen: [{ flow: 'Boeking & planning', step: 'Schipper inplannen', scope: 'Planningsbord voor schippers en vaarten' }],
        bouwopdracht: { title: 'Events/planning-module', doel: 'Schippers en vaarten plannen op één bord.', aanpak: 'Nieuwe route /events + ModuleGate op de events-key, UI in src/design, aangestuurd door Kai.' } },
    ],
    bespoke: [],
    summary: { stappen_gemapt: 11, config: 8, custom: 1, live_modules: 3, te_bouwen_modules: 1, bespoke_items: 0 },
  },
}

const DEMO_BY_TENANT = {
  t_endlessminds: SLOEP,
}

/* Haal de (demo-)Discovery voor een tenant. null = nog geen Discovery.
   SEAM: vervang dit door de Supabase-query hierboven (deel 4). */
export function getDiscovery(tenantId) {
  return DEMO_BY_TENANT[tenantId] || null
}
