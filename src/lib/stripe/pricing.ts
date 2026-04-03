import type { PriceRegion, SubscriptionPlan } from '@/types/domain'
import { PRICE_REGION_MAP } from '@/types/stripe'

const PRICE_IDS: Record<string, string> = {
  'default-monthly': process.env.STRIPE_PRICE_MONTHLY_DEFAULT || '',
  'default-annual': process.env.STRIPE_PRICE_ANNUAL_DEFAULT || '',
  'maghreb-monthly': process.env.STRIPE_PRICE_MONTHLY_MAGHREB || '',
  'maghreb-annual': process.env.STRIPE_PRICE_ANNUAL_MAGHREB || '',
  'canada-monthly': process.env.STRIPE_PRICE_MONTHLY_CANADA || '',
  'canada-annual': process.env.STRIPE_PRICE_ANNUAL_CANADA || '',
  'west_africa-monthly': process.env.STRIPE_PRICE_MONTHLY_WEST_AFRICA || process.env.STRIPE_PRICE_MONTHLY_MAGHREB || '',
  'west_africa-annual': process.env.STRIPE_PRICE_ANNUAL_WEST_AFRICA || process.env.STRIPE_PRICE_ANNUAL_MAGHREB || '',
}

export function getRegionFromCountry(countryCode: string | null): PriceRegion {
  if (!countryCode) return 'default'
  return PRICE_REGION_MAP[countryCode.toUpperCase()] || 'default'
}

export function getStripePriceId(region: PriceRegion, plan: SubscriptionPlan): string {
  const key = `${region}-${plan}`
  return PRICE_IDS[key] || PRICE_IDS[`default-${plan}`]
}

// Monthly price in cents by region (single source of truth for MRR calculations)
export const MONTHLY_PRICE_CENTS: Record<string, number> = {
  default: 1900,    // 19.00 EUR
  maghreb: 350,     // 3.50 EUR
  canada: 2500,     // 25.00 CAD
  west_africa: 380, // 3.80 EUR
}

export function getDisplayPrice(region: PriceRegion, plan: SubscriptionPlan): { amount: number; currency: string; label: string } {
  const prices: Record<string, { amount: number; currency: string; label: string }> = {
    'default-monthly': { amount: 19, currency: 'EUR', label: '19 EUR/mois' },
    'default-annual': { amount: 190, currency: 'EUR', label: '190 EUR/an' },
    'maghreb-monthly': { amount: 3.5, currency: 'EUR', label: '~500 DZD/mois' },
    'maghreb-annual': { amount: 35, currency: 'EUR', label: '~5000 DZD/an' },
    'canada-monthly': { amount: 25, currency: 'CAD', label: '25 CAD/mois' },
    'canada-annual': { amount: 250, currency: 'CAD', label: '250 CAD/an' },
    'west_africa-monthly': { amount: 3.8, currency: 'EUR', label: '~2500 CFA/mois' },
    'west_africa-annual': { amount: 38, currency: 'EUR', label: '~25000 CFA/an' },
  }

  return prices[`${region}-${plan}`] || prices[`default-${plan}`]
}
