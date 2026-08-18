'use server';

import { z } from 'zod';
import { createServerSupabase } from '@/lib/supabase/server';

const UuidSchema = z.string().uuid('ID tidak valid');

export type AbsProjectMeta = {
  id: string;
  title: string;
  slug: string;
};

export type VerifyCheckinResult = {
  ok?: boolean;
  error?: string;
  name?: string;
  guest_count?: number;
  created_at?: string;
};

function parseUuid(value: string): string | null {
  const parsed = UuidSchema.safeParse(value);
  return parsed.success ? parsed.data : null;
}

/**
 * Verifikasi token absen QR dan catat check-in tamu (idempoten).
 * Dipakai halaman publik /absen/[projectId] — TANPA login. Keamanan
 * ditopang di database: RPC `record_checkin_from_token` (security definer)
 * hanya menerima proyek `published`, token harus milik RSVP proyek itu,
 * rate-limit per proyek + trigger per-IP tetap aktif.
 */
export async function verifyCheckinToken(projectId: string, token: string): Promise<VerifyCheckinResult> {
  const project = parseUuid(projectId);
  const checkinToken = parseUuid(token);
  if (!project || !checkinToken) {
    return { error: 'ID proyek atau token tidak valid' };
  }

  const supabase = await createServerSupabase();
  const { data, error } = await supabase.rpc('record_checkin_from_token', {
    p_project_id: project,
    p_token: checkinToken
  });

  if (error) return { error: error.message };

  const row = data?.[0];
  if (!row) return { error: 'Check-in gagal: tidak ada respons' };
  if (!row.ok) return { error: row.error ?? 'Check-in ditolak' };

  return {
    ok: true,
    name: row.name ?? undefined,
    guest_count: row.guest_count ?? undefined,
    created_at: row.created_at ?? undefined
  };
}

/**
 * Metadata proyek untuk halaman /absen (judul + slug undangan).
 * Hanya dikembalikan bila proyek berstatus `published` (RPC
 * `get_abs_project_meta` security definer menyaringnya di DB).
 */
export async function getAbsProjectMeta(
  projectId: string
): Promise<{ meta?: AbsProjectMeta; error?: string }> {
  const project = parseUuid(projectId);
  if (!project) return { error: 'ID proyek tidak valid' };

  const supabase = await createServerSupabase();
  const { data, error } = await supabase.rpc('get_abs_project_meta', {
    p_project_id: project
  });

  if (error) return { error: error.message };

  const row = data?.[0];
  if (!row) return { error: 'Proyek tidak ditemukan atau belum dipublikasikan' };

  return { meta: { id: row.id, title: row.title, slug: row.slug } };
}
