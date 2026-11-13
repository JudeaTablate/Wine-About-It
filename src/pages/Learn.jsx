import { useEffect, useId, useMemo, useState } from "react";
import { Icon, PageHead, SectionHead, Swatch, useTabs } from "../components/ui";
import GlassLab from "../components/GlassLab";
import { typeData, wineTerms, dosDonts, glassware, tastingSteps, myths, wineByName } from "../data";
import { useStored } from "../lib/storage";
import { href } from "../lib/router";

const CHAPTERS = [["styles", "Four styles"], ["tasting", "Taste in five steps"], ["words", "Words, A to Z"], ["labels", "Read a label"], ["glasses", "Glasses"], ["etiquette", "Etiquette"], ["myths", "Myths"]];

export default function Learn(props) {
  return (
    <div className="wrap">
      <PageHead title="Learn wine at your own pace">
        Seven short chapters, in a sensible order. Skip around as much as you like. What you tick off is remembered on this device.
      </PageHead>
      <div className="learn-layout">
        <nav className="toc" aria-label="Chapters">
          <ol>{CHAPTERS.map(([id, t]) => <li key={id}><a href={href("learn", id)}>{t}</a></li>)}</ol>
        </nav>
        <div className="chapters">
          <Styles {...props} />
          <Tasting />
          <Words {...props} />
          <Labels />
          <Glasses />
          <Etiquette />
          <Myths />
        </div>
      </div>
    </div>
  );
}

function Chapter({ id, n, title, intro, children }) {
  return (
    <section className="chapter" id={id} aria-labelledby={`${id}-h`}>
      <p className="chapter-n" aria-hidden="true">{n}</p>
      <SectionHead id={`${id}-h`} title={title}>{intro}</SectionHead>
      {children}
    </section>
  );
}

/* 1. Styles ------------------------------------------------------------------ */
function Styles({ openWine }) {
  const [type, setType] = useState("Red");
  const { tabs, panelProps } = useTabs({ label: "Wine styles", items: Object.keys(typeData).map((k) => ({ id: k, label: k, color: typeData[k].color })), value: type, onChange: setType });
  const t = typeData[type];
  return (
    <Chapter id="styles" n="1" title="Four styles, four moods" intro="Almost every bottle you'll meet is one of these. The difference starts with the grape skins.">
      {tabs}
      <div className="style-panel" {...panelProps} style={{ "--c": t.color }}>
        <span className="style-pour" aria-hidden="true" />
        <div>
          <h3>{type}</h3>
          <p>{t.blurb}</p>
          <p className="h-sm">Good first bottles</p>
          <ul className="chip-row">
            {t.examples.map((x) => (
              <li key={x}>{wineByName[x] ? <button type="button" className="chip" onClick={() => openWine(x)}><Swatch color={wineByName[x].color} />{x}</button> : <span className="chip static">{x}</span>}</li>
            ))}
          </ul>
        </div>
      </div>
    </Chapter>
  );
}

/* 2. Tasting ----------------------------------------------------------------- */
const STEP_ICONS = ["eye", "wave", "nose", "drop", "check"];
function Tasting() {
  const [done, setDone] = useStored("wai-tasting", []);
  const toggle = (n) => setDone((d) => (d.includes(n) ? d.filter((x) => x !== n) : [...d, n]));
  return (
    <Chapter id="tasting" n="2" title="Taste in five steps" intro="Pour a glass and tick each step as you go. It takes about two minutes and makes any wine more interesting.">
      <ol className="steps">
        {tastingSteps.map(([n, t, d], i) => {
          const on = done.includes(n);
          return (
            <li key={n} className={on ? "done" : ""}>
              <label>
                <input type="checkbox" checked={on} onChange={() => toggle(n)} />
                <span className="step-n" aria-hidden="true">{on ? <Icon name="check" size={18} /> : n}</span>
                <span className="step-text"><strong><Icon name={STEP_ICONS[i]} size={18} /> {t}</strong><span>{d}</span></span>
              </label>
            </li>
          );
        })}
      </ol>
      <p className="status-line" role="status">{done.length === 5 ? "All five done. That's a proper tasting." : `${done.length} of 5 steps done.`} {done.length > 0 && <button type="button" className="link-btn" onClick={() => setDone([])}>Start again</button>}</p>
    </Chapter>
  );
}

