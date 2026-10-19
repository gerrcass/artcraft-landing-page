import type { Page } from "@playwright/test"

/**
 * The visual capture.
 *
 * A capture is only worth comparing against a baseline if it is the same
 * picture every time it is taken. That means the page has to be put into a
 * state where nothing is moving:
 *
 * - the Reduced Path, where the Reveals are already in their final state and
 *   the Marquee and the Orbit have stopped;
 * - the demo videos frozen on one fixed frame, so that a well shows the same
 *   photograph of the product every time;
 * - the page scrolled from the top to the bottom and back, so that everything
 *   that arrives on screen has arrived, and so that the sticky header and the
 *   sticky Section Bars are where a visitor first meets them;
 * - the lazy images loaded and decoded, so that a poster below the fold is on
 *   the page rather than on its way.
 *
 * The helpers below do that, and nothing else.
 */

/**
 * The three viewports the landing page is captured at: the widths the
 * original is measured against, at the height each of them is measured at.
 */
export const CAPTURES = [
  { width: 390, height: 844 },
  { width: 768, height: 1024 },
  { width: 1440, height: 900 },
] as const

/** The frame every demo video is seeked to, in seconds. */
export const VIDEO_TIMESTAMP = 1.5

/** How long a video is given to load and settle, in milliseconds. */
const VIDEO_TIMEOUT = 30_000

/** The four typefaces the page uses, and the weight each one is set at. */
const FONTS = [
  "620 1rem Archivo",
  "750 1rem Archivo",
  "400 1rem Inter",
  "500 1rem 'Geist Mono'",
  "italic 400 1rem 'Instrument Serif'",
] as const

/**
 * Loads the landing page at a given viewport, ready to be captured.
 *
 * The stored theme is cleared before the page is loaded, so that the theme
 * the capture is taken in is the one the browser was asked for — the
 * operating system's colour scheme — and not a preference left behind by an
 * earlier visit.
 */
export async function loadTheLandingPage(
  page: Page,
  capture: { width: number; height: number },
): Promise<void> {
  await page.setViewportSize({ width: capture.width, height: capture.height })

  await page.addInitScript(() => {
    try {
      window.localStorage.removeItem("artcraft-theme")
    } catch {
      // A browser that refuses storage still shows the theme it was given.
    }
  })

  /**
   * The demo videos are frozen from the very first moment.
   *
   * A playing video shows a different frame every time, and the page's own
   * choreography starts one as soon as its well comes into view. `play` is
   * replaced with a promise that starts nothing, so that no video ever runs:
   * the capture seeks each one to a fixed frame itself, and the only frame
   * the browser ever presents is that one.
   */
  await page.addInitScript(() => {
    HTMLMediaElement.prototype.play = function play() {
      return Promise.resolve()
    }
  })

  await page.goto("/")

  await hideTheDevelopmentOverlay(page)
}

/**
 * Hides the development server's own overlay.
 *
 * Next.js draws its developer tools into a `nextjs-portal` element. That is
 * a piece of the tooling rather than a piece of the page, and it is hidden so
 * that a baseline is the page and not the tooling.
 */
async function hideTheDevelopmentOverlay(page: Page): Promise<void> {
  await page.addStyleTag({
    content: "nextjs-portal { display: none !important; }",
  })
}

/**
 * Scrolls the page from the top to the bottom and back again.
 *
 * The Reveal fires when its element enters the viewport, and a page that has
 * never been scrolled is a page whose lower half has not been revealed yet.
 * The scroll goes in steps, so that every element passes through the
 * viewport, and it ends at the top, so that the sticky header and the sticky
 * Section Bars are where they are when a visitor first arrives.
 */
async function scrollThroughThePage(page: Page): Promise<void> {
  await page.evaluate(async () => {
    const frame = () =>
      new Promise<void>((resolve) => {
        requestAnimationFrame(() => resolve())
      })

    const height = () => document.documentElement.scrollHeight
    const step = Math.max(200, Math.floor(window.innerHeight * 0.75))

    for (let y = 0; y < height(); y += step) {
      window.scrollTo(0, y)
      await frame()
      await frame()
    }

    window.scrollTo(0, height())
    await frame()
    await frame()

    window.scrollTo(0, 0)
    await frame()
    await frame()
  })
}

/**
 * Freezes every demo video on the same frame.
 *
 * A playing video shows a different frame every time, so a capture that
 * included one would be flaky. Each video is loaded, seeked to the same
 * timestamp, and then waited for: the `seeked` event says the frame has been
 * decoded, and `requestVideoFrameCallback` says it has been put on the
 * screen. Both are waited for, and the frame that is waited for is the one
 * at the timestamp — a video that has been loaded puts its first frame on the
 * screen before it is seeked, and that frame is not the one the capture
 * wants.
 *
 * The videos never run at all — `play` is replaced before the page is loaded
 * — so there is never a frame in flight, and the frame that ends up on the
 * screen is the one that was asked for.
 */
