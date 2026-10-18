import { useCallback, useEffect, useMemo, useState } from "react";
import Nav from "./components/Nav";
import Hero from "./components/Hero";
import Chat from "./components/Chat";
import Palette from "./components/Palette";
import Ask from "./components/Ask";
import Directory from "./components/Directory";
import Finder from "./components/Finder";
import GlassLab from "./components/GlassLab";
import Footer from "./components/Footer";
import { StartHere, Terms, Tasting, Etiquette, Glassware, Myths } from "./components/Learn";
import { Pairing, World } from "./components/Explore";
import { wineTerms } from "./data";
import { useStored } from "./lib/storage";

const reduced = () => matchMedia("(prefers-reduced-motion: reduce)").matches;

export default function App() {
  const [theme, setTheme] = useState(() => document.documentElement.dataset.theme || "light");
  const [chatOpen, setChatOpen] = useState(false);
  const [pending, setPending] = useState(null);
  const [paletteOpen, setPaletteOpen] = useState(false);
  const [focusWine, setFocusWine] = useState(null);
  const [focusTerm, setFocusTerm] = useState(null);
  const [saved, setSaved] = useStored("wai-saved", []);
  const [learned, setLearned] = useStored("wai-learned", []);
  const [dev, setDev] = useStored("wai-dev", false);

  const toggleTheme = useCallback(() => {
    setTheme((t) => {
      const n = t === "dark" ? "light" : "dark";
      document.documentElement.dataset.theme = n;
      try { localStorage.setItem("wai-theme", n); } catch { /* storage blocked */ }
      return n;
    });
  }, []);

  const openChat = useCallback((text) => {
    setChatOpen(true);
    if (text) setPending({ text, nonce: Date.now() });
  }, []);

  const goto = useCallback((id) => {
    document.getElementById(id)?.scrollIntoView({ behavior: reduced() ? "auto" : "smooth", block: "start" });
  }, []);

  const pickWine = useCallback((name) => {
    setFocusWine({ name, nonce: Date.now() });
    goto("directory");
  }, [goto]);

  const pickTerm = useCallback((letter) => {
    setFocusTerm({ letter, nonce: Date.now() });
    goto("words");
  }, [goto]);

  // Reveal-on-scroll without a dependency: add .reveal in markup, .in appears when visible.
  useEffect(() => {
    if (reduced() || !("IntersectionObserver" in window)) {
      document.querySelectorAll(".reveal").forEach((el) => el.classList.add("in"));
    }
    const io = new IntersectionObserver((entries) => {
      entries.forEach((e) => { if (e.isIntersecting) { e.target.classList.add("in"); io.unobserve(e.target); } });
    }, { threshold: 0.1, rootMargin: "0px 0px -5% 0px" });
    const scan = () => document.querySelectorAll(".reveal:not(.in)").forEach((el) => io.observe(el));
    scan();
    const mo = new MutationObserver(scan);
    mo.observe(document.body, { childList: true, subtree: true });
    return () => { io.disconnect(); mo.disconnect(); };
  }, []);

  // Global shortcuts.
  useEffect(() => {
    const onKey = (e) => {
      const tag = e.target?.tagName;
      const typing = tag === "INPUT" || tag === "TEXTAREA" || e.target?.isContentEditable;
      if ((e.metaKey || e.ctrlKey) && e.key.toLowerCase() === "k") { e.preventDefault(); setPaletteOpen((o) => !o); }
      else if (e.key === "/" && !typing && !e.metaKey && !e.ctrlKey) { e.preventDefault(); setPaletteOpen(true); }
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, []);

  const actions = useMemo(() => [
    { id: "chat", label: "Ask Sommy (AI chat)", hint: "Open the conversation", run: (q) => openChat(typeof q === "string" ? q : undefined) },
    { id: "theme", label: `Switch to ${theme === "dark" ? "light" : "dark"} theme`, hint: "Appearance", run: toggleTheme },
    { id: "random", label: "Surprise me with a random wine", hint: "Directory", run: () => pickWine(["Riesling", "Nebbiolo", "Albariño", "Xinomavro", "Lambrusco", "Gamay", "Vermentino", "Torrontés"][Math.floor(Math.random() * 8)]) },
    { id: "dev", label: `Developer mode: turn ${dev ? "off" : "on"}`, hint: "Show chat telemetry", run: () => setDev(!dev) },
    { id: "reset", label: "Reset my progress and saved wines", hint: "Clears local data", run: () => { setSaved([]); setLearned([]); try { localStorage.removeItem("wai-tasting"); } catch { /* ignore */ } } },
  ], [theme, dev, openChat, toggleTheme, pickWine, setDev, setSaved, setLearned]);

  return (
    <div className="site">
      <a className="skip" href="#main">Skip to content</a>
      <Nav theme={theme} toggleTheme={toggleTheme} openPalette={() => setPaletteOpen(true)} openChat={openChat} learnedCount={learned.length} total={wineTerms.length} />
      <main id="main">
        <Hero onAsk={openChat} />
        <Ask onAsk={openChat} openChat={openChat} />
        <StartHere learnedCount={learned.length} />
        <Tasting />
        <Terms focusLetter={focusTerm} learned={learned} setLearned={setLearned} onAsk={openChat} />
        <Directory focus={focusWine} saved={saved} setSaved={setSaved} onAsk={openChat} />
        <Finder saved={saved} setSaved={setSaved} onAsk={openChat} onPickWine={pickWine} />
        <Pairing onPickWine={pickWine} onAsk={openChat} />
        <Glassware onAsk={openChat} />
        <GlassLab />
        <World onPickWine={pickWine} onAsk={openChat} />
        <Etiquette />
        <Myths />
      </main>
      <Footer dev={dev} setDev={setDev} openPalette={() => setPaletteOpen(true)} />
      <Chat open={chatOpen} setOpen={setChatOpen} pending={pending} dev={dev} />
      <Palette open={paletteOpen} onClose={() => setPaletteOpen(false)} actions={actions} onPickWine={pickWine} onPickTerm={pickTerm} onGoto={goto} />
    </div>
  );
}
