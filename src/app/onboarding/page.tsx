import { auth, currentUser } from '@clerk/nextjs/server'
import { redirect } from 'next/navigation'
import { headers } from 'next/headers'
import { createServiceClient } from '@/lib/supabase/server'
import { OnboardingShell } from './OnboardingShell'

export default async function OnboardingPage() {
  const { userId, sessionClaims } = await auth()
  if (!userId) redirect('/')

  const role = (sessionClaims?.metadata as { role?: string })?.role

  if (role === 'citizen') {
    const ua = (await headers()).get('user-agent') ?? ''
    redirect(/Android|iPhone|iPad|iPod|Mobile/i.test(ua) ? '/report' : '/home')
  }
  if (role === 'authority' || role === 'admin') redirect('/dashboard')

  // Fetch wards server-side so OnboardingShell needs no client fetch
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const db = createServiceClient() as any
  const { data: wards } = await db
    .from('wards')
    .select('id, name')
    .order('name') as { data: Array<{ id: string; name: string }> | null }

  const clerkUser = await currentUser()
  const defaultName = [clerkUser?.firstName, clerkUser?.lastName]
    .filter(Boolean)
    .join(' ')

  return <OnboardingShell wards={wards ?? []} defaultName={defaultName} />
}
