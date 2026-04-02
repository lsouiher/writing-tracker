import { createClient } from '@/lib/supabase/server'
import { redirect } from 'next/navigation'

/**
 * Server-side admin guard. Call at the top of any admin page/layout.
 * Redirects non-admin users to the dashboard.
 */
export async function requireAdmin() {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()

  if (!user) redirect('/login?redirect=/admin')

  const { data: profile } = await supabase
    .from('users')
    .select('role')
    .eq('id', user.id)
    .single()

  if (!profile || profile.role !== 'admin') {
    redirect('/dashboard')
  }

  return { user, supabase }
}
