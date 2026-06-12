'use client'
import { useStreamStatus } from '@/lib/hooks/useStreamStatus'
import { LiveState } from './LiveState'
import { OfflineState } from './OfflineState'

export function LiveZone() {
  const { isAnyLive, twitch, youtube } = useStreamStatus()

  return (
    <section
      id="streams"
      className="px-10 md:px-14 py-20"
      style={{
        borderTop: '1px solid rgba(100,120,255,0.1)',
      }}
    >
      <div className="max-w-6xl mx-auto">
        <div className="flex items-center gap-4 mb-10">
          <h2
            className="font-russo text-white uppercase tracking-[2px]"
            style={{ fontSize: 'clamp(36px, 5vw, 64px)' }}
          >
            {isAnyLive ? (
              <>
                <span className="text-magenta">LIVE</span> NOW
              </>
            ) : (
              'STREAMS'
            )}
          </h2>
          {isAnyLive && (
            <span
              className="w-3 h-3 rounded-full bg-magenta animate-pulse"
              style={{ boxShadow: '0 0 10px #a78bff' }}
            />
          )}
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
