import type { SupabaseClient } from '@supabase/supabase-js'

export async function createTeamLicense(
  supabase: SupabaseClient,
  data: {
    admin_id: string
    stripe_subscription_id: string
    seat_count: number
  }
) {
  const { data: license, error } = await supabase
    .from('team_licenses')
    .insert(data)
    .select()
    .single()

  if (error) throw error

  // Update user role to team_admin
  await supabase
    .from('users')
    .update({ role: 'team_admin' })
    .eq('id', data.admin_id)

  return license
}

export async function inviteTeamMember(
  supabase: SupabaseClient,
  licenseId: string,
  email: string
) {
  // Check seat availability
  const { data: license } = await supabase
    .from('team_licenses')
    .select('seat_count, seats_used')
    .eq('id', licenseId)
    .single()

  if (!license) throw new Error('Licence introuvable')
  if (license.seats_used >= license.seat_count) {
    throw new Error('Toutes les places sont occupées')
  }

  // Find or create user placeholder
  const { data: existingUser } = await supabase
    .from('users')
    .select('id')
    .eq('email', email)
    .single()

  const userId = existingUser?.id

  if (userId) {
    // Insert team member
    const { data: member, error } = await supabase
      .from('team_members')
      .insert({
        team_license_id: licenseId,
        user_id: userId,
        invited_email: email,
      })
      .select()
      .single()

    if (error) throw error

    // Increment seats_used
    await supabase
      .from('team_licenses')
      .update({ seats_used: license.seats_used + 1 })
      .eq('id', licenseId)

    return member
  }

  // User doesn't exist yet — store invite for acceptance later
  // We'll create a placeholder that gets filled on acceptance
  return { invited_email: email, pending: true }
}

export async function getTeamMembers(supabase: SupabaseClient, licenseId: string) {
  const { data, error } = await supabase
    .from('team_members')
    .select(`
      id, invited_email, accepted_at, removed_at, created_at,
      user:users!user_id(full_name, email)
    `)
    .eq('team_license_id', licenseId)
    .is('removed_at', null)
    .order('created_at', { ascending: true })

  if (error) return []
  return data
}

export async function getTeamProgress(supabase: SupabaseClient, licenseId: string) {
  const members = await getTeamMembers(supabase, licenseId)
  const memberIds = members.map((m: Record<string, unknown>) => (m.user as { full_name: string })?.full_name ? m.id : null).filter(Boolean)

  // Get user IDs
  const { data: memberRecords } = await supabase
    .from('team_members')
    .select('user_id')
    .eq('team_license_id', licenseId)
    .is('removed_at', null)

  const userIds = (memberRecords || []).map((m: { user_id: string }) => m.user_id)

  if (userIds.length === 0) return { members, stats: { total_enrollments: 0, avg_progress: 0 } }

  // Aggregate progress
  const { data: enrollments } = await supabase
    .from('enrollments')
    .select('user_id, course_id')
    .in('user_id', userIds)

  const { data: progress } = await supabase
    .from('progress')
    .select('user_id, completed')
    .in('user_id', userIds)
    .eq('completed', true)

  return {
    members,
    stats: {
      total_enrollments: enrollments?.length ?? 0,
      total_completions: progress?.length ?? 0,
      member_count: userIds.length,
    },
  }
}

export async function removeTeamMember(supabase: SupabaseClient, memberId: string) {
  const { data: member } = await supabase
    .from('team_members')
    .select('team_license_id')
    .eq('id', memberId)
    .single()

  if (!member) throw new Error('Membre introuvable')

  // Soft remove
  await supabase
    .from('team_members')
    .update({ removed_at: new Date().toISOString() })
    .eq('id', memberId)

  // Decrement seats_used
  const { data: license } = await supabase
    .from('team_licenses')
    .select('seats_used')
    .eq('id', member.team_license_id)
    .single()

  if (license) {
    await supabase
      .from('team_licenses')
      .update({ seats_used: Math.max(0, license.seats_used - 1) })
      .eq('id', member.team_license_id)
  }
}

export async function getTeamLicenseByAdmin(supabase: SupabaseClient, adminId: string) {
  const { data, error } = await supabase
    .from('team_licenses')
    .select('*')
    .eq('admin_id', adminId)
    .eq('status', 'active')
    .single()

  if (error) return null
  return data
}
