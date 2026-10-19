import type { ReactNode } from "react"

/**
 * The call to action button.
 *
 * Two variants: a primary that fills with the invert colours and dims on
 * hover, and a secondary that is transparent with a strong hairline border
 * which drops the border on hover. Both are square-cornered, both carry the
 * `data-cta` marker so the set can be found and changed as a group, and both
 * are set in the monospace face at 11px in bold uppercase with wide tracking.
 */
export function Cta({
  href,
  variant = "primary",
  size = "md",
  external = false,
  className,
  children,
}: {
  href: string
  variant?: "primary" | "secondary"
  size?: "md" | "sm"
  external?: boolean
  className?: string
  children: ReactNode
}) {
  const classes = [
    "inline-flex w-fit items-center justify-center gap-2 rounded-none font-mono font-bold uppercase tracking-[0.12em] whitespace-nowrap duration-150",
    variant === "primary"
      ? "bg-invert-bg text-invert-fg transition-opacity hover:opacity-80"
      : "invert-block border border-line-strong bg-bg text-ink hover:border-transparent",
    size === "md" ? "h-12 px-6 text-[11px]" : "px-3 py-1.5 text-[11px] font-medium",
    className,
  ]
    .filter(Boolean)
    .join(" ")

  return (
    <a
      href={href}
      className={classes}
      data-cta=""
      {...(external
        ? { target: "_blank", rel: "noopener noreferrer" }
        : {})}
    >
      {children}
    </a>
  )
}
