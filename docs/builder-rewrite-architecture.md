# Rencana Arsitektur — Rombak Builder Undangan (Puck + Model Elementor)

> Status: **KEPUTUSAN FINAL** (siap dieksekusi bertahap; POC dulu sebelum sentuh produksi).
> Pengganti: dokumen ini menggantikan draft awal bernama sama.
> **Fase 0 (POC) selesai & terverifikasi** — lihat bagian 9.

---

## 1. Tujuan & Kriteria

| # | Kriteria | Bobot |
|---|---|---|
| K1 | Visual undangan "memanjakan" (tipografi, spasi, animasi nyata) | Tinggi |
| K2 | Dekor/aset bebas: upload PNG (no-bg), penempatan fleksibel, bisa dianimasikan | Tinggi |
| K3 | Alur editing jelas, logic teratur, minim bug, file tidak monolitik | Tinggi |
| K4 | Guest output tetap SSR + SEO/OG + cepat | Kritis |
| K5 | Bisa dikerjakan bertahap, biaya/waktu wajar | Sedang |

---

## 2. Baseline (yang sudah benar)

- **Model data**: `CanvasData { theme, settings, blocks[], flow, stickers }` di `project_designs.canvas_data` (JSONB).
- **Render parity**: komponen React yang sama dipakai builder & guest (`blocks.tsx` + `BlockView.tsx`).
- **State**: Zustand + zundo (undo/redo) + autosave debounce.
- **Masalah**: file monolitik (`blocks.tsx` 2.609, `properties-panel.tsx` 2.846), dekor cuma SVG garis, animasi dibatasi, fitur bagus tersembunyi.

**Kesimpulan:** yang perlu diganti adalah lapisan *editing*, bukan fondasi render.

---

## 3. Keputusan Final

| # | Keputusan | Catatan |
|---|---|---|
| D1 | **Engine: Puck** (`@puckeditor/core`) | Undangan lama boleh dibuang (belum publish) |
| D2 | **Model kanvas: WeddingPress/Elementor** | Flow `Section/Container → Column → Widget`; **Absolute opsional per elemen** (bukan kanvas bebas) |
| D3 | **Animasi: entrance + loop** | Framer Motion + Lottie; belum perlu timeline editor |
| D4 | **Template: mulai baru** | Template baru dibuat menyesuaikan kemampuan builder baru |
| D5 | **Responsive: satu desain + CSS** | Bukan editing per-breakpoint |

### Kenapa Puck cocok
Puck pada dasarnya **sama konsepnya dengan Elementor**: `content[]` = flow vertikal, drag-drop dari panel, fields = Content/Style/Advanced, ada viewport. Jadi kita tidak melawan engine; kita mengikutinya, lalu menambah:
- **Absolute opsional per elemen** (mirip tab `Advanced → Positioning → Absolute`) via custom field + `react-moveable`.
- **Decor/sticker** (PNG no-bg, animasi loop) via custom field.

---

## 4. Arsitektur Usulan

```
src/puck/
  config.tsx                # Config<Props> { components, root }
  fields/
    PositionField.tsx       # Absolute opsional + drag handle (react-moveable)
    ColorField.tsx          # warna section/tema
    FontField.tsx           # Google Fonts
    AssetField.tsx          # upload Supabase Storage + background-removal
    DecorField.tsx          # dekor/sticker + animasi loop
  overrides/                # kustomisasi UI Puck (opsional)
  editor.tsx                # <Puck> (client)
  render.tsx                # <Render> + config server-safe (RSC)

src/blocks/                 # komponen undangan presentational (dipakai Puck & guest)
  hero/Hero.tsx
  couple/Couple.tsx
  gallery/Gallery.tsx
  ... (migrasi bertahap dari blocks.tsx)

src/lib/canvas/
  schema.ts                 # Props kontrak blok + tipe Puck Data
  defaults.ts               # defaultProps per blok
```

**Prinsip:**
1. **Satu sumber komponen.** Blok tetap komponen React kita; Puck membungkus dengan `fields` + `render`. Guest pakai `<Render>` dengan config server-safe.
2. **Data disimpan** tetap di `project_designs.canvas_data` (JSONB) berisi Puck `Data`. Tidak perlu tabel/kolom baru.
3. **Absolute opsional**, bukan default. Default layout flow; elemen bisa di-set absolute + offset/z-index.
4. **Config split client/server** bila komponen memakai hooks (RSVP/Countdown/CheckIn) → `"use client"` per komponen, dirender via config server-safe.

