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
