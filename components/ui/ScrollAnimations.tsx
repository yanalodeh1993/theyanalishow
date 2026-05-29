'use client'
import { useEffect } from 'react'

export function ScrollAnimations() {
  useEffect(() => {
    Promise.all([import('gsap'), import('gsap/ScrollTrigger')])
      .then(([{ gsap }, { ScrollTrigger }]) => {
        gsap.registerPlugin(ScrollTrigger)

        // Use immediateRender:false so elements aren't forced to their
        // 'from' state until ScrollTrigger actually runs the animation.
        const fromOpts = (opts: any) => ({ immediateRender: false, ...opts })

        gsap.from('#streams', fromOpts({
          opacity: 0,
          y: 40,
          duration: 0.8,
          scrollTrigger: { trigger: '#streams', start: 'top 80%' },
        }))

        gsap.from('#clips .flex > *', fromOpts({
          opacity: 0,
          x: 60,
          duration: 0.5,
          stagger: 0.1,
          scrollTrigger: { trigger: '#clips', start: 'top 75%' },
        }))

        gsap.from('#van-dream', fromOpts({
          opacity: 0,
          y: 30,
          duration: 0.8,
          scrollTrigger: { trigger: '#van-dream', start: 'top 75%' },
        }))

        gsap.from('#find-me-everywhere .grid > *', fromOpts({
          opacity: 0,
          y: 30,
          duration: 0.4,
          stagger: 0.08,
          scrollTrigger: { trigger: '#find-me-everywhere', start: 'top 75%' },
        }))

        gsap.from('#about', fromOpts({
          opacity: 0,
          y: 30,
          duration: 0.8,
          scrollTrigger: { trigger: '#about', start: 'top 80%' },
        }))

        // Give ScrollTrigger a moment to calculate positions (useful when
        // navigating directly to an anchor/hash) then refresh so animations
        // fire correctly.
        setTimeout(() => {
          try {
            ScrollTrigger.refresh()
          } catch (e) {
            // ignore
          }
        }, 120)
      })
      .catch((err) => {
        // If GSAP fails to load, reveal elements so they don't stay hidden.
        // This is a defensive fallback for dev environments or missing deps.
        console.error('GSAP load failed, revealing content', err)
        const selectors = ['#streams', '#clips .flex > *', '#van-dream', '#find-me-everywhere .grid > *', '#about']
        selectors.forEach((sel) => {
          document.querySelectorAll(sel).forEach((el) => {
            const node = el as HTMLElement
            node.style.opacity = '1'
            node.style.transform = 'none'
          })
        })
      })
  }, [])

  return null
}
