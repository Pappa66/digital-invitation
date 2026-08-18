'use server';

import { z } from 'zod';
import { revalidatePath } from 'next/cache';
import { createServerSupabase, requireUser } from '@/lib/supabase/server';
import type { Client, ClientWithProject } from '@/lib/types';

/** Skema input client — validasi Zod di server, tidak pernah percaya client. */
export const ClientInputSchema = z.object({
  name: z.string().trim().min(2, 'Nama minimal 2 karakter').max(120, 'Nama terlalu panjang'),
  email: z.string().trim().max(320).optional(),
  phone: z.string().trim().max(30).optional(),
  design_name: z.string().trim().max(200).optional(),
  project_id: z.string().uuid('Project ID tidak valid').nullable().optional(),
  status: z.enum(['aktual', 'proses', 'selesai']).default('proses')
});
export type ClientInput = z.infer<typeof ClientInputSchema>;

type ClientResult = { client?: ClientWithProject; error?: string };

function strip(v: string | undefined): string | null {
  const s = v?.trim();
  return s ? s : null;
}

/**
 * Ambil daftar client milik user login, dilengkapi info project
 * (title/slug) untuk tautan undangan di dashboard.
 */
export async function listClients(): Promise<{ clients: ClientWithProject[] } | { error: string }> {
  const user = await requireUser();
  if (!user) return { error: 'Unauthorized' };

  const supabase = await createServerSupabase();
  const { data, error } = await supabase
    .from('clients')
    .select('*, projects(slug, title)')
    .eq('user_id', user.id)
    .order('created_at', { ascending: false });

  if (error) return { error: error.message };

  const rows = (data ?? []) as (Client & { projects: { slug: string; title: string } | null })[];
  const clients: ClientWithProject[] = rows.map((r) => ({
    id: r.id,
    user_id: r.user_id,
    name: r.name,
    email: r.email,
    phone: r.phone,
    project_id: r.project_id,
    design_name: r.design_name,
    status: r.status,
    created_at: r.created_at,
    updated_at: r.updated_at,
    project_title: r.projects?.title ?? '',
    project_slug: r.projects?.slug ?? '',
    invitation_link: r.projects?.slug ? `/${r.projects.slug}` : ''
  }));

  return { clients };
}

/** Buat client baru (harus login, user_id di-set dari sesi, bukan dari body). */
export async function createClient(input: unknown): Promise<ClientResult> {
  const user = await requireUser();
  if (!user) return { error: 'Unauthorized' };

  const parsed = ClientInputSchema.safeParse(input);
  if (!parsed.success) {
    return { error: parsed.error.issues[0]?.message ?? 'Data client tidak valid' };
  }

  const supabase = await createServerSupabase();
  const { data, error } = await supabase
    .from('clients')
    .insert({
      user_id: user.id,
      name: parsed.data.name,
      email: strip(parsed.data.email),
      phone: strip(parsed.data.phone),
      design_name: strip(parsed.data.design_name),
      project_id: parsed.data.project_id ?? null,
      status: parsed.data.status
    })
    .select()
    .single();

  if (error || !data) return { error: error?.message ?? 'Gagal menyimpan client' };

  revalidatePath('/dashboard');
  const client = data as Client;
  return {
    client: {
      ...client,
      project_title: '',
      project_slug: '',
      invitation_link: ''
    }
  };
}

/** Update client (ownership check via .eq user_id — tidak bisa ubah punya orang lain). */
export async function updateClient(clientId: string, input: unknown): Promise<ClientResult> {
  const user = await requireUser();
  if (!user) return { error: 'Unauthorized' };

  const parsed = ClientInputSchema.safeParse(input);
  if (!parsed.success) {
    return { error: parsed.error.issues[0]?.message ?? 'Data client tidak valid' };
  }

  const supabase = await createServerSupabase();
  const { data, error } = await supabase
    .from('clients')
    .update({
      name: parsed.data.name,
      email: strip(parsed.data.email),
      phone: strip(parsed.data.phone),
      design_name: strip(parsed.data.design_name),
      project_id: parsed.data.project_id ?? null,
      status: parsed.data.status,
      updated_at: new Date().toISOString()
    })
    .eq('id', clientId)
    .eq('user_id', user.id)
    .select()
    .single();

  if (error || !data) return { error: error?.message ?? 'Gagal memperbarui client' };

  revalidatePath('/dashboard');
  const client = data as Client;
  return {
    client: {
      ...client,
      project_title: '',
      project_slug: '',
      invitation_link: ''
    }
  };
}

/** Hapus client milik user sendiri saja. */
export async function deleteClient(clientId: string): Promise<{ error?: string }> {
  const user = await requireUser();
  if (!user) return { error: 'Unauthorized' };

  const supabase = await createServerSupabase();
  const { error } = await supabase
    .from('clients')
    .delete()
    .eq('id', clientId)
    .eq('user_id', user.id);

  if (error) return { error: error.message };
  revalidatePath('/dashboard');
  return {};
}
