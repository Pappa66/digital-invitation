'use client';

import { useCallback, useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import {
  Ban,
  Check,
  CheckCircle,
  Clock,
  Copy,
  ExternalLink,
  QrCode,
  Users
} from 'lucide-react';
import { supabase } from '@/lib/supabase/client';
import { getSiteOrigin } from '@/lib/site';
import { demoIsDemoMode } from '@/lib/env';
import { revokeInviteAccessToken } from '@/lib/actions/project-actions';
import { revokeShareToken } from '@/lib/actions/share-token-actions';
import ConfirmDialog from '@/components/dashboard/confirm-dialog';
import { DashboardSkeleton } from '@/components/ui/skeleton';

interface ProjectLite {
  id: string;
  title: string;
  slug: string;
}

interface AccessTokenRow {
  id: string;
  project_id: string;
  token: string;
  label: string | null;
  expires_at: string | null;
  revoked_at: string | null;
  last_used_at: string | null;
  created_at: string;
}

interface ShareEditTokenRow {
  id: string;
  project_id: string;
  token: string;
  expires_at: string;
  is_active: boolean;
  note: string | null;
  created_at: string;
}

type LinkStatus = 'aktif' | 'kedaluwarsa' | 'dicabut';

type RevokeTarget =
  | { kind: 'access'; projectId: string; projectTitle: string }
  | { kind: 'share'; id: string; projectTitle: string; label: string }
  | null;

function accessStatus(t: AccessTokenRow): LinkStatus {
  if (t.revoked_at) return 'dicabut';
  if (t.expires_at && new Date(t.expires_at) < new Date()) return 'kedaluwarsa';
  return 'aktif';
}

function shareStatus(t: ShareEditTokenRow): LinkStatus {
  if (!t.is_active) return 'dicabut';
  if (new Date(t.expires_at) < new Date()) return 'kedaluwarsa';
  return 'aktif';
}

function formatDate(iso: string | null): string {
  if (!iso) return 'tanpa kedaluwarsa';
  return new Date(iso).toLocaleDateString('id-ID', { day: 'numeric', month: 'short', year: 'numeric' });
}

/**
 * Manajemen tautan/token (area login dashboard). Menampilkan tautan per
 * undangan: link publik, kelola tamu (access_tokens), absen, dan edit
 * (share_edit_tokens). Hanya tabel yang RLS-nya mengizinkan pemilik.
 */
export default function TokensManager() {
  const router = useRouter();
  const demo = demoIsDemoMode();
  const [origin, setOrigin] = useState('');
  const [projects, setProjects] = useState<ProjectLite[]>([]);
  const [accessTokens, setAccessTokens] = useState<AccessTokenRow[]>([]);
  const [shareTokens, setShareTokens] = useState<ShareEditTokenRow[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [actionError, setActionError] = useState('');
  const [copied, setCopied] = useState<string | null>(null);
  const [target, setTarget] = useState<RevokeTarget>(null);
  const [revoking, setRevoking] = useState(false);

  useEffect(() => {
    setOrigin(getSiteOrigin());
  }, []);

  const load = useCallback(async () => {
    setLoading(true);
    setError('');
    try {
      const {
        data: { user }
      } = await supabase.auth.getUser();
      if (!user) {
        router.replace('/login');
        return;
      }
      // Cast: tabel share_edit_tokens belum ter-generate di tipe Database.
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      const sb = supabase as any;
      const { data: projectRows, error: projErr } = await sb
        .from('projects')
        .select('id, title, slug')
        .order('updated_at', { ascending: false });
      if (projErr) throw new Error(projErr.message);
      const list = (projectRows ?? []) as ProjectLite[];
      setProjects(list);

      const ids = list.map((p) => p.id);
      if (ids.length === 0) {
        setAccessTokens([]);
        setShareTokens([]);
        return;
      }

      const [accessRes, shareRes] = await Promise.all([
        sb
          .from('access_tokens')
          .select('id, project_id, token, label, expires_at, revoked_at, last_used_at, created_at')
          .in('project_id', ids)
          .order('created_at', { ascending: false }),
        sb
          .from('share_edit_tokens')
          .select('id, project_id, token, expires_at, is_active, note, created_at')
          .in('project_id', ids)
          .order('created_at', { ascending: false })
      ]);
      if (accessRes.error) throw new Error(accessRes.error.message);
      if (shareRes.error) throw new Error(shareRes.error.message);
      setAccessTokens((accessRes.data ?? []) as AccessTokenRow[]);
      setShareTokens((shareRes.data ?? []) as ShareEditTokenRow[]);
    } catch (e) {
      setError(e instanceof Error ? e.message : 'Gagal memuat tautan.');
    } finally {
      setLoading(false);
    }
  }, [router]);

  useEffect(() => {
    if (demo) {
      setLoading(false);
      return;
    }
    void load();
  }, [demo, load]);

  async function copy(key: string, text: string) {
    try {
      await navigator.clipboard.writeText(text);
      setCopied(key);
    } catch {
      setCopied(null);
    }
    window.setTimeout(() => setCopied(null), 1500);
  }

  async function handleRevoke() {
    if (!target) return;
    setRevoking(true);
    setActionError('');
    try {
      if (target.kind === 'access') {
        const res = await revokeInviteAccessToken(target.projectId);
        if (res.error) setActionError(res.error);
      } else {
        const res = await revokeShareToken(target.id);
        if (res.error) setActionError(res.error);
      }
    } catch (e) {
      setActionError(e instanceof Error ? e.message : 'Gagal mencabut tautan.');
    } finally {
      setRevoking(false);
      setTarget(null);
      await load();
    }
  }

  const groups = projects.map((project) => ({
    project,
    access: accessTokens.filter((t) => t.project_id === project.id),
    share: shareTokens.filter((t) => t.project_id === project.id)
  }));

  return (
    <div className="mx-auto max-w-5xl">
      <div className="mb-6">
        <h2 className="text-lg font-semibold text-foreground">Tautan</h2>
        <p className="text-sm text-muted-foreground">
          Kelola tautan undangan, kelola tamu, absen, dan edit. Hanya bagikan kepada pihak yang berhak.
        </p>
      </div>

      {actionError && (
        <p role="alert" className="mb-4 rounded-md bg-destructive/10 px-3 py-2 text-xs text-destructive">
          {actionError}
        </p>
      )}

      {loading ? (
        <div aria-busy="true">
          <DashboardSkeleton />
        </div>
      ) : error ? (
        <div className="rounded-2xl border border-destructive/25 bg-destructive/5 p-5 text-center" role="alert">
          <p className="text-sm font-medium text-destructive">Gagal memuat tautan</p>
          <p className="mt-1 text-xs text-muted-foreground">{error}</p>
          <button
            onClick={() => void load()}
            className="mt-3 min-h-11 rounded-md border border-input px-4 text-sm font-medium text-foreground transition-colors hover:bg-muted"
          >
            Coba Lagi
          </button>
        </div>
      ) : projects.length === 0 ? (
        <div className="rounded-2xl border border-dashed border-border bg-card p-10 text-center">
          <p className="text-sm font-medium text-foreground">Belum ada undangan</p>
          <p className="mt-1 text-xs text-muted-foreground">
            {demo ? 'Mode demo: tautan token hanya tersedia dengan backend produksi.' : 'Buat undangan terlebih dahulu untuk mengelola tautannya.'}
          </p>
        </div>
      ) : (
        <div className="space-y-4">
          {groups.map(({ project, access, share }) => (
            <section key={project.id} className="rounded-2xl border border-border bg-card p-4 shadow-soft">
              <div className="min-w-0">
                <h3 className="truncate text-sm font-semibold text-foreground">{project.title}</h3>
                <p className="truncate text-[11px] text-muted-foreground">/{project.slug}</p>
              </div>

              <div className="mt-3 space-y-2">
                <LinkRow
                  label="Undangan"
                  desc="Halaman publik undangan"
                  icon={<ExternalLink className="h-4 w-4" />}
                  url={`${origin}/${project.slug}`}
                  copied={copied === `pub-${project.id}`}
                  onCopy={() => void copy(`pub-${project.id}`, `${origin}/${project.slug}`)}
                />
                <LinkRow
                  label="Absen"
                  desc="Check-in QR tamu di venue"
                  icon={<QrCode className="h-4 w-4" />}
                  url={`${origin}/absen/${project.id}`}
                  copied={copied === `absen-${project.id}`}
                  onCopy={() => void copy(`absen-${project.id}`, `${origin}/absen/${project.id}`)}
                />

                {access.map((t) => (
                  <LinkRow
                    key={t.id}
                    label={`Kelola Tamu${t.label ? ` · ${t.label}` : ''}`}
                    desc={`Dibuat ${formatDate(t.created_at)} · berlaku s.d. ${formatDate(t.expires_at)}`}
                    icon={<Users className="h-4 w-4" />}
                    url={`${origin}/invite/${project.id}?t=${t.token}`}
                    status={accessStatus(t)}
                    copied={copied === `access-${t.id}`}
                    onCopy={() => void copy(`access-${t.id}`, `${origin}/invite/${project.id}?t=${t.token}`)}
                    revokeLabel="Cabut"
                    onRevoke={() => setTarget({ kind: 'access', projectId: project.id, projectTitle: project.title })}
                  />
                ))}

                {share.map((t) => (
                  <LinkRow
                    key={t.id}
                    label={`Edit${t.note ? ` · ${t.note}` : ''}`}
                    desc={`Dibuat ${formatDate(t.created_at)} · berlaku s.d. ${formatDate(t.expires_at)}`}
                    icon={<ExternalLink className="h-4 w-4" />}
                    url={`${origin}/edit/${t.token}`}
                    status={shareStatus(t)}
                    copied={copied === `share-${t.id}`}
                    onCopy={() => void copy(`share-${t.id}`, `${origin}/edit/${t.token}`)}
                    revokeLabel="Cabut"
                    onRevoke={() => setTarget({ kind: 'share', id: t.id, projectTitle: project.title, label: t.note || 'Link edit' })}
                  />
                ))}

                {access.length === 0 && share.length === 0 && (
                  <p className="rounded-xl border border-dashed border-border px-3 py-2 text-[11px] text-muted-foreground">
                    Belum ada tautan kelola/edit. Buat dari tombol Bagikan pada kartu undangan.
                  </p>
                )}
              </div>
            </section>
          ))}
        </div>
      )}

      <ConfirmDialog
        open={target !== null}
        title="Cabut tautan?"
        message={
          target?.kind === 'access'
            ? `Semua tautan kelola tamu untuk “${target.projectTitle}” akan dicabut. Link lama tidak bisa dipakai lagi.`
            : target?.kind === 'share'
              ? `Tautan “${target.label}” untuk “${target.projectTitle}” akan dicabut.`
              : ''
        }
        confirmLabel="Cabut"
        danger
        busy={revoking}
        onConfirm={() => void handleRevoke()}
        onCancel={() => setTarget(null)}
      />
    </div>
  );
}

const STATUS_STYLES: Record<LinkStatus, string> = {
  aktif: 'border-emerald-200 bg-emerald-50 text-emerald-800',
  kedaluwarsa: 'border-amber-200 bg-amber-50 text-amber-800',
  dicabut: 'border-destructive/25 bg-destructive/10 text-destructive'
};

const STATUS_LABELS: Record<LinkStatus, string> = {
  aktif: 'Aktif',
  kedaluwarsa: 'Kedaluwarsa',
  dicabut: 'Dicabut'
};

function StatusBadge({ status }: { status: LinkStatus }) {
  const Icon = status === 'aktif' ? CheckCircle : status === 'kedaluwarsa' ? Clock : Ban;
  return (
    <span
      className={`inline-flex shrink-0 items-center gap-1 rounded-full border px-2 py-0.5 text-[10px] font-semibold ${STATUS_STYLES[status]}`}
    >
      <Icon className="h-3 w-3" aria-hidden />
      {STATUS_LABELS[status]}
    </span>
  );
}

function LinkRow({
  label,
  desc,
  icon,
  url,
  status,
  copied,
  onCopy,
  revokeLabel,
  onRevoke
}: {
  label: string;
  desc?: string;
  icon: React.ReactNode;
  url: string;
  status?: LinkStatus;
  copied: boolean;
  onCopy: () => void;
  revokeLabel?: string;
  onRevoke?: () => void;
}) {
  const canRevoke = status === 'aktif' && onRevoke;
  return (
    <div className="flex flex-col gap-2 rounded-xl border border-border p-3 sm:flex-row sm:items-center">
      <div className="flex min-w-0 flex-1 items-start gap-2">
        <span className="mt-0.5 shrink-0 text-muted-foreground" aria-hidden>
          {icon}
        </span>
        <div className="min-w-0">
          <div className="flex flex-wrap items-center gap-2">
            <p className="truncate text-xs font-medium text-foreground">{label}</p>
            {status && <StatusBadge status={status} />}
          </div>
          <p className="truncate text-[11px] text-muted-foreground" title={url}>
            {url}
          </p>
          {desc && <p className="mt-0.5 text-[10px] text-muted-foreground">{desc}</p>}
        </div>
      </div>
      <div className="flex shrink-0 items-center gap-1.5">
        <button
          type="button"
          onClick={onCopy}
          className="inline-flex min-h-11 items-center gap-1 rounded-md border border-input px-3 text-xs font-medium text-foreground transition-colors hover:bg-muted"
        >
          {copied ? <Check className="h-3.5 w-3.5 text-emerald-700" aria-hidden /> : <Copy className="h-3.5 w-3.5" aria-hidden />}
          {copied ? 'Disalin' : 'Salin'}
        </button>
        {revokeLabel && onRevoke && (
          <button
            type="button"
            onClick={onRevoke}
            disabled={!canRevoke}
            className="inline-flex min-h-11 items-center rounded-md border border-destructive/30 px-3 text-xs font-medium text-destructive transition-colors hover:bg-destructive/10 disabled:pointer-events-none disabled:opacity-40"
          >
            {revokeLabel}
          </button>
        )}
      </div>
    </div>
  );
}
