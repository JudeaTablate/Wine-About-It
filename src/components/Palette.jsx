import { useEffect, useMemo, useRef, useState } from "react";
import { Icon } from "./ui";
import { allWines, wineTerms, pairingData } from "../data";

import { go } from "../lib/router";

const SECTIONS = [
  ["Home", "home"], ["Learn: wine styles", "learn", "styles"], ["Learn: tasting in 5 steps", "learn", "tasting"], ["Learn: words A to Z", "learn", "words"],
  ["Learn: read a label", "learn", "labels"], ["Learn: glasses and the 3D glass", "learn", "glasses"], ["Learn: myths", "learn", "myths"],
  ["Wines and the flavor map", "wines"], ["Wine finder quiz", "wines", "finder"], ["Food pairing", "pair"], ["Wine regions", "pair", "world"],
  ["Party planner", "tools", "party"], ["Chill timer", "tools", "chill"], ["Leftover wine guide", "tools", "leftovers"], ["My cellar", "cellar"], ["Tasting journal", "cellar", "journal"],
];

export default function Palette({ open, onClose, actions, onPickWine, onPickTerm }) {
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
      ...SECTIONS.map(([label, page, sub]) => ({ id: label, label, group: "Go to", key: `s-${label}`, run: () => go(page, sub) })),
    ];
    const needle = q.trim().toLowerCase();
    if (!needle) return base;
    const pool = [
      ...base,
      ...allWines.map((w) => ({ id: w.name, label: w.name, hint: `${w.style}, ${w.country}`, group: "Wines", key: `w-${w.name}`, kw: `${w.notes} ${w.pairings}`, run: () => onPickWine(w.name) })),
      ...Object.keys(pairingData).map((f) => ({ id: f, label: `What to drink with ${f.toLowerCase()}`, hint: "Pairing", group: "Food", key: `f-${f}`, kw: f, run: () => { try { sessionStorage.setItem("wai-food", f); } catch { /* ignore */ } window.dispatchEvent(new CustomEvent("wai-food", { detail: f })); go("pair"); } })),
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
  }, [q, actions, onPickWine, onPickTerm]);

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
            placeholder="Search wines, words, pages and actions" role="combobox" aria-expanded="true" aria-controls="palette-list"
            aria-activedescendant={items[idx] ? `opt-${items[idx].key}` : undefined} aria-autocomplete="list" autoComplete="off" spellCheck="false"
          />
          <kbd>esc</kbd>
        </div>
        <ul id="palette-list" role="listbox" ref={listRef} className="palette-list" aria-label="Results">
          {items.length === 0 && <li className="palette-empty" role="presentation">Nothing matches that. Try another word, or ask Sommy below.</li>}
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
          <span><kbd>↑</kbd><kbd>↓</kbd> navigate</span><span><kbd>↵</kbd> select</span><span><kbd>/</kbd> opens search anywhere</span>
          {q.trim() && <button onClick={() => { onClose(); actions.find((a) => a.id === "chat")?.run(q.trim()); }}>Ask Sommy about “{q.trim().slice(0, 24)}”</button>}
        </div>
      </div>
    </div>
  );
}
