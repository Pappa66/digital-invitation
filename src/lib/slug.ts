/** Slug generator aman untuk URL publik. Menghilangkan karakter berbahaya. */
export function slugify(title: string): string {
  return (
    title
      .toLowerCase()
      .replace(/[^a-z0-9\s-]/g, '')
      .trim()
      .replace(/\s+/g, '-')
      .replace(/-+/g, '-')
      .replace(/^-|-$/g, '')
      .slice(0, 60) || 'undangan'
  );
}

/** Ubah judul menjadi title untuk RSVP/public tidak berbahaya. */
export function sanitizeTitle(title: string): string {
  return title.trim().replace(/[\u0000-\u001F\u007F]/g, '').slice(0, 200) || 'Tanpa Judul';
}