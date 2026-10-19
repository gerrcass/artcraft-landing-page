/**
 * The Section Bar: the strip that opens a numbered section, carrying the
 * section's number and subject on the left and a short descriptor on the
 * right. It pins directly beneath the site header.
 *
 * The number and the subject read as one unit. The descriptor is hidden on the
 * smallest breakpoint.
 */
export function SectionBar({
  number,
  subject,
  descriptor,
}: {
  number: string
  subject: string
  descriptor: string
}) {
  return (
    <div
      data-draw-eyebrow="true"
      className="sticky top-12 z-30 border-y border-line bg-bg/60 backdrop-blur-md"
    >
      <div className="flex items-center justify-between gap-4 px-6 py-3 md:px-10">
        <p className="hud-label text-muted">
          <span className="text-faint">{number}</span>
          <span aria-hidden="true" className="mx-2 text-faint">
            /
          </span>
          {subject}
        </p>
        <p className="hud-label hidden text-faint sm:block">{descriptor}</p>
      </div>
    </div>
  )
}
