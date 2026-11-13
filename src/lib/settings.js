import { useCallback, useEffect, useState } from "react";

export const DEFAULTS = { theme: "system", scale: 100, contrast: "standard", motion: "system", font: "default", spacing: "normal", links: "auto" };

const read = () => { try { return { ...DEFAULTS, ...JSON.parse(localStorage.getItem("wai-a11y") || "{}") }; } catch { return { ...DEFAULTS }; } };
const dark = () => matchMedia("(prefers-color-scheme: dark)").matches;

function apply(s) {
  const d = document.documentElement;
  d.dataset.theme = s.theme === "system" ? (dark() ? "dark" : "light") : s.theme;
  d.dataset.contrast = s.contrast;
  d.dataset.motion = s.motion;
  d.dataset.font = s.font;
  d.dataset.spacing = s.spacing;
  d.dataset.links = s.links;
  d.style.fontSize = `${s.scale}%`;
  d.dataset.large = s.scale >= 130 ? "1" : "0";
}

export const reducedMotion = () =>
  document.documentElement.dataset.motion === "reduce" ||
  (document.documentElement.dataset.motion !== "full" && matchMedia("(prefers-reduced-motion: reduce)").matches);

export function useSettings() {
  const [s, setS] = useState(read);
  useEffect(() => {
    apply(s);
    try { localStorage.setItem("wai-a11y", JSON.stringify(s)); } catch { /* storage blocked */ }
  }, [s]);
  useEffect(() => {
    const mq = matchMedia("(prefers-color-scheme: dark)");
    const on = () => s.theme === "system" && apply(s);
    mq.addEventListener("change", on);
    return () => mq.removeEventListener("change", on);
  }, [s]);
  const set = useCallback((k, v) => setS((p) => ({ ...p, [k]: v })), []);
  const reset = useCallback(() => setS({ ...DEFAULTS }), []);
  return [s, set, reset];
}
