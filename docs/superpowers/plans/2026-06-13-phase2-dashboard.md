# Phase 2 — Private Dashboard Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Build a protected `/dashboard` route for theyanalishow.com — a private command center where Yanal (owner) and any invited editors can manage clips, stream status, van fund, site content, and team access.

**Architecture:** Supabase Auth handles login (email/password). `middleware.ts` at the project root redirects unauthenticated requests to `/login`. The dashboard is a nested layout (`app/dashboard/layout.tsx`) that renders a fixed sidebar + persistent stats panel + scrollable main content — Layout C. All writes go through Next.js Server Actions using `@supabase/ssr`'s `createServerClient`.

**Tech Stack:** Next.js 16 App Router · React 19 · TypeScript · Tailwind v4 · `@supabase/ssr` v0.10.3 · Supabase project `oocfyglumhzclgmqlyvl`

---

## File Map

### New files
| Path | Responsibility |
|------|---------------|
| `middleware.ts` | Route guard — redirect `/dashboard/*` to `/login` if no session |
| `lib/supabase-server.ts` | `createSupabaseServerClient()` — server components & Server Actions |
| `lib/supabase-admin.ts` | `createSupabaseAdminClient()` — service-role client for invite operations |
| `app/login/page.tsx` | Login page (public) |
| `app/login/LoginForm.tsx` | `'use client'` login form with `useActionState` |
| `app/actions/auth.ts` | `signIn` / `signOut` Server Actions |
| `app/actions/clips.ts` | `addClip` / `updateClip` / `deleteClip` Server Actions |
| `app/actions/stream.ts` | `toggleLive` / `updateStreamUrl` Server Actions |
| `app/actions/van-fund.ts` | `updateGoal` / `addDonor` / `deleteDonor` Server Actions |
| `app/actions/content.ts` | `updateBio` / `updateLink` Server Actions |
| `app/actions/team.ts` | `inviteEditor` / `revokeAccess` Server Actions |
| `app/dashboard/layout.tsx` | Dashboard shell — sidebar + stats panel + main content slot |
| `app/dashboard/page.tsx` | Overview page |
| `app/dashboard/clips/page.tsx` | Clips Manager page |
| `app/dashboard/stream/page.tsx` | Stream Control page |
| `app/dashboard/van-fund/page.tsx` | Van Fund page |
| `app/dashboard/content/page.tsx` | Site Content page |
| `app/dashboard/team/page.tsx` | Team & Access page |
| `components/dashboard/DashboardSidebar.tsx` | Left nav — logo, links, user + sign-out |
| `components/dashboard/DashboardStatsPanel.tsx` | Always-visible stats rail — live status, van fund, recent donors |

### Modified files
| Path | Change |
|------|--------|
| `lib/types.ts` | Add `Clip`, `Profile`, `Invite`, `SiteConfig` types |
| `app/globals.css` | Add `.dashboard-shell * { cursor: auto !important }` |

---

## Task 1: Database schema

**Files:**
- Run SQL in Supabase SQL editor (project `oocfyglumhzclgmqlyvl`)

- [ ] **Step 1: Open Supabase SQL editor**

  Go to https://supabase.com/dashboard/project/oocfyglumhzclgmqlyvl/sql/new

- [ ] **Step 2: Run the full migration**

```sql
-- ─────────────────────────────────────────────
-- Helper: is current user the owner?
-- SECURITY DEFINER avoids recursive RLS lookups
-- ─────────────────────────────────────────────
CREATE OR REPLACE FUNCTION public.is_owner()
RETURNS BOOLEAN
LANGUAGE plpgsql SECURITY DEFINER
AS $$
BEGIN
  RETURN EXISTS (
    SELECT 1 FROM public.profiles WHERE id = auth.uid() AND role = 'owner'
  );
END;
$$;

-- ─────────────────────────────────────────────
-- profiles — stores role for each auth user
-- ─────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS public.profiles (
  id       UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  email    TEXT NOT NULL,
  role     TEXT NOT NULL CHECK (role IN ('owner', 'editor')),
  created_at TIMESTAMPTZ DEFAULT now()
);

ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;

CREATE POLICY "profiles_select" ON public.profiles
  FOR SELECT USING (auth.uid() = id OR public.is_owner());

CREATE POLICY "profiles_insert" ON public.profiles
  FOR INSERT WITH CHECK (public.is_owner());

CREATE POLICY "profiles_update" ON public.profiles
  FOR UPDATE USING (public.is_owner());

CREATE POLICY "profiles_delete" ON public.profiles
  FOR DELETE USING (public.is_owner());

-- ─────────────────────────────────────────────
-- clips — manually curated gallery
-- ─────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS public.clips (
  id            UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  title         TEXT NOT NULL,
  url           TEXT NOT NULL,
  thumbnail_url TEXT,
  platform      TEXT NOT NULL CHECK (platform IN ('twitch','youtube','tiktok','instagram','shorts')),
  display_order INT  NOT NULL DEFAULT 0,
  created_at    TIMESTAMPTZ DEFAULT now()
);

ALTER TABLE public.clips ENABLE ROW LEVEL SECURITY;

CREATE POLICY "clips_public_select" ON public.clips
  FOR SELECT USING (true);

CREATE POLICY "clips_auth_insert" ON public.clips
  FOR INSERT WITH CHECK (auth.uid() IS NOT NULL);

CREATE POLICY "clips_auth_update" ON public.clips
  FOR UPDATE USING (auth.uid() IS NOT NULL);

CREATE POLICY "clips_auth_delete" ON public.clips
  FOR DELETE USING (auth.uid() IS NOT NULL);

-- ─────────────────────────────────────────────
-- site_config — editable public site text
-- ─────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS public.site_config (
  id       INT PRIMARY KEY DEFAULT 1,
  bio_main TEXT NOT NULL DEFAULT 'Competitive gamer. Battle royale player. Future van lifer. TheYanaliShow is where the grind of ranked play meets the freedom of the open road.',
  bio_sub  TEXT NOT NULL DEFAULT 'Every stream is a battle. Every road is a new arena. Follow the journey — wherever it goes.',
  updated_at TIMESTAMPTZ DEFAULT now()
);

INSERT INTO public.site_config (id, bio_main, bio_sub)
VALUES (1,
  'Competitive gamer. Battle royale player. Future van lifer. TheYanaliShow is where the grind of ranked play meets the freedom of the open road.',
  'Every stream is a battle. Every road is a new arena. Follow the journey — wherever it goes.'
)
ON CONFLICT (id) DO NOTHING;

ALTER TABLE public.site_config ENABLE ROW LEVEL SECURITY;

CREATE POLICY "site_config_public_select" ON public.site_config
  FOR SELECT USING (true);

CREATE POLICY "site_config_owner_update" ON public.site_config
  FOR UPDATE USING (public.is_owner());

-- ─────────────────────────────────────────────
-- invites — pending editor invitations
-- ─────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS public.invites (
  id         UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  email      TEXT NOT NULL UNIQUE,
  role       TEXT NOT NULL DEFAULT 'editor' CHECK (role = 'editor'),
  invited_by UUID REFERENCES auth.users(id),
  accepted   BOOLEAN DEFAULT false,
  created_at TIMESTAMPTZ DEFAULT now()
);

ALTER TABLE public.invites ENABLE ROW LEVEL SECURITY;

CREATE POLICY "invites_owner_all" ON public.invites
  FOR ALL USING (public.is_owner());

-- ─────────────────────────────────────────────
-- Extend existing tables — add write policies
-- (existing tables already have public SELECT policies)
-- ─────────────────────────────────────────────
CREATE POLICY "stream_status_owner_update" ON public.stream_status
  FOR UPDATE USING (public.is_owner());

CREATE POLICY "van_fund_owner_update" ON public.van_fund
  FOR UPDATE USING (public.is_owner());

CREATE POLICY "recent_donors_owner_insert" ON public.recent_donors
  FOR INSERT WITH CHECK (public.is_owner());

CREATE POLICY "recent_donors_owner_delete" ON public.recent_donors
  FOR DELETE USING (public.is_owner());

CREATE POLICY "site_links_owner_all" ON public.site_links
  FOR ALL USING (public.is_owner());
```