---

## 5. Dependensi Baru

| Paket | Fungsi |
|---|---|
| `@puckeditor/core` | Editor + `<Render>` SSR |
| `react-moveable` (+ `react-selecto`) | Drag/resize/rotate untuk elemen absolute & dekor |
| `@imgly/background-removal` | Hapus background gambar → PNG transparan |
| `lottie-react` | Animasi vektor siap pakai (loop/dekor) |

Framer Motion & dnd-kit sudah ada.

---

## 6. Roadmap Implementasi (bertahap, rollback aman)

- **Fase 0 — POC** (branch, tanpa produksi): pasang Puck, bikin 3 komponen (Hero, Couple, RSVP) + `render.tsx` SSR + `PositionField` (absolute via moveable). Buktikan round-trip edit→simpan→render.
- **Fase 1 — Blok inti**: pindahkan komponen ke `src/blocks/*` satu per satu (mulai Hero, Couple, Countdown, EventDetail, Gallery, RSVP), dengan test per blok.
- **Fase 2 — Fields & aset**: `AssetField` (upload + no-bg), `DecorField` (sticker + animasi loop), `ColorField`/`FontField`.
- **Fase 3 — Integrasi**:
  - Route `/builder/[id]` → `<Puck>` baru.
  - Route `/[slug]` → `<Render>` (ganti GuestRenderer) tetap SSR + RPC.
  - Autosave + publish membaca/menulis Puck `Data`.
- **Fase 4 — Template baru**: buat 3–5 template awal memakai builder baru.
- **Fase 5 — Bersih-bersih**: hapus jalur lama (`builder-store`, `blocks.tsx`, `properties-panel.tsx`) setelah parity tercapai.

**Rollback:** tiap fase di branch/PR terpisah; produksi tetap memakai builder lama sampai Fase 3 selesai & teruji.

---

## 7. Risiko & Mitigasi

| Risiko | Mitigasi |
|---|---|
| Puck pra-1.0, API berubah | Bungkus di `src/puck/*`; batasi ketergantungan ke 1 lapis |
| Guest SSR ikut berat | Config server-safe; komponen interaktif `"use client"` terpisah |
| Kehilangan fitur lama | Checklist parity per blok sebelum hapus jalur lama |
| Absolute bikin layout berantakan | Default flow; absolute opsional & dibatasi pada elemen |
| Upload/no-bg berat di client | Kompres dulu (`browser-image-compression` sudah ada), jalankan no-bg on-demand |

---

## 8. Referensi Teknis (terverifikasi)

- Puck `@puckeditor/core` 0.23.0 (MIT) — `@measured/puck` 0.20.2 nama lama.
- `<Render>` mendukung RSC; `<Puck>` hanya client. Config harus split client/server bila blok memakai hooks.
- Data model Puck: `{ root: { props }, content: [...], zones: {...} }`.
- Viewport: iframe same-origin (360/768/1280), bisa dimatikan (`iframe.enabled=false`).
- Custom field, UI overrides, plugin tersedia untuk `PositionField`/`DecorField`.

---

## 9. Fase 0 — HASIL POC (selesai, terverifikasi)

**Tujuan POC:** buktikan Puck + Next 16/React 19 jalan, custom field "Absolute" berfungsi,
dan `<Render>` SSR menghasilkan HTML. **Semua tercapai.**

### File yang dibuat
```
src/puck/
  types.ts                 # Position + props kontrak (Hero/Couple/Rsvp)
  config.tsx               # Config<POCProps> + root + defaultProps
  editor.tsx               # <Puck> (client) + pratinjau <Render>
  render.tsx               # <Render> dari @puckeditor/core/rsc (server-safe)
  sample.ts                # Data contoh
  fields/PositionField.tsx # custom field absolute + react-moveable (dynamic, ssr:false)
src/blocks/
  shell.tsx                # BlockShell: flow vs absolute
  Hero.tsx / Couple.tsx / Rsvp.tsx
src/app/puck-poc/page.tsx       # route editor
src/app/puck-poc/ssr/page.tsx   # route pembuktian SSR
```

