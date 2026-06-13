import Image from 'next/image'
import { createSupabaseServerClient } from '@/lib/supabase-server'
import type { SiteConfig } from '@/lib/types'

export async function About() {
  const supabase = await createSupabaseServerClient()
  const { data } = await supabase.from('site_config').select('*').eq('id', 1).single()
  const config = data as SiteConfig | null

  const bioMain = config?.bio_main ?? 'Competitive gamer. Battle royale player. Future van lifer. TheYanaliShow is where the grind of ranked play meets the freedom of the open road.'
  const bioSub = config?.bio_sub ?? 'Every stream is a battle. Every road is a new arena. Follow the journey — wherever it goes.'

  return (
    <section
      id="about"
      className="px-10 md:px-14 py-20 grid-bg"
      style={{ borderTop: '1px solid rgba(100,120,255,0.1)' }}
    >
      <div className="max-w-5xl mx-auto flex flex-col md:flex-row items-center gap-14">
        <div className="shrink-0 flex-none">
          <Image
            src="/logo-transparent.png"
            alt="Yanali"
            width={200}
            height={200}
            style={{
              filter: 'drop-shadow(0 0 16px rgba(100,120,255,0.35))',
              width: 'clamp(180px, 14vw, 360px)',
              height: 'auto',
            }}
          />
        </div>

        <div>
          <div
            className="inline-block font-chakra text-[11px] font-semibold tracking-[3px] uppercase px-4 py-2 mb-6 rounded-full"
            style={{ color: '#6478ff', border: '1px solid rgba(100,120,255,0.3)' }}
          >
            About the Creator
          </div>

          <h2
            className="font-russo uppercase leading-[0.95] tracking-[2px] mb-5"
            style={{ fontSize: 'clamp(36px, 4.5vw, 64px)' }}
          >
            WHO IS <span className="chrome-text">YANALI?</span>
          </h2>

          <p className="font-chakra text-[15px] leading-[1.75] text-muted max-w-lg mb-3">
            {bioMain}
          </p>
          <p className="font-chakra text-sm leading-relaxed text-muted/70">
            {bioSub}
          </p>
        </div>
      </div>
    </section>
  )
}
