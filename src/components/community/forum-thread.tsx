'use client'

import { useState, useCallback } from 'react'
import { Button } from '@/components/ui/button'

interface Reply {
  id: string
  body: string
  upvote_count: number
  created_at: string
  author: { full_name: string }
}

interface ForumThreadProps {
  postId: string
  courseSlug: string
  title: string | null
  body: string
  authorName: string
  upvoteCount: number
  createdAt: string
  replies: Reply[]
  isPro: boolean
  userHasVoted: boolean
  onVote: (postId: string) => void
}

export function ForumThread({
  postId,
  courseSlug,
  title,
  body,
  authorName,
  upvoteCount,
  createdAt,
  replies,
  isPro,
  userHasVoted,
  onVote,
}: ForumThreadProps) {
  const [replyText, setReplyText] = useState('')
  const [submitting, setSubmitting] = useState(false)
  const [localReplies, setLocalReplies] = useState(replies)

  const handleReply = useCallback(async () => {
    if (!replyText.trim()) return
    setSubmitting(true)

    try {
      const res = await fetch(`/api/community/${courseSlug}/posts`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ body: replyText, parent_id: postId }),
      })

      if (res.ok) {
        setLocalReplies((prev) => [
          ...prev,
          {
            id: crypto.randomUUID(),
            body: replyText,
            upvote_count: 0,
            created_at: new Date().toISOString(),
            author: { full_name: 'Vous' },
          },
        ])
        setReplyText('')
      }
    } catch {
      // Silent fail
    } finally {
      setSubmitting(false)
    }
  }, [replyText, courseSlug, postId])

  const date = new Date(createdAt).toLocaleDateString('fr-FR', {
    day: 'numeric',
    month: 'long',
    year: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
  })

  return (
    <div className="space-y-6">
      {/* Original post */}
      <div className="bg-surface rounded-xl border border-border p-6">
        <div className="flex gap-4">
          <div className="flex flex-col items-center gap-1 shrink-0">
            <button
              onClick={() => isPro && onVote(postId)}
              disabled={!isPro}
              className={`w-10 h-10 rounded-lg flex items-center justify-center transition-colors ${
                userHasVoted
                  ? 'bg-primary text-white'
                  : isPro
                    ? 'bg-surface-alt text-muted hover:bg-primary/10 hover:text-primary'
                    : 'bg-surface-alt text-text-light cursor-not-allowed'
              }`}
            >
              <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 15l7-7 7 7" />
              </svg>
            </button>
            <span className="text-sm font-semibold text-muted">{upvoteCount}</span>
          </div>

          <div className="flex-1">
            {title && <h1 className="font-display text-2xl mb-3">{title}</h1>}
            <div className="prose prose-sm max-w-none text-foreground whitespace-pre-wrap">
              {body}
            </div>
            <div className="flex items-center gap-3 mt-4 text-xs text-text-light">
              <span className="font-medium text-foreground">{authorName}</span>
              <span>{date}</span>
            </div>
          </div>
        </div>
      </div>

      {/* Replies */}
      <div>
        <h2 className="font-medium text-sm text-muted mb-4">
          {localReplies.length} réponse{localReplies.length !== 1 ? 's' : ''}
        </h2>

        <div className="space-y-3">
          {localReplies.map((reply) => (
            <div
              key={reply.id}
              className="bg-surface rounded-lg border border-border p-4 ml-6"
            >
              <div className="whitespace-pre-wrap text-sm">{reply.body}</div>
              <div className="flex items-center gap-3 mt-3 text-xs text-text-light">
                <span className="font-medium text-foreground">
                  {reply.author.full_name}
                </span>
                <span>
                  {new Date(reply.created_at).toLocaleDateString('fr-FR', {
                    day: 'numeric',
                    month: 'short',
                    hour: '2-digit',
                    minute: '2-digit',
                  })}
                </span>
                <span>{reply.upvote_count} vote{reply.upvote_count !== 1 ? 's' : ''}</span>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Reply form */}
      {isPro ? (
        <div className="bg-surface rounded-xl border border-border p-5">
          <h3 className="font-medium text-sm mb-3">Votre réponse</h3>
          <textarea
            value={replyText}
            onChange={(e) => setReplyText(e.target.value)}
            placeholder="Rédigez votre réponse..."
            rows={4}
            className="w-full px-4 py-2.5 rounded-lg border border-border bg-background text-sm focus:outline-none focus:border-primary resize-none mb-3"
          />
          <Button
            onClick={handleReply}
            disabled={!replyText.trim() || submitting}
            variant="primary"
            size="sm"
          >
            {submitting ? 'Publication...' : 'Répondre'}
          </Button>
        </div>
      ) : (
        <div className="bg-surface-alt rounded-lg p-4 text-center text-sm text-muted">
          Abonnez-vous à Pro pour participer aux discussions.
        </div>
      )}
    </div>
  )
}
