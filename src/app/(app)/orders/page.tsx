'use client';

import { useCallback, useEffect, useState } from 'react';
import { useSearchParams, useRouter } from 'next/navigation';
import { Inbox, Loader2, Trash2, Search, CheckCircle, Clock, XCircle, Send, ExternalLink } from 'lucide-react';
import { supabase } from '@/lib/supabase/client';
import { formatDate } from '@/lib/api/order-client';
import { clientCreateProject } from '@/lib/api/project-client';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import ConfirmDialog from '@/components/dashboard/confirm-dialog';
import { TableSkeleton } from '@/components/ui/skeleton';

interface OrderRow {
  id: string;
  template_name: string | null;
  template_id: string | null;
  name: string;
  whatsapp: string | null;
  email: string | null;
  note: string | null;
  status: string | null;
  project_id: string | null;
  created_at: string;
}

type FilterStatus = 'all' | 'pending' | 'approved' | 'rejected';

const STATUS_CONFIG: Record<string, { label: string; color: string; icon: typeof Clock }> = {
  pending: { label: 'Menunggu', color: 'bg-amber-100 text-amber-800', icon: Clock },
  approved: { label: 'Diterima', color: 'bg-emerald-100 text-emerald-800', icon: CheckCircle },
  rejected: { label: 'Ditolak', color: 'bg-destructive/10 text-destructive', icon: XCircle }
};

function buildReplyMessage(order: OrderRow): string {
  const tgl = new Date().toLocaleDateString('id-ID', { day: 'numeric', month: 'long', year: 'numeric' });
  return `Halo Kak ${order.name} 👋

Terima kasih telah memesan undangan digital${order.template_name ? ` dengan template *${order.template_name}*` : ''} di Prasha Digital.

Pesanan Kakak sudah kami terima per ${tgl}.

Untuk melanjutkan, mohon siapkan bahan-bahan berikut:
1️⃣ Data mempelai (nama lengkap, nama orang tua)
2️⃣ Foto mempelai (format JPG/PNG, resolusi minimal 1080px)
3️⃣ Detail acara (tanggal, waktu, lokasi, Google Maps link)
4️⃣ Musik latar (opsional, bisa kami bantu pilihkan)
5️⃣ Daftar tamu untukpersonalisasi nama (opsional)

📎 Syarat & Ketentuan:
• Pembayaran lunas sebelum pengerjaan dimulai
• Waktu pengerjaan 2-5 hari kerja setelah bahan lengkap
• Revisi maksimal 2x
• File final berupa link undangan online

Jika ada pertanyaan, langsung balas chat ini saja ya, Kak 😊

Salam,
Prasha Digital`;
}

