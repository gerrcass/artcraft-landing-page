import { Frame } from "@/components/primitives/Frame"
import { Heading } from "@/components/primitives/Heading"
import { SectionBar } from "@/components/primitives/SectionBar"
import { features, type FeatureEntry } from "@/data/site"

/**
 * The Features section: the page's largest section, and the argument that
 * ArtCraft is about control.
 *
 * It opens with the Section Bar, states the argument in a headline with the
 * Serif Accent on the one word that carries it, and sets it out as eight
 * Feature Cards in a ruled grid — seven of them holding a looping demo video in
 * their Media Well, the last one a link to the app.
 *
 * The cells are separated by true 1px rules rather than by gutters: the grid
 * carries the hairline colour and a one-pixel gap, and each cell carries the
 * background, so the rule shows through the gap. One column on a phone, two
 * from the medium breakpoint.
 *
 * The copy — the section bar, the headline, the paragraph, and every card's
 * category, index, title and body — is read from the content module.
 */

/** The arrow-up-right mark, the affordance in the last card's Media Well. */
function ArrowUpRight() {
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
      className="h-6 w-6"
      aria-hidden="true"
    >
      <path d="M7 7h10v10" />
      <path d="M7 17 17 7" />
    </svg>
  )
}

/** A Feature Card's meta row: the category on the left, the index on the right. */
function MetaRow({ entry }: { entry: FeatureEntry }) {
  return (
    <div className="flex items-center justify-between gap-4 border-b border-line px-6 py-2.5 md:px-8">
      <p className="hud-label text-muted">{entry.category}</p>
      <p className="hud-label text-faint">{entry.index}</p>
    </div>
  )
}

/** A Feature Card's title and the paragraph that says what it is for. */
function Caption({ entry }: { entry: FeatureEntry }) {
  return (
    <div className="px-6 py-6 md:px-8">
      <h3 className="font-display text-2xl font-medium tracking-[-0.02em] text-ink-strong">
        {entry.title}
      </h3>
      <p className="mt-2 max-w-xl leading-relaxed text-muted">{entry.body}</p>
    </div>
  )
}

/**
 * A Feature Card holding a demo video.
 *
 * The Media Well is a 16:9 box on the sunken background; the video fills it and
 * is cropped to cover. It is muted, looping, inline, and not preloaded, so it
 * never interrupts the page and never fetches until it is wanted.
 *
 * The `data-media-well` marker is how the shared observer finds the wells that
 * hold a video, and is what ticket #15's play/pause choreography hangs off.
 */
function VideoCard({ entry }: { entry: Extract<FeatureEntry, { kind: "video" }> }) {
  return (
    <article data-reveal="true" className="bg-bg">
      <MetaRow entry={entry} />

      <div
        data-media-well="true"
        className="relative aspect-video w-full overflow-hidden bg-bg-sunken"
      >
        <video
          src={entry.video.src}
          className="absolute inset-0 h-full w-full object-cover"
          muted
          loop
          playsInline
          preload="none"
          aria-label={entry.video.label}
        />
      </div>

      <Caption entry={entry} />
    </article>
  )
}

/**
 * The last card: "More in the app".
 *
 * It is a link rather than a video, and it is told apart from the other seven
 * by its Media Well, which holds the arrow affordance and the address the link
 * leads to rather than a demo.
 */
function LinkCard({ entry }: { entry: Extract<FeatureEntry, { kind: "link" }> }) {
  return (
    <a data-reveal="true" href={entry.action.href} className="group flex flex-col bg-bg">
      <MetaRow entry={entry} />

      <div className="relative flex aspect-video w-full flex-col items-center justify-center gap-4 overflow-hidden bg-bg-sunken">
        <span className="flex h-14 w-14 items-center justify-center border border-line-strong text-ink transition-colors group-hover:bg-invert-bg group-hover:text-invert-fg">
          <ArrowUpRight />
        </span>
        <p className="hud-label text-faint">{entry.action.label}</p>
        <span aria-hidden="true" className="tick top-2 left-2 opacity-60" />
        <span aria-hidden="true" className="tick bottom-2 right-2 opacity-60" />
      </div>

      <Caption entry={entry} />
    </a>
  )
}

export function Features() {
  return (
    <section id="features" data-choreo="true" className="relative">
      <span
        aria-hidden="true"
        data-draw-rule="true"
        className="absolute inset-x-0 top-0 h-px origin-left bg-line"
      />

      <Frame>
        <SectionBar
          number={features.bar.number}
          subject={features.bar.subject}
          descriptor={features.bar.descriptor}
        />

        <div className="px-6 py-14 md:px-10 md:py-20">
          <Heading
            headline={features.headline}
            as="h2"
            reveal
            className="max-w-3xl font-display text-4xl font-medium leading-[1.02] tracking-[-0.035em] text-ink-strong sm:text-5xl md:text-6xl"
          />
          <p
            data-reveal="true"
            className="mt-5 max-w-xl text-lg leading-relaxed text-muted"
          >
            {features.body}
          </p>
        </div>

        <div
          data-reveal-group="true"
          className="grid gap-px border-t border-line bg-line md:grid-cols-2"
        >
          {features.entries.map((entry) =>
            entry.kind === "video" ? (
              <VideoCard key={entry.index} entry={entry} />
            ) : (
              <LinkCard key={entry.index} entry={entry} />
            ),
          )}
        </div>
      </Frame>
    </section>
  )
}
