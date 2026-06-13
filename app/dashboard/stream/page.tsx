import { createSupabaseServerClient } from '@/lib/supabase-server'
import { toggleLive, updateStreamUrl } from '@/app/actions/stream'
import type { StreamStatus } from '@/lib/types'

const PLATFORM_COLOR: Record<string, string> = {
  twitch: '#9146FF', youtube: '#FF0000', tiktok: '#6478ff',
}

export default async function StreamControlPage() {
  const supabase = await createSupabaseServerClient()
  const { data } = await supabase.from('stream_status').select('*')
  const streams = (data ?? []) as StreamStatus[]

  return (
    <div className="max-w-3xl">
      <h1 className="font-russo text-2xl uppercase tracking-widest text-body mb-2">Stream Control</h1>
      <p className="font-chakra text-sm text-muted mb-8">
        Manually override live status, stream URLs, and viewer counts. The OBS relay script updates these automatically when you go live — use this as a fallback.
      </p>

      <div className="flex flex-col gap-4">
        {(['twitch', 'youtube', 'tiktok'] as const).map((platform) => {
          const s = streams.find((x) => x.platform === platform)
          return (
            <div
              key={platform}
              className="rounded-xl border p-6"
              style={{
                background: '#14141a',
                borderColor: s?.is_live ? `${PLATFORM_COLOR[platform]}30` : 'rgba(255,255,255,0.06)',
              }}
            >
              <div className="flex items-center justify-between mb-5">
                <h2
                  className="font-russo text-sm uppercase tracking-wider capitalize"
                  style={{ color: PLATFORM_COLOR[platform] }}
                >
                  {platform}
                </h2>
                <span
                  className="font-chakra text-[11px] uppercase tracking-wider px-3 py-1 rounded-full"
                  style={{
                    background: s?.is_live ? 'rgba(255,0,100,0.15)' : 'rgba(255,255,255,0.04)',
                    color: s?.is_live ? '#ff4d6d' : '#3a3a5a',
                  }}
                >
                  {s?.is_live ? '● LIVE' : 'offline'}
                </span>
              </div>

              <div className="flex gap-3 mb-4">
                <form action={async () => { 'use server'; await toggleLive(platform, true) }} className="flex-1">
                  <button
                    type="submit"
                    className="w-full py-2 rounded-lg font-chakra text-xs uppercase tracking-wider transition-all"
                    style={{
                      background: s?.is_live ? '#ff4d6d' : 'rgba(255,77,109,0.1)',
                      color: '#ff4d6d',
                      border: '1px solid rgba(255,77,109,0.3)',
                    }}
                  >
                    Set Live
                  </button>
                </form>
                <form action={async () => { 'use server'; await toggleLive(platform, false) }} className="flex-1">
                  <button
                    type="submit"
                    className="w-full py-2 rounded-lg font-chakra text-xs uppercase tracking-wider transition-all"
                    style={{
                      background: !s?.is_live ? 'rgba(100,120,255,0.1)' : 'transparent',
                      color: '#3a3a5a',
                      border: '1px solid rgba(255,255,255,0.08)',
                    }}
                  >
                    Set Offline
                  </button>
                </form>
              </div>

              <form
                action={async (fd: FormData) => {
                  'use server'
                  const url = fd.get('stream_url') as string
                  if (url) await updateStreamUrl(platform, url)
                }}
                className="flex gap-2"
              >
                <input
                  name="stream_url"
                  defaultValue={s?.stream_url ?? ''}
                  placeholder={`https://${platform}.tv/theyanalishow`}
                  className="flex-1 bg-deep border rounded-lg px-3 py-2 font-chakra text-xs text-body outline-none focus:border-cyan transition-colors"
                  style={{ borderColor: 'rgba(100,120,255,0.15)' }}
                />
                <button
                  type="submit"
                  className="px-4 py-2 rounded-lg font-chakra text-xs uppercase tracking-wider transition-opacity hover:opacity-80"
                  style={{ background: '#6478ff22', color: '#6478ff', border: '1px solid rgba(100,120,255,0.3)' }}
                >
                  Update URL
                </button>
              </form>
            </div>
          )
        })}
      </div>
    </div>
  )
}
