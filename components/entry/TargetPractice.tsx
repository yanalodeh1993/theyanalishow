'use client'
import { useEffect, useRef } from 'react'

type Props = { onComplete: () => void }

export function TargetPractice({ onComplete }: Props) {
  const containerRef = useRef<HTMLDivElement>(null)
  const gameRef = useRef<any>(null)

  useEffect(() => {
    let mounted = true

    import('phaser').then((Phaser) => {
      if (!mounted || !containerRef.current || gameRef.current) return

      const TARGETS_REQUIRED = 5
      let hit = 0

      const config: Phaser.Types.Core.GameConfig = {
        type: Phaser.AUTO,
        width: window.innerWidth,
        height: window.innerHeight,
        backgroundColor: '#060A0A',
        parent: containerRef.current,
        transparent: false,
        scene: {
          create() {
            const scene = this as Phaser.Scene

            scene.add.text(window.innerWidth / 2, window.innerHeight / 2, 'SHOOT THE TARGETS', {
              fontFamily: 'Russo One',
              fontSize: '28px',
              color: '#C8D8D8',
            }).setOrigin(0.5).setAlpha(0.5)

            const spawnTarget = () => {
              if (hit >= TARGETS_REQUIRED) return
              const x = Phaser.Math.Between(80, window.innerWidth - 80)
              const y = Phaser.Math.Between(80, window.innerHeight - 80)

              const circle = scene.add.circle(x, y, 28, 0x00E5E5, 0)
              circle.setStrokeStyle(2, 0x00E5E5)

              scene.tweens.add({
                targets: circle,
                scaleX: 1.2, scaleY: 1.2,
                duration: 600,
                yoyo: true,
                repeat: -1,
              })

              const h = scene.add.line(x, y, -20, 0, 20, 0, 0x00E5E5, 0.8)
              const v = scene.add.line(x, y, 0, -20, 0, 20, 0x00E5E5, 0.8)
              const dot = scene.add.circle(x, y, 4, 0x00E5E5)

              const group = [circle, h, v, dot]

              circle.setInteractive()
              circle.on('pointerdown', () => {
                hit++

                for (let i = 0; i < 12; i++) {
                  const p = scene.add.circle(x, y, 4, 0x00E5E5)
                  const angle = (i / 12) * Math.PI * 2
                  scene.tweens.add({
                    targets: p,
                    x: x + Math.cos(angle) * 60,
                    y: y + Math.sin(angle) * 60,
                    alpha: 0,
                    scaleX: 0,
                    scaleY: 0,
                    duration: 400,
                    onComplete: () => p.destroy(),
                  })
                }

                const flash = scene.add.rectangle(
                  window.innerWidth / 2, window.innerHeight / 2,
                  window.innerWidth, window.innerHeight,
                  0x00E5E5, 0.15
                )
                scene.tweens.add({
                  targets: flash,
                  alpha: 0,
                  duration: 200,
                  onComplete: () => flash.destroy(),
                })

                group.forEach((g) => {
                  scene.tweens.add({ targets: g, alpha: 0, duration: 150, onComplete: () => g.destroy() })
                })

                const hitText = scene.add.text(x, y - 40, 'HIT!', {
                  fontFamily: 'JetBrains Mono',
                  fontSize: '18px',
                  color: '#00E5E5',
                }).setOrigin(0.5)
                scene.tweens.add({
                  targets: hitText,
                  alpha: 0,
                  y: y - 80,
                  duration: 400,
                  onComplete: () => hitText.destroy(),
                })

                if (hit >= TARGETS_REQUIRED) {
                  scene.time.delayedCall(600, () => {
                    gameRef.current?.destroy(true)
                    onComplete()
                  })
                } else {
                  scene.time.delayedCall(300, spawnTarget)
                }
              })

              scene.time.delayedCall(3000, () => {
                group.forEach((g) => {
                  if (g.active) {
                    scene.tweens.add({ targets: g, alpha: 0, duration: 300, onComplete: () => g.destroy() })
                  }
                })
                scene.time.delayedCall(400, spawnTarget)
              })
            }

            scene.time.delayedCall(800, spawnTarget)
          },
        },
      }

      gameRef.current = new Phaser.Game(config)
    })

    return () => {
      mounted = false
      gameRef.current?.destroy(true)
      gameRef.current = null
    }
  }, [onComplete])

  return <div ref={containerRef} className="fixed inset-0 z-[100]" />
}
