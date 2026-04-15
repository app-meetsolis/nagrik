'use client'

import { useEffect } from 'react'
import { useUser } from '@clerk/nextjs'
import { useRouter } from 'next/navigation'

/**
 * Dropped into the landing page so that after a Clerk modal sign-in
 * (which is client-side and doesn't trigger a server re-render)
 * the user is immediately sent to the right place.
 *
 * The server-side redirect() in page.tsx handles hard-navigations;
 * this handles the soft client state update from the modal.
 */
export function AuthRedirect() {
  const { isLoaded, isSignedIn } = useUser()
  const router = useRouter()

  useEffect(() => {
    if (!isLoaded || !isSignedIn) return
    const isMobile = /Android|iPhone|iPad|iPod|Mobile/i.test(navigator.userAgent)
    router.replace(isMobile ? '/report' : '/home')
  }, [isLoaded, isSignedIn, router])

  return null
}
