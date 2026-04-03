import { createClient } from '@/lib/supabase/server'
import { getServiceClient } from '@/lib/supabase/service'
import { successResponse, errorResponse } from '@/lib/api/response'

// POST /api/referrals/track — called after signup to link referral
export async function POST(request: Request) {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()

  if (!user) {
    return errorResponse('UNAUTHORIZED', 'Connexion requise', 401)
  }

  const { referralCode } = await request.json()
  if (!referralCode || typeof referralCode !== 'string') {
    return errorResponse('INVALID_CODE', 'Code de parrainage invalide')
  }

  const serviceClient = getServiceClient()

  // Look up referrer by referral_code
  const { data: referrer } = await serviceClient
    .from('users')
    .select('id')
    .eq('referral_code', referralCode)
    .single()

  if (!referrer) {
    return errorResponse('REFERRER_NOT_FOUND', 'Code de parrainage introuvable')
  }

  // Don't allow self-referral
  if (referrer.id === user.id) {
    return errorResponse('SELF_REFERRAL', 'Vous ne pouvez pas vous parrainer vous-meme')
  }

  // Update the new user's referred_by field
  await serviceClient
    .from('users')
    .update({ referred_by: referrer.id })
    .eq('id', user.id)

  // Create a pending referral record
  const { error } = await serviceClient
    .from('referrals')
    .insert({
      referrer_id: referrer.id,
      referee_id: user.id,
    })

  if (error) {
    // Unique constraint violation = referral already exists
    if (error.code === '23505') {
      return successResponse({ tracked: true, alreadyExists: true })
    }
    console.error('Failed to create referral:', error)
    return errorResponse('REFERRAL_FAILED', 'Erreur lors du parrainage', 500)
  }

  return successResponse({ tracked: true })
}