export default function OrdersPage() {
  const searchParams = useSearchParams();
  const router = useRouter();
  const [orders, setOrders] = useState<OrderRow[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [filter, setFilter] = useState<FilterStatus>((searchParams.get('status') as FilterStatus) || 'all');
  const [search, setSearch] = useState(searchParams.get('q') || '');
  const [toast, setToast] = useState<string | null>(null);
  const [deleteTarget, setDeleteTarget] = useState<OrderRow | null>(null);
  const [deleting, setDeleting] = useState(false);
  const [actionBusy, setActionBusy] = useState<string | null>(null);

  const updateURL = useCallback((status: FilterStatus, q: string) => {
    const params = new URLSearchParams();
    if (status !== 'all') params.set('status', status);
    if (q) params.set('q', q);
    const qs = params.toString();
    router.replace(`/orders${qs ? `?${qs}` : ''}`, { scroll: false });
  }, [router]);

  const setFilterWithURL = useCallback((status: FilterStatus) => {
    setFilter(status);
    updateURL(status, search);
  }, [search, updateURL]);

  const setSearchWithURL = useCallback((q: string) => {
    setSearch(q);
    updateURL(filter, q);
  }, [filter, updateURL]);

  const showToast = useCallback((msg: string) => {
    setToast(msg);
    setTimeout(() => setToast(null), 2500);
  }, []);

  const load = useCallback(async () => {
    setLoading(true);
    const { data, error } = await supabase
      .from('orders')
      .select('id, template_name, template_id, name, whatsapp, email, note, status, project_id, created_at')
      .order('created_at', { ascending: false })
      .limit(200) as { data: OrderRow[] | null; error: { message: string } | null };
    if (error) {
      setError(error.message);
    } else {
      setOrders((data ?? []) as OrderRow[]);
    }
    setLoading(false);
  }, []);

  useEffect(() => {
    load();
  }, [load]);

  // Poll for new orders every 30 seconds
  useEffect(() => {
    const interval = setInterval(async () => {
      const { data } = await supabase
        .from('orders')
        .select('id, template_name, template_id, name, whatsapp, email, note, status, project_id, created_at')
        .order('created_at', { ascending: false })
        .limit(200) as { data: OrderRow[] | null };
      if (data) {
        setOrders((prev) => {
          const prevIds = new Set(prev.map((o) => o.id));
          const newOrders = data.filter((o) => !prevIds.has(o.id));
          if (newOrders.length > 0) {
            showToast(`${newOrders.length} pesanan baru masuk`);
          }
          return data as OrderRow[];
        });
      }
    }, 30000);
    return () => clearInterval(interval);
  }, [showToast]);

  async function updateStatus(id: string, status: string) {
    setActionBusy(id);
    const { error } = await supabase.from('orders').update({ status } as never).eq('id', id);
    if (error) {
      showToast('Gagal update status: ' + error.message);
      setActionBusy(null);
      return;
    }
    setOrders((prev) => prev.map((o) => (o.id === id ? { ...o, status } : o)));
    showToast(status === 'approved' ? 'Pesanan disetujui' : 'Pesanan ditolak');
    if (status === 'approved') {
      const order = orders.find((o) => o.id === id);
      if (order?.template_id && !order.project_id) {
        await createProjectFromOrder({ ...order, status });
      }
    }
    setActionBusy(null);
  }

  async function createProjectFromOrder(order: OrderRow) {
    const title = `${order.name} - ${order.template_name || 'Undangan'}`;
    const res = await clientCreateProject(title, order.template_id ?? undefined);
    if (res.id) {
      const pid = res.id;
      await supabase.from('orders').update({ project_id: pid, status: 'approved' } as never).eq('id', order.id);
      setOrders((prev) => prev.map((o) => (o.id === order.id ? { ...o, project_id: pid, status: 'approved' } : o)));
      showToast('Proyek berhasil dibuat');
      window.open(`/builder/${pid}`, '_blank');
    }
    setActionBusy(null);
  }

  async function confirmDelete() {
    if (!deleteTarget) return;
    setDeleting(true);
    const { error } = await supabase.from('orders').delete().eq('id', deleteTarget.id);
    if (error) {
      showToast('Gagal menghapus: ' + error.message);
    } else {
      setOrders((prev) => prev.filter((o) => o.id !== deleteTarget.id));
      showToast('Pesanan dihapus');
    }
    setDeleting(false);
    setDeleteTarget(null);
  }

  const filtered = orders.filter((o) => {
    if (filter !== 'all' && (o.status || 'pending') !== filter) return false;
    if (search) {
      const q = search.toLowerCase();
      if (!o.name.toLowerCase().includes(q) && !(o.template_name ?? '').toLowerCase().includes(q) && !(o.whatsapp ?? '').includes(q)) return false;
    }
    return true;
  });

  const counts = {
    all: orders.length,
    pending: orders.filter((o) => (o.status || 'pending') === 'pending').length,
    approved: orders.filter((o) => o.status === 'approved').length,
    rejected: orders.filter((o) => o.status === 'rejected').length,
  };

  return (
    <div>
      <div className="mb-6 flex flex-wrap items-end justify-between gap-3">
        <div>
          <h2 className="text-lg font-semibold">Kontak Masuk</h2>
          <p className="mt-1 text-sm text-muted-foreground">{orders.length} pesanan dari form pemesanan.</p>
        </div>
        <Button variant="outline" onClick={load} disabled={loading}>
          {loading ? <Loader2 className="mr-1.5 h-3.5 w-3.5 animate-spin" /> : null}
          Muat Ulang
        </Button>
      </div>

      {error && (
        <div role="alert" className="mb-4 rounded-lg border border-destructive/30 bg-destructive/10 px-4 py-3 text-sm text-destructive">
          Gagal memuat: {error}
        </div>
      )}

      {/* Filters */}
      <div className="mb-4 flex flex-wrap items-center gap-2">
        {(['all', 'pending', 'approved', 'rejected'] as FilterStatus[]).map((f) => (
          <Button
            key={f}
            variant={filter === f ? 'default' : 'outline'}
            size="sm"
            className="rounded-full px-3 text-xs"
            onClick={() => setFilterWithURL(f)}
            aria-pressed={filter === f}
          >
            {f === 'all' ? 'Semua' : STATUS_CONFIG[f].label} ({counts[f]})
          </Button>
        ))}
        <div className="relative ml-auto">
          <Search className="pointer-events-none absolute left-2.5 top-1/2 h-3.5 w-3.5 -translate-y-1/2 text-muted-foreground" aria-hidden />
          <Input
            value={search}
            onChange={(e) => setSearchWithURL(e.target.value)}
            placeholder="Cari nama, template, WA..."
            aria-label="Cari pesanan"
            className="h-9 w-56 pl-8 text-xs"
          />
        </div>
      </div>

      {loading ? (
        <TableSkeleton rows={4} cols={4} />
      ) : filtered.length === 0 ? (
        <div className="flex flex-col items-center rounded-2xl border border-dashed border-border bg-card/60 px-6 py-14 text-center">
          <Inbox className="h-8 w-8 text-border" />
          <p className="mt-3 text-sm font-medium text-foreground">Belum ada pesanan</p>
          <p className="mt-1 text-xs text-muted-foreground">Pesanan dari form pemesanan akan muncul di sini.</p>
        </div>
      ) : (
        <div className="space-y-3">
          {filtered.map((o) => {
            const st = STATUS_CONFIG[o.status || 'pending'] ?? STATUS_CONFIG.pending;
            const StatusIcon = st.icon;
            return (
              <div key={o.id} className="rounded-2xl border border-border bg-card p-4 shadow-soft transition-shadow hover:shadow-card">
                <div className="flex flex-wrap items-start justify-between gap-3">
                  <div className="min-w-0">
                    <div className="flex flex-wrap items-center gap-2">
                      <p className="text-sm font-semibold text-foreground">{o.name}</p>
                      <Badge className={`gap-1 ${st.color} border-transparent`}>
                        <StatusIcon className="h-3 w-3" aria-hidden /> {st.label}
                      </Badge>
                      {o.template_name && (
                        <Badge variant="secondary" className="gap-1">
                          {o.template_name}
                        </Badge>
                      )}
                    </div>
                    {o.email && <p className="mt-0.5 text-xs text-muted-foreground">{o.email}</p>}
                    <p className="mt-1 text-xs text-muted-foreground">{formatDate(o.created_at)}</p>
                  </div>
                  <div className="flex flex-wrap items-center gap-1.5">
                    {o.whatsapp && (
                      <a
                        href={`https://wa.me/${o.whatsapp}?text=${encodeURIComponent(buildReplyMessage(o))}`}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="flex min-h-11 items-center gap-1.5 rounded-md bg-emerald-600 px-3 text-xs font-medium text-white transition-colors hover:bg-emerald-700"
                        title="Balas via WhatsApp dengan pesan konfirmasi"
                      >
                        <Send className="h-3.5 w-3.5" aria-hidden /> Balas WA
                      </a>
                    )}
                    {(o.status || 'pending') === 'pending' && (
                      <>
                        <button
                          onClick={() => updateStatus(o.id, 'approved')}
                          disabled={actionBusy === o.id}
                          aria-label="Setujui pesanan"
                          className="inline-flex h-11 w-11 items-center justify-center rounded-md border border-emerald-200 text-emerald-700 transition-colors hover:bg-emerald-50 disabled:opacity-40"
                          title="Setujui pesanan"
                        >
                          {actionBusy === o.id ? <Loader2 className="h-3.5 w-3.5 animate-spin" aria-hidden /> : <CheckCircle className="h-3.5 w-3.5" aria-hidden />}
                        </button>
                        <button
                          onClick={() => updateStatus(o.id, 'rejected')}
                          disabled={actionBusy === o.id}
                          aria-label="Tolak pesanan"
                          className="inline-flex h-11 w-11 items-center justify-center rounded-md border border-destructive/30 text-destructive transition-colors hover:bg-destructive/10 disabled:opacity-40"
                          title="Tolak pesanan"
                        >
                          {actionBusy === o.id ? <Loader2 className="h-3.5 w-3.5 animate-spin" aria-hidden /> : <XCircle className="h-3.5 w-3.5" aria-hidden />}
                        </button>
                      </>
                    )}
                    {(o.status || 'pending') === 'approved' && !o.project_id && o.template_id && (
                      <Button
                        onClick={() => createProjectFromOrder(o)}
                        disabled={actionBusy === o.id}
                        className="h-11 px-3 text-xs"
                        title="Buat proyek undangan dari pesanan ini"
                      >
                        {actionBusy === o.id ? <Loader2 className="mr-1 h-3 w-3 animate-spin" aria-hidden /> : null}
                        Buat Proyek
                      </Button>
                    )}
                    {o.project_id && (
                      <a
                        href={`/builder/${o.project_id}`}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="flex min-h-11 items-center gap-1.5 rounded-md border border-gold px-3 text-xs font-medium text-gold-deep transition-colors hover:bg-gold/5"
                      >
                        <ExternalLink className="h-3 w-3" aria-hidden /> Buka Proyek
                      </a>
                    )}
                    <button
                      onClick={() => setDeleteTarget(o)}
                      aria-label={`Hapus pesanan ${o.name}`}
                      className="inline-flex h-11 w-11 items-center justify-center rounded-md border border-border text-muted-foreground transition-colors hover:bg-destructive/10 hover:text-destructive"
                    >
                      <Trash2 className="h-3.5 w-3.5" aria-hidden />
                    </button>
                  </div>
                </div>
                {o.note && <p className="mt-3 rounded-lg bg-muted px-3 py-2 text-xs leading-relaxed text-muted-foreground">&ldquo;{o.note}&rdquo;</p>}
              </div>
            );
          })}
        </div>
      )}

      <ConfirmDialog
        open={!!deleteTarget}
        title="Hapus Pesanan"
        message={`Yakin ingin menghapus pesanan dari "${deleteTarget?.name}"? Tindakan ini tidak dapat dibatalkan.`}
        confirmLabel="Hapus"
        danger
        busy={deleting}
        onConfirm={confirmDelete}
        onCancel={() => setDeleteTarget(null)}
      />

      {toast && (
        <div role="status" aria-live="polite" className="fixed right-4 top-4 z-50 rounded-md bg-foreground px-4 py-2 text-sm text-background shadow-lg">
          {toast}
        </div>
      )}
    </div>
  );
}
