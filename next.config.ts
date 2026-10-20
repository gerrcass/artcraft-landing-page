import type { NextConfig } from "next"

/**
 * Where the site is served from.
 *
 * A GitHub Pages project site lives at `/<repository>/`, so the paths to the
 * assets under `public/` have to carry that prefix. It is read from the
 * environment, so it is fixed at build time: the exported site is static, and
 * nothing has to work it out at runtime.
 *
 * Everywhere else — the development server, the production server, the test
 * suite — it is empty, and the paths are the plain ones.
 */
const basePath = process.env.NEXT_PUBLIC_BASE_PATH ?? ""

const nextConfig: NextConfig = {
  /**
   * The Pages build exports a static site; every other build is a Next.js
   * server. The export is what a static host can serve, and a Pages project
   * site is a static host.
   */
  ...(basePath
    ? {
        output: "export" as const,
        basePath,
        assetPrefix: basePath,
        trailingSlash: true,
        // There is no image optimiser behind a static host.
        images: { unoptimized: true },
      }
    : {}),
}

export default nextConfig
