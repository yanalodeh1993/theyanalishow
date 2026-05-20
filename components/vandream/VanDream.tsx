'use client'
import { useVanFund } from '@/lib/hooks/useVanFund'
import { DonorList } from './DonorList'

export function VanDream() {
  const { fund, donors, percentage } = useVanFund()

  return (
    <section id="van-dream" className="py-24 px-10 bg-surface">
      <div className="max-w-6xl mx-auto grid grid-cols-1 lg:grid-cols-2 gap-16 items-start">

        <div>
          <p className="font-mono text-xs tracking-[0.5em] text-amber/70 uppercase mb-4">
            The Dream
          </p>
          <h2
            className="font-russo text-white uppercase leading-none mb-6"
            style={{ fontSize: 'clamp(44px, 6vw, 80px)' }}
          >
            FUND THE<br />
            <span className="text-amber" style={{ textShadow: '0 0 20px rgba(255,184,0,0.4)' }}>
              VAN LIFE
            </span>
          </h2>
          <p className="font-chakra font-light text-body/70 leading-relaxed mb-8 max-w-md">
            The next chapter of TheYanaliShow leaves the fixed setup behind.
            A converted van. New cities. Streams from forests, coastlines, mountain passes.
            Help make it happen.
          </p>

          {fund && (
            <div className="mb-8">
              <div className="flex justify-between font-mono text-xs mb-2">
                <span className="text-muted uppercase tracking-wider">Van Fund</span>
                <span className="text-amber">{percentage}% there</span>
              </div>
              <div className="h-1.5 bg-amber/10 overflow-hidden">
                <div
                  className="h-full bg-amber transition-all duration-1000"
                  style={{
                    width: `${percentage}%`,
                    boxShadow: '0 0 10px #FFB800',
                  }}
                />
              </div>
              <div className="flex justify-between font-mono text-xs mt-2 text-muted">
                <span>€{fund.current_amount.toLocaleString()}</span>
                <span>€{fund.goal_amount.toLocaleString()}</span>
              </div>
            </div>
          )}

          <a
            href="https://paypal.me/theyanalishow"
            target="_blank"
            rel="noopener noreferrer"
            className="inline-block font-chakra font-semibold text-sm tracking-widest uppercase px-8 py-4 bg-amber text-black transition-all hover:shadow-[0_0_30px_#FFB800]"
            style={{ boxShadow: '0 0 12px rgba(255,184,0,0.3)' }}
          >
            🚐 Support the Dream
          </a>
        </div>

        <div>
          <p className="font-mono text-xs tracking-[0.5em] text-muted uppercase mb-6">
            Recent Supporters
          </p>
          <DonorList donors={donors} />
        </div>
      </div>
    </section>
  )
}
