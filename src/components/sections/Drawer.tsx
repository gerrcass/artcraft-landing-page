"use client"

import { useCallback, useEffect, useRef, useState } from "react"
import { createPortal } from "react-dom"

import { Cta } from "@/components/primitives/Cta"
import { ThemeToggle } from "@/components/primitives/ThemeToggle"
import type { NavLink } from "@/data/site"
import { drawer, headerAside, headerNav, launchApp, site } from "@/data/site"
import { cx } from "@/lib/cx"
import { currentPath, isCurrentPath } from "@/lib/nav"

/** The menu glyph, copied from the original's header. */
function MenuIcon() {
  return (
    <svg
      xmlns="http://www.w3.org/2000/svg"
      width="24"
      height="24"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
      className="h-5 w-5"
      aria-hidden="true"
    >
      <path d="M4 5h16" />
      <path d="M4 12h16" />
      <path d="M4 19h16" />
    </svg>
  )
}

/** The close glyph. */
function CloseIcon() {
  return (
    <svg
      xmlns="http://www.w3.org/2000/svg"
      width="24"
      height="24"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
      className="h-5 w-5"
      aria-hidden="true"
    >
      <path d="M18 6 6 18" />
      <path d="m6 6 12 12" />
    </svg>
  )
}

/** The elements the focus trap cycles through. */
const FOCUSABLE = [
  "a[href]",
  "button:not([disabled])",
  "input:not([disabled])",
  "select:not([disabled])",
  "textarea:not([disabled])",
  '[tabindex]:not([tabindex="-1"])',
].join(", ")

/** The focusable elements inside a container, in the order they are read. */
function focusableElements(container: HTMLElement | null): HTMLElement[] {
  if (!container) {
    return []
  }

  return Array.from(
    container.querySelectorAll<HTMLElement>(FOCUSABLE),
  ).filter((element) => element.getClientRects().length > 0)
}

/**
 * A destination in the drawer.
 *
 * The drawer is the one place every destination is shown at once, so the
 * destinations come from the content module and the links only dress them.
 */
function DrawerLink({
  link,
  current = false,
}: {
  link: NavLink
  current?: boolean
}) {
  return (
    <a
      href={link.href}
      aria-current={current ? "page" : undefined}
      className={cx(
        "block py-2 text-muted hover:text-ink",
        current ? "text-ink" : "",
      )}
      {...(link.external ? { target: "_blank", rel: "noopener noreferrer" } : {})}
    >
      {link.label}
    </a>
  )
}

/**
 * The Drawer: the panel that covers a narrow screen when the menu button is
 * pressed.
 *
 * On a narrow screen the primary navigation cannot fit, so it collapses into
 * a menu button. The button opens a drawer holding every destination the site
 * has — the primary navigation, the destinations behind the Resources and
 * Craft Apps dropdowns, and the links on the right of the header.
 *
 * While the drawer is open it holds the focus, the page behind it cannot
 * scroll, and Escape, a click outside it, or a link inside it closes it —
 * and the focus goes back to the menu button.
 *
 * The panel's id is the original's: the original's own header names it
 * `mobile-nav`, and the button's `aria-controls` points at it.
 */
