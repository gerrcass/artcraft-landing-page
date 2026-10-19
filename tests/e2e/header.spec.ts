import type { Page } from "@playwright/test"

import { headerAside, headerNav, launchApp } from "@/data/site"

import { expect, test, viewports } from "./fixtures"

const [home, image, video, resources, download, support, craftApps] = headerNav

/** The entry of the primary navigation with the given label. */
function aside(label: string) {
  const found = headerAside.find((entry) => entry.label === label)
  if (!found) {
    throw new Error(`The header has no aside entry called ${label}`)
  }
  return found
}

/**
 * The computed colour of a token, so the assertions follow the token layer
 * rather than repeating its values.
 */
async function tokenColour(page: Page, token: string) {
  return page.evaluate((name) => {
    const probe = document.createElement("div")
    probe.style.backgroundColor = getComputedStyle(
      document.documentElement,
    ).getPropertyValue(name)
    document.body.appendChild(probe)
    const colour = getComputedStyle(probe).backgroundColor
    probe.remove()
    return colour
  }, token)
}

/** The theme toggle that is on screen. */
function themeToggle(page: Page) {
  return page
    .getByRole("button", { name: /Switch to (dark|light) theme/ })
    .filter({ visible: true })
}

test("the header is a sticky, translucent bar 48px tall with a hairline bottom border", async ({
  page,
  visit,
}) => {
  await visit()

  const header = page.locator("#site-nav")

  const style = await header.evaluate((element) => {
    const computed = getComputedStyle(element)
    return {
      position: computed.position,
      height: element.clientHeight,
      backdropFilter: computed.backdropFilter,
      borderBottomWidth: computed.borderBottomWidth,
      borderBottomStyle: computed.borderBottomStyle,
    }
  })

  expect(style.position).toBe("sticky")
  expect(style.height).toBe(48)
  expect(style.backdropFilter).not.toBe("none")
  expect(style.borderBottomWidth).toBe("1px")
  expect(style.borderBottomStyle).toBe("solid")
})

test("the Wordmark sits at the left edge of the full-bleed header", async ({
  page,
  visit,
}) => {
  await visit({ viewport: viewports.desktop })

  const header = page.locator("#site-nav")
  const wordmark = header.getByRole("img", { name: "ArtCraft" })
  const navigation = header.getByRole("navigation", { name: "Main" })

  await expect(wordmark).toBeVisible()
  await expect(navigation).toBeVisible()

  const wordmarkBox = await wordmark.boundingBox()
  const navigationBox = await navigation.boundingBox()

  if (!wordmarkBox || !navigationBox) {
    throw new Error("The header's wordmark or navigation has no box")
  }

  expect(wordmarkBox.x).toBeLessThan(40)
  expect(navigationBox.x).toBeGreaterThan(wordmarkBox.x + wordmarkBox.width)
})

test("the primary navigation shows the site's entries as HUD Labels", async ({
  page,
  visit,
}) => {
  await visit({ viewport: viewports.desktop })

  const navigation = page
    .locator("#site-nav")
    .getByRole("navigation", { name: "Main" })

  await expect(navigation).toBeVisible()

  for (const entry of [home, image, video, resources, download, support, craftApps]) {
    const role = entry.children ? "button" : "link"
    await expect(
      navigation.getByRole(role, { name: entry.label, exact: true }),
    ).toBeVisible()
  }

  const label = await navigation
    .getByRole("link", { name: image.label, exact: true })
    .evaluate((element) => {
      const computed = getComputedStyle(element)
      return { transform: computed.textTransform, size: computed.fontSize }
    })

  expect(label.transform).toBe("uppercase")
  expect(label.size).toBe("11px")
})

