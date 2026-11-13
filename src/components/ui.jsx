import { useEffect, useId, useRef } from "react";
import { profileAxes } from "../data";

const PATHS = {
  search: <><circle cx="11" cy="11" r="7"/><path d="m20 20-3.5-3.5"/></>,
  sun: <><circle cx="12" cy="12" r="4"/><path d="M12 2v2M12 20v2M4.9 4.9l1.4 1.4M17.7 17.7l1.4 1.4M2 12h2M20 12h2M4.9 19.1l1.4-1.4M17.7 6.3l1.4-1.4"/></>,
  moon: <path d="M21 12.8A9 9 0 1 1 11.2 3a7 7 0 0 0 9.8 9.8z"/>,
  send: <><path d="m22 2-7 20-4-9-9-4z"/><path d="M22 2 11 13"/></>,
  mic: <><rect x="9" y="2" width="6" height="12" rx="3"/><path d="M5 11a7 7 0 0 0 14 0M12 18v4"/></>,
  clip: <path d="m21 11-9.5 9.5a5.5 5.5 0 0 1-7.8-7.8L13.2 3.2a3.7 3.7 0 0 1 5.3 5.3L9 18a1.8 1.8 0 0 1-2.6-2.6l8.5-8.5"/>,
  stop: <rect x="6" y="6" width="12" height="12" rx="2"/>,
  copy: <><rect x="9" y="9" width="12" height="12" rx="2"/><path d="M5 15V5a2 2 0 0 1 2-2h10"/></>,
  heart: <path d="M20.8 5.6a5.5 5.5 0 0 0-7.8 0L12 6.7l-1-1.1a5.5 5.5 0 0 0-7.8 7.8l1 1L12 22l7.8-7.6 1-1a5.5 5.5 0 0 0 0-7.8z"/>,
  x: <path d="M18 6 6 18M6 6l12 12"/>,
  spark: <><path d="M12 3l1.8 5.2L19 10l-5.2 1.8L12 17l-1.8-5.2L5 10l5.2-1.8z"/><path d="M19 3v4M17 5h4"/></>,
  speaker: <><path d="M11 5 6 9H2v6h4l5 4z"/><path d="M15.5 8.5a5 5 0 0 1 0 7M18.5 5.5a9 9 0 0 1 0 13"/></>,
  arrow: <path d="M5 12h14M13 6l6 6-6 6"/>,
  back: <path d="M19 12H5M11 6l-6 6 6 6"/>,
  chevron: <path d="m6 9 6 6 6-6"/>,
  menu: <path d="M4 7h16M4 12h16M4 17h16"/>,
  refresh: <path d="M21 12a9 9 0 1 1-3-6.7L21 8M21 3v5h-5"/>,
  check: <path d="m5 12 5 5L20 7"/>,
  plus: <path d="M12 5v14M5 12h14"/>,
  minus: <path d="M5 12h14"/>,
  trash: <path d="M3 6h18M8 6V4h8v2M6 6l1 14h10l1-14"/>,
  shuffle: <><path d="M16 3h5v5M4 20 21 3M21 16v5h-5M15 15l6 6M4 4l5 5"/></>,
  left: <path d="m15 6-6 6 6 6"/>,
  right: <path d="m9 6 6 6-6 6"/>,
  eye: <><path d="M2 12s3.6-7 10-7 10 7 10 7-3.6 7-10 7S2 12 2 12z"/><circle cx="12" cy="12" r="3"/></>,
  sliders: <><path d="M4 6h10M18 6h2M4 12h4M12 12h8M4 18h12M20 18h0"/><circle cx="16" cy="6" r="2"/><circle cx="10" cy="12" r="2"/><circle cx="18" cy="18" r="2"/></>,
  grid: <><rect x="3" y="3" width="7" height="7" rx="1.5"/><rect x="14" y="3" width="7" height="7" rx="1.5"/><rect x="3" y="14" width="7" height="7" rx="1.5"/><rect x="14" y="14" width="7" height="7" rx="1.5"/></>,
  map: <><path d="M3 21h18M3 21V3"/><circle cx="9" cy="14" r="1.6"/><circle cx="14" cy="9" r="1.6"/><circle cx="18" cy="15" r="1.6"/><circle cx="8" cy="7" r="1.6"/></>,
  list: <path d="M8 6h13M8 12h13M8 18h13M3 6h.01M3 12h.01M3 18h.01"/>,
  columns: <><rect x="3" y="4" width="18" height="16" rx="2"/><path d="M9 4v16M15 4v16"/></>,
  glass: <><path d="M7 3h10c0 6-1.6 9-5 9.6C8.6 12 7 9 7 3z"/><path d="M12 12.6V20M8 21h8"/></>,
  users: <><circle cx="9" cy="8" r="3.5"/><path d="M2.5 20c.8-3.6 3.4-5.5 6.5-5.5s5.7 1.9 6.5 5.5"/><path d="M16 4.6a3.5 3.5 0 0 1 0 6.8M18.5 14.8c1.6.8 2.6 2.5 3 5.2"/></>,
  thermo: <><path d="M14 14.8V5a2 2 0 0 0-4 0v9.8a4 4 0 1 0 4 0z"/><path d="M12 11v6"/></>,
  timer: <><circle cx="12" cy="13" r="8"/><path d="M12 9v4l2.5 2.5M9.5 2h5"/></>,
  book: <><path d="M4 4.5A2.5 2.5 0 0 1 6.5 2H20v17H6.5A2.5 2.5 0 0 0 4 21.5z"/><path d="M4 19.5A2.5 2.5 0 0 1 6.5 17H20"/></>,
  download: <path d="M12 3v12M7 10l5 5 5-5M4 21h16"/>,
  print: <><path d="M6 9V3h12v6"/><rect x="3" y="9" width="18" height="8" rx="2"/><path d="M7 14h10v7H7z"/></>,
  tag: <><path d="M20.6 13.4 13.4 20.6a2 2 0 0 1-2.8 0L3 13V3h10l7.6 7.6a2 2 0 0 1 0 2.8z"/><circle cx="8" cy="8" r="1.5"/></>,
  globe: <><circle cx="12" cy="12" r="9"/><path d="M3 12h18M12 3c2.5 2.6 3.8 5.6 3.8 9s-1.3 6.4-3.8 9c-2.5-2.6-3.8-5.6-3.8-9S9.5 5.6 12 3z"/></>,
  plate: <><circle cx="12" cy="12" r="9"/><circle cx="12" cy="12" r="5"/></>,
  pen: <path d="M4 20h4L19 9l-4-4L4 16zM13.5 6.5l4 4"/>,
  info: <><circle cx="12" cy="12" r="9"/><path d="M12 11v6M12 7.5h.01"/></>,
  wave: <path d="M2 12c2.5-4 5-4 7.5 0s5 4 7.5 0 3.5-3 5-2"/>,
  nose: <path d="M12 3c0 6-4 9-4 12a3 3 0 0 0 3 3h2M9 18c-1.5 0-3 .8-3 2M15 18c1.5 0 3 .8 3 2"/>,
  drop: <path d="M12 3s6 6.6 6 11a6 6 0 0 1-12 0c0-4.4 6-11 6-11z"/>,
  pause: <path d="M8 5v14M16 5v14"/>,
  play: <path d="M7 4v16l13-8z"/>,
};

