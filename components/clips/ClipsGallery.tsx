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
  tiktok: '#00E5E5',
}

export function ClipsGallery() {
  return (
    <section id="clips" className="py-20 overflow-hidden">
      <div className="px-10 mb-10">
        <h2
          className="font-russo text-white uppercase"
          style={{ fontSize: 'clamp(36px, 5vw, 64px)' }}
        >
          HIGH<span className="text-cyan">LIGHTS</span>
        </h2>
      </div>

      <div
        className="flex gap-5 px-10 overflow-x-auto pb-4 snap-x snap-mandatory"
        style={{ scrollbarColor: '#00E5E5 #111C1C' }}
      >
        {CLIPS.map((clip) => (
          <a
            key={clip.id}
            href={clip.url}
            target="_blank"
            rel="noopener noreferrer"
            className="flex-shrink-0 w-72 snap-start group"
          >
            <div className="border border-cyan/10 bg-surface overflow-hidden transition-all duration-200 group-hover:border-cyan/50 group-hover:shadow-[0_0_20px_rgba(0,229,229,0.15)]">
              <div
                className="w-full h-40 flex items-center justify-center text-3xl"
                style={{ background: 'linear-gradient(135deg, #111C1C, #0A1E1E)' }}
              >
                🎮
              </div>

              <div className="p-4">
                <div className="flex items-center gap-2 mb-2">
                  <span
                    className="text-xs font-mono font-medium px-2 py-0.5 uppercase tracking-wider"
                    style={{
                      color: PLATFORM_COLORS[clip.platform],
                      border: `1px solid ${PLATFORM_COLORS[clip.platform]}40`,
                    }}
                  >
                    {clip.platform}
                  </span>
                </div>
                <h3 className="font-chakra font-medium text-body text-sm leading-tight mb-2">
                  {clip.title}
                </h3>
                <span className="font-mono text-xs text-muted">{clip.viewCount} views</span>
              </div>
            </div>
          </a>
        ))}
      </div>
    </section>
  )
}
