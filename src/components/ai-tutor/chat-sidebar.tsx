'use client'

import { useState, useRef, useEffect, useCallback } from 'react'
import { Button } from '@/components/ui/button'

interface Message {
  role: 'user' | 'assistant'
  content: string
}

interface RateLimitInfo {
  limit: number
  remaining: number
  reset: number
}

interface AiTutorChatProps {
  lessonId: string
  isPro: boolean
}

export function AiTutorChat({ lessonId, isPro }: AiTutorChatProps) {
  const [messages, setMessages] = useState<Message[]>([])
  const [input, setInput] = useState('')
  const [isStreaming, setIsStreaming] = useState(false)
  const [rateLimit, setRateLimit] = useState<RateLimitInfo | null>(null)
  const [error, setError] = useState<string | null>(null)
  const messagesEndRef = useRef<HTMLDivElement>(null)
  const inputRef = useRef<HTMLTextAreaElement>(null)

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' })
  }, [messages])

  const sendMessage = useCallback(async () => {
    const question = input.trim()
    if (!question || isStreaming) return

    setInput('')
    setError(null)
    setIsStreaming(true)

    const userMessage: Message = { role: 'user', content: question }
    setMessages(prev => [...prev, userMessage])

    // Build history (last 3 exchanges)
    const history = messages.slice(-6)

    try {
      const response = await fetch('/api/ai-tutor', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ lessonId, question, history }),
      })

      // Update rate limit info from headers
      const limit = response.headers.get('X-RateLimit-Limit')
      const remaining = response.headers.get('X-RateLimit-Remaining')
      const reset = response.headers.get('X-RateLimit-Reset')
      if (limit && remaining && reset) {
        setRateLimit({
          limit: parseInt(limit),
          remaining: parseInt(remaining),
          reset: parseInt(reset),
        })
      }

      if (!response.ok) {
        const errorData = await response.json()
        setError(errorData.error?.message || 'Une erreur est survenue.')
        setIsStreaming(false)
        return
      }

      // Stream SSE response
      const reader = response.body?.getReader()
      if (!reader) {
        setError('Impossible de lire la réponse.')
        setIsStreaming(false)
        return
      }

      const decoder = new TextDecoder()
      let assistantContent = ''
      setMessages(prev => [...prev, { role: 'assistant', content: '' }])

      while (true) {
        const { done, value } = await reader.read()
        if (done) break

        const chunk = decoder.decode(value, { stream: true })
        const lines = chunk.split('\n')

        for (const line of lines) {
          if (!line.startsWith('data: ')) continue
          try {
            const parsed = JSON.parse(line.slice(6))
            if (parsed.type === 'text') {
              assistantContent += parsed.text
              setMessages(prev => {
                const updated = [...prev]
                updated[updated.length - 1] = {
                  role: 'assistant',
                  content: assistantContent,
                }
                return updated
              })
            }
          } catch {
            // Skip malformed SSE chunks
          }
        }
      }
    } catch {
      setError('Connexion au tuteur IA impossible. Réessayez.')
    } finally {
      setIsStreaming(false)
      inputRef.current?.focus()
    }
  }, [input, isStreaming, lessonId, messages])

  const handleKeyDown = (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault()
      sendMessage()
    }
  }

  return (
    <div className="flex flex-col h-full bg-surface rounded-xl border border-border">
      {/* Header */}
      <div className="flex items-center justify-between px-4 py-3 border-b border-border">
        <div className="flex items-center gap-2">
          <div className="w-2 h-2 rounded-full bg-primary animate-pulse" />
          <h3 className="font-display text-lg">Tuteur IA</h3>
        </div>
        {isPro && (
          <span className="text-xs font-medium bg-primary/10 text-primary px-2 py-0.5 rounded-full">
            Pro
          </span>
        )}
      </div>

      {/* Messages */}
      <div className="flex-1 overflow-y-auto px-4 py-3 space-y-4 min-h-0">
        {messages.length === 0 && (
          <div className="text-center text-muted text-sm py-8">
            <p className="font-display text-lg text-text mb-2">
              Posez une question sur cette lecon
            </p>
            <p>
              Le tuteur IA vous aidera a comprendre le contenu en se basant sur la transcription.
            </p>
          </div>
        )}

        {messages.map((msg, i) => (
          <div
            key={i}
            className={`flex ${msg.role === 'user' ? 'justify-end' : 'justify-start'}`}
          >
            <div
              className={`max-w-[85%] rounded-xl px-4 py-2.5 text-sm leading-relaxed whitespace-pre-wrap ${
                msg.role === 'user'
                  ? 'bg-primary text-white rounded-br-sm'
                  : 'bg-surface-alt text-text rounded-bl-sm'
              }`}
            >
              {msg.content}
              {msg.role === 'assistant' && msg.content === '' && isStreaming && (
                <span className="inline-block w-1.5 h-4 bg-primary/60 animate-pulse ml-0.5" />
              )}
            </div>
          </div>
        ))}

        {error && (
          <div className="bg-error/10 text-error text-sm rounded-lg px-4 py-2.5">
            {error}
          </div>
        )}

        <div ref={messagesEndRef} />
      </div>

      {/* Rate limit indicator */}
      {rateLimit && (
        <div className="px-4 py-1.5 text-xs text-muted border-t border-border">
          {rateLimit.remaining}/{rateLimit.limit} questions restantes
        </div>
      )}

      {/* Input */}
      <div className="p-3 border-t border-border">
        <div className="flex gap-2">
          <textarea
            ref={inputRef}
            value={input}
            onChange={e => setInput(e.target.value)}
            onKeyDown={handleKeyDown}
            placeholder="Posez votre question..."
            rows={1}
            className="flex-1 resize-none rounded-lg border border-border bg-background px-3 py-2 text-sm placeholder:text-muted focus:outline-none focus:ring-2 focus:ring-primary/30 focus:border-primary"
            disabled={isStreaming}
          />
          <Button
            size="sm"
            onClick={sendMessage}
            disabled={isStreaming || !input.trim()}
            aria-label="Envoyer"
          >
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <line x1="22" y1="2" x2="11" y2="13" />
              <polygon points="22 2 15 22 11 13 2 9 22 2" />
            </svg>
          </Button>
        </div>
      </div>
    </div>
  )
}
