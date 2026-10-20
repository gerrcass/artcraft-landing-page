import type { Locator, Page } from "@playwright/test"

import { marquee } from "@/data/site"

import { expect, test } from "./fixtures"

/** The Marquee section. */
function section(page: Page): Locator {
  return page.locator("#marquee")
}

/** The Marquee's real track — the list a visitor reads. */
function track(page: Page): Locator {
  return section(page).locator(".marquee-track").first()
}

/** The entries of a track. */
function entries(of: Locator): Locator {
  return of.locator("li")
}

/** The track's computed transform, sampled now. */
function sampleTransform(of: Locator): Promise<string> {
  return of.evaluate((node) => getComputedStyle(node).transform)
}

/** The colour a token resolves to in the theme the page is in. */
function tokenColor(page: Page, token: string): Promise<string> {
  return page.evaluate((name) => {
    const probe = document.createElement("span")
    probe.style.color = `var(${name})`
    document.body.append(probe)
    const color = getComputedStyle(probe).color
    probe.remove()
    return color
  }, token)
}

test("the Marquee shows the content module's entries", async ({ page, visit }) => {
  await visit()

  const items = entries(track(page))

  await expect(items).toHaveCount(marquee.length)

  // The entries are exposed as a list, and only once: the duplicate track is
  // hidden from assistive technology.
  await expect(track(page).getByRole("listitem")).toHaveCount(marquee.length)

  for (const [index, entry] of marquee.entries()) {
    await expect(items.nth(index)).toContainText(entry)
    await expect(items.nth(index)).toBeVisible()
  }
})

test("each entry is preceded by an accent-coloured square", async ({ page, visit }) => {
  await visit()

  const accent = await tokenColor(page, "--accent-ink")
  const items = entries(track(page))

  for (const [index] of marquee.entries()) {
    const square = items.nth(index).locator('[aria-hidden="true"]')

    await expect(square).toHaveText("▪")
    await expect(square).toBeVisible()
    expect(await square.evaluate((node) => getComputedStyle(node).color)).toBe(accent)
  }
})

test("each entry is preceded by an accent-coloured square in the dark theme", async ({
  page,
  visit,
}) => {
  await visit({ theme: "dark" })

  const accent = await tokenColor(page, "--accent-ink")
  const square = entries(track(page)).first().locator('[aria-hidden="true"]')

  expect(await square.evaluate((node) => getComputedStyle(node).color)).toBe(accent)
})

test("the track is duplicated, and the duplicate is hidden from assistive technology", async ({
  page,
  visit,
}) => {
  await visit()

  const tracks = section(page).locator(".marquee-track")

  await expect(tracks).toHaveCount(2)
  await expect(tracks.nth(0)).not.toHaveAttribute("aria-hidden", "true")
  await expect(tracks.nth(1)).toHaveAttribute("aria-hidden", "true")

  // The duplicate carries the same entries as the real list.
  await expect(entries(tracks.nth(1))).toHaveCount(marquee.length)
  await expect(entries(tracks.nth(1)).first()).toContainText(marquee[0])
})

test("the Marquee sits directly beneath the hero, full-bleed, with a hairline top border", async ({
  page,
  visit,
}) => {
  await visit()

  const hero = page.locator("#hero")
  const strip = section(page).locator(".marquee")

  // Directly beneath the hero: the Marquee is the hero's next sibling.
  expect(await hero.evaluate((node) => node.nextElementSibling?.id)).toBe("marquee")

  // Full-bleed: the strip spans the whole page column, not the Frame.
  const stripWidth = await strip.evaluate((node) => node.getBoundingClientRect().width)
  const columnWidth = await section(page).evaluate(
    (node) => node.getBoundingClientRect().width,
  )
  const layoutWidth = await page.evaluate(() => document.documentElement.clientWidth)

  expect(stripWidth).toBeCloseTo(columnWidth, 1)
  expect(columnWidth).toBeCloseTo(layoutWidth, 1)

  // The hairline top border, in the line token.
  const border = await strip.evaluate((node) => {
    const style = getComputedStyle(node)
    return { width: style.borderTopWidth, color: style.borderTopColor }
  })

  expect(border.width).toBe("1px")
  expect(border.color).toBe(await tokenColor(page, "--line"))
})

test("the Marquee scrolls continuously", async ({ page, visit }) => {
  await visit()

  const first = track(page)

  const animation = await first.evaluate((node) => {
    const style = getComputedStyle(node)
    return { name: style.animationName, playState: style.animationPlayState }
  })

  expect(animation.name).toBe("marquee-scroll")
  expect(animation.playState).toBe("running")

  const before = await sampleTransform(first)
  await page.waitForTimeout(500)
  const after = await sampleTransform(first)

  expect(after).not.toBe(before)
})

test.describe("under a reduced-motion preference", () => {
  test.use({ reducedMotion: "reduce" })

  test("the Marquee does not scroll, and the entries stay readable", async ({
    page,
    visit,
  }) => {
    await visit()

    const first = track(page)

    const state = await first.evaluate((node) => {
      const style = getComputedStyle(node)
      return { name: style.animationName, transform: style.transform }
    })

    // The animation is not running.
    expect(state.name).toBe("none")

    // The track does not move.
    await page.waitForTimeout(500)
    expect(await sampleTransform(first)).toBe(state.transform)

    // The entries are still there to read.
    const items = entries(first)
    await expect(items).toHaveCount(marquee.length)
    await expect(items.first()).toBeVisible()
    await expect(items.first()).toContainText(marquee[0])
  })
})
