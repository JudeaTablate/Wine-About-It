import { Logo } from "./ui";
import { PAGES, href } from "../lib/router";

export default function Footer({ dev, setDev, openPalette, openSettings }) {
  return (
    <footer className="foot">
      <div className="wrap foot-grid">
        <div className="foot-brand">
          <a className="brand" href={href("home")}><Logo /><span>Wine About It</span></a>
          <p>A Wine 101 for people who just want to enjoy a glass. Made in Manila.</p>
          <p className="fine">Please drink responsibly and only if you are of legal drinking age. This site teaches about wine and is not medical advice.</p>
        </div>
        <nav aria-label="Footer">
          <h2 className="foot-h">Pages</h2>
          <ul className="foot-list">{PAGES.map((p) => <li key={p.id}><a href={href(p.id)}>{p.label}</a></li>)}</ul>
        </nav>
        <div>
          <h2 className="foot-h">Make it work for you</h2>
          <ul className="foot-list">
            <li><button type="button" className="link-btn" onClick={openSettings}>Text size, contrast and motion</button></li>
            <li><button type="button" className="link-btn" onClick={openPalette}>Search everything</button> <kbd>/</kbd></li>
            <li><button type="button" className="link-btn" aria-pressed={dev} onClick={() => setDev(!dev)}>Developer mode is {dev ? "on" : "off"}</button></li>
            <li><a href="https://github.com/JudeaTablate/Wine-About-It" target="_blank" rel="noopener noreferrer">Source code on GitHub<span className="sr-only"> (opens in a new tab)</span></a></li>
          </ul>
        </div>
      </div>
      <div className="wrap foot-base">
        <p>Your saved wines, journal and settings stay in this browser. No accounts, no trackers.</p>
      </div>
    </footer>
  );
}
