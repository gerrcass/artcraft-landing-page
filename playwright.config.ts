import { defineConfig } from "@playwright/test"

/**
 * The port the dev server runs on. It can be chosen with the `PORT`
 * environment variable, so that two worktrees can run their suites at the
 * same time without one of them reusing the other's server.
 */
const PORT = Number(process.env.PORT ?? 3000)
const baseURL = `http://localhost:${PORT}`

/**
 * The visual suite has a project of its own, because it does its own
 * viewport work: the capture is taken at each of the three widths in turn,
 * and the theme is forced per capture.
 */
const VISUAL_SPEC = /visual\.spec\.ts$/

/**
 * The three viewports the original is measured against: mobile, tablet, and
 * desktop. Every spec runs in all three, so a layout that only works at one
 * width fails.
 */
export default defineConfig({
  testDir: "./tests/e2e",
  fullyParallel: true,
  forbidOnly: !!process.env.CI,
  retries: process.env.CI ? 2 : 0,
  reporter: "list",
  use: {
    baseURL,
    trace: "on-first-retry",
  },
  projects: [
    {
      name: "mobile",
      // The visual suite is not run at these widths: it has its own project.
      testIgnore: VISUAL_SPEC,
      use: { browserName: "chromium", viewport: { width: 390, height: 844 } },
    },
    {
      name: "tablet",
      testIgnore: VISUAL_SPEC,
      use: { browserName: "chromium", viewport: { width: 768, height: 1024 } },
    },
    {
      name: "desktop",
      testIgnore: VISUAL_SPEC,
      use: { browserName: "chromium", viewport: { width: 1440, height: 900 } },
    },
    {
      /**
       * The visual regression suite.
       *
       * It runs on the Reduced Path — `reducedMotion: "reduce"` — where
       * nothing moves: the Reveals are in their final state, the Marquee and
       * the Orbit have stopped, and the demo videos are frozen on one fixed
       * frame by the capture itself. The colour scheme is forced per
       * capture by the spec.
       *
       * There are no retries: a baseline that only holds on the second
       * attempt is not a baseline, and a retry that quietly passes would
       * hide the drift the suite exists to catch.
       *
       * The baselines live in `tests/e2e/visual.spec.ts-snapshots/`, and
       * their names carry neither the project nor the platform, so that the
       * same six pictures are compared on every machine.
       */
      name: "visual",
      testMatch: VISUAL_SPEC,
      retries: 0,
      snapshotPathTemplate: "{testDir}/{testFilePath}-snapshots/{arg}{ext}",
      use: {
        browserName: "chromium",
        viewport: { width: 1440, height: 900 },
        reducedMotion: "reduce",
        colorScheme: "light",
      },
    },
  ],
  webServer: {
    command: `npm run dev -- -p ${PORT}`,
    url: baseURL,
    reuseExistingServer: !process.env.CI,
    timeout: 180_000,
  },
})
