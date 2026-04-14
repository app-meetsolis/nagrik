'use client'

import { useState } from 'react'
import { MapPin, Loader2, RotateCcw, AlertTriangle, CheckCircle2, ChevronRight } from 'lucide-react'
import Link from 'next/link'
import { CameraCapture } from '@/components/camera/CameraCapture'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { uploadIssuePhoto } from '@/actions/upload'
import { categorizePhoto } from '@/actions/categorize'
import { submitIssue } from '@/actions/submit'
import { getGpsPosition, findNearestWardGeojsonId } from '@/lib/geo'
import type { CategorizePhotoData, SubmitIssueData } from '@/types/actions'

// ─── Visual config ─────────────────────────────────────────────────────────

const CATEGORY_CONFIG: Record<
  CategorizePhotoData['category'],
  { label: string; emoji: string; ring: string; text: string }
> = {
  garbage:     { label: 'Garbage',     emoji: '🗑️', ring: 'border-red-500/30',    text: 'text-red-400'    },
  pothole:     { label: 'Pothole',     emoji: '🕳️', ring: 'border-amber-500/30',  text: 'text-amber-400'  },
  drainage:    { label: 'Drainage',    emoji: '💧', ring: 'border-blue-500/30',   text: 'text-blue-400'   },
  streetlight: { label: 'Streetlight', emoji: '💡', ring: 'border-yellow-500/30', text: 'text-yellow-400' },
  other:       { label: 'Civic Issue', emoji: '📌', ring: 'border-zinc-500/30',   text: 'text-zinc-400'   },
}

const SEVERITY_CONFIG: Record<
  CategorizePhotoData['severity'],
  { label: string; bg: string; text: string }
> = {
  minor:    { label: 'Minor',    bg: 'bg-green-500/15',  text: 'text-green-400'  },
  moderate: { label: 'Moderate', bg: 'bg-amber-500/15',  text: 'text-amber-400'  },
  critical: { label: 'Critical', bg: 'bg-red-500/15',    text: 'text-red-400'    },
}

// ─── Types ──────────────────────────────────────────────────────────────────

type Step = 'capture' | 'processing' | 'preview' | 'analyzing' | 'categorized' | 'submitting' | 'success'

interface CaptureState {
  dataUrl:  string
  wardId:   string | null
  wardName: string | null
  photoUrl: string
}

interface Props { firstName: string }

// ─── Component ──────────────────────────────────────────────────────────────