- [ ] **Step 3: Verify tables created**

  In Supabase dashboard → Table Editor, confirm you see: `profiles`, `clips`, `site_config`, `invites`.

- [ ] **Step 4: Commit a note**

```bash
git -C "C:/Users/yanal/Desktop/Coding Projects/theyanalishow" commit --allow-empty -m "chore: supabase schema — profiles, clips, site_config, invites tables"
```

---

## Task 2: Supabase server clients + env var

**Files:**
- Create: `lib/supabase-server.ts`
- Create: `lib/supabase-admin.ts`
- Modify: `.env.local` (add service role key)

- [ ] **Step 1: Add service role key to `.env.local`**

  In Supabase dashboard → Project Settings → API, copy the `service_role` key (the secret one, not the anon key).

  Open `C:\Users\yanal\Desktop\Coding Projects\theyanalishow\.env.local` and add:
  ```
  SUPABASE_SERVICE_ROLE_KEY=your_service_role_key_here
  ```

- [ ] **Step 2: Create `lib/supabase-server.ts`**

```ts
import { createServerClient } from '@supabase/ssr'
import { cookies } from 'next/headers'

export async function createSupabaseServerClient() {
  const cookieStore = await cookies()
  return createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookies: {
        getAll() {
          return cookieStore.getAll()
        },
        setAll(cookiesToSet) {
          try {
            cookiesToSet.forEach(({ name, value, options }) =>
              cookieStore.set(name, value, options)
            )
          } catch {
            // Server Components can't set cookies — middleware handles refresh
          }
        },
      },
    }
  )
}
```

- [ ] **Step 3: Create `lib/supabase-admin.ts`**

```ts
import { createClient } from '@supabase/supabase-js'

export function createSupabaseAdminClient() {
  return createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY!,
    { auth: { autoRefreshToken: false, persistSession: false } }
  )
}
```

- [ ] **Step 4: Add new types to `lib/types.ts`**

  Append to the end of the existing file:

```ts
export type Profile = {
  id: string
  email: string
  role: 'owner' | 'editor'
  created_at: string
}

export type Clip = {
  id: string
  title: string
  url: string
  thumbnail_url: string | null
  platform: 'twitch' | 'youtube' | 'tiktok' | 'instagram' | 'shorts'
  display_order: number
  created_at: string
}

export type SiteConfig = {
  id: number
  bio_main: string
  bio_sub: string
  updated_at: string
}

export type Invite = {
  id: string
  email: string
  role: 'editor'
  invited_by: string | null
  accepted: boolean
  created_at: string
}
```

- [ ] **Step 5: Commit**

```bash
git -C "C:/Users/yanal/Desktop/Coding Projects/theyanalishow" add lib/supabase-server.ts lib/supabase-admin.ts lib/types.ts
git -C "C:/Users/yanal/Desktop/Coding Projects/theyanalishow" commit -m "feat: supabase server + admin clients, add dashboard types"
```

---

## Task 3: Auth middleware

**Files:**
- Create: `middleware.ts` (project root, alongside `package.json`)

- [ ] **Step 1: Create `middleware.ts`**

```ts
import { createServerClient } from '@supabase/ssr'
import { NextResponse, type NextRequest } from 'next/server'

export async function middleware(request: NextRequest) {
  let supabaseResponse = NextResponse.next({ request })

  const supabase = createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookies: {
        getAll() {
          return request.cookies.getAll()
        },
        setAll(cookiesToSet) {
          cookiesToSet.forEach(({ name, value, options }) =>
            request.cookies.set(name, value, options)
          )
          supabaseResponse = NextResponse.next({ request })
          cookiesToSet.forEach(({ name, value, options }) =>
            supabaseResponse.cookies.set(name, value, options)
          )
        },
      },
    }
  )

  const { data: { user } } = await supabase.auth.getUser()

  if (!user && request.nextUrl.pathname.startsWith('/dashboard')) {
    const url = request.nextUrl.clone()
    url.pathname = '/login'
    return NextResponse.redirect(url)
  }

  if (user && request.nextUrl.pathname === '/login') {
    const url = request.nextUrl.clone()
    url.pathname = '/dashboard'
    return NextResponse.redirect(url)
  }

  return supabaseResponse
}

export const config = {
  matcher: ['/dashboard/:path*', '/login'],
}
```

- [ ] **Step 2: Start dev server and verify redirect**

```bash
cd "C:/Users/yanal/Desktop/Coding Projects/theyanalishow" && npm run dev
```

  Open `http://localhost:3000/dashboard` in browser — should immediately redirect to `/login` (even though the login page doesn't exist yet, you'll see a 404 at `/login`, not a dashboard).

- [ ] **Step 3: Commit**

```bash
git -C "C:/Users/yanal/Desktop/Coding Projects/theyanalishow" add middleware.ts
git -C "C:/Users/yanal/Desktop/Coding Projects/theyanalishow" commit -m "feat: auth middleware — protect /dashboard, redirect authed away from /login"
```

---

## Task 4: Login page

**Files:**
- Create: `app/login/page.tsx`
- Create: `app/login/LoginForm.tsx`
- Create: `app/actions/auth.ts`

- [ ] **Step 1: Create `app/actions/auth.ts`**

