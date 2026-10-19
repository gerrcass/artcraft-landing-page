# Reproduce the hero Orbit in SVG and CSS rather than Three.js

The original renders the hero's Orbit as a WebGL scene — a `<canvas>` driven by Three.js,
carrying concentric rings with tick marks, a few heavy partial arcs, and rounded photo tiles
floating at varying depths, some of them blurred. The clone reproduces the Orbit in SVG and
CSS instead: SVG circles and arcs for the rings, absolutely-positioned images for the tiles,
and CSS keyframes for their drift.

Three.js would be the more literal reproduction, and it was rejected because the Orbit is
decorative and its cost is not proportional to its value in a project whose subject is
responsive layout. A canvas brings device-pixel-ratio handling, resize handling, a WebGL
context to fail on, and a dependency far larger than the rest of the project combined; SVG
scales to any viewport for free and stays crisp at any density. The one thing the canvas
gives that SVG does not is depth-of-field blur on the tiles, which CSS can approximate well
enough with a filter. ADR-0003 reached the same conclusion about the scroll choreography for
the same reason, and keeping the two consistent was worth something on its own.
