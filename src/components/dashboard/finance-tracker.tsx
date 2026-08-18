'use client';

import { useState, useEffect, useMemo } from 'react';
import {
  Plus, Search, DollarSign, TrendingUp, TrendingDown, Trash2, Save, Calculator, type LucideIcon
} from 'lucide-react';
import { demoIsDemoMode } from '@/lib/env';
import { listFinanceRecords, addFinanceRecord, updateFinanceRecord, deleteFinanceRecord } from '@/lib/api/finance-client';
import { formatRupiah } from '@/lib/format';
import ConfirmDialog from '@/components/dashboard/confirm-dialog';
import { Dialog, DialogContent, DialogTitle, DialogDescription } from '@/components/ui/dialog';
import { InlineError, StatsSkeleton, TableSkeleton } from '@/components/ui/skeleton';

interface FinanceRecord {
  id: string;
  project_id: string;
  client_name: string;
  design_name: string;
  base_price: number;
  discount: number;
  promo_code: string;
  promo_amount: number;
  final_price: number;
  payment_status: 'unpaid' | 'paid';
  payment_amount: number;
  payment_date: string | null;
  notes: string;
  created_at: string;
}

const PAYMENT_STATUS_OPTIONS = [
  { value: 'unpaid', label: 'Belum Dibayar', color: 'bg-red-100 text-red-700' },
  { value: 'paid', label: 'Lunas', color: 'bg-green-100 text-green-700' }
];

const EMPTY_RECORD = {
  client_name: '',
  design_name: '',
  base_price: 0,
  discount: 0,
  promo_code: '',
  promo_amount: 0,
  payment_amount: 0,
  notes: ''
};

