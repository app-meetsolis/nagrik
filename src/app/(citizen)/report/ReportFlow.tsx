'use client'

import { useState } from 'react'
import { MapPin, Loader2, RotateCcw, AlertTriangle, CheckCircle2, Leaf } from 'lucide-react'
import Link from 'next/link'
import { CameraCapture } from '@/components/camera/CameraCapture'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { uploadIssuePhoto } from '@/actions/upload'
import { classifyWaste } from '@/actions/categorize'
import { logWasteScan } from '@/actions/scan'
import { getGpsPosition, findNearestWardGeojsonId } from '@/lib/geo'
import type { ClassifyWasteData, LogWasteScanData } from '@/types/actions'

// ─── Visual config ─────────────────────────────────────────────────────────

const WASTE_LABEL: Record<string, string> = {
  wet_organic:     'Wet Organic',
  dry_paper:       'Paper',
  dry_plastic:     'Plastic',
  dry_metal:       'Metal',
  dry_glass:       'Glass',
  e_waste:         'E-Waste',
  hazardous:       'Hazardous',
  textile:         'Textile',
  non_recyclable:  'Non-Recyclable',
}

const BIN_CONFIG: Record<string, { label: string; dot: string; ring: string }> = {
  green: { label: 'Green Bin',  dot: 'bg-green-500',  ring: 'border-green-200' },
  blue:  { label: 'Blue Bin',   dot: 'bg-blue-500',   ring: 'border-blue-200'  },
  red:   { label: 'Red Bin',    dot: 'bg-red-500',    ring: 'border-red-200'   },
  grey:  { label: 'Grey Bin',   dot: 'bg-slate-400',  ring: 'border-slate-200' },
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
  const [aiResult, setAiResult]   = useState<(ClassifyWasteData & { pointsEarned: number }) | null>(null)
  const [submitted, setSubmitted] = useState<LogWasteScanData | null>(null)
  const [statusMsg, setMsg]       = useState('')

  // ── 1. Photo captured → GPS + upload ──────────────────────────────────
  async function handleCapture(blob: Blob, dataUrl: string) {
    setStep('processing')

    setMsg('Finding your ward…')
    const pos       = await getGpsPosition()
    const geojsonId = pos ? findNearestWardGeojsonId(pos.lat, pos.lng) : null

    setMsg('Uploading photo…')
    const fd = new FormData()
    fd.append('photo', blob, 'waste.jpg')
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

  // ── 2. Classify → OpenAI Vision ───────────────────────────────────────
  async function handleAnalyze() {
    if (!capture) return
    setStep('analyzing')
    const result = await classifyWaste(capture.photoUrl)
    if (result.success) {
      setAiResult(result.data)
    } else {
      setAiResult({
        wasteType: 'non_recyclable', recyclable: false, binColor: 'grey',
        prepSteps: [], tip: '', isWaste: true, pointsEarned: 2,
      })
    }
    setStep('categorized')
  }

  // ── 3. Log scan → insert waste_scan row ───────────────────────────────
  async function handleSubmit() {
    if (!capture || !aiResult) return
    setStep('submitting')

    const result = await logWasteScan({
      photoUrl:     capture.photoUrl,
      wardId:       capture.wardId,
      wasteType:    aiResult.wasteType,
      recyclable:   aiResult.recyclable,
      binColor:     aiResult.binColor,
      prepSteps:    aiResult.prepSteps,
      tip:          aiResult.tip,
      pointsEarned: aiResult.pointsEarned,
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
    <div className="flex items-center gap-1.5 text-green-500">
      <MapPin className="w-3.5 h-3.5" />
      <span className="text-xs font-medium">{capture.wardName}</span>
    </div>
  ) : (
    <div className="flex items-center gap-1.5 text-zinc-600">
      <MapPin className="w-3.5 h-3.5" />
      <span className="text-xs">Detecting ward…</span>
    </div>
  )

  const isDark = ['capture', 'processing', 'analyzing', 'submitting'].includes(step)

  return (
    <div className={`flex flex-col h-[100dvh] overflow-hidden ${isDark ? 'bg-zinc-950 text-white' : 'bg-white text-slate-900'}`}>

      {/* Top bar — hidden on success screen */}
      {step !== 'success' && (
        <header className="flex items-center justify-between px-4 pt-4 pb-2 shrink-0">
          <div>
            <p className="text-xs text-zinc-500">Welcome back</p>
            <p className="text-sm font-semibold text-white">{firstName}</p>
          </div>
          <div className="flex items-center gap-3">
            <Link href="/my-scans" className="text-xs text-zinc-500 hover:text-zinc-300 transition-colors">
              My Scans
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
          <Loader2 className="w-10 h-10 text-green-400 animate-spin" />
          <p className="text-zinc-400 text-sm">
            {step === 'analyzing'  ? 'AI is classifying your waste…' :
             step === 'submitting' ? 'Logging your scan…'             :
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
            <img src={capture.dataUrl} alt="Captured waste" className="absolute inset-0 w-full h-full object-cover" />
            {capture.wardName && (
              <div className="absolute bottom-3 left-3 bg-black/60 rounded-lg px-3 py-1.5 flex items-center gap-1.5">
                <MapPin className="w-3 h-3 text-green-400" />
                <span className="text-xs text-white font-medium">{capture.wardName}</span>
              </div>
            )}
          </div>
          <div className="shrink-0 px-4 pb-20 md:pb-8 pt-3 flex flex-col gap-3">
            <Button onClick={handleAnalyze} className="w-full h-12 bg-green-600 hover:bg-green-500 text-white font-semibold rounded-xl">
              Classify Waste
            </Button>
            <Button variant="ghost" className="text-slate-500 hover:text-slate-900" onClick={reset}>
              <RotateCcw className="w-4 h-4 mr-2" /> Retake
            </Button>
          </div>
        </>
      )}

      {/* ── CATEGORIZED ─────────────────────────────────────────────────── */}
      {step === 'categorized' && capture && aiResult && (() => {
        const bin = BIN_CONFIG[aiResult.binColor] ?? BIN_CONFIG.grey
        return (
          <>
            <div className="mx-4 mt-2 h-44 rounded-2xl overflow-hidden relative shrink-0">
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img src={capture.dataUrl} alt="Waste" className="absolute inset-0 w-full h-full object-cover" />
            </div>

            <div className="flex-1 mx-4 my-3 rounded-2xl bg-white border border-slate-200 p-5 flex flex-col gap-4 overflow-auto">
              {!aiResult.isWaste ? (
                <div className="flex flex-col items-center gap-3 py-4 text-center">
                  <AlertTriangle className="w-10 h-10 text-amber-400" />
                  <p className="text-slate-900 font-semibold">Not waste</p>
                  <p className="text-slate-500 text-sm">
                    This doesn&apos;t look like waste. Point your camera at a waste item.
                  </p>
                </div>
              ) : (
                <>
                  {/* Waste type + bin */}
                  <div>
                    <p className="text-xs text-zinc-500 uppercase tracking-widest mb-2">AI Classification</p>
                    <div className={`flex items-center gap-3 p-4 rounded-xl border ${bin.ring} bg-slate-50`}>
                      <div className={`w-5 h-5 rounded-full shrink-0 ${bin.dot}`} />
                      <div>
                        <p className="text-base font-bold text-slate-900">{WASTE_LABEL[aiResult.wasteType] ?? aiResult.wasteType}</p>
                        <p className="text-xs text-zinc-500">{bin.label}</p>
                      </div>
                      <Badge className="ml-auto bg-green-50 text-green-700 border-green-200 text-xs">
                        +{aiResult.pointsEarned} pts
                      </Badge>
                    </div>
                  </div>

                  {/* Prep steps */}
                  {aiResult.prepSteps.length > 0 && (
                    <div>
                      <p className="text-xs text-zinc-500 uppercase tracking-widest mb-2">How to prepare</p>
                      <ol className="flex flex-col gap-1.5">
                        {aiResult.prepSteps.map((step, i) => (
                          <li key={i} className="flex items-start gap-2 text-sm text-slate-700">
                            <span className="w-5 h-5 rounded-full bg-green-100 text-green-700 text-xs font-bold flex items-center justify-center shrink-0 mt-0.5">{i + 1}</span>
                            {step}
                          </li>
                        ))}
                      </ol>
                    </div>
                  )}

                  {/* Eco tip */}
                  {aiResult.tip && (
                    <div className="flex items-start gap-2 bg-green-50 border border-green-100 rounded-xl p-3">
                      <Leaf className="w-4 h-4 text-green-600 shrink-0 mt-0.5" />
                      <p className="text-xs text-green-800">{aiResult.tip}</p>
                    </div>
                  )}
                </>
              )}
            </div>

            <div className="shrink-0 px-4 pb-20 md:pb-8 pt-1 flex flex-col gap-3">
              {aiResult.isWaste && (
                <Button onClick={handleSubmit} className="w-full h-12 bg-green-600 hover:bg-green-500 text-white font-semibold rounded-xl">
                  Log Scan — Earn {aiResult.pointsEarned} pts
                </Button>
              )}
              <Button variant="ghost" className="text-slate-500 hover:text-slate-900" onClick={reset}>
                <RotateCcw className="w-4 h-4 mr-2" /> Retake
              </Button>
            </div>
          </>
        )
      })()}

      {/* ── SUCCESS ─────────────────────────────────────────────────────── */}
      {step === 'success' && submitted && aiResult && (() => {
        const bin = BIN_CONFIG[aiResult.binColor] ?? BIN_CONFIG.grey
        return (
          <div className="flex-1 flex flex-col items-center justify-center px-6 pb-16 md:pb-0 text-center gap-6">
            {/* Icon */}
            <div className="w-24 h-24 rounded-full bg-green-50 border-2 border-green-200 flex items-center justify-center">
              <CheckCircle2 className="w-10 h-10 text-green-500" />
            </div>

            {/* Headline */}
            <div className="flex flex-col gap-1">
              <h2 className="text-2xl font-bold text-slate-900">Scan Logged!</h2>
              <p className="text-slate-400 text-sm">Your waste has been classified and recorded</p>
            </div>

            {/* Points earned */}
            <div className="flex flex-col items-center gap-1">
              <p className="text-5xl font-bold text-green-600">+{submitted.pointsEarned}</p>
              <p className="text-slate-400 text-sm">eco-points earned</p>
              <p className="text-slate-500 text-xs mt-1">Total: {submitted.totalEcoPoints} pts</p>
            </div>

            {/* Details card */}
            <div className="w-full bg-slate-50 border border-slate-200 rounded-2xl p-5 flex flex-col gap-3 text-left">
              <div className="flex items-center justify-between">
                <span className="text-sm text-slate-400">Waste type</span>
                <span className="text-sm font-medium text-slate-900">{WASTE_LABEL[aiResult.wasteType]}</span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-sm text-slate-400">Bin</span>
                <div className="flex items-center gap-2">
                  <div className={`w-3 h-3 rounded-full ${bin.dot}`} />
                  <span className="text-sm font-medium text-slate-900">{bin.label}</span>
                </div>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-sm text-slate-400">Ref</span>
                <span className="text-sm font-mono text-slate-900">#{submitted.scanId.slice(0, 8).toUpperCase()}</span>
              </div>
            </div>

            {/* Actions */}
            <div className="w-full flex flex-col gap-3">
              <Button onClick={reset} className="w-full h-12 bg-green-600 hover:bg-green-700 text-white font-semibold rounded-xl">
                Scan Another Item
              </Button>
              <div className="flex gap-3 w-full">
                <Link href="/my-scans" className="flex-1">
                  <Button variant="outline" className="w-full h-11 border-slate-200 text-slate-700 hover:bg-slate-50 rounded-xl text-sm">
                    My Scans
                  </Button>
                </Link>
                <Link href="/map" className="flex-1">
                  <Button variant="outline" className="w-full h-11 border-slate-200 text-slate-700 hover:bg-slate-50 rounded-xl text-sm">
                    Centers Map
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
