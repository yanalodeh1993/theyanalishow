'use client'
import { useStreamStatus } from '@/lib/hooks/useStreamStatus'
import { useVanFund } from '@/lib/hooks/useVanFund'

export function StatStrip() {
  const { isAnyLive, twitch, youtube } = useStreamStatus()
  const { percentage } = useVanFund()

  const viewers = (twitch?.viewer_count ?? 0) + (youtube?.viewer_count ?? 0)

  const items = [
    {
      label: 'Live Status',
      value: isAnyLive ? 'LIVE' : 'OFFLINE',
      sub: isAnyLive ? `${viewers.toLocaleString()} watching` : 'Follow to be notified',
      color: isAnyLive ? '#a78bff' : '#3a3a5a',
    },
    {
      label: 'Van Fund',
      value: `${percentage}%`,
      sub: 'of goal reached',
      color: '#FFB800',
    },
    {
      label: 'Streaming On',
      value: '3+',
      sub: 'Twitch · YouTube · TikTok',
      color: '#6478ff',
    },
    {
      label: 'Next Chapter',
      value: 'VAN LIFE',
      sub: 'Adventure incoming',
      color: '#d0d8ff',
    },
  ]

  return (
    <div
      className="grid grid-cols-2 lg:grid-cols-4"
      style={{ borderTop: '1px solid rgba(100,120,255,0.15)' }}
    >
      {items.map((item) => (
        <div
          key={item.label}
          className="px-8 py-7 border-r last:border-r-0 cursor-default transition-all duration-200 hover:bg-surface"
          style={{ borderColor: 'rgba(100,120,255,0.08)' }}
        >
          <div
            className="font-chakra text-[10px] font-bold tracking-[3px] uppercase mb-1.5"
            style={{ color: item.color }}
          >
            {item.label}
          </div>
          <div className="font-russo text-[36px] tracking-[1px]" style={{ color: item.color }}>
            {item.value}
          </div>
          <div className="font-chakra text-[11px] text-muted mt-1">{item.sub}</div>
        </div>
      ))}
    </div>
  )
}
