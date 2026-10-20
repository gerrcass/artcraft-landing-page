import type { Page } from "@playwright/test"

import { headerAside, headerNav, launchApp } from "@/data/site"

import { expect, test, viewports } from "./fixtures"

/** The menu button in the header. */
function menuButton(page: Page) {
  return page.getByRole("button", { name: "Open main menu" })
}

/** The drawer the menu button opens. */
function drawer(page: Page) {
  return page.locator("#mobile-nav")
}

/**
 * Where the focus sits among the drawer's focusable elements, and how many
 * of them there are. A negative index means the focus is outside the drawer.
 */
async function focus(page: Page) {
  return page.evaluate(() => {
    const panel = document.querySelector("#mobile-nav")
    if (!panel) {
      return { index: -1, count: 0 }
    }

    const focusable = Array.from(
      panel.querySelectorAll<HTMLElement>('a[href], button:not([disabled])'),
    )

    return {
      index: focusable.indexOf(document.activeElement as HTMLElement),
      count: focusable.length,
    }
  })
}

/** The drawer's links, with the text and the destination they point at. */
async function links(page: Page) {
  return drawer(page)
    .getByRole("link")
    .evaluateAll((nodes) =>
      nodes.map((node) => ({
        text: (node.textContent ?? "").trim(),
        href: node.getAttribute("href"),
      })),
    )
}

/** Every piece of text the drawer shows. */
async function texts(page: Page) {
  const found = await drawer(page).locator("a, p").allTextContents()
  return found.map((text) => text.trim())
}

test("below the large breakpoint the primary navigation is hidden and the menu button shows; at or above it the reverse is true", async ({
  page,
  visit,
}) => {
  await visit({ viewport: viewports.mobile })

  const primary = page.getByRole("navigation", { name: "Main" })

  await expect(primary).toBeHidden()
  await expect(menuButton(page)).toBeVisible()

  await page.setViewportSize({ width: 1024, height: 900 })

  await expect(primary).toBeVisible()
  await expect(menuButton(page)).toBeHidden()
})

test("the menu button opens a drawer holding every navigation destination", async ({
  page,
  visit,
}) => {
  await visit({ viewport: viewports.mobile })

  await menuButton(page).click()

  const panel = drawer(page)
  await expect(panel).toBeVisible()

  // Every label the content module names is in the drawer.
  const shown = await texts(page)

  for (const entry of headerNav) {
    expect(shown).toContain(entry.label)
  }

  for (const entry of headerAside) {
    expect(shown).toContain(entry.label)
  }

  // Every destination is a link that points where it says it points.
  const destinations = [
    ...headerNav.flatMap((entry) => entry.children ?? [entry]),
    ...headerAside,
    launchApp,
  ]

  for (const destination of destinations) {
    expect(await links(page)).toContainEqual({
      text: destination.label,
      href: destination.href,
    })
  }
})

test("focus is trapped inside the drawer while it is open", async ({
  page,
  visit,
}) => {
  await visit({ viewport: viewports.mobile })

  await menuButton(page).click()

  const panel = drawer(page)
  await expect(panel).toBeVisible()

  // The focus goes into the drawer when it opens.
  expect((await focus(page)).index).toBeGreaterThanOrEqual(0)

  // Tab from the last focusable element wraps back to the first.
  await panel.locator("a[href], button").last().focus()
  await page.keyboard.press("Tab")

  const wrapped = await focus(page)
  expect(wrapped.index).toBe(0)

  // Shift+Tab from the first wraps back to the last.
  await panel.locator("a[href], button").first().focus()
  await page.keyboard.press("Shift+Tab")

  const backwards = await focus(page)
  expect(backwards.index).toBe(backwards.count - 1)

  // Tabbing all the way round never leaves the drawer.
  for (let step = 0; step < backwards.count + 2; step += 1) {
    await page.keyboard.press("Tab")

    const { index, count } = await focus(page)
    expect(index).toBeGreaterThanOrEqual(0)
    expect(index).toBeLessThan(count)
  }
})

test("Escape closes the drawer and returns the focus to the menu button", async ({
  page,
  visit,
}) => {
  await visit({ viewport: viewports.mobile })

  // The drawer is opened from the keyboard, and closed from the keyboard.
  await menuButton(page).focus()
  await page.keyboard.press("Enter")
  await expect(drawer(page)).toBeVisible()

  await page.keyboard.press("Escape")

  await expect(drawer(page)).toBeHidden()
  await expect(menuButton(page)).toBeFocused()
})

test("an outside click closes the drawer", async ({ page, visit }) => {
  await visit({ viewport: viewports.mobile })

  await menuButton(page).click()

  const panel = drawer(page)
  await expect(panel).toBeVisible()

  // A click to the side of the drawer, on the page behind it.
  const box = await panel.boundingBox()
  if (!box) {
    throw new Error("The drawer has no box")
  }

  await page.mouse.click(box.x + box.width + 20, box.y + 200)

  await expect(panel).toBeHidden()
})

test("activating a link closes the drawer", async ({ page, visit }) => {
  await visit({ viewport: viewports.mobile })

  // The link leaves the clone, so it is stubbed: the page stays where it is,
  // and the drawer has to close itself.
  await page.route("https://app.getartcraft.com/**", (route) =>
    route.fulfill({
      status: 200,
      contentType: "text/html",
      body: "<html><body>ArtCraft</body></html>",
    }),
  )

  await menuButton(page).click()

  const panel = drawer(page)
  await expect(panel).toBeVisible()

  await panel.getByRole("link", { name: "Image", exact: true }).click()

  await expect(panel).toBeHidden()
  expect(new URL(page.url()).pathname).toBe("/")
})

test("the page behind the drawer does not scroll while it is open", async ({
  page,
  visit,
}) => {
  await visit({ viewport: viewports.mobile })

  await menuButton(page).click()

  const panel = drawer(page)
  await expect(panel).toBeVisible()

  const overflow = await page.evaluate(() => getComputedStyle(document.body).overflow)
  expect(overflow).toContain("hidden")

  const box = await panel.boundingBox()
  if (!box) {
    throw new Error("The drawer has no box")
  }

  // A scroll attempt over the page behind the drawer, the way a visitor
  // makes one: the wheel lands on the veil beside the drawer.
  const beside = { x: box.x + box.width + 20, y: 600 }

  await page.mouse.move(beside.x, beside.y)
  await page.mouse.wheel(0, 600)
  await page.waitForTimeout(300)

  expect(await page.evaluate(() => window.scrollY)).toBe(0)

  // The page scrolls again once the drawer is closed.
  await page.keyboard.press("Escape")
  await expect(panel).toBeHidden()

  await page.mouse.move(beside.x, beside.y)
  await page.mouse.wheel(0, 600)

  await expect
    .poll(() => page.evaluate(() => window.scrollY))
    .toBeGreaterThan(0)
})

test("the drawer does not animate", async ({ page, visit }) => {
  await visit({ viewport: viewports.mobile })

  await menuButton(page).click()

  const panel = drawer(page)
  await expect(panel).toBeVisible()

  const motion = await panel.evaluate((element) => {
    const computed = getComputedStyle(element)
    return {
      transition: computed.transitionDuration,
      animation: computed.animationName,
    }
  })

  expect(motion.transition).toBe("0s")
  expect(motion.animation).toBe("none")
})
