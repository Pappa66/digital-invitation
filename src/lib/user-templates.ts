import type { PuckData } from '@/lib/canvas/puck-format';

const KEY = 'di_user_templates';

export interface UserTemplate {
  id: string;
  name: string;
  createdAt: string;
  data: PuckData;
}

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
  try {
    window.localStorage.setItem(KEY, JSON.stringify(list));
  } catch {
    /* ignore */
  }
}

export function listUserTemplates(): UserTemplate[] {
  return read();
}

export function saveUserTemplate(name: string, data: PuckData): UserTemplate {
  const item: UserTemplate = {
    id: `tpl-${Date.now().toString(36)}-${Math.random().toString(36).slice(2, 7)}`,
    name: name.trim() || 'Template Saya',
    createdAt: new Date().toISOString(),
    data
  };
  write([item, ...read()]);
  return item;
}

export function removeUserTemplate(id: string) {
  write(read().filter((t) => t.id !== id));
}
