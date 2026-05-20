# TheYanaliShow — Public Site Design Spec
**Date:** 2026-05-20
**Phase:** 1 — Public-facing site only
**Domain:** theyanalishow.com

---

## 1. Project Overview

TheYanaliShow is a lifestyle and entertainment brand built around Yanal — a streamer on Twitch, YouTube, TikTok, and YouTube Shorts who also plans to buy and convert a van to stream from the road. The brand spans competitive gaming (Fortnite, battle royales — playing to win, not just for fun) and van life adventure travel (living on the road full-time, streaming from wherever the van stops).

**Core concept:** *"The world is your arena"* — the same energy that wins a battle royale drives the open road.

**Phase 1 scope:** Public-facing website only. No login, no dashboard, no video upload tools. Those come in Phase 2.

---

## 2. Goals

- Give fans one place to find all links, watch live streams, and follow the journey
- Create an entry experience so impressive that visitors tell others about the site
- Build emotional investment in the Van Dream so fans want to donate
- Give a reason to come back every stream day (the live section transforms when live)

---

## 3. Architecture

**Framework:** Next.js (App Router) deployed on Vercel
**Database/Backend:** Supabase (fresh project — never reuse existing projects)
**Styling:** Tailwind CSS + custom CSS for animations
**Animations:** GSAP + ScrollTrigger
**Entry experience:** Phaser.js (mini-game) or Three.js (3D) — decided during implementation
**Audio:** Howler.js
**Motion library:** Motion (Framer Motion) — already installed globally

**Supabase tables needed for Phase 1:**
- `stream_status` — `{ platform: string, is_live: boolean, stream_url: string, viewer_count: number, updated_at: timestamp }`
- `van_fund` — `{ goal_amount: number, current_amount: number, updated_at: timestamp }`
- `recent_donors` — `{ name: string, amount: number, donated_at: timestamp }`
- `site_links` — `{ platform: string, label: string, url: string, icon: string, order: number }`

**Stream status detection:**
A small Node.js script runs on Yanal's streaming PC. It connects to OBS WebSocket (local) and on every `StreamStateChanged` event, it POSTs to a Supabase table. The public site reads this table via Supabase Realtime and shows/hides the live section instantly.

**No authentication required for Phase 1** — everything is public read-only.

---

## 4. Design System

### Colors
| Role | Hex | Usage |
|------|-----|-------|
| Background primary | `#0A1E1E` | Main page background — matches logo scene |
| Background surface | `#111C1C` | Cards, panels, sections |
| Background deep | `#060A0A` | Hero overlay, darkest areas |
| Brand / Neon cyan | `#00E5E5` | Logo color, borders, glows, active states |
| Brand glow | `#00FFEF` | Hover states, animated glow variant |
| CTA / Live | `#FF00C8` | Watch Live button ONLY — one hot focal point |
| Body text | `#C8D8D8` | All readable text |
| Muted text | `#4A7070` | Captions, labels, secondary info |
| Highlight / badges | `#FFB800` | Van fund progress, donation amounts, tier badges |

### Typography
| Role | Font | Weight | Usage |
|------|------|--------|-------|
| Display / Hero | Russo One | 400 (single weight) | Section headings, hero text |
| Body / UI | Chakra Petch | 300, 400, 500, 600 | All body copy, nav, buttons |
| HUD / Stats | JetBrains Mono | 400, 500 | Live viewer count, fund %, coordinates |

All fonts loaded via Google Fonts.

### Logo
Cartoon illustrated character: bearded man with black headphones (teal accent), holding a game controller, making a "rock on" hand gesture. "THE YANALI SHOW" arcs around in neon cyan glow. Use as-is from provided PNG assets.

---

## 5. Page Structure — Seven Sections

### Section 1: Entry / Hero
**Purpose:** Wow the visitor in the first 5 seconds. Make the page feel alive.

**Entry mechanic: Target Practice**
3–5 targets pop up on a dark screen, user shoots them by clicking. Each hit: particle burst + screen shake + sound. After all targets hit, particles reassemble into the "THE YANALI SHOW" wordmark. Site hero snaps into view. Skippable on return visits (ESC or "skip intro" link).

**After entry (or on return visits — skip intro):**
- Full-screen background: dark teal `#0A1E1E` with subtle animated particles
- Logo character in parallax — the illustrated Yanali reacts slightly to mouse movement
- Headline: "THE WORLD IS YOUR ARENA" in Russo One, massive
- Subline: "Gaming. Adventure. The open road." in Chakra Petch
- Two CTAs: magenta "Watch Live" button + white "Browse Clips" text link
- Cyan neon glow pulses on the logo ring
- Custom crosshair cursor with subtle particle trail on click

**Behaviour when live:** A pulsing "LIVE NOW" badge appears over the hero. Clicking it scrolls to the Live Zone section.

---

### Section 2: Live Zone
**Purpose:** Show the stream when live. Show schedule/last stream when offline.

**When LIVE:**
- Section background shifts to `#060A0A` (deeper dark) with a live energy feel
- Twitch embed (left, large) — official iframe with `parent=theyanalishow.com`
- Twitch chat embed (right, scrolling)
- YouTube embed below Twitch (smaller, secondary)
- TikTok: styled "Watch on TikTok" button linking to `tiktok.com/@theyanalishow/live`
- Live viewer count from Supabase `stream_status` table, displayed in JetBrains Mono
- Cyan border glow pulses on the active stream card

