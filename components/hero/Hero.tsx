'use client'
import { useStreamStatus } from '@/lib/hooks/useStreamStatus'

export function Hero() {
  const { isAnyLive, twitch } = useStreamStatus()

  return (
    <section
      id="hero"
      className="relative overflow-hidden grid-bg"
      style={{ minHeight: '88vh', paddingTop: '73px', background: '#0d0d0f' }}
    >
      {/* ambient glow */}
      <div
        className="absolute top-1/2 left-1/2 pointer-events-none"
        style={{
          transform: 'translate(-50%, -50%)',
          width: 700,
          height: 700,
          background: 'radial-gradient(circle, rgba(100,120,255,0.07) 0%, transparent 70%)',
        }}
      />

      <div
        className="relative z-10 flex items-center px-[60px]"
        style={{ minHeight: 'calc(88vh - 73px)' }}
      >
        {/* LEFT: copy */}
        <div className="max-w-[680px] flex-1 py-16">
          {/* Eyebrow */}
          <div className="flex items-center gap-4 mb-6">
            <div
              className="w-10 h-0.5 shrink-0"
              style={{
                background: 'linear-gradient(90deg, #6478ff, #a78bff)',
                boxShadow: '0 0 8px rgba(100,120,255,0.5)',
              }}
            />
            <span
              className="font-chakra text-[12px] font-medium tracking-[4px] uppercase"
              style={{ color: '#6478ff' }}
            >
              Streamer · Adventurer · Creator
            </span>
          </div>

          {/* Headline */}
          <h1
            className="font-russo uppercase"
            style={{ fontSize: 'clamp(60px, 10vw, 130px)', lineHeight: 0.9, letterSpacing: '-2px' }}
          >
            <span className="block text-white">THE</span>
            <span className="block chrome-text">WORLD</span>
            <span
              className="block"
              style={{ WebkitTextStroke: '2px rgba(100,120,255,0.25)', color: 'transparent' }}
            >
              IS YOURS
            </span>
          </h1>

          <p
            className="font-chakra font-light leading-[1.8] max-w-[420px] mt-8"
            style={{ fontSize: '14px', color: '#3a3a5a' }}
          >
            Gaming. Adventure. The open road.
            <br />
            TheYanaliShow is where the battlefield meets the horizon.
          </p>

          <div className="flex items-center gap-5 mt-12 flex-wrap">
            <a
              href="#streams"
              className="btn-neon-magenta font-russo text-[13px] tracking-[2px] uppercase px-10 py-[18px] text-white cursor-pointer"
              style={{
                background: 'linear-gradient(135deg, #6478ff, #a78bff)',
              }}
            >
              Watch Live Now
            </a>
            <a
              href="#clips"
              className="font-chakra text-[13px] font-medium tracking-[1px] text-body flex items-center gap-2 transition-colors duration-200 hover:text-cyan cursor-pointer"
            >
              Browse Clips <span>→</span>
            </a>
          </div>

          {isAnyLive && (
            <div className="mt-8 inline-flex items-center gap-2 font-chakra text-xs font-semibold text-magenta tracking-widest uppercase">
              <span
                className="w-2 h-2 rounded-full bg-magenta animate-pulse"
                style={{ boxShadow: '0 0 8px #a78bff' }}
              />
              Live right now
            </div>
          )}
        </div>

        {/* RIGHT: stream card — desktop only */}
        <div className="hidden lg:block absolute right-[60px] top-1/2 -translate-y-1/2 z-20">
          <div
            className="w-[340px] overflow-hidden transition-[border-color] duration-200 rounded-2xl"
            style={{
              border: '1px solid rgba(100,120,255,0.2)',
              background: '#14141a',
              boxShadow: '0 0 40px rgba(100,120,255,0.08)',
            }}
            onMouseEnter={(e) => {
              ;(e.currentTarget as HTMLDivElement).style.borderColor = '#6478ff'
              ;(e.currentTarget as HTMLDivElement).style.boxShadow =
                '0 0 40px rgba(100,120,255,0.18)'
            }}
            onMouseLeave={(e) => {
              ;(e.currentTarget as HTMLDivElement).style.borderColor = 'rgba(100,120,255,0.2)'
              ;(e.currentTarget as HTMLDivElement).style.boxShadow =
                '0 0 40px rgba(100,120,255,0.08)'
            }}
          >
            {/* thumbnail */}
            <div
              className="w-full relative flex flex-col items-center justify-center gap-3 text-center"
              style={{
                height: 190,
                background: 'linear-gradient(135deg, #141420 0%, #0a0a12 100%)',
              }}
            >
              <span className="text-cyan" style={{ fontSize: 40, opacity: 0.75 }}>
                ▶
              </span>
              <span className="font-chakra text-[11px] uppercase tracking-[0.3em] text-cyan/70">
                Watch latest stream
              </span>
              {isAnyLive && (
                <div
                  className="absolute top-3 left-3 flex items-center gap-1.5 font-chakra text-[10px] font-semibold tracking-[2px] text-white uppercase px-2.5 py-1 rounded-full"
                  style={{ background: '#a78bff', boxShadow: '0 0 12px rgba(167,139,255,0.5)' }}
                >
                  <span className="w-1.5 h-1.5 bg-white rounded-full animate-pulse" />
                  LIVE
                </div>
              )}
            </div>

            {/* info */}
            <div className="p-4">
              <div className="font-russo text-[14px] text-white mb-1.5">
                {isAnyLive ? 'Live Now on Twitch' : 'Watch Latest Stream'}
              </div>
              <div className="font-chakra text-[11px] flex gap-4" style={{ color: '#3a3a5a' }}>
                {isAnyLive && twitch?.viewer_count ? (
                  <>
                    <span style={{ color: '#6478ff' }}>
                      {twitch.viewer_count.toLocaleString()} viewers
                    </span>
                    <span>Twitch</span>
                  </>
                ) : (
                  <span>Follow to get notified</span>
                )}
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  )
}