### Bukti verifikasi
| Uji | Hasil |
|---|---|
| `tsc --noEmit` | ✅ 0 error |
| `npm run build` | ✅ sukses; `/puck-poc`, `/puck-poc/ssr` terdaftar |
| Editor Puck termuat | ✅ panel Blocks/Outline, undo/redo, viewport, Publish |
| Preview iframe | ✅ 3 section (Hero/Couple/Rsvp) ter-render |
| Custom PositionField | ✅ toggle + mini-kanvas + target react-moveable |
| Round-trip field→data→render | ✅ toggle Absolute → wrapper blok jadi `position:absolute; left:60px; top:60px` |
| SSR `<Render>` (`/rsc`) | ✅ konten ada di HTML server (curl), tanpa error |
| Lint | ✅ tidak menambah error (tetap 11 error/52 warning pra-existing) |
| Test | ✅ 212 passed / 2 failed (2 gagal pra-existing) |

### Catatan teknis penting (temuan POC)
1. **`Config<Props>` butuh `id` di setiap props** pada `Data` (tipe `ComponentData` mewajibkan `id`). Sample data harus menyertakan `id`.
2. **`PositionField` wajib `'use client'` + `next/dynamic` (`ssr:false`)** untuk `react-moveable`, agar config tetap aman dipakai `@puckeditor/core/rsc`.
3. **Blok POC sengaja tanpa hook** supaya config RSC-safe; blok interaktif (RSVP benar-benar submit) nanti dipisah sebagai client component.
4. **Puck preview memakai iframe** — konten ada di dalam iframe (bukan `document`), perlu diperhitungkan saat menargetkan elemen untuk overlay drag nanti.
5. Import CSS `@puckeditor/core/puck.css` di client component berhasil di Next 16.

### Dependency baru terpasang
`@puckeditor/core@0.23.0`, `react-moveable@0.56.0`, `react-selecto@1.26.3` (peer React 19 OK).

### Rekomendasi lanjut (Fase 1)
Mulai pindahkan blok asli satu per satu ke `src/blocks/*` (Hero → Couple → Countdown → EventDetail → Gallery → RSVP), dengan `PositionField` disempurnakan agar drag di **dalam iframe preview** (bukan hanya mini-kanvas) — sesuai temuan #4.

---

## 10. Fase 1 — HASIL (selesai, terverifikasi)

**Tujuan:** blok inti nyata + tema di tingkat root + field warna. **Tercapai.**

### Yang ditambahkan
- **Tema root** (`Data.root.props`): `primary`, `secondary`, `background`, `text`, `fontHeading`, `fontBody`. Root render mengisi CSS var `--color-*` / `--font-*` + `<link>` Google Fonts dinamis.
- **`ColorField`** (custom field): swatch + input hex + label.
- **Blok baru** di `src/blocks/`: `Countdown` (client, timer real, anti hydration-mismatch), `EventDetail` (array acara), `Gallery` (array gambar).
- **Config diperluas**: 6 komponen (Hero, Couple, Countdown, EventDetail, Gallery, Rsvp) + root fields.
- **Test baru**: `src/blocks/blocks.test.tsx` (6) & `src/puck/config.test.ts` (4).

### Bukti verifikasi
| Uji | Hasil |
|---|---|
| `tsc --noEmit` | ✅ 0 error |
| `npm run build` | ✅ sukses |
| Test baru | ✅ 10/10 lulus |
| Suite penuh | ✅ 222 passed / 2 failed (2 pra-existing) |
| SSR `/puck-poc/ssr` | ✅ Countdown, EventDetail, Gallery, CSS var tema, link font ada di HTML server |
| Editor | ✅ 6 blok di panel; panel root menampilkan 4 color field + 2 select font |
| Preview iframe | ✅ 6 section; `--color-primary=#3B5BA5`; font Jost aktif; tanpa error |

### Catatan
- Blok memakai `var(--color-*)` / `var(--font-heading)` sehingga perubahan tema langsung terlihat.
- `Countdown` dirender tanpa nilai waktu saat SSR (mulai dari 0) lalu hidup di client — aman dari hydration mismatch.
- **Belum** dikerjakan di fase ini: drag elemen di dalam iframe preview (masih drag pada mini-kanvas field), upload aset + no-bg, animasi entrance/loop, integrasi Supabase.

