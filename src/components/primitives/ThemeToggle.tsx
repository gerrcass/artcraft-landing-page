"use client"

import { themeToggle } from "@/data/site"
import { cx } from "@/lib/cx"
import { useTheme } from "@/lib/theme"

/** The moon the original's toggle shows. */
function MoonIcon() {
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
      className="h-4 w-4"
      aria-hidden="true"
    >
      <path d="M20.985 12.486a9 9 0 1 1-9.473-9.472c.405-.022.617.46.402.803a6 6 0 0 0 8.268 8.268c.344-.215.825-.004.803.401" />
    </svg>
  )
}

/**
 * The theme toggle.
 *
 * Its accessible name says which theme it will switch to, so a screen reader
 * announces the action rather than the icon. The choice is stored, so it
 * survives a reload, and it is applied to the document element, so the whole
 * page follows.
 */
export function ThemeToggle({ className }: { className?: string }) {
  const { theme, toggle } = useTheme()

  const label = theme === "dark" ? themeToggle.toLight : themeToggle.toDark

  const classes = cx(
    "invert-block flex items-center justify-center text-muted hover:text-invert-fg w-12 border-l border-line",
    className,
  )

  return (
    <button type="button" aria-label={label} onClick={toggle} className={classes}>
      <MoonIcon />
    </button>
  )
}
