import type { Page } from "@playwright/test"

import { footer, site } from "@/data/site"

import { expect, test } from "./fixtures"

/**
 * The footer: the page's end — who made this, how to reach them, and every
 * destination grouped by what it is about.
 *
 * Every assertion here is made through the rendered page: the roles and
 * accessible names a visitor's screen reader announces, the text and the
 * destinations they can follow, and the boxes the groups occupy.
 */

/** The four labelled groups, in the order the original lists them. */
const groups = footer.groups

/** The bounding box of every navigation group, in order. */
async function groupBoxes(page: Page) {
  const boxes = []

  for (const group of groups) {
    const nav = page.getByRole("navigation", { name: group.label, exact: true })
    const box = await nav.boundingBox()

    expect(box, `the ${group.label} group is not rendered`).not.toBeNull()
    boxes.push(box!)
  }

  return boxes
}

test("the four navigation groups are present and each exposes an accessible name", async ({
  page,
  visit,
}) => {
  await visit()

  await expect(page.locator("footer").getByRole("navigation")).toHaveCount(4)

  for (const group of groups) {
    const nav = page.getByRole("navigation", { name: group.label, exact: true })

    await expect(nav).toBeVisible()
    await expect(nav).toHaveAccessibleName(group.label)
  }
})

test("each group lists its destinations", async ({ page, visit }) => {
  await visit()

  for (const group of groups) {
    const nav = page.getByRole("navigation", { name: group.label, exact: true })

    await expect(nav.getByRole("link")).toHaveCount(group.links.length)

    for (const link of group.links) {
      const anchor = nav.getByRole("link", { name: link.label, exact: true })

      await expect(anchor).toBeVisible()
      await expect(anchor).toHaveAttribute("href", link.href)
    }
  }
})

test("the brand cell shows the logo, the tagline, and the contact address", async ({
  page,
  visit,
}) => {
  await visit()

  const footerElement = page.locator("footer")

  await expect(
    footerElement.getByRole("img", { name: "ArtCraft" }),
  ).toBeVisible()
  await expect(footerElement.getByText(site.tagline)).toBeVisible()
  await expect(
    footerElement.getByRole("link", { name: site.email }),
  ).toHaveAttribute("href", `mailto:${site.email}`)
})

test("the closing bar carries the copyright line and the maker's mark", async ({
  page,
  visit,
}) => {
  await visit()

  const footerElement = page.locator("footer")

  await expect(footerElement.getByText(footer.copyright)).toBeVisible()
  await expect(footerElement.getByText(footer.maker)).toBeVisible()
})

test("the footer is separated from the page by a hairline", async ({
  page,
  visit,
}) => {
  for (const theme of ["light", "dark"] as const) {
    await visit({ theme })

    const hairline = await page.locator("footer").evaluate((element) => {
      const style = getComputedStyle(element)
      return { width: style.borderTopWidth, color: style.borderTopColor }
    })

    expect(hairline.width, `the hairline is not 1px in the ${theme} theme`).toBe(
      "1px",
    )

    // The hairline's colour is the theme's line token, read from the token
    // layer itself rather than from a literal.
    const token = await page.evaluate(() => {
      const probe = document.createElement("div")
      probe.style.borderTopWidth = "1px"
      probe.style.borderTopStyle = "solid"
      probe.style.borderTopColor = "var(--line)"
      document.body.append(probe)
      const color = getComputedStyle(probe).borderTopColor
      probe.remove()
      return color
    })

    expect(hairline.color, `the hairline is not the line token in the ${theme} theme`).toBe(
      token,
    )
  }
})

test("the footer runs its groups in one column on a phone", async ({
  page,
  visit,
}) => {
  await visit({ viewport: { width: 390, height: 844 } })

  const boxes = await groupBoxes(page)
  const columns = new Set(boxes.map((box) => Math.round(box.x)))
  const rows = new Set(boxes.map((box) => Math.round(box.y)))

  expect(columns.size, "the groups are not in one column").toBe(1)
  expect(rows.size, "the groups are not stacked one per row").toBe(4)
})

test("the footer runs its groups four across from the medium breakpoint", async ({
  page,
  visit,
}) => {
  await visit({ viewport: { width: 768, height: 1024 } })

  const boxes = await groupBoxes(page)
  const columns = new Set(boxes.map((box) => Math.round(box.x)))
  const rows = new Set(boxes.map((box) => Math.round(box.y)))

  expect(rows.size, "the groups are not on one row").toBe(1)
  expect(columns.size, "the groups are not four across").toBe(4)
})

test("the brand cell takes the double-width track at the large breakpoint", async ({
  page,
  visit,
}) => {
  await visit({ viewport: { width: 1024, height: 900 } })

  const brand = await page
    .locator("footer")
    .getByRole("img", { name: "ArtCraft" })
    .locator("xpath=..")
    .boundingBox()
  const group = await page
    .getByRole("navigation", { name: "Product", exact: true })
    .boundingBox()

  expect(brand).not.toBeNull()
  expect(group).not.toBeNull()
  expect(
    Math.abs(brand!.width - group!.width * 2),
    "the brand cell is not on the double-width track",
  ).toBeLessThanOrEqual(2)
})
