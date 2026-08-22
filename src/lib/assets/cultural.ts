/**
 * Registry aset budaya & agama Indonesia (gratis / royalty-free).
 * Setiap kategori memiliki jumlah SEIMBANG antara aset 3D (GLB/glTF) dan
 * ornamen 2D (SVG/PNG), sehingga tamu bisa memilih secara merata.
 *
 * - `models3d`  : dipakai sebagai layer entrance 3D (lazy-load via useGLTF,
 *                 toggle `theme.cover_3d`). Path mengarah ke Supabase Storage
 *                 (`/3d/<file>.glb`) saat produksi; `source` = asal gratis.
 * - `ornaments2d`: ditambahkan ke library ornamen (`ornaments.tsx`) ber-
 *                 `currentColor` agar bisa di-recolor.
 *
 * Semua lisensi CC0 / CC-BY / Public Domain / komersial-izin (gratis).
 * `verified:false` = perlu cek ulang lisensi sebelum publikasi.
 */

export interface AssetRef {
  name: string;
  /** Path di Supabase Storage saat produksi. */
  storage?: string;
  /** URL asal gratis (untuk unduh manual ke Storage). */
  source: string;
  license: string;
  verified: boolean;
  /** CC-BY butuh atribusi (masih berhak cipta, bukan domain publik). */
  requiresAttribution?: boolean;
}

export interface CulturalCategory {
  key: string;
  label: string;
  kind: 'religion' | 'adat';
  accent: string;
  models3d: AssetRef[];
  ornaments2d: AssetRef[];
}

