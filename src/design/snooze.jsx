/* SnoozeMenu uit de blauwdruk (iris-module): uitstel-opties voor taken.
   ESM-port: window-globals -> imports/exports, body letterlijk. */
import { ICONS } from './icons'
import { useSmartMenu } from './menus'

export const SNOOZE_OPTS = [
  { id: "tomorrow", label: "Morgenochtend", sub: "09:00", icon: "calendar" },
  { id: "dayafter", label: "Overmorgen", sub: "09:00", icon: "calendar" },
  { id: "3days", label: "Over 3 dagen", sub: "09:00", icon: "calendar" },
  { id: "nextweek", label: "Volgende week", sub: "maandag 09:00", icon: "calendar" },
  { id: "nextmonth", label: "Volgende maand", sub: "+30 dagen", icon: "clock" },
];

export function SnoozeMenu({ onPick }) {
  const smRef = useSmartMenu({ align: "start", margin: 12 });
  return (
    <div className="snooze-menu" ref={smRef} onClick={(e) => e.stopPropagation()} onPointerDown={(e) => e.stopPropagation()}>
      <div className="snooze-head mono">Stel uit tot…</div>
      {SNOOZE_OPTS.map((o) => (
        <button key={o.id} className="snooze-item" onClick={() => onPick(o)}>
          <span className="snooze-ic" dangerouslySetInnerHTML={{ __html: ICONS(o.icon, { sw: 2 }) }} />
          <span className="snooze-lbl">{o.label}</span>
          <span className="snooze-sub mono">{o.sub}</span>
        </button>
      ))}
    </div>
  );
}
