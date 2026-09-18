'use server';

import { createServerSupabase, requireUser } from '@/lib/supabase/server';

export interface MediaAsset {
  id: string;
  url: string;
  path: string | null;
  name: string | null;
  created_at: string;
}

/** Daftar pustaka media milik user (100 terbaru). */
export async function listAssets(): Promise<{ data?: MediaAsset[]; error?: string }> {
  const user = await requireUser();
  if (!user) return { error: 'Unauthorized' };
  const supabase = await createServerSupabase();
  const { data, error } = await supabase
    .from('assets')
    .select('id, url, path, name, created_at')
    .order('created_at', { ascending: false })
    .limit(100);
  if (error) return { error: error.message };
  return { data: (data ?? []) as MediaAsset[] };
}

export async function deleteAsset(id: string): Promise<{ error?: string }> {
  const user = await requireUser();
  if (!user) return { error: 'Unauthorized' };
  const supabase = await createServerSupabase();
  const { data: row } = await supabase.from('assets').select('path').eq('id', id).eq('user_id', user.id).maybeSingle();
  if (row?.path) {
    await supabase.storage.from('invitation-assets').remove([row.path]);
  }
  const { error } = await supabase.from('assets').delete().eq('id', id).eq('user_id', user.id);
  return { error: error?.message };
}
