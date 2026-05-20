type Props = {
  twitchChannel: string
  youtubeVideoId: string | null
  tiktokHandle: string
  viewerCount: number
}

export function LiveState({ twitchChannel, youtubeVideoId, tiktokHandle, viewerCount }: Props) {
  return (
    <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
      <div className="lg:col-span-2 space-y-4">
        <div
          className="border border-cyan/30 overflow-hidden"
          style={{ boxShadow: '0 0 20px rgba(0,229,229,0.1)' }}
        >
          <iframe
            title="Twitch Player"
            src={`https://player.twitch.tv/?channel=${twitchChannel}&parent=theyanalishow.com&parent=localhost`}
            width="100%"
            height="400"
            allowFullScreen
          />
        </div>

        {youtubeVideoId && (
          <div className="border border-cyan/10 overflow-hidden">
            <iframe
              title="YouTube Video"
              src={`https://www.youtube.com/embed/${youtubeVideoId}?autoplay=0`}
              width="100%"
              height="200"
              allowFullScreen
            />
          </div>
        )}

        <a
          href={`https://tiktok.com/@${tiktokHandle}/live`}
          target="_blank"
          rel="noopener noreferrer"
          className="flex items-center justify-center gap-3 py-3 border border-cyan/20 font-chakra text-sm text-muted hover:text-cyan hover:border-cyan/50 transition-all"
        >
          <span>📱</span> Watch on TikTok LIVE
        </a>
      </div>

      <div className="border border-cyan/10 overflow-hidden">
        <iframe
          title="Twitch Chat"
          src={`https://www.twitch.tv/embed/${twitchChannel}/chat?darkpopout&parent=theyanalishow.com&parent=localhost`}
          width="100%"
          height="500"
        />
      </div>

      <div className="lg:col-span-3 flex items-center gap-3 pt-2">
        <span className="font-mono text-xs text-muted tracking-widest uppercase">Live Viewers</span>
        <span className="font-mono text-cyan text-lg" style={{ textShadow: '0 0 8px #00E5E5' }}>
          {viewerCount.toLocaleString()}
        </span>
      </div>
    </div>
  )
}
