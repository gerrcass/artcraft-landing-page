/**
 * Prefixes the absolute asset paths in a stylesheet with the site's base path.
 *
 * A path that starts at the root — `/fonts/…` — is where the browser looks for
 * the file, and on GitHub Pages a project site does not live at the root. The
 * bundler leaves such a path alone, so it is prefixed here, at build time.
 *
 * Everywhere but a Pages build the prefix is empty, and the path is the plain
 * one.
 */
module.exports = function prefixAssetPaths(options) {
  const basePath = (options && options.basePath) || ""

  return {
    postcssPlugin: "prefix-asset-paths",
    Once(root) {
      if (!basePath) {
        return
      }

      root.walkDecls((declaration) => {
        if (declaration.value.includes("url(/")) {
          declaration.value = declaration.value.replace(
            /url\(\//g,
            `url(${basePath}/`,
          )
        }
      })
    },
  }
}
