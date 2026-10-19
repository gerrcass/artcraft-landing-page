import { AxeBuilder } from "@axe-core/playwright"
import type { Page } from "@playwright/test"

import {
  features,
  footer,
  headlineText,
  hero,
  ownership,
  proof,
  skipLink,
  start,
} from "@/data/site"

import { expect, test } from "./fixtures"

/**
 * Accessibility: the page as a keyboard or a screen reader finds it.
 *
 * Everything here is asserted through the rendered page — the roles and
 * accessible names a visitor's screen reader announces, the order the headings
 * are read in, the focus ring the keyboard shows, the colours the eye reads,
 * and an automated scan of the whole thing.
 */

/** A colour, in the channels a contrast ratio is computed from. */
type Colour = { r: number; g: number; b: number; a: number }

/**
 * The token pairs the page's text is painted in, and the background each one
 * is read against.
 *
 * The muted ink and the faint ink are alpha colours: they are read as a
 * composite over the background, not as the colour on their own.
 */
const TEXT_PAIRS = [
  { name: "ink on bg", fg: "--ink", bg: "--bg" },
  { name: "ink-strong on bg", fg: "--ink-strong", bg: "--bg" },
  { name: "muted on bg", fg: "--muted", bg: "--bg" },
  { name: "accent-ink on bg", fg: "--accent-ink", bg: "--bg" },
  { name: "invert-fg on invert-bg", fg: "--invert-fg", bg: "--invert-bg" },
]

/** The inks the page's text may be painted in. */
const ALLOWED_INKS = TEXT_PAIRS.map((pair) => pair.fg)

/** The ratio AA asks of body text. */
const AA_BODY = 4.5

/** The elements the keyboard can reach. */
const FOCUSABLE = [
  "a[href]",
  "button:not([disabled])",
  "input:not([disabled])",
  "select:not([disabled])",
  "textarea:not([disabled])",
  '[tabindex]:not([tabindex="-1"])',
].join(", ")

/** Parses a CSS colour — a hex or an rgb() — into its channels. */
function parseColour(value: string): Colour {
  const text = value.trim()

  if (text.startsWith("#")) {
    const hex = text.slice(1)
    const pair = (part: string) => parseInt(part, 16)
    const short = (part: string) => parseInt(part + part, 16)

    if (hex.length === 3) {
      return { r: short(hex[0]), g: short(hex[1]), b: short(hex[2]), a: 1 }
    }

    if (hex.length === 4) {
      return {
        r: short(hex[0]),
        g: short(hex[1]),
        b: short(hex[2]),
        a: short(hex[3]) / 255,
      }
    }

    if (hex.length === 6) {
      return {
        r: pair(hex.slice(0, 2)),
        g: pair(hex.slice(2, 4)),
        b: pair(hex.slice(4, 6)),
        a: 1,
      }
    }

    if (hex.length === 8) {
      return {
        r: pair(hex.slice(0, 2)),
        g: pair(hex.slice(2, 4)),
        b: pair(hex.slice(4, 6)),
        a: pair(hex.slice(6, 8)) / 255,
      }
    }
  }

  const parts = (text.match(/[\d.]+/g) ?? []).map(Number)

  if (parts.length >= 3) {
    return {
      r: parts[0],
      g: parts[1],
      b: parts[2],
      a: parts.length > 3 ? parts[3] : 1,
    }
  }

  throw new Error(`Not a colour: ${value}`)
}

/** Puts one colour over another, the way a browser composites them. */
function composite(over: Colour, under: Colour): Colour {
  const alpha = over.a + under.a * (1 - over.a)

  if (alpha === 0) {
    return { r: 0, g: 0, b: 0, a: 0 }
  }

  return {
    r: (over.r * over.a + under.r * under.a * (1 - over.a)) / alpha,
    g: (over.g * over.a + under.g * under.a * (1 - over.a)) / alpha,
    b: (over.b * over.a + under.b * under.a * (1 - over.a)) / alpha,
    a: alpha,
  }
}

/** The relative luminance of a colour. */
function luminance({ r, g, b }: Colour): number {
  const channel = (value: number) => {
    const c = value / 255

    return c <= 0.03928 ? c / 12.92 : Math.pow((c + 0.055) / 1.055, 2.4)
  }

  return 0.2126 * channel(r) + 0.7152 * channel(g) + 0.0722 * channel(b)
}

/** The contrast ratio of two colours, from 1 to 21. */
function contrastRatio(first: Colour, second: Colour): number {
  const a = luminance(first)
  const b = luminance(second)

  return (Math.max(a, b) + 0.05) / (Math.min(a, b) + 0.05)
}

