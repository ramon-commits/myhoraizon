/* ============================================================
   discovery-demo — DEMO-Discovery, 1:1 uit de Claude Design-mock
   (dashboard/kyanobeheer.jsx · KB_CLIENTS[ses_sloep].discovery_session),
   in de echte horaizon-brain-vorm.

   SEAM (deel 4 = live brein): vervang getDiscovery() door één query —
     const { data } = await supabase.from('discovery_sessions')
       .select('status, hypothesized_flows, validated_flows, flow_details, metadata')
       .eq('tenant_id', tenantId).order('created_at',{ascending:false}).limit(1).maybeSingle()
     return data && { status:data.status, hypothesized_flows:data.hypothesized_flows,
       validated_flows:data.validated_flows, flow_details:data.flow_details,
       soll:data.metadata?.soll, build_plan:data.metadata?.build_plan }
   De panelen lezen exact deze velden, dus de UI verandert niet.
   ============================================================ */

const SLOEP = {
  status: 'proposed',
  hypothesized_flows: [
    { name: 'Aanvraag & offerte', category_nl: 'Sales', steps: [
      'Aanvraag komt binnen via formulier of mail',
      'Aanvraag lezen en klant terugbellen',
      'Offerte opstellen in Word',
      'Offerte mailen en opvolgen',
    ] },
    { name: 'Boeking & planning', category_nl: 'Operatie', steps: [
      'Akkoord op offerte verwerken',
      'Boeking in agenda zetten',
      'Schipper en boot inplannen',
      'Klant bevestiging sturen',
    ] },
    { name: 'Facturatie', category_nl: 'Financieel', steps: [
      'Factuur maken na afloop',
      'Factuur versturen',
      'Betaling controleren',
      'Herinnering sturen bij uitblijven',
    ] },
  ],
  validated_flows: [
    { flow_index: 0, validated: true },
    { flow_index: 1, validated: true },
    { flow_index: 2, validated: false },
  ],
  flow_details: {
    flow_0: { step_pills: {
      'Aanvraag komt binnen via formulier of mail': { owner: 'Website', sample_answer: 'Typeform', opportunity: null },
      'Aanvraag lezen en klant terugbellen': { owner: 'Ramon', sample_answer: 'Telefoon', opportunity: 'wachttijd' },
      'Offerte opstellen in Word': { owner: 'Ramon', sample_answer: 'Word', opportunity: 'repetitief' },
      'Offerte mailen en opvolgen': { owner: 'Ramon', sample_answer: 'Outlook', opportunity: 'repetitief' },
    } },
    flow_1: { step_pills: {
      'Akkoord op offerte verwerken': { owner: 'Ramon', sample_answer: 'Excel', opportunity: 'repetitief' },
      'Boeking in agenda zetten': { owner: 'Ramon', sample_answer: 'Google Agenda', opportunity: null },
      'Schipper en boot inplannen': { owner: 'Marit', sample_answer: 'WhatsApp', opportunity: 'wachttijd' },
      'Klant bevestiging sturen': { owner: 'Ramon', sample_answer: 'Outlook', opportunity: 'repetitief' },
    } },
    flow_2: { step_pills: {
      'Factuur maken na afloop': { owner: 'Ramon', sample_answer: 'Excel', opportunity: 'repetitief' },
      'Factuur versturen': { owner: 'Ramon', sample_answer: 'Outlook', opportunity: null },
      'Betaling controleren': { owner: 'Ramon', sample_answer: 'Bankomgeving', opportunity: 'wachttijd' },
      'Herinnering sturen bij uitblijven': { owner: 'Niemand', sample_answer: 'gebeurt nu niet', opportunity: 'wachttijd' },
    } },
  },
  soll: {
    status: 'concept',
    macro: 'Iris vangt elke aanvraag op, stelt automatisch een offerte samen en plant de boeking in. Ramon houdt de regie op prijs en uitzonderingen, terwijl het handwerk rond offertes, bevestigingen en facturen verdwijnt.',
    flows: [
      { name: 'Aanvraag & offerte', verhaal: 'Van binnenkomende aanvraag tot verstuurde offerte zonder typewerk.', steps: [
        'Aanvraag komt binnen via formulier of mail',
        'Aanvraag lezen en klant terugbellen',
        'Offerte opstellen in Word',
        'Offerte mailen en opvolgen',
      ] },
      { name: 'Boeking & planning', verhaal: 'Een akkoord wordt direct een boeking met schipper en bevestiging.', steps: [
        'Akkoord op offerte verwerken',
        'Boeking in agenda zetten',
        'Schipper en boot inplannen',
        'Klant bevestiging sturen',
      ] },
      { name: 'Facturatie', verhaal: 'Factuur, controle en herinnering lopen vanzelf.', steps: [
        'Factuur maken na afloop',
        'Factuur versturen',
        'Betaling controleren',
        'Herinnering sturen bij uitblijven',
      ] },
    ],
    flow_details: {
      flow_0: { step_pills: {
        'Aanvraag komt binnen via formulier of mail': { soll_change: 'blijft', automated: false },
        'Aanvraag lezen en klant terugbellen': { soll_change: 'automatisch', automated: true, wat_kyano_bouwt: 'Iris leest de aanvraag, herkent groep en datum en zet een klantkaart klaar', winst_indicatie: 'bespaart circa 10 min per aanvraag', build_mapping: { module_key: 'crm', agent_key: 'hugo', kind: 'config', module_label: 'CRM', agent_naam: 'Hugo' } },
        'Offerte opstellen in Word': { soll_change: 'automatisch', automated: true, wat_kyano_bouwt: 'Iris stelt 3 arrangementen samen op basis van groep en datum', winst_indicatie: 'offerte in 30 sec in plaats van 20 min', build_mapping: { module_key: 'offertes', agent_key: 'iris', kind: 'config', module_label: 'Offertes', agent_naam: 'Iris' } },
        'Offerte mailen en opvolgen': { soll_change: 'automatisch', automated: true, wat_kyano_bouwt: 'Automatische verzending plus opvolg-herinnering na 3 dagen', winst_indicatie: 'geen gemiste opvolging', build_mapping: { module_key: 'offertes', agent_key: 'iris', kind: 'custom', module_label: 'Offertes', agent_naam: 'Iris' } },
      } },
      flow_1: { step_pills: {
        'Akkoord op offerte verwerken': { soll_change: 'automatisch', automated: true, wat_kyano_bouwt: 'Akkoord wordt automatisch een boeking met alle details', winst_indicatie: 'geen dubbele invoer', build_mapping: { module_key: 'sales', agent_key: 'hugo', kind: 'config', module_label: 'Sales', agent_naam: 'Hugo' } },
        'Boeking in agenda zetten': { soll_change: 'blijft', automated: false },
        'Schipper en boot inplannen': { soll_change: 'nieuw', automated: true, wat_kyano_bouwt: 'Iris stelt schipper-beschikbaarheid voor en stuurt de opdracht', winst_indicatie: 'minder heen-en-weer appen', build_mapping: { module_key: 'agenda', agent_key: 'iris', kind: 'custom', module_label: 'Agenda', agent_naam: 'Iris' } },
        'Klant bevestiging sturen': { soll_change: 'automatisch', automated: true, wat_kyano_bouwt: 'Bevestiging met routekaart en huisregels gaat automatisch uit', winst_indicatie: 'professionele indruk', build_mapping: { module_key: 'postvak', agent_key: 'sam', kind: 'config', module_label: 'Inbox', agent_naam: 'Sam' } },
      } },
      flow_2: { step_pills: {
        'Factuur maken na afloop': { soll_change: 'automatisch', automated: true, wat_kyano_bouwt: 'Juris maakt de factuur uit de boeking', winst_indicatie: 'geen Excel meer', build_mapping: { module_key: 'facturen', agent_key: 'juris', kind: 'config', module_label: 'Facturen', agent_naam: 'Juris' } },
        'Factuur versturen': { soll_change: 'automatisch', automated: true, wat_kyano_bouwt: 'Verzending met Mollie-betaallink', winst_indicatie: 'sneller betaald', build_mapping: { module_key: 'facturen', agent_key: 'juris', kind: 'config', module_label: 'Facturen', agent_naam: 'Juris' } },
        'Betaling controleren': { soll_change: 'automatisch', automated: true, wat_kyano_bouwt: 'Mollie meldt de betaling en markeert betaald', winst_indicatie: 'geen handmatige check', build_mapping: { module_key: 'facturen', agent_key: 'juris', kind: 'custom', module_label: 'Facturen', agent_naam: 'Juris' } },
        'Herinnering sturen bij uitblijven': { soll_change: 'nieuw', automated: true, wat_kyano_bouwt: 'Vriendelijke herinnering na 7 dagen, escalatie na 14 dagen', winst_indicatie: 'minder openstaand', build_mapping: { module_key: 'facturen', agent_key: 'juris', kind: 'custom', module_label: 'Facturen', agent_naam: 'Juris' } },
      } },
    },
  },
  build_plan: {
    provisioning: { custom_modules: ['sales', 'contracten'], active_agents: ['iris', 'hugo', 'juris', 'sam'], module_settings: {}, status: 'trial' },
    maatwerk: [
      { module_key: 'offertes', module_label: 'Offertes', agent_naam: 'Iris', stappen: [{ flow: 'Aanvraag & offerte', step: 'Offerte mailen en opvolgen', scope: 'opvolg-automatisering' }], bouwopdracht: { title: 'Automatische offerte-opvolging', doel: 'Geen enkele offerte blijft liggen', aanpak: 'Herinnering na 3 dagen, status terug in het CRM' } },
      { module_key: 'agenda', module_label: 'Agenda', agent_naam: 'Iris', stappen: [{ flow: 'Boeking & planning', step: 'Schipper en boot inplannen', scope: 'beschikbaarheid' }], bouwopdracht: { title: 'Schipper-planning', doel: 'Boot en schipper automatisch matchen', aanpak: 'Beschikbaarheid uit de agenda, opdracht via WhatsApp Business' } },
      { module_key: 'facturen', module_label: 'Facturen', agent_naam: 'Juris', stappen: [{ flow: 'Facturatie', step: 'Herinnering sturen bij uitblijven', scope: 'herinneringen' }], bouwopdracht: { title: 'Betaal-herinneringen', doel: 'Openstaand bedrag terugbrengen', aanpak: 'Reminder na 7 en 14 dagen op basis van Mollie-status' } },
    ],
    bespoke: [],
    summary: { stappen_gemapt: 12, config: 7, custom: 4, live_modules: 5, te_bouwen_modules: 3, bespoke_items: 0 },
  },
}

const DEMO_BY_TENANT = { t_endlessminds: SLOEP }

export function getDiscovery(tenantId) {
  return DEMO_BY_TENANT[tenantId] || null
}
