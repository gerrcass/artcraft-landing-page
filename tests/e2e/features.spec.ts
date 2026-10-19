import type { Locator, Page } from "@playwright/test"

import { features, headlineText, type FeatureEntry } from "@/data/site"

import { expect, test } from "./fixtures"

const headline = headlineText(features.headline)

/** The seven entries that carry a video, read from the content module. */
const videoEntries = features.entries.filter(
  (entry): entry is Extract<FeatureEntry, { kind: "video" }> =>
    entry.kind === "video",
)

/**
 * The Section Bar's left label: the section number, a slash, and the subject.
 *
 * The slash is set apart from its neighbours by margins rather than by spaces,
 * so the label's text is matched with the spacing left open.
 */
const barLabel = new RegExp(
  `^${features.bar.number}\\s*/\\s*${features.bar.subject}$`,
)

/** The Features section. */
function section(page: Page): Locator {
  return page.locator("#features")
}

/** The grid of Feature Cards. */
function grid(page: Page): Locator {
  return section(page).locator('[data-reveal-group="true"]')
}

/** The cells of the grid: the seven Feature Cards and the link card. */
function cells(page: Page): Locator {
  return grid(page).locator(":scope > article, :scope > a")
}

/** The bounding box of each cell of the grid, in the order they are rendered. */
async function cellBoxes(page: Page) {
  return cells(page).evaluateAll((nodes) =>
    nodes.map((node) => {
      const rect = node.getBoundingClientRect()
      return { left: rect.left, right: rect.right, top: rect.top, bottom: rect.bottom }
    }),
  )
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

test("the Section Bar names the section and carries its descriptor", async ({
  page,
  visit,
}) => {
  await visit({ viewport: { width: 1024, height: 900 }, theme: "light" })

  await expect(section(page).getByText(barLabel)).toBeVisible()
  await expect(
    section(page).getByText(features.bar.descriptor, { exact: true }),
  ).toBeVisible()
})

test("the Section Bar pins itself directly beneath the header", async ({
  page,
  visit,
}) => {
  await visit({ theme: "light" })

  const bar = section(page).locator('[data-draw-eyebrow="true"]')

  const style = await bar.evaluate((node) => {
    const computed = getComputedStyle(node)
    return { position: computed.position, top: computed.top }
  })

  // The header is 48px tall, so the bar sticks just beneath it.
  expect(style.position).toBe("sticky")
  expect(style.top).toBe("48px")
})

test("the Section Bar's descriptor is hidden on the smallest breakpoint, and shown from the small one", async ({
  page,
  visit,
}) => {
  await visit({ viewport: { width: 390, height: 844 } })

  const descriptor = section(page).getByText(features.bar.descriptor, {
    exact: true,
  })

  await expect(descriptor).toBeAttached()
  await expect(descriptor).toBeHidden()

  await page.setViewportSize({ width: 640, height: 900 })

  await expect(descriptor).toBeVisible()
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
    .getByText(features.headline.accent, { exact: true })

  const style = await accent.evaluate((element) => {
    const computed = getComputedStyle(element)
    return { fontFamily: computed.fontFamily, fontStyle: computed.fontStyle }
  })

  expect(style.fontFamily).toContain("Instrument Serif")
  expect(style.fontStyle).toBe("italic")
})

test("the section explains itself in a paragraph", async ({ page, visit }) => {
  await visit({ theme: "light" })

  await expect(page.getByText(features.body, { exact: true })).toBeVisible()
})

test("eight Feature Cards render, each with the content module's copy", async ({
  page,
  visit,
}) => {
  await visit({ theme: "light" })

  const cards = cells(page)

  await expect(cards).toHaveCount(features.entries.length)
  await expect(cards).toHaveCount(8)

  for (const [index, entry] of features.entries.entries()) {
    const card = cards.nth(index)

    // The meta row: the category on the left, the index on the right.
    const labels = card.locator("p.hud-label")

    await expect(labels.nth(0)).toHaveText(entry.category)
    await expect(labels.nth(1)).toHaveText(entry.index)

    // The title, and the paragraph that says what the feature is for.
    await expect(
      card.getByRole("heading", { level: 3, name: entry.title }),
    ).toBeVisible()
    await expect(card.locator("p:not(.hud-label)")).toHaveText(entry.body)
  }
})

test("each Media Well is a 16:9 box", async ({ page, visit }) => {
  await visit({ theme: "light" })

  expect(videoEntries).toHaveLength(7)

  const wells = section(page).locator("[data-media-well]")
  const videos = section(page).locator("video")

  // Every Media Well that holds a video is marked, and no others are.
  await expect(wells).toHaveCount(videoEntries.length)
  await expect(videos).toHaveCount(videoEntries.length)

  for (const well of await wells.all()) {
    const box = await well.boundingBox()

    expect(box, "a Media Well has no box").not.toBeNull()
    expect(box!.width / box!.height).toBeCloseTo(16 / 9, 2)
  }
})

test("each video fills its Media Well, and is cropped to cover", async ({
  page,
  visit,
}) => {
  await visit({ theme: "light" })

  const videos = section(page).locator("video")

  await expect(videos).toHaveCount(videoEntries.length)

  for (const video of await videos.all()) {
    const box = await video.boundingBox()
    const wellBox = await video.locator("xpath=..").boundingBox()

    expect(box, "a video has no box").not.toBeNull()
    expect(wellBox, "a video has no Media Well").not.toBeNull()

    // The video covers the well, and is cropped rather than letterboxed.
    expect(box!.width).toBeCloseTo(wellBox!.width, 0)
    expect(box!.height).toBeCloseTo(wellBox!.height, 0)

    const objectFit = await video.evaluate(
      (node) => getComputedStyle(node).objectFit,
    )
    expect(objectFit).toBe("cover")
  }
})

test("each video is muted, looping, inline, and not preloaded", async ({
  page,
  visit,
}) => {
  await visit({ theme: "light" })

  for (const [index, entry] of features.entries.entries()) {
    if (entry.kind !== "video") continue

    const video = cells(page).nth(index).locator("video")

    await expect(video).toHaveCount(1)
    await expect(video).toHaveJSProperty("muted", true)
    await expect(video).toHaveJSProperty("loop", true)
    await expect(video).toHaveJSProperty("playsInline", true)
    await expect(video).toHaveAttribute("preload", "none")
  }
})

test("each video is named for the feature it demonstrates", async ({
  page,
  visit,
}) => {
  await visit({ theme: "light" })

  for (const [index, entry] of features.entries.entries()) {
    if (entry.kind !== "video") continue

    const video = cells(page).nth(index).locator("video")

    await expect(video).toHaveAttribute("aria-label", entry.video.label)
    await expect(video).toHaveAttribute("src", entry.video.src)
  }
})

test("the grid's cells are separated by 1px rules", async ({ page, visit }) => {
  await visit({ viewport: { width: 1440, height: 900 } })

  const style = await grid(page).evaluate((node) => {
    const computed = getComputedStyle(node)
    return {
      rowGap: computed.rowGap,
      columnGap: computed.columnGap,
      background: computed.backgroundColor,
    }
  })

  // The rule is a hairline of the line token, not a gutter of nothing.
  expect(style.rowGap).toBe("1px")
  expect(style.columnGap).toBe("1px")
  expect(style.background).toBe(await tokenColor(page, "--line"))

  // And it is a real rule: two cells side by side are one pixel apart, and
  // two cells one row apart are one pixel apart.
  const boxes = await cellBoxes(page)

  expect(boxes[1].left - boxes[0].right).toBeCloseTo(1, 0)
  expect(boxes[2].top - boxes[1].bottom).toBeCloseTo(1, 0)
})

test("the grid is one column on a phone and two from the medium breakpoint", async ({
  page,
  visit,
}) => {
  await visit({ viewport: { width: 390, height: 844 } })

  const phone = await cellBoxes(page)

  expect(phone[0].left).toBeCloseTo(phone[1].left, 0)
  expect(phone[1].top).toBeGreaterThan(phone[0].bottom)

  await visit({ viewport: { width: 768, height: 1024 } })

  const tablet = await cellBoxes(page)

  expect(tablet[0].top).toBeCloseTo(tablet[1].top, 0)
  expect(tablet[1].left).toBeGreaterThan(tablet[0].right)
  expect(new Set(tablet.map((cell) => Math.round(cell.left))).size).toBe(2)
})

test("the eighth card is the 'More in the app' card, and it is a link rather than a video", async ({
  page,
  visit,
}) => {
  await visit({ theme: "light" })

  const last = cells(page).nth(features.entries.length - 1)
  const entry = features.entries[features.entries.length - 1]

  expect(entry.kind).toBe("link")
  if (entry.kind !== "link") return

  await expect(last).toHaveRole("link")
  await expect(last).toHaveAttribute("href", entry.action.href)
  await expect(last.locator("video")).toHaveCount(0)

  // The link card shows where it leads.
  await expect(
    last.getByText(entry.action.label, { exact: true }),
  ).toBeVisible()
})

test("the eighth card renders the arrow affordance", async ({ page, visit }) => {
  await visit({ theme: "light" })

  const last = cells(page).nth(features.entries.length - 1)

  const arrow = last.locator("svg")

  await expect(arrow).toBeVisible()

  const box = await arrow.boundingBox()
  expect(box!.width).toBeCloseTo(24, 0)
  expect(box!.height).toBeCloseTo(24, 0)

  // The arrow sits in a bordered square.
  const square = arrow.locator("xpath=..")

  const style = await square.evaluate((node) => {
    const computed = getComputedStyle(node)
    return { borderWidth: computed.borderTopWidth, display: computed.display }
  })

  expect(style.borderWidth).toBe("1px")
  expect(style.display).toBe("flex")
})
