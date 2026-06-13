'use server'
import { createSupabaseServerClient } from '@/lib/supabase-server'
import { revalidatePath } from 'next/cache'

export async function updateGoal(formData: FormData) {
  const supabase = await createSupabaseServerClient()
  const current_amount = Number(formData.get('current_amount'))
  const goal_amount = Number(formData.get('goal_amount'))
  const { data: row } = await supabase.from('van_fund').select('id').limit(1).single()
  if (!row) return { error: 'Van fund row not found' }
  const { error } = await supabase
    .from('van_fund')
    .update({ current_amount, goal_amount, updated_at: new Date().toISOString() })
    .eq('id', row.id)
  if (error) return { error: error.message }
  revalidatePath('/dashboard/van-fund')
  revalidatePath('/dashboard')
  revalidatePath('/')
  return { success: true }
}

export async function addDonor(formData: FormData) {
  const supabase = await createSupabaseServerClient()
  const name = formData.get('name') as string
  const amount = Number(formData.get('amount'))

  const { error: insertError } = await supabase.from('recent_donors').insert({
    name,
    amount,
    donated_at: new Date().toISOString(),
  })
  if (insertError) return { error: insertError.message }

  const { data: fundRow } = await supabase.from('van_fund').select('id, current_amount').limit(1).single()
  if (fundRow) {
    await supabase
      .from('van_fund')
      .update({ current_amount: fundRow.current_amount + amount, updated_at: new Date().toISOString() })
      .eq('id', fundRow.id)
  }

  revalidatePath('/dashboard/van-fund')
  revalidatePath('/dashboard')
  revalidatePath('/')
  return { success: true }
}

export async function deleteDonor(id: string) {
  const supabase = await createSupabaseServerClient()
  const { data: donor } = await supabase.from('recent_donors').select('amount').eq('id', id).single()

  const { error } = await supabase.from('recent_donors').delete().eq('id', id)
  if (error) return { error: error.message }

  if (donor) {
    const { data: fundRow } = await supabase.from('van_fund').select('id, current_amount').limit(1).single()
    if (fundRow) {
      await supabase
        .from('van_fund')
        .update({ current_amount: Math.max(0, fundRow.current_amount - donor.amount), updated_at: new Date().toISOString() })
        .eq('id', fundRow.id)
    }
  }

  revalidatePath('/dashboard/van-fund')
  revalidatePath('/dashboard')
  revalidatePath('/')
  return { success: true }
}