/* 3. Words + self-test ------------------------------------------------------- */
function Words({ focusTerm, learned, setLearned, onAsk }) {
  const [letter, setLetter] = useState("A");
  const [quiz, setQuiz] = useState(null);
  useEffect(() => { if (focusTerm) setLetter(focusTerm.letter); }, [focusTerm]);
  const i = wineTerms.findIndex(([l]) => l === letter);
  const [, term, def, say] = wineTerms[i];
  const done = learned.includes(letter);
  const go = (d) => setLetter(wineTerms[(i + d + wineTerms.length) % wineTerms.length][0]);
  const toggle = () => setLearned((s) => (s.includes(letter) ? s.filter((x) => x !== letter) : [...s, letter]));
  const pct = Math.round((learned.length / wineTerms.length) * 100);

  const newQuiz = () => {
    const pool = [...wineTerms].sort(() => Math.random() - 0.5);
    const answer = pool[0];
    const options = [answer, pool[1], pool[2]].sort(() => Math.random() - 0.5);
    setQuiz({ answer, options, picked: null });
  };

  return (
    <Chapter id="words" n="3" title="Words, A to Z" intro="Twenty-six words that come up all the time. Mark the ones you know, then test yourself.">
      <div className="meter" role="progressbar" aria-valuemin={0} aria-valuemax={wineTerms.length} aria-valuenow={learned.length} aria-label="Words learned">
        <span style={{ width: `${pct}%` }} />
      </div>
      <p className="meter-label">{learned.length} of {wineTerms.length} learned</p>
      <div className="letters" role="group" aria-label="Choose a word by its first letter">
        {wineTerms.map(([l, t]) => (
          <button type="button" key={l} className={`letter ${learned.includes(l) ? "done" : ""}`} aria-pressed={letter === l} aria-label={`${l}, ${t}${learned.includes(l) ? ", learned" : ""}`} onClick={() => setLetter(l)}>{l}</button>
        ))}
      </div>
      <article className="term" aria-live="polite">
        <span className="term-letter" aria-hidden="true">{letter}</span>
        <div>
          <h3>{term}</h3>
          <p className="term-def">{def}</p>
          <p className="term-say">Use it like this: <q>{say.replace(/[“”]/g, "")}</q></p>
          <div className="row-actions">
            <button type="button" className="icon-btn bordered" onClick={() => go(-1)} aria-label="Previous word"><Icon name="left" /></button>
            <button type="button" className="icon-btn bordered" onClick={() => go(1)} aria-label="Next word"><Icon name="right" /></button>
            <button type="button" className={`btn ${done ? "btn-on" : "btn-primary"}`} aria-pressed={done} onClick={toggle}><Icon name="check" size={18} /> {done ? "Learned" : "Mark as learned"}</button>
            <button type="button" className="btn btn-ghost" onClick={() => onAsk(`Explain "${term}" in wine with a real-life example.`)}><Icon name="spark" size={18} /> Explain it to me</button>
          </div>
        </div>
      </article>

      <div className="quiz">
        <div className="quiz-head">
          <h3>Test yourself</h3>
          <button type="button" className="btn btn-ghost small" onClick={newQuiz}><Icon name="shuffle" size={16} /> {quiz ? "Next question" : "Start"}</button>
        </div>
        {quiz && (
          <fieldset>
            <legend>Which word means: <q>{quiz.answer[2]}</q></legend>
            <div className="quiz-opts">
              {quiz.options.map((o) => {
                const state = quiz.picked && (o === quiz.answer ? "right" : quiz.picked === o ? "wrong" : "");
                return (
                  <button key={o[1]} type="button" className={`quiz-opt ${state}`} disabled={!!quiz.picked} onClick={() => {
                    setQuiz({ ...quiz, picked: o });
                    if (o === quiz.answer && !learned.includes(o[0])) setLearned((s) => [...s, o[0]]);
                  }}>{o[1]}{state === "right" && <Icon name="check" size={18} />}{state === "wrong" && <Icon name="x" size={18} />}</button>
                );
              })}
            </div>
            <p role="status" className="quiz-result">{quiz.picked ? (quiz.picked === quiz.answer ? `Correct. ${quiz.answer[1]} is now marked as learned.` : `Not quite. The answer is ${quiz.answer[1]}.`) : ""}</p>
          </fieldset>
        )}
      </div>
    </Chapter>
  );
}

