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
