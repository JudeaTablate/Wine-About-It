import { useEffect, useState } from "react";

export const PAGES = [
  { id: "home", label: "Home", title: "Wine About It — Wine 101 without the snobbery" },
  { id: "learn", label: "Learn", title: "Learn wine, step by step" },
  { id: "wines", label: "Wines", title: "Wines and the flavor map" },
  { id: "pair", label: "Pair", title: "Food and wine pairing" },
  { id: "tools", label: "Tools", title: "Party, chilling and leftover tools" },
  { id: "cellar", label: "My cellar", title: "My cellar and tasting journal" },
];

/** Hash routes like #/wines or #/learn/words (the second part is a section id). */
export function parseHash(hash = location.hash) {
  const [page = "home", sub = ""] = hash.replace(/^#\/?/, "").split("/");
  return PAGES.some((p) => p.id === page) ? { page, sub } : { page: "home", sub: "" };
}

export function useRoute() {
  const [route, setRoute] = useState(() => parseHash());
  useEffect(() => {
    const on = () => setRoute(parseHash());
    window.addEventListener("hashchange", on);
    return () => window.removeEventListener("hashchange", on);
  }, []);
  return route;
}

export const href = (page, sub) => `#/${page}${sub ? `/${sub}` : ""}`;
export const go = (page, sub) => { location.hash = href(page, sub); };
