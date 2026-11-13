# Wine About It — Wine 101

A free, accessible Wine 101 for people who just want to enjoy a glass. Learn the basics, explore 52 wines on a flavor map, pair them with food (including adobo, sinigang, lechon and kare-kare), plan a party, chill a bottle properly in Manila heat, keep a tasting journal, and ask **Sommy**, a free conversational AI wine guide.

Live: https://wine-about-it.vercel.app

## What's new in v3

| Area | Change |
| --- | --- |
| Design | New identity, "held up to the light": quiet chalk and aubergine interface, and every wine shown in its real color instead of icons. No emojis anywhere, including Sommy's replies. |
| Structure | One long page became six focused pages with hash routes: Home, Learn, Wines, Pair, Tools, My cellar. Focus and page title move with each page change. |
| Home | The hero is a color spectrum of all 52 wines, palest to darkest, with bar height showing body. Each bar opens that wine. Plus a "wine of the day" and a wine-list-style index of the site. |
| Wines | Interactive flavor map (choose any two of body, sweetness, acidity and tannin as axes), card view with sorting, a taste profile for every wine, compare up to three side by side, and a smarter four-question finder. |
| Wine detail | Pronunciation you can hear, taste profile, serving temperature, how long it keeps once open, food matches, your own tasting notes and three similar wines. |
| Learn | Seven chapters: styles, five-step tasting checklist, 26 words with a self-test quiz, an interactive label decoder (French and Australian labels), glass shapes, the 3D glass (now with pour guidance and four wine colors), etiquette and myths. |
| Pair | 15 dishes including four Filipino ones, a reverse pairing ("already have a bottle?") and ten wine countries. Dishes are searchable from the search palette. |
| Tools | Party planner (bottles, glasses, water, ice), chill timer with real cooling estimates for fridge, ice bucket and freezer from any room temperature, and an open-bottle guide. |
| My cellar | Saved wines, a private tasting journal with ratings, CSV export, full JSON backup and restore, and a print layout. |
| Accessibility | Reading and display panel (text size 90–160%, high contrast, typeface, line spacing, motion, always-underlined links). Atkinson Hyperlegible body text. Native dialogs, real radio and checkbox inputs, roving keyboard navigation in the spectrum and map, forced-colors support. An automated axe-core scan (WCAG 2.2 AA rules) finds 0 issues on every page in light and dark. Still worth a manual screen-reader pass. |
| Performance | Fonts are self-hosted (no Google Fonts request). Three.js still loads only when the 3D glass is near the screen. |

## Run locally

```bash
npm install
cp .env.example .env.local   # then paste your free key(s)
npm run dev                  # http://localhost:5173
```

## Free AI setup (no credit card)

1. Create a key at https://aistudio.google.com/apikey
2. Put it in `.env.local` as `GEMINI_API_KEY=...`
3. Optional fallback: key from https://console.groq.com/keys as `GROQ_API_KEY=...`
4. On Vercel: Project → Settings → Environment Variables → add the same names → Redeploy.

With no key, the chat still answers basics from the on-page guides.

## Structure

```
api/chat.js              streaming serverless proxy (Gemini -> Groq)
src/App.jsx              routing, global state, dialogs
src/pages/               Home, Learn, Wines, Pair, Tools, Cellar
src/components/          Header, Chat, Palette, Settings, WineSheet, Compare, WineCard, GlassLab, ui
src/lib/                 router, settings, chat client, markdown, offline answers, storage, speech
src/data.js              all wine content, taste profiles, colors, serving data
```

Taste profiles and colors are typical-style generalizations for learning, not lab measurements.

Never commit `.env.local`. If a key was ever exposed, revoke it and create a new one.