/** Whether two colours are the same, allowing for rounding. */
function sameColour(first: Colour, second: Colour): boolean {
  return (
    Math.abs(first.r - second.r) < 0.5 &&
    Math.abs(first.g - second.g) < 0.5 &&
    Math.abs(first.b - second.b) < 0.5 &&
    Math.abs(first.a - second.a) < 0.005
  )
}

/** The value of a token, read off the page. */
async function tokenColour(page: Page, token: string): Promise<Colour> {
  const value = await page.evaluate(
    (name) =>
      getComputedStyle(document.documentElement).getPropertyValue(name).trim(),
    token,
  )

  return parseColour(value)
}

/** Every piece of text the page paints, with the colour it is painted in. */
async function paintedText(page: Page) {
  return page.evaluate(() => {
    const painted: { tag: string; text: string; colour: string }[] = []

    for (const element of Array.from(document.querySelectorAll<HTMLElement>("*"))) {
      const ownsText = Array.from(element.childNodes).some(
        (node) => node.nodeType === 3 && (node.textContent ?? "").trim() !== "",
      )

      if (!ownsText) {
        continue
      }

      const style = getComputedStyle(element)

      if (style.display === "none" || style.visibility === "hidden") {
        continue
      }

      painted.push({
        tag: element.tagName.toLowerCase(),
        text: (element.textContent ?? "").replace(/\s+/g, " ").trim().slice(0, 60),
        colour: style.color,
      })
    }

    return painted
  })
}

/** How many elements the keyboard can reach, in the order it reaches them. */
async function focusableCount(page: Page): Promise<number> {
  return page.evaluate((selector) => {
    return Array.from(document.querySelectorAll<HTMLElement>(selector)).filter(
      (element) => element.getClientRects().length > 0,
    ).length
  }, FOCUSABLE)
}

/**
 * Walks the page from the top to the bottom and back.
 *
 * The page reveals its content as it comes into view, so a scan taken without
 * walking the page would only ever see the first screen.
 */
async function walkThePage(page: Page): Promise<void> {
  await page.evaluate(async () => {
    const step = Math.round(window.innerHeight * 0.8)

    for (let y = 0; y < document.body.scrollHeight; y += step) {
      window.scrollTo(0, y)
      await new Promise((resolve) => setTimeout(resolve, 80))
    }

    window.scrollTo(0, 0)
    await new Promise((resolve) => setTimeout(resolve, 400))
  })
}

test("the skip link is the first thing the keyboard reaches, and it moves the focus to the content", async ({
  page,
  visit,
}) => {
  await visit()

  const link = page.getByRole("link", { name: skipLink.label, exact: true })

  await page.keyboard.press("Tab")

  await expect(link).toBeFocused()

  await page.keyboard.press("Enter")

  await expect(page.locator(`main#${skipLink.target}`)).toBeFocused()
})

test("the page exposes a header, a main and a footer", async ({ page, visit }) => {
  await visit()

  await expect(page.getByRole("banner")).toHaveCount(1)
  await expect(page.getByRole("main")).toHaveCount(1)
  await expect(page.getByRole("contentinfo")).toHaveCount(1)
})

test("the four navigation groups in the footer are named", async ({ page, visit }) => {
  await visit()

  const groups = page.getByRole("contentinfo").getByRole("navigation")

  await expect(groups).toHaveCount(footer.groups.length)

  for (const group of footer.groups) {
    await expect(
      page.getByRole("navigation", { name: group.label, exact: true }),
    ).toHaveCount(1)
  }
})

test("the heading outline is one h1, the section headlines are h2, and the card titles are h3, in document order", async ({
  page,
  visit,
}) => {
  await visit()

  const headings = await page
    .locator("h1, h2, h3")
    .evaluateAll((elements) =>
      elements.map((element) => ({
        level: Number(element.tagName.slice(1)),
        text: (element.textContent ?? "").replace(/\s+/g, " ").trim(),
      })),
    )

  const expected = [
    { level: 1, text: headlineText(hero.headline) },
    { level: 2, text: headlineText(features.headline) },
    ...features.entries.map((entry) => ({ level: 3, text: entry.title })),
    { level: 2, text: headlineText(ownership.headline) },
    ...ownership.entries.map((entry) => ({ level: 3, text: entry.title })),
    { level: 2, text: headlineText(proof.headline) },
    { level: 2, text: headlineText(start.headline) },
  ]

  expect(headings).toEqual(expected)
})

