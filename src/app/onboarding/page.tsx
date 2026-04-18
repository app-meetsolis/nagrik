import { redirect } from 'next/navigation';
import { getSession } from '@/lib/session';
import { createServiceClient } from '@/lib/supabase/server';
import OnboardingClient from './components/OnboardingClient';

interface Props {
  searchParams: Promise<{ role?: string }>;
}

export default async function OnboardingPage({ searchParams }: Props) {
  const session = await getSession();

  // If user has a valid session backed by a real DB record, redirect to their dashboard
  if (session) {
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const db = createServiceClient() as any;

    if (session.role === 'citizen') {
      const { data } = await db.from('citizens').select('id').eq('id', session.id).maybeSingle();
      if (data) redirect('/citizen-dashboard');
      // If no DB record found, session is stale — just fall through and show the form
    } else if (session.role === 'collector') {
      const { data } = await db.from('authorities').select('id').eq('id', session.id).maybeSingle();
      if (data) redirect('/collector/dashboard');
    }
  }

  const params = await searchParams;
  const initialRole = params.role === 'citizen' || params.role === 'collector'
    ? params.role
    : null;

  return <OnboardingClient initialRole={initialRole} />;
}
