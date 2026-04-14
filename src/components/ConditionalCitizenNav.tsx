'use client'

import { useUser } from '@clerk/nextjs'
import { CitizenNav } from './CitizenNav'

export function ConditionalCitizenNav() {
  const { user, isLoaded } = useUser()

  // Don't flash before Clerk loads
  if (!isLoaded || !user) return null

  // Authorities and admins have their own sidebar — no bottom nav
  const role = (user.publicMetadata as { role?: string })?.role
  if (role === 'authority' || role === 'admin') return null

  return <CitizenNav />
}
