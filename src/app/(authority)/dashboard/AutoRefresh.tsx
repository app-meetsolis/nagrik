'use client'

import { useEffect } from 'react'
import { useRouter } from 'next/navigation'

/**
 * Silently refreshes server component data every 15 seconds.
 * No UI — drop this anywhere in the dashboard page.
 */
export function AutoRefresh() {
  const router = useRouter()
  useEffect(() => {
    const id = setInterval(() => router.refresh(), 15_000)
    return () => clearInterval(id)
  }, [router])
  return null
}
