'use client'
import { useEffect, useRef } from 'react'

export function CursorTrail() {
  const cursorRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    const cursor = cursorRef.current
    if (!cursor) return

    const move = (e: MouseEvent) => {
      cursor.style.left = `${e.clientX}px`
      cursor.style.top = `${e.clientY}px`
    }

    const click = (e: MouseEvent) => {
      const spark = document.createElement('div')
      spark.style.cssText = `
        position: fixed;
        left: ${e.clientX}px;
        top: ${e.clientY}px;
        width: 20px; height: 20px;
        border-radius: 50%;
        background: radial-gradient(circle, #00E5E5, transparent);
        pointer-events: none;
        transform: translate(-50%, -50%) scale(1);
        transition: transform 0.3s ease, opacity 0.3s ease;
        opacity: 1;
        z-index: 9999;
      `
      document.body.appendChild(spark)
      requestAnimationFrame(() => {
        spark.style.transform = 'translate(-50%, -50%) scale(3)'
        spark.style.opacity = '0'
      })
      setTimeout(() => spark.remove(), 300)
    }

    window.addEventListener('mousemove', move)
    window.addEventListener('click', click)
    return () => {
      window.removeEventListener('mousemove', move)
      window.removeEventListener('click', click)
    }
  }, [])

  return (
    <div
      ref={cursorRef}
      className="fixed pointer-events-none z-[9999] -translate-x-1/2 -translate-y-1/2"
      style={{ left: '-100px', top: '-100px' }}
    >
      <svg width="24" height="24" viewBox="0 0 24 24" fill="none">
        <circle cx="12" cy="12" r="4" stroke="#00E5E5" strokeWidth="1.5" />
        <line x1="12" y1="2" x2="12" y2="8" stroke="#00E5E5" strokeWidth="1.5" />
        <line x1="12" y1="16" x2="12" y2="22" stroke="#00E5E5" strokeWidth="1.5" />
        <line x1="2" y1="12" x2="8" y2="12" stroke="#00E5E5" strokeWidth="1.5" />
        <line x1="16" y1="12" x2="22" y2="12" stroke="#00E5E5" strokeWidth="1.5" />
      </svg>
    </div>
  )
}