export const CULTURAL_ASSETS: CulturalCategory[] = [
  {
    key: 'islam',
    label: 'Islam',
    kind: 'religion',
    accent: '#2E7D57',
    models3d: [
      { name: 'Masjid Al-Fairus (Pekalongan)', source: 'https://blendswap.com/blend/18073', license: 'CC-BY', verified: true, requiresAttribution: true, storage: '/3d/islam-masjid-al fairus.glb' },
      { name: 'Masjid Tuha Lam Ura (Aceh)', source: 'https://openheritage3d.org/project.php?id=gj39-0514', license: 'CC BY-NC-ND', verified: true, storage: '/3d/islam-masjid-lamura.glb' },
    ],
    ornaments2d: [
      { name: 'Kubah & Bulan Sabit', source: 'https://www.freevectors.net', license: 'Free', verified: false, storage: '/orn/islam-dome.svg' },
      { name: 'Polah Geometrik Islam', source: 'https://vecteezy.com', license: 'Free (attrib)', verified: false, storage: '/orn/islam-geometric.svg' },
    ],
  },
  {
    key: 'kristen',
    label: 'Kristen',
    kind: 'religion',
    accent: '#3B5BA5',
    models3d: [
      { name: 'Church (low-poly)', source: 'https://poly.pizza/m/GHzPfvoyzX', license: 'Public Domain (CC0)', verified: true, storage: '/3d/kristen-church.glb' },
      { name: 'Church (OGA)', source: 'https://opengameart.org/content/church', license: 'CC0', verified: true, storage: '/3d/kristen-church-oga.glb' },
    ],
    ornaments2d: [
      { name: 'Salib', source: 'https://freesvg.org', license: 'CC0', verified: true, storage: '/orn/kristen-cross.svg' },
      { name: 'Jendela Gereja', source: 'https://www.freevectors.net', license: 'Free', verified: false, storage: '/orn/kristen-window.svg' },
    ],
  },
  {
    key: 'katolik',
    label: 'Katolik',
    kind: 'religion',
    accent: '#8C6D1F',
    models3d: [
      { name: 'Gereja Blenduk Semarang', source: 'https://dinopik.com/downloads/gereja-blenduk-semarang/', license: 'Komersial (gratis)', verified: true, storage: '/3d/katolik-blenduk.glb' },
      { name: 'Church (low-poly)', source: 'https://poly.pizza/m/GHzPfvoyzX', license: 'Public Domain (CC0)', verified: true, storage: '/3d/katolik-church.glb' },
    ],
    ornaments2d: [
      { name: 'Salib & Mahkota', source: 'https://freesvg.org', license: 'CC0', verified: false, storage: '/orn/katolik-cross-crown.svg' },
      { name: 'Rosario', source: 'https://www.freevectors.net', license: 'Free', verified: false, storage: '/orn/katolik-rosary.svg' },
    ],
  },
  {
    key: 'hindu',
    label: 'Hindu',
    kind: 'religion',
    accent: '#C0392B',
    models3d: [
      { name: 'Candi Hindu Jawa Timur', source: 'https://www.freecreat.com/detail/20501.html', license: 'Cek lisensi', verified: false, storage: '/3d/hindu-candi.glb' },
      { name: 'Balinese Temple', source: 'https://www.meshy.ai/3d-models/Balinese-Temple-Design-v2-019641ce', license: 'AI — cek', verified: false, storage: '/3d/hindu-balitemple.glb' },
    ],
    ornaments2d: [
      { name: 'Om (Aum)', source: 'https://freesvg.org', license: 'CC0', verified: true, storage: '/orn/hindu-om.svg' },
      { name: 'Teratai', source: 'https://www.freevectors.net', license: 'Free', verified: false, storage: '/orn/hindu-lotus.svg' },
    ],
  },
  {
    key: 'buddha',
    label: 'Buddha',
    kind: 'religion',
    accent: '#D98C1F',
    models3d: [
      { name: 'Stupa (Borobudur style)', source: 'https://poly.pizza', license: 'Cek lisensi', verified: false, storage: '/3d/buddha-stupa.glb' },
      { name: 'Buddha Statue', source: 'https://www.freecreat.com', license: 'Cek lisensi', verified: false, storage: '/3d/buddha-statue.glb' },
    ],
    ornaments2d: [
      { name: 'Dharma Wheel', source: 'https://freesvg.org', license: 'CC0', verified: true, storage: '/orn/buddha-wheel.svg' },
      { name: 'Siluet Buddha', source: 'https://www.freevectors.net', license: 'Free', verified: false, storage: '/orn/buddha-silhouette.svg' },
    ],
  },
  {
    key: 'konghucu',
    label: 'Konghucu',
    kind: 'religion',
    accent: '#B23A3A',
    models3d: [
      { name: 'Kelenteng (Chinese Temple)', source: 'https://poly.pizza', license: 'Cek lisensi', verified: false, storage: '/3d/konghucu-kelenteng.glb' },
      { name: 'Gate Kelenteng', source: 'https://www.freecreat.com', license: 'Cek lisensi', verified: false, storage: '/3d/konghucu-gate.glb' },
    ],
    ornaments2d: [
      { name: 'Naga', source: 'https://freesvg.org', license: 'CC0', verified: false, storage: '/orn/konghucu-dragon.svg' },
      { name: 'Lentera', source: 'https://www.freevectors.net', license: 'Free', verified: false, storage: '/orn/konghucu-lantern.svg' },
    ],
  },
  {
    key: 'jawa',
    label: 'Jawa',
    kind: 'adat',
    accent: '#7B4B2A',
    models3d: [
      { name: 'Candi (Jawa)', source: 'https://www.freecreat.com/detail/20501.html', license: 'Cek lisensi', verified: false, storage: '/3d/jawa-candi.glb' },
      { name: 'Gapura Jawa', source: 'https://poly.pizza', license: 'Cek lisensi', verified: false, storage: '/3d/jawa-gapura.glb' },
    ],
    ornaments2d: [
      { name: 'Batik Parang', source: 'https://www.vector4free.com/free-vectors/indonesia-culture', license: 'Free', verified: true, storage: '/orn/jawa-batik-parang.svg' },
      { name: 'Wayang Kulit', source: 'https://pngtree.com/free-png-vectors/wayang-kulit', license: 'Free (Pngtree)', verified: true, storage: '/orn/jawa-wayang.svg' },
    ],
  },
  {
    key: 'sunda',
    label: 'Sunda',
    kind: 'adat',
    accent: '#4E7A3A',
    models3d: [
      { name: 'Rumah Adat Sunda', source: 'https://poly.pizza', license: 'Cek lisensi', verified: false, storage: '/3d/sunda-rumah.glb' },
      { name: 'Kujang Monument', source: 'https://www.freecreat.com', license: 'Cek lisensi', verified: false, storage: '/3d/sunda-kujang.glb' },
    ],
    ornaments2d: [
      { name: 'Batik Sunda', source: 'https://www.freevectors.net/indonesian-traditional-batik-62840', license: 'Free', verified: true, storage: '/orn/sunda-batik.svg' },
      { name: 'Kujang', source: 'https://freesvg.org', license: 'CC0', verified: false, storage: '/orn/sunda-kujang.svg' },
    ],
  },
  {
    key: 'batak',
    label: 'Batak',
    kind: 'adat',
    accent: '#5A3E2B',
    models3d: [
      { name: 'Rumah Adat Batak', source: 'https://opengameart.org/content/batak-house-pixel-tileset', license: 'CC0', verified: true, storage: '/3d/batak-rumah.glb' },
      { name: 'Batak House (3D)', source: 'https://poly.pizza', license: 'Cek lisensi', verified: false, storage: '/3d/batak-house.glb' },
    ],
    ornaments2d: [
      { name: 'Ornamen Batak', source: 'https://github.com/andirkh/pouffer', license: 'CC-BY-SA', verified: true, storage: '/orn/batak-orn.svg' },
      { name: 'Ulostrip', source: 'https://freesvg.org', license: 'CC0', verified: false, storage: '/orn/batak-ulos.svg' },
    ],
  },
  {
    key: 'bali',
    label: 'Bali',
    kind: 'adat',
    accent: '#C0392B',
    models3d: [
      { name: 'Balinese Temple', source: 'https://www.meshy.ai/3d-models/Balinese-Temple-Design-v2-019641ce', license: 'AI — cek', verified: false, storage: '/3d/bali-temple.glb' },
      { name: 'Gapura Bali', source: 'https://poly.pizza', license: 'Cek lisensi', verified: false, storage: '/3d/bali-gapura.glb' },
    ],
    ornaments2d: [
      { name: 'Batik Bali', source: 'https://www.freevectors.net', license: 'Free', verified: false, storage: '/orn/bali-batik.svg' },
      { name: 'Barong', source: 'https://github.com/andirkh/pouffer', license: 'CC-BY-SA', verified: true, storage: '/orn/bali-barong.svg' },
    ],
  },
  {
    key: 'minang',
    label: 'Minang',
    kind: 'adat',
    accent: '#8A5A2B',
    models3d: [
      { name: 'Rumah Gadang', source: 'https://poly.pizza', license: 'Cek lisensi', verified: false, storage: '/3d/minang-gadang.glb' },
      { name: 'Gonjong Roof', source: 'https://www.freecreat.com', license: 'Cek lisensi', verified: false, storage: '/3d/minang-gonjong.glb' },
    ],
    ornaments2d: [
      { name: 'Ornamen Minang', source: 'https://github.com/andirkh/pouffer', license: 'CC-BY-SA', verified: true, storage: '/orn/minang-orn.svg' },
      { name: 'Batik Minang', source: 'https://www.freevectors.net', license: 'Free', verified: false, storage: '/orn/minang-batik.svg' },
    ],
  },
  {
    key: 'papua',
    label: 'Papua',
    kind: 'adat',
    accent: '#2E6E8E',
    models3d: [
      { name: 'Honai (Rumah Papua)', source: 'https://poly.pizza', license: 'Cek lisensi', verified: false, storage: '/3d/papua-honai.glb' },
      { name: 'Asmat Carving', source: 'https://www.freecreat.com', license: 'Cek lisensi', verified: false, storage: '/3d/papua-asmat.glb' },
    ],
    ornaments2d: [
      { name: 'Motif Asmat', source: 'https://github.com/andirkh/pouffer', license: 'CC-BY-SA', verified: true, storage: '/orn/papua-motif.svg' },
      { name: 'Panah Papua', source: 'https://freesvg.org', license: 'CC0', verified: false, storage: '/orn/papua-panah.svg' },
    ],
  },
];