### Fase 1 lanjutan — Drag di kanvas (selesai, terverifikasi)
- **`ComponentOverlay`** (`src/puck/overrides/ComponentOverlay.tsx`): override `componentOverlay` Puck. Saat komponen terpilih, drag bebas menggeser elemen.
- Drag pertama otomatis mengubah **flow → absolute tanpa lompat** (hitung posisi dari `getBoundingClientRect` relatif `.poc-canvas`), lalu update `position` via `dispatch({ type: 'setData' })` imutabel (`src/puck/overrides/position-utils.ts`).
- **Iframe preview dimatikan** di editor (`iframe={{ enabled: false }}`) agar koordinat/event seragam & context Puck tersedia di overlay. **Trade-off:** style isolation hilang (Tailwind parent bisa bocor). Dapat diaktifkan kembali nanti dengan overlay portal ke dokumen iframe.
- **Bukti:** blok Hero di-drag → `.poc-canvas` memiliki elemen `position:absolute; left:60px; top:40px; width:430px`; panel kanan menampilkan "Absolute position — Posisi Hero" aktif. Test `position-utils` 5/5.
- **Catatan kosmetik:** outline seleksi (layer overlay Puck terpisah) belum mengikuti elemen yang sudah dipindah — perlu dipoles (render bingkai pada elemen terpilih, bukan layer statis).

### Fase 1 — SELESAI (13 blok + animasi)
- **13 blok** di `src/blocks/`: Hero, Couple, Countdown, EventDetail, Story, Gallery, Quote, Maps, GiftList, Divider, Thanks, Envelope, Rsvp.
- **Animasi entrance** (`fade`/`slide`/`zoom`/`none`) di `BlockShell` via Framer Motion `whileInView` (`viewport.once`), field per blok.
- **Field**: position (custom), entrance (select), array (EventDetail/Story/Gallery/GiftList/Envelope), warna/font di root.
- **Test**: blocks (6) + blocks-extra (7) + config (4) + position-utils (5).
- **Bukti**: SSR `/puck-poc/ssr` memuat semua blok; editor menampilkan 13 blok; 0 error runtime.

---

## 11. Audit Dependency & Kualitas (selesai)

### Dependency
`npm audit` awal: 1 critical (`next` 16.0.0–16.3.2, RCE) + 2 high (`sharp`, `js-yaml`).
**Diperbaiki:** `next@16.3.5`, `sharp@0.35.4`, `js-yaml` patch.
**Hasil akhir: `found 0 vulnerabilities`.**
Catatan lingkungan: filesystem FUSE membuat `npm install` gagal `rename`; solusi = `--package-lock-only` + reinstal bersih `node_modules`.

### Kualitas kode (setelah Fase 1)
| Pemeriksaan | Hasil |
|---|---|
| `tsc --noEmit` | ✅ 0 error |
| `npm run build` | ✅ sukses |
| Test suite | ✅ 234 passed / 2 failed (2 pra-existing: `templates`, `check-in`) |
| Lint | ✅ 0 error/warning baru (tetap 11 error/52 warning pra-existing) |
| `npm audit` | ✅ 0 vulnerabilities |

### Utang teknis tercatat
1. Outline seleksi belum mengikuti elemen yang dipindah (layer overlay Puck terpisah).
2. Iframe preview dimatikan → style isolation hilang.
3. 2 test pra-existing merah (`templates.test.ts` deep-clone, `check-in.test.tsx`).
4. 11 lint error pra-existing (bukan dari kode baru).

---

## 12. Fase 2 — Fields & Aset (SELESAI, terverifikasi)

- **`AssetField`**: unggah gambar (kompres via `browser-image-compression`) → Supabase Storage bila sudah login, fallback data URL untuk POC. Dipakai di Hero (`Gambar Latar`) & Gallery (`images[].url`).
- **`DecorField`** + **`DecorLayer`**: dekor bebas posisi di kanvas (PNG transparan): `x/y/width/rotation/opacity/zIndex` + animasi loop (`float`/`pulse`/`spin`) via Framer Motion. Dekor disimpan di `root.props.decor`.
- Utilitas murni `src/puck/lib/decor-utils.ts` + test.
- **Bukti**: SSR memuat dekor (`/stickers/rose-left.svg`, `rose-right.svg`); editor menampilkan panel "Dekor Kanvas" + tombol "+ Tambah dekor" + upload; 2 dekor ter-render di kanvas.
- **Test & gate**: 239 passed / 2 failed (pra-existing); `tsc` 0; build sukses; lint 0 baru; `npm audit` 0 vuln.

