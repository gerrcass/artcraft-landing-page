/**
 * The current page.
 *
 * The clone is a single page, so the landing page is the one a visitor is on
 * and the Home entry is the current one. The mobile drawer (ticket #6) reads
 * the same path, so the two agree on which entry is current.
 */
export const currentPath = "/"

/** Whether a destination is the page the visitor is on. */
export function isCurrentPath(href: string): boolean {
  return href === currentPath
}
