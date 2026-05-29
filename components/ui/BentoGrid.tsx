'use client'
import Image from 'next/image'
import { useEffect, useState } from 'react'
import { useStreamStatus } from '@/lib/hooks/useStreamStatus'
import { useVanFund } from '@/lib/hooks/useVanFund'
import { supabase } from '@/lib/supabase'
import type { SiteLink } from '@/lib/types'

const CLIPS = [
  { id: '1', title: 'Solo Win — Final Circle', platform: 'twitch', viewCount: '12.4K', url: '#' },
  { id: '2', title: 'Clutch Elimination Streak', platform: 'youtube', viewCount: '8.2K', url: '#' },
  { id: '3', title: 'Insane Long Shot', platform: 'tiktok', viewCount: '34K', url: '#' },
]

const PLATFORM_COLORS: Record<string, string> = {
  twitch: '#9146FF',
  youtube: '#FF0000',
  tiktok: '#00E5E5',
}

function GridOverlay() {
  return (
    <div
      className="absolute inset-0 pointer-events-none"
      style={{
        backgroundImage:
          'linear-gradient(rgba(0,229,229,0.025) 1px, transparent 1px), linear-gradient(90deg, rgba(0,229,229,0.025) 1px, transparent 1px)',
        backgroundSize: '56px 56px',
      }}
    />
  )
}

function TwitchIcon() {
  return (
    <svg viewBox="0 0 24 24" className="w-4 h-4 fill-current" aria-hidden="true">
      <path d="M11.571 4.714h1.715v5.143H11.57zm4.715 0H18v5.143h-1.714zM6 0L1.714 4.286v15.428h5.143V24l4.286-4.286h3.428L22.286 12V0zm14.571 11.143l-3.428 3.428h-3.429l-3 3v-3H6.857V1.714h13.714z" />
    </svg>
  )
}

function YouTubeIcon() {
  return (
    <svg viewBox="0 0 24 24" className="w-4 h-4 fill-current" aria-hidden="true">
      <path d="M23.498 6.186a3.016 3.016 0 0 0-2.122-2.136C19.505 3.545 12 3.545 12 3.545s-7.505 0-9.377.505A3.017 3.017 0 0 0 .502 6.186C0 8.07 0 12 0 12s0 3.93.502 5.814a3.016 3.016 0 0 0 2.122 2.136c1.871.505 9.376.505 9.376.505s7.505 0 9.377-.505a3.015 3.015 0 0 0 2.122-2.136C24 15.93 24 12 24 12s0-3.93-.502-5.814zM9.545 15.568V8.432L15.818 12l-6.273 3.568z" />
    </svg>
  )
}

function TikTokIcon() {
  return (
    <svg viewBox="0 0 24 24" className="w-4 h-4 fill-current" aria-hidden="true">
      <path d="M12.525.02c1.31-.02 2.61-.01 3.91-.02.08 1.53.63 3.09 1.75 4.17 1.12 1.11 2.7 1.62 4.24 1.79v4.03c-1.44-.05-2.89-.35-4.2-.97-.57-.26-1.1-.59-1.62-.93-.01 2.92.01 5.84-.02 8.75-.08 1.4-.54 2.79-1.35 3.94-1.31 1.92-3.58 3.17-5.91 3.21-1.43.08-2.86-.31-4.08-1.03-2.02-1.19-3.44-3.37-3.65-5.71-.02-.5-.03-1-.01-1.49.18-1.9 1.12-3.72 2.58-4.96 1.66-1.44 3.98-2.13 6.15-1.72.02 1.48-.04 2.96-.04 4.44-.99-.32-2.15-.23-3.02.37-.63.41-1.11 1.04-1.36 1.75-.21.51-.15 1.07-.14 1.61.24 1.64 1.82 3.02 3.5 2.87 1.12-.01 2.19-.66 2.77-1.61.19-.33.4-.67.41-1.06.1-1.79.06-3.57.07-5.36.01-4.03-.01-8.05.02-12.07z" />
    </svg>
  )
}

