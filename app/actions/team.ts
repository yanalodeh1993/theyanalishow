'use server'
import { createSupabaseServerClient } from '@/lib/supabase-server'
import { createSupabaseAdminClient } from '@/lib/supabase-admin'
import { revalidatePath } from 'next/cache'

export async function inviteEditor(formData: FormData) {
  const email = formData.get('email') as string
  const supabase = await createSupabaseServerClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return { error: 'Not authenticated' }

  const { error: inviteRecordError } = await supabase
    .from('invites')
    .upsert({ email, role: 'editor', invited_by: user.id, accepted: false }, { onConflict: 'email' })
  if (inviteRecordError) return { error: inviteRecordError.message }

  const admin = createSupabaseAdminClient()
  const { error: authError } = await admin.auth.admin.inviteUserByEmail(email, {
    redirectTo: `${process.env.NEXT_PUBLIC_SITE_URL ?? 'http://localhost:3000'}/dashboard`,
  })
  if (authError) return { error: authError.message }

  revalidatePath('/dashboard/team')
  return { success: true }
}

export async function revokeAccess(userId: string) {
  const admin = createSupabaseAdminClient()
  const supabase = await createSupabaseServerClient()

  await supabase.from('profiles').delete().eq('id', userId)
  await admin.auth.admin.deleteUser(userId)

  revalidatePath('/dashboard/team')
  return { success: true }
}
