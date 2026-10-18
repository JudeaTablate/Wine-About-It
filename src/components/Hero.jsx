import { useState } from "react";
import { Icon } from "./ui";
import { allWines, wineTerms, pairingData } from "../data";

const PROMPTS = ["Explain tannins like I'm five", "What pairs with sinigang?", "Pick a red for pizza night", "How do I read a wine label?"];

export default function Hero({ onAsk }) {
  const [q, setQ] = useState("");
  const submit = (e) => { e.preventDefault(); if (q.trim()) { onAsk(q.trim()); setQ(""); } };

  return (
    <section className="hero wrap" aria-labelledby="hero-title" id="top">
      <div className="hero-copy">
        <p className="eyebrow">YOUR FRIENDLY WINE 101 <span aria-hidden="true">✦</span></p>
        <h1 id="hero-title">
          Wine doesn't have to be <em>complicated.</em>
        </h1>
        <p className="lede big">
          Play with a 3D glass, learn the words, find a bottle you'll love, and chat with Sommy, an AI sommelier that explains things like a friend, not a snob.
        </p>

        <form className="ask-bar" onSubmit={submit} role="search" aria-label="Ask the AI sommelier">
          <label htmlFor="hero-ask" className="sr-only">Ask Sommy a wine question</label>
          <Icon name="spark" />
          <input id="hero-ask" value={q} onChange={(e) => setQ(e.target.value)} placeholder="Ask anything about wine…" autoComplete="off" />
          <button className="btn btn-primary" type="submit">Ask <Icon name="arrow" size={18} /></button>
        </form>
        <ul className="chip-row" aria-label="Try a question">
          {PROMPTS.map((p) => <li key={p}><button className="chip" onClick={() => onAsk(p)}>{p}</button></li>)}
        </ul>

        <dl className="stats">
          <div><dt>Wines</dt><dd>{allWines.length}</dd></div>
          <div><dt>Wine terms</dt><dd>{wineTerms.length}</dd></div>
          <div><dt>Pairings</dt><dd>{Object.keys(pairingData).length}</dd></div>
          <div><dt>Cost</dt><dd>Free</dd></div>
        </dl>
      </div>

      <div className="hero-art" aria-hidden="true">
        <div className="art-bg" />
        <svg className="glass-svg" viewBox="0 0 300 440">
          <defs>
            <linearGradient id="wineg" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stopColor="var(--wine-light)"/><stop offset="1" stopColor="var(--wine-deep)"/></linearGradient>
            <clipPath id="bowl"><path d="M72 36h156c0 100-14 168-78 184C86 204 72 136 72 36z"/></clipPath>
            <linearGradient id="shine" x1="0" x2="1"><stop offset="0" stopColor="#fff" stopOpacity=".55"/><stop offset=".4" stopColor="#fff" stopOpacity="0"/></linearGradient>
          </defs>
          <ellipse cx="150" cy="418" rx="82" ry="10" fill="var(--shadow)" />
          <g clipPath="url(#bowl)">
            <g className="liquid">
              <path d="M40 112c30-10 50 10 80 0s50 10 80 0 50 10 80 0v200H40z" fill="url(#wineg)" />
            </g>
          </g>
          <path d="M72 36h156c0 100-14 168-78 184C86 204 72 136 72 36z" fill="url(#shine)" stroke="var(--glass-edge)" strokeWidth="3" />
          <rect x="147" y="220" width="6" height="150" rx="3" fill="var(--glass-edge)" />
          <ellipse cx="150" cy="376" rx="62" ry="9" fill="none" stroke="var(--glass-edge)" strokeWidth="3" />
        </svg>
        <div className="float-card card-a"><small>THE GOLDEN RULE</small><b>Drink what<br />you like.</b></div>
        <div className="float-card card-b"><small>SWIRL · SNIFF · SIP</small><b>Taste on purpose.</b></div>
        <div className="float-card card-c"><span className="dot" /> Sommy is ready</div>
      </div>
    </section>
  );
}
