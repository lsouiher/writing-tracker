import { requireAdminApi } from '@/lib/admin/api-guard'
import { successResponse, errorResponse } from '@/lib/api/response'

// GET /api/admin/coupons — list all coupons
export async function GET() {
  const auth = await requireAdminApi()
  if (auth.error) return auth.error

  const { supabase } = auth

  const { data: coupons } = await supabase
    .from('coupons')
    .select('*')
    .order('created_at', { ascending: false })

  return successResponse({ coupons: coupons || [] })
}

// POST /api/admin/coupons — create a new coupon
export async function POST(request: Request) {
  const auth = await requireAdminApi()
  if (auth.error) return auth.error

  const { supabase } = auth
  const { code, discount_percent, max_uses, expires_at } = await request.json()

  if (!code || typeof code !== 'string') {
    return errorResponse('INVALID_CODE', 'Code coupon requis')
  }
  if (!discount_percent || discount_percent < 1 || discount_percent > 100) {
    return errorResponse('INVALID_DISCOUNT', 'Remise entre 1 et 100%')
  }
  if (!max_uses || max_uses < 1) {
    return errorResponse('INVALID_MAX_USES', 'Nombre d\'utilisations minimum: 1')
  }

  const { data: coupon, error } = await supabase
    .from('coupons')
    .insert({
      code: code.toUpperCase().trim(),
      discount_percent,
      max_uses,
      expires_at: expires_at || null,
    })
    .select()
    .single()

  if (error) {
    if (error.code === '23505') {
      return errorResponse('DUPLICATE_CODE', 'Ce code coupon existe deja')
    }
    return errorResponse('CREATE_FAILED', 'Erreur lors de la creation', 500)
  }

  return successResponse({ coupon }, 201)
}
