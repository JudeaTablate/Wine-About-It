import { useEffect, useMemo, useRef, useState } from "react";
import { Icon, SectionHead } from "./ui";
import { allWines, categories, bodyScore, slug } from "../data";
import { speak, canSpeak } from "../lib/speech";

const FILTERS = ["All", "Red", "White", "Rosé", "Sparkling", "Sweet", "Saved"];
const LETTERS = "ABCDEFGHIJKLMNOPQRSTUVWXYZ".split("");

function BodyMeter({ body }) {
  const n = Math.round(bodyScore(body));
  return (
    <span className="body-meter" role="img" aria-label={`Body: ${body}`}>
      {[1, 2, 3].map((i) => <i key={i} className={i <= n ? "on" : ""} />)}
      <small>{body}</small>
    </span>
  );
}

export default function Directory({ focus, saved, setSaved, onAsk }) {
  const [q, setQ] = useState("");
  const [filter, setFilter] = useState("All");
  const [letter, setLetter] = useState(null);
  const [open, setOpen] = useState(null);
  const gridRef = useRef(null);

  const list = useMemo(() => {
    const n = q.trim().toLowerCase();
    return allWines.filter((w) => {
      if (filter === "Saved" && !saved.includes(w.name)) return false;
      if (filter !== "All" && filter !== "Saved" && !categories(w).includes(filter)) return false;
      if (letter && w.letter !== letter) return false;
      if (!n) return true;
      return `${w.name} ${w.country} ${w.style} ${w.notes} ${w.pairings} ${w.description}`.toLowerCase().includes(n);
    });
  }, [q, filter, letter, saved]);

  const available = useMemo(() => new Set(allWines.filter((w) => filter === "All" || filter === "Saved" ? true : categories(w).includes(filter)).map((w) => w.letter)), [filter]);

  // Jump to a wine chosen from the command palette / pairings / regions.
  useEffect(() => {
    if (!focus) return;
    setQ(""); setFilter("All"); setLetter(null); setOpen(focus.name);
    const t = setTimeout(() => {
      const el = document.getElementById(`wine-${slug(focus.name)}`);
      el?.scrollIntoView({ behavior: matchMedia("(prefers-reduced-motion: reduce)").matches ? "auto" : "smooth", block: "center" });
      el?.querySelector("button.wine-toggle")?.focus({ preventScroll: true });
    }, 120);
    return () => clearTimeout(t);
  }, [focus]);

  const toggleSaved = (name) => setSaved((s) => (s.includes(name) ? s.filter((x) => x !== name) : [...s, name]));
  const surprise = () => { const w = allWines[Math.floor(Math.random() * allWines.length)]; setQ(""); setFilter("All"); setLetter(null); setOpen(w.name); setTimeout(() => document.getElementById(`wine-${slug(w.name)}`)?.scrollIntoView({ block: "center" }), 80); };

  return (
    <section className="section alt directory" id="directory" aria-labelledby="dir-title">
      <div className="wrap">
        <SectionHead id="dir-title" eyebrow="WINE ABOUT THE ALPHABET" title={<>From <em>Albariño</em> to Zweigelt.</>}>
          Search, filter and save the wines you want to try. Tap a name to open its card, or tap the speaker to hear how it's said.
        </SectionHead>

        <div className="dir-tools reveal">
          <div className="search-field">
            <Icon name="search" />
            <label htmlFor="dir-q" className="sr-only">Search wines by name, flavor, country or food</label>
            <input id="dir-q" type="search" value={q} onChange={(e) => setQ(e.target.value)} placeholder="Search by name, flavor, country or food…" />
          </div>
          <button className="btn btn-ghost" onClick={surprise}><Icon name="shuffle" size={18} /> Surprise me</button>
        </div>

        <div className="chip-row filters reveal" role="group" aria-label="Filter by style">
          {FILTERS.map((f) => (
            <button key={f} className={`chip ${filter === f ? "on" : ""}`} aria-pressed={filter === f} onClick={() => setFilter(f)}>
              {f === "Saved" ? <>♥ Saved ({saved.length})</> : f}
            </button>
          ))}
        </div>

        <div className="letters reveal" role="group" aria-label="Jump to letter">
          <button className={`letter ${letter === null ? "on" : ""}`} aria-pressed={letter === null} onClick={() => setLetter(null)}>All</button>
          {LETTERS.map((l) => (
            <button key={l} className={`letter ${letter === l ? "on" : ""}`} aria-pressed={letter === l} disabled={!available.has(l)} onClick={() => setLetter(letter === l ? null : l)}>{l}</button>
          ))}
        </div>

        <p className="result-count" role="status" aria-live="polite">{list.length} {list.length === 1 ? "wine" : "wines"}{filter === "Saved" && !saved.length ? " — tap ♥ on a wine to save it here" : ""}</p>

        <div className="wine-grid" ref={gridRef}>
          {list.map((w) => {
            const isOpen = open === w.name;
            const isSaved = saved.includes(w.name);
            const id = slug(w.name);
            return (
              <article key={w.name} id={`wine-${id}`} className={`wine-card ${isOpen ? "open" : ""}`}>
                <div className="wine-top">
                  <span className="wine-initial" aria-hidden="true">{w.letter}</span>
                  <div className="wine-id">
                    <p className="wine-meta">{w.style} · {w.country}</p>
                    <h3>
                      <button className="wine-toggle" aria-expanded={isOpen} aria-controls={`d-${id}`} onClick={() => setOpen(isOpen ? null : w.name)}>
                        {w.name}<Icon name={isOpen ? "minus" : "plus"} size={16} />
                      </button>
                    </h3>
                  </div>
                  <button className={`icon-btn heart ${isSaved ? "on" : ""}`} aria-pressed={isSaved} aria-label={`${isSaved ? "Remove" : "Save"} ${w.name} ${isSaved ? "from" : "to"} my cellar`} onClick={() => toggleSaved(w.name)}>
                    <Icon name="heart" size={20} fill={isSaved ? "currentColor" : "none"} />
                  </button>
                </div>
                <ul className="notes">{w.notes.split("•").map((n) => <li key={n}>{n.trim()}</li>)}</ul>
                <div className="wine-row2">
                  <BodyMeter body={w.body} />
                  {canSpeak() && (
                    <button className="speak" onClick={() => speak(w.name, w.locale, 0.75)} aria-label={`Hear how to pronounce ${w.name}`}>
                      <Icon name="speaker" size={16} /><span>{w.pronunciation}</span>
                    </button>
                  )}
                </div>
                <div id={`d-${id}`} className="wine-detail" hidden={!isOpen}>
                  <p>{w.description}</p>
                  <p><b>Pair it with:</b> {w.pairings}.</p>
                  <button className="btn btn-ghost small" onClick={() => onAsk(`Tell me more about ${w.name}: what makes it special, how to serve it, and what to try next.`)}>
                    <Icon name="spark" size={16} /> Ask Sommy about it
                  </button>
                </div>
              </article>
            );
          })}
        </div>
        {list.length === 0 && (
          <div className="empty">
            <p>No wines match. Try fewer filters, or ask Sommy.</p>
            <button className="btn btn-primary" onClick={() => onAsk(q ? `I'm looking for wines like "${q}". What do you suggest?` : "Suggest a wine for me")}>Ask Sommy</button>
          </div>
        )}
      </div>
    </section>
  );
}
