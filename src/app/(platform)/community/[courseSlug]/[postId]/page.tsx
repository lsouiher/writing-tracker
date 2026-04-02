'use client'

import { useState, useEffect, useCallback } from 'react'
import { ForumThread } from '@/components/community/forum-thread'
import Link from 'next/link'

interface PostData {
  id: string
  title: string | null
  body: string
  upvote_count: number
  created_at: string
  course_id: string
  author: { full_name: string }
  replies: {
    id: string
    body: string
    upvote_count: number
    created_at: string
    author: { full_name: string }
  }[]
}

export default function ForumThreadPage({
  params,
}: {
  params: Promise<{ courseSlug: string; postId: string }>
}) {
  const [courseSlug, setCourseSlug] = useState('')
  const [postId, setPostId] = useState('')
  const [post, setPost] = useState<PostData | null>(null)
  const [loading, setLoading] = useState(true)
  const [isPro, setIsPro] = useState(false)
  const [userHasVoted, setUserHasVoted] = useState(false)

  useEffect(() => {
    params.then((p) => {
      setCourseSlug(p.courseSlug)
      setPostId(p.postId)
    })
  }, [params])

  useEffect(() => {
    if (!courseSlug || !postId) return

    async function load() {
      try {
        // Check subscription
        const dashRes = await fetch('/api/dashboard')
        const dashData = await dashRes.json()
        setIsPro(!!dashData.data?.subscription)

        // Load post with replies
        const postRes = await fetch(`/api/community/posts/${postId}`)
        const postData = await postRes.json()

        if (postData.data) {
          setPost(postData.data)
          setUserHasVoted(postData.data.user_has_voted)
        }

        setLoading(false)
      } catch {
        setLoading(false)
      }
    }

    load()
  }, [courseSlug, postId])

  const handleVote = useCallback(async (id: string) => {
    const res = await fetch(`/api/community/posts/${id}/vote`, { method: 'POST' })
    const json = await res.json()
    if (json.data) {
      setPost((prev) =>
        prev && prev.id === id
          ? { ...prev, upvote_count: json.data.new_count }
          : prev
      )
      setUserHasVoted(json.data.upvoted)
    }
  }, [])

  if (loading || !post) {
    // Render a placeholder thread while loading
    // We'll show a loading state that resolves to the thread component
    return (
      <main className="max-w-3xl mx-auto px-6 py-8">
        <Link href={`/community/${courseSlug}`} className="text-sm text-primary hover:underline mb-6 inline-block">
          ← Retour au forum
        </Link>
        <div className="animate-pulse space-y-4">
          <div className="h-8 bg-surface-alt rounded w-2/3" />
          <div className="h-32 bg-surface-alt rounded" />
          <div className="h-20 bg-surface-alt rounded ml-6" />
        </div>
      </main>
    )
  }

  return (
    <main className="max-w-3xl mx-auto px-6 py-8">
      <Link href={`/community/${courseSlug}`} className="text-sm text-primary hover:underline mb-6 inline-block">
        ← Retour au forum
      </Link>

      <ForumThread
        postId={post.id}
        courseSlug={courseSlug}
        title={post.title}
        body={post.body}
        authorName={post.author.full_name}
        upvoteCount={post.upvote_count}
        createdAt={post.created_at}
        replies={post.replies}
        isPro={isPro}
        userHasVoted={userHasVoted}
        onVote={handleVote}
      />
    </main>
  )
}