async function settleTheVideos(page: Page): Promise<void> {
  await page.evaluate(
    async ({ timestamp, timeout }) => {
      const videos = Array.from(
        document.querySelectorAll<HTMLVideoElement>("video"),
      )

      /** Waits for an event, or gives up. */
      const waitFor = (
        video: HTMLVideoElement,
        event: "loadeddata" | "seeked",
      ) =>
        new Promise<void>((resolve, reject) => {
          const source = video.currentSrc || video.src
          const timer = window.setTimeout(() => {
            video.removeEventListener(event, onEvent)
            reject(new Error(`the video ${source} never fired ${event}`))
          }, timeout)

          function onEvent() {
            window.clearTimeout(timer)
            video.removeEventListener(event, onEvent)
            resolve()
          }

          video.addEventListener(event, onEvent, { once: true })
        })

      /**
       * Waits for the browser to put the frame at the timestamp on the
       * screen. The frames before it are ignored: a loaded video puts its
       * first frame on the screen before it has been seeked.
       */
      const presentedAt = (video: HTMLVideoElement) =>
        new Promise<void>((resolve) => {
          if (typeof video.requestVideoFrameCallback !== "function") {
            resolve()
            return
          }

          const timer = window.setTimeout(resolve, timeout)

          const check = (
            _now: number,
            metadata: { mediaTime: number },
          ) => {
            if (
              metadata.mediaTime >= timestamp - 0.1 &&
              metadata.mediaTime <= timestamp
            ) {
              window.clearTimeout(timer)
              resolve()
              return
            }

            video.requestVideoFrameCallback(check)
          }

          video.requestVideoFrameCallback(check)
        })

      const settle = async (video: HTMLVideoElement) => {
        video.pause()

        if (video.readyState < 2) {
          const loaded = waitFor(video, "loadeddata")
          video.preload = "auto"
          video.load()
          await loaded
        }

        if (Math.abs(video.currentTime - timestamp) < 0.05) {
          // The video is already on the frame that was asked for.
          await presentedAt(video)
          return
        }

        // The frame is asked for, and the putting of it on the screen is
        // waited for, so that the capture cannot catch the frame before it
        // arrives.
        const onScreen = presentedAt(video)
        const seeked = waitFor(video, "seeked")
        video.currentTime = timestamp

        await seeked
        await onScreen
      }

      await Promise.all(videos.map(settle))

      for (const video of videos) {
        video.pause()

        if (Math.abs(video.currentTime - timestamp) > 0.05) {
          throw new Error(
            `the video ${video.currentSrc || video.src} settled at ${video.currentTime}`,
          )
        }
      }
    },
    { timestamp: VIDEO_TIMESTAMP, timeout: VIDEO_TIMEOUT },
  )
}

/**
 * Waits for everything the page draws to be on the page: the lazy images
 * below the fold, and the four typefaces.
 *
 * Every image is decoded as well as loaded. A browser decodes an image in
 * two passes — a quick one, and a full one when the image is drawn at its
 * final size — and the quick one is drawn slightly differently. A capture
 * taken between the two passes would show the quick one, so the decode is
 * waited for.
 */
async function settleTheImages(page: Page): Promise<void> {
  await page.evaluate(async (fonts) => {
    for (const image of document.images) {
      image.loading = "eager"
    }

    await Promise.all(
      Array.from(document.images).map(
        (image) =>
          new Promise<void>((resolve) => {
            if (image.complete) {
              resolve()
              return
            }

            image.addEventListener("load", () => resolve(), { once: true })
            image.addEventListener("error", () => resolve(), { once: true })
          }),
      ),
    )

    await Promise.all(
      Array.from(document.images).map(async (image) => {
        try {
          await image.decode()
        } catch {
          // An image that cannot be decoded is still an image that is there.
        }
      }),
    )

    await Promise.all(fonts.map((font) => document.fonts.load(font)))
    await document.fonts.ready
  }, [...FONTS])
}

/**
 * Puts the page into the state a capture is taken in.
 *
 * The order matters. The videos are frozen first, so that the page is
 * scrolled with the demo frames already on them — a video that has been
 * seeked while it is off the screen has its frame decoded but never painted,
 * and a full-page capture paints the page again from the top, which would
 * leave the wells empty. Then the page is scrolled from the top to the
 * bottom and back, so that everything that arrives on screen has arrived.
 * And then the images and the typefaces are waited for.
 */
export async function settleTheLandingPage(page: Page): Promise<void> {
  await settleTheVideos(page)
  await scrollThroughThePage(page)
  await settleTheImages(page)
}
