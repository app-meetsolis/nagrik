'use client'

import { useEffect, useState } from 'react'
import { useUser } from '@clerk/nextjs'
import { useRouter } from 'next/navigation'
import { checkExistingUser } from '@/actions/onboard'

/**
 * Dropped into the landing page so that after a Clerk modal sign-in
 * (which is client-side and doesn't trigger a server re-render)
 * the user is immediately sent to the right place.
 *
 * Uses the DB-backed checkExistingUser action (not stale publicMetadata)
 * to determine the correct destination.
 */
export function AuthRedirect() {
  const { isLoaded, isSignedIn } = useUser()
  const router = useRouter()
  const [checking, setChecking] = useState(false)

  useEffect(() => {
    if (!isLoaded || !isSignedIn || checking) return

    setChecking(true)
    checkExistingUser()
      .then((role) => {
        if (role === 'citizen') {
          router.replace('/citizen-dashboard')
        } else if (role === 'collector') {
          router.replace('/collector/dashboard')
        } else {
          router.replace('/onboarding')
        }
      })
      .catch(() => {
        // Fallback if the DB call fails — go to onboarding
        router.replace('/onboarding')
      })
  }, [isLoaded, isSignedIn, router, checking])

  return null
}
