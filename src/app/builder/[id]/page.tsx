'use client';

import { useParams } from 'next/navigation';
import PuckBuilder from '@/puck/PuckBuilder';

export default function BuilderPage() {
  const params = useParams<{ id: string }>();
  return <PuckBuilder projectId={params.id} />;
}
