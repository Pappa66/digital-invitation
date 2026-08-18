# Evaluasi — Digital Invitation Builder vs Elementor (WeddingPress)

> **Jenis:** Riset & laporan evaluasi murni (TANPA perubahan kode produksi).
> **Tanggal:** 19 Agustus 2026
> **Status:** Komparasi fitur, bukan benchmark performa.
> **Sumber:** `README.md`, `SESSION.md`, `docs/execution-plan.md`, `docs/design/tokens.md`,
> `src/components/builder/*`, `src/store/builder-store.ts`, `src/lib/types/index.ts`,
> `src/components/guest/blocks.tsx`, `src/lib/templates/index.ts`, `templates/*.json`.

---

## 1. Ringkasan Eksekutif

Builder ini **SETARA** dengan Elementor/WeddingPress pada *inti editing* (drag-drop,
variasi per blok, undo/redo, duplicate/reorder, preset warna, autosave) dan **LEBIH** pada
*kedalaman domain undangan* (20 blok khusus pernikahan, 44 ornamen SVG, decor layer,
free-drag inner, 39 template lengkap, preset berbasis agama). **KURANG** pada aspek
*komposisi tingkat lanjut* yang justru jadi kuda kerja Elementor: multi-select & batch
action, revision history persisten, section library/komponen tersimpan, responsive editing
per-breakpoint, dan navigator/outline panel.

---

## 2. Cakupan & Metode

- Membaca seluruh dokumen acuan (README, SESSION, execution-plan, design tokens).
- Menelusuri kode sumber (`builder-workspace`, `builder-canvas`, `elements-sidebar`,
  `properties-panel`, `ornaments`, `inline-edit`, `save-template-dialog`, `device-toggle`,
  `builder-store`, `use-autosave`, `blocks.tsx`, `BlockView`, `user-templates`,
  `templates/index.ts`).
- Menghitung angka konkret: jumlah blok, variasi, ornamen, template, kapabilitas store.
- **Tidak ada file aplikasi yang diubah**; hanya dokumen ini yang ditulis.

---

## 3. Inventaris Fitur Eksisting (terverifikasi di kode)

### 3.1 Blok & variasi
| Item | Angka | Bukti |
|---|---|---|
| BlockType | **20** | `src/lib/types/index.ts` — `Hero, Couple, Countdown, EventDetail, Story, Gallery, RSVP, Envelope, Maps, Thanks, Divider, Text, Photo, GiftList, Quote, LiveStreaming, Watermark, Popup, CopyText, Empty` |
| Kategori blok | 5 | `elements-sidebar.tsx` — Header & Intro, Konten, Media, Interaktif, Dekorasi |
| Variasi di sidebar | **54** entri | `elements-sidebar.tsx` (16 blok punya variasi) |
| Variasi tersembunyi renderer | +4 | `blocks.tsx` — EventDetail `band`, Countdown `line`, Couple `side`, dsb. |
| Gallery | 12 variasi | grid, grid3, masonry, carousel, column, mosaic, polaroid, arch, bento, hero-grid, filmstrip, stack |
| Divider | 5 variasi | line, dots, diamond, hearts, leaves |
| Ornamen SVG | **44 unik** / 6 kategori | `ornaments.tsx` — classic (9), outdoor (11), romance (10), modern (7), floral (7), flowers (8) |
| Font Google | ~42 | `properties-panel.tsx` `FONTS` |

### 3.2 Kapabilitas kanvas & edit
| Fitur | Status | Bukti |
|---|---|---|
| Drag-drop blok dari sidebar ke kanvas | ✅ | `builder-workspace.tsx` (DndContext + Widget overload) |
| Sortable stack + free positioning | ✅ | mode `flow: 'stack' \| 'free'` |
| Posisi bebas (free) | ✅ | absolute x/y/width, resize (grip kanan), z-order (forward/back/to-front/to-back) |
| **Free-drag inner** (sub-elemen dalam blok) | ✅ | `InnerDragLayer` — handle emas `data-inner`, snap ke tengah/tepi blok, simpan ke `block.inner` |
| **Decor layer** per blok (shape/teks/gambar/ornamen) | ✅ | `DecorAsset` — x/y/opacity/rotation/flip/layer |
| Inline edit **commit-on-blur** | ✅ | `inline-edit.tsx` — Enter = commit (single-line), Esc = revert, paste teks polos, per-elemen size/font override |
| Copy/paste blok & **copy/paste style** | ✅ | store + toolbar blok |
| Undo/redo (zundo) batch **60 langkah** | ✅ | `builder-store.ts` `limit: 60`, partialize hanya `canvas`, equality by reference |
| Autosave **300 ms** (debounce + abort) | ✅ | `use-autosave.ts` |
| Thumbnail otomatis saat save | ✅ | `thumbnail.ts` html2canvas 420×560 → Storage, upload |
| Preset desain warna/font/mood | ✅ | `getDesignPresets()` → 39 preset, + 8 gradien tetap + 6 gradien turunan tema |
| Toast/save indicator | ✅ | `builder-canvas.tsx` |
| Keyboard shortcut | ✅ | Ctrl+Z/Y/Shift+Z, Ctrl+S, Ctrl+D, Ctrl+C/V, Delete, panah (nudge free), Esc — + popover dokumentasi |
| Device preview | ✅ | 430 px (ponsel) / 768 px (tablet) / 100% (desktop) — label jujur, radiogroup navigable |
| Responsive "sembunyikan per device" | ✅ | `BlockStyle.hideOn` (mobile/tablet/desktop) |
| Cover "Buka Undangan" editable | ✅ | `COVER_BLOCK_ID` virtual di kanvas |

