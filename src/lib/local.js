import { wines, wineTerms, pairingData } from "../data";

const allWines = Object.values(wines).flat();
const FAQ = [
  [/tannin/, "**Tannins** are the compounds from grape skins, seeds and oak that make your mouth feel dry and grippy, like strong black tea. They give red wine structure and help it age. Food with fat or protein softens them."],
  [/sulfite|sulphite/, "**Sulfites** occur naturally in wine and are also added as a preservative. White wines usually contain more than reds, and the evidence that they cause headaches for most people is thin."],
  [/vintage/, "The **vintage** is the year the grapes were harvested. It matters most in regions with changeable weather, like Burgundy or Bordeaux."],
  [/dry|sweet/, "**Dry** means little or no sugar is left after fermentation, so the wine doesn't taste sweet. Fruity aromas can still make a dry wine seem sweet."],
  [/chill|temperature|fridge|serve/, "A good rule: whites and rosé about 8–12 °C (fridge for 2 hours), reds slightly cool at 15–18 °C (fridge for 15–20 minutes), sparkling very cold at 6–8 °C."],
  [/label/, "On a label look for: the **producer**, the **place** (often more important than the grape in Europe), the **vintage**, and the **alcohol %**. Words like Reserva or Riserva mean extra aging in many countries."],
  [/champagne|prosecco/, "**Champagne** is made in France with a second fermentation in each bottle. **Prosecco** is Italian and usually fermented in big tanks, which keeps it fresher, fruitier and cheaper."],
];
const STOP = new Set("the a an and or of to is are what whats how do does i me my you for with in on it about tell explain like can should which wine wines".split(" "));

/**
 * Offline "sommelier-lite": answers from the site's own data when no AI backend is reachable.
 * Keeps the chat useful on first run, in local dev without a key, or when quotas are hit.
 */
export function localAnswer(question) {
  const words = question.toLowerCase().replace(/[^\p{L}\s'-]/gu, " ").split(/\s+/).filter((w) => w && !STOP.has(w));
  const has = (s) => words.some((w) => s.toLowerCase().includes(w));
  const out = [];
  const joined = question.toLowerCase();
  FAQ.filter(([re]) => re.test(joined)).slice(0, 2).forEach(([, a]) => out.push(a));

  const term = wineTerms.find(([, t]) => words.some((w) => t.toLowerCase().includes(w)));
  if (term) out.push(`**${term[1]}** — ${term[2]}`);

  const food = Object.entries(pairingData).find(([k]) => words.some((w) => k.toLowerCase().startsWith(w.slice(0, 4))));
  if (food) out.push(`For **${food[0]}**, try ${food[1].picks.map((p) => `**${p}**`).join(", ")}. ${food[1].why}`);

  const hits = out.length ? [] : allWines.filter((w) => words.some((x) => w.name.toLowerCase().includes(x)) || (words.length && has(`${w.country} ${w.style}`) && words.some((x) => `${w.country} ${w.style}`.toLowerCase().includes(x)))).slice(0, 3);
  hits.forEach((w) => out.push(`**${w.name}** (${w.style}, ${w.country}) — ${w.description} Pair with: ${w.pairings}.`));

  const body = out.length
    ? out.join("\n\n")
    : "I can't reach the AI right now, so I can only answer from the guides on this page. Try a wine name (like *Riesling*), a term (like *tannin*), or a food (like *pizza*).";
  const chips = out.length ? ["Pair it with food", "Explain a wine term", "Suggest a beginner wine"] : ["What is tannin?", "What goes with pizza?", "Tell me about Malbec"];
  return `${body}\n\n_Offline mode: answered from the on-page guides._\nFOLLOW_UPS: ${chips.join(" | ")}`;
}
