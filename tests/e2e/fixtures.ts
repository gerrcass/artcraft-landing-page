import { test as base, expect } from "@playwright/test"

export type Theme = "light" | "dark"

export type Viewport = {
  width: number
  height: number
}

export type VisitOptions = {
  /** The viewport to load the page at. Defaults to the project's viewport. */
  viewport?: Viewport
  /** The theme to load the page in. Defaults to the light theme. */
  theme?: Theme
}

/** The three viewports the original is measured against. */
export const viewports = {
  mobile: { width: 390, height: 844 },
  tablet: { width: 768, height: 1024 },
  desktop: { width: 1440, height: 900 },
} as const satisfies Record<string, Viewport>

/**
 * The one fixture: it loads the page at a given viewport and theme.
 *
 * The theme is chosen the way a visitor chooses it — by the stored preference
 * the theme script reads before the first paint.
 */
export const test = base.extend<{
  visit: (options?: VisitOptions) => Promise<void>
}>({
  visit: async ({ page }, use) => {
    await use(async (options = {}) => {
      if (options.viewport) {
        await page.setViewportSize(options.viewport)
      }

      const theme = options.theme ?? "light"
      await page.addInitScript((value) => {
        window.localStorage.setItem("artcraft-theme", value)
      }, theme)

      await page.goto("/")
    })
  },
})

export { expect }
