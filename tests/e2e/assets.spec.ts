import { readFileSync } from "node:fs"
import path from "node:path"

import type { TestInfo } from "@playwright/test"

import { features, hero, orbitTiles, proof, site } from "@/data/site"

import { expect, test } from "./fixtures"

/**
 * The vendored media.
 *
 * Every asset the page needs is served by the app itself, so the clone renders
 * identically offline and does not depend on a third-party CDN staying up.
 * These specs check that from the outside: they ask the running app for each
 * asset, they watch the page's network traffic, they read the `@font-face`
 * declarations the typefaces are reached through, and they read the manifest
 * that records where the assets came from.
 */

const TOKEN_LAYER = path.join("src", "app", "globals.css")

/** The four typefaces, and the weights each one has to be available at. */
const FONTS = [
  {
    path: "/fonts/archivo-latin.woff2",
    family: "Archivo",
    style: "normal",
    weights: "100 900",
  },
  {
    path: "/fonts/inter-latin.woff2",
    family: "Inter",
    style: "normal",
    weights: "100 900",
  },
  {
    path: "/fonts/geist-mono-latin.woff2",
    family: "Geist Mono",
    style: "normal",
    weights: "100 900",
  },
  {
    path: "/fonts/instrument-serif-italic-latin.woff2",
    family: "Instrument Serif",
    style: "italic",
    weights: "400",
  },
] as const

/** The display face's heading weight, and its heavier Wordmark weight. */
const HEADING_WEIGHT = 620
const WORDMARK_WEIGHT = 750

/** The seven demo videos, read from the content module rather than restated. */
const VIDEO_PATHS = features.entries.flatMap((entry) =>
  entry.kind === "video" ? [entry.video.src] : [],
)

/** The three community film posters, read from the content module. */
const POSTER_PATHS = proof.entries.map((entry) => entry.poster)

/** The Orbit's ten still frames, read from the content module. */
const TILE_PATHS = orbitTiles.map((tile) => tile.src)

/** One `@font-face` rule, read out of the token layer. */
type FontFaceRule = {
  family: string
  weights: string
  style: string
  stretch: string
  src: string
}

/** The repository root — the directory the Playwright config lives in. */
function repoRoot(testInfo: TestInfo): string {
  const configFile = testInfo.config.configFile
  return configFile ? path.dirname(configFile) : process.cwd()
}

