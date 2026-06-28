/* ============================================================
   Dode-klik-test (knoppen-poort). Stuurt headless Chrome via CDP (Node's
   ingebouwde WebSocket, geen extra deps). Logt in via de dev-login, bezoekt
   elke route met een VERSE pagina per klik (geen state-bleed), klikt elk
   interactief element en checkt of binnen ~500ms IETS verandert (URL, DOM-
   mutatie via MutationObserver, of een toast). Faalt met een nette lijst van
   dode klikken (route + label).

   Gebruik:  node tests/deadclick.mjs [/route1 /route2 ...]
   Default:  /  /vandaag  /inbox
   ============================================================ */
const CHROME = '/Applications/Google Chrome.app/Contents/MacOS/Google Chrome'
const PORT = 9223
const BASE = process.env.BASE || 'http://localhost:5174'
const DEV_EMAIL = 'keuren@test.nl'
const DEV_PASS = 'keuren1234'
// prep: optionele in-page stap om een sub-toestand te bereiken (bv. een gesprek
// + contactpaneel openen) zodat ook die knoppen getest worden.
const PREP_INBOX_THREAD = `(async()=>{ const s=ms=>new Promise(r=>setTimeout(r,ms));
  const row=document.querySelector('.irow'); if(!row) return false; row.click(); await s(800);
  const crm=document.querySelector('.tsb-btn.crm') || [...document.querySelectorAll('.icon-btn')].find(b=>/contactpaneel/i.test(b.title||''));
  if(crm) crm.click(); await s(500); return true; })()`

const ROUTES = process.argv.slice(2).length
  ? process.argv.slice(2).map((p) => [p, p, null])
  : [['Dashboard', '/', null], ['Vandaag', '/vandaag', null], ['Inbox', '/inbox', null], ['Inbox (gesprek)', '/inbox', PREP_INBOX_THREAD]]

const sleep = (ms) => new Promise((r) => setTimeout(r, ms))

import { spawn } from 'node:child_process'

const chrome = spawn(CHROME, [
  '--headless=new', '--disable-gpu', '--no-first-run', '--no-default-browser-check',
  '--remote-debugging-port=' + PORT, '--remote-allow-origins=*',
  '--user-data-dir=/tmp/hz-deadclick-profile', 'about:blank',
], { stdio: 'ignore' })

async function getWsUrl() {
  for (let i = 0; i < 60; i++) {
    try {
      const r = await fetch(`http://127.0.0.1:${PORT}/json`)
      const list = await r.json()
      const page = list.find((x) => x.type === 'page')
      if (page && page.webSocketDebuggerUrl) return page.webSocketDebuggerUrl
    } catch { /* nog niet klaar */ }
    await sleep(250)
  }
  throw new Error('Chrome devtools niet bereikbaar')
}

class CDP {
  constructor(ws) {
    this.ws = ws; this.id = 0; this.pending = new Map()
    ws.addEventListener('message', (e) => {
      const m = JSON.parse(e.data)
      if (m.id && this.pending.has(m.id)) { this.pending.get(m.id)(m); this.pending.delete(m.id) }
    })
  }
  send(method, params = {}) {
    const id = ++this.id
    this.ws.send(JSON.stringify({ id, method, params }))
    return new Promise((res) => this.pending.set(id, res))
  }
  async ev6(expr) {
    const r = await this.send('Runtime.evaluate', { expression: expr, awaitPromise: true, returnByValue: true })
    if (r.result && r.result.exceptionDetails) throw new Error('eval: ' + JSON.stringify(r.result.exceptionDetails).slice(0, 300))
    return r.result && r.result.result ? r.result.result.value : undefined
  }
  async goto(url) {
    await this.send('Page.navigate', { url })
    // wacht tot de SPA gerenderd is
    for (let i = 0; i < 40; i++) {
      await sleep(150)
      const ok = await this.ev6("document.readyState==='complete' && !!document.querySelector('.app, .modal-overlay, form, .inbox')").catch(() => false)
      if (ok) break
    }
    await sleep(700)
  }
  path() { return this.ev6('location.pathname') }
}

// In-page helpers (identiek voor enumeratie en klik → stabiele index)
const INPAGE = `
function __vis(el){ const r=el.getBoundingClientRect(); if(r.width<2||r.height<2) return false; const s=getComputedStyle(el); if(s.visibility==='hidden'||s.display==='none'||s.opacity==='0') return false; return true; }
function __label(el){ return (el.getAttribute('aria-label')||el.title||el.textContent||el.getAttribute('href')||'').replace(/\\s+/g,' ').trim().slice(0,70)||'(geen label)'; }
function __collect(){
  // <select> weggelaten: een native dropdown is altijd interactief, maar een
  // synthetische el.click() opent 'm niet en triggert geen change → niet zinvol
  // te toetsen met deze dode-klik-test (vals-positief). Echte knoppen wel.
  const sel='button,[role=button],[role=menuitem],[role=tab],a[href],input[type=checkbox],input[type=radio]';
  return [...document.querySelectorAll(sel)].filter(el=>{
    if(el.disabled) return false;
    if(!__vis(el)) return false;
    if(el.tagName==='A'){ const h=el.getAttribute('href')||''; if(el.target==='_blank') return false; if(/^https?:|^mailto:|^tel:/i.test(h)) return false; }
    if(el.classList.contains('on')&&(el.classList.contains('iview')||el.classList.contains('ichip')||el.classList.contains('qc-tab')||el.classList.contains('size-pill')||el.classList.contains('sx-tab')||el.classList.contains('crm-sort-b')||el.getAttribute('role')==='tab')) return false;
    return true;
  });
}
function __sig(el){ const a=el.closest('.sidebar'); const b=el.closest('.topbar'); return (a?'SB|':b?'TB|':'C|')+el.tagName+'|'+__label(el); }
`

