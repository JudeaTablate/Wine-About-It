import { useEffect, useState } from "react";
import { Icon, Logo } from "./ui";
import { PAGES, href } from "../lib/router";

export default function Header({ page, openPalette, openSettings, openChat, savedCount }) {
  const [open, setOpen] = useState(false);
  useEffect(() => setOpen(false), [page]);
  useEffect(() => {
    if (!open) return;
    const k = (e) => e.key === "Escape" && setOpen(false);
    window.addEventListener("keydown", k);
    return () => window.removeEventListener("keydown", k);
  }, [open]);

  return (
    <header className="top">
      <div className="top-inner">
        <a className="brand" href={href("home")}>
          <Logo />
          <span>Wine About It</span>
        </a>
        <nav aria-label="Main" id="main-nav" className={`main-nav ${open ? "open" : ""}`}>
          <ul>
            {PAGES.filter((p) => p.id !== "home").map((p) => (
              <li key={p.id}>
                <a href={href(p.id)} aria-current={page === p.id ? "page" : undefined}>
                  {p.label}
                  {p.id === "cellar" && savedCount > 0 && <span className="count" aria-label={`, ${savedCount} saved`}>{savedCount}</span>}
                </a>
              </li>
            ))}
          </ul>
        </nav>
        <div className="top-actions">
          <button type="button" className="icon-btn" onClick={openPalette} aria-label="Search wines and terms" title="Search (press /)">
            <Icon name="search" />
          </button>
          <button type="button" className="icon-btn" onClick={openSettings} aria-label="Reading and display settings" title="Reading and display settings">
            <Icon name="eye" />
          </button>
          <button type="button" className="btn btn-primary top-ask" onClick={() => openChat()} aria-label="Ask Sommy, the AI wine guide">
            <Icon name="spark" size={18} /> <span>Ask Sommy</span>
          </button>
          <button type="button" className="icon-btn menu-btn" onClick={() => setOpen((o) => !o)} aria-expanded={open} aria-controls="main-nav" aria-label="Menu">
            <Icon name={open ? "x" : "menu"} />
          </button>
        </div>
      </div>
    </header>
  );
}
