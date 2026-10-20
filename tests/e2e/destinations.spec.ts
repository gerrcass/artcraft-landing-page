import type { Page } from "@playwright/test"

import { expect, test, viewports } from "./fixtures"

/**
 * The secondary destinations.
 *
 * The clone is one route — the landing page — and the other pages of the
 * original site are not implemented here. Every destination that is not the
 * landing page itself is therefore a destination on the original site, and it
 * has to resolve there: a root-relative path would ask this origin for a page
 * it does not have, and the visitor would get a 404.
 *
 * The landing page's own link — "Home" — stays where it is: it is this page.
 */

/** The original site's origin. */
const ORIGINAL = "https://getartcraft.com"

/**
 * The pages of the original site the landing page offers as destinations.
 *
 * These are the original's own pages: the Craft Apps pages, the Resources
 * pages, pricing, download and support.
 */
const ORIGINAL_PAGES = [
  "/apps",
  "/apps/cadcraft",
  "/apps/deckcraft",
  "/apps/designcraft",
  "/apps/effectcraft",
  "/apps/figcraft",
  "/apps/filmcraft",
  "/apps/gridcraft",
  "/apps/lightcraft",
  "/apps/pdfcraft",
  "/apps/photocraft",
  "/apps/soundcraft",
  "/apps/vectorcraft",
  "/apps/wordcraft",
  "/download",
  "/faq",
  "/news",
  "/press-kit",
  "/pricing",
  "/support",
  "/tutorials",
]

/**
 * Every link the page renders, with the destination it points at and the way
 * it opens.
 *
 * The dropdown panels are in the document even while they are closed, so the
 * destinations behind them are counted too: they are destinations the visitor
 * is offered, and they have to resolve as well.
 */
async function links(page: Page, scope?: string) {
  const locator = scope
    ? page.locator(scope).locator("a[href]")
    : page.locator("a[href]")

  return locator.evaluateAll((nodes) =>
    nodes.map((node) => ({
      href: node.getAttribute("href") ?? "",
      target: node.getAttribute("target"),
      rel: node.getAttribute("rel"),
    })),
  )
}

test("no destination is a root-relative path, except the landing page's own link", async ({
  page,
  visit,
}) => {
  await visit({ viewport: viewports.desktop })

  const destinations = (await links(page)).map((link) => link.href)

  const relative = destinations.filter(
    (href) => href.startsWith("/") && href !== "/",
  )

  expect(
    relative,
    "these destinations ask this origin for a page it does not have",
  ).toEqual([])
})

test("the destinations that are pages of the original site resolve on the original site", async ({
  page,
  visit,
}) => {
  await visit({ viewport: viewports.desktop })

  const destinations = (await links(page)).map((link) => link.href)

  const pages = destinations
    .filter((href) => href.startsWith(`${ORIGINAL}/`))
    .map((href) => new URL(href).pathname)

  expect([...new Set(pages)].sort()).toEqual([...ORIGINAL_PAGES].sort())
})

test("the destinations that leave the site open in a new tab, and say so safely", async ({
  page,
  visit,
}) => {
  await visit({ viewport: viewports.desktop })

  const leaving = (await links(page)).filter((link) =>
    link.href.startsWith("http"),
  )

  expect(leaving.length).toBeGreaterThan(0)

  for (const link of leaving) {
    expect(link.target, `${link.href} does not open in a new tab`).toBe("_blank")
    expect(link.rel, `${link.href} does not carry the safe rel`).toContain(
      "noopener",
    )
    expect(link.rel, `${link.href} does not carry the safe rel`).toContain(
      "noreferrer",
    )
  }
})

test("the drawer's destinations resolve on the original site too", async ({
  page,
  visit,
}) => {
  await visit({ viewport: viewports.mobile })

  await page.getByRole("button", { name: "Open main menu" }).click()
  await expect(page.locator("#mobile-nav")).toBeVisible()

  const destinations = (await links(page, "#mobile-nav")).map((link) => link.href)

  const relative = destinations.filter(
    (href) => href.startsWith("/") && href !== "/",
  )

  expect(
    relative,
    "these destinations ask this origin for a page it does not have",
  ).toEqual([])

  const pages = destinations
    .filter((href) => href.startsWith(`${ORIGINAL}/`))
    .map((href) => new URL(href).pathname)

  expect([...new Set(pages)].sort()).toEqual([...ORIGINAL_PAGES].sort())
})
