import { NextResponse } from 'next/server'

const CLIENT_ID = process.env.TWITCH_CLIENT_ID
const CLIENT_SECRET = process.env.TWITCH_CLIENT_SECRET
const BROADCASTER_LOGIN = 'theyanalishow'
const HELIX = 'https://api.twitch.tv/helix'

async function getAppToken(): Promise<string> {
  const res = await fetch(
    `https://id.twitch.tv/oauth2/token?client_id=${CLIENT_ID}&client_secret=${CLIENT_SECRET}&grant_type=client_credentials`,
    { method: 'POST', next: { revalidate: 3600 } },
  )
  const data = await res.json()
  return data.access_token as string
}

export async function GET() {
  if (!CLIENT_ID || !CLIENT_SECRET) {
    return NextResponse.json({ error: 'Twitch credentials not configured' }, { status: 500 })
  }

  const token = await getAppToken()
  const headers = { 'Client-Id': CLIENT_ID, Authorization: `Bearer ${token}` }

  // 1. Resolve login → broadcaster_id
  const userRes = await fetch(`${HELIX}/users?login=${BROADCASTER_LOGIN}`, {
    headers,
    next: { revalidate: 3600 },
  })
  const userData = await userRes.json()
  const broadcasterId: string | undefined = userData.data?.[0]?.id

  if (!broadcasterId) {
    return NextResponse.json({ error: 'Twitch broadcaster not found' }, { status: 404 })
  }

  // 2. Fetch top clips
  const clipsRes = await fetch(`${HELIX}/clips?broadcaster_id=${broadcasterId}&first=30`, {
    headers,
    next: { revalidate: 3600 },
  })
  const clipsData = await clipsRes.json()

  const clips = (clipsData.data ?? []).map((c: {
    id: string
    title: string
    view_count: number
    thumbnail_url: string
    url: string
  }) => ({
    id: c.id,
    title: c.title,
    platform: 'twitch',
    viewCount: formatCount(c.view_count),
    thumbnailUrl: c.thumbnail_url,
    url: c.url,
  }))

  return NextResponse.json({ clips })
}

function formatCount(n: number): string {
  if (n >= 1_000_000) return `${(n / 1_000_000).toFixed(1)}M`
  if (n >= 1_000) return `${(n / 1_000).toFixed(1)}K`
  return String(n)
}
