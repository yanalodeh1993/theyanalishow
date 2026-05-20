import type { Donor } from '@/lib/types'

type Props = { donors: Donor[] }

function timeAgo(dateStr: string): string {
  const diff = Date.now() - new Date(dateStr).getTime()
  const hours = Math.floor(diff / 3600000)
  if (hours < 1) return 'Just now'
  if (hours < 24) return `${hours}h ago`
  return `${Math.floor(hours / 24)}d ago`
}

export function DonorList({ donors }: Props) {
  if (donors.length === 0) {
    return (
      <p className="font-mono text-xs text-muted">
        Be the first to support the dream →
      </p>
    )
  }

  return (
    <div className="flex flex-col gap-3">
      {donors.map((d) => (
        <div
          key={d.id}
          className="flex items-center gap-4 p-4 border border-amber/10 bg-surface"
        >
          <div
            className="w-9 h-9 rounded-full flex items-center justify-center font-russo text-sm text-black bg-amber shrink-0"
          >
            {d.name[0].toUpperCase()}
          </div>
          <div className="flex-1">
            <div className="font-chakra font-medium text-body text-sm">{d.name}</div>
            <div className="font-mono text-xs text-muted">{timeAgo(d.donated_at)}</div>
          </div>
          <div className="font-mono text-amber text-sm">€{d.amount}</div>
        </div>
      ))}
    </div>
  )
}
