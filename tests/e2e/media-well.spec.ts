import type { Page } from "@playwright/test"

import { features, type FeatureEntry } from "@/data/site"

import { expect, test } from "./fixtures"

/**
 * The Media Well's video choreography.
 *
 * A demo video runs only while its well is on screen, and stops the moment it
 * leaves. The videos keep the original's attributes — muted, looping, inline,
 * not preloaded — so that the browsers which block autoplay with sound still
 * play them, and so that a video that has never been seen is never fetched.
 *
 * The specs assert on what a visitor perceives: whether the video is playing,
 * whether its file was requested, and whether the Reduced Path leaves the
 * videos alone.
 */

/** The seven entries that carry a video, read from the content module. */
const videoEntries = features.entries.filter(
  (entry): entry is Extract<FeatureEntry, { kind: "video" }> =>
    entry.kind === "video",
)

/** How long a video is given to start or stop, in milliseconds. */
const VIDEO_TIMEOUT = 30_000

/**
 * Scrolls a well into the middle of the viewport and waits for one of the
 * videos to reach a state.
 *
 * The state is the event that tells us the video started or stopped: `playing`
 * and `pause`. The listener is attached before the scroll, inside the same
 * task: the observer's callback cannot run until the task is over, so the
 * event cannot be missed.
 *
 * The videos are several megabytes each, so the wait is generous.
 */
async function scrollAndWaitFor(
  page: Page,
  scrollTo: number,
  watched: { index: number; state: "playing" | "pause" },
): Promise<boolean> {
  return page.evaluate(
    ({ scrollTo, watched, timeout }) => {
      const wells = document.querySelectorAll<HTMLElement>("[data-media-well]")
      const well = wells[scrollTo]
      const video = document.querySelectorAll<HTMLVideoElement>(
        "[data-media-well] video",
      )[watched.index]

      if (!well || !video) {
        return false
      }

      return new Promise<boolean>((resolve) => {
        const timer = setTimeout(() => resolve(false), timeout)

        const done = () => {
          clearTimeout(timer)
          resolve(true)
        }

        const reached =
          watched.state === "playing" ? !video.paused : video.paused

        if (reached) {
          done()
          return
        }

        video.addEventListener(watched.state, done, { once: true })
        well.scrollIntoView({ block: "center", behavior: "instant" })
      })
    },
    { scrollTo, watched, timeout: VIDEO_TIMEOUT },
  )
}

/** Whether a video in a well is paused. */
async function isPaused(page: Page, index: number): Promise<boolean> {
  return page.evaluate((index) => {
    const video = document.querySelectorAll<HTMLVideoElement>(
      "[data-media-well] video",
    )[index]

    return video ? video.paused : true
  }, index)
}

/** Whether a well is on screen at all. */
async function isOnScreen(page: Page, index: number): Promise<boolean> {
  return page.evaluate((index) => {
    const well = document.querySelectorAll<HTMLElement>("[data-media-well]")[index]

    if (!well) {
      return false
    }

    const rect = well.getBoundingClientRect()

    return rect.bottom > 0 && rect.top < window.innerHeight
  }, index)
}

/** The files the browser has asked for. */
function videoRequests(page: Page): () => string[] {
  const requested: string[] = []

  page.on("request", (request) => {
    const url = request.url()

    if (url.includes("/videos/features/")) {
      requested.push(new URL(url).pathname)
    }
  })

  return () => [...new Set(requested)]
}

test("a video in a well that is on screen plays, and one that is off screen is paused", async ({
  page,
  visit,
}) => {
  test.setTimeout(120_000)

  await visit({ theme: "light" })

  const wells = page.locator("[data-media-well]")
  await expect(wells).toHaveCount(videoEntries.length)

  // The last well is far below the fold: it has never been on screen.
  const last = videoEntries.length - 1

  expect(
    await scrollAndWaitFor(page, 0, { index: 0, state: "playing" }),
  ).toBe(true)
  expect(await isPaused(page, 0)).toBe(false)

  // The well that is off screen is paused.
  expect(await isOnScreen(page, last)).toBe(false)
  expect(await isPaused(page, last)).toBe(true)
})

test("scrolling a well out of view pauses its video", async ({
  page,
  visit,
}) => {
  test.setTimeout(120_000)

  await visit({ theme: "light" })

  const last = videoEntries.length - 1

  expect(
    await scrollAndWaitFor(page, 0, { index: 0, state: "playing" }),
  ).toBe(true)
  expect(await isPaused(page, 0)).toBe(false)

  // Scrolling to the last well takes the first one off the screen.
  expect(
    await scrollAndWaitFor(page, last, { index: 0, state: "pause" }),
  ).toBe(true)
  expect(await isPaused(page, 0)).toBe(true)
})

