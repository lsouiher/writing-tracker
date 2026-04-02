'use client'

import Link from 'next/link'

interface ForumPostCardProps {
  id: string
  courseSlug: string
  title: string | null
  body: string
  authorName: string
  upvoteCount: number
  replyCount: number
  createdAt: string
  userHasVoted: boolean
  isPro: boolean
  onVote: (postId: string) => void
}

export function ForumPostCard({
  id,
  courseSlug,
  title,
  body,
  authorName,
  upvoteCount,
  replyCount,
  createdAt,
  userHasVoted,
  isPro,
  onVote,
}: ForumPostCardProps) {
  const timeAgo = getTimeAgo(createdAt)
  const preview = body.length > 200 ? body.slice(0, 200) + '...' : body

  return (
    <div className="bg-surface rounded-xl border border-border p-5 hover:border-primary/20 transition-colors">
      <div className="flex gap-4">
        {/* Vote button */}
        <div className="flex flex-col items-center gap-1 shrink-0">
          <button
            onClick={(e) => {
              e.preventDefault()
              if (isPro) onVote(id)
            }}
            disabled={!isPro}
            className={`w-8 h-8 rounded-lg flex items-center justify-center transition-colors focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-primary ${
              userHasVoted
                ? 'bg-primary text-white'
                : isPro
                  ? 'bg-surface-alt text-muted hover:bg-primary/10 hover:text-primary'
                  : 'bg-surface-alt text-text-light cursor-not-allowed'
            }`}
            aria-label={userHasVoted ? `Retirer le vote (${upvoteCount} votes)` : `Voter pour ce post (${upvoteCount} votes)`}
            aria-pressed={userHasVoted}
            title={isPro ? 'Voter' : 'Réservé aux abonnés Pro'}
          >
            <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 15l7-7 7 7" />
            </svg>
          </button>
          <span className="text-xs font-semibold text-muted">{upvoteCount}</span>
        </div>

        {/* Content */}
        <div className="flex-1 min-w-0">
          <Link href={`/community/${courseSlug}/${id}`}>
            {title && (
              <h3 className="font-medium mb-1 hover:text-primary transition-colors">
                {title}
              </h3>
            )}
            <p className="text-sm text-muted line-clamp-2">{preview}</p>
          </Link>

          <div className="flex items-center gap-4 mt-3 text-xs text-text-light">
            <span>{authorName}</span>
            <span>{timeAgo}</span>
            <span>
              {replyCount} réponse{replyCount !== 1 ? 's' : ''}
            </span>
          </div>
        </div>
      </div>
    </div>
  )
}

function getTimeAgo(dateStr: string): string {
  const diff = Date.now() - new Date(dateStr).getTime()
  const minutes = Math.floor(diff / 60000)
  if (minutes < 1) return "à l'instant"
  if (minutes < 60) return `il y a ${minutes}min`
  const hours = Math.floor(minutes / 60)
  if (hours < 24) return `il y a ${hours}h`
  const days = Math.floor(hours / 24)
  if (days < 30) return `il y a ${days}j`
  return new Date(dateStr).toLocaleDateString('fr-FR')
}
