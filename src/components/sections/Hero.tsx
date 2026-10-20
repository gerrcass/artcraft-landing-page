import type { CSSProperties } from "react"

import { Cta } from "@/components/primitives/Cta"
import { GitHubMark } from "@/components/primitives/GitHubMark"
import { Heading } from "@/components/primitives/Heading"
import { hero, orbitRings, orbitTiles } from "@/data/site"

import "./hero.css"
import "./orbit.css"

/**
 * The Orbit's coordinate space.
 *
 * The original's WebGL canvas was 1440 × 852 in a 1440-wide viewport. The
 * clone draws the same scene in SVG with that viewBox, so the rings and the
 * arcs scale with the viewport instead of sitting at a fixed size.
 *
 * The centre is not the canvas's centre. Measuring the reference capture, the
 * faint ring lines are concentric about a point a little below the canvas's
 * middle and a little to the right of it — the scene is a disc seen in
 * perspective, not a target painted on the glass.
 */
const ORBIT_WIDTH = 1440
const ORBIT_HEIGHT = 852
const ORBIT_CENTRE_X = 730
const ORBIT_CENTRE_Y = 502

/**
 * The Wordmark's size, in container-query units against its own container.
 *
 * The original's server-rendered markup asks for 17.8cqw, but the original
 * measures the Wordmark once it is in the document and fits it to its
 * container, and that is what the reference capture shows: the Wordmark
 * fills its column exactly. At the reference width the fitted size is 95.2px
 * in a 672px column, so the size is written here as the container-query
 * value that reproduces it.
 */
const WORDMARK_SIZE = "14.17cqw"

/** A ring's radius, from the diameter the content module gives as a percentage. */
function ringRadius(diameter: number) {
  return ((diameter / 100) * ORBIT_WIDTH) / 2
}

/**
 * The Ticks on a ring: the small registration crosses the original draws on
 * its rings, set around the circumference at an even angle.
 *
 * They are drawn in the ring's own faint colour, because that is how faint the
 * original's are — a tick that competes with the ring it sits on is not what
 * the original drew.
 */
function tickPath(radius: number) {
  const arm = 3
  const marks = 24
  let path = ""

  for (let index = 0; index < marks; index += 1) {
    const angle = (index / marks) * Math.PI * 2
    const x = ORBIT_CENTRE_X + Math.cos(angle) * radius
    const y = ORBIT_CENTRE_Y + Math.sin(angle) * radius
    path += `M${x - arm} ${y}H${x + arm}M${x} ${y - arm}V${y + arm}`
  }

  return path
}

/** A heavy arc, sweeping part of the way round a ring. */
function arcPath(radius: number, start: number, sweep: number) {
  const from = (start * Math.PI) / 180
  const to = ((start + sweep) * Math.PI) / 180
  const x1 = ORBIT_CENTRE_X + Math.cos(from) * radius
  const y1 = ORBIT_CENTRE_Y + Math.sin(from) * radius
  const x2 = ORBIT_CENTRE_X + Math.cos(to) * radius
  const y2 = ORBIT_CENTRE_Y + Math.sin(to) * radius

  return `M${x1} ${y1}A${radius} ${radius} 0 ${sweep > 180 ? 1 : 0} 1 ${x2} ${y2}`
}

/** The inline style of one of the Orbit's tiles. */
type OrbitTileStyle = CSSProperties & {
  "--orbit-blur"?: string
  "--orbit-duration"?: string
  "--orbit-drift-x"?: string
  "--orbit-drift-y"?: string
  "--orbit-scale"?: number
  "--orbit-tilt"?: string
}

/**
 * A tile's placement, derived from the tile's own place in the scene.
 *
 * The tilt follows the tile's distance from the middle of the Orbit, the way
 * a perspective would turn it; the drift follows its place in the ring of
 * tiles, so no two tiles move together.
 */
