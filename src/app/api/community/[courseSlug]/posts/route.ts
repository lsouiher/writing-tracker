import { createClient } from '@/lib/supabase/server'
import { successResponse, errorResponse } from '@/lib/api/response'
import { getUserTier } from '@/lib/supabase/queries/subscriptions'
import { getPostsByCourse, createPost, getUserVotesForPosts } from '@/lib/supabase/queries/community'
import { moderateContent } from '@/lib/ai-tutor/moderation'
import { checkApiRateLimit } from '@/lib/redis/api-rate-limit'
import { NextRequest } from 'next/server'

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ courseSlug: string }> }
) {
  try {
    const rateLimited = await checkApiRateLimit(request)
    if (rateLimited) return rateLimited

    const { courseSlug } = await params
    const supabase = await createClient()
    const { data: { user } } = await supabase.auth.getUser()

    if (!user) {
      return errorResponse('UNAUTHORIZED', 'Connectez-vous pour accéder au forum', 401)
    }

    const url = new URL(request.url)
    const sort = (url.searchParams.get('sort') as 'recent' | 'top') || 'recent'
    const cursor = url.searchParams.get('cursor') || undefined
    const limit = parseInt(url.searchParams.get('limit') || '20')

    const { posts, next_cursor } = await getPostsByCourse(supabase, courseSlug, sort, cursor, limit)

    // Enrich with user vote status
    const postIds = posts.map((p: Record<string, unknown>) => p.id as string)
    const userVotes = await getUserVotesForPosts(supabase, user.id, postIds)

    const enrichedPosts = posts.map((post: Record<string, unknown>) => ({
      id: post.id,
      title: post.title,
      body: post.body,
      author_name: (post.author as { full_name: string })?.full_name,
      upvote_count: post.upvote_count,
      reply_count: post.reply_count,
      created_at: post.created_at,
      user_has_voted: userVotes.has(post.id as string),
    }))

    return successResponse({ posts: enrichedPosts, next_cursor })
  } catch {
    return errorResponse('INTERNAL_ERROR', 'Impossible de charger les discussions', 500)
  }
}

export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ courseSlug: string }> }
) {
  try {
    const rateLimited = await checkApiRateLimit(request, 'mutation')
    if (rateLimited) return rateLimited

    const { courseSlug } = await params
    const supabase = await createClient()
    const { data: { user } } = await supabase.auth.getUser()

    if (!user) {
      return errorResponse('UNAUTHORIZED', 'Connectez-vous pour publier', 401)
    }

    const tier = await getUserTier(supabase, user.id)
    if (tier !== 'pro') {
      return errorResponse('FORBIDDEN', 'La publication est réservée aux abonnés Pro', 403)
    }

    const body = await request.json()
    const { title, body: postBody, parent_id } = body

    if (!postBody) {
      return errorResponse('BAD_REQUEST', 'Le contenu est requis', 400)
    }

    // Resolve course_id
    const { data: course } = await supabase
      .from('courses')
      .select('id')
      .eq('slug', courseSlug)
      .single()

    if (!course) {
      return errorResponse('NOT_FOUND', 'Cours introuvable', 404)
    }

    // Create the post
    const post = await createPost(supabase, {
      course_id: course.id,
      author_id: user.id,
      title: parent_id ? null : title,
      body: postBody,
      parent_id,
    })

    // AI moderation (async — don't block the response)
    moderateContent(postBody).then(async (result) => {
      if (result.flagged) {
        await supabase.from('community_posts').update({ is_flagged: true }).eq('id', post.id)
        await supabase.from('moderation_flags').insert({
          post_id: post.id,
          reason: result.reason || 'Contenu signalé par la modération automatique',
        })
      }
    }).catch(() => {
      // Moderation failure shouldn't affect post creation
    })

    return successResponse({ post_id: post.id }, 201)
  } catch {
    return errorResponse('INTERNAL_ERROR', 'Impossible de publier', 500)
  }
}
