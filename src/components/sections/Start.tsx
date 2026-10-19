import { Cta } from "@/components/primitives/Cta"
import { Frame } from "@/components/primitives/Frame"
import { Heading } from "@/components/primitives/Heading"
import { SectionBar } from "@/components/primitives/SectionBar"
import { start } from "@/data/site"

/**
 * The Start section: the page's close.
 *
 * Unlike the sections above it, this one is centred — the eyebrow, the
 * headline, the paragraph, and the two calls to action all sit on the centre
 * line, offering both routes to start side by side: the desktop app, or the
 * browser.
 *
 * The original's Start section has no Section Bar; the spec's four-Section-Bar
 * decision gives it one, so the descriptor reads twice in this section — once
 * in the bar and once as the centred eyebrow. That is the spec's consequence,
 * not an oversight.
 */
export function Start() {
  return (
    <section id="start" data-choreo="true" className="relative">
      <span
        aria-hidden="true"
        data-draw-rule="true"
        className="absolute inset-x-0 top-0 h-px origin-left bg-line"
      />

      <Frame>
        <SectionBar
          number={start.bar.number}
          subject={start.bar.subject}
          descriptor={start.bar.descriptor}
        />

        <div className="flex flex-col items-center px-6 py-20 text-center md:py-28">
          <p className="hud-label text-muted">{start.eyebrow}</p>

          <Heading
            headline={start.headline}
            as="h2"
            reveal
            className="mt-6 max-w-4xl font-display text-5xl font-medium leading-[0.98] tracking-[-0.04em] text-ink-strong sm:text-6xl md:text-7xl"
          />

          <p className="mt-6 max-w-md text-lg leading-relaxed text-muted">
            {start.body}
          </p>

          {/* The original's calls to action open in the same tab, so the
              `Cta` primitive's `external` flag is left off here. */}
          <div className="mt-10 flex flex-wrap items-center justify-center gap-3">
            {start.actions.map((action) => (
              <Cta
                key={action.label}
                href={action.href}
                variant={action.variant}
              >
                {action.label}
              </Cta>
            ))}
          </div>
        </div>
      </Frame>
    </section>
  )
}
