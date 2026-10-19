import { Frame } from "@/components/primitives/Frame"
import { site } from "@/data/site"

export default function Home() {
  return (
    <main>
      <Frame className="px-6 py-10 md:px-10">
        <h1 className="font-display text-3xl font-medium leading-[1.05] tracking-[-0.03em] text-ink-strong sm:text-4xl">
          {site.heading}
        </h1>
      </Frame>
    </main>
  )
}
