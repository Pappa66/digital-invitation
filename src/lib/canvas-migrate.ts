import type { CanvasData } from '@/lib/types';

/**
 * Migrasi non-destruktif `CanvasData` dari bentuk DB lama ke versi skema
 * terkini sebelum divalidasi / dirender / disimpan.
 *
 * Prinsip:
 *  - TIDAK PERNAH membuang data, termasuk key yang belum dikenal skema.
 *    (Validator `validateCanvasData` kini toleran terhadap key tambahan.)
 *  - Idempoten: menjalankan dua kali pada data yang sama menghasilkan hasil sama.
 *  - Forward-compatible: data dengan `schema_version` lebih baru dari aplikasi
 *    dibiarkan apa adanya (versi tidak diturunkan).
 */

/** Versi skema CanvasData saat ini. Naikkan saat ada perubahan struktural. */
export const CANVAS_SCHEMA_VERSION = 1;

type MutableCanvas = Record<string, unknown>;
/** Upcast dari versi ASAL (kunci) ke versi berikutnya. */
type Migration = (canvas: MutableCanvas) => void;

/**
 * Registry upcast. Kunci = versi asal. Tambahkan migrasi baru di sini saat
 * `CANVAS_SCHEMA_VERSION` dinaikkan; JANGAN mengubah migrasi lama.
 */
const MIGRATIONS: Record<number, Migration> = {
  // 0 -> 1: baseline. Belum ada perubahan struktural wajib; cukup set versi.
  0: () => {}
};

function isPlainObject(value: unknown): value is MutableCanvas {
  return typeof value === 'object' && value !== null && !Array.isArray(value);
}

/**
 * Kembalikan salinan `CanvasData` yang sudah dimigrasikan.
 *
 * Data non-objek (null/string/array) diteruskan apa adanya (cast) agar gate
 * validasi tetap menolaknya dan GuestView menampilkan placeholder error —
 * bukan diam-diam berubah menjadi kanvas kosong.
 */
export function migrateCanvas(data: unknown): CanvasData {
  if (!isPlainObject(data)) return data as unknown as CanvasData;

  let canvas: MutableCanvas;
  try {
    canvas = structuredClone(data);
  } catch {
    // Nilai non-cloneable (mis. dari input tidak tepercaya) — salin dangkal
    // agar tetap tidak memutasi data pemanggil dan tidak membuang key.
    canvas = { ...data };
  }

  const fromVersion = typeof canvas.schema_version === 'number' ? canvas.schema_version : 0;
  let version = fromVersion;
  let guard = 0;

  while (version < CANVAS_SCHEMA_VERSION && MIGRATIONS[version] && guard < 100) {
    MIGRATIONS[version](canvas);
    version += 1;
    guard += 1;
  }

  // Isi versi saat absen, tetapi jangan turunkan versi data yang lebih baru.
  if (typeof canvas.schema_version !== 'number' || version > canvas.schema_version) {
    canvas.schema_version = version;
  }

  return canvas as unknown as CanvasData;
}