/* 4. Label decoder ----------------------------------------------------------- */
const LABELS = {
  france: {
    name: "A French label",
    tip: "Old World labels (France, Italy, Spain) usually name the place, not the grape. The rules for that place decide which grapes are allowed.",
    parts: [
      ["producer", "Domaine des Trois Hiboux", "Producer", "Who made the wine. Domaine means the estate grew its own grapes. In Burgundy and the Rhône this is often the most important name on the bottle."],
      ["vintage", "2021", "Vintage", "The year the grapes were picked. It matters most in places where the weather changes a lot from year to year."],
      ["place", "Côtes du Rhône", "Place", "Where the grapes grew. There is no grape on this label: Côtes du Rhône reds are mostly Grenache and Syrah, so expect ripe red fruit and a little pepper."],
      ["class", "Appellation Côtes du Rhône Contrôlée", "Quality category", "AOC, or AOP on newer bottles, means the wine follows the rules for this place: allowed grapes, maximum yields and how it's made. It guarantees origin, not that you'll love it."],
      ["bottled", "Mis en bouteille au domaine", "Estate bottled", "Bottled where it was made. Usually a good sign the producer controls the whole process."],
      ["abv", "13,5 % vol", "Alcohol", "Alcohol by volume. Under 12.5% tends to feel light and fresh, over 14% fuller and warmer. France uses a comma for the decimal point."],
      ["size", "750 ml", "Bottle size", "A standard bottle, which pours about five glasses."],
    ],
  },
  australia: {
    name: "An Australian label",
    tip: "New World labels (Australia, USA, Chile) usually lead with the grape, so you know the style at a glance.",
    parts: [
      ["producer", "Kestrel Ridge", "Producer", "The winery or brand. Bigger brands often make several ranges at different prices."],
      ["grape", "Shiraz", "Grape", "The grape variety, front and centre. Shiraz is the Australian name for Syrah: dark fruit, pepper and plenty of body."],
      ["place", "Barossa Valley", "Region", "A warm region, which usually means ripe, generous, fuller-bodied wine."],
      ["vintage", "2022", "Vintage", "The harvest year. In warm, steady climates it changes less from year to year."],
      ["abv", "14.5% alc/vol", "Alcohol", "Fairly high. Expect a rich, warming red and serve it a little cool, around 16 °C."],
      ["origin", "Product of Australia", "Country", "Where the wine is from. Required on exported wine."],
    ],
  },
};

function Labels() {
  const [which, setWhich] = useState("france");
  const [part, setPart] = useState(null);
  const L = LABELS[which];
  const id = useId();
  const sel = L.parts.find((p) => p[0] === part);
  useEffect(() => setPart(null), [which]);
  return (
    <Chapter id="labels" n="4" title="Read a label" intro="Both of these labels are made up. Choose any part of the label to find out what it tells you.">
      <div className="seg-row label-switch" role="group" aria-label="Choose a label">
        {Object.entries(LABELS).map(([k, v]) => <button type="button" key={k} aria-pressed={which === k} className={which === k ? "on" : ""} onClick={() => setWhich(k)}>{v.name}</button>)}
      </div>
      <div className="decoder">
        <div className={`label label-${which}`} role="group" aria-label={`${L.name}, made up for this lesson`}>
          {L.parts.map(([k, text, name]) => (
            <button type="button" key={k} className={`lp lp-${k} ${part === k ? "on" : ""}`} aria-pressed={part === k} aria-describedby={part === k ? id : undefined} aria-label={`${text}, the ${name.toLowerCase()}`} onClick={() => setPart(k)}>{text}</button>
          ))}
        </div>
        <div className="decoder-out">
          <div aria-live="polite" id={id}>
            {sel ? (<><h3>{sel[2]}</h3><p>{sel[3]}</p></>) : (<><h3>Choose a part of the label</h3><p>Every bit of text on a label is there for a reason. Start with the biggest words.</p></>)}
          </div>
          <p className="tip"><Icon name="info" size={18} /> {L.tip}</p>
        </div>
      </div>
    </Chapter>
  );
}

