import type { SupabaseClient } from '@supabase/supabase-js'

export async function getUserProfile(supabase: SupabaseClient, userId: string) {
  const { data, error } = await supabase
    .from('users')
    .select('*')
    .eq('id', userId)
    .is('deleted_at', null)
    .single()

  if (error) return null
  return data
}

export async function updateUserProfile(
  supabase: SupabaseClient,
  userId: string,
  updates: { full_name?: string; avatar_url?: string; language?: string; country?: string }
) {
  const { data, error } = await supabase
    .from('users')
    .update(updates)
    .eq('id', userId)
    .select()
    .single()

  if (error) throw error
  return data
}
