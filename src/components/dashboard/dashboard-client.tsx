'use client';

import { useEffect, useState } from 'react';
import { HelpCircle, Plus } from 'lucide-react';
import ProjectCard from '@/components/dashboard/project-card';
import NewProjectModal from '@/components/dashboard/new-project-modal';
import GuideModal from '@/components/ui/guide-modal';
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

export default function DashboardClient({ projects, isDemo = false, userName = null }: DashboardClientProps) {
  const [items, setItems] = useState<Project[]>(projects);
  const [modalOpen, setModalOpen] = useState(false);
  const [toast, setToast] = useState<string | null>(null);
  const [page, setPage] = useState(1);
  const [guideOpen, setGuideOpen] = useState(false);

  const PER_PAGE = 8;
  const totalPages = Math.max(1, Math.ceil(items.length / PER_PAGE));
  const safePage = Math.min(page, totalPages);
  const pagedItems = items.slice((safePage - 1) * PER_PAGE, safePage * PER_PAGE);

  useEffect(() => {
    if (isDemo) setItems(demoListProjects());
  }, [isDemo]);

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

  return (
    <div>
      <div className="mb-6 flex items-center justify-between">
        <div>
          <h2 className="text-lg font-semibold">Daftar Undangan</h2>
          <p className="text-sm text-gray-500">
            {items.length === 0
              ? '0 undangan tersimpan'
              : `${(safePage - 1) * PER_PAGE + 1}–${Math.min(safePage * PER_PAGE, items.length)} dari ${items.length} undangan`}
            {isDemo && <span className="ml-2 rounded bg-amber-100 px-1.5 py-0.5 text-xs text-amber-700">Mode Demo</span>}
          </p>
        </div>
        <div className="flex items-center gap-2">
          <button
            onClick={() => setGuideOpen(true)}
            className="flex items-center gap-2 rounded-md border border-gray-300 px-4 py-2 text-sm font-medium text-gray-700 hover:bg-gray-50"
          >
            <HelpCircle className="h-4 w-4" /> Panduan
          </button>
          <button
            onClick={() => setModalOpen(true)}
            className="flex items-center gap-2 rounded-md bg-gradient-to-r from-[#c9a45c] to-[#b98a3e] px-4 py-2 text-sm font-semibold text-white shadow-sm hover:opacity-90"
          >
            <Plus className="h-4 w-4" /> Create New
          </button>
        </div>
      </div>

      {isDemo && (
        <p className="mb-4 rounded-md bg-sky-50 px-3 py-2 text-xs text-sky-700">
          Mode Demo aktif — data disimpan di browser (localStorage), tanpa Supabase. Untuk produksi,
          matikan <code className="rounded bg-sky-100 px-1">NEXT_PUBLIC_DEMO_MODE</code> di .env.local.
        </p>
      )}

      {items.length === 0 ? (
        <div className="flex flex-col items-center justify-center rounded-xl border border-dashed border-gray-300 bg-white py-24 text-center">
          <p className="text-sm text-gray-500">Belum ada undangan.</p>
          <button
            onClick={() => setModalOpen(true)}
            className="mt-4 rounded-md bg-gradient-to-r from-[#c9a45c] to-[#b98a3e] px-4 py-2 text-sm font-semibold text-white shadow-sm hover:opacity-90"
          >
            Buat undangan pertama
          </button>
        </div>
      ) : (
        <div className="grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
          {pagedItems.map((p) => (
            <ProjectCard key={p.id} project={p} onDuplicated={handleDuplicated} onDeleted={handleDeleted} />
          ))}
        </div>
      )}

      {items.length > PER_PAGE && (
        <div className="mt-6 flex items-center justify-center gap-2">
          <button
            onClick={() => setPage((p) => Math.max(1, p - 1))}
            disabled={safePage === 1}
            className="rounded-md border border-gray-300 px-3 py-1.5 text-sm text-gray-700 hover:bg-gray-50 disabled:opacity-40"
          >
            ← Sebelumnya
          </button>
          {Array.from({ length: totalPages }, (_, i) => i + 1).map((n) => (
            <button
              key={n}
              onClick={() => setPage(n)}
              className={`h-8 w-8 rounded-md text-sm ${
                n === safePage ? 'bg-gradient-to-r from-[#c9a45c] to-[#b98a3e] font-semibold text-white' : 'border border-gray-300 text-gray-700 hover:bg-gray-50'
              }`}
            >
              {n}
            </button>
          ))}
          <button
            onClick={() => setPage((p) => Math.min(totalPages, p + 1))}
            disabled={safePage === totalPages}
            className="rounded-md border border-gray-300 px-3 py-1.5 text-sm text-gray-700 hover:bg-gray-50 disabled:opacity-40"
          >
            Berikutnya →
          </button>
        </div>
      )}

      <NewProjectModal open={modalOpen} onClose={() => setModalOpen(false)} />

      <GuideModal
        open={guideOpen}
        onClose={() => setGuideOpen(false)}
        title="Panduan Dashboard"
        steps={[
          {
            title: 'Buat undangan baru',
            body: 'Klik "+ Create New", pilih template di halaman Templates, atau mulai dari kosong. Undangan langsung terbuka di Builder.'
          },
          {
            title: 'Edit desain',
            body: 'Di Builder, seret blok dari sidebar kiri ke kanvas. Klik teks untuk menyunting langsung. Variasi & isi blok diatur lewat panel Properties di kanan.'
          },
          {
            title: 'Bagikan ke tamu',
            body: 'Buka undangan → tombol "Bagikan". Kirim via WhatsApp, satu per satu atau massal. Tamu tak perlu login untuk melihat undangan.'
          },
          {
            title: 'Kelola tamu',
            body: 'Gunakan "Tautan Kelola Tamu" untuk melihat daftar tamu, mengubah agama & preset ucapan, dan menandai siapa yang sudah menerima undangan.'
          },
          {
            title: 'Simpan desain sebagai template',
            body: 'Di Builder, pilih "Simpan sebagai Template" agar desain ingin kamu pakai lagi tanpa mengulang dari nol.'
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