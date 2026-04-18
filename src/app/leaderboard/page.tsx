import CitizenLayout from '@/components/CitizenLayout';
import LeaderboardClient from './components/LeaderboardClient';
import { getLeaderboard } from '@/actions/leaderboard';
import type { LeaderboardData } from '@/types/actions';

export default async function LeaderboardPage() {
  const result = await getLeaderboard();
  const data: LeaderboardData | null = result.success ? result.data : null;

  return (
    <CitizenLayout>
      <LeaderboardClient data={data} />
    </CitizenLayout>
  );
}
