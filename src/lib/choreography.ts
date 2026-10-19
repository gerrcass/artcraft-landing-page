"use client"

import { useEffect } from "react"

/**
 * The Choreography: the one shared observer that drives the page's Reveals
 * and the Media Wells' videos.
 *
 * The mechanism is deliberately small and generic. It watches the elements the
 * marks select, and tells each of them when it comes into view. What "coming
 * into view" means for a mark is that mark's own business: the CSS owns the
 * appearance, the observer only says "now".
 *
 * **The observer is the shared mechanism the later video ticket extends.**
 * Ticket #15 (the Media Wells) adds a second kind of observation by adding an
 * entry to `OBSERVATIONS`: its own selector, its own effect. The observer, the
 * MutationObserver, the scan, and the teardown are all driven from that list,
 * so adding a kind is a small change — see `Observation` below.
 */

/**
 * The class the choreography adds to an element it has revealed.
 *
 * The CSS reads it: `[data-reveal].is-revealed` is the revealed state.
 */
export const REVEALED_CLASS = "is-revealed"

/**
 * The class the choreography puts on the document root while it is running.
 *
 * The Reveal's hidden start state is scoped to it, so a visitor whose browser
 * never runs this script — or whose script has not run yet — sees the whole
 * page rather than a blank one.
 */
export const RUNNING_CLASS = "choreography"

/**
 * The marks the choreography watches.
 *
 * These are the only names that distinguish one behaviour from another. There
 * are no `isRevealed` props and no `animate` props: the behaviour is chosen by
 * the attribute the element carries.
 */
export const MARKS = {
  /** The element reveals on its own when it enters the viewport. */
  reveal: "data-reveal",
  /** The element's children reveal together. */
  revealGroup: "data-reveal-group",
  /** A decorative rule that draws itself in. */
  drawRule: "data-draw-rule",
  /** A decorative tick that draws itself in. */
  drawTick: "data-draw-tick",
  /** A section eyebrow that draws in. */
  drawEyebrow: "data-draw-eyebrow",
  /** A Media Well: the box that holds a demo video. */
  mediaWell: "data-media-well",
} as const

/** The elements the Reveal owns. */
export const REVEAL_SELECTOR = `[${MARKS.reveal}], [${MARKS.revealGroup}]`

/** The Media Wells: the boxes that hold the demo videos. */
export const MEDIA_WELL_SELECTOR = `[${MARKS.mediaWell}]`

/** The drawing marks: the one-shot decorations that draw themselves in. */
export const DRAW_SELECTOR = [
  `[${MARKS.drawRule}]`,
  `[${MARKS.drawTick}]`,
  `[${MARKS.drawEyebrow}]`,
].join(", ")

/**
 * The observer's options.
 *
 * The root is the viewport, shrunk by a tenth at the bottom: an element has to
 * be properly in view, not merely peeking over the fold, before it reveals.
 */
export const OBSERVER_OPTIONS: IntersectionObserverInit = {
  root: null,
  rootMargin: "0px 0px -10% 0px",
  threshold: 0.1,
}

/**
 * A kind of observation: the elements of one kind, and what happens to them
 * when they come into view.
 *
 * Ticket #15 adds a second kind here — the Media Well, which plays while its
 * card is in view and pauses when it is not. That kind needs to know when the
 * element *leaves* the viewport as well as when it arrives, which is what
 * `onLeave` is for.
 */
export type Observation = {
  /** A short name for the kind, used in the comments and in the log. */
  kind: string
  /** The elements of this kind, as a CSS selector. */
  selector: string
  /**
   * Whether the CSS scroll-driven alternative already does this kind's work.
   *
   * Where the browser drives the Reveal from a view timeline, the observer
   * stands down for that kind: the two would otherwise fight over the same
   * property. The drawing marks are never handed over — a sticky element's
   * view progress freezes the moment it sticks, so the Section Bar's eyebrow
   * cannot be tied to a view timeline.
   */
  standsDownWhenCssDrives?: boolean
  /**
   * Whether this kind is left alone on the Reduced Path.
   *
   * A kind that ties a behaviour to the scroll position stands down when the
   * visitor has asked for reduced motion: the same content, with the motion
   * taken out. The Media Well is such a kind — its videos are the visitor's
   * to start, and where they are on the page does not decide.
   */
  standsDownWhenReducedMotion?: boolean
  /** What happens to the element when it enters the viewport. */
  onEnter: (element: Element) => void
  /** What happens to the element when it leaves the viewport again. */
  onLeave?: (element: Element) => void
}

