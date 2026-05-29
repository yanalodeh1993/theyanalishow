'use client'
import { useState, useEffect } from 'react'
import { LogoEntry } from './LogoEntry'

type Props = { children: React.ReactNode }

export function EntryScreen({ children }: Props) {
  const [state, setState] = useState<'loading' | 'game' | 'done'>('loading')

  useEffect(() => {
    // During local development we want to skip the intro so content is
    // immediately visible for debugging. In production the normal flow
    // (checking sessionStorage) remains unchanged.
    if (process.env.NODE_ENV === 'development') {
      setState('done')
      return
    }

    const played = sessionStorage.getItem('tys_entry_played')
    if (played) {
      setState('done')
      return
    }

    setState('game')
  }, [])

  const handleComplete = () => {
    sessionStorage.setItem('tys_entry_played', '1')
    setState('done')
  }

  if (state === 'loading') {
    return <div className="fixed inset-0 bg-deep z-[100]" />
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

  return <div className="site-reveal">{children}</div>
}
