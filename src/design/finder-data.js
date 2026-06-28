/* ============================================================
   Leadfinder-config + demo-bron (de SEAM naar Google Places).
   Letterlijk uit de blauwdruk (salescrm.jsx), losgetrokken van de UI zodat
   de echte koppeling later vastklikt zonder de UI om te bouwen:

   • PLACE_GROUPS  — branche-lijst met de ECHTE Google place-type-keys
     (label = NL, key = Google). SEAM: de gekozen keys gaan 1-op-1 als
     `includedTypes` naar de Places Nearby Search (New). Nu simuleren we
     resultaten met FINDER_RESULTS.
   • CITY_CENTERS / geocodeCenter — demo-geocoder (plaats -> lat/lng).
     SEAM: wordt straks de echte Geocoding-API; UI raakt de data niet aan.
   • FINDER_RESULTS — demo-leads. SEAM: wordt de echte Places-respons.
     Elke lead krijgt lat/lng via offsetLatLng zodat de namaak-kaart 1-op-1
     door echte Google Maps vervangen kan worden.

   Niets hiervan is in de UI hardcoded: leadfinder.jsx leest uitsluitend
   hieruit. Vervang dit bestand door de echte API-laag en de UI werkt door.
   ============================================================ */

export const PLACE_GROUPS = [
  { g: "Eten en drinken", items: [
    ["Restaurant", "restaurant"], ["Café", "cafe"], ["Bar", "bar"], ["Pub", "pub"],
    ["Wijnbar", "wine_bar"], ["Koffiebar", "coffee_shop"], ["Bakkerij", "bakery"],
    ["Fastfood", "fast_food_restaurant"], ["Pizzeria", "pizza_restaurant"],
    ["IJssalon", "ice_cream_shop"], ["Afhaal & bezorg", "meal_takeaway"],
    ["Lunchroom / brunch", "brunch_restaurant"], ["Steakhouse", "steak_house"],
    ["Sushi", "sushi_restaurant"], ["Foodcourt", "food_court"], ["Brouwerij", "pub"],
  ]},
  { g: "Hotels en verblijf", items: [
    ["Hotel", "hotel"], ["Boutique hotel", "resort_hotel"], ["Bed & breakfast", "bed_and_breakfast"],
    ["Hostel", "hostel"], ["Resort", "resort_hotel"], ["Pension / gastenverblijf", "guest_house"],
    ["Motel", "motel"], ["Camping", "campground"], ["Vakantiepark", "rv_park"],
  ]},
  { g: "Retail en winkels", items: [
    ["Kledingwinkel", "clothing_store"], ["Schoenenwinkel", "shoe_store"], ["Juwelier", "jewelry_store"],
    ["Elektronicawinkel", "electronics_store"], ["Meubelwinkel", "furniture_store"], ["Boekwinkel", "book_store"],
    ["Cadeauwinkel", "gift_shop"], ["Supermarkt", "supermarket"], ["Buurtwinkel", "convenience_store"],
    ["Warenhuis", "department_store"], ["Bouwmarkt", "hardware_store"], ["Woonwinkel", "home_goods_store"],
    ["Sportwinkel", "sporting_goods_store"], ["Dierenwinkel", "pet_store"], ["Bloemist", "florist"],
    ["Slijterij", "liquor_store"], ["Fietsenwinkel", "bicycle_store"], ["Winkelcentrum", "shopping_mall"],
  ]},
  { g: "Gezondheid en zorg", items: [
    ["Huisarts / arts", "doctor"], ["Tandarts", "dentist"], ["Tandartspraktijk", "dental_clinic"],
    ["Ziekenhuis", "hospital"], ["Apotheek", "pharmacy"], ["Fysiotherapeut", "physiotherapist"],
    ["Chiropractor", "chiropractor"], ["Dierenarts", "veterinary_care"], ["Medisch lab", "medical_lab"],
    ["Huidkliniek", "skin_care_clinic"], ["Wellnesscentrum", "wellness_center"],
  ]},
  { g: "Sport en recreatie", items: [
    ["Sportschool", "gym"], ["Fitnesscentrum", "fitness_center"], ["Sportvereniging", "sports_club"],
    ["Sportcomplex", "sports_complex"], ["Zwembad", "swimming_pool"], ["Golfbaan", "golf_course"],
    ["Yogastudio", "yoga_studio"], ["Stadion", "stadium"], ["Bowlingbaan", "bowling_alley"],
    ["Schaatsbaan", "ice_skating_rink"],
  ]},
  { g: "Schoonheid en wellness", items: [
    ["Kapper", "hair_salon"], ["Kapsalon", "hair_care"], ["Schoonheidssalon", "beauty_salon"],
    ["Barbier", "barber_shop"], ["Nagelstudio", "nail_salon"], ["Spa", "spa"], ["Sauna", "sauna"],
    ["Massagesalon", "massage"], ["Visagist", "makeup_artist"], ["Tanningstudio", "tanning_studio"],
  ]},
  { g: "Zakelijke diensten", items: [
    ["Makelaar", "real_estate_agency"], ["Advocaat / jurist", "lawyer"], ["Accountant", "accounting"],
    ["Verzekeringskantoor", "insurance_agency"], ["Consultant", "consultant"], ["Marketingbureau", "marketing_agency"],
    ["Reclamebureau", "advertising_agency"], ["Uitzendbureau", "employment_agency"], ["Reisbureau", "travel_agency"],
    ["Koeriersdienst", "courier_service"], ["Verhuisbedrijf", "moving_company"],
  ]},
  { g: "Onderwijs", items: [
    ["School", "school"], ["Basisschool", "primary_school"], ["Middelbare school", "secondary_school"],
    ["Universiteit / HBO", "university"], ["Kinderopvang / peuterschool", "preschool"],
    ["Bibliotheek", "library"], ["Rijschool", "driving_school"],
  ]},
  { g: "Bouw en techniek", items: [
    ["Aannemer", "general_contractor"], ["Elektricien", "electrician"], ["Loodgieter", "plumber"],
    ["Schilder", "painter"], ["Dakdekker", "roofing_contractor"], ["Slotenmaker", "locksmith"],
  ]},
  { g: "Auto", items: [
    ["Autodealer", "car_dealer"], ["Autogarage", "car_repair"], ["Autoverhuur", "car_rental"],
    ["Wasstraat", "car_wash"], ["Tankstation", "gas_station"], ["Auto-onderdelen", "auto_parts_store"],
    ["Laadstation (EV)", "electric_vehicle_charging_station"], ["Bandenservice", "tire_shop"],
  ]},
  { g: "Vrije tijd en cultuur", items: [
    ["Museum", "museum"], ["Kunstgalerie", "art_gallery"], ["Bioscoop", "movie_theater"],
    ["Toeristische attractie", "tourist_attraction"], ["Pretpark", "amusement_park"], ["Nachtclub", "night_club"],
    ["Evenementenlocatie", "event_venue"], ["Feestzaal", "banquet_hall"], ["Theater", "performing_arts_theater"],
    ["Concertzaal", "concert_hall"], ["Dierentuin", "zoo"], ["Park", "park"],
  ]},
  { g: "Financieel", items: [
    ["Bank", "bank"], ["Geldautomaat", "atm"], ["Wisselkantoor", "currency_exchange"],
  ]},
];

