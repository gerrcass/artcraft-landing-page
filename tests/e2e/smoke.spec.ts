import { site } from "../../src/data/site"

import { expect, test } from "./fixtures"

test("the page renders the heading", async ({ page, visit }) => {
  await visit({ theme: "light" })

  await expect(page.getByRole("heading", { name: site.heading })).toBeVisible()
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

test("the heading sits inside the Frame", async ({ page, visit }) => {
  await visit({ theme: "light" })

  const frame = page.getByRole("heading", { name: site.heading }).locator("xpath=..")

  const frameStyle = await frame.evaluate((element) => {
    const style = getComputedStyle(element)
    return {
      maxWidth: style.maxWidth,
      borderLeftWidth: style.borderLeftWidth,
      borderRightWidth: style.borderRightWidth,
      marginLeft: style.marginLeft,
      marginRight: style.marginRight,
    }
  })

  expect(frameStyle.maxWidth).toBe("1280px")
  expect(frameStyle.borderLeftWidth).toBe("1px")
  expect(frameStyle.borderRightWidth).toBe("1px")
  expect(frameStyle.marginLeft).toBe(frameStyle.marginRight)
})

test("the Frame's ticks are decorative", async ({ page, visit }) => {
  await visit({ theme: "light" })

  const frame = page.getByRole("heading", { name: site.heading }).locator("xpath=..")

  await expect(frame.locator('[aria-hidden="true"]')).toHaveCount(2)
})
