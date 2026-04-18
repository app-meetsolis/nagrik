import { redirect } from 'next/navigation';
import { checkExistingUser } from '@/actions/onboard';
import OnboardingClient from './components/OnboardingClient';

export default async function OnboardingPage() {
  const existing = await checkExistingUser();
  if (existing === 'citizen')   redirect('/citizen-dashboard');
  if (existing === 'collector') redirect('/collector/dashboard');

  return <OnboardingClient />;
}
