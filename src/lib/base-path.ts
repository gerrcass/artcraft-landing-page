/**
 * Where the site is served from.
 *
 * On GitHub Pages a project site lives at `/<repository>/`, so every path to
 * an asset under `public/` has to carry that prefix. Everywhere else — the
 * development server, the production server, the test suite — it is empty,
 * and the paths are the plain ones.
 *
 * The prefix is read from the environment, so it is fixed at build time: the
 * exported site is static, and nothing has to work it out at runtime.
 */
export const basePath = process.env.NEXT_PUBLIC_BASE_PATH ?? ""

/** A path under `public/`, reachable from wherever the site is served. */
export function asset(path: string): string {
  return `${basePath}${path}`
}
