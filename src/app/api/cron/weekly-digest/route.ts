import { createClient } from '@/lib/supabase/server'
import { successResponse, errorResponse } from '@/lib/api/response'
import { sendEmail } from '@/lib/email/send'
import { renderWeeklyDigest } from '@/lib/email/templates/weekly-digest'

export async function GET(request: Request) {
  try {
    // Verify cron secret (Vercel Cron sends this header)
    const authHeader = request.headers.get('authorization')
    if (authHeader !== `Bearer ${process.env.CRON_SECRET}`) {
      return errorResponse('UNAUTHORIZED', 'Invalid cron secret', 401)
    }

    const supabase = await createClient()
    const siteUrl = process.env.NEXT_PUBLIC_SITE_URL || 'https://ialgeria.com'

    // Get top posts from the last 7 days
    const oneWeekAgo = new Date(Date.now() - 7 * 24 * 60 * 60 * 1000).toISOString()

    const { data: topPosts } = await supabase
      .from('community_posts')
      .select(`
        id, title, upvote_count, created_at,
        author:users!author_id(full_name),
        course:courses!course_id(slug, title),
        replies:community_posts!parent_id(count)
      `)
      .is('parent_id', null)
      .eq('is_removed', false)
      .gte('created_at', oneWeekAgo)
      .order('upvote_count', { ascending: false })
      .limit(5)

    // Get new courses from the last 7 days
    const { data: newCourses } = await supabase
      .from('courses')
      .select('slug, title, level')
      .eq('is_published', true)
      .gte('created_at', oneWeekAgo)
      .order('created_at', { ascending: false })
      .limit(3)

    // If no content, skip sending
    if ((!topPosts || topPosts.length === 0) && (!newCourses || newCourses.length === 0)) {
      return successResponse({ sent: 0, reason: 'No content for digest' })
    }

    // Get all active users (with active or trialing subscriptions get priority, but send to all)
    const { data: users } = await supabase
      .from('users')
      .select('email, full_name')
      .is('deleted_at', null)
      .limit(1000)

    if (!users || users.length === 0) {
      return successResponse({ sent: 0, reason: 'No users' })
    }

    const digestPosts = (topPosts || []).map((post: Record<string, unknown>) => ({
      title: (post.title as string) || 'Sans titre',
      author_name: (post.author as { full_name: string })?.full_name || 'Anonyme',
      upvote_count: post.upvote_count as number,
      reply_count: ((post.replies as { count: number }[])?.[0]?.count) ?? 0,
      course_title: (post.course as { title: string })?.title || '',
      url: `${siteUrl}/community/${(post.course as { slug: string })?.slug}/${post.id}`,
    }))

    const digestCourses = (newCourses || []).map((course: Record<string, unknown>) => ({
      title: course.title as string,
      level: course.level as string,
      url: `${siteUrl}/courses/${course.slug}`,
    }))

    // Send emails in batches
    let sent = 0
    for (const user of users) {
      const html = renderWeeklyDigest({
        userName: user.full_name,
        topPosts: digestPosts,
        newCourses: digestCourses,
        siteUrl,
      })

      const result = await sendEmail({
        to: user.email,
        subject: 'Votre digest hebdomadaire — IAlgeria',
        html,
      })

      if (result) sent++
    }

    return successResponse({ sent, total: users.length })
  } catch {
    return errorResponse('INTERNAL_ERROR', "Erreur lors de l'envoi du digest", 500)
  }
}
