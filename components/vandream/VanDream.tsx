'use client'
import { useVanFund } from '@/lib/hooks/useVanFund'
import { DonorList } from './DonorList'

export function VanDream() {
  const { fund, donors, percentage } = useVanFund()

  return (
    <section
      id="van-dream"
      className="px-10 md:px-14 py-20"
      style={{ background: '#0d0d0f', borderTop: '1px solid rgba(100,120,255,0.1)' }}
    >
      <div className="max-w-6xl mx-auto grid grid-cols-1 lg:grid-cols-2 gap-16 items-start">
        {/* LEFT */}
        <div>
          <h2
            className="font-russo uppercase leading-[0.9] tracking-[2px] mb-6"
            style={{ fontSize: 'clamp(52px, 7vw, 96px)' }}
          >
            <span className="block text-white">HELP FUND</span>
            <span className="block">
              <span className="text-white">THE </span>
              <span className="chrome-text">VAN</span>
            </span>
            <span className="block chrome-text">DREAM</span>
          </h2>

          <p className="font-chakra text-muted text-sm leading-[1.8] max-w-[420px] mb-8">
            The next chapter of TheYanaliShow takes place on the road. A converted van. New cities.
            New streams. New adventures. Help make it happen.
          </p>

          {fund && (
            <div className="mb-8">
              <div className="flex justify-between font-chakra text-xs font-semibold mb-2.5">
                <span className="text-body">Van Conversion Fund</span>
                <span className="font-chakra text-sm" style={{ color: '#FFB800' }}>
                  {percentage}% there
                </span>
              </div>
              <div
                className="h-1.5 overflow-hidden rounded-full"
                style={{ background: 'rgba(255,255,255,0.05)' }}
              >
                <div
                  className="h-full transition-all duration-1000 rounded-full"
                  style={{
                    width: `${percentage}%`,
                    background: 'linear-gradient(to right, #6478ff, #FFB800)',
                    boxShadow: '0 0 10px rgba(100,120,255,0.4)',
                  }}
                />
              </div>
            </div>
          )}

          <a
            href="https://paypal.me/theyanalishow"
            target="_blank"
            rel="noopener noreferrer"
            className="btn-neon-amber font-russo text-[13px] tracking-[2px] uppercase px-9 py-4 inline-block cursor-pointer"
            style={{
              background: 'transparent',
              color: '#FFB800',
              border: '1px solid #FFB800',
            }}
          >
            Support the Dream →
          </a>
        </div>

        {/* RIGHT: donors */}
        <div>
          <DonorList donors={donors} />
        </div>
      </div>
    </section>
  )
}
