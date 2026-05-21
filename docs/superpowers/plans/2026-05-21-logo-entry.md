# Logo Entry Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Replace the Phaser.js Target Practice mini-game with a logo-tap entry — logo centered on screen, hover glow, click fires shockwave burst transition into the site.

**Architecture:** Drop-in component swap inside the existing `EntryScreen` state machine (`loading → game → done`). `TargetPractice` is deleted, `LogoEntry` takes its place receiving the same `onComplete` prop. Animations live in `globals.css` to keep the TSX clean. No new dependencies needed.

**Tech Stack:** React 19, Next.js 16 App Router, Tailwind v4, plain CSS keyframes (no Phaser, no GSAP)

---

## File Map

| File | Action | Responsibility |
|------|--------|----------------|
| `public/logo.png` | CREATE | Logo asset served statically |
| `app/globals.css` | EDIT | Keyframe animations + hover states for logo entry |
| `components/entry/LogoEntry.tsx` | CREATE | Full-screen logo button + shockwave transition |
| `components/entry/EntryScreen.tsx` | EDIT | Swap `TargetPractice` import → `LogoEntry` |
| `components/entry/TargetPractice.tsx` | DELETE | No longer used |
| `package.json` | EDIT | Remove `phaser` dependency |

---

## Task 1: Copy Logo to public/

**Files:**
- Create: `public/logo.png`

- [ ] **Step 1: Copy the logo file**

Run in PowerShell:
```powershell
Copy-Item "C:\Users\yanal\Desktop\YanaliShow logo\Logo-Transparent.png" "C:\Users\yanal\Desktop\Coding Projects\theyanalishow\public\logo.png"
```

- [ ] **Step 2: Verify it landed**

```powershell
Get-Item "C:\Users\yanal\Desktop\Coding Projects\theyanalishow\public\logo.png" | Select-Object Name, Length
```
Expected: `logo.png` with size > 0.

- [ ] **Step 3: Commit**

```bash
git add public/logo.png
git commit -m "feat: add logo to public assets"
```

---

## Task 2: Add Logo Entry CSS to globals.css

**Files:**
- Modify: `app/globals.css`

- [ ] **Step 1: Append the following CSS block to the end of `app/globals.css`**

```css
/* ── Logo Entry ────────────────────────────────────────────────── */

.logo-entry-btn {
  cursor: pointer !important;
  background: transparent;
  border: none;
  padding: 0;
  position: relative;
  display: flex;
  align-items: center;
  justify-content: center;
  will-change: transform;
}

.logo-ring {
  position: absolute;
  border-radius: 50%;
  border: 1px solid transparent;
  pointer-events: none;
  transition: border-color 350ms ease, box-shadow 350ms ease, transform 350ms ease;
}

.logo-ring-1 {
  inset: 0;
  border-color: rgba(0, 229, 229, 0.3);
  box-shadow:
    0 0 20px rgba(0, 229, 229, 0.08),
    inset 0 0 20px rgba(0, 229, 229, 0.04);
  animation: logo-breathe 2.8s ease-in-out infinite;
}

.logo-ring-2 {
  inset: -20px;
  border-color: rgba(0, 229, 229, 0.12);
  animation: logo-breathe 2.8s ease-in-out infinite 0.3s;
}

.logo-ring-3 {
  inset: -44px;
  border-color: rgba(0, 229, 229, 0.06);
  animation: logo-breathe 2.8s ease-in-out infinite 0.6s;
}

.logo-orbit {
  position: absolute;
  border-radius: 50%;
  inset: -26px;
  pointer-events: none;
  animation: logo-spin 14s linear infinite;
}

.logo-orbit-dot {
  position: absolute;
  top: -4px;
  left: 50%;
  transform: translateX(-50%);
  width: 7px;
  height: 7px;
  background: #00E5E5;
  border-radius: 50%;
  box-shadow: 0 0 10px #00E5E5, 0 0 20px rgba(0, 229, 229, 0.4);
  transition: box-shadow 350ms ease, background 350ms ease;
}

.logo-entry-img {
  filter:
    drop-shadow(0 0 16px rgba(0, 229, 229, 0.28))
    drop-shadow(0 0 40px rgba(0, 229, 229, 0.12));
  transition:
    transform 350ms cubic-bezier(0.34, 1.56, 0.64, 1),
    filter 350ms ease;
  will-change: transform, filter;
}

.logo-enter-hint {
  position: absolute;
  bottom: -40px;
  left: 50%;
  transform: translateX(-50%);
  opacity: 0;
  white-space: nowrap;
  transition: opacity 300ms ease, letter-spacing 350ms ease;
  pointer-events: none;
}

/* Hover states */
.logo-entry-btn:hover .logo-entry-img {
  transform: scale(1.08);
  filter:
    drop-shadow(0 0 28px rgba(0, 229, 229, 0.65))
    drop-shadow(0 0 60px rgba(0, 229, 229, 0.35))
    drop-shadow(0 0 90px rgba(0, 229, 229, 0.15))
    brightness(1.08);
}

.logo-entry-btn:hover .logo-ring-1 {
  border-color: rgba(0, 229, 229, 0.7);
  box-shadow:
    0 0 30px rgba(0, 229, 229, 0.25),
    0 0 60px rgba(0, 229, 229, 0.1),
    inset 0 0 30px rgba(0, 229, 229, 0.1);
}

.logo-entry-btn:hover .logo-ring-2 {
  border-color: rgba(0, 229, 229, 0.3);
  transform: scale(1.04);
}

.logo-entry-btn:hover .logo-ring-3 {
  border-color: rgba(0, 229, 229, 0.14);
  transform: scale(1.06);
}

.logo-entry-btn:hover .logo-orbit-dot {
  background: #00FFEF;
  box-shadow:
    0 0 16px #00FFEF,
    0 0 32px rgba(0, 255, 239, 0.6),
    0 0 60px rgba(0, 229, 229, 0.3);
}

.logo-entry-btn:hover .logo-enter-hint {
  opacity: 1;
  letter-spacing: 6px;
}

@keyframes logo-breathe {
  0%, 100% { transform: scale(1); opacity: 1; }
  50% { transform: scale(1.025); opacity: 0.6; }
}

@keyframes logo-spin {
  from { transform: rotate(0deg); }
  to { transform: rotate(360deg); }
}

@media (prefers-reduced-motion: reduce) {
  .logo-entry-img,
  .logo-ring,
  .logo-orbit-dot,
  .logo-enter-hint { transition: none; }
  .logo-orbit,
  .logo-ring-1,
  .logo-ring-2,
  .logo-ring-3 { animation: none; }
}
```

