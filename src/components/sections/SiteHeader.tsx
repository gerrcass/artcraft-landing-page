import { Cta } from "@/components/primitives/Cta"
import { NavDropdown } from "@/components/primitives/NavDropdown"
import { ThemeToggle } from "@/components/primitives/ThemeToggle"
import { Drawer } from "@/components/sections/Drawer"
import {
  headerAside,
  headerNav,
  launchApp,
  mainNav,
  site,
} from "@/data/site"
import { cx } from "@/lib/cx"
import { currentPath, isCurrentPath } from "@/lib/nav"

/** The Discord glyph, copied from the original's header. */
function DiscordIcon() {
  return (
    <svg viewBox="0 0 24 24" fill="currentColor" aria-hidden="true" className="h-4 w-4">
      <path d="M20.317 4.37a19.791 19.791 0 0 0-4.885-1.515.074.074 0 0 0-.079.037c-.21.375-.444.864-.608 1.25a18.27 18.27 0 0 0-5.487 0 12.64 12.64 0 0 0-.617-1.25.077.077 0 0 0-.079-.037A19.736 19.736 0 0 0 3.677 4.37a.07.07 0 0 0-.032.027C.533 9.046-.32 13.58.099 18.057a.082.082 0 0 0 .031.057 19.9 19.9 0 0 0 5.993 3.03.078.078 0 0 0 .084-.028c.462-.63.874-1.295 1.226-1.994a.076.076 0 0 0-.041-.106 13.107 13.107 0 0 1-1.872-.892.077.077 0 0 1-.008-.128 10.2 10.2 0 0 0 .372-.292.074.074 0 0 1 .077-.01c3.928 1.793 8.18 1.793 12.062 0a.074.074 0 0 1 .078.01c.12.098.246.198.373.292a.077.077 0 0 1-.006.127 12.299 12.299 0 0 1-1.873.892.077.077 0 0 0-.041.107c.36.698.772 1.362 1.225 1.993a.076.076 0 0 0 .084.028 19.839 19.839 0 0 0 6.002-3.03.077.077 0 0 0 .032-.054c.5-5.177-.838-9.674-3.549-13.66a.061.061 0 0 0-.031-.03zM8.02 15.33c-1.183 0-2.157-1.085-2.157-2.419 0-1.333.956-2.419 2.157-2.419 1.21 0 2.176 1.096 2.157 2.42 0 1.333-.956 2.418-2.157 2.418zm7.975 0c-1.183 0-2.157-1.085-2.157-2.419 0-1.333.955-2.419 2.157-2.419 1.21 0 2.176 1.096 2.157 2.42 0 1.333-.946 2.418-2.157 2.418z" />
    </svg>
  )
}

/**
 * The site header: a pinned bar carrying the Wordmark, the primary
 * navigation, and the call to action.
 *
 * The bar is full-bleed — its inner row spans the viewport and the logo sits
 * at the very edge — where the sections below it sit inside the Frame.
 *
 * The bar is the page's banner landmark, and the navigation inside it is a
 * navigation landmark of its own.
 */
export function SiteHeader() {
  return (
    <header
      id="site-nav"
      className="sticky top-0 left-0 z-50 w-full border-b border-line bg-bg/95 backdrop-blur-sm"
    >
      <div className="flex h-12 items-stretch justify-between">
        <div className="flex min-w-0 items-stretch">
          <a
            className="flex items-center border-r border-line px-4 hover:opacity-70 sm:px-5"
            href={currentPath}
          >
            {/* The original's logo is a plain image, and the themed filter
                needs the element itself. */}
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img alt={site.logoAlt} src={site.logo} className="themed-logo h-6 w-auto" />
          </a>
          <nav aria-label={mainNav.label} className="hidden min-w-0 items-stretch lg:flex">
            <ul className="flex h-full items-stretch">
              {headerNav.map((entry, index) => {
                // The last entry carries the rule that separates the site's own
                // destinations from the Craft Apps, as the original does.
                const separator =
                  index === headerNav.length - 1
                    ? "ml-1.5 border-l border-line pl-1.5"
                    : undefined

                if (entry.children) {
                  return (
                    <NavDropdown
                      key={entry.label}
                      label={entry.label}
                      links={entry.children}
                      className={separator}
                    />
                  )
                }

                const current = isCurrentPath(entry.href)

                return (
                  <li
                    key={entry.label}
                    className={cx("flex items-stretch", separator)}
                  >
                    <a
                      aria-current={current ? "page" : undefined}
                      className={cx(
                        "group flex h-full items-center px-2.5 hud-label whitespace-nowrap",
                        current ? "text-ink" : "text-muted hover:text-ink",
                      )}
                      href={entry.href}
                      {...(entry.external
                        ? { target: "_blank", rel: "noopener noreferrer" }
                        : {})}
                    >
                      <span
                        className={cx(
                          "flex items-center gap-1.5 px-1.5 py-0.5 group-hover:bg-invert-bg group-hover:text-invert-fg",
                          current ? "bg-invert-bg text-invert-fg" : "",
                        )}
                      >
                        {entry.label}
                      </span>
                    </a>
                  </li>
                )
              })}
            </ul>
          </nav>
        </div>
        <div className="flex shrink-0 items-stretch">
          <div className="hidden items-stretch md:flex">
            {headerAside.map((entry) =>
              // The Discord link is an icon; the rest are HUD Labels.
              entry.href === site.discord ? (
                <a
                  key={entry.href}
                  href={entry.href}
                  {...(entry.external
                    ? { target: "_blank", rel: "noopener noreferrer" }
                    : {})}
                  aria-label={entry.label}
                  title={entry.label}
                  className="flex w-12 items-center justify-center border-l border-line text-muted hover:bg-invert-bg hover:text-invert-fg"
                >
                  <DiscordIcon />
                </a>
              ) : (
                <a
                  key={entry.href}
                  href={entry.href}
                  className="group flex h-full items-center px-2.5 hud-label whitespace-nowrap text-muted hover:text-ink"
                  {...(entry.external
                    ? { target: "_blank", rel: "noopener noreferrer" }
                    : {})}
                >
                  <span className="flex items-center gap-1.5 px-1.5 py-0.5 group-hover:bg-invert-bg group-hover:text-invert-fg">
                    {entry.label}
                  </span>
                </a>
              ),
            )}
            <ThemeToggle />
            <Cta
              href={launchApp.href}
              external
              size="bar"
              className="h-full border-l border-line"
            >
              {launchApp.label}
            </Cta>
          </div>
          <div className="flex items-stretch md:hidden">
            <ThemeToggle />
          </div>
          <Drawer />
        </div>
      </div>
    </header>
  )
}
