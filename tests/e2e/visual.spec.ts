import { expect, test } from "@playwright/test"

import { CAPTURES, loadTheLandingPage, settleTheLandingPage } from "./visual-capture"

/**
 * The visual regression suite.
 *
 * A clone of somebody else's page is only a clone as long as it still looks
 * like the page it was made from. The way to know is to look at it, and the
 * way to look at it on every change — rather than by eye, once in a while —
 * is to capture it and compare the capture against a baseline.
 *
 * There are six captures: three widths, in two themes, each the whole page.
 * A capture that differs from its baseline fails the test and leaves a
 * difference image beside it, for a human to look at and accept or reject.
 *
 * **A baseline is only ever rewritten deliberately.** The `test:visual`
 * script does not pass `--update-snapshots`, so a failing test reports the
 * difference and leaves the stored baseline exactly where it was. Rewriting
 * a baseline is a separate, explicit act:
 *
 * ```sh
 * npx playwright test tests/e2e/visual.spec.ts --project=visual --update-snapshots
 * ```
 *
 * The capture is taken on the Reduced Path, where nothing moves: the Reveals
 * are already in their final state, the Marquee and the Orbit have stopped,
 * and the demo videos are frozen on one fixed frame. See `visual-capture.ts`
 * for what else the capture does to make the picture the same every time.
 */

for (const theme of ["light", "dark"] as const) {
  test.describe(`the landing page in the ${theme} theme`, () => {
    // The theme is forced: the browser is asked for it, and the stored
    // preference is cleared before the page is loaded, so that the stored
    // preference cannot override it.
    test.use({ colorScheme: theme })

    for (const capture of CAPTURES) {
      test(`at ${capture.width}`, async ({ page }) => {
        // The page is long and the videos are several megabytes each.
        test.setTimeout(180_000)

        await loadTheLandingPage(page, capture)
        await settleTheLandingPage(page)

        await expect(page).toHaveScreenshot(
          `landing-${capture.width}-${theme}.png`,
          {
            fullPage: true,
            animations: "disabled",
            /**
             * The page is long — several thousand pixels at every width — so
             * the capture and the comparison of two of them take longer than
             * the expectation's five seconds. The room is given here so that
             * a capture that does match is not reported as a failure for
             * having taken its time.
             */
            timeout: 60_000,
          },
        )
      })
    }
  })
}
