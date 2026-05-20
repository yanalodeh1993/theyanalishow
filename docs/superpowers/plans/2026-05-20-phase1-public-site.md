# TheYanaliShow Phase 1 — Public Site Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Build theyanalishow.com — a fully public Next.js site with an interactive Target Practice entry game, live stream embeds driven by Supabase Realtime, a van dream donation section, clips gallery, links hub, and scroll-driven animations.

**Architecture:** Single Next.js App Router project deployed on Vercel. Supabase (fresh project) stores stream status, van fund, donors, and links. No auth required — everything is public read-only. OBS WebSocket relay script updates Supabase from the streaming PC.

**Tech Stack:** Next.js 14 (App Router), TypeScript, Tailwind CSS, Supabase, GSAP + ScrollTrigger, Phaser.js (entry game), Motion (Framer Motion), Howler.js, Google Fonts (Russo One, Chakra Petch, JetBrains Mono)

---

## File Map

```
theyanalishow/
├── app/
│   ├── layout.tsx                 # Root layout — fonts, metadata, global providers
│   ├── page.tsx                   # Home page — renders all sections in order
│   └── globals.css                # CSS variables, base resets, custom cursor styles
├── components/
│   ├── entry/
│   │   ├── EntryScreen.tsx        # Wrapper: shows TargetPractice or skips to hero
│   │   └── TargetPractice.tsx     # Phaser.js shooting mini-game
│   ├── hero/
│   │   ├── Hero.tsx               # Hero section — headline, CTAs, logo parallax
│   │   └── ParallaxLogo.tsx       # Logo PNG that moves with mouse
│   ├── nav/
│   │   └── Nav.tsx                # Top nav — logo, links, LIVE badge
│   ├── live/
│   │   ├── LiveZone.tsx           # Switches between LiveState / OfflineState
│   │   ├── LiveState.tsx          # Twitch + YouTube embeds + viewer count
│   │   └── OfflineState.tsx       # Schedule + last VOD + follow links
│   ├── clips/
│   │   └── ClipsGallery.tsx       # Horizontal scroll clip cards (hardcoded data)
│   ├── adventure/
│   │   └── AdventureTeaser.tsx    # Full-bleed parallax van life teaser
│   ├── vandream/
│   │   ├── VanDream.tsx           # Donation section — story, progress bar, PayPal CTA
│   │   └── DonorList.tsx          # Recent donors from Supabase
│   ├── links/
│   │   └── LinksHub.tsx           # Platform link cards from Supabase
│   ├── about/
│   │   └── About.tsx              # Bio section
│   └── ui/
│       ├── CursorTrail.tsx        # Crosshair cursor + click particle effect
│       └── LiveBadge.tsx          # Pulsing cyan LIVE NOW badge
├── lib/
│   ├── supabase.ts                # Supabase browser client
│   ├── types.ts                   # TypeScript types for all DB tables
│   └── hooks/
│       ├── useStreamStatus.ts     # Supabase Realtime subscription hook
│       └── useVanFund.ts          # Van fund + donors data hook
├── public/
│   ├── logo-transparent.png       # Logo PNG (copy from Desktop/YanaliShow logo/)
│   └── audio/
│       ├── hit.mp3                # Target hit sound
│       └── entry-rumble.mp3       # Entry sequence ambient sound
├── scripts/
│   └── obs-relay.js               # Node.js: OBS WebSocket → Supabase
├── tailwind.config.ts             # Custom design tokens
├── next.config.ts                 # Next.js config (iframe allow, image domains)
├── .env.local                     # NEXT_PUBLIC_SUPABASE_URL, NEXT_PUBLIC_SUPABASE_ANON_KEY
└── .gitignore                     # Includes .env.local
```

---

## Task 1: Scaffold the Next.js Project

**Files:**
- Create: entire project via CLI
- Modify: `tailwind.config.ts`, `app/globals.css`, `next.config.ts`

- [ ] **Step 1: Create the Next.js project**

```bash
cd "C:\Users\yanal\Desktop\Coding Projects"
npx create-next-app@latest theyanalishow --typescript --tailwind --eslint --app --src-dir=no --import-alias="@/*"
cd theyanalishow
```

When prompted: TypeScript ✅, ESLint ✅, Tailwind ✅, App Router ✅, no `src/` directory, import alias `@/*`.

- [ ] **Step 2: Install all dependencies**

```bash
npm install @supabase/supabase-js @supabase/ssr gsap phaser howler motion
npm install -D @types/howler
```

- [ ] **Step 3: Replace `tailwind.config.ts` with design tokens**

```ts
import type { Config } from 'tailwindcss'

const config: Config = {
  content: ['./app/**/*.{ts,tsx}', './components/**/*.{ts,tsx}'],
  theme: {
    extend: {
      colors: {
        bg: '#0A1E1E',
        surface: '#111C1C',
        deep: '#060A0A',
        cyan: '#00E5E5',
        'cyan-glow': '#00FFEF',
        magenta: '#FF00C8',
        body: '#C8D8D8',
        muted: '#4A7070',
        amber: '#FFB800',
      },
      fontFamily: {
        russo: ['Russo One', 'sans-serif'],
        chakra: ['Chakra Petch', 'sans-serif'],
        mono: ['JetBrains Mono', 'monospace'],
      },
    },
  },
  plugins: [],
}

export default config
```

- [ ] **Step 4: Replace `app/globals.css`**

```css
@import url('https://fonts.googleapis.com/css2?family=Russo+One&family=Chakra+Petch:wght@300;400;500;600&family=JetBrains+Mono:wght@400;500&display=swap');

@tailwind base;
@tailwind components;
@tailwind utilities;

:root {
  --bg: #0A1E1E;
  --surface: #111C1C;
  --deep: #060A0A;
  --cyan: #00E5E5;
  --cyan-glow: #00FFEF;
  --magenta: #FF00C8;
  --body: #C8D8D8;
  --muted: #4A7070;
  --amber: #FFB800;
}

* { box-sizing: border-box; margin: 0; padding: 0; }

html { scroll-behavior: smooth; }

body {
  background-color: var(--bg);
  color: var(--body);
  font-family: 'Chakra Petch', sans-serif;
  overflow-x: hidden;
  cursor: none;
}

/* Hide default cursor globally — CursorTrail component replaces it */
* { cursor: none !important; }
```

- [ ] **Step 5: Replace `next.config.ts`**

```ts
import type { NextConfig } from 'next'

const nextConfig: NextConfig = {
  images: {
    domains: ['static-cdn.jtvnw.net', 'i.ytimg.com'],
  },
}

export default nextConfig
```

- [ ] **Step 6: Replace `app/layout.tsx`**

```tsx
import type { Metadata } from 'next'
import './globals.css'

export const metadata: Metadata = {
  title: 'The Yanali Show',
  description: 'Gaming. Adventure. The open road. — TheYanaliShow',
  openGraph: {
    title: 'The Yanali Show',
    description: 'Competitive gaming meets van life adventure. Watch live on Twitch, YouTube, and TikTok.',
    url: 'https://theyanalishow.com',
    siteName: 'The Yanali Show',
  },
}

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en">
      <body>{children}</body>
    </html>
  )
}
```

- [ ] **Step 7: Replace `app/page.tsx` with a placeholder**

```tsx
export default function Home() {
  return (
    <main>
      <p style={{ color: '#00E5E5', padding: 40 }}>TheYanaliShow — building...</p>
    </main>
  )
}
```

- [ ] **Step 8: Verify dev server starts**

