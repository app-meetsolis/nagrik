'use client'

import { useState } from 'react'
import { Loader2, CheckCircle } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { ResolveDialog } from './ResolveDialog'

interface Props {
  scanId: string
}

export function IssueActions({ scanId }: Props) {
  const [dialogOpen, setDialogOpen] = useState(false)

  return (
    <>
      <Button
        size="sm"
        onClick={() => setDialogOpen(true)}
        className="bg-green-50 text-green-700 hover:bg-green-100 border border-green-200 rounded-lg h-8 text-xs"
      >
        <CheckCircle className="w-3 h-3 mr-1" />Mark Collected
      </Button>

      <ResolveDialog
        scanId={scanId}
        open={dialogOpen}
        onClose={() => setDialogOpen(false)}
      />
    </>
  )
}
