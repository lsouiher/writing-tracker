import type { SupabaseClient } from '@supabase/supabase-js'

export async function getPostsByCourse(
  supabase: SupabaseClient,
  courseSlug: string,
  sort: 'recent' | 'top' = 'recent',
  cursor?: string,
  limit = 20
) {
  // Resolve course_id from slug
  const { data: course } = await supabase
    .from('courses')
    .select('id')
    .eq('slug', courseSlug)
    .single()

  if (!course) return { posts: [], next_cursor: null }

  let query = supabase
    .from('community_posts')
    .select(`
      id, title, body, upvote_count, created_at, updated_at,
      author:users!author_id(full_name),
      replies:community_posts!parent_id(count)
    `)
    .eq('course_id', course.id)
    .is('parent_id', null)
    .eq('is_removed', false)
    .limit(limit)

  if (sort === 'top') {
    query = query.order('upvote_count', { ascending: false })
  } else {
    query = query.order('created_at', { ascending: false })
  }

  if (cursor) {
    query = query.lt('id', cursor)
  }

  const { data, error } = await query
  if (error) return { posts: [], next_cursor: null }

  const posts = (data || []).map((post: Record<string, unknown>) => {
    const replies = post.replies as { count: number }[] | undefined
    return {
      ...post,
      reply_count: replies?.[0]?.count ?? 0,
    }
  })

  const next_cursor = posts.length === limit ? (posts[posts.length - 1] as Record<string, unknown>).id as string : null

  return { posts, next_cursor }
}

export async function getPostWithReplies(supabase: SupabaseClient, postId: string) {
  const { data: post, error } = await supabase
    .from('community_posts')
    .select(`
      id, title, body, upvote_count, created_at, updated_at, course_id,
      author:users!author_id(full_name)
    `)
    .eq('id', postId)
    .eq('is_removed', false)
    .single()

  if (error || !post) return null

  const { data: replies } = await supabase
    .from('community_posts')
    .select(`
      id, body, upvote_count, created_at,
      author:users!author_id(full_name)
    `)
    .eq('parent_id', postId)
    .eq('is_removed', false)
    .order('created_at', { ascending: true })

  return { ...post, replies: replies || [] }
}

export async function createPost(
  supabase: SupabaseClient,
  data: {
    course_id: string
    author_id: string
    title?: string | null
    body: string
    parent_id?: string | null
  }
) {
  const { data: post, error } = await supabase
    .from('community_posts')
    .insert({
      course_id: data.course_id,
      author_id: data.author_id,
      title: data.title ?? null,
      body: data.body,
      parent_id: data.parent_id ?? null,
    })
    .select()
    .single()

  if (error) throw error
  return post
}

export async function toggleVote(supabase: SupabaseClient, userId: string, postId: string) {
  // Check if vote exists
  const { data: existing } = await supabase
    .from('post_votes')
    .select('user_id')
    .eq('user_id', userId)
    .eq('post_id', postId)
    .single()

  if (existing) {
    // Remove vote
    await supabase
      .from('post_votes')
      .delete()
      .eq('user_id', userId)
      .eq('post_id', postId)

    // Decrement count
    const { error: rpcError } = await supabase.rpc('decrement_upvote', { p_post_id: postId })
    if (rpcError) {
      // Fallback: recount votes
      const { count } = await supabase
        .from('post_votes')
        .select('*', { count: 'exact', head: true })
        .eq('post_id', postId)
      await supabase
        .from('community_posts')
        .update({ upvote_count: count ?? 0 })
        .eq('id', postId)
    }

    // Get updated count
    const { data: post } = await supabase
      .from('community_posts')
      .select('upvote_count')
      .eq('id', postId)
      .single()

    return { upvoted: false, new_count: post?.upvote_count ?? 0 }
  } else {
    // Add vote
    await supabase
      .from('post_votes')
      .insert({ user_id: userId, post_id: postId })

    // Increment count
    const { error: rpcError } = await supabase.rpc('increment_upvote', { p_post_id: postId })
    if (rpcError) {
      const { count } = await supabase
        .from('post_votes')
        .select('*', { count: 'exact', head: true })
        .eq('post_id', postId)
      await supabase
        .from('community_posts')
        .update({ upvote_count: count ?? 0 })
        .eq('id', postId)
    }

    const { data: post } = await supabase
      .from('community_posts')
      .select('upvote_count')
      .eq('id', postId)
      .single()

    return { upvoted: true, new_count: post?.upvote_count ?? 0 }
  }
}

export async function getUserVotesForPosts(supabase: SupabaseClient, userId: string, postIds: string[]) {
  if (postIds.length === 0) return new Set<string>()

  const { data } = await supabase
    .from('post_votes')
    .select('post_id')
    .eq('user_id', userId)
    .in('post_id', postIds)

  return new Set((data || []).map((v: { post_id: string }) => v.post_id))
}

export async function getFlaggedPosts(supabase: SupabaseClient) {
  const { data, error } = await supabase
    .from('moderation_flags')
    .select(`
      id, reason, created_at, reviewed,
      post:community_posts!inner(
        id, title, body,
        author:users!author_id(full_name)
      )
    `)
    .eq('reviewed', false)
    .order('created_at', { ascending: false })

  if (error) return []
  return data
}
