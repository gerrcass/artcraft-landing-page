/**
 * The Section Bar: the strip that opens a numbered section, carrying the
 * section's number and subject on the left and a short descriptor on the
 * right. It pins directly beneath the site header.
 *
 * The number and the subject read as one unit. The descriptor is hidden on the
 * smallest breakpoint.
 *
 * The labels are painted in the muted ink rather than the faint one: the faint
 * ink cannot meet AA on the background, and a label a visitor cannot read is
 * not a label (ADR-0007).
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
          <span className="text-muted">{number}</span>
          <span aria-hidden="true" className="mx-2 text-muted">
            /
          </span>
          {subject}
        </p>
        <p className="hud-label hidden text-muted sm:block">{descriptor}</p>
      </div>
    </div>
  )
}
