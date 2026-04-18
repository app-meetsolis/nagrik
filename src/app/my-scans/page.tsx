import CitizenLayout from '@/components/CitizenLayout';
import MyScansClient from './components/MyScansClient';
import { getUserScans } from '@/actions/scans';
import type { ScanRowUI } from '@/types/actions';

export default async function MyScansPage() {
  const result = await getUserScans();
  const initialScans: ScanRowUI[] = result.success ? result.data : [];

  return (
    <CitizenLayout>
      <MyScansClient initialScans={initialScans} />
    </CitizenLayout>
  );
}
