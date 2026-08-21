import { Spinner } from '@/components/ui/skeleton';

export default function CallbackLoading() {
  return (
    <div className="flex min-h-screen flex-col items-center justify-center gap-3 bg-[#faf7f2] px-6 text-center">
      <Spinner label="Memverifikasi login..." />
      <p className="text-xs text-muted-foreground">Mengalihkan ke dashboard...</p>
    </div>
  );
}
