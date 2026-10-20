import { Frame } from "@/components/primitives/Frame"
import { Heading } from "@/components/primitives/Heading"
import { SectionBar } from "@/components/primitives/SectionBar"
import { proof, type FilmEntry } from "@/data/site"

/** The play triangle, the icon in the Film Tile's play affordance. */
function PlayMark() {
  return (
    <svg
      xmlns="http://www.w3.org/2000/svg"
      width="24"
      height="24"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
      aria-hidden="true"
      className="h-3.5 w-3.5"
    >
      <path d="M5 5a2 2 0 0 1 3.008-1.728l11.997 6.998a2 2 0 0 1 .003 3.458l-12 7A2 2 0 0 1 5 19z" />
    </svg>
  )
}

/**
 * The Proof section: the evidence that other people use the product — three
 * community films, shown as posters with a clear play affordance, so the
 * section is scannable before anything plays.
 *
 * It opens with the Section Bar, states the claim in a headline with the Serif
 * Accent on the one word that carries it, and sets the films out as three Film
 * Tiles in a ruled grid.
 *
 * The original's play button opens a YouTube embed. The clone does not embed
 * YouTube, so the affordance is a link to the film on the original's site,
 * opened in a new tab. Its accessible name still says what activating it does.
 */
export function Proof() {
  const entries: readonly FilmEntry[] = proof.entries

  return (
    <section id="made-with" data-choreo="true" className="relative">
      <span
        aria-hidden="true"
        data-draw-rule="true"
        className="absolute inset-x-0 top-0 h-px origin-left bg-line"
      />

      <Frame>
        <SectionBar
          number={proof.bar.number}
          subject={proof.bar.subject}
          descriptor={proof.bar.descriptor}
        />

        <div className="px-6 py-14 md:px-10 md:py-20">
          <Heading
            headline={proof.headline}
            as="h2"
            reveal
            className="max-w-3xl font-display text-4xl font-medium leading-[1.02] tracking-[-0.035em] text-ink-strong sm:text-5xl md:text-6xl"
          />
        </div>

        <div
          data-reveal-group="true"
          className="grid gap-px border-t border-line bg-line lg:grid-cols-3"
        >
          {entries.map((entry) => (
            <figure key={entry.index} data-reveal="true" className="bg-bg">
              <div className="flex items-center justify-between gap-4 border-b border-line px-6 py-2.5">
                <figcaption className="hud-label text-muted">
                  {entry.label}
                </figcaption>
                <p className="hud-label text-muted">{entry.index}</p>
              </div>
              <div className="relative aspect-video w-full overflow-hidden bg-bg-sunken">
                <a
                  href={entry.href}
                  {...(entry.external
                    ? { target: "_blank", rel: "noopener noreferrer" }
                    : {})}
                  aria-label={`${proof.play.namePrefix} ${entry.title}`}
                  className="group absolute inset-0 h-full w-full"
                >
                  {/* The original's poster is a plain lazily-loaded image. */}
                  {/* eslint-disable-next-line @next/next/no-img-element */}
                  <img
                    src={entry.poster}
                    alt=""
                    loading="lazy"
                    className="absolute inset-0 h-full w-full object-cover"
                  />
                  {/* The scrim over the poster: the token's colour, at half
                      its strength on hover. */}
                  <span className="absolute inset-0 bg-scrim transition-opacity group-hover:opacity-50" />
                  <span className="hud-label absolute bottom-3 left-3 flex items-center gap-1.5 bg-invert-bg px-3 py-1.5 font-bold text-invert-fg">
                    <PlayMark />
                    {proof.play.label}
                  </span>
                </a>
              </div>
            </figure>
          ))}
        </div>
      </Frame>
    </section>
  )
}