export function Icon({ name, size = 20, ...rest }) {
  return (
    <svg className="icon" width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true" focusable="false" {...rest}>
      {PATHS[name]}
    </svg>
  );
}

export function Logo({ size = 36 }) {
  return (
    <svg className="logo" width={size} height={size} viewBox="0 0 48 48" aria-hidden="true" focusable="false">
      <rect width="48" height="48" rx="13" fill="var(--garnet)" />
      <g fill="none" stroke="#fff" strokeWidth="2.4" strokeLinecap="round" strokeLinejoin="round">
        <path d="M24 36c-2-7-2-12 1-17 2-3 5-6 9-8" /><path d="M25 28c-6-1-10-4-12-9 5-1 10 2 12 7" /><path d="M28 23c3-5 8-7 13-6-2 5-6 8-12 9" />
        <circle cx="19" cy="34" r="2.6" /><circle cx="24" cy="36" r="2.6" /><circle cx="29" cy="34" r="2.6" /><circle cx="24" cy="40.5" r="2.6" />
      </g>
    </svg>
  );
}

/** A dot of wine color. Decorative unless a label is given. */
export function Swatch({ color, size = 14, label, className = "" }) {
  return <span className={`swatch ${className}`} style={{ "--c": color, width: size, height: size }} role={label ? "img" : undefined} aria-label={label} aria-hidden={label ? undefined : "true"} />;
}

