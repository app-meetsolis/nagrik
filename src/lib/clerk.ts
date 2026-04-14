import { auth, currentUser } from '@clerk/nextjs/server'

/**
 * Returns true if the current server-side user has the 'authority' role.
 * Role is stored in Clerk publicMetadata: { role: 'authority' | 'admin' | 'citizen' }
 */
export async function isAuthority(): Promise<boolean> {
  const { sessionClaims } = await auth()
  const role = (sessionClaims?.metadata as { role?: string } | undefined)?.role
  return role === 'authority' || role === 'admin'
}

/**
 * Returns true if the current server-side user has the 'admin' role.
 */
export async function isAdmin(): Promise<boolean> {
  const { sessionClaims } = await auth()
  const role = (sessionClaims?.metadata as { role?: string } | undefined)?.role
  return role === 'admin'
}

/**
 * Returns the Clerk user ID for the current session, or null if unauthenticated.
 */
export async function getClerkUserId(): Promise<string | null> {
  const { userId } = await auth()
  return userId
}

/**
 * Returns the full Clerk user object, or null if unauthenticated.
 */
export async function getClerkUser() {
  return currentUser()
}
