import { requireAdminApi } from '@/lib/admin/api-guard'
import { successResponse } from '@/lib/api/response'

// GET /api/admin/dashboard — aggregated platform stats
export async function GET() {
  const auth = await requireAdminApi()
  if (auth.error) return auth.error

  const { supabase } = auth

  // Run all queries in parallel
  const [
    usersResult,
    proUsersResult,
    revenueResult,
    moderationResult,
    coursesResult,
  ] = await Promise.all([
    // Total users
    supabase.from('users').select('id', { count: 'exact', head: true }).is('deleted_at', null),
    // Pro users (active + trialing)
    supabase.from('subscriptions').select('id', { count: 'exact', head: true }).in('status', ['active', 'trialing']),
    // Active subscriptions for revenue estimate
    supabase.from('subscriptions').select('plan, currency, price_region').in('status', ['active', 'trialing']),
    // Pending moderation flags
    supabase.from('moderation_flags').select('id', { count: 'exact', head: true }).eq('reviewed', false),
    // Total courses
    supabase.from('courses').select('id', { count: 'exact', head: true }),
  ])

  // Estimate MRR from active subscriptions
  const subscriptions = revenueResult.data || []
  let estimatedMrr = 0
  for (const sub of subscriptions) {
    // Base monthly price varies by region
    const monthlyBase = sub.price_region === 'maghreb' ? 990
      : sub.price_region === 'west_africa' ? 790
      : sub.price_region === 'canada' ? 1490
      : 1900 // default EUR
    estimatedMrr += sub.plan === 'annual' ? Math.round(monthlyBase * 0.8) : monthlyBase
  }

  return successResponse({
    users: {
      total: usersResult.count || 0,
      pro: proUsersResult.count || 0,
    },
    revenue: {
      mrr: estimatedMrr,
      activeSubscriptions: subscriptions.length,
    },
    moderation: {
      pendingFlags: moderationResult.count || 0,
    },
    courses: {
      total: coursesResult.count || 0,
    },
  })
}
