import CollectorLayout from '@/components/CollectorLayout';
import CollectorDashboardClient from './components/CollectorDashboardClient';
import { getCollectorDashboard } from '@/actions/collector';
import type { CollectorDashboardData } from '@/types/actions';

export default async function CollectorDashboardPage() {
  const result = await getCollectorDashboard();
  const data: CollectorDashboardData | null = result.success ? result.data : null;

  return (
    <CollectorLayout>
      <CollectorDashboardClient data={data} />
    </CollectorLayout>
  );
}
