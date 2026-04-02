'use client'

import { useState, useEffect, useCallback } from 'react'
import { ForumPostCard } from '@/components/community/forum-post-card'
import { Button } from '@/components/ui/button'
import Link from 'next/link'

interface Post {
  id: string
  title: string | null
  body: string
  author_name: string
  upvote_count: number
  reply_count: number
  created_at: string
  user_has_voted: boolean
}

export default function CommunityForumPage({
  params,
}: {
  params: Promise<{ courseSlug: string }>
}) {
  const [courseSlug, setCourseSlug] = useState('')
  const [posts, setPosts] = useState<Post[]>([])
  const [sort, setSort] = useState<'recent' | 'top'>('recent')
  const [nextCursor, setNextCursor] = useState<string | null>(null)
  const [loading, setLoading] = useState(true)
  const [isPro, setIsPro] = useState(false)
  const [showNewPost, setShowNewPost] = useState(false)
  const [newTitle, setNewTitle] = useState('')
  const [newBody, setNewBody] = useState('')
  const [submitting, setSubmitting] = useState(false)

  useEffect(() => {
    params.then((p) => setCourseSlug(p.courseSlug))
  }, [params])

  const loadPosts = useCallback(async (slug: string, s: string, cursor?: string) => {
    const url = `/api/community/${slug}/posts?sort=${s}${cursor ? `&cursor=${cursor}` : ''}`
    const res = await fetch(url)
    const json = await res.json()
    if (json.data) {
      if (cursor) {
        setPosts((prev) => [...prev, ...json.data.posts])
      } else {
        setPosts(json.data.posts)
      }
      setNextCursor(json.data.next_cursor)
    }
  }, [])

  useEffect(() => {
    if (!courseSlug) return

    async function init() {
      setLoading(true)
      // Check if Pro
      const dashRes = await fetch('/api/dashboard')
      const dashData = await dashRes.json()
      setIsPro(!!dashData.data?.subscription)

      await loadPosts(courseSlug, sort)
      setLoading(false)
    }

    init()
  }, [courseSlug, sort, loadPosts])

  const handleVote = useCallback(async (postId: string) => {
    const res = await fetch(`/api/community/posts/${postId}/vote`, { method: 'POST' })
    const json = await res.json()
    if (json.data) {
      setPosts((prev) =>
        prev.map((p) =>
          p.id === postId
            ? { ...p, upvote_count: json.data.new_count, user_has_voted: json.data.upvoted }
            : p
        )
      )
    }
  }, [])

  const handleNewPost = useCallback(async () => {
    if (!newTitle.trim() || !newBody.trim()) return
    setSubmitting(true)

    try {
      const res = await fetch(`/api/community/${courseSlug}/posts`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ title: newTitle, body: newBody }),
      })

      if (res.ok) {
        setNewTitle('')
        setNewBody('')
        setShowNewPost(false)
        await loadPosts(courseSlug, sort)
      }
    } catch {
      // Silent
    } finally {
      setSubmitting(false)
    }
  }, [newTitle, newBody, courseSlug, sort, loadPosts])

  if (loading) {
    return (
      <main className="max-w-3xl mx-auto px-6 py-12">
        <div className="animate-pulse space-y-4">
          <div className="h-8 bg-surface-alt rounded w-1/3" />
          <div className="h-24 bg-surface-alt rounded" />
          <div className="h-24 bg-surface-alt rounded" />
        </div>
      </main>
    )
  }

  return (
    <main className="max-w-3xl mx-auto px-6 py-8">
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="font-display text-2xl mb-1">Forum du cours</h1>
          <Link href={`/courses/${courseSlug}`} className="text-sm text-primary hover:underline">
            Retour au cours
          </Link>
        </div>
        {isPro && (
          <Button variant="accent" onClick={() => setShowNewPost(!showNewPost)}>
            Nouvelle question
          </Button>
        )}
      </div>

      {!isPro && (
        <div className="bg-surface-alt rounded-lg p-4 text-sm text-muted mb-6 text-center">
          Vous pouvez lire les discussions. Abonnez-vous à{' '}
          <Link href="/pricing" className="text-primary font-medium">
            Pro
          </Link>{' '}
          pour participer.
        </div>
      )}

      {/* New post form */}
      {showNewPost && (
        <div className="bg-surface rounded-xl border border-border p-5 mb-6 space-y-3">
          <input
            type="text"
            value={newTitle}
            onChange={(e) => setNewTitle(e.target.value)}
            placeholder="Titre de votre question"
            className="w-full px-4 py-2.5 rounded-lg border border-border bg-background text-sm focus:outline-none focus:border-primary"
          />
          <textarea
            value={newBody}
            onChange={(e) => setNewBody(e.target.value)}
            placeholder="Détaillez votre question..."
            rows={4}
            className="w-full px-4 py-2.5 rounded-lg border border-border bg-background text-sm focus:outline-none focus:border-primary resize-none"
          />
          <div className="flex gap-2">
            <Button onClick={handleNewPost} disabled={submitting} variant="accent" size="sm">
              {submitting ? 'Publication...' : 'Publier'}
            </Button>
            <Button variant="ghost" size="sm" onClick={() => setShowNewPost(false)}>
              Annuler
            </Button>
          </div>
        </div>
      )}

      {/* Sort tabs */}
      <div className="flex gap-1 mb-6 bg-surface-alt rounded-lg p-1">
        {(['recent', 'top'] as const).map((s) => (
          <button
            key={s}
            onClick={() => setSort(s)}
            className={`flex-1 px-4 py-2 text-sm font-medium rounded-md transition-colors ${
              sort === s ? 'bg-surface text-foreground shadow-sm' : 'text-muted hover:text-foreground'
            }`}
          >
            {s === 'recent' ? 'Récent' : 'Populaire'}
          </button>
        ))}
      </div>

      {/* Post list */}
      {posts.length > 0 ? (
        <div className="space-y-3">
          {posts.map((post) => (
            <ForumPostCard
              key={post.id}
              id={post.id}
              courseSlug={courseSlug}
              title={post.title}
              body={post.body}
              authorName={post.author_name}
              upvoteCount={post.upvote_count}
              replyCount={post.reply_count}
              createdAt={post.created_at}
              userHasVoted={post.user_has_voted}
              isPro={isPro}
              onVote={handleVote}
            />
          ))}

          {nextCursor && (
            <div className="text-center pt-4">
              <Button
                variant="ghost"
                size="sm"
                onClick={() => loadPosts(courseSlug, sort, nextCursor)}
              >
                Charger plus
              </Button>
            </div>
          )}
        </div>
      ) : (
        <div className="bg-surface rounded-xl border border-border p-10 text-center">
          <p className="text-muted mb-2">Aucune discussion pour le moment.</p>
          {isPro && (
            <p className="text-sm text-text-light">
              Soyez le premier à poser une question !
            </p>
          )}
        </div>
      )}
    </main>
  )
}
