import type { Locator, Page } from "@playwright/test"

import { headlineText, start } from "@/data/site"

import { expect, test } from "./fixtures"

/** The headline as it reads on the page: `Start crafting.` */
const HEADLINE = headlineText(start.headline)

/** The Section Bar that opens the Start section. */
function sectionBar(page: Page): Locator {
  return page.locator('#start [data-draw-eyebrow="true"]')
}

/** The horizontal centre of a box. */
function centreX(box: { x: number; width: number }): number {
  return box.x + box.width / 2
}

/** A locator's box, or a failure if it has none. */
async function boxOf(locator: Locator) {
  const box = await locator.boundingBox()
  if (!box) {
    throw new Error("the element has no box")
  }
  return box
}

test("the section bar reads '04 / Start' and its descriptor", async ({
  page,
  visit,
}) => {
  await visit({ theme: "light" })

  const labels = sectionBar(page).locator("p")

  // The number and the subject read as one unit, separated by a slash.
  await expect(labels.first()).toHaveText(/^04\s*\/\s*Start$/)
  await expect(labels.nth(1)).toHaveText(start.bar.descriptor)
})

test("the descriptor is hidden below the small breakpoint", async ({
  page,
  visit,
}) => {
  await visit({ theme: "light" })

  const descriptor = sectionBar(page).locator("p").nth(1)
  const width = page.viewportSize()?.width ?? 0

  if (width >= 640) {
    await expect(descriptor).toBeVisible()
  } else {
    await expect(descriptor).toBeHidden()
  }
})

test("the block is centred in the section", async ({ page, visit }) => {
  await visit({ theme: "light" })

  const section = page.locator("#start")
  const headline = page.getByRole("heading", { level: 2, name: HEADLINE })
  const paragraph = page.getByText(start.body, { exact: true })
  const actions = page
    .getByRole("link", { name: /download for desktop/i })
    .locator("xpath=..")

  await section.scrollIntoViewIfNeeded()

  const sectionCentre = centreX(await boxOf(section))

  expect(
    Math.abs(centreX(await boxOf(headline)) - sectionCentre),
  ).toBeLessThanOrEqual(2)
  expect(
    Math.abs(centreX(await boxOf(paragraph)) - sectionCentre),
  ).toBeLessThanOrEqual(2)
  expect(
    Math.abs(centreX(await boxOf(actions)) - sectionCentre),
  ).toBeLessThanOrEqual(2)
})

test("the headline sets 'crafting' as the Serif Accent", async ({
  page,
  visit,
}) => {
  await visit({ theme: "light" })

  const accent = page
    .getByRole("heading", { level: 2, name: HEADLINE })
    .locator("span")

  await expect(accent).toHaveText(start.headline.accent)

  const style = await accent.evaluate((element) => {
    const computed = getComputedStyle(element)
    return { fontStyle: computed.fontStyle, fontFamily: computed.fontFamily }
  })

  expect(style.fontStyle).toBe("italic")

  // The accent is set in the serif token's stack, not the display face.
  const serifStack = await page.evaluate(() => {
    const probe = document.createElement("span")
    probe.className = "font-serif"
    document.body.appendChild(probe)
    const family = getComputedStyle(probe).fontFamily
    probe.remove()
    return family
  })

  expect(style.fontFamily).toBe(serifStack)
  expect(style.fontFamily).toContain("Instrument Serif")
})

test("the paragraph reads as the original does", async ({ page, visit }) => {
  await visit({ theme: "light" })

  await expect(
    page.getByText(start.body, { exact: true }),
  ).toBeVisible()
})

test("both routes to start are offered", async ({ page, visit }) => {
  await visit({ theme: "light" })

  const section = page.locator("#start")
  const primary = section.getByRole("link", { name: /download for desktop/i })
  const secondary = section.getByRole("link", { name: /launch in browser/i })

  await expect(primary).toBeVisible()
  await expect(secondary).toBeVisible()

  await expect(primary).toHaveAttribute("href", "/download")
  await expect(secondary).toHaveAttribute("href", "https://app.getartcraft.com/")

  // The primary fills with the invert colours; the secondary is outlined.
  const [primaryStyle, secondaryStyle] = await Promise.all([
    primary.evaluate((element) => {
      const computed = getComputedStyle(element)
      return {
        background: computed.backgroundColor,
        borderWidth: computed.borderTopWidth,
        borderColor: computed.borderTopColor,
      }
    }),
    secondary.evaluate((element) => {
      const computed = getComputedStyle(element)
      return {
        background: computed.backgroundColor,
        borderWidth: computed.borderTopWidth,
        borderColor: computed.borderTopColor,
      }
    }),
  ])

  expect(primaryStyle.background).not.toBe(secondaryStyle.background)
  expect(primaryStyle.borderWidth).toBe("0px")
  expect(secondaryStyle.borderWidth).toBe("1px")
  expect(secondaryStyle.borderColor).not.toBe("rgba(0, 0, 0, 0)")
})

test("the headline is the section's h2, and the hero's h1 is the only one", async ({
  page,
  visit,
}) => {
  await visit({ theme: "light" })

  await expect(
    page.getByRole("heading", { level: 2, name: HEADLINE }),
  ).toBeVisible()
  await expect(page.getByRole("heading", { level: 1 })).toHaveCount(1)
})

test("the section reads the same in the dark theme", async ({ page, visit }) => {
  await visit({ theme: "dark" })

  await expect(
    page.getByRole("heading", { level: 2, name: HEADLINE }),
  ).toBeVisible()
  await expect(sectionBar(page).locator("p").nth(1)).toHaveText(
    start.bar.descriptor,
  )
})
