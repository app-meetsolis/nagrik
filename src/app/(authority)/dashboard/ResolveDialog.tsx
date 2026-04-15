'use client'

import { useState, useRef } from 'react'
import { useRouter } from 'next/navigation'
import { Upload, Loader2, CheckCircle2, Camera } from 'lucide-react'
import {
  Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter,
} from '@/components/ui/dialog'
import { Button } from '@/components/ui/button'
import { resolveIssue } from '@/actions/resolve'

interface Props {
  issueId:  string
  open:     boolean
  onClose:  () => void
}

export function ResolveDialog({ issueId, open, onClose }: Props) {
  const [file, setFile]       = useState<File | null>(null)
  const [preview, setPreview] = useState<string | null>(null)
  const [loading, setLoading] = useState(false)
  const [newScore, setNewScore] = useState<number | null>(null)
  const inputRef = useRef<HTMLInputElement>(null)
  const router   = useRouter()

  function handleFileChange(e: React.ChangeEvent<HTMLInputElement>) {
    const f = e.target.files?.[0]
    if (!f) return
    setFile(f)
    setPreview(URL.createObjectURL(f))
  }

  async function handleSubmit() {
    if (!file) return
    setLoading(true)
    const fd = new FormData()
    fd.append('issueId', issueId)
    fd.append('photo', file)
    const result = await resolveIssue(fd)
    setLoading(false)
    if (result.success) {
      setNewScore(result.data.newScore)
      router.refresh()
    }
  }

  function handleClose() {
    setFile(null)
    setPreview(null)
    setNewScore(null)
    onClose()
  }

  return (
    <Dialog open={open} onOpenChange={v => !v && handleClose()}>
      <DialogContent className="bg-white border-slate-200 text-slate-900 max-w-sm mx-4">

        {/* ── Success state ────────────────────────────────────────── */}
        {newScore !== null ? (
          <div className="flex flex-col items-center gap-4 py-4 text-center">
            <div className="w-16 h-16 rounded-full bg-green-50 border-2 border-green-200 flex items-center justify-center">
              <CheckCircle2 className="w-8 h-8 text-green-500" />
            </div>
            <div>
              <p className="text-slate-900 font-bold text-lg">Issue Resolved!</p>
              <p className="text-slate-400 text-sm mt-1">Your new score</p>
              <p className="text-orange-500 text-3xl font-bold mt-1">{newScore}</p>
            </div>
            <Button onClick={handleClose} className="w-full bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-xl">
              Back to Dashboard
            </Button>
          </div>
        ) : (
          /* ── Upload form ───────────────────────────────────────── */
          <>
            <DialogHeader>
              <DialogTitle className="text-slate-900">Upload Resolution Photo</DialogTitle>
              <p className="text-slate-400 text-sm">Take a photo showing the issue has been fixed</p>
            </DialogHeader>

            {/* Drop zone / preview */}
            <div
              onClick={() => inputRef.current?.click()}
              className="border-2 border-dashed border-slate-300 rounded-xl overflow-hidden cursor-pointer hover:border-slate-400 transition-colors"
            >
              {preview ? (
                /* eslint-disable-next-line @next/next/no-img-element */
                <img src={preview} alt="Resolution preview" className="w-full h-44 object-cover" />
              ) : (
                <div className="flex flex-col items-center gap-2 py-8">
                  <Camera className="w-10 h-10 text-slate-300" />
                  <p className="text-slate-400 text-sm font-medium">Tap to open camera or gallery</p>
                  <p className="text-slate-300 text-xs">Proof that the issue is fixed</p>
                </div>
              )}
              <input
                ref={inputRef}
                type="file"
                accept="image/*"
                capture="environment"
                className="hidden"
                onChange={handleFileChange}
              />
            </div>

            {preview && (
              <button
                onClick={() => inputRef.current?.click()}
                className="text-xs text-slate-400 hover:text-slate-600 text-center w-full -mt-1"
              >
                Tap to retake
              </button>
            )}

            <DialogFooter className="flex gap-2 mt-1">
              <Button
                variant="ghost"
                className="flex-1 text-slate-400 hover:text-slate-700"
                onClick={handleClose}
                disabled={loading}
              >
                Cancel
              </Button>
              <Button
                className="flex-1 bg-orange-500 hover:bg-orange-600 text-white rounded-xl"
                onClick={handleSubmit}
                disabled={!file || loading}
              >
                {loading
                  ? <Loader2 className="w-4 h-4 animate-spin" />
                  : 'Mark Resolved'
                }
              </Button>
            </DialogFooter>
          </>
        )}
      </DialogContent>
    </Dialog>
  )
}