function tileStyle(tile: (typeof orbitTiles)[number], index: number) {
  const tilt = ((tile.x - 50) / 50) * 6
  const driftX = ((index % 3) - 1) * 12
  const driftY = ((index % 4) - 2) * 7

  return {
    left: `${tile.x}%`,
    top: `${tile.y}%`,
    width: `${tile.width}%`,
    "--orbit-blur": `${tile.depth * 12}px`,
    "--orbit-scale": 1 - tile.depth * 0.12,
    "--orbit-duration": `${tile.duration}s`,
    "--orbit-tilt": `${tilt}deg`,
    "--orbit-drift-x": `${driftX}px`,
    "--orbit-drift-y": `${driftY}px`,
  } satisfies OrbitTileStyle
}

/**
 * The Orbit: the concentric rules, the heavy partial arcs, and the photo
 * tiles floating at varying depths behind the Wordmark.
 *
 * It is decorative, so it is hidden from assistive technology: the scene, the
 * rings drawn inside it, and the tiles all carry `aria-hidden`.
 */
function Orbit() {
  const rings = orbitRings.filter((ring) => !ring.arc)
  const arcs = orbitRings.filter((ring) => ring.arc)

  return (
    <div
      aria-hidden="true"
      data-orbit="true"
      className="orbit absolute inset-0 overflow-hidden"
    >
      <svg
        aria-hidden="true"
        className="absolute inset-0 h-full w-full"
        viewBox={`0 0 ${ORBIT_WIDTH} ${ORBIT_HEIGHT}`}
        preserveAspectRatio="xMidYMid slice"
        fill="none"
      >
        {rings.map((ring) => {
          const radius = ringRadius(ring.diameter)

          return (
            <g key={`ring-${ring.diameter}`}>
              <circle
                cx={ORBIT_CENTRE_X}
                cy={ORBIT_CENTRE_Y}
                r={radius}
                stroke="var(--line)"
                strokeWidth={ring.weight ?? 1}
              />
              {ring.ticks ? (
                <path
                  d={tickPath(radius)}
                  stroke="var(--line)"
                  strokeWidth={1}
                />
              ) : null}
            </g>
          )
        })}

        {arcs.map((ring) => (
          <path
            key={`arc-${ring.diameter}-${ring.arc?.start ?? 0}`}
            d={arcPath(
              ringRadius(ring.diameter),
              ring.arc?.start ?? 0,
              ring.arc?.sweep ?? 0,
            )}
            stroke={`var(--${ring.color ?? "orbit-arc-1"})`}
            strokeWidth={ring.weight ?? 2}
            strokeLinecap="round"
          />
        ))}
      </svg>

      {orbitTiles.map((tile, index) => (
        // The tiles are decorative, local stills that are sized and placed
        // by the scene itself, so the image optimiser has nothing to add.
        // eslint-disable-next-line @next/next/no-img-element
        <img
          key={tile.src}
          src={tile.src}
          alt=""
          aria-hidden="true"
          className="orbit-tile"
          style={tileStyle(tile, index)}
        />
      ))}
    </div>
  )
}

/**
 * The leading A, drawn from the vendored logo `public/artcraft-icon.svg`:
 * the same viewBox and the same path, filled with the current colour so that
 * it takes the strong ink rather than the logo's blue.
 */
function LogoMark() {
  return (
    <svg viewBox="0 0 116.34 97.5" fill="currentColor" aria-hidden="true">
      <path d="M104.28,49.49L81.55,0h-31.23l-3.17,4.76L14.75,53.63,0,75.85l21.55,21.55,63.79-36.94,16.99,37.04,14.01-21.74-12.06-26.27ZM32.89,65.66l32.42-48.87,10.91,23.77-43.32,25.09Z" />
    </svg>
  )
}

/** The mark on the primary call to action: the platforms it installs on. */
function PlatformMarks() {
  return (
    <>
      <svg
        xmlns="http://www.w3.org/2000/svg"
        width="24"
        height="24"
        viewBox="0 0 24 24"
        fill="none"
        stroke="currentColor"
        strokeWidth={2}
        strokeLinecap="round"
        strokeLinejoin="round"
        className="h-4 w-4"
        aria-hidden="true"
      >
        <path d="M12 6.528V3a1 1 0 0 1 1-1h0" />
        <path d="M18.237 21A15 15 0 0 0 22 11a6 6 0 0 0-10-4.472A6 6 0 0 0 2 11a15.1 15.1 0 0 0 3.763 10 3 3 0 0 0 3.648.648 5.5 5.5 0 0 1 5.178 0A3 3 0 0 0 18.237 21" />
      </svg>
      <svg
        xmlns="http://www.w3.org/2000/svg"
        width="24"
        height="24"
        viewBox="0 0 24 24"
        fill="none"
        stroke="currentColor"
        strokeWidth={2}
        strokeLinecap="round"
        strokeLinejoin="round"
        className="h-4 w-4"
        aria-hidden="true"
      >
        <rect width="20" height="14" x="2" y="3" rx="2" />
        <line x1="8" x2="16" y1="21" y2="21" />
        <line x1="12" x2="12" y1="17" y2="21" />
      </svg>
    </>
  )
}

