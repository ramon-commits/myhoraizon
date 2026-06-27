/* Dev-only showcase van de geporte design-fundamentlaag. Niet in productie.
   Hiermee leg je de gedeelde componenten naast de Claude Design-blauwdruk. */
import {
  Btn, Chip, Delta, StatBlock, Avatar, KyanoBadge, KyanoMark, HoraizonLogo,
  Eyebrow, Bar, Panel, Icon, BarChart, AreaChart, Donut, Ring, KpiStrip,
} from '../design/components.jsx'
import { ObjectActions } from '../design/objectactions.jsx'
import { ToastHost, ConfirmHost } from '../design/store.jsx'

const ACCENTS = ['purple', 'teal', 'orange', 'red', 'aqua', 'navy', 'green', 'gold', 'blue']
const ICON_NAMES = ['home', 'inbox', 'calendar', 'people', 'doc', 'invoice', 'bars', 'chartup', 'star', 'bell', 'check', 'arrow']
const trend = [{ m: 'jan', a: 3.2, b: 1.1 }, { m: 'feb', a: 3.6, b: 1.4 }, { m: 'mrt', a: 4.1, b: 1.2 }, { m: 'apr', a: 3.9, b: 1.8 }, { m: 'mei', a: 4.6, b: 2.0 }, { m: 'jun', a: 5.2, b: 1.7 }]

function Section({ title, children }) {
  return (
    <section style={{ marginBottom: 34 }}>
      <Eyebrow accent="teal" dot>{title}</Eyebrow>
      <div style={{ marginTop: 12, display: 'flex', flexWrap: 'wrap', gap: 16, alignItems: 'flex-start' }}>{children}</div>
    </section>
  )
}

export default function DesignCheckPage() {
  return (
    <div style={{ minHeight: '100vh', background: 'var(--bg)', padding: '34px 40px' }}>
      <div style={{ maxWidth: 1080, margin: '0 auto' }}>
        <header style={{ display: 'flex', alignItems: 'center', gap: 12, marginBottom: 28 }}>
          <HoraizonLogo size={34} />
          <div>
            <div className="mono" style={{ fontSize: 10, letterSpacing: '.14em', textTransform: 'uppercase', color: 'var(--ink3)' }}>design-fundament · dev</div>
            <h1 style={{ font: '700 26px/1 "Bricolage Grotesque",sans-serif', letterSpacing: '-.02em' }}>Gedeelde bouwstenen</h1>
          </div>
        </header>

        <Section title="Knoppen">
          <Btn kind="solid" accent="teal" icon="check">Opslaan</Btn>
          <Btn kind="soft" accent="purple" icon="plus">Nieuw</Btn>
          <Btn kind="tint" accent="blue" icon="arrow">Bekijk</Btn>
          <Btn kind="ghost" icon="dots">Meer</Btn>
        </Section>

        <Section title="Chips, badges en delta">
          {ACCENTS.slice(0, 5).map((a) => <Chip key={a} accent={a}>{a}</Chip>)}
          <Delta d={{ good: true, dir: 'up', v: '+12%' }} />
          <Delta d={{ good: false, dir: 'down', v: '-4%' }} />
          {ACCENTS.slice(0, 5).map((a) => <KyanoBadge key={a} accent={a} size={32} />)}
          <KyanoMark size={26} color="var(--a-navy)" />
        </Section>

        <Section title="Avatars">
          {['Ramon Brugman', 'Iris', 'Hugo de Vries', 'Sam'].map((n) => <Avatar key={n} name={n} size={44} ring />)}
          <Avatar accent="teal" size={44} />
          <Avatar accent="purple" size={44} />
        </Section>

        <Section title="Iconen">
          {ICON_NAMES.map((n) => (
            <span key={n} style={{ display: 'grid', placeItems: 'center', width: 40, height: 40, borderRadius: 10, background: 'var(--card)', border: '1px solid var(--line)', color: 'var(--ink2)' }}>
              <Icon name={n} />
            </span>
          ))}
        </Section>

        <Section title="Statblok en voortgang">
          <div style={{ width: 200 }}><StatBlock value="€ 48.250" sub="omzet deze maand" delta={{ good: true, dir: 'up', v: '+8%' }} money /></div>
          <div style={{ width: 220 }}><div style={{ marginBottom: 8, fontSize: 12, color: 'var(--ink2)' }}>Voortgang 68%</div><Bar pct={68} accent="green" /></div>
          <Ring pct={72} accent="teal" sub="klaar" />
          <Donut size={150} segments={[{ v: 5, accent: 'teal' }, { v: 3, accent: 'purple' }, { v: 2, accent: 'orange' }]} center={{ v: 10, k: 'deals' }} />
        </Section>

        <Section title="Kaarten (Panel)">
          <div style={{ width: 360 }}>
            <Panel eyebrow="omzet" title="Geboekt vs verwacht" accent="blue">
              <BarChart data={trend} accentA="blue" accentB="aqua" height={180} />
            </Panel>
          </div>
          <div style={{ width: 360 }}>
            <Panel eyebrow="bereik" title="Websitebezoek" accent="purple">
              <AreaChart data={[12, 18, 15, 22, 28, 24, 31]} accent="purple" height={180} labels={['ma', 'di', 'wo', 'do', 'vr', 'za', 'zo']} />
            </Panel>
          </div>
        </Section>

        <Section title="KPI-strip (kaarten uit de catalogus)">
          <div style={{ width: '100%' }}>
            <KpiStrip onOpen={() => {}} count={4} editing={false} />
          </div>
        </Section>

        <Section title="ObjectActions (de vier gedeelde koppelingen)">
          <div style={{ width: 420, background: 'var(--card)', border: '1px solid var(--line)', borderRadius: 14, padding: 16 }}>
            <div style={{ fontWeight: 700, marginBottom: 10 }}>Offerte · Sloepenspel Amsterdam</div>
            <ObjectActions obj={{ key: 'demo1', type: 'offerte', title: 'Sloepenspel Amsterdam', custId: 'c1', custName: 'Sloepenspel Amsterdam', accent: 'navy' }} />
          </div>
        </Section>
      </div>
      <ToastHost />
      <ConfirmHost />
    </div>
  )
}
