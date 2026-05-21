# Logo Entry Experience — Design Spec
**Date:** 2026-05-21
**Project:** theyanalishow.com
**Replaces:** Target Practice (Phaser.js) entry mini-game

---

## What We're Building

Replace the `TargetPractice.tsx` Phaser game with a new `LogoEntry.tsx` component. The logo sits centered on a full-screen dark entry screen. User clicks/taps it once — a shockwave burst fires, the entry screen fades out, and the site reveals.

`EntryScreen.tsx` state machine is kept as-is (loading → game → done). Only the game component is swapped.

---

## Visual Design

- **Background:** `radial-gradient(ellipse at 50% 50%, #0A1E1E 0%, #060A0A 65%)`
- **Scanlines:** `::before` overlay, `repeating-linear-gradient`, opacity 0.018
- **HUD corners:** 4 corner brackets in `rgba(0,229,229,0.25)`
- **HUD text top:** `SIGNAL ACQUIRED · THEYANALISHOW.COM` — small, muted
- **HUD text bottom:** `[ TAP LOGO TO ENTER ]` — blinking, cyan

---

## Logo Button (centered)

- Logo image: `/logo.png` (copied from Desktop to `public/`)
- Size: `280×280px`, `object-fit: contain`
- Perfectly centered via `position: fixed; inset: 0; display: flex; align-items: center; justify-content: center`
- `cursor: pointer` (UI skill requirement)
- `will-change: transform, filter` (GPU layer)

### Idle state
- `filter: drop-shadow(0 0 16px rgba(0,229,229,0.28)) drop-shadow(0 0 40px rgba(0,229,229,0.12))`
- 3 concentric `border-radius: 50%` rings, breathing `animation: breathe 2.8s ease-in-out infinite`
- 1 dashed orbit ring with a glowing cyan dot, `animation: spin 14s linear infinite`

### Hover state (UI skill: transform, 350ms, cubic-bezier)
- `transform: scale(1.08)` — springy `cubic-bezier(0.34, 1.56, 0.64, 1)`
- `filter` glow increases significantly (triple drop-shadow)
- Inner ring `border-color` brightens to `rgba(0,229,229,0.7)`, outer rings expand via `scale`
- Orbit dot brightens to `#00FFEF` with stronger shadow
- `"ENTER THE SHOW"` text fades in below logo (`opacity: 0 → 1`, letter-spacing expands)

---

## Click Transition — Shockwave Burst (Option A)

On click:
1. Three concentric rings expand outward from center simultaneously (staggered 80ms each), `opacity` fades to 0
2. Entry screen background pulses briefly cyan
3. Entry screen fades out (`opacity: 0`, 400ms)
4. Site content reveals (already rendered behind, opacity goes 1)

No Phaser, no canvas — pure CSS transitions + JS `setTimeout`.

---

## Skip Behaviour

Keep the existing ESC / skip button from `EntryScreen.tsx`. `sessionStorage` key `tys_entry_played` prevents replay — unchanged from current implementation.

---

## Accessibility / UX (UI skill requirements)

- `cursor: pointer` on logo button
- `prefers-reduced-motion`: disable all animations, skip straight to site
- `alt="TheYanaliShow Logo"` on image
- Works identically on touch (click/tap events, no hover dependency for core action)
- `navigator.vibrate(10)` on mobile tap (haptic, gracefully ignored where unsupported)

---

## Files Changed

| File | Action |
|------|--------|
| `public/logo.png` | ADD — copy logo from Desktop |
| `components/entry/LogoEntry.tsx` | ADD — new component (replaces TargetPractice) |
| `components/entry/EntryScreen.tsx` | EDIT — swap `TargetPractice` import for `LogoEntry` |
| `components/entry/TargetPractice.tsx` | DELETE |
| `package.json` | EDIT — remove `phaser` dependency (no longer needed) |