export default function ReportFlow({ firstName }: Props) {
  const [step, setStep]           = useState<Step>('capture')
  const [capture, setCapture]     = useState<CaptureState | null>(null)
  const [aiResult, setAiResult]   = useState<CategorizePhotoData | null>(null)
  const [submitted, setSubmitted] = useState<SubmitIssueData | null>(null)
  const [statusMsg, setMsg]       = useState('')

  // ── 1. Photo captured → GPS + upload ──────────────────────────────────
  async function handleCapture(blob: Blob, dataUrl: string) {
    setStep('processing')

    setMsg('Finding your ward…')
    const pos       = await getGpsPosition()
    const geojsonId = pos ? findNearestWardGeojsonId(pos.lat, pos.lng) : null

    setMsg('Uploading photo…')
    const fd = new FormData()
    fd.append('photo', blob, 'issue.jpg')
    if (geojsonId) fd.append('geojsonId', geojsonId)

    const result = await uploadIssuePhoto(fd)
    if (!result.success) { setStep('capture'); return }

    setCapture({
      dataUrl,
      wardId:   result.data.wardId,
      wardName: result.data.wardName,
      photoUrl: result.data.url,
    })
    setStep('preview')
  }

  // ── 2. Analyze → OpenAI Vision ────────────────────────────────────────
  async function handleAnalyze() {
    if (!capture) return
    setStep('analyzing')
    const result = await categorizePhoto(capture.photoUrl)
    setAiResult(result.success ? result.data : {
      category: 'other', severity: 'moderate', isValidCivicIssue: true,
    })
    setStep('categorized')
  }

  // ── 3. Submit → insert issue row ──────────────────────────────────────
  async function handleSubmit() {
    if (!capture || !aiResult) return
    setStep('submitting')

    const result = await submitIssue({
      photoUrl: capture.photoUrl,
      wardId:   capture.wardId,
      wardName: capture.wardName,
      category: aiResult.category,
      severity: aiResult.severity,
    })

    if (!result.success) { setStep('categorized'); return }
    setSubmitted(result.data)
    setStep('success')
  }

  // ── Reset ─────────────────────────────────────────────────────────────
  function reset() {
    setCapture(null)
    setAiResult(null)
    setSubmitted(null)
    setStep('capture')
  }

  // ── Ward pill (top-right) ─────────────────────────────────────────────
  const wardPill = capture?.wardName ? (
    <div className="flex items-center gap-1.5 text-orange-400">
      <MapPin className="w-3.5 h-3.5" />
      <span className="text-xs font-medium">{capture.wardName}</span>
    </div>
  ) : (
    <div className="flex items-center gap-1.5 text-zinc-600">
      <MapPin className="w-3.5 h-3.5" />
      <span className="text-xs">Detecting ward…</span>
    </div>
  )

  return (
    <div className="flex flex-col h-full overflow-hidden">

      {/* Top bar — hidden on success screen */}
      {step !== 'success' && (
        <header className="flex items-center justify-between px-4 pt-4 pb-2 shrink-0">
          <div>
            <p className="text-xs text-zinc-500">Welcome back</p>
            <p className="text-sm font-semibold text-white">{firstName}</p>
          </div>
          <div className="flex items-center gap-3">
            <Link href="/my-reports" className="text-xs text-zinc-500 hover:text-zinc-300 transition-colors">
              My Reports
            </Link>
            {wardPill}
          </div>
        </header>
      )}

      {/* ── CAPTURE ─────────────────────────────────────────────────────── */}
      {step === 'capture' && (
        <CameraCapture onCapture={handleCapture} />
      )}

      {/* ── PROCESSING / ANALYZING / SUBMITTING ─────────────────────────── */}
      {(step === 'processing' || step === 'analyzing' || step === 'submitting') && (
        <div className="flex-1 flex flex-col items-center justify-center gap-4 px-6 text-center">
          <Loader2 className="w-10 h-10 text-orange-400 animate-spin" />
          <p className="text-zinc-400 text-sm">
            {step === 'analyzing'  ? 'AI is analyzing your photo…' :
             step === 'submitting' ? 'Submitting your report…'      :
             statusMsg}
          </p>
          {step === 'analyzing' && (
            <p className="text-zinc-600 text-xs">Powered by GPT-4o Vision</p>
          )}
        </div>
      )}

      {/* ── PREVIEW ─────────────────────────────────────────────────────── */}
      {step === 'preview' && capture && (
        <>
          <div className="flex-1 mx-4 my-2 rounded-2xl overflow-hidden relative">
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img src={capture.dataUrl} alt="Captured issue" className="absolute inset-0 w-full h-full object-cover" />
            {capture.wardName && (
              <div className="absolute bottom-3 left-3 bg-black/60 rounded-lg px-3 py-1.5 flex items-center gap-1.5">
                <MapPin className="w-3 h-3 text-orange-400" />
                <span className="text-xs text-white font-medium">{capture.wardName}</span>
              </div>
            )}
          </div>
          <div className="shrink-0 px-4 pb-8 pt-3 flex flex-col gap-3">
            <Button onClick={handleAnalyze} className="w-full h-12 bg-orange-500 hover:bg-orange-400 text-white font-semibold rounded-xl">
              Analyze Issue
            </Button>
            <Button variant="ghost" className="text-zinc-500 hover:text-white" onClick={reset}>
              <RotateCcw className="w-4 h-4 mr-2" /> Retake
            </Button>
          </div>
        </>
      )}

      {/* ── CATEGORIZED ─────────────────────────────────────────────────── */}
      {step === 'categorized' && capture && aiResult && (() => {
        const cat = CATEGORY_CONFIG[aiResult.category]
        const sev = SEVERITY_CONFIG[aiResult.severity]
        return (
          <>
            <div className="mx-4 mt-2 h-44 rounded-2xl overflow-hidden relative shrink-0">
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img src={capture.dataUrl} alt="Issue" className="absolute inset-0 w-full h-full object-cover" />
            </div>

            <div className="flex-1 mx-4 my-3 rounded-2xl bg-zinc-900 border border-zinc-800 p-5 flex flex-col gap-4 overflow-auto">
              {!aiResult.isValidCivicIssue ? (
                <div className="flex flex-col items-center gap-3 py-4 text-center">
                  <AlertTriangle className="w-10 h-10 text-amber-400" />
                  <p className="text-white font-semibold">Not a civic issue</p>
                  <p className="text-zinc-400 text-sm">
                    This photo doesn&apos;t appear to show a civic infrastructure problem.
                    Please take a photo of a pothole, garbage, drainage issue, or broken streetlight.
                  </p>
                </div>
              ) : (
                <>
                  <div>
                    <p className="text-xs text-zinc-500 uppercase tracking-widest mb-2">AI Detection</p>
                    <div className={`flex items-center gap-3 p-4 rounded-xl border ${cat.ring} bg-zinc-950`}>
                      <span className="text-3xl">{cat.emoji}</span>
                      <div>
                        <p className={`text-lg font-bold ${cat.text}`}>{cat.label}</p>
                        <p className="text-xs text-zinc-500">Category detected by AI</p>
                      </div>
                    </div>
                  </div>
                  <div className="flex items-center gap-3">
                    <div className={`px-3 py-1.5 rounded-lg ${sev.bg}`}>
                      <span className={`text-sm font-semibold ${sev.text}`}>{sev.label} severity</span>
                    </div>
                    {capture.wardName && (
                      <div className="flex items-center gap-1.5 text-zinc-400">
                        <MapPin className="w-3.5 h-3.5" />
                        <span className="text-sm">{capture.wardName}</span>
                      </div>
                    )}
                  </div>
                  <Badge className="w-fit bg-zinc-800 text-zinc-400 border-zinc-700 text-xs">
                    Ready to submit
                  </Badge>
                </>
              )}
            </div>

            <div className="shrink-0 px-4 pb-8 pt-1 flex flex-col gap-3">
              {aiResult.isValidCivicIssue && (
                <Button onClick={handleSubmit} className="w-full h-12 bg-orange-500 hover:bg-orange-400 text-white font-semibold rounded-xl">
                  Submit Report
                </Button>
              )}
              <Button variant="ghost" className="text-zinc-500 hover:text-white" onClick={reset}>
                <RotateCcw className="w-4 h-4 mr-2" /> Retake
              </Button>
            </div>
          </>
        )
      })()}

      {/* ── SUCCESS ─────────────────────────────────────────────────────── */}
      {step === 'success' && submitted && aiResult && (() => {
        const cat = CATEGORY_CONFIG[aiResult.category]
        const sev = SEVERITY_CONFIG[aiResult.severity]
        const ref = submitted.issueId.slice(0, 8).toUpperCase()
        return (
          <div className="flex-1 flex flex-col items-center justify-center px-6 text-center gap-6">
            {/* Icon */}
            <div className="w-20 h-20 rounded-full bg-green-500/15 border border-green-500/30 flex items-center justify-center">
              <CheckCircle2 className="w-10 h-10 text-green-400" />
            </div>

            {/* Headline */}
            <div className="flex flex-col gap-1">
              <h2 className="text-2xl font-bold text-white">Report Submitted!</h2>
              <p className="text-zinc-400 text-sm">Your issue has been logged and assigned</p>
            </div>

            {/* Details card */}
            <div className="w-full bg-zinc-900 border border-zinc-800 rounded-2xl p-5 flex flex-col gap-3 text-left">
              <div className="flex justify-between items-center pb-3 border-b border-zinc-800">
                <span className="text-xs text-zinc-500 uppercase tracking-widest">Reference</span>
                <span className="text-sm font-mono font-semibold text-white">#{ref}</span>
              </div>

              <div className="flex items-center justify-between">
                <span className="text-sm text-zinc-400">Category</span>
                <span className="text-sm font-medium text-white">{cat.emoji} {cat.label}</span>
              </div>

              <div className="flex items-center justify-between">
                <span className="text-sm text-zinc-400">Severity</span>
                <span className={`text-sm font-semibold ${sev.text}`}>{sev.label}</span>
              </div>

              <div className="flex items-center justify-between">
                <span className="text-sm text-zinc-400">Ward</span>
                <span className="text-sm font-medium text-white">{submitted.wardName}</span>
              </div>

              <div className="flex items-center justify-between">
                <span className="text-sm text-zinc-400">Assigned to</span>
                <span className="text-sm font-medium text-orange-400">{submitted.authorityName}</span>
              </div>
            </div>

            {/* Actions */}
            <div className="w-full flex flex-col gap-3">
              <Button onClick={reset} className="w-full h-12 bg-orange-500 hover:bg-orange-400 text-white font-semibold rounded-xl">
                Report Another Issue
              </Button>
              <div className="flex gap-3 w-full">
                <Link href="/my-reports" className="flex-1">
                  <Button variant="outline" className="w-full h-11 border-zinc-700 text-zinc-300 hover:bg-zinc-800 rounded-xl text-sm">
                    My Reports
                  </Button>
                </Link>
                <Link href="/map" className="flex-1">
                  <Button variant="outline" className="w-full h-11 border-zinc-700 text-zinc-300 hover:bg-zinc-800 rounded-xl text-sm">
                    Ward Map
                  </Button>
                </Link>
              </div>
            </div>
          </div>
        )
      })()}

    </div>
  )
}
