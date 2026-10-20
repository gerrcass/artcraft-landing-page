import type { Page } from "@playwright/test"

import { expect, test } from "./fixtures"

/**
 * The marks the choreography tells apart.
 *
 * The sections that carry them are landing in parallel, so the test does not
 * depend on any of them being on the page: it injects an element carrying
 * each mark and asserts that the choreography treats that mark the way it
 * means.
 */
const MARKS = [
  "data-reveal",
  "data-reveal-group",
  "data-draw-rule",
  "data-draw-tick",
  "data-draw-eyebrow",
] as const

/** The probes the test injects, and where it finds them again. */
const PROBE = {
  reveal: "#probe-reveal",
  group: "#probe-group",
  groupChild: "#probe-group-child",
  rule: "#probe-rule",
  tick: "#probe-tick",
  eyebrow: "#probe-eyebrow",
  hover: "#probe-hover",
}

/**
 * Injects one element carrying each mark, well below the fold, so that the
 * test can watch each of them arrive.
 */
async function injectProbes(page: Page): Promise<void> {
  await page.evaluate(() => {
    const host = document.createElement("div")
    host.id = "probe-host"
    host.style.marginTop = "3000px"

    const reveal = document.createElement("div")
    reveal.id = "probe-reveal"
    reveal.setAttribute("data-reveal", "true")
    reveal.textContent = "A reveal"

    const group = document.createElement("div")
    group.id = "probe-group"
    group.setAttribute("data-reveal-group", "true")

    const groupChild = document.createElement("div")
    groupChild.id = "probe-group-child"
    groupChild.setAttribute("data-reveal", "true")
    groupChild.textContent = "A reveal in a group"
    group.append(groupChild)

    const rule = document.createElement("div")
    rule.id = "probe-rule"
    rule.setAttribute("data-draw-rule", "true")
    rule.style.height = "1px"
    rule.style.width = "160px"
    rule.style.background = "currentColor"

    const tick = document.createElement("div")
    tick.id = "probe-tick"
    tick.setAttribute("data-draw-tick", "true")
    tick.className = "tick"
    tick.style.position = "relative"

    const eyebrow = document.createElement("div")
    eyebrow.id = "probe-eyebrow"
    eyebrow.setAttribute("data-draw-eyebrow", "true")
    eyebrow.textContent = "A section eyebrow"

    // A spacer, so that the probes can be scrolled to the middle of the
    // viewport rather than resting at the end of the document.
    const spacer = document.createElement("div")
    spacer.style.height = "2000px"

    host.append(reveal, group, rule, tick, eyebrow, spacer)
    document.body.append(host)
  })
}

/** Puts an element in the middle of the viewport. */
async function scrollTo(page: Page, selector: string): Promise<void> {
  await page.locator(selector).evaluate((element) => {
    element.scrollIntoView({ block: "center", behavior: "instant" })
  })
}

/** A computed property of an element. */
async function computed(
  page: Page,
  selector: string,
  property: string,
): Promise<string> {
  return page
    .locator(selector)
    .first()
    .evaluate(
      (element, name) => getComputedStyle(element).getPropertyValue(name),
      property,
    )
}

/** The scale a computed transform applies on each axis. */
function scales(transform: string): { x: number; y: number } {
  if (transform === "none") {
    return { x: 1, y: 1 }
  }

  const match = transform.match(/^matrix\(([^)]+)\)$/)
  if (!match) {
    return { x: 1, y: 1 }
  }

  const [a, , , d] = match[1].split(",").map((value) => Number(value.trim()))

  return { x: a, y: d }
}

/** A computed duration in seconds. */
function seconds(duration: string): number {
  const value = Number.parseFloat(duration)
  return Number.isNaN(value) ? Number.POSITIVE_INFINITY : value
}

test("a reveal below the fold is hidden, and is revealed when it is scrolled into view", async ({
  page,
  visit,
}) => {
  await visit({ theme: "light" })
  await injectProbes(page)

  const reveal = page.locator(PROBE.reveal)

  await expect(reveal).toHaveCSS("opacity", "0")

  await scrollTo(page, PROBE.reveal)

  await expect(reveal).toHaveCSS("opacity", "1")
})

test("the observer is the fallback where the browser has no scroll-driven animations", async ({
  page,
}) => {
  // A browser that cannot tie the Reveal to a scroll position.
  await page.addInitScript(() => {
    const original = CSS.supports.bind(CSS)
    CSS.supports = ((
      condition: string,
      value?: string,
    ) => {
      if (condition === "animation-timeline: view()") {
        return false
      }

      return value === undefined
        ? original(condition)
        : original(condition, value)
    }) as typeof CSS.supports
  })

  await page.goto("/")
  await injectProbes(page)

  // And without the scroll-driven alternative in the CSS either, so that the
  // observer is the only thing that can reveal the element.
  await page.addStyleTag({
    content: "[data-reveal] { animation: none !important; }",
  })

  const reveal = page.locator(PROBE.reveal)

  await expect(reveal).toHaveCSS("opacity", "0")

  await scrollTo(page, PROBE.reveal)

  await expect(reveal).toHaveCSS("opacity", "1")
})

test("a reveal group reveals its children together", async ({ page, visit }) => {
  await visit({ theme: "light" })
  await injectProbes(page)

  const child = page.locator(PROBE.groupChild)

  await expect(child).toHaveCSS("opacity", "0")

  await scrollTo(page, PROBE.group)

  await expect(child).toHaveCSS("opacity", "1")
})

