import { Logo } from "./ui";

export default function Footer({ dev, setDev, openPalette }) {
  return (
    <footer className="footer">
      <div className="wrap foot-grid">
        <div>
          <a className="brand" href="#top"><Logo /><span className="brand-text">Wine About It<small>WINE 101</small></span></a>
          <p className="foot-line">Wine doesn't have to be complicated.</p>
          <p className="fine">Please enjoy responsibly and only if you're of legal drinking age. Educational content, not medical advice.</p>
        </div>
        <div>
          <h2 className="foot-h">Under the hood</h2>
          <ul className="foot-list">
            <li>React 19 + Vite, code-split</li>
            <li>Three.js loaded only when you scroll to it</li>
            <li>Streaming AI chat through a serverless proxy (keys never reach the browser)</li>
            <li>Dark mode, reduced-motion and keyboard friendly</li>
            <li>No accounts, no trackers</li>
          </ul>
        </div>
        <div>
          <h2 className="foot-h">Shortcuts</h2>
          <ul className="foot-list">
            <li><kbd>/</kbd> or <kbd>Ctrl/⌘</kbd> <kbd>K</kbd> command palette</li>
            <li><kbd>Esc</kbd> close chat or palette</li>
            <li><kbd>Enter</kbd> send · <kbd>Shift</kbd> <kbd>Enter</kbd> new line</li>
          </ul>
          <div className="foot-links">
            <button className="link-btn" onClick={openPalette}>Open palette</button>
            <button className="link-btn" aria-pressed={dev} onClick={() => setDev(!dev)}>Developer mode: {dev ? "on" : "off"}</button>
            <a href="https://github.com/JudeaTablate/Wine-About-It" target="_blank" rel="noopener noreferrer">Source on GitHub ↗</a>
            <a href="#top">Back to top ↑</a>
          </div>
        </div>
      </div>
    </footer>
  );
}
