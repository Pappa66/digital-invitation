'use client';

import { useState, useEffect, useMemo } from 'react';
import { Plus, Search, DollarSign, TrendingUp, TrendingDown, Trash2, Save, X, Calculator, Settings, Tag, Clock } from 'lucide-react';
import { demoIsDemoMode } from '@/lib/env';

interface LandingPricing {
  base_price: number;
  discount_percent: number;
  promo_code: string;
  promo_expires_at: string;
}

const defaultPricing: LandingPricing = { base_price: 0, discount_percent: 0, promo_code: '', promo_expires_at: '' };

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
  payment_status: 'belum' | 'dp' | 'lunas';
  payment_amount: number;
  payment_date: string;
  notes: string;
  created_at: string;
}

const PAYMENT_STATUS_OPTIONS = [
  { value: 'belum', label: 'Belum Bayar', color: 'bg-red-100 text-red-700' },
  { value: 'dp', label: 'DP Terbayar', color: 'bg-yellow-100 text-yellow-700' },
  { value: 'lunas', label: 'Lunas', color: 'bg-green-100 text-green-700' }
];

function formatCurrency(amount: number): string {
  return new Intl.NumberFormat('id-ID', { style: 'currency', currency: 'IDR', minimumFractionDigits: 0 }).format(amount);
}

