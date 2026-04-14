'use client'

import { useRef, useEffect, useState, useCallback } from 'react'
import { Camera, RefreshCw, AlertCircle } from 'lucide-react'
import { Button } from '@/components/ui/button'

interface Props {
  onCapture: (blob: Blob, dataUrl: string) => void
}

export function CameraCapture({ onCapture }: Props) {
  const videoRef = useRef<HTMLVideoElement>(null)
  const streamRef = useRef<MediaStream | null>(null)
  const [ready, setReady] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const startCamera = useCallback(async () => {
    setError(null)
    try {
      const stream = await navigator.mediaDevices.getUserMedia({
        video: { facingMode: { ideal: 'environment' }, width: { ideal: 1280 }, height: { ideal: 960 } },
      })
      streamRef.current = stream
      if (videoRef.current) {
        videoRef.current.srcObject = stream
      }
    } catch {
      setError('Camera access denied. Tap to retry, or check your browser permissions.')
    }
  }, [])

  useEffect(() => {
    startCamera()
    return () => {
      streamRef.current?.getTracks().forEach(t => t.stop())
    }
  }, [startCamera])

  function handleCapture() {
    const video = videoRef.current
    if (!video || !ready) return

    const canvas = document.createElement('canvas')
    canvas.width  = video.videoWidth
    canvas.height = video.videoHeight
    canvas.getContext('2d')?.drawImage(video, 0, 0)

    canvas.toBlob(
      blob => {
        if (!blob) return
        streamRef.current?.getTracks().forEach(t => t.stop())
        onCapture(blob, canvas.toDataURL('image/jpeg', 0.85))
      },
      'image/jpeg',
      0.85
    )
  }

  if (error) {
    return (
      <div className="flex-1 mx-4 my-2 rounded-2xl bg-zinc-900 border border-zinc-800 flex flex-col items-center justify-center gap-4 px-6 text-center">
        <AlertCircle className="w-10 h-10 text-zinc-600" />
        <p className="text-zinc-400 text-sm">{error}</p>
        <Button
          variant="outline"
          size="sm"
          className="border-zinc-700 text-zinc-300 hover:bg-zinc-800"
          onClick={startCamera}
        >
          <RefreshCw className="w-4 h-4 mr-2" /> Retry
        </Button>
      </div>
    )
  }

  return (
    <div className="flex-1 mx-4 my-2 rounded-2xl overflow-hidden bg-black relative">
      {/* Live viewfinder */}
      <video
        ref={videoRef}
        autoPlay
        playsInline
        muted
        onCanPlay={() => setReady(true)}
        className="absolute inset-0 w-full h-full object-cover"
      />

      {/* Corner guides */}
      {['top-3 left-3 border-t-2 border-l-2 rounded-tl', 'top-3 right-3 border-t-2 border-r-2 rounded-tr',
        'bottom-3 left-3 border-b-2 border-l-2 rounded-bl', 'bottom-3 right-3 border-b-2 border-r-2 rounded-br',
      ].map((cls, i) => (
        <span key={i} className={`absolute ${cls} w-6 h-6 border-white/60`} />
      ))}

      {/* Tap-to-capture overlay */}
      <button
        onClick={handleCapture}
        disabled={!ready}
        className="absolute inset-0 w-full h-full cursor-pointer disabled:cursor-not-allowed"
        aria-label="Tap to capture photo"
      />

      {!ready && (
        <div className="absolute inset-0 flex items-center justify-center bg-black/60">
          <Camera className="w-10 h-10 text-zinc-500 animate-pulse" />
        </div>
      )}
    </div>
  )
}
