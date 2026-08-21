'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import { HelpCircle, Eye, LogOut } from 'lucide-react';
import BuilderWorkspace from '@/components/builder/builder-workspace';
import GuideModal from '@/components/ui/guide-modal';
import { useBuilderStore } from '@/store/builder-store';
import { useAutosave } from '@/hooks/use-autosave';
import { supabase } from '@/lib/supabase/client';
import { getSiteOrigin } from '@/lib/site';
import { BuilderSkeleton } from '@/components/ui/skeleton';
import type { CanvasData } from '@/lib/types';

interface EditTokenClientProps {
  projectId: string;
  projectTitle: string;
  token: string;
}

/**
 * Builder mode share-token: bisa edit canvas + theme + preview,
 * tapi TIDAK bisa: dashboard, publish, save-as-template, share.
 * Semua perubahan langsung save ke project utama.
 */
export default function EditTokenClient({ projectId, projectTitle }: EditTokenClientProps) {
  const canvas = useBuilderStore((s) => s.canvas);
  const init = useBuilderStore((s) => s.init);
  const saveStatus = useAutosave({ projectId, canvas });
  const [ready, setReady] = useState(false);
  const [previewUrl, setPreviewUrl] = useState('');
  const [guideOpen, setGuideOpen] = useState(false);

  useEffect(() => {
    async function load() {
      const { data, error } = await supabase
        .from('project_designs')
        .select('canvas_data')
        .eq('project_id', projectId)
        .maybeSingle();
      if (!error && data?.canvas_data) {
        init(data.canvas_data as unknown as CanvasData, projectId);
      }
      const { data: proj } = await supabase
        .from('projects')
        .select('slug')
        .eq('id', projectId)
        .maybeSingle();
      if (proj?.slug) {
        setPreviewUrl(`${getSiteOrigin()}/${proj.slug}`);
      }
      setReady(true);
    }
    load();
  }, [projectId, init]);

  if (!ready) return <BuilderSkeleton />;

  return (
    <div className="flex h-screen flex-col overflow-hidden bg-[#faf7f2]">
      {/* Header — tanpa dashboard/publish/share */}
      <div className="flex h-12 shrink-0 items-center justify-between border-b border-[#e0d6c2] bg-white px-3">
        <div className="flex items-center gap-2 overflow-hidden">
          {/* Exit link */}
          <Link
            href="/"
            className="flex items-center gap-1 rounded-md px-2 py-1 text-xs text-[#6b5f4d] hover:bg-[#f0ebe3]"
            title="Keluar dari mode edit"
          >
            <LogOut className="h-3.5 w-3.5" />
            <span className="hidden sm:inline">Keluar</span>
          </Link>
          <span className="h-4 w-px bg-[#e0d6c2]" />
          {/* Badge mode */}
          <span className="rounded-full bg-amber-100 px-2 py-0.5 text-[10px] font-semibold text-amber-700">
            Mode Edit Tamu
          </span>
          <span className="truncate text-xs text-[#6b5f4d]">{projectTitle}</span>
        </div>

        <div className="flex items-center gap-2">
          <span className="text-[10px] text-[#8a7d6b]">
            {saveStatus === 'saving' ? 'Menyimpan...' : saveStatus === 'saved' ? 'Tersimpan' : ''}
          </span>
          {/* Preview */}
          {previewUrl && (
            <a
              href={previewUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="flex items-center gap-1 rounded-md border border-[#e0d6c2] bg-white px-2.5 py-1 text-xs text-[#4a443c] hover:border-[#c9a45c] hover:text-[#8a6d2f]"
            >
              <Eye className="h-3.5 w-3.5" /> Preview
            </a>
          )}
          <button
            onClick={() => setGuideOpen(true)}
            className="rounded-md p-1.5 text-[#8a7d6b] hover:bg-[#f0ebe3]"
          >
            <HelpCircle className="h-4 w-4" />
          </button>
        </div>
      </div>

      {/* Info bar */}
      <div className="flex items-center justify-center bg-amber-50 px-3 py-1.5 text-center text-[11px] text-amber-700">
        Anda mengakses builder melalui link berbagi. Perubahan disimpan langsung ke project utama.
      </div>

      {/* Builder workspace */}
      <div className="min-h-0 flex-1">
        <BuilderWorkspace projectId={projectId} />
      </div>

      <GuideModal
        open={guideOpen}
        onClose={() => setGuideOpen(false)}
        title="Panduan Builder"
        steps={[
          {
            title: '1. Tambahkan bagian',
            body: 'Seret blok dari panel kiri (Hero, Mempelai, Countdown, Maps, Gallery, dll.) ke kanvas.'
          },
          {
            title: '2. Edit teks langsung',
            body: 'Klik teks pada kanvas untuk menyunting inline.'
          },
          {
            title: '3. Ganti varian blok',
            body: 'Setiap blok punya beberapa varian (gaya). Pilih blok, lalu pilih varian di panel Properties.'
          }
        ]}
      />
    </div>
  );
}
