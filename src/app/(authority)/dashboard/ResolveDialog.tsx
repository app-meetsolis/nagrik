'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { Loader2, CheckCircle2 } from 'lucide-react'
import {
  Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter,
} from '@/components/ui/dialog'
import { Button } from '@/components/ui/button'
import { confirmPickup } from '@/actions/resolve'

interface Props {
  scanId:  string
  open:    boolean
  onClose: () => void
}

export function ResolveDialog({ scanId, open, onClose }: Props) {
  const [loading, setLoading]       = useState(false)
  const [newScore, setNewScore]     = useState<number | null>(null)
  const router = useRouter()

  async function handleConfirm() {
    setLoading(true)
    const result = await confirmPickup(scanId)
    setLoading(false)
    if (result.success) {
      setNewScore(result.data.newCollectorScore)
      router.refresh()
    }
  }

  function handleClose() {
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
              <p className="text-slate-900 font-bold text-lg">Pickup Confirmed!</p>
              <p className="text-slate-400 text-sm mt-1">Your new score</p>
              <p className="text-green-600 text-3xl font-bold mt-1">{newScore}</p>
            </div>
            <Button onClick={handleClose} className="w-full bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-xl">
              Back to Dashboard
            </Button>
          </div>
        ) : (
          /* ── Confirmation form ─────────────────────────────────── */
          <>
            <DialogHeader>
              <DialogTitle className="text-slate-900">Confirm Pickup</DialogTitle>
              <p className="text-slate-400 text-sm">Confirm that this waste has been collected from the ward.</p>
            </DialogHeader>

            <div className="flex items-center gap-3 bg-green-50 border border-green-100 rounded-xl p-4">
              <CheckCircle2 className="w-8 h-8 text-green-500 shrink-0" />
              <p className="text-green-800 text-sm font-medium">
                Marking as collected will earn you +5 score points.
              </p>
            </div>

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
                className="flex-1 bg-green-600 hover:bg-green-700 text-white rounded-xl"
                onClick={handleConfirm}
                disabled={loading}
              >
                {loading
                  ? <Loader2 className="w-4 h-4 animate-spin" />
                  : 'Confirm Collected'
                }
              </Button>
            </DialogFooter>
          </>
        )}
      </DialogContent>
    </Dialog>
  )
}
