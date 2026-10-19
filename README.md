<img src="assets/icon.svg" width="64" height="64" alt="">

# artcraft-landing-page

Created in [T3 Code](https://t3.codes).

A frontend clone of the [ArtCraft](https://getartcraft.com) landing page, built to
showcase responsive layout and modern UI construction. `AGENTS.md` says how the
project is built; `docs/agents/reference-notes.md` is the transcription of the
original that the clone is measured against.

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
theme work. The three viewport projects — `mobile`, `tablet` and `desktop` — carry
the rest of the specs and are run by `npm run test:e2e`; the visual project is run
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
