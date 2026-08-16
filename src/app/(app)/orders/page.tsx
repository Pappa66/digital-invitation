'use client';

import { useCallback, useEffect, useState } from 'react';
import { Inbox, Loader2, Trash2, MessageCircle, Search, CheckCircle, Clock, XCircle, Send } from 'lucide-react';
import { supabase } from '@/lib/supabase/client';
import { formatDate } from '@/lib/api/order-client';

interface OrderRow {
  id: string;
  template_name: string | null;
  template_id: string | null;
  name: string;
  whatsapp: string | null;
  email: string | null;
  note: string | null;
  status: string | null;
  created_at: string;
}

type FilterStatus = 'all' | 'pending' | 'approved' | 'rejected';

const STATUS_CONFIG: Record<string, { label: string; color: string; icon: typeof Clock }> = {
  pending: { label: 'Menunggu', color: 'bg-amber-50 text-amber-700', icon: Clock },
  approved: { label: 'Diterima', color: 'bg-green-50 text-green-700', icon: CheckCircle },
  rejected: { label: 'Ditolak', color: 'bg-red-50 text-red-700', icon: XCircle }
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
  const [orders, setOrders] = useState<OrderRow[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [filter, setFilter] = useState<FilterStatus>('all');
  const [search, setSearch] = useState('');

  const load = useCallback(async () => {
    setLoading(true);
    const { data, error } = await supabase
      .from('orders')
      .select('id, template_name, template_id, name, whatsapp, email, note, status, created_at')
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

  async function updateStatus(id: string, status: string) {
    await supabase.from('orders').update({ status } as never).eq('id', id);
    setOrders((prev) => prev.map((o) => (o.id === id ? { ...o, status } : o)));
  }

  async function remove(id: string) {
    await supabase.from('orders').delete().eq('id', id);
    setOrders((prev) => prev.filter((o) => o.id !== id));
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
          <p className="mt-1 text-sm text-gray-500">{orders.length} pesanan dari form pemesanan.</p>
        </div>
        <button onClick={load} className="rounded-md border border-gray-300 px-4 py-2 text-sm font-medium text-gray-700 hover:bg-gray-50">
          Muat Ulang
        </button>
      </div>

      {error && (
        <div className="mb-4 rounded-lg border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">
          Gagal memuat: {error}
        </div>
      )}

      {/* Filters */}
      <div className="mb-4 flex flex-wrap items-center gap-2">
        {(['all', 'pending', 'approved', 'rejected'] as FilterStatus[]).map((f) => (
          <button
            key={f}
            onClick={() => setFilter(f)}
            className={`rounded-full px-3 py-1.5 text-xs font-medium transition ${
              filter === f ? 'bg-gray-900 text-white' : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
            }`}
          >
            {f === 'all' ? 'Semua' : STATUS_CONFIG[f].label} ({counts[f]})
          </button>
        ))}
        <div className="relative ml-auto">
          <Search className="pointer-events-none absolute left-2.5 top-1/2 h-3.5 w-3.5 -translate-y-1/2 text-gray-400" />
          <input
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Cari nama, template, WA..."
            className="rounded-md border border-gray-200 bg-white py-1.5 pl-8 pr-3 text-xs outline-none focus:border-gray-400 focus:ring-1 focus:ring-gray-300"
          />
        </div>
      </div>

      {loading ? (
        <div className="flex items-center gap-2 py-10 text-sm text-gray-400">
          <Loader2 className="h-4 w-4 animate-spin" /> Memuat pesanan...
        </div>
      ) : filtered.length === 0 ? (
        <div className="flex flex-col items-center rounded-xl border border-dashed border-gray-300 bg-white/60 px-6 py-14 text-center">
          <Inbox className="h-8 w-8 text-gray-300" />
          <p className="mt-3 text-sm font-medium text-gray-800">Belum ada pesanan</p>
          <p className="mt-1 text-xs text-gray-500">Pesanan dari form pemesanan akan muncul di sini.</p>
        </div>
      ) : (
        <div className="space-y-3">
          {filtered.map((o) => {
            const st = STATUS_CONFIG[o.status || 'pending'] ?? STATUS_CONFIG.pending;
            const StatusIcon = st.icon;
            return (
              <div key={o.id} className="rounded-xl border border-gray-200 bg-white p-4 transition-shadow hover:shadow-sm">
                <div className="flex flex-wrap items-start justify-between gap-3">
                  <div className="min-w-0">
                    <div className="flex flex-wrap items-center gap-2">
                      <p className="text-sm font-semibold text-gray-900">{o.name}</p>
                      <span className={`flex items-center gap-1 rounded-full px-2 py-0.5 text-[10px] font-medium ${st.color}`}>
                        <StatusIcon className="h-3 w-3" /> {st.label}
                      </span>
                      {o.template_name && (
                        <span className="rounded-full bg-purple-50 px-2 py-0.5 text-[10px] font-medium text-purple-700">{o.template_name}</span>
                      )}
                    </div>
                    {o.email && <p className="mt-0.5 text-xs text-gray-400">{o.email}</p>}
                    <p className="mt-1 text-xs text-gray-500">{formatDate(o.created_at)}</p>
                  </div>
                  <div className="flex items-center gap-1.5">
                    {o.whatsapp && (
                      <a
                        href={`https://wa.me/${o.whatsapp}?text=${encodeURIComponent(buildReplyMessage(o))}`}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="flex items-center gap-1.5 rounded-md bg-green-600 px-3 py-1.5 text-xs font-medium text-white hover:bg-green-700"
                        title="Balas via WhatsApp dengan pesan konfirmasi"
                      >
                        <Send className="h-3.5 w-3.5" /> Balas WA
                      </a>
                    )}
                    {(o.status || 'pending') === 'pending' && (
                      <>
                        <button
                          onClick={() => updateStatus(o.id, 'approved')}
                          className="rounded-md border border-green-200 p-1.5 text-green-600 hover:bg-green-50"
                          title="Setujui pesanan"
                        >
                          <CheckCircle className="h-3.5 w-3.5" />
                        </button>
                        <button
                          onClick={() => updateStatus(o.id, 'rejected')}
                          className="rounded-md border border-red-200 p-1.5 text-red-400 hover:bg-red-50"
                          title="Tolak pesanan"
                        >
                          <XCircle className="h-3.5 w-3.5" />
                        </button>
                      </>
                    )}
                    <button
                      onClick={() => remove(o.id)}
                      aria-label={`Hapus pesanan ${o.name}`}
                      className="rounded-md border border-gray-200 p-1.5 text-gray-400 hover:bg-gray-50 hover:text-red-600"
                    >
                      <Trash2 className="h-3.5 w-3.5" />
                    </button>
                  </div>
                </div>
                {o.note && <p className="mt-3 rounded-lg bg-gray-50 px-3 py-2 text-xs leading-relaxed text-gray-600">&ldquo;{o.note}&rdquo;</p>}
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
