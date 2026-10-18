import { useMemo, useState } from "react";
import { Icon, SectionHead } from "./ui";
import { allWines, finderSteps, flavorWords, classics, categories, bodyScore } from "../data";

function score(w, a) {
  let s = 0; const why = [];
  if (a.style && a.style !== "Surprise me") {
    const key = a.style;
    if (categories(w).includes(key)) { s += 4; why.push(key.toLowerCase()); }
  }
  if (a.body) {
    const d = Math.abs(bodyScore(w.body) - a.body);
    s += Math.max(0, 3 - 2 * d);
    if (d <= 0.5) why.push(`${w.body.toLowerCase()} body`);
  }
  if (a.flavor) {
    const notes = w.notes.toLowerCase();
    const hits = flavorWords[a.flavor].filter((k) => notes.includes(k));
    s += Math.min(2, hits.length) * 1.5;
    if (hits.length) why.push(hits.slice(0, 2).join(" & "));
  }
  const isClassic = classics.includes(w.name);
  if (a.adv === "Classics I've heard of" && isClassic) { s += 2; why.push("a classic"); }
  if (a.adv === "Show me something new" && !isClassic) { s += 2; why.push("off the beaten path"); }
  return { s, why };
}

export default function Finder({ saved, setSaved, onAsk, onPickWine }) {
  const [step, setStep] = useState(0);
  const [a, setA] = useState({});
  const done = step >= finderSteps.length;

  const results = useMemo(() => {
    if (!done) return [];
    return allWines
      .map((w) => ({ w, ...score(w, a) }))
      .sort((x, y) => y.s - x.s || x.w.name.localeCompare(y.w.name))
      .slice(0, 3);
  }, [done, a]);

  const pick = (opt) => {
    const cur = finderSteps[step];
    setA((p) => ({ ...p, [cur.id]: cur.id === "body" ? opt[2] : opt[0] }));
    setStep((s) => s + 1);
  };
  const reset = () => { setStep(0); setA({}); };
  const toggle = (n) => setSaved((s) => (s.includes(n) ? s.filter((x) => x !== n) : [...s, n]));
  const cur = finderSteps[step];

  return (
    <section className="section finder" id="finder" aria-labelledby="finder-title">
      <div className="wrap">
        <SectionHead id="finder-title" eyebrow="THE WINE FINDER" title={<>Find the wine that fits <em>you.</em></>}>
          Four quick taps. We rank the directory against your taste and tell you why each wine made the list.
        </SectionHead>

        <div className="finder-card reveal">
          {!done ? (
            <div>
              <div className="finder-progress" role="progressbar" aria-valuemin={1} aria-valuemax={finderSteps.length} aria-valuenow={step + 1} aria-label="Question progress">
                {finderSteps.map((_, i) => <i key={i} className={i <= step ? "on" : ""} />)}
              </div>
              <p className="step-count">Question {step + 1} of {finderSteps.length}</p>
              <h3 className="finder-q" tabIndex={-1} ref={(el) => el?.focus({ preventScroll: true })} key={step}>{cur.q}</h3>
              <ul className="finder-opts">
                {cur.opts.map((o) => (
                  <li key={o[0]}><button onClick={() => pick(o)}><span aria-hidden="true">{o[1]}</span>{o[0]}</button></li>
                ))}
              </ul>
              {step > 0 && <button className="btn btn-ghost small" onClick={() => setStep(step - 1)}><Icon name="back" size={16} /> Back</button>}
            </div>
          ) : (
            <div aria-live="polite">
              <p className="eyebrow">YOUR TOP MATCHES</p>
              <ol className="match-list">
                {results.map(({ w, why }, i) => (
                  <li key={w.name} className="match">
                    <span className="rank">{i + 1}</span>
                    <div>
                      <h3>{w.name} <small>{w.style} · {w.country}</small></h3>
                      <p>{w.description}</p>
                      <p className="why"><b>Why it fits:</b> {why.length ? why.join(", ") : "a good all-round pick"}. Try with {w.pairings.split(",").slice(0, 2).join(" or ").toLowerCase()}.</p>
                      <div className="match-actions">
                        <button className="btn btn-ghost small" onClick={() => onPickWine(w.name)}>See card</button>
                        <button className="btn btn-ghost small" aria-pressed={saved.includes(w.name)} onClick={() => toggle(w.name)}>{saved.includes(w.name) ? "♥ Saved" : "♡ Save"}</button>
                        <button className="btn btn-ghost small" onClick={() => onAsk(`I picked ${w.name} from a wine finder. How should I serve it and what should I eat with it?`)}><Icon name="spark" size={15} /> Ask Sommy</button>
                      </div>
                    </div>
                  </li>
                ))}
              </ol>
              <button className="btn btn-primary" onClick={reset}><Icon name="refresh" size={18} /> Start over</button>
            </div>
          )}
        </div>
      </div>
    </section>
  );
}
