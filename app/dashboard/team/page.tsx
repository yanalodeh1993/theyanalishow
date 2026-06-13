import { createSupabaseServerClient } from '@/lib/supabase-server'
import { inviteEditor, revokeAccess } from '@/app/actions/team'
import type { Profile, Invite } from '@/lib/types'

export default async function TeamPage() {
  const supabase = await createSupabaseServerClient()
  const [{ data: profilesData }, { data: invitesData }] = await Promise.all([
    supabase.from('profiles').select('*').order('created_at'),
    supabase.from('invites').select('*').order('created_at', { ascending: false }),
  ])
  const profiles = (profilesData ?? []) as Profile[]
  const invites = (invitesData ?? []) as Invite[]
  const editors = profiles.filter((p) => p.role === 'editor')

  return (
    <div className="max-w-3xl">
      <h1 className="font-russo text-2xl uppercase tracking-widest text-body mb-8">Team & Access</h1>

      {/* Invite Form */}
      <div className="rounded-xl border p-6 mb-6" style={{ background: '#14141a', borderColor: 'rgba(100,120,255,0.15)' }}>
        <h2 className="font-russo text-sm uppercase tracking-wider text-cyan mb-2">Invite Editor</h2>
        <p className="font-chakra text-xs text-muted mb-5">
          Editors can add, edit, and remove clips. They cannot change stream status, van fund, site content, or team access.
        </p>
        <form action={inviteEditor} className="flex gap-3">
          <input
            name="email"
            type="email"
            required
            placeholder="editor@example.com"
            className="flex-1 bg-deep border rounded-lg px-4 py-2.5 font-chakra text-sm text-body outline-none focus:border-cyan transition-colors"
            style={{ borderColor: 'rgba(100,120,255,0.2)' }}
          />
          <button
            type="submit"
            className="px-6 py-2.5 rounded-lg font-russo text-xs tracking-widest uppercase hover:opacity-80 transition-opacity shrink-0"
            style={{ background: '#6478ff', color: '#fff' }}
          >
            Send Invite
          </button>
        </form>
      </div>

      {/* Active Editors */}
      <div className="rounded-xl border p-6 mb-6" style={{ background: '#14141a', borderColor: 'rgba(255,255,255,0.06)' }}>
        <h2 className="font-russo text-sm uppercase tracking-wider text-body mb-4">
          Active Editors ({editors.length})
        </h2>
        {editors.length === 0 ? (
          <p className="font-chakra text-sm text-muted">No editors yet.</p>
        ) : (
          <div className="flex flex-col gap-2">
            {editors.map((e) => (
              <div
                key={e.id}
                className="flex items-center justify-between py-3 border-b"
                style={{ borderColor: 'rgba(255,255,255,0.05)' }}
              >
                <div>
                  <p className="font-chakra text-sm text-body">{e.email}</p>
                  <p className="font-chakra text-[11px] text-muted mt-0.5">
                    Editor · Joined {new Date(e.created_at).toLocaleDateString()}
                  </p>
                </div>
                <form action={async () => { 'use server'; await revokeAccess(e.id) }}>
                  <button
                    type="submit"
                    className="font-chakra text-xs text-muted hover:text-red-400 transition-colors uppercase tracking-wider"
                  >
                    Revoke
                  </button>
                </form>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Pending Invites */}
      <div className="rounded-xl border p-6" style={{ background: '#14141a', borderColor: 'rgba(255,255,255,0.06)' }}>
        <h2 className="font-russo text-sm uppercase tracking-wider text-body mb-4">
          Pending Invites ({invites.filter((i) => !i.accepted).length})
        </h2>
        {invites.filter((i) => !i.accepted).length === 0 ? (
          <p className="font-chakra text-sm text-muted">No pending invites.</p>
        ) : (
          <div className="flex flex-col gap-2">
            {invites.filter((i) => !i.accepted).map((inv) => (
              <div
                key={inv.id}
                className="flex items-center justify-between py-3 border-b"
                style={{ borderColor: 'rgba(255,255,255,0.05)' }}
              >
                <div>
                  <p className="font-chakra text-sm text-body">{inv.email}</p>
                  <p className="font-chakra text-[11px] text-muted mt-0.5">
                    Invited {new Date(inv.created_at).toLocaleDateString()} · Awaiting acceptance
                  </p>
                </div>
                <span
                  className="font-chakra text-[10px] uppercase tracking-wider px-2 py-1 rounded-full"
                  style={{ background: 'rgba(255,184,0,0.1)', color: '#FFB800' }}
                >
                  Pending
                </span>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  )
}