test("a drawing rule scales in from the left", async ({ page, visit }) => {
  await visit({ theme: "light" })
  await injectProbes(page)

  await expect
    .poll(async () => scales(await computed(page, PROBE.rule, "transform")))
    .toEqual({ x: 0, y: 1 })

  await scrollTo(page, PROBE.rule)

  await expect
    .poll(async () => scales(await computed(page, PROBE.rule, "transform")))
    .toEqual({ x: 1, y: 1 })
})

test("a drawing tick scales in", async ({ page, visit }) => {
  await visit({ theme: "light" })
  await injectProbes(page)

  await expect
    .poll(async () => scales(await computed(page, PROBE.tick, "transform")))
    .toEqual({ x: 0, y: 0 })

  await scrollTo(page, PROBE.tick)

  await expect
    .poll(async () => scales(await computed(page, PROBE.tick, "transform")))
    .toEqual({ x: 1, y: 1 })
})

test("a drawing eyebrow fades and slides in", async ({ page, visit }) => {
  await visit({ theme: "light" })
  await injectProbes(page)

  await expect(page.locator(PROBE.eyebrow)).toHaveCSS("opacity", "0")

  await scrollTo(page, PROBE.eyebrow)

  await expect(page.locator(PROBE.eyebrow)).toHaveCSS("opacity", "1")
})

test("the page carries an element for every mark the choreography knows", async ({
  page,
  visit,
}) => {
  await visit({ theme: "light" })
  await injectProbes(page)

  for (const mark of MARKS) {
    await expect(page.locator(`[${mark}]`).first()).toBeAttached()
  }
})

test("the page's own drawing marks are drawn once they are in view", async ({
  page,
  visit,
}) => {
  await visit({ theme: "light" })

  // The Frame's ticks are on the page from the start — they are the marks
  // the choreography finds without being told about them. The hero fills the
  // first screen, so the first Frame is below the fold until it is scrolled
  // to.
  const tick = page.locator("[data-draw-tick]").first()
  await expect(tick).toBeAttached()

  await tick.evaluate((element) =>
    element.scrollIntoView({ block: "center", behavior: "instant" }),
  )

  await expect
    .poll(async () => scales(await computed(page, "[data-draw-tick]", "transform")))
    .toEqual({ x: 1, y: 1 })
})

test.describe("with a reduced motion preference", () => {
  test.use({ reducedMotion: "reduce" })

  test("a reveal is in its final state, with no transition", async ({
    page,
    visit,
  }) => {
    await visit({ theme: "light" })
    await injectProbes(page)

    const reveal = page.locator(PROBE.reveal)

    await expect(reveal).toHaveCSS("opacity", "1")
    await expect
      .poll(async () => seconds(await computed(page, PROBE.reveal, "transition-duration")))
      .toBeLessThan(0.05)
  })

  test("nothing is left hidden", async ({ page, visit }) => {
    await visit({ theme: "light" })
    await injectProbes(page)

    const hidden = await page
      .locator("[data-reveal]")
      .evaluateAll((elements) =>
        elements.filter(
          (element) => getComputedStyle(element).opacity !== "1",
        ).length,
      )

    expect(hidden).toBe(0)
  })

  test("the drawing marks are in their final state", async ({ page, visit }) => {
    await visit({ theme: "light" })
    await injectProbes(page)

    await expect
      .poll(async () => scales(await computed(page, PROBE.rule, "transform")))
      .toEqual({ x: 1, y: 1 })

    await expect
      .poll(async () => scales(await computed(page, PROBE.tick, "transform")))
      .toEqual({ x: 1, y: 1 })

    await expect(page.locator(PROBE.eyebrow)).toHaveCSS("opacity", "1")
  })

  test("nothing moves on hover", async ({ page, visit }) => {
    await visit({ theme: "light" })

    await page.evaluate(() => {
      const probe = document.createElement("div")
      probe.id = "probe-hover"
      probe.style.position = "fixed"
      probe.style.top = "40%"
      probe.style.left = "40%"
      probe.style.width = "120px"
      probe.style.height = "60px"
      probe.style.background = "currentColor"
      document.body.append(probe)

      const style = document.createElement("style")
      style.textContent = `
        #probe-hover { transition: transform 200ms linear; }
        #probe-hover:hover { transform: translateY(-40px); }
      `
      document.head.append(style)
    })

    await page.locator(PROBE.hover).hover()

    const transform = await computed(page, PROBE.hover, "transform")
    expect(transform).toBe("none")
  })
})

test("a hover transform is not suppressed when motion is allowed", async ({
  page,
  visit,
}) => {
  await visit({ theme: "light" })

  await page.evaluate(() => {
    const probe = document.createElement("div")
    probe.id = "probe-hover"
    probe.style.position = "fixed"
    probe.style.top = "40%"
    probe.style.left = "40%"
    probe.style.width = "120px"
    probe.style.height = "60px"
    probe.style.background = "currentColor"
    document.body.append(probe)

    const style = document.createElement("style")
    style.textContent = `
      #probe-hover { transition: transform 200ms linear; }
      #probe-hover:hover { transform: translateY(-40px); }
    `
    document.head.append(style)
  })

  await page.locator(PROBE.hover).hover()

  await expect
    .poll(async () => scales(await computed(page, PROBE.hover, "transform")))
    .toEqual({ x: 1, y: 1 })

  const transform = await computed(page, PROBE.hover, "transform")
  expect(transform).not.toBe("none")
})
