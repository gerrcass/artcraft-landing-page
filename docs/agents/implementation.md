# Implementation guide

How to work in this repository. Read this, then `docs/agents/reference-notes.md` (the
transcription of the original site), then the ticket you are working on.

## The one seam

Everything is verified through the rendered page, at a given viewport width, theme, and
scroll position. A test asserts on what a visitor perceives — text, roles, visibility,
rendered appearance — and never on a component's internals.

## Project layout

```
package.json            scripts are the source of truth — read them, do not assume
src/app/layout.tsx      <html>, <body>, the theme script, the font variables
src/app/page.tsx        composition only: header, main, sections, footer
src/app/globals.css     the token layer — the only place a colour or font value lives
src/components/sections/ one component per page section
src/components/primitives/ shared primitives (Frame, SectionBar, buttons, …)
src/data/site.ts        the content module — all page copy lives here
src/lib/                choreography (the shared observer), theme helpers
public/                 vendored fonts, videos, images, the logo
tests/e2e/              Playwright specs
```

**One component per page section.** A section's implementation is readable in one file.
**Primitives are shared.** A primitive must not become section-specific; if it needs to be,
the section owns it.

## How a section joins the page

`src/app/page.tsx` composes the page and **nothing else**. It imports every section
component and mounts it, in this order: `SiteHeader`, then `<main>` holding `Hero`,
`Marquee`, `Features`, `Ownership`, `Proof`, `Start`, then `SiteFooter`.

Each section component file starts life as a **stub** — a component that renders nothing
(or, for the hero, just the headline, so the page always has its one `h1`). The ticket
that owns a section **replaces that stub with the real component**. It does not edit
`src/app/page.tsx` and does not add an import to it. That way two people can work on two
sections at the same time without touching the same file.

The same applies to `src/data/site.ts`: it is written once, up front, and read by
everybody. If a section needs copy that is not in it, say so rather than editing it —
the copy is the original's, and it is transcribed, not invented.

## Rules that are not negotiable

- **Tokens are the only place a value lives.** A colour, a typeface, or a measure is
  written once in `src/app/globals.css` and reached by name everywhere else. Both themes
  use the same token names.
- **Copy is data.** Page copy lives in `src/data/site.ts` and is read from there. A
  component carries no copy of its own — not a heading, not a label, not a placeholder.
- **No hard-coded colours or fonts in components.** Use the token utilities
  (`bg-bg`, `text-ink`, `border-line`, `font-display`, …) or `var(--token)`.
- **Secondary destinations are placeholders.** Links to pricing, download, the Craft Apps
  pages, tutorials, news, the FAQ, and the press kit point at the original site's real
  URLs. The clone does not implement those pages.
- **The original is the target.** The markup, class names, and copy in
  `docs/reference/source/original-index.html` are the ground truth. Do not paraphrase
  copy; reproduce it verbatim, including the em dash in
  "Real footage — captured in ArtCraft" and the middle dot in "macOS · Windows · Web".

## Where a section's anatomy is specified

`docs/agents/reference-notes.md` gives, for each section, the exact markup skeleton
(transcribed from the original) plus the copy. Transcribe from there rather than
inventing markup.

## Writing CSS

Tailwind v4 is in CSS-first mode: `@import "tailwindcss"` at the top of
`src/app/globals.css`, and the token layer in `@theme inline` blocks. Utilities come
from the token names, so `bg-bg` works because `--color-bg` exists.

- Prefer utilities in `className`. They need no extra CSS and cannot drift.
- When a component genuinely needs bespoke CSS (keyframes, a view timeline, a
  pseudo-element), put it in a CSS file **next to the component**
  (`src/components/sections/hero.css`) and import it from the component. Do not append
  ad-hoc rules to `globals.css` — that file is the token layer, and concurrent tickets
  will collide in it.
- Bespoke CSS still uses tokens: `var(--line)`, `var(--ink)`, never a literal colour.
- `src/app/globals.css` is the token layer. It already carries the theme blocks, the
  `@font-face` rules, the `@theme inline` mapping, the base layer, and the original's
  custom classes (`.hud-label`, `.tick`, `.marquee`, `.invert-block`, `.themed-logo`).
  Read it before you write; if you believe a rule belongs there, say so in your report
  rather than editing it.

## Motion

- Reveal is marked with `data-reveal`; groups with `data-reveal-group`; drawing
  decorations with `data-draw-rule`, `data-draw-tick`, `data-draw-eyebrow`. The
  behaviour lives in CSS and in the shared observer, never in props threaded through
  the tree.
- One `IntersectionObserver` is shared by the whole page. It is created once outside
  React render and torn down on unmount. It drives the Reveals (as the fallback for
  browsers without scroll-driven animations) and the Media Well video state.
- The reduced-motion path is the same content with the motion removed. Under
  `prefers-reduced-motion: reduce` nothing is left hidden, nothing moves on hover, the
  Marquee does not scroll, and the videos are present and playable but not scrubbed.

## Commands

Read them from `package.json`; the list below is the expected shape, not a substitute.

| Command | What it does |
| --- | --- |
| `npm run dev` | development server on <http://localhost:3000> |
| `npm run build` | production build |
| `npm run start` | serve the production build |
| `npm run typecheck` | `tsc --noEmit` in strict mode |
| `npm run lint` | ESLint, no errors |
| `npm run test:e2e` | Playwright specs (needs a build or a dev server; see `playwright.config.ts`) |
| `npm run test:visual` | the visual regression specs, baselines in `tests/e2e/visual.spec.ts-snapshots/` |
| `npm run check` | typecheck + lint + build + the whole test suite |

A ticket is done when the typecheck passes, the lint passes, the ticket's own tests
pass, and the ticket's acceptance criteria are each demonstrably met.

## Working a ticket

1. `gh issue view <n>` — read the ticket and its acceptance criteria.
2. Work on a branch off the integration branch `feature/artcraft-landing-clone`.
3. Write the test first, watch it fail, then make it pass.
4. `npm run check`.
5. Commit with a message that names what changed.
6. Merge the integration branch into your branch before reporting done, so the merge
   back is clean.
7. Comment on the ticket with what changed, then close it.
