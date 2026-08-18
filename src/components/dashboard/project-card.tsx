'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import Image from 'next/image';
import { Copy, Pencil, Share2, Trash2, ExternalLink, Globe, GlobeLock } from 'lucide-react';
import type { Project } from '@/lib/types';
import { clientDuplicateProject, clientDeleteProject, clientSetProjectStatus } from '@/lib/api/project-client';
import ConfirmDialog from '@/components/dashboard/confirm-dialog';
import ShareDialog from '@/components/dashboard/share-dialog';

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
  const [status, setStatus] = useState<Project['status']>(project.status);
  const [statusBusy, setStatusBusy] = useState(false);

  const publicUrl = `/${project.slug}`;

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
    <div className="flex flex-col overflow-hidden rounded-xl border border-dashboard-border bg-dashboard-surface shadow-sm">
      <a href={`/builder/${project.id}`} className="group relative block h-44 overflow-hidden bg-gray-100">
        {project.thumbnail ? (
          <Image src={project.thumbnail} alt="" fill sizes="(min-width:768px) 33vw, 100vw" className="object-cover" />
        ) : (
          <div className="flex h-full w-full items-center justify-center">
            <span className="text-sm text-gray-400">Belum ada preview</span>
          </div>
        )}
        <span className="absolute inset-0 flex items-center justify-center bg-black/50 opacity-0 transition-opacity group-hover:opacity-100">
          <span className="rounded-md bg-white px-4 py-2 text-sm font-medium text-gray-900">
            <Pencil className="mr-1 inline h-4 w-4" /> Edit Desain
          </span>
        </span>
      </a>

      <div className="flex items-center justify-between gap-2 border-t border-dashboard-border bg-white px-4 py-3">
        <div className="min-w-0">
          <div className="flex min-w-0 items-center gap-2">
            <p className="truncate text-sm font-medium text-gray-900">{project.title}</p>
            <span
              className={`flex shrink-0 items-center gap-1 rounded-full px-2 py-0.5 text-[10px] font-medium ${
                status === 'published' ? 'bg-emerald-50 text-emerald-700' : 'bg-gray-100 text-gray-500'
              }`}
              title={status === 'published' ? 'Publik — tamu dengan link bisa membuka' : 'Draft — belum bisa diakses tamu'}
            >
              {status === 'published' ? <Globe className="h-3 w-3" /> : <GlobeLock className="h-3 w-3" />}
              {status === 'published' ? 'Publik' : 'Draft'}
            </span>
          </div>
          <p className="mt-0.5 text-xs text-gray-500">
            Diperbarui {new Date(project.updated_at || project.created_at).toLocaleDateString('id-ID')}
          </p>
        </div>
        <div className="flex shrink-0 items-center gap-0.5">
          <IconBtn label="Edit desain (buka builder)" onClick={() => router.push(`/builder/${project.id}`)}>
            <Pencil className="h-4 w-4" />
          </IconBtn>
          <IconBtn label="Salin (duplicate) undangan" onClick={() => setConfirm('duplicate')}>
            <Copy className="h-4 w-4" />
          </IconBtn>
          <IconBtn label="Bagikan undangan dengan nama tamu" onClick={() => setShareOpen(true)}>
            <Share2 className="h-4 w-4" />
          </IconBtn>
          <IconBtn
            label={status === 'published' ? 'Jadikan draft (tidak bisa diakses tamu)' : 'Publish (tamu dengan link bisa membuka)'}
            onClick={handleToggleStatus}
            disabled={statusBusy}
          >
            {status === 'published' ? <Globe className="h-4 w-4 text-emerald-600" /> : <GlobeLock className="h-4 w-4" />}
          </IconBtn>
          <IconBtn label="Buka halaman publik" onClick={() => router.push(publicUrl)}>
            <ExternalLink className="h-4 w-4" />
          </IconBtn>
          <IconBtn label="Hapus undangan" danger onClick={() => setConfirm('delete')}>
            <Trash2 className="h-4 w-4" />
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