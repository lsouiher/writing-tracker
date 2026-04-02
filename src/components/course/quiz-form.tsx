'use client'

import { useState, useCallback } from 'react'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'

interface Question {
  type: 'mcq' | 'short_answer'
  question: string
  options?: string[]
  correct_answer: string
  explanation: string
}

interface Feedback {
  question_index: number
  correct: boolean
  explanation: string
}

interface QuizFormProps {
  quizId: string
  title: string
  questions: Question[]
  passingScore: number
}

export function QuizForm({ quizId, title, questions, passingScore }: QuizFormProps) {
  const [answers, setAnswers] = useState<Record<number, string>>({})
  const [submitting, setSubmitting] = useState(false)
  const [result, setResult] = useState<{
    score: number
    passed: boolean
    feedback: Feedback[]
  } | null>(null)
  const [error, setError] = useState<string | null>(null)

  const handleAnswer = (index: number, value: string) => {
    setAnswers((prev) => ({ ...prev, [index]: value }))
  }

  const handleSubmit = useCallback(async () => {
    setSubmitting(true)
    setError(null)

    const formattedAnswers = Object.entries(answers).map(([index, answer]) => ({
      question_index: parseInt(index),
      answer,
    }))

    try {
      const res = await fetch(`/api/quizzes/${quizId}/submit`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ answers: formattedAnswers }),
      })

      const json = await res.json()

      if (!res.ok) {
        setError(json.error?.message || 'Erreur lors de la soumission')
        return
      }

      setResult(json.data)
    } catch {
      setError('Erreur réseau. Veuillez réessayer.')
    } finally {
      setSubmitting(false)
    }
  }, [answers, quizId])

  const handleRetry = () => {
    setAnswers({})
    setResult(null)
    setError(null)
  }

  const allAnswered = Object.keys(answers).length === questions.length

  return (
    <div className="space-y-8">
      <div>
        <h2 className="font-display text-xl mb-2">{title}</h2>
        <p className="text-muted text-sm">
          Score minimum requis : {passingScore}%
        </p>
      </div>

      {result && (
        <div
          className={`rounded-xl border p-6 text-center ${
            result.passed
              ? 'border-success/30 bg-success/5'
              : 'border-error/30 bg-error/5'
          }`}
        >
          <div className="text-3xl font-display mb-2">{result.score}%</div>
          <Badge variant={result.passed ? 'success' : 'error'} className="text-sm">
            {result.passed ? 'Quiz réussi !' : 'Quiz échoué'}
          </Badge>
          {!result.passed && (
            <p className="text-muted text-sm mt-3">
              Vous devez obtenir au moins {passingScore}% pour réussir ce quiz.
            </p>
          )}
        </div>
      )}

      <div className="space-y-6">
        {questions.map((q, i) => {
          const feedback = result?.feedback.find((f) => f.question_index === i)

          return (
            <div
              key={i}
              className={`bg-surface rounded-xl border p-6 ${
                feedback
                  ? feedback.correct
                    ? 'border-success/30'
                    : 'border-error/30'
                  : 'border-border'
              }`}
            >
              <div className="flex items-start gap-3 mb-4">
                <span className="bg-primary/10 text-primary text-xs font-bold rounded-full w-6 h-6 flex items-center justify-center shrink-0 mt-0.5">
                  {i + 1}
                </span>
                <p className="font-medium">{q.question}</p>
              </div>

              {q.type === 'mcq' && q.options ? (
                <div className="space-y-2 ml-9">
                  {q.options.map((option, optIdx) => {
                    const letter = String.fromCharCode(65 + optIdx)
                    const selected = answers[i] === letter
                    const isCorrect = feedback && letter === q.correct_answer
                    const isWrong = feedback && selected && !feedback.correct

                    return (
                      <label
                        key={optIdx}
                        className={`flex items-center gap-3 p-3 rounded-lg border cursor-pointer transition-colors ${
                          isCorrect
                            ? 'border-success/50 bg-success/5'
                            : isWrong
                              ? 'border-error/50 bg-error/5'
                              : selected
                                ? 'border-primary bg-primary/5'
                                : 'border-border hover:border-primary/30'
                        } ${result ? 'pointer-events-none' : ''}`}
                      >
                        <input
                          type="radio"
                          name={`question-${i}`}
                          value={letter}
                          checked={selected}
                          onChange={() => handleAnswer(i, letter)}
                          disabled={!!result}
                          className="sr-only"
                        />
                        <span
                          className={`w-6 h-6 rounded-full border-2 flex items-center justify-center text-xs font-bold shrink-0 ${
                            selected
                              ? 'border-primary bg-primary text-white'
                              : 'border-border text-muted'
                          }`}
                        >
                          {letter}
                        </span>
                        <span className="text-sm">{option}</span>
                      </label>
                    )
                  })}
                </div>
              ) : (
                <div className="ml-9">
                  <input
                    type="text"
                    value={answers[i] ?? ''}
                    onChange={(e) => handleAnswer(i, e.target.value)}
                    disabled={!!result}
                    placeholder="Votre réponse..."
                    className="w-full px-4 py-2.5 rounded-lg border border-border bg-background text-sm focus:outline-none focus:border-primary disabled:opacity-60"
                  />
                </div>
              )}

              {feedback && (
                <div
                  className={`mt-3 ml-9 p-3 rounded-lg text-sm ${
                    feedback.correct ? 'bg-success/5 text-success' : 'bg-error/5 text-error'
                  }`}
                >
                  <span className="font-semibold">
                    {feedback.correct ? 'Correct !' : 'Incorrect.'}
                  </span>{' '}
                  {feedback.explanation}
                </div>
              )}
            </div>
          )
        })}
      </div>

      {error && (
        <div className="bg-error/10 border border-error/20 rounded-lg p-4 text-error text-sm">
          {error}
        </div>
      )}

      <div className="flex items-center gap-3">
        {!result ? (
          <Button
            onClick={handleSubmit}
            disabled={!allAnswered || submitting}
            variant="accent"
            size="lg"
          >
            {submitting ? 'Vérification...' : 'Soumettre le quiz'}
          </Button>
        ) : (
          !result.passed && (
            <Button onClick={handleRetry} variant="accent" size="lg">
              Réessayer
            </Button>
          )
        )}
      </div>
    </div>
  )
}
