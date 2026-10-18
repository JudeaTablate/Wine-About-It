import { useEffect, useState } from "react";
import { Icon, SectionHead, useTabs } from "./ui";
import { typeData, wineTerms, dosDonts, glassware, tastingSteps, myths, learningPath } from "../data";
import { useStored } from "../lib/storage";

/* START HERE + TYPES ---------------------------------------------------------- */
export function StartHere({ learnedCount }) {
  const [type, setType] = useState("Red");
  const { tabs, panelProps } = useTabs({ label: "Wine types", items: Object.keys(typeData).map((k) => ({ id: k, label: k, icon: typeData[k][1] })), value: type, onChange: setType });
  const [blurb, emoji, examples] = typeData[type];
  return (
    <section className="section" id="learn" aria-labelledby="learn-title">
      <div className="wrap">
        <SectionHead id="learn-title" eyebrow="WINE ABOUT THE BASICS" title={<>Start with what <em>actually matters.</em></>}>
          Wine can sound like a secret language. Follow the path below in any order. Your progress is saved on this device.
        </SectionHead>
        <ol className="path reveal">
          {learningPath.map(([t, href, d], i) => (
            <li key={t}>
              <a href={href}><span className="path-n">{i + 1}</span><b>{t}</b><small>{i === 2 ? `${learnedCount}/${wineTerms.length} learned` : d}</small></a>
            </li>
          ))}
        </ol>

        <div className="types reveal" id="types">
          <h3 className="h3">Four styles, four moods</h3>
          {tabs}
          <div className="type-panel" {...panelProps}>
            <span className="type-emoji" aria-hidden="true">{emoji}</span>
            <div>
              <p className="eyebrow">THE QUICK TAKE</p>
              <h4>{type}</h4>
              <p>{blurb}</p>
              <ul className="chip-row" aria-label={`${type} examples`}>{examples.map((x) => <li key={x}><span className="chip static">{x}</span></li>)}</ul>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}

/* TERMS ----------------------------------------------------------------------- */
export function Terms({ focusLetter, learned, setLearned, onAsk }) {
  const [letter, setLetter] = useState("A");
  useEffect(() => { if (focusLetter) setLetter(focusLetter.letter); }, [focusLetter]);
  const i = wineTerms.findIndex(([l]) => l === letter);
  const [, term, def, say] = wineTerms[i];
  const done = learned.includes(letter);
  const go = (d) => setLetter(wineTerms[(i + d + wineTerms.length) % wineTerms.length][0]);
  const toggle = () => setLearned((s) => (s.includes(letter) ? s.filter((x) => x !== letter) : [...s, letter]));
  const pct = Math.round((learned.length / wineTerms.length) * 100);

  return (
    <section className="section alt" id="words" aria-labelledby="words-title">
      <div className="wrap">
        <SectionHead id="words-title" eyebrow="WINE ABOUT THE WORDS" title={<>Sound like you <em>know.</em></>}>
          Twenty-six words, one alphabet. Mark the ones you've learned and watch your progress grow.
        </SectionHead>
        <div className="progress-line reveal" role="progressbar" aria-valuemin={0} aria-valuemax={wineTerms.length} aria-valuenow={learned.length} aria-label="Wine words learned">
          <span style={{ width: `${pct}%` }} /><b>{learned.length} / {wineTerms.length} learned</b>
        </div>
        <div className="letters reveal" role="group" aria-label="Choose a word by letter">
          {wineTerms.map(([l]) => (
            <button key={l} className={`letter ${letter === l ? "on" : ""} ${learned.includes(l) ? "done" : ""}`} aria-pressed={letter === l} aria-label={`${l}${learned.includes(l) ? ", learned" : ""}`} onClick={() => setLetter(l)}>{l}</button>
          ))}
        </div>
        <article className="term-card reveal" aria-live="polite">
          <span className="term-big" aria-hidden="true">{letter}</span>
          <div>
            <p className="eyebrow">WORD {i + 1} OF {wineTerms.length}</p>
            <h3>{term}</h3>
            <p className="term-def">{def}</p>
            <p className="term-say"><span>TRY SAYING</span> <strong>{say}</strong></p>
            <div className="term-actions">
              <button className="btn btn-ghost" onClick={() => go(-1)} aria-label="Previous word"><Icon name="left" size={18} /></button>
              <button className={`btn ${done ? "btn-done" : "btn-primary"}`} aria-pressed={done} onClick={toggle}><Icon name="check" size={18} /> {done ? "Learned" : "Mark as learned"}</button>
              <button className="btn btn-ghost" onClick={() => go(1)} aria-label="Next word"><Icon name="right" size={18} /></button>
              <button className="btn btn-ghost" onClick={() => onAsk(`Explain "${term}" in wine with a real-life example.`)}><Icon name="spark" size={16} /> Explain it to me</button>
            </div>
          </div>
        </article>
      </div>
    </section>
  );
}

/* TASTING (5 S's as a live checklist) ---------------------------------------- */
export function Tasting() {
  const [done, setDone] = useStored("wai-tasting", []);
  const toggle = (n) => setDone((d) => (d.includes(n) ? d.filter((x) => x !== n) : [...d, n]));
  return (
    <section className="section" id="taste" aria-labelledby="taste-title">
      <div className="wrap tasting">
        <div className="taste-visual reveal" aria-hidden="true">
          <div className="taste-ring ring-a" /><div className="taste-ring ring-b" />
          <div className="taste-core"><span>{done.length}/5</span><strong>TASTE<br />LIKE A<br /><em>PRO.</em></strong></div>
        </div>
        <div className="reveal">
          <p className="eyebrow">WINE ABOUT THE 5 S's</p>
          <h2 id="taste-title">Turn tasting into a <em>ritual.</em></h2>
          <p className="lede">Pour a glass and tick each step as you go. It takes about two minutes and makes any wine more interesting.</p>
          <ol className="steps">
            {tastingSteps.map(([n, t, e, d]) => (
              <li key={n} className={done.includes(n) ? "done" : ""}>
                <button onClick={() => toggle(n)} aria-pressed={done.includes(n)}>
                  <span className="step-check" aria-hidden="true">{done.includes(n) ? <Icon name="check" size={16} /> : n}</span>
                  <span className="step-text"><strong><span aria-hidden="true">{e}</span> {t}</strong><small>{d}</small></span>
                </button>
              </li>
            ))}
          </ol>
          {done.length > 0 && <button className="btn btn-ghost small" onClick={() => setDone([])}>Reset</button>}
        </div>
      </div>
    </section>
  );
}

/* ETIQUETTE -------------------------------------------------------------------- */
export function Etiquette() {
  return (
    <section className="section alt" aria-labelledby="etq-title">
      <div className="wrap">
        <SectionHead id="etq-title" eyebrow="WINE ABOUT THE ETIQUETTE" title={<>The dos, the don'ts, and the <em>please don'ts.</em></>}>
          You don't need to act like a sommelier. A few habits just make ordering and tasting easier.
        </SectionHead>
        <div className="dd-grid">
          {[["dos", "DO", "Good habits worth keeping"], ["donts", "DON'T", "Snobbery stays outside"]].map(([k, h, sub]) => (
            <div key={k} className={`dd-col reveal ${k}`}>
              <div className="dd-title"><span>{h}</span><small>{sub}</small></div>
              <ul>{dosDonts[k].map(([i, t, d]) => <li key={t}><span aria-hidden="true">{i}</span><div><h3>{t}</h3><p>{d}</p></div></li>)}</ul>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}

/* GLASSWARE -------------------------------------------------------------------- */
export function Glassware({ onAsk }) {
  const [id, setId] = useState(glassware[0].name);
  const { tabs, panelProps } = useTabs({ label: "Glass types", items: glassware.map((g) => ({ id: g.name, label: g.name, icon: g.icon })), value: id, onChange: setId, className: "tabs-wrap" });
  const g = glassware.find((x) => x.name === id);
  return (
    <section className="section" id="glasses" aria-labelledby="glass-title">
      <div className="wrap">
        <SectionHead id="glass-title" eyebrow="WINE ABOUT THE GLASS" title={<>Yes, the glass <em>actually matters.</em></>}>
          The bowl changes how aromas collect and how wine reaches your palate. You don't need twenty shapes though.
        </SectionHead>
        <div className="reveal">
          {tabs}
          <div className="glass-detail" {...panelProps}>
            <span className="type-emoji" aria-hidden="true">{g.icon}</span>
            <div>
              <p className="eyebrow">USE IT FOR</p>
              <h3>{g.name}</h3>
              <ul className="chip-row"><li><span className="chip static">{g.best}</span></li><li><span className="chip static">{g.when}</span></li></ul>
              <p>{g.why}</p>
              <p className="tip"><b>Beginner tip:</b> if you only buy one, choose a good universal glass. Add others if you notice a real difference.</p>
              <button className="btn btn-ghost small" onClick={() => onAsk(`Which glass should I use for ${g.best.split(",")[0]} and why?`)}><Icon name="spark" size={16} /> Ask Sommy</button>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}

/* MYTHS (click to bust) -------------------------------------------------------- */
export function Myths() {
  const [open, setOpen] = useState(() => new Set());
  const toggle = (i) => setOpen((s) => { const n = new Set(s); n.has(i) ? n.delete(i) : n.add(i); return n; });
  return (
    <section className="section alt" id="myths" aria-labelledby="myth-title">
      <div className="wrap">
        <SectionHead id="myth-title" eyebrow="WINE ABOUT THE MYTHS" title={<>Let's uncork some <em>nonsense.</em></>}>Tap a myth to bust it.</SectionHead>
        <ul className="myth-grid">
          {myths.map(([m, truth], i) => {
            const on = open.has(i);
            return (
              <li key={m} className="reveal" style={{ "--d": `${(i % 3) * 70}ms` }}>
                <button className={`myth ${on ? "busted" : ""}`} aria-expanded={on} onClick={() => toggle(i)}>
                  <span className="myth-tag">MYTH {i + 1}</span>
                  <span className="myth-text">{m}</span>
                  <span className="myth-truth" hidden={!on}><b>Busted.</b> {truth}</span>
                  <span className="myth-cta" aria-hidden="true">{on ? "FALSE ✕" : "Tap to bust →"}</span>
                </button>
              </li>
            );
          })}
        </ul>
      </div>
    </section>
  );
}
