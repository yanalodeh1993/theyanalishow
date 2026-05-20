import { Nav } from '@/components/nav/Nav'
import { EntryScreen } from '@/components/entry/EntryScreen'

export default function Home() {
  return (
    <EntryScreen>
      <main className="bg-bg min-h-screen">
        <Nav />
        <p className="text-cyan pt-24 px-10 font-russo">TheYanaliShow — building...</p>
      </main>
    </EntryScreen>
  )
}
