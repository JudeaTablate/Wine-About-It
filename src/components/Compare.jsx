import { useState } from "react";
import { Dialog, Icon } from "./ui";
import { wineByName, profileAxes, servingGroups, servingGroupOf } from "../data";

export default function CompareTray({ compare, toggleCompare, clear, openWine }) {
  const [open, setOpen] = useState(false);
  const list = compare.map((n) => wineByName[n]).filter(Boolean);
  if (!list.length) return null;
  return (
    <>
      <section className="tray" aria-label="Wines to compare">
        <ul>
          {list.map((w) => (
            <li key={w.name} style={{ "--c": w.color }}>
              <span className="dot" aria-hidden="true" />{w.name}
              <button type="button" className="icon-btn tiny" onClick={() => toggleCompare(w.name)} aria-label={`Remove ${w.name} from comparison`}><Icon name="x" size={14} /></button>
            </li>
          ))}
        </ul>
        <span className="tray-hint">{list.length < 2 ? "Add one more to compare" : `${list.length} of 3`}</span>
        <button type="button" className="btn btn-primary small" disabled={list.length < 2} onClick={() => setOpen(true)}>Compare side by side</button>
        <button type="button" className="link-btn" onClick={clear}>Clear</button>
      </section>
      <Dialog open={open} onClose={() => setOpen(false)} title="Side by side" wide>
        <div className="cmp-scroll">
          <table className="cmp">
            <caption className="sr-only">Comparison of {list.map((w) => w.name).join(", ")}</caption>
            <thead>
              <tr><td />{list.map((w) => <th key={w.name} scope="col" style={{ "--c": w.color }}><span className="cmp-pour" aria-hidden="true" /><button type="button" className="link-btn" onClick={() => { setOpen(false); openWine(w.name); }}>{w.name}</button></th>)}</tr>
            </thead>
            <tbody>
              <tr><th scope="row">Style</th>{list.map((w) => <td key={w.name}>{w.style}, {w.country}</td>)}</tr>
              {profileAxes.map((a) => (
                <tr key={a.id}>
                  <th scope="row">{a.label}</th>
                  {list.map((w) => {
                    const max = Math.max(...list.map((x) => x[a.id]));
                    return (
                      <td key={w.name} className={list.length > 1 && w[a.id] === max && max > 0 ? "hi" : ""}>
                        <span className="bar" aria-hidden="true">{[1, 2, 3, 4, 5].map((i) => <i key={i} className={i <= w[a.id] ? "on" : ""} />)}</span>
                        <span className="sr-only">{w[a.id]} of 5</span>
                      </td>
                    );
                  })}
                </tr>
              ))}
              <tr><th scope="row">Tastes like</th>{list.map((w) => <td key={w.name}>{w.notes}</td>)}</tr>
              <tr><th scope="row">Serve at</th>{list.map((w) => { const g = servingGroups[servingGroupOf(w)]; return <td key={w.name}>{g.target[0]}–{g.target[1]} °C</td>; })}</tr>
              <tr><th scope="row">Eat with</th>{list.map((w) => <td key={w.name}>{w.pairings}</td>)}</tr>
            </tbody>
          </table>
        </div>
      </Dialog>
    </>
  );
}
