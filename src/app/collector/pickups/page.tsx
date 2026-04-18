import CollectorLayout from '@/components/CollectorLayout';
import PickupsClient from './components/PickupsClient';
import { getCollectorDashboard } from '@/actions/collector';

export default async function PickupsPage() {
  const result = await getCollectorDashboard();
  const data = result.success ? result.data : null;
  return (
    <CollectorLayout>
      <PickupsClient data={data} />
    </CollectorLayout>
  );
}
