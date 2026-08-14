'use client';

import { createProject, createProjectFromCanvas, duplicateProject, deleteProject, updateProjectTitle, verifyProjectAccess, setProjectStatus } from '@/lib/actions/project-actions';
import { demoCreateProject, demoCreateProjectFromData, demoDuplicateProject, demoDeleteProject, demoRenameProject, demoSetProjectStatus } from '@/lib/demo/demo-store';
import { demoIsDemoMode } from '@/lib/env';
import type { CanvasData } from '@/lib/types';

/**
 * Client-side dispatcher: memilih antara Supabase (produksi) atau
 * demo store (localStorage) berdasarkan NEXT_PUBLIC_DEMO_MODE.
 */

export async function clientCreateProject(title: string, templateId?: string): Promise<{ id?: string; error?: string }> {
  if (demoIsDemoMode()) {
    const res = demoCreateProject(title, templateId);
    return { id: res.id };
  }
  return createProject(title, templateId);
}

export async function clientCreateProjectFromData(title: string, canvas: CanvasData): Promise<{ id?: string; error?: string }> {
  if (demoIsDemoMode()) {
    const res = demoCreateProjectFromData(title, canvas);
    return { id: res.id };
  }
  return createProjectFromCanvas(title, canvas);
}

export async function clientDuplicateProject(projectId: string): Promise<{ id?: string; error?: string }> {
  if (demoIsDemoMode()) {
    try {
      const res = demoDuplicateProject(projectId);
      return { id: res.id };
    } catch (e) {
      return { error: (e as Error).message };
    }
  }
  return duplicateProject(projectId);
}

export async function clientDeleteProject(projectId: string): Promise<{ error?: string }> {
  if (demoIsDemoMode()) {
    demoDeleteProject(projectId);
    return {};
  }
  return deleteProject(projectId);
}

export async function clientRenameProject(projectId: string, title: string): Promise<{ error?: string }> {
  if (demoIsDemoMode()) {
    return demoRenameProject(projectId, title);
  }
  return updateProjectTitle(projectId, title);
}

/**
 * Ubah status publikasi proyek (draft <-> published).
 * Menentukan apakah halaman tamu /{slug} bisa diakses tanpa login.
 */
export async function clientSetProjectStatus(
  projectId: string,
  status: 'draft' | 'published'
): Promise<{ error?: string; slug?: string }> {
  if (demoIsDemoMode()) {
    return demoSetProjectStatus(projectId, status);
  }
  return setProjectStatus(projectId, status);
}

/**
 * Verifikasi akses proyek. Demo selalu diizinkan (data lokal);
 * produksi memeriksa kepemilikan via server action.
 */
export async function clientVerifyProjectAccess(projectId: string): Promise<{ allowed: boolean; reason?: string }> {
  if (demoIsDemoMode()) return { allowed: true };
  return verifyProjectAccess(projectId);
}