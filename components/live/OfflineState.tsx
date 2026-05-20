export function OfflineState() {
  return (
    <div className="flex flex-col items-center text-center py-16 gap-8">
      <div className="font-mono text-xs tracking-[0.4em] text-muted uppercase">
        Stream Offline
      </div>
      <p className="font-chakra text-body/60 max-w-md">
        No stream right now — follow on Twitch or subscribe on YouTube to get notified when Yanali goes live.
      </p>
      <div className="flex gap-4">
        <a
          href="https://twitch.tv/theyanalishow"
          target="_blank"
          rel="noopener noreferrer"
          className="font-chakra text-sm font-semibold tracking-wider px-6 py-3 border border-cyan/30 text-cyan hover:bg-cyan hover:text-black transition-all"
        >
          Follow on Twitch
        </a>
        <a
          href="https://youtube.com/@theyanalishow"
          target="_blank"
          rel="noopener noreferrer"
          className="font-chakra text-sm font-semibold tracking-wider px-6 py-3 border border-body/20 text-body hover:border-cyan/30 hover:text-cyan transition-all"
        >
          Subscribe on YouTube
        </a>
      </div>
    </div>
  )
}
