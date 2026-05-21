'use client'
import { useState, useEffect } from 'react'
import { LogoEntry } from './LogoEntry'

type Props = { children: React.ReactNode }

export function EntryScreen({ children }: Props) {
  const [state, setState] = useState<'loading' | 'game' | 'done'>('loading')

  useEffect(() => {
    const played = sessionStorage.getItem('tys_entry_played')
    if (played) {
      setState('done')
      return
    }
    const t = setTimeout(() => setState('game'), 800)
    return () => clearTimeout(t)
  }, [])

  const handleComplete = () => {
    sessionStorage.setItem('tys_entry_played', '1')
    setState('done')
  }

  if (state === 'loading') {
    return (
      <div className="fixed inset-0 bg-deep z-[100] flex flex-col items-center justify-center gap-4">
        <p className="font-mono text-xs tracking-[0.4em] text-muted uppercase animate-pulse">
          Signal Acquired...
        </p>
        <p className="font-mono text-xs tracking-[0.4em] text-cyan uppercase animate-pulse">
          Entering TheYanaliShow
        </p>
        <button
          onClick={handleComplete}
          className="mt-8 font-mono text-xs text-muted/50 hover:text-muted underline"
        >
          skip
        </button>
      </div>
    )
  }

  if (state === 'game') {
    return (
      <>
        <LogoEntry onComplete={handleComplete} />
        <button
          onClick={handleComplete}
          className="fixed bottom-6 right-6 z-[101] font-mono text-xs text-muted/40 hover:text-muted underline"
        >
          skip intro
        </button>
      </>
    )
  }

  return <>{children}</>
}
