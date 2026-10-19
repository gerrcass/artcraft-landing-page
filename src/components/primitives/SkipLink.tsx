import { skipLink } from "@/data/site"

import "./skip-link.css"

/**
 * The skip link: the first thing on the page a keyboard reaches.
 *
 * It is out of the way until it takes focus — held above the viewport — and
 * then it appears where the eye is. Activating it moves the focus to the main
 * content, so that the keyboard does not have to walk through the header to
 * reach the page.
 */
export function SkipLink() {
  return (
    <a className="skip-link" href={`#${skipLink.target}`}>
      {skipLink.label}
    </a>
  )
}
