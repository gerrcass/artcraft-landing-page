# Paint the page's text in the muted ink, not the faint one

The original's palette carries two greys for text: `--muted`, at 62% opacity, and
`--faint`, at 42%. The clone now paints every piece of text in the muted ink, and the
faint token is left in the token layer, unused.

The faint ink cannot meet AA. Over the light background it composites to `#939392`,
which is 2.72:1 — below the 4.5:1 WCAG asks of body text, and below the 3:1 it asks of
large text, so there is no size at which it is legible enough to use. The muted ink
composites to `#666667`, which is 5.08:1, and it is the lightest of the palette's inks
that clears the bar: everything lighter than the muted ink is the faint ink. The token
is not changed. Its value is the original's, transcribed from the original's computed
styles, and the token layer is where that value belongs; it is the *use* of the token
that was wrong, not the token.

The cost is visible. The clone's smallest labels — the section numbers, the card
indices, the footer — are darker than the original's, and the six visual baselines were
rewritten to show it. That is the trade this project made: the original's greys are a
picture, and the picture is not the same thing as a page that everybody can read.
Leaving the labels as they were and letting the contrast rule fail was not available
either, because the ticket's bar is AA in both themes and a failing rule is a failing
bar.