/** Reveals an element: the one thing the Reveal and the drawing marks do. */
function reveal(element: Element): void {
  element.classList.add(REVEALED_CLASS)
}

/**
 * The video inside a Media Well, if it has one.
 *
 * The mark is on the well rather than on the video, because the well is what
 * comes into view — but a well does not have to hold a video: the last
 * Feature Card's well holds a link to the app instead. So the video is looked
 * for, and it may not be there.
 */
function videoIn(element: Element): HTMLVideoElement | null {
  return element.querySelector<HTMLVideoElement>("video")
}

/**
 * Starts a Media Well's video.
 *
 * `play()` returns a promise that can reject: a browser may refuse to play a
 * video with sound, and a video whose source has gone may reject too. The
 * rejection is handled rather than left as an unhandled promise in the
 * console — there is nothing to do about it here, because the video is still
 * there for the visitor either way.
 */
function playVideo(element: Element): void {
  const video = videoIn(element)

  if (!video) {
    return
  }

  video.play().catch(() => {
    // The browser refused to play the video.
  })
}

/** Stops a Media Well's video. */
function pauseVideo(element: Element): void {
  videoIn(element)?.pause()
}

/** The kinds of observation the page makes. */
export const OBSERVATIONS: Observation[] = [
  {
    kind: "reveal",
    selector: REVEAL_SELECTOR,
    standsDownWhenCssDrives: true,
    onEnter: reveal,
  },
  {
    kind: "draw",
    selector: DRAW_SELECTOR,
    onEnter: reveal,
  },
  {
    kind: "media-well",
    selector: MEDIA_WELL_SELECTOR,
    standsDownWhenReducedMotion: true,
    onEnter: playVideo,
    onLeave: pauseVideo,
  },
]

/**
 * The media query that decides whether the page is on the Reduced Path.
 *
 * It is the same query the stylesheet uses, so the CSS and the observer agree
 * about which path the visitor is on.
 */
const REDUCED_MOTION_QUERY = "(prefers-reduced-motion: reduce)"

/**
 * Whether the browser can drive the Reveal from a scroll position itself.
 *
 * Where it can, the CSS owns the Reveal and the observer is only the fallback
 * for the browsers that cannot.
 */
export function supportsScrollDrivenAnimations(): boolean {
  if (typeof CSS === "undefined" || typeof CSS.supports !== "function") {
    return false
  }

  return CSS.supports("animation-timeline: view()")
}

/**
 * Whether the visitor has asked for reduced motion.
 *
 * The observer reads the same preference the stylesheet reads, so that the
 * two never disagree about which path the page is on.
 */
export function prefersReducedMotion(): boolean {
  if (typeof window === "undefined" || typeof window.matchMedia !== "function") {
    return false
  }

  return window.matchMedia(REDUCED_MOTION_QUERY).matches
}

/** The observations the observer acts on right now. */
function activeObservations(): Observation[] {
  const cssDrives = supportsScrollDrivenAnimations()
  const reducedMotion = prefersReducedMotion()

  return OBSERVATIONS.filter(
    (observation) =>
      !(observation.standsDownWhenCssDrives && cssDrives) &&
      !(observation.standsDownWhenReducedMotion && reducedMotion),
  )
}

/** The observer, the mutation observer, and what they are watching. */
let observer: IntersectionObserver | null = null
let mutationObserver: MutationObserver | null = null
let motionQuery: MediaQueryList | null = null
const watched = new Map<Element, Observation>()
let holders = 0

/** Observes an element if it carries a mark and is not watched already. */
function watch(element: Element, observations: Observation[]): void {
  for (const observation of observations) {
    if (watched.has(element) || !element.matches(observation.selector)) {
      continue
    }

    watched.set(element, observation)
    observer?.observe(element)
  }
}