**When OFFLINE:**
- Next stream schedule (date + time)
- Last stream VOD embed or thumbnail
- "Get notified" links to Twitch follow + YouTube subscribe

**Data source:** Supabase Realtime subscription to `stream_status` table. No polling.

---

### Section 3: Clips Gallery
**Purpose:** Show the best gaming highlights. Keep fans entertained when offline.

- Horizontal scroll panel (GSAP ScrollTrigger horizontal)
- 6–10 clip cards, each showing: thumbnail, title, platform badge, view count
- Clips are hardcoded initially, later pulled from Supabase in Phase 2
- Hover: cyan border glow + slight scale up
- Click: opens clip in a modal or links to the platform
- Section headline: "HIGHLIGHTS" in Russo One

---

### Section 4: Adventure Teaser
**Purpose:** Introduce the van life chapter. Build anticipation for what's coming.

- Full-bleed section with a dark atmospheric background (travel/road imagery)
- Parallax depth on background image via GSAP ScrollTrigger
- Headline: "THE NEXT CHAPTER" in Russo One
- Subtext: "A van. The open road. Streaming from everywhere." in Chakra Petch
- A "Coming Soon" energy — no specific features yet, just the vision
- Connects emotionally to the Van Dream section below

---

### Section 5: Van Dream — Donation
**Purpose:** Convert the adventure story into emotional action. Get people to donate.

- Opens with the story: why the van, what it means, what changes
- Goal progress bar: `current_amount / goal_amount` from Supabase `van_fund` table
- Progress bar styled in neon amber `#FFB800` with glow
- "X% there" displayed in JetBrains Mono
- Donate CTA button in amber (different from the magenta Live CTA — this is warmer)
- Donation platform: PayPal donate link
- Recent donors list: pulled from `recent_donors` table — name + amount + time ago
- Donors displayed as small cards with avatar initial, name, amount

---

### Section 6: Links Hub
**Purpose:** One place to find every platform.

- Clean grid of platform cards
- Each card: platform icon + label + follower count (optional)
- Platforms: Twitch, YouTube, TikTok, Instagram, Twitter/X
- Hover: cyan glow border
- Data pulled from `site_links` Supabase table so Yanal can update without touching code
- Headline: "FIND ME EVERYWHERE" in Russo One

---

### Section 7: About
**Purpose:** Brief human connection — who is Yanali.

- Short paragraph: who he is, what the show is about, the gaming + adventure vision
- Photo or illustrated version of the logo character
- Closing line that ties gaming and adventure together
- Simple, warm — the one section that doesn't need to be intense

---

## 6. Scroll Experience

The page is a continuous scroll experience. Each section has a GSAP ScrollTrigger reveal:

| Section | Entry animation |
|---------|----------------|
| Hero | Immediate — alive from load |
| Live Zone | Fades in with slight upward slide |
| Clips | Horizontal scroll panel activates on pin |
| Adventure | Parallax background + headline slides in from left |
| Van Dream | Progress bar animates to current % on scroll into view |
| Links Hub | Cards stagger in one by one |
| About | Simple fade up |

Scroll is natural (no scroll hijacking). Sections snap into view gracefully, not forcefully.

---

## 7. Responsive Behaviour

- Mobile-first design
- Live Zone on mobile: stacked vertically, Twitch embed full width, chat below
- Clips Gallery on mobile: vertical scroll instead of horizontal
- Hero on mobile: entry mechanic simplified or replaced with auto-playing animation
- All font sizes scale with `clamp()` — readable at all sizes

---

## 8. OBS Stream Status Relay Script

A Node.js script (`obs-relay.js`) runs on Yanal's streaming PC on stream days:

1. Connects to OBS WebSocket (localhost:4455, the default port for OBS 28+)
2. Listens for `StreamStateChanged` events
3. On `OBS_WEBSOCKET_OUTPUT_STARTED`: updates Supabase `stream_status` table — `is_live = true`
4. On `OBS_WEBSOCKET_OUTPUT_STOPPED`: updates `is_live = false`
5. The public site's Supabase Realtime subscription fires instantly — Live Zone shows or hides

Script is run manually before streaming: `node obs-relay.js`

---

## 9. Out of Scope for Phase 1

- User login / authentication
- Private dashboard
- Clip upload to TikTok / Instagram / YouTube
- Team roles (owner / editor)
- Analytics
- Multi-language support
- Blog / written content

---

## 10. Tech Stack Summary

| Layer | Tool | Purpose |
|-------|------|---------|
| Framework | Next.js (App Router) | SSR, routing, API routes |
| Hosting | Vercel | Deployment, edge network |
| Database | Supabase (new project) | Stream status, van fund, links, donors |
| Realtime | Supabase Realtime | Live/offline detection without polling |
| Animations | GSAP + ScrollTrigger | All scroll-driven animations |
| Entry game | Phaser.js or Three.js | Interactive landing experience |
| Motion | Motion (Framer Motion) | Component-level UI animations |
| Audio | Howler.js | Entry sequence sounds, hit effects |
| Fonts | Google Fonts | Russo One, Chakra Petch, JetBrains Mono |
| Stream relay | Node.js + obs-websocket-js | OBS → Supabase bridge |
| UI/UX skill | uipro-cli | Design system guidance |
| Design intelligence | @21st-dev/magic MCP | Component generation assistance |
