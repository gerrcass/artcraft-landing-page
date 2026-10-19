import type { Page } from "@playwright/test"

import { headlineText, proof } from "@/data/site"

import { expect, test } from "./fixtures"

const headline = headlineText(proof.headline)

/**
 * The Section Bar's left label: the section number, a slash, and the subject.
 *
 * The slash is set apart from its neighbours by margins rather than by spaces,
 * so the label's text is matched with the spacing left open.
 */
const barLabel = new RegExp(
  `^${proof.bar.number}\\s*/\\s*${proof.bar.subject}$`,
)

/** The bounding box of each Film Tile, in the order they are rendered. */
async function tileBoxes(page: Page) {
  return page
    .locator("#made-with")
    .getByRole("figure")
    .evaluateAll((tiles) =>
      tiles.map((tile) => {
        const rect = tile.getBoundingClientRect()
        return { left: rect.left, top: rect.top, bottom: rect.bottom }
      }),
    )
}

test("the Section Bar names the section and carries its descriptor", async ({
  page,
  visit,
}) => {
  // The descriptor is hidden below the small breakpoint, so the Section Bar is
  // read at a width where both of its labels are on screen.
  await visit({ viewport: { width: 1024, height: 900 }, theme: "light" })

  const section = page.locator("#made-with")

  await expect(section.getByText(barLabel)).toBeVisible()
  await expect(
    section.getByText(proof.bar.descriptor, { exact: true }),
  ).toBeVisible()
})

test("the headline reads as one sentence", async ({ page, visit }) => {
  await visit({ theme: "light" })

  await expect(
    page.getByRole("heading", { level: 2, name: headline }),
  ).toBeVisible()
})

test("the accent word is set in the italic serif", async ({ page, visit }) => {
  await visit({ theme: "light" })

  const accent = page
    .getByRole("heading", { level: 2, name: headline })
    .getByText(proof.headline.accent, { exact: true })

  const style = await accent.evaluate((element) => {
    const computed = getComputedStyle(element)
    return { fontFamily: computed.fontFamily, fontStyle: computed.fontStyle }
  })

  expect(style.fontFamily).toContain("Instrument Serif")
  expect(style.fontFamily).toContain("Georgia")
  expect(style.fontStyle).toBe("italic")
})

test("three Film Tiles render, each with a meta row, a poster and a play control", async ({
  page,
  visit,
}) => {
  await visit({ theme: "light" })

  const tiles = page.locator("#made-with").getByRole("figure")
  await expect(tiles).toHaveCount(3)

  for (const [index, entry] of proof.entries.entries()) {
    const tile = tiles.nth(index)

    // The meta row: the film's label on the left, its index on the right.
    await expect(tile.getByText(entry.label, { exact: true })).toBeVisible()
    await expect(tile.getByText(entry.index, { exact: true })).toBeVisible()

    // The poster.
    const poster = tile.locator("img")
    await expect(poster).toHaveCount(1)
    await expect(poster).toHaveAttribute("src", entry.poster)

    // The play affordance.
    await expect(
      tile.getByRole("link", { name: `Play video: ${entry.title}` }),
    ).toBeVisible()
  }
})

test("the posters are local, and the app serves them", async ({ page, visit, request }) => {
  await visit({ theme: "light" })

  const posters = page.locator("#made-with").locator('img[src^="/images/films/"]')
  await expect(posters).toHaveCount(3)

  for (const entry of proof.entries) {
    const response = await request.get(entry.poster)

    expect(response.status(), `${entry.poster} is not served`).toBe(200)
  }
})

test("each play control is a labelled control that opens the film", async ({
  page,
  visit,
}) => {
  await visit({ theme: "light" })

  for (const entry of proof.entries) {
    const control = page
      .locator("#made-with")
      .getByRole("link", { name: `Play video: ${entry.title}` })

    await expect(control).toBeVisible()
    await expect(control).toHaveAttribute("href", entry.href)
    await expect(control).toHaveAttribute("target", "_blank")
    await expect(control).toHaveAttribute("rel", "noopener noreferrer")
  }
})

test("the grid is one column on a phone and three from the large breakpoint", async ({
  page,
  visit,
}) => {
  await visit({ viewport: { width: 390, height: 844 } })

  const phone = await tileBoxes(page)

  expect(phone[0].left).toBeCloseTo(phone[1].left, 0)
  expect(phone[1].left).toBeCloseTo(phone[2].left, 0)
  expect(phone[1].top).toBeGreaterThan(phone[0].bottom)
  expect(phone[2].top).toBeGreaterThan(phone[1].bottom)

  await visit({ viewport: { width: 1024, height: 900 } })

  const wide = await tileBoxes(page)

  expect(wide[0].top).toBeCloseTo(wide[1].top, 0)
  expect(wide[1].top).toBeCloseTo(wide[2].top, 0)
  expect(new Set(wide.map((tile) => Math.round(tile.left))).size).toBe(3)
})
