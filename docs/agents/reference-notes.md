# Reference notes

A transcription of the original ArtCraft landing page, taken from
`docs/reference/source/original-index.html` and `docs/reference/source/original-styles.css`.
The reference pack is the measurement target; these notes are the working transcription of
it. Where the notes and the original disagree, the original wins — check it.

**The copy below is the original's copy, verbatim.** Reproduce it exactly. The content
module `src/data/site.ts` is the single source once it exists; these notes are how it
was transcribed.

---

## 1. Tokens

Transcribed from the original's `:root` and `:root[data-theme=dark]` blocks. Both themes
use the same token names; only the values change.

| Token | Light | Dark |
| --- | --- | --- |
| `--bg` | `#f2f1ee` | `#121316` |
| `--bg-raised` | `#faf9f7` | `#101014` |
| `--bg-sunken` | `#e9e8e4` | `#060607` |
| `--ink` | `#101014` | `#f2f1ee` |
| `--ink-strong` | `#000` | `#fff` |
| `--muted` | `#1010149e` | `#f2f1ee99` |
| `--line` | `#10101429` | `#f2f1ee26` |
| `--line-strong` | `#10101466` | `#f2f1ee66` |
| `--faint` | `#1010146b` | `#f2f1ee61` |
| `--accent` | `#2d81ff` | `#2d81ff` |
| `--accent-ink` | `#1659c4` | `#74aaff` |
| `--invert-bg` | `#101014` | `#fff` |
| `--invert-fg` | `#f2f1ee` | `#0b0b0c` |
| `--danger` | `#b3261e` | `#ff6259` |
| `--scanline` | `#10101408` | `#ffffff06` |