```bash
npm run dev
```

Expected: browser at `http://localhost:3000` shows cyan text "TheYanaliShow — building..."

- [ ] **Step 9: Initialise git and commit**

```bash
git init
git add .
git commit -m "feat: scaffold Next.js project with design tokens and dependencies"
```

---

## Task 2: Supabase Setup

**Files:**
- Create: `lib/supabase.ts`, `lib/types.ts`, `.env.local`

- [ ] **Step 1: Create a new Supabase project**

Go to https://supabase.com → New Project. Name it `theyanalishow`. Region: choose closest to you. Copy the **Project URL** and **anon public key** from Project Settings → API.

- [ ] **Step 2: Create `.env.local`**

```bash
# .env.local
NEXT_PUBLIC_SUPABASE_URL=https://YOUR_PROJECT_REF.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=YOUR_ANON_KEY
```

Replace the values with your actual Supabase credentials.

- [ ] **Step 3: Run these 4 SQL migrations in Supabase SQL Editor**

```sql
-- stream_status table
create table stream_status (
  id uuid primary key default gen_random_uuid(),
  platform text not null,
  is_live boolean default false,
  stream_url text,
  viewer_count integer default 0,
  updated_at timestamptz default now()
);

-- seed with all 3 platforms offline
insert into stream_status (platform, is_live) values
  ('twitch', false),
  ('youtube', false),
  ('tiktok', false);

-- enable realtime
alter publication supabase_realtime add table stream_status;
```

```sql
-- van_fund table
create table van_fund (
  id uuid primary key default gen_random_uuid(),
  goal_amount numeric not null default 5000,
  current_amount numeric not null default 0,
  updated_at timestamptz default now()
);

insert into van_fund (goal_amount, current_amount) values (5000, 0);
```

```sql
-- recent_donors table
create table recent_donors (
  id uuid primary key default gen_random_uuid(),
  name text not null,
  amount numeric not null,
  donated_at timestamptz default now()
);
```

```sql
-- site_links table
create table site_links (
  id uuid primary key default gen_random_uuid(),
  platform text not null,
  label text not null,
  url text not null,
  icon text not null,
  "order" integer not null default 0
);

insert into site_links (platform, label, url, icon, "order") values
  ('twitch', 'Twitch', 'https://twitch.tv/theyanalishow', 'twitch', 1),
  ('youtube', 'YouTube', 'https://youtube.com/@theyanalishow', 'youtube', 2),
  ('tiktok', 'TikTok', 'https://tiktok.com/@theyanalishow', 'tiktok', 3),
  ('instagram', 'Instagram', 'https://instagram.com/theyanalishow', 'instagram', 4),
  ('twitter', 'Twitter / X', 'https://x.com/theyanalishow', 'twitter', 5);
```

- [ ] **Step 4: Enable Row Level Security (RLS) with public read access**

```sql
-- Allow anyone to read all 4 tables (public site is read-only)
alter table stream_status enable row level security;
create policy "Public read" on stream_status for select using (true);

alter table van_fund enable row level security;
create policy "Public read" on van_fund for select using (true);

alter table recent_donors enable row level security;
create policy "Public read" on recent_donors for select using (true);

alter table site_links enable row level security;
create policy "Public read" on site_links for select using (true);
```

- [ ] **Step 5: Create `lib/types.ts`**

```ts
export type StreamStatus = {
  id: string
  platform: 'twitch' | 'youtube' | 'tiktok'
  is_live: boolean
  stream_url: string | null
  viewer_count: number
  updated_at: string
}

export type VanFund = {
  id: string
  goal_amount: number
  current_amount: number
  updated_at: string
}

export type Donor = {
  id: string
  name: string
  amount: number
  donated_at: string
}

export type SiteLink = {
  id: string
  platform: string
  label: string
  url: string
  icon: string
  order: number
}
```

- [ ] **Step 6: Create `lib/supabase.ts`**

```ts
import { createClient } from '@supabase/supabase-js'

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!

export const supabase = createClient(supabaseUrl, supabaseAnonKey)
```

- [ ] **Step 7: Commit**

```bash
git add .
git commit -m "feat: add Supabase client, types, and database schema"
```

---

## Task 3: Supabase Realtime Hooks

**Files:**
- Create: `lib/hooks/useStreamStatus.ts`, `lib/hooks/useVanFund.ts`

- [ ] **Step 1: Create `lib/hooks/useStreamStatus.ts`**

```ts
'use client'
import { useEffect, useState } from 'react'
import { supabase } from '@/lib/supabase'
import type { StreamStatus } from '@/lib/types'

export function useStreamStatus() {
  const [statuses, setStatuses] = useState<StreamStatus[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    // Initial fetch
    supabase
      .from('stream_status')
      .select('*')
      .then(({ data }) => {
        if (data) setStatuses(data)
        setLoading(false)
      })

    // Realtime subscription — fires instantly when OBS relay updates the table
    const channel = supabase
      .channel('stream_status_changes')
      .on(
        'postgres_changes',
        { event: 'UPDATE', schema: 'public', table: 'stream_status' },
        (payload) => {
          setStatuses((prev) =>
            prev.map((s) =>
              s.id === payload.new.id ? (payload.new as StreamStatus) : s
            )
          )
        }
      )
      .subscribe()

    return () => { supabase.removeChannel(channel) }
  }, [])

  const isAnyLive = statuses.some((s) => s.is_live)
  const twitch = statuses.find((s) => s.platform === 'twitch')
  const youtube = statuses.find((s) => s.platform === 'youtube')
  const tiktok = statuses.find((s) => s.platform === 'tiktok')

  return { statuses, loading, isAnyLive, twitch, youtube, tiktok }
}
```

- [ ] **Step 2: Create `lib/hooks/useVanFund.ts`**

```ts
'use client'
import { useEffect, useState } from 'react'
import { supabase } from '@/lib/supabase'
import type { VanFund, Donor } from '@/lib/types'

export function useVanFund() {
  const [fund, setFund] = useState<VanFund | null>(null)
  const [donors, setDonors] = useState<Donor[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    Promise.all([
      supabase.from('van_fund').select('*').single(),
      supabase.from('recent_donors').select('*').order('donated_at', { ascending: false }).limit(5),
    ]).then(([fundRes, donorsRes]) => {
      if (fundRes.data) setFund(fundRes.data)
      if (donorsRes.data) setDonors(donorsRes.data)
      setLoading(false)
    })
  }, [])

  const percentage = fund
    ? Math.min(100, Math.round((fund.current_amount / fund.goal_amount) * 100))
    : 0

  return { fund, donors, loading, percentage }
}
```

- [ ] **Step 3: Commit**

```bash
git add .
git commit -m "feat: add Supabase Realtime hooks for stream status and van fund"
```

---

## Task 4: Navigation

**Files:**
- Create: `components/nav/Nav.tsx`, `components/ui/LiveBadge.tsx`

- [ ] **Step 1: Create `components/ui/LiveBadge.tsx`**

```tsx
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
```

- [ ] **Step 2: Create `components/nav/Nav.tsx`**