test("the Resources entry opens a panel of its destinations", async ({
  page,
  visit,
}) => {
  await visit({ viewport: viewports.desktop })

  const trigger = page.getByRole("button", { name: resources.label, exact: true })
  await expect(trigger).toHaveAttribute("aria-expanded", "false")

  await trigger.click()

  await expect(trigger).toHaveAttribute("aria-expanded", "true")

  const panel = page.getByRole("group", { name: resources.label })
  await expect(panel).toBeVisible()

  for (const destination of resources.children ?? []) {
    await expect(
      panel.getByRole("link", { name: destination.label, exact: true }),
    ).toBeVisible()
  }
})

test("the Craft Apps entry opens a panel of its destinations", async ({
  page,
  visit,
}) => {
  await visit({ viewport: viewports.desktop })

  const trigger = page.getByRole("button", { name: craftApps.label, exact: true })
  await trigger.click()

  const panel = page.getByRole("group", { name: craftApps.label })
  await expect(panel).toBeVisible()

  for (const destination of craftApps.children ?? []) {
    await expect(
      panel.getByRole("link", { name: destination.label, exact: true }),
    ).toBeVisible()
  }
})

test("the panel closes on an outside click", async ({ page, visit }) => {
  await visit({ viewport: viewports.desktop })

  const trigger = page.getByRole("button", { name: resources.label, exact: true })
  await trigger.click()
  await expect(page.getByRole("group", { name: resources.label })).toBeVisible()

  await page.mouse.click(8, 600)

  await expect(page.getByRole("group", { name: resources.label })).toBeHidden()
  await expect(trigger).toHaveAttribute("aria-expanded", "false")
})

test("the panel closes on Escape and returns focus to the trigger", async ({
  page,
  visit,
}) => {
  await visit({ viewport: viewports.desktop })

  const trigger = page.getByRole("button", { name: resources.label, exact: true })
  await trigger.click()
  await expect(page.getByRole("group", { name: resources.label })).toBeVisible()

  await page.keyboard.press("Escape")

  await expect(page.getByRole("group", { name: resources.label })).toBeHidden()
  await expect(trigger).toBeFocused()
})

test("the panel's links are reachable with Tab", async ({ page, visit }) => {
  await visit({ viewport: viewports.desktop })

  const trigger = page.getByRole("button", { name: resources.label, exact: true })
  await trigger.focus()
  await page.keyboard.press("Enter")

  const panel = page.getByRole("group", { name: resources.label })
  await expect(panel).toBeVisible()

  await page.keyboard.press("Tab")

  const first = panel.getByRole("link", { name: (resources.children ?? [])[0].label, exact: true })
  await expect(first).toBeFocused()
})

test("the right side carries the pricing link, the Discord link, the theme toggle and the call to action", async ({
  page,
  visit,
}) => {
  await visit({ viewport: viewports.desktop })

  const pricing = aside("Pricing")
  const discord = aside("Join the ArtCraft Discord")

  // The footer carries a pricing link and a call to action of its own, so the
  // header's are looked for inside the header.
  const header = page.locator("#site-nav")

  await expect(
    header.getByRole("link", { name: pricing.label, exact: true }),
  ).toHaveAttribute("href", pricing.href)
  await expect(
    header.getByRole("link", { name: discord.label, exact: true }),
  ).toHaveAttribute("href", discord.href)
  await expect(themeToggle(page)).toBeVisible()
  await expect(
    header.getByRole("link", { name: launchApp.label, exact: true }),
  ).toHaveAttribute("href", launchApp.href)
})

test("below the wide breakpoint the header carries the theme toggle alone", async ({
  page,
  visit,
}) => {
  await visit({ viewport: viewports.mobile })

  const header = page.locator("#site-nav")

  await expect(themeToggle(page)).toBeVisible()
  await expect(
    header.getByRole("link", { name: launchApp.label, exact: true, includeHidden: true }),
  ).toBeHidden()
  await expect(
    header.getByRole("link", {
      name: aside("Pricing").label,
      exact: true,
      includeHidden: true,
    }),
  ).toBeHidden()
})

