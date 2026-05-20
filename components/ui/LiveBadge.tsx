'use client'

export function LiveBadge() {
  return (
    <span className="flex items-center gap-2 text-magenta font-chakra text-xs font-semibold tracking-widest uppercase">
      <span
        className="w-2 h-2 rounded-full bg-magenta"
        style={{
          boxShadow: '0 0 8px #FF00C8',
          animation: 'pulse-magenta 1.2s ease-in-out infinite',
        }}
      />
      LIVE
      <style>{`
        @keyframes pulse-magenta {
          0%, 100% { opacity: 1; transform: scale(1); }
          50% { opacity: 0.5; transform: scale(0.8); }
        }
      `}</style>
    </span>
  )
}
