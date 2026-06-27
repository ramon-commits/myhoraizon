/* Gedeelde klant-bron — één bron van waarheid voor klantdata, hergebruikt door
   Inbox (afzender -> klant), en straks CRM/Relatiebeheer. allCustomers = de in
   het CRM aangemaakte klanten (store) + de demo-seed. Letterlijk uit de
   Claude Design-blauwdruk (sales-module). Demo-data; Supabase-koppeling later. */

const SALES_CUSTOMERS = [
  { id: "c_okura",  name: "Hotel Okura",          contact: "Sandra Bos",     city: "Amsterdam",  x: 46, y: 41, sector: "Hospitality", status: "active",  monthly: 1850, since: 2022, idle: 0, employees: "200+", email: "events@okura.nl",         phone: "+31 20 678 7111", iris: "Boekt elk kwartaal een teamuitje. Vaste waarde, hoge tevredenheid, kandidaat voor een jaarcontract met korting.", deals: 2,
    contacts: [
      { name: "Sandra Bos",    role: "Events Manager",   email: "sandra.bos@okura.nl",   phone: "+31 6 21 44 88 02", primary: true, live: "live", seedTasks: [{ txt: "Jaarcontract-voorstel nabellen", done: false, when: "vandaag" }, { txt: "Offerte Q3-teamuitje sturen", done: true, when: "vorige week" }] },
      { name: "Mark Hendriks", role: "Inkoop & Facilitair", email: "m.hendriks@okura.nl", phone: "+31 20 678 7140", live: "live", seedTasks: [{ txt: "Inkoopvoorwaarden 2026 afstemmen", done: false, when: "deze week" }] },
      { name: "Petra Visscher", role: "HR (ex-contact)",  email: "p.visscher@okura.nl",  phone: "+31 20 678 7155", live: "weg", seedTasks: [{ txt: "Nieuwe HR-contactpersoon achterhalen", done: false, when: "openstaand" }] },
      { name: "Youssef El Amrani", role: "F&B Director",  email: "y.elamrani@okura.nl",  phone: "+31 6 14 90 33 27", live: "onbereikbaar", seedTasks: [] },
    ] },
  { id: "c_nieuwevaart", name: "Nieuwe Vaart Events", contact: "Mark de Wit", city: "Amsterdam", x: 49, y: 40, sector: "Evenementen", status: "active",  monthly: 2200, since: 2023, idle: 1, employees: "12", email: "mark@nieuwevaart.nl",      phone: "+31 6 41 22 90 03", iris: "Grootste lopende deal. Offerte van €4.400 staat 14 dagen open, bel om af te ronden voor het zomerseizoen.", deals: 1 },
  { id: "c_hoxton", name: "The Hoxton",            contact: "Sophie Bakker",  city: "Amsterdam",  x: 44, y: 43, sector: "Hospitality", status: "active",  monthly: 1400, since: 2024, idle: 2, employees: "80",  email: "sophie@thehoxton.com",   phone: "+31 20 888 5555", iris: "Maandelijkse borrels op het water. Stabiel; mogelijk upgrade naar Business-pakket.", deals: 1 },
  { id: "c_pllek",  name: "Pllek NDSM",            contact: "Joost Verhagen", city: "Amsterdam",  x: 47, y: 36, sector: "Horeca",      status: "active",  monthly: 950,  since: 2023, idle: 0, employees: "40",  email: "joost@pllek.nl",         phone: "+31 20 290 0020", iris: "Events-locatie aan het water. Verwijst regelmatig nieuwe klanten door, waardevolle partner.", deals: 1 },
  { id: "c_conservatorium", name: "Conservatorium Hotel", contact: "Erik Vos", city: "Amsterdam", x: 45, y: 45, sector: "Hospitality", status: "prospect", monthly: 0, since: null, idle: 0, employees: "150", email: "sales@conservatoriumhotel.com", phone: "+31 20 570 0000", iris: "Warme lead via Pllek. Past bij Business-pakket; eerste kennismaking ingepland.", deals: 0 },
  { id: "c_marqt",  name: "Marqt Overtoom",        contact: "Inge Smit",      city: "Amsterdam",  x: 43, y: 44, sector: "Retail",      status: "win-back", monthly: 0, since: 2021, idle: 8, employees: "25",  email: "inge@marqt.nl",          phone: "+31 20 470 4000", iris: "8 maanden stil na 2 jaar trouwe afname. Vermoedelijke reden: budget-stop. Win-back met scherpe aanbieding kansrijk.", churn: "Budget bevroren in Q3", deals: 0 },
  { id: "c_hotelv", name: "Hotel V Nesplein",      contact: "Daan Koster",    city: "Amsterdam",  x: 45, y: 42, sector: "Hospitality", status: "win-back", monthly: 0, since: 2020, idle: 6, employees: "30",  email: "daan@hotelv.nl",         phone: "+31 20 662 3233", iris: "6 maanden geen order. Was kwartaalklant. Een persoonlijk belletje van Ramon doet hier waarschijnlijk wonderen.", churn: "Contactpersoon vertrokken", deals: 0 },
  { id: "c_okura2", name: "Restaurant Bar Brouw",  contact: "Tim Jansen",     city: "Amsterdam",  x: 42, y: 40, sector: "Horeca",      status: "prospect", monthly: 0, since: null, idle: 0, employees: "18",  email: "info@barbrouw.nl",       phone: "+31 20 233 4455", iris: "Net geopend aan het water. Sloep-arrangement past perfect bij hun gasten. Koud, maar hoge score.", deals: 0 },
  { id: "c_okura3", name: "Hotel Jakarta",         contact: "Lin Tan",        city: "Amsterdam",  x: 50, y: 37, sector: "Hospitality", status: "prospect", monthly: 0, since: null, idle: 0, employees: "120", email: "events@hoteljakarta.nl", phone: "+31 20 723 9200", iris: "Groot terras aan het water, organiseert al teamuitjes. Stuur een referentie van Okura mee.", deals: 0 },
  { id: "c_rotterdam", name: "SS Rotterdam",       contact: "Peter Visser",   city: "Rotterdam",  x: 38, y: 60, sector: "Evenementen", status: "active",  monthly: 1100, since: 2023, idle: 3, employees: "90",  email: "events@ssrotterdam.nl",  phone: "+31 10 297 3090", iris: "Eerste klant buiten Amsterdam. Vraagt naar een Rotterdam-route, kans om de regio te openen.", deals: 1 },
  { id: "c_utrecht", name: "Hotel Karel V",        contact: "Mirjam de Boer", city: "Utrecht",    x: 49, y: 51, sector: "Hospitality", status: "old",     monthly: 0, since: 2019, idle: 14, employees: "60", email: "info@karelv.nl",         phone: "+31 30 233 7555", iris: "14 maanden stil. Waarschijnlijk verloren, maar een laatste win-back-mail kost niets.", churn: "Geen reactie meer", deals: 0 },
  { id: "c_haarlem", name: "Brouwerij Jopen",      contact: "Wouter Mol",     city: "Haarlem",    x: 41, y: 42, sector: "Horeca",      status: "active",  monthly: 700,  since: 2024, idle: 1, employees: "35",  email: "events@jopen.nl",        phone: "+31 23 533 4114", iris: "Kleine maar trouwe klant. Boekt seizoensgebonden; herinner ze aan het najaarsarrangement.", deals: 0 },

  /* ---- particulieren (geen bedrijf, één persoon) ---- */
  { id: "p_lisa", kind: "particulier", name: "Lisa de Vries", contact: "Lisa de Vries", city: "Amsterdam", x: 45, y: 39, sector: "Particulier", status: "active", monthly: 0, since: 2024, idle: 1, employees: "–", email: "lisa.devries@gmail.com", phone: "+31 6 24 55 18 90", address: "Wittenburgergracht 211, Amsterdam", occasion: "Jaarlijkse verjaardags-sloeptocht in juni", iris: "Boekt elk jaar in juni een sloeptocht voor haar verjaardag. Trouwe particuliere klant, stuur in mei proactief een herinnering met de nieuwe vaarroute.", deals: 1,
    seedTasks: [{ txt: "Mei-herinnering verjaardagstocht sturen", done: false, when: "volgende maand" }, { txt: "Vaarroute 2026 doorsturen", done: true, when: "vorige week" }] },
  { id: "p_youssef", kind: "particulier", name: "Youssef Bakker", contact: "Youssef Bakker", city: "Amsterdam", x: 48, y: 38, sector: "Particulier", status: "prospect", monthly: 0, since: null, idle: 0, employees: "–", email: "y.bakker@outlook.com", phone: "+31 6 11 02 77 41", address: "Borneokade 78, Amsterdam", occasion: "Vrijgezellenfeest augustus, offerte aangevraagd", iris: "Vroeg een offerte aan voor een vrijgezellenfeest in augustus. Particulier; reageert snel via WhatsApp, houd het persoonlijk en kort.", deals: 0,
    seedTasks: [{ txt: "Offerte vrijgezellenfeest sturen", done: false, when: "vandaag" }] },
];

/* live klantenlijst = in CRM aangemaakte klanten + seed */
export function allCustomers(store) {
  const added = store.get("sales.customers", []);
  return [...added, ...SALES_CUSTOMERS];
}
export function custById(store, id) {
  return allCustomers(store).find((c) => c.id === id) || null;
}
export { SALES_CUSTOMERS };