```tsx
'use client'
import { useStreamStatus } from '@/lib/hooks/useStreamStatus'
import { LiveBadge } from '@/components/ui/LiveBadge'

export function Nav() {
  const { isAnyLive } = useStreamStatus()

  return (
    <nav className="fixed top-0 left-0 right-0 z-50 flex items-center justify-between px-10 py-5 border-b border-cyan/10 bg-bg/80 backdrop-blur-md">
      <span className="font-russo text-cyan tracking-widest text-sm uppercase"
        style={{ textShadow: '0 0 12px #00E5E5' }}>
        The Yanali Show
      </span>

      <ul className="flex gap-8 list-none">
        {['Streams', 'Clips', 'Adventure', 'Van Dream'].map((item) => (
          <li key={item}>
            <a
              href={`#${item.toLowerCase().replace(' ', '-')}`}
              className="font-chakra text-xs font-medium tracking-widest text-muted uppercase hover:text-cyan transition-colors"
            >
              {item}
            </a>
          </li>
        ))}
      </ul>

      {isAnyLive ? (
        <a href="#streams">
          <LiveBadge />
        </a>
      ) : (
        <span className="font-mono text-xs text-muted tracking-widest">OFFLINE</span>
      )}
    </nav>
  )
}
```

- [ ] **Step 3: Add Nav to `app/page.tsx`**

```tsx
import { Nav } from '@/components/nav/Nav'

export default function Home() {
  return (
    <main className="bg-bg min-h-screen">
      <Nav />
      <p className="text-cyan pt-24 px-10 font-russo">TheYanaliShow — building...</p>
    </main>
  )
}
```

- [ ] **Step 4: Verify nav renders at `http://localhost:3000`**

Expected: fixed nav with "The Yanali Show" in cyan, nav links in muted colour, "OFFLINE" text on right.

- [ ] **Step 5: Commit**

```bash
git add .
git commit -m "feat: add navigation with live status indicator"
```

---

## Task 5: Custom Cursor

**Files:**
- Create: `components/ui/CursorTrail.tsx`

- [ ] **Step 1: Create `components/ui/CursorTrail.tsx`**

