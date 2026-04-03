import { createClient } from '@/lib/supabase/server'
import { getServiceClient } from '@/lib/supabase/service'
import { errorResponse } from '@/lib/api/response'

/**
 * API-level admin guard. Returns { user, supabase (service-role) } or an error response.
 * Uses the user's session for auth verification, then returns a service-role client
 * for admin operations that need to modify other users' records (bypasses RLS).
 */
export async function requireAdminApi() {
  const userClient = await createClient()
  const { data: { user } } = await userClient.auth.getUser()

  if (!user) {
    return { error: errorResponse('UNAUTHORIZED', 'Connexion requise', 401) }
  }

  const { data: profile } = await userClient
    .from('users')
    .select('role')
    .eq('id', user.id)
    .single()

  if (!profile || profile.role !== 'admin') {
    return { error: errorResponse('FORBIDDEN', 'Acces reserve aux administrateurs', 403) }
  }

  // Return service-role client for admin operations
  const supabase = getServiceClient()
  return { user, supabase, error: null }
}
