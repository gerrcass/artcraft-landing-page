import { Cta } from "@/components/primitives/Cta"
import { Frame } from "@/components/primitives/Frame"
import { GitHubMark } from "@/components/primitives/GitHubMark"
import { Heading } from "@/components/primitives/Heading"
import { SectionBar } from "@/components/primitives/SectionBar"
import { ownership, type OwnershipEntry } from "@/data/site"

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