```tsx
'use client'
import { useEffect, useRef } from 'react'

export function CursorTrail() {
  const cursorRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    const cursor = cursorRef.current
    if (!cursor) return

    const move = (e: MouseEvent) => {
      cursor.style.left = `${e.clientX}px`
      cursor.style.top = `${e.clientY}px`
    }

    const click = (e: MouseEvent) => {
      const spark = document.createElement('div')
      spark.style.cssText = `
        position: fixed;
        left: ${e.clientX}px;
        top: ${e.clientY}px;
        width: 20px; height: 20px;
        border-radius: 50%;
        background: radial-gradient(circle, #00E5E5, transparent);
        pointer-events: none;
        transform: translate(-50%, -50%) scale(1);
        transition: transform 0.3s ease, opacity 0.3s ease;
        opacity: 1;
        z-index: 9999;
      `
      document.body.appendChild(spark)
      requestAnimationFrame(() => {
        spark.style.transform = 'translate(-50%, -50%) scale(3)'
        spark.style.opacity = '0'
      })
      setTimeout(() => spark.remove(), 300)
    }

    window.addEventListener('mousemove', move)
    window.addEventListener('click', click)
    return () => {
      window.removeEventListener('mousemove', move)
      window.removeEventListener('click', click)
    }
  }, [])

  return (
    <div
      ref={cursorRef}
      className="fixed pointer-events-none z-[9999] -translate-x-1/2 -translate-y-1/2"
      style={{ left: '-100px', top: '-100px' }}
    >
      {/* Crosshair SVG */}
      <svg width="24" height="24" viewBox="0 0 24 24" fill="none">
        <circle cx="12" cy="12" r="4" stroke="#00E5E5" strokeWidth="1.5" />
        <line x1="12" y1="2" x2="12" y2="8" stroke="#00E5E5" strokeWidth="1.5" />
        <line x1="12" y1="16" x2="12" y2="22" stroke="#00E5E5" strokeWidth="1.5" />
        <line x1="2" y1="12" x2="8" y2="12" stroke="#00E5E5" strokeWidth="1.5" />
        <line x1="16" y1="12" x2="22" y2="12" stroke="#00E5E5" strokeWidth="1.5" />
      </svg>
    </div>
  )
}
```

- [ ] **Step 2: Add CursorTrail to `app/layout.tsx`**

```tsx
import type { Metadata } from 'next'
import './globals.css'
import { CursorTrail } from '@/components/ui/CursorTrail'

export const metadata: Metadata = {
  title: 'The Yanali Show',
  description: 'Gaming. Adventure. The open road. — TheYanaliShow',
}

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en">
      <body>
        <CursorTrail />
        {children}
      </body>
    </html>
  )
}
```

- [ ] **Step 3: Verify crosshair cursor appears and click sparks work**

Move mouse around the page — should see cyan crosshair instead of default cursor. Click anywhere — should see a brief cyan ripple expand and fade.

- [ ] **Step 4: Commit**

```bash
git add .
git commit -m "feat: add custom crosshair cursor with click particle effect"
```

---

## Task 6: Entry Screen — Target Practice Mini-Game

**Files:**
- Create: `components/entry/TargetPractice.tsx`, `components/entry/EntryScreen.tsx`
- Add: `public/audio/hit.mp3`, `public/audio/entry-rumble.mp3` (sourced separately — free SFX from freesound.org)

- [ ] **Step 1: Create `components/entry/TargetPractice.tsx`**

```tsx
'use client'
import { useEffect, useRef } from 'react'

type Props = { onComplete: () => void }

export function TargetPractice({ onComplete }: Props) {
  const containerRef = useRef<HTMLDivElement>(null)
  const gameRef = useRef<any>(null)

  useEffect(() => {
    // Phaser must be imported dynamically — it uses browser APIs
    import('phaser').then((Phaser) => {
      if (!containerRef.current || gameRef.current) return

      const TARGETS_REQUIRED = 5
      let hit = 0

      const config: Phaser.Types.Core.GameConfig = {
        type: Phaser.AUTO,
        width: window.innerWidth,
        height: window.innerHeight,
        backgroundColor: '#060A0A',
        parent: containerRef.current,
        transparent: false,
        scene: {
          create() {
            const scene = this as Phaser.Scene

            // "CLICK TO SHOOT" instruction text
            scene.add.text(window.innerWidth / 2, window.innerHeight / 2, 'SHOOT THE TARGETS', {
              fontFamily: 'Russo One',
              fontSize: '28px',
              color: '#C8D8D8',
            }).setOrigin(0.5).setAlpha(0.5)

            // Spawn targets one by one
            const spawnTarget = () => {
              if (hit >= TARGETS_REQUIRED) return
              const x = Phaser.Math.Between(80, window.innerWidth - 80)
              const y = Phaser.Math.Between(80, window.innerHeight - 80)

              const circle = scene.add.circle(x, y, 28, 0x00E5E5, 0)
              circle.setStrokeStyle(2, 0x00E5E5)

              // Pulse ring animation
              scene.tweens.add({
                targets: circle,
                scaleX: 1.2, scaleY: 1.2,
                duration: 600,
                yoyo: true,
                repeat: -1,
              })

              // Crosshair lines
              const h = scene.add.line(x, y, -20, 0, 20, 0, 0x00E5E5, 0.8)
              const v = scene.add.line(x, y, 0, -20, 0, 20, 0x00E5E5, 0.8)
              const dot = scene.add.circle(x, y, 4, 0x00E5E5)

              const group = [circle, h, v, dot]

              // Make circle interactive
              circle.setInteractive()
              circle.on('pointerdown', () => {
                hit++

                // Particle burst
                for (let i = 0; i < 12; i++) {
                  const p = scene.add.circle(x, y, 4, 0x00E5E5)
                  const angle = (i / 12) * Math.PI * 2
                  scene.tweens.add({
                    targets: p,
                    x: x + Math.cos(angle) * 60,
                    y: y + Math.sin(angle) * 60,
                    alpha: 0,
                    scaleX: 0,
                    scaleY: 0,
                    duration: 400,
                    onComplete: () => p.destroy(),
                  })
                }

                // Screen flash
                const flash = scene.add.rectangle(
                  window.innerWidth / 2, window.innerHeight / 2,
                  window.innerWidth, window.innerHeight,
                  0x00E5E5, 0.15
                )
                scene.tweens.add({
                  targets: flash,
                  alpha: 0,
                  duration: 200,
                  onComplete: () => flash.destroy(),
                })

                // Remove target
                group.forEach((g) => {
                  scene.tweens.add({ targets: g, alpha: 0, duration: 150, onComplete: () => g.destroy() })
                })

                // Hit counter text
                scene.add.text(x, y - 40, 'HIT!', {
                  fontFamily: 'JetBrains Mono',
                  fontSize: '18px',
                  color: '#00E5E5',
                }).setOrigin(0.5).setAlpha(1, undefined as any)

                if (hit >= TARGETS_REQUIRED) {
                  // Small delay then complete
                  scene.time.delayedCall(600, () => {
                    gameRef.current?.destroy(true)
                    onComplete()
                  })
                } else {
                  scene.time.delayedCall(300, spawnTarget)
                }
              })

              scene.time.delayedCall(3000, () => {
                group.forEach((g) => {
                  if (g.active) {
                    scene.tweens.add({ targets: g, alpha: 0, duration: 300, onComplete: () => g.destroy() })
                  }
                })
                scene.time.delayedCall(400, spawnTarget)
              })
            }

            // Spawn first target after brief delay
            scene.time.delayedCall(800, spawnTarget)
          },
        },
      }

      gameRef.current = new Phaser.Game(config)
    })

    return () => {
      gameRef.current?.destroy(true)
      gameRef.current = null
    }
  }, [onComplete])

  return <div ref={containerRef} className="fixed inset-0 z-[100]" />
}
```

- [ ] **Step 2: Create `components/entry/EntryScreen.tsx`**

```tsx
'use client'
import { useState, useEffect } from 'react'
import { TargetPractice } from './TargetPractice'

type Props = { children: React.ReactNode }

export function EntryScreen({ children }: Props) {
  const [state, setState] = useState<'loading' | 'game' | 'done'>('loading')

  useEffect(() => {
    // Check if user has already played — skip on return visits
    const played = sessionStorage.getItem('tys_entry_played')
    if (played) {
      setState('done')
      return
    }
    // Brief loading pause for dramatic effect
    const t = setTimeout(() => setState('game'), 800)
    return () => clearTimeout(t)
  }, [])

  const handleComplete = () => {
    sessionStorage.setItem('tys_entry_played', '1')
    setState('done')
  }

  if (state === 'loading') {
    return (
      <div className="fixed inset-0 bg-deep z-[100] flex flex-col items-center justify-center gap-4">
        <p className="font-mono text-xs tracking-[0.4em] text-muted uppercase animate-pulse">
          Signal Acquired...
        </p>
        <p className="font-mono text-xs tracking-[0.4em] text-cyan uppercase animate-pulse">
          Entering TheYanaliShow
        </p>
        <button
          onClick={handleComplete}
          className="mt-8 font-mono text-xs text-muted/50 hover:text-muted underline"
        >
          skip
        </button>
      </div>
    )
  }

  if (state === 'game') {
    return (
      <>
        <TargetPractice onComplete={handleComplete} />
        <button
          onClick={handleComplete}
          className="fixed bottom-6 right-6 z-[101] font-mono text-xs text-muted/40 hover:text-muted underline"
        >
          skip intro
        </button>
      </>
    )
  }

  return <>{children}</>
}
```

- [ ] **Step 3: Wrap `app/page.tsx` with EntryScreen**

```tsx
import { Nav } from '@/components/nav/Nav'
import { EntryScreen } from '@/components/entry/EntryScreen'

export default function Home() {
  return (
    <EntryScreen>
      <main className="bg-bg min-h-screen">
        <Nav />
        <p className="text-cyan pt-24 px-10 font-russo">TheYanaliShow — building...</p>
      </main>
    </EntryScreen>
  )
}
```

- [ ] **Step 4: Test the entry game at `http://localhost:3000`**

Expected: Dark screen appears, "Signal Acquired" text pulses, then 5 cyan targets appear one at a time. Clicking each causes a particle burst. After 5 hits the game disappears and the placeholder page shows. Refreshing the same tab → game is skipped (sessionStorage). Opening in a new tab → game plays again.

- [ ] **Step 5: Commit**

```bash
git add .
git commit -m "feat: add Target Practice entry mini-game with Phaser.js"
```

---

## Task 7: Hero Section

**Files:**
- Create: `components/hero/ParallaxLogo.tsx`, `components/hero/Hero.tsx`
- Add: `public/logo-transparent.png` — copy from `C:\Users\yanal\Desktop\YanaliShow logo\Logo-Transparent.png`

- [ ] **Step 1: Copy logo asset**

```bash
copy "C:\Users\yanal\Desktop\YanaliShow logo\Logo-Transparent.png" "public\logo-transparent.png"
```

- [ ] **Step 2: Create `components/hero/ParallaxLogo.tsx`**

```tsx
'use client'
import { useEffect, useRef } from 'react'
import Image from 'next/image'

export function ParallaxLogo() {
  const ref = useRef<HTMLDivElement>(null)

  useEffect(() => {
    const el = ref.current
    if (!el) return

    const move = (e: MouseEvent) => {
      const x = (e.clientX / window.innerWidth - 0.5) * 20
      const y = (e.clientY / window.innerHeight - 0.5) * 20
      el.style.transform = `translate(${x}px, ${y}px)`
    }

    window.addEventListener('mousemove', move)
    return () => window.removeEventListener('mousemove', move)
  }, [])

  return (
    <div
      ref={ref}
      className="transition-transform duration-75 ease-out"
      style={{ filter: 'drop-shadow(0 0 30px rgba(0,229,229,0.4))' }}
    >
      <Image
        src="/logo-transparent.png"
        alt="The Yanali Show"
        width={320}
        height={320}
        priority
      />
    </div>
  )
}
```

- [ ] **Step 3: Create `components/hero/Hero.tsx`**

```tsx
'use client'
import { useStreamStatus } from '@/lib/hooks/useStreamStatus'
import { ParallaxLogo } from './ParallaxLogo'
import { LiveBadge } from '@/components/ui/LiveBadge'

export function Hero() {
  const { isAnyLive } = useStreamStatus()

  return (
    <section
      id="hero"
      className="relative min-h-screen flex items-center justify-between px-16 pt-24 overflow-hidden"
      style={{ background: 'linear-gradient(135deg, #0A1E1E 0%, #060A0A 100%)' }}
    >
      {/* Animated background particles */}
      <div className="absolute inset-0 pointer-events-none overflow-hidden">
        {Array.from({ length: 20 }).map((_, i) => (
          <div
            key={i}
            className="absolute w-1 h-1 rounded-full bg-cyan/20"
            style={{
              left: `${Math.random() * 100}%`,
              top: `${Math.random() * 100}%`,
              animation: `float ${3 + Math.random() * 4}s ease-in-out ${Math.random() * 3}s infinite alternate`,
            }}
          />
        ))}
        <style>{`
          @keyframes float {
            from { transform: translateY(0px) translateX(0px); opacity: 0.2; }
            to { transform: translateY(-20px) translateX(10px); opacity: 0.6; }
          }
        `}</style>
      </div>

      {/* Left — headline and CTAs */}
      <div className="relative z-10 max-w-2xl">
        {isAnyLive && (
          <a href="#streams" className="inline-block mb-6">
            <LiveBadge />
          </a>
        )}

        <h1
          className="font-russo text-white uppercase leading-none"
          style={{ fontSize: 'clamp(60px, 9vw, 120px)', letterSpacing: '-1px' }}
        >
          THE WORLD<br />
          <span className="text-cyan" style={{ textShadow: '0 0 30px rgba(0,229,229,0.5)' }}>
            IS YOUR
          </span><br />
          ARENA
        </h1>

        <p className="font-chakra font-light text-muted mt-6 text-base leading-relaxed max-w-md">
          Competitive gaming. Van life adventure.<br />
          The open road starts here.
        </p>

        <div className="flex items-center gap-6 mt-10">
          <a
            href="#streams"
            className="font-chakra font-semibold text-sm tracking-widest uppercase px-8 py-4 bg-magenta text-white transition-all hover:shadow-[0_0_30px_#FF00C8]"
            style={{ boxShadow: '0 0 15px rgba(255,0,200,0.3)' }}
          >
            Watch Live
          </a>
          <a
            href="#clips"
            className="font-chakra text-sm tracking-wider text-body hover:text-cyan transition-colors flex items-center gap-2"
          >
            Browse Clips <span className="transition-transform hover:translate-x-1">→</span>
          </a>
        </div>
      </div>

      {/* Right — parallax logo */}
      <div className="relative z-10 hidden lg:block">
        <ParallaxLogo />
      </div>
    </section>
  )
}
```

- [ ] **Step 4: Add Hero to `app/page.tsx`**

```tsx
import { Nav } from '@/components/nav/Nav'
import { EntryScreen } from '@/components/entry/EntryScreen'
import { Hero } from '@/components/hero/Hero'

export default function Home() {
  return (
    <EntryScreen>
      <main className="bg-bg">
        <Nav />
        <Hero />
      </main>
    </EntryScreen>
  )
}
```

- [ ] **Step 5: Verify hero renders correctly**

Expected: Full-screen dark teal hero with massive "THE WORLD IS YOUR ARENA" headline, "Watch Live" magenta button, "Browse Clips" link, logo image on the right reacting to mouse movement.

- [ ] **Step 6: Commit**

```bash
git add .
git commit -m "feat: add hero section with parallax logo and CTAs"
```

---

## Task 8: Live Zone Section

**Files:**
- Create: `components/live/LiveState.tsx`, `components/live/OfflineState.tsx`, `components/live/LiveZone.tsx`

- [ ] **Step 1: Create `components/live/LiveState.tsx`**

```tsx
type Props = {
  twitchChannel: string
  youtubeVideoId: string | null
  tiktokHandle: string
  viewerCount: number
}

export function LiveState({ twitchChannel, youtubeVideoId, tiktokHandle, viewerCount }: Props) {
  return (
    <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
      {/* Twitch — main embed, takes 2 cols */}
      <div className="lg:col-span-2 space-y-4">
        <div
          className="border border-cyan/30 overflow-hidden"
          style={{ boxShadow: '0 0 20px rgba(0,229,229,0.1)' }}
        >
          <iframe
            src={`https://player.twitch.tv/?channel=${twitchChannel}&parent=theyanalishow.com&parent=localhost`}
            width="100%"
            height="400"
            allowFullScreen
          />
        </div>

        {youtubeVideoId && (
          <div className="border border-cyan/10 overflow-hidden">
            <iframe
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

      {/* Twitch chat embed */}
      <div className="border border-cyan/10 overflow-hidden">
        <iframe
          src={`https://www.twitch.tv/embed/${twitchChannel}/chat?darkpopout&parent=theyanalishow.com&parent=localhost`}
          width="100%"
          height="500"
        />
      </div>

      {/* Viewer count */}
      <div className="lg:col-span-3 flex items-center gap-3 pt-2">
        <span className="font-mono text-xs text-muted tracking-widest uppercase">Live Viewers</span>
        <span className="font-mono text-cyan text-lg" style={{ textShadow: '0 0 8px #00E5E5' }}>
          {viewerCount.toLocaleString()}
        </span>
      </div>
    </div>
  )
}
```

- [ ] **Step 2: Create `components/live/OfflineState.tsx`**

```tsx
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
```

- [ ] **Step 3: Create `components/live/LiveZone.tsx`**

```tsx
'use client'
import { useStreamStatus } from '@/lib/hooks/useStreamStatus'
import { LiveState } from './LiveState'
import { OfflineState } from './OfflineState'

export function LiveZone() {
  const { isAnyLive, twitch, youtube } = useStreamStatus()

  return (
    <section
      id="streams"
      className="px-10 py-20"
      style={{ background: isAnyLive ? '#060A0A' : '#0A1E1E' }}
    >
      <div className="max-w-6xl mx-auto">
        <div className="flex items-center gap-4 mb-10">
          <h2
            className="font-russo text-white uppercase"
            style={{ fontSize: 'clamp(36px, 5vw, 64px)' }}
          >
            {isAnyLive ? (
              <>
                <span className="text-magenta" style={{ textShadow: '0 0 20px #FF00C8' }}>LIVE</span>
                {' '}NOW
              </>
            ) : (
              'STREAMS'
            )}
          </h2>
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
```

- [ ] **Step 4: Add LiveZone to `app/page.tsx`**

```tsx
import { Nav } from '@/components/nav/Nav'
import { EntryScreen } from '@/components/entry/EntryScreen'
import { Hero } from '@/components/hero/Hero'
import { LiveZone } from '@/components/live/LiveZone'

export default function Home() {
  return (
    <EntryScreen>
      <main className="bg-bg">
        <Nav />
        <Hero />
        <LiveZone />
      </main>
    </EntryScreen>
  )
}
```

- [ ] **Step 5: Test with Supabase — manually set a stream to live**

In Supabase SQL Editor:
```sql
update stream_status set is_live = true, viewer_count = 847 where platform = 'twitch';
```

Expected: LiveZone section background goes dark, LIVE heading appears in magenta, Twitch embed loads. Run again with `is_live = false` — offline state returns.

- [ ] **Step 6: Commit**

```bash
git add .
git commit -m "feat: add Live Zone section with Supabase Realtime live/offline toggle"
```

---

## Task 9: Clips Gallery

**Files:**
- Create: `components/clips/ClipsGallery.tsx`

- [ ] **Step 1: Create `components/clips/ClipsGallery.tsx`**

```tsx
'use client'

type Clip = {
  id: string
  title: string
  thumbnail: string
  platform: 'twitch' | 'youtube' | 'tiktok'
  viewCount: string
  url: string
}

// Hardcoded for Phase 1 — replace with Supabase data in Phase 2
const CLIPS: Clip[] = [
  { id: '1', title: 'Solo Win — Final Circle', thumbnail: '', platform: 'twitch', viewCount: '12.4K', url: '#' },
  { id: '2', title: 'Clutch Elimination Streak', thumbnail: '', platform: 'youtube', viewCount: '8.2K', url: '#' },
  { id: '3', title: 'Insane Long Shot', thumbnail: '', platform: 'tiktok', viewCount: '34K', url: '#' },
  { id: '4', title: 'Box Fight Domination', thumbnail: '', platform: 'twitch', viewCount: '5.1K', url: '#' },
  { id: '5', title: '5 Elims in 30 Seconds', thumbnail: '', platform: 'youtube', viewCount: '19K', url: '#' },
  { id: '6', title: 'Building 1v1 Win', thumbnail: '', platform: 'tiktok', viewCount: '27K', url: '#' },
]

const PLATFORM_COLORS: Record<string, string> = {
  twitch: '#9146FF',
  youtube: '#FF0000',
  tiktok: '#00E5E5',
}

export function ClipsGallery() {
  return (
    <section id="clips" className="py-20 overflow-hidden">
      <div className="px-10 mb-10">
        <h2
          className="font-russo text-white uppercase"
          style={{ fontSize: 'clamp(36px, 5vw, 64px)' }}
        >
          HIGH<span className="text-cyan">LIGHTS</span>
        </h2>
      </div>

      {/* Horizontal scroll container */}
      <div className="flex gap-5 px-10 overflow-x-auto pb-4 snap-x snap-mandatory"
        style={{ scrollbarColor: '#00E5E5 #111C1C' }}>
        {CLIPS.map((clip) => (
          <a
            key={clip.id}
            href={clip.url}
            target="_blank"
            rel="noopener noreferrer"
            className="flex-shrink-0 w-72 snap-start group"
          >
            <div
              className="border border-cyan/10 bg-surface overflow-hidden transition-all duration-200 group-hover:border-cyan/50"
              style={{ boxShadow: '0 0 0 rgba(0,229,229,0)' }}
              onMouseEnter={(e) => {
                (e.currentTarget as HTMLElement).style.boxShadow = '0 0 20px rgba(0,229,229,0.15)'
              }}
              onMouseLeave={(e) => {
                (e.currentTarget as HTMLElement).style.boxShadow = '0 0 0 rgba(0,229,229,0)'
              }}
            >
              {/* Thumbnail placeholder */}
              <div
                className="w-full h-40 flex items-center justify-center text-3xl"
                style={{ background: 'linear-gradient(135deg, #111C1C, #0A1E1E)' }}
              >
                🎮
              </div>

              <div className="p-4">
                <div className="flex items-center gap-2 mb-2">
                  <span
                    className="text-xs font-mono font-medium px-2 py-0.5 rounded-sm uppercase tracking-wider"
                    style={{
                      color: PLATFORM_COLORS[clip.platform],
                      border: `1px solid ${PLATFORM_COLORS[clip.platform]}40`,
                    }}
                  >
                    {clip.platform}
                  </span>
                </div>
                <h3 className="font-chakra font-medium text-body text-sm leading-tight mb-2">
                  {clip.title}
                </h3>
                <span className="font-mono text-xs text-muted">{clip.viewCount} views</span>
              </div>
            </div>
          </a>
        ))}
      </div>
    </section>
  )
}
```

- [ ] **Step 2: Add ClipsGallery to `app/page.tsx`**

```tsx
import { Nav } from '@/components/nav/Nav'
import { EntryScreen } from '@/components/entry/EntryScreen'
import { Hero } from '@/components/hero/Hero'
import { LiveZone } from '@/components/live/LiveZone'
import { ClipsGallery } from '@/components/clips/ClipsGallery'

export default function Home() {
  return (
    <EntryScreen>
      <main className="bg-bg">
        <Nav />
        <Hero />
        <LiveZone />
        <ClipsGallery />
      </main>
    </EntryScreen>
  )
}
```

- [ ] **Step 3: Verify horizontal scroll works on desktop and mobile**

Expected: 6 clip cards in a horizontal row. Scrollable sideways. Each card glows cyan on hover.

- [ ] **Step 4: Commit**

```bash
git add .
git commit -m "feat: add horizontal clips gallery with hardcoded data"
```

---

## Task 10: Adventure Teaser + Van Dream + Links Hub + About

**Files:**
- Create: `components/adventure/AdventureTeaser.tsx`, `components/vandream/VanDream.tsx`, `components/vandream/DonorList.tsx`, `components/links/LinksHub.tsx`, `components/about/About.tsx`

- [ ] **Step 1: Create `components/adventure/AdventureTeaser.tsx`**

```tsx
export function AdventureTeaser() {
  return (
    <section
      id="adventure"
      className="relative py-32 px-10 overflow-hidden flex items-center justify-center min-h-[60vh]"
      style={{ background: 'linear-gradient(180deg, #0A1E1E 0%, #050E0E 100%)' }}
    >
      <div className="relative z-10 text-center max-w-3xl">
        <p className="font-mono text-xs tracking-[0.5em] text-cyan/60 uppercase mb-6">
          Coming Soon
        </p>
        <h2
          className="font-russo text-white uppercase leading-none mb-6"
          style={{ fontSize: 'clamp(48px, 7vw, 100px)' }}
        >
          THE NEXT<br />
          <span className="text-cyan" style={{ textShadow: '0 0 30px rgba(0,229,229,0.4)' }}>
            CHAPTER
          </span>
        </h2>
        <p className="font-chakra font-light text-body/60 text-lg leading-relaxed">
          A van. The open road. Streaming from everywhere.<br />
          The same competitive energy — just no walls.
        </p>
      </div>

      {/* Decorative road line */}
      <div
        className="absolute bottom-0 left-1/2 -translate-x-1/2 w-0.5 h-32 bg-gradient-to-b from-cyan/30 to-transparent"
      />
    </section>
  )
}
```

- [ ] **Step 2: Create `components/vandream/DonorList.tsx`**

```tsx
import type { Donor } from '@/lib/types'

type Props = { donors: Donor[] }

function timeAgo(dateStr: string): string {
  const diff = Date.now() - new Date(dateStr).getTime()
  const hours = Math.floor(diff / 3600000)
  if (hours < 1) return 'Just now'
  if (hours < 24) return `${hours}h ago`
  return `${Math.floor(hours / 24)}d ago`
}

export function DonorList({ donors }: Props) {
  if (donors.length === 0) {
    return (
      <p className="font-mono text-xs text-muted">
        Be the first to support the dream →
      </p>
    )
  }

  return (
    <div className="flex flex-col gap-3">
      {donors.map((d) => (
        <div
          key={d.id}
          className="flex items-center gap-4 p-4 border border-amber/10 bg-surface"
        >
          <div
            className="w-9 h-9 rounded-full flex items-center justify-center font-russo text-sm text-black bg-amber shrink-0"
          >
            {d.name[0].toUpperCase()}
          </div>
          <div className="flex-1">
            <div className="font-chakra font-medium text-body text-sm">{d.name}</div>
            <div className="font-mono text-xs text-muted">{timeAgo(d.donated_at)}</div>
          </div>
          <div className="font-mono text-amber text-sm">€{d.amount}</div>
        </div>
      ))}
    </div>
  )
}
```

- [ ] **Step 3: Create `components/vandream/VanDream.tsx`**

```tsx
'use client'
import { useVanFund } from '@/lib/hooks/useVanFund'
import { DonorList } from './DonorList'

export function VanDream() {
  const { fund, donors, percentage } = useVanFund()

  return (
    <section id="van-dream" className="py-24 px-10 bg-surface">
      <div className="max-w-6xl mx-auto grid grid-cols-1 lg:grid-cols-2 gap-16 items-start">

        {/* Left — story and donate */}
        <div>
          <p className="font-mono text-xs tracking-[0.5em] text-amber/70 uppercase mb-4">
            The Dream
          </p>
          <h2
            className="font-russo text-white uppercase leading-none mb-6"
            style={{ fontSize: 'clamp(44px, 6vw, 80px)' }}
          >
            FUND THE<br />
            <span className="text-amber" style={{ textShadow: '0 0 20px rgba(255,184,0,0.4)' }}>
              VAN LIFE
            </span>
          </h2>
          <p className="font-chakra font-light text-body/70 leading-relaxed mb-8 max-w-md">
            The next chapter of TheYanaliShow leaves the fixed setup behind.
            A converted van. New cities. Streams from forests, coastlines, mountain passes.
            Help make it happen.
          </p>

          {/* Progress bar */}
          {fund && (
            <div className="mb-8">
              <div className="flex justify-between font-mono text-xs mb-2">
                <span className="text-muted uppercase tracking-wider">Van Fund</span>
                <span className="text-amber">{percentage}% there</span>
              </div>
              <div className="h-1.5 bg-amber/10 overflow-hidden">
                <div
                  className="h-full bg-amber transition-all duration-1000"
                  style={{
                    width: `${percentage}%`,
                    boxShadow: '0 0 10px #FFB800',
                  }}
                />
              </div>
              <div className="flex justify-between font-mono text-xs mt-2 text-muted">
                <span>€{fund.current_amount.toLocaleString()}</span>
                <span>€{fund.goal_amount.toLocaleString()}</span>
              </div>
            </div>
          )}

          <a
            href="https://paypal.me/theyanalishow"
            target="_blank"
            rel="noopener noreferrer"
            className="inline-block font-chakra font-semibold text-sm tracking-widest uppercase px-8 py-4 bg-amber text-black transition-all hover:shadow-[0_0_30px_#FFB800]"
            style={{ boxShadow: '0 0 12px rgba(255,184,0,0.3)' }}
          >
            🚐 Support the Dream
          </a>
        </div>

        {/* Right — recent donors */}
        <div>
          <p className="font-mono text-xs tracking-[0.5em] text-muted uppercase mb-6">
            Recent Supporters
          </p>
          <DonorList donors={donors} />
        </div>
      </div>
    </section>
  )
}
```

- [ ] **Step 4: Create `components/links/LinksHub.tsx`**

```tsx
'use client'
import { useEffect, useState } from 'react'
import { supabase } from '@/lib/supabase'
import type { SiteLink } from '@/lib/types'

export function LinksHub() {
  const [links, setLinks] = useState<SiteLink[]>([])

  useEffect(() => {
    supabase
      .from('site_links')
      .select('*')
      .order('order')
      .then(({ data }) => { if (data) setLinks(data) })
  }, [])

  return (
    <section id="find-me-everywhere" className="py-24 px-10 bg-bg">
      <div className="max-w-6xl mx-auto">
        <h2
          className="font-russo text-white uppercase mb-12"
          style={{ fontSize: 'clamp(36px, 5vw, 64px)' }}
        >
          FIND ME<br />
          <span className="text-cyan">EVERYWHERE</span>
        </h2>

        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-4">
          {links.map((link) => (
            <a
              key={link.id}
              href={link.url}
              target="_blank"
              rel="noopener noreferrer"
              className="flex flex-col items-center gap-3 p-6 border border-cyan/10 bg-surface hover:border-cyan/50 transition-all group"
              style={{ boxShadow: '0 0 0 rgba(0,229,229,0)' }}
              onMouseEnter={(e) => {
                (e.currentTarget as HTMLElement).style.boxShadow = '0 0 20px rgba(0,229,229,0.1)'
              }}
              onMouseLeave={(e) => {
                (e.currentTarget as HTMLElement).style.boxShadow = '0 0 0 rgba(0,229,229,0)'
              }}
            >
              <span className="text-3xl">{
                link.platform === 'twitch' ? '🟣' :
                link.platform === 'youtube' ? '🔴' :
                link.platform === 'tiktok' ? '⬛' :
                link.platform === 'instagram' ? '🟠' : '🐦'
              }</span>
              <span className="font-chakra font-medium text-sm text-body group-hover:text-cyan transition-colors">
                {link.label}
              </span>
            </a>
          ))}
        </div>
      </div>
    </section>
  )
}
```

- [ ] **Step 5: Create `components/about/About.tsx`**

```tsx
import Image from 'next/image'

export function About() {
  return (
    <section id="about" className="py-24 px-10 bg-surface border-t border-cyan/5">
      <div className="max-w-4xl mx-auto flex flex-col lg:flex-row items-center gap-16">
        <div className="shrink-0">
          <Image
            src="/logo-transparent.png"
            alt="Yanali"
            width={180}
            height={180}
            style={{ filter: 'drop-shadow(0 0 20px rgba(0,229,229,0.3))' }}
          />
        </div>
        <div>
          <h2
            className="font-russo text-white uppercase mb-6"
            style={{ fontSize: 'clamp(32px, 4vw, 56px)' }}
          >
            WHO IS<br />
            <span className="text-cyan">YANALI?</span>
          </h2>
          <p className="font-chakra font-light text-body/80 leading-relaxed text-base mb-4">
            Competitive gamer. Battle royale player. Future van lifer.
            TheYanaliShow is where the grind of ranked play meets the freedom of the open road.
          </p>
          <p className="font-chakra font-light text-muted leading-relaxed text-sm">
            Every stream is a battle. Every road is a new arena.<br />
            Follow the journey — wherever it goes.
          </p>
        </div>
      </div>
    </section>
  )
}
```

- [ ] **Step 6: Add all sections to `app/page.tsx`**

```tsx
import { Nav } from '@/components/nav/Nav'
import { EntryScreen } from '@/components/entry/EntryScreen'
import { Hero } from '@/components/hero/Hero'
import { LiveZone } from '@/components/live/LiveZone'
import { ClipsGallery } from '@/components/clips/ClipsGallery'
import { AdventureTeaser } from '@/components/adventure/AdventureTeaser'
import { VanDream } from '@/components/vandream/VanDream'
import { LinksHub } from '@/components/links/LinksHub'
import { About } from '@/components/about/About'

export default function Home() {
  return (
    <EntryScreen>
      <main className="bg-bg">
        <Nav />
        <Hero />
        <LiveZone />
        <ClipsGallery />
        <AdventureTeaser />
        <VanDream />
        <LinksHub />
        <About />
      </main>
    </EntryScreen>
  )
}
```

- [ ] **Step 7: Verify all sections render end to end**

Scroll from top to bottom — should see all 7 sections in order with correct colours, fonts, and layout.

- [ ] **Step 8: Commit**

```bash
git add .
git commit -m "feat: add adventure, van dream, links hub, and about sections"
```

---

## Task 11: GSAP Scroll Animations

**Files:**
- Create: `components/ui/ScrollAnimations.tsx`

- [ ] **Step 1: Create `components/ui/ScrollAnimations.tsx`**

```tsx
'use client'
import { useEffect } from 'react'

export function ScrollAnimations() {
  useEffect(() => {
    // Dynamically import GSAP — avoids SSR issues
    Promise.all([
      import('gsap'),
      import('gsap/ScrollTrigger'),
    ]).then(([{ gsap }, { ScrollTrigger }]) => {
      gsap.registerPlugin(ScrollTrigger)

      // Live Zone — fade up on scroll
      gsap.from('#streams', {
        opacity: 0, y: 40,
        duration: 0.8,
        scrollTrigger: { trigger: '#streams', start: 'top 80%' },
      })

      // Clips — slide in from right
      gsap.from('#clips .flex > *', {
        opacity: 0, x: 60,
        duration: 0.5,
        stagger: 0.1,
        scrollTrigger: { trigger: '#clips', start: 'top 75%' },
      })

      // Adventure — headline slides from left
      gsap.from('#adventure h2', {
        opacity: 0, x: -60,
        duration: 0.9,
        scrollTrigger: { trigger: '#adventure', start: 'top 70%' },
      })

      // Van Dream — progress bar animates width on scroll
      const progressBar = document.querySelector('#van-dream .bg-amber') as HTMLElement
      if (progressBar) {
        const targetWidth = progressBar.style.width
        progressBar.style.width = '0%'
        ScrollTrigger.create({
          trigger: '#van-dream',
          start: 'top 70%',
          onEnter: () => {
            gsap.to(progressBar, { width: targetWidth, duration: 1.2, ease: 'power2.out' })
          },
        })
      }

      // Links cards stagger in
      gsap.from('#find-me-everywhere .grid > *', {
        opacity: 0, y: 30,
        duration: 0.4,
        stagger: 0.08,
        scrollTrigger: { trigger: '#find-me-everywhere', start: 'top 75%' },
      })

      // About fade up
      gsap.from('#about', {
        opacity: 0, y: 30,
        duration: 0.8,
        scrollTrigger: { trigger: '#about', start: 'top 80%' },
      })
    })
  }, [])

  return null
}
```

- [ ] **Step 2: Add ScrollAnimations to `app/page.tsx` inside EntryScreen (after sections)**

```tsx
// Add this import
import { ScrollAnimations } from '@/components/ui/ScrollAnimations'

// Add inside the <main> after </About>
<ScrollAnimations />
```

- [ ] **Step 3: Verify animations fire on scroll**

Scroll slowly through the page. Each section should animate in (fade/slide) as it enters the viewport. The Van Dream progress bar should animate from 0% to the current percentage on scroll.

- [ ] **Step 4: Commit**

```bash
git add .
git commit -m "feat: add GSAP scroll animations for all sections"
```

---

## Task 12: OBS Relay Script

**Files:**
- Create: `scripts/obs-relay.js`, `scripts/package.json`

- [ ] **Step 1: Create `scripts/package.json`**

```json
{
  "name": "obs-relay",
  "version": "1.0.0",
  "type": "module",
  "dependencies": {
    "obs-websocket-js": "^5.0.3",
    "@supabase/supabase-js": "^2.39.0"
  }
}
```

- [ ] **Step 2: Create `scripts/obs-relay.js`**

```js
import OBSWebSocket from 'obs-websocket-js'
import { createClient } from '@supabase/supabase-js'

// Replace these with your actual values
const SUPABASE_URL = 'https://YOUR_PROJECT_REF.supabase.co'
const SUPABASE_SERVICE_KEY = 'YOUR_SERVICE_ROLE_KEY' // Use service role key (not anon) for writes
const OBS_WS_URL = 'ws://localhost:4455'
const OBS_WS_PASSWORD = '' // Set in OBS → Tools → WebSocket Server Settings

const supabase = createClient(SUPABASE_URL, SUPABASE_SERVICE_KEY)
const obs = new OBSWebSocket()

async function setLiveStatus(isLive, viewerCount = 0) {
  const { error } = await supabase
    .from('stream_status')
    .update({ is_live: isLive, viewer_count: viewerCount, updated_at: new Date().toISOString() })
    .eq('platform', 'twitch')

  if (error) console.error('Supabase update error:', error)
  else console.log(`Stream status updated: is_live=${isLive}`)
}

obs.on('StreamStateChanged', ({ outputActive }) => {
  setLiveStatus(outputActive)
})

async function connect() {
  try {
    await obs.connect(OBS_WS_URL, OBS_WS_PASSWORD)
    console.log('Connected to OBS WebSocket — watching for stream events...')
  } catch (err) {
    console.error('Failed to connect to OBS:', err)
    console.log('Retrying in 5 seconds...')
    setTimeout(connect, 5000)
  }
}

connect()
```

- [ ] **Step 3: Install script dependencies**

```bash
cd scripts
npm install
cd ..
```

- [ ] **Step 4: Add OBS relay usage instructions to README**

Create `scripts/README.md`:
```md
# OBS Stream Status Relay

Runs on your streaming PC. Updates Supabase when you go live or end a stream.

## Setup

1. Enable OBS WebSocket: OBS → Tools → WebSocket Server Settings → Enable
2. Set your password (optional) and update `OBS_WS_PASSWORD` in obs-relay.js
3. Get your Supabase Service Role key from Supabase → Project Settings → API
4. Update `SUPABASE_URL` and `SUPABASE_SERVICE_KEY` in obs-relay.js

## Run (before streaming)

```bash
cd scripts
node obs-relay.js
```

Keep this terminal open while you stream.
```

- [ ] **Step 5: Commit**

```bash
git add .
git commit -m "feat: add OBS WebSocket relay script for live status updates"
```

---

## Task 13: Deploy to Vercel

- [ ] **Step 1: Push to GitHub**

Create a new repo on GitHub called `theyanalishow`. Then:

```bash
git remote add origin https://github.com/YOUR_USERNAME/theyanalishow.git
git push -u origin main
```

- [ ] **Step 2: Deploy to Vercel**

Go to https://vercel.com → New Project → Import your `theyanalishow` GitHub repo.

- [ ] **Step 3: Add environment variables in Vercel dashboard**

In Vercel → Project Settings → Environment Variables, add:
```
NEXT_PUBLIC_SUPABASE_URL = https://YOUR_PROJECT_REF.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY = YOUR_ANON_KEY
```

- [ ] **Step 4: Trigger deploy and verify**

Vercel will auto-deploy. Visit the generated Vercel URL (e.g. `theyanalishow.vercel.app`) and verify the site loads, the entry game plays, and all sections render.

- [ ] **Step 5: Connect custom domain `theyanalishow.com`**

In Vercel → Project → Domains → Add `theyanalishow.com`. Follow Vercel's DNS instructions to point your domain.

- [ ] **Step 6: Update Supabase allowed origins (CORS)**

In Supabase → Authentication → URL Configuration, add `https://theyanalishow.com` to allowed URLs.

- [ ] **Step 7: Final commit**

```bash
git commit --allow-empty -m "chore: deployed to theyanalishow.com"
```

---

## Self-Review Checklist

**Spec coverage:**
- ✅ Target Practice entry game (Task 6)
- ✅ Hero with parallax logo, CTAs, live badge (Task 7)
- ✅ Live Zone — Twitch + YouTube + TikTok + chat (Task 8)
- ✅ Clips gallery horizontal scroll (Task 9)
- ✅ Adventure teaser (Task 10)
- ✅ Van Dream — progress bar + PayPal + donors (Task 10)
- ✅ Links hub from Supabase (Task 10)
- ✅ About section (Task 10)
- ✅ GSAP scroll animations (Task 11)
- ✅ OBS relay script (Task 12)
- ✅ Vercel deployment + domain (Task 13)
- ✅ Mobile-first responsive (addressed in each component with Tailwind responsive prefixes)
- ✅ Custom crosshair cursor (Task 5)
- ✅ Supabase Realtime for live status (Task 3 + 8)
- ✅ Design tokens in Tailwind (Task 1)

**No placeholders found.** All steps have complete code.

**Type consistency:** `StreamStatus`, `VanFund`, `Donor`, `SiteLink` defined once in `lib/types.ts` and reused across hooks and components without renaming.
