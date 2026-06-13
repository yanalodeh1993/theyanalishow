'use server'
import { createSupabaseServerClient } from '@/lib/supabase-server'
import { revalidatePath } from 'next/cache'

export async function updateBio(formData: FormData) {
  const supabase = await createSupabaseServerClient()
  const { error } = await supabase
    .from('site_config')
    .update({
      bio_main: formData.get('bio_main') as string,
      bio_sub: formData.get('bio_sub') as string,
      updated_at: new Date().toISOString(),
    })
    .eq('id', 1)
  if (error) return { error: error.message }
  revalidatePath('/')
  return { success: true }
}

export async function updateSiteLink(formData: FormData) {
  const supabase = await createSupabaseServerClient()
  const { error } = await supabase
    .from('site_links')
    .update({
      url: formData.get('url') as string,
      label: formData.get('label') as string,
    })
    .eq('id', formData.get('id') as string)
  if (error) return { error: error.message }
  revalidatePath('/')
  return { success: true }
}
