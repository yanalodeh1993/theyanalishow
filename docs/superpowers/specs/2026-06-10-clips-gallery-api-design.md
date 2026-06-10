# Clips Gallery — Live API Integration

**Date:** 2026-06-10
**Status:** Approved

## Overview

Replace hardcoded placeholder clips in `ClipsGallery` with real data fetched from YouTube Shorts and Twitch Clips APIs. Arrow buttons randomly shuffle which clips from the full pool are displayed.

## Data Sources

| Platform | API | Endpoint |
|----------|-----|----------|
| YouTube | YouTube Data API v3 | `channels.list` → `search.list` (videoDuration=short) |
| Twitch | Twitch Helix API | `users` → `clips` |

Credentials stored in `.env.local` (never exposed to the browser):
- `YOUTUBE_API_KEY`
- `TWITCH_CLIENT_ID`
- `TWITCH_CLIENT_SECRET`

## Architecture

```
Browser
  └─ ClipsGallery (client component)
       ├─ GET /api/clips/youtube  →  YouTube Data API v3
       └─ GET /api/clips/twitch   →  Twitch Helix API
```

Both API routes run server-side and cache responses for 1 hour (`revalidate: 3600`).

## Normalized Clip Shape

```ts
type Clip = {
  id: string
  title: string
  platform: 'youtube' | 'twitch'
  viewCount: string
  thumbnailUrl: string
  url: string
}
```

## Gallery Behavior

- Fetches both routes on mount; merges into one pool
- Displays 5 clips at a time
- Left/right arrows pick a random new set of 5 from the full pool
- Each card shows real thumbnail, title, platform badge, view count
- Clicking a card opens the clip on YouTube/Twitch in a new tab

## Files Changed

- `app/api/clips/youtube/route.ts` — new
- `app/api/clips/twitch/route.ts` — new
- `components/clips/ClipsGallery.tsx` — updated
- `.env.local` — add placeholder keys
