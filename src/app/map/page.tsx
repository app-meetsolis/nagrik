import CitizenLayout from '@/components/CitizenLayout';
import MapClient from './components/MapClient';
import { getRecyclingCentres } from '@/actions/map';
import type { RecyclingCentreUI } from '@/types/actions';

export default async function MapPage() {
  const result = await getRecyclingCentres();
  const centres: RecyclingCentreUI[] = result.success ? result.data : [];

  return (
    <CitizenLayout>
      <MapClient centres={centres} />
    </CitizenLayout>
  );
}
