'use client'
import Link from 'next/link'
import { usePathname } from 'next/navigation'
import Image from 'next/image'
import { signOut } from '@/app/actions/auth'

const NAV = [
  { href: '/dashboard',          label: 'Overview',       icon: '⊞' },
  { href: '/dashboard/clips',    label: 'Clips',          icon: '▶' },
  { href: '/dashboard/stream',   label: 'Stream Control', icon: '◉' },
  { href: '/dashboard/van-fund', label: 'Van Fund',       icon: '♡' },
  { href: '/dashboard/content',  label: 'Site Content',   icon: '✎' },
  { href: '/dashboard/team',     label: 'Team',           icon: '⊕' },
]

export function DashboardSidebar({ email }: { email: string }) {
  const pathname = usePathname()

  return (
    <aside
      className="flex flex-col h-full w-56 shrink-0 border-r"
      style={{ background: '#0a0a0d', borderColor: 'rgba(100,120,255,0.1)' }}
    >
      {/* Logo */}
      <div className="flex items-center gap-3 px-4 py-5 border-b" style={{ borderColor: 'rgba(100,120,255,0.1)' }}>
        <Image src="/logo.png" alt="TYS" width={28} height={28} />
        <span className="font-russo text-xs tracking-widest uppercase text-body">Dashboard</span>
      </div>

      {/* Nav */}
      <nav className="flex-1 py-4 flex flex-col gap-0.5 px-2">
        {NAV.map(({ href, label, icon }) => {
          const active = pathname === href
          return (
            <Link
              key={href}
              href={href}
              className="flex items-center gap-3 px-3 py-2.5 rounded-lg font-chakra text-sm transition-colors"
              style={{
                background: active ? 'rgba(100,120,255,0.12)' : 'transparent',
                color: active ? '#6478ff' : '#3a3a5a',
                borderLeft: active ? '2px solid #6478ff' : '2px solid transparent',
              }}
            >
              <span className="text-base leading-none">{icon}</span>
              {label}
            </Link>
          )
        })}
      </nav>

      {/* Footer */}
      <div className="px-4 py-4 border-t" style={{ borderColor: 'rgba(100,120,255,0.1)' }}>
        <p className="font-chakra text-[11px] text-muted truncate mb-3">{email}</p>
        <form action={signOut}>
          <button
            type="submit"
            className="w-full py-2 px-3 rounded-lg font-chakra text-xs uppercase tracking-wider text-muted border transition-colors hover:text-body hover:border-cyan"
            style={{ borderColor: 'rgba(100,120,255,0.2)' }}
          >
            Sign out
          </button>
        </form>
      </div>
    </aside>
  )
}