/** Every `@font-face` rule in the token layer. */
function fontFaceRules(rootDir: string): FontFaceRule[] {
  const css = readFileSync(path.join(rootDir, TOKEN_LAYER), "utf8")

  return [...css.matchAll(/@font-face\s*\{([^}]*)\}/g)].map(([, body]) => {
    const declaration = (name: string) => {
      const match = new RegExp(`${name}\\s*:\\s*([^;]+);`).exec(body)
      return match ? match[1].trim() : ""
    }

    return {
      family: declaration("font-family").replace(/^["']|["']$/g, ""),
      weights: declaration("font-weight"),
      style: declaration("font-style"),
      stretch: declaration("font-stretch"),
      src: declaration("src"),
    }
  })
}

/** The first bytes of a response, as a latin-1 string. */
async function headOf(
  response: { body(): Promise<Buffer> },
  length: number,
): Promise<string> {
  const body = await response.body()
  return body.subarray(0, length).toString("latin1")
}

test("the page loads nothing from an external host", async ({ page, visit }) => {
  const requests: string[] = []
  page.on("request", (request) => {
    requests.push(request.url())
  })

  await visit({ theme: "light" })
  await page.waitForLoadState("networkidle")

  const origin = new URL(page.url()).origin

  const external = requests.filter((url) => {
    if (url.startsWith("data:") || url.startsWith("blob:")) {
      return false
    }
    return new URL(url).origin !== origin
  })

  expect(external).toEqual([])

  // The page does load the typefaces — from the app, not from a font host.
  for (const font of FONTS) {
    expect(
      requests.some((url) => url.endsWith(font.path)),
      `${font.path} was never requested`,
    ).toBe(true)
  }
})

test("the page's text is set in the vendored typefaces", async ({ page, visit }) => {
  await visit({ theme: "light" })

  const body = await page.evaluate(() => {
    const style = getComputedStyle(document.body)
    return { family: style.fontFamily }
  })

  expect(body.family).toContain("Inter")

  // The Serif Accent — the one italic word inside the hero's headline.
  const accent = page
    .getByRole("heading", { level: 1 })
    .getByText(hero.headline.accent)

  const accentStyle = await accent.evaluate((element) => {
    const style = getComputedStyle(element)
    return { family: style.fontFamily, style: style.fontStyle }
  })

  expect(accentStyle.family).toContain("Instrument Serif")
  expect(accentStyle.style).toBe("italic")
})

test("the four typefaces are declared locally, and are served by the app", async ({
  request,
}, testInfo) => {
  const rules = fontFaceRules(repoRoot(testInfo))

  expect(rules).toHaveLength(FONTS.length)

  for (const font of FONTS) {
    const rule = rules.find((candidate) => candidate.src.includes(font.path))

    expect(rule, `${font.path} has no @font-face rule`).toBeTruthy()
    expect(rule?.family).toBe(font.family)
    expect(rule?.style).toBe(font.style)
    expect(rule?.weights).toBe(font.weights)

    // The face is reached through the app's own public directory, never
    // through a font host.
    expect(rule?.src).toContain(`url("${font.path}")`)

    const response = await request.get(font.path)

    expect(response.status(), `${font.path} is not served`).toBe(200)
    expect(response.headers()["content-type"], `${font.path} is not a font`)
      .toContain("font/woff2")
    expect(await headOf(response, 4)).toBe("wOF2")
  }
})

test("the display face's declaration covers the heading weight and the Wordmark weight", async ({}, testInfo) => {
  const rule = fontFaceRules(repoRoot(testInfo)).find(
    (candidate) => candidate.family === "Archivo",
  )

  expect(rule, "Archivo has no @font-face rule").toBeTruthy()

  const [lowest, highest] = rule?.weights.split(" ").map(Number) ?? []

  expect(lowest).toBeLessThanOrEqual(HEADING_WEIGHT)
  expect(highest).toBeGreaterThanOrEqual(WORDMARK_WEIGHT)

  // The original's own width axis, which the Wordmark stretches to 125%.
  expect(rule?.stretch).toBe("62% 125%")
})

test("the display face is available at its heading weight and its Wordmark weight", async ({
  page,
  visit,
}) => {
  await visit({ theme: "light" })

  // Wait until the vendored variable face is registered and loaded at both
  // weights. On a cold server the stylesheet may not have landed yet, and
  // measuring then would measure the fallback.
  await page.waitForFunction(
    async ({ headingWeight, wordmarkWeight }) => {
      await document.fonts.load(`${headingWeight} 48px "Archivo"`)
      await document.fonts.load(`${wordmarkWeight} 48px "Archivo"`)
      return (
        document.fonts.check(`${headingWeight} 48px "Archivo"`) &&
        document.fonts.check(`${wordmarkWeight} 48px "Archivo"`)
      )
    },
    { headingWeight: HEADING_WEIGHT, wordmarkWeight: WORDMARK_WEIGHT },
  )

  const probe = await page.evaluate(
    ({ headingWeight, wordmarkWeight }) => {
      const container = document.createElement("div")
      container.setAttribute("aria-hidden", "true")
      container.style.cssText =
        "position:absolute;left:-10000px;top:0;white-space:nowrap;font-size:48px;"

      const render = (weight: number) => {
        const span = document.createElement("span")
        span.className = "font-display"
        span.style.fontWeight = String(weight)
        span.textContent = "Capable tools for artists"
        container.appendChild(span)
        return span
      }

      const heading = render(headingWeight)
      const wordmark = render(wordmarkWeight)
      document.body.appendChild(container)

      const headingStyle = getComputedStyle(heading)
      const wordmarkStyle = getComputedStyle(wordmark)

      const result = {
        headingWeight: headingStyle.fontWeight,
        wordmarkWeight: wordmarkStyle.fontWeight,
        headingFamily: headingStyle.fontFamily,
        wordmarkFamily: wordmarkStyle.fontFamily,
        headingWidth: heading.getBoundingClientRect().width,
        wordmarkWidth: wordmark.getBoundingClientRect().width,
      }

      container.remove()

      return result
    },
    { headingWeight: HEADING_WEIGHT, wordmarkWeight: WORDMARK_WEIGHT },
  )

  expect(probe.headingWeight).toBe(String(HEADING_WEIGHT))
  expect(probe.wordmarkWeight).toBe(String(WORDMARK_WEIGHT))

  // Both weights have to resolve to the vendored display face, not the
  // fallback stack.
  expect(probe.headingFamily).toContain("Archivo")
  expect(probe.wordmarkFamily).toContain("Archivo")

  // A variable face set at two weights does not draw the same width twice.
  expect(probe.wordmarkWidth).not.toBe(probe.headingWidth)
})

test("the seven demo videos are served by the app", async ({ request }) => {
  expect(VIDEO_PATHS).toHaveLength(7)

  for (const path of VIDEO_PATHS) {
    const response = await request.get(path)

    expect(response.status(), `${path} is not served`).toBe(200)
    expect(response.headers()["content-type"], `${path} is not a video`)
      .toContain("video/webm")
    expect((await response.body()).length).toBeGreaterThan(0)
  }
})

test("the three community film posters are served by the app", async ({
  request,
}) => {
  expect(POSTER_PATHS).toHaveLength(3)

  for (const path of POSTER_PATHS) {
    const response = await request.get(path)

    expect(response.status(), `${path} is not served`).toBe(200)
    expect(response.headers()["content-type"], `${path} is not an image`)
      .toContain("image/jpeg")
    expect((await response.body()).length).toBeGreaterThan(0)
  }
})

test("the logo is served by the app", async ({ request }) => {
  const response = await request.get(site.logo)

  expect(response.status()).toBe(200)
  expect(response.headers()["content-type"]).toContain("image/svg+xml")
  expect(await headOf(response, 200)).toContain("<svg")
})

test("the Orbit's still frames are served by the app", async ({ request }) => {
  expect(TILE_PATHS).toHaveLength(10)

  for (const path of TILE_PATHS) {
    const response = await request.get(path)

    expect(response.status(), `${path} is not served`).toBe(200)
    expect(response.headers()["content-type"], `${path} is not an image`)
      .toContain("image/jpeg")
    expect((await response.body()).length).toBeGreaterThan(0)
  }
})

test("the media manifest records every vendored asset", async ({ request }) => {
  const response = await request.get("/media-manifest.json")

  expect(response.status()).toBe(200)

  const manifest = (await response.json()) as {
    note?: string
    assets?: Array<{
      path?: string
      kind?: string
      name?: string
      source?: string
      role?: string
      family?: string
      weights?: string
      style?: string
    }>
  }

  expect(manifest.note, "the manifest says nothing about itself").toBeTruthy()

  const assets = manifest.assets ?? []
  const byPath = new Map(assets.map((asset) => [asset.path, asset]))

  const expected = [
    ...FONTS.map((font) => font.path),
    ...VIDEO_PATHS,
    ...POSTER_PATHS,
    site.logo,
    ...TILE_PATHS,
  ]

  // Every vendored asset is in the manifest, and the manifest carries nothing
  // that is not vendored.
  expect([...byPath.keys()].sort()).toEqual([...expected].sort())

  for (const asset of assets) {
    expect(asset.kind, `${asset.path} has no kind`).toBeTruthy()
    expect(asset.name, `${asset.path} has no name`).toBeTruthy()
    expect(asset.source, `${asset.path} has no source`).toBeTruthy()
    expect(asset.role, `${asset.path} has no role`).toBeTruthy()
  }

  for (const font of FONTS) {
    const asset = byPath.get(font.path)

    expect(asset?.family, `${font.path} has no family`).toBe(font.family)
    expect(asset?.weights, `${font.path} has no weights`).toBe(font.weights)
    expect(asset?.style, `${font.path} has no style`).toBe(font.style)
  }
})

test("the repository says the vendored media is demonstration content", async ({}, testInfo) => {
  const readme = readFileSync(path.join(repoRoot(testInfo), "README.md"), "utf8")

  expect(readme).toContain("demonstration content")
  expect(readme).toContain("ADR-0002")
  expect(readme).toMatch(/not something the project ships/i)
})
