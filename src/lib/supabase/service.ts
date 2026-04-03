import { createClient } from '@supabase/supabase-js'

// Service-role client — bypasses RLS. Use only in server-side code
// where the caller cannot or should not be scoped to a user session
// (webhooks, cron jobs, admin writes, token-verified endpoints).
export function getServiceClient() {
  return createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY!
  )
}
