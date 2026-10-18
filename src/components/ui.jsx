import { useId, useRef } from "react";

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
};

export function Icon({ name, size = 20, ...rest }) {
  return (
    <svg className="icon" width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true" focusable="false" {...rest}>
      {PATHS[name]}
    </svg>
  );
}

export function Logo({ size = 40 }) {
  return (
    <span className="brand-mark" aria-hidden="true" style={{ width: size, height: size }}>
      <svg viewBox="0 0 48 48"><path d="M24 36c-2-7-2-12 1-17 2-3 5-6 9-8"/><path d="M25 28c-6-1-10-4-12-9 5-1 10 2 12 7"/><path d="M28 23c3-5 8-7 13-6-2 5-6 8-12 9"/><circle cx="19" cy="34" r="2.6"/><circle cx="24" cy="36" r="2.6"/><circle cx="29" cy="34" r="2.6"/><circle cx="24" cy="40.5" r="2.6"/></svg>
    </span>
  );
}

export const Eyebrow = ({ children }) => <p className="eyebrow">{children}</p>;

export function SectionHead({ id, eyebrow, title, children }) {
  return (
    <div className="section-head reveal">
      <div>
        <Eyebrow>{eyebrow}</Eyebrow>
        <h2 id={id}>{title}</h2>
      </div>
      {children && <p className="lede">{children}</p>}
    </div>
  );
}

/** Accessible tabs hook: roving tabindex + arrow/Home/End keys. Panel is rendered by the caller. */
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
            id={`${base}-t-${it.id}`}
            aria-selected={value === it.id}
            aria-controls={`${base}-panel`}
            tabIndex={value === it.id ? 0 : -1}
            className={value === it.id ? "active" : ""}
            onClick={() => onChange(it.id)}
          >
            {it.icon && <span aria-hidden="true" className="tab-ico">{it.icon}</span>}
            {it.label}
          </button>
        ))}
      </div>
    ),
    panelProps: { role: "tabpanel", id: `${base}-panel`, "aria-labelledby": `${base}-t-${value}`, tabIndex: 0 },
  };
}
