/**
 * Stub. The full hero — the Wordmark, the Orbit, the calls to action — arrives in
 * ticket #7. This stub carries the headline so the page always has its one `h1`.
 */
import { Frame } from "@/components/primitives/Frame"
import { hero } from "@/data/site"

export function Hero() {
  return (
    <section id="hero" className="relative">
      <Frame className="px-6 py-10 md:px-10">
        <h1 className="font-display text-3xl font-medium leading-[1.05] tracking-[-0.03em] text-ink-strong sm:text-4xl">
          {hero.headline.before}{" "}
          <span className="font-serif italic font-normal text-muted">
            {hero.headline.accent}
          </span>
          {hero.headline.after ? ` ${hero.headline.after}` : ""}
        </h1>
      </Frame>
    </section>
  )
}
