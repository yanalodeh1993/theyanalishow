import type { Donor } from '@/lib/types'

type Props = { donors: Donor[] }

function timeAgo(dateStr: string): string {
  const time = new Date(dateStr).getTime()
  if (isNaN(time)) return 'Recently'
  const diff = Date.now() - time
  if (diff < 0) return 'Just now'
  const hours = Math.floor(diff / 3600000)
  if (hours < 1) return 'Just now'
  if (hours < 24) return `${hours} hour${hours === 1 ? '' : 's'} ago`
  const days = Math.floor(hours / 24)
  if (days === 1) return 'Yesterday'
  return `${days} days ago`
}

export function DonorList({ donors }: Props) {
  if (donors.length === 0) {
    return <p className="font-chakra text-xs text-muted">Be the first to support the dream →</p>
  }

  return (
    <div className="flex flex-col">
      {donors.map((d) => (
        <div
          key={d.id}
          className="flex items-center gap-4 px-5 py-4 transition-all duration-200"
          style={{
            border: '1px solid rgba(0,229,229,0.12)',
            marginBottom: '-1px',
            background: '#0D2828',
          }}
          onMouseEnter={(e) => {
            e.currentTarget.style.borderColor = 'rgba(0,229,229,0.3)'
            e.currentTarget.style.zIndex = '1'
            e.currentTarget.style.position = 'relative'
          }}
          onMouseLeave={(e) => {
            e.currentTarget.style.borderColor = 'rgba(0,229,229,0.12)'
            e.currentTarget.style.zIndex = '0'
          }}
        >
          <div
            className="w-9 h-9 rounded-full flex items-center justify-center font-russo text-sm shrink-0"
            style={{
              background: 'rgba(0,229,229,0.15)',
              color: '#00E5E5',
              border: '1px solid rgba(0,229,229,0.2)',
            }}
          >
            {d.name[0].toUpperCase()}
          </div>
          <div className="flex-1 min-w-0">
            <div className="font-chakra font-semibold text-white text-sm">{d.name}</div>
            <div className="font-chakra text-xs text-muted">{timeAgo(d.donated_at)}</div>
          </div>
          <div className="font-russo text-sm shrink-0" style={{ color: '#FFB800' }}>
            €{d.amount}
          </div>
        </div>
      ))}
    </div>
  )
}
