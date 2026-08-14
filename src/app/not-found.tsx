import ErrorPage from '@/components/ui/error-page';

export default function NotFound() {
  return (
    <ErrorPage
      code="404"
      title="Halaman tidak ditemukan"
      description="Halaman yang Anda cari sepertinya telah dipindahkan, dihapus, atau belum pernah ada. Periksa kembali tautan atau kembali ke beranda."
      actionLabel="Kembali ke Beranda"
      actionHref="/"
    />
  );
}