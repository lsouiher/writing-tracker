import { getStripe } from './client'
import { MONTHLY_PRICE_CENTS } from './pricing'

export async function applyReferralReward(
  referrerCustomerId: string,
  refereeCustomerId: string,
  referrerRegion: string = 'default',
  refereeRegion: string = 'default'
) {
  const stripe = getStripe()

  // Credit one month's value based on each user's region
  const referrerCredit = -(MONTHLY_PRICE_CENTS[referrerRegion] || MONTHLY_PRICE_CENTS.default)
  const refereeCredit = -(MONTHLY_PRICE_CENTS[refereeRegion] || MONTHLY_PRICE_CENTS.default)

  // Determine currency (Canada uses CAD, everyone else EUR)
  const referrerCurrency = referrerRegion === 'canada' ? 'cad' : 'eur'
  const refereeCurrency = refereeRegion === 'canada' ? 'cad' : 'eur'

  await Promise.all([
    stripe.customers.createBalanceTransaction(referrerCustomerId, {
      amount: referrerCredit,
      currency: referrerCurrency,
      description: 'Crédit de parrainage IAlgeria — 1 mois offert',
    }),
    stripe.customers.createBalanceTransaction(refereeCustomerId, {
      amount: refereeCredit,
      currency: refereeCurrency,
      description: 'Crédit de parrainage IAlgeria — 1 mois offert',
    }),
  ])
}
