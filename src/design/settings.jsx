/* ============================================================
   settings.jsx — Beheer/Instellingen uit de Claude Design-blauwdruk
   (dashboard/shell.jsx · SettingsPage + ClubModulesSettings).
   De admin van de werkruimte: modules én losse widgets aan/uit, Club-
   modules per club, dashboard-indeling herstellen en demo-reset.
   ESM-port: window-globals -> imports; MOD["club"] -> KYANO.modules;
   window.FUNCTIONS defensief (afwezig -> 0 functies). De module-toggles
   sturen de design-laag-flags (store.jsx loadFlags/saveFlags); de live
   board-/sidebar-gate loopt via de tenant-config (AppShell).
   ============================================================ */
import { ICONS } from './icons'
import { KYANO } from './data'
import { useStore, getState, setState, toast, resetStore, LOCKED_MODULES } from './store.jsx'
import { AC, ACsoft, Panel, Eyebrow, Avatar, Btn } from './components.jsx'
import { DEFAULT_LAYOUT, saveLayout } from './tiles.jsx'
import { WidgetsAdmin } from './widgets.jsx'

const CLUB = KYANO.modules.find((m) => m.id === 'club')

/* ===== Club Kyano: sub-modules per club aan/uit (organization_modules) ===== */
function ClubModulesSettings() {
  useStore()
  const club = CLUB
  if (!club || !club.subModules) return null
  const enabledCount = club.subModules.filter((sm) => { const v = getState('club.mod.' + sm.key); return v === undefined ? sm.on : v }).length
  return (
    <Panel eyebrow={'Club Kyano · ' + (club.clubName || '')} title="Club-modules" accent="orange"
      right={<span className="set-count mono">{enabledCount}/{club.subModules.length} aan</span>}>
      <div className="set-hint mono">Net als in de echte Club: zet per club aan welke modules leden zien.</div>
      {club.subModules.map((sm) => {
        const v = getState('club.mod.' + sm.key)
        const on = v === undefined ? sm.on : v
        return (
          <div className="set-row" key={sm.key}>
            <span className="tile-chip sm" style={{ color: AC(sm.accent), background: ACsoft(sm.accent) }}><span dangerouslySetInnerHTML={{ __html: ICONS(sm.icon) }} /></span>
            <div className="set-main">
              <div className="set-name">{sm.name}</div>
              <div className="set-sub">{sm.desc}</div>
            </div>
            <button className={'toggle' + (on ? ' on' : '')}
              onClick={() => { setState('club.mod.' + sm.key, !on); toast('Club · ' + sm.name + (on ? ' uitgezet' : ' aangezet'), { icon: on ? 'close' : 'check' }) }}>
              <span className="toggle-knob" />
            </button>
          </div>
        )
      })}
    </Panel>
  )
}

/* ===== Beheer: feature-flags per klant (modules aan/uit) ===== */
export function SettingsPage({ flags, setFlag, go }) {
  const enabledCount = KYANO.modules.filter((m) => flags[m.id] !== false).length
  return (
    <div className="module-page">
      <div className="page-hero" style={{ '--acc': AC('teal'), '--acc-soft': ACsoft('teal') }}>
        <div className="hero-id">
          <span className="tile-chip" style={{ width: 56, height: 56, fontSize: 28, borderRadius: 16, color: AC('teal'), background: ACsoft('teal') }}>
            <span dangerouslySetInnerHTML={{ __html: ICONS('sliders') }} />
          </span>
          <div>
            <Eyebrow dot accent="teal">Werkruimte van {KYANO.client.company}</Eyebrow>
            <h1 className="page-title">Beheer</h1>
          </div>
        </div>
        <div className="hero-stat">
          <div className="hero-num-row"><span className="hero-num" style={{ color: AC('teal') }}>{enabledCount}</span></div>
          <div className="hero-sub">modules actief</div>
        </div>
      </div>

      <div className="set-banner">
        <Avatar agent="iris" size={36} />
        <span>Dit is je <b>admin</b>: zet hier modules én losse widgets aan of uit voor deze klant. Uitgezette onderdelen verdwijnen uit het menu, dashboard en de pagina's, je data blijft bewaard.</span>
      </div>

      <Panel eyebrow="Modules & functies" title="Wat is actief voor deze klant" accent="teal">
        {KYANO.modules.map((m) => {
          const on = flags[m.id] !== false
          const locked = LOCKED_MODULES.includes(m.id)
          const fnCount = (window.FUNCTIONS || {})[m.id]
          const n = fnCount ? fnCount.groups.reduce((a, g) => a + g.items.length, 0) : 0
          return (
            <div className="set-row" key={m.id}>
              <span className="tile-chip sm" style={{ color: AC(m.accent), background: ACsoft(m.accent) }}>
                <span dangerouslySetInnerHTML={{ __html: ICONS(m.icon) }} />
              </span>
              <div className="set-main">
                <div className="set-name">{m.name}{locked && <span className="set-lock mono">vast</span>}</div>
                <div className="set-sub">{m.group}{n ? ` · ${n} functies` : ''}</div>
              </div>
              <button className={'toggle' + (on ? ' on' : '') + (locked ? ' disabled' : '')}
                onClick={() => { if (locked) { toast('Deze module staat altijd aan', { icon: 'spark', kind: 'muted' }); return } setFlag(m.id, !on); toast(m.name + (on ? ' uitgezet' : ' aangezet'), { icon: on ? 'close' : 'check' }) }}>
                <span className="toggle-knob" />
              </button>
            </div>
          )
        })}
      </Panel>

      <ClubModulesSettings />

      <WidgetsAdmin flags={flags} go={go} />

      <Panel eyebrow="Werkruimte" title="Beheer" accent="navy">
        <div className="set-row">
          <span className="tile-chip sm" style={{ color: AC('navy'), background: ACsoft('navy') }}><span dangerouslySetInnerHTML={{ __html: ICONS('grid') }} /></span>
          <div className="set-main"><div className="set-name">Dashboard-indeling herstellen</div><div className="set-sub">Tegels terug naar de standaard-volgorde en -maat</div></div>
          <Btn kind="soft" accent="navy" size="sm" onClick={() => { const def = JSON.parse(JSON.stringify(DEFAULT_LAYOUT)); saveLayout(def); toast('Dashboard hersteld', { icon: 'check' }); setTimeout(() => location.reload(), 600) }}>Herstel</Btn>
        </div>
        <div className="set-row">
          <span className="tile-chip sm" style={{ color: AC('red'), background: ACsoft('red') }}><span dangerouslySetInnerHTML={{ __html: ICONS('sync') }} /></span>
          <div className="set-main"><div className="set-name">Demo terugzetten</div><div className="set-sub">Wis alle uitgevoerde acties en keuzes</div></div>
          <Btn kind="soft" accent="red" size="sm" onClick={() => resetStore()}>Reset alles</Btn>
        </div>
      </Panel>
    </div>
  )
}
