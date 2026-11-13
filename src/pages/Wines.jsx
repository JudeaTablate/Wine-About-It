import { useMemo, useRef, useState } from "react";
import { Icon, PageHead, Profile, SectionHead, Segmented } from "../components/ui";
import WineCard from "../components/WineCard";
import { allWinesFull, categories, profileAxes, finderSteps, flavorWords, classics } from "../data";

const FILTERS = ["All", "Red", "White", "Rosé", "Sparkling", "Sweet", "Saved"];
const SORTS = [["az", "A to Z"], ["body", "Lightest first"], ["sweet", "Driest first"], ["color", "Palest first"]];
const lum = (hex) => { const n = parseInt(hex.slice(1), 16); return 0.299 * ((n >> 16) & 255) + 0.587 * ((n >> 8) & 255) + 0.114 * (n & 255); };

export default function Wines(props) {
  const { saved } = props;
  const [q, setQ] = useState("");
  const [filter, setFilter] = useState("All");
  const [sort, setSort] = useState("az");
  const [view, setView] = useState("map");

  const list = useMemo(() => {
    const n = q.trim().toLowerCase();
    const out = allWinesFull.filter((w) => {
      if (filter === "Saved" && !saved.includes(w.name)) return false;
      if (filter !== "All" && filter !== "Saved" && !categories(w).includes(filter)) return false;
      return !n || `${w.name} ${w.country} ${w.style} ${w.notes} ${w.pairings} ${w.description}`.toLowerCase().includes(n);
    });
    const by = { az: (a, b) => a.name.localeCompare(b.name), body: (a, b) => a.body5 - b.body5 || a.name.localeCompare(b.name), sweet: (a, b) => a.sweet - b.sweet || a.name.localeCompare(b.name), color: (a, b) => lum(b.color) - lum(a.color) }[sort];
    return out.sort(by);
  }, [q, filter, sort, saved]);

  return (
    <div className="wrap">
      <PageHead title="52 wines, one map">
        Every wine here has a rough taste profile. Use the map to see how they relate, or switch to cards to browse. Choose any wine to open it.
      </PageHead>

      <div className="toolbar">
        <div className="search-field">
          <Icon name="search" />
          <label htmlFor="wq" className="sr-only">Search wines by name, flavor, country or food</label>
          <input id="wq" type="search" value={q} onChange={(e) => setQ(e.target.value)} placeholder="Search by name, flavor, country or food" />
        </div>
        <Segmented legend="View" hideLegend name="view" value={view} onChange={setView} options={[["map", <><Icon name="map" size={18} /> Map</>], ["cards", <><Icon name="grid" size={18} /> Cards</>]]} />
      </div>
      <div className="toolbar second">
        <div className="chip-row" role="group" aria-label="Filter by style">
          {FILTERS.map((f) => (
            <button type="button" key={f} className="chip" aria-pressed={filter === f} onClick={() => setFilter(f)}>
              {f === "Saved" ? `Saved (${saved.length})` : f}
            </button>
          ))}
        </div>
        {view === "cards" && (
          <label className="select">Sort
            <select value={sort} onChange={(e) => setSort(e.target.value)}>{SORTS.map(([v, l]) => <option key={v} value={v}>{l}</option>)}</select>
          </label>
        )}
      </div>
      <p className="result-count" role="status">{list.length} {list.length === 1 ? "wine" : "wines"}{filter === "Saved" && !saved.length ? ". Save a wine with the heart button and it shows up here." : ""}</p>

      {list.length === 0 ? (
        <div className="empty">
          <p>No wines match those filters. Clear the search or pick a different style.</p>
          <div className="row-actions">
            <button type="button" className="btn btn-ghost" onClick={() => { setQ(""); setFilter("All"); }}>Clear filters</button>
            <button type="button" className="btn btn-primary" onClick={() => props.onAsk(q ? `I'm looking for wines like "${q}". What do you suggest?` : "Suggest a wine for me")}><Icon name="spark" size={18} /> Ask Sommy instead</button>
          </div>
        </div>
      ) : view === "map" ? (
        <FlavorMap list={list} {...props} />
      ) : (
        <ul className="cards">{list.map((w) => <li key={w.name}><WineCard w={w} {...props} /></li>)}</ul>
      )}

      <Finder {...props} />
    </div>
  );
}

/* Flavor map ------------------------------------------------------------------ */
function spread(list, xk, yk) {
  const groups = {};
  list.forEach((w) => { const k = `${w[xk]}|${w[yk]}`; (groups[k] ||= []).push(w); });
  const pos = {};
  Object.values(groups).forEach((g) => g.forEach((w, i) => {
    if (g.length === 1) { pos[w.name] = [w[xk], w[yk]]; return; }
    const a = i * 2.399, r = 0.13 * Math.sqrt(i + 0.6);
    pos[w.name] = [w[xk] + Math.cos(a) * r, w[yk] + Math.sin(a) * r * 1.1];
  }));
  return pos;
}

