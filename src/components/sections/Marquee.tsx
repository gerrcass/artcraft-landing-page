import { marquee } from "@/data/site"

import "./marquee.css"

/**
 * The Marquee's entries: a HUD Label each, preceded by an accent-coloured
 * square. The copy comes from the content module; the component carries none.
 */
function TrackItems() {
  return (
    <>
      {marquee.map((entry) => (
        <li
          key={entry}
          className="hud-label flex items-center whitespace-nowrap px-6 py-3 text-muted"
        >
          <span aria-hidden="true" className="mr-6 text-accent-ink">
            ▪
          </span>
          {entry}
        </li>
      ))}
    </>
  )
}

/**
 * The Marquee: the scrolling ticker of model and feature names directly
 * beneath the hero.
 *
 * The track is rendered twice from the same source so the scroll is seamless.
 * The first copy is the real list; the duplicate is hidden from assistive
 * technology, so the entries are not announced twice.
 */
export function Marquee() {
  return (
    <section id="marquee">
      <div className="marquee border-t border-line">
        <ul className="marquee-track items-center">
          <TrackItems />
        </ul>
        <ul aria-hidden="true" className="marquee-track items-center">
          <TrackItems />
        </ul>
      </div>
    </section>
  )
}