```ts
'use server'
import { createSupabaseServerClient } from '@/lib/supabase-server'
import { redirect } from 'next/navigation'

export async function signIn(
  prevState: { error: string } | null,
  formData: FormData
) {
  const supabase = await createSupabaseServerClient()
  const { error } = await supabase.auth.signInWithPassword({
    email: formData.get('email') as string,
    password: formData.get('password') as string,
  })
  if (error) return { error: error.message }
  redirect('/dashboard')
}

export async function signOut() {
  const supabase = await createSupabaseServerClient()
  await supabase.auth.signOut()
  redirect('/login')
}
```

- [ ] **Step 2: Create `app/login/LoginForm.tsx`**

```tsx
'use client'
import { useActionState } from 'react'
import { signIn } from '@/app/actions/auth'

export function LoginForm() {
  const [state, action, pending] = useActionState(signIn, null)

  return (
    <form action={action} className="flex flex-col gap-4 w-full max-w-sm">
      <div className="flex flex-col gap-1.5">
        <label className="font-chakra text-xs text-muted uppercase tracking-widest">
          Email
        </label>
        <input
          name="email"
          type="email"
          required
          autoComplete="email"
          className="bg-surface border rounded-lg px-4 py-3 font-chakra text-sm text-body outline-none transition-colors focus:border-cyan"
          style={{ borderColor: 'rgba(100,120,255,0.2)' }}
        />
      </div>

      <div className="flex flex-col gap-1.5">
        <label className="font-chakra text-xs text-muted uppercase tracking-widest">
          Password
        </label>
        <input
          name="password"
          type="password"
          required
          autoComplete="current-password"
          className="bg-surface border rounded-lg px-4 py-3 font-chakra text-sm text-body outline-none transition-colors focus:border-cyan"
          style={{ borderColor: 'rgba(100,120,255,0.2)' }}
        />
      </div>

      {state?.error && (
        <p className="font-chakra text-xs text-red-400 bg-red-400/10 border border-red-400/20 rounded-lg px-4 py-3">
          {state.error}
        </p>
      )}

      <button
        type="submit"
        disabled={pending}
        className="mt-2 py-3 rounded-lg font-russo text-sm tracking-widest uppercase transition-opacity disabled:opacity-50"
        style={{ background: '#6478ff', color: '#fff' }}
      >
        {pending ? 'Signing in…' : 'Sign In'}
      </button>
    </form>
  )
}
```

- [ ] **Step 3: Create `app/login/page.tsx`**

```tsx
import { LoginForm } from './LoginForm'
import Image from 'next/image'

export default function LoginPage() {
  return (
    <div
      className="min-h-screen flex flex-col items-center justify-center px-6"
      style={{ background: '#0a0a0d' }}
    >
      <div className="flex flex-col items-center gap-8 w-full max-w-sm">
        <Image
          src="/logo.png"
          alt="TheYanaliShow"
          width={72}
          height={72}
          style={{ filter: 'drop-shadow(0 0 12px rgba(100,120,255,0.4))' }}
        />
        <div className="text-center">
          <h1 className="font-russo text-xl uppercase tracking-widest text-body mb-1">
            Dashboard
          </h1>
          <p className="font-chakra text-xs text-muted">TheYanaliShow — Owner access</p>
        </div>
        <LoginForm />
      </div>
    </div>
  )
}
```

- [ ] **Step 4: Verify login page renders**

  With dev server running, open `http://localhost:3000/login` — should show the login form with logo, email, password fields, and sign-in button.

- [ ] **Step 5: Commit**

```bash
git -C "C:/Users/yanal/Desktop/Coding Projects/theyanalishow" add app/login app/actions/auth.ts
git -C "C:/Users/yanal/Desktop/Coding Projects/theyanalishow" commit -m "feat: login page with Supabase email/password auth"
```

---

## Task 5: Bootstrap owner account

**Files:**
- Run in Supabase (one-time setup, not committed)