function FlavorMap({ list, openWine }) {
  const [xk, setX] = useState("body5");
  const [yk, setY] = useState("sweet");
  const [cur, setCur] = useState(list[0]?.name);
  const refs = useRef({});
  const pos = useMemo(() => spread(list, xk, yk), [list, xk, yk]);
  const ax = profileAxes.find((a) => a.id === xk), ay = profileAxes.find((a) => a.id === yk);
  const lo = (k) => (k === "tannin" ? 0 : 1);
  const toPct = (v, k) => ((v - lo(k) + 0.5) / (5 - lo(k) + 1)) * 100;
  const active = list.find((w) => w.name === cur) || list[0];

  const onKey = (e) => {
    const dir = { ArrowRight: [1, 0], ArrowLeft: [-1, 0], ArrowUp: [0, 1], ArrowDown: [0, -1] }[e.key];
    if (!dir) return;
    e.preventDefault();
    const [cx, cy] = pos[active.name];
    let best = null, bd = Infinity;
    list.forEach((w) => {
      if (w.name === active.name) return;
      const [x, y] = pos[w.name]; const dx = x - cx, dy = y - cy;
      const along = dx * dir[0] + dy * dir[1];
      if (along <= 0.01) return;
      const d = along + Math.abs(dx * dir[1] - dy * dir[0]) * 2.5;
      if (d < bd) { bd = d; best = w; }
    });
    if (best) { setCur(best.name); refs.current[best.name]?.focus(); }
  };
  const ticks = (k) => (k === "tannin" ? [0, 1, 2, 3, 4, 5] : [1, 2, 3, 4, 5]);

  return (
    <div className="fmap">
      <div className="fmap-axes">
        <label className="select">Across
          <select value={xk} onChange={(e) => setX(e.target.value)}>{profileAxes.map((a) => <option key={a.id} value={a.id} disabled={a.id === yk}>{a.label}</option>)}</select>
        </label>
        <label className="select">Up
          <select value={yk} onChange={(e) => setY(e.target.value)}>{profileAxes.map((a) => <option key={a.id} value={a.id} disabled={a.id === xk}>{a.label}</option>)}</select>
        </label>
        <p className="fine">Arrow keys move between nearby wines. Enter opens one.</p>
      </div>
      <div className="fmap-body">
        <div className="fmap-plot-wrap">
          <span className="fmap-y" aria-hidden="true"><span>{ay.hi}</span><b>{ay.label}</b><span>{ay.lo}</span></span>
          <div className="fmap-plot" role="group" aria-label={`Flavor map: ${ax.label.toLowerCase()} across, ${ay.label.toLowerCase()} up`} onKeyDown={onKey}>
            {ticks(xk).map((t) => <span key={`x${t}`} className="gx" style={{ left: `${toPct(t, xk)}%` }} aria-hidden="true" />)}
            {ticks(yk).map((t) => <span key={`y${t}`} className="gy" style={{ bottom: `${toPct(t, yk)}%` }} aria-hidden="true" />)}
            {list.map((w) => {
              const [x, y] = pos[w.name];
              const on = w.name === active.name;
              return (
                <button
                  key={w.name}
                  ref={(el) => (refs.current[w.name] = el)}
                  type="button"
                  className={`pt ${on ? "on" : ""}`}
                  style={{ left: `${toPct(x, xk)}%`, bottom: `${toPct(y, yk)}%`, "--c": w.color }}
                  tabIndex={on ? 0 : -1}
                  aria-label={`${w.name}: ${ax.label} ${w[xk]}, ${ay.label} ${w[yk]} of 5`}
                  onFocus={() => setCur(w.name)}
                  onMouseEnter={() => setCur(w.name)}
                  onClick={() => openWine(w.name)}
                ><span className="pt-label" aria-hidden="true">{w.name}</span></button>
              );
            })}
          </div>
          <span className="fmap-x" aria-hidden="true"><span>{ax.lo}</span><b>{ax.label}</b><span>{ax.hi}</span></span>
        </div>
        {active && (
          <aside className="fmap-card" style={{ "--c": active.color }} aria-label="Selected wine">
            <span className="fmap-pour" aria-hidden="true" />
            <h2 className="fmap-name">{active.name}</h2>
            <p className="wcard-meta">{active.style}, {active.country}</p>
            <p>{active.description}</p>
            <Profile wine={active} />
            <button type="button" className="btn btn-primary" onClick={() => openWine(active.name)}>Open {active.name}</button>
          </aside>
        )}
      </div>
    </div>
  );
}

