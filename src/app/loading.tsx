import { Spinner } from '@/components/ui/skeleton';

export default function Loading() {
  return (
    <div className="flex min-h-screen items-center justify-center bg-background">
      <Spinner label="Memuat..." />
    </div>
  );
}
