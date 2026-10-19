<img src="assets/icon.svg" width="64" height="64" alt="">

# artcraft-landing-page

Created in [T3 Code](https://t3.codes).

A frontend clone of the [ArtCraft](https://getartcraft.com) landing page, built to
showcase responsive layout and modern UI construction. `AGENTS.md` says how the
project is built; `docs/agents/reference-notes.md` is the transcription of the
original that the clone is measured against.

## Running it

```sh
npm install
npm run dev        # http://localhost:3000
```

The production path:

```sh
npm run build
npm run start      # serves the build that `npm run build` produced
```

The dev server takes a port of its own — `npm run dev -- -p 3211` — and the
Playwright config reads `PORT` from the environment, so two worktrees can run their
suites at the same time without one of them taking the other's server.

## The checks

```sh
npm run check
```

`check` is the whole bar: the typecheck, the lint, the production build, the
Playwright suite at three widths, and the visual regression suite.

| Command | What it does |
| --- | --- |
| `npm run typecheck` | `tsc --noEmit`, in strict mode |
| `npm run lint` | ESLint |
| `npm run build` | the production build |
| `npm run test:e2e` | the Playwright specs, at 390, 768 and 1440 |
| `npm run test:visual` | the visual regression suite, and its six baselines |

## The structure

```
src/app/            the page: its layout, its composition, and the token layer
src/components/     one component per section, and the primitives they share
src/data/site.ts    the content module — every word of copy on the page
src/lib/            the choreography, the theme, and the navigation helpers
public/             the vendored fonts, videos, images and logo
tests/e2e/          the Playwright specs
docs/reference/     the capture of the original site
docs/adr/           the decisions, and why they were made
```

`GLOSSARY.md` names the project's own vocabulary — the Frame, the Section Bar, the
HUD Label, the Wordmark, the Media Well — and `AGENTS.md` says how a ticket is worked.
The working notes are in `docs/agents/`.

## The reference material

`docs/reference/` is the original site, captured: screenshots of the live page at
three widths in both themes, the original's rendered HTML, and its compiled
stylesheet. It is somebody else's work, kept as a measurement target — the thing the
clone is compared against — and not as code the project ships.
[`docs/reference/README.md`](docs/reference/README.md) says what is in it.

## The vendored media

Everything under `public/` — the four typefaces, the seven demo videos, the three
community film posters, the logo, and the Orbit's still frames — belongs to
[ArtCraft](https://getartcraft.com), not to this project.

It is **demonstration content for a local clone**. It is here so the page renders
identically offline, and so the clone can be diffed against the original; it is
**not something the project ships**.

Every vendored asset is recorded, with the URL it came from and its role on the
page, in [`public/media-manifest.json`](public/media-manifest.json). The decision
to vendor the media rather than hotlink it is recorded in
[ADR-0002](docs/adr/0002-vendor-original-media-and-copy.md).

## The accessibility

The page is checked the way a visitor meets it: through the rendered page, at a
given width, in a given theme.

- The **skip link** is the first thing a keyboard reaches. It is out of the way
  until it takes focus, and activating it moves the focus to the main content.
- The page exposes **landmarks**: a banner, a main, a contentinfo, and the four
  named navigation groups in the footer.
- The **heading outline** is one `h1` — the hero's — then the four section
  headlines as `h2`, then the card titles as `h3`, in document order.
- Every interactive element shows the **focus ring** the token layer declares.
- The **decorative** parts — the Orbit, the Ticks, the duplicated Marquee track —
  are hidden from assistive technology.
- The **text inks** meet AA in both themes. The faint ink cannot (2.72:1 on the
  light background), so the page paints its text in the muted ink instead; the
  decision is in
  [ADR-0007](docs/adr/0007-paint-the-text-in-the-muted-ink.md).
- An **automated scan** with axe finds no serious or critical violations.

The specs live in [`tests/e2e/accessibility.spec.ts`](tests/e2e/accessibility.spec.ts).

## The visual regression suite

The clone is only a clone as long as it still looks like the page it was made from.
`npm run test:visual` captures the whole landing page at three widths — 390, 768 and
1440 — in both the light and the dark theme, and compares each capture against a
committed **Baseline**.

```sh
npm run test:visual    # the six captures, compared against the baselines
npm run check          # typecheck, lint, build, the whole suite, and the captures
```

The baselines live in [`tests/e2e/visual.spec.ts-snapshots/`](tests/e2e/visual.spec.ts-snapshots/)
and are part of the repository. A capture that differs from its baseline fails the
test and leaves a difference image beside it, for a human to look at and accept or
reject.

The suite has a Playwright project of its own, because it does its own viewport and
theme work. The three viewport projects — `mobile`, `tablet` and `desktop` — carry the
rest of the specs and are run by `npm run test:e2e`; the visual project is run
by `npm run test:visual`. `npm run check` runs both.

**A baseline is only ever rewritten deliberately.** `npm run test:visual` does not
pass `--update-snapshots`, so a failing capture is reported and the stored baseline is
left exactly where it was. Rewriting one is a separate, explicit act:

```sh
npx playwright test tests/e2e/visual.spec.ts --project=visual --update-snapshots
```

The capture is taken on the Reduced Path, where nothing moves: the Reveals are in
their final state, the Marquee and the Orbit have stopped, and the demo videos are
frozen on one fixed frame. The decision, and what it costs, is recorded in
[ADR-0006](docs/adr/0006-capture-the-page-on-the-reduced-path.md).
