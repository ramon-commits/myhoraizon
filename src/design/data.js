/* ============================================================
   MyHorAIzon, Klant-dashboard · demo-data
   Klant: Endless Minds (Ramon) · plan HorAIzon Business
   ============================================================ */
/* ESM-port van de blauwdruk: alleen window.KYANO -> export. Data letterlijk. */
export const KYANO = (function () {
  const client = {
    company: "Sloepenspel Amsterdam",
    person: "Ramon",
    role: "Eigenaar",
    plan: "HorAIzon Business",
    email: "ramon@endlessminds.nl",
    initials: "R",
    intro: "Hier draait alles voor Sloepenspel Amsterdam. 8 agents werken voor je, hier zie je wat er nu speelt.",
  };

  // Agents, canonieke set (drift opgelost). Iris is altijd het gezicht.
  const agents = {
    iris:  { name: "Iris",  role: "Directiesecretaresse",    accent: "teal"  },
    hugo:  { name: "Hugo",  role: "Sales",                   accent: "red"   },
    sam:   { name: "Sam",   role: "Inbox & support",         accent: "navy"  },
    mila:  { name: "Mila",  role: "Social & content",        accent: "mila"  },
    max:   { name: "Max",   role: "Website & vindbaarheid",  accent: "gold"  },
    daan:  { name: "Daan",  role: "Cijfers & administratie", accent: "blue"  },
    juris: { name: "Juris", role: "Contract & factuur",      accent: "green" },
    kai:   { name: "Kai",   role: "Leads (onderliggend)",    accent: "aqua"  },
  };

  // ---- Modules (14). Volgorde = standaard dashboard-volgorde. ----
  const modules = [
    /* 1 ─ VANDAAG ─────────────────────────────────────────── */
    {
      id: "vandaag", tile: "VANDAAG", name: "Vandaag", group: "Werk",
      agent: "sam", accent: "navy", icon: "home", size: "large",
      stat: "8", sub: "acties wachten op jou", note: "uit al je modules",
      delta: { v: "+3", dir: "up", good: true, lbl: "vs gisteren" },
      tileKind: "today",
      channels: [
        { k: "Gmail", n: 7, accent: "red" },
        { k: "WhatsApp", n: 5, accent: "aqua" },
        { k: "LinkedIn", n: 2, accent: "navy" },
      ],
      inbox: [
        { ch: "wa", from: "Lisa de Vries", prev: "Kunnen we de sloepen voor 28 juni nog vastleggen?", time: "08:12", urgent: true },
        { ch: "gm", from: "Nieuwe Vaart Events", prev: "Bedankt voor de offerte, één vraag over de catering.", time: "07:58", urgent: false },
        { ch: "li", from: "Mark Jansen", prev: "Leuk je gesproken te hebben op de borrel, laten we…", time: "gisteren", urgent: false },
        { ch: "gm", from: "Hotel Okura", prev: "Graag een afspraak volgende week over het teamuitje.", time: "gisteren", urgent: false },
        { ch: "wa", from: "Sophie (Marqt)", prev: "Top! Stuur je de bevestiging door?", time: "ma", urgent: false },
      ],
      todos: [
        { t: "Lisa de Vries terugbellen", by: "Iris", due: "vandaag" },
        { t: "Offerte Nieuwe Vaart opvolgen", by: "Hugo", due: "vandaag" },
        { t: "Factuur #2026-014 herinnering", by: "Juris", due: "morgen" },
      ],
      conversations: [
        {
          id: "c1", ch: "wa", name: "Lisa de Vries", company: "Vrijgezellenfeest · 12 pers.",
          account: "WhatsApp Privé", phone: "+31 6 21 44 90 12", group: 0, msgCount: 4,
          time: "08:12", urgent: true, unread: 2, status: "open", followUp: false,
          tags: ["Warm", "Offerte uit"],
          ai: {
            samenvatting: "Lisa zoekt een sloepenspel voor een vrijgezellenfeest van 12 personen op 28 juni.",
            status: "Datum is nog beschikbaar; Lisa wacht op bevestiging en een offerte.",
            actie: "Bevestig 28 juni en stuur de offerte, Lisa wacht actief op je reactie.", actieGoed: false,
          },
          messages: [
            { from: "them", text: "Hoi! We hebben jullie sloepenspel gezien, leuk concept 🚤", time: "ma 16:40" },
            { from: "me", text: "Hi Lisa! Leuk dat je ons gevonden hebt. Voor hoeveel personen zoeken jullie iets?", time: "ma 16:52" },
            { from: "them", text: "We zijn met 12. Het is voor een vrijgezellenfeest op 28 juni.", time: "ma 17:01" },
            { from: "them", text: "Even een spraakberichtje met de details 👇", time: "08:11", attach: { type: "voice", dur: "0:14" } },
            { from: "them", text: "Kunnen we de sloepen voor 28 juni nog vastleggen?", time: "08:12" },
          ],
          suggestion: "Hi Lisa! 28 juni is nog beschikbaar voor jullie groep van 12. Zal ik een optie voor je vastzetten en de offerte mailen?",
        },
        {
          id: "c2", ch: "gm", name: "Nieuwe Vaart Events", company: "Evenementenbureau",
          subject: "Re: Offerte bedrijfsuitje", account: "ramon@endlessminds.nl", email: "events@nieuwevaart.nl", msgCount: 2,
          time: "07:58", urgent: false, unread: 1, status: "open", followUp: false,
          tags: ["Offerte uit", "€ 4.400"],
          ai: {
            samenvatting: "Nieuwe Vaart heeft de offerte van € 4.400 ontvangen en vraagt of de borrel is inbegrepen.",
            status: "Wederzijdse interesse; één openstaande vraag over de catering.",
            actie: "Beantwoord de cateringvraag, dit is het laatste obstakel voor akkoord.", actieGoed: false,
          },
          messages: [
            { from: "me", text: "Beste team, in de bijlage de offerte voor het bedrijfsuitje. Laat maar weten!", time: "vr 11:20", attach: { type: "file", name: "Offerte-bedrijfsuitje.pdf", size: "248 KB" } },
            { from: "them", text: "Bedankt voor de offerte, één vraag over de catering. Zit de borrel inbegrepen?", time: "07:58" },
          ],
          suggestion: "Goedemorgen! De borrel na afloop zit inbegrepen, inclusief hapjes en 2 consumpties p.p. Wil je dat ik het in de offerte specificeer?",
        },
        {
          id: "c3", ch: "li", name: "Mark Jansen", company: "Conservatorium Hotel",
          account: "LinkedIn", msgCount: 1,
          time: "gisteren", urgent: false, unread: 0, status: "open", followUp: false,
          tags: ["Lead"],
          ai: {
            samenvatting: "Mark wil een keer bellen over een teamdag, na een gesprek op de borrel.",
            status: "Eerste contact gelegd; nog geen afspraak gepland.",
            actie: "Stel een belmoment voor om de teamdag te bespreken.", actieGoed: false,
          },
          messages: [
            { from: "them", text: "Leuk je gesproken te hebben op de borrel, laten we binnenkort een keer bellen over de teamdag.", time: "gisteren 14:10" },
          ],
          suggestion: "Hi Mark! Helemaal eens. Schikt donderdag 11:00 voor een kort belletje? Dan denk ik vast mee over jullie teamdag.",
        },
        {
          id: "c4", ch: "gm", name: "Hotel Okura", company: "Hospitality",
          subject: "Afspraak teamuitje afdeling", account: "ramon@endlessminds.nl", email: "events@okura.nl", msgCount: 1,
          time: "gisteren", urgent: false, unread: 0, status: "open", followUp: false,
          tags: ["Klant", "Factuur over tijd"],
          ai: {
            samenvatting: "Hotel Okura vraagt een afspraak voor een teamuitje voor hun afdeling.",
            status: "Bestaande klant; ook een factuur die over de vervaldatum is.",
            actie: "Plan de afspraak in en stip de openstaande factuur aan.", actieGoed: false,
          },
          messages: [
            { from: "them", text: "Graag een afspraak volgende week over het teamuitje voor onze afdeling.", time: "gisteren 09:30" },
          ],
          suggestion: "Goedemiddag! Volgende week dinsdag of woensdag kan ik. Wat heeft jullie voorkeur? Dan reserveer ik meteen.",
        },
        {
          id: "c6", ch: "gm", name: "Floor Rameckers", company: "Tiqets · Partnerships",
          subject: "Re: Samenwerking met Tiqets en Endless Minds", account: "ramon@endlessminds.nl", email: "floor@tiqets.com", msgCount: 6,
          time: "3d", urgent: true, unread: 0, status: "open", followUp: true,
          tags: ["Lead", "Wacht op reactie"],
          ai: {
            samenvatting: "Floor van Tiqets biedt Ramon toegang tot hun portal voor experience tickets. Ramon heeft interesse en wil afspreken.",
            status: "Wederzijdse interesse bevestigd, maar er is nog geen concrete afspraak ingepland.",
            actie: "Reageer met je beschikbaarheid voor een dinsdag of donderdag om bij Amstel station af te spreken.", actieGoed: false,
          },
          messages: [
            { from: "them", text: "Hi Ramon, hopelijk alles goed met je. Was even benieuwd of je denkt dat het nuttig is om toegang te krijgen tot onze portal voor het maken van boekingen?", time: "7 mei 14:50" },
            { from: "me", text: "Jaa ik heb een heel gaaf software gebouwd waar je mij bij kan helpen, kunnen we een afspraak inschieten?", time: "22 mei 13:15" },
            { from: "them", text: "Hi Ramon, dank voor de reactie. We hebben alleen experience tickets, geen vliegtickets. Als je interesse in experiences hebt, heb je dan volgende week tijd?", time: "26 mei 09:57", reply: { name: "Ramon", text: "Jaa ik heb een heel gaaf software gebouwd waar je mij bij kan helpen…" } },
          ],
          suggestion: "Hi Floor! Volgende week komt goed. Dinsdag of donderdag kan ik bij Amstel station afspreken, hoor graag wat jou schikt!",
        },
        {
          id: "c5", ch: "wa", name: "Sophie, Marqt", company: "Retail",
          account: "WhatsApp Privé", msgCount: 2,
          time: "ma", urgent: false, unread: 0, status: "done", doneNote: "Beantwoord",
          tags: ["Klant"],
          ai: {
            samenvatting: "Sophie vroeg om een bevestiging; die is verstuurd.",
            status: "Afgehandeld, bevestiging verzonden.",
            actie: "Geen actie nodig.", actieGoed: true,
          },
          messages: [
            { from: "them", text: "Top! Stuur je de bevestiging door?", time: "ma 10:05" },
            { from: "me", text: "Zeker, komt eraan vandaag 👍", time: "ma 10:22" },
          ],
          suggestion: "Bij deze de bevestiging, fijne dag Sophie!",
        },
      ],
    },

    /* 1b ─ COMMUNICATIE-HUB ───────────────────────────────── */
    {
      id: "postvak", tile: "INBOX", name: "Inbox", group: "Werk",
      agent: "sam", accent: "teal", icon: "inbox", size: "medium",
      stat: "4", sub: "open gesprekken", note: "alle kanalen op één plek",
      delta: { v: "+2", dir: "up", good: false, lbl: "nieuw" },
      tileKind: "inbox",
      channels: [
        { k: "Gmail", n: 7, accent: "red" },
        { k: "WhatsApp", n: 5, accent: "aqua" },
        { k: "LinkedIn", n: 2, accent: "navy" },
      ],
      inbox: [
        { ch: "wa", from: "Lisa de Vries", prev: "Kunnen we de sloepen voor 28 juni nog vastleggen?", time: "08:12", urgent: true },
        { ch: "gm", from: "Nieuwe Vaart Events", prev: "Bedankt voor de offerte, één vraag over de catering.", time: "07:58", urgent: false },
        { ch: "li", from: "Mark Jansen", prev: "Leuk je gesproken te hebben op de borrel, laten we…", time: "gisteren", urgent: false },
        { ch: "gm", from: "Hotel Okura", prev: "Graag een afspraak volgende week over het teamuitje.", time: "gisteren", urgent: false },
      ],
    },

    /* 2 ─ CRM ─────────────────────────────────────────────── */
    {
      id: "crm", tile: "CRM", name: "CRM", group: "Relaties",
      agent: "hugo", accent: "red", icon: "people", size: "medium",
      stat: "142", sub: "actieve contacten",
      delta: { v: "+6", dir: "up", good: true, lbl: "deze maand" },
      trend: [120, 124, 128, 130, 134, 138, 142],
      signal: "2 contacten al 30 dagen stil, opvolgen?",
      tileKind: "list",
      recent: [
        { name: "Lisa de Vries", co: "Vrijgezellenfeest", last: "3 dagen geleden gebeld" },
        { name: "Hotel Okura", co: "Amsterdam", last: "vandaag gemaild" },
        { name: "Marqt Overtoom", co: "Retail", last: "1 week stil" },
      ],
      list: [
        { name: "Lisa de Vries", co: "Particulier", tag: "Warm", last: "3 dagen geleden gebeld" },
        { name: "Hotel Okura", co: "Hospitality", tag: "Klant", last: "vandaag gemaild" },
        { name: "Nieuwe Vaart Events", co: "Evenementen", tag: "Offerte uit", last: "gisteren" },
        { name: "Mark Jansen", co: "Conservatorium Hotel", tag: "Lead", last: "2 dagen geleden" },
        { name: "Marqt Overtoom", co: "Retail", tag: "Stil", last: "30 dagen stil" },
        { name: "Sophie Bakker", co: "The Hoxton", tag: "Warm", last: "ma gebeld" },
        { name: "Hotel V Nesplein", co: "Boutique hotel", tag: "Win-back", last: "6 mnd stil" },
      ],
    },

    /* 3 ─ SALES ───────────────────────────────────────────── */
    {
      id: "sales", tile: "SALES", name: "Sales", group: "Relaties",
      agent: "hugo", accent: "red", icon: "chartup", size: "medium",
      stat: "€ 18,4k", sub: "pipeline open", money: true,
      delta: { v: "+18%", dir: "up", good: true, lbl: "deze maand" },
      trend: [11.2, 13.0, 12.4, 15.1, 16.0, 17.2, 18.4],
      signal: "1 deal staat 14 dagen stil",
      tileKind: "funnel",
      funnel: [
        { stage: "Nieuw", n: 9, v: "€ 6,2k" },
        { stage: "In gesprek", n: 5, v: "€ 7,8k" },
        { stage: "Offerte uit", n: 3, v: "€ 4,4k" },
      ],
      won: { value: "€ 9,1k", goal: "€ 15k", pct: 61 },
      deals: [
        { name: "Nieuwe Vaart Events", v: "€ 4.400", stage: "Offerte uit", age: "14 dagen stil", warn: true },
        { name: "Hotel Okura, teamuitje", v: "€ 2.800", stage: "In gesprek", age: "2 dagen" },
        { name: "Lisa de Vries", v: "€ 1.250", stage: "In gesprek", age: "vandaag" },
        { name: "Conservatorium Hotel", v: "€ 3.900", stage: "Nieuw", age: "nieuw" },
        { name: "Marqt, win-back", v: "€ 2.100", stage: "Nieuw", age: "nieuw" },
      ],
    },

    /* 3b ─ PIPELINE (nieuwe klanten) ──────────────────────── */
    {
      id: "pipeline", tile: "PIPELINE", name: "Pipeline", group: "Relaties",
      agent: "hugo", accent: "red", icon: "bars", size: "medium",
      stat: "€ 18,4k", sub: "open pipeline", money: true,
      delta: { v: "+18%", dir: "up", good: true, lbl: "deze maand" },
      trend: [11.2, 13.0, 12.4, 15.1, 16.0, 17.2, 18.4],
      signal: "1 deal staat 14 dagen stil",
      tileKind: "funnel",
      funnel: [
        { stage: "Nieuw", n: 9, v: "€ 6,2k" },
        { stage: "In gesprek", n: 5, v: "€ 7,8k" },
        { stage: "Offerte uit", n: 3, v: "€ 4,4k" },
      ],
    },

    /* 3c ─ RELATIEBEHEER (bestaande klanten) ──────────────── */
    {
      id: "relatiebeheer", tile: "RELATIES", name: "Relatiebeheer", group: "Relaties",
      agent: "hugo", accent: "red", icon: "heart", size: "medium",
      stat: "6", sub: "actieve klanten",
      delta: { v: "+1", dir: "up", good: true, lbl: "deze maand" },
      trend: [4, 5, 5, 5, 6, 6, 6],
      signal: "2 klanten vragen aandacht",
      tileKind: "list",
      recent: [
        { name: "Hotel Okura", co: "€ 1.250/mnd", last: "vandaag gemaild" },
        { name: "The Hoxton", co: "€ 980/mnd", last: "ma gebeld" },
        { name: "Marqt Overtoom", co: "win-back kans", last: "30 dagen stil" },
      ],
      list: [
        { name: "Hotel Okura", co: "Hospitality", tag: "Actief", last: "vandaag gemaild" },
        { name: "The Hoxton", co: "Boutique hotel", tag: "Actief", last: "ma gebeld" },
        { name: "Marqt Overtoom", co: "Retail", tag: "Stil", last: "30 dagen stil" },
        { name: "Hotel V Nesplein", co: "Boutique hotel", tag: "Win-back", last: "6 mnd stil" },
      ],
    },

    /* 4 ─ FINDER ──────────────────────────────────────────── */
    {
      id: "finder", tile: "LEADFINDER", name: "Leadfinder", group: "Relaties",
      agent: "kai", accent: "red", icon: "search", size: "medium",
      stat: "38", sub: "leads gevonden",
      delta: { v: "+12", dir: "up", good: true, lbl: "deze week" },
      trend: [20, 24, 22, 28, 30, 34, 38],
      signal: "12 nieuwe leads klaar om naar CRM te zetten",
      tileKind: "hotspots",
      hotspots: [
        { name: "Restaurant Bar Brouw", why: "Net geopend aan het water · sloep-arrangement past" },
        { name: "Hotel Jakarta", why: "Groot terras, organiseert teamuitjes" },
        { name: "Pllek NDSM", why: "Events-locatie, zoekt water-activiteiten" },
      ],
      leads: [
        { name: "Restaurant Bar Brouw", area: "Amsterdam-West", score: 92 },
        { name: "Hotel Jakarta", area: "Java-eiland", score: 88 },
        { name: "Pllek NDSM", area: "Noord", score: 85 },
        { name: "Café de Ceuvel", area: "Noord", score: 81 },
        { name: "Hannekes Boom", area: "Centrum", score: 78 },
        { name: "Roest", area: "Oost", score: 74 },
      ],
    },

    /* 5 ─ AGENTS ──────────────────────────────────────────── */
    {
      id: "agents", tile: "AGENTS", name: "Agents", group: "Werk",
      agent: "iris", accent: "purple", icon: "spark", size: "large",
      stat: "6 / 8", sub: "actief vandaag",
      tileKind: "agents",
      roster: [
        { key: "iris", status: "actief" },
        { key: "hugo", status: "actief" },
        { key: "kai", status: "actief" },
        { key: "sam", status: "actief" },
        { key: "juris", status: "wacht" },
        { key: "max", status: "actief" },
        { key: "mila", status: "slaapt" },
        { key: "daan", status: "actief" },
      ],
      feed: [
        { who: "iris", act: "plande een terugbel-afspraak met Nieuwe Vaart Events", time: "2 min" },
        { who: "hugo", act: "stuurde follow-up naar 3 leads van vorige week", time: "14 min" },
        { who: "max", act: "pushte een SEO-fix voor de boekingspagina", time: "1 uur" },
        { who: "mila", act: "schreef nieuwe blogpost: “Teamuitje op het water”", time: "3 uur" },
        { who: "kai", act: "startte een A/B-test op de offerte-knop", time: "6 uur" },
      ],
    },

    /* 6 ─ OFFERTES ────────────────────────────────────────── */
    {
      id: "offertes", tile: "OFFERTES", name: "Offertes", group: "Geld",
      agent: "iris", accent: "teal", icon: "doc", size: "small",
      stat: "4", sub: "1 openstaand",
      signal: "Voorstel voor Nieuwe Vaart Events klaar om te versturen",
      tileKind: "stat",
      split: [ { k: "Concept", n: 1 }, { k: "Verstuurd", n: 2 }, { k: "Geaccepteerd", n: 1 } ],
      list: [
        {
          name: "Nieuwe Vaart Events", contact: "Mark de Wit", v: "€ 4.400", pkg: "Business",
          status: "Concept", wait: true, created: "vandaag",
          scope: ["Sloepenspel voor 2 teams (max 24 pers.)", "Eigen route door de Amsterdamse grachten", "Borrel met hapjes op locatie na afloop", "Persoonlijke begeleiding van begin tot eind"],
          rationale: "Jullie zoeken een actieve teamdag die ook ruimte laat om bij te praten. Het sloepenspel combineert competitie met de rust van het water, en de borrel sluit de dag informeel af.",
        },
        {
          name: "Hotel Okura, teamuitje", contact: "Sandra Bos", v: "€ 2.800", pkg: "Business",
          status: "Verstuurd", created: "3 dagen geleden",
          scope: ["Sloepenspel voor 1 team (max 12 pers.)", "Inclusief lunchpakket onderweg", "Fotoreportage van de dag"],
          rationale: "Een compacte halve dag die past binnen jullie programma, met een blijvende herinnering via de fotoreportage.",
        },
        {
          name: "Lisa de Vries", contact: "Lisa de Vries", v: "€ 1.250", pkg: "Starter",
          status: "Verstuurd", created: "5 dagen geleden",
          scope: ["Sloepenspel voor de vrijgezellengroep (12 pers.)", "Feestelijke aankleding van de sloep", "Verrassingsopdracht voor de bruid"],
          rationale: "Een vrolijke, persoonlijke middag op het water, precies passend bij een vrijgezellenfeest.",
        },
        {
          name: "Pllek NDSM", contact: "Joost Verhagen", v: "€ 2.100", pkg: "Business",
          status: "Geaccepteerd", created: "2 weken geleden",
          scope: ["Sloepenspel voor 1 team (max 16 pers.)", "Start en finish bij Pllek NDSM", "Drankarrangement aan boord"],
          rationale: "Een uitje dat vertrekt vanaf jullie eigen locatie, minimale logistiek, maximaal plezier.",
        },
      ],
    },

    /* 7 ─ CONTRACTEN ──────────────────────────────────────── */
    {
      id: "contracten", tile: "CONTRACTEN", name: "Contracten", group: "Geld",
      agent: "juris", accent: "green", icon: "docpen", size: "small",
      stat: "1", sub: "getekend",
      signal: "Contract Pllek NDSM wacht op handtekening",
      tileKind: "stat",
      list: [
        {
          name: "Pllek NDSM", pkg: "Business", v: "€ 2.100", status: "Wacht op tekenen", wait: true,
          created: "2 dagen geleden",
          terms: ["Looptijd: eenmalig evenement op 12 juli 2026", "Aanbetaling 30% bij ondertekening", "Restbedrag binnen 14 dagen na het evenement", "Annulering kosteloos tot 14 dagen vooraf"],
        },
        {
          name: "Lisa de Vries", pkg: "Starter", v: "€ 1.250", status: "Getekend",
          created: "1 week geleden", signedAt: "5 juni 2026", signer: "Lisa de Vries",
          terms: ["Looptijd: eenmalig evenement op 28 juni 2026", "Volledige betaling binnen 7 dagen", "Annulering kosteloos tot 7 dagen vooraf"],
        },
      ],
    },

    /* 8 ─ FACTUREN ────────────────────────────────────────── */
    {
      id: "facturen", tile: "FACTUREN", name: "Facturen", group: "Geld",
      agent: "juris", accent: "orange", icon: "invoice", size: "medium",
      stat: "€ 603,79", sub: "openstaand", money: true, attention: "orange",
      delta: { v: "−18%", dir: "down", good: true, lbl: "openstaand" },
      trend: [2400, 2100, 1800, 1500, 1200, 900, 604],
      signal: "Factuur #2026-014 is 5 dagen over de vervaldatum",
      tileKind: "invoices",
      iban: "NL21 INGB 0001 2345 67",
      list: [
        { name: "#2026-014", company: "Hotel Okura", v: "€ 603,79", due: "Vervallen op 10 jun 2026", over: true, created: "27 mei 2026" },
        { name: "#2026-013", company: "Pllek NDSM", v: "€ 2.100,00", due: "Betaald", paid: true, paidAt: "3 jun 2026", created: "20 mei 2026" },
        { name: "#2026-012", company: "Lisa de Vries", v: "€ 1.250,00", due: "Betaald", paid: true, paidAt: "28 mei 2026", created: "14 mei 2026" },
      ],
    },

    /* 9 ─ ANALYTICS ───────────────────────────────────────── */
    {
      id: "analytics", tile: "ANALYTICS", name: "Analytics", group: "Inzicht",
      agent: "daan", accent: "blue", icon: "bars", size: "medium",
      stat: "31%", sub: "conversie deze maand",
      delta: { v: "+12%", dir: "up", good: true, lbl: "vs vorige maand" },
      signal: "Conversie 12% hoger dan vorige maand",
      tileKind: "spark",
      kpis: [
        { k: "Leads / maand", v: "38", d: "+9" },
        { k: "Conversie", v: "31%", d: "+12%" },
        { k: "Omzet-trend", v: "€ 9,1k", d: "+18%" },
      ],
      spark: [12, 18, 14, 22, 19, 26, 24, 30, 28, 34, 31, 38],
    },

    /* 10 ─ WEBSITE ────────────────────────────────────────── */
    {
      id: "website", tile: "WEBSITE", name: "Website", group: "Groei",
      agent: "max", accent: "gold", icon: "globe", size: "small",
      stat: "3", sub: "aanvragen deze week", badge: "live",
      delta: { v: "+2", dir: "up", good: true, lbl: "deze week" },
      trend: [820, 940, 1010, 1120, 1080, 1190, 1240],
      signal: "3 nieuwe aanvragen via je site, staan al in CRM",
      tileKind: "site",
      visitors: 1240,
      requests: [
        { name: "Teamuitje 12 personen", time: "vandaag" },
        { name: "Vrijgezellenfeest juni", time: "gisteren" },
        { name: "Bedrijfsborrel op het water", time: "2 dagen" },
      ],
    },

    /* 10b ─ PAGINA'S (overzicht + suggesties) ──────────────── */
    {
      id: "paginas", tile: "PAGINA'S", name: "Pagina's", group: "Groei",
      agent: "max", accent: "gold", icon: "doc", size: "small",
      stat: "7", sub: "pagina's live",
      signal: "Al je pagina's met de verbeteringen van je agents",
      tileKind: "stat",
    },

    /* 10c ─ EDITOR (bewerken + stijlgids) ──────────────────── */
    {
      id: "editor", tile: "EDITOR", name: "Editor", group: "Groei",
      agent: "max", accent: "gold", icon: "pencil", size: "small",
      stat: "WYSIWYG", sub: "bewerken & stijlgids",
      signal: "Bouw en stijl je website met live preview",
      tileKind: "stat",
    },

    /* 10d ─ DOMEIN ─────────────────────────────────────────── */
    {
      id: "domein", tile: "DOMEIN", name: "Domein", group: "Groei",
      agent: "max", accent: "gold", icon: "globe", size: "small",
      stat: "1", sub: "actief domein",
      signal: "Beheer je domeinnaam, DNS en e-mail",
      tileKind: "stat",
    },

    /* 10e ─ AANVRAGEN (formulier-bouwer + binnengekomen aanvragen) ─ */
    {
      id: "aanvragen", tile: "AANVRAGEN", name: "Aanvragen", group: "Groei",
      agent: "max", accent: "teal", icon: "inbox", size: "small",
      stat: "0", sub: "via je formulier",
      signal: "Bouw je aanvraagformulier en volg binnengekomen aanvragen",
      tileKind: "stat",
    },

    /* 11 ─ SEO ────────────────────────────────────────────── */
    {
      id: "seo", tile: "GROEI", name: "Groei", group: "Groei",
      agent: "max", accent: "gold", icon: "trend", size: "small",
      stat: "7", sub: "in top 10", trend: "up",
      delta: { v: "+2", dir: "up", good: true, lbl: "posities" },
      sparkk: [3, 4, 4, 5, 6, 6, 7],
      signal: "Je staat nu #4 op 'sloepenspel amsterdam', bijna pagina-top",
      tileKind: "stat",
      keywords: [
        { kw: "sloepenspel amsterdam", pos: 4, move: 2 },
        { kw: "teamuitje op het water", pos: 6, move: 1 },
        { kw: "vrijgezellenfeest sloep", pos: 9, move: -1 },
      ],
    },

    /* 12 ─ STUDIO ─────────────────────────────────────────── */
    {
      id: "studio", tile: "STUDIO", name: "Studio", group: "Groei",
      agent: "mila", accent: "gold", icon: "doc", size: "small",
      stat: "3", sub: "concepten klaar",
      signal: "2 landingspagina's en 1 blog klaar om te plaatsen",
      tileKind: "stat",
      posts: [
        { t: "Landing: Zomeractie sloep huren", ch: "Landingspagina", when: "klaar", wait: true },
        { t: "Blog: 10 ideeën vrijgezellenfeest", ch: "Blogpost", when: "klaar", wait: true },
        { t: "Landing: Teambuilding op het water", ch: "Landingspagina", when: "concept", wait: true },
      ],
    },

    /* 13 ─ PEOPLE ─────────────────────────────────────────── */
    {
      id: "people", tile: "TEAM", name: "Team", group: "Relaties",
      agent: "sam", accent: "navy", icon: "network", size: "small",
      stat: "5", sub: "in je team",
      tileKind: "stat",
      team: [
        { name: "Ramon", role: "Eigenaar", access: "Alles" },
        { name: "Sanne", role: "Sales", access: "CRM · Sales · Offertes" },
        { name: "Tom", role: "Operatie", access: "Vandaag · Finder" },
        { name: "Eva", role: "Finance", access: "Facturen · Contracten" },
      ],
    },

    /* 14 ─ CLUB ───────────────────────────────────────────── */
    {
      id: "club", tile: "CLUB", name: "Club Kyano", group: "Inzicht",
      agent: "iris", accent: "orange", icon: "star", size: "small",
      stat: "212", sub: "actieve leden",
      delta: { v: "+8", dir: "up", good: true, lbl: "deze maand" },
      trend: [180, 188, 194, 200, 205, 209, 212],
      signal: "Eerstvolgend event: Ondernemersborrel · 20 juni",
      tileKind: "stat",
      newMembers: 8,
      event: { name: "Ondernemersborrel", date: "20 juni", place: "Pllek NDSM" },
      questions: 2,
      clubName: "TechFounders Amsterdam",
      // Sub-modules, 1-op-1 met kyano-horaizon-club organization_modules
      subModules: [
        {
          key: "network", name: "Network", icon: "people", accent: "navy", on: true,
          desc: "Profielen + leden van deze club.",
          members: [
            { name: "Sanne Bakker", role: "Founder · FjordLabs", tags: ["SaaS", "Zoekt investeerder"], connected: true },
            { name: "Tomas Willems", role: "CTO · Helder", tags: ["AI", "Biedt mentoring"], connected: false },
            { name: "Priya Nair", role: "Head of Growth · Bloom", tags: ["Marketing", "Zoekt co-founder"], connected: false },
            { name: "Daan Koster", role: "Owner · Koster & Co", tags: ["Finance", "Biedt kantoor"], connected: true },
          ],
        },
        {
          key: "events", name: "Events", icon: "calendar", accent: "orange", on: true,
          desc: "Bijeenkomsten met RSVP en realtime chat.",
          events: [
            { name: "Ondernemersborrel", date: "20 jun", place: "Pllek NDSM", going: 42, status: "RSVP open", mine: "Aangemeld" },
            { name: "Founder Dinner", date: "4 jul", place: "Restaurant Bak", going: 18, status: "Wachtlijst", mine: null },
            { name: "AI Demo Night", date: "18 jul", place: "B. Amsterdam", going: 67, status: "RSVP open", mine: null },
          ],
        },
        {
          key: "match", name: "Match", icon: "spark", accent: "purple", on: true,
          desc: "AI-suggesties voor connecties tussen leden.",
          matches: [
            { name: "Tomas Willems", score: 4.6, why: "Jij zoekt technische sparring, Tomas biedt AI-mentoring aan." },
            { name: "Priya Nair", score: 4.1, why: "Beiden bezig met go-to-market in B2B SaaS, sterke overlap." },
            { name: "Daan Koster", score: 3.4, why: "Daan biedt kantoorruimte; jij gaf 'zoekt werkplek' aan." },
          ],
        },
        {
          key: "ask_offer", name: "Vraag & Aanbod", icon: "inbox", accent: "teal", on: true,
          desc: "Bord waar leden hulp vragen en hun expertise aanbieden.",
          board: [
            { kind: "Vraag", who: "Sanne Bakker", text: "Zoek een goede freelance UX'er voor 2 weken.", accent: "red" },
            { kind: "Aanbod", who: "Tomas Willems", text: "Bied 3 gratis AI-architectuur sessies aan clubleden.", accent: "green" },
            { kind: "Vraag", who: "Priya Nair", text: "Wie heeft ervaring met Mollie + Exact koppeling?", accent: "red" },
          ],
        },
        {
          key: "portfolio", name: "Portfolio", icon: "grid", accent: "blue", on: false,
          desc: "Leden tonen hun projecten en cases. Komt in fase 2.",
        },
        {
          key: "kyano_lab", name: "Kyano Lab", icon: "spark", accent: "mila", on: false,
          desc: "Gratis AI-tools, gepushte experimenten van Kyano.",
        },
        {
          key: "lead_dashboard", name: "Lead-dashboard", icon: "bars", accent: "gold", on: false,
          desc: "Signaal-overzicht voor club-eigenaren.",
        },
        {
          key: "services", name: "Services", icon: "heart", accent: "red", on: false,
          desc: "Personal care & faciliteiten, leden boeken treatments.",
        },
        {
          key: "tournaments", name: "Toernooien", icon: "trophy", accent: "aqua", on: false,
          desc: "Toernooien met automatische spelschema's (Americano, Mexicano, Knockout, Round Robin).",
        },
      ],
    },

    /* 15 ─ AGENDA ─────────────────────────────────────────── */
    {
      id: "agenda", tile: "AGENDA", name: "Agenda", group: "Werk",
      agent: "iris", accent: "teal", icon: "calendar", size: "large",
      stat: "5", sub: "afspraken deze week",
      delta: { v: "+2", dir: "up", good: true, lbl: "vs vorige week" },
      tileKind: "agenda",
      today: [
        { time: "09:30", t: "Lisa de Vries terugbellen", type: "Belafspraak", accent: "navy" },
        { time: "11:00", t: "Offertes nalopen met Hugo", type: "Intern", accent: "red" },
        { time: "14:00", t: "Bezichtiging Pllek NDSM", type: "Locatie", accent: "green" },
        { time: "16:30", t: "Teamuitje-call Hotel Okura", type: "Video", accent: "aqua" },
      ],
      week: [
        { day: "wo 18", items: ["Content-akkoord met Mila", "Factuur-check"] },
        { day: "do 19", items: ["Sloeptocht groep 12p", "Bellen Conservatorium"] },
        { day: "vr 20", items: ["Ondernemersborrel · Pllek"] },
      ],
    },

    /* 16 ─ OMZET (grafiek) ────────────────────────────────── */
    {
      id: "omzet", tile: "OMZET", name: "Omzet", group: "Inzicht",
      agent: "daan", accent: "blue", icon: "bars", size: "large",
      stat: "€ 9.140", sub: "deze maand", money: true,
      delta: { v: "+18%", dir: "up", good: true, lbl: "vs vorige maand" },
      tileKind: "barchart",
      legend: [ { k: "Geboekt", accent: "blue" }, { k: "Verwacht", accent: "aqua" } ],
      bars: [
        { m: "jan", a: 4.1, b: 1.0 }, { m: "feb", a: 5.2, b: 1.3 }, { m: "mrt", a: 4.6, b: 1.1 },
        { m: "apr", a: 6.0, b: 1.6 }, { m: "mei", a: 5.5, b: 2.0 }, { m: "jun", a: 7.1, b: 2.0 },
        { m: "jul", a: 6.3, b: 1.4 }, { m: "aug", a: 4.0, b: 1.2 }, { m: "sep", a: 5.8, b: 1.7 },
        { m: "okt", a: 6.6, b: 1.9 }, { m: "nov", a: 7.4, b: 2.2 }, { m: "dec", a: 8.0, b: 2.4 },
      ],
      kpis: [
        { k: "Omzet YTD", v: "€ 84,2k", d: "+22%" },
        { k: "Gem. deal", v: "€ 2.180", d: "+9%" },
        { k: "Gewonnen", v: "€ 9,1k", d: "+18%" },
      ],
    },

    /* 17 ─ EXACT ONLINE (integratie) ──────────────────────── */
    {
      id: "exact", tile: "EXACT ONLINE", name: "Exact Online", group: "Integraties",
      agent: "juris", accent: "green", icon: "euro", size: "medium",
      stat: "€ 84,2k", sub: "omzet dit jaar", money: true,
      delta: { v: "+22%", dir: "up", good: true, lbl: "YTD" },
      tileKind: "integration",
      brand: "#E2001A", brandLetter: "E", provider: "Exact Online",
      status: "Verbonden", lastSync: "5 min geleden",
      synced: [
        { k: "Omzet YTD", v: "€ 84.200" },
        { k: "Openstaand", v: "€ 603,79" },
        { k: "Btw te betalen", v: "€ 1.240" },
      ],
      info: [
        { icon: "invoice", t: "Facturen & btw lopen automatisch mee", m: "Elke factuur uit MyHorAIzon landt direct in Exact Online." },
        { icon: "sync", t: "Realtime omzet & openstaand", m: "Cijfers op je dashboard komen rechtstreeks uit je boekhouding." },
      ],
    },

    /* 18 ─ SOCIAL (integratie) ────────────────────────────── */
    {
      id: "social", tile: "SOCIAL", name: "Social", group: "Integraties",
      agent: "mila", accent: "mila", icon: "share", size: "medium",
      stat: "4.350", sub: "volgers totaal",
      delta: { v: "+94", dir: "up", good: true, lbl: "deze maand" },
      tileKind: "social",
      status: "Verbonden", scheduled: 3,
      channels: [
        { k: "Instagram", icon: "ig", foll: "2.140", d: "+64", accent: "red" },
        { k: "LinkedIn", icon: "li", foll: "890", d: "+22", accent: "navy" },
        { k: "Facebook", icon: "fb", foll: "1.320", d: "+8", accent: "blue" },
      ],
    },

    /* 19 ─ MOLLIE (integratie) ────────────────────────────── */
    {
      id: "mollie", tile: "MOLLIE", name: "Mollie", group: "Integraties",
      agent: "juris", accent: "blue", icon: "euro", size: "medium",
      tileKind: "integration",
      brand: "#000626", brandLetter: "M", provider: "Mollie",
      status: "Verbonden", lastSync: "net nu",
      synced: [
        { k: "Ontvangen deze maand", v: "€ 7.480" },
        { k: "In behandeling", v: "€ 320" },
        { k: "Uitbetaald", v: "€ 7.160" },
      ],
      info: [
        { icon: "euro", t: "Betaallinks op elke factuur", m: "Klanten betalen met iDEAL, creditcard of Apple Pay, direct vanuit de factuur." },
        { icon: "sync", t: "Automatisch afgeletterd", m: "Betalingen koppelen zichzelf aan de juiste factuur in Exact." },
      ],
    },

    /* 20 ─ GOOGLE AGENDA (integratie) ─────────────────────── */
    {
      id: "google", tile: "GOOGLE AGENDA", name: "Google Agenda", group: "Integraties",
      agent: "iris", accent: "red", icon: "calendar", size: "medium",
      tileKind: "integration",
      brand: "#1A73E8", brandLetter: "G", provider: "Google Agenda",
      status: "Verbonden", lastSync: "2 min geleden",
      synced: [
        { k: "Afspraken deze week", v: "5" },
        { k: "Eerstvolgende", v: "09:30" },
        { k: "Gekoppelde agenda's", v: "2" },
      ],
      info: [
        { icon: "calendar", t: "Twee-weg synchronisatie", m: "Afspraken die Iris plant verschijnen direct in je Google Agenda." },
        { icon: "clock", t: "Slimme tijdsblokken", m: "Iris houdt rekening met je bestaande afspraken bij het inplannen." },
      ],
    },
  ];

  // ---- Vandaag = commandocentrum: alle to-do's uit alle modules ----
  const tasks = [
    { mod: "facturen", agent: "juris", accent: "orange", icon: "bell", title: "Factuur #2026-014 is 5 dagen over de vervaldatum", desc: "Hotel Okura · € 603,79", action: "Herinnering sturen",
      urgent: true, overdue: true, approveLabel: "Goedkeuren & versturen",
      why: "Factuur #2026-014 staat sinds 12 jun open (€ 603,79). 5 dagen over de afgesproken termijn van 14 dagen. Juris stelt een vriendelijke eerste herinnering voor.",
      source: "Boekhouding · betaalstatus",
      draft: { type: "email", to: "boekhouding@hotelokura.nl", subject: "Vriendelijke herinnering, factuur #2026-014",
        body: "Beste team van Hotel Okura,\n\nWe zien dat factuur #2026-014 (€ 603,79) van 12 juni nog openstaat. Waarschijnlijk is het aan de aandacht ontsnapt, geen probleem.\n\nZou de betaling deze week kunnen worden voldaan? De gegevens staan onderaan de factuur. Vragen? Bel me gerust.\n\nMet vriendelijke groet,\nRamon, Sloepenspel Amsterdam" } },
    { mod: "offertes", agent: "iris", accent: "teal", icon: "send", title: "Offerte Nieuwe Vaart Events klaar om te versturen", desc: "€ 4.400 · concept", action: "Versturen",
      approveLabel: "Goedkeuren & versturen",
      why: "De offerte voor Nieuwe Vaart Events is af (€ 4.400, sloepentocht voor 40 personen). Iris heeft de tekst en prijsopbouw klaargezet op basis van het gesprek van 3 juni.",
      source: "CRM · gespreksnotities",
      draft: { type: "email", to: "events@nieuwevaart.nl", subject: "Jullie sloepentocht, voorstel (€ 4.400)",
        body: "Hoi Marit,\n\nLeuk dat jullie met 40 collega's het water op willen! Hierbij ons voorstel:\n\n• 4 sloepen incl. schipper, 3 uur\n• Welkomstdrankje + borrelplank aan boord\n• Route langs de Amsterdamse grachten en het IJ\n\nTotaal: € 4.400 (excl. btw)\n\nDe offerte met alle voorwaarden zit als bijlage. Geldig tot 1 juli. Zin om door te pakken?\n\nGroet,\nRamon" } },
    { mod: "sales", agent: "hugo", accent: "red", icon: "chartup", title: "Deal Nieuwe Vaart staat 14 dagen stil", desc: "Offerte uit · € 4.400", action: "Follow-up sturen",
      approveLabel: "Goedkeuren & versturen",
      why: "Deze deal staat 14 dagen op 'Offerte uit' zonder reactie. Hugo stelt een lichte, niet-pusherige follow-up voor, het moment is goed (gem. reactietijd in deze fase is 9 dagen).",
      source: "Sales-pijplijn · activiteit",
      draft: { type: "message", channel: "E-mail", to: "events@nieuwevaart.nl",
        body: "Hoi Marit,\n\nKorte check-in: hebben jullie de offerte voor de sloepentocht kunnen bekijken? Ik hoor graag of er nog vragen zijn of dat ik iets kan aanpassen.\n\nGeen haast, laat het me gewoon even weten.\n\nGroet,\nRamon" } },
    { mod: "contracten", agent: "juris", accent: "green", icon: "docpen", title: "Contract Pllek NDSM wacht op handtekening", desc: "€ 2.100", action: "Tekenlink sturen",
      approveLabel: "Goedkeuren & versturen",
      why: "Het contract met Pllek NDSM (€ 2.100) is akkoord besproken maar nog niet getekend. Juris stelt voor de digitale tekenlink te sturen zodat het deze week rond is.",
      source: "Contracten · status",
      draft: { type: "email", to: "events@pllek.nl", subject: "Tekenen, samenwerking Sloepenspel × Pllek",
        body: "Hoi,\n\nFijn dat we eruit zijn! Hierbij de tekenlink voor ons contract (€ 2.100). Eén klik en je tekent digitaal, duurt een halve minuut.\n\n[ Digitale tekenlink ]\n\nZodra het getekend is plannen we de eerste datum in.\n\nGroet,\nRamon" } },
    { mod: "studio", agent: "mila", accent: "mila", icon: "brush", title: "3 social posts staan klaar voor jouw akkoord", desc: "via Mila · deze week", action: "Plannen",
      approveLabel: "Goedkeuren & inplannen",
      why: "Mila heeft 3 posts voor deze week gemaakt op basis van je best presterende content (zomer-sloepentochten scoren +40% engagement). Klaar om in te plannen op je vaste tijden.",
      source: "Studio · contentkalender",
      draft: { type: "posts", items: [
        { platform: "Instagram", when: "wo 10:00", text: "☀️ De zon is terug, en het water wacht. Boek deze week een sloep en vier de zomer op z'n Amsterdams. Link in bio. #sloepenspel #amsterdam" },
        { platform: "LinkedIn", when: "do 08:30", text: "Teamuitje dat wél blijft hangen? Een sloepentocht over de grachten, borrel aan boord, geen gedoe. Plek voor 8 tot 60 personen. Stuur een bericht voor de opties." },
        { platform: "Instagram", when: "vr 17:00", text: "Vrijdagmiddag-stemming 🚤 Tag iemand met wie jij het water op wilt dit weekend." },
      ] } },
    { mod: "finder", agent: "kai", accent: "aqua", icon: "search", title: "12 nieuwe leads klaar om naar CRM te zetten", desc: "Amsterdam-Noord", action: "Naar CRM",
      approveLabel: "Goedkeuren & importeren",
      why: "Kai vond 12 bedrijven in Amsterdam-Noord die passen bij je beste klanten (events-locaties & horeca aan het water). Match-score ≥ 80%. Klaar om als lead in je CRM te zetten.",
      source: "Finder · leadonderzoek",
      draft: { type: "list", label: "12 leads importeren als 'Nieuw' in CRM", items: [
        { name: "Restaurant Bar Brouw", sub: "Amsterdam-West · score 92" },
        { name: "Hotel Jakarta", sub: "Java-eiland · score 88" },
        { name: "Pllek NDSM", sub: "NDSM-werf · score 86" },
        { name: "Café de Ceuvel", sub: "Noord · score 83" },
        { name: "+ 8 andere", sub: "score 80–82" },
      ] } },
    { mod: "crm", agent: "hugo", accent: "red", icon: "phone", title: "2 contacten zijn al 30 dagen stil", desc: "Marqt · Hotel V", action: "Opvolgen",
      approveLabel: "Goedkeuren & versturen",
      why: "Marqt en Hotel V hebben 30+ dagen geen contact gehad. Beide waren 'warm'. Hugo stelt een korte heractivatie-mail voor om ze niet te verliezen.",
      source: "CRM · contacthistorie",
      draft: { type: "message", channel: "E-mail", to: "Marqt, Hotel V (2 ontvangers)",
        body: "Hoi,\n\nHet is alweer even geleden! Ik dacht aan jullie omdat we net nieuwe data voor de zomer hebben vrijgegeven. Mocht een sloepentocht of teamuitje nog op de planning staan, laat het weten, dan reserveer ik alvast.\n\nGroet,\nRamon" } },
    { mod: "club", agent: "iris", accent: "orange", icon: "star", title: "Ondernemersborrel 20 juni, 2 open vragen", desc: "Pllek NDSM", action: "Beantwoorden",
      approveLabel: "Antwoord goedkeuren",
      why: "Twee deelnemers van de Ondernemersborrel stelden vragen in de club-chat. Iris heeft concept-antwoorden klaargezet op basis van de eventinfo.",
      source: "Club Kyano · event-chat",
      draft: { type: "qa", items: [
        { q: "Is er parkeergelegenheid bij Pllek?", a: "Ja, gratis parkeren op de NDSM-werf, 3 min lopen. Of neem de gratis pont vanaf Amsterdam Centraal (elke 15 min)." },
        { q: "Tot hoe laat loopt de borrel?", a: "Inloop vanaf 17:00, programma tot 19:30, daarna vrije borrel tot 21:00." },
      ] } },
    { mod: "sales", agent: "hugo", accent: "red", icon: "chartup", title: "Conservatorium Hotel is klaar voor een offerte", desc: "In gesprek · € 3.900", action: "Offerte opstellen",
      approveLabel: "Offerte laten opstellen",
      why: "Het tweede gesprek met Conservatorium Hotel was positief, ze willen een vast teamuitje-arrangement. Hugo stelt voor om nu de offerte (€ 3.900) op te stellen zolang het warm is.",
      source: "Sales-pijplijn · gespreksnotities" },
    { mod: "sales", agent: "hugo", accent: "red", icon: "phone", title: "Hotel Okura wacht op een belafspraak", desc: "In gesprek · € 2.800", action: "Belafspraak plannen",
      approveLabel: "Belafspraak inplannen",
      why: "Hotel Okura vroeg om een belmoment over het teamuitje. Het staat al 4 dagen open, Hugo stelt voor vandaag of morgen te bellen voordat het afkoelt.",
      source: "Sales-pijplijn · activiteit" },
    { mod: "sales", agent: "iris", accent: "red", icon: "refresh", title: "Marqt is een win-back kans", desc: "Oud-klant · 6 maanden stil", action: "Win-back sturen",
      approveLabel: "Win-back mail klaarzetten",
      why: "Marqt was een goede klant maar bestelde 6 maanden niet. De zomerdata zijn net vrij, Iris stelt een lichte win-back mail voor met een concreet voorstel.",
      source: "CRM · contacthistorie" },

    /* ---- Groei: voorstellen van Max (SEO), Mila (CRO) en Iris (AI) ---- */
    { mod: "seo", agent: "max", accent: "navy", icon: "chartup", title: "Zoekwoord vooraan in de titel, Home", desc: "Home · SEO", action: "Toepassen in CMS",
      urgent: true, overdue: true, approveLabel: "Toegepast, Max verwerkt het",
      why: "1.240 vertoningen op 'bedrijfsuitje amsterdam' met maar 0,6% doorklik. Het zoekwoord vooraan in de H1 verhoogt de relevantie én de doorklikkans vanuit Google.",
      source: "Google Search Console" },
    { mod: "seo", agent: "max", accent: "navy", icon: "doc", title: "Meta-omschrijving ontbreekt op Prijzen", desc: "Prijzen · SEO", action: "Toepassen in CMS",
      approveLabel: "Toegepast, Max verwerkt het",
      why: "De prijzenpagina heeft geen meta-omschrijving, Google kiest nu zelf een willekeurige zin uit de tekst. Een gerichte omschrijving verhoogt de doorklikkans in de zoekresultaten.",
      source: "Google Search Console" },
    { mod: "seo", agent: "max", accent: "navy", icon: "link", title: "Interne link naar Het spel toevoegen", desc: "Home · SEO", action: "Toepassen in CMS",
      approveLabel: "Toegepast, Max verwerkt het",
      why: "De homepagina linkt nergens naar 'Het spel', terwijl dat je belangrijkste pagina is. Een interne link verdeelt autoriteit en helpt bezoekers (en Google) verder.",
      source: "SEO-audit · sitestructuur" },
    { mod: "seo", agent: "mila", accent: "mila", icon: "eye", title: "Drempel verlagen bij het contactformulier", desc: "Contact · CRO", action: "Toepassen in CMS",
      urgent: true, overdue: true, approveLabel: "Toegepast, Mila verwerkt het",
      why: "32% scrolt tot het formulier, maar slechts 4% verstuurt het. Minder velden en een duidelijkere knoptekst kunnen de conversie flink verhogen.",
      source: "Microsoft Clarity" },
    { mod: "seo", agent: "mila", accent: "mila", icon: "eye", title: "Hoofdknop valt weg onder de vouw", desc: "Home · CRO", action: "Toepassen in CMS",
      approveLabel: "Toegepast, Mila verwerkt het",
      why: "Op mobiel ligt de hoofdknop bij 60% van de bezoekers onder de vouw. Hoger plaatsen kan de kliks op 'Plan je tocht' merkbaar verhogen.",
      source: "Microsoft Clarity · heatmap" },
    { mod: "seo", agent: "iris", accent: "purple", icon: "spark", title: "AI noemt een verouderde prijs", desc: "Prijzen · AI", action: "Toepassen in CMS",
      approveLabel: "Toegepast, Iris verwerkt het",
      why: "ChatGPT citeert nog € 49,50 p.p. terwijl het € 59,50 is. Een duidelijke, gestructureerde prijsvermelding corrigeert de bron die AI-assistenten gebruiken.",
      source: "LLM-audit · ChatGPT" },

    { mod: "seo", agent: "max", accent: "navy", icon: "doc", title: "Meta-titel te lang op Het spel", desc: "Het spel · SEO", action: "Toepassen in CMS",
      approveLabel: "Toegepast, Max verwerkt het",
      why: "De paginatitel is 71 tekens, Google kapt af na ~60 en de kern valt weg. Korter en met het zoekwoord vooraan toont hij volledig in de resultaten.",
      source: "Semrush · site-audit" },
    { mod: "seo", agent: "max", accent: "navy", icon: "doc", title: "Dubbele title-tags op twee pagina's", desc: "Locaties · SEO", action: "Toepassen in CMS",
      approveLabel: "Toegepast, Max verwerkt het",
      why: "Locaties en Locaties-detail delen dezelfde title-tag. Google weet dan niet welke moet ranken, wat beide pagina's verzwakt. Elke pagina een unieke titel geven.",
      source: "Semrush · site-audit" },
    { mod: "seo", agent: "max", accent: "navy", icon: "doc", title: "Alt-teksten ontbreken op 9 afbeeldingen", desc: "Home · SEO", action: "Toepassen in CMS",
      approveLabel: "Toegepast, Max verwerkt het",
      why: "Negen foto's hebben geen alt-tekst. Dat kost je beeld-SEO én toegankelijkheid. Max stelt beschrijvende alt-teksten met je zoekwoorden voor.",
      source: "Semrush · site-audit" },
    { mod: "seo", agent: "max", accent: "navy", icon: "clock", title: "Pagina laadt traag op mobiel", desc: "Prijzen · Techniek", action: "Toepassen in CMS",
      urgent: true, overdue: true, approveLabel: "Toegepast, Max verwerkt het",
      why: "De hero-foto is 2,4 MB, waardoor de pagina pas na 3,8s laadt (LCP). Trager dan 2,5s kost je posities én bezoekers. Comprimeren brengt 'm onder de 1,5s.",
      source: "Core Web Vitals · PageSpeed" },
    { mod: "seo", agent: "max", accent: "navy", icon: "link", title: "Gebroken link gevonden (404)", desc: "Over ons · Techniek", action: "Toepassen in CMS",
      approveLabel: "Toegepast, Max verwerkt het",
      why: "Een link op 'Over ons' wijst naar een oude blog-URL die een 404 geeft. Dat schaadt vertrouwen en SEO. Doorverwijzen of de link bijwerken lost het op.",
      source: "Semrush · site-audit" },
    { mod: "seo", agent: "max", accent: "navy", icon: "search", title: "Zoekwoord-kans: 'vrijgezellenfeest amsterdam'", desc: "Kans · SEO", action: "Contentplan toevoegen",
      approveLabel: "Op contentplan gezet",
      why: "880 zoekopdrachten per maand, een concurrent rankt er wél op en jij niet. Een aparte sectie of blog rond dit thema opent een nieuwe doelgroep.",
      source: "Semrush · keyword gap" },
    { mod: "seo", agent: "max", accent: "navy", icon: "trend", title: "Schema-markup toevoegen voor rijke resultaten", desc: "Prijzen · SEO", action: "Toepassen in CMS",
      approveLabel: "Toegepast, Max verwerkt het",
      why: "De prijzenpagina mist FAQ- en Product-schema. Daarmee kan Google sterren, prijzen en vragen direct in de zoekresultaten tonen, wat de doorklik flink verhoogt.",
      source: "Semrush · site-audit" },
    { mod: "seo", agent: "mila", accent: "mila", icon: "eye", title: "Rage clicks op de prijzen-tabel", desc: "Prijzen · CRO", action: "Toepassen in CMS",
      urgent: true, overdue: true, approveLabel: "Toegepast, Mila verwerkt het",
      why: "18% van de bezoekers klikt herhaaldelijk op de prijs-tabel alsof die klikbaar is. Een duidelijke knop 'Direct boeken' bij elk pakket vangt die intentie op.",
      source: "Microsoft Clarity · rage clicks" },
    { mod: "seo", agent: "mila", accent: "mila", icon: "eye", title: "Dead clicks op de footer-iconen", desc: "Alle pagina's · CRO", action: "Toepassen in CMS",
      approveLabel: "Toegepast, Mila verwerkt het",
      why: "Bezoekers klikken op de social-iconen in de footer, maar die zijn niet gelinkt (dead clicks). Ze koppelen aan je echte kanalen voorkomt frustratie.",
      source: "Microsoft Clarity · dead clicks" },
    { mod: "seo", agent: "iris", accent: "purple", icon: "spark", title: "FAQ-blok toevoegen voor AI-antwoorden", desc: "Het spel · AI", action: "Toepassen in CMS",
      approveLabel: "Toegepast, Iris verwerkt het",
      why: "Een gestructureerd vraag-en-antwoord-blok vergroot de kans dat ChatGPT en Gemini jouw site citeren bij vragen als 'wat is het sloepenspel'. Nu ontbreekt dat.",
      source: "LLM-audit · ChatGPT · Gemini" },
    { mod: "seo", agent: "mila", accent: "mila", icon: "doc", title: "Blog-kans: 'teamuitje ideeën Amsterdam'", desc: "Studio · Content", action: "Contentplan toevoegen",
      approveLabel: "Op contentplan gezet",
      why: "1.300 zoekopdrachten per maand en sluit precies aan op je dienst. Een blog hierover trekt bezoekers boven in de funnel die je later kunt laten boeken.",
      source: "Semrush · content gap" },

    /* ── STUDIO · concepten die Mila klaarzette (openen in de editor) ── */
    { mod: "studio", agent: "mila", accent: "mila", icon: "brush", title: "Landingspagina klaar: Bedrijfsuitje Amsterdam", desc: "Studio · landingspagina", action: "Openen in editor",
      openPage: "concept-bedrijfsuitje", approveLabel: "Geopend in de editor",
      why: "Op 'bedrijfsuitje amsterdam' (2.400 zoekopdrachten p/m) heb je nog geen eigen pagina. Mila schreef een volledige landingspagina in je huisstijl, klaar om te bekijken, aan te passen en live te zetten.",
      source: "Semrush · keyword gap" },
    { mod: "studio", agent: "mila", accent: "mila", icon: "brush", title: "Landingspagina klaar: Vrijgezellenfeest op het water", desc: "Studio · landingspagina", action: "Openen in editor",
      openPage: "concept-vrijgezel", approveLabel: "Geopend in de editor",
      why: "Een concurrent rankt op 'vrijgezellenfeest amsterdam' (880 p/m) en jij niet. Mila zette een aparte landingspagina klaar die precies op die doelgroep aansluit.",
      source: "Semrush · keyword gap" },
    { mod: "studio", agent: "mila", accent: "mila", icon: "pencil", title: "Blogpost klaar: Teamuitje in het najaar", desc: "Studio · blogpost", action: "Openen in editor",
      openPage: "concept-blog-najaar", approveLabel: "Geopend in de editor",
      why: "Najaar is je rustigste periode in boekingen. Deze blog speelt in op zoekgedrag rond die maanden en trekt bezoekers boven in de funnel die je later kunt laten boeken.",
      source: "Semrush · content gap" },
  ];

  // ---- KPI-catalogus: bewerkbare quickview-kaarten ----
  const kpiCatalog = {
    // Vandaag
    taken:      { id: "taken", k: "Openstaande taken", v: String(tasks.length), sub: "→ open in Vandaag", icon: "check", accent: "navy", link: "vandaag", d: { v: "+3", dir: "up", good: false } },
    // Inbox
    gesprekken: { id: "gesprekken", k: "Open gesprekken", v: "4", sub: "alle kanalen", icon: "inbox", accent: "teal", link: "postvak", d: { v: "+2", dir: "up", good: false } },
    // CRM
    contacten:  { id: "contacten", k: "Actieve contacten", v: "142", sub: "in je CRM", icon: "people", accent: "red", link: "crm", d: { v: "+6", dir: "up", good: true } },
    stil:       { id: "stil", k: "Stille contacten", v: "2", sub: "30+ dagen geen contact", icon: "people", accent: "orange", link: "crm", d: { v: "+1", dir: "up", good: false } },
    // Sales
    pipeline:   { id: "pipeline", k: "Open pipeline", v: "€ 18.400", sub: "5 actieve deals", icon: "chartup", accent: "red", link: "sales", d: { v: "+12%", dir: "up", good: true } },
    deals:      { id: "deals", k: "Open deals", v: "5", sub: "in de pijplijn", icon: "chartup", accent: "red", link: "sales", d: { v: "+2", dir: "up", good: true } },
    // Finder
    leads:      { id: "leads", k: "Nieuwe leads", v: "38", sub: "deze week gevonden", icon: "search", accent: "aqua", link: "finder", d: { v: "+12", dir: "up", good: true } },
    // Agents
    agentsactief:{ id: "agentsactief", k: "Agents actief", v: "6 / 8", sub: "vandaag aan het werk", icon: "spark", accent: "purple", link: "agents", d: { v: "+1", dir: "up", good: true } },
    // Offertes
    offertes:   { id: "offertes", k: "Open offertes", v: "4", sub: "1 nog te versturen", icon: "doc", accent: "teal", link: "offertes", d: { v: "+1", dir: "up", good: true } },
    geaccepteerd:{ id: "geaccepteerd", k: "Geaccepteerde offertes", v: "1", sub: "akkoord van klant", icon: "check", accent: "green", link: "offertes", d: { v: "+1", dir: "up", good: true } },
    // Contracten
    contracten: { id: "contracten", k: "Contracten getekend", v: "1", sub: "1 wacht op tekenen", icon: "docpen", accent: "green", link: "contracten", d: { v: "+1", dir: "up", good: true } },
    // Facturen
    openstaand: { id: "openstaand", k: "Openstaand", v: "€ 603,79", sub: "1 factuur over tijd", icon: "invoice", accent: "orange", link: "facturen", d: { v: "−18%", dir: "down", good: true } },
    // Omzet
    omzet:      { id: "omzet", k: "Omzet deze maand", v: "€ 9.140", sub: "laatste 30 dagen", icon: "euro", accent: "green", link: "omzet", d: { v: "+18%", dir: "up", good: true } },
    gewonnen:   { id: "gewonnen", k: "Gewonnen", v: "€ 9,1k", sub: "deze maand", icon: "star", accent: "green", link: "omzet", d: { v: "+18%", dir: "up", good: true } },
    // Analytics
    conversie:  { id: "conversie", k: "Conversie", v: "31%", sub: "lead → klant", icon: "target", accent: "blue", link: "analytics", d: { v: "+12%", dir: "up", good: true } },
    // Website
    bezoekers:  { id: "bezoekers", k: "Websitebezoekers", v: "1.240", sub: "laatste 7 dagen", icon: "globe", accent: "gold", link: "website", d: { v: "+9%", dir: "up", good: true } },
    aanvragen:  { id: "aanvragen", k: "Website-aanvragen", v: "3", sub: "deze week via formulier", icon: "globe", accent: "gold", link: "website", d: { v: "+2", dir: "up", good: true } },
    // Groei / SEO
    // Groei / SEO · Semrush
    top10:      { id: "top10", k: "Top-10 zoekwoorden", v: "7", sub: "in Google top 10", icon: "trend", accent: "gold", link: "seo", d: { v: "+2", dir: "up", good: true } },
    organic:    { id: "organic", k: "Organisch verkeer", v: "2.480", sub: "Semrush · per maand", icon: "trend", accent: "gold", link: "seo", d: { v: "+14%", dir: "up", good: true } },
    kwpos:      { id: "kwpos", k: "Gem. positie", v: "12,4", sub: "Semrush · 84 zoekwoorden", icon: "target", accent: "gold", link: "seo", d: { v: "\u22122,1", dir: "down", good: true } },
    backlinks:  { id: "backlinks", k: "Backlinks", v: "184", sub: "Semrush · 41 domeinen", icon: "link", accent: "gold", link: "seo", d: { v: "+9", dir: "up", good: true } },
    visibility: { id: "visibility", k: "Zichtbaarheid", v: "8,2%", sub: "Semrush · zoekmarkt", icon: "globe", accent: "gold", link: "seo", d: { v: "+0,7pt", dir: "up", good: true } },
    // Groei / CRO · Microsoft Clarity
    claritysessies: { id: "claritysessies", k: "Clarity-sessies", v: "1.560", sub: "Clarity · 7 dagen", icon: "chartup", accent: "mila", link: "seo", d: { v: "+11%", dir: "up", good: true } },
    rage:       { id: "rage", k: "Rage clicks", v: "3,1%", sub: "Clarity · van sessies", icon: "bell", accent: "orange", link: "seo", d: { v: "\u22120,8pt", dir: "down", good: true } },
    dead:       { id: "dead", k: "Dead clicks", v: "5,4%", sub: "Clarity · van sessies", icon: "bell", accent: "orange", link: "seo", d: { v: "\u22121,2pt", dir: "down", good: true } },
    scroll:     { id: "scroll", k: "Scrolldiepte", v: "62%", sub: "Clarity · gemiddeld", icon: "eye", accent: "mila", link: "seo", d: { v: "+4pt", dir: "up", good: true } },
    engagementtijd: { id: "engagementtijd", k: "Aandachtstijd", v: "1m 48s", sub: "Clarity · per sessie", icon: "clock", accent: "mila", link: "seo", d: { v: "+12s", dir: "up", good: true } },
    // Studio
    posts:      { id: "posts", k: "Posts deze week", v: "3", sub: "klaar voor akkoord", icon: "brush", accent: "mila", link: "studio", d: { v: "+1", dir: "up", good: true } },
    // Social
    volgers:    { id: "volgers", k: "Social volgers", v: "4.350", sub: "alle kanalen", icon: "share", accent: "mila", link: "social", d: { v: "+94", dir: "up", good: true } },
    // Agenda
    afspraken:  { id: "afspraken", k: "Afspraken", v: "5", sub: "deze week", icon: "calendar", accent: "teal", link: "agenda", d: { v: "+2", dir: "up", good: true } },
    // People
    team:       { id: "team", k: "Teamleden", v: "4", sub: "met toegang", icon: "network", accent: "navy", link: "people" },
    // Club
    leden:      { id: "leden", k: "Clubleden", v: "212", sub: "actieve leden", icon: "star", accent: "orange", link: "club", d: { v: "+8", dir: "up", good: true } },
    // Studio
    concepten:      { id: "concepten", k: "Concepten klaar", v: "6", sub: "door Mila", icon: "pencil", accent: "mila", link: "studio", d: { v: "+2", dir: "up", good: true } },
    blogslive:      { id: "blogslive", k: "Blogs live", v: "8", sub: "op de site", icon: "doc", accent: "navy", link: "studio", d: { v: "+1", dir: "up", good: true } },
    pageviewsblog:  { id: "pageviewsblog", k: "Pageviews blog", v: "3.4k", sub: "laatste 30 dagen", icon: "eye", accent: "gold", link: "analytics", d: { v: "+18%", dir: "up", good: true } },
    conceptdraait:  { id: "conceptdraait", k: "Beste landingspagina", v: "4,1%", sub: "conversie · zomeractie", icon: "target", accent: "green", link: "studio", d: { v: "+0,6pt", dir: "up", good: true } },
  };
  const kpiDefault = ["taken", "omzet", "pipeline", "leads"];

  // ---- Iris-kolom: kaartjes die om input vragen ----
  // module = waar het onderwerp leeft · target = hub die de actie afhandelt (postvak=Inbox)
  const irisCards = [
    {
      from: "Hugo", accent: "red", module: "offertes", target: "postvak",
      ctx: "Offertes", text: "Offerte voor Nieuwe Vaart Events staat 14 dagen stil. Zal ik een vriendelijke follow-up sturen?",
      cta: "Stuur follow-up", did: "Hugo zet de follow-up klaar in je Inbox", icon: "send",
    },
    {
      from: "Juris", accent: "green", module: "facturen", target: "postvak",
      ctx: "Facturen", text: "Factuur #2026-014 is 5 dagen over de vervaldatum. Herinnering versturen naar Hotel Okura?",
      cta: "Stuur herinnering", did: "Juris zet de herinnering klaar in je Inbox", icon: "send",
    },
    {
      from: "Iris", accent: "teal", module: "agenda", target: "agenda",
      ctx: "Agenda", text: "Lisa de Vries wil de sloepen voor 28 juni vastleggen. Zal ik 09:30 blokken om terug te bellen?",
      cta: "Zet in agenda", did: "09:30 geblokt, staat in je Agenda", icon: "calendar",
    },
    {
      from: "Mila", accent: "mila", module: "social", target: "social",
      ctx: "Social", text: "3 social posts staan klaar voor deze week. Wil je ze goedkeuren?",
      cta: "Keur goed", did: "Mila plant de 3 posts in", icon: "check",
    },
  ];

  // Chat-opener zonder vaste groet, de groet wordt per tijdstip opgebouwd in de UI
  const irisChat = [
    { who: "iris", text: "Je hebt vandaag 3 dingen die op je wachten, zal ik ze één voor één langslopen?", opener: true },
  ];

  // ---- Iris ochtendbriefing: korte duiding + glanceable cijfers (geen herhaling van de kaarten) ----
  // 'lede' = interpretatie/koers van de dag; 'meta' = oogopslag-cijfers. 'Vernieuw' wisselt de variant.
  const irisBriefing = [
    {
      lede: "Een rustige dag. Drie dingen vragen je aandacht: pak de stille offerte en de vervallen factuur als eerste, de rest loopt op schema. Je agents hebben 's nachts doorgewerkt.",
      meta: [
        { v: "3", l: "acties open", to: "vandaag" },
        { v: "1", l: "rode vlag", to: "facturen" },
        { v: "€ 9.140", l: "omzet · +18%", to: "sales" },
      ],
    },
    {
      lede: "Mooie nacht voor de cijfers: 12 nieuwe leads via de Finder en je omzet loopt voor op vorige maand. Ik zou vandaag op de pijplijn focussen, want drie warme deals staan klaar om door te zetten.",
      meta: [
        { v: "12", l: "nieuwe leads", to: "finder" },
        { v: "€ 18,4k", l: "open pijplijn", to: "sales" },
        { v: "3", l: "warme deals", to: "crm" },
      ],
    },
    {
      lede: "Het meeste van vandaag is afgehandeld, knap werk. Nog twee dingen voor de afronding: Mila's website-tekst wacht op je blik en een klant is 30 dagen stil. Daarna sluit je met een gerust hart af.",
      meta: [
        { v: "2", l: "acties resterend", to: "vandaag" },
        { v: "7/8", l: "facturen betaald", to: "facturen" },
        { v: "94%", l: "dag afgerond", to: "vandaag" },
      ],
    },
  ];

  // ---- Rode vlaggen: stille offertes, vervallen facturen, churn-risico ----
  const irisFlags = [
    { icon: "clock", urg: "high", title: "Offerte 14 dagen stil", who: "Nieuwe Vaart Events", v: "€ 4.400", when: "verzonden 4 jun", target: "offertes" },
    { icon: "invoice", urg: "critical", title: "Factuur vervallen", who: "Hotel Okura", v: "€ 603,79", when: "5 dagen te laat", target: "facturen" },
    { icon: "people", urg: "medium", title: "Klant 30 dagen stil", who: "Lisa de Vries", v: "warme lead", when: "laatste contact 3 jun", target: "crm" },
    { icon: "docpen", urg: "high", title: "Contract wacht op handtekening", who: "Pllek NDSM", v: "€ 2.100", when: "4 dagen open", target: "contracten" },
  ];

  return { client, agents, modules, kpiCatalog, kpiDefault, tasks, irisCards, irisChat, irisBriefing, irisFlags };
})();
