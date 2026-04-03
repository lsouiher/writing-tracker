import { requireAdminApi } from '@/lib/admin/api-guard'
import { successResponse, errorResponse } from '@/lib/api/response'

// GET /api/admin/users — list users with filters
export async function GET(request: Request) {
  const auth = await requireAdminApi()
  if (auth.error) return auth.error

  const { supabase } = auth
  const url = new URL(request.url)
  const role = url.searchParams.get('role')
  const country = url.searchParams.get('country')
  const search = url.searchParams.get('search')
  const page = parseInt(url.searchParams.get('page') || '1', 10)
  const limit = 50
  const offset = (page - 1) * limit

  let query = supabase
    .from('users')
    .select(`
      id,
      email,
      full_name,
      country,
      language,
      role,
      referral_code,
      created_at,
      deleted_at
    `, { count: 'exact' })

  if (role) query = query.eq('role', role)
  if (country) query = query.eq('country', country)
  if (search) {
    // Escape special PostgREST filter characters to prevent injection
    const sanitized = search.replace(/[%_.*(),]/g, '')
    if (sanitized) {
      query = query.or(`email.ilike.%${sanitized}%,full_name.ilike.%${sanitized}%`)
    }
  }

  const { data: users, count, error } = await query
    .order('created_at', { ascending: false })
    .range(offset, offset + limit - 1)

  if (error) {
    return errorResponse('FETCH_FAILED', 'Erreur lors du chargement', 500)
  }

  return successResponse({
    users: users || [],
    total: count || 0,
    page,
    totalPages: Math.ceil((count || 0) / limit),
  })
}
