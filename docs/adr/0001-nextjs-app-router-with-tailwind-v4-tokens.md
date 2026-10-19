# Next.js App Router with Tailwind v4 CSS-first tokens

The clone is built on Next.js 15 (App Router) with TypeScript and Tailwind CSS v4. The
original site is itself a Next.js app whose stylesheet is Tailwind v4 in CSS-first mode —
its design tokens live in `@theme` blocks that emit `--bg`, `--ink`, `--line`, `--muted`
and friends as custom properties. Adopting the same stack and the same token mechanism
lets the clone reproduce the design system by transcribing it rather than by
approximating it in a different styling paradigm, which was the deciding factor over a
lighter Vite + React setup.
