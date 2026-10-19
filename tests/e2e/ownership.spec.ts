import type { Page } from "@playwright/test"

import { headlineText, ownership } from "@/data/site"

import { expect, test } from "./fixtures"

const headline = headlineText(ownership.headline)

/**
 * The Section Bar's left label: the section number, a slash, and the subject.
 *
 * The slash is set apart from its neighbours by margins rather than by spaces,
 * so the label's text is matched with the spacing left open.
 */
const barLabel = new RegExp(
  `^${ownership.bar.number}\\s*/\\s*${ownership.bar.subject}$`,
)

/** The bounding box of each Ownership Card, in the order they are rendered. */
async function cardBoxes(page: Page) {
  return page
    .locator("#ownership")
    .getByRole("article")
    .evaluateAll((cards) =>
      cards.map((card) => {
        const rect = card.getBoundingClientRect()
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

  const section = page.locator("#ownership")

  await expect(section.getByText(barLabel)).toBeVisible()
  await expect(
    section.getByText(ownership.bar.descriptor, { exact: true }),
  ).toBeVisible()
})

test("the Section Bar's descriptor is hidden on the smallest breakpoint", async ({
  page,
  visit,
}) => {
  await visit({ viewport: { width: 390, height: 844 } })

  const descriptor = page
    .locator("#ownership")
    .getByText(ownership.bar.descriptor, { exact: true })

  await expect(descriptor).toBeAttached()
  await expect(descriptor).toBeHidden()
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
    .getByText(ownership.headline.accent, { exact: true })

  const style = await accent.evaluate((element) => {
    const computed = getComputedStyle(element)
    return { fontFamily: computed.fontFamily, fontStyle: computed.fontStyle }
  })

  expect(style.fontFamily).toContain("Instrument Serif")
  expect(style.fontFamily).toContain("Georgia")
  expect(style.fontStyle).toBe("italic")
})

test("the section explains itself in a paragraph", async ({ page, visit }) => {
  await visit({ theme: "light" })

  await expect(page.getByText(ownership.body, { exact: true })).toBeVisible()
})

test("three Ownership Cards render, lettered A, B and C", async ({
  page,
  visit,
}) => {
  await visit({ theme: "light" })

  const cards = page.locator("#ownership").getByRole("article")
  await expect(cards).toHaveCount(3)

  const expected = [
    { letter: "A", title: "Open source" },
    { letter: "B", title: "Yours forever" },
    { letter: "C", title: "No middleman" },
  ]

  for (const [index, entry] of expected.entries()) {
    const card = cards.nth(index)

    await expect(card.getByText(entry.letter, { exact: true })).toBeVisible()
    await expect(
      card.getByRole("heading", { level: 3, name: entry.title }),
    ).toBeVisible()
  }
})

test("the first Ownership Card links to the source", async ({ page, visit }) => {
  await visit({ theme: "light" })

  const link = page
    .locator("#ownership")
    .getByRole("article")
    .first()
    .getByRole("link", { name: "View source" })

  await expect(link).toBeVisible()
  await expect(link).toHaveAttribute(
    "href",
    "https://github.com/storytold/artcraft",
  )
})

test("the Ownership Cards stack on a phone and sit side by side from the large breakpoint", async ({
  page,
  visit,
}) => {
  await visit({ viewport: { width: 390, height: 844 } })

  const phone = await cardBoxes(page)

  expect(phone[0].left).toBeCloseTo(phone[1].left, 0)
  expect(phone[1].left).toBeCloseTo(phone[2].left, 0)
  expect(phone[1].top).toBeGreaterThan(phone[0].bottom)
  expect(phone[2].top).toBeGreaterThan(phone[1].bottom)

  await visit({ viewport: { width: 1440, height: 900 } })

  const wide = await cardBoxes(page)

  expect(wide[0].top).toBeCloseTo(wide[1].top, 0)
  expect(wide[1].top).toBeCloseTo(wide[2].top, 0)
  expect(new Set(wide.map((card) => Math.round(card.left))).size).toBe(3)
})