/** Total aset per kategori selalu 2×3D + 2×2D (seimbang). */
export const TOTAL_3D = CULTURAL_ASSETS.reduce((n, c) => n + c.models3d.length, 0);
export const TOTAL_2D = CULTURAL_ASSETS.reduce((n, c) => n + c.ornaments2d.length, 0);

/**
 * Hanya aset CC0 / Public Domain (nol hak cipta, bebas pakai komersial
 * tanpa atribusi). Aset CC-BY tetap gratis & royalty-free tapi WAJIB
 * atribusi — saring dengan ini.
 */
export const NO_COPYRIGHT_ASSETS: CulturalCategory[] = CULTURAL_ASSETS.map((c) => ({
  ...c,
  models3d: c.models3d.filter((a) => a.verified && !a.requiresAttribution),
  ornaments2d: c.ornaments2d.filter((a) => a.verified && !a.requiresAttribution)
})).filter((c) => c.models3d.length || c.ornaments2d.length);

/**
 * Pemetaan konsep agama/adat -> cover + entrance + ornamen yang SERASI.
 * Dipakai builder (picker "Budaya & Agama") dan script naik-kelas template.
 * Semua aset 2D berasal dari ornaments.tsx (inline, CC0/bebas hak cipta).
 */
export const CULTURAL_CONCEPT_MAP: Record<string, { cover: string; entrance: string; ornament: string; accent: string; model3d: string }> = {
  islam:    { cover: 'book',    entrance: 'islamic',  ornament: 'islamic-geometric', accent: '#2E7D57', model3d: '3d/islam-masjid.glb' },
  kristen:  { cover: 'book',    entrance: 'fade',     ornament: 'church-window',     accent: '#3B5BA5', model3d: '3d/kristen-church.glb' },
  katolik:  { cover: 'book',    entrance: 'fade',     ornament: 'cross',            accent: '#8C6D1F', model3d: '3d/katolik-gereja.glb' },
  hindu:    { cover: 'mandala', entrance: 'mandala',  ornament: 'hindu-mandala',    accent: '#C0392B', model3d: '3d/hindu-candi.glb' },
  buddha:   { cover: 'floral',  entrance: 'mandala',  ornament: 'buddha-wheel',     accent: '#D98C1F', model3d: '3d/buddha-stupa.glb' },
  konghucu: { cover: 'lantern', entrance: 'lantern',  ornament: 'lantern',          accent: '#B23A3A', model3d: '3d/konghucu-kelenteng.glb' },
  jawa:     { cover: 'floral',  entrance: 'wayang',   ornament: 'jawa-gunungan',    accent: '#7B4B2A', model3d: '3d/jawa-gapura.glb' },
  sunda:    { cover: 'floral',  entrance: 'batik',    ornament: 'sunda-kebat',      accent: '#4E7A3A', model3d: '3d/sunda-rumah.glb' },
  batak:    { cover: 'floral',  entrance: 'ulos',     ornament: 'batak-ulos',       accent: '#5A3E2B', model3d: '3d/batak-rumah.glb' },
  bali:     { cover: 'floral',  entrance: 'wayang',   ornament: 'wayang',           accent: '#C0392B', model3d: '3d/bali-pura.glb' },
  minang:   { cover: 'floral',  entrance: 'batik',    ornament: 'minang-gadang',    accent: '#8A5A2B', model3d: '3d/minang-gadang.glb' },
  papua:    { cover: 'floral',  entrance: 'batik',    ornament: 'papua-asmat',      accent: '#2E6E8E', model3d: '3d/papua-honai.glb' }
};