/**
 * The Wordmark: the ARTCRAFT logotype at enormous scale, one element per
 * letter so that the letters can reveal independently, and exposed to
 * assistive technology as a single labelled image.
 */
function Wordmark() {
  // The leading letter is the vendored mark; the rest are set.
  const letters = hero.wordmark.slice(1).split("")

  return (
    <div
      className="pointer-events-none relative z-40 w-full"
      style={{ containerType: "inline-size" }}
    >
      <div
        aria-hidden="true"
        className="hero-frost absolute -inset-x-[6%] -inset-y-[34%]"
      />

      <div
        role="img"
        aria-label={hero.wordmark}
        className="wordmark relative whitespace-pre text-ink-strong"
        style={{
          fontSize: WORDMARK_SIZE,
          lineHeight: 1,
        }}
      >
        <span
          aria-hidden="true"
          data-reveal="true"
          className="wm-letter wm-letter--mark inline-block text-center"
        >
          <LogoMark />
        </span>
        {letters.map((letter, index) => (
          <span
            key={`${letter}-${index}`}
            aria-hidden="true"
            data-reveal="true"
            className="wm-letter inline-block text-center"
          >
            {letter}
          </span>
        ))}
      </div>
    </div>
  )
}

/**
 * The hero: the first screen a visitor sees.
 *
 * The Wordmark floats over the Orbit, with the product's promise beneath it
 * and two ways to act.
 */
export function Hero() {
  return (
    <section id="hero" className="relative">
      <div className="relative flex min-h-[calc(100svh-3rem)] flex-col">
        <Orbit />

        <div className="pointer-events-none relative z-40 mx-auto flex w-full max-w-[1280px] flex-1 flex-col items-center justify-center px-6 py-10 md:px-10">
          <div
            data-reveal-group="true"
            className="relative flex w-full max-w-2xl flex-col items-center text-center"
          >
            <div
              aria-hidden="true"
              className="hero-glow absolute -inset-y-[88px] -inset-x-[128px]"
            />

            <Wordmark />

            <Heading
              headline={hero.headline}
              as="h1"
              reveal
              className="relative mt-8 font-display text-3xl font-medium leading-[1.05] tracking-[-0.03em] text-ink-strong sm:text-4xl"
            />

            <p
              data-reveal="true"
              className="relative mt-4 max-w-md text-lg leading-relaxed text-muted"
            >
              {hero.body}
            </p>

            <div
              data-reveal="true"
              className="pointer-events-auto relative mt-7 flex flex-wrap items-center justify-center gap-3"
            >
              {hero.actions.map((action) => (
                <Cta
                  key={action.label}
                  href={action.href}
                  variant={action.variant}
                  external={action.external}
                >
                  {action.variant === "primary" ? <PlatformMarks /> : null}
                  {action.label}
                </Cta>
              ))}
            </div>

            <div
              data-reveal="true"
              className="pointer-events-auto relative mt-7 flex flex-wrap items-center justify-center gap-x-6 gap-y-2"
            >
              {hero.facts.map((fact) =>
                "href" in fact ? (
                  <a
                    key={fact.label}
                    href={fact.href}
                    {...(fact.external
                      ? { target: "_blank", rel: "noopener noreferrer" }
                      : {})}
                    className="hud-label flex items-center gap-1.5 text-muted hover:text-ink"
                  >
                    <GitHubMark />
                    {fact.label}
                  </a>
                ) : (
                  <p key={fact.label} className="hud-label text-muted">
                    {fact.label}
                  </p>
                ),
              )}
            </div>
          </div>
        </div>
      </div>
    </section>
  )
}
