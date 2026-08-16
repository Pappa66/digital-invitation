const KEY = 'di_demo_templates';

/**
 * Baca daftar ID template yang diaktifkan untuk landing.
 * Return null bila belum pernah diatur (admin belum pernah menyentuh toggle),
 * sehingga caller tahu harus menampilkan semua template sebagai fallback.
 */
export function demoReadEnabledIds(): Set<string> | null {
  if (typeof window === 'undefined') return null;
  try {
    const stored = window.localStorage.getItem(KEY);
    if (stored === null) return null;
    const parsed = JSON.parse(stored);
    if (!Array.isArray(parsed)) return null;
    return new Set(parsed);
  } catch {
    return null;
  }
}

/** Simpan daftar ID template yang aktif di landing. */
export function demoWriteEnabledIds(ids: string[]) {
  if (typeof window === 'undefined') return;
  try {
    window.localStorage.setItem(KEY, JSON.stringify(ids));
  } catch {
    /* ignore */
  }
}

/** Hapus pengaturan demo (kembali ke "tampilkan semua"). */
export function demoClearEnabledIds() {
  if (typeof window === 'undefined') return;
  try {
    window.localStorage.removeItem(KEY);
  } catch {
    /* ignore */
  }
}