/* 5. Glasses ----------------------------------------------------------------- */
function GlassShape({ shape, size = 64 }) {
  const { bowl: b, rim: r, h } = shape;
  const top = 8, bot = top + h;
  const d = `M${50 - r} ${top} C${50 - b} ${top + h * 0.35} ${50 - b} ${top + h * 0.9} 50 ${bot} C${50 + b} ${top + h * 0.9} ${50 + b} ${top + h * 0.35} ${50 + r} ${top}`;
  const clip = useId().replace(/:/g, "");
  return (
    <svg viewBox="0 0 100 140" width={size} height={size * 1.4} aria-hidden="true" className="gshape">
      <defs><clipPath id={clip}><path d={`${d}Z`} /></clipPath></defs>
      <rect x="0" y={top + h * 0.55} width="100" height="100" fill="var(--garnet)" clipPath={`url(#${clip})`} opacity=".85" />
      <path d={d} fill="none" stroke="currentColor" strokeWidth="2.2" />
      <path d={`M50 ${bot}V128M32 131h36`} stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" fill="none" />
    </svg>
  );
}

function Glasses() {
  const [id, setId] = useState(glassware[0].name);
  const g = glassware.find((x) => x.name === id);
  return (
    <Chapter id="glasses" n="5" title="Does the glass matter?" intro="A little. The bowl changes how aromas collect. You don't need twenty shapes, and one good universal glass covers almost everything.">
      <div className="glass-picker" role="radiogroup" aria-label="Glass shapes">
        {glassware.map((x) => (
          <label key={x.name} className={id === x.name ? "on" : ""}>
            <input type="radio" name="glass" checked={id === x.name} onChange={() => setId(x.name)} />
            <GlassShape shape={x.shape} size={44} />
            <span>{x.name}</span>
          </label>
        ))}
      </div>
      <div className="glass-detail" aria-live="polite">
        <GlassShape shape={g.shape} size={96} />
        <div>
          <h3>{g.name}</h3>
          <p>{g.why}</p>
          <dl className="kv"><div><dt>Best for</dt><dd>{g.when}</dd></div><div><dt>Try it with</dt><dd>{g.best}</dd></div></dl>
        </div>
      </div>
      <GlassLab />
    </Chapter>
  );
}

/* 6. Etiquette --------------------------------------------------------------- */
function Etiquette() {
  return (
    <Chapter id="etiquette" n="6" title="A few habits worth keeping" intro="You don't need to act like a sommelier. These just make ordering and tasting easier.">
      <div className="dd">
        <div>
          <h3><Icon name="check" /> Do</h3>
          <ul>{dosDonts.dos.map(([t, d]) => <li key={t}><b>{t}.</b> {d}</li>)}</ul>
        </div>
        <div>
          <h3><Icon name="x" /> Don't</h3>
          <ul>{dosDonts.donts.map(([t, d]) => <li key={t}><b>{t}.</b> {d}</li>)}</ul>
        </div>
      </div>
    </Chapter>
  );
}

/* 7. Myths ------------------------------------------------------------------- */
function Myths() {
  const [open, setOpen] = useState(() => new Set());
  const toggle = (i) => setOpen((s) => { const n = new Set(s); n.has(i) ? n.delete(i) : n.add(i); return n; });
  const clean = useMemo(() => myths.map(([m, t]) => [m.replace(/[“”]/g, ""), t]), []);
  return (
    <Chapter id="myths" n="7" title="Things people get wrong" intro="Each of these gets repeated at dinner tables everywhere. Open one to see what's actually true.">
      <ul className="myths">
        {clean.map(([m, truth], i) => {
          const on = open.has(i);
          return (
            <li key={m}>
              <h3>
                <button type="button" aria-expanded={on} aria-controls={`myth-${i}`} onClick={() => toggle(i)}>
                  <span>{m}</span><Icon name={on ? "minus" : "plus"} />
                </button>
              </h3>
              <p id={`myth-${i}`} hidden={!on}><b>Not true.</b> {truth}</p>
            </li>
          );
        })}
      </ul>
    </Chapter>
  );
}
