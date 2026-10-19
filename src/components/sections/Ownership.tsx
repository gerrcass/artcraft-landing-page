import { Cta } from "@/components/primitives/Cta"
import { Frame } from "@/components/primitives/Frame"
import { Heading } from "@/components/primitives/Heading"
import { SectionBar } from "@/components/primitives/SectionBar"
import { ownership, type OwnershipEntry } from "@/data/site"

/** The GitHub mark, the icon in the first Ownership Card's action. */
function GitHubMark() {
  return (
    <svg
      viewBox="0 0 24 24"
      fill="currentColor"
      aria-hidden="true"
      className="h-3.5 w-3.5"
    >
      <path d="M12 .297c-6.63 0-12 5.373-12 12 0 5.303 3.438 9.8 8.205 11.385.6.113.82-.258.82-.577 0-.285-.01-1.04-.015-2.04-3.338.724-4.042-1.61-4.042-1.61C4.422 18.07 3.633 17.7 3.633 17.7c-1.087-.744.084-.729.084-.729 1.205.084 1.838 1.236 1.838 1.236 1.07 1.835 2.809 1.305 3.495.998.108-.776.417-1.305.76-1.605-2.665-.3-5.466-1.332-5.466-5.93 0-1.31.465-2.38 1.235-3.22-.135-.303-.54-1.523.105-3.176 0 0 1.005-.322 3.3 1.23.96-.267 1.98-.399 3-.405 1.02.006 2.04.138 3 .405 2.28-1.552 3.285-1.23 3.285-1.23.645 1.653.24 2.873.12 3.176.765.84 1.23 1.91 1.23 3.22 0 4.61-2.805 5.625-5.475 5.92.42.36.81 1.096.81 2.22 0 1.606-.015 2.896-.015 3.286 0 .315.21.69.825.57C20.565 22.092 24 17.592 24 12.297c0-6.627-5.373-12-12-12" />
    </svg>
  )
}

/**
 * The Ownership section: the page's argument that using ArtCraft is different
 * from renting from a website, broken into three legible parts.
 *
 * It opens with the Section Bar, states the argument in a headline with the
 * Serif Accent on the one word that carries it, and sets the argument out as
 * three lettered Ownership Cards in a ruled grid.
 */
export function Ownership() {
  const entries: readonly OwnershipEntry[] = ownership.entries

  return (
    <section id="ownership" data-choreo="true" className="relative">
      <span
        aria-hidden="true"
        data-draw-rule="true"
        className="absolute inset-x-0 top-0 h-px origin-left bg-line"
      />

      <Frame>
        <SectionBar
          number={ownership.bar.number}
          subject={ownership.bar.subject}
          descriptor={ownership.bar.descriptor}
        />

        <div className="px-6 py-14 md:px-10 md:py-20">
          <Heading
            headline={ownership.headline}
            as="h2"
            reveal
            className="max-w-3xl font-display text-4xl font-medium leading-[1.02] tracking-[-0.035em] text-ink-strong sm:text-5xl md:text-6xl"
          />
          <p
            data-reveal="true"
            className="mt-5 max-w-xl text-lg leading-relaxed text-muted"
          >
            {ownership.body}
          </p>
        </div>

        <div
          data-reveal-group="true"
          className="grid gap-px border-t border-line bg-line lg:grid-cols-3"
        >
          {entries.map((entry) => (
            <article
              key={entry.letter}
              data-reveal="true"
              className="bg-bg p-6 md:p-8"
            >
              <p className="hud-label text-muted">{entry.letter}</p>
              <h3 className="mt-6 font-display text-2xl font-medium tracking-[-0.02em] text-ink-strong">
                {entry.title}
              </h3>
              <p className="mt-2 leading-relaxed text-muted">{entry.body}</p>
              {entry.action ? (
                <Cta
                  href={entry.action.href}
                  variant="secondary"
                  size="sm"
                  external={entry.action.external}
                  className="mt-6"
                >
                  <GitHubMark />
                  {entry.action.label}
                </Cta>
              ) : null}
            </article>
          ))}
        </div>
      </Frame>
    </section>
  )
}
