'use client';

import type { CanvasData } from '@/lib/types';

/**
 * Template buatan user, tersimpan di localStorage (demo & produksi sama-sama
 * client-side; template adalah aset pribadi yang tidak butuh Supabase).
 */

export interface UserTemplate {
  id: string;
  name: string;
  category: string;
  description: string;
  primary: string;
  secondary: string;
  canvas: CanvasData;
  created_at: string;
}

const KEY = 'di_user_templates';

function read(): UserTemplate[] {
  if (typeof window === 'undefined') return [];
  try {
    const raw = window.localStorage.getItem(KEY);
    return raw ? (JSON.parse(raw) as UserTemplate[]) : [];
  } catch {
    return [];
  }
}

function write(list: UserTemplate[]) {
  if (typeof window === 'undefined') return;
  window.localStorage.setItem(KEY, JSON.stringify(list));
}

export function uid(): string {
  return `user-${Date.now().toString(36)}-${Math.random().toString(36).slice(2, 8)}`;
}

export function userTemplatesList(): UserTemplate[] {
  return read().sort((a, b) => (a.created_at < b.created_at ? 1 : -1));
}

export function userTemplateGet(id: string): UserTemplate | null {
  return read().find((t) => t.id === id) ?? null;
}

export function userTemplateSave(input: Omit<UserTemplate, 'id' | 'created_at'>): { id: string } {
  const id = uid();
  const item: UserTemplate = { ...input, id, created_at: new Date().toISOString() };
  const list = read().filter((t) => t.id !== id);
  list.push(item);
  write(list);
  return { id };
}

export function userTemplateDelete(id: string) {
  write(read().filter((t) => t.id !== id));
}