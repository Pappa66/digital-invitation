'use client';

import { useEffect, useState } from 'react';
import { AlertCircle, BarChart3, CalendarCheck, Eye, Loader2, UserCheck, Users } from 'lucide-react';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle
} from '@/components/ui/dialog';
import { supabase } from '@/lib/supabase/client';
import { demoIsDemoMode } from '@/lib/env';

export interface ProjectStats {
  rsvp_total: number;
  rsvp_hadir: number;
  checkin_total: number;
  views_total: number;
}

interface StatsDialogProps {
  open: boolean;
  projectId: string;
  title?: string;
  onClose: () => void;
}

const EMPTY_STATS: ProjectStats = { rsvp_total: 0, rsvp_hadir: 0, checkin_total: 0, views_total: 0 };
const LOAD_ERROR = 'Gagal memuat statistik. Silakan coba lagi.';

/**
 * Panel statistik per undangan (host). Data diambil LAZY saat dialog dibuka —
 * bukan untuk semua kartu sekaligus — memakai RPC `get_project_stats` yang
 * hanya dapat diakses pemilik/internal. Di mode demo tidak ada backend, jadi
 * ditampilkan angka kosong.
 */
export default function StatsDialog({ open, projectId, title, onClose }: StatsDialogProps) {
  const [stats, setStats] = useState<ProjectStats>(EMPTY_STATS);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [reloadKey, setReloadKey] = useState(0);

  useEffect(() => {
    if (!open) return;
    let alive = true;

    async function load() {
      setLoading(true);
      setError('');
      try {
        if (demoIsDemoMode()) {
          if (alive) setStats(EMPTY_STATS);
          return;
        }
        const { data, error: rpcError } = await supabase.rpc('get_project_stats', { p_project_id: projectId });
        if (!alive) return;
        if (rpcError) {
          setError(LOAD_ERROR);
          return;
        }
        const row = Array.isArray(data) ? data[0] : null;
        setStats(
          row
            ? {
                rsvp_total: Number(row.rsvp_total) || 0,
                rsvp_hadir: Number(row.rsvp_hadir) || 0,
                checkin_total: Number(row.checkin_total) || 0,
                views_total: Number(row.views_total) || 0
              }
            : EMPTY_STATS
        );
      } catch {
        if (alive) setError(LOAD_ERROR);
      } finally {
        if (alive) setLoading(false);
      }
    }

    void load();
    return () => {
      alive = false;
    };
  }, [open, projectId, reloadKey]);

  return (
    <Dialog
      open={open}
      onOpenChange={(next) => {
        if (!next) onClose();
      }}
    >
      <DialogContent className="max-w-sm">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <BarChart3 className="h-5 w-5 text-gold-strong" aria-hidden />
            Statistik Undangan
          </DialogTitle>
          <DialogDescription>
            {title ? `Ringkasan aktivitas untuk \u201C${title}\u201D` : 'Ringkasan aktivitas undangan'}
          </DialogDescription>
        </DialogHeader>

        {loading ? (
          <div className="flex flex-col items-center justify-center gap-2 py-10 text-center">
            <Loader2 className="h-5 w-5 animate-spin text-gold-strong" aria-hidden />
            <p className="text-xs text-muted-foreground">Memuat statistik…</p>
          </div>
        ) : error ? (
          <div
            role="alert"
            className="flex flex-col items-center gap-3 rounded-xl border border-destructive/30 bg-destructive/5 px-4 py-8 text-center"
          >
            <AlertCircle className="h-5 w-5 text-destructive" aria-hidden />
            <p className="text-xs leading-relaxed text-muted-foreground">{error}</p>
            <button
              type="button"
              onClick={() => setReloadKey((k) => k + 1)}
              className="rounded-lg border border-border bg-card px-3 py-1.5 text-xs font-semibold text-foreground transition-colors hover:bg-muted"
            >
              Coba lagi
            </button>
          </div>
        ) : (
          <div className="grid grid-cols-2 gap-3 py-1">
            <StatTile icon={<Users className="h-4 w-4" aria-hidden />} label="Total RSVP" value={stats.rsvp_total} />
            <StatTile icon={<UserCheck className="h-4 w-4" aria-hidden />} label="Hadir" value={stats.rsvp_hadir} />
            <StatTile icon={<CalendarCheck className="h-4 w-4" aria-hidden />} label="Check-in" value={stats.checkin_total} />
            <StatTile icon={<Eye className="h-4 w-4" aria-hidden />} label="Dibuka" value={stats.views_total} />
          </div>
        )}
      </DialogContent>
    </Dialog>
  );
}

function StatTile({ icon, label, value }: { icon: React.ReactNode; label: string; value: number }) {
  return (
    <div className="rounded-xl border border-border bg-card p-3 shadow-soft">
      <span className="flex items-center gap-1.5 text-[11px] font-medium text-muted-foreground">
        <span className="text-gold-strong">{icon}</span>
        {label}
      </span>
      <p className="mt-1 text-2xl font-semibold tabular-nums text-foreground">{value.toLocaleString('id-ID')}</p>
    </div>
  );
}