function InstagramIcon() {
  return (
    <svg viewBox="0 0 24 24" className="w-4 h-4 fill-current" aria-hidden="true">
      <path d="M12 2.163c3.204 0 3.584.012 4.85.07 3.252.148 4.771 1.691 4.919 4.919.058 1.265.069 1.645.069 4.849 0 3.205-.012 3.584-.069 4.849-.149 3.225-1.664 4.771-4.919 4.919-1.266.058-1.644.07-4.85.07-3.204 0-3.584-.012-4.849-.07-3.26-.149-4.771-1.699-4.919-4.92-.058-1.265-.07-1.644-.07-4.849 0-3.204.013-3.583.07-4.849.149-3.227 1.664-4.771 4.919-4.919 1.266-.057 1.645-.069 4.849-.069zM12 0C8.741 0 8.333.014 7.053.072 2.695.272.273 2.69.073 7.052.014 8.333 0 8.741 0 12c0 3.259.014 3.668.072 4.948.2 4.358 2.618 6.78 6.98 6.98C8.333 23.986 8.741 24 12 24c3.259 0 3.668-.014 4.948-.072 4.354-.2 6.782-2.618 6.979-6.98.059-1.28.073-1.689.073-4.948 0-3.259-.014-3.667-.072-4.947-.196-4.354-2.617-6.78-6.979-6.98C15.668.014 15.259 0 12 0zm0 5.838a6.162 6.162 0 1 0 0 12.324 6.162 6.162 0 0 0 0-12.324zM12 16a4 4 0 1 1 0-8 4 4 0 0 1 0 8zm6.406-11.845a1.44 1.44 0 1 0 0 2.881 1.44 1.44 0 0 0 0-2.881z" />
    </svg>
  )
}

function XIcon() {
  return (
    <svg viewBox="0 0 24 24" className="w-4 h-4 fill-current" aria-hidden="true">
      <path d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-4.714-6.231-5.401 6.231H2.743l7.732-8.835L1.254 2.25H8.08l4.253 5.622zm-1.161 17.52h1.833L7.084 4.126H5.117z" />
    </svg>
  )
}

const PLATFORM_ICONS: Record<string, React.ReactNode> = {
  twitch: <TwitchIcon />,
  youtube: <YouTubeIcon />,
  tiktok: <TikTokIcon />,
  instagram: <InstagramIcon />,
  twitter: <XIcon />,
}

