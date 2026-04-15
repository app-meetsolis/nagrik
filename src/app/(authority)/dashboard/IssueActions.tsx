'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { Loader2, PlayCircle, Upload } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { markInProgress } from '@/actions/issue'
import { ResolveDialog } from './ResolveDialog'

interface Props {
  issueId: string
  status:  string
}

export function IssueActions({ issueId, status }: Props) {
  const [loading, setLoading]         = useState(false)
  const [dialogOpen, setDialogOpen]   = useState(false)
  const router = useRouter()

  async function handleMarkInProgress() {
    setLoading(true)
    await markInProgress(issueId)
    router.refresh()
    setLoading(false)
  }

  if (status === 'pending') {
    return (
      <Button
        size="sm"
        onClick={handleMarkInProgress}
        disabled={loading}
        className="bg-blue-50 text-blue-600 hover:bg-blue-100 border border-blue-200 rounded-lg h-8 text-xs"
      >
        {loading
          ? <Loader2 className="w-3 h-3 animate-spin" />
          : <><PlayCircle className="w-3 h-3 mr-1" />Start Working</>
        }
      </Button>
    )
  }

  if (status === 'in_progress') {
    return (
      <>
        <Button
          size="sm"
          onClick={() => setDialogOpen(true)}
          className="bg-orange-50 text-orange-600 hover:bg-orange-100 border border-orange-200 rounded-lg h-8 text-xs"
        >
          <Upload className="w-3 h-3 mr-1" />Upload Resolution
        </Button>

        <ResolveDialog
          issueId={issueId}
          open={dialogOpen}
          onClose={() => setDialogOpen(false)}
        />
      </>
    )
  }

  return null
}
