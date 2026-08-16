'use client';

import { useEffect, useState, useMemo } from 'react';
import { HelpCircle, Plus, Search, Calendar, Users, DollarSign } from 'lucide-react';
import ProjectCard from '@/components/dashboard/project-card';
import NewProjectModal from '@/components/dashboard/new-project-modal';
import ClientManagement from '@/components/dashboard/client-management';
import FinanceTracker from '@/components/dashboard/finance-tracker';
import GuideModal from '@/components/ui/guide-modal';
import { Tabs, TabsList, TabsTrigger, TabsContent } from '@/components/ui/tabs';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Select, SelectTrigger, SelectValue, SelectContent, SelectItem } from '@/components/ui/select';
import type { Project } from '@/lib/types';
import { demoListProjects } from '@/lib/demo/demo-store';

interface DashboardClientProps {
  projects: Project[];
  isDemo?: boolean;
  userName?: string | null;
}

function makeDemoProject(id: string, title: string): Project {
  const now = new Date().toISOString();
  return {
    id,
    title,
    slug: title.toLowerCase().replace(/[^a-z0-9]+/g, '-'),
    user_id: 'demo',
    status: 'draft',
    thumbnail: null,
    created_at: now,
    updated_at: now
  };
}

type TabType = 'invitations' | 'clients' | 'finance';

