'use server'

import { clearSession } from '@/lib/session'
import { redirect } from 'next/navigation'

export async function signOut(): Promise<void> {
  await clearSession()
  redirect('/')
}
