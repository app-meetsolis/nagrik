import { auth } from '@clerk/nextjs/server';
import { redirect } from 'next/navigation';
import { checkExistingUser } from '@/actions/onboard';
import LandingClient from './LandingClient';

export default async function LandingPage() {
  try {
    const { userId } = await auth();

    // Only redirect if the user is already authenticated
    if (userId) {
      const role = await checkExistingUser();

      if (role === 'citizen') {
        redirect('/citizen-dashboard');
      }

      if (role === 'collector') {
        redirect('/collector/dashboard');
      }

      // Authenticated but no role yet — send to onboarding
      redirect('/onboarding');
    }
  } catch (err) {
    // If it's a Next.js redirect, re-throw it so it works correctly
    if (
      err !== null &&
      typeof err === 'object' &&
      'digest' in err &&
      typeof (err as { digest: string }).digest === 'string' &&
      (err as { digest: string }).digest.startsWith('NEXT_REDIRECT')
    ) {
      throw err;
    }
    // For any other error (e.g. DB unreachable), fall through to the landing page
    console.error('[LandingPage] Auth/DB check failed, showing landing page:', err);
  }

  return <LandingClient />;
}
