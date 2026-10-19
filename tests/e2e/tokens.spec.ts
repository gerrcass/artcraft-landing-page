import { readFileSync, readdirSync, statSync } from "node:fs"
import path from "node:path"

import { expect, test, type TestInfo } from "@playwright/test"

const TOKEN_LAYER = path.join("src", "app", "globals.css")

/** The tokens the landing page's palette is made of. */
const REQUIRED_TOKENS = [
  "--bg",
  "--bg-raised",
  "--bg-sunken",
  "--ink",
  "--ink-strong",
  "--muted",
  "--line",
  "--line-strong",
  "--faint",
  "--accent",
  "--accent-ink",
  "--invert-bg",
  "--invert-fg",
]

/** The tokens that carry the same value in both themes. */
const SHARED_TOKENS = ["--accent"]

const LIGHT_BLOCK = /:root\s*\{/
const DARK_ATTRIBUTE_BLOCK = /:root\[data-theme="dark"\]\s*\{/
const DARK_MEDIA_BLOCK = /:root:not\(\[data-theme="light"\]\)\s*\{/

/** The repository root — the directory the Playwright config lives in. */
function repoRoot(testInfo: TestInfo): string {
  const configFile = testInfo.config.configFile
  return configFile ? path.dirname(configFile) : process.cwd()
}

function readTokenLayer(rootDir: string): string {
  return readFileSync(path.join(rootDir, TOKEN_LAYER), "utf8")
}

/** The body of the first block whose selector matches. */
function extractBlock(css: string, selector: RegExp): string {
  const match = selector.exec(css)
  if (!match) {
    throw new Error(`No block matches ${selector}`)
  }

  const start = css.indexOf("{", match.index)
  let depth = 0
  for (let index = start; index < css.length; index += 1) {
    if (css[index] === "{") {
      depth += 1
    } else if (css[index] === "}") {
      depth -= 1
      if (depth === 0) {
        return css.slice(start + 1, index)
      }
    }
  }

  throw new Error(`Unterminated block for ${selector}`)
}

/** The custom properties a block declares, by name. */
function customProperties(block: string): Map<string, string> {
  const properties = new Map<string, string>()
  for (const [, name, value] of block.matchAll(/(--[a-z0-9-]+)\s*:\s*([^;]+);/g)) {
    properties.set(name, value.trim())
  }
  return properties
}

function sourceFiles(directory: string): string[] {
  const files: string[] = []
  for (const entry of readdirSync(directory)) {
    const entryPath = path.join(directory, entry)
    if (statSync(entryPath).isDirectory()) {
      files.push(...sourceFiles(entryPath))
    } else if (/\.(ts|tsx|css)$/.test(entry)) {
      files.push(entryPath)
    }
  }
  return files
}

test("both themes declare exactly the same tokens", async ({}, testInfo) => {
  const css = readTokenLayer(repoRoot(testInfo))

  const light = customProperties(extractBlock(css, LIGHT_BLOCK))
  const dark = customProperties(extractBlock(css, DARK_ATTRIBUTE_BLOCK))
  const darkMedia = customProperties(extractBlock(css, DARK_MEDIA_BLOCK))

  expect([...light.keys()].sort()).toEqual([...dark.keys()].sort())
  expect([...light.keys()].sort()).toEqual([...darkMedia.keys()].sort())
})

test("the palette is complete in both themes", async ({}, testInfo) => {
  const css = readTokenLayer(repoRoot(testInfo))

  const light = customProperties(extractBlock(css, LIGHT_BLOCK))
  const dark = customProperties(extractBlock(css, DARK_ATTRIBUTE_BLOCK))

  for (const token of REQUIRED_TOKENS) {
    expect(light.has(token), `${token} is missing from the light theme`).toBe(
      true,
    )
    expect(dark.has(token), `${token} is missing from the dark theme`).toBe(true)
  }
})

test("the themes differ where they should", async ({}, testInfo) => {
  const css = readTokenLayer(repoRoot(testInfo))

  const light = customProperties(extractBlock(css, LIGHT_BLOCK))
  const dark = customProperties(extractBlock(css, DARK_ATTRIBUTE_BLOCK))
  const darkMedia = customProperties(extractBlock(css, DARK_MEDIA_BLOCK))

  for (const [name, lightValue] of light) {
    const darkValue = dark.get(name)

    if (SHARED_TOKENS.includes(name)) {
      expect(darkValue, `${name} is the same in both themes`).toBe(lightValue)
    } else {
      expect(darkValue, `${name} differs between the themes`).not.toBe(lightValue)
    }

    expect(darkMedia.get(name), `${name} differs from the dark theme`).toBe(
      darkValue,
    )
  }
})

test("the token layer is the only place a colour or font value is written", async ({}, testInfo) => {
  const rootDir = repoRoot(testInfo)
  const tokenLayer = path.resolve(path.join(rootDir, TOKEN_LAYER))

  const offenders: string[] = []
  for (const file of sourceFiles(path.join(rootDir, "src"))) {
    if (path.resolve(file) === tokenLayer) {
      continue
    }

    const contents = readFileSync(file, "utf8")
    if (/#[0-9a-fA-F]{3,8}\b/.test(contents)) {
      offenders.push(`${path.relative(rootDir, file)}: a hex colour`)
    }
    if (/font-family/.test(contents)) {
      offenders.push(`${path.relative(rootDir, file)}: a font-family declaration`)
    }
  }

  expect(offenders).toEqual([])
})
