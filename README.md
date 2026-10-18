# Wine About It — Wine 101

Learn wine by playing with it: a WebGL glass, an A–Z directory you can search and save, a tasting ritual, food pairings (including adobo and sinigang), a wine finder, and **Sommy**, a free conversational AI sommelier.

Live: https://wine-about-it.vercel.app

## What's new in v2

| Area | Upgrade |
| --- | --- |
| AI chat | Real multi-turn chat with streaming, memory, follow-up chips, label photos, voice in/out, stop/retry/copy, saved history |
| Free AI | Gemini free tier with automatic model fallback, then Groq free tier; offline "sommelier-lite" if no key |
| Dev wow | Command palette (`/` or `Ctrl/⌘ K`), developer mode with live chat telemetry, dark mode, code-split Three.js, same API handler in dev and prod |
| Usability | Searchable, filterable directory, favorites, Wine Finder that explains each match, learned-words progress, tasting checklist, 12 pairings, 10 regions |
| Accessibility | Skip link, landmarks, ARIA tabs with arrow keys, 44px targets, 16px+ text, focus rings, reduced motion, keyboard-operable 3D glass, axe-core clean (WCAG 2.1 AA) |
| Visibility | Meta, Open Graph, Twitter cards, JSON-LD, sitemap, robots, manifest, og.png |
| Performance | GSAP removed; Three.js loads only when the Glass Lab nears the viewport and pauses off-screen |

## Run locally

```bash
npm install
cp .env.example .env.local   # then paste your free key(s)
npm run dev                  # http://localhost:5173 (chat works here too)
```

## Free AI setup (no credit card)

1. Create a key at https://aistudio.google.com/apikey
2. Put it in `.env.local` as `GEMINI_API_KEY=...`
3. Optional fallback: key from https://console.groq.com/keys as `GROQ_API_KEY=...`
4. On Vercel: Project → Settings → Environment Variables → add the same names → Redeploy.

Free tiers are rate-limited. The server allows 20 messages/minute per visitor and falls back across models and providers. With no key, the chat still answers basics from the on-page guides. Set `GEMINI_MODEL` to choose the first model to try.

## Structure

```
api/chat.js            streaming serverless proxy (Gemini -> Groq)
src/App.jsx            page composition + global state
src/components/        Chat, Palette, Directory, Finder, Learn, Explore, GlassLab, ...
src/lib/               chat client, tiny markdown renderer, offline answers, storage
src/data.js            all wine content
```

Never commit `.env.local`. If a key was ever exposed, revoke it and create a new one.