test("each video stays muted, looping, inline, and not preloaded", async ({
  page,
  visit,
}) => {
  await visit({ theme: "light" })

  const videos = page.locator("[data-media-well] video")
  await expect(videos).toHaveCount(videoEntries.length)

  for (const video of await videos.all()) {
    await expect(video).toHaveJSProperty("muted", true)
    await expect(video).toHaveJSProperty("loop", true)
    await expect(video).toHaveJSProperty("playsInline", true)
    await expect(video).toHaveAttribute("preload", "none")
  }
})

test("a video that has never come into view is not fetched", async ({
  page,
  visit,
}) => {
  test.setTimeout(120_000)

  const requested = videoRequests(page)

  await visit({ theme: "light" })

  await expect(page.locator("[data-media-well]")).toHaveCount(
    videoEntries.length,
  )

  // Let the page settle, so that the observer has seen everything it is
  // going to see.
  await page.waitForTimeout(1_000)

  // The wells that are entirely off screen have never been seen, so their
  // videos have never been asked for.
  const unseen = await page.evaluate(() => {
    const wells = Array.from(document.querySelectorAll("[data-media-well]"))

    return wells
      .map((well, index) => {
        const rect = well.getBoundingClientRect()

        return rect.bottom <= 0 || rect.top >= window.innerHeight ? index : -1
      })
      .filter((index) => index >= 0)
  })

  expect(unseen.length).toBeGreaterThan(0)

  for (const index of unseen) {
    expect(requested()).not.toContain(videoEntries[index].video.src)
  }

  // Once a well has been seen, its video is fetched.
  expect(
    await scrollAndWaitFor(page, 0, { index: 0, state: "playing" }),
  ).toBe(true)

  expect(requested()).toContain(videoEntries[0].video.src)
})

test("a Media Well that holds no video is left alone", async ({
  page,
  visit,
}) => {
  test.setTimeout(120_000)

  await visit({ theme: "light" })

  const errors: string[] = []
  page.on("pageerror", (error) => errors.push(error.message))

  // A well that holds no video at all. It is added after the choreography has
  // started, so the observer finds it the way it finds a section that
  // renders later.
  await page.evaluate(() => {
    const well = document.createElement("div")
    well.setAttribute("data-media-well", "true")
    well.style.height = "240px"
    well.style.background = "currentColor"
    document.body.append(well)
  })

  await page.evaluate(() => {
    const wells = document.querySelectorAll("[data-media-well]")
    wells[wells.length - 1].scrollIntoView({
      block: "center",
      behavior: "instant",
    })
  })

  await page.waitForTimeout(500)

  expect(errors).toEqual([])

  // And the wells that do hold a video still play.
  expect(
    await scrollAndWaitFor(page, 0, { index: 0, state: "playing" }),
  ).toBe(true)
})

test.describe("with a reduced motion preference", () => {
  test.use({ reducedMotion: "reduce" })

  test("the videos remain present and playable, and are not scrubbed", async ({
    page,
    visit,
  }) => {
    test.setTimeout(120_000)

    await visit({ theme: "light" })

    const videos = page.locator("[data-media-well] video")
    await expect(videos).toHaveCount(videoEntries.length)

    // The videos are there, and they are not hidden.
    for (const video of await videos.all()) {
      await expect(video).toBeVisible()
    }

    // Scrolling a well into view does not start its video: the scroll
    // position does not control the play state on the Reduced Path.
    await page.evaluate(() => {
      const well = document.querySelectorAll<HTMLElement>(
        "[data-media-well]",
      )[0]
      well?.scrollIntoView({ block: "center", behavior: "instant" })
    })

    await page.waitForTimeout(500)

    expect(await isPaused(page, 0)).toBe(true)

    // The video is still playable: it starts when it is asked to.
    const played = await page.evaluate(async () => {
      const video = document.querySelector<HTMLVideoElement>(
        "[data-media-well] video",
      )

      if (!video) {
        return false
      }

      try {
        await video.play()
        return true
      } catch {
        return false
      }
    })

    expect(played).toBe(true)
    expect(await isPaused(page, 0)).toBe(false)

    // And scrolling it out of view does not stop it.
    await page.evaluate(() => {
      window.scrollTo({ top: 0, behavior: "instant" })
    })

    await page.waitForTimeout(500)

    expect(await isPaused(page, 0)).toBe(false)
  })
})
