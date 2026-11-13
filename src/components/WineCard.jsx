import { Icon, Profile } from "./ui";

export default function WineCard({ w, openWine, saved, toggleSaved, compare, toggleCompare, headingLevel = 3 }) {
  const H = `h${headingLevel}`;
  const isSaved = saved.includes(w.name);
  const inCompare = compare.includes(w.name);
  return (
    <article className="wcard" style={{ "--c": w.color }}>
      <span className="wcard-pour" aria-hidden="true" />
      <div className="wcard-body">
        <p className="wcard-meta">{w.style}, {w.country}</p>
        <H className="wcard-name">
          <button type="button" className="stretch" onClick={() => openWine(w.name)}>{w.name}</button>
        </H>
        <p className="wcard-notes">{w.notes}</p>
        <Profile wine={w} compact />
      </div>
      <div className="wcard-actions">
        <button type="button" className={`icon-btn small ${isSaved ? "on" : ""}`} aria-pressed={isSaved} aria-label={`Save ${w.name}`} title={isSaved ? "Saved" : "Save"} onClick={() => toggleSaved(w.name)}>
          <Icon name="heart" size={18} fill={isSaved ? "currentColor" : "none"} />
        </button>
        <button type="button" className={`icon-btn small ${inCompare ? "on" : ""}`} aria-pressed={inCompare} aria-label={`Compare ${w.name}`} title={inCompare ? "In comparison" : "Compare"} onClick={() => toggleCompare(w.name)}>
          <Icon name="columns" size={18} />
        </button>
      </div>
    </article>
  );
}
