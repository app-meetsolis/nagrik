import { Metadata } from 'next';
import CitizenLayout from '@/components/CitizenLayout';
import MarketplaceClient from './components/MarketplaceClient';

export const metadata: Metadata = { title: 'Eco Marketplace — Nagrik' };

export default function MarketplacePage() {
  return (
    <CitizenLayout>
      <MarketplaceClient />
    </CitizenLayout>
  );
}