export default function FinanceTracker() {
  const [records, setRecords] = useState<FinanceRecord[]>([]);
  const [loading, setLoading] = useState(true);
  const [loadError, setLoadError] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [showAddModal, setShowAddModal] = useState(false);
  const [newRecord, setNewRecord] = useState(EMPTY_RECORD);
  const [deleteTarget, setDeleteTarget] = useState<FinanceRecord | null>(null);
  const [deleteBusy, setDeleteBusy] = useState(false);
  const [payTarget, setPayTarget] = useState<FinanceRecord | null>(null);
  const [payAmount, setPayAmount] = useState(0);
  const [payBusy, setPayBusy] = useState(false);

  async function loadRecords() {
    setLoading(true);
    setLoadError(false);
    try {
      if (demoIsDemoMode()) {
        const stored = localStorage.getItem('di_finance');
        if (stored) setRecords(JSON.parse(stored));
      } else {
        const data = await listFinanceRecords();
        setRecords(data);
      }
    } catch (error) {
      console.error('Error loading finance records:', error);
      setLoadError(true);
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    loadRecords();
  }, []);

  function saveRecords(updatedRecords: FinanceRecord[]) {
    setRecords(updatedRecords);
    if (demoIsDemoMode()) {
      localStorage.setItem('di_finance', JSON.stringify(updatedRecords));
    }
  }

  function calculateFinalPrice(base: number, discount: number, promoAmount: number): number {
    return Math.max(0, base - discount - promoAmount);
  }

  async function handleAddRecord() {
    if (!newRecord.client_name.trim()) return;

    const finalPrice = calculateFinalPrice(newRecord.base_price, newRecord.discount, newRecord.promo_amount);
    const paymentStatus = newRecord.payment_amount >= finalPrice ? 'paid' : 'unpaid';

    if (demoIsDemoMode()) {
      const record: FinanceRecord = {
        id: `finance-${Date.now()}`,
        project_id: '',
        client_name: newRecord.client_name,
        design_name: newRecord.design_name,
        base_price: newRecord.base_price,
        discount: newRecord.discount,
        promo_code: newRecord.promo_code,
        promo_amount: newRecord.promo_amount,
        final_price: finalPrice,
        payment_status: paymentStatus,
        payment_amount: newRecord.payment_amount,
        payment_date: new Date().toISOString(),
        notes: newRecord.notes,
        created_at: new Date().toISOString()
      };
      saveRecords([record, ...records]);
    } else {
      const created = await addFinanceRecord({
        project_id: '',
        client_name: newRecord.client_name,
        design_name: newRecord.design_name,
        base_price: newRecord.base_price,
        discount: newRecord.discount,
        promo_code: newRecord.promo_code,
        promo_amount: newRecord.promo_amount,
        final_price: finalPrice,
        payment_status: paymentStatus,
        payment_amount: newRecord.payment_amount,
        payment_date: new Date().toISOString(),
        notes: newRecord.notes
      });
      setRecords((prev) => [created, ...prev]);
    }
    setShowAddModal(false);
    setNewRecord(EMPTY_RECORD);
  }

  async function confirmDelete() {
    if (!deleteTarget) return;
    setDeleteBusy(true);
    if (!demoIsDemoMode()) {
      await deleteFinanceRecord(deleteTarget.id);
    }
    setRecords((prev) => prev.filter((r) => r.id !== deleteTarget.id));
    setDeleteBusy(false);
    setDeleteTarget(null);
  }

  async function confirmPay() {
    if (!payTarget || payAmount <= 0) return;
    setPayBusy(true);
    const record = payTarget;
    const newAmount = record.payment_amount + payAmount;
    const paymentStatus: 'unpaid' | 'paid' = newAmount >= record.final_price ? 'paid' : 'unpaid';
    const updates = { payment_amount: Math.max(0, newAmount), payment_status: paymentStatus as 'unpaid' | 'paid', payment_date: new Date().toISOString() };

    if (!demoIsDemoMode()) {
      await updateFinanceRecord(record.id, updates);
    }
    setRecords((prev) => prev.map((r) => r.id === record.id ? { ...r, ...updates } : r));
    setPayBusy(false);
    setPayTarget(null);
    setPayAmount(0);
  }

  // Statistics
  const stats = useMemo(() => {
    const totalRevenue = records.reduce((sum, r) => sum + r.final_price, 0);
    const totalPaid = records.reduce((sum, r) => sum + r.payment_amount, 0);
    const totalPending = totalRevenue - totalPaid;
    const paidCount = records.filter((r) => r.payment_status === 'paid').length;
    const unpaidCount = records.filter((r) => r.payment_status === 'unpaid').length;

    return { totalRevenue, totalPaid, totalPending, paidCount, unpaidCount };
  }, [records]);

  const filteredRecords = records.filter((r) => {
    if (!searchQuery) return true;
    const query = searchQuery.toLowerCase();
    return (
      r.client_name.toLowerCase().includes(query) ||
      r.design_name.toLowerCase().includes(query) ||
      r.promo_code.toLowerCase().includes(query)
    );
  });

  return (
    <div>
      <div className="mb-6 flex items-center justify-between">
        <div>
          <h2 className="text-lg font-semibold">Pencatatan Keuangan</h2>
          <p className="text-sm text-gray-500">{records.length} catatan transaksi</p>
        </div>
        <button
          onClick={() => setShowAddModal(true)}
          className="flex items-center gap-2 rounded-md bg-gradient-to-r from-[#c9a45c] to-[#b98a3e] px-4 py-2 text-sm font-semibold text-white shadow-sm hover:opacity-90"
        >
          <Plus className="h-4 w-4" /> Tambah Transaksi
        </button>
      </div>

      {loading ? (
        <>
          <StatsSkeleton />
          <div className="mb-4">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-gray-400" />
              <input
                type="text"
                placeholder="Cari transaksi..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full rounded-lg border border-gray-300 py-2 pl-10 pr-4 text-sm focus:border-[#c9a45c] focus:outline-none focus:ring-1 focus:ring-[#c9a45c]"
              />
            </div>
          </div>
          <TableSkeleton rows={5} cols={8} />
        </>
      ) : loadError ? (
        <InlineError
          title="Gagal memuat data keuangan"
          description="Terjadi kendala saat mengambil catatan keuangan. Periksa koneksi lalu coba lagi."
          onRetry={loadRecords}
        />
      ) : (
        <>
          {/* Stats Cards */}
          <div className="mb-6 grid grid-cols-2 gap-4 lg:grid-cols-4">
            <StatCard icon={DollarSign} tint="bg-blue-100" color="text-blue-600" label="Total Pendapatan" value={formatRupiah(stats.totalRevenue)} />
            <StatCard icon={TrendingUp} tint="bg-green-100" color="text-green-600" label="Sudah Dibayar" value={formatRupiah(stats.totalPaid)} />
            <StatCard icon={TrendingDown} tint="bg-yellow-100" color="text-yellow-600" label="Belum Dibayar" value={formatRupiah(stats.totalPending)} />
            <StatCard
              icon={Calculator}
              tint="bg-purple-100"
              color="text-purple-600"
              label="Status"
              value={`${stats.paidCount} Lunas · ${stats.unpaidCount} Belum`}
            />
          </div>

          {/* Search */}
          <div className="mb-4">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-gray-400" />
              <input
                type="text"
                placeholder="Cari transaksi..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full rounded-lg border border-gray-300 py-2 pl-10 pr-4 text-sm focus:border-[#c9a45c] focus:outline-none focus:ring-1 focus:ring-[#c9a45c]"
              />
            </div>
          </div>

          {/* Records Table */}
          {filteredRecords.length === 0 ? (
            <div className="rounded-xl border border-dashed border-gray-300 bg-white py-12 text-center">
              <p className="text-gray-500">Belum ada catatan keuangan</p>
            </div>
          ) : (
            <div className="overflow-hidden rounded-xl border border-gray-200 bg-white">
              <div className="overflow-x-auto">
                <table className="w-full">
                  <thead className="bg-gray-50">
                    <tr>
                      <th className="px-4 py-3 text-left text-xs font-medium text-gray-500">Client</th>
                      <th className="px-4 py-3 text-left text-xs font-medium text-gray-500">Desain</th>
                      <th className="px-4 py-3 text-right text-xs font-medium text-gray-500">Harga</th>
                      <th className="px-4 py-3 text-right text-xs font-medium text-gray-500">Diskon</th>
                      <th className="px-4 py-3 text-right text-xs font-medium text-gray-500">Promo</th>
                      <th className="px-4 py-3 text-right text-xs font-medium text-gray-500">Final</th>
                      <th className="px-4 py-3 text-right text-xs font-medium text-gray-500">Dibayar</th>
                      <th className="px-4 py-3 text-left text-xs font-medium text-gray-500">Status</th>
                      <th className="px-4 py-3 text-left text-xs font-medium text-gray-500">Aksi</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-gray-200">
                    {filteredRecords.map((record) => (
                      <tr key={record.id} className="hover:bg-gray-50">
                        <td className="px-4 py-3">
                          <p className="font-medium text-gray-900">{record.client_name}</p>
                        </td>
                        <td className="px-4 py-3 text-sm text-gray-700">{record.design_name || '-'}</td>
                        <td className="px-4 py-3 text-right text-sm text-gray-700">{formatRupiah(record.base_price)}</td>
                        <td className="px-4 py-3 text-right text-sm text-red-600">
                          {record.discount > 0 ? `-${formatRupiah(record.discount)}` : '-'}
                        </td>
                        <td className="px-4 py-3 text-right text-sm">
                          {record.promo_code ? (
                            <span className="rounded bg-purple-100 px-2 py-0.5 text-xs text-purple-700">
                              {record.promo_code} (-{formatRupiah(record.promo_amount)})
                            </span>
                          ) : (
                            '-'
                          )}
                        </td>
                        <td className="px-4 py-3 text-right text-sm font-semibold text-gray-900">{formatRupiah(record.final_price)}</td>
                        <td className="px-4 py-3 text-right text-sm text-green-600">{formatRupiah(record.payment_amount)}</td>
                        <td className="px-4 py-3">
                          <span
                            className={`inline-block rounded-full px-2 py-1 text-xs font-medium ${
                              PAYMENT_STATUS_OPTIONS.find((s) => s.value === record.payment_status)?.color || ''
                            }`}
                          >
                            {PAYMENT_STATUS_OPTIONS.find((s) => s.value === record.payment_status)?.label}
                          </span>
                        </td>
                        <td className="px-4 py-3">
                          <div className="flex items-center gap-2">
                            {record.payment_status !== 'paid' && (
                              <button
                                onClick={() => {
                                  setPayAmount(0);
                                  setPayTarget(record);
                                }}
                                className="rounded bg-green-100 px-2 py-1 text-xs text-green-700 hover:bg-green-200"
                              >
                                Bayar
                              </button>
                            )}
                            <button
                              onClick={() => setDeleteTarget(record)}
                              className="rounded p-1 text-gray-400 hover:bg-red-50 hover:text-red-600"
                              aria-label="Hapus catatan"
                              title="Hapus catatan"
                            >
                              <Trash2 className="h-4 w-4" />
                            </button>
                          </div>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          )}
        </>
      )}

      {/* Add Record Modal */}
      <Dialog open={showAddModal} onOpenChange={(o) => { if (!o) setShowAddModal(false); }}>
        <DialogContent className="max-h-[90vh] w-full max-w-lg overflow-y-auto p-6 sm:rounded-xl">
          <DialogTitle className="text-lg font-semibold">Tambah Transaksi Baru</DialogTitle>
          <DialogDescription className="sr-only">
            Isi data transaksi keuangan baru untuk client.
          </DialogDescription>
          <div className="mt-3 space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label htmlFor="fin-client" className="mb-1 block text-sm font-medium text-gray-700">Nama Client *</label>
                <input
                  id="fin-client"
                  type="text"
                  value={newRecord.client_name}
                  onChange={(e) => setNewRecord({ ...newRecord, client_name: e.target.value })}
                  className="w-full rounded-lg border border-gray-300 px-3 py-2 text-sm focus:border-[#c9a45c] focus:outline-none"
                  placeholder="Nama client"
                />
              </div>
              <div>
                <label htmlFor="fin-design" className="mb-1 block text-sm font-medium text-gray-700">Nama Desain</label>
                <input
                  id="fin-design"
                  type="text"
                  value={newRecord.design_name}
                  onChange={(e) => setNewRecord({ ...newRecord, design_name: e.target.value })}
                  className="w-full rounded-lg border border-gray-300 px-3 py-2 text-sm focus:border-[#c9a45c] focus:outline-none"
                  placeholder="Nama desain"
                />
              </div>
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label htmlFor="fin-base" className="mb-1 block text-sm font-medium text-gray-700">Harga Dasar (Rp)</label>
                <input
                  id="fin-base"
                  type="number"
                  value={newRecord.base_price || ''}
                  onChange={(e) => setNewRecord({ ...newRecord, base_price: parseInt(e.target.value) || 0 })}
                  className="w-full rounded-lg border border-gray-300 px-3 py-2 text-sm focus:border-[#c9a45c] focus:outline-none"
                  placeholder="0"
                />
              </div>
              <div>
                <label htmlFor="fin-discount" className="mb-1 block text-sm font-medium text-gray-700">Diskon (Rp)</label>
                <input
                  id="fin-discount"
                  type="number"
                  value={newRecord.discount || ''}
                  onChange={(e) => setNewRecord({ ...newRecord, discount: parseInt(e.target.value) || 0 })}
                  className="w-full rounded-lg border border-gray-300 px-3 py-2 text-sm focus:border-[#c9a45c] focus:outline-none"
                  placeholder="0"
                />
              </div>
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label htmlFor="fin-promo-code" className="mb-1 block text-sm font-medium text-gray-700">Kode Promo</label>
                <input
                  id="fin-promo-code"
                  type="text"
                  value={newRecord.promo_code}
                  onChange={(e) => setNewRecord({ ...newRecord, promo_code: e.target.value })}
                  className="w-full rounded-lg border border-gray-300 px-3 py-2 text-sm focus:border-[#c9a45c] focus:outline-none"
                  placeholder="Contoh: DISKON10"
                />
              </div>
              <div>
                <label htmlFor="fin-promo-nominal" className="mb-1 block text-sm font-medium text-gray-700">Nominal Promo (Rp)</label>
                <input
                  id="fin-promo-nominal"
                  type="number"
                  value={newRecord.promo_amount || ''}
                  onChange={(e) => setNewRecord({ ...newRecord, promo_amount: parseInt(e.target.value) || 0 })}
                  className="w-full rounded-lg border border-gray-300 px-3 py-2 text-sm focus:border-[#c9a45c] focus:outline-none"
                  placeholder="0"
                />
              </div>
            </div>
            <div>
              <label htmlFor="fin-paid" className="mb-1 block text-sm font-medium text-gray-700">Jumlah Dibayar (Rp)</label>
              <input
                id="fin-paid"
                type="number"
                value={newRecord.payment_amount || ''}
                onChange={(e) => setNewRecord({ ...newRecord, payment_amount: parseInt(e.target.value) || 0 })}
                className="w-full rounded-lg border border-gray-300 px-3 py-2 text-sm focus:border-[#c9a45c] focus:outline-none"
                placeholder="0"
              />
            </div>
            <div>
              <label htmlFor="fin-notes" className="mb-1 block text-sm font-medium text-gray-700">Catatan</label>
              <textarea
                id="fin-notes"
                value={newRecord.notes}
                onChange={(e) => setNewRecord({ ...newRecord, notes: e.target.value })}
                className="w-full rounded-lg border border-gray-300 px-3 py-2 text-sm focus:border-[#c9a45c] focus:outline-none"
                rows={2}
                placeholder="Catatan tambahan..."
              />
            </div>

            {/* Preview Final Price */}
            <div className="rounded-lg bg-gray-50 p-3">
              <div className="flex items-center justify-between text-sm">
                <span className="text-gray-500">Harga Final:</span>
                <span className="font-bold text-gray-900">
                  {formatRupiah(
                    calculateFinalPrice(newRecord.base_price, newRecord.discount, newRecord.promo_amount)
                  )}
                </span>
              </div>
            </div>

            <div className="flex justify-end gap-3 pt-2">
              <button
                onClick={() => setShowAddModal(false)}
                className="rounded-lg border border-gray-300 px-4 py-2 text-sm text-gray-700 hover:bg-gray-50"
              >
                Batal
              </button>
              <button
                onClick={handleAddRecord}
                disabled={!newRecord.client_name.trim()}
                className="rounded-lg bg-gradient-to-r from-[#c9a45c] to-[#b98a3e] px-4 py-2 text-sm font-semibold text-white hover:opacity-90 disabled:opacity-50"
              >
                <Save className="mr-1 inline h-4 w-4" /> Simpan
              </button>
            </div>
          </div>
        </DialogContent>
      </Dialog>

      {/* Delete Confirmation */}
      <ConfirmDialog
        open={!!deleteTarget}
        title="Hapus catatan keuangan?"
        message={
          deleteTarget
            ? `Catatan untuk "${deleteTarget.client_name}" akan dihapus selamanya. Tindakan ini tidak bisa dibatalkan.`
            : ''
        }
        confirmLabel="Hapus"
        danger
        busy={deleteBusy}
        onConfirm={confirmDelete}
        onCancel={() => setDeleteTarget(null)}
      />

      {/* Payment Dialog */}
      <Dialog open={!!payTarget} onOpenChange={(o) => { if (!o) setPayTarget(null); }}>
        <DialogContent className="w-full max-w-sm gap-3 p-5 sm:rounded-xl">
          <DialogTitle className="text-base font-semibold text-gray-900">Catat Pembayaran</DialogTitle>
          <DialogDescription className="text-sm text-gray-600">
            {payTarget
              ? `Masukkan jumlah yang dibayar ${payTarget.client_name}. Sisa tagihan: ${formatRupiah(Math.max(0, payTarget.final_price - payTarget.payment_amount))}.`
              : 'Masukkan jumlah yang dibayar oleh client.'}
          </DialogDescription>
          <div>
            <label htmlFor="pay-amount" className="mb-1 block text-sm font-medium text-gray-700">Jumlah (Rp)</label>
            <input
              id="pay-amount"
              type="number"
              min={0}
              value={payAmount || ''}
              onChange={(e) => setPayAmount(parseInt(e.target.value) || 0)}
              className="w-full rounded-lg border border-gray-300 px-3 py-2 text-sm focus:border-[#c9a45c] focus:outline-none"
              placeholder="0"
            />
          </div>
          <div className="flex justify-end gap-3 pt-2">
            <button
              onClick={() => setPayTarget(null)}
              disabled={payBusy}
              className="rounded-lg border border-gray-300 px-4 py-2 text-sm text-gray-700 hover:bg-gray-50 disabled:opacity-50"
            >
              Batal
            </button>
            <button
              onClick={confirmPay}
              disabled={payBusy || payAmount <= 0}
              className="rounded-lg bg-gradient-to-r from-[#c9a45c] to-[#b98a3e] px-4 py-2 text-sm font-semibold text-white hover:opacity-90 disabled:opacity-50"
            >
              {payBusy ? 'Menyimpan...' : 'Simpan'}
            </button>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
}

function StatCard({
  icon: Icon,
  tint,
  color,
  label,
  value
}: {
  icon: LucideIcon;
  tint: string;
  color: string;
  label: string;
  /** Nilai tampil — string atau elemen (mis. dua label status berwarna). */
  value: React.ReactNode;
}) {
  return (
    <div className="rounded-xl border border-gray-200 bg-white p-4">
      <div className="flex items-center gap-3">
        <div className={`flex h-10 w-10 shrink-0 items-center justify-center rounded-lg ${tint}`}>
          <Icon className={`h-5 w-5 ${color}`} />
        </div>
        <div className="min-w-0">
          <p className="text-xs text-gray-500">{label}</p>
          <p className="text-lg font-bold text-gray-900">{value}</p>
        </div>
      </div>
    </div>
  );
}