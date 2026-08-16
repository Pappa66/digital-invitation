'use client';

import type { CanvasData, Project, Rsvp, Checkin } from '@/lib/types';
import { getTemplate, emptyCanvas } from '@/lib/templates';
import { slugify } from '@/lib/slug';
import { demoIsDemoMode } from '@/lib/env';

export { demoIsDemoMode };

/**
 * Demo store (client-only, localStorage).
 * Digunakan saat NEXT_PUBLIC_DEMO_MODE=true agar aplikasi bisa dicoba
 * tanpa Supabase. Semua data tersimpan di browser, bukan di server.
 */

const PROJECTS_KEY = 'di_demo_projects';
const DESIGNS_KEY = 'di_demo_designs';
const RSVPS_KEY = 'di_demo_rsvps';
const CHECKINS_KEY = 'di_demo_checkins';

function read<T>(key: string, fallback: T): T {
  if (typeof window === 'undefined') return fallback;
  try {
    const raw = window.localStorage.getItem(key);
    return raw ? (JSON.parse(raw) as T) : fallback;
  } catch {
    return fallback;
  }
}

function write(key: string, value: unknown) {
  if (typeof window === 'undefined') return;
  window.localStorage.setItem(key, JSON.stringify(value));
}

function uid() {
  return `demo-${Date.now().toString(36)}-${Math.random().toString(36).slice(2, 8)}`;
}

function listProjects(): Project[] {
  return read<Project[]>(PROJECTS_KEY, []);
}

function seedTemplates() {
  const projects = listProjects();
  if (projects.length > 0) return;
  const seeds: { title: string; template: string }[] = [
    { title: 'Perkawinan Panca & Sena', template: 'elegant-gold' },
    { title: 'Perkawinan Bayu & Kintan', template: 'emerald-khaki' }
  ];
  const now = new Date().toISOString();
  const created: Project[] = [];
  const designs: Record<string, CanvasData> = {};
  for (const s of seeds) {
    const id = uid();
    created.push({
      id,
      user_id: 'demo',
      title: s.title,
      slug: `${slugify(s.title)}-${id.slice(-4)}`,
      status: 'published',
      thumbnail: null,
      created_at: now,
      updated_at: now
    });
    designs[id] = getTemplate(s.template) ?? emptyCanvas();
  }
  write(PROJECTS_KEY, created);
  write(DESIGNS_KEY, designs);
}

export function demoListProjects(): Project[] {
  seedTemplates();
  return listProjects();
}

export function demoGetProject(id: string): Project | null {
  return listProjects().find((p) => p.id === id) ?? null;
}

export function demoGetDesign(id: string): CanvasData | null {
  const designs = read<Record<string, CanvasData>>(DESIGNS_KEY, {});
  return designs[id] ?? null;
}

export function demoCreateProject(title: string, templateId?: string): { id: string } {
  seedTemplates();
  const projects = listProjects();
  const id = uid();
  const now = new Date().toISOString();
  const project: Project = {
    id,
    user_id: 'demo',
    title: title.trim() || 'Tanpa Judul',
    slug: `${slugify(title)}-${id.slice(-4)}`,
    status: 'draft',
    thumbnail: null,
    created_at: now,
    updated_at: now
  };
  projects.unshift(project);
  write(PROJECTS_KEY, projects);
  const designs = read<Record<string, CanvasData>>(DESIGNS_KEY, {});
  designs[id] = templateId ? getTemplate(templateId) ?? emptyCanvas() : emptyCanvas();
  write(DESIGNS_KEY, designs);
  return { id };
}

/** Membuat proyek dari CanvasData utuh (template buatan user / template baru). */
export function demoCreateProjectFromData(title: string, canvas: CanvasData): { id: string } {
  seedTemplates();
  const projects = listProjects();
  const id = uid();
  const now = new Date().toISOString();
  const project: Project = {
    id,
    user_id: 'demo',
    title: title.trim() || 'Tanpa Judul',
    slug: `${slugify(title)}-${id.slice(-4)}`,
    status: 'draft',
    thumbnail: null,
    created_at: now,
    updated_at: now
  };
  projects.unshift(project);
  write(PROJECTS_KEY, projects);
  const designs = read<Record<string, CanvasData>>(DESIGNS_KEY, {});
  designs[id] = structuredClone(canvas);
  write(DESIGNS_KEY, designs);
  return { id };
}

