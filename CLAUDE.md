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

Three tokens in `:root` drive every section's geometry: `--gutter` (fluid 20→40px), `--section-y` (fluid 64→128px) and `--measure` (64rem content column). The utilities that consume them:

- **`section-page`** goes on the `<section>`, so a full-bleed background still spans the viewport. Sections are **content-height** — `--page-min-h` is `auto`. Uniformity comes from the shared `--section-y` band and `--measure` column, not from a forced height. Exactly two sections override the token with `[--page-min-h:100svh]`, and neither is a style choice: the **hero**, which needs the runway for its scroll indicator and exit parallax, and **Contact**, for the structural reason below. Don't hand it to a third (see the scrolling note below for why full-viewport sections were a snapping idiom).
- **The last section must not be shorter than the viewport.** Nothing scrolls in behind it, so the document ends where it ends: at content height Contact was 653px in an 861px viewport, which put its top 208px past the page's maximum scroll offset. It was literally unreachable — the page bottomed out with the tail of Projects (the "View all on GitHub" button) still jammed under the navbar and the card sitting low and off-centre. `[--page-min-h:100svh]` closes the gap exactly, and `section-page`'s `justify-content: center` then centres the card in it. `min-height` only ever grows a section, so where the content is already taller than the screen this is inert — and that's precisely the case where the shortfall can't occur anyway. Anything appended after Contact (a footer) inherits this constraint.
- **`section-y`** is the vertical-rhythm primitive on its own — use it for something that deliberately *isn't* a page, like `TechMarquee`. Scale it locally with `[--section-y:…]` rather than hardcoding padding.
- **`section-shell`** goes on the div inside it — and on the Navbar's inner div, so the brand sits on the same left edge as section content at every width. Gutters sit *outside* `--measure`, so the content column is exactly 64rem once there's room.
- **`section-tint`** is the surface band: a `--surface` fill that fades to transparent at both ends. Use it instead of `bg-surface` on a section. A flat fill draws a hard horizontal line against the transparent sections either side, and since there's no snapping you rest on those boundaries constantly.
- **`bleed-x`** cancels the shell's gutter for edge-to-edge rows, then re-pads its own contents.

Never reintroduce a hardcoded `py-32 px-6` + `max-w-5xl` on a section: that was the bug where each section scaled differently across screen sizes. Override per-section with `[--measure:48rem]` rather than a different container class.

Hero uses **`min-h-svh`, not `min-h-screen`** — `100vh` on mobile is the tall viewport (URL bar collapsed), so the hero overflowed on load and changed height mid-scroll.

### Scrolling — free, and kept coherent by motion rather than by snapping

**There is no `scroll-snap-type`, and it should not come back.** It was there (mandatory) to stop a short flick parking the page half on one section and half on the next, but buying that meant capturing every wheel tick and trackpad gesture, and the resistance was worse than the problem it solved. `scroll-snap-align`/`scroll-snap-stop`/`snap-end` are all gone with it, and so is the forced `100svh` section height, which only worked *because* snapping never let you rest between two centered sections — free-scrolling, it was 400–700px of void per boundary.

What guarantees a composed frame now is that sections are driven *continuously* by scroll position, so there is no longer a wrong place to stop:

- **`useSectionScroll(ref)`** (`src/hooks/use-section-scroll.js`) — every non-hero section puts a ref on its `<section>` and spends the returned `y`/`scale` on a `motion.div` wrapping its `section-shell`. Its offset is `["start end", "start center"]`, which is height-independent on purpose: the 5-viewport Projects section and a 1-viewport section enter over the same *physical distance*. `["start end", "end start"]` would make tall sections crawl.
- **Entry only.** Fading or shrinking a section while it's still being read is hostile. The hero is the sole exception — it blurs and recedes on the way out, because scrolling past it proves you're done.
- **Spatial vs temporal split.** The section scrub owns `y`/`scale`; the `ScrollReveal`s inside own `opacity` and stagger. Keep it that way — it's what stops two systems writing one property.
- `scroll-smooth` is still deliberately off on `html`; only `src/lib/scroll.js` asks for smooth behavior, and only for programmatic jumps.

