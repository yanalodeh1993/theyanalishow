'use client'
import { useEffect, useRef, useCallback } from 'react'

type Props = { onComplete: () => void }

export function LogoEntry({ onComplete }: Props) {
  const containerRef = useRef<HTMLDivElement>(null)
  const firedRef = useRef(false)
  const mountedRef = useRef(true)

  useEffect(() => {
    mountedRef.current = true
    return () => {
      mountedRef.current = false
    }
  }, [])

  const fireTransition = useCallback(() => {
    if (firedRef.current) return
    firedRef.current = true

    if ('vibrate' in navigator) navigator.vibrate(10)

    const container = containerRef.current
    if (!container) return

    const maxSize = Math.max(window.innerWidth, window.innerHeight) * 2.4
    const colors = ['rgba(0,229,229,0.9)', 'rgba(0,255,239,0.6)', 'rgba(255,0,200,0.35)']

    // Rings expand as slow cinematic sonar pulses — staggered 350ms apart
    const rings = colors.map((color, i) => {
      const ring = document.createElement('div')
      ring.style.cssText = `
        position:absolute; border-radius:50%;
        border:2px solid ${color};
        box-shadow:0 0 40px ${color};
        width:10px; height:10px;
        left:50%; top:50%;
        transform:translate(-50%,-50%);
        pointer-events:none;
        transition:
          width  ${2200 - i * 150}ms cubic-bezier(0.05, 0, 0.15, 1) ${i * 350}ms,
          height ${2200 - i * 150}ms cubic-bezier(0.05, 0, 0.15, 1) ${i * 350}ms,
          opacity 1800ms ease ${i * 350 + 400}ms;
      `
      container.appendChild(ring)
      return ring
    })

    requestAnimationFrame(() => {
      const s = `${maxSize}px`
      rings.forEach((r) => {
        r.style.width = s
        r.style.height = s
        r.style.opacity = '0'
      })
    })

    // Screen glides out — long ease-in-out so the fade feels deliberate
    setTimeout(() => {
      if (container) {
        container.style.transition =
          'opacity 1400ms cubic-bezier(0.4, 0, 0.6, 1), transform 1400ms cubic-bezier(0.4, 0, 0.6, 1)'
        container.style.opacity = '0'
        container.style.transform = 'scale(1.04)'
      }
    }, 900)

    // Site begins appearing while entry is still mid-fade — seamless overlap
    setTimeout(() => {
      if (mountedRef.current) onComplete()
    }, 1900)
  }, [onComplete])

  return (
    <div
      ref={containerRef}
      className="fixed inset-0 z-[100] flex items-center justify-center overflow-hidden"
      style={{
        background: 'radial-gradient(ellipse at 50% 50%, #0A1E1E 0%, #060A0A 65%)',
      }}
    >
      {/* Scanlines */}
      <div
        className="absolute inset-0 pointer-events-none"
        style={{
          background:
            'repeating-linear-gradient(to bottom, transparent, transparent 3px, rgba(0,229,229,0.018) 3px, rgba(0,229,229,0.018) 4px)',
        }}
      />

      {/* HUD corners */}
      <div className="absolute top-5 left-5 w-5 h-5 border-t border-l border-cyan/25 pointer-events-none" />
      <div className="absolute top-5 right-5 w-5 h-5 border-t border-r border-cyan/25 pointer-events-none" />
      <div className="absolute bottom-5 left-5 w-5 h-5 border-b border-l border-cyan/25 pointer-events-none" />
      <div className="absolute bottom-5 right-5 w-5 h-5 border-b border-r border-cyan/25 pointer-events-none" />

      {/* HUD top */}
      <p className="absolute top-7 inset-x-0 text-center font-mono text-[9px] tracking-[4px] text-cyan/25 uppercase pointer-events-none">
        Signal Acquired · TheYanaliShow.com
      </p>

      {/* HUD bottom */}
      <p className="absolute bottom-7 inset-x-0 text-center font-mono text-[10px] tracking-[4px] text-cyan/50 uppercase pointer-events-none animate-pulse">
        Tap Logo to Enter
      </p>

      {/* Logo button */}
      <button
        onClick={fireTransition}
        className="logo-entry-btn"
        style={{ width: 500, height: 500 }}
        aria-label="Enter TheYanaliShow"
        type="button"
      >
        <div className="logo-ring logo-ring-3" style={{ inset: -44 }} />
        <div className="logo-ring logo-ring-2" style={{ inset: -20 }} />

        <div className="logo-orbit">
          <div className="absolute inset-0 rounded-full border border-dashed border-cyan/[0.18]" />
          <div className="logo-orbit-dot" />
        </div>

        <div className="logo-ring logo-ring-1" style={{ inset: 0 }} />

        <img
          src="/logo.png"
          alt="TheYanaliShow Logo"
          className="logo-entry-img relative z-10"
          style={{ width: 460, height: 460, objectFit: 'contain' }}
          draggable={false}
        />

        <span className="logo-enter-hint font-mono text-[9px] tracking-[3px] text-cyan uppercase">
          Enter the Show
        </span>
      </button>
    </div>
  )
}