- [ ] **Step 2: Commit**

```bash
git add app/globals.css
git commit -m "feat: add logo entry CSS animations"
```

---

## Task 3: Create LogoEntry.tsx

**Files:**
- Create: `components/entry/LogoEntry.tsx`

- [ ] **Step 1: Create the file with this exact content**

```tsx
'use client'
import { useEffect, useRef, useCallback } from 'react'

type Props = { onComplete: () => void }

export function LogoEntry({ onComplete }: Props) {
  const containerRef = useRef<HTMLDivElement>(null)
  const firedRef = useRef(false)
  const mountedRef = useRef(true)

  useEffect(() => {
    mountedRef.current = true
    if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) {
      onComplete()
    }
    return () => { mountedRef.current = false }
  }, [onComplete])

  const fireTransition = useCallback(() => {
    if (firedRef.current) return
    firedRef.current = true

    if ('vibrate' in navigator) navigator.vibrate(10)

    const container = containerRef.current
    if (!container) return

    const maxSize = Math.max(window.innerWidth, window.innerHeight) * 2.4
    const colors = [
      'rgba(0,229,229,0.9)',
      'rgba(0,255,239,0.6)',
      'rgba(255,0,200,0.35)',
    ]

    const rings = colors.map((color, i) => {
      const ring = document.createElement('div')
      ring.style.cssText = `
        position:absolute; border-radius:50%;
        border:2px solid ${color};
        box-shadow:0 0 20px ${color};
        width:10px; height:10px;
        left:50%; top:50%;
        transform:translate(-50%,-50%);
        pointer-events:none;
        transition:
          width ${700 - i * 80}ms cubic-bezier(0.2,0,0.4,1) ${i * 80}ms,
          height ${700 - i * 80}ms cubic-bezier(0.2,0,0.4,1) ${i * 80}ms,
          opacity 500ms ease ${i * 80 + 100}ms;
      `
      container.appendChild(ring)
      return ring
    })

    requestAnimationFrame(() => {
      const s = `${maxSize}px`
      rings.forEach(r => {
        r.style.width = s
        r.style.height = s
        r.style.opacity = '0'
      })
    })

    setTimeout(() => {
      if (container) {
        container.style.transition = 'opacity 400ms ease'
        container.style.opacity = '0'
      }
    }, 280)

    setTimeout(() => {
      if (mountedRef.current) onComplete()
    }, 700)
  }, [onComplete])

  return (
    <div
      ref={containerRef}
      className="fixed inset-0 z-[100] flex items-center justify-center overflow-hidden"
      style={{
        background: 'radial-gradient(ellipse at 50% 50%, #0A1E1E 0%, #060A0A 65%)',
      }}
    >
      {/* Scanlines */}
      <div
        className="absolute inset-0 pointer-events-none"
        style={{
          background:
            'repeating-linear-gradient(to bottom, transparent, transparent 3px, rgba(0,229,229,0.018) 3px, rgba(0,229,229,0.018) 4px)',
        }}
      />

      {/* HUD corners */}
      <div className="absolute top-5 left-5 w-5 h-5 border-t border-l border-cyan/25 pointer-events-none" />
      <div className="absolute top-5 right-5 w-5 h-5 border-t border-r border-cyan/25 pointer-events-none" />
      <div className="absolute bottom-5 left-5 w-5 h-5 border-b border-l border-cyan/25 pointer-events-none" />
      <div className="absolute bottom-5 right-5 w-5 h-5 border-b border-r border-cyan/25 pointer-events-none" />

      {/* HUD top text */}
      <p className="absolute top-7 inset-x-0 text-center font-mono text-[9px] tracking-[4px] text-cyan/25 uppercase pointer-events-none">
        Signal Acquired · TheYanaliShow.com
      </p>

      {/* HUD bottom text */}
      <p className="absolute bottom-7 inset-x-0 text-center font-mono text-[10px] tracking-[4px] text-cyan/50 uppercase pointer-events-none animate-pulse">
        Tap Logo to Enter
      </p>

      {/* Logo button */}
      <button
        onClick={fireTransition}
        className="logo-entry-btn"
        style={{ width: 320, height: 320 }}
        aria-label="Enter TheYanaliShow"
        type="button"
      >
        <div className="logo-ring logo-ring-3" style={{ inset: -44 }} />
        <div className="logo-ring logo-ring-2" style={{ inset: -20 }} />

        <div className="logo-orbit">
          <div className="absolute inset-0 rounded-full border border-dashed border-cyan/[0.18]" />
          <div className="logo-orbit-dot" />
        </div>

        <div className="logo-ring logo-ring-1" style={{ inset: 0 }} />

        <img
          src="/logo.png"
          alt="TheYanaliShow Logo"
          className="logo-entry-img relative z-10"
          style={{ width: 280, height: 280, objectFit: 'contain' }}
          draggable={false}
        />

        <span className="logo-enter-hint font-mono text-[9px] tracking-[3px] text-cyan uppercase">
          Enter the Show
        </span>
      </button>
    </div>
  )
}
```