/* Finder --------------------------------------------------------------------- */
function score(w, a) {
  let s = 0; const why = [];
  const cats = categories(w);
  if (a.style && a.style !== "Surprise me") {
    if (cats.includes(a.style)) { s += 5; why.push(`it's ${a.style === "Sweet" ? "sweet" : a.style.toLowerCase()}`); }
    else s -= 3;
  }
  if (a.body) {
    const d = Math.abs((w.body5 + 1) / 2 - a.body);
    s += Math.max(0, 3 - 2 * d);
    if (d <= 0.5) why.push(`${w.body.toLowerCase()} body`);
  }
  if (a.flavor) {
    const hits = flavorWords[a.flavor.replace(" and ", " & ")]?.filter((k) => w.notes.toLowerCase().includes(k)) || flavorWords[a.flavor]?.filter((k) => w.notes.toLowerCase().includes(k)) || [];
    s += Math.min(2, hits.length) * 1.5;
    if (a.flavor === "Sweet and floral" && w.sweet >= 3) s += 1.5;
    if (a.flavor === "Citrus and fresh" && w.acid >= 4) s += 1;
    if (hits.length) why.push(`notes of ${hits.slice(0, 2).join(" and ")}`);
  }
  const isClassic = classics.includes(w.name);
  if (a.adv === "Classics I've heard of" && isClassic) { s += 2; why.push("it's a classic"); }
  if (a.adv === "Show me something new" && !isClassic) { s += 2; why.push("it's off the beaten path"); }
  if (a.style === "Surprise me") s += Math.random() * 2;
  return { s, why };
}

function Finder({ saved, toggleSaved, onAsk, openWine }) {
  const [step, setStep] = useState(0);
  const [a, setA] = useState({});
  const done = step >= finderSteps.length;
  const results = useMemo(() => (done ? allWinesFull.map((w) => ({ w, ...score(w, a) })).sort((x, y) => y.s - x.s || x.w.name.localeCompare(y.w.name)).slice(0, 3) : []), [done, a]);
  const cur = finderSteps[step];
  const pick = (opt) => { setA((p) => ({ ...p, [cur.id]: cur.id === "body" ? opt[2] : opt[0] })); setStep((s) => s + 1); };

  return (
    <section className="finder" id="finder" aria-labelledby="finder-h">
      <SectionHead id="finder-h" title="Not sure where to start?">Answer four quick questions. You'll get three wines from this guide and the reason each one made the list.</SectionHead>
      <div className="finder-box">
        {!done ? (
          <div>
            <p className="step-count">Question {step + 1} of {finderSteps.length}</p>
            <div className="meter thin" aria-hidden="true"><span style={{ width: `${(step / finderSteps.length) * 100}%` }} /></div>
            <h3 className="finder-q" tabIndex={-1} key={step} ref={(el) => step > 0 && el?.focus({ preventScroll: true })}>{cur.q}</h3>
            <ul className="finder-opts">
              {cur.opts.map((o) => <li key={o[0]}><button type="button" onClick={() => pick(o)}>{o[0]}</button></li>)}
            </ul>
            {step > 0 && <button type="button" className="btn btn-ghost small" onClick={() => setStep(step - 1)}><Icon name="back" size={16} /> Back</button>}
          </div>
        ) : (
          <div>
            <h3 className="finder-q" tabIndex={-1} ref={(el) => el?.focus({ preventScroll: true })}>Your three matches</h3>
            <ol className="matches">
              {results.map(({ w, why }) => (
                <li key={w.name} style={{ "--c": w.color }}>
                  <span className="match-pour" aria-hidden="true" />
                  <div>
                    <h4>{w.name}</h4>
                    <p className="wcard-meta">{w.style}, {w.country}</p>
                    <p>Picked because {why.length ? why.join(", ") : "it's a good all-rounder"}. Try it with {w.pairings.split(",").slice(0, 2).join(" or ").toLowerCase()}.</p>
                    <div className="row-actions">
                      <button type="button" className="btn btn-ghost small" onClick={() => openWine(w.name)}>Open</button>
                      <button type="button" className="btn btn-ghost small" aria-pressed={saved.includes(w.name)} onClick={() => toggleSaved(w.name)}><Icon name="heart" size={16} fill={saved.includes(w.name) ? "currentColor" : "none"} /> {saved.includes(w.name) ? "Saved" : "Save"}</button>
                      <button type="button" className="btn btn-ghost small" onClick={() => onAsk(`A wine finder suggested ${w.name} for me. How should I serve it and what should I eat with it?`)}><Icon name="spark" size={16} /> Ask Sommy</button>
                    </div>
                  </div>
                </li>
              ))}
            </ol>
            <button type="button" className="btn btn-primary" onClick={() => { setStep(0); setA({}); }}><Icon name="refresh" size={18} /> Start over</button>
          </div>
        )}
      </div>
    </section>
  );
}
