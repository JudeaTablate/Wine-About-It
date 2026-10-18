import { useEffect, useState } from "react";
import { Icon, Logo } from "./ui";

const LINKS = [
  ["Learn", "learn"], ["Ask Sommy", "ask"], ["Directory", "directory"], ["Find a wine", "finder"],
  ["Pair", "pairing"], ["Glass Lab", "glass-lab"], ["World", "world"],
];

export default function Nav({ theme, toggleTheme, openPalette, openChat, learnedCount, total }) {
  const [open, setOpen] = useState(false);
  const [active, setActive] = useState("");

  useEffect(() => {
    const bar = document.getElementById("progress-bar");
    const onScroll = () => {
      const h = document.documentElement;
      const p = h.scrollTop / Math.max(1, h.scrollHeight - h.clientHeight);
      if (bar) bar.style.transform = `scaleX(${p})`;
    };
    onScroll();
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  useEffect(() => {
    const els = LINKS.map(([, id]) => document.getElementById(id)).filter(Boolean);
    const io = new IntersectionObserver(
      (entries) => entries.forEach((e) => e.isIntersecting && setActive(e.target.id)),
      { rootMargin: "-40% 0px -55% 0px" }
    );
    els.forEach((el) => io.observe(el));
    return () => io.disconnect();
  }, []);

  return (
    <>
      <div className="progress" aria-hidden="true"><span id="progress-bar" /></div>
      <header className="nav">
        <a className="brand" href="#top" aria-label="Wine About It, back to top">
          <Logo />
          <span className="brand-text">Wine About It<small>WINE 101</small></span>
        </a>
        <nav aria-label="Primary" className={`nav-links ${open ? "open" : ""}`}>
          {LINKS.map(([label, id]) => (
            <a key={id} href={`#${id}`} aria-current={active === id ? "true" : undefined} onClick={() => setOpen(false)}>{label}</a>
          ))}
          <button className="nav-search-mobile" onClick={() => { setOpen(false); openPalette(); }}>Search &amp; commands</button>
        </nav>
        <div className="nav-actions">
          <button className="icon-btn search-btn" onClick={openPalette} aria-label="Search and commands (Control K)" title="Search · Ctrl/⌘ K">
            <Icon name="search" /><kbd>⌘K</kbd>
          </button>
          <button className="icon-btn" onClick={toggleTheme} aria-label={`Switch to ${theme === "dark" ? "light" : "dark"} theme`} aria-pressed={theme === "dark"}>
            <Icon name={theme === "dark" ? "sun" : "moon"} />
          </button>
          <button className="btn btn-primary nav-cta" onClick={() => openChat()}>
            <Icon name="spark" size={18} /> <span>Ask Sommy</span>
          </button>
          <button className="icon-btn menu-btn" onClick={() => setOpen((o) => !o)} aria-expanded={open} aria-label="Menu">
            <Icon name={open ? "x" : "menu"} />
          </button>
        </div>
        {learnedCount > 0 && (
          <span className="learn-chip" title={`${learnedCount} of ${total} wine words learned`}>
            <span className="sr-only">Learned </span>{learnedCount}/{total}<span className="sr-only"> words</span>
          </span>
        )}
      </header>
    </>
  );
}
