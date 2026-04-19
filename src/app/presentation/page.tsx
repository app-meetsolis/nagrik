import type { Metadata } from 'next';
import PresentationClient from './PresentationClient';

export const metadata: Metadata = {
  title: 'Nagrik — Pitch Deck',
  description: 'Nagrik AI Waste Platform — Interactive Pitch Presentation',
};

export default function PresentationPage() {
  return <PresentationClient />;
}