### 3.3 Tema & global
- `Theme` yang diedit: primary/secondary/background/text, font_heading/body, layout,
  hero_style, **frame (9 mode)**, **card_style** (kartu berdampingan), **card_variant (10 gaya
  render)**, card_entrance (5 + none), **ornament global**.
- Preset pose: pindah agama → rombak otomatis wording default (bismillah/closing) tanpa
  menimpa teks kustom (`setReligion`), library kutipan per agama (`QuotePicker`).

### 3.4 Template & komponen tersimpan
| Fitur | Data |
|---|---|
| Template bawaan | **39** JSON + `index.json` (45 meta) di 4 kategori: classic 9, modern 11, outdoor 10, romance 9 |
| Kedalaman template | rata-rata **11,9 blok** (11–13), semua mode `stack`, tidak ada template free-flow |
| Preset desain dari template | 39, termasuk frame/ornament/card_style per template |
| Simpan template user | ✅ `SaveTemplateDialog` → `user-templates.ts` (localStorage `di_user_templates`, kategori "Template Saya") |
| Thumbnail template | ✅ via `captureAndSaveThumbnail` pada project; katalog ditampilkan di modal & halaman templates |

---

## 4. Perbandingan Fitur Inti vs Elementor/WeddingPress

| Fitur standar Elementor/WeddingPress | Status builder ini | Catatan |
|---|---|---|
| Drag-drop (section/widget) | 🟢 **Setara** | Blok-level DnD stack & free. Tidak ada hierarki column/widget — konteks undangan 1 kolom karena itu tidak relevan. |
| Global styles / site settings | 🟡 **Sebagian** | Token global ada (primary/secondary/background/text + 2 font) + 39 preset. **Belum ada sistem Global Colors/Fonts referensial** yang auto-update lintas blok; tiap blok pakai CSS-var tema, override statis. |
| Typography theme | 🟢 **Setara–lebih** | 42 font global + per-elemen override ukuran/jenis per teks. |
| Spacing presets | 🔴 **Kurang** | Padding section input CSS bebas; **tidak ada preset jarak/dimensi global**. |
| Pre-built sections (hero, couple, countdown...) | 🟡 **Sebagian** | Template penuh 39 ada; **tidak ada galeri seksi untuk di-insert ke desain existing**. |
| Widget set | 🟢 **Lebih (domain)** | Elementor butuh plugin tambahan untuk RSVP/amplop/maps/streaming; di sini bawaan. |
| Responsive editing | 🟡 **Sebagian** | Device toggle 430/768/100% + `hideOn`. **Belum ada kontrol per-breakpoint** (padding/font/ukuran per device). |
| Revision history | 🔴 **Kurang** | Zundo 60 langkah **runtime only**; tidak ada snapshot persisten antar sesi. |
| Duplicate / reorder | 🟢 **Setara–lebih** | Tombol, Ctrl+D, drag sortable, z-order di free mode. |
| Undo/redo | 🟢 **Setara** | 60 langkah batch + keyboard. |
| Komponen tersimpan (my templates / saved sections) | 🟡 **Sebagian** | Simpan **halaman penuh** ke "Template Saya". **Belum ada saved-section/block** (insertable single section). |
| Navigator / outline panel | 🔴 **Kurang** | Tidak ada struktur tree blok di sisih; hanya kanvas. |
| Copy/paste style antar elemen | 🟢 **Setara** | `copyStyle`/`pasteStyle`. |
| Custom CSS / HTML | 🟢 **Sengaja dihapus** | Konsisten README: tanpa injeksi HTML mentah (keamanan). |
| Import/export kit (JSON) | 🔴 **Kurang** | Template berupa file repo, **tidak ada UI import/export**. |
| Multi-select & batch actions | 🔴 **Kurang** | Seleksi tunggal; tidak ada lasso/shift-pilih/align/distribute. |
| Animasi masuk | 🟢 **Setara** | 5 entrance + delay + per-blok override (Framer Motion transform/opacity saja). |

