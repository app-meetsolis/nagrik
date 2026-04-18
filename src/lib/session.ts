import { cookies } from 'next/headers'

const SESSION_COOKIE = 'nagrik_session'

export interface SessionData {
  role: 'citizen' | 'collector'
  id: string           // citizen.id or authority.id from Supabase
  clerkUserId: string  // a simple generated ID used as clerk_user_id in DB
}

/**
 * Read the current session from the cookie. Returns null if not logged in.
 */
export async function getSession(): Promise<SessionData | null> {
  const store = await cookies()
  const raw = store.get(SESSION_COOKIE)?.value
  if (!raw) return null
  try {
    return JSON.parse(raw) as SessionData
  } catch {
    return null
  }
}

/**
 * Set the session cookie after onboarding.
 */
export async function setSession(data: SessionData): Promise<void> {
  const store = await cookies()
  store.set(SESSION_COOKIE, JSON.stringify(data), {
    httpOnly: true,
    path: '/',
    maxAge: 60 * 60 * 24 * 30, // 30 days
    sameSite: 'lax',
  })
}

/**
 * Clear the session cookie (sign out).
 */
export async function clearSession(): Promise<void> {
  const store = await cookies()
  store.delete(SESSION_COOKIE)
}
