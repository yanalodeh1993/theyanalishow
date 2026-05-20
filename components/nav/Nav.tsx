'use client'
import { useStreamStatus } from '@/lib/hooks/useStreamStatus'
import { LiveBadge } from '@/components/ui/LiveBadge'

export function Nav() {
  const { isAnyLive } = useStreamStatus()

  return (
    <nav className="fixed top-0 left-0 right-0 z-50 flex items-center justify-between px-10 py-5 border-b border-cyan/10 bg-bg/80 backdrop-blur-md">
      <span className="font-russo text-cyan tracking-widest text-sm uppercase"
        style={{ textShadow: '0 0 12px #00E5E5' }}>
        The Yanali Show
      </span>

      <ul className="flex gap-8 list-none">
        {['Streams', 'Clips', 'Adventure', 'Van Dream'].map((item) => (
          <li key={item}>
            <a
              href={`#${item.toLowerCase().replace(' ', '-')}`}
              className="font-chakra text-xs font-medium tracking-widest text-muted uppercase hover:text-cyan transition-colors"
            >
              {item}
            </a>
          </li>
        ))}
      </ul>

      {isAnyLive ? (
        <a href="#streams">
          <LiveBadge />
        </a>
      ) : (
        <span className="font-mono text-xs text-muted tracking-widest">OFFLINE</span>
      )}
    </nav>
  )
}
