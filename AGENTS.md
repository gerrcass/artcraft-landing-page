# AGENTS.md

A frontend clone of the [ArtCraft](https://getartcraft.com) landing page, built to showcase
responsive design and modern UI layout. The original is the target; `docs/reference/` is the
capture we measure against.

## Read before you write

**Glossary.** `GLOSSARY.md` names this project's own vocabulary — Frame, Section Bar, HUD
Label, Serif Accent, Wordmark, Media Well, Feature Card, Ownership Card, Film Tile,
Choreography, Reveal, Reduced Path. Use those words for the things they name rather than
inventing synonyms, and extend the glossary when a new concept is resolved.

**Decisions.** `docs/adr/` records the choices already made and why — the stack and token
approach, the vendored media, the hand-rolled choreography, the Orbit reproduction. Read the
ADRs covering your area before choosing an approach, and write a new ADR when a decision
meets the bar of being hard to reverse, surprising without context, and a real trade-off.

**The original, captured.** `docs/reference/` holds screenshots of the live site plus the
original's rendered HTML and compiled stylesheet. Look at the section captures before
building a visual section — the Features section in particular cannot be judged from a
full-page capture, because its content only exists while the page is scrolled. Read the
original's HTML when you need its exact structure, class names, or copy.

**The spec.** Issue #1 holds the specification — the problem, the solution, the user
stories, the implementation decisions, the token values, and the testing decisions. The
tickets are issues #3 through #17.

## Working a ticket

Tickets are GitHub issues, each a tracer bullet with its blocking edges. The **frontier**
is the set of open tickets whose blockers are all closed, and it is the only work available
to claim:

```bash
gh issue list --repo gerrcass/artcraft-landing-page --state open \
  --json number,title,issue_dependencies_summary \
  --jq '.[] | select(.issue_dependencies_summary.total_blocked_by == 0) | "#\(.number) \(.title)"'
```

Claim a ticket by assigning it to yourself, work it on its own branch, and close it with a
comment naming what changed. See `docs/agents/issue-tracker.md` for the tracker's
conventions and `docs/agents/triage-labels.md` for the label vocabulary.

**One seam.** Everything is verified through the rendered page, at a given viewport width,
theme, and scroll position. Assert on what a visitor perceives — text, roles, visibility,
rendered appearance — and never on a component's internals. A test that passes while the
page is broken is a bad test.

**Tokens are the only place a value lives.** A colour, a typeface, or a measure is written
once, in the token layer, and reached by name everywhere else. Both themes use the same
token names, so a colour added to one is automatically required in the other.

**Copy is data.** Page copy lives in the content module and is read from there. A component
carries no copy of its own.

## Checks

The project's commands are the source of truth — read them from `package.json` rather than
assuming. The bar for a ticket being done is: the typecheck passes, the lint passes, the
ticket's own tests pass, and the ticket's acceptance criteria are each demonstrably met.

## Agent skills

### Issue tracker

Issues, specs, and tickets live in GitHub Issues on `gerrcass/artcraft-landing-page`, driven via the `gh` CLI. See `docs/agents/issue-tracker.md`.

### Triage labels

The five canonical triage roles use their native Matt Pocock label strings (`needs-triage`, `needs-info`, `ready-for-agent`, `ready-for-human`, `wontfix`). See `docs/agents/triage-labels.md`.

### Domain docs

Single-context layout: `GLOSSARY.md` at the repo root and ADRs in `docs/adr/`. See `docs/agents/domain.md`.