/* platte index key->label + key->groep, voor chips, zoeken en weergave */
export const PLACE_INDEX = {};
PLACE_GROUPS.forEach((grp) => grp.items.forEach((it) => { if (!PLACE_INDEX[it[1]]) PLACE_INDEX[it[1]] = it[0]; }));
export const placeLabel = (k) => PLACE_INDEX[k] || k;

export const PLACE_GROUP_OF = {};
PLACE_GROUPS.forEach((grp) => grp.items.forEach((it) => { if (!PLACE_GROUP_OF[it[1]]) PLACE_GROUP_OF[it[1]] = grp.g; }));
export const GROUP_ACCENT = {
  "Eten en drinken": "red", "Hotels en verblijf": "gold", "Retail en winkels": "purple",
  "Gezondheid en zorg": "aqua", "Sport en recreatie": "green", "Schoonheid en wellness": "purple",
  "Zakelijke diensten": "navy", "Onderwijs": "navy", "Bouw en techniek": "orange",
  "Auto": "navy", "Vrije tijd en cultuur": "purple", "Financieel": "green",
};
export const pinAccent = (k) => GROUP_ACCENT[PLACE_GROUP_OF[k]] || "red";

/* demo-geocoder: stad/plaats -> lat/lng. SEAM: echte Geocoding-API levert dit straks. */
export const CITY_CENTERS = {
  amsterdam: [52.3731, 4.8922], rotterdam: [51.9244, 4.4777], utrecht: [52.0907, 5.1214],
  "den haag": [52.0705, 4.3007], "the hague": [52.0705, 4.3007], eindhoven: [51.4416, 5.4697],
  groningen: [53.2194, 6.5665], tilburg: [51.5556, 5.0913], breda: [51.5719, 4.7683],
  nijmegen: [51.8126, 5.8372], arnhem: [51.9851, 5.8987], haarlem: [52.3874, 4.6462],
  amersfoort: [52.1561, 5.3878], zwolle: [52.5168, 6.0830], leiden: [52.1601, 4.4970],
  delft: [52.0116, 4.3571], maastricht: [50.8514, 5.6910], "den bosch": [51.6978, 5.3037],
};
export function geocodeCenter(str) {
  const s = (str || "").toLowerCase();
  let hit = null, hitKey = null;
  for (const k in CITY_CENTERS) { if (s.includes(k)) { hit = CITY_CENTERS[k]; hitKey = k; break; } }
  if (!hit) { hit = CITY_CENTERS.amsterdam; hitKey = "amsterdam"; }
  const label = (str || "").trim() || hitKey.replace(/\b\w/g, (c) => c.toUpperCase());
  return { lat: hit[0], lng: hit[1], label };
}
export function offsetLatLng(lat, lng, km, bearingDeg) {
  const br = bearingDeg * Math.PI / 180;
  const dLat = (km * Math.cos(br)) / 110.574;
  const dLng = (km * Math.sin(br)) / (111.320 * Math.cos(lat * Math.PI / 180));
  return { lat: lat + dLat, lng: lng + dLng };
}
export function haversine(la1, lo1, la2, lo2) {
  const R = 6371, d = Math.PI / 180;
  const dLa = (la2 - la1) * d, dLo = (lo2 - lo1) * d;
  const a = Math.sin(dLa / 2) ** 2 + Math.cos(la1 * d) * Math.cos(la2 * d) * Math.sin(dLo / 2) ** 2;
  return 2 * R * Math.asin(Math.sqrt(a));
}

