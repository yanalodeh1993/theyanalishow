'use client'

type Clip = {
  id: string
  title: string
  platform: 'twitch' | 'youtube' | 'tiktok'
  viewCount: string
  url: string
}

const CLIPS: Clip[] = [
  { id: '1', title: 'Solo Win — Final Circle', platform: 'twitch', viewCount: '12.4K', url: '#' },
  { id: '2', title: 'Clutch Elimination Streak', platform: 'youtube', viewCount: '8.2K', url: '#' },
  { id: '3', title: 'Insane Long Shot', platform: 'tiktok', viewCount: '34K', url: '#' },
  { id: '4', title: 'Box Fight Domination', platform: 'twitch', viewCount: '5.1K', url: '#' },
  { id: '5', title: '5 Elims in 30 Seconds', platform: 'youtube', viewCount: '19K', url: '#' },
  { id: '6', title: 'Building 1v1 Win', platform: 'tiktok', viewCount: '27K', url: '#' },
]

const PLATFORM_COLORS: Record<string, string> = {
  twitch: '#9146FF',
  youtube: '#FF0000',
  tiktok: '#6478ff',
}

function PlayIcon() {
  return (
    <svg
      className="w-10 h-10 text-cyan"
      fill="currentColor"
      viewBox="0 0 24 24"
      aria-hidden="true"
      style={{ opacity: 1, transform: 'none' }}
    >
      <path d="M8 5v14l11-7z" />
    </svg>
  )
}

export function ClipsGallery() {
  return (
    <section
      id="clips"
      className="py-20 overflow-hidden"
      style={{ background: '#0d0d0f', borderTop: '1px solid rgba(100,120,255,0.1)' }}
    >
      <div className="px-10 md:px-14 mb-8 flex items-end justify-between">
        <h2
          className="font-russo uppercase tracking-[2px]"
          style={{ fontSize: 'clamp(36px, 5vw, 64px)', color: '#d0d8ff' }}
        >
          HIGH<span className="chrome-text">LIGHTS</span>
        </h2>
        <span className="font-chakra text-xs text-muted uppercase tracking-widest hidden md:block">
          Scroll to explore →
        </span>
      </div>

      <div
        className="flex gap-4 px-10 md:px-14 overflow-x-auto pb-4 snap-x snap-mandatory"
        style={{ scrollbarColor: '#6478ff #14141a' }}
      >
        {CLIPS.map((clip) => (
          <a
            key={clip.id}
            href={clip.url}
            target="_blank"
            rel="noopener noreferrer"
            className="flex-shrink-0 w-72 snap-start group cursor-pointer"
          >
            <div
              className="border overflow-hidden rounded-xl transition-all duration-200"
              style={{
                borderColor: 'rgba(255,255,255,0.06)',
                boxShadow: '0 0 0 rgba(100,120,255,0)',
                transition: 'transform 0.15s, box-shadow 0.15s, border-color 0.15s',
              }}
              onMouseEnter={(e) => {
                const el = e.currentTarget as HTMLDivElement
                el.style.borderColor = '#6478ff'
                el.style.boxShadow = '0 0 20px rgba(100,120,255,0.15)'
                el.style.transform = 'translateY(-3px)'
              }}
              onMouseLeave={(e) => {
                const el = e.currentTarget as HTMLDivElement
                el.style.borderColor = 'rgba(255,255,255,0.06)'
                el.style.boxShadow = 'none'
                el.style.transform = 'none'
              }}
            >
              <div
                className="relative w-full h-40 flex flex-col items-center justify-center gap-2 text-center"
                style={{
                  background: 'linear-gradient(135deg, #141420, #0a0a12)',
                  color: 'rgba(100,120,255,0.85)',
                }}
              >
                <PlayIcon />
                <span className="font-chakra text-[11px] uppercase tracking-[0.18em] text-cyan/70">
                  Watch clip preview
                </span>
              </div>

              <div className="p-4" style={{ background: '#14141a' }}>
                <div className="flex items-center gap-2 mb-2">
                  <span
                    className="font-chakra text-[11px] font-bold px-2 py-0.5 uppercase tracking-wider border rounded-full"
                    style={{
                      color: PLATFORM_COLORS[clip.platform],
                      borderColor: `${PLATFORM_COLORS[clip.platform]}40`,
                    }}
                  >
                    {clip.platform}
                  </span>
                </div>
                <h3 className="font-chakra font-medium text-body text-sm leading-tight mb-2">
                  {clip.title}
                </h3>
                <span className="font-chakra text-xs text-muted">{clip.viewCount} views</span>
              </div>
            </div>
          </a>
        ))}
      </div>
    </section>
  )
}