test("every interactive element shows a focus ring", async ({ page, visit }) => {
  await visit()

  const count = await focusableCount(page)

  expect(count).toBeGreaterThan(5)

  const rings: { label: string; style: string; width: string }[] = []

  for (let step = 0; step < count; step += 1) {
    await page.keyboard.press("Tab")

    const focused = await page.evaluate(() => {
      const element = document.activeElement as HTMLElement | null

      if (!element || element === document.body) {
        return null
      }

      const style = getComputedStyle(element)

      return {
        label: (
          element.getAttribute("aria-label") ??
          element.textContent ??
          ""
        )
          .replace(/\s+/g, " ")
          .trim()
          .slice(0, 60),
        style: style.outlineStyle,
        width: style.outlineWidth,
      }
    })

    if (!focused) {
      throw new Error("The focus left the page before every element was reached")
    }

    rings.push(focused)
  }

  expect(rings).toHaveLength(count)

  for (const ring of rings) {
    expect(ring.style, `the focus ring of "${ring.label}"`).not.toBe("none")
    expect(
      parseFloat(ring.width),
      `the focus ring of "${ring.label}"`,
    ).toBeGreaterThanOrEqual(2)
  }
})

test("the Orbit, the Ticks and the duplicated Marquee track are hidden from assistive technology", async ({
  page,
  visit,
}) => {
  await visit()

  const orbit = page.locator("[data-orbit]")
  await expect(orbit).toHaveAttribute("aria-hidden", "true")

  const rings = orbit.locator("svg")
  await expect(rings).toHaveCount(1)
  await expect(rings).toHaveAttribute("aria-hidden", "true")

  const tiles = orbit.locator("img")
  expect(await tiles.count()).toBeGreaterThan(0)

  for (const tile of await tiles.all()) {
    await expect(tile).toHaveAttribute("aria-hidden", "true")
  }

  const ticks = page.locator(".tick")
  expect(await ticks.count()).toBeGreaterThan(0)

  for (const tick of await ticks.all()) {
    await expect(tick).toHaveAttribute("aria-hidden", "true")
  }

  const tracks = page.locator(".marquee-track")
  await expect(tracks).toHaveCount(2)
  await expect(tracks.nth(0)).not.toHaveAttribute("aria-hidden", "true")
  await expect(tracks.nth(1)).toHaveAttribute("aria-hidden", "true")
})

test("the text inks meet AA against the background, in both themes", async ({
  page,
  visit,
}) => {
  for (const theme of ["light", "dark"] as const) {
    await visit({ theme })

    for (const pair of TEXT_PAIRS) {
      const foreground = await tokenColour(page, pair.fg)
      const background = await tokenColour(page, pair.bg)
      const ratio = contrastRatio(
        composite(foreground, background),
        background,
      )

      expect(
        ratio,
        `${theme}: ${pair.name} is ${ratio.toFixed(2)}:1`,
      ).toBeGreaterThanOrEqual(AA_BODY)
    }
  }
})

test("every text on the page is painted in an ink that meets AA", async ({
  page,
  visit,
}) => {
  for (const theme of ["light", "dark"] as const) {
    await visit({ theme })

    const inks = await Promise.all(
      ALLOWED_INKS.map(async (name) => ({
        name,
        colour: await tokenColour(page, name),
      })),
    )

    const offenders: string[] = []

    for (const text of await paintedText(page)) {
      const painted = parseColour(text.colour)
      const ink = inks.find((candidate) => sameColour(candidate.colour, painted))

      if (!ink) {
        offenders.push(`${text.tag} "${text.text}" is painted ${text.colour}`)
      }
    }

    expect(
      offenders,
      `${theme}: text painted in an ink that does not meet AA`,
    ).toEqual([])

    // The faint ink is the original's ink for its smallest labels, and it
    // cannot meet AA: 2.72:1 on the light background. It is therefore not used
    // for text, and this says so — if the token is ever changed, the number
    // has to be read again before it is used.
    const faint = await tokenColour(page, "--faint")
    const background = await tokenColour(page, "--bg")

    expect(
      contrastRatio(composite(faint, background), background),
      `${theme}: the faint ink can now meet AA`,
    ).toBeLessThan(AA_BODY)
  }
})

test("an automated accessibility scan finds no serious or critical violations", async ({
  page,
  visit,
}) => {
  for (const theme of ["light", "dark"] as const) {
    await visit({ theme })
    await walkThePage(page)

    const results = await new AxeBuilder({ page }).analyze()

    const serious = results.violations
      .filter(
        (violation) =>
          violation.impact === "serious" || violation.impact === "critical",
      )
      .map((violation) => ({
        id: violation.id,
        impact: violation.impact,
        help: violation.help,
        nodes: violation.nodes.map((node) => node.target.join(" ")),
      }))

    expect(serious, `${theme}: the scan found serious violations`).toEqual([])
  }
})
