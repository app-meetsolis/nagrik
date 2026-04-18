import CollectorLayout from '@/components/CollectorLayout';
import RequestsClient from './components/RequestsClient';
import { getCollectorDashboard } from '@/actions/collector';

export default async function RequestsPage() {
  const result = await getCollectorDashboard();
  const data = result.success ? result.data : null;
  return (
    <CollectorLayout>
      <RequestsClient data={data} />
    </CollectorLayout>
  );
}
