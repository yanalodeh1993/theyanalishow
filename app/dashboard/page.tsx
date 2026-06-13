import { createSupabaseServerClient } from '@/lib/supabase-server'
import type { StreamStatus, VanFund, Donor } from '@/lib/types'
import Link from 'next/link'

const PLATFORM_COLOR: Record<string, string> = {
  twitch: '#9146FF', youtube: '#FF0000', tiktok: '#6478ff',
}

export default async function DashboardOverview() {
  const supabase = await createSupabaseServerClient()

  const [
    { data: streams },
    { data: fund },
    { data: donors },
  ] = await Promise.all([
    supabase.from('stream_status').select('*'),
    supabase.from('van_fund').select('*').limit(1).single(),
    supabase.from('recent_donors').select('*').order('donated_at', { ascending: false }).limit(5),
  ])

  const vanFund = fund as VanFund | null
  const pct = vanFund
    ? Math.min(Math.round((vanFund.current_amount / vanFund.goal_amount) * 100), 100)
    : 0

  return (
    <div className="max-w-5xl">
      <h1 className="font-russo text-2xl uppercase tracking-widest text-body mb-8">Overview</h1>

      {/* Live Status Row */}
      <div className="grid grid-cols-3 gap-4 mb-8">
        {(['twitch', 'youtube', 'tiktok'] as const).map((p) => {
          const s = (streams as StreamStatus[] | null)?.find((x) => x.platform === p)
          const live = s?.is_live ?? false
          return (
            <div
              key={p}
              className="rounded-xl p-5 border"
              style={{
                background: '#14141a',
                borderColor: live ? `${PLATFORM_COLOR[p]}40` : 'rgba(255,255,255,0.06)',
              }}
            >
              <div className="flex items-center justify-between mb-1">
                <span
                  className="font-chakra text-xs font-semibold uppercase tracking-wider capitalize"
                  style={{ color: PLATFORM_COLOR[p] }}
                >
                  {p}
                </span>
                <span
                  className="text-[10px] font-chakra uppercase tracking-wider px-2 py-0.5 rounded-full"
                  style={{
                    background: live ? 'rgba(255,0,100,0.15)' : 'rgba(255,255,255,0.04)',
                    color: live ? '#ff4d6d' : '#3a3a5a',
                  }}
                >
                  {live ? '● LIVE' : 'offline'}
                </span>
              </div>
              {s?.viewer_count && s.viewer_count > 0 ? (
                <p className="font-chakra text-xl font-semibold text-body">{s.viewer_count.toLocaleString()}</p>
              ) : (
                <p className="font-chakra text-sm text-muted">—</p>
              )}
              <p className="font-chakra text-[10px] text-muted mt-0.5">viewers</p>
            </div>
          )
        })}
      </div>

      {/* Bottom Row */}
      <div className="grid grid-cols-2 gap-6">
        {/* Van Fund */}
        <div className="rounded-xl p-5 border" style={{ background: '#14141a', borderColor: 'rgba(255,255,255,0.06)' }}>
          <div className="flex items-center justify-between mb-4">
            <h2 className="font-russo text-sm uppercase tracking-wider text-body">Van Fund</h2>
            <Link
              href="/dashboard/van-fund"
              className="font-chakra text-xs text-cyan hover:text-body transition-colors"
            >
              Manage →
            </Link>
          </div>
          <div className="h-2 rounded-full overflow-hidden mb-3" style={{ background: 'rgba(255,255,255,0.06)' }}>
            <div
              className="h-full rounded-full"
              style={{ width: `${pct}%`, background: 'linear-gradient(to right, #6478ff, #FFB800)' }}
            />
          </div>
          <div className="flex justify-between font-chakra text-sm">
            <span style={{ color: '#FFB800' }}>{pct}% funded</span>
            <span className="text-muted">
              £{vanFund?.current_amount?.toLocaleString() ?? 0} / £{vanFund?.goal_amount?.toLocaleString() ?? 5000}
            </span>
          </div>
        </div>

        {/* Quick Stats */}
        <div className="rounded-xl p-5 border" style={{ background: '#14141a', borderColor: 'rgba(255,255,255,0.06)' }}>
          <div className="flex items-center justify-between mb-4">
            <h2 className="font-russo text-sm uppercase tracking-wider text-body">Quick Stats</h2>
          </div>
          <div className="flex flex-col gap-3 font-chakra text-sm">
            <div className="flex justify-between">
              <span className="text-muted">Recent donors</span>
              <span className="text-body">{(donors as Donor[] | null)?.length ?? 0}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-muted">Van fund raised</span>
              <span style={{ color: '#FFB800' }}>£{vanFund?.current_amount?.toLocaleString() ?? 0}</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