/* demo-leads. SEAM: wordt de echte Places-respons (zelfde velden). */
export const FINDER_RESULTS = [
  { id: 1, bedrijf: "Hotel Jakarta", type: "hotel", d: 1.2, b: 35, adres: "Java-eiland, Amsterdam", tel: "+31 20 723 9200", web: "hoteljakarta.nl", email: "events@hoteljakarta.nl", bron: "website", match: null, score: 92 },
  { id: 2, bedrijf: "Restaurant Bar Brouw", type: "restaurant", d: 2.4, b: 110, adres: "Houthavens, Amsterdam", tel: "+31 20 233 4455", web: "barbrouw.nl", email: "info@barbrouw.nl", bron: "google", match: null, score: 88 },
  { id: 3, bedrijf: "Pllek NDSM", type: "bar", d: 3.1, b: 200, adres: "NDSM-werf, Amsterdam", tel: "+31 20 290 0020", web: "pllek.nl", email: "", bron: "fallback", match: "actief", score: 85 },
  { id: 4, bedrijf: "Café de Ceuvel", type: "cafe", d: 1.8, b: 285, adres: "Noord, Amsterdam", tel: "+31 6 23 11 88 02", web: "deceuvel.nl", email: "info@deceuvel.nl", bron: "instagram", match: null, score: 81 },
  { id: 5, bedrijf: "Hannekes Boom", type: "bar", d: 0.9, b: 150, adres: "Centrum, Amsterdam", tel: "+31 20 419 9820", web: "hannekesboom.nl", email: "boek@hannekesboom.nl", bron: "website", match: "prospect", score: 78 },
  { id: 6, bedrijf: "Roest", type: "event_venue", d: 3.8, b: 320, adres: "Oost, Amsterdam", tel: "+31 20 308 0283", web: "amsterdamroest.nl", email: "", bron: "notfound", match: null, score: 74 },
];
export const BRON_BADGE = { website: { l: "Website", a: "green" }, google: { l: "Google", a: "gold" }, instagram: { l: "Instagram", a: "purple" }, fallback: { l: "Geschat", a: "orange" }, notfound: { l: "Niet gevonden", a: "navy" }, error: { l: "Fout", a: "red" } };
export const MATCH_BADGE = { actief: { l: "Al klant", a: "orange" }, prospect: { l: "Al in CRM", a: "aqua" }, "win-back": { l: "Win-back", a: "orange" } };
