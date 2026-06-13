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
