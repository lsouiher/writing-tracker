export type SubscriptionTier = 'free' | 'pro'

export type UserRole = 'student' | 'team_admin' | 'admin'

export type CourseLevel = 'beginner' | 'intermediate' | 'advanced'

export type SubscriptionStatus =
  | 'trialing'
  | 'active'
  | 'past_due'
  | 'canceled'
  | 'expired'

export type SubscriptionPlan = 'monthly' | 'annual'

export type PriceRegion = 'default' | 'maghreb' | 'west_africa' | 'canada'

export type SupportedCurrency = 'eur' | 'cad' | 'usd'

export type LabLanguage = 'python' | 'javascript' | 'r'

export type CapstoneStatus = 'submitted' | 'grading' | 'graded' | 'approved'

export type ModerationDecision = 'approved' | 'removed'

export interface ApiResponse<T> {
  data: T | null
  error: { code: string; message: string } | null
}
