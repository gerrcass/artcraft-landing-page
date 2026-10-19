# Reference Pack

The original ArtCraft landing page, captured. This is what the clone is measured against.

Everything here is a **capture of someone else's work**, kept as a measurement target and a
source of truth for measurements. It is reference material, not project code.

## Screenshots

`docs/reference/screenshots/` — full-page and section captures of the live site, in WebP.

| File | What it shows |
| --- | --- |
| `hero-light-1440.webp` | The hero in the light theme: the Wordmark over the Orbit, both calls to action, the HUD Label row |
| `hero-dark-1440.webp` | The same hero in the dark theme — note that the Orbit's arcs carry colour in dark and read as grey in light |
| `features-light-1440.webp` | The Features Section Bar and the first two Feature Cards, with their Media Wells |
| `features-dark-1440.webp` | The Features grid in the dark theme |
| `ownership-light-1440.webp` | The Ownership section: headline plus the three lettered Ownership Cards |
| `proof-light-1440.webp` | The Proof section: headline plus the three Film Tiles and their play affordances |
| `page-desktop-1440.webp` | The whole page at 1440, light |
| `page-tablet-768.webp` | The whole page at 768 |
| `page-mobile-390.webp` | The whole page at 390 — the layout collapsed to one column |
| `page-dark-1440.webp` | The whole page at 1440, dark |
| `page-dark-mobile-390.webp` | The whole page at 390, dark |

The whole-page captures of the Features section are mostly empty: that section is
**Choreography**, so its content only exists while the page is scrolled. Use the
section captures for the Features grid, and the whole-page captures for page rhythm.

## Source

`docs/reference/source/` — the original site's rendered HTML and its compiled stylesheet.

- `original-index.html` — the server-rendered page. Read it when you need the original's exact
  element structure, class names, or copy. The hero, each section, and the footer are all
  present, in order, with their accessibility attributes intact.
- `original-styles.css` — the compiled Tailwind v4 stylesheet. The token values live in its
  `:root` and `[data-theme=dark]` blocks, and the typefaces are declared in its `@font-face`
  rules.

Both files are the original's, not ours. The token values transcribed from them are
**duplicated in the spec** — treat the spec as authoritative for our implementation and
these as the origin of those numbers.

## The finding that changed the design

The original's Orbit is **not** CSS and not SVG. It is a WebGL canvas:

```html
<canvas data-engine="three.js r184" width="1440" height="852"></canvas>
```

The Orbit is therefore a rendered scene — concentric rings with tick marks, a few heavy
partial arcs, and rounded photo tiles floating at varying depths, some of them blurred.
Reproducing it means reproducing a *scene*, not a decoration.

The spec and ADR-0004 record the decision on how we reproduce it.
