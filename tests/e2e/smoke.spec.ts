import { hero } from "@/data/site"

import { expect, test } from "./fixtures"

const headline = `${hero.headline.before} ${hero.headline.accent}`

test("the page renders the hero headline", async ({ page, visit }) => {
  await visit({ theme: "light" })

  await expect(page.getByRole("heading", { level: 1, name: headline })).toBeVisible()
})

test("the page background is the light theme's background token", async ({
  page,
  visit,
}) => {
  await visit({ theme: "light" })

  const background = await page.evaluate(
    () => getComputedStyle(document.body).backgroundColor,
  )

  expect(background).toBe("rgb(242, 241, 238)")
})

test("the page background follows the dark theme", async ({ page, visit }) => {
  await visit({ theme: "dark" })

  const background = await page.evaluate(
    () => getComputedStyle(document.body).backgroundColor,
  )

  expect(background).toBe("rgb(18, 19, 22)")
})

test("the hero's content sits in a centred 1280px row", async ({
  page,
  visit,
}) => {
  await visit({ theme: "light" })

  // The hero is full-bleed, the way the original has it: the heading sits in
  // a centred 1280px row rather than inside the Frame's hairlines. The Frame
  // is a numbered section's.
  const row = page.getByRole("heading", { name: headline }).locator("xpath=../..")

  const rowStyle = await row.evaluate((element) => {
    const style = getComputedStyle(element)
    return {
      maxWidth: style.maxWidth,
      marginLeft: style.marginLeft,
      marginRight: style.marginRight,
    }
  })

  expect(rowStyle.maxWidth).toBe("1280px")
  expect(rowStyle.marginLeft).toBe(rowStyle.marginRight)
})

test("the Frame's ticks are decorative", async ({ page, visit }) => {
  await visit({ theme: "light" })

  const frame = page.locator("#ownership > div")

  // The Frame's two Ticks are its own children, and they are decorative.
  await expect(frame.locator("> span[aria-hidden='true']")).toHaveCount(2)
})
