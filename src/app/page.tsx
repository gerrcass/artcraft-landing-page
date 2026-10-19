import { SkipLink } from "@/components/primitives/SkipLink"
import { Features } from "@/components/sections/Features"
import { Hero } from "@/components/sections/Hero"
import { Marquee } from "@/components/sections/Marquee"
import { Ownership } from "@/components/sections/Ownership"
import { Proof } from "@/components/sections/Proof"
import { SiteFooter } from "@/components/sections/SiteFooter"
import { SiteHeader } from "@/components/sections/SiteHeader"
import { Start } from "@/components/sections/Start"

/**
 * The page composes the sections and nothing else. Each section is a component
 * of its own; the copy each of them renders comes from the content module.
 */
export default function Home() {
  return (
    <>
      <SkipLink />
      <SiteHeader />
      <main id="main" tabIndex={-1}>
        <Hero />
        <Marquee />
        <Features />
        <Ownership />
        <Proof />
        <Start />
      </main>
      <SiteFooter />
    </>
  )
}
