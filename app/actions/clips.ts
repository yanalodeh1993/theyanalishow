'use server'
import { createSupabaseServerClient } from '@/lib/supabase-server'
import { revalidatePath } from 'next/cache'

export async function addClip(formData: FormData) {
  const supabase = await createSupabaseServerClient()
  const { error } = await supabase.from('clips').insert({
    title: formData.get('title') as string,
    url: formData.get('url') as string,
    thumbnail_url: (formData.get('thumbnail_url') as string) || null,
    platform: formData.get('platform') as string,
    display_order: Number(formData.get('display_order') ?? 0),
  })
  if (error) return { error: error.message }
  revalidatePath('/dashboard/clips')
  revalidatePath('/')
  return { success: true }
}

export async function deleteClip(id: string) {
  const supabase = await createSupabaseServerClient()
  const { error } = await supabase.from('clips').delete().eq('id', id)
  if (error) return { error: error.message }
  revalidatePath('/dashboard/clips')
  revalidatePath('/')
  return { success: true }
}

export async function updateClipOrder(id: string, display_order: number) {
  const supabase = await createSupabaseServerClient()
  const { error } = await supabase.from('clips').update({ display_order }).eq('id', id)
  if (error) return { error: error.message }
  revalidatePath('/dashboard/clips')
  revalidatePath('/')
  return { success: true }
}
