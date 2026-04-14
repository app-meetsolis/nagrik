'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { Loader2, PlayCircle, Upload } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { markInProgress } from '@/actions/issue'

interface Props {
  issueId: string
  status:  string
}

export function IssueActions({ issueId, status }: Props) {
  const [loading, setLoading] = useState(false)
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
        className="bg-blue-500/15 text-blue-400 hover:bg-blue-500/25 border border-blue-500/20 rounded-lg h-8 text-xs"
      >
        {loading
          ? <Loader2 className="w-3 h-3 animate-spin" />
          : <><PlayCircle className="w-3 h-3 mr-1" /> Start Working</>
        }
      </Button>
    )
  }

  if (status === 'in_progress') {
    return (
      <Button
        size="sm"
        disabled
        className="bg-orange-500/15 text-orange-400 border border-orange-500/20 rounded-lg h-8 text-xs opacity-70 cursor-not-allowed"
      >
        <Upload className="w-3 h-3 mr-1" /> Upload Resolution
      </Button>
    )
  }

  return null
}
