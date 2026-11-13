import { useEffect, useId, useRef, useState } from "react";
import { Icon, PageHead, SectionHead } from "../components/ui";
import WineCard from "../components/WineCard";
import { allWinesFull, wineByName } from "../data";
import { href } from "../lib/router";

const today = () => { const d = new Date(); return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}-${String(d.getDate()).padStart(2, "0")}`; };
const blank = () => ({ wine: "", date: today(), rating: 0, price: "", where: "", notes: "", again: "maybe" });
const uid = () => Math.random().toString(36).slice(2, 10);

function download(name, text, type) {
  const url = URL.createObjectURL(new Blob([text], { type }));
  const a = Object.assign(document.createElement("a"), { href: url, download: name });
  document.body.appendChild(a); a.click(); a.remove();
  setTimeout(() => URL.revokeObjectURL(url), 500);
}

function Rating({ value, onChange }) {
  const name = useId();
  return (
    <fieldset className="rating">
      <legend>How much did you like it?</legend>
      <div className="rating-row">
        {[1, 2, 3, 4, 5].map((n) => (
          <label key={n} className={n <= value ? "on" : ""}>
            <input type="radio" name={name} value={n} checked={value === n} onChange={() => onChange(n)} />
            <Icon name="glass" size={26} fill={n <= value ? "currentColor" : "none"} />
            <span className="sr-only">{n} of 5</span>
          </label>
        ))}
        <span className="rating-word" aria-hidden="true">{["Not rated", "Not for me", "It was fine", "Good", "Really good", "Loved it"][value]}</span>
      </div>
    </fieldset>
  );
}

export default function Cellar(props) {
  const { saved, journal, setJournal, learned, total, draft, openWine } = props;
  const [form, setForm] = useState(blank);
  const [error, setError] = useState("");
  const [msg, setMsg] = useState("");
  const wineRef = useRef(null);
  const fileRef = useRef(null);
  const savedWines = saved.map((n) => wineByName[n]).filter(Boolean);

  useEffect(() => {
    if (draft) { setForm({ ...blank(), wine: draft.wine }); setTimeout(() => wineRef.current?.focus({ preventScroll: true }), 300); }
  }, [draft]);

  const submit = (e) => {
    e.preventDefault();
    if (!form.wine.trim()) { setError("Add the name of the wine so you can find this tasting later."); wineRef.current?.focus(); return; }
    setError("");
    setJournal((j) => [{ ...form, wine: form.wine.trim(), id: uid() }, ...j]);
    setMsg(`Saved your tasting of ${form.wine.trim()}.`);
    setForm(blank());
  };
  const remove = (id) => { const j = journal.find((x) => x.id === id); setJournal((all) => all.filter((x) => x.id !== id)); setMsg(`Deleted the tasting of ${j?.wine}.`); };

  const csv = () => {
    const cols = ["date", "wine", "rating", "price", "where", "again", "notes"];
    const esc = (v) => `"${String(v ?? "").replace(/"/g, '""')}"`;
    download("wine-journal.csv", [cols.join(","), ...journal.map((j) => cols.map((c) => esc(j[c])).join(","))].join("\n"), "text/csv");
  };
  const backup = () => download("wine-about-it-backup.json", JSON.stringify({ saved, journal, learned }, null, 2), "application/json");
  const restore = async (e) => {
    const f = e.target.files?.[0]; e.target.value = "";
    if (!f) return;
    try {
      const data = JSON.parse(await f.text());
      if (!Array.isArray(data.journal)) throw new Error();
      setJournal((j) => { const ids = new Set(j.map((x) => x.id)); return [...j, ...data.journal.filter((x) => x && x.wine && !ids.has(x.id))]; });
      if (Array.isArray(data.saved)) data.saved.forEach((n) => !saved.includes(n) && wineByName[n] && props.toggleSaved(n));
      setMsg("Backup restored. Entries you already had were kept.");
    } catch { setMsg("That file isn't a Wine About It backup. Choose the .json file you exported from this page."); }
  };

  const rated = journal.filter((j) => j.rating);
  const avg = rated.length ? (rated.reduce((a, j) => a + j.rating, 0) / rated.length).toFixed(1) : null;
  const fav = rated.length ? [...rated].sort((a, b) => b.rating - a.rating)[0] : null;

  return (
    <div className="wrap">
      <PageHead title="My cellar">
        The wines you've saved and the ones you've tasted. Everything stays in this browser. Export a backup to keep it safe or move it to another device.
      </PageHead>

      <dl className="cellar-stats">
        <div><dt>Saved</dt><dd>{saved.length}</dd></div>
        <div><dt>Tastings logged</dt><dd>{journal.length}</dd></div>
        <div><dt>Average rating</dt><dd>{avg ? `${avg} of 5` : "None yet"}</dd></div>
        <div><dt>Words learned</dt><dd>{learned.length} of {total}</dd></div>
      </dl>
      {fav && <p className="fav">Your favorite so far: <b>{fav.wine}</b>, rated {fav.rating} of 5.</p>}

      <section aria-labelledby="saved-h" className="block">
        <SectionHead id="saved-h" title="Saved to try">Tap the heart on any wine to add it here.</SectionHead>
        {savedWines.length ? (
          <ul className="cards">{savedWines.map((w) => <li key={w.name}><WineCard w={w} {...props} /></li>)}</ul>
        ) : (
          <div className="empty"><p>Nothing saved yet. Browse the map and tap the heart on anything that sounds good.</p><a className="btn btn-primary" href={href("wines")}>Browse wines</a></div>
        )}
      </section>

      <section aria-labelledby="journal-h" className="block" id="journal">
        <SectionHead id="journal-h" title="Tasting journal">Write down what you drank and whether you liked it. Future you, standing in the wine aisle, will thank you.</SectionHead>
        <div className="journal">
          <form className="jform" onSubmit={submit} noValidate>
            <div className="field">
              <label htmlFor="j-wine">Wine</label>
              <input id="j-wine" ref={wineRef} list="j-wines" value={form.wine} onChange={(e) => setForm({ ...form, wine: e.target.value })} aria-invalid={!!error} aria-describedby={error ? "j-err" : "j-hint"} autoComplete="off" />
              <datalist id="j-wines">{allWinesFull.map((w) => <option key={w.name} value={w.name} />)}</datalist>
              <p id="j-hint" className="hint">A grape, a region or the name on the bottle.</p>
              {error && <p id="j-err" className="err"><Icon name="info" size={16} /> {error}</p>}
            </div>
            <div className="field-row">
              <div className="field"><label htmlFor="j-date">Date</label><input id="j-date" type="date" value={form.date} onChange={(e) => setForm({ ...form, date: e.target.value })} /></div>
              <div className="field"><label htmlFor="j-price">Price (optional)</label><input id="j-price" inputMode="decimal" value={form.price} onChange={(e) => setForm({ ...form, price: e.target.value })} placeholder="₱" /></div>
            </div>
            <div className="field"><label htmlFor="j-where">Where (optional)</label><input id="j-where" value={form.where} onChange={(e) => setForm({ ...form, where: e.target.value })} /></div>
            <Rating value={form.rating} onChange={(r) => setForm({ ...form, rating: r })} />
            <div className="field"><label htmlFor="j-notes">Notes (optional)</label><textarea id="j-notes" rows={3} value={form.notes} onChange={(e) => setForm({ ...form, notes: e.target.value })} /></div>
            <fieldset className="seg">
              <legend>Would you buy it again?</legend>
              <div className="seg-row">
                {[["yes", "Yes"], ["maybe", "Maybe"], ["no", "No"]].map(([v, l]) => (
                  <label key={v} className={form.again === v ? "on" : ""}><input type="radio" name="again" checked={form.again === v} onChange={() => setForm({ ...form, again: v })} /><span>{l}</span></label>
                ))}
              </div>
            </fieldset>
            <button type="submit" className="btn btn-primary"><Icon name="pen" size={18} /> Save tasting</button>
          </form>

          <div className="jlist">
            <p role="status" className="status-line">{msg}</p>
            {journal.length === 0 ? (
              <div className="empty"><p>Your journal is empty. Log the next bottle you open and it will appear here.</p></div>
            ) : (
              <ol>
                {journal.map((j) => {
                  const w = wineByName[j.wine];
                  return (
                    <li key={j.id} style={{ "--c": w?.color || "var(--line)" }}>
                      <span className="j-pour" aria-hidden="true" />
                      <div>
                        <h3>{w ? <button type="button" className="link-btn strong" onClick={() => openWine(w.name)}>{j.wine}</button> : j.wine}</h3>
                        <p className="j-meta"><time dateTime={j.date}>{new Date(j.date + "T00:00").toLocaleDateString(undefined, { day: "numeric", month: "short", year: "numeric" })}</time>{j.where && `, ${j.where}`}{j.price && `, ₱${j.price.replace(/^₱/, "")}`}</p>
                        <p className="j-rate">{j.rating ? `${j.rating} of 5` : "Not rated"}{j.again === "yes" ? ". Would buy again." : j.again === "no" ? ". Wouldn't buy again." : ""}</p>
                        {j.notes && <p>{j.notes}</p>}
                      </div>
                      <button type="button" className="icon-btn small" onClick={() => remove(j.id)} aria-label={`Delete tasting of ${j.wine} on ${j.date}`}><Icon name="trash" size={18} /></button>
                    </li>
                  );
                })}
              </ol>
            )}
            <div className="row-actions">
              <button type="button" className="btn btn-ghost small" onClick={csv} disabled={!journal.length}><Icon name="download" size={16} /> Export spreadsheet (CSV)</button>
              <button type="button" className="btn btn-ghost small" onClick={backup}><Icon name="download" size={16} /> Back up everything</button>
              <button type="button" className="btn btn-ghost small" onClick={() => fileRef.current?.click()}>Restore a backup</button>
              <button type="button" className="btn btn-ghost small" onClick={() => window.print()} disabled={!journal.length}><Icon name="print" size={16} /> Print</button>
              <input ref={fileRef} type="file" accept="application/json,.json" hidden onChange={restore} />
            </div>
          </div>
        </div>
      </section>
    </div>
  );
}
