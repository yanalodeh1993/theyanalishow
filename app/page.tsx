import { Nav } from '@/components/nav/Nav'
import { EntryScreen } from '@/components/entry/EntryScreen'
import { Hero } from '@/components/hero/Hero'
import { LiveZone } from '@/components/live/LiveZone'

export default function Home() {
  return (
    <EntryScreen>
      <main className="bg-bg">
        <Nav />
        <Hero />
        <LiveZone />
      </main>
    </EntryScreen>
  )
}
