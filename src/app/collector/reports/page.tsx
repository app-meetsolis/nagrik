import CollectorLayout from '@/components/CollectorLayout';
import ReportsClient from './components/ReportsClient';
import { getCollectorDashboard } from '@/actions/collector';

export default async function ReportsPage() {
  const result = await getCollectorDashboard();
  const data = result.success ? result.data : null;
  return (
    <CollectorLayout>
      <ReportsClient data={data} />
    </CollectorLayout>
  );
}
