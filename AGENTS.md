# AGENTS.md

## Project
Single-page React + Vite + TypeScript site for **Maghreb Graphic**, a printing company in Casablanca.

## Commands
- **Dev server**: `npm run dev` (port 3000) or run `start.bat` (does a clean `npm install` first)
- **Typecheck**: `npx tsc --noEmit`
- **Lint**: `npm run lint`
- **Build**: `npm run build` (tsc then vite build, outputs to `dist/` with `base: './'`)

## Architecture
- Entry: `src/main.tsx` → `BrowserRouter` → `App.tsx` → `Home.tsx`
- Page: `src/pages/Home.tsx` — single page composing sections in order
- Sections: `src/sections/Header.tsx`, `HeroSlider.tsx`, `Testimonials.tsx` (À Propos), `TopSelling.tsx` (Notre Catalogue), `Footer.tsx`
- Data: `src/data/products.ts` (product list), `src/data/whatsapp.ts` (phone number)
- UI components from shadcn/ui live in `src/components/ui/`

## Key conventions
- **`@/` alias** → `./src` (configured in both `vite.config.ts` and `tsconfig.app.json`)
- **`verbatimModuleSyntax: true`** — use `import type` for type-only imports
- **`noUnusedLocals` / `noUnusedParameters`** enabled — remove dead code or the build fails
- Styles: **Tailwind CSS** with custom `primary` (#dc2626 red), `card-shadow`, `btn-primary`, `btn-outline`, `container-main`, `section-label` in `src/index.css`
- Animations: **GSAP** + ScrollTrigger used in section components — always use `gsap.context()` with `ctx.revert()` in the cleanup

## Navigation
All nav links use smooth-scroll to section `id`s on the same page (no multi-route SPA):
- `#top` → Accueil, `#a-propos` → À Propos, `#catalogue` → Notre Catalogue, `#contact` → Footer

## Public assets
- `public/logo2.png` — Header logo
- `public/logo.png` — Footer logo
- `public/maghrib.mp4` — Hero background video
- `public/assets/` — product images (matched by product name, e.g. `Oneway Vision.png`)

## Product images
Images in `public/assets/` auto-match to product names via `src/sections/TopSelling.tsx`. Drop a `.png/.jpg/.webp` file named after the product and it loads automatically. No code changes needed.
