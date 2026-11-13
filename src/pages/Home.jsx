import { useMemo, useRef, useState } from "react";
import { Icon, Profile } from "../components/ui";
import { allWinesFull, wineOfTheDay, wineTerms, isLight } from "../data";
import { href } from "../lib/router";

const lum = (hex) => { const n = parseInt(hex.slice(1), 16); return 0.299 * ((n >> 16) & 255) + 0.587 * ((n >> 8) & 255) + 0.114 * (n & 255); };
const PROMPTS = ["What wine goes with lechon?", "Explain tannins like I'm five", "A red under ₱800 for pizza night", "How cold should Prosecco be?"];

const ROOMS = [
  ["learn", "Learn", "Styles, the five-step tasting, 26 words, how to read a label, glasses and a 3D glass to play with.", "7 short chapters"],
  ["wines", "Wines", "Every wine plotted on a flavor map. Filter, compare up to three, or take the four-question finder.", "52 wines"],
  ["pair", "Pair", "Pick a dish, from adobo to steak, and get three wines that work and one thing to avoid.", "15 dishes, 10 regions"],
  ["tools", "Tools", "How many bottles for a party, how long to chill a bottle in Manila heat, how long an open bottle lasts.", "3 calculators"],
  ["cellar", "My cellar", "Wines you saved and a private tasting journal you can export.", "Stays on this device"],
];

function Spectrum({ openWine }) {
  const list = useMemo(() => [...allWinesFull].sort((a, b) => lum(b.color) - lum(a.color)), []);
  const [i, setI] = useState(null);
  const refs = useRef([]);
  const shown = i === null ? null : list[i];
  const move = (n) => { const k = (n + list.length) % list.length; setI(k); refs.current[k]?.focus(); };
  const onKey = (e) => {
    const cur = i ?? 0;
    if (e.key === "ArrowRight") { e.preventDefault(); move(cur + 1); }
    if (e.key === "ArrowLeft") { e.preventDefault(); move(cur - 1); }
    if (e.key === "Home") { e.preventDefault(); move(0); }
    if (e.key === "End") { e.preventDefault(); move(list.length - 1); }
  };
  return (
    <figure className="spectrum">
      <div className="spectrum-bars" role="toolbar" aria-label="All 52 wines, palest to darkest. Use the arrow keys to move between them." onKeyDown={onKey} onMouseLeave={() => setI(null)}>
        {list.map((w, k) => (
          <button
            key={w.name}
            ref={(el) => (refs.current[k] = el)}
            type="button"
            className="sbar"
            style={{ "--c": w.color, "--h": `${38 + w.body5 * 12}%`, "--i": k }}
            tabIndex={(i ?? 0) === k ? 0 : -1}
            aria-label={`${w.name}, ${w.style.toLowerCase()} from ${w.country}`}
            onMouseEnter={() => setI(k)}
            onFocus={() => setI(k)}
            onClick={() => openWine(w.name)}
          />
        ))}
      </div>
      <figcaption>
        {shown ? (
          <span className="readout" style={{ "--c": shown.color }}><span className="dot" aria-hidden="true" /><b>{shown.name}</b> {shown.body.toLowerCase()} {shown.style.toLowerCase()} from {shown.country}</span>
        ) : (
          <span>Every wine in this guide, palest to darkest. Taller bars are fuller-bodied. Choose one to open it.</span>
        )}
      </figcaption>
    </figure>
  );
}

export default function Home({ onAsk, openWine, saved, learned, journal }) {
  const [q, setQ] = useState("");
  const today = wineOfTheDay();
  const submit = (e) => { e.preventDefault(); if (q.trim()) { onAsk(q.trim()); setQ(""); } };
  const started = saved.length || learned.length || journal.length;

  return (
    <>
      <section className="hero" aria-labelledby="page-title">
        <div className="wrap hero-copy">
          <h1 id="page-title" tabIndex={-1}>Wine, without the <em>snobbery.</em></h1>
          <div className="hero-side">
            <p className="lede">Learn what's in the glass, find a bottle you'll actually like, and ask anything without feeling silly. Free, no sign-up.</p>
            <form className="ask-bar" onSubmit={submit} role="search" aria-label="Ask Sommy">
              <label htmlFor="hero-ask" className="sr-only">Ask Sommy, the AI wine guide, a question</label>
              <input id="hero-ask" value={q} onChange={(e) => setQ(e.target.value)} placeholder="Ask Sommy a wine question" autoComplete="off" />
              <button className="btn btn-primary" type="submit"><Icon name="spark" size={18} /> Ask</button>
            </form>
            <ul className="chip-row" aria-label="Example questions">
              {PROMPTS.map((p) => <li key={p}><button type="button" className="chip" onClick={() => onAsk(p)}>{p}</button></li>)}
            </ul>
          </div>
        </div>
        <Spectrum openWine={openWine} />
      </section>

      <section className="wrap home-grid">
        <div className="today" style={{ "--c": today.color, "--on": isLight(today.color) ? "#221726" : "#fff" }} aria-labelledby="today-title">
          <h2 id="today-title" className="h-sm">Today's wine</h2>
          <p className="today-name">{today.name}</p>
          <p className="today-meta">{today.style} from {today.country}</p>
          <p>{today.description}</p>
          <Profile wine={today} />
          <div className="today-actions">
            <button type="button" className="btn btn-primary" onClick={() => openWine(today.name)}>Open {today.name}</button>
            <button type="button" className="btn btn-ghost" onClick={() => onAsk(`I want to try ${today.name} tonight. What should I eat with it and how should I serve it?`)}><Icon name="spark" size={18} /> Plan tonight with Sommy</button>
          </div>
        </div>

        <nav className="list" aria-labelledby="list-title">
          <h2 id="list-title">The list</h2>
          <p className="lede">Like a restaurant wine list, but for the site. Start anywhere.</p>
          <ul>
            {ROOMS.map(([id, name, desc, meta]) => (
              <li key={id}>
                <a href={href(id)}>
                  <span className="list-row"><span className="list-name">{name}</span><span className="leader" aria-hidden="true" /><span className="list-meta">{meta}</span></span>
                  <span className="list-desc">{desc}</span>
                </a>
              </li>
            ))}
          </ul>
          {started > 0 && (
            <p className="resume">
              So far you've saved {saved.length} {saved.length === 1 ? "wine" : "wines"}, learned {learned.length} of {wineTerms.length} words and logged {journal.length} {journal.length === 1 ? "tasting" : "tastings"}. <a href={href("cellar")}>Open my cellar</a>
            </p>
          )}
        </nav>
      </section>
    </>
  );
}
