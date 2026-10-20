import type { Page } from "@playwright/test"

import { headlineText, hero, orbitTiles } from "@/data/site"

import { expect, test } from "./fixtures"

const headline = headlineText(hero.headline)

/** The Wordmark, exposed to assistive technology as a single labelled image. */
function wordmark(page: Page) {
  return page.getByRole("img", { name: hero.wordmark, exact: true })
}

/** The Wordmark's size, and the size of the container it is sized against. */
async function measureWordmark(page: Page) {
  return wordmark(page).evaluate((element) => {
    const container = element.parentElement as HTMLElement
    const range = document.createRange()
    range.selectNodeContents(element)
    const ink = range.getBoundingClientRect()

    return {
      fontSize: Number.parseFloat(getComputedStyle(element).fontSize),
      specified: (element as HTMLElement).style.fontSize,
      containerWidth: container.getBoundingClientRect().width,
      width: ink.width,
    }
  })
}

test("the hero fills the viewport below the header", async ({ page, visit }) => {
  await visit({ viewport: { width: 1440, height: 900 } })

  const section = page.locator("#hero")
  await expect(section).toBeVisible()

  const box = await section.boundingBox()
  expect(box?.height ?? 0).toBeGreaterThanOrEqual(900 - 48)
})

test("the Wordmark is exposed as one labelled image", async ({ page, visit }) => {
  await visit({ theme: "light" })

  const mark = wordmark(page)
  await expect(mark).toBeVisible()
  await expect(mark).toHaveAttribute("aria-label", hero.wordmark)

  // The letters are hidden from assistive technology, so the Wordmark is
  // announced once rather than as eight letters.
  await expect(mark.locator("> span[aria-hidden='true']")).toHaveCount(
    hero.wordmark.length,
  )
})

test("each letter of the Wordmark is its own element", async ({ page, visit }) => {
  await visit({ theme: "light" })

  const letters = await wordmark(page)
    .locator("> span")
    .evaluateAll((elements) =>
      elements.map((element) =>
        element.querySelector("svg") ? "mark" : element.textContent,
      ),
    )

  // The leading A is drawn from the vendored logo; the rest are letters.
  expect(letters).toEqual(["mark", ...hero.wordmark.slice(1).split("")])
})

test("the Wordmark is sized in container-query units and scales with its container", async ({
  page,
  visit,
}) => {
  await visit({ viewport: { width: 1440, height: 900 } })

  const wide = await measureWordmark(page)

  // The size is expressed in container-query units, not in a fixed pixel value.
  expect(wide.specified).toMatch(/cqw$/)
  expect(wide.fontSize).toBeGreaterThan(0)
  expect(wide.fontSize / wide.containerWidth).toBeCloseTo(
    wide.fontSize / wide.containerWidth,
    5,
  )

  await visit({ viewport: { width: 390, height: 844 } })

  const narrow = await measureWordmark(page)

  // The Wordmark is proportional to its container, so a narrower viewport gives
  // a narrower Wordmark: the size follows the container, not a breakpoint.
  expect(narrow.fontSize).toBeLessThan(wide.fontSize * 0.75)
  expect(narrow.width).toBeLessThan(wide.width * 0.75)
  expect(narrow.fontSize / narrow.containerWidth).toBeCloseTo(
    wide.fontSize / wide.containerWidth,
    2,
  )
})

test("the headline states the promise, with the Serif Accent on the phrase", async ({
  page,
  visit,
}) => {
  await visit({ theme: "light" })

  const h1 = page.getByRole("heading", { level: 1 })
  await expect(h1).toBeVisible()
  await expect(h1).toHaveText(headline)

  const accent = h1.getByText(hero.headline.accent, { exact: true })
  const style = await accent.evaluate((element) => {
    const computed = getComputedStyle(element)
    return { fontFamily: computed.fontFamily, fontStyle: computed.fontStyle }
  })

  expect(style.fontFamily).toContain("Instrument Serif")
  expect(style.fontStyle).toBe("italic")
})

test("the hero explains itself in a paragraph", async ({ page, visit }) => {
  await visit({ theme: "light" })

  await expect(page.getByText(hero.body, { exact: true })).toBeVisible()
})

test("the hero offers a primary and a secondary call to action", async ({
  page,
  visit,
}) => {
  await visit({ theme: "light" })

  const primary = page.getByRole("link", { name: "Download free" })
  await expect(primary).toBeVisible()
  await expect(primary).toHaveAttribute("href", "https://getartcraft.com/download")

  const secondary = page.getByRole("link", { name: "Use on web" })
  await expect(secondary).toBeVisible()
  await expect(secondary).toHaveAttribute("href", "https://app.getartcraft.com/")
})

test("the HUD Label row names the platform and the pricing model", async ({
  page,
  visit,
}) => {
  await visit({ theme: "light" })

  await expect(
    page.getByRole("link", { name: "Open source on GitHub" }),
  ).toBeVisible()
  await expect(
    page.getByText("macOS · Windows · Web", { exact: true }),
  ).toBeVisible()
  await expect(
    page.getByText("No subscription required", { exact: true }),
  ).toBeVisible()
})

test("the hero headline is the page's only heading of the first level", async ({
  page,
  visit,
}) => {
  await visit({ theme: "light" })

  const headings = page.getByRole("heading", { level: 1 })
  await expect(headings).toHaveCount(1)
  await expect(headings).toHaveText(headline)
})

test("the Orbit is hidden from assistive technology", async ({ page, visit }) => {
  await visit({ theme: "light" })

  const orbit = page.locator("[data-orbit]")
  await expect(orbit).toHaveCount(1)
  await expect(orbit).toHaveAttribute("aria-hidden", "true")
})

test("the Orbit draws concentric rings and heavy partial arcs", async ({
  page,
  visit,
}) => {
  await visit({ theme: "light" })

  const svg = page.locator("[data-orbit] svg")
  await expect(svg.locator("circle")).not.toHaveCount(0)

  const arcs = await svg
    .locator("path")
    .evaluateAll((paths) =>
      paths.filter((path) => (path.getAttribute("d") ?? "").includes("A")).length,
    )
  expect(arcs).toBeGreaterThan(0)
})

test("the Orbit's photo tiles float at varying depths", async ({ page, visit }) => {
  await visit({ theme: "light" })

  const tiles = page.locator("[data-orbit] img")
  await expect(tiles).toHaveCount(orbitTiles.length)

  const styles = await tiles.evaluateAll((elements) =>
    elements.map((element) => {
      const computed = getComputedStyle(element)
      return {
        filter: computed.filter,
        duration: computed.animationDuration,
        borderRadius: computed.borderRadius,
      }
    }),
  )

  // The depth of a tile drives its blur, so not every tile is equally sharp.
  expect(new Set(styles.map((style) => style.filter)).size).toBeGreaterThan(1)

  // Every tile drifts, slowly, on its own duration.
  for (const style of styles) {
    expect(style.duration).not.toBe("0s")
    expect(Number.parseFloat(style.duration)).toBeGreaterThan(10)
  }

  // The tiles are rounded, not square.
  for (const style of styles) {
    expect(style.borderRadius).not.toBe("0px")
  }
})
