import { getStripe } from './client'

export async function applyReferralReward(
  referrerCustomerId: string,
  refereeCustomerId: string
) {
  const stripe = getStripe()

  // Apply one free month credit to both parties via invoice credit
  // Using customer balance (negative = credit)
  const creditAmount = -1900 // -19€ in cents (one month Pro)

  await Promise.all([
    stripe.customers.update(referrerCustomerId, {
      balance: creditAmount,
      metadata: { referral_credit: 'true' },
    }),
    stripe.customers.update(refereeCustomerId, {
      balance: creditAmount,
      metadata: { referral_credit: 'true' },
    }),
  ])
}