> **Two values differ from the spec issue (#1).** The spec lists light `--faint` as
> `#f2f1ee61` and dark `--invert-fg` as `#f2f1ee`. Both are the *other* theme's value in
> the original: light `--faint` is `#1010146b` (the original's) and dark `--invert-fg` is
> `#0b0b0c` (the original's). Taken literally, the spec's values render the faint ink
> invisible on the light background and the dark-theme primary button as white-on-white,
> which the spec's own contrast requirement (AA in both themes, issue #17) forbids. The
> original's values are used. Everything else in the spec's table matches the original
> exactly.

The original emits these as plain custom properties and maps them into Tailwind's colour
namespace, so the utility names are the token names: `bg-bg`, `bg-bg-raised`,
`bg-bg-sunken`, `text-ink`, `text-ink-strong`, `text-muted`, `text-faint`, `border-line`,
`border-line-strong`, `bg-accent`, `text-accent-ink`, `bg-invert-bg`, `text-invert-fg`.

## 2. Type

| Role | Family | Fallback | Weight | Notes |
| --- | --- | --- | --- | --- |
| Display (headings) | Archivo | `system-ui, sans-serif` | 620 | `font-stretch: 118%` |
| Wordmark | Archivo | `system-ui, sans-serif` | 750 | `font-stretch: 125%` |
| Body | Inter | `system-ui, sans-serif` | 400 | |
| HUD Label | Geist Mono | `ui-monospace, SFMono-Regular, Menlo, monospace` | 500 | 11px, uppercase, `letter-spacing: .15em` |
| Serif Accent | Instrument Serif (italic) | `Georgia, serif` | 400 | italic |

The four font files are variable fonts; the display face covers both its heading weight
and the heavier Wordmark weight from one file. The original's own `font-stretch` axis on
Archivo is `62% 125%` — keep that in the `@font-face` declaration.

### Type scale (from the original's classes)

| Element | Classes |
| --- | --- |
| Hero `h1` | `font-display text-3xl font-medium leading-[1.05] tracking-[-0.03em] text-ink-strong sm:text-4xl` |
| Section `h2` | `font-display text-4xl font-medium leading-[1.02] tracking-[-0.035em] text-ink-strong sm:text-5xl md:text-6xl` |
| Start `h2` | `font-display text-5xl font-medium leading-[0.98] tracking-[-0.04em] text-ink-strong sm:text-6xl md:text-7xl` |
| Card `h3` | `font-display text-2xl font-medium tracking-[-0.02em] text-ink-strong` |
| Body paragraph | `text-lg leading-relaxed text-muted` |
| Card paragraph | `leading-relaxed text-muted` |

The Wordmark's size is in container-query units against its own container:
`font-size: 17.8cqw; line-height: 1`, inside a `container-type: inline-size` wrapper.

## 3. The custom classes

The original has five hand-written classes, all reproduced here.

```css
.font-display { font-weight: 620; font-stretch: 118%; }
.hud-label { font-family: var(--font-mono); letter-spacing: .15em; text-transform: uppercase; font-size: .6875rem; font-weight: 500; }
.tick { pointer-events: none; width: 11px; height: 11px; position: absolute; }
.tick::before, .tick::after { content: ""; background: var(--line-strong); position: absolute; }
.tick::before { width: 1px; top: 0; bottom: 0; left: 5px; }
.tick::after { height: 1px; top: 5px; left: 0; right: 0; }
.tick-half::before { top: 5px; }         /* the half tick: only the lower arm */
.marquee { display: flex; overflow: hidden; }
.marquee-track { flex-shrink: 0; min-width: 100%; display: flex; animation: 36s linear infinite marquee-scroll; }
@keyframes marquee-scroll { to { transform: translate(-100%); } }
.invert-block { transition: background-color .12s linear, color .12s linear; }
.invert-block:hover, .invert-block[data-active="true"] { background: var(--invert-bg); color: var(--invert-fg); }
.themed-logo { filter: brightness(0); }
:root[data-theme="dark"] .themed-logo { filter: brightness(0) invert(); }
```

Base layer, also from the original:

```css
html { background: var(--bg); }
body { background: var(--bg); color: var(--ink); font-family: var(--font-body); -webkit-font-smoothing: antialiased; overflow-x: clip; }
::selection { background: var(--accent); color: #fff; }
:focus-visible { outline: 2px solid var(--accent-ink); outline-offset: 2px; }
```

## 4. Breakpoints

Tailwind's defaults, as used by the original: `sm` 40rem (640px), `md` 48rem (768px),
`lg` 64rem (1024px), `xl` 80rem (1280px).

- The primary navigation appears at `lg`; below it a menu button takes over.
- The Feature Card grid is one column, two from `md`.
- The Ownership and Film Tile grids are one column, three from `md` (the original uses
  `md:grid-cols-3`; the spec says the large breakpoint — follow the spec's wording but
  note the original's `md:`).
- The footer is one column, four across from `md`, and at `lg` a `2fr 1fr 1fr 1fr 1fr`
  track with the brand cell on the double-width track.

## 5. Section anatomy

### The Frame

Every numbered section sits inside it:

```html
<section id="features" data-choreo="true" class="relative">
  <span aria-hidden="true" data-draw-rule="true" class="absolute inset-x-0 top-0 h-px origin-left bg-line"></span>
  <div class="relative mx-auto max-w-[1280px] border-x border-line">
    <span aria-hidden="true" data-draw-tick="true" class="tick tick-half z-[31] -top-[5px] -left-[6px]"></span>
    <span aria-hidden="true" data-draw-tick="true" class="tick tick-half z-[31] -top-[5px] -right-[5px]"></span>
    <!-- the Section Bar, then the content -->
  </div>
</section>
```

### The Section Bar

```html
<div data-draw-eyebrow="true" class="sticky top-12 z-30 border-y border-line bg-bg/60 backdrop-blur-md">
  <div class="flex items-center justify-between gap-4 px-6 py-3 md:px-10">
    <p class="hud-label text-muted">
      <span class="text-faint">01</span>
      <span aria-hidden="true" class="mx-2 text-faint">/</span>Crafting features
    </p>
    <p class="hud-label hidden text-faint sm:block">Real footage — captured in ArtCraft</p>
  </div>
</div>
```

`top-12` pins it directly beneath the 48px header. The right-hand descriptor is hidden
below `sm`.

### The Hero

```html
<section id="hero" class="relative">
  <div class="relative flex min-h-[calc(100svh-3rem)] flex-col">
    <div aria-hidden="true" class="absolute inset-0"><!-- the Orbit --></div>
    <div class="pointer-events-none relative z-40 mx-auto flex w-full max-w-[1280px] flex-1 flex-col items-center justify-center px-6 py-10 md:px-10">
      <div data-reveal-group="true" class="relative flex w-full max-w-2xl flex-col items-center text-center">
        <!-- the Wordmark -->
        <h1 data-reveal="true" class="relative mt-8 font-display text-3xl font-medium leading-[1.05] tracking-[-0.03em] text-ink-strong sm:text-4xl">Capable tools <span class="font-serif italic font-normal text-muted">for artists.</span></h1>
        <p data-reveal="true" class="relative mt-4 max-w-md text-lg leading-relaxed text-muted">ArtCraft builds open source tools for artists. We pride ourselves on freedom of control and expression.</p>
        <div data-reveal="true" class="pointer-events-auto relative mt-7 flex flex-wrap items-center justify-center gap-3"><!-- the two calls to action --></div>
        <div data-reveal="true" class="pointer-events-auto relative mt-7 flex flex-wrap items-center justify-center gap-x-6 gap-y-2"><!-- the HUD Label row --></div>
      </div>
    </div>
  </div>
</section>
```

The Wordmark itself:

```html
<div class="pointer-events-none relative z-40 w-full" style="container-type:inline-size">
  <div role="img" aria-label="ARTCRAFT" class="relative whitespace-pre text-ink-strong"
       style="font-family:var(--font-archivo), system-ui, sans-serif;font-weight:750;font-stretch:125%;font-size:17.8cqw;line-height:1">
    <span aria-hidden="true" class="wm-letter inline-block text-center" style="padding-right:0.05em"><svg viewBox="0 0 116.34 97.5" fill="currentColor" aria-hidden="true" style="display:inline-block;width:0.8352615384615385em;height:0.7em;vertical-align:-0.006em"><path d="M104.28,49.49L81.55,0h-31.23l-3.17,4.76L14.75,53.63,0,75.85l21.55,21.55,63.79-36.94,16.99,37.04,14.01-21.74-12.06-26.27ZM32.89,65.66l32.42-48.87,10.91,23.77-43.32,25.09Z"/></svg></span>
    <span aria-hidden="true" class="wm-letter inline-block text-center">R</span>
    <!-- T, C, R, A, F, T, each its own span -->
  </div>
</div>
```

The leading A is the same mark as the vendored logo `/artcraft-icon.svg` (same viewBox
`0 0 116.34 97.5`, same path). The vendored file fills it blue; the Wordmark sets
`currentColor` so it takes `--ink-strong`.

### The Marquee

```html
<div class="marquee border-t border-line">
  <ul class="marquee-track items-center">
    <li class="hud-label flex items-center whitespace-nowrap px-6 py-3 text-muted"><span aria-hidden="true" class="mr-6 text-accent-ink">▪</span>Seedance 2.5</li>
    <!-- … -->
  </ul>
  <ul aria-hidden="true" class="marquee-track items-center"><!-- the duplicate --></ul>
</div>
```

### The Feature Card

```html
<article data-reveal="true" class="bg-bg">
  <div class="flex items-center justify-between gap-4 border-b border-line px-6 py-2.5 md:px-8">
    <p class="hud-label text-muted">Worlds</p>
    <p class="hud-label text-faint">01</p>
  </div>
  <div class="relative aspect-video w-full overflow-hidden bg-bg-sunken">
    <video src="/videos/features/WorldLabs_Demo_2.webm" class="absolute inset-0 h-full w-full object-cover" muted loop playsInline preload="none" aria-label="Image to Location demo"></video>
  </div>
  <div class="px-6 py-6 md:px-8">
    <h3 class="font-display text-2xl font-medium tracking-[-0.02em] text-ink-strong">Image to Location</h3>
    <p class="mt-2 max-w-xl leading-relaxed text-muted">Place virtual actors into physical environments. …</p>
  </div>
</article>
```

The grid: `<div data-reveal-group="true" class="grid gap-px border-t border-line bg-line md:grid-cols-2">`
— a 1px gap over a hairline background is what makes the dividers true 1px rules.

The eighth card is a link, not a video:

```html
<a data-reveal="true" href="https://app.getartcraft.com/" class="group flex flex-col bg-bg">
  <div class="flex items-center justify-between gap-4 border-b border-line px-6 py-2.5 md:px-8">
    <p class="hud-label text-muted">More in the app</p>
    <p class="hud-label text-faint">08</p>
  </div>
  <div class="relative flex aspect-video w-full flex-col items-center justify-center gap-4 overflow-hidden bg-bg-sunken">
    <span class="flex h-14 w-14 items-center justify-center border border-line-strong text-ink transition-colors group-hover:bg-invert-bg group-hover:text-invert-fg"><!-- arrow-up-right icon --></span>
    <p class="hud-label text-faint">app.getartcraft.com</p>
    <span aria-hidden="true" class="tick top-2 left-2 opacity-60"></span>
    <span aria-hidden="true" class="tick bottom-2 right-2 opacity-60"></span>
  </div>
  <div class="px-6 py-6 md:px-8">
    <h3 class="font-display text-2xl font-medium tracking-[-0.02em] text-ink-strong">Launch the studio</h3>
    <p class="mt-2 max-w-xl leading-relaxed text-muted">Generate, edit, and compose with every model — right in your browser, no install needed.</p>
  </div>
</a>
```

### The Ownership Card

```html
<article data-reveal="true" class="bg-bg p-6 md:p-8">
  <p class="hud-label text-faint">A</p>
  <h3 class="mt-6 font-display text-2xl font-medium tracking-[-0.02em] text-ink-strong">Open source</h3>
  <p class="mt-2 leading-relaxed text-muted">The whole studio is on GitHub. Read it, fork it, make it yours.</p>
  <a href="https://github.com/storytold/artcraft" target="_blank" rel="noopener noreferrer"
     class="inline-flex w-fit items-center justify-center rounded-none font-mono uppercase tracking-[0.12em] whitespace-nowrap transition-colors duration-150 invert-block border border-line-strong bg-bg text-ink hover:border-transparent px-3 py-1.5 text-[11px] mt-6 gap-1.5 font-medium" data-cta=""><!-- github icon -->View source</a>
</article>
```

### The Film Tile

```html
<figure data-reveal="true" class="bg-bg">
  <div class="flex items-center justify-between gap-4 border-b border-line px-6 py-2.5">
    <figcaption class="hud-label text-muted">Community film</figcaption>
    <p class="hud-label text-faint">01</p>
  </div>
  <div class="relative aspect-video w-full overflow-hidden bg-bg-sunken">
    <button type="button" class="group absolute inset-0 h-full w-full" aria-label="Play video: Made with ArtCraft #1">
      <img src="…" alt="" loading="lazy" class="absolute inset-0 h-full w-full object-cover"/>
      <span class="absolute inset-0 bg-black/20 transition-colors group-hover:bg-black/10"></span>
      <span class="hud-label absolute bottom-3 left-3 flex items-center gap-1.5 bg-invert-bg px-3 py-1.5 font-bold text-invert-fg"><!-- play icon -->Play</span>
    </button>
  </div>
</figure>
```

### The call to action button

Two variants, both square-cornered, 48px tall, monospace 11px bold uppercase with
`tracking-[0.12em]`, and both carrying `data-cta`:

```html
<!-- primary: fills with the invert colours, dims on hover -->
<a class="inline-flex w-fit items-center justify-center gap-2 rounded-none font-mono font-bold uppercase tracking-[0.12em] whitespace-nowrap duration-150 bg-invert-bg text-invert-fg transition-opacity hover:opacity-80 h-12 px-6 text-[11px]" data-cta="" href="/download">Download free</a>
<!-- secondary: transparent with a strong hairline border, the border drops on hover -->
<a class="inline-flex w-fit items-center justify-center gap-2 rounded-none font-mono font-bold uppercase tracking-[0.12em] whitespace-nowrap transition-colors duration-150 invert-block border border-line-strong bg-bg text-ink hover:border-transparent h-12 px-6 text-[11px]" data-cta="" href="https://app.getartcraft.com/">Use on web</a>
```

### The header

```html
<nav id="site-nav" class="sticky top-0 left-0 z-50 w-full border-b border-line bg-bg/95 backdrop-blur-sm">
  <div class="flex h-12 items-stretch justify-between">
    <div class="flex min-w-0 items-stretch">
      <a class="flex items-center border-r border-line px-4 hover:opacity-70 sm:px-5" href="/">
        <img alt="ArtCraft" src="/artcraft-icon.svg" class="themed-logo h-6 w-auto"/>
      </a>
      <nav aria-label="Main" class="hidden min-w-0 items-stretch lg:flex">
        <ul class="flex h-full items-stretch">
          <li class="flex items-stretch"><a aria-current="page" class="group flex h-full items-center px-2.5 hud-label whitespace-nowrap text-ink" href="/"><span class="flex items-center gap-1.5 px-1.5 py-0.5 group-hover:bg-invert-bg group-hover:text-invert-fg bg-invert-bg text-invert-fg">Home</span></a></li>
          <li class="flex items-stretch"><a class="group flex h-full items-center px-2.5 hud-label whitespace-nowrap text-muted hover:text-ink" href="https://app.getartcraft.com/create-image"><span class="flex items-center gap-1.5 px-1.5 py-0.5 group-hover:bg-invert-bg group-hover:text-invert-fg">Image</span></a></li>
          <li class="flex items-stretch"><a class="group flex h-full items-center px-2.5 hud-label whitespace-nowrap text-muted hover:text-ink" href="https://app.getartcraft.com/create-video"><span class="…">Video</span></a></li>
          <li class="relative flex items-stretch"><button data-state="closed" aria-expanded="false" class="group flex h-full items-center px-2.5 hud-label whitespace-nowrap text-muted hover:text-ink"><span class="…">Resources<!-- chevron --></span></button></li>
          <li class="flex items-stretch"><a class="… hud-label …" href="/download"><span class="…">Download</span></a></li>
          <li class="flex items-stretch"><a class="… hud-label …" href="/support"><span class="…">Support</span></a></li>
          <li class="flex items-stretch ml-1.5 border-l border-line pl-1.5"><a class="… hud-label …" href="/apps"><span class="…">Craft Apps</span></a></li>
        </ul>
      </nav>
    </div>
    <div class="flex shrink-0 items-stretch">
      <div class="hidden items-stretch md:flex">
        <a class="… hud-label …" href="/pricing"><span class="…">Pricing</span></a>
        <a href="https://discord.gg/artcraft" target="_blank" rel="noopener noreferrer" aria-label="Join the ArtCraft Discord" class="flex w-12 items-center justify-center border-l border-line text-muted hover:bg-invert-bg hover:text-invert-fg"><!-- discord icon --></a>
        <button type="button" aria-label="Switch to dark theme" class="invert-block flex items-center justify-center text-muted hover:text-invert-fg w-12 border-l border-line"><!-- moon icon --></button>
        <a href="https://app.getartcraft.com/" class="… bg-invert-bg text-invert-fg … h-full border-l border-line px-5" data-cta="">Launch App</a>
      </div>
      <div class="flex items-stretch md:hidden"><button type="button" aria-label="Switch to dark theme" class="invert-block … w-12 border-l border-line"><!-- moon --></button></div>
      <div class="flex items-stretch lg:hidden">
        <button type="button" aria-expanded="false" aria-controls="mobile-nav" class="flex w-12 items-center justify-center border-l border-line text-muted hover:bg-invert-bg hover:text-invert-fg">
          <span class="sr-only">Open main menu</span><!-- menu icon -->
        </button>
      </div>
    </div>
  </div>
</nav>
```

The header is full-bleed: its inner row spans the viewport and the logo sits at the very
edge, exactly as in `docs/reference/screenshots/hero-light-1440.webp`. The footer, by
contrast, is inside the 1280px Frame.

### The footer

```html
<footer class="border-t border-line">
  <div class="mx-auto max-w-[1280px] border-x border-line">
    <div class="grid gap-px bg-line md:grid-cols-4 lg:grid-cols-[2fr_1fr_1fr_1fr_1fr]">
      <div class="bg-bg p-6 md:col-span-4 md:p-10 lg:col-span-1">
        <img alt="ArtCraft" src="/artcraft-icon.svg" class="themed-logo h-8 w-auto"/>
        <p class="mt-4 max-w-xs leading-relaxed text-muted">The open-source studio for controllable AI image and video.</p>
        <a href="mailto:hello@storyteller.ai" class="hud-label mt-6 inline-block text-faint hover:text-ink">hello@storyteller.ai</a>
      </div>
      <nav aria-label="Product" class="bg-bg p-6 md:p-8">…</nav>
      <!-- Craft Apps, Resources, Community -->
    </div>
    <div class="flex flex-col gap-2 border-t border-line px-6 py-4 md:flex-row md:items-center md:justify-between md:px-10">
      <p class="hud-label text-faint">© 2026 ArtCraft</p>
      <p class="hud-label text-faint">Made by artists, for artists</p>
    </div>
  </div>
</footer>
```

---

## 6. The content

Everything below is the original's copy, verbatim.

### Site

- Title: `ArtCraft — Controllable AI for Artists`
- Description: `ArtCraft is the open-source desktop app for generating AI video and images — built for artists who want real control.`
- Email: `hello@storyteller.ai`
- Tagline: `The open-source studio for controllable AI image and video.`

### Header navigation

| Label | Href | Notes |
| --- | --- | --- |
| Home | `/` | current page; rendered with the inverted block |
| Image | `https://app.getartcraft.com/create-image` | |
| Video | `https://app.getartcraft.com/create-video` | |
| Resources | — | dropdown: Tutorials, News, FAQ, Press Kit, Support |
| Download | `/download` | |
| Support | `/support` | |
| Craft Apps | — | dropdown: All Craft Apps, then the app pages |

Header right: `Pricing` → `/pricing`, a Discord icon link →
`https://discord.gg/artcraft` (accessible name "Join the ArtCraft Discord"), the theme
toggle, and `Launch App` → `https://app.getartcraft.com/`.

### The Orbit

The original's Orbit is a WebGL canvas: concentric rings with tick marks, a few heavy
partial arcs, and rounded photo tiles floating at varying depths, some blurred. The
clone reproduces it in SVG and CSS (ADR-0004):

- concentric circles, some carrying tick marks, drawn in `--line` / `--line-strong`
- a few heavy partial arcs that sweep only part of the way round; in the dark theme the
  arcs carry colour (green, blue, magenta), in the light theme they read as grey
- rounded photo tiles at varying depths, some blurred, drifting slowly on CSS keyframes
- the whole thing scales with the viewport, and it is `aria-hidden`

The tiles' photographs are still frames taken from the demo videos (issue #4), so the
hero's imagery is the product's own.

### Hero

- Wordmark: `ARTCRAFT` (the A drawn from the logo, then `RTCRAFT`, one element per
  letter), exposed to assistive technology as a single labelled image.
- Headline: `Capable tools` + Serif Accent `for artists.`
- Paragraph: `ArtCraft builds open source tools for artists. We pride ourselves on freedom of control and expression.`
- Primary call to action: `Download free` → `/download`
- Secondary call to action: `Use on web` → `https://app.getartcraft.com/`
- HUD Label row: `Open source on GitHub` → `https://github.com/storytold/artcraft`,
  `macOS · Windows · Web`, `No subscription required`

### Marquee

`Seedance 2.5`, `Nano Banana 2`, `Image to Location`, `3D Compositing`,
`Character Posing`, `Image to 3D Mesh`, `Background Removal`, `2D Compositing`,
`Mixed Assets` — each preceded by an accent-coloured `▪`.

### Features — Section Bar `01 / Crafting features`, `Real footage — captured in ArtCraft`

Headline: `The control that mere` + Serif Accent `words` + `cannot buy.`

Paragraph: `Text prompting is neat, but artists crave control. Compose the shot yourself — then let the model render it.`

| # | Category | Title | Body | Video | Label |
| --- | --- | --- | --- | --- | --- |
| 01 | Worlds | Image to Location | Place virtual actors into physical environments. Establish single-location consistency and film multiple shots in a room without things disappearing. | `/videos/features/WorldLabs_Demo_2.webm` | Image to Location demo |
| 02 | 3D Compositing | Build scenes with depth | Use images, backdrops, foreground elements, and props in scenes with real depth. A couple of images blends naturally into a finished composition. | `/videos/features/Panel.webm` | Build scenes with depth demo |
| 03 | 2D Compositing | Precise layered control | Combine images, background removal, layers, and simple drawing tools to compose a scene exactly the way you imagined it. | `/videos/features/Editor.webm` | Precise layered control demo |
| 04 | 3D Mesh | Image to 3D Mesh | Turning images into 3D helps position elements exactingly. Block complex scenes with intentional geometry instead of fighting prompts. | `/videos/features/Make_3D.webm` | Image to 3D Mesh demo |
| 05 | Mixed Assets | Mix every kind of asset | Combine image cutouts, worlds, and 3D meshes in one canvas to lay out scenes with precision and intention. | `/videos/features/Mixed.webm` | Mix every kind of asset demo |
| 06 | Posing | Character Posing | Dynamically pose your characters to nail the precise character, scene, and camera blocking before calling "action". | `/videos/features/Character-Pose.webm` | Character Posing demo |
| 07 | Cutouts | Background Removal | Instantly remove backgrounds from images to create assets for your scenes. Clean, precise, and ready for compositing. | `/videos/features/Background.webm` | Background Removal demo |
| 08 | More in the app | Launch the studio | Generate, edit, and compose with every model — right in your browser, no install needed. | — (a link) | `app.getartcraft.com` |

Card 08 links to `https://app.getartcraft.com/`.

### Ownership — Section Bar `02 / Ownership`, `Free & open source`

Headline: `Stop ` + Serif Accent `renting` + ` from websites.`

Paragraph: `ArtCraft is yours to own and keep, forever. No subscriptions needed, no aggregator middleman, no rent payments.`

| Letter | Title | Body | Action |
| --- | --- | --- | --- |
| A | Open source | The whole studio is on GitHub. Read it, fork it, make it yours. | `View source` → `https://github.com/storytold/artcraft` |
| B | Yours forever | ArtCraft is yours to own and keep, forever. No rent payments. | — |
| C | No middleman | No aggregator between you and the models. Your work stays yours. | — |

### Proof — Section Bar `03 / Proof`, `From the community`

Headline: `Made ` + Serif Accent `with` + ` ArtCraft.`

| # | Label | Title | Poster source | Film |
| --- | --- | --- | --- | --- |
| 01 | Community film | Made with ArtCraft #1 | `https://i.ytimg.com/vi/HDdsKJl92H4/hqdefault.jpg` | `https://www.youtube.com/watch?v=HDdsKJl92H4` |
| 02 | Community film | Made with ArtCraft #2 | `https://i.ytimg.com/vi/oqoCWdOwr2U/hqdefault.jpg` | `https://www.youtube.com/watch?v=oqoCWdOwr2U` |
| 03 | Community film | Made with ArtCraft #3 | `https://i.ytimg.com/vi/H4NFXGMuwpY/hqdefault.jpg` | `https://www.youtube.com/watch?v=H4NFXGMuwpY` |

The posters are vendored locally (issue #4); the play button links to the film.

### Start — Section Bar `04 / Start`, `Free to start · No subscription`

Headline: `Start ` + Serif Accent `crafting` + `.`

Paragraph: `Download the studio, or run it in your browser. Your first renders are minutes away.`

Primary call to action: `Download for desktop` → `/download`
Secondary call to action: `Launch in browser` → `https://app.getartcraft.com/`

> The original's Start section has **no** Section Bar — it opens straight into a centred
> block whose HUD Label eyebrow reads `Free to start · No subscription`. Issue #12 and the
> spec ("four numbered sections", "Each numbered section opens with a Section Bar") both
> require a fourth Section Bar, so the clone has one: `04 / Start` on the left and
> `Free to start · No subscription` on the right. The centred block keeps the original's
> eyebrow as well, which means that string appears twice in the Start section. That
> duplication is a consequence of the spec's four-Section-Bar decision, not an oversight.

### Footer

Brand cell: the logo, `The open-source studio for controllable AI image and video.`, and
`hello@storyteller.ai` as a mail link.

**Product** — Download (`/download`), Pricing (`/pricing`), Launch App
(`https://app.getartcraft.com/`)

**Craft Apps** — All Craft Apps (`/apps`), PhotoCraft (`/apps/photocraft`), VectorCraft
(`/apps/vectorcraft`), FilmCraft (`/apps/filmcraft`), LightCraft (`/apps/lightcraft`),
PdfCraft (`/apps/pdfcraft`), EffectCraft (`/apps/effectcraft`), DesignCraft
(`/apps/designcraft`), FigCraft (`/apps/figcraft`), WordCraft (`/apps/wordcraft`),
SoundCraft (`/apps/soundcraft`), DeckCraft (`/apps/deckcraft`), CADCraft
(`/apps/cadcraft`), GridCraft (`/apps/gridcraft`)

**Resources** — Tutorials (`/tutorials`), News (`/news`), FAQ (`/faq`), Press Kit
(`/press-kit`), Support (`/support`)

**Community** — Discord (`https://discord.gg/artcraft`), GitHub
(`https://github.com/storytold/artcraft`), YouTube
(`https://www.youtube.com/@OfficialArtCraftStudios`), Instagram
(`https://www.instagram.com/get_artcraft`), TikTok
(`https://www.tiktok.com/@artcraft.studios`)

Closing bar: `© 2026 ArtCraft` and `Made by artists, for artists`

---

## 7. The theme script

The original applies the stored theme before first paint, with an inline script in
`<head>`:

```js
try {
  var t = localStorage.getItem("artcraft-theme");
  if (t === "light" || t === "dark") document.documentElement.setAttribute("data-theme", t);
} catch (e) {}
```

The clone keeps the same storage key so the behaviour is identical.

## 8. Where the assets come from

| Asset | Source |
| --- | --- |
| Logo | `https://getartcraft.com/artcraft-icon.svg` → `public/artcraft-icon.svg` |
| Demo videos | `https://getartcraft.com/videos/features/*.webm` → `public/videos/features/` |
| Film posters | `https://i.ytimg.com/vi/<id>/hqdefault.jpg` → `public/images/films/` |
| Archivo (latin, variable) | `https://getartcraft.com/_next/static/media/21ca8f3f56c22ca2-s.p.1cp9-4nby68jc.woff2` |
| Inter (latin, variable) | `https://getartcraft.com/_next/static/media/83afe278b6a6bb3c-s.p.2bn3s6zvc0dyp.woff2` |
| Geist Mono (latin, variable) | `https://getartcraft.com/_next/static/media/797e433ab948586e-s.p.0r6juujl39pe6.woff2` |
| Instrument Serif (latin, italic) | `https://getartcraft.com/_next/static/media/7ebf22b5a21034f8-s.p.3j3877k49yy0l.woff2` |

The font file names are the original's build hashes and will 404 if the original site
redeploys. Download them once and vendor them; do not hotlink them.
