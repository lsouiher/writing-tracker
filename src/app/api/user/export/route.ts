import { createClient } from '@/lib/supabase/server'
import { errorResponse } from '@/lib/api/response'
import { checkApiRateLimit } from '@/lib/redis/api-rate-limit'
import { NextRequest, NextResponse } from 'next/server'

export async function GET(request: NextRequest) {
  try {
    const rateLimited = await checkApiRateLimit(request, 'auth')
    if (rateLimited) return rateLimited

    const supabase = await createClient()
    const { data: { user } } = await supabase.auth.getUser()

    if (!user) {
      return errorResponse('UNAUTHORIZED', 'Connectez-vous pour exporter vos données', 401)
    }

    // Fetch all user data in parallel
    const [
      { data: profile },
      { data: enrollments },
      { data: progress },
      { data: subscriptions },
      { data: certificates },
      { data: quizResults },
      { data: labSubmissions },
      { data: communityPosts },
      { data: aiTutorLogs },
      { data: referrals },
    ] = await Promise.all([
      supabase.from('users').select('id, email, full_name, avatar_url, role, language, country, created_at').eq('id', user.id).single(),
      supabase.from('enrollments').select('course_id, enrolled_at').eq('user_id', user.id),
      supabase.from('progress').select('lesson_id, position_seconds, completed, updated_at').eq('user_id', user.id),
      supabase.from('subscriptions').select('stripe_subscription_id, plan, status, current_period_start, current_period_end, trial_end').eq('user_id', user.id),
      supabase.from('certificates').select('course_id, verification_code, issued_at').eq('user_id', user.id),
      supabase.from('quiz_results').select('quiz_id, score, passed, created_at').eq('user_id', user.id),
      supabase.from('lab_submissions').select('lab_id, passed, created_at').eq('user_id', user.id),
      supabase.from('community_posts').select('id, title, body, created_at').eq('author_id', user.id),
      supabase.from('ai_tutor_logs').select('lesson_id, question, answer, was_off_topic, created_at').eq('user_id', user.id),
      supabase.from('referrals').select('referee_id, status, created_at').eq('referrer_id', user.id),
    ])

    const exportData = {
      exported_at: new Date().toISOString(),
      profile,
      enrollments: enrollments || [],
      progress: progress || [],
      subscriptions: subscriptions || [],
      certificates: certificates || [],
      quiz_results: quizResults || [],
      lab_submissions: labSubmissions || [],
      community_posts: communityPosts || [],
      ai_tutor_logs: aiTutorLogs || [],
      referrals: referrals || [],
    }

    return new NextResponse(JSON.stringify(exportData, null, 2), {
      status: 200,
      headers: {
        'Content-Type': 'application/json',
        'Content-Disposition': `attachment; filename="ialgeria-data-export-${user.id}.json"`,
      },
    })
  } catch {
    return errorResponse('INTERNAL_ERROR', 'Impossible d\'exporter vos données', 500)
  }
}
