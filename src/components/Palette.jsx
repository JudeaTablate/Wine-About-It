import { useEffect, useMemo, useRef, useState } from "react";
import { Icon } from "./ui";
import { allWines, wineTerms } from "../data";

const SECTIONS = [
  ["Learn the basics", "learn"], ["Ask Sommy (AI chat)", "ask"], ["Wine directory", "directory"], ["Find my wine", "finder"],
  ["Wine words A–Z", "words"], ["Food pairing", "pairing"], ["Glass Lab (3D)", "glass-lab"], ["Wine world", "world"], ["Myths", "myths"],
];

export default function Palette({ open, onClose, actions, onPickWine, onPickTerm, onGoto }) {
  const [q, setQ] = useState("");
  const [idx, setIdx] = useState(0);
  const inputRef = useRef(null);
  const listRef = useRef(null);
  const prevFocus = useRef(null);

  useEffect(() => {
    if (open) {
      prevFocus.current = document.activeElement;
      setQ(""); setIdx(0);
      setTimeout(() => inputRef.current?.focus(), 20);
    } else prevFocus.current?.focus?.();
  }, [open]);

  const items = useMemo(() => {
    const base = [
      ...actions.map((a) => ({ ...a, group: "Actions", key: `a-${a.id}` })),
      ...SECTIONS.map(([label, id]) => ({ id, label, group: "Go to", key: `s-${id}`, run: () => onGoto(id) })),
    ];
    const needle = q.trim().toLowerCase();
    if (!needle) return base;
    const pool = [
      ...base,
      ...allWines.map((w) => ({ id: w.name, label: w.name, hint: `${w.style} · ${w.country}`, group: "Wines", key: `w-${w.name}`, kw: `${w.notes} ${w.pairings}`, run: () => onPickWine(w.name) })),
      ...wineTerms.map(([l, t, d]) => ({ id: l, label: t, hint: "Wine word", group: "Terms", key: `t-${t}`, kw: d, run: () => onPickTerm(l) })),
    ];
    return pool
      .map((it) => {
        const l = it.label.toLowerCase();
        const score = l.startsWith(needle) ? 3 : l.includes(needle) ? 2 : (it.kw || "").toLowerCase().includes(needle) ? 1 : 0;
        return { it, score };
      })
      .filter((x) => x.score)
      .sort((a, b) => b.score - a.score)
      .slice(0, 30)
      .map((x) => x.it);
  }, [q, actions, onGoto, onPickWine, onPickTerm]);

  useEffect(() => setIdx(0), [q]);
  useEffect(() => { listRef.current?.querySelector('[aria-selected="true"]')?.scrollIntoView({ block: "nearest" }); }, [idx]);

  if (!open) return null;
  const choose = (it) => { onClose(); setTimeout(it.run, 0); };
  const onKey = (e) => {
    if (e.key === "ArrowDown") { e.preventDefault(); setIdx((i) => Math.min(items.length - 1, i + 1)); }
    else if (e.key === "ArrowUp") { e.preventDefault(); setIdx((i) => Math.max(0, i - 1)); }
    else if (e.key === "Enter" && items[idx]) { e.preventDefault(); choose(items[idx]); }
    else if (e.key === "Escape") { e.preventDefault(); onClose(); }
  };

  let lastGroup = null;
  return (
    <div className="overlay" onMouseDown={(e) => e.target === e.currentTarget && onClose()}>
      <div className="palette" role="dialog" aria-modal="true" aria-label="Search and commands">
        <div className="palette-input">
          <Icon name="search" />
          <input
            ref={inputRef} value={q} onChange={(e) => setQ(e.target.value)} onKeyDown={onKey}
            placeholder="Search wines, terms, or run a command…" role="combobox" aria-expanded="true" aria-controls="palette-list"
            aria-activedescendant={items[idx] ? `opt-${items[idx].key}` : undefined} aria-autocomplete="list" autoComplete="off" spellCheck="false"
          />
          <kbd>esc</kbd>
        </div>
        <ul id="palette-list" role="listbox" ref={listRef} className="palette-list" aria-label="Results">
          {items.length === 0 && <li className="palette-empty" role="presentation">No matches. Press Enter on “Ask Sommy” below, or try another word.</li>}
          {items.map((it, i) => {
            const head = it.group !== lastGroup ? <li role="presentation" className="palette-group" key={`g-${it.group}`}>{it.group}</li> : null;
            lastGroup = it.group;
            return [
              head,
              <li key={it.key} id={`opt-${it.key}`} role="option" aria-selected={i === idx} className={i === idx ? "sel" : ""} onMouseMove={() => setIdx(i)} onClick={() => choose(it)}>
                <span>{it.label}</span>{it.hint && <small>{it.hint}</small>}
              </li>,
            ];
          })}
        </ul>
        <div className="palette-foot">
          <span><kbd>↑</kbd><kbd>↓</kbd> navigate</span><span><kbd>↵</kbd> select</span><span><kbd>/</kbd> or <kbd>⌘K</kbd> open anywhere</span>
          {q.trim() && <button onClick={() => { onClose(); actions.find((a) => a.id === "chat")?.run(q.trim()); }}>Ask Sommy “{q.trim().slice(0, 24)}” →</button>}
        </div>
      </div>
    </div>
  );
}
