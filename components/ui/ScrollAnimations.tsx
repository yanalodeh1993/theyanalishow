'use client'
import { useEffect } from 'react'

export function ScrollAnimations() {
  useEffect(() => {
    Promise.all([
      import('gsap'),
      import('gsap/ScrollTrigger'),
    ]).then(([{ gsap }, { ScrollTrigger }]) => {
      gsap.registerPlugin(ScrollTrigger)

      gsap.from('#streams', {
        opacity: 0, y: 40,
        duration: 0.8,
        scrollTrigger: { trigger: '#streams', start: 'top 80%' },
      })

      gsap.from('#clips .flex > *', {
        opacity: 0, x: 60,
        duration: 0.5,
        stagger: 0.1,
        scrollTrigger: { trigger: '#clips', start: 'top 75%' },
      })

      gsap.from('#adventure h2', {
        opacity: 0, x: -60,
        duration: 0.9,
        scrollTrigger: { trigger: '#adventure', start: 'top 70%' },
      })

      // Van Dream section fade-in — the progress bar's CSS transition handles its own animation
      gsap.from('#van-dream', {
        opacity: 0, y: 30,
        duration: 0.8,
        scrollTrigger: { trigger: '#van-dream', start: 'top 75%' },
      })

      gsap.from('#find-me-everywhere .grid > *', {
        opacity: 0, y: 30,
        duration: 0.4,
        stagger: 0.08,
        scrollTrigger: { trigger: '#find-me-everywhere', start: 'top 75%' },
      })

      gsap.from('#about', {
        opacity: 0, y: 30,
        duration: 0.8,
        scrollTrigger: { trigger: '#about', start: 'top 80%' },
      })
    })
  }, [])

  return null
}
