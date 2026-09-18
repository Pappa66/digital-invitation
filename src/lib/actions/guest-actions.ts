'use server';

import { revalidatePath } from 'next/cache';
import { createServerSupabase, requireUser } from '@/lib/supabase/server';

export interface Guest {
  id: string;
  project_id: string;
  name: string;
  phone: string | null;
  created_at: string;
}

/** Daftar tamu milik proyek (owner-only). */
export async function listGuests(projectId: string): Promise<{ data?: Guest[]; error?: string }> {
  const user = await requireUser();
  if (!user) return { error: 'Unauthorized' };
  const supabase = await createServerSupabase();
  const { data, error } = await supabase
    .from('guests')
    .select('id, project_id, name, phone, created_at')
    .eq('project_id', projectId)
    .order('created_at', { ascending: false });
  if (error) return { error: error.message };
  return { data: (data ?? []) as Guest[] };
}

/** Tambah beberapa tamu sekaligus (satu nama per baris). */
export async function addGuests(projectId: string, entries: { name: string; phone?: string }[]): Promise<{ error?: string }> {
  const user = await requireUser();
  if (!user) return { error: 'Unauthorized' };
  const rows = entries
    .map((e) => ({ project_id: projectId, name: e.name.trim(), phone: (e.phone ?? '').trim() || null }))
    .filter((r) => r.name.length > 0);
  if (rows.length === 0) return {};
  const supabase = await createServerSupabase();
  const { error } = await supabase.from('guests').insert(rows);
  if (error) return { error: error.message };
  revalidatePath(`/invite/${projectId}`);
  return {};
}

export async function deleteGuest(projectId: string, guestId: string): Promise<{ error?: string }> {
  const user = await requireUser();
  if (!user) return { error: 'Unauthorized' };
  const supabase = await createServerSupabase();
  const { error } = await supabase.from('guests').delete().eq('id', guestId).eq('project_id', projectId);
  if (error) return { error: error.message };
  revalidatePath(`/invite/${projectId}`);
  return {};
}
