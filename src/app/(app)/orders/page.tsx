'use client';

import { useCallback, useEffect, useState } from 'react';
import { Inbox, Loader2, Trash2, MessageCircle } from 'lucide-react';
import { supabase } from '@/lib/supabase/client';
import { formatDate } from '@/lib/api/order-client';

interface OrderRow {
  id: string;
  template_name: string | null;
  name: string;
  whatsapp: string | null;
  note: string | null;
  created_at: string;
}

export default function OrdersPage() {
  const [orders, setOrders] = useState<OrderRow[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const load = useCallback(async () => {
    setLoading(true);
    const { data, error } = await supabase
      .from('orders')
      .select('id, template_name, name, whatsapp, note, created_at')
      .order('created_at', { ascending: false })
      .limit(100);
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

  async function remove(id: string) {
    await supabase.from('orders').delete().eq('id', id);
    setOrders((prev) => prev.filter((o) => o.id !== id));
  }

  return (
    <div>
      <div className="mb-6 flex flex-wrap items-end justify-between gap-3">
        <div>
          <h2 className="text-lg font-semibold">Kontak Masuk</h2>
          <p className="mt-1 text-sm text-gray-500">Pesanan dari form pemesanan di landing &amp; halaman preview template.</p>
        </div>
        <button onClick={load} className="rounded-md border border-gray-300 px-4 py-2 text-sm font-medium text-gray-700 hover:bg-gray-50">
          Muat Ulang
        </button>
      </div>

      {error && (
        <div className="mb-4 rounded-lg border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">
          Gagal memuat pesanan: {error}
        </div>
      )}

      {loading ? (
        <div className="flex items-center gap-2 py-10 text-sm text-gray-400">
          <Loader2 className="h-4 w-4 animate-spin" /> Memuat pesanan...
        </div>
      ) : orders.length === 0 ? (
        <div className="flex flex-col items-center rounded-xl border border-dashed border-gray-300 bg-white/60 px-6 py-14 text-center">
          <Inbox className="h-8 w-8 text-gray-300" />
          <p className="mt-3 text-sm font-medium text-gray-800">Belum ada pemesanan masuk</p>
          <p className="mt-1 text-xs text-gray-500">Pesanan dari form pemesanan akan muncul di sini.</p>
        </div>
      ) : (
        <div className="space-y-3">
          {orders.map((o) => (
            <div key={o.id} className="rounded-xl border border-gray-200 bg-white p-4 transition-shadow hover:shadow-sm">
              <div className="flex flex-wrap items-start justify-between gap-3">
                <div className="min-w-0">
                  <div className="flex flex-wrap items-center gap-2">
                    <p className="text-sm font-semibold text-gray-900">{o.name}</p>
                    {o.template_name && (
                      <span className="rounded-full bg-amber-50 px-2 py-0.5 text-[10px] font-medium text-amber-700">{o.template_name}</span>
                    )}
                  </div>
                  <p className="mt-1 text-xs text-gray-500">{formatDate(o.created_at)}</p>
                </div>
                <div className="flex items-center gap-2">
                  {o.whatsapp && (
                    <a
                      href={`https://wa.me/${o.whatsapp}`}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="flex items-center gap-1.5 rounded-md bg-green-600 px-3 py-1.5 text-xs font-medium text-white hover:bg-green-700"
                    >
                      <MessageCircle className="h-3.5 w-3.5" /> {o.whatsapp}
                    </a>
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
          ))}
        </div>
      )}
    </div>
  );
}