export function BentoGrid() {
  const { isAnyLive, twitch, youtube } = useStreamStatus()
  const { fund, percentage } = useVanFund()
  const [links, setLinks] = useState<SiteLink[]>([])

  useEffect(() => {
    supabase
      .from('site_links')
      .select('*')
      .order('order')
      .then(({ data }) => {
        if (data) setLinks(data)
      })
  }, [])

  const scrollTo = (id: string) =>
    document.getElementById(id)?.scrollIntoView({ behavior: 'smooth' })

  return (
    <div className="min-h-screen pt-20 px-4 pb-10 md:px-6 lg:px-8">
      <div
        className="max-w-7xl mx-auto grid gap-3"
        style={{
          gridTemplateColumns: 'repeat(3, 1fr)',
          gridTemplateRows: 'auto',
        }}
      >
        {/* ── HERO ─────────────────────────────────── col 1-2, row 1-2 ── */}
        <div
          className="relative overflow-hidden rounded-2xl border border-cyan/20 p-8 md:p-10 flex flex-col justify-end group hover:border-cyan/35 transition-all duration-300"
          style={{
            gridColumn: '1 / 3',
            gridRow: '1 / 3',
            minHeight: '520px',
            background: 'linear-gradient(140deg, #0A1E1E 0%, #060A0A 70%)',
          }}
        >
          <GridOverlay />

          {/* corner brackets */}
          <span className="absolute top-4 left-4 w-5 h-5 border-t border-l border-cyan/30 rounded-tl" />
          <span className="absolute top-4 right-4 w-5 h-5 border-t border-r border-cyan/30 rounded-tr" />
          <span className="absolute bottom-4 left-4 w-5 h-5 border-b border-l border-cyan/30 rounded-bl" />
          <span className="absolute bottom-4 right-4 w-5 h-5 border-b border-r border-cyan/30 rounded-br" />

          <div className="relative z-10">
            {isAnyLive && (
              <button
                onClick={() => scrollTo('streams')}
                className="inline-flex items-center gap-2 mb-6 font-mono text-[10px] tracking-[0.4em] uppercase text-magenta border border-magenta/30 px-3 py-1.5 rounded hover:bg-magenta/10 transition-colors cursor-pointer"
                style={{ boxShadow: '0 0 12px rgba(255,0,200,0.2)' }}
              >
                <span className="w-1.5 h-1.5 rounded-full bg-magenta animate-pulse" />
                Live Now
              </button>
            )}

            <p className="font-mono text-[10px] tracking-[0.5em] text-cyan/40 uppercase mb-4">
              TheYanaliShow
            </p>

            <h1
              className="font-russo text-white uppercase leading-none mb-5"
              style={{
                fontSize: 'clamp(44px, 6.5vw, 96px)',
                letterSpacing: '-1px',
              }}
            >
              THE WORLD
              <br />
              <span className="text-cyan" style={{ textShadow: '0 0 28px rgba(0,229,229,0.5)' }}>
                IS YOUR
              </span>
              <br />
              ARENA
            </h1>

            <p className="font-chakra font-light text-muted text-sm leading-relaxed mb-8 max-w-sm">
              Competitive gaming. Van life adventure.
              <br />
              The open road starts here.
            </p>

            <div className="flex items-center gap-5">
              <button
                onClick={() => scrollTo('streams')}
                className="font-chakra font-semibold text-sm tracking-widest uppercase px-7 py-3.5 bg-magenta text-white transition-all hover:shadow-[0_0_30px_#FF00C8] cursor-pointer"
                style={{ boxShadow: '0 0 14px rgba(255,0,200,0.3)' }}
              >
                Watch Live
              </button>
              <button
                onClick={() => scrollTo('clips')}
                className="font-chakra text-sm tracking-wider text-body hover:text-cyan transition-colors cursor-pointer"
              >
                Browse Clips →
              </button>
            </div>
          </div>
        </div>

        {/* ── LIVE STATUS ─────────────────────────── col 3, row 1 ── */}
        <button
          id="streams-tile"
          onClick={() => scrollTo('streams')}
          className="rounded-2xl border border-cyan/15 p-6 flex flex-col gap-3 hover:border-cyan/40 hover:shadow-[0_0_30px_rgba(0,229,229,0.06)] transition-all duration-300 cursor-pointer text-left"
          style={{ gridColumn: '3', gridRow: '1', background: '#0A1E1E' }}
        >
          <div className="flex items-center justify-between">
            <span className="font-mono text-[10px] tracking-[0.4em] text-muted uppercase">
              Stream Status
            </span>
            <span
              className={`w-2 h-2 rounded-full ${isAnyLive ? 'bg-magenta animate-pulse' : 'bg-muted/40'}`}
              style={isAnyLive ? { boxShadow: '0 0 8px #FF00C8' } : {}}
            />
          </div>

          <div className="mt-1">
            {isAnyLive ? (
              <>
                <div
                  className="font-russo text-magenta uppercase text-3xl"
                  style={{ textShadow: '0 0 18px #FF00C8' }}
                >
                  LIVE
                </div>
                <p className="font-chakra text-xs text-body/50 mt-1">
                  {((twitch?.viewer_count ?? 0) + (youtube?.viewer_count ?? 0)).toLocaleString()}{' '}
                  watching
                </p>
              </>
            ) : (
              <>
                <div className="font-russo text-muted/50 uppercase text-2xl">OFFLINE</div>
                <p className="font-chakra text-xs text-muted/40 mt-1">Follow to get notified</p>
              </>
            )}
          </div>

          <div className="flex gap-2 mt-auto flex-wrap">
            {[
              { id: 'twitch', Icon: TwitchIcon, color: '#9146FF' },
              { id: 'youtube', Icon: YouTubeIcon, color: '#FF0000' },
              { id: 'tiktok', Icon: TikTokIcon, color: '#00E5E5' },
            ].map(({ id, Icon, color }) => (
              <span
                key={id}
                className="flex items-center gap-1.5 font-mono text-[10px] border px-2 py-1 rounded"
                style={{ color, borderColor: `${color}30` }}
              >
                <Icon />
                {id}
              </span>
            ))}
          </div>
        </button>

        {/* ── VAN DREAM ───────────────────────────── col 3, row 2 ── */}
        <div
          className="rounded-2xl border border-amber/15 p-6 flex flex-col gap-3 hover:border-amber/35 hover:shadow-[0_0_28px_rgba(255,184,0,0.06)] transition-all duration-300"
          style={{ gridColumn: '3', gridRow: '2', background: '#0A1E1E' }}
        >
          <span className="font-mono text-[10px] tracking-[0.4em] text-amber/50 uppercase">
            The Dream
          </span>
          <div>
            <h3
              className="font-russo text-white uppercase leading-tight"
              style={{ fontSize: 'clamp(20px, 2vw, 28px)' }}
            >
              FUND THE
              <br />
              <span className="text-amber" style={{ textShadow: '0 0 14px rgba(255,184,0,0.4)' }}>
                VAN LIFE
              </span>
            </h3>
          </div>

          {fund && (
            <div className="mt-auto">
              <div className="flex justify-between font-mono text-[10px] mb-2 text-muted">
                <span>€{fund.current_amount.toLocaleString()}</span>
                <span className="text-amber">{percentage}%</span>
              </div>
              <div className="h-0.5 bg-amber/10 rounded-full overflow-hidden">
                <div
                  className="h-full bg-amber rounded-full transition-all duration-1000"
                  style={{ width: `${percentage}%`, boxShadow: '0 0 6px #FFB800' }}
                />
              </div>
            </div>
          )}

          <a
            href="https://paypal.me/theyanalishow"
            target="_blank"
            rel="noopener noreferrer"
            className="font-chakra text-xs font-semibold tracking-widest uppercase px-4 py-2.5 bg-amber text-black text-center hover:shadow-[0_0_20px_#FFB800] transition-all cursor-pointer mt-1"
          >
            Support the Dream
          </a>
        </div>

        {/* ── CLIPS PREVIEW ───────────────────────── col 1-2, row 3 ── */}
        <div
          id="clips"
          className="rounded-2xl border border-cyan/15 p-6 hover:border-cyan/30 transition-all duration-300"
          style={{ gridColumn: '1 / 3', gridRow: '3', background: '#111C1C' }}
        >
          <div className="flex items-center justify-between mb-5">
            <h2
              className="font-russo text-white uppercase"
              style={{ fontSize: 'clamp(22px, 2.5vw, 34px)' }}
            >
              HIGH<span className="text-cyan">LIGHTS</span>
            </h2>
            <span className="font-mono text-[10px] text-muted">Latest clips</span>
          </div>
          <div className="grid grid-cols-3 gap-3">
            {CLIPS.map((clip) => (
              <a
                key={clip.id}
                href={clip.url}
                target="_blank"
                rel="noopener noreferrer"
                className="group cursor-pointer"
              >
                <div
                  className="aspect-video rounded-xl overflow-hidden mb-2.5 border border-cyan/5 group-hover:border-cyan/30 transition-all flex flex-col items-center justify-center gap-2 text-center"
                  style={{ background: 'linear-gradient(135deg, #0A1E1E, #060A0A)' }}
                >
                  <svg
                    className="w-8 h-8 text-cyan/45 group-hover:text-cyan/80 transition-colors"
                    fill="currentColor"
                    viewBox="0 0 24 24"
                    aria-hidden="true"
                  >
                    <path d="M8 5v14l11-7z" />
                  </svg>
                  <span className="font-mono text-[10px] uppercase tracking-[0.3em] text-cyan/60">
                    Preview
                  </span>
                </div>
                <p className="font-chakra text-xs text-body leading-tight mb-1">{clip.title}</p>
                <div className="flex items-center gap-2">
                  <span
                    className="font-mono text-[10px]"
                    style={{ color: PLATFORM_COLORS[clip.platform] }}
                  >
                    {clip.platform}
                  </span>
                  <span className="font-mono text-[10px] text-body/60">{clip.viewCount}</span>
                </div>
              </a>
            ))}
          </div>
        </div>

        {/* ── ABOUT ───────────────────────────────── col 3, row 3 ── */}
        <div
          id="about"
          className="rounded-2xl border border-cyan/10 p-6 flex flex-col items-center text-center justify-center gap-4 hover:border-cyan/25 transition-all duration-300"
          style={{ gridColumn: '3', gridRow: '3', background: '#111C1C' }}
        >
          <Image
            src="/logo-transparent.png"
            alt="Yanali logo"
            width={72}
            height={72}
            style={{ filter: 'drop-shadow(0 0 14px rgba(0,229,229,0.35))' }}
          />
          <div>
            <h3 className="font-russo text-white uppercase text-base leading-tight mb-2">
              WHO IS <span className="text-cyan">YANALI?</span>
            </h3>
            <p className="font-chakra font-light text-body/55 text-xs leading-relaxed">
              Competitive gamer. Battle royale player. Future van lifer. The world is his arena.
            </p>
          </div>
        </div>

        {/* ── ADVENTURE TEASER ────────────────────── col 1-2, row 4 ── */}
        <div
          id="adventure"
          className="relative overflow-hidden rounded-2xl border border-cyan/10 p-8 flex items-center hover:border-cyan/25 transition-all duration-300"
          style={{
            gridColumn: '1 / 3',
            gridRow: '4',
            minHeight: '200px',
            background: 'linear-gradient(135deg, #060A0A 0%, #0A1E1E 100%)',
          }}
        >
          <GridOverlay />
          <div className="relative z-10">
            <p className="font-mono text-[10px] tracking-[0.5em] text-cyan/40 uppercase mb-3">
              Coming Soon
            </p>
            <h2
              className="font-russo text-white uppercase leading-none"
              style={{ fontSize: 'clamp(30px, 3.5vw, 52px)' }}
            >
              THE NEXT
              <br />
              <span className="text-cyan" style={{ textShadow: '0 0 22px rgba(0,229,229,0.45)' }}>
                CHAPTER
              </span>
            </h2>
            <p className="font-chakra font-light text-body/45 text-sm mt-3">
              A van. The open road. No walls.
            </p>
          </div>
        </div>

        {/* ── LINKS HUB ───────────────────────────── col 3, row 4 ── */}
        <div
          id="find-me-everywhere"
          className="rounded-2xl border border-cyan/10 p-6 flex flex-col gap-4 hover:border-cyan/25 transition-all duration-300"
          style={{ gridColumn: '3', gridRow: '4', background: '#0A1E1E' }}
        >
          <span className="font-mono text-[10px] tracking-[0.4em] text-cyan/40 uppercase">
            Find Me
          </span>
          <div className="flex flex-col gap-2 flex-1">
            {links.length > 0
              ? links.map((link) => (
                  <a
                    key={link.id}
                    href={link.url}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="flex items-center gap-3 font-chakra text-sm text-body/70 border border-cyan/10 px-4 py-2.5 rounded-xl hover:border-cyan/40 hover:text-cyan hover:shadow-[0_0_12px_rgba(0,229,229,0.08)] transition-all cursor-pointer"
                  >
                    <span
                      className="shrink-0"
                      style={{ color: PLATFORM_COLORS[link.platform] ?? '#00E5E5' }}
                    >
                      {PLATFORM_ICONS[link.platform] ?? null}
                    </span>
                    {link.label}
                  </a>
                ))
              : ['Twitch', 'YouTube', 'TikTok', 'Instagram', 'X'].map((p) => (
                  <div key={p} className="h-9 rounded-xl bg-surface/50 animate-pulse" />
                ))}
          </div>
        </div>
      </div>
    </div>
  )
}
