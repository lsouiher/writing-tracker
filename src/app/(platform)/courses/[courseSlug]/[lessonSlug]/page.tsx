'use client'

import { useCallback, useState } from 'react'
import { VideoPlayer } from '@/components/video/video-player'
import { TranscriptViewer } from '@/components/video/transcript-viewer'
import { AiTutorChat } from '@/components/ai-tutor/chat-sidebar'
import { Button } from '@/components/ui/button'

export default function LessonPage() {
  const [currentTime, setCurrentTime] = useState(0)
  const [showTutor, setShowTutor] = useState(false)

  // In production, this data comes from the /api/lessons/[slug]/video endpoint
  // For now, this is a placeholder client component shell
  const videoUrl = ''
  const transcript = ''
  const resumePosition = 0
  const lessonId = '' // Loaded from API
  const isPro = false // Loaded from subscription check

  const handleProgress = useCallback((position: number, watched: number) => {
    setCurrentTime(position)
    // Debounced save to /api/progress
  }, [])

  return (
    <main className="max-w-7xl mx-auto px-4 sm:px-6 py-4 sm:py-8">
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-4 sm:gap-6">
        {/* Video + controls */}
        <div className="lg:col-span-2 space-y-4">
          <VideoPlayer
            videoUrl={videoUrl}
            resumePosition={resumePosition}
            onProgress={handleProgress}
          />
          <div className="bg-surface rounded-xl border border-border p-6">
            <div className="flex items-center justify-between">
              <h1 className="font-display text-2xl mb-2">Titre de la lecon</h1>
              <Button
                variant="ghost"
                size="sm"
                onClick={() => setShowTutor(!showTutor)}
                className="lg:hidden"
              >
                {showTutor ? 'Transcription' : 'Tuteur IA'}
              </Button>
            </div>
            <p className="text-sm text-muted">
              Description de la lecon chargee dynamiquement.
            </p>
          </div>
        </div>

        {/* Sidebar: Transcript + AI Tutor */}
        <div className="lg:col-span-1 space-y-4">
          {/* Sidebar toggle (desktop) */}
          <div className="hidden lg:flex gap-2" role="tablist" aria-label="Panneau latéral">
            <button
              onClick={() => setShowTutor(false)}
              role="tab"
              aria-selected={!showTutor}
              className={`flex-1 text-sm font-medium py-2 rounded-lg transition-colors focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-primary ${
                !showTutor
                  ? 'bg-primary text-white'
                  : 'bg-surface-alt text-muted hover:text-text'
              }`}
            >
              Transcription
            </button>
            <button
              onClick={() => setShowTutor(true)}
              role="tab"
              aria-selected={showTutor}
              className={`flex-1 text-sm font-medium py-2 rounded-lg transition-colors focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-primary ${
                showTutor
                  ? 'bg-primary text-white'
                  : 'bg-surface-alt text-muted hover:text-text'
              }`}
            >
              Tuteur IA
            </button>
          </div>

          {/* Conditional panel */}
          <div className="h-[400px] lg:h-[560px]">
            {showTutor ? (
              isPro ? (
                <AiTutorChat lessonId={lessonId} isPro={isPro} />
              ) : (
                <div className="flex flex-col items-center justify-center h-full bg-surface rounded-xl border border-border p-6 text-center">
                  <div className="w-12 h-12 rounded-full bg-accent/10 flex items-center justify-center mb-4">
                    <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className="text-accent">
                      <path d="M12 2L2 7l10 5 10-5-10-5z" />
                      <path d="M2 17l10 5 10-5" />
                      <path d="M2 12l10 5 10-5" />
                    </svg>
                  </div>
                  <h3 className="font-display text-xl mb-2">Tuteur IA</h3>
                  <p className="text-sm text-muted mb-4">
                    Posez des questions sur cette lecon et obtenez des reponses personnalisees en francais.
                  </p>
                  <span className="inline-block text-xs font-medium bg-accent/10 text-accent px-3 py-1 rounded-full mb-4">
                    Fonctionnalite Pro
                  </span>
                  <Button variant="accent" size="sm" onClick={() => window.location.href = '/pricing'}>
                    Passer a Pro
                  </Button>
                </div>
              )
            ) : (
              <TranscriptViewer
                transcript={transcript}
                currentTime={currentTime}
              />
            )}
          </div>
        </div>
      </div>
    </main>
  )
}
