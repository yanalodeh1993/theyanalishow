'use client'

import { useEffect, useRef, useState } from 'react'

type Clip = {
  id: string
  title: string
  platform: 'youtube' | 'twitch'
  viewCount: string
  thumbnailUrl: string
  url: string
}

const PLATFORM_COLORS: Record<string, string> = {
  twitch: '#9146FF',
  youtube: '#FF0000',
}

const VISIBLE = 5

function pickRandom(pool: Clip[], count: number): Clip[] {
  const shuffled = [...pool].sort(() => Math.random() - 0.5)
  return shuffled.slice(0, Math.min(count, shuffled.length))
}

function ChevronLeft() {
  return (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2.5} strokeLinecap="round" strokeLinejoin="round" className="w-5 h-5">
      <path d="M15 18l-6-6 6-6" />
    </svg>
  )
}

function ChevronRight() {
  return (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2.5} strokeLinecap="round" strokeLinejoin="round" className="w-5 h-5">
      <path d="M9 18l6-6-6-6" />
    </svg>
  )
}

function PlayOverlay() {
  return (
    <div className="absolute inset-0 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity duration-200" style={{ background: 'rgba(0,0,0,0.45)' }}>
      <div className="w-12 h-12 rounded-full flex items-center justify-center" style={{ background: 'rgba(100,120,255,0.9)' }}>
        <svg className="w-5 h-5 text-white ml-0.5" fill="currentColor" viewBox="0 0 24 24">
          <path d="M8 5v14l11-7z" />
        </svg>
      </div>
    </div>
  )
}

function ClipCardSkeleton() {
  return (
    <div className="flex-shrink-0 w-72 rounded-xl overflow-hidden border animate-pulse" style={{ borderColor: 'rgba(255,255,255,0.06)', background: '#14141a' }}>
      <div className="w-full h-40" style={{ background: '#1e1e2a' }} />
      <div className="p-4 space-y-2">
        <div className="h-3 rounded w-16" style={{ background: '#1e1e2a' }} />
        <div className="h-4 rounded w-full" style={{ background: '#1e1e2a' }} />
        <div className="h-3 rounded w-20" style={{ background: '#1e1e2a' }} />
      </div>
    </div>
  )
}