export function Drawer() {
  const [open, setOpen] = useState(false)
  const menuButton = useRef<HTMLButtonElement>(null)
  const panel = useRef<HTMLDivElement>(null)

  /** Closes the drawer and hands the focus back to the menu button. */
  const close = useCallback(() => {
    setOpen(false)
    menuButton.current?.focus()
  }, [])

  // The focus goes into the drawer when it opens.
  useEffect(() => {
    if (!open) {
      return
    }

    const elements = focusableElements(panel.current)
    ;(elements[0] ?? panel.current)?.focus()
  }, [open])

  // The page behind the drawer cannot scroll while it is open.
  useEffect(() => {
    if (!open) {
      return
    }

    const previous = document.body.style.overflow
    document.body.style.overflow = "hidden"

    return () => {
      document.body.style.overflow = previous
    }
  }, [open])

  // Escape closes the drawer; Tab cycles inside it.
  useEffect(() => {
    if (!open) {
      return
    }

    const onKeyDown = (event: KeyboardEvent) => {
      if (event.key === "Escape") {
        event.preventDefault()
        close()
        return
      }

      if (event.key !== "Tab") {
        return
      }

      const elements = focusableElements(panel.current)

      if (elements.length === 0) {
        event.preventDefault()
        panel.current?.focus()
        return
      }

      const first = elements[0]
      const last = elements[elements.length - 1]
      const active = document.activeElement
      const index =
        active instanceof HTMLElement ? elements.indexOf(active) : -1

      if (event.shiftKey) {
        if (index <= 0) {
          event.preventDefault()
          last.focus()
        }
        return
      }

      if (index === -1 || index === elements.length - 1) {
        event.preventDefault()
        first.focus()
      }
    }

    document.addEventListener("keydown", onKeyDown)

    return () => {
      document.removeEventListener("keydown", onKeyDown)
    }
  }, [open, close])

  /** A link inside the drawer closes it. */
  const onPanelClick = (event: React.MouseEvent<HTMLDivElement>) => {
    const target = event.target

    if (target instanceof Element && target.closest("a[href]")) {
      close()
    }
  }

  const drawerPanel = (
    <div className="fixed inset-0 z-[60]">
      {/* The page behind the drawer, veiled; a click on it closes the drawer. */}
      <div
        className="absolute inset-0 bg-bg-sunken/80"
        aria-hidden="true"
        onClick={close}
      />
      <div
        ref={panel}
        id="mobile-nav"
        role="dialog"
        aria-modal="true"
        aria-label={drawer.label}
        tabIndex={-1}
        onClick={onPanelClick}
        className="absolute inset-y-0 left-0 flex w-[85vw] max-w-sm flex-col overflow-hidden border-r border-line bg-bg-raised"
      >
        <div className="flex h-12 shrink-0 items-center justify-between border-b border-line px-4">
          <a href={currentPath} className="flex items-center hover:opacity-70">
            {/* The original's logo is a plain image, and the themed filter
                needs the element itself. */}
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img alt={site.logoAlt} src={site.logo} className="themed-logo h-5 w-auto" />
          </a>
          <button
            type="button"
            onClick={close}
            aria-label={drawer.close}
            className="flex h-9 w-9 items-center justify-center text-muted hover:bg-invert-bg hover:text-invert-fg"
          >
            <CloseIcon />
          </button>
        </div>

        <div className="flex-1 overflow-y-auto px-4 py-5">
          <ul className="flex flex-col">
            {headerNav.map((entry) =>
              entry.children ? (
                <li key={entry.label} className="mt-6 first:mt-0">
                  <p className="hud-label text-muted">{entry.label}</p>
                  <ul className="mt-2 flex flex-col border-l border-line pl-3">
                    {entry.children.map((child) => (
                      <li key={child.href}>
                        <DrawerLink link={child} />
                      </li>
                    ))}
                  </ul>
                </li>
              ) : (
                <li key={entry.label}>
                  <DrawerLink link={entry} current={isCurrentPath(entry.href)} />
                </li>
              ),
            )}
          </ul>
        </div>

        <div className="shrink-0 border-t border-line">
          <ul className="px-4 py-3">
            {headerAside.map((entry) => (
              <li key={entry.href}>
                <DrawerLink link={entry} />
              </li>
            ))}
          </ul>
          <div className="flex items-stretch border-t border-line">
            <Cta
              href={launchApp.href}
              external
              size="bar"
              className="flex-1 py-3"
            >
              {launchApp.label}
            </Cta>
            <ThemeToggle />
          </div>
        </div>
      </div>
    </div>
  )

  return (
    <>
      <div className="flex items-stretch lg:hidden">
        <button
          ref={menuButton}
          type="button"
          aria-expanded={open}
          aria-controls="mobile-nav"
          onClick={() => setOpen((value) => !value)}
          className="flex w-12 items-center justify-center border-l border-line text-muted hover:bg-invert-bg hover:text-invert-fg"
        >
          <span className="sr-only">{drawer.button}</span>
          <MenuIcon />
        </button>
      </div>
      {/* The drawer is portalled out of the header: the header's backdrop
          filter would otherwise hold it in place. */}
      {open ? createPortal(drawerPanel, document.body) : null}
    </>
  )
}
