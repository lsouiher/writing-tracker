'use client'

import { useCallback, useEffect, useRef, useState } from 'react'

interface VideoPlayerProps {
  videoUrl: string
  subtitleUrlFr?: string
  subtitleUrlEn?: string
  resumePosition?: number
  onProgress?: (position: number, watched: number) => void
}

export function VideoPlayer({
  videoUrl,
  subtitleUrlFr,
  subtitleUrlEn,
  resumePosition = 0,
  onProgress,
}: VideoPlayerProps) {
  const iframeRef = useRef<HTMLIFrameElement>(null)
  const [isLoading, setIsLoading] = useState(true)
  const watchedRef = useRef(0)

  const handleMessage = useCallback(
    (event: MessageEvent) => {
      if (typeof event.data !== 'object') return

      const { type, position, duration } = event.data || {}

      if (type === 'timeupdate' && onProgress) {
        // Track cumulative watched seconds (not just position)
        watchedRef.current = Math.max(watchedRef.current, position || 0)
        onProgress(position || 0, watchedRef.current)
      }

      if (type === 'ready') {
        setIsLoading(false)
      }
    },
    [onProgress]
  )

  useEffect(() => {
    window.addEventListener('message', handleMessage)
    return () => window.removeEventListener('message', handleMessage)
  }, [handleMessage])

  // Build URL with resume position and subtitle tracks
  let fullUrl = videoUrl
  if (resumePosition > 0) {
    fullUrl += `&t=${resumePosition}`
  }
  if (subtitleUrlFr) {
    fullUrl += `&captions=${encodeURIComponent(subtitleUrlFr)}`
  }

  return (
    <div className="relative w-full aspect-video bg-black rounded-lg overflow-hidden">
      {isLoading && (
        <div className="absolute inset-0 flex items-center justify-center bg-surface-alt">
          <div className="w-8 h-8 border-2 border-primary border-t-transparent rounded-full animate-spin" />
        </div>
      )}
      <iframe
        ref={iframeRef}
        src={fullUrl}
        className="w-full h-full"
        allow="accelerometer; autoplay; encrypted-media; gyroscope; picture-in-picture"
        allowFullScreen
        loading="lazy"
        title="Video du cours"
      />
    </div>
  )
}
