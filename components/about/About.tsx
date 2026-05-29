import Image from 'next/image'

export function About() {
  return (
    <section
      id="about"
      className="px-10 md:px-14 py-20 grid-bg"
      style={{ background: '#0a0a0d', borderTop: '1px solid rgba(100,120,255,0.1)' }}
    >
      <div className="max-w-5xl mx-auto flex flex-col lg:flex-row items-center gap-14">
        {/* logo in a chrome circle frame */}
        <div className="shrink-0 relative">
          <div
            className="rounded-full flex items-center justify-center"
            style={{
              width: 180,
              height: 180,
              background:
                'radial-gradient(circle at 40% 40%, rgba(100,120,255,0.1), rgba(100,120,255,0.02))',
              border: '1px solid rgba(100,120,255,0.35)',
              boxShadow: '0 0 30px rgba(100,120,255,0.12), inset 0 0 30px rgba(100,120,255,0.04)',
            }}
          >
            <Image
              src="/logo-transparent.png"
              alt="Yanali"
              width={120}
              height={120}
              style={{ filter: 'drop-shadow(0 0 16px rgba(100,120,255,0.35))' }}
            />
          </div>
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
            Competitive gamer. Battle royale player. Future van lifer. TheYanaliShow is where the
            grind of ranked play meets the freedom of the open road.
          </p>
          <p className="font-chakra text-sm leading-relaxed text-muted/70">
            Every stream is a battle. Every road is a new arena.
            <br />
            Follow the journey — wherever it goes.
          </p>
        </div>
      </div>
    </section>
  )
}
