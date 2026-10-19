# Mark the Choreography with data attributes, and let the observer stand down where the CSS drives

The Choreography is marked on the elements themselves: `data-reveal` for an element that
reveals on its own, `data-reveal-group` for a set of children that reveal together, and
`data-draw-rule`, `data-draw-tick` and `data-draw-eyebrow` for the decorations that draw
themselves in. There are no `isRevealed` props, no `animate` props, and no per-section
animation components, because the behaviour is a property of the markup rather than of the
tree that carries it: the sections that land later mark their own elements, and none of them
has to know that a shared observer exists.

One `IntersectionObserver` serves the whole page. It is created outside render, it is
reference-counted so that it can be shared by more than one caller, and it is torn down when
the last caller lets go. It watches the elements the marks select, including the ones that
appear after the page has mounted, and it does two things: it tells the observer's own
fallback that an element has arrived, and — in the browsers that can tie an animation to a
scroll position — it stands down and lets the CSS do it instead, so that the two never
fight over the same property. Which of the two is in charge is decided per kind of
observation, in a small registry, so that adding a second kind — the Media Well of the
videos — is an entry in that list rather than a change to the mechanism.

Two decisions in there are worth recording because they are not obvious. The drawing marks
are never handed over to the CSS scroll-driven alternative, even in the browsers that
support it: the Section Bar's eyebrow is a sticky element, and a sticky element's view
progress freezes the moment it sticks, which would leave the eyebrow half drawn for the
whole section. And the Reveal's hidden start state is scoped to a class the choreography
puts on the document root while it is running, so that a visitor whose browser never runs
the script sees the whole page rather than a blank one — the price is that the reveal
begins when the script runs rather than at the first paint, which is invisible because the
scroll-driven path computes its own progress from the scroll position.
