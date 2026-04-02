'use client'

import { useState, useEffect, useCallback } from 'react'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { PaywallPrompt } from '@/components/ui/paywall-prompt'

interface Submission {
  id: string
  title: string
  description: string
  repository_url: string | null
  submitted_code: string | null
  ai_score: number | null
  ai_feedback: string | null
  status: string
  peer_review_open: boolean
  reviews: {
    id: string
    rating: number
    comment: string
    created_at: string
    reviewer: { full_name: string }
  }[]
}

export default function CapstonePage({
  params,
}: {
  params: Promise<{ courseSlug: string }>
}) {
  const [courseSlug, setCourseSlug] = useState('')
  const [submission, setSubmission] = useState<Submission | null>(null)
  const [loading, setLoading] = useState(true)
  const [isPro, setIsPro] = useState(true)
  const [courseId, setCourseId] = useState('')

  // Form state
  const [title, setTitle] = useState('')
  const [description, setDescription] = useState('')
  const [repositoryUrl, setRepositoryUrl] = useState('')
  const [submittedCode, setSubmittedCode] = useState('')
  const [submitting, setSubmitting] = useState(false)
  const [grading, setGrading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    params.then((p) => setCourseSlug(p.courseSlug))
  }, [params])

  useEffect(() => {
    if (!courseSlug) return

    async function load() {
      try {
        // Fetch course for ID
        const courseRes = await fetch(`/api/courses/${courseSlug}`)
        const courseData = await courseRes.json()
        if (!courseData.data) return
        setCourseId(courseData.data.id)

        // Check subscription
        const dashRes = await fetch('/api/dashboard')
        const dashData = await dashRes.json()
        if (!dashData.data?.subscription) {
          setIsPro(false)
          setLoading(false)
          return
        }

        // Try to fetch existing submission
        // The submission loads via the page's own data fetching
        setLoading(false)
      } catch {
        setLoading(false)
      }
    }

    load()
  }, [courseSlug])

  const handleSubmit = useCallback(async () => {
    if (!title || !description || !courseId) return
    setSubmitting(true)
    setError(null)

    try {
      const res = await fetch('/api/capstones', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          course_id: courseId,
          title,
          description,
          repository_url: repositoryUrl || null,
          submitted_code: submittedCode || null,
        }),
      })

      const json = await res.json()
      if (!res.ok) {
        setError(json.error?.message || 'Erreur')
        return
      }

      setSubmission({
        id: json.data.submission_id,
        title,
        description,
        repository_url: repositoryUrl || null,
        submitted_code: submittedCode || null,
        ai_score: null,
        ai_feedback: null,
        status: 'submitted',
        peer_review_open: false,
        reviews: [],
      })
    } catch {
      setError('Erreur réseau')
    } finally {
      setSubmitting(false)
    }
  }, [title, description, repositoryUrl, submittedCode, courseId])

  const handleGrade = useCallback(async () => {
    if (!submission) return
    setGrading(true)
    setError(null)

    try {
      const res = await fetch(`/api/capstones/${submission.id}/grade`, {
        method: 'POST',
      })

      const json = await res.json()
      if (!res.ok) {
        setError(json.error?.message || 'Erreur')
        return
      }

      setSubmission((prev) =>
        prev
          ? {
              ...prev,
              ai_score: json.data.score,
              ai_feedback: json.data.feedback,
              status: json.data.status,
              peer_review_open: json.data.passed,
            }
          : null
      )
    } catch {
      setError("Erreur lors de l'évaluation")
    } finally {
      setGrading(false)
    }
  }, [submission])

  if (loading) {
    return (
      <main className="max-w-3xl mx-auto px-6 py-12">
        <div className="animate-pulse space-y-4">
          <div className="h-8 bg-surface-alt rounded w-1/3" />
          <div className="h-4 bg-surface-alt rounded w-2/3" />
        </div>
      </main>
    )
  }

  if (!isPro) {
    return (
      <main className="max-w-2xl mx-auto px-6 py-12">
        <PaywallPrompt feature="Les projets capstone" />
      </main>
    )
  }

  return (
    <main className="max-w-3xl mx-auto px-6 py-8">
      <h1 className="font-display text-2xl mb-2">Projet Capstone</h1>
      <p className="text-muted text-sm mb-8">
        Soumettez votre projet de fin de cours pour obtenir une évaluation par l&apos;IA et vos pairs.
      </p>

      {error && (
        <div className="bg-error/10 border border-error/20 rounded-lg p-4 text-error text-sm mb-6">
          {error}
        </div>
      )}

      {!submission ? (
        <div className="bg-surface rounded-xl border border-border p-6 space-y-4">
          <div>
            <label className="block text-sm font-medium mb-1">Titre du projet</label>
            <input
              type="text"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              placeholder="Mon projet de Machine Learning"
              className="w-full px-4 py-2.5 rounded-lg border border-border bg-background text-sm focus:outline-none focus:border-primary"
            />
          </div>
          <div>
            <label className="block text-sm font-medium mb-1">Description</label>
            <textarea
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              placeholder="Décrivez votre projet, les techniques utilisées, les résultats..."
              rows={5}
              className="w-full px-4 py-2.5 rounded-lg border border-border bg-background text-sm focus:outline-none focus:border-primary resize-none"
            />
          </div>
          <div>
            <label className="block text-sm font-medium mb-1">URL du dépôt (optionnel)</label>
            <input
              type="url"
              value={repositoryUrl}
              onChange={(e) => setRepositoryUrl(e.target.value)}
              placeholder="https://github.com/..."
              className="w-full px-4 py-2.5 rounded-lg border border-border bg-background text-sm focus:outline-none focus:border-primary"
            />
          </div>
          <div>
            <label className="block text-sm font-medium mb-1">Code soumis (optionnel)</label>
            <textarea
              value={submittedCode}
              onChange={(e) => setSubmittedCode(e.target.value)}
              placeholder="Collez votre code ici si pas de dépôt..."
              rows={8}
              className="w-full px-4 py-2.5 rounded-lg border border-border bg-background text-sm font-mono focus:outline-none focus:border-primary resize-none"
            />
          </div>
          <Button
            onClick={handleSubmit}
            disabled={!title || !description || submitting}
            variant="accent"
            size="lg"
          >
            {submitting ? 'Soumission...' : 'Soumettre le projet'}
          </Button>
        </div>
      ) : (
        <div className="space-y-6">
          {/* Submission info */}
          <div className="bg-surface rounded-xl border border-border p-6">
            <div className="flex items-center justify-between mb-4">
              <h2 className="font-medium text-lg">{submission.title}</h2>
              <Badge
                variant={
                  submission.status === 'approved'
                    ? 'success'
                    : submission.status === 'graded'
                      ? 'warning'
                      : submission.status === 'grading'
                        ? 'primary'
                        : 'default'
                }
              >
                {submission.status === 'approved'
                  ? 'Approuvé'
                  : submission.status === 'graded'
                    ? 'Évalué'
                    : submission.status === 'grading'
                      ? 'Évaluation en cours...'
                      : 'Soumis'}
              </Badge>
            </div>
            <p className="text-muted text-sm">{submission.description}</p>
          </div>

          {/* AI grading button or results */}
          {submission.status === 'submitted' && (
            <Button onClick={handleGrade} disabled={grading} variant="accent">
              {grading ? 'Évaluation en cours...' : "Lancer l'évaluation IA"}
            </Button>
          )}

          {submission.ai_score !== null && (
            <div
              className={`rounded-xl border p-6 ${
                submission.ai_score >= 70
                  ? 'border-success/30 bg-success/5'
                  : 'border-error/30 bg-error/5'
              }`}
            >
              <div className="flex items-center gap-4 mb-4">
                <div className="text-3xl font-display">{submission.ai_score}%</div>
                <Badge variant={submission.ai_score >= 70 ? 'success' : 'error'}>
                  {submission.ai_score >= 70 ? 'Réussi' : 'Insuffisant'}
                </Badge>
              </div>
              <p className="text-sm whitespace-pre-wrap">{submission.ai_feedback}</p>
            </div>
          )}

          {/* Peer reviews */}
          {submission.reviews.length > 0 && (
            <div>
              <h3 className="font-medium mb-3">Évaluations des pairs</h3>
              <div className="space-y-3">
                {submission.reviews.map((review) => (
                  <div key={review.id} className="bg-surface rounded-lg border border-border p-4">
                    <div className="flex items-center justify-between mb-2">
                      <span className="text-sm font-medium">{review.reviewer.full_name}</span>
                      <span className="text-sm text-primary font-medium">{review.rating}/5</span>
                    </div>
                    <p className="text-sm text-muted">{review.comment}</p>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      )}
    </main>
  )
}
