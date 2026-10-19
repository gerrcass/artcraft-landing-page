import { headlineText, type Headline } from "@/data/site"

/**
 * A heading with a Serif Accent.
 *
 * The accent is the single italic serif run inside the heading. The parts are
 * joined the way they read — a space between words, and no space before
 * punctuation — so "Start crafting." reads as itself.
 */
export function Heading({
  headline,
  as: Tag = "h2",
  className,
}: {
  headline: Headline
  as?: "h1" | "h2" | "h3"
  className?: string
}) {
  const tail = headline.after
    ? /^[\p{P}]/u.test(headline.after)
      ? headline.after
      : ` ${headline.after}`
    : ""

  return (
    <Tag className={className}>
      {headline.before}{" "}
      <span
        className={
          headline.accentMuted
            ? "font-serif italic font-normal text-muted"
            : "font-serif italic font-normal"
        }
      >
        {headline.accent}
      </span>
      {tail}
    </Tag>
  )
}

/** The heading's plain text, for a test or an accessible name. */
export { headlineText }