### Fase 2 — ditunda
- **Hapus background otomatis** (`@imgly/background-removal`): butuh paket + model dari CDN; ditunda agar tidak menambah berat/instalasi berisiko. Pengguna tetap bisa unggah PNG transparan sendiri.

---

## 13. Fase 3 — Integrasi (SELESAI, terverifikasi)

- **Adapter format** `src/lib/canvas/puck-format.ts`: `isPuckData` (deteksi `{root,content}` vs `{blocks,theme}`), `emptyPuckData`, `extractCoupleTitle`. + test.
- **Autosave Puck** `src/puck/hooks/use-puck-autosave.ts`: debounce 300ms tulis ke `project_designs.canvas_data`; `savePuckNow`. + test (mock Supabase).
- **Editor** `src/puck/PuckBuilder.tsx`: verifikasi akses, muat desain, deteksi format lama (fallback kanvas kosong + banner), header (judul, status simpan, publish, preview), `<Puck>` + `ComponentOverlay`.
- **Guest** `src/puck/PuckGuest.tsx`: `<Render>` RSC untuk data Puck.
- **Route**:
  - `/builder/[id]` → **engine Puck** (default). Legacy via `?legacy=1` atau `NEXT_PUBLIC_PUCK_BUILDER=0` (`_legacy-builder.tsx` disimpan).
  - `/[slug]` → **deteksi format**: Puck → `<PuckGuest>`, lama → `GuestView`. SSR + RPC tetap. Metadata mendukung kedua format.
- **Bukti**: `tsc` 0; build sukses; route `/builder/[id]` merender Puck (header + 13 blok, 0 error) pada mode demo; unit test adapter + autosave.

### Gate kualitas (setelah Fase 3)
| Pemeriksaan | Hasil |
|---|---|
| `tsc --noEmit` | ✅ 0 error |
| `npm run build` | ✅ sukses |
| Test | ✅ 246 passed / 2 failed (2 pra-existing) |
| Lint | ✅ 0 error/warning baru (11/52 pra-existing) |
| `npm audit` | ✅ 0 vulnerabilities |

### Catatan
- Upload aset sudah mencoba Supabase Storage saat login; fallback data URL untuk POC/demo.
- Belum diuji end-to-end dengan sesi login nyata (butuh kredensial Supabase). Logika diuji unit + render.
- Outline seleksi & iframe-ON masih utang kosmetik.

---

## 14. Fase 4 — Template baru (SELESAI)

- **4 template Puck** di `src/lib/templates/puck.ts` (type-safe `PuckData`): `ivory-gold`, `emerald-botanical`, `midnight-rose`, `terracotta-boho` — masing-masing tema + dekor + blok lengkap.
- **Template picker** di `PuckBuilder`: muncul otomatis saat kanvas kosong, atau via tombol "Template". Remount Puck via `key` saat ganti template.
- **Flip dekor**: `DecorItem.flipX/flipY` + toggle "Balik H/V" di `DecorField`; `DecorLayer` menerapkan `scaleX/scaleY` (rotasi sudah ada sebelumnya).

## 15. Fase 5 — Bersih-bersih (SELESAI kecuali 1 alur)

### Selesai
- **Katalog 100% Puck**: `src/lib/templates/index.ts` bersumber dari `src/lib/templates/puck.ts`; **semua 43 JSON template lama + index.json dihapus** (folder `templates/` kini kosong).
- **Landing & detail** render template Puck: `TemplatePreview` dan `TemplateDetail` memakai `<Render>` (bukan `GuestRenderer`). Terverifikasi via curl: `/` dan `/templates/ivory-gold` → 200 + konten.
- **Create project** menyimpan data Puck (`emptyPuckData()` bila tanpa template); `getTemplate` mengembalikan `PuckData`.
- **Demo store** tidak lagi bergantung template lama.
- **Route `/builder/[id]`** kini **Puck-only** — `_legacy-builder.tsx` & opsi `?legacy=1` dihapus (panel membingungkan tak bisa diakses lagi).
- Test lama yang usang dihapus (`templates.test.ts`, `quick-styles.test.ts`); `security-guardrails.test.ts` disesuaikan.

