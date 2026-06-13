import { createSupabaseServerClient } from '@/lib/supabase-server'
import { addClip, deleteClip } from '@/app/actions/clips'
import type { Clip } from '@/lib/types'

const PLATFORMS = ['twitch', 'youtube', 'tiktok', 'instagram', 'shorts'] as const

const PLATFORM_COLOR: Record<string, string> = {
  twitch: '#9146FF', youtube: '#FF0000', tiktok: '#6478ff',
  instagram: '#E1306C', shorts: '#FF0000',
}

export default async function ClipsPage() {
  const supabase = await createSupabaseServerClient()
  const { data } = await supabase.from('clips').select('*').order('display_order')
  const clips = (data ?? []) as Clip[]

  return (
    <div className="max-w-4xl">
      <h1 className="font-russo text-2xl uppercase tracking-widest text-body mb-2">Clips Manager</h1>
      <p className="font-chakra text-sm text-muted mb-8">
        These clips appear in the public gallery. Add, remove, or reorder them here.
      </p>

      {/* Add Clip Form */}
      <div
        className="rounded-xl border p-6 mb-8"
        style={{ background: '#14141a', borderColor: 'rgba(100,120,255,0.15)' }}
      >
        <h2 className="font-russo text-sm uppercase tracking-widest text-cyan mb-5">Add New Clip</h2>
        <form action={addClip} className="grid grid-cols-2 gap-4">
          <div className="flex flex-col gap-1.5">
            <label className="font-chakra text-[11px] uppercase tracking-widest text-muted">Title</label>
            <input
              name="title"
              required
              placeholder="Epic clutch moment"
              className="bg-deep border rounded-lg px-3 py-2.5 font-chakra text-sm text-body outline-none focus:border-cyan transition-colors"
              style={{ borderColor: 'rgba(100,120,255,0.2)' }}
            />
          </div>
          <div className="flex flex-col gap-1.5">
            <label className="font-chakra text-[11px] uppercase tracking-widest text-muted">URL</label>
            <input
              name="url"
              type="url"
              required
              placeholder="https://www.twitch.tv/..."
              className="bg-deep border rounded-lg px-3 py-2.5 font-chakra text-sm text-body outline-none focus:border-cyan transition-colors"
              style={{ borderColor: 'rgba(100,120,255,0.2)' }}
            />
          </div>
          <div className="flex flex-col gap-1.5">
            <label className="font-chakra text-[11px] uppercase tracking-widest text-muted">Thumbnail URL</label>
            <input
              name="thumbnail_url"
              type="url"
              placeholder="https://... (optional)"
              className="bg-deep border rounded-lg px-3 py-2.5 font-chakra text-sm text-body outline-none focus:border-cyan transition-colors"
              style={{ borderColor: 'rgba(100,120,255,0.2)' }}
            />
          </div>
          <div className="flex flex-col gap-1.5">
            <label className="font-chakra text-[11px] uppercase tracking-widest text-muted">Platform</label>
            <select
              name="platform"
              required
              className="bg-deep border rounded-lg px-3 py-2.5 font-chakra text-sm text-body outline-none focus:border-cyan transition-colors"
              style={{ borderColor: 'rgba(100,120,255,0.2)' }}
            >
              {PLATFORMS.map((p) => (
                <option key={p} value={p} style={{ background: '#14141a' }}>{p}</option>
              ))}
            </select>
          </div>
          <div className="flex flex-col gap-1.5">
            <label className="font-chakra text-[11px] uppercase tracking-widest text-muted">Display Order</label>
            <input
              name="display_order"
              type="number"
              defaultValue={clips.length}
              className="bg-deep border rounded-lg px-3 py-2.5 font-chakra text-sm text-body outline-none focus:border-cyan transition-colors"
              style={{ borderColor: 'rgba(100,120,255,0.2)' }}
            />
          </div>
          <div className="flex items-end">
            <button
              type="submit"
              className="w-full py-2.5 rounded-lg font-russo text-xs tracking-widest uppercase transition-opacity hover:opacity-80"
              style={{ background: '#6478ff', color: '#fff' }}
            >
              Add Clip
            </button>
          </div>
        </form>
      </div>

      {/* Clips List */}
      <div className="flex flex-col gap-3">
        {clips.length === 0 ? (
          <p className="font-chakra text-sm text-muted py-8 text-center">
            No clips yet. Add your first one above.
          </p>
        ) : (
          clips.map((clip) => (
            <div
              key={clip.id}
              className="flex items-center gap-4 rounded-xl border p-4"
              style={{ background: '#14141a', borderColor: 'rgba(255,255,255,0.06)' }}
            >
              {clip.thumbnail_url ? (
                // eslint-disable-next-line @next/next/no-img-element
                <img
                  src={clip.thumbnail_url}
                  alt={clip.title}
                  className="w-20 h-12 object-cover rounded-lg shrink-0"
                />
              ) : (
                <div className="w-20 h-12 rounded-lg shrink-0 flex items-center justify-center" style={{ background: '#1e1e2a' }}>
                  <span className="text-muted text-xs">No img</span>
                </div>
              )}
              <div className="flex-1 min-w-0">
                <p className="font-chakra text-sm text-body truncate">{clip.title}</p>
                <p className="font-chakra text-xs text-muted truncate mt-0.5">{clip.url}</p>
              </div>
              <span
                className="font-chakra text-[10px] uppercase tracking-wider px-2 py-1 rounded-full shrink-0"
                style={{
                  background: `${PLATFORM_COLOR[clip.platform] ?? '#6478ff'}20`,
                  color: PLATFORM_COLOR[clip.platform] ?? '#6478ff',
                }}
              >
                {clip.platform}
              </span>
              <form
                action={async () => {
                  'use server'
                  await deleteClip(clip.id)
                }}
              >
                <button
                  type="submit"
                  className="text-muted hover:text-red-400 font-chakra text-xs uppercase tracking-wider transition-colors shrink-0"
                >
                  Remove
                </button>
              </form>
            </div>
          ))
        )}
      </div>
    </div>
  )
}
