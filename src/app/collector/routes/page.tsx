import CollectorLayout from '@/components/CollectorLayout';
import RoutesClient from './components/RoutesClient';
import { getCollectorDashboard } from '@/actions/collector';

export default async function RoutesPage() {
  const result = await getCollectorDashboard();
  const data = result.success ? result.data : null;
  return (
    <CollectorLayout>
      <RoutesClient data={data} />
    </CollectorLayout>
  );
}
