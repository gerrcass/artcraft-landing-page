# Capture the page on the Reduced Path, and freeze the videos on one frame

The visual regression suite captures the whole landing page at three widths, in both
themes, and compares each capture against a committed baseline. A capture is only
worth comparing against a baseline if it is the same picture every time it is taken,
and the page is not a still thing: the Reveals fire as their elements come into
view, the Marquee scrolls, the Orbit's tiles drift, and the seven demo videos play
whenever their wells are on the screen. Captured as they are, the captures would
differ from one another in a dozen places and the comparison would say nothing.

The capture is therefore taken on the **Reduced Path** — the same content with the
motion removed — and the videos are frozen. `reducedMotion: "reduce"` puts the
browser on the path a visitor with reduced motion sees: the Reveals are in their
final state and stay there, the Marquee and the Orbit have stopped, and the hover
movements are gone. That is a stable picture of the finished page, and it is a
picture of a page the project actually ships: the Reduced Path is a first-class
presentation of the page, not a degraded one.

The demo videos need more than that. The Reduced Path leaves them playing, because
the content of a demo is the demo, and a playing video shows a different frame every
time. Two things are done about it. `play` is replaced before the page is loaded, so
that no video ever runs and there is never a frame in flight; and each video is
then loaded, seeked to a fixed timestamp, and waited for — the `seeked` event says
the frame has been decoded, and `requestVideoFrameCallback` says it has been put on
the screen. The frame that is waited for is the one *at* the timestamp: a video that
has been loaded puts its first frame on the screen before it is seeked, and that
frame is not the one the capture wants.

The order of the capture matters, and it is not the obvious one. The videos are
frozen *before* the page is scrolled, not after. A video that has been seeked while
it is off the screen has its frame decoded but never painted, and a full-page
capture paints the page again from the top, which leaves the wells empty. Freezing
the videos first, and scrolling afterwards, means the page is painted with the demo
frames already on it.

Two smaller things are done for the same reason. The page is scrolled from the top
to the bottom and back before the capture, so that everything which arrives on
screen has arrived; and the lazy images are asked for eagerly and decoded, because
a browser decodes an image in two passes — a quick one, and a full one when the
image is drawn at its final size — and a capture taken between the two passes would
show the quick one.

The comparison is exact: Playwright's default `maxDiffPixelRatio` of zero. A
threshold loose enough to absorb the difference between two machines would also
absorb the difference between one word and another, which is the smallest change
the suite exists to catch. The baselines are therefore tied to the browser build
that made them, which is the browser build the pinned `@playwright/test` installs.
A machine whose Chromium rasterises differently may need a threshold; the place to
give it is `tests/e2e/visual.spec.ts`, and it should be the smallest one that makes
the suite pass there.