test("navigation entries invert their colours on hover", async ({
  page,
  visit,
}) => {
  await visit({ viewport: viewports.desktop })

  const entry = page.getByRole("link", { name: image.label, exact: true })
  const label = entry.locator("span").first()

  await expect(label).toHaveCSS("background-color", "rgba(0, 0, 0, 0)")

  await entry.hover()

  await expect(label).toHaveCSS(
    "background-color",
    await tokenColour(page, "--invert-bg"),
  )
})

test("the theme toggle switches the page between the light and dark themes", async ({
  page,
  visit,
}) => {
  await visit({ viewport: viewports.desktop })

  const toggle = themeToggle(page)

  await expect(page.locator("html")).toHaveAttribute("data-theme", "light")
  await expect(page.locator("body")).toHaveCSS(
    "background-color",
    await tokenColour(page, "--bg"),
  )

  await toggle.click()

  await expect(toggle).toHaveAttribute("aria-label", "Switch to light theme")
  await expect(page.locator("html")).toHaveAttribute("data-theme", "dark")

  // The colours flip together, so the transition has to finish before the
  // background is read.
  await expect(page.locator("html")).not.toHaveClass(/theme-anim/)

  await expect(page.locator("body")).toHaveCSS(
    "background-color",
    await tokenColour(page, "--bg"),
  )
})

test("the toggle's accessible name says which theme it will switch to", async ({
  page,
  visit,
}) => {
  await visit({ viewport: viewports.desktop })

  const toggle = themeToggle(page)

  await expect(toggle).toHaveAccessibleName("Switch to dark theme")

  await toggle.click()

  await expect(toggle).toHaveAccessibleName("Switch to light theme")
})

test("an explicit theme choice survives a page reload", async ({ page }) => {
  // The fixture stores a theme on every navigation, so this test loads the
  // page directly: the choice it makes has to be the one that is kept.
  await page.goto("/")

  const toggle = themeToggle(page)
  await toggle.click()

  await expect(page.locator("html")).toHaveAttribute("data-theme", "dark")
  expect(
    await page.evaluate(() => window.localStorage.getItem("artcraft-theme")),
  ).toBe("dark")

  await page.reload()

  await expect(page.locator("html")).toHaveAttribute("data-theme", "dark")
  await expect(page.locator("body")).toHaveCSS(
    "background-color",
    await tokenColour(page, "--bg"),
  )
})

test("with no explicit choice the page follows the operating system's colour-scheme preference", async ({
  page,
}) => {
  await page.emulateMedia({ colorScheme: "dark" })
  await page.goto("/")

  await expect(page.locator("body")).toHaveCSS(
    "background-color",
    await tokenColour(page, "--bg"),
  )
  await expect(themeToggle(page)).toHaveAccessibleName("Switch to light theme")

  const attribute = await page.evaluate(() =>
    document.documentElement.getAttribute("data-theme"),
  )
  expect(attribute).toBeNull()
})

test("the theme is applied before the first paint", async ({ page }) => {
  await page.addInitScript(() => {
    window.localStorage.setItem("artcraft-theme", "dark")

    const probe = {
      theme: null as string | null,
      background: null as string | null,
    }
    ;(window as unknown as { __themeProbe: typeof probe }).__themeProbe = probe

    // The first frame is painted after this callback has run, so what it
    // reads is what the visitor sees in the very first frame.
    requestAnimationFrame(() => {
      probe.theme = document.documentElement.getAttribute("data-theme")
      probe.background = getComputedStyle(
        document.documentElement,
      ).backgroundColor
    })
  })

  const response = await page.goto("/")

  const html = (await response?.text()) ?? ""
  const head = html.slice(0, html.indexOf("</head>"))
  expect(head).toContain("artcraft-theme")

  const probe = await page.evaluate(
    () =>
      (
        window as unknown as {
          __themeProbe: { theme: string | null; background: string | null }
        }
      ).__themeProbe,
  )

  expect(probe.theme).toBe("dark")
  expect(probe.background).toBe("rgb(18, 19, 22)")
})
