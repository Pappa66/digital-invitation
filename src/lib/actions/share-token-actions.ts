'use server';

import { createServerSupabase } from '@/lib/supabase/server';

export type ShareTokenInfo = {
  id: string;
  token: string;
  expires_at: string;
  created_at: string;
};

export type ShareTokenValidation = {
  valid: boolean;
  project_id?: string;
  project_title?: string;
  project_slug?: string;
  error?: string;
};

/**
 * Generate token berbagi akses edit builder.
 * Hanya owner project yang bisa generate.
 */
export async function generateShareToken(
  projectId: string,
  expiresInHours: number = 24,
  note?: string
): Promise<{ data?: ShareTokenInfo; error?: string }> {
  const supabase = await createServerSupabase();
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const { data, error } = await (supabase.rpc as any)('generate_share_edit_token', {
    p_project_id: projectId,
    p_expires_in_hours: expiresInHours,
    p_note: note ?? null
  });

  if (error) return { error: error.message };
  if (!data || data.length === 0) return { error: 'Gagal generate token' };

  const row = data[0];
  return {
    data: {
      id: row.id,
      token: row.token,
      expires_at: row.expires_at,
      created_at: row.created_at
    }
  };
}

/**
 * Validate token berbagi (public, tanpa login).
 * Digunakan oleh /edit/[token] untuk memvalidasi akses.
 */
export async function validateShareToken(token: string): Promise<ShareTokenValidation> {
  const supabase = await createServerSupabase();
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const { data, error } = await (supabase.rpc as any)('validate_share_edit_token', {
    p_token: token
  });

  if (error) return { valid: false, error: error.message };
  if (!data || data.length === 0) return { valid: false, error: 'Token tidak valid' };

  const row = data[0];
  return {
    valid: row.valid,
    project_id: row.project_id ?? undefined,
    project_title: row.project_title ?? undefined,
    project_slug: row.project_slug ?? undefined,
    error: row.error ?? undefined
  };
}

/**
 * Revoke token berbagi. Hanya owner project yang bisa revoke.
 */
export async function revokeShareToken(tokenId: string): Promise<{ ok?: boolean; error?: string }> {
  const supabase = await createServerSupabase();
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const { data, error } = await (supabase.rpc as any)('revoke_share_edit_token', {
    p_token_id: tokenId
  });

  if (error) return { error: error.message };
  return { ok: data === true };
}

/**
 * List semua token berbagi untuk project tertentu.
 * Hanya owner project yang bisa melihat.
 */
export async function listShareTokens(
  projectId: string
): Promise<{ data?: (ShareTokenInfo & { is_active: boolean; note?: string })[]; error?: string }> {
  const supabase = await createServerSupabase();
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const { data, error } = await (supabase.rpc as any)('list_share_edit_tokens', {
    p_project_id: projectId
  });

  if (error) return { error: error.message };
  if (!data) return { data: [] };

  return {
    data: data.map((row: Record<string, unknown>) => ({
      id: row.id as string,
      token: row.token as string,
      expires_at: row.expires_at as string,
      is_active: row.is_active as boolean,
      note: (row.note as string) ?? undefined,
      created_at: row.created_at as string
    }))
  };
}
