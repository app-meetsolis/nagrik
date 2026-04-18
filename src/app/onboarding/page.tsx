import { redirect } from 'next/navigation';
import { getSession } from '@/lib/session';
import { createServiceClient } from '@/lib/supabase/server';
import OnboardingClient from './components/OnboardingClient';

interface Props {
  searchParams: Promise<{ role?: string }>;
}

export default async function OnboardingPage({ searchParams }: Props) {
  const params = await searchParams;
  const requestedRole = params.role === 'citizen' || params.role === 'collector'
    ? params.role
    : null;

  const session = await getSession();

  // Only redirect to dashboard if user has a valid session AND isn't
  // explicitly trying to register for a (potentially different) role
  if (session && !requestedRole) {
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const db = createServiceClient() as any;

    if (session.role === 'citizen') {
      const { data } = await db.from('citizens').select('id').eq('id', session.id).maybeSingle();
      if (data) redirect('/citizen-dashboard');
    } else if (session.role === 'collector') {
      const { data } = await db.from('authorities').select('id').eq('id', session.id).maybeSingle();
      if (data) redirect('/collector/dashboard');
    }
  }

  return <OnboardingClient initialRole={requestedRole} />;
}
