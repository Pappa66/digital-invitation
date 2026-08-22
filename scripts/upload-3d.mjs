/**
 * Upload aset 3D budaya (GLB) ke Supabase Storage bucket 'invitation-assets'.
 *
 * Cara pakai (lokal, bukan di sandbox):
 *   1. Unduh GLB CC0/bebas-hak-cipta ke folder scripts/3d/ (nama bebas).
 *   2. Set env: NEXT_PUBLIC_SUPABASE_URL & SUPABASE_SERVICE_ROLE_KEY (service role!).
 *   3. node scripts/upload-3d.mjs
 *
 * File diupload ke path 3d/<nama>.glb — cocok dengan registry src/lib/assets/cultural.ts.
 * Catatan: anon key TIDAK bisa upload; wajib pakai service_role key.
 */
import { readdirSync, readFileSync } from 'node:fs';
import { join } from 'node:path';
import { createClient } from '@supabase/supabase-js';

// Muat .env.local bila env belum diset (node tidak auto-load).
if (!process.env.NEXT_PUBLIC_SUPABASE_URL) {
  try {
    const env = readFileSync(join(process.cwd(), '.env.local'), 'utf8');
    for (const line of env.split('\n')) {
      const m = line.match(/^([A-Z0-9_]+)=(.*)$/);
      if (m && !process.env[m[1]]) process.env[m[1]] = m[2].trim();
    }
  } catch { /* abaikan */ }
}

const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
const key = process.env.SUPABASE_SECRET_KEY || process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.SUPABASE_SERVICE_KEY;
const BUCKET = 'invitation-assets';
const folder = join(process.cwd(), 'scripts', '3d');

if (!url || !key) {
  console.error('Butuh NEXT_PUBLIC_SUPABASE_URL dan SUPABASE_SERVICE_ROLE_KEY di env.');
  process.exit(1);
}

const supabase = createClient(url, key, { auth: { persistSession: false } });
const files = readdirSync(folder).filter((f) => f.toLowerCase().endsWith('.glb'));

if (!files.length) {
  console.error(`Tidak ada .glb di ${folder}. Letakkan file GLB di sana dulu.`);
  process.exit(1);
}

for (const f of files) {
  const path = join(folder, f);
  const buf = readFileSync(path);
  const dest = `3d/${f}`;
  const { error } = await supabase.storage.from(BUCKET).upload(dest, buf, {
    contentType: 'model/gltf-binary',
    upsert: true
  });
  if (error) console.error(`Gagal ${dest}:`, error.message);
  else console.log(`Uploaded 3d/${f} -> ${BUCKET}`);
}
console.log('Selesai.');
