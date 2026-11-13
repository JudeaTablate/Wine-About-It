import { useEffect, useState } from "react";
import { Icon, PageHead, Profile, SectionHead, Swatch, useTabs } from "../components/ui";
import { pairingData, regions, wineByName, allWinesFull } from "../data";

const FILIPINO = new Set(["Adobo", "Sinigang", "Lechon", "Kare-kare"]);

function WineChip({ name, openWine }) {
  const w = wineByName[name];
  return w
    ? <button type="button" className="chip" onClick={() => openWine(name)}><Swatch color={w.color} />{name}</button>
    : <span className="chip static">{name}</span>;
}

export default function Pair(props) {
  const { openWine, onAsk } = props;
  const [food, setFood] = useState(() => { try { return sessionStorage.getItem("wai-food") || "Adobo"; } catch { return "Adobo"; } });
  useEffect(() => {
    const on = (e) => setFood(e.detail);
    window.addEventListener("wai-food", on);
    return () => window.removeEventListener("wai-food", on);
  }, []);
  const p = pairingData[food];
  const foods = Object.keys(pairingData);

  return (
    <div className="wrap">
      <PageHead title="What should I drink with this?">
        Pick what you're eating. You'll get three wines that work, the reason why, and one thing to avoid.
      </PageHead>

      <div className="pair">
        <fieldset className="foods">
          <legend className="h-sm">Choose a dish</legend>
          <div className="food-grid">
            {foods.map((f) => (
              <label key={f} className={food === f ? "on" : ""}>
                <input type="radio" name="food" checked={food === f} onChange={() => setFood(f)} />
                <span>{f}</span>
                {FILIPINO.has(f) && <small>Filipino</small>}
              </label>
            ))}
          </div>
        </fieldset>

        <section className="pair-out" aria-live="polite" aria-labelledby="pair-h">
          <h2 id="pair-h">With {food.toLowerCase()}, try</h2>
          <ol className="pair-picks">
            {p.picks.map((n) => {
              const w = wineByName[n];
              return (
                <li key={n} style={{ "--c": w?.color || "#888" }}>
                  <span className="pick-pour" aria-hidden="true" />
                  <div>
                    <h3><button type="button" className="link-btn strong" onClick={() => openWine(n)}>{n}</button></h3>
                    {w && <p className="wcard-meta">{w.style}, {w.country}</p>}
                    {w && <Profile wine={w} compact />}
                  </div>
                </li>
              );
            })}
          </ol>
          <p className="pair-why">{p.why}</p>
          <p className="tip warn"><Icon name="info" size={18} /> <span><b>Avoid:</b> {p.tip}</span></p>
          <button type="button" className="btn btn-ghost" onClick={() => onAsk(`I'm having ${food.toLowerCase()}. What exactly should I buy, and how cold should I serve it?`)}><Icon name="spark" size={18} /> Get a specific bottle from Sommy</button>
        </section>
      </div>

      <Reverse {...props} />
      <World openWine={openWine} onAsk={onAsk} />
    </div>
  );
}

function Reverse({ openWine }) {
  const [name, setName] = useState("Riesling");
  const w = wineByName[name];
  const dishes = Object.keys(pairingData).filter((k) => pairingData[k].picks.includes(name));
  return (
    <section className="reverse" aria-labelledby="rev-h">
      <SectionHead id="rev-h" title="Already have a bottle?">Work backwards. Choose the wine and see what to cook.</SectionHead>
      <div className="reverse-box" style={{ "--c": w.color }}>
        <label className="select big">Your wine
          <select value={name} onChange={(e) => setName(e.target.value)}>
            {allWinesFull.map((x) => <option key={x.name}>{x.name}</option>)}
          </select>
        </label>
        <div aria-live="polite">
          <p className="rev-line"><span className="dot" aria-hidden="true" /> {name} goes with <b>{w.pairings.toLowerCase()}</b>.</p>
          {dishes.length > 0 && <p>It's also one of our picks for {dishes.join(", ").toLowerCase()}.</p>}
          <button type="button" className="link-btn" onClick={() => openWine(name)}>Open {name}</button>
        </div>
      </div>
    </section>
  );
}

function World({ openWine, onAsk }) {
  const [region, setRegion] = useState("France");
  const { tabs, panelProps } = useTabs({ label: "Wine countries", items: Object.keys(regions).map((r) => ({ id: r, label: r })), value: region, onChange: setRegion, className: "wrap-tabs" });
  const r = regions[region];
  return (
    <section className="world" id="world" aria-labelledby="world-h">
      <SectionHead id="world-h" title="Where it comes from">Wine is shaped by climate, soil and the people who make it. A quick tour of ten wine countries.</SectionHead>
      {tabs}
      <div className="region" {...panelProps}>
        <h3>{region}</h3>
        <p className="lede">{r.blurb}</p>
        <dl className="kv">
          <div><dt>Signature grapes</dt><dd>{r.grapes.join(", ")}</dd></div>
          {r.try.length > 0 && <div><dt>Try from this guide</dt><dd><ul className="chip-row">{r.try.map((g) => <li key={g}><WineChip name={g} openWine={openWine} /></li>)}</ul></dd></div>}
        </dl>
        <p className="tip"><Icon name="globe" size={18} /> <span>{r.fact}</span></p>
        <button type="button" className="btn btn-ghost small" onClick={() => onAsk(`Give me a beginner's tour of ${region} wine: three bottles to try and what to expect.`)}><Icon name="spark" size={16} /> Plan a tasting with Sommy</button>
      </div>
    </section>
  );
}
