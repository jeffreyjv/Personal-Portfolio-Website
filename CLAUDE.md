# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Commands

```bash
npm run dev       # dev server (5173, falls back to 5174+ if taken)
npm run build     # production build — use this to verify before reporting done
npm run lint      # ESLint
npm run preview   # preview the production build
```

There are no tests. Always run `npm run build && npm run lint` after changes.

## Architecture

React 19 + Vite 7 + Tailwind CSS v4 + Framer Motion. Deployed to Vercel at `jeffrey-vincent-portfolio.vercel.app`.

**Path alias:** `@/` → `src/`.

### Tailwind v4

- All config is in `src/index.css` via `@theme`, `@layer base`, `@utility`. There is no `tailwind.config.js` — v4 is CSS-first.
- Dark mode is class-based (`@custom-variant dark`). **Dark is the default.** The `.dark` class is applied by a blocking script in `index.html` *before first paint* — do not move theme detection into an effect, that reintroduces the light-mode flash.
- Color tokens: `--color-background`, `--color-surface`, `--color-foreground`, `--color-muted`, `--color-primary`, `--color-card`, `--color-border`, consumed as `bg-background`, `text-muted`, etc.
- Custom utilities: `apple-btn`, `apple-btn-primary`, `apple-btn-secondary`.

### Animation (Framer Motion)

Package is **`motion`**, imported from **`motion/react`** (`framer-motion` is the legacy alias — don't install both).

- **`src/lib/motion.js` holds every shared token** — `EASE`, `DUR`, `SPRING`, `fadeUp`/`fadeIn`/`scaleIn`/`popIn`, `staggerContainer()`, `VIEWPORT`. Pull from here rather than inlining values, or the page stops feeling cohesive. `EASE` deliberately matches the CSS `cubic-bezier(0.16, 1, 0.3, 1)` the design already used.
- **Reduced motion** is handled at two layers: `<MotionConfig reducedMotion="user">` in `App.jsx` covers all `variants`/`animate`/`layout`. It does *not* cover scroll-linked `useTransform`, infinite loops, or interval-driven text — those call `useReducedMotion()` and hard-disable (see `HeroSection`, `StarBackground`).
- **`ScrollReveal`** is a Motion-backed shim with the original prop surface (`delay` still in **milliseconds**). Fine for prose and headings. For grids, prefer `staggerContainer` + `variants` on the parent so the motion component *is* the card — no wrapper div, real stagger.
- **Never let CSS and Motion write the same property.** Motion writes inline `transform`/`opacity`, which beats every class. When making an element a motion component, strip its `opacity-0`, `animate-[…]`, `translate-*`, `scale-*` classes. Express hover lifts as `whileHover={{ y: -4 }}`, not `hover:-translate-y-1`.
- **Animated border radius must be an inline style** (`style={{ borderRadius: 16 }}`), not `rounded-2xl` — Motion can only counter-distort a radius it owns.
- Desktop-only effects (hero parallax, orb drift) gate on `useIsDesktop()`: iOS resizes the viewport mid-scroll, which makes `useScroll` jump.

### Data layer

All content lives in `src/data/` — **no content belongs in component files**.

All of it is hand-edited — there is no CMS and no import step.

| File | Contents |
|---|---|
| `skills.json` | `groups[{id,label,items[]}]` — 4 groups, `items` are plain strings |
| `experience.json` | `items[{id,kind,role,company,location,startDate,endDate,current,description,logo}]` |
| `projects.json` | `projects[{slug,repo,githubId,title,summary,image,tags,demoUrl,order}]` |
| `nav.js`, `profile.js` | nav items, contact links |

- `src/data/images.js` maps an image *filename* to its bundled URL via `import.meta.glob` — that's why `projects.json` stores `"website.png"` rather than an import. Unknown filename → `null` → `<Monogram>` placeholder.
- Dates are `"YYYY-MM"` or `"YYYY"`; `formatRange()` in `src/lib/format.js` renders them and returns `null` when there's no start date, so undated entries simply show no range.
- `demoUrl: null` means "no demo" — the old `"#"` sentinel is gone.

### GitHub integration

`api/github.js` is a Vercel serverless function (root `api/` — zero config) that fetches public repos and CDN-caches them (`s-maxage=3600, stale-while-revalidate=86400`).

- **`GITHUB_TOKEN` is required in production.** Unauthenticated GitHub is 60 req/hr *per IP*, and Vercel's egress IP is shared with other tenants. Use a fine-grained PAT with Public Repositories read-only. See `.env.example`. Never `VITE_`-prefix it.
- `vite dev` doesn't serve `api/` — the `devApi()` plugin in `vite.config.js` mounts the same handler as middleware. The handler uses the raw Node response API so it runs unmodified in both places.
- **`projects.json` is the source of truth for what appears on the page; GitHub only decorates it.** `src/lib/merge-projects.js` matches on `githubId` first (survives repo renames), falls back to `repo`. If the API is down every card still renders with badges hidden. A curated repo that's been deleted gets `orphaned: true` and still renders.
- Mark a repo **featured** by adding the `portfolio-featured` topic on GitHub — it then ranks first in the "More on GitHub" row.
- Run `vercel dev` once before deploying; `vite build` gives *zero* syntax checking on `api/`.

**Note on LinkedIn:** there is no live LinkedIn API for skills or positions — the official API exposes only name, photo, email and locale, and scraping violates their User Agreement. Skills and experience are therefore maintained by hand in the JSON files above.

### Command palette

⌘K / Ctrl+K / `/`. `cmdk` + Radix Dialog, **lazy-loaded** (`CommandPaletteHost`) so it stays out of the initial chunk. Focus trap, Esc, arrow keys, focus restore and ARIA all come from the library — don't reimplement them.

Cross-component state (projects filter, theme, section navigation, palette visibility) lives in `src/context/PortfolioUI.jsx`. The hook and constants are in `src/context/portfolio-ui.js` — kept separate so the provider file exports only components, which React Fast Refresh requires.

The single scroll-spy `IntersectionObserver` lives in that provider, so adding consumers never adds observers. Anything that scrolls programmatically must go through `goToSection()`, which locks the observer during the scroll — otherwise the active-link indicator strobes through every section on the way.

### Deployment

`vercel.json` rewrites everything to `index.html` **except `/api/`** — if that exclusion is lost, the serverless function starts returning HTML.

## Gotchas

- ESLint has no `eslint-plugin-react`, so `no-unused-vars` can't see JSX usage; it relies on `varsIgnorePattern: '^[A-Z_]|^motion$'`. A new lowercase JSX namespace import would need adding there.
- `api/**`, `scripts/**` and `vite.config.js` get Node globals via a second ESLint config block.
- `Home.jsx` uses `overflow-x-clip`, not `overflow-x-hidden` — the latter silently creates a scroll container and breaks `position: sticky` and `useScroll`.
- Project screenshots are resized to 800px wide. Anything larger is wasted bytes; cards display at ~325px CSS (650px at 2x).
