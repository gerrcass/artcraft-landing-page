"use client"

import { useEffect, useRef, useState } from "react"

import type { NavLink } from "@/data/site"

/** The chevron the original's dropdown triggers carry. */
function Chevron() {
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
      className="h-3 w-3 group-data-[state=open]:rotate-180"
      aria-hidden="true"
    >
      <path d="m6 9 6 6 6-6" />
    </svg>
  )
}

/** A stable id for the panel, so the trigger can point at it. */
function panelId(label: string) {
  return `nav-panel-${label.toLowerCase().replace(/[^a-z0-9]+/g, "-")}`
}

/**
 * A navigation entry that opens a panel of destinations.
 *
 * The trigger is a button, so it opens with Enter and with Space, and the
 * links in the panel are reachable with Tab. The panel closes on an outside
 * click and on Escape, and Escape returns focus to the trigger.
 */
export function NavDropdown({
  label,
  links,
  className,
}: {
  label: string
  links: NavLink[]
  className?: string
}) {
  const [open, setOpen] = useState(false)
  const item = useRef<HTMLLIElement>(null)
  const trigger = useRef<HTMLButtonElement>(null)
  const id = panelId(label)

  useEffect(() => {
    if (!open) {
      return
    }

    const onPointerDown = (event: PointerEvent) => {
      if (item.current && !item.current.contains(event.target as Node)) {
        setOpen(false)
      }
    }

    const onKeyDown = (event: KeyboardEvent) => {
      if (event.key !== "Escape") {
        return
      }
      setOpen(false)
      trigger.current?.focus()
    }

    document.addEventListener("pointerdown", onPointerDown)
    document.addEventListener("keydown", onKeyDown)
    return () => {
      document.removeEventListener("pointerdown", onPointerDown)
      document.removeEventListener("keydown", onKeyDown)
    }
  }, [open])

  const itemClasses = ["relative flex items-stretch", className]
    .filter(Boolean)
    .join(" ")

  return (
    <li className={itemClasses} ref={item}>
      <button
        ref={trigger}
        type="button"
        aria-expanded={open}
        aria-haspopup="true"
        aria-controls={id}
        data-state={open ? "open" : "closed"}
        onClick={() => setOpen((value) => !value)}
        className="group flex h-full items-center px-2.5 hud-label whitespace-nowrap text-muted hover:text-ink"
      >
        <span className="flex items-center gap-1.5 px-1.5 py-0.5 group-hover:bg-invert-bg group-hover:text-invert-fg">
          {label}
          <Chevron />
        </span>
      </button>
      {open ? (
        <div
          id={id}
          role="group"
          aria-label={label}
          className="absolute left-0 top-full z-50 min-w-[12rem] border border-line bg-bg-raised py-1 shadow-lg"
        >
          <ul>
            {links.map((link) => (
              <li key={link.href}>
                <a
                  href={link.href}
                  className="flex items-center px-3 py-2 hud-label text-muted transition-colors hover:bg-invert-bg hover:text-invert-fg"
                  {...(link.external
                    ? { target: "_blank", rel: "noopener noreferrer" }
                    : {})}
                >
                  {link.label}
                </a>
              </li>
            ))}
          </ul>
        </div>
      ) : null}
    </li>
  )
}
