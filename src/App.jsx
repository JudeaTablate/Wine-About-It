import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import Header from "./components/Header";
import Footer from "./components/Footer";
import Chat from "./components/Chat";
import Palette from "./components/Palette";
import Settings from "./components/Settings";
import WineSheet from "./components/WineSheet";
import CompareTray from "./components/Compare";
import Home from "./pages/Home";
import Learn from "./pages/Learn";
import Wines from "./pages/Wines";
import Pair from "./pages/Pair";
import Tools from "./pages/Tools";
import Cellar from "./pages/Cellar";
import { allWinesFull, wineTerms } from "./data";
import { useStored } from "./lib/storage";
import { useRoute, go, PAGES } from "./lib/router";
import { useSettings, reducedMotion } from "./lib/settings";

export default function App() {
  const route = useRoute();
  const [settings, setSetting, resetSettings] = useSettings();
  const [chatOpen, setChatOpen] = useState(false);
  const [pending, setPending] = useState(null);
  const [paletteOpen, setPaletteOpen] = useState(false);
  const [settingsOpen, setSettingsOpen] = useState(false);
  const [sheet, setSheet] = useState(null);
  const [focusTerm, setFocusTerm] = useState(null);
  const [saved, setSaved] = useStored("wai-saved", []);
  const [learned, setLearned] = useStored("wai-learned", []);
  const [journal, setJournal] = useStored("wai-journal", []);
  const [compare, setCompare] = useStored("wai-compare", []);
  const [dev, setDev] = useStored("wai-dev", false);
  const [logDraft, setLogDraft] = useState(null);

  const openChat = useCallback((text) => {
    setChatOpen(true);
    if (text) setPending({ text, nonce: Date.now() });
  }, []);

  const openWine = useCallback((name) => setSheet(name), []);
  const toggleSaved = useCallback((name) => setSaved((s) => (s.includes(name) ? s.filter((x) => x !== name) : [...s, name])), [setSaved]);
  const toggleCompare = useCallback((name) => setCompare((c) => (c.includes(name) ? c.filter((x) => x !== name) : [...c, name].slice(-3))), [setCompare]);
  const logTasting = useCallback((name) => { setSheet(null); setLogDraft({ wine: name, nonce: Date.now() }); go("cellar", "journal"); }, []);

  // Page changes: title, scroll position and focus move to the new page heading.
  const first = useRef(true);
  useEffect(() => {
    const p = PAGES.find((x) => x.id === route.page);
    document.title = route.page === "home" ? p.title : `${p.title} | Wine About It`;
    const t = setTimeout(() => {
      const target = route.sub ? document.getElementById(route.sub) : null;
      if (target) target.scrollIntoView({ behavior: reducedMotion() ? "auto" : "smooth", block: "start" });
      else window.scrollTo({ top: 0 });
      if (!first.current) {
        const h = target?.querySelector("h2, h3") || document.getElementById("page-title");
        if (h) { if (!h.hasAttribute("tabindex")) h.setAttribute("tabindex", "-1"); h.focus({ preventScroll: true }); }
      }
      first.current = false;
    }, 30);
    return () => clearTimeout(t);
  }, [route.page, route.sub]);

  // Global shortcuts.
  useEffect(() => {
    const onKey = (e) => {
      const tag = e.target?.tagName;
      const typing = tag === "INPUT" || tag === "TEXTAREA" || tag === "SELECT" || e.target?.isContentEditable;
      if ((e.metaKey || e.ctrlKey) && e.key.toLowerCase() === "k") { e.preventDefault(); setPaletteOpen((o) => !o); }
      else if (e.key === "/" && !typing && !e.metaKey && !e.ctrlKey) { e.preventDefault(); setPaletteOpen(true); }
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, []);

  const pickTerm = useCallback((letter) => { setFocusTerm({ letter, nonce: Date.now() }); go("learn", "words"); }, []);
  const theme = document.documentElement.dataset.theme;

  const actions = useMemo(() => [
    { id: "chat", label: "Ask Sommy, the AI wine guide", hint: "Open the chat", run: (q) => openChat(typeof q === "string" ? q : undefined) },
    { id: "settings", label: "Reading and display settings", hint: "Text size, contrast, motion", run: () => setSettingsOpen(true) },
    { id: "theme", label: `Use ${theme === "dark" ? "light" : "dark"} theme`, hint: "Appearance", run: () => setSetting("theme", theme === "dark" ? "light" : "dark") },
    { id: "random", label: "Open a random wine", hint: "Surprise me", run: () => openWine(allWinesFull[Math.floor(Math.random() * allWinesFull.length)].name) },
    { id: "log", label: "Log a tasting", hint: "Tasting journal", run: () => { setLogDraft({ wine: "", nonce: Date.now() }); go("cellar", "journal"); } },
    { id: "dev", label: `Turn developer mode ${dev ? "off" : "on"}`, hint: "Shows chat telemetry", run: () => setDev(!dev) },
  ], [theme, dev, openChat, openWine, setSetting, setDev]);

  const common = { onAsk: openChat, openWine, saved, toggleSaved, compare, toggleCompare };
  const pages = {
    home: <Home {...common} learned={learned} journal={journal} />,
    learn: <Learn {...common} learned={learned} setLearned={setLearned} focusTerm={focusTerm} />,
    wines: <Wines {...common} />,
    pair: <Pair {...common} />,
    tools: <Tools {...common} />,
    cellar: <Cellar {...common} journal={journal} setJournal={setJournal} learned={learned} total={wineTerms.length} draft={logDraft} />,
  };

  return (
    <div className="site">
      <a className="skip" href="#page-title" onClick={(e) => { e.preventDefault(); document.getElementById("page-title")?.focus(); }}>Skip to content</a>
      <Header page={route.page} openPalette={() => setPaletteOpen(true)} openSettings={() => setSettingsOpen(true)} openChat={openChat} savedCount={saved.length} />
      <main id="main" key={route.page}>{pages[route.page]}</main>
      <Footer dev={dev} setDev={setDev} openPalette={() => setPaletteOpen(true)} openSettings={() => setSettingsOpen(true)} />
      <CompareTray compare={compare} toggleCompare={toggleCompare} clear={() => setCompare([])} openWine={openWine} />
      <WineSheet name={sheet} onClose={() => setSheet(null)} {...common} logTasting={logTasting} journal={journal} />
      <Settings open={settingsOpen} onClose={() => setSettingsOpen(false)} settings={settings} set={setSetting} reset={resetSettings} />
      <Chat open={chatOpen} setOpen={setChatOpen} pending={pending} dev={dev} />
      <Palette open={paletteOpen} onClose={() => setPaletteOpen(false)} actions={actions} onPickWine={openWine} onPickTerm={pickTerm} />
    </div>
  );
}
