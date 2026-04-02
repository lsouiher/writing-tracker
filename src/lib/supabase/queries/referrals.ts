import type { SupabaseClient } from '@supabase/supabase-js'

export async function createReferral(
  supabase: SupabaseClient,
  referrerId: string,
  refereeId: string
) {
  const { data, error } = await supabase
    .from('referrals')
    .insert({ referrer_id: referrerId, referee_id: refereeId })
    .select()
    .single()

  if (error) throw error
  return data
}

export async function completeReferral(supabase: SupabaseClient, referralId: string) {
  const { error } = await supabase
    .from('referrals')
    .update({
      status: 'completed',
      completed_at: new Date().toISOString(),
    })
    .eq('id', referralId)

  if (error) throw error
}

export async function getReferralStats(supabase: SupabaseClient, userId: string) {
  const { data: referrals, error } = await supabase
    .from('referrals')
    .select('id, status, reward_applied, created_at, completed_at')
    .eq('referrer_id', userId)
    .order('created_at', { ascending: false })

  if (error) return { total: 0, completed: 0, rewards_applied: 0, referrals: [] }

  return {
    total: referrals.length,
    completed: referrals.filter((r) => r.status === 'completed').length,
    rewards_applied: referrals.filter((r) => r.reward_applied).length,
    referrals,
  }
}

export async function getPendingReferralByReferee(supabase: SupabaseClient, refereeId: string) {
  const { data, error } = await supabase
    .from('referrals')
    .select('*')
    .eq('referee_id', refereeId)
    .eq('status', 'pending')
    .single()

  if (error) return null
  return data
}