export function demoDuplicateProject(id: string): { id: string } {
  const projects = listProjects();
  const src = projects.find((p) => p.id === id);
  if (!src) throw new Error('Proyek tidak ditemukan');
  const newId = uid();
  const now = new Date().toISOString();
  const copy: Project = {
    ...src,
    id: newId,
    title: `Copy of ${src.title}`,
    slug: `${slugify(`Copy of ${src.title}`)}-${newId.slice(-4)}`,
    status: 'draft',
    created_at: now,
    updated_at: now
  };
  projects.unshift(copy);
  write(PROJECTS_KEY, projects);
  const designs = read<Record<string, CanvasData>>(DESIGNS_KEY, {});
  designs[newId] = structuredClone(designs[id] ?? emptyCanvas());
  write(DESIGNS_KEY, designs);
  return { id: newId };
}

export function demoDeleteProject(id: string) {
  const projects = listProjects().filter((p) => p.id !== id);
  write(PROJECTS_KEY, projects);
  const designs = read<Record<string, CanvasData>>(DESIGNS_KEY, {});
  delete designs[id];
  write(DESIGNS_KEY, designs);
}

export function demoRenameProject(id: string, title: string): { error?: string } {
  const projects = listProjects().map((p) =>
    p.id === id
      ? { ...p, title: title.trim() || p.title, updated_at: new Date().toISOString() }
      : p
  );
  write(PROJECTS_KEY, projects);
  return {};
}

export function demoSetProjectStatus(id: string, status: 'draft' | 'published'): { error?: string; slug?: string } {
  const projects = listProjects();
  const project = projects.find((p) => p.id === id);
  if (!project) return { error: 'Proyek tidak ditemukan' };
  write(
    PROJECTS_KEY,
    projects.map((p) =>
      p.id === id
        ? { ...p, status, updated_at: new Date().toISOString() }
        : p
    )
  );
  return { slug: project.slug };
}

export function demoSaveDesign(id: string, canvas: CanvasData) {
  const designs = read<Record<string, CanvasData>>(DESIGNS_KEY, {});
  designs[id] = structuredClone(canvas);
  write(DESIGNS_KEY, designs);
  const projects = listProjects().map((p) =>
    p.id === id ? { ...p, updated_at: new Date().toISOString() } : p
  );
  write(PROJECTS_KEY, projects);
}

export function demoGetPublished(
  slug: string,
  opts?: { allowDraft?: boolean }
): { id: string; canvas: CanvasData } | null {
  seedTemplates();
  const project = listProjects().find(
    (p) => p.slug === slug && (opts?.allowDraft ? true : p.status === 'published')
  );
  if (!project) return null;
  const canvas = demoGetDesign(project.id);
  if (!canvas) return null;
  return { id: project.id, canvas };
}

/** RSVP demo: daftar konfirmasi per proyek (terbaru dulu). */
const rsvpListeners = new Set<() => void>();

export function demoSetRsvpListener(fn: () => void): () => void {
  rsvpListeners.add(fn);
  return () => rsvpListeners.delete(fn);
}

export function demoListRsvps(projectId: string): Rsvp[] {
  const all = read<Record<string, Rsvp[]>>(RSVPS_KEY, {});
  return (all[projectId] ?? []).slice().sort((a, b) => b.created_at.localeCompare(a.created_at));
}

export function demoAddRsvp(
  projectId: string,
  input: {
    name: string;
    attendance: 'hadir' | 'tidak' | 'ragu';
    guest_count: number;
    message: string;
    meal_choice?: string | null;
    menu_options?: { label: string; value: string }[] | null;
  }
): { error?: string } {
  const all = read<Record<string, Rsvp[]>>(RSVPS_KEY, {});
  const list = all[projectId] ?? [];
  list.unshift({
    id: uid(),
    project_id: projectId,
    name: input.name.trim(),
    attendance: input.attendance,
    guest_count: input.guest_count,
    message: input.message.trim() || null,
    meal_choice: input.meal_choice ?? null,
    menu_options: input.menu_options ?? null,
    created_at: new Date().toISOString()
  });
  all[projectId] = list;
  write(RSVPS_KEY, all);
  rsvpListeners.forEach((fn) => fn());
  return {};
}

/** Check-in demo: daftar absensi per proyek (terbaru dulu). */
export function demoListCheckins(projectId: string): Checkin[] {
  const all = read<Record<string, Checkin[]>>(CHECKINS_KEY, {});
  return (all[projectId] ?? []).slice().sort((a, b) => b.created_at.localeCompare(a.created_at));
}

export function demoAddCheckin(projectId: string, input: { name: string; guest_count: number }): { error?: string } {
  const all = read<Record<string, Checkin[]>>(CHECKINS_KEY, {});
  const list = all[projectId] ?? [];
  list.unshift({
    id: uid(),
    project_id: projectId,
    name: input.name.trim(),
    guest_count: input.guest_count,
    created_at: new Date().toISOString()
  });
  all[projectId] = list;
  write(CHECKINS_KEY, all);
  return {};
}