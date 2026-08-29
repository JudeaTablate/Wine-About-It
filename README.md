# Wine About It — Wine 101

A modern, animated Wine 101 experience built with React, Vite and GSAP.

## Features

- Kinetic editorial hero with cursor-reactive depth and ambient motion
- Personal grape-vine logo mark (SVG, no image asset)
- Interactive A–Z wine directory with pronunciation and click-to-expand details
- A–Z wine terminology crash course
- Wine dos & don'ts
- Interactive glassware guide
- 5 S's tasting ritual
- CSS 3D Glass Lab: drag to rotate and scroll to fill the wine
- "Tell Me What I'm Drinking" AI assistant
- Optional wine-label image analysis through Gemini vision
- Food pairing explorer
- Wine world explorer
- Wine myths
- Wine personality quiz
- Responsive and reduced-motion friendly

## Run locally

```bash
npm install
npm start
```

## Production build

```bash
npm run build
npm run preview
```

## AI setup

The AI feature uses a Vercel Function at `/api/wine`. The Gemini key stays server-side and is read from `GEMINI_API_KEY`.

For local development, create `.env.local` in the project root:

```text
GEMINI_API_KEY=your_key_here
```

For Vercel, add `GEMINI_API_KEY` in Project Settings → Environment Variables, then redeploy. Do not commit `.env.local` or a real API key.

The label upload is resized in the browser before being sent to the function. The function sends text and, when supplied, the image to the Gemini Responses API.

- AI deep-dive responses with bottle-specific context, production, vintage/aging, serving, and discovery recommendations

## Latest visual update
- Education-first larger typography and improved reading rhythm
- Redesigned Wine Vibe panel with a structured editorial layout
- WebGL wine glass with continuous animated pouring stream, realistic transparent glass material, drag rotation, and smooth pour-level interpolation
