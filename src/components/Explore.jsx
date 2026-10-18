import { useState } from "react";
import { Icon, SectionHead, useTabs } from "./ui";
import { pairingData, regions, allWines } from "../data";

const names = new Set(allWines.map((w) => w.name));

function WineLink({ name, onPickWine }) {
  return names.has(name)
    ? <button className="chip link" onClick={() => onPickWine(name)}>{name}<Icon name="arrow" size={14} /></button>
    : <span className="chip static">{name}</span>;
}

export function Pairing({ onPickWine, onAsk }) {
  const [food, setFood] = useState("Pizza");
  const { tabs, panelProps } = useTabs({ label: "Choose a food", items: Object.keys(pairingData).map((k) => ({ id: k, label: k, icon: pairingData[k].emoji })), value: food, onChange: setFood, className: "tabs-wrap dark-tabs" });
  const p = pairingData[food];
  return (
    <section className="section dark" id="pairing" aria-labelledby="pair-title">
      <div className="wrap">
        <SectionHead id="pair-title" eyebrow="WINE ABOUT THE PAIRING" title={<>Because wine shouldn't <em>fight your food.</em></>}>
          Pick a dish. You'll get three wines to look for, why they work, and one thing to avoid.
        </SectionHead>
        <div className="reveal">
          {tabs}
          <div className="pair-result" {...panelProps}>
            <span className="pair-icon" aria-hidden="true">{p.emoji}</span>
            <div>
              <p className="eyebrow">YOUR MATCH FOR {food.toUpperCase()}</p>
              <ul className="chip-row big-chips" aria-label="Wines to look for">{p.picks.map((n) => <li key={n}><WineLink name={n} onPickWine={onPickWine} /></li>)}</ul>
              <p>{p.why}</p>
              <p className="tip"><b>Watch out:</b> {p.tip}</p>
              <button className="btn btn-ghost small" onClick={() => onAsk(`I'm having ${food.toLowerCase()}. What exactly should I buy, and at what temperature should I serve it?`)}><Icon name="spark" size={16} /> Get a specific pick from Sommy</button>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}

export function World({ onPickWine, onAsk }) {
  const [region, setRegion] = useState("France");
  const { tabs, panelProps } = useTabs({ label: "Wine regions", items: Object.keys(regions).map((r) => ({ id: r, label: r })), value: region, onChange: setRegion, className: "tabs-wrap" });
  const r = regions[region];
  return (
    <section className="section" id="world" aria-labelledby="world-title">
      <div className="wrap">
        <SectionHead id="world-title" eyebrow="WINE ABOUT THE WORLD" title={<>Same drink. <em>Different stories.</em></>}>
          Wine is shaped by climate, soil, tradition and people. Take a quick tour of ten wine cultures.
        </SectionHead>
        <div className="reveal">
          {tabs}
          <div className="region-panel" {...panelProps}>
            <h3>{region}</h3>
            <p className="lede">{r.blurb}</p>
            <div className="region-cols">
              <div><p className="eyebrow">SIGNATURE GRAPES</p><ul className="chip-row">{r.grapes.map((g) => <li key={g}><span className="chip static">{g}</span></li>)}</ul></div>
              {r.try.length > 0 && <div><p className="eyebrow">TRY FROM THE DIRECTORY</p><ul className="chip-row">{r.try.map((g) => <li key={g}><WineLink name={g} onPickWine={onPickWine} /></li>)}</ul></div>}
            </div>
            <p className="fact"><b>Did you know?</b> {r.fact}</p>
            <button className="btn btn-ghost small" onClick={() => onAsk(`Give me a beginner's tour of ${region} wine: 3 bottles to try and what to expect.`)}><Icon name="spark" size={16} /> Plan a tasting with Sommy</button>
          </div>
        </div>
      </div>
    </section>
  );
}
