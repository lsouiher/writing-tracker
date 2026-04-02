'use client'

import { useCallback, useState } from 'react'
import { VideoPlayer } from '@/components/video/video-player'
import { TranscriptViewer } from '@/components/video/transcript-viewer'

export default function LessonPage() {
  const [currentTime, setCurrentTime] = useState(0)

  // In production, this data comes from the /api/lessons/[slug]/video endpoint
  // For now, this is a placeholder client component shell
  const videoUrl = ''
  const transcript = ''
  const resumePosition = 0

  const handleProgress = useCallback((position: number, watched: number) => {
    setCurrentTime(position)
    // Debounced save to /api/progress
  }, [])

  return (
    <main className="max-w-7xl mx-auto px-6 py-8">
      <div className="grid lg:grid-cols-3 gap-6">
        {/* Video + controls */}
        <div className="lg:col-span-2 space-y-4">
          <VideoPlayer
            videoUrl={videoUrl}
            resumePosition={resumePosition}
            onProgress={handleProgress}
          />
          <div className="bg-surface rounded-xl border border-border p-6">
            <h1 className="font-display text-2xl mb-2">Titre de la lecon</h1>
            <p className="text-sm text-muted">
              Description de la lecon chargee dynamiquement.
            </p>
          </div>
        </div>

        {/* Transcript sidebar */}
        <div className="lg:col-span-1 h-[600px]">
          <TranscriptViewer
            transcript={transcript}
            currentTime={currentTime}
          />
        </div>
      </div>
    </main>
  )
}
