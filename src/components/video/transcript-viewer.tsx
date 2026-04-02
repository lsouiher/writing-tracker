'use client'

import { useRef, useEffect } from 'react'

interface TranscriptViewerProps {
  transcript: string
  currentTime?: number
  onSeek?: (time: number) => void
}

export function TranscriptViewer({ transcript, currentTime = 0, onSeek }: TranscriptViewerProps) {
  const containerRef = useRef<HTMLDivElement>(null)

  // Split transcript into paragraphs for readability
  const paragraphs = transcript
    .split(/\n\n+/)
    .filter((p) => p.trim().length > 0)

  return (
    <div
      ref={containerRef}
      className="h-full overflow-y-auto p-4 bg-surface rounded-lg border border-border"
    >
      <h3 className="font-display text-lg mb-4 text-foreground">
        Transcription
      </h3>
      <div className="space-y-3">
        {paragraphs.map((paragraph, i) => (
          <p
            key={i}
            className="text-sm text-muted leading-relaxed cursor-pointer hover:text-foreground transition-colors"
            onClick={() => onSeek?.(0)}
          >
            {paragraph}
          </p>
        ))}
        {paragraphs.length === 0 && (
          <p className="text-sm text-text-light italic">
            Transcription non disponible pour cette lecon.
          </p>
        )}
      </div>
    </div>
  )
}
