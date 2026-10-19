import Image from "next/image"

import { footer, site } from "@/data/site"

/**
 * The footer: the page's end — who made this, how to reach them, and every
 * destination grouped by what it is about.
 *
 * A hairline separates it from the page above. Inside the Frame it holds a
 * brand cell — the logo, the tagline, and the contact address as a mail link —
 * and four labelled groups, each a navigation landmark named by its own label,
 * each listing its destinations. A closing bar carries the copyright line and
 * the maker's mark.
 *
 * On a phone the groups stack. From the medium breakpoint they run four
 * across, the brand cell above them as a full-width row; at the large
 * breakpoint the brand cell takes the double-width track beside them.
 */
export function SiteFooter() {
  return (
    <footer className="border-t border-line">
      <div className="mx-auto max-w-[1280px] border-x border-line">
        <div className="grid gap-px bg-line md:grid-cols-4 lg:grid-cols-[2fr_1fr_1fr_1fr_1fr]">
          <div className="bg-bg p-6 md:col-span-4 md:p-10 lg:col-span-1">
            <Image
              src={site.logo}
              alt={site.logoAlt}
              width={116.34}
              height={97.5}
              unoptimized
              className="themed-logo h-8 w-auto"
            />
            <p className="mt-4 max-w-xs leading-relaxed text-muted">
              {site.tagline}
            </p>
            <a
              href={`mailto:${site.email}`}
              className="hud-label mt-6 inline-block text-muted hover:text-ink"
            >
              {site.email}
            </a>
          </div>

          {footer.groups.map((group) => (
            <nav
              key={group.label}
              aria-label={group.label}
              className="bg-bg p-6 md:p-8"
            >
              <p className="hud-label text-muted">{group.label}</p>
              <ul className="mt-4 flex flex-col gap-2.5">
                {group.links.map((link) => (
                  <li key={link.label}>
                    <a
                      className="text-muted hover:text-ink"
                      href={link.href}
                      {...(link.external
                        ? { target: "_blank", rel: "noopener noreferrer" }
                        : {})}
                    >
                      {link.label}
                    </a>
                  </li>
                ))}
              </ul>
            </nav>
          ))}
        </div>

        <div className="flex flex-col gap-2 border-t border-line px-6 py-4 md:flex-row md:items-center md:justify-between md:px-10">
          <p className="hud-label text-muted">{footer.copyright}</p>
          <p className="hud-label text-muted">{footer.maker}</p>
        </div>
      </div>
    </footer>
  )
}
