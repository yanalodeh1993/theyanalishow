'use client'
import { useStreamStatus } from '@/lib/hooks/useStreamStatus'
import { LiveState } from './LiveState'
import { OfflineState } from './OfflineState'

export function LiveZone() {
  const { isAnyLive, twitch, youtube } = useStreamStatus()

  return (
    <section
      id="streams"
      className="px-10 py-20"
      style={{ background: isAnyLive ? '#060A0A' : '#0A1E1E' }}
    >
      <div className="max-w-6xl mx-auto">
        <div className="flex items-center gap-4 mb-10">
          <h2
            className="font-russo text-white uppercase"
            style={{ fontSize: 'clamp(36px, 5vw, 64px)' }}
          >
            {isAnyLive ? (
              <>
                <span className="text-magenta" style={{ textShadow: '0 0 20px #FF00C8' }}>LIVE</span>
                {' '}NOW
              </>
            ) : (
              'STREAMS'
            )}
          </h2>
        </div>

        {isAnyLive ? (
          <LiveState
            twitchChannel="theyanalishow"
            youtubeVideoId={youtube?.stream_url ?? null}
            tiktokHandle="theyanalishow"
            viewerCount={(twitch?.viewer_count ?? 0) + (youtube?.viewer_count ?? 0)}
          />
        ) : (
          <OfflineState />
        )}
      </div>
    </section>
  )
}
