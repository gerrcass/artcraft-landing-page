import { expect, test } from "./fixtures"
import { viewports } from "./fixtures"

/**
 * The page's responsive behaviour, seen from the outside.
 *
 * The original's own capture of the page at 390px is 700px wide, not 390: the
 * hero's glow, the Orbit and the Marquee's track all reach past the edge of
 * the viewport, and the body clips them with `overflow-x: clip`. The clone
 * reproduces that exactly — its document is 494px wide at a 390px viewport,
 * the same as the original's.
 *
 * What matters to a visitor is that the page does not scroll sideways, so
 * that is what is asserted here.
 */

test("the page does not scroll horizontally on a phone", async ({ page, visit }) => {
  await visit({ viewport: viewports.mobile })

  // The content that reaches past the edge is clipped, not scrollable.
  const overflow = await page.evaluate(
    () => getComputedStyle(document.body).overflowX,
  )
  expect(overflow).toBe("clip")

  // And a sideways gesture does not move the page.
  await page.mouse.move(195, 400)
  await page.mouse.wheel(300, 0)
  await page.waitForTimeout(300)

  expect(await page.evaluate(() => window.scrollX)).toBe(0)
})

test("the Frame is 1280px wide and centred on a wide monitor", async ({
  page,
  visit,
}) => {
  await visit({ viewport: { width: 1920, height: 1080 } })

  const frame = page.locator("#features .max-w-\\[1280px\\]").first()
  const box = await frame.boundingBox()

  expect(box).not.toBeNull()
  expect(Math.round(box!.width)).toBe(1280)

  // Centred: the same space on either side of the viewport.
  const left = box!.x
  const right = 1920 - (box!.x + box!.width)
  expect(Math.abs(left - right)).toBeLessThanOrEqual(1)
})

test("the Frame has a hairline border on each side", async ({ page, visit }) => {
  await visit({ viewport: viewports.desktop })

  const frame = page.locator("#features .max-w-\\[1280px\\]").first()

  const borders = await frame.evaluate((element) => {
    const style = getComputedStyle(element)
    return {
      left: style.borderLeftWidth,
      right: style.borderRightWidth,
      leftStyle: style.borderLeftStyle,
    }
  })

  expect(borders.left).toBe("1px")
  expect(borders.right).toBe("1px")
  expect(borders.leftStyle).toBe("solid")
})
