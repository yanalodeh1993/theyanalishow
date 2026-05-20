'use client'
import { useStreamStatus } from '@/lib/hooks/useStreamStatus'
import { ParallaxLogo } from './ParallaxLogo'
import { LiveBadge } from '@/components/ui/LiveBadge'

export function Hero() {
  const { isAnyLive } = useStreamStatus()

  return (
    <section
      id="hero"
      className="relative min-h-screen flex items-center justify-between px-16 pt-24 overflow-hidden"
      style={{ background: 'linear-gradient(135deg, #0A1E1E 0%, #060A0A 100%)' }}
    >
      <div className="absolute inset-0 pointer-events-none overflow-hidden">
        {Array.from({ length: 20 }).map((_, i) => (
          <div
            key={i}
            className="absolute w-1 h-1 rounded-full bg-cyan/20"
            style={{
              left: `${Math.random() * 100}%`,
              top: `${Math.random() * 100}%`,
              animation: `float ${3 + Math.random() * 4}s ease-in-out ${Math.random() * 3}s infinite alternate`,
            }}
          />
        ))}
        <style>{`
          @keyframes float {
            from { transform: translateY(0px) translateX(0px); opacity: 0.2; }
            to { transform: translateY(-20px) translateX(10px); opacity: 0.6; }
          }
        `}</style>
      </div>

      <div className="relative z-10 max-w-2xl">
        {isAnyLive && (
          <a href="#streams" className="inline-block mb-6">
            <LiveBadge />
          </a>
        )}

        <h1
          className="font-russo text-white uppercase leading-none"
          style={{ fontSize: 'clamp(60px, 9vw, 120px)', letterSpacing: '-1px' }}
        >
          THE WORLD<br />
          <span className="text-cyan" style={{ textShadow: '0 0 30px rgba(0,229,229,0.5)' }}>
            IS YOUR
          </span><br />
          ARENA
        </h1>

        <p className="font-chakra font-light text-muted mt-6 text-base leading-relaxed max-w-md">
          Competitive gaming. Van life adventure.<br />
          The open road starts here.
        </p>

        <div className="flex items-center gap-6 mt-10">
          <a
            href="#streams"
            className="font-chakra font-semibold text-sm tracking-widest uppercase px-8 py-4 bg-magenta text-white transition-all hover:shadow-[0_0_30px_#FF00C8]"
            style={{ boxShadow: '0 0 15px rgba(255,0,200,0.3)' }}
          >
            Watch Live
          </a>
          <a
            href="#clips"
            className="font-chakra text-sm tracking-wider text-body hover:text-cyan transition-colors flex items-center gap-2"
          >
            Browse Clips →
          </a>
        </div>
      </div>

      <div className="relative z-10 hidden lg:block">
        <ParallaxLogo />
      </div>
    </section>
  )
}