- [ ] **Step 2: Verify TypeScript is happy**

```bash
npx tsc --noEmit
```
Expected: no errors.

- [ ] **Step 3: Commit**

```bash
git add components/entry/LogoEntry.tsx
git commit -m "feat: add LogoEntry component"
```

---

## Task 4: Swap EntryScreen to use LogoEntry

**Files:**
- Modify: `components/entry/EntryScreen.tsx`

- [ ] **Step 1: Replace the import and usage**

Replace line 3:
```tsx
import { TargetPractice } from './TargetPractice'
```
With:
```tsx
import { LogoEntry } from './LogoEntry'
```

Replace line 47:
```tsx
        <TargetPractice onComplete={handleComplete} />
```
With:
```tsx
        <LogoEntry onComplete={handleComplete} />
```

- [ ] **Step 2: Verify TypeScript is happy**

```bash
npx tsc --noEmit
```
Expected: no errors.

- [ ] **Step 3: Commit**

```bash
git add components/entry/EntryScreen.tsx
git commit -m "feat: swap TargetPractice for LogoEntry in EntryScreen"
```

---

## Task 5: Delete TargetPractice and Remove Phaser

**Files:**
- Delete: `components/entry/TargetPractice.tsx`
- Modify: `package.json`

- [ ] **Step 1: Delete TargetPractice.tsx**

```bash
git rm components/entry/TargetPractice.tsx
```

- [ ] **Step 2: Uninstall Phaser**

```bash
npm uninstall phaser
```

- [ ] **Step 3: Verify Phaser is gone from package.json**

Check `package.json` — `"phaser"` should no longer appear in `dependencies`.

- [ ] **Step 4: Verify TypeScript still clean**

```bash
npx tsc --noEmit
```
Expected: no errors.

- [ ] **Step 5: Commit**

```bash
git add package.json package-lock.json
git commit -m "chore: remove Phaser dependency and TargetPractice component"
```

---

## Task 6: Run Dev Server and Verify

- [ ] **Step 1: Start the dev server**

```bash
npm run dev
```
Expected: server starts on `http://localhost:3000`, no errors in terminal.

- [ ] **Step 2: Open browser and verify entry screen**

Navigate to `http://localhost:3000`.

Check:
- Entry screen appears: dark teal radial bg, scanlines visible, HUD corners, blinking "Tap Logo to Enter"
- Logo is centered on screen
- Logo has cyan glow ring + orbiting dot

- [ ] **Step 3: Verify hover effect**

Hover over the logo. Check:
- Logo scales up slightly with springy feel
- Glow intensifies noticeably
- "Enter the Show" text fades in below logo
- Outer rings brighten and expand

- [ ] **Step 4: Verify click transition**

Click the logo. Check:
- 3 rings burst outward from center
- Entry screen fades out within ~700ms
- Site content appears (Hero, Nav, etc.)

- [ ] **Step 5: Verify skip still works**

Refresh page (clears sessionStorage). Wait for "Signal Acquired" loading screen. Click "skip" — should go straight to site.

- [ ] **Step 6: Verify sessionStorage skip**

Reload without clearing sessionStorage. Entry screen should NOT appear — site loads directly.

- [ ] **Step 7: Verify production build**

```bash
npm run build
```
Expected: build completes with no errors and no warnings about missing chunks.
