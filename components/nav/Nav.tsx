'use client'
import { useStreamStatus } from '@/lib/hooks/useStreamStatus'

export function Nav() {
  const { isAnyLive } = useStreamStatus()

  return (
    <nav
      className="fixed top-0 left-0 right-0 z-50 flex items-center justify-between px-[60px] py-6"
      style={{
        background: 'rgba(13,13,15,0.92)',
        backdropFilter: 'blur(12px)',
        borderBottom: '1px solid rgba(100,120,255,0.08)',
      }}
    >
      <span
        className="font-russo text-[18px] tracking-[2px] uppercase chrome-text"
      >
        The Yanali Show
      </span>

      <ul className="hidden md:flex gap-10 list-none">
        {[
          { label: 'Streams', href: '#streams' },
          { label: 'Clips', href: '#clips' },
          { label: 'Adventure', href: '#adventure' },
          { label: 'Van Dream', href: '#van-dream' },
        ].map(({ label, href }) => (
          <li key={label}>
            <a
              href={href}
              className="nav-link font-chakra text-[13px] font-medium tracking-[1px] uppercase"
            >
              {label}
            </a>
          </li>
        ))}
      </ul>

      {isAnyLive ? (
        <a
          href="#streams"
          className="nav-live-btn font-chakra text-[12px] font-semibold tracking-[2px] uppercase px-5 py-2.5 flex items-center gap-2.5 cursor-pointer rounded-full"
          style={{
            color: '#a78bff',
            border: '1px solid rgba(167,139,255,0.4)',
            boxShadow: '0 0 15px rgba(167,139,255,0.15)',
          }}
        >
          <span className="w-2 h-2 rounded-full bg-magenta animate-pulse" />
          Watch Live
        </a>
      ) : (
        <span className="font-chakra text-xs text-muted tracking-widest uppercase">Offline</span>
      )}
    </nav>
  )
}
