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
import { Button } from '@/components/ui/button';
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
  { value: 'unpaid', label: 'Belum Dibayar', color: 'bg-destructive/10 text-destructive' },
  { value: 'paid', label: 'Lunas', color: 'bg-emerald-100 text-emerald-800' }
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
          <p className="text-sm text-muted-foreground">{records.length} catatan transaksi</p>
        </div>
        <button
          onClick={() => setShowAddModal(true)}
          className="flex items-center gap-2 rounded-md bg-gradient-to-r from-gold to-gold-strong px-4 py-2 text-sm font-semibold text-primary-foreground shadow-gold hover:opacity-90"
        >
          <Plus className="h-4 w-4" /> Tambah Transaksi
        </button>
      </div>

      {loading ? (
        <>
          <StatsSkeleton />
          <div className="mb-4">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
              <input
                type="text"
                placeholder="Cari transaksi..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full rounded-lg border border-input py-2 pl-10 pr-4 text-sm focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
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
            <StatCard icon={DollarSign} tint="bg-accent" color="text-gold-deep" label="Total Pendapatan" value={formatRupiah(stats.totalRevenue)} />
            <StatCard icon={TrendingUp} tint="bg-emerald-100" color="text-emerald-700" label="Sudah Dibayar" value={formatRupiah(stats.totalPaid)} />
            <StatCard icon={TrendingDown} tint="bg-amber-100" color="text-amber-700" label="Belum Dibayar" value={formatRupiah(stats.totalPending)} />
            <StatCard
              icon={Calculator}
              tint="bg-secondary"
              color="text-secondary-foreground"
              label="Status"
              value={`${stats.paidCount} Lunas · ${stats.unpaidCount} Belum`}
            />
          </div>

          {/* Search */}
          <div className="mb-4">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" aria-hidden />
              <input
                type="text"
                placeholder="Cari transaksi..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full rounded-lg border border-input py-2 pl-10 pr-4 text-sm focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
              />
            </div>
          </div>

          {/* Records Table */}
          {filteredRecords.length === 0 ? (
            <div className="flex flex-col items-center rounded-2xl border border-dashed border-border bg-card px-6 py-14 text-center">
              <span className="flex h-12 w-12 items-center justify-center rounded-full bg-gold/15">
                <Calculator className="h-6 w-6 text-gold-strong" aria-hidden />
              </span>
              <p className="mt-3 text-sm font-medium text-foreground">Belum ada catatan keuangan</p>
              <p className="mt-1 max-w-xs text-xs text-muted-foreground">Catat transaksi pertama untuk memantau pendapatan dan pembayaran.</p>
              <Button onClick={() => setShowAddModal(true)} className="mt-4">
                <Plus className="h-4 w-4" aria-hidden /> Tambah Transaksi
              </Button>
            </div>
          ) : (
            <div className="overflow-hidden rounded-2xl border border-border bg-card shadow-soft">
              <div className="overflow-x-auto">
                <table className="w-full">
                  <caption className="sr-only">Catatan keuangan</caption>
                  <thead className="bg-muted">
                    <tr>
                      <th scope="col" className="px-4 py-3 text-left text-xs font-medium text-muted-foreground">Client</th>
                      <th scope="col" className="px-4 py-3 text-left text-xs font-medium text-muted-foreground">Desain</th>
                      <th scope="col" className="px-4 py-3 text-right text-xs font-medium text-muted-foreground">Harga</th>
                      <th scope="col" className="px-4 py-3 text-right text-xs font-medium text-muted-foreground">Diskon</th>
                      <th scope="col" className="px-4 py-3 text-right text-xs font-medium text-muted-foreground">Promo</th>
                      <th scope="col" className="px-4 py-3 text-right text-xs font-medium text-muted-foreground">Final</th>
                      <th scope="col" className="px-4 py-3 text-right text-xs font-medium text-muted-foreground">Dibayar</th>
                      <th scope="col" className="px-4 py-3 text-left text-xs font-medium text-muted-foreground">Status</th>
                      <th scope="col" className="px-4 py-3 text-left text-xs font-medium text-muted-foreground">Aksi</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-border">
                    {filteredRecords.map((record) => (
                      <tr key={record.id} className="hover:bg-accent/40">
                        <td className="px-4 py-3">
                          <p className="font-medium text-foreground">{record.client_name}</p>
                        </td>
                        <td className="px-4 py-3 text-sm text-foreground">{record.design_name || '-'}</td>
                        <td className="px-4 py-3 text-right text-sm text-foreground">{formatRupiah(record.base_price)}</td>
                        <td className="px-4 py-3 text-right text-sm text-destructive">
                          {record.discount > 0 ? `-${formatRupiah(record.discount)}` : '-'}
                        </td>
                        <td className="px-4 py-3 text-right text-sm">
                          {record.promo_code ? (
                            <span className="rounded bg-secondary px-2 py-0.5 text-xs text-secondary-foreground">
                              {record.promo_code} (-{formatRupiah(record.promo_amount)})
                            </span>
                          ) : (
                            '-'
                          )}
                        </td>
                        <td className="px-4 py-3 text-right text-sm font-semibold text-foreground">{formatRupiah(record.final_price)}</td>
                        <td className="px-4 py-3 text-right text-sm text-emerald-700">{formatRupiah(record.payment_amount)}</td>
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
                                className="min-h-11 rounded-md bg-emerald-100 px-3 text-xs font-medium text-emerald-800 transition-colors hover:bg-emerald-200"
                              >
                                Bayar
                              </button>
                            )}
                            <button
                              onClick={() => setDeleteTarget(record)}
                              className="inline-flex h-11 w-11 items-center justify-center rounded-md text-muted-foreground transition-colors hover:bg-destructive/10 hover:text-destructive"
                              aria-label="Hapus catatan"
                              title="Hapus catatan"
                            >
                              <Trash2 className="h-4 w-4" aria-hidden />
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
        <DialogContent className="max-h-[90vh] w-full max-w-lg overflow-y-auto p-6 sm:rounded-2xl">
          <DialogTitle className="text-lg font-semibold">Tambah Transaksi Baru</DialogTitle>
          <DialogDescription className="sr-only">
            Isi data transaksi keuangan baru untuk client.
          </DialogDescription>
          <div className="mt-3 space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label htmlFor="fin-client" className="mb-1 block text-sm font-medium text-foreground">Nama Client *</label>
                <input
                  id="fin-client"
                  type="text"
                  value={newRecord.client_name}
                  onChange={(e) => setNewRecord({ ...newRecord, client_name: e.target.value })}
                  className="w-full rounded-lg border border-input px-3 py-2 text-sm focus:border-gold focus:outline-none"
                  placeholder="Nama client"
                />
              </div>
              <div>
                <label htmlFor="fin-design" className="mb-1 block text-sm font-medium text-foreground">Nama Desain</label>
                <input
                  id="fin-design"
                  type="text"
                  value={newRecord.design_name}
                  onChange={(e) => setNewRecord({ ...newRecord, design_name: e.target.value })}
                  className="w-full rounded-lg border border-input px-3 py-2 text-sm focus:border-gold focus:outline-none"
                  placeholder="Nama desain"
                />
              </div>
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label htmlFor="fin-base" className="mb-1 block text-sm font-medium text-foreground">Harga Dasar (Rp)</label>
                <input
                  id="fin-base"
                  type="number"
                  value={newRecord.base_price || ''}
                  onChange={(e) => setNewRecord({ ...newRecord, base_price: parseInt(e.target.value) || 0 })}
                  className="w-full rounded-lg border border-input px-3 py-2 text-sm focus:border-gold focus:outline-none"
                  placeholder="0"
                />
              </div>
              <div>
                <label htmlFor="fin-discount" className="mb-1 block text-sm font-medium text-foreground">Diskon (Rp)</label>
                <input
                  id="fin-discount"
                  type="number"
                  value={newRecord.discount || ''}
                  onChange={(e) => setNewRecord({ ...newRecord, discount: parseInt(e.target.value) || 0 })}
                  className="w-full rounded-lg border border-input px-3 py-2 text-sm focus:border-gold focus:outline-none"
                  placeholder="0"
                />
              </div>
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label htmlFor="fin-promo-code" className="mb-1 block text-sm font-medium text-foreground">Kode Promo</label>
                <input
                  id="fin-promo-code"
                  type="text"
                  value={newRecord.promo_code}
                  onChange={(e) => setNewRecord({ ...newRecord, promo_code: e.target.value })}
                  className="w-full rounded-lg border border-input px-3 py-2 text-sm focus:border-gold focus:outline-none"
                  placeholder="Contoh: DISKON10"
                />
              </div>
              <div>
                <label htmlFor="fin-promo-nominal" className="mb-1 block text-sm font-medium text-foreground">Nominal Promo (Rp)</label>
                <input
                  id="fin-promo-nominal"
                  type="number"
                  value={newRecord.promo_amount || ''}
                  onChange={(e) => setNewRecord({ ...newRecord, promo_amount: parseInt(e.target.value) || 0 })}
                  className="w-full rounded-lg border border-input px-3 py-2 text-sm focus:border-gold focus:outline-none"
                  placeholder="0"
                />
              </div>
            </div>
            <div>
              <label htmlFor="fin-paid" className="mb-1 block text-sm font-medium text-foreground">Jumlah Dibayar (Rp)</label>
              <input
                id="fin-paid"
                type="number"
                value={newRecord.payment_amount || ''}
                onChange={(e) => setNewRecord({ ...newRecord, payment_amount: parseInt(e.target.value) || 0 })}
                className="w-full rounded-lg border border-input px-3 py-2 text-sm focus:border-gold focus:outline-none"
                placeholder="0"
              />
            </div>
            <div>
              <label htmlFor="fin-notes" className="mb-1 block text-sm font-medium text-foreground">Catatan</label>
              <textarea
                id="fin-notes"
                value={newRecord.notes}
                onChange={(e) => setNewRecord({ ...newRecord, notes: e.target.value })}
                className="w-full rounded-lg border border-input px-3 py-2 text-sm focus:border-gold focus:outline-none"
                rows={2}
                placeholder="Catatan tambahan..."
              />
            </div>

            {/* Preview Final Price */}
            <div className="rounded-lg bg-muted p-3">
              <div className="flex items-center justify-between text-sm">
                <span className="text-muted-foreground">Harga Final:</span>
                <span className="font-bold text-foreground">
                  {formatRupiah(
                    calculateFinalPrice(newRecord.base_price, newRecord.discount, newRecord.promo_amount)
                  )}
                </span>
              </div>
            </div>

            <div className="flex justify-end gap-3 pt-2">
              <button
                onClick={() => setShowAddModal(false)}
                className="rounded-lg border border-input px-4 py-2 text-sm text-foreground hover:bg-muted"
              >
                Batal
              </button>
              <button
                onClick={handleAddRecord}
                disabled={!newRecord.client_name.trim()}
                className="rounded-lg bg-gradient-to-r from-gold to-gold-strong px-4 py-2 text-sm font-semibold text-primary-foreground hover:opacity-90 disabled:opacity-50"
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
        <DialogContent className="w-full max-w-sm gap-3 p-5 sm:rounded-2xl">
          <DialogTitle className="text-base font-semibold text-foreground">Catat Pembayaran</DialogTitle>
          <DialogDescription className="text-sm text-muted-foreground">
            {payTarget
              ? `Masukkan jumlah yang dibayar ${payTarget.client_name}. Sisa tagihan: ${formatRupiah(Math.max(0, payTarget.final_price - payTarget.payment_amount))}.`
              : 'Masukkan jumlah yang dibayar oleh client.'}
          </DialogDescription>
          <div>
            <label htmlFor="pay-amount" className="mb-1 block text-sm font-medium text-foreground">Jumlah (Rp)</label>
            <input
              id="pay-amount"
              type="number"
              min={0}
              value={payAmount || ''}
              onChange={(e) => setPayAmount(parseInt(e.target.value) || 0)}
              className="w-full rounded-lg border border-input px-3 py-2 text-sm focus:border-gold focus:outline-none"
              placeholder="0"
            />
          </div>
          <div className="flex justify-end gap-3 pt-2">
            <button
              onClick={() => setPayTarget(null)}
              disabled={payBusy}
              className="rounded-lg border border-input px-4 py-2 text-sm text-foreground hover:bg-muted disabled:opacity-50"
            >
              Batal
            </button>
            <button
              onClick={confirmPay}
              disabled={payBusy || payAmount <= 0}
              className="rounded-lg bg-gradient-to-r from-gold to-gold-strong px-4 py-2 text-sm font-semibold text-primary-foreground hover:opacity-90 disabled:opacity-50"
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
    <div className="rounded-2xl border border-border bg-card p-4 shadow-soft">
      <div className="flex items-center gap-3">
        <div className={`flex h-10 w-10 shrink-0 items-center justify-center rounded-lg ${tint}`}>
          <Icon className={`h-5 w-5 ${color}`} />
        </div>
        <div className="min-w-0">
          <p className="text-xs text-muted-foreground">{label}</p>
          <p className="text-lg font-bold text-foreground">{value}</p>
        </div>
      </div>
    </div>
  );
}