# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Commands

```bash
npm run dev        # start dev server (check terminal output for port — 5173 may be taken, falls back to 5174+)
npm run build      # production build (use this to verify no errors before reporting done)
npm run lint       # ESLint
npm run preview    # preview the production build locally
```

There are no tests. Always run `npm run build` after changes to confirm a clean compile.

## Architecture

React 19 + Vite 7 + Tailwind CSS v4. Deployed to Vercel at `jeffrey-vincent-portfolio.vercel.app`.

**Tailwind v4 specifics:**
- Config is entirely in `src/index.css` via `@theme`, `@layer base`, and `@utility` — `tailwind.config.js` is a legacy stub and can be ignored.
- Dark mode is class-based via `@custom-variant dark (&:where(.dark, .dark *))`. The `.dark` class is toggled on `<html>` by `ThemeToggle.jsx`. Dark mode default is set there — check `localStorage.getItem("theme")` logic.
- Custom color tokens (`--color-background`, `--color-surface`, `--color-foreground`, `--color-muted`, `--color-primary`, `--color-card`, `--color-border`) are defined in `@theme` and consumed as Tailwind utilities (`bg-background`, `text-muted`, etc.).
- Custom utilities (`apple-btn-primary`, `apple-btn-secondary`, `reveal`, `reveal-visible`) are defined with `@utility` in `index.css`.

**Path alias:** `@/` maps to `src/` (configured in `vite.config.js`).

**Scroll animations:** Wrap any element in `<ScrollReveal delay={ms}>` (from `src/components/ScrollReveal.jsx`). It uses `IntersectionObserver` to add the `reveal-visible` class once the element enters the viewport, triggering a CSS fade-up transition. The animation fires once and does not repeat.

**Theme toggle:** `ThemeToggle` is rendered inside `Navbar` (not as a standalone floating button). It persists preference to `localStorage`.

**Content to update:** All personal content (bio text, experience cards, skills, projects) lives directly in the component files — there is no CMS or data layer. Skills are in `SkillsSection.jsx`, projects in `ProjectsSection.jsx`, experience in `AboutSection.jsx`.

**Static assets:** Images in `src/assets/` are bundled by Vite. Files in `public/` (resume PDF, logo images referenced by `src` string like `"ally.png"`) are served as-is.
