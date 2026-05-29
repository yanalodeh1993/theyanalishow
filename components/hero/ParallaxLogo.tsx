'use client'
import { useEffect, useRef } from 'react'
import Image from 'next/image'

export function ParallaxLogo() {
  const ref = useRef<HTMLDivElement>(null)

  useEffect(() => {
    const el = ref.current
    if (!el) return

    const move = (e: MouseEvent) => {
      const x = (e.clientX / window.innerWidth - 0.5) * 20
      const y = (e.clientY / window.innerHeight - 0.5) * 20
      el.style.transform = `translate(${x}px, ${y}px)`
    }

    window.addEventListener('mousemove', move)
    return () => window.removeEventListener('mousemove', move)
  }, [])

  return (
    <div
      ref={ref}
      className="transition-transform duration-75 ease-out"
      style={{ filter: 'drop-shadow(0 0 30px rgba(0,229,229,0.4))' }}
    >
      <Image src="/logo-transparent.png" alt="The Yanali Show" width={320} height={320} priority />
    </div>
  )
}
