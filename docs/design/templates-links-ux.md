# UX — Template & Tautan

Sumber acuan: **Material Design 3** (card, filter chip), **NN/g** (pagination & recognition-over-recall), **Apple HIG** (target sentuh 44pt). Gaya: satu halaman kerja yang padat, desktop-first di ≥1024, mobile tetap satu kolom. Token ikut `docs/design/tokens.md`.

## 1. Ukuran kartu template
- **Kolom grid**: 375 → 1; 480 → 2; 768 → 2; 1024 → 3; 1280 → 4. Gap 16 (`gap-4`).
- **Thumbnail**: rasio **3:4** (potret, meniru layar ponsel undangan), radius 12. Hapus `h-36` tetap; pakai `aspect-[3/4]` agar tinggi ikut lebar.
- **Max-width halaman**: `max-w-6xl` (1152px) agar 4 kolom ~264px, tidak melebar.
- Tinggi kartu target 320–360px; padding isi 16; badge kategori overlay kiri-atas, tombol Preview overlay kanan-atas.
- Struktur kartu: thumbnail → nama (1 baris, truncate) → kategori (11px) → baris aksi. Tombol: **Pakai** (primary, full) + ikon Edit/Duplikat/Hapus (44×44). Justifikasi: MD3 compact card + affordance aksi jelas.

## 2. List gabungan (seed + kustom)
Satu list, satu model: `{ id, name, category, type: 'bawaan'|'kustom', thumb, visible }`.
- **Filter chip**: `Semua · Bawaan · Kustom · [kategori]` + Search (nama/kategori). Chip `aria-pressed`.
- Setiap kartu punya **satu Switch "Tampil di Landing"** di footer. Simpan per-jenis: seed → `settings.landing_content.template_ids`; kustom → kolom `visible`. Toggle optimistis + toast, bukan tombol "Simpan" terpisah.
- Hapus section terpisah `LandingTemplatePicker`/`Template Saya`; hapus toggle `only_custom` (digantikan filter "Kustom").
- Badge tipe kecil di thumbnail: "Bawaan"/"Kustom".

## 3. Pagination
- **12 per halaman** desktop (4×3), **6** mobile (1×6). Reset ke hal. 1 saat filter/search berubah.
- Posisi **bawah list, rata kanan** (`justify-end`); mobile full-width. Format: `‹ 1 2 3 … n ›`, maks 5 nomor + ellipsis. `aria-label` per tombol, `aria-current="page"` pada aktif.
- Tampilkan "Menampilkan X–Y dari N" di kiri.

## 4. Halaman Tautan — card per undangan
Ganti daftar panjang jadi grid kartu `sm:2 / xl:2` (max-w-6xl).
- **Toolbar**: Search (judul/slug) + filter **status chip** `Semua/Aktif/Kedaluwarsa/Dicabut` + filter **jenis** `Undangan/Absen/Kelola Tamu/Edit`. Chip `aria-pressed`.
- **Card**: judul, `/{slug}`, badge jumlah tautan; baris tautan (ikon, label, URL truncate + `title`, status badge, tombol Salin + Cabut 44px). URL pakai `font-mono text-[11px]`.
- **Empty**: belum ada undangan → ilustrasi + CTA buat undangan. Filter tak cocok → "Tidak ada tautan cocok" + reset filter.
- **Pagination** 6 kartu/halaman, kontrol sama seperti template. Sorting by `updated_at`.

## 5. Optimasi desktop (3–5)
1. Toolbar (Search + chip) sticky di atas, `z-10`, backdrop-blur, agar filter selalu terjangkau.
2. Multi-kolom: template 4 kolom; tautan 2 kolom di ≥1280 — memanfaatkan ruang, mengurangi scroll.
3. Hover jelas (`hover:shadow-card`, `hover:bg-muted`) + `focus-visible:ring-2` untuk navigasi keyboard.
4. Aksi sekunder jadi ikon ber-tooltip agar kartu ringkas; primary tetap label teks.
5. `max-w-6xl` + `gap-4` konsisten; hindari baris terlalu lebar (>80ch).

## Aksesibilitas (WCAG 2.2 AA)
- Kontras teks ≥4.5:1; badge status pakai pasangan warna yang lolos AA.
- Semua target ≥44×44 (`min-h-11`); jaga urutan focus: Search → chip → kartu → pagination.
- Umpan balik Salin via `aria-live="polite"`; Switch punya `aria-label`.
- Jangan hanya warna untuk status — sertakan ikon + teks.
