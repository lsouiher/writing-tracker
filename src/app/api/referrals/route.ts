import { createClient } from '@/lib/supabase/server'
import { successResponse, errorResponse } from '@/lib/api/response'
import { getReferralStats } from '@/lib/supabase/queries/referrals'

// GET /api/referrals — get user's referral code + stats
export async function GET() {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()

  if (!user) {
    return errorResponse('UNAUTHORIZED', 'Connexion requise', 401)
  }

  // Get user's referral code
  const { data: profile } = await supabase
    .from('users')
    .select('referral_code')
    .eq('id', user.id)
    .single()

  if (!profile) {
    return errorResponse('USER_NOT_FOUND', 'Profil introuvable', 404)
  }

  // Get referral stats
  const stats = await getReferralStats(supabase, user.id)

  return successResponse({
    referralCode: profile.referral_code,
    ...stats,
  })
}