export default function DashboardClient({ projects, isDemo = false, userName = null }: DashboardClientProps) {
  const [items, setItems] = useState<Project[]>(projects);
  const [modalOpen, setModalOpen] = useState(false);
  const [toast, setToast] = useState<string | null>(null);
  const [page, setPage] = useState(1);
  const [guideOpen, setGuideOpen] = useState(false);
  const [activeTab, setActiveTab] = useState<TabType>('invitations');

  // Search & Filter state
  const [searchQuery, setSearchQuery] = useState('');
  const [filterMonth, setFilterMonth] = useState<string>('');
  const [filterYear, setFilterYear] = useState<string>('');
  const [filterStatus, setFilterStatus] = useState<string>('');

  const PER_PAGE = 8;

  // Get unique years from projects
  const availableYears = useMemo(() => {
    const years = new Set(items.map((p) => new Date(p.created_at).getFullYear()));
    return Array.from(years).sort((a, b) => b - a);
  }, [items]);

  // Filter and search projects
  const filteredItems = useMemo(() => {
    return items.filter((p) => {
      // Search filter
      if (searchQuery) {
        const query = searchQuery.toLowerCase();
        if (!p.title.toLowerCase().includes(query) && !p.slug.toLowerCase().includes(query)) {
          return false;
        }
      }

      // Status filter
      if (filterStatus && p.status !== filterStatus) {
        return false;
      }

      // Date filters
      const createdDate = new Date(p.created_at);
      if (filterMonth && createdDate.getMonth() + 1 !== parseInt(filterMonth)) {
        return false;
      }
      if (filterYear && createdDate.getFullYear() !== parseInt(filterYear)) {
        return false;
      }

      return true;
    });
  }, [items, searchQuery, filterMonth, filterYear, filterStatus]);

  const totalPages = Math.max(1, Math.ceil(filteredItems.length / PER_PAGE));
  const safePage = Math.min(page, totalPages);
  const pagedItems = filteredItems.slice((safePage - 1) * PER_PAGE, safePage * PER_PAGE);

  useEffect(() => {
    if (isDemo) setItems(demoListProjects());
  }, [isDemo]);

  // Reset page when filters change
  useEffect(() => {
    setPage(1);
  }, [searchQuery, filterMonth, filterYear, filterStatus]);

  function showToast(msg: string) {
    setToast(msg);
    setTimeout(() => setToast(null), 2000);
  }

  function handleDuplicated(id: string, title: string) {
    setItems((prev) => [makeDemoProject(id, title), ...prev]);
    showToast(`Duplicating project... "${title}"`);
  }

  function handleDeleted(id: string) {
    setItems((prev) => prev.filter((p) => p.id !== id));
  }

  function clearFilters() {
    setSearchQuery('');
    setFilterMonth('');
    setFilterYear('');
    setFilterStatus('');
  }

  const hasActiveFilters = searchQuery || filterMonth || filterYear || filterStatus;

  return (
    <div>
      {/* Tab Navigation */}
      <Tabs value={activeTab} onValueChange={(v) => setActiveTab(v as TabType)} className="mb-6">
        <TabsList>
          <TabsTrigger value="invitations">
            <Calendar className="h-4 w-4" /> Undangan
          </TabsTrigger>
          <TabsTrigger value="clients">
            <Users className="h-4 w-4" /> Client
          </TabsTrigger>
          <TabsTrigger value="finance">
            <DollarSign className="h-4 w-4" /> Keuangan
          </TabsTrigger>
        </TabsList>

        {/* Invitations Tab */}
        <TabsContent value="invitations">
          <div className="mb-6 flex items-center justify-between">
            <div>
              <h2 className="text-lg font-semibold">Daftar Undangan</h2>
              <p className="text-sm text-gray-500">
                {filteredItems.length === 0
                  ? '0 undangan ditemukan'
                  : `${(safePage - 1) * PER_PAGE + 1}–${Math.min(safePage * PER_PAGE, filteredItems.length)} dari ${filteredItems.length} undangan`}
                {hasActiveFilters && (
                  <button onClick={clearFilters} className="ml-2 text-[#c9a45c] hover:underline">
                    (Reset filter)
                  </button>
                )}
                {isDemo && <span className="ml-2 rounded bg-amber-100 px-1.5 py-0.5 text-xs text-amber-700">Mode Demo</span>}
              </p>
            </div>
            <div className="flex items-center gap-2">
              <Button variant="outline" onClick={() => setGuideOpen(true)}>
                <HelpCircle className="h-4 w-4" /> Panduan
              </Button>
              <Button onClick={() => setModalOpen(true)}>
                <Plus className="h-4 w-4" /> Create New
              </Button>
            </div>
          </div>

          {/* Search and Filters */}
          <div className="mb-6 rounded-lg border bg-card p-4">
            <div className="flex flex-col gap-4 lg:flex-row">
              {/* Search */}
              <div className="flex-1">
                <div className="relative">
                  <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
                  <Input
                    type="text"
                    placeholder="Cari undangan..."
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    className="pl-10"
                  />
                </div>
              </div>

              {/* Filters */}
              <div className="flex flex-wrap items-center gap-3">
                <div className="flex items-center gap-2 text-muted-foreground">
                  <span className="text-xs">Filter:</span>
                </div>

                <Select value={filterStatus} onValueChange={setFilterStatus}>
                  <SelectTrigger className="w-auto gap-2 text-sm">
                    <SelectValue placeholder="Semua Status" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="">Semua Status</SelectItem>
                    <SelectItem value="published">Published</SelectItem>
                    <SelectItem value="draft">Draft</SelectItem>
                  </SelectContent>
                </Select>

                <Select value={filterMonth} onValueChange={setFilterMonth}>
                  <SelectTrigger className="w-auto gap-2 text-sm">
                    <SelectValue placeholder="Semua Bulan" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="">Semua Bulan</SelectItem>
                    {Array.from({ length: 12 }, (_, i) => i + 1).map((m) => (
                      <SelectItem key={m} value={String(m)}>
                        {new Date(0, m - 1).toLocaleDateString('id-ID', { month: 'long' })}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>

                <Select value={filterYear} onValueChange={setFilterYear}>
                  <SelectTrigger className="w-auto gap-2 text-sm">
                    <SelectValue placeholder="Semua Tahun" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="">Semua Tahun</SelectItem>
                    {availableYears.map((year) => (
                      <SelectItem key={year} value={String(year)}>
                        {year}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            </div>
          </div>

          {isDemo && (
            <p className="mb-4 rounded-md bg-sky-50 px-3 py-2 text-xs text-sky-700">
              Mode Demo aktif — data disimpan di browser (localStorage), tanpa Supabase. Untuk produksi,
              matikan <code className="rounded bg-sky-100 px-1">NEXT_PUBLIC_DEMO_MODE</code> di .env.local.
            </p>
          )}

          {filteredItems.length === 0 ? (
            <div className="flex flex-col items-center justify-center rounded-xl border border-dashed bg-card py-24 text-center">
              <div className="mb-4 flex h-16 w-16 items-center justify-center rounded-full bg-gradient-to-br from-[#c9a45c]/20 to-[#b98a3e]/10">
                <svg className="h-8 w-8 text-[#c9a45c]" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
                  <path strokeLinecap="round" strokeLinejoin="round" d="M12 4.5v15m7.5-7.5h-15" />
                </svg>
              </div>
              <p className="text-base font-medium text-gray-700">
                {hasActiveFilters ? 'Tidak ada undangan yang cocok' : 'Belum ada undangan'}
              </p>
              <p className="mt-1 max-w-xs text-sm text-gray-400">
                {hasActiveFilters
                  ? 'Coba ubah filter atau kata kunci pencarian Anda.'
                  : 'Buat undangan digital pertama Anda dan bagikan ke tamu dalam hitungan menit.'}
              </p>
              {!hasActiveFilters && (
                <Button onClick={() => setModalOpen(true)} className="mt-5">
                  Buat Undangan Pertama
                </Button>
              )}
            </div>
          ) : (
            <div className="grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
              {pagedItems.map((p) => (
                <ProjectCard key={p.id} project={p} onDuplicated={handleDuplicated} onDeleted={handleDeleted} />
              ))}
            </div>
          )}

          {filteredItems.length > PER_PAGE && (
            <div className="mt-6 flex items-center justify-center gap-2">
              <Button variant="outline" size="sm" onClick={() => setPage((p) => Math.max(1, p - 1))} disabled={safePage === 1}>
                ← Sebelumnya
              </Button>
              {Array.from({ length: totalPages }, (_, i) => i + 1).map((n) => (
                <Button
                  key={n}
                  variant={n === safePage ? 'default' : 'outline'}
                  size="icon"
                  className="h-8 w-8 text-sm"
                  onClick={() => setPage(n)}
                >
                  {n}
                </Button>
              ))}
              <Button
                variant="outline"
                size="sm"
                onClick={() => setPage((p) => Math.min(totalPages, p + 1))}
                disabled={safePage === totalPages}
              >
                Berikutnya →
              </Button>
            </div>
          )}
        </TabsContent>

        {/* Clients Tab */}
        <TabsContent value="clients">
          <ClientManagement />
        </TabsContent>

        {/* Finance Tab */}
        <TabsContent value="finance">
          <FinanceTracker />
        </TabsContent>
      </Tabs>

      <NewProjectModal open={modalOpen} onClose={() => setModalOpen(false)} />

      <GuideModal
        open={guideOpen}
        onClose={() => setGuideOpen(false)}
        title="Panduan Dashboard"
        steps={[
          {
            title: '1. Buat undangan baru',
            body: 'Klik "+ Create New", pilih template, atau mulai dari kosong. Undangan langsung terbuka di Builder.'
          },
          {
            title: '2. Edit desain',
            body: 'Di Builder, seret blok dari sidebar kiri ke kanvas. Klik teks untuk menyunting langsung. Properties panel di kanan untuk varian, warna, frame.'
          },
          {
            title: '3. Pesanan masuk',
            body: 'Buka tab "Pesanan" untuk melihat order dari landing page. Klik "Balas WA" untuk konfirmasi ke client dengan pesan template.'
          },
          {
            title: '4. Buat proyek dari pesanan',
            body: 'Setelah pesanan disetujui, klik "Buat Proyek" untuk otomatis membuat undangan dari template yang dipesan.'
          },
          {
            title: '5. Pengaturan',
            body: 'Tab "Pengaturan" untuk mengatur nomor WhatsApp, harga & promo landing page, dan nama bisnis untuk watermark.'
          },
          {
            title: '6. Bagikan ke tamu',
            body: 'Buka undangan → tombol "Bagikan". Kirim via WhatsApp satu per satu atau massal. Tamu tak perlu login.'
          }
        ]}
      />

      {toast && (
        <div className="fixed right-4 top-4 z-50 rounded-md bg-gray-900 px-4 py-2 text-sm text-white shadow-lg">
          {toast}
        </div>
      )}
    </div>
  );
}
