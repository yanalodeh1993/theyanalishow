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
