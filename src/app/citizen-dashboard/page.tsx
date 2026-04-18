import CitizenLayout from '@/components/CitizenLayout';
import CitizenDashboardClient from './components/CitizenDashboardClient';
import { getCitizenDashboard } from '@/actions/dashboard';
import type { DashboardData } from '@/types/actions';
import { redirect } from 'next/navigation';
import { auth } from '@clerk/nextjs/server';

export default async function CitizenDashboardPage() {
  const { userId } = await auth();

  // Not authenticated at all — send to sign-in
  if (!userId) {
    redirect('/sign-in');
  }

  const result = await getCitizenDashboard();

  // If the citizen record doesn't exist yet (e.g. never completed onboarding),
  // redirect to onboarding instead of showing an infinite skeleton
  if (!result.success) {
    if (result.code === 'AUTH') {
      redirect('/sign-in');
    }
    // NOT_FOUND or any other DB error → onboarding
    redirect('/onboarding');
  }

  const data: DashboardData = result.data;

  return (
    <CitizenLayout>
      <CitizenDashboardClient data={data} />
    </CitizenLayout>
  );
}
