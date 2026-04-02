import type { PriceRegion, SubscriptionPlan, SupportedCurrency } from './domain'

export interface CheckoutParams {
  plan: SubscriptionPlan
  priceRegion: PriceRegion
  currency: SupportedCurrency
  couponCode?: string
  referralCode?: string
}

export interface StripeWebhookEvent {
  type: string
  data: {
    object: Record<string, unknown>
  }
}

export interface PriceConfig {
  region: PriceRegion
  plan: SubscriptionPlan
  stripePriceId: string
  amount: number
  currency: SupportedCurrency
  label: string
}

export const PRICE_REGION_MAP: Record<string, PriceRegion> = {
  DZ: 'maghreb',
  MA: 'maghreb',
  TN: 'maghreb',
  SN: 'west_africa',
  CI: 'west_africa',
  CM: 'west_africa',
  CA: 'canada',
} as const
