import { createSupabaseServerClient } from '@/lib/supabase-server'
import { updateGoal, addDonor, deleteDonor } from '@/app/actions/van-fund'
import type { VanFund, Donor } from '@/lib/types'

export default async function VanFundPage() {
  const supabase = await createSupabaseServerClient()
  const [{ data: fundData }, { data: donorData }] = await Promise.all([
    supabase.from('van_fund').select('*').limit(1).single(),
    supabase.from('recent_donors').select('*').order('donated_at', { ascending: false }),
  ])
  const fund = fundData as VanFund | null
  const donors = (donorData ?? []) as Donor[]
  const pct = fund ? Math.min(Math.round((fund.current_amount / fund.goal_amount) * 100), 100) : 0

  return (
    <div className="max-w-3xl">
      <h1 className="font-russo text-2xl uppercase tracking-widest text-body mb-8">Van Fund</h1>

      {/* Current Progress */}
      <div className="rounded-xl border p-6 mb-6" style={{ background: '#14141a', borderColor: 'rgba(255,184,0,0.2)' }}>
        <h2 className="font-russo text-sm uppercase tracking-wider mb-4" style={{ color: '#FFB800' }}>Current Progress</h2>
        <div className="h-3 rounded-full overflow-hidden mb-3" style={{ background: 'rgba(255,255,255,0.06)' }}>
          <div
            className="h-full rounded-full transition-all duration-500"
            style={{ width: `${pct}%`, background: 'linear-gradient(to right, #6478ff, #FFB800)' }}
          />
        </div>
        <div className="flex justify-between font-chakra text-sm">
          <span style={{ color: '#FFB800' }}>{pct}% funded</span>
          <span className="text-body">£{fund?.current_amount?.toLocaleString() ?? 0} of £{fund?.goal_amount?.toLocaleString() ?? 5000}</span>
        </div>
      </div>

      {/* Update Goal */}
      <div className="rounded-xl border p-6 mb-6" style={{ background: '#14141a', borderColor: 'rgba(255,255,255,0.06)' }}>
        <h2 className="font-russo text-sm uppercase tracking-wider text-body mb-4">Update Amounts</h2>
        <form action={updateGoal} className="grid grid-cols-2 gap-4">
          <div className="flex flex-col gap-1.5">
            <label className="font-chakra text-[11px] uppercase tracking-widest text-muted">Current Amount (£)</label>
            <input
              name="current_amount"
              type="number"
              min="0"
              defaultValue={fund?.current_amount ?? 0}
              className="bg-deep border rounded-lg px-3 py-2.5 font-chakra text-sm text-body outline-none focus:border-cyan transition-colors"
              style={{ borderColor: 'rgba(100,120,255,0.2)' }}
            />
          </div>
          <div className="flex flex-col gap-1.5">
            <label className="font-chakra text-[11px] uppercase tracking-widest text-muted">Goal Amount (£)</label>
            <input
              name="goal_amount"
              type="number"
              min="1"
              defaultValue={fund?.goal_amount ?? 5000}
              className="bg-deep border rounded-lg px-3 py-2.5 font-chakra text-sm text-body outline-none focus:border-cyan transition-colors"
              style={{ borderColor: 'rgba(100,120,255,0.2)' }}
            />
          </div>
          <div className="col-span-2">
            <button
              type="submit"
              className="py-2.5 px-6 rounded-lg font-russo text-xs tracking-widest uppercase hover:opacity-80 transition-opacity"
              style={{ background: '#6478ff', color: '#fff' }}
            >
              Save Amounts
            </button>
          </div>
        </form>
      </div>

      {/* Add Donor */}
      <div className="rounded-xl border p-6 mb-6" style={{ background: '#14141a', borderColor: 'rgba(255,255,255,0.06)' }}>
        <h2 className="font-russo text-sm uppercase tracking-wider text-body mb-4">Record Donation</h2>
        <form action={addDonor} className="grid grid-cols-2 gap-4">
          <div className="flex flex-col gap-1.5">
            <label className="font-chakra text-[11px] uppercase tracking-widest text-muted">Donor Name</label>
            <input
              name="name"
              required
              placeholder="Anonymous"
              className="bg-deep border rounded-lg px-3 py-2.5 font-chakra text-sm text-body outline-none focus:border-cyan transition-colors"
              style={{ borderColor: 'rgba(100,120,255,0.2)' }}
            />
          </div>
          <div className="flex flex-col gap-1.5">
            <label className="font-chakra text-[11px] uppercase tracking-widest text-muted">Amount (£)</label>
            <input
              name="amount"
              type="number"
              min="1"
              required
              placeholder="10"
              className="bg-deep border rounded-lg px-3 py-2.5 font-chakra text-sm text-body outline-none focus:border-cyan transition-colors"
              style={{ borderColor: 'rgba(100,120,255,0.2)' }}
            />
          </div>
          <div className="col-span-2">
            <button
              type="submit"
              className="py-2.5 px-6 rounded-lg font-russo text-xs tracking-widest uppercase hover:opacity-80 transition-opacity"
              style={{ background: 'rgba(255,184,0,0.15)', color: '#FFB800', border: '1px solid rgba(255,184,0,0.3)' }}
            >
              Add Donor (+amount to total)
            </button>
          </div>
        </form>
      </div>

      {/* Donor List */}
      <div className="rounded-xl border p-6" style={{ background: '#14141a', borderColor: 'rgba(255,255,255,0.06)' }}>
        <h2 className="font-russo text-sm uppercase tracking-wider text-body mb-4">All Donors ({donors.length})</h2>
        {donors.length === 0 ? (
          <p className="font-chakra text-sm text-muted">No donors recorded yet.</p>
        ) : (
          <div className="flex flex-col gap-2">
            {donors.map((d) => (
              <div
                key={d.id}
                className="flex items-center justify-between py-2 border-b"
                style={{ borderColor: 'rgba(255,255,255,0.05)' }}
              >
                <div>
                  <span className="font-chakra text-sm text-body">{d.name}</span>
                  <span className="font-chakra text-xs text-muted ml-3">
                    {new Date(d.donated_at).toLocaleDateString()}
                  </span>
                </div>
                <div className="flex items-center gap-4">
                  <span className="font-russo text-sm" style={{ color: '#FFB800' }}>£{d.amount}</span>
                  <form action={async () => { 'use server'; await deleteDonor(d.id) }}>
                    <button type="submit" className="font-chakra text-xs text-muted hover:text-red-400 transition-colors uppercase tracking-wider">
                      Remove
                    </button>
                  </form>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  )
}
