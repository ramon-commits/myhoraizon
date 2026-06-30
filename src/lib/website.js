/* ============================================================
   website.js — databron-seam voor de Website-module.

   ECHTE BRON (werkend, geverifieerd in ~/Desktop/horaizon-app-main):
     Edge functions op Stan's Supabase-project `dofmjstoeqpezukgqtyq`:
       - seo-agent        POST { action: 'write_page' | 'optimize_page' | 'batch_run', projectId, ... }
       - keyword-api      DataForSEO + Google Search Console (volume, difficulty,
                          CPC, positie, clicks, impressions, CTR)
       - semrush-api      legacy — vervangen door keyword-api
       - quick-site-scan  → ScanResult { totaal, snelheid, vindbaarheid, content,
                          mobiel, conversie, ai_gereedheid, vertrouwen,
                          concurrentie, inzichten[] }
       - conversie-agent  CRO-adviezen
     Tabellen (Stan-schema, organizations/projects — GEEN tenants):
       projects, paginas (pagina_type, status, seo_score),
       pagina_secties, content_mapping_matrix (keyword, gsc_clicks,
       gsc_impressions, gsc_ctr, keyword_difficulty_personal, bron, bron_data),
       seo_keyword_tracking (keyword, positie, bron), content_changes,
       agent_runs, analytics_snapshots, diensten_catalogus.

   WAAROM NOG NIET LIVE: myhoraizon draait op het BREIN-project
   (`ajcckxxlkvdnpwdfvmvk`); de Website-backend draait op een ANDER project
   (`dofmjstoeqpezukgqtyq`) met een ANDER schema (organizations i.p.v. tenants).
   Een brein-geauthenticeerde klant-JWT wordt door Stan's project niet
   geaccepteerd en de RLS daar filtert op organization_members. Cross-project
   lezen vanuit de browser kan dus niet. Live gaan vereist Masterplan-blok
   F2.7-B4: seo-agent + keyword-api + conversie-agent + de paginas/keyword-
   tabellen porten naar het brein, met organizations→tenants glue.

   SEAM: zodra die tabellen in het brein bestaan (`website_paginas`,
   `website_keywords`, `website_scan` — zelfde supabase-client als de rest van
   myhoraizon), levert fetchWebsiteSnapshot ze direct uit, connected=true, geen
   UI-wijziging nodig. Tot die tijd: connected=false + een voorbeeld in de ECHTE
   vorm (geen stille demo — de UI labelt dit expliciet als seam).
   ============================================================ */
import { supabase } from './supabase'

// Brein-zijde tabelnamen ná de port (F2.7-B4). Bestaan ze nog niet → seam.
const T_PAGINAS = 'website_paginas'
const T_KEYWORDS = 'website_keywords'
const T_SCAN = 'website_scan'

/* Voorbeeld in de ECHTE vorm. Alleen getoond in seam-modus en altijd als
   zodanig gelabeld in de UI. Spiegelt de kolommen uit horaizon-app 1:1. */
function voorbeeldSnapshot(tenant) {
  const domein = afgeleidDomein(tenant)
  return {
    domein,
    siteStatus: 'live',
    // quick-site-scan ScanResult
    scan: {
      totaal: 78, snelheid: 72, vindbaarheid: 81, content: 84, mobiel: 88,
      conversie: 69, ai_gereedheid: 74, vertrouwen: 90, concurrentie: 65,
    },
    // analytics_snapshots / GSC-afgeleid
    kpis: { bezoekers: 1240, aanvragen: 3, top10: 7, conversie: 2.4 },
    // paginas-tabel
    paginas: [
      { titel: 'Home', pagina_type: 'home', seo_score: 86, status: 'gepubliceerd' },
      { titel: 'Het spel', pagina_type: 'dienst_detail', seo_score: 79, status: 'gepubliceerd' },
      { titel: 'Prijzen', pagina_type: 'dienst_detail', seo_score: 71, status: 'gepubliceerd' },
      { titel: 'Bedrijfsuitje Amsterdam', pagina_type: 'lokale_landingspagina', seo_score: 64, status: 'concept' },
      { titel: 'Blog: zomer op het water', pagina_type: 'blog', seo_score: 58, status: 'concept' },
    ],
    // seo_keyword_tracking-tabel
    keywords: [
      { keyword: 'sloepenspel amsterdam', positie: 4, bron: 'gsc', move: 2 },
      { keyword: 'bedrijfsuitje varen amsterdam', positie: 8, bron: 'dataforseo', move: 1 },
      { keyword: 'teamuitje amsterdam water', positie: 12, bron: 'dataforseo', move: -1 },
      { keyword: 'origineel bedrijfsuitje', positie: 16, bron: 'gsc', move: 3 },
    ],
  }
}

function afgeleidDomein(tenant) {
  if (!tenant) return 'sloepenspel.nl'
  if (tenant.metadata?.domein) return tenant.metadata.domein
  const slug = tenant.slug || ''
  if (slug.includes('sloepenspel')) return 'sloepenspel.nl'
  return `${slug || 'klant'}.nl`
}

/* Haalt de website-snapshot op. Probeert eerst de echte (geporte) brein-
   tabellen; bestaan die nog niet, dan een nette seam met dezelfde vorm.
   Retour-vorm is identiek in beide gevallen, alleen `connected`/`source`/
   `reason` verschillen — zo lichten de widgets vanzelf op na de port. */
export async function fetchWebsiteSnapshot({ tenant } = {}) {
  const domein = afgeleidDomein(tenant)
  try {
    // Pols of de geporte tabel bestaat. PostgREST geeft 42P01 als de relatie
    // ontbreekt → dat is precies het seam-signaal (nog niet geport).
    const { data, error } = await supabase
      .from(T_PAGINAS)
      .select('titel, pagina_type, seo_score, status')
      .eq(tenant?.id ? 'tenant_id' : 'titel', tenant?.id || 'titel')
      .limit(50)

    if (error) {
      return seam(domein, tenant, reasonFor(error))
    }

    // Tabel bestaat: lees ook keywords + laatste scan uit het brein.
    const [{ data: kw }, { data: scanRows }] = await Promise.all([
      supabase.from(T_KEYWORDS).select('keyword, positie, bron, move').limit(50),
      supabase.from(T_SCAN).select('*').order('created_at', { ascending: false }).limit(1),
    ])
    const scan = scanRows?.[0] || null
    return {
      connected: true,
      source: 'brein',
      reason: null,
      domein,
      siteStatus: 'live',
      scan,
      kpis: scan
        ? { bezoekers: scan.bezoekers, aanvragen: scan.aanvragen, top10: scan.top10, conversie: scan.conversie }
        : null,
      paginas: data || [],
      keywords: kw || [],
    }
  } catch (e) {
    return seam(domein, tenant, e?.message || 'onbekende fout')
  }
}

function reasonFor(error) {
  const code = error?.code || ''
  if (code === '42P01' || /relation .* does not exist|could not find the table/i.test(error?.message || '')) {
    return 'Website-tabellen nog niet in het brein geport (Masterplan F2.7-B4).'
  }
  return error?.message || 'Brein-query mislukt.'
}

function seam(domein, tenant, reason) {
  return {
    connected: false,
    source: 'seam',
    reason,
    domein,
    ...voorbeeldSnapshot(tenant),
  }
}
