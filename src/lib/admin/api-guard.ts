import { createClient } from '@/lib/supabase/server'
import { errorResponse } from '@/lib/api/response'

/**
 * API-level admin guard. Returns { user, supabase } or an error response.
 */
export async function requireAdminApi() {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()

  if (!user) {
    return { error: errorResponse('UNAUTHORIZED', 'Connexion requise', 401) }
  }

  const { data: profile } = await supabase
    .from('users')
    .select('role')
    .eq('id', user.id)
    .single()

  if (!profile || profile.role !== 'admin') {
    return { error: errorResponse('FORBIDDEN', 'Acces reserve aux administrateurs', 403) }
  }

  return { user, supabase, error: null }
}
