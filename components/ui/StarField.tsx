'use client'
import { useEffect, useRef } from 'react'

export function StarField() {
  const canvasRef = useRef<HTMLCanvasElement>(null)

  useEffect(() => {
    const canvas = canvasRef.current!
    const ctx = canvas.getContext('2d')!

    const setSize = () => {
      canvas.width = window.innerWidth
      canvas.height = window.innerHeight
    }
    setSize()

    const stars = Array.from({ length: 160 }, () => ({
      x: Math.random() * window.innerWidth,
      y: Math.random() * window.innerHeight,
      r: Math.random() * 1.4 + 0.3,
      phase: Math.random() * Math.PI * 2,
      speed: 0.15 + Math.random() * 0.65,
    }))

    let raf: number
    const draw = (t: number) => {
      ctx.clearRect(0, 0, canvas.width, canvas.height)

      // subtle horizon glow
      const grad = ctx.createLinearGradient(0, canvas.height * 0.6, 0, canvas.height)
      grad.addColorStop(0, 'rgba(100,120,255,0)')
      grad.addColorStop(1, 'rgba(100,120,255,0.07)')
      ctx.fillStyle = grad
      ctx.fillRect(0, canvas.height * 0.6, canvas.width, canvas.height * 0.4)

      for (const s of stars) {
        const a = 0.2 + 0.8 * (0.5 + 0.5 * Math.sin(t * 0.001 * s.speed + s.phase))
        ctx.beginPath()
        ctx.arc(s.x, s.y, s.r, 0, Math.PI * 2)
        ctx.fillStyle = `rgba(255,255,255,${a.toFixed(3)})`
        ctx.fill()
      }

      raf = requestAnimationFrame(draw)
    }

    raf = requestAnimationFrame(draw)
    window.addEventListener('resize', setSize)

    return () => {
      cancelAnimationFrame(raf)
      window.removeEventListener('resize', setSize)
    }
  }, [])

  return (
    <canvas
      ref={canvasRef}
      aria-hidden="true"
      className="fixed top-0 left-0 pointer-events-none"
      style={{ zIndex: 0 }}
    />
  )
}
