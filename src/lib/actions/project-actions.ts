'use server';

import { revalidatePath } from 'next/cache';
import { createServerSupabase, requireUser } from '@/lib/supabase/server';
import type { CanvasData } from '@/lib/types';
import { emptyCanvas, getTemplate } from '@/lib/templates';
import { canvasToJson, jsonToCanvas } from '@/lib/canvas-json';
import { sanitizeTitle, slugify } from '@/lib/slug';

async function makeUniqueSlug(supabase: Awaited<ReturnType<typeof createServerSupabase>>, base: string, userId: string) {
  let slug = base;
  let i = 1;
  for (;;) {
    const { data } = await supabase
      .from('projects')
      .select('id')
      .eq('slug', slug)
      .eq('user_id', userId)
      .maybeSingle();
    if (!data) return slug;
    slug = `${base}-${i++}`;
  }
}

export async function createProject(title: string, templateId?: string) {
  const user = await requireUser();
  if (!user) return { error: 'Unauthorized' };

  const supabase = await createServerSupabase();
  const trimmed = sanitizeTitle(title);
  const slug = await makeUniqueSlug(supabase, slugify(trimmed), user.id);

  const canvas: CanvasData = templateId ? getTemplate(templateId) ?? emptyCanvas() : emptyCanvas();

  const { data, error } = await supabase
    .from('projects')
    .insert({ user_id: user.id, title: trimmed, slug, status: 'draft' })
    .select('id')
    .single();

  if (error || !data) return { error: error?.message ?? 'Gagal membuat proyek' };

  const { error: designError } = await supabase.from('project_designs').insert({
    project_id: data.id,
    canvas_data: canvasToJson(canvas)
  });

  if (designError) return { error: designError.message };

  revalidatePath('/dashboard');
  return { id: data.id };
}

/** Membuat proyek dari CanvasData utuh (dipakai template buatan user). */
export async function createProjectFromCanvas(title: string, canvas: CanvasData) {
  const user = await requireUser();
  if (!user) return { error: 'Unauthorized' };

  const supabase = await createServerSupabase();
  const trimmed = sanitizeTitle(title);
  const slug = await makeUniqueSlug(supabase, slugify(trimmed), user.id);

  const { data, error } = await supabase
    .from('projects')
    .insert({ user_id: user.id, title: trimmed, slug, status: 'draft' })
    .select('id')
    .single();

  if (error || !data) return { error: error?.message ?? 'Gagal membuat proyek' };

  const { error: designError } = await supabase.from('project_designs').insert({
    project_id: data.id,
    canvas_data: canvasToJson(canvas)
  });

  if (designError) return { error: designError.message };

  revalidatePath('/dashboard');
  return { id: data.id };
}

export async function duplicateProject(projectId: string) {
  const user = await requireUser();
  if (!user) return { error: 'Unauthorized' };

  const supabase = await createServerSupabase();

  const { data: src, error } = await supabase
    .from('projects')
    .select('id, title, slug, project_designs(canvas_data)')
    .eq('id', projectId)
    .eq('user_id', user.id)
    .single();

  if (error || !src) return { error: 'Proyek tidak ditemukan' };

  const design = src.project_designs?.[0];
  const title = sanitizeTitle(`Copy of ${src.title}`);
  const slug = await makeUniqueSlug(supabase, slugify(title), user.id);

  const { data: dup, error: dupError } = await supabase
    .from('projects')
    .insert({ user_id: user.id, title, slug, status: 'draft' })
    .select('id')
    .single();

  if (dupError || !dup) return { error: dupError?.message ?? 'Gagal duplikasi' };

  const canvas = jsonToCanvas(design?.canvas_data) ?? emptyCanvas();

  const { error: designError } = await supabase.from('project_designs').insert({
    project_id: dup.id,
    canvas_data: canvasToJson(canvas)
  });

  if (designError) return { error: designError.message };

  revalidatePath('/dashboard');
  return { id: dup.id };
}

export async function deleteProject(projectId: string) {
  const user = await requireUser();
  if (!user) return { error: 'Unauthorized' };

  const supabase = await createServerSupabase();
  const { error } = await supabase.from('projects').delete().eq('id', projectId).eq('user_id', user.id);

  if (error) return { error: error.message };

  revalidatePath('/dashboard');
  return {};
}

export async function updateProjectTitle(projectId: string, title: string) {
  const user = await requireUser();
  if (!user) return { error: 'Unauthorized' };

  const supabase = await createServerSupabase();
  const { error } = await supabase
    .from('projects')
    .update({ title: sanitizeTitle(title), updated_at: new Date().toISOString() })
    .eq('id', projectId)
    .eq('user_id', user.id);

  if (error) return { error: error.message };
  revalidatePath('/dashboard');
  return {};
}

export async function setProjectStatus(projectId: string, status: 'draft' | 'published') {
  const user = await requireUser();
  if (!user) return { error: 'Unauthorized' };

  const supabase = await createServerSupabase();

  const { data: project, error: fetchError } = await supabase
    .from('projects')
    .select('slug')
    .eq('id', projectId)
    .eq('user_id', user.id)
    .single();
  if (fetchError || !project) return { error: 'Proyek tidak ditemukan' };

  const { error } = await supabase
    .from('projects')
    .update({ status })
    .eq('id', projectId)
    .eq('user_id', user.id);

  if (error) return { error: error.message };

  revalidatePath(`/${project.slug}`);
  revalidatePath('/dashboard');
  return {};
}

/**
 * Cek apakah user saat ini berhak mengakses proyek (pemilik).
 * Dipakai untuk mengunci rute /builder dan /invite dari akses via URL langsung.
 */
export async function verifyProjectAccess(projectId: string) {
  const user = await requireUser();
  if (!user) return { allowed: false, reason: 'unauthorized' };

  const supabase = await createServerSupabase();
  const { data } = await supabase
    .from('projects')
    .select('id')
    .eq('id', projectId)
    .eq('user_id', user.id)
    .maybeSingle();

  return { allowed: Boolean(data), reason: data ? undefined : 'forbidden' };
}