- [ ] **Step 1: Create the owner user in Supabase Auth**

  Go to https://supabase.com/dashboard/project/oocfyglumhzclgmqlyvl/auth/users → click **"Add user"** → **"Create new user"**:
  - Email: `yanalodeh1993@gmail.com`
  - Password: choose a strong password (you'll use this to log in)
  - ✓ Auto-confirm user: ON

- [ ] **Step 2: Copy the new user's UUID**

  After creating, click the user row and copy the UUID from the User UID column.

- [ ] **Step 3: Insert owner profile row**

  In Supabase SQL editor, run (replace `<UUID>` with the UUID you copied):

```sql
INSERT INTO public.profiles (id, email, role)
VALUES ('<UUID>', 'yanalodeh1993@gmail.com', 'owner');
```

- [ ] **Step 4: Test login**

  Open `http://localhost:3000/login` → sign in with the credentials you set → should redirect to `http://localhost:3000/dashboard` (404 for now, but the redirect should work, not loop back to login).

---

## Task 6: Dashboard shell layout + CSS

**Files:**
- Create: `components/dashboard/DashboardSidebar.tsx`
- Create: `components/dashboard/DashboardStatsPanel.tsx`
- Create: `app/dashboard/layout.tsx`
- Modify: `app/globals.css`

- [ ] **Step 1: Add cursor reset to `app/globals.css`**

  Append at the end of the file:

```css
/* ── Dashboard mode — restore native cursor ─────────────── */
.dashboard-shell * {
  cursor: auto !important;
}
.dashboard-shell a,
.dashboard-shell button,
.dashboard-shell [role="button"],
.dashboard-shell label,
.dashboard-shell select,
.dashboard-shell input,
.dashboard-shell textarea {
  cursor: pointer !important;
}
.dashboard-shell input,
.dashboard-shell textarea,
.dashboard-shell select {
  cursor: text !important;
}
```

- [ ] **Step 2: Create `components/dashboard/DashboardSidebar.tsx`**

```tsx
'use client'
import Link from 'next/link'
import { usePathname } from 'next/navigation'
import Image from 'next/image'
import { signOut } from '@/app/actions/auth'

const NAV = [
  { href: '/dashboard',         label: 'Overview',       icon: '⊞' },
  { href: '/dashboard/clips',   label: 'Clips',          icon: '▶' },
  { href: '/dashboard/stream',  label: 'Stream Control', icon: '◉' },
  { href: '/dashboard/van-fund',label: 'Van Fund',       icon: '♡' },
  { href: '/dashboard/content', label: 'Site Content',   icon: '✎' },
  { href: '/dashboard/team',    label: 'Team',           icon: '⊕' },
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
```

- [ ] **Step 3: Create `components/dashboard/DashboardStatsPanel.tsx`**

```tsx
import { createSupabaseServerClient } from '@/lib/supabase-server'
import type { StreamStatus, VanFund, Donor } from '@/lib/types'

const PLATFORM_COLOR: Record<string, string> = {
  twitch: '#9146FF',
  youtube: '#FF0000',
  tiktok: '#6478ff',
}

export async function DashboardStatsPanel() {
  const supabase = await createSupabaseServerClient()

  const [{ data: streams }, { data: fundRows }, { data: donors }] = await Promise.all([
    supabase.from('stream_status').select('*'),
    supabase.from('van_fund').select('*').limit(1).single(),
    supabase.from('recent_donors').select('*').order('donated_at', { ascending: false }).limit(3),
  ])

  const fund = fundRows as VanFund | null
  const pct = fund ? Math.min(Math.round((fund.current_amount / fund.goal_amount) * 100), 100) : 0

  return (
    <aside
      className="w-52 shrink-0 flex flex-col h-full border-r overflow-y-auto"
      style={{ background: '#0d0d11', borderColor: 'rgba(100,120,255,0.08)' }}
    >
      {/* Live Status */}
      <div className="px-4 pt-5 pb-4 border-b" style={{ borderColor: 'rgba(100,120,255,0.08)' }}>
        <p className="font-chakra text-[10px] uppercase tracking-widest text-muted mb-3">Live Status</p>
        <div className="flex flex-col gap-2">
          {(['twitch', 'youtube', 'tiktok'] as const).map((p) => {
            const s = (streams as StreamStatus[] | null)?.find((x) => x.platform === p)
            const live = s?.is_live ?? false
            return (
              <div key={p} className="flex items-center justify-between">
                <span className="font-chakra text-xs capitalize" style={{ color: PLATFORM_COLOR[p] }}>
                  {p}
                </span>
                <span
                  className="font-chakra text-[10px] uppercase tracking-wider px-2 py-0.5 rounded-full"
                  style={{
                    background: live ? 'rgba(255,0,100,0.15)' : 'rgba(255,255,255,0.04)',
                    color: live ? '#ff4d6d' : '#3a3a5a',
                  }}
                >
                  {live ? '● LIVE' : 'offline'}
                </span>
              </div>
            )
          })}
        </div>
      </div>

      {/* Van Fund */}
      <div className="px-4 py-4 border-b" style={{ borderColor: 'rgba(100,120,255,0.08)' }}>
        <p className="font-chakra text-[10px] uppercase tracking-widest text-muted mb-3">Van Fund</p>
        <div className="h-1.5 rounded-full overflow-hidden mb-2" style={{ background: 'rgba(255,255,255,0.06)' }}>
          <div
            className="h-full rounded-full transition-all"
            style={{ width: `${pct}%`, background: 'linear-gradient(to right, #6478ff, #FFB800)' }}
          />
        </div>
        <div className="flex justify-between font-chakra text-[11px]">
          <span style={{ color: '#FFB800' }}>{pct}%</span>
          <span className="text-muted">
            £{fund?.current_amount?.toLocaleString() ?? 0} / £{fund?.goal_amount?.toLocaleString() ?? 5000}
          </span>
        </div>
      </div>

      {/* Recent Donors */}
      <div className="px-4 py-4">
        <p className="font-chakra text-[10px] uppercase tracking-widest text-muted mb-3">Recent Donors</p>
        {!donors || donors.length === 0 ? (
          <p className="font-chakra text-[11px] text-muted/50">No donors yet</p>
        ) : (
          <div className="flex flex-col gap-2">
            {(donors as Donor[]).map((d) => (
              <div key={d.id} className="flex justify-between font-chakra text-[11px]">
                <span className="text-body truncate max-w-[100px]">{d.name}</span>
                <span style={{ color: '#FFB800' }}>£{d.amount}</span>
              </div>
            ))}
          </div>
        )}
      </div>
    </aside>
  )
}
```

- [ ] **Step 4: Create `app/dashboard/layout.tsx`**

```tsx
import { redirect } from 'next/navigation'
import { createSupabaseServerClient } from '@/lib/supabase-server'
import { DashboardSidebar } from '@/components/dashboard/DashboardSidebar'
import { DashboardStatsPanel } from '@/components/dashboard/DashboardStatsPanel'

export default async function DashboardLayout({ children }: { children: React.ReactNode }) {
  const supabase = await createSupabaseServerClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) redirect('/login')

  return (
    <div
      className="dashboard-shell flex h-screen overflow-hidden"
      style={{ background: '#0d0d0f' }}
    >
      <DashboardSidebar email={user.email ?? ''} />
      <DashboardStatsPanel />
      <main className="flex-1 overflow-y-auto">
        <div className="p-8">
          {children}
        </div>
      </main>
    </div>
  )
}
```

- [ ] **Step 5: Verify layout**

  With dev server running, log in at `/login` and confirm `/dashboard` shows the three-column shell with sidebar, stats panel, and main area. Cursor should be visible (not hidden).

- [ ] **Step 6: Commit**

```bash
git -C "C:/Users/yanal/Desktop/Coding Projects/theyanalishow" add components/dashboard app/dashboard/layout.tsx app/globals.css
git -C "C:/Users/yanal/Desktop/Coding Projects/theyanalishow" commit -m "feat: dashboard layout shell — sidebar, stats panel, main area"
```

---

## Task 7: Overview page

**Files:**
- Create: `app/dashboard/page.tsx`

- [ ] **Step 1: Create `app/dashboard/page.tsx`**

```tsx
import { createSupabaseServerClient } from '@/lib/supabase-server'
import type { StreamStatus, VanFund, Donor, Clip } from '@/lib/types'
import Link from 'next/link'

const PLATFORM_COLOR: Record<string, string> = {
  twitch: '#9146FF', youtube: '#FF0000', tiktok: '#6478ff',
}

export default async function DashboardOverview() {
  const supabase = await createSupabaseServerClient()

  const [
    { data: streams },
    { data: fund },
    { data: donors },
    { data: clips },
  ] = await Promise.all([
    supabase.from('stream_status').select('*'),
    supabase.from('van_fund').select('*').limit(1).single(),
    supabase.from('recent_donors').select('*').order('donated_at', { ascending: false }).limit(5),
    supabase.from('clips').select('*').order('display_order'),
  ])

  const vanFund = fund as VanFund | null
  const pct = vanFund
    ? Math.min(Math.round((vanFund.current_amount / vanFund.goal_amount) * 100), 100)
    : 0

  return (
    <div className="max-w-5xl">
      <h1 className="font-russo text-2xl uppercase tracking-widest text-body mb-8">Overview</h1>

      {/* Live Status Row */}
      <div className="grid grid-cols-3 gap-4 mb-8">
        {(['twitch', 'youtube', 'tiktok'] as const).map((p) => {
          const s = (streams as StreamStatus[] | null)?.find((x) => x.platform === p)
          const live = s?.is_live ?? false
          return (
            <div
              key={p}
              className="rounded-xl p-5 border"
              style={{
                background: '#14141a',
                borderColor: live ? `${PLATFORM_COLOR[p]}40` : 'rgba(255,255,255,0.06)',
              }}
            >
              <div className="flex items-center justify-between mb-1">
                <span
                  className="font-chakra text-xs font-semibold uppercase tracking-wider capitalize"
                  style={{ color: PLATFORM_COLOR[p] }}
                >
                  {p}
                </span>
                <span
                  className="text-[10px] font-chakra uppercase tracking-wider px-2 py-0.5 rounded-full"
                  style={{
                    background: live ? 'rgba(255,0,100,0.15)' : 'rgba(255,255,255,0.04)',
                    color: live ? '#ff4d6d' : '#3a3a5a',
                  }}
                >
                  {live ? '● LIVE' : 'offline'}
                </span>
              </div>
              {s?.viewer_count && s.viewer_count > 0 ? (
                <p className="font-chakra text-xl font-semibold text-body">{s.viewer_count.toLocaleString()}</p>
              ) : (
                <p className="font-chakra text-sm text-muted">—</p>
              )}
              <p className="font-chakra text-[10px] text-muted mt-0.5">viewers</p>
            </div>
          )
        })}
      </div>

      {/* Bottom Row */}
      <div className="grid grid-cols-2 gap-6">
        {/* Van Fund */}
        <div className="rounded-xl p-5 border" style={{ background: '#14141a', borderColor: 'rgba(255,255,255,0.06)' }}>
          <div className="flex items-center justify-between mb-4">
            <h2 className="font-russo text-sm uppercase tracking-wider text-body">Van Fund</h2>
            <Link
              href="/dashboard/van-fund"
              className="font-chakra text-xs text-cyan hover:text-body transition-colors"
            >
              Manage →
            </Link>
          </div>
          <div className="h-2 rounded-full overflow-hidden mb-3" style={{ background: 'rgba(255,255,255,0.06)' }}>
            <div
              className="h-full rounded-full"
              style={{ width: `${pct}%`, background: 'linear-gradient(to right, #6478ff, #FFB800)' }}
            />
          </div>
          <div className="flex justify-between font-chakra text-sm">
            <span style={{ color: '#FFB800' }}>{pct}% funded</span>
            <span className="text-muted">
              £{vanFund?.current_amount?.toLocaleString() ?? 0} / £{vanFund?.goal_amount?.toLocaleString() ?? 5000}
            </span>
          </div>
        </div>

        {/* Clips + Links quick stat */}
        <div className="rounded-xl p-5 border" style={{ background: '#14141a', borderColor: 'rgba(255,255,255,0.06)' }}>
          <div className="flex items-center justify-between mb-4">
            <h2 className="font-russo text-sm uppercase tracking-wider text-body">Quick Stats</h2>
          </div>
          <div className="flex flex-col gap-3 font-chakra text-sm">
            <div className="flex justify-between">
              <span className="text-muted">Curated clips</span>
              <span className="text-body">{(clips as Clip[] | null)?.length ?? 0}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-muted">Recent donors</span>
              <span className="text-body">{(donors as Donor[] | null)?.length ?? 0}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-muted">Van fund raised</span>
              <span style={{ color: '#FFB800' }}>£{vanFund?.current_amount?.toLocaleString() ?? 0}</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
```

- [ ] **Step 2: Verify overview page**

  Open `http://localhost:3000/dashboard` — should show Overview heading, three platform cards (Twitch/YouTube/TikTok), van fund card, quick stats.

- [ ] **Step 3: Commit**

```bash
git -C "C:/Users/yanal/Desktop/Coding Projects/theyanalishow" add app/dashboard/page.tsx
git -C "C:/Users/yanal/Desktop/Coding Projects/theyanalishow" commit -m "feat: dashboard overview page"
```

---

## Task 8: Clips Manager

**Files:**
- Create: `app/dashboard/clips/page.tsx`
- Create: `app/actions/clips.ts`

- [ ] **Step 1: Create `app/actions/clips.ts`**

```ts
'use server'
import { createSupabaseServerClient } from '@/lib/supabase-server'
import { revalidatePath } from 'next/cache'

export async function addClip(formData: FormData) {
  const supabase = await createSupabaseServerClient()
  const { error } = await supabase.from('clips').insert({
    title: formData.get('title') as string,
    url: formData.get('url') as string,
    thumbnail_url: (formData.get('thumbnail_url') as string) || null,
    platform: formData.get('platform') as string,
    display_order: Number(formData.get('display_order') ?? 0),
  })
  if (error) return { error: error.message }
  revalidatePath('/dashboard/clips')
  revalidatePath('/')
  return { success: true }
}

export async function deleteClip(id: string) {
  const supabase = await createSupabaseServerClient()
  const { error } = await supabase.from('clips').delete().eq('id', id)
  if (error) return { error: error.message }
  revalidatePath('/dashboard/clips')
  revalidatePath('/')
  return { success: true }
}

export async function updateClipOrder(id: string, display_order: number) {
  const supabase = await createSupabaseServerClient()
  const { error } = await supabase.from('clips').update({ display_order }).eq('id', id)
  if (error) return { error: error.message }
  revalidatePath('/dashboard/clips')
  revalidatePath('/')
  return { success: true }
}
```

- [ ] **Step 2: Create `app/dashboard/clips/page.tsx`**

```tsx
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
```

- [ ] **Step 3: Verify clips page**

  Open `http://localhost:3000/dashboard/clips` — should show Add Clip form and empty state. Add a test clip (e.g. title: "Test", url: `https://twitch.tv`, platform: twitch) — it should appear in the list below immediately after submission.

- [ ] **Step 4: Commit**

```bash
git -C "C:/Users/yanal/Desktop/Coding Projects/theyanalishow" add app/dashboard/clips app/actions/clips.ts
git -C "C:/Users/yanal/Desktop/Coding Projects/theyanalishow" commit -m "feat: clips manager — add, remove, reorder curated clips"
```

---

## Task 9: Stream Control

**Files:**
- Create: `app/dashboard/stream/page.tsx`
- Create: `app/actions/stream.ts`

- [ ] **Step 1: Create `app/actions/stream.ts`**

```ts
'use server'
import { createSupabaseServerClient } from '@/lib/supabase-server'
import { revalidatePath } from 'next/cache'

export async function toggleLive(platform: string, is_live: boolean) {
  const supabase = await createSupabaseServerClient()
  const { error } = await supabase
    .from('stream_status')
    .update({ is_live, updated_at: new Date().toISOString() })
    .eq('platform', platform)
  if (error) return { error: error.message }
  revalidatePath('/dashboard/stream')
  revalidatePath('/dashboard')
  revalidatePath('/')
  return { success: true }
}

export async function updateStreamUrl(platform: string, stream_url: string) {
  const supabase = await createSupabaseServerClient()
  const { error } = await supabase
    .from('stream_status')
    .update({ stream_url, updated_at: new Date().toISOString() })
    .eq('platform', platform)
  if (error) return { error: error.message }
  revalidatePath('/dashboard/stream')
  revalidatePath('/')
  return { success: true }
}

export async function updateViewerCount(platform: string, viewer_count: number) {
  const supabase = await createSupabaseServerClient()
  const { error } = await supabase
    .from('stream_status')
    .update({ viewer_count, updated_at: new Date().toISOString() })
    .eq('platform', platform)
  if (error) return { error: error.message }
  revalidatePath('/dashboard/stream')
  revalidatePath('/dashboard')
  return { success: true }
}
```

- [ ] **Step 2: Create `app/dashboard/stream/page.tsx`**

```tsx
import { createSupabaseServerClient } from '@/lib/supabase-server'
import { toggleLive, updateStreamUrl, updateViewerCount } from '@/app/actions/stream'
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
```

- [ ] **Step 3: Verify stream control**

  Open `http://localhost:3000/dashboard/stream` — three platform cards should show. Click "Set Live" on Twitch → page should reload with Twitch showing "● LIVE" and the stats panel (left) updating too.

- [ ] **Step 4: Commit**

```bash
git -C "C:/Users/yanal/Desktop/Coding Projects/theyanalishow" add app/dashboard/stream app/actions/stream.ts
git -C "C:/Users/yanal/Desktop/Coding Projects/theyanalishow" commit -m "feat: stream control page — toggle live, update stream URLs"
```

---

## Task 10: Van Fund page

**Files:**
- Create: `app/dashboard/van-fund/page.tsx`
- Create: `app/actions/van-fund.ts`

- [ ] **Step 1: Create `app/actions/van-fund.ts`**

```ts
'use server'
import { createSupabaseServerClient } from '@/lib/supabase-server'
import { revalidatePath } from 'next/cache'

export async function updateGoal(formData: FormData) {
  const supabase = await createSupabaseServerClient()
  const current_amount = Number(formData.get('current_amount'))
  const goal_amount = Number(formData.get('goal_amount'))
  const { data: row } = await supabase.from('van_fund').select('id').limit(1).single()
  if (!row) return { error: 'Van fund row not found' }
  const { error } = await supabase
    .from('van_fund')
    .update({ current_amount, goal_amount, updated_at: new Date().toISOString() })
    .eq('id', row.id)
  if (error) return { error: error.message }
  revalidatePath('/dashboard/van-fund')
  revalidatePath('/dashboard')
  revalidatePath('/')
  return { success: true }
}

export async function addDonor(formData: FormData) {
  const supabase = await createSupabaseServerClient()
  const name = formData.get('name') as string
  const amount = Number(formData.get('amount'))

  const { error: insertError } = await supabase.from('recent_donors').insert({
    name,
    amount,
    donated_at: new Date().toISOString(),
  })
  if (insertError) return { error: insertError.message }

  // Increment current_amount on van_fund
  const { data: fundRow } = await supabase.from('van_fund').select('id, current_amount').limit(1).single()
  if (fundRow) {
    await supabase
      .from('van_fund')
      .update({ current_amount: fundRow.current_amount + amount, updated_at: new Date().toISOString() })
      .eq('id', fundRow.id)
  }

  revalidatePath('/dashboard/van-fund')
  revalidatePath('/dashboard')
  revalidatePath('/')
  return { success: true }
}

export async function deleteDonor(id: string) {
  const supabase = await createSupabaseServerClient()
  const { data: donor } = await supabase.from('recent_donors').select('amount').eq('id', id).single()

  const { error } = await supabase.from('recent_donors').delete().eq('id', id)
  if (error) return { error: error.message }

  // Decrement current_amount
  if (donor) {
    const { data: fundRow } = await supabase.from('van_fund').select('id, current_amount').limit(1).single()
    if (fundRow) {
      await supabase
        .from('van_fund')
        .update({ current_amount: Math.max(0, fundRow.current_amount - donor.amount), updated_at: new Date().toISOString() })
        .eq('id', fundRow.id)
    }
  }

  revalidatePath('/dashboard/van-fund')
  revalidatePath('/dashboard')
  revalidatePath('/')
  return { success: true }
}
```

- [ ] **Step 2: Create `app/dashboard/van-fund/page.tsx`**

```tsx
import { createSupabaseServerClient } from '@/lib/supabase-server'
import { updateGoal, addDonor, deleteDonor } from '@/app/actions/van-fund'
import type { VanFund, Donor } from '@/lib/types'

export default async function VanFundPage() {
  const supabase = await createSupabaseServerClient()
  const [{ data: fundData }, { data: donorData }] = await Promise.all([
    supabase.from('van_fund').select('*').limit(1).single(),
    supabase.from('recent_donors').select('*').order('donated_at', { ascending: false }),
  ])
  const fund = fundData as VanFund | null
  const donors = (donorData ?? []) as Donor[]
  const pct = fund ? Math.min(Math.round((fund.current_amount / fund.goal_amount) * 100), 100) : 0

  return (
    <div className="max-w-3xl">
      <h1 className="font-russo text-2xl uppercase tracking-widest text-body mb-8">Van Fund</h1>

      {/* Current Progress */}
      <div className="rounded-xl border p-6 mb-6" style={{ background: '#14141a', borderColor: 'rgba(255,184,0,0.2)' }}>
        <h2 className="font-russo text-sm uppercase tracking-wider mb-4" style={{ color: '#FFB800' }}>Current Progress</h2>
        <div className="h-3 rounded-full overflow-hidden mb-3" style={{ background: 'rgba(255,255,255,0.06)' }}>
          <div
            className="h-full rounded-full transition-all duration-500"
            style={{ width: `${pct}%`, background: 'linear-gradient(to right, #6478ff, #FFB800)' }}
          />
        </div>
        <div className="flex justify-between font-chakra text-sm">
          <span style={{ color: '#FFB800' }}>{pct}% funded</span>
          <span className="text-body">£{fund?.current_amount?.toLocaleString() ?? 0} of £{fund?.goal_amount?.toLocaleString() ?? 5000}</span>
        </div>
      </div>

      {/* Update Goal */}
      <div className="rounded-xl border p-6 mb-6" style={{ background: '#14141a', borderColor: 'rgba(255,255,255,0.06)' }}>
        <h2 className="font-russo text-sm uppercase tracking-wider text-body mb-4">Update Amounts</h2>
        <form action={updateGoal} className="grid grid-cols-2 gap-4">
          <div className="flex flex-col gap-1.5">
            <label className="font-chakra text-[11px] uppercase tracking-widest text-muted">Current Amount (£)</label>
            <input
              name="current_amount"
              type="number"
              min="0"
              defaultValue={fund?.current_amount ?? 0}
              className="bg-deep border rounded-lg px-3 py-2.5 font-chakra text-sm text-body outline-none focus:border-cyan transition-colors"
              style={{ borderColor: 'rgba(100,120,255,0.2)' }}
            />
          </div>
          <div className="flex flex-col gap-1.5">
            <label className="font-chakra text-[11px] uppercase tracking-widest text-muted">Goal Amount (£)</label>
            <input
              name="goal_amount"
              type="number"
              min="1"
              defaultValue={fund?.goal_amount ?? 5000}
              className="bg-deep border rounded-lg px-3 py-2.5 font-chakra text-sm text-body outline-none focus:border-cyan transition-colors"
              style={{ borderColor: 'rgba(100,120,255,0.2)' }}
            />
          </div>
          <div className="col-span-2">
            <button
              type="submit"
              className="py-2.5 px-6 rounded-lg font-russo text-xs tracking-widest uppercase hover:opacity-80 transition-opacity"
              style={{ background: '#6478ff', color: '#fff' }}
            >
              Save Amounts
            </button>
          </div>
        </form>
      </div>

      {/* Add Donor */}
      <div className="rounded-xl border p-6 mb-6" style={{ background: '#14141a', borderColor: 'rgba(255,255,255,0.06)' }}>
        <h2 className="font-russo text-sm uppercase tracking-wider text-body mb-4">Record Donation</h2>
        <form action={addDonor} className="grid grid-cols-2 gap-4">
          <div className="flex flex-col gap-1.5">
            <label className="font-chakra text-[11px] uppercase tracking-widest text-muted">Donor Name</label>
            <input
              name="name"
              required
              placeholder="Anonymous"
              className="bg-deep border rounded-lg px-3 py-2.5 font-chakra text-sm text-body outline-none focus:border-cyan transition-colors"
              style={{ borderColor: 'rgba(100,120,255,0.2)' }}
            />
          </div>
          <div className="flex flex-col gap-1.5">
            <label className="font-chakra text-[11px] uppercase tracking-widest text-muted">Amount (£)</label>
            <input
              name="amount"
              type="number"
              min="1"
              required
              placeholder="10"
              className="bg-deep border rounded-lg px-3 py-2.5 font-chakra text-sm text-body outline-none focus:border-cyan transition-colors"
              style={{ borderColor: 'rgba(100,120,255,0.2)' }}
            />
          </div>
          <div className="col-span-2">
            <button
              type="submit"
              className="py-2.5 px-6 rounded-lg font-russo text-xs tracking-widest uppercase hover:opacity-80 transition-opacity"
              style={{ background: 'rgba(255,184,0,0.15)', color: '#FFB800', border: '1px solid rgba(255,184,0,0.3)' }}
            >
              Add Donor (+amount to total)
            </button>
          </div>
        </form>
      </div>

      {/* Donor List */}
      <div className="rounded-xl border p-6" style={{ background: '#14141a', borderColor: 'rgba(255,255,255,0.06)' }}>
        <h2 className="font-russo text-sm uppercase tracking-wider text-body mb-4">All Donors ({donors.length})</h2>
        {donors.length === 0 ? (
          <p className="font-chakra text-sm text-muted">No donors recorded yet.</p>
        ) : (
          <div className="flex flex-col gap-2">
            {donors.map((d) => (
              <div
                key={d.id}
                className="flex items-center justify-between py-2 border-b"
                style={{ borderColor: 'rgba(255,255,255,0.05)' }}
              >
                <div>
                  <span className="font-chakra text-sm text-body">{d.name}</span>
                  <span className="font-chakra text-xs text-muted ml-3">
                    {new Date(d.donated_at).toLocaleDateString()}
                  </span>
                </div>
                <div className="flex items-center gap-4">
                  <span className="font-russo text-sm" style={{ color: '#FFB800' }}>£{d.amount}</span>
                  <form action={async () => { 'use server'; await deleteDonor(d.id) }}>
                    <button type="submit" className="font-chakra text-xs text-muted hover:text-red-400 transition-colors uppercase tracking-wider">
                      Remove
                    </button>
                  </form>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  )
}
```

- [ ] **Step 3: Verify van fund page**

  Open `http://localhost:3000/dashboard/van-fund` — should show progress bar, update amounts form, add donor form, and donors list. Add a test donor (e.g. "Test User", £10) → should appear in list and progress bar should increment.

- [ ] **Step 4: Commit**

```bash
git -C "C:/Users/yanal/Desktop/Coding Projects/theyanalishow" add app/dashboard/van-fund app/actions/van-fund.ts
git -C "C:/Users/yanal/Desktop/Coding Projects/theyanalishow" commit -m "feat: van fund page — update goal, record donors, running total"
```

---

## Task 11: Site Content page

**Files:**
- Create: `app/dashboard/content/page.tsx`
- Create: `app/actions/content.ts`

- [ ] **Step 1: Create `app/actions/content.ts`**

```ts
'use server'
import { createSupabaseServerClient } from '@/lib/supabase-server'
import { revalidatePath } from 'next/cache'

export async function updateBio(formData: FormData) {
  const supabase = await createSupabaseServerClient()
  const { error } = await supabase
    .from('site_config')
    .update({
      bio_main: formData.get('bio_main') as string,
      bio_sub: formData.get('bio_sub') as string,
      updated_at: new Date().toISOString(),
    })
    .eq('id', 1)
  if (error) return { error: error.message }
  revalidatePath('/')
  return { success: true }
}

export async function updateSiteLink(formData: FormData) {
  const supabase = await createSupabaseServerClient()
  const { error } = await supabase
    .from('site_links')
    .update({
      url: formData.get('url') as string,
      label: formData.get('label') as string,
    })
    .eq('id', formData.get('id') as string)
  if (error) return { error: error.message }
  revalidatePath('/')
  return { success: true }
}
```

- [ ] **Step 2: Create `app/dashboard/content/page.tsx`**

```tsx
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
```

- [ ] **Step 3: Update `components/about/About.tsx` to read bio from database**

  Replace the entire file with:

```tsx
import Image from 'next/image'
import { createSupabaseServerClient } from '@/lib/supabase-server'
import type { SiteConfig } from '@/lib/types'

export async function About() {
  const supabase = await createSupabaseServerClient()
  const { data } = await supabase.from('site_config').select('*').eq('id', 1).single()
  const config = data as SiteConfig | null

  const bioMain = config?.bio_main ?? 'Competitive gamer. Battle royale player. Future van lifer. TheYanaliShow is where the grind of ranked play meets the freedom of the open road.'
  const bioSub = config?.bio_sub ?? 'Every stream is a battle. Every road is a new arena. Follow the journey — wherever it goes.'

  return (
    <section
      id="about"
      className="px-10 md:px-14 py-20 grid-bg"
      style={{ borderTop: '1px solid rgba(100,120,255,0.1)' }}
    >
      <div className="max-w-5xl mx-auto flex flex-col md:flex-row items-center gap-14">
        <div className="shrink-0 flex-none">
          <Image
            src="/logo-transparent.png"
            alt="Yanali"
            width={200}
            height={200}
            style={{
              filter: 'drop-shadow(0 0 16px rgba(100,120,255,0.35))',
              width: 'clamp(180px, 14vw, 360px)',
              height: 'auto',
            }}
          />
        </div>

        <div>
          <div
            className="inline-block font-chakra text-[11px] font-semibold tracking-[3px] uppercase px-4 py-2 mb-6 rounded-full"
            style={{ color: '#6478ff', border: '1px solid rgba(100,120,255,0.3)' }}
          >
            About the Creator
          </div>

          <h2
            className="font-russo uppercase leading-[0.95] tracking-[2px] mb-5"
            style={{ fontSize: 'clamp(36px, 4.5vw, 64px)' }}
          >
            WHO IS <span className="chrome-text">YANALI?</span>
          </h2>

          <p className="font-chakra text-[15px] leading-[1.75] text-muted max-w-lg mb-3">
            {bioMain}
          </p>
          <p className="font-chakra text-sm leading-relaxed text-muted/70">
            {bioSub}
          </p>
        </div>
      </div>
    </section>
  )
}
```

  Note: `About` is now an `async` Server Component — remove the `'use client'` directive if present.

- [ ] **Step 4: Verify content page**

  Open `http://localhost:3000/dashboard/content` — should show bio fields pre-filled with current text and all social links editable. Update one bio field and click Save → check the public site `/` to confirm the About section changed.

- [ ] **Step 6: Commit**

```bash
git -C "C:/Users/yanal/Desktop/Coding Projects/theyanalishow" add app/dashboard/content app/actions/content.ts components/about/About.tsx
git -C "C:/Users/yanal/Desktop/Coding Projects/theyanalishow" commit -m "feat: site content page — edit bio, update social links; About reads from DB"
```

---

## Task 12: Team & Access

**Files:**
- Create: `app/dashboard/team/page.tsx`
- Create: `app/actions/team.ts`

- [ ] **Step 1: Create `app/actions/team.ts`**

```ts
'use server'
import { createSupabaseServerClient } from '@/lib/supabase-server'
import { createSupabaseAdminClient } from '@/lib/supabase-admin'
import { revalidatePath } from 'next/cache'

export async function inviteEditor(formData: FormData) {
  const email = formData.get('email') as string
  const supabase = await createSupabaseServerClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return { error: 'Not authenticated' }

  // Record invite
  const { error: inviteRecordError } = await supabase
    .from('invites')
    .upsert({ email, role: 'editor', invited_by: user.id, accepted: false }, { onConflict: 'email' })
  if (inviteRecordError) return { error: inviteRecordError.message }

  // Send Supabase Auth invite email (magic link)
  const admin = createSupabaseAdminClient()
  const { error: authError } = await admin.auth.admin.inviteUserByEmail(email, {
    redirectTo: `${process.env.NEXT_PUBLIC_SITE_URL ?? 'http://localhost:3000'}/dashboard`,
  })
  if (authError) return { error: authError.message }

  revalidatePath('/dashboard/team')
  return { success: true }
}

export async function revokeAccess(userId: string) {
  const admin = createSupabaseAdminClient()
  const supabase = await createSupabaseServerClient()

  await supabase.from('profiles').delete().eq('id', userId)
  await admin.auth.admin.deleteUser(userId)

  revalidatePath('/dashboard/team')
  return { success: true }
}
```

- [ ] **Step 2: Add `NEXT_PUBLIC_SITE_URL` to `.env.local`**

  Open `.env.local` and add:
  ```
  NEXT_PUBLIC_SITE_URL=http://localhost:3000
  ```
  *(Change to `https://theyanalishow.com` when deploying.)*

- [ ] **Step 3: Create `app/dashboard/team/page.tsx`**

```tsx
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
```

- [ ] **Step 4: Verify team page**

  Open `http://localhost:3000/dashboard/team` — should show invite form, empty editors list, empty pending invites. The invite button requires `SUPABASE_SERVICE_ROLE_KEY` to be set correctly to actually send the email. Verify no console errors on page load.

- [ ] **Step 5: Commit**

```bash
git -C "C:/Users/yanal/Desktop/Coding Projects/theyanalishow" add app/dashboard/team app/actions/team.ts
git -C "C:/Users/yanal/Desktop/Coding Projects/theyanalishow" commit -m "feat: team & access page — invite editors, revoke access"
```

---

## Task 13: Wire up editor profile on invite acceptance

When an invited editor accepts the Supabase magic link, they have a `auth.users` row but no `profiles` row. We need a Supabase database trigger to create it automatically.

**Files:**
- Run SQL in Supabase SQL editor

- [ ] **Step 1: Run trigger SQL**

  In Supabase SQL editor, run:

```sql
CREATE OR REPLACE FUNCTION public.handle_new_user_from_invite()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER SET search_path = public
AS $$
DECLARE
  invite_record invites%ROWTYPE;
BEGIN
  SELECT * INTO invite_record
  FROM public.invites
  WHERE email = NEW.email AND accepted = false
  LIMIT 1;

  IF FOUND THEN
    INSERT INTO public.profiles (id, email, role)
    VALUES (NEW.id, NEW.email, invite_record.role)
    ON CONFLICT (id) DO NOTHING;

    UPDATE public.invites SET accepted = true WHERE id = invite_record.id;
  END IF;

  RETURN NEW;
END;
$$;

DROP TRIGGER IF EXISTS on_auth_user_created_invite ON auth.users;
CREATE TRIGGER on_auth_user_created_invite
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE PROCEDURE public.handle_new_user_from_invite();
```

- [ ] **Step 2: Commit note**

```bash
git -C "C:/Users/yanal/Desktop/Coding Projects/theyanalishow" commit --allow-empty -m "chore: supabase trigger — auto-create profile on invite acceptance"
```

---

## Task 14: Final smoke test

- [ ] **Step 1: Full flow check**

  With dev server running (`npm run dev` in project root):

  1. Visit `http://localhost:3000/dashboard` → redirects to `/login` ✓
  2. Sign in with owner credentials → redirects to `/dashboard` ✓
  3. Dashboard shows three-column shell with sidebar, stats panel, overview ✓
  4. Navigate to each page via sidebar: Clips, Stream, Van Fund, Content, Team ✓
  5. On Stream Control: toggle Twitch to Live → stats panel shows `● LIVE` ✓
  6. Toggle back offline ✓
  7. On Clips: add one clip → it appears in the list ✓
  8. Sign out → redirects to `/login` ✓
  9. Try visiting `/dashboard` directly → redirects to `/login` ✓
  10. Visit public site `http://localhost:3000/` → still works, entry screen, all sections ✓

- [ ] **Step 2: Final commit**

```bash
git -C "C:/Users/yanal/Desktop/Coding Projects/theyanalishow" add -A
git -C "C:/Users/yanal/Desktop/Coding Projects/theyanalishow" commit -m "feat: Phase 2 complete — private dashboard with auth, clips, stream control, van fund, content, team"
```
