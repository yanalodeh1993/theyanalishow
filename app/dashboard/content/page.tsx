import { createSupabaseServerClient } from '@/lib/supabase-server'
import { updateBio, updateSiteLink } from '@/app/actions/content'
import type { SiteConfig, SiteLink } from '@/lib/types'

export default async function SiteContentPage() {
  const supabase = await createSupabaseServerClient()
  const [{ data: configData }, { data: linksData }] = await Promise.all([
    supabase.from('site_config').select('*').eq('id', 1).single(),
    supabase.from('site_links').select('*').order('order'),
  ])
  const config = configData as SiteConfig | null
  const links = (linksData ?? []) as SiteLink[]

  return (
    <div className="max-w-3xl">
      <h1 className="font-russo text-2xl uppercase tracking-widest text-body mb-8">Site Content</h1>

      {/* Bio Editor */}
      <div className="rounded-xl border p-6 mb-6" style={{ background: '#14141a', borderColor: 'rgba(100,120,255,0.15)' }}>
        <h2 className="font-russo text-sm uppercase tracking-wider text-cyan mb-5">About / Bio</h2>
        <form action={updateBio} className="flex flex-col gap-4">
          <div className="flex flex-col gap-1.5">
            <label className="font-chakra text-[11px] uppercase tracking-widest text-muted">Main Bio Text</label>
            <textarea
              name="bio_main"
              defaultValue={config?.bio_main ?? ''}
              rows={3}
              className="bg-deep border rounded-lg px-3 py-2.5 font-chakra text-sm text-body outline-none focus:border-cyan transition-colors resize-none"
              style={{ borderColor: 'rgba(100,120,255,0.2)' }}
            />
          </div>
          <div className="flex flex-col gap-1.5">
            <label className="font-chakra text-[11px] uppercase tracking-widest text-muted">Sub Bio Text</label>
            <textarea
              name="bio_sub"
              defaultValue={config?.bio_sub ?? ''}
              rows={2}
              className="bg-deep border rounded-lg px-3 py-2.5 font-chakra text-sm text-body outline-none focus:border-cyan transition-colors resize-none"
              style={{ borderColor: 'rgba(100,120,255,0.2)' }}
            />
          </div>
          <div>
            <button
              type="submit"
              className="py-2.5 px-6 rounded-lg font-russo text-xs tracking-widest uppercase hover:opacity-80 transition-opacity"
              style={{ background: '#6478ff', color: '#fff' }}
            >
              Save Bio
            </button>
          </div>
        </form>
      </div>

      {/* Links Editor */}
      <div className="rounded-xl border p-6" style={{ background: '#14141a', borderColor: 'rgba(255,255,255,0.06)' }}>
        <h2 className="font-russo text-sm uppercase tracking-wider text-body mb-5">Social Links</h2>
        <div className="flex flex-col gap-4">
          {links.map((link) => (
            <form key={link.id} action={updateSiteLink} className="grid grid-cols-[auto_1fr_1fr_auto] gap-3 items-end">
              <input type="hidden" name="id" value={link.id} />
              <span
                className="font-chakra text-xs uppercase tracking-wider px-3 py-2.5 rounded-lg self-end"
                style={{ background: 'rgba(100,120,255,0.1)', color: '#6478ff', minWidth: 80, textAlign: 'center' }}
              >
                {link.platform}
              </span>
              <div className="flex flex-col gap-1">
                <label className="font-chakra text-[10px] uppercase tracking-widest text-muted">Label</label>
                <input
                  name="label"
                  defaultValue={link.label}
                  className="bg-deep border rounded-lg px-3 py-2 font-chakra text-xs text-body outline-none focus:border-cyan transition-colors"
                  style={{ borderColor: 'rgba(100,120,255,0.2)' }}
                />
              </div>
              <div className="flex flex-col gap-1">
                <label className="font-chakra text-[10px] uppercase tracking-widest text-muted">URL</label>
                <input
                  name="url"
                  type="url"
                  defaultValue={link.url}
                  className="bg-deep border rounded-lg px-3 py-2 font-chakra text-xs text-body outline-none focus:border-cyan transition-colors"
                  style={{ borderColor: 'rgba(100,120,255,0.2)' }}
                />
              </div>
              <button
                type="submit"
                className="py-2 px-4 rounded-lg font-chakra text-xs uppercase tracking-wider hover:opacity-80 transition-opacity self-end"
                style={{ background: 'rgba(100,120,255,0.15)', color: '#6478ff', border: '1px solid rgba(100,120,255,0.3)' }}
              >
                Save
              </button>
            </form>
          ))}
        </div>
      </div>
    </div>
  )
}