### Belum (dipindah ke Fase 6)
- Uji end-to-end `/edit/[token]` dengan sesi/token nyata (butuh migrasi 0021 diterapkan).

### Migrasi edit-token (selesai)
- **RPC baru** `supabase/migrations/0021_share_edit_save.sql`: `get_design_by_share_token` & `save_design_by_share_token` (security definer, validasi token) → pemegang link edit bisa memuat & menyimpan tanpa login.
- **Server actions** `loadDesignByShareToken` / `saveDesignByShareToken`.
- **`PuckBuilder` mode `editToken`**: muat/simpan via token, sembunyikan Publish/Template, badge "Mode Link Edit".
- `/edit/[token]` kini memakai `PuckBuilder` (bukan builder lama).
- **Builder lama DIHAPUS total**: `builder-workspace`, `properties-panel`, `elements-sidebar`, `builder-canvas`, `music-preview`, `image-crop-tool`, `color-picker`, `save-template-dialog`, `use-autosave`, `_legacy-builder`. (Sisa `builder-store` + `inline-edit` + `canvas-sticker-layer` masih dipakai renderer guest lama.)

### Gate
`tsc` 0 · build sukses · **233 passed / 1 failed** (sisa 1 pra-existing `check-in.test.tsx`) · lint turun ke 56 (10 error/46 warning) · `npm audit` 0.

> ⚠️ Terapkan migrasi `0021` (atau `apply_all.sql`) agar mode Link Edit berfungsi.

## 16. Fase 6 — Polish & QA (SELESAI)

- **Test hijau penuh**: 235/235 passed (sebelumnya 1 merah `check-in.test.tsx` — assertion usang diperbaiki).
- **Lint turun** 63 → 55 (9 error/46 warning; semua sisa pra-existing: login, page refs, hero-3d `@ts-nocheck`).
- **Galeri Carousel** (embla-carousel): varian `grid`/`carousel` di blok Gallery.
- **Daftar Tamu persisten** (menggantikan andalan localStorage):
  - Migrasi `0022_guests.sql` tabel `guests` + RLS owner.
  - Actions `listGuests/addGuests/deleteGuest`.
  - Komponen `GuestListPanel` (tambah massal, link personal `?to=Nama`, WhatsApp, hapus) di `/invite/[projectId]`.
- **Skrip migrasi sekali jalan**: `supabase/reset.sql` (drop schema public + bucket) dan `supabase/install.sql` (= reset + apply_all 0001..0022). README diperbarui.

### Catatan
- `apply_all.sql` yang dijalankan ulang di DB lama memicu `policy ... already exists` → gunakan `install.sql` (reset dulu) atau `reset.sql` + `apply_all.sql`.
- Paket animasi/aset terpasang: `lottie-react`, `canvas-confetti`, `embla-carousel-react`, `react-fast-marquee`.

### Sisa opsional (tidak menghambat)
- Opsi iframe preview (style isolation) + outline seleksi mengikuti elemen.
- Hapus background otomatis (`@imgly/background-removal`).
- Migrasi `demo-store` ke format Puck (masih legacy `CanvasData`).
- Paket aset dekor/ornamen baru.

---

## 17. Audit tampilan & logic + opsional (lanjutan)

### Bug ditemukan & diperbaiki (pembaca format lama yang tak menangani Puck)
- `components/dashboard/project-card.tsx` — nama pasangan tak muncul untuk undangan Puck → kini deteksi `isPuckData`.
- `app/(app)/dashboard/page.tsx` — thumbnail bg Hero tak terisi untuk Puck → ditangani.
- `app/api/og/route.ts` — OG image tak membaca tema/nama Puck → ditangani.
- `app/invite/[projectId]/page.tsx` — `religion` tak terbaca untuk Puck → ditangani.
- Hapus `src/lib/thumbnail.ts` (mati, bergantung builder-store lama).
- Perbaiki test usang `check-in.test.tsx` (assertion "QR personal tamu").

