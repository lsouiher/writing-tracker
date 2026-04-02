'use client'

import { useState, useCallback } from 'react'
import dynamic from 'next/dynamic'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import type { LabLanguage } from '@/types/domain'

const Editor = dynamic(() => import('@monaco-editor/react').then((m) => m.default), {
  ssr: false,
  loading: () => (
    <div className="h-[400px] bg-[#1e1e1e] rounded-lg flex items-center justify-center">
      <p className="text-gray-400 font-mono text-sm">Chargement de l&apos;éditeur...</p>
    </div>
  ),
})

interface TestResult {
  input: string
  expected: string
  actual: string
  passed: boolean
}

interface MonacoLabProps {
  labId: string
  title: string
  description: string
  language: LabLanguage
  starterCode: string
  testCases: { input: string; expected_output: string }[]
}

export function MonacoLab({
  labId,
  title,
  description,
  language,
  starterCode,
  testCases,
}: MonacoLabProps) {
  const [code, setCode] = useState(starterCode)
  const [submitting, setSubmitting] = useState(false)
  const [results, setResults] = useState<TestResult[] | null>(null)
  const [passed, setPassed] = useState<boolean | null>(null)
  const [error, setError] = useState<string | null>(null)

  const monacoLanguage = language === 'r' ? 'r' : language

  const handleSubmit = useCallback(async () => {
    setSubmitting(true)
    setError(null)
    setResults(null)

    try {
      const res = await fetch(`/api/labs/${labId}/submit`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ code, language }),
      })

      const json = await res.json()

      if (!res.ok) {
        setError(json.error?.message || "Erreur lors de l'exécution")
        return
      }

      setResults(json.data.test_results)
      setPassed(json.data.passed)
    } catch {
      setError('Erreur réseau. Veuillez réessayer.')
    } finally {
      setSubmitting(false)
    }
  }, [code, language, labId])

  const handleReset = () => {
    setCode(starterCode)
    setResults(null)
    setPassed(null)
    setError(null)
  }

  return (
    <div className="space-y-6">
      <div>
        <h2 className="font-display text-xl mb-2">{title}</h2>
        <p className="text-muted text-sm">{description}</p>
      </div>

      <div className="flex items-center gap-2 text-sm">
        <Badge variant="primary">{language}</Badge>
        <span className="text-text-light">
          {testCases.length} test{testCases.length > 1 ? 's' : ''} à réussir
        </span>
      </div>

      <div className="rounded-lg overflow-hidden border border-border">
        <Editor
          height="400px"
          language={monacoLanguage}
          value={code}
          onChange={(value) => setCode(value ?? '')}
          theme="vs-dark"
          options={{
            minimap: { enabled: false },
            fontSize: 14,
            fontFamily: 'JetBrains Mono, monospace',
            lineNumbers: 'on',
            scrollBeyondLastLine: false,
            automaticLayout: true,
            tabSize: 2,
            padding: { top: 16 },
          }}
        />
      </div>

      <div className="flex items-center gap-3">
        <Button
          onClick={handleSubmit}
          disabled={submitting || !code.trim()}
          variant="accent"
        >
          {submitting ? 'Exécution...' : 'Exécuter le code'}
        </Button>
        <Button variant="ghost" onClick={handleReset}>
          Réinitialiser
        </Button>
      </div>

      {error && (
        <div className="bg-error/10 border border-error/20 rounded-lg p-4 text-error text-sm">
          {error}
        </div>
      )}

      {results && (
        <div className="space-y-3">
          <div className="flex items-center gap-2">
            <h3 className="font-semibold text-sm">Résultats</h3>
            {passed !== null && (
              <Badge variant={passed ? 'success' : 'error'}>
                {passed ? 'Réussi' : 'Échoué'}
              </Badge>
            )}
          </div>

          <div className="space-y-2">
            {results.map((r, i) => (
              <div
                key={i}
                className={`rounded-lg border p-3 text-sm font-mono ${
                  r.passed
                    ? 'border-success/30 bg-success/5'
                    : 'border-error/30 bg-error/5'
                }`}
              >
                <div className="flex items-center gap-2 mb-1">
                  <span>{r.passed ? '✓' : '✗'}</span>
                  <span className="text-text-light">Test {i + 1}</span>
                </div>
                {r.input && (
                  <div className="text-text-light">
                    Entrée: <span className="text-foreground">{r.input}</span>
                  </div>
                )}
                <div className="text-text-light">
                  Attendu: <span className="text-foreground">{r.expected}</span>
                </div>
                <div className="text-text-light">
                  Obtenu: <span className={r.passed ? 'text-success' : 'text-error'}>{r.actual}</span>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  )
}
