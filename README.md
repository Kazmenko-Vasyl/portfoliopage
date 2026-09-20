# vasylkazmenko.com

Portfolio and services site — web design and development for businesses.

## Stack

React 18 + TypeScript, built with Vite. No UI framework and no runtime CSS
library: plain CSS files co-located with their components, custom properties
for the design tokens in `src/index.css`.

The hero runs a WebGL2 shader that reveals a field of falling code around the
cursor, with a graceful fallback to the backdrop image when WebGL2 is
unavailable or the visitor prefers reduced motion.

## Running it

```bash
npm install
npm run dev      # dev server
npm run build    # typecheck + production build to dist/
npm run preview  # serve the built output
npm run lint     # tsc --noEmit
```

## Deploying

Static output, so any static host works. For Cloudflare Pages:

| Setting | Value |
| --- | --- |
| Build command | `npm run build` |
| Output directory | `dist` |
| Node version | 18 or newer |

## Editing content

Nearly all copy, pricing and project data lives in [`src/data/site.ts`](src/data/site.ts) —
name, tagline, contact details, the three case studies, the pricing tiers and
the facts grid. Images are served from `public/`.