### Opsional dikerjakan
- **Blok "Teks Berjalan"** (`RunningText`, react-fast-marquee) masuk kategori Dekorasi.
- **`religion`** jadi field root (preset ucapan konsisten).
- **Demo mode** builder kini langsung memuat template `ivory-gold`.
- **Galeri Carousel** (embla) — sudah dari fase 6.

### Ditolak/ditunda (dengan alasan)
- **Hapus background otomatis** (`@imgly/background-removal`): paket + model besar dari CDN; berisiko di lingkungan ini. User tetap bisa unggah PNG transparan.
- **Iframe preview / outline tracking**: butuh overlay portal ke dokumen iframe — ditunda (kompleks, kosmetik).

### Migrasi (klarifikasi)
- `apply_all.sql` = 0001..0022 (aman di DB kosong; error `already exists` bila DB sudah ada).
- `install.sql` = `reset.sql` + `apply_all.sql` → **sekali jalan** untuk DB apa pun (destruktif).

### Gate
`tsc` 0 · build sukses · **235/235 test** · lint 55 (9 error pra-existing) · `npm audit` 0.

---

## 17. Fase 6 — Progres (animasi/aset + panel + guest)

### Paket animasi & aset (terpasang)
| Paket | Fungsi |
|---|---|
| `lottie-react@2.4.2` | Animasi Lottie (vektor, loop) sebagai dekor |
| `canvas-confetti` | Confetti saat membuka undangan |
| `embla-carousel-react` | Carousel galeri (siap dipakai) |
| `react-fast-marquee` | Teks/logo berjalan (siap dipakai) |

Rekomendasi lanjutan: `@rive-app/react-canvas` (animasi interaktif), `react-parallax-tilt`, `react-type-animation`, paket ikon/ilustrasi (`react-icons`, `@tabler/icons-react`), aset Lottie gratis (LottieFiles).

### Yang dikerjakan
- **Dekor Lottie**: `DecorItem.kind = 'image' | 'lottie'`; `LottiePlayer` (dynamic import) + pilihan tipe di `DecorField`.
- **Flip dekor** (`flipX/flipY`) — sebelumnya hanya rotasi.
- **Guest Puck**: cover "Buka Undangan" + share bar + confetti saat dibuka (`PuckGuestView`). Settings cover (showCover/greeting/button/style) jadi field root.
- **Panel builder**: kategori blok (Header & Intro / Konten / Media & Lokasi / Interaktif / Dekorasi) agar tidak satu daftar panjang; buang field `musicUrl` yang belum berfungsi.
- **Infra test**: mock `ResizeObserver` (dibutuhkan Puck/@dnd-kit di jsdom).
- `defaultTheme` dipisah ke `src/puck/theme.ts` (modul ringan, hindari tarik config berat).

### Gate
`tsc` 0 · build sukses · 252 passed / 2 failed (pra-existing) · lint baseline · `npm audit` 0.

### Belum (akan dilanjutkan)
- Migrasi katalog landing/dashboard ke template Puck, lalu hapus jalur lama (builder-store, blocks.tsx, properties-panel, `_legacy-builder.tsx`) — menyelesaikan Fase 5. ✅ **SELESAI (lihat bagian 15)**
- Wire `embla-carousel` (galeri) & `react-fast-marquee`.
- Alur: kelola daftar tamu, share/edit link, demo, "undangan jadi" — audit UI/logic menyeluruh.

### Fase 6 — Paritas guest + RSVP fungsional (SELESAI)
- **Guest Puck lengkap**: cover + **musik** + **buku tamu** (`GuestBookWall`) + **absensi QR** (`CheckIn`) + share bar + confetti.
- Field root baru: `musicUrl`, `musicAutoplay`, `musicOffsetSec`, `guestBookEnabled`, `guestBookTitle`, `checkinEnabled`.
- **RSVP fungsional**: blok `Rsvp` kini client component yang benar-benar menyimpan ke tabel `rsvps` (throttle 30s), menerima `projectId` via Puck `metadata`. Di mode demo memakai `demoAddRsvp`.
- Test guest ditambah (cover, checkin).
- **Edit-token** dipindah ke Puck; builder lama dibuang (bagian 15).

### Gate terbaru
`tsc` 0 · build sukses · **234 passed / 1 failed** (sisa `check-in.test.tsx` pra-existing) · lint 56 (10 error/46 warning) · `npm audit` 0.
