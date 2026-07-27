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
- Custom utilities: `apple-btn`, `apple-btn-primary`, `apple-btn-secondary`, and the page shell below.

### Page shell — don't size sections by hand

Three tokens in `:root` drive every section's geometry: `--gutter` (fluid 20→40px), `--section-y` (fluid 64→128px) and `--measure` (64rem content column). Two utilities consume them:

- **`section-y`** goes on the `<section>`, so a full-bleed background still spans the viewport.
- **`section-shell`** goes on the div inside it — and on the Navbar's inner div, so the brand sits on the same left edge as section content at every width. Gutters sit *outside* `--measure`, so the content column is exactly 64rem once there's room.
- **`bleed-x`** cancels the shell's gutter for edge-to-edge rows, then re-pads its own contents.

Never reintroduce a hardcoded `py-32 px-6` + `max-w-5xl` on a section: that was the bug where each section scaled differently across screen sizes. Override per-section with `[--measure:48rem]` rather than a different container class.

Hero uses **`min-h-svh`, not `min-h-screen`** — `100vh` on mobile is the tall viewport (URL bar collapsed), so the hero overflowed on load and changed height mid-scroll.

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
| `projects.json` | `projects[{slug,repo,githubId,title,summary,image,tags,demoUrl,order}]` — enrichment only, **not** the list of what renders |
| `nav.js`, `profile.js` | nav items, contact links |

- `src/data/images.js` maps an image *filename* to its bundled URL via `import.meta.glob` — that's why `projects.json` stores `"website.png"` rather than an import. Unknown filename → `null` → `<Monogram>` placeholder.
- Dates are `"YYYY-MM"` or `"YYYY"`; `formatRange()` in `src/lib/format.js` renders them and returns `null` when there's no start date, so undated entries simply show no range.
- `demoUrl: null` means "no demo" — the old `"#"` sentinel is gone.

### GitHub integration

`api/github.js` is a Vercel serverless function (root `api/` — zero config) that fetches public repos and CDN-caches them (`s-maxage=3600, stale-while-revalidate=86400`).

- **`GITHUB_TOKEN` is required in production.** Unauthenticated GitHub is 60 req/hr *per IP*, and Vercel's egress IP is shared with other tenants. Use a fine-grained PAT with Public Repositories read-only. See `.env.example`. Never `VITE_`-prefix it.
- `vite dev` doesn't serve `api/` — the `devApi()` plugin in `vite.config.js` mounts the same handler as middleware. The handler uses the raw Node response API so it runs unmodified in both places.
- **GitHub is the list; `projects.json` only enriches it.** `src/lib/merge-projects.js` returns one flat array of *every* public repo — archived repos and the `owner/owner` profile-README repo excluded, forks/private already dropped in `api/github.js`. A curated entry supplies a screenshot, hand-written summary, nicer title and tags for the repo it points at; repos with no entry get a card built from their GitHub description, topics and language, with `humanizeRepoName()` turning `pain-point-ai-backend` into "Pain Point AI Backend".
- Matching prefers `githubId` (survives repo renames), falls back to `repo`. Curated entries GitHub didn't return still render as `orphaned`. If the API is down entirely, the curated entries render alone — the section is never blank.
- **Card covers live in the repos, not here.** Commit an image to `.github/preview.png` (or `.webp`/`.jpg`) in any repo and it becomes that card's cover on the next cache refresh — no change to this codebase. `api/github.js` probes `raw.githubusercontent.com/{repo}/HEAD/...` with `HEAD` requests; the `HEAD` ref means it works regardless of the default branch name. Those probes hit a plain CDN, so they **don't** count against the API rate limit, and all repos are probed concurrently under a 4s whole-phase budget that degrades to "no covers" rather than failing the response. A repo cover outranks a bundled `projects.json` image; `ProjectCard` tracks the failed *url* so a cover deleted inside the cache window falls back to `<Monogram>` instead of a broken icon.
- **Ordering:** the `portfolio-featured` topic pins a repo to the front, then most-recently-pushed first. Dateless orphans sink to the bottom on their curated `order`. The single freshest card gets `latest: true` and shows a "Latest" badge.
- **There is no tag filter.** The chip row and the palette's "Filter" group were removed — the section lists everything. `collectTags` and the shared `filter` state went with them.
- Run `vercel dev` once before deploying; `vite build` gives *zero* syntax checking on `api/`.

**Note on LinkedIn:** there is no live LinkedIn API for skills or positions — the official API exposes only name, photo, email and locale, and scraping violates their User Agreement. Skills and experience are therefore maintained by hand in the JSON files above.

### Command palette

⌘K / Ctrl+K / `/`. `cmdk` + Radix Dialog, **lazy-loaded** (`CommandPaletteHost`) so it stays out of the initial chunk. Focus trap, Esc, arrow keys, focus restore and ARIA all come from the library — don't reimplement them.

The palette's Projects group is built from the same `mergeProjects()` list the grid uses, so every repo is reachable from it. `useGitHubRepos()` is served from its sessionStorage cache there, so opening the palette costs no extra fetch.

Cross-component state (theme, section navigation, palette visibility) lives in `src/context/PortfolioUI.jsx`. The hook and constants are in `src/context/portfolio-ui.js` — kept separate so the provider file exports only components, which React Fast Refresh requires.

The single scroll-spy `IntersectionObserver` lives in that provider, so adding consumers never adds observers. Anything that scrolls programmatically must go through `goToSection()`, which locks the observer during the scroll — otherwise the active-link indicator strobes through every section on the way.

### Deployment

`vercel.json` rewrites everything to `index.html` **except `/api/`** — if that exclusion is lost, the serverless function starts returning HTML.

## Gotchas

- ESLint has no `eslint-plugin-react`, so `no-unused-vars` can't see JSX usage; it relies on `varsIgnorePattern: '^[A-Z_]|^motion$'`. A new lowercase JSX namespace import would need adding there.
- `api/**`, `scripts/**` and `vite.config.js` get Node globals via a second ESLint config block.
- `Home.jsx` uses `overflow-x-clip`, not `overflow-x-hidden` — the latter silently creates a scroll container and breaks `position: sticky` and `useScroll`.
- Project screenshots are resized to 800px wide. Anything larger is wasted bytes; cards display at ~325px CSS (650px at 2x).
