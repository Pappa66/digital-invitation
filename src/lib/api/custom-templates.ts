/* eslint-disable @typescript-eslint/no-explicit-any */
import { supabase } from '@/lib/supabase/client';
import type { CanvasData } from '@/lib/types';

export interface CustomTemplate {
  id: string;
  name: string;
  category: string | null;
  canvas_data: CanvasData;
  visible: boolean;
  sort_order: number;
  created_at: string;
}

/** Template kustom yang tampil publik (untuk landing). */
export async function listVisibleTemplates(): Promise<CustomTemplate[]> {
  const sb = supabase as any;
  const { data } = await sb
    .from('custom_templates')
    .select('id, name, category, canvas_data, visible, sort_order, created_at')
    .eq('visible', true)
    .order('sort_order', { ascending: true });
  return (data ?? []) as CustomTemplate[];
}

/** Template milik pengguna (untuk dashboard). */
export async function listMyTemplates(): Promise<CustomTemplate[]> {
  const sb = supabase as any;
  const {
    data: { user }
  } = await supabase.auth.getUser();
  if (!user) return [];
  const { data } = await sb
    .from('custom_templates')
    .select('id, name, category, canvas_data, visible, sort_order, created_at')
    .order('created_at', { ascending: false });
  return (data ?? []) as CustomTemplate[];
}

export async function createTemplate(input: {
  name: string;
  category?: string;
  canvas: CanvasData;
  visible?: boolean;
}): Promise<{ id?: string; error?: string }> {
  const sb = supabase as any;
  const {
    data: { user }
  } = await supabase.auth.getUser();
  if (!user) return { error: 'Harus login.' };
  const { data, error } = await sb
    .from('custom_templates')
    .insert({
      name: input.name.trim() || 'Template Baru',
      category: input.category ?? 'Template Saya',
      canvas_data: input.canvas,
      visible: input.visible ?? true,
      created_by: user.id
    })
    .select('id')
    .single();
  if (error) return { error: error.message };
  return { id: data?.id };
}

export async function updateTemplate(
  id: string,
  patch: Partial<Pick<CustomTemplate, 'name' | 'category' | 'visible' | 'canvas_data' | 'sort_order'>>
): Promise<{ error?: string }> {
  const sb = supabase as any;
  const { error } = await sb
    .from('custom_templates')
    .update({ ...patch, updated_at: new Date().toISOString() })
    .eq('id', id);
  return { error: error?.message };
}

export async function deleteTemplate(id: string): Promise<{ error?: string }> {
  const sb = supabase as any;
  const { error } = await sb.from('custom_templates').delete().eq('id', id);
  return { error: error?.message };
}