export default function FinanceTracker() {
  const [records, setRecords] = useState<FinanceRecord[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [showAddModal, setShowAddModal] = useState(false);
  const [newRecord, setNewRecord] = useState({
    client_name: '',
    design_name: '',
    base_price: 0,
    discount: 0,
    promo_code: '',
    promo_amount: 0,
    payment_amount: 0,
    notes: ''
  });
  const [showPricingConfig, setShowPricingConfig] = useState(false);
  const [landingPricing, setLandingPricing] = useState<LandingPricing>(defaultPricing);

  useEffect(() => {
    try {
      const stored = localStorage.getItem('di_landing_pricing');
      if (stored) setLandingPricing(JSON.parse(stored));
    } catch { /* ignore */ }
  }, []);

  function saveLandingPricing(p: LandingPricing) {
    setLandingPricing(p);
    localStorage.setItem('di_landing_pricing', JSON.stringify(p));
  }

  async function loadRecords() {
    setLoading(true);
    try {
      if (demoIsDemoMode()) {
        const stored = localStorage.getItem('di_finance');
        if (stored) setRecords(JSON.parse(stored));
      } else {
        const stored = localStorage.getItem('di_finance');
        if (stored) setRecords(JSON.parse(stored));
      }
    } catch (error) {
      console.error('Error loading finance records:', error);
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    loadRecords();
  }, []);

  function saveRecords(updatedRecords: FinanceRecord[]) {
    setRecords(updatedRecords);
    localStorage.setItem('di_finance', JSON.stringify(updatedRecords));
  }

  function calculateFinalPrice(base: number, discount: number, promoAmount: number): number {
    return Math.max(0, base - discount - promoAmount);
  }

  function handleAddRecord() {
    if (!newRecord.client_name.trim()) return;

    const finalPrice = calculateFinalPrice(newRecord.base_price, newRecord.discount, newRecord.promo_amount);
    const paymentStatus = newRecord.payment_amount <= 0 ? 'belum' : newRecord.payment_amount >= finalPrice ? 'lunas' : 'dp';

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
    setShowAddModal(false);
    setNewRecord({ client_name: '', design_name: '', base_price: 0, discount: 0, promo_code: '', promo_amount: 0, payment_amount: 0, notes: '' });
  }

  function handleDeleteRecord(id: string) {
    if (confirm('Hapus catatan keuangan ini?')) {
      saveRecords(records.filter((r) => r.id !== id));
    }
  }

  function handleUpdatePayment(id: string, amount: number) {
    const record = records.find((r) => r.id === id);
    if (!record) return;

    const newAmount = record.payment_amount + amount;
    const paymentStatus = newAmount <= 0 ? 'belum' : newAmount >= record.final_price ? 'lunas' : 'dp';

    saveRecords(
      records.map((r) =>
        r.id === id
          ? { ...r, payment_amount: Math.max(0, newAmount), payment_status: paymentStatus, payment_date: new Date().toISOString() }
          : r
      )
    );
  }

  // Statistics
  const stats = useMemo(() => {
    const totalRevenue = records.reduce((sum, r) => sum + r.final_price, 0);
    const totalPaid = records.reduce((sum, r) => sum + r.payment_amount, 0);
    const totalPending = totalRevenue - totalPaid;
    const lunasCount = records.filter((r) => r.payment_status === 'lunas').length;
    const dpCount = records.filter((r) => r.payment_status === 'dp').length;
    const belumCount = records.filter((r) => r.payment_status === 'belum').length;

    return { totalRevenue, totalPaid, totalPending, lunasCount, dpCount, belumCount };
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
        <div className="flex gap-2">
          <button
            onClick={() => setShowPricingConfig(!showPricingConfig)}
            className="flex items-center gap-2 rounded-md border border-gray-300 bg-white px-4 py-2 text-sm font-medium text-gray-700 hover:bg-gray-50"
          >
            <Settings className="h-4 w-4" /> Harga Landing Page
          </button>
          <button
            onClick={() => setShowAddModal(true)}
            className="flex items-center gap-2 rounded-md bg-gradient-to-r from-[#c9a45c] to-[#b98a3e] px-4 py-2 text-sm font-semibold text-white shadow-sm hover:opacity-90"
          >
            <Plus className="h-4 w-4" /> Tambah Transaksi
          </button>
        </div>
      </div>

      {/* Landing Page Pricing Config */}
      {showPricingConfig && (
        <div className="mb-6 rounded-xl border border-[#c9a45c]/30 bg-[#faf7f2] p-5">
          <h3 className="mb-3 flex items-center gap-2 text-sm font-semibold text-[#4a443c]">
            <Tag className="h-4 w-4 text-[#c9a45c]" /> Pengaturan Harga Landing Page
          </h3>
          <p className="mb-4 text-xs text-[#8a7a66]">Harga dan promo ini ditampilkan di halaman depan publik.</p>
          <div className="grid grid-cols-2 gap-4 md:grid-cols-4">
            <div>
              <label className="mb-1 block text-xs font-medium text-[#4a443c]">Harga Dasar (Rp)</label>
              <input
                type="number"
                value={landingPricing.base_price || ''}
                onChange={(e) => saveLandingPricing({ ...landingPricing, base_price: parseInt(e.target.value) || 0 })}
                className="w-full rounded-md border border-[#e0d6c2] bg-white px-3 py-2 text-sm"
                placeholder="2500000"
              />
            </div>
            <div>
              <label className="mb-1 block text-xs font-medium text-[#4a443c]">Diskon (%)</label>
              <input
                type="number"
                min={0}
                max={100}
                value={landingPricing.discount_percent || ''}
                onChange={(e) => saveLandingPricing({ ...landingPricing, discount_percent: parseInt(e.target.value) || 0 })}
                className="w-full rounded-md border border-[#e0d6c2] bg-white px-3 py-2 text-sm"
                placeholder="15"
              />
            </div>
            <div>
              <label className="mb-1 block text-xs font-medium text-[#4a443c]">Kode Promo</label>
              <input
                type="text"
                value={landingPricing.promo_code}
                onChange={(e) => saveLandingPricing({ ...landingPricing, promo_code: e.target.value.toUpperCase() })}
                className="w-full rounded-md border border-[#e0d6c2] bg-white px-3 py-2 text-sm uppercase"
                placeholder="WEDDING15"
              />
            </div>
            <div>
              <label className="mb-1 block text-xs font-medium text-[#4a443c]">Berlaku Hingga</label>
              <input
                type="date"
                value={landingPricing.promo_expires_at?.split('T')[0] || ''}
                onChange={(e) => saveLandingPricing({ ...landingPricing, promo_expires_at: e.target.value ? `${e.target.value}T23:59:59` : '' })}
                className="w-full rounded-md border border-[#e0d6c2] bg-white px-3 py-2 text-sm"
              />
            </div>
          </div>
          {landingPricing.base_price > 0 && landingPricing.discount_percent > 0 && (
            <p className="mt-3 text-xs text-[#c9a45c]">
              Harga final: {formatCurrency(Math.round(landingPricing.base_price * (1 - landingPricing.discount_percent / 100)))}
              {landingPricing.promo_code && ` (kode: ${landingPricing.promo_code})`}
            </p>
          )}
        </div>
      )}

      {/* Stats Cards */}
      <div className="mb-6 grid grid-cols-2 gap-4 lg:grid-cols-4">
        <div className="rounded-xl border border-gray-200 bg-white p-4">
          <div className="flex items-center gap-3">
            <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-blue-100">
              <DollarSign className="h-5 w-5 text-blue-600" />
            </div>
            <div>
              <p className="text-xs text-gray-500">Total Pendapatan</p>
              <p className="text-lg font-bold text-gray-900">{formatCurrency(stats.totalRevenue)}</p>
            </div>
          </div>
        </div>
        <div className="rounded-xl border border-gray-200 bg-white p-4">
          <div className="flex items-center gap-3">
            <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-green-100">
              <TrendingUp className="h-5 w-5 text-green-600" />
            </div>
            <div>
              <p className="text-xs text-gray-500">Sudah Dibayar</p>
              <p className="text-lg font-bold text-green-600">{formatCurrency(stats.totalPaid)}</p>
            </div>
          </div>
        </div>
        <div className="rounded-xl border border-gray-200 bg-white p-4">
          <div className="flex items-center gap-3">
            <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-yellow-100">
              <TrendingDown className="h-5 w-5 text-yellow-600" />
            </div>
            <div>
              <p className="text-xs text-gray-500">Belum Dibayar</p>
              <p className="text-lg font-bold text-yellow-600">{formatCurrency(stats.totalPending)}</p>
            </div>
          </div>
        </div>
        <div className="rounded-xl border border-gray-200 bg-white p-4">
          <div className="flex items-center gap-3">
            <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-purple-100">
              <Calculator className="h-5 w-5 text-purple-600" />
            </div>
            <div>
              <p className="text-xs text-gray-500">Status</p>
              <div className="flex gap-2 text-xs">
                <span className="text-green-600">{stats.lunasCount} Lunas</span>
                <span className="text-yellow-600">{stats.dpCount} DP</span>
                <span className="text-red-600">{stats.belumCount} Belum</span>
              </div>
            </div>
          </div>
        </div>
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
      {loading ? (
        <div className="py-12 text-center text-gray-500">Memuat data keuangan...</div>
      ) : filteredRecords.length === 0 ? (
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
                    <td className="px-4 py-3 text-right text-sm text-gray-700">{formatCurrency(record.base_price)}</td>
                    <td className="px-4 py-3 text-right text-sm text-red-600">
                      {record.discount > 0 ? `-${formatCurrency(record.discount)}` : '-'}
                    </td>
                    <td className="px-4 py-3 text-right text-sm">
                      {record.promo_code ? (
                        <span className="rounded bg-purple-100 px-2 py-0.5 text-xs text-purple-700">
                          {record.promo_code} (-{formatCurrency(record.promo_amount)})
                        </span>
                      ) : (
                        '-'
                      )}
                    </td>
                    <td className="px-4 py-3 text-right text-sm font-semibold text-gray-900">{formatCurrency(record.final_price)}</td>
                    <td className="px-4 py-3 text-right text-sm text-green-600">{formatCurrency(record.payment_amount)}</td>
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
                        {record.payment_status !== 'lunas' && (
                          <button
                            onClick={() => {
                              const amount = prompt('Masukkan jumlah pembayaran:');
                              if (amount) handleUpdatePayment(record.id, parseInt(amount) || 0);
                            }}
                            className="rounded bg-green-100 px-2 py-1 text-xs text-green-700 hover:bg-green-200"
                          >
                            Bayar
                          </button>
                        )}
                        <button
                          onClick={() => handleDeleteRecord(record.id)}
                          className="rounded p-1 text-gray-400 hover:bg-red-50 hover:text-red-600"
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

      {/* Add Record Modal */}
      {showAddModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50">
          <div className="w-full max-w-lg rounded-xl bg-white p-6 shadow-xl">
            <div className="mb-4 flex items-center justify-between">
              <h3 className="text-lg font-semibold">Tambah Transaksi Baru</h3>
              <button onClick={() => setShowAddModal(false)} className="text-gray-400 hover:text-gray-600">
                <X className="h-5 w-5" />
              </button>
            </div>
            <div className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="mb-1 block text-sm font-medium text-gray-700">Nama Client *</label>
                  <input
                    type="text"
                    value={newRecord.client_name}
                    onChange={(e) => setNewRecord({ ...newRecord, client_name: e.target.value })}
                    className="w-full rounded-lg border border-gray-300 px-3 py-2 text-sm focus:border-[#c9a45c] focus:outline-none"
                    placeholder="Nama client"
                  />
                </div>
                <div>
                  <label className="mb-1 block text-sm font-medium text-gray-700">Nama Desain</label>
                  <input
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
                  <label className="mb-1 block text-sm font-medium text-gray-700">Harga Dasar (Rp)</label>
                  <input
                    type="number"
                    value={newRecord.base_price || ''}
                    onChange={(e) => setNewRecord({ ...newRecord, base_price: parseInt(e.target.value) || 0 })}
                    className="w-full rounded-lg border border-gray-300 px-3 py-2 text-sm focus:border-[#c9a45c] focus:outline-none"
                    placeholder="0"
                  />
                </div>
                <div>
                  <label className="mb-1 block text-sm font-medium text-gray-700">Diskon (Rp)</label>
                  <input
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
                  <label className="mb-1 block text-sm font-medium text-gray-700">Kode Promo</label>
                  <input
                    type="text"
                    value={newRecord.promo_code}
                    onChange={(e) => setNewRecord({ ...newRecord, promo_code: e.target.value })}
                    className="w-full rounded-lg border border-gray-300 px-3 py-2 text-sm focus:border-[#c9a45c] focus:outline-none"
                    placeholder="Contoh: DISKON10"
                  />
                </div>
                <div>
                  <label className="mb-1 block text-sm font-medium text-gray-700">Nominal Promo (Rp)</label>
                  <input
                    type="number"
                    value={newRecord.promo_amount || ''}
                    onChange={(e) => setNewRecord({ ...newRecord, promo_amount: parseInt(e.target.value) || 0 })}
                    className="w-full rounded-lg border border-gray-300 px-3 py-2 text-sm focus:border-[#c9a45c] focus:outline-none"
                    placeholder="0"
                  />
                </div>
              </div>
              <div>
                <label className="mb-1 block text-sm font-medium text-gray-700">Jumlah Dibayar (Rp)</label>
                <input
                  type="number"
                  value={newRecord.payment_amount || ''}
                  onChange={(e) => setNewRecord({ ...newRecord, payment_amount: parseInt(e.target.value) || 0 })}
                  className="w-full rounded-lg border border-gray-300 px-3 py-2 text-sm focus:border-[#c9a45c] focus:outline-none"
                  placeholder="0"
                />
              </div>
              <div>
                <label className="mb-1 block text-sm font-medium text-gray-700">Catatan</label>
                <textarea
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
                    {formatCurrency(
                      calculateFinalPrice(newRecord.base_price, newRecord.discount, newRecord.promo_amount)
                    )}
                  </span>
                </div>
              </div>

              <div className="flex justify-end gap-3 pt-4">
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
          </div>
        </div>
      )}
    </div>
  );
}
