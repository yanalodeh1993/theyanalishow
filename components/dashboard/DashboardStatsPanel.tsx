import { createSupabaseServerClient } from '@/lib/supabase-server'
import type { StreamStatus, VanFund, Donor } from '@/lib/types'

const PLATFORM_COLOR: Record<string, string> = {
  twitch: '#9146FF',
  youtube: '#FF0000',
  tiktok: '#6478ff',
}

export async function DashboardStatsPanel() {
  const supabase = await createSupabaseServerClient()

  const [{ data: streams }, { data: fundRows }, { data: donors }] = await Promise.all([
    supabase.from('stream_status').select('*'),
    supabase.from('van_fund').select('*').limit(1).single(),
    supabase.from('recent_donors').select('*').order('donated_at', { ascending: false }).limit(3),
  ])

  const fund = fundRows as VanFund | null
  const pct = fund ? Math.min(Math.round((fund.current_amount / fund.goal_amount) * 100), 100) : 0

  return (
    <aside
      className="w-52 shrink-0 flex flex-col h-full border-r overflow-y-auto"
      style={{ background: '#0d0d11', borderColor: 'rgba(100,120,255,0.08)' }}
    >
      {/* Live Status */}
      <div className="px-4 pt-5 pb-4 border-b" style={{ borderColor: 'rgba(100,120,255,0.08)' }}>
        <p className="font-chakra text-[10px] uppercase tracking-widest text-muted mb-3">Live Status</p>
        <div className="flex flex-col gap-2">
          {(['twitch', 'youtube', 'tiktok'] as const).map((p) => {
            const s = (streams as StreamStatus[] | null)?.find((x) => x.platform === p)
            const live = s?.is_live ?? false
            return (
              <div key={p} className="flex items-center justify-between">
                <span className="font-chakra text-xs capitalize" style={{ color: PLATFORM_COLOR[p] }}>
                  {p}
                </span>
                <span
                  className="font-chakra text-[10px] uppercase tracking-wider px-2 py-0.5 rounded-full"
                  style={{
                    background: live ? 'rgba(255,0,100,0.15)' : 'rgba(255,255,255,0.04)',
                    color: live ? '#ff4d6d' : '#3a3a5a',
                  }}
                >
                  {live ? '● LIVE' : 'offline'}
                </span>
              </div>
            )
          })}
        </div>
      </div>

      {/* Van Fund */}
      <div className="px-4 py-4 border-b" style={{ borderColor: 'rgba(100,120,255,0.08)' }}>
        <p className="font-chakra text-[10px] uppercase tracking-widest text-muted mb-3">Van Fund</p>
        <div className="h-1.5 rounded-full overflow-hidden mb-2" style={{ background: 'rgba(255,255,255,0.06)' }}>
          <div
            className="h-full rounded-full transition-all"
            style={{ width: `${pct}%`, background: 'linear-gradient(to right, #6478ff, #FFB800)' }}
          />
        </div>
        <div className="flex justify-between font-chakra text-[11px]">
          <span style={{ color: '#FFB800' }}>{pct}%</span>
          <span className="text-muted">
            £{fund?.current_amount?.toLocaleString() ?? 0} / £{fund?.goal_amount?.toLocaleString() ?? 5000}
          </span>
        </div>
      </div>

      {/* Recent Donors */}
      <div className="px-4 py-4">
        <p className="font-chakra text-[10px] uppercase tracking-widest text-muted mb-3">Recent Donors</p>
        {!donors || donors.length === 0 ? (
          <p className="font-chakra text-[11px] text-muted/50">No donors yet</p>
        ) : (
          <div className="flex flex-col gap-2">
            {(donors as Donor[]).map((d) => (
              <div key={d.id} className="flex justify-between font-chakra text-[11px]">
                <span className="text-body truncate max-w-[100px]">{d.name}</span>
                <span style={{ color: '#FFB800' }}>£{d.amount}</span>
              </div>
            ))}
          </div>
        )}
      </div>
    </aside>
  )
}
