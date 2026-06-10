import { NextResponse } from 'next/server'

const YT_KEY = process.env.YOUTUBE_API_KEY
const CHANNEL_HANDLE = 'theyanalishow'
const BASE = 'https://www.googleapis.com/youtube/v3'

export async function GET() {
  if (!YT_KEY) {
    return NextResponse.json({ error: 'YouTube API key not configured' }, { status: 500 })
  }

  // 1. Resolve channel handle → channel ID
  const channelRes = await fetch(
    `${BASE}/channels?forHandle=${CHANNEL_HANDLE}&part=id&key=${YT_KEY}`,
    { next: { revalidate: 3600 } },
  )
  const channelData = await channelRes.json()
  const channelId: string | undefined = channelData.items?.[0]?.id

  if (!channelId) {
    return NextResponse.json({ error: 'YouTube channel not found' }, { status: 404 })
  }

  // 2. Search for Shorts (short-duration videos on the channel)
  const searchRes = await fetch(
    `${BASE}/search?channelId=${channelId}&type=video&videoDuration=short&part=id&maxResults=30&order=date&key=${YT_KEY}`,
    { next: { revalidate: 3600 } },
  )
  const searchData = await searchRes.json()
  const videoIds: string[] = (searchData.items ?? []).map((item: { id: { videoId: string } }) => item.id.videoId)

  if (videoIds.length === 0) {
    return NextResponse.json({ clips: [] })
  }

  // 3. Fetch snippet + statistics in one batch call
  const detailRes = await fetch(
    `${BASE}/videos?id=${videoIds.join(',')}&part=snippet,statistics&key=${YT_KEY}`,
    { next: { revalidate: 3600 } },
  )
  const detailData = await detailRes.json()

  const clips = (detailData.items ?? []).map((v: {
    id: string
    snippet: { title: string; thumbnails: { maxres?: { url: string }; high?: { url: string }; default?: { url: string } } }
    statistics: { viewCount?: string }
  }) => ({
    id: v.id,
    title: v.snippet.title,
    platform: 'youtube',
    viewCount: formatCount(v.statistics?.viewCount),
    thumbnailUrl: v.snippet.thumbnails.maxres?.url ?? v.snippet.thumbnails.high?.url ?? v.snippet.thumbnails.default?.url ?? '',
    url: `https://www.youtube.com/shorts/${v.id}`,
  }))

  return NextResponse.json({ clips })
}

function formatCount(raw?: string): string {
  if (!raw) return ''
  const n = parseInt(raw, 10)
  if (n >= 1_000_000) return `${(n / 1_000_000).toFixed(1)}M`
  if (n >= 1_000) return `${(n / 1_000).toFixed(1)}K`
  return String(n)
}