/** Observes every marked element inside a root, and the root itself. */
function scan(root: ParentNode): void {
  const observations = activeObservations()

  if (root instanceof Element) {
    watch(root, observations)
  }

  for (const observation of observations) {
    for (const element of root.querySelectorAll(observation.selector)) {
      if (!watched.has(element)) {
        watched.set(element, observation)
        observer?.observe(element)
      }
    }
  }
}

/** Stops watching an element and everything inside it. */
function forget(node: Element): void {
  for (const [element] of watched) {
    if (element !== node && !node.contains(element)) {
      continue
    }

    observer?.unobserve(element)
    watched.delete(element)
  }
}

/**
 * The viewport as the observer sees it: the window, shrunk by a tenth at the
 * bottom to match the observer's root margin.
 */
function viewport(): DOMRect {
  return new DOMRect(
    0,
    0,
    window.innerWidth,
    window.innerHeight * 0.9,
  )
}

/**
 * The safety net: an element that is already in view when the choreography
 * starts is revealed, so that nothing is ever left waiting for an observer
 * that will not fire.
 */
function revealWhatIsInView(): void {
  const view = viewport()

  for (const [element, observation] of watched) {
    if (element.classList.contains(REVEALED_CLASS)) {
      continue
    }

    const rect = element.getBoundingClientRect()
    const inView =
      rect.bottom > view.top &&
      rect.top < view.bottom &&
      rect.right > view.left &&
      rect.left < view.right

    if (inView) {
      observation.onEnter(element)
    }
  }
}

/** The observer's callback: an element has entered or left the viewport. */
function handleIntersections(entries: IntersectionObserverEntry[]): void {
  for (const entry of entries) {
    const observation = watched.get(entry.target)
    if (!observation) {
      continue
    }

    if (entry.isIntersecting) {
      observation.onEnter(entry.target)
    } else {
      observation.onLeave?.(entry.target)
    }
  }
}

/**
 * The mutation observer's callback: elements that arrive after the page has
 * mounted are watched too, so a section that renders later is choreographed
 * like any other.
 */
function handleMutations(records: MutationRecord[]): void {
  for (const record of records) {
    for (const node of record.removedNodes) {
      if (node instanceof Element) {
        forget(node)
      }
    }

    for (const node of record.addedNodes) {
      if (node instanceof Element) {
        scan(node)
      }
    }
  }
}

/**
 * The observer's work is decided by the visitor's motion preference, so a
 * change to that preference changes what the observer does: it starts again
 * with the observations that fit the new preference.
 *
 * The elements that have already been revealed keep their revealed state — the
 * class is on the element, not in the observer's bookkeeping — so the page
 * does not flash when the preference changes.
 */
function handleMotionChange(): void {
  if (!observer) {
    return
  }

  stop()
  start()
}

/** Starts the choreography: one observer, watching the whole document. */
function start(): void {
  if (observer) {
    return
  }

  observer = new IntersectionObserver(handleIntersections, OBSERVER_OPTIONS)
  document.documentElement.classList.add(RUNNING_CLASS)

  scan(document)
  revealWhatIsInView()

  mutationObserver = new MutationObserver(handleMutations)
  mutationObserver.observe(document.body, {
    childList: true,
    subtree: true,
  })

  motionQuery = window.matchMedia(REDUCED_MOTION_QUERY)
  motionQuery.addEventListener("change", handleMotionChange)
}

/** Stops the choreography and gives back everything it holds. */
function stop(): void {
  observer?.disconnect()
  observer = null

  mutationObserver?.disconnect()
  mutationObserver = null

  motionQuery?.removeEventListener("change", handleMotionChange)
  motionQuery = null

  watched.clear()
  document.documentElement.classList.remove(RUNNING_CLASS)
}

/**
 * The Choreography, as a hook.
 *
 * The page layout calls it once. The observer is created outside render and
 * torn down on unmount, and it is shared: the hook can be called from more
 * than one place, and the observer lives until the last of them lets go.
 */
export function useChoreography(): void {
  useEffect(() => {
    holders += 1
    if (holders === 1) {
      start()
    }

    return () => {
      holders -= 1
      if (holders === 0) {
        stop()
      }
    }
  }, [])
}
