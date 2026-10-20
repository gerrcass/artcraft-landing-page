import type { Metadata } from "next"
import type { ReactNode } from "react"

import { Choreography } from "@/components/Choreography"
import { site } from "@/data/site"

import "./globals.css"

export type ThemeName = "light" | "dark"

declare global {
  interface Window {
    /**
     * Installed by the pre-paint script: it stores the choice, applies the
     * `data-theme` attribute, and flips the colours together.
     */
    __artcraftSetTheme?: (theme: ThemeName) => void
  }
}

export const metadata: Metadata = {
  title: site.title,
  description: site.description,
}

/**
 * The theme is applied before the first paint, so the page never flashes the
 * wrong theme. The storage key is the original's, so the behaviour is
 * identical.
 */
const themeScript = `(function () {
  var root = document.documentElement;
  function setTheme(theme) {
    if (theme !== "light" && theme !== "dark") return;
    try { localStorage.setItem("artcraft-theme", theme); } catch (e) {}
    root.classList.add("theme-anim");
    root.setAttribute("data-theme", theme);
    setTimeout(function () { root.classList.remove("theme-anim"); }, 450);
  }
  try {
    var stored = localStorage.getItem("artcraft-theme");
    if (stored === "light" || stored === "dark") root.setAttribute("data-theme", stored);
  } catch (e) {}
  window.__artcraftSetTheme = setTheme;
})();`

export default function RootLayout({ children }: { children: ReactNode }) {
  return (
    <html lang="en" suppressHydrationWarning>
      <head>
        <script dangerouslySetInnerHTML={{ __html: themeScript }} />
        <link
          rel="preload"
          href="/fonts/archivo-latin.woff2"
          as="font"
          type="font/woff2"
          crossOrigin="anonymous"
        />
        <link
          rel="preload"
          href="/fonts/inter-latin.woff2"
          as="font"
          type="font/woff2"
          crossOrigin="anonymous"
        />
        <link
          rel="preload"
          href="/fonts/geist-mono-latin.woff2"
          as="font"
          type="font/woff2"
          crossOrigin="anonymous"
        />
        <link
          rel="preload"
          href="/fonts/instrument-serif-italic-latin.woff2"
          as="font"
          type="font/woff2"
          crossOrigin="anonymous"
        />
      </head>
      <body>
        <Choreography />
        {children}
      </body>
    </html>
  )
}
