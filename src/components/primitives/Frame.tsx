import type { ReactNode } from "react"

import { cx } from "@/lib/cx"

/**
 * The Frame: the 1280px-max-width container with hairline left and right
 * borders that every page section sits inside. The page is full-bleed; the
 * Frame is what gives the layout its editorial, print-like edge.
 *
 * The two Ticks are decorative registration marks, half outside the border.
 * They are `aria-hidden` and carry no meaning for assistive technology.
 */
export function Frame({
  children,
  className,
}: {
  children: ReactNode
  className?: string
}) {
  const classes = cx(
    "relative mx-auto max-w-[1280px] border-x border-line",
    className,
  )

  return (
    <div className={classes}>
      <span
        aria-hidden="true"
        data-draw-tick="true"
        className="tick tick-half z-[31] -top-[5px] -left-[6px]"
      />
      <span
        aria-hidden="true"
        data-draw-tick="true"
        className="tick tick-half z-[31] -top-[5px] -right-[5px]"
      />
      {children}
    </div>
  )
}
