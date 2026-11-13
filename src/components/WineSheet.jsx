import { useMemo } from "react";
import { Dialog, Icon, Profile } from "./ui";
import { allWinesFull, wineByName, servingGroups, servingGroupOf, pairingData } from "../data";
import { canSpeak, speak } from "../lib/speech";

const dist = (a, b) => Math.hypot(a.body5 - b.body5, a.sweet - b.sweet, a.acid - b.acid, (a.tannin - b.tannin) * 0.8) + (a.color === b.color ? 0 : 0.2);
const toF = (c) => Math.round(c * 9 / 5 + 32);

export default function WineSheet({ name, onClose, saved, toggleSaved, compare, toggleCompare, onAsk, openWine, logTasting, journal }) {
  const w = name ? wineByName[name] : null;
  const similar = useMemo(() => (w ? allWinesFull.filter((x) => x.name !== w.name).sort((a, b) => dist(w, a) - dist(w, b)).slice(0, 3) : []), [w]);
  const foods = useMemo(() => (w ? Object.keys(pairingData).filter((k) => pairingData[k].picks.includes(w.name)) : []), [w]);
  const mine = w ? journal.filter((j) => j.wine === w.name) : [];
  if (!w) return <Dialog open={false} onClose={onClose} title="" />;
  const g = servingGroups[servingGroupOf(w)];
  const isSaved = saved.includes(w.name);
  const inCompare = compare.includes(w.name);

  return (
    <Dialog open={!!w} onClose={onClose} title={w.name} wide className="sheet">
      <div className="sheet-grid" style={{ "--c": w.color }}>
        <div className="sheet-color" aria-hidden="true"><span /></div>
        <div className="sheet-main">
          <p className="sheet-meta">{w.style} from {w.country}. {w.body} body.</p>
          {canSpeak() ? (
            <button type="button" className="say" onClick={() => speak(w.name, w.locale, 0.75)}>
              <Icon name="speaker" size={18} /> <span className="phon">{w.pronunciation}</span><span className="sr-only">, hear it spoken</span>
            </button>
          ) : <p className="phon">{w.pronunciation}</p>}
          <p className="sheet-desc">{w.description}</p>

          <h3 className="h-sm">How it tastes</h3>
          <Profile wine={w} />
          <p className="sheet-notes"><b>You might notice:</b> {w.notes.toLowerCase()}.</p>

          <div className="facts">
            <div><h3 className="h-sm">Serve at</h3><p>{g.target[0]}–{g.target[1]} °C ({toF(g.target[0])}–{toF(g.target[1])} °F)</p></div>
            <div><h3 className="h-sm">Once opened</h3><p>Keeps {g.keeps}</p></div>
            <div><h3 className="h-sm">Eat it with</h3><p>{w.pairings}</p></div>
          </div>
          {foods.length > 0 && <p className="fine">Also a pick for: {foods.join(", ")}.</p>}

          {mine.length > 0 && (
            <div className="mine">
              <h3 className="h-sm">Your tastings</h3>
              <ul>{mine.map((j) => <li key={j.id}>{j.date}: {j.rating} of 5{j.notes ? `. ${j.notes}` : ""}</li>)}</ul>
            </div>
          )}

          <div className="sheet-actions">
            <button type="button" className={`btn ${isSaved ? "btn-on" : "btn-ghost"}`} aria-pressed={isSaved} onClick={() => toggleSaved(w.name)}><Icon name="heart" size={18} fill={isSaved ? "currentColor" : "none"} /> {isSaved ? "Saved" : "Save"}</button>
            <button type="button" className={`btn ${inCompare ? "btn-on" : "btn-ghost"}`} aria-pressed={inCompare} onClick={() => toggleCompare(w.name)}><Icon name="columns" size={18} /> {inCompare ? "In comparison" : "Compare"}</button>
            <button type="button" className="btn btn-ghost" onClick={() => logTasting(w.name)}><Icon name="pen" size={18} /> Log a tasting</button>
            <button type="button" className="btn btn-primary" onClick={() => { onClose(); onAsk(`Tell me more about ${w.name}: what makes it special, how to serve it, and what to try next.`); }}><Icon name="spark" size={18} /> Ask Sommy</button>
          </div>

          <h3 className="h-sm">If you like this, try</h3>
          <ul className="similar">
            {similar.map((s) => (
              <li key={s.name}><button type="button" onClick={() => openWine(s.name)} style={{ "--c": s.color }}><span className="dot" aria-hidden="true" />{s.name}<small>{s.style}, {s.country}</small></button></li>
            ))}
          </ul>
        </div>
      </div>
    </Dialog>
  );
}
