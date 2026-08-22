'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import Image from 'next/image';
import { Copy, Pencil, Share2, Trash2, ExternalLink, Globe, GlobeLock, QrCode } from 'lucide-react';
import type { Project } from '@/lib/types';
import { clientDuplicateProject, clientDeleteProject, clientSetProjectStatus } from '@/lib/api/project-client';
import ConfirmDialog from '@/components/dashboard/confirm-dialog';
import ShareDialog from '@/components/dashboard/share-dialog';
import AbsenShareDialog from '@/components/ui/absen-share-dialog';
import { supabase } from '@/lib/supabase/client';
import { demoGetDesign } from '@/lib/demo/demo-store';
import { demoIsDemoMode } from '@/lib/env';

interface ProjectCardProps {
  project: Project;
  onDuplicated: (id: string, title: string) => void;
  onDeleted: (id: string) => void;
}

type ConfirmTarget = 'duplicate' | 'delete' | null;

export default function ProjectCard({ project, onDuplicated, onDeleted }: ProjectCardProps) {
  const router = useRouter();
  const [confirm, setConfirm] = useState<ConfirmTarget>(null);
  const [busy, setBusy] = useState(false);
  const [shareOpen, setShareOpen] = useState(false);
  const [absenOpen, setAbsenOpen] = useState(false);
  const [status, setStatus] = useState<Project['status']>(project.status);
  const [statusBusy, setStatusBusy] = useState(false);
  const [couple, setCouple] = useState<string | null>(null);

  const publicUrl = `/${project.slug}`;

  useEffect(() => {
    let alive = true;
    async function loadCouple() {
      try {
        if (demoIsDemoMode()) {
          const design = demoGetDesign(project.id);
          const hero = design?.blocks.find((b) => b.type === 'Hero')?.props as Record<string, unknown> | undefined;
          const names = [hero?.bride, hero?.groom].filter((v) => typeof v === 'string' && (v as string).trim()).join(' & ');
          if (alive && names) setCouple(names as string);
          return;
        }
        const { data } = await supabase.from('project_designs').select('canvas_data').eq('project_id', project.id).maybeSingle();
        const canvas = data?.canvas_data as { blocks?: { type: string; props?: Record<string, unknown> }[] } | null;
        const hero = canvas?.blocks?.find((b) => b.type === 'Hero')?.props as Record<string, unknown> | undefined;
        const names = [hero?.bride, hero?.groom].filter((v) => typeof v === 'string' && (v as string).trim()).join(' & ');
        if (alive && names) setCouple(names as string);
      } catch {
        /* ignore */
      }
    }
    loadCouple();
    return () => {
      alive = false;
    };
  }, [project.id]);

  async function handleDuplicate() {
    setBusy(true);
    const res = await clientDuplicateProject(project.id);
    setBusy(false);
    setConfirm(null);
    if (res.id) onDuplicated(res.id, `Salinan dari ${project.title}`);
  }

  async function handleDelete() {
    setBusy(true);
    const res = await clientDeleteProject(project.id);
    setBusy(false);
    setConfirm(null);
    if (!res.error) onDeleted(project.id);
  }

  async function handleToggleStatus() {
    if (statusBusy) return;
    setStatusBusy(true);
    const next = status === 'published' ? 'draft' : 'published';
    const res = await clientSetProjectStatus(project.id, next);
    setStatusBusy(false);
    if (!res.error) setStatus(next);
  }

  return (
    <div className="flex flex-col overflow-hidden rounded-xl border border-dashboard-border bg-dashboard-surface shadow-sm transition-shadow hover:shadow-md">
      <a href={`/builder/${project.id}`} className="group relative block h-36 overflow-hidden bg-gray-100">
        {project.thumbnail ? (
          <Image src={project.thumbnail} alt="" fill sizes="(min-width:768px) 33vw, 100vw" className="object-cover transition-transform duration-300 group-hover:scale-105" />
        ) : (
          <div className="flex h-full w-full items-center justify-center">
            <span className="text-xs text-gray-400">Belum ada preview</span>
          </div>
        )}
        <span className="absolute inset-0 flex items-center justify-center bg-black/50 opacity-0 transition-opacity group-hover:opacity-100">
          <span className="rounded-md bg-white px-3 py-1.5 text-xs font-medium text-gray-900">
            <Pencil className="mr-1 inline h-3.5 w-3.5" /> Edit
          </span>
        </span>
      </a>

      <div className="border-t border-dashboard-border bg-white px-3 py-2.5">
        <div className="flex items-start justify-between gap-2">
          <div className="min-w-0 flex-1">
            <div className="flex min-w-0 items-center gap-1.5">
              <p className="truncate text-sm font-medium text-gray-900">{couple || project.title}</p>
              <span
                className={`flex shrink-0 items-center gap-0.5 rounded-full px-1.5 py-0.5 text-[10px] font-medium ${
                  status === 'published' ? 'bg-emerald-50 text-emerald-700' : 'bg-gray-100 text-gray-500'
                }`}
                title={status === 'published' ? 'Publik' : 'Draft'}
              >
                {status === 'published' ? <Globe className="h-2.5 w-2.5" /> : <GlobeLock className="h-2.5 w-2.5" />}
                {status === 'published' ? 'Publik' : 'Draft'}
              </span>
            </div>
            {couple && couple !== project.title && (
              <p className="truncate text-[11px] text-gray-400">{project.title}</p>
            )}
            <p className="mt-0.5 text-[11px] text-gray-400">
              {new Date(project.updated_at || project.created_at).toLocaleDateString('id-ID')}
            </p>
          </div>
        </div>
        <div className="mt-2 flex items-center gap-1.5">
          <button
            onClick={() => router.push(`/builder/${project.id}`)}
            className="flex items-center gap-1 rounded-lg bg-gradient-to-r from-[#c9a45c] to-[#b98a3e] px-2.5 py-1 text-[11px] font-semibold text-white hover:opacity-90"
          >
            <Pencil className="h-3 w-3" /> Edit
          </button>
          <button
            onClick={() => setShareOpen(true)}
            className="flex items-center gap-1 rounded-lg border border-[#e0d6c2] px-2.5 py-1 text-[11px] font-medium text-gray-700 hover:bg-gray-50"
          >
            <Share2 className="h-3 w-3" /> Share
          </button>
          <div className="flex-1" />
          <IconBtn label="Salin" onClick={() => setConfirm('duplicate')}>
            <Copy className="h-3.5 w-3.5" />
          </IconBtn>
          <IconBtn label="QR Absen" onClick={() => setAbsenOpen(true)}>
            <QrCode className="h-3.5 w-3.5" />
          </IconBtn>
          <IconBtn
            label={status === 'published' ? 'Jadikan draft' : 'Publish'}
            onClick={handleToggleStatus}
            disabled={statusBusy}
          >
            {status === 'published' ? <Globe className="h-3.5 w-3.5 text-emerald-600" /> : <GlobeLock className="h-3.5 w-3.5" />}
          </IconBtn>
          <IconBtn label="Buka publik" onClick={() => router.push(publicUrl)}>
            <ExternalLink className="h-3.5 w-3.5" />
          </IconBtn>
          <IconBtn label="Hapus" danger onClick={() => setConfirm('delete')}>
            <Trash2 className="h-3.5 w-3.5" />
          </IconBtn>
        </div>
      </div>

      <ConfirmDialog
        open={confirm === 'duplicate'}
        title="Salin undangan?"
        message={`Buat salinan baru dari \u201C${project.title}\u201D? Salinan dibuat sebagai draft dan siap diedit.`}
        confirmLabel="Salin"
        busy={busy}
        onConfirm={handleDuplicate}
        onCancel={() => setConfirm(null)}
      />
      <ConfirmDialog
        open={confirm === 'delete'}
        title="Hapus undangan?"
        message={`Undangan \u201C${project.title}\u201D akan dihapus selamanya. Tindakan ini tidak bisa dibatalkan.`}
        confirmLabel="Hapus"
        danger
        busy={busy}
        onConfirm={handleDelete}
        onCancel={() => setConfirm(null)}
      />
      <ShareDialog open={shareOpen} projectId={project.id} slug={project.slug} title={project.title} onClose={() => setShareOpen(false)} />
      <AbsenShareDialog open={absenOpen} projectId={project.id} onClose={() => setAbsenOpen(false)} />
    </div>
  );
}

function IconBtn({
  label,
  danger = false,
  disabled = false,
  onClick,
  children
}: {
  label: string;
  danger?: boolean;
  disabled?: boolean;
  onClick: () => void;
  children: React.ReactNode;
}) {
  return (
    <button
      onClick={onClick}
      aria-label={label}
      title={label}
      disabled={disabled}
      className={`rounded-md p-1.5 disabled:opacity-40 ${
        danger
          ? 'text-gray-500 hover:bg-red-50 hover:text-red-600'
          : 'text-gray-500 hover:bg-gray-100 hover:text-gray-900'
      }`}
    >
      {children}
    </button>
  );
}