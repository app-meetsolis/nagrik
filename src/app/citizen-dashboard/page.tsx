import CitizenLayout from '@/components/CitizenLayout';
import CitizenDashboardClient from './components/CitizenDashboardClient';
import { getCitizenDashboard } from '@/actions/dashboard';
import type { DashboardData } from '@/types/actions';
import { redirect } from 'next/navigation';
import { getSession } from '@/lib/session';

export default async function CitizenDashboardPage() {
  const session = await getSession();

  // Not logged in — send to landing
  if (!session) {
    redirect('/');
  }

  const result = await getCitizenDashboard();

  // If the citizen record doesn't exist, redirect to landing
  // (can't call clearSession here — cookies can't be modified in a Server Component)
  if (!result.success) {
    redirect('/');
  }

  const data: DashboardData = result.data;

  return (
    <CitizenLayout>
      <CitizenDashboardClient data={data} />
    </CitizenLayout>
  );
}