**Skor ringkas:** 🟢 setara-lebih = 7 aspek, 🟡 sebagian = 5, 🔴 kurang = 5.

---

## 5. Analisis — Kekuatan & Kesenjangan

### 5.1 Kekuatan nyata (LEBIH dari Elementor generik)
1. **Domain-spesifik widget lengkap** — RSVP (dengan pilihan menu), amplop online,
   gift registry, maps, live streaming, countdown, copy-text rekening, popup prokes.
   Ini persis kebutuhan WeddingPress tanpa plugin tambahan.
2. **Kekayaan visual undangan** — 44 ornamen + decor layer bebas (bentuk/teks/gambar/
   ornamen dengan rotasi-flip-layer) + free-drag inner: kemampuan "menghias" yang lebih
   dalam daripada Elementor untuk konteks undangan.
3. **Katalog template 39 lengkap** (11–13 blok per template) — banyak kompetitor menawarkan
   1–5; dan 39 preset desain bisa diterapkan 1-klik (warna+font+bingkai+ornamen+card style).
4. **Preset berbasis agama** — ganti agama → wording default ikut berubah tapi teks kustom
   dipertahankan; library kutipan bawaan.
5. **Inline edit commit-on-blur** — editing langsung di kanvas tanpa membuka form text;
   undo/redo tetap utuh per perubahan.
6. **Autosave 300 ms + thumbnail otomatis + undo 60 langkah** — kombinasi keamanan edit
   yang rapi untuk tool internal.

### 5.2 Kesenjangan (KURANG vs Elementor)
1. **Tidak ada revision history persisten** — undo hilang setelah refresh; tidak ada
   "Pulihkan versi kemarin".
2. **Tidak ada multi-select/group** — untuk undangan besar (10+ blok) memindahkan/menduplikasi
   beberapa blok sekaligus sangat menyakitkan.
3. **Tidak ada section library / save-block** — hanya template halaman penuh; belum bisa
   "simpan seksi favorit" lalu disisipkan ke undangan lain.
4. **Clipboard hanya in-memory** — `copiedBlock` tidak bertahan antar project/sesi.
5. **Responsive masih sempit** — hanya hide/punahkan; belum ada padding/font/ukuran per breakpoint.
6. **Tidak ada navigator/outline** — navigasi antar blok di undangan panjang kurang cepat.
7. **Style preset per blok belum ada** — variasi render banyak, tapi tidak ada katalog
   "look siap pakai" berupa kombinasi `variant + style + ornamen + font` per jenis blok.

---

## 6. Rekomendasi Fitur (diprioritaskan)

> Prinsip: menambah **kekayaan variasi** (P0) dan **kelancaran komposisi** (P1/P2)
> tanpa melanggar batasan proyek (tanpa HTML mentah, tanpa deps berat, inline edit tetap).

### P0 — Dampak besar untuk "kaya & bervariasi", effort mudah–sedang

**1. Block Quick Styles — galeri "look" per jenis blok**
Katalog look siap pakai per `BlockType` (mis. Hero: 8 look — bingkai tertentu + gradien +
ornamen + tipografi + variant sekaligus). Klik → terapkan ke blok terpilih; tombol
"Simpan sebagai Look" menyimpan kombinasi style ke localStorage. Dampak: variasi visual
langsung berlipat (54 variant × style × 44 ornamen dikemas jadi katalog terkurasi).
Effort: **sedang** (data look + UI grid + action `applyLook(blockId, look)`; semua primitif
store sudah ada).

**2. Section Library + Simpan Seksi/Blok Custom**
Tab/sidebar "Section": galeri seksi pre-built (Hero, Couple, Countdown, Story, Gallery,
RSVP, Envelope, dekor) untuk di-drag langsung ke kanvas di posisi mana pun, plus tombol
"Simpan Seksi" pada blok (atau kumpulan blok) yang terpilih → masuk kategori "Seksi Saya".
Dampak: menutup gap "komponen tersimpan" & "pre-built sections" sekaligus; selaras prioritas
P2-1 execution-plan ("duplicate/save custom block", "drag dari template katalog langsung ke
project"). Effort: **sedang** (data seksi dari template existing yang dipotong, perluas
`user-templates.ts`, UI galeri).

