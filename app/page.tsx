import { Nav } from '@/components/nav/Nav'
import { EntryScreen } from '@/components/entry/EntryScreen'
import { Hero } from '@/components/hero/Hero'
import { StatStrip } from '@/components/ui/StatStrip'
import { LiveZone } from '@/components/live/LiveZone'
import { ClipsGallery } from '@/components/clips/ClipsGallery'
import { VanDream } from '@/components/vandream/VanDream'
import { LinksHub } from '@/components/links/LinksHub'
import { About } from '@/components/about/About'
import { ScrollAnimations } from '@/components/ui/ScrollAnimations'

export default function Home() {
  return (
    <EntryScreen>
      <main className="flex flex-col gap-5">
        <Nav />
        <Hero />
        <StatStrip />
        <LiveZone />
        <ClipsGallery />
        <LinksHub />
        <About />
        <VanDream />
        <ScrollAnimations />
      </main>
    </EntryScreen>
  )
}