/** Page header: a big title and one line of help. */
export function PageHead({ title, children, aside }) {
  return (
    <header className="page-head">
      <div>
        <h1 tabIndex={-1} id="page-title">{title}</h1>
        {children && <p className="lede">{children}</p>}
      </div>
      {aside}
    </header>
  );
}

export function SectionHead({ id, title, children, level = 2 }) {
  const H = `h${level}`;
  return (
    <div className="section-head">
      <H id={id}>{title}</H>
      {children && <p className="lede">{children}</p>}
    </div>
  );
}

/** The taste fingerprint: four short bars that recur across the site. */
export function Profile({ wine, compact = false }) {
  return (
    <dl className={`profile ${compact ? "compact" : ""}`}>
      {profileAxes.map((a) => {
        const v = wine[a.id];
        const word = a.id === "tannin" && v === 0 ? "None" : v <= 2 ? a.lo : v >= 4 ? a.hi : "Medium";
        return (
          <div key={a.id}>
            <dt>{a.label}</dt>
            <dd>
              <span className="bar" aria-hidden="true">{[1, 2, 3, 4, 5].map((i) => <i key={i} className={i <= v ? "on" : ""} />)}</span>
              <span className={compact ? "sr-only" : "bar-word"}>{word}{compact ? `, ${v} of 5` : ""}</span>
            </dd>
          </div>
        );
      })}
    </dl>
  );
}

/** Accessible tabs: roving tabindex + arrow/Home/End keys. Panel is rendered by the caller. */
export function useTabs({ label, items, value, onChange, className = "" }) {
  const base = useId();
  const refs = useRef({});
  const onKey = (e) => {
    const i = items.findIndex((x) => x.id === value);
    let n = null;
    if (e.key === "ArrowRight" || e.key === "ArrowDown") n = (i + 1) % items.length;
    if (e.key === "ArrowLeft" || e.key === "ArrowUp") n = (i - 1 + items.length) % items.length;
    if (e.key === "Home") n = 0;
    if (e.key === "End") n = items.length - 1;
    if (n === null) return;
    e.preventDefault();
    onChange(items[n].id);
    refs.current[items[n].id]?.focus();
  };
  return {
    tabs: (
      <div role="tablist" aria-label={label} className={`tabs ${className}`} onKeyDown={onKey}>
        {items.map((it) => (
          <button
            key={it.id}
            ref={(el) => (refs.current[it.id] = el)}
            role="tab"
            type="button"
            id={`${base}-t-${it.id}`}
            aria-selected={value === it.id}
            aria-controls={`${base}-panel`}
            tabIndex={value === it.id ? 0 : -1}
            onClick={() => onChange(it.id)}
          >
            {it.color && <Swatch color={it.color} />}
            {it.label}
          </button>
        ))}
      </div>
    ),
    panelProps: { role: "tabpanel", id: `${base}-panel`, "aria-labelledby": `${base}-t-${value}`, tabIndex: 0 },
  };
}

/** Native <dialog> wrapper: focus trapping, Esc and focus return come from the browser. */
export function Dialog({ open, onClose, title, children, className = "", wide = false }) {
  const ref = useRef(null);
  const titleId = useId();
  useEffect(() => {
    const d = ref.current;
    if (!d) return;
    if (open && !d.open) d.showModal();
    if (!open && d.open) d.close();
  }, [open]);
  return (
    <dialog
      ref={ref}
      className={`dlg ${wide ? "wide" : ""} ${className}`}
      aria-labelledby={titleId}
      onClose={onClose}
      onCancel={(e) => { e.preventDefault(); onClose(); }}
      onMouseDown={(e) => { if (e.target === ref.current) onClose(); }}
    >
      {open && (
        <div className="dlg-inner">
          <header className="dlg-head">
            <h2 id={titleId}>{title}</h2>
            <button type="button" className="icon-btn" onClick={onClose} aria-label="Close"><Icon name="x" /></button>
          </header>
          {children}
        </div>
      )}
    </dialog>
  );
}

/** A segmented single-choice control built on real radio buttons. */
export function Segmented({ legend, name, value, options, onChange, hideLegend = false }) {
  return (
    <fieldset className="seg">
      <legend className={hideLegend ? "sr-only" : ""}>{legend}</legend>
      <div className="seg-row">
        {options.map(([v, l]) => (
          <label key={v} className={value === v ? "on" : ""}>
            <input type="radio" name={name} value={v} checked={value === v} onChange={() => onChange(v)} />
            <span>{l}</span>
          </label>
        ))}
      </div>
    </fieldset>
  );
}