async function enumerate(cdp) {
  const json = await cdp.ev6(`(()=>{ ${INPAGE}; return JSON.stringify(__collect().map((el,i)=>({i,label:__label(el),sig:__sig(el)}))); })()`)
  return JSON.parse(json || '[]')
}
async function clickAt(cdp, idx) {
  const json = await cdp.ev6(`(async()=>{ ${INPAGE};
    const els=__collect(); const el=els[${idx}];
    if(!el) return JSON.stringify({changed:true,gone:true});
    const label=__label(el);
    let mutated=false; const obs=new MutationObserver(()=>{mutated=true});
    obs.observe(document.body,{subtree:true,childList:true,attributes:true,characterData:true});
    const url0=location.href; const toasts0=document.querySelectorAll('.toast').length;
    try{ el.click(); }catch(e){}
    await new Promise(r=>setTimeout(r,500));
    obs.disconnect();
    const changed = mutated || location.href!==url0 || document.querySelectorAll('.toast').length>toasts0;
    return JSON.stringify({label,changed,navigated:location.href!==url0});
  })()`)
  return JSON.parse(json || '{"changed":true}')
}

async function login(cdp) {
  await cdp.goto(BASE + '/login')
  if ((await cdp.path()) !== '/login') return 'ok'   // al ingelogd (sessie in profiel)
  const res = await cdp.ev6(`(()=>{
    function setVal(el,v){ const p=el.tagName==='TEXTAREA'?HTMLTextAreaElement.prototype:HTMLInputElement.prototype; Object.getOwnPropertyDescriptor(p,'value').set.call(el,v); el.dispatchEvent(new Event('input',{bubbles:true})); }
    const email=document.querySelector('input[type=email]')||[...document.querySelectorAll('input')].find(i=>/naam@/.test(i.placeholder||''));
    const pass=document.querySelector('input[type=password]');
    if(!email||!pass) return 'geen-formulier';
    setVal(email,'${DEV_EMAIL}'); setVal(pass,'${DEV_PASS}');
    const btn=[...document.querySelectorAll('button')].find(b=>/log in met wachtwoord/i.test(b.textContent));
    if(!btn) return 'geen-knop';
    btn.click(); return 'verstuurd';
  })()`)
  if (res !== 'verstuurd') return res
  for (let i = 0; i < 40; i++) { await sleep(300); if ((await cdp.path()) !== '/login') return 'ok' }
  return 'login-timeout'
}

async function ensureAuthed(cdp, routePath, prep) {
  await cdp.goto(BASE + routePath)
  if ((await cdp.path()) === '/login') { await login(cdp); await cdp.goto(BASE + routePath) }
  if (prep) { await cdp.ev6(prep).catch(() => {}); await sleep(300) }
}

async function main() {
  const wsUrl = await getWsUrl()
  const ws = new WebSocket(wsUrl)
  await new Promise((res, rej) => { ws.addEventListener('open', res); ws.addEventListener('error', rej) })
  const cdp = new CDP(ws)
  await cdp.send('Page.enable'); await cdp.send('Runtime.enable')

  const loginRes = await login(cdp)
  if (loginRes !== 'ok') {
    console.error('\n❌ Inloggen via dev-login mislukt: ' + loginRes)
    console.error('   Controleer dat de gebruiker ' + DEV_EMAIL + ' bestaat in Supabase (Auto Confirm).')
    chrome.kill(); process.exit(2)
  }
  console.log('✓ Ingelogd via dev-login\n')

  const seen = new Set()
  const dead = []
  let total = 0
  for (const [name, path, prep] of ROUTES) {
    await ensureAuthed(cdp, path, prep)
    const els = await enumerate(cdp)
    let tested = 0
    for (const item of els) {
      if (seen.has(item.sig)) continue
      seen.add(item.sig)
      await ensureAuthed(cdp, path, prep)      // verse pagina per klik
      const r = await clickAt(cdp, item.i)
      total++; tested++
      if (!r.gone && !r.changed) dead.push({ route: name, label: item.label })
    }
    console.log(`• ${name} (${path}): ${tested} knoppen getest`)
  }

  console.log(`\n${total} knoppen getest over ${ROUTES.length} routes.`)
  if (dead.length === 0) {
    console.log('✅ GROEN: geen dode klikken. Elke knop doet iets of toont een toast.')
    chrome.kill(); process.exit(0)
  }
  console.log(`\n❌ ${dead.length} DODE KLIK(KEN):`)
  for (const d of dead) console.log(`   [${d.route}] ${d.label}`)
  chrome.kill(); process.exit(1)
}

main().catch((e) => { console.error(e); try { chrome.kill() } catch {} process.exit(3) })
