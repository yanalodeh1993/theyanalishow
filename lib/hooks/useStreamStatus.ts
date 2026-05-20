'use client'
import { useEffect, useState } from 'react'
import { supabase } from '@/lib/supabase'
import type { StreamStatus } from '@/lib/types'

export function useStreamStatus() {
  const [statuses, setStatuses] = useState<StreamStatus[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    supabase
      .from('stream_status')
      .select('*')
      .then(({ data }) => {
        if (data) setStatuses(data)
        setLoading(false)
      })

    const channel = supabase
      .channel('stream_status_changes')
      .on(
        'postgres_changes',
        { event: 'UPDATE', schema: 'public', table: 'stream_status' },
        (payload) => {
          setStatuses((prev) =>
            prev.map((s) =>
              s.id === payload.new.id ? (payload.new as StreamStatus) : s
            )
          )
        }
      )
      .subscribe()

    return () => { supabase.removeChannel(channel) }
  }, [])

  const isAnyLive = statuses.some((s) => s.is_live)
  const twitch = statuses.find((s) => s.platform === 'twitch')
  const youtube = statuses.find((s) => s.platform === 'youtube')
  const tiktok = statuses.find((s) => s.platform === 'tiktok')

  return { statuses, loading, isAnyLive, twitch, youtube, tiktok }
}
