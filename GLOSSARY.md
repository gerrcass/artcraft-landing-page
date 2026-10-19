# ArtCraft Landing Page

A frontend clone of the ArtCraft marketing site (getartcraft.com), built as a showcase of
responsive layout and modern UI construction. The vocabulary below names the visual
concepts the clone reproduces.

## Layout

**Frame**:
The 1280px-max-width container with hairline left and right borders that every page
section sits inside. The page is full-bleed; the Frame is what gives the layout its
editorial, print-like edge.
_Avoid_: Container, Wrapper, Max-width shell

**Section Bar**:
The sticky strip at the top of a section carrying a numbered eyebrow on the left
(`01 / Crafting features`) and a right-aligned descriptor (`Real footage — captured in
ArtCraft`). It pins directly beneath the site header.
_Avoid_: Section header, eyebrow bar, sticky subheader

**Tick**:
The small registration mark drawn at the top corners of the Frame, half outside the
border. Purely decorative; it exists to make the Frame read as a drawn sheet.
_Avoid_: Corner mark, bracket

**Orbit**:
The set of concentric circular rules behind the hero wordmark.
_Avoid_: Rings, circles, halo

**Marquee**:
The infinitely scrolling ticker of model and feature names directly beneath the hero.
_Avoid_: Ticker, carousel, scroller

## Typography

**HUD Label**:
The uppercase 11px monospaced micro-label used for navigation items, section eyebrows,
and card meta rows.
_Avoid_: Micro-label, kicker, overline, tag

**Serif Accent**:
The single italic serif run used to emphasise one word inside a heading — `for artists`,
`renting`, `with`. Always exactly one word per heading.
_Avoid_: Italic word, emphasis, highlight

**Wordmark**:
The ARTCRAFT logotype, set in the display face at large scale.
_Avoid_: Logo, logotype, brand mark

## Sections and cards

**Feature Card**:
One cell of the features grid: a meta row (category label plus an index number), a Media
Well, a title, and a body paragraph.
_Avoid_: Feature tile, capability card, feature block

**Media Well**:
The fixed-ratio frame inside a Feature Card that holds the looping demo video.
_Avoid_: Video frame, thumbnail slot, media box

**Ownership Card**:
One of the three lettered (`A`, `B`, `C`) cards in the Ownership section.
_Avoid_: Benefit card, pillar card, value card

**Film Tile**:
A community film card in the Proof section: a meta row, a poster image, and a play
affordance.
_Avoid_: Video card, community card, film card

## Motion

**Choreography**:
Scroll-driven behaviour that ties media playback and reveal timing to scroll position.
Applied to the Features, Ownership, Proof, and Start sections.
_Avoid_: Scroll animation, parallax, scroll-jack

**Reveal**:
The one-shot entrance transition applied to an element as it enters the viewport.
_Avoid_: Fade in, appear, entrance animation

**Reduced Path**:
The static presentation of a Choreographed section when the user has asked for reduced
motion: same content, no scroll-linked behaviour.
_Avoid_: Fallback, no-motion mode, static mode
