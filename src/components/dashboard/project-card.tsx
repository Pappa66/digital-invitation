'use client';

import { useEffect, useRef, useState } from 'react';
import { useRouter } from 'next/navigation';
import Image from 'next/image';
import { BarChart3, Copy, Pencil, Share2, Trash2, ExternalLink, Globe, GlobeLock, QrCode, MoreHorizontal } from 'lucide-react';
import type { Project } from '@/lib/types';
import { clientDuplicateProject, clientDeleteProject, clientSetProjectStatus } from '@/lib/api/project-client';
import ConfirmDialog from '@/components/dashboard/confirm-dialog';
import ShareDialog from '@/components/dashboard/share-dialog';
import StatsDialog from '@/components/dashboard/stats-dialog';
import AbsenShareDialog from '@/components/ui/absen-share-dialog';
import { supabase } from '@/lib/supabase/client';
import { demoGetDesign } from '@/lib/demo/demo-store';
import { demoIsDemoMode } from '@/lib/env';

interface ProjectCardProps {
  project: Project;
  onDuplicated: (id: string, title: string) => void;
  onDeleted: (id: string) => void;
  heroFallback?: string;
}

type ConfirmTarget = 'duplicate' | 'delete' | null;

export default function ProjectCard({ project, onDuplicated, onDeleted, heroFallback }: ProjectCardProps) {
  const router = useRouter();
  const [confirm, setConfirm] = useState<ConfirmTarget>(null);
  const [busy, setBusy] = useState(false);
  const [shareOpen, setShareOpen] = useState(false);
  const [absenOpen, setAbsenOpen] = useState(false);
  const [statsOpen, setStatsOpen] = useState(false);
  const [status, setStatus] = useState<Project['status']>(project.status);
  const [statusBusy, setStatusBusy] = useState(false);
  const [couple, setCouple] = useState<string | null>(null);
  const [menuOpen, setMenuOpen] = useState(false);
  const menuRef = useRef<HTMLDivElement>(null);
  const triggerRef = useRef<HTMLButtonElement>(null);
  const menuItemRefs = useRef<(HTMLButtonElement | null)[]>([]);

  // Mode demo tidak punya backend statistik — sembunyikan tombolnya.
  const demo = demoIsDemoMode();

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

  useEffect(() => {
    function handleClickOutside(e: PointerEvent) {
      if (menuRef.current && !menuRef.current.contains(e.target as Node)) {
        setMenuOpen(false);
      }
    }
    if (menuOpen) {
      document.addEventListener('pointerdown', handleClickOutside);
      return () => document.removeEventListener('pointerdown', handleClickOutside);
    }
  }, [menuOpen]);

  // Saat menu terbuka, pindahkan fokus ke item pertama (pola menu ARIA).
  useEffect(() => {
    if (!menuOpen) return;
    const t = window.setTimeout(() => menuItemRefs.current.find(Boolean)?.focus(), 0);
    return () => window.clearTimeout(t);
  }, [menuOpen]);

  function closeMenu(refocus = false) {
    setMenuOpen(false);
    if (refocus) triggerRef.current?.focus();
  }

  function handleMenuKeyDown(e: React.KeyboardEvent<HTMLDivElement>) {
    if (e.key === 'Escape') {
      e.preventDefault();
      closeMenu(true);
      return;
    }
    if (e.key !== 'ArrowDown' && e.key !== 'ArrowUp') return;
    e.preventDefault();
    const items = menuItemRefs.current.filter(
      (el): el is HTMLButtonElement => el !== null && !el.disabled
    );
    if (items.length === 0) return;
    const idx = items.indexOf(document.activeElement as HTMLButtonElement);
    const next = e.key === 'ArrowDown' ? (idx + 1) % items.length : (idx - 1 + items.length) % items.length;
    items[next]?.focus();
  }

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
    <div className="flex flex-col overflow-hidden rounded-2xl border border-border bg-card shadow-soft transition-shadow hover:shadow-card">
      <a href={`/builder/${project.id}`} className="group relative block h-40 overflow-hidden bg-muted sm:h-44">
        {project.thumbnail || heroFallback ? (
          <Image src={project.thumbnail || heroFallback!} alt="" fill sizes="(min-width:768px) 33vw, 100vw" className="object-cover transition-transform duration-300 group-hover:scale-105 motion-reduce:transition-none motion-reduce:group-hover:scale-100" />
        ) : (
          <div className="flex h-full w-full items-center justify-center">
            <span className="text-xs text-muted-foreground">Belum ada preview</span>
          </div>
        )}
        <span className="absolute inset-0 flex items-center justify-center bg-foreground/50 opacity-0 transition-opacity group-hover:opacity-100 motion-reduce:transition-none">
          <span className="rounded-md bg-card px-3 py-1.5 text-xs font-medium text-foreground shadow-soft">
            <Pencil className="mr-1 inline h-3.5 w-3.5" aria-hidden /> Edit
          </span>
        </span>
      </a>

      <div className="border-t border-border bg-card px-4 py-3">
        <div className="flex items-start justify-between gap-2">
          <div className="min-w-0 flex-1">
            <div className="flex min-w-0 items-center gap-2">
              <p className="truncate text-sm font-medium text-foreground">{project.title || couple}</p>
              <span
                className={`flex shrink-0 items-center gap-1 rounded-full border px-2 py-0.5 text-xs font-medium ${
                  status === 'published' ? 'border-emerald-200 bg-emerald-50 text-emerald-800' : 'border-border bg-muted text-muted-foreground'
                }`}
                title={status === 'published' ? 'Publik' : 'Draft'}
              >
                {status === 'published' ? <Globe className="h-3 w-3" aria-hidden /> : <GlobeLock className="h-3 w-3" aria-hidden />}
                {status === 'published' ? 'Publik' : 'Draft'}
              </span>
            </div>
            {couple && couple !== project.title && (
              <p className="truncate text-[11px] text-muted-foreground">{couple}</p>
            )}
            <p className="mt-0.5 text-[11px] text-muted-foreground">
              {new Date(project.updated_at || project.created_at).toLocaleDateString('id-ID')}
            </p>
          </div>
        </div>
        <div className="mt-3 flex items-stretch gap-2">
          {/* Aksi primer — selalu tampak */}
          <button
            onClick={() => router.push(`/builder/${project.id}`)}
            className="flex min-h-11 flex-1 items-center justify-center gap-1 rounded-lg bg-gradient-to-r from-gold to-gold-strong px-3.5 text-xs font-semibold text-primary-foreground shadow-gold transition-opacity hover:opacity-90"
          >
            <Pencil className="h-3.5 w-3.5" aria-hidden /> Edit
          </button>
          <button
            onClick={() => setShareOpen(true)}
            className="flex min-h-11 flex-1 items-center justify-center gap-1 rounded-lg border border-input px-3.5 text-xs font-medium text-foreground transition-colors hover:bg-accent hover:text-accent-foreground"
          >
            <Share2 className="h-3.5 w-3.5" aria-hidden /> Share
          </button>

          {/* Aksi lain — menu overflow "…" (semua breakpoint) */}
          <div className="relative shrink-0" ref={menuRef}>
            <button
              ref={triggerRef}
              onClick={() => setMenuOpen((v) => !v)}
              aria-label="Menu aksi lainnya"
              aria-haspopup="menu"
              aria-expanded={menuOpen}
              className="inline-flex h-11 w-11 items-center justify-center rounded-lg border border-input text-muted-foreground transition-colors hover:bg-muted hover:text-foreground"
            >
              <MoreHorizontal className="h-4 w-4" aria-hidden />
            </button>
            {menuOpen && (
              <div
                role="menu"
                aria-label="Aksi lainnya"
                onKeyDown={handleMenuKeyDown}
                className="absolute right-0 top-full z-50 mt-1 w-52 overflow-hidden rounded-2xl border border-border bg-popover py-1 text-popover-foreground shadow-dialog"
              >
                {!demo && (
                  <MenuItem
                    innerRef={(el) => { menuItemRefs.current[0] = el; }}
                    onClick={() => { closeMenu(); setStatsOpen(true); }}
                  >
                    <BarChart3 className="h-4 w-4" aria-hidden /> Statistik
                  </MenuItem>
                )}
                <MenuItem
                  innerRef={(el) => { menuItemRefs.current[1] = el; }}
                  onClick={() => { closeMenu(); setConfirm('duplicate'); }}
                >
                  <Copy className="h-4 w-4" aria-hidden /> Salin
                </MenuItem>
                <MenuItem
                  innerRef={(el) => { menuItemRefs.current[2] = el; }}
                  onClick={() => { closeMenu(); setAbsenOpen(true); }}
                >
                  <QrCode className="h-4 w-4" aria-hidden /> QR Absen
                </MenuItem>
                <MenuItem
                  innerRef={(el) => { menuItemRefs.current[3] = el; }}
                  onClick={() => { closeMenu(); router.push(publicUrl); }}
                >
                  <ExternalLink className="h-4 w-4" aria-hidden /> Buka Publik
                </MenuItem>
                <MenuItem
                  innerRef={(el) => { menuItemRefs.current[4] = el; }}
                  onClick={() => { closeMenu(); handleToggleStatus(); }}
                >
                  {status === 'published' ? <GlobeLock className="h-4 w-4" aria-hidden /> : <Globe className="h-4 w-4" aria-hidden />}
                  {status === 'published' ? 'Jadikan Draft' : 'Publish'}
                </MenuItem>
                <div className="my-1 border-t border-border" />
                <MenuItem
                  danger
                  innerRef={(el) => { menuItemRefs.current[5] = el; }}
                  onClick={() => { closeMenu(); setConfirm('delete'); }}
                >
                  <Trash2 className="h-4 w-4" aria-hidden /> Hapus
                </MenuItem>
              </div>
            )}
          </div>
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
      {!demo && (
        <StatsDialog open={statsOpen} projectId={project.id} title={project.title} onClose={() => setStatsOpen(false)} />
      )}
    </div>
  );
}

function MenuItem({
  innerRef,
  danger = false,
  onClick,
  children
}: {
  innerRef?: React.Ref<HTMLButtonElement>;
  danger?: boolean;
  onClick: () => void;
  children: React.ReactNode;
}) {
  return (
    <button
      ref={innerRef}
      type="button"
      role="menuitem"
      onClick={onClick}
      className={`flex min-h-11 w-full items-center gap-2 px-3 text-xs transition-colors ${
        danger ? 'text-destructive hover:bg-destructive/10' : 'text-foreground hover:bg-muted'
      }`}
    >
      {children}
    </button>
  );
}