export function ClipsGallery() {
  const [pool, setPool] = useState<Clip[]>([])
  const [displayed, setDisplayed] = useState<Clip[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(false)
  const shuffleRef = useRef(() => {})

  shuffleRef.current = () => {
    if (pool.length === 0) return
    setDisplayed(pickRandom(pool, VISIBLE))
  }

  useEffect(() => {
    async function load() {
      try {
        const [ytRes, ttRes] = await Promise.allSettled([
          fetch('/api/clips/youtube').then(r => r.json()),
          fetch('/api/clips/twitch').then(r => r.json()),
        ])

        const clips: Clip[] = []
        if (ytRes.status === 'fulfilled') clips.push(...(ytRes.value.clips ?? []))
        if (ttRes.status === 'fulfilled') clips.push(...(ttRes.value.clips ?? []))

        if (clips.length === 0) {
          setError(true)
        } else {
          setPool(clips)
          setDisplayed(pickRandom(clips, VISIBLE))
        }
      } catch {
        setError(true)
      } finally {
        setLoading(false)
      }
    }

    load()
  }, [])

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

        <div className="flex items-center gap-3">
          <span className="font-chakra text-xs text-muted uppercase tracking-widest hidden md:block mr-2">
            {pool.length > 0 ? `${pool.length} clips` : 'Loading…'}
          </span>
          <button
            onClick={() => shuffleRef.current()}
            disabled={loading || pool.length === 0}
            aria-label="Previous shuffle"
            className="flex items-center justify-center w-9 h-9 rounded-full border transition-all duration-150 disabled:opacity-30"
            style={{ borderColor: 'rgba(100,120,255,0.3)', color: '#6478ff' }}
            onMouseEnter={e => { (e.currentTarget as HTMLButtonElement).style.borderColor = '#6478ff'; (e.currentTarget as HTMLButtonElement).style.background = 'rgba(100,120,255,0.1)' }}
            onMouseLeave={e => { (e.currentTarget as HTMLButtonElement).style.borderColor = 'rgba(100,120,255,0.3)'; (e.currentTarget as HTMLButtonElement).style.background = 'transparent' }}
          >
            <ChevronLeft />
          </button>
          <button
            onClick={() => shuffleRef.current()}
            disabled={loading || pool.length === 0}
            aria-label="Next shuffle"
            className="flex items-center justify-center w-9 h-9 rounded-full border transition-all duration-150 disabled:opacity-30"
            style={{ borderColor: 'rgba(100,120,255,0.3)', color: '#6478ff' }}
            onMouseEnter={e => { (e.currentTarget as HTMLButtonElement).style.borderColor = '#6478ff'; (e.currentTarget as HTMLButtonElement).style.background = 'rgba(100,120,255,0.1)' }}
            onMouseLeave={e => { (e.currentTarget as HTMLButtonElement).style.borderColor = 'rgba(100,120,255,0.3)'; (e.currentTarget as HTMLButtonElement).style.background = 'transparent' }}
          >
            <ChevronRight />
          </button>
        </div>
      </div>

      <div
        className="flex gap-4 px-10 md:px-14 pb-4"
        style={{ overflowX: 'auto', scrollbarColor: '#6478ff #14141a' }}
      >
        {loading ? (
          Array.from({ length: VISIBLE }).map((_, i) => <ClipCardSkeleton key={i} />)
        ) : error ? (
          <p className="font-chakra text-sm text-muted px-2 py-8">
            Couldn't load clips — check that your API keys are set in <code>.env.local</code>.
          </p>
        ) : (
          displayed.map(clip => (
            <a
              key={clip.id}
              href={clip.url}
              target="_blank"
              rel="noopener noreferrer"
              className="flex-shrink-0 w-72 group cursor-pointer"
            >
              <div
                className="border overflow-hidden rounded-xl transition-all duration-200"
                style={{ borderColor: 'rgba(255,255,255,0.06)' }}
                onMouseEnter={e => {
                  const el = e.currentTarget as HTMLDivElement
                  el.style.borderColor = '#6478ff'
                  el.style.boxShadow = '0 0 20px rgba(100,120,255,0.15)'
                  el.style.transform = 'translateY(-3px)'
                }}
                onMouseLeave={e => {
                  const el = e.currentTarget as HTMLDivElement
                  el.style.borderColor = 'rgba(255,255,255,0.06)'
                  el.style.boxShadow = 'none'
                  el.style.transform = 'none'
                }}
              >
                <div className="relative w-full h-40 overflow-hidden" style={{ background: '#141420' }}>
                  {clip.thumbnailUrl ? (
                    // eslint-disable-next-line @next/next/no-img-element
                    <img
                      src={clip.thumbnailUrl}
                      alt={clip.title}
                      className="w-full h-full object-cover"
                    />
                  ) : (
                    <div className="w-full h-full flex items-center justify-center" style={{ color: 'rgba(100,120,255,0.5)' }}>
                      <svg className="w-10 h-10" fill="currentColor" viewBox="0 0 24 24">
                        <path d="M8 5v14l11-7z" />
                      </svg>
                    </div>
                  )}
                  <PlayOverlay />
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
                  <h3 className="font-chakra font-medium text-body text-sm leading-tight mb-2 line-clamp-2">
                    {clip.title}
                  </h3>
                  {clip.viewCount && (
                    <span className="font-chakra text-xs text-muted">{clip.viewCount} views</span>
                  )}
                </div>
              </div>
            </a>
          ))
        )}
      </div>
    </section>
  )
}