**3. Clipboard persisten lintas project**
Pindahkan `copiedBlock`/`copiedStyle` dari memori Zustand ke `localStorage` per user
(`di_builder_clipboard`), sehingga blok/style bisa ditempel di project lain, atau bahkan
disalin dari dashboard ("Salin ke Project…"). Effort: **mudah** (serialize/deserialize +
UI kecil; `pasteBlock` tinggal dibaca dari storage).

**4. Group multi-select & batch actions**
Mode free: shift+klik atau marquee/lasso untuk memilih banyak blok; aksi batch:
duplicate, delete, align (kiri/tengah/kanan/atas/ralat), distribute jarak, z-order
bersama. Mode stack: shift+klik multi untuk batch duplicate/delete. Dampak: pilar paling
terlihat "UX builder profesional" ala Elementor. Effort: **sedang–keras** (state multi-select,
hit-test lasso di koordinat kanvas, operasi batch snapshot).

### P1 — Dampak sedang–tinggi, effort sedang

**5. Pattern & Background Gallery**
Galeri isian latar: 60+ gradien kurasi, pola SVG berulang (damask, dot, garis tipis, daun,
bokeh, bintang), tekstur halus; klik terapkan ke section, cover, atau hero; simpan preset
favorit. Dampak: keragaman latar yang selama ini manual (CSS bebas). Effort: **sedang**
(asset pola SVG = reusable component, perluas `bgGradient`/`bgImage` picker).

**6. Revision History persisten**
Snapshot `canvas` saat save (bukan tiap keystroke; maks. N=20 versi/project) ke Supabase
(tabel `project_design_revisions` via migrasi baru), panel "Versi" di builder: daftar
waktu + restore + diff kasar (jumlah blok/theme berubah). Zundo tetap untuk dalam-sesi.
Effort: **sedang** (migrasi BE + action + UI; format JSON sudah `canvasToJson`).

**7. Navigator / Outline panel**
Panel struktur daftar blok (ikon tipe, judul utama, indikator `hideOn`, indikator style
override): klik → select + scroll ke blok, drag urutan, aksi cepat duplikat/hapus, filter.
Effort: **mudah** (reuse store & scrollIntoView; murni UI).

**8. Responsive spacing & typography presets**
Preset jarak section (`Padding: Ketat/Santai/Lega`) dan ukuran skala heading yang
menyatu dengan mode preview jujur (430/768/100% sudah ada); pertahankan label jujur
(no pseudo-responsiveness). Effort: **sedang** (token CSS `--section-pad-*`, panel
per-breakpoint).

### P2 — Bonus, effort mudah–sedang

**9. Import/Export template JSON via UI + "mulai dari sebagian template"**
Ekspor canvas ke `.json` (validated), impor dari file; modal "contohkan beberapa blok dari
template lain" (pilih template → centang blok yang dimau → masukkan ke kanvas). Effort:
**sedang** (`validations.ts` sudah ada sebagai gate impor).

**10. Animasi preset pack**
Perpustakaan entrance (staggered list, parallax ornamen, ken-burns hero) + pratinjau
animasi di panel properties; tetap batasan `transform`/`opacity` saja. Effort: **mudah**
(Framer Motion sudah terpasang).

---

## 7. Kesimpulan

> **Builder ini secara fitur SETARA dengan Elementor/WeddingPress pada inti editing**
> (drag-drop 20 blok dengan 54+ variasi, undo/redo batch 60, duplicate/reorder, inline edit,
> preset desain & 42 font, autosave 300 ms) **dan LEBIH pada kedalaman khusus undangan**
> (RSVP/amplop/streaming bawaan, 44 ornamen + decor layer + free-drag inner, preset agama &
> kutipan, 39 template lengkap + thumbnail otomatis).
> **Namun KURANG di aspek yang membuat Elementor produktif untuk komposisi skala besar:**
> multi-select & batch action, revision history persisten, section library/komponen
> tersimpan per-blok, responsive editing per-breakpoint, navigator/outline, dan
> clipboard lintas project.

Rekomendasi fokus: **P0 #1 (Block Quick Styles), P0 #2 (Section Library + Simpan Seksi),
P0 #4 (multi-select/batch), P1 #6 (revision history), P1 #7 (navigator)** — lima ini
menutup hampir seluruh kesenjangan utama dengan effort terkendali dan tanpa melanggar
batasan proyek.