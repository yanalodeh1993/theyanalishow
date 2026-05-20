import { Nav } from '@/components/nav/Nav'
import { EntryScreen } from '@/components/entry/EntryScreen'
import { Hero } from '@/components/hero/Hero'
import { LiveZone } from '@/components/live/LiveZone'
import { ClipsGallery } from '@/components/clips/ClipsGallery'
import { AdventureTeaser } from '@/components/adventure/AdventureTeaser'
import { VanDream } from '@/components/vandream/VanDream'
import { LinksHub } from '@/components/links/LinksHub'
import { About } from '@/components/about/About'
import { ScrollAnimations } from '@/components/ui/ScrollAnimations'

export default function Home() {
  return (
    <EntryScreen>
      <main className="bg-bg">
        <Nav />
        <Hero />
        <LiveZone />
        <ClipsGallery />
        <AdventureTeaser />
        <VanDream />
        <LinksHub />
        <About />
        <ScrollAnimations />
      </main>
    </EntryScreen>
  )
}