`useScrollSpy` is independent of all this and needs no changes.

### Animation (Framer Motion)

Package is **`motion`**, imported from **`motion/react`** (`framer-motion` is the legacy alias — don't install both).

- **`src/lib/motion.js` holds every shared token** — `EASE`, `DUR`, `SPRING`, `fadeUp`/`fadeIn`/`scaleIn`/`popIn`, `staggerContainer()`, `VIEWPORT`. Pull from here rather than inlining values, or the page stops feeling cohesive. `EASE` deliberately matches the CSS `cubic-bezier(0.16, 1, 0.3, 1)` the design already used.
- **Reduced motion** is handled at two layers: `<MotionConfig reducedMotion="user">` in `App.jsx` covers all `variants`/`animate`/`layout`. It does *not* cover scroll-linked `useTransform`, infinite loops, or interval-driven text — those call `useReducedMotion()` and hard-disable (see `HeroSection`, `StarBackground`).
- **`ScrollReveal`** is a Motion-backed shim with the original prop surface (`delay` still in **milliseconds**). Fine for prose and eyebrow labels. For grids, prefer `staggerContainer` + `variants` on the parent so the motion component *is* the card — no wrapper div, real stagger.
- **`RevealText`** is for section `<h2>`s: it word-splits its string and slides each word up from behind an `overflow-hidden` mask. It takes a **plain string only** — no element children, since it splits on spaces. That's why the hero `<h1>` doesn't use it (it has a `<br>` and a nested coloured span).
- **Never let CSS and Motion write the same property.** Motion writes inline `transform`/`opacity`, which beats every class. When making an element a motion component, strip its `opacity-0`, `animate-[…]`, `translate-*`, `scale-*` classes. Express hover lifts as `whileHover={{ y: -4 }}`, not `hover:-translate-y-1`.
- **Animated border radius must be an inline style** (`style={{ borderRadius: 16 }}`), not `rounded-2xl` — Motion can only counter-distort a radius it owns.
- Desktop-only effects (hero parallax, orb drift) gate on `useIsDesktop()`: iOS resizes the viewport mid-scroll, which makes `useScroll` jump.
- **Motion can't interpolate `hsl(var(--token))`** — it can't parse the value, so the animation snaps instead of transitioning. To animate between two themed colors, stack two elements and animate the top one's *opacity*, letting classes supply the colors. `Timeline`'s dots do this.
- **`src/components/Ambient.jsx`** owns the page's *ambient* motion, in two pieces used by About and Contact. **`AmbientOrbs`** is the slow drifting-wash layer. Callers pass positions/colors/durations; the drift itself lives in the component so the two sections can't diverge. Durations must stay **non-harmonic** (About 23/29/37, Contact 19/25/31) or the orbs re-sync into one visible pulse, and only `transform`/`opacity` may animate — these are 400–600px `blur-3xl` surfaces and anything that repaints them is the most expensive thing on the page. Same `useIsDesktop()` gate as everything else; off, they render but hold still. The host `<section>` needs `relative isolate` — `section-tint` paints a real background on that element, and without a stacking context the `-z-10` orb layer disappears behind it. The overflow clip lives *inside* `AmbientOrbs`, never on the section: an `overflow: hidden` ancestor would make About's sticky column a scroll container and kill the stick.
- **`fadeEdges` is mandatory on a full-bleed band**, and off by default for panels. That clip is a *hard* clip: About's washes are 640–780px and positioned to overhang the section (`-top-32`, `-bottom-32`), so without a mask it shears the blur flat and draws a hard horizontal line at the section boundary — the exact seam `section-tint` exists to prevent, visible at both the hero/about and about/skills edges. `fadeEdges` masks the layer over the same 12%/88% stops `section-tint` uses, so the wash and the surface band arrive and leave together; keep the two in step if either changes. `AmbientSheen` takes the same prop for the same reason — `inset-y-0` makes it exactly section-tall, so its ends land on the seam too. Contact passes neither: its aurora is inside a rounded card, where the panel edge is the point.
- **`AmbientSheen`** is the other half: one wide low-alpha highlight that crosses its container and leaves. The orbs are *felt* — 100px over half a minute is below the threshold at which you'd catch them moving — so this is the part with a legible edge, and the only directional motion on the page. `linear` is deliberate: an ease that decelerates into the edge makes the edge the subject. One per section, max — two crossing bands read as a loading skeleton. It renders nothing at all when motion is off, since a sheen that doesn't move is just a bright smear.
- **A band needs more than a panel.** Contact's aurora is concentrated inside a 64rem card; About's is spread across a full-bleed section, so the same opacities that work there are invisible here. About's washes are correspondingly bigger, brighter and faster, and positioned in percentages rather than pinned to the section's edges — pinned, they sat in the peripheral dead zone on an ultrawide, far from the content column.

### About — sticky column + scroll-drawn rail

`AboutSection` is the one section whose two columns move at different speeds: the left (heading, bio, buttons) is `lg:sticky lg:top-[calc(var(--nav-h)+3rem)]` and pins while `Timeline` scrolls past it. Three things keep that working:

- **No `items-start` on the grid.** It collapses each column to its content height, which leaves the sticky column no track to slide along. The stick is scoped with `lg:self-start` on the column itself instead.
- **`section-shell`'s Motion transform is `none` at rest** — verified, not assumed. A transformed ancestor would become the sticky containing block. `useSectionScroll` only writes a transform during entry, and it's settled before the sticky region matters, so `{ y, scale }` can stay on `section-shell` here like every other section.
- **`--nav-h`, not a magic number**, for the sticky offset — the navbar height is a token.

`Timeline` (`src/components/Timeline.jsx`) groups `experience.json` on its `kind` field, one rail per group so the fill restarts at each label rather than running through it. The rail is two absolutely-positioned lines sharing a `RAIL_INSET` constant: a `bg-border` track and a `bg-primary` fill whose `scaleY` is scroll-driven. It gates on `!useReducedMotion() && useIsDesktop()` itself and falls back to a **constant `1`** — off means "already drawn", never "invisible".

`usePointerSpotlight` (`src/hooks/use-pointer-spotlight.js`) is the cursor glow on timeline cards. Position lives in **motion values, never React state** — state would re-render every card on every mousemove. Gated on `useHasFinePointer()` (no cursor to follow on touch). Note the gradient syntax is `circle <len> at`, not `<len> circle at`; Chrome tolerates the latter, other engines drop it.

### Data layer

All content lives in `src/data/` — **no content belongs in component files**.

All of it is hand-edited — there is no CMS and no import step.

| File | Contents |
|---|---|
| `skills.json` | `groups[{id,label,items[]}]` — 4 groups, `items` are plain strings |
| `experience.json` | `items[{id,kind,role,company,location,startDate,endDate,current,description,logo}]` |
| `projects.json` | `projects[{slug,repo,githubId,title,summary,image,tags,demoUrl,order}]` — enrichment only, **not** the list of what renders |
| `about.json` | `lead[{text,emphasis?}]` — segments, so the styled spans survive — plus `paragraphs[]` |
| `nav.js`, `profile.js` | nav items, contact links |

- `src/data/images.js` maps an image *filename* to its bundled URL via `import.meta.glob` — that's why `projects.json` stores `"website.png"` rather than an import. Unknown filename → `null` → `<Monogram>` placeholder.
- Dates are `"YYYY-MM"` or `"YYYY"`; `formatRange()` in `src/lib/format.js` renders them and returns `null` when there's no start date, so undated entries simply show no range.
- `about.json`'s lead carries a `{years}` placeholder, filled by `yearsSince()` from the earliest `kind !== "education"` start date in `experience.json`. Don't write the number down — the hardcoded "3 years" it replaced went stale every July.
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
