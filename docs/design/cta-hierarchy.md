# Hierarki CTA Landing — Menghapus Redundansi Pemesanan

> **Status:** PANDUAN DESAIN v1.0 — spesifikasi saja, **tidak ada perubahan kode**.
> **Ruang lingkup:** tiga titik CTA pemesanan di atas lipatan (`src/app/page.tsx`):
> (1) header sticky baris 277–282, (2) baris CTA hero baris 300–313,
> (3) CTA `PricingBubble` `src/components/landing/pricing-bubble.tsx` baris 112–122.
> **Masalah:** satu aksi yang sama (membuka `OrderDialog`) diwujudkan oleh 3 tombol dengan 2 label
> berbeda → beban kognitif, dua tombol emas penuh berdampingan, konversi kabur.
> **Token:** mengacu `docs/design/tokens.md`. Spec ini **mengamendemen** bagian CTA di
> `docs/design/hero-pricing-bubble.md` (bubble tetap titik konversi, hanya status hierarkinya dipertegas).
>
> **Referensi:**
> - Material Design 3 — *Buttons* (tingkat emphasis: Filled → Tonal → Outlined → Text, dan prinsip satu aksi utama per konteks): https://m3.material.io/components/buttons/overview
> - Apple HIG — *Buttons* (satu tombol menonjol per layar/region): https://developer.apple.com/design/human-interface-guidelines/buttons
> - NN/g — *Sticky Headers: 5 Ways to Make Them Better* (CTA persisten setelah konten utama lewat): https://www.nngroup.com/articles/sticky-headers/
> - NN/g — *F-Shaped Pattern of Reading on the Web* (urutan baca kiri-atas → bawah): https://www.nngroup.com/articles/f-shaped-pattern-reading-web-content/
> - WCAG 2.2 — 2.4.3 Focus Order, 2.5.8 Target Size (Minimum), 1.4.11 Non-text Contrast: https://www.w3.org/WAI/WCAG22/Understanding/

---

## 1. Analisis redundansi

| # | Titik | Label saat ini | Aksi | Gaya | Diagnosis |
|---|---|---|---|---|---|
| C1 | Header sticky (`page.tsx:277`) | "Pesan Undangan" | `openOrder()` | **Filled emas** | Duplikat aksi C3; menjadi primer emas kedua di viewport |
| C2 | Hero baris CTA (`page.tsx:301`) | `content.hero.cta_primary` = "Jelajahi Demo" | `#catalog` | Filled emas | Ini navigasi (bukan konversi) tapi memakai nada primer |
| C3 | Hero baris CTA (`page.tsx:307`) | `content.hero.cta_secondary` = "Pesan Undangan" | `openOrder()` | Outline | Duplikat aksi C1 & C4, label beda dari C4 |
| C4 | `PricingBubble` (`pricing-bubble.tsx:114`) | "Pesan Sekarang" | `openOrder()` | Filled emas | **Aksi konversi paling kaya konteks** (harga + promo + urgensi) |
| — | CTA akhir halaman (`page.tsx:529`) | `content.cta.button_text` = "Pesan Undangan" | `openOrder()` | Filled emas | Di luar lipatan; hanya perlu penyeragaman label |

**Temuan:**
1. **Satu aksi, tiga entry point, dua label.** "Pesan Undangan" (C1, C3) dan "Pesan Sekarang" (C4) membuka dialog yang sama → user wajar mengira keduanya berbeda. Ini *redundant link* (NN/g) dan merusak prediktabilitas.
2. **Dua filled-gold berdekatan.** C1 (header) + C4 (bubble) tampil di viewport yang sama saat halaman baru dibuka → tidak ada satu pun yang jelas "primer". Bertentangan dengan MD3/Apple HIG (satu aksi menonjol per region).
3. **C2 salah tingkat.** "Jelajahi Demo" adalah aksi *menjelajah* (sekunder), tapi memakai gaya yang sama dengan aksi *beli* → kontras fungsi hilang.
4. **Bubble adalah pemilik konversi yang benar.** Kedekatan harga/promo/urgensi dengan tombol (efek proksimitas) menurunkan friksi; memindahkan konversi ke sini adalah keputusan paling kuat.

**Kesimpulan:** hapus duplikasi dengan **satu pemilik konversi (bubble)** + **satu CTA eksplorasi (hero)** +
**satu akses persisten yang secara visual lebih tenang (header)**.

---

## 2. Rekomendasi konkret (keputusan)

### 2.1 Matriks keputusan per komponen

| Komponen | Keputusan | Alasan |
|---|---|---|
| **Bubble — "Pesan Sekarang"** | **DIPERTAHANKAN**, menjadi **satu-satunya filled gold (Tier A)** di kolom konten hero. | Memiliki konteks harga/promo/urgensi; isolasi visual (Von Restorff) memusatkan perhatian ke satu aksi bernilai. |
| **Hero — "Jelajahi Demo"** | **DIPERTAHANKAN**, diturunkan ke **Tier B (outline emas)**. | Aksi ini menavigasi ke katalog (`#catalog`); sifatnya *learn more*, bukan *buy* → harus subordinat (MD3 emphasis). |
| **Hero — "Pesan Undangan" (C3)** | **DIHAPUS dari baris hero.** | Duplikat C1 & C4; menyisakan satu tombol di baris hero memperjelas maksud. |
| **Header — "Pesan Undangan" (C1)** | **DIPERTAHANKAN sebagai akses cepat**, diubah ke **Tier C (ghost/text)** selama hero masih terlihat; baru **naik ke Tier A (filled gold)** saat hero/bubble keluar viewport. Label diseragamkan → **"Pesan Sekarang"**. | Tetap memberi jalur konversi persisten (NN/g sticky header), tanpa menyaingi bubble. Pola "CTA muncul saat scroll" lazim di landing SaaS. |
| **CTA akhir halaman** | **DIPERTAHANKAN**, label diseragamkan → **"Pesan Sekarang"**. | Satu-satunya aksi di section penutup; boleh Tier A karena sendirian. |
| **Label (semua entry point)** | **Diseragamkan** menjadi frasa aksi yang sama. | Satu aksi = satu label; menghapus ambiguitas "beda nggak ya?". |

### 2.2 Matriks kondisional (penting — bubble bisa tidak dirender)

Bubble hanya tampil bila `pricing.show_pricing && pricing.base_price > 0` (`page.tsx:315`). Spec harus aman untuk dua kondisi:

| Bubble tampil? | Header | Baris CTA hero | Sumber Tier A |
|---|---|---|---|
| **Ya** | Tier C (ghost) di atas; naik Tier A setelah hero lewat | Hanya outline "Jelajahi Demo" | `PricingBubble` → "Pesan Sekarang" |
| **Tidak** | **Tier A (filled) selalu tampil** | Outline "Jelajahi Demo" | Header (karena tidak ada bubble) |

Aturan turunan: **jangan pernah merender dua Tier A berdampingan di kolom konten yang sama.** Header dianggap *chrome navigasi* → boleh Tier A bersamaan dengan Tier A section (mis. saat CTA akhir halaman), tetapi tidak boleh dua Tier A di dalam satu blok konten.

---

## 3. Hierarki visual

### 3.1 Tiga tingkat emphasis

| Tier | Peran | Gaya | Contoh |
|---|---|---|---|
| **A — Filled (konversi)** | Aksi utama, satu per region | `bg-gradient-to-r from-gold to-gold-strong text-foreground shadow-gold`, `rounded-xl`, `text-sm font-semibold`, ikon `ArrowRight`/`MessageCircle` `aria-hidden` | "Pesan Sekarang" (bubble, header saat post-hero, CTA akhir) |
| **B — Outlined (eksplorasi)** | Aksi sekunder yang terlihat & dapat ditarget | `border border-gold/60 text-gold-deep bg-transparent hover:bg-gold/10`, `rounded-xl`, ikon opsional | "Jelajahi Demo" |
| **C — Ghost/Text (navigasi & utilitas)** | Akses cepat, tidak boleh menyaingi A/B | tanpa isi latar; `text-gold-deep hover:text-gold-ink`, underline saat hover; copy-code pill tetap dashed border | Header pre-hero, link nav, pill salin kode |

> Kontras teks: Tier A `foreground` di atas emas = **6.4:1**; Tier B/C `gold-deep` di ivory = **5.7:1**.
> Jangan pakai `gold`/`gold-strong` untuk teks (≈2.9:1, gagal AA) — hanya border/fill/ikon (`tokens.md` §2.1).

### 3.2 Ukuran, jarak, dan urutan baca

- **Ukuran:** Tier A `min-h-12` (48px) di mobile → `min-h-14` (56px) di `lg`; Tier B `min-h-12`; Tier C `min-h-11` (44px). Tier A boleh lebih besar dari B (perbedaan ≥ 4px) agar hierarki terbaca tanpa warna.
- **Jarak baris hero:** pertahankan rhythm yang ada (`mt-9` ke baris CTA, `mt-8` bubble) agar tidak menggeser layout; gap antar tombol (bila kelak ada dua) minimal `gap-3` (12px).
- **Urutan baca desktop (kiri→atas→bawah, F-pattern):** kicker → H1 → subtitle → **"Jelajahi Demo" (B)** → **bubble: harga → promo → "Pesan Sekarang" (A)**. Aksi utama sengaja **terakhir** di kolom (prinsip "last action = next step", sudah dipakai `hero-pricing-bubble.md` D5).
- **Mobile (1 kolom):** baris CTA → bubble tepat di bawahnya. Hanya satu Tier A terlihat (bubble) + satu Tier B (demo).

### 3.3 Wireframe

**Desktop ≥1024px (post-hero: header naik Tier A)**
```
┌──────────────────────────────────────────────────────────────┐
│ ◉ Prasha   Demo Template  Cara Kerja  Fitur  FAQ   [ Pesan Sekarang ]│ ← Tier C di atas, Tier A setelah hero
├──────────────────────────────────────────────────────────────┤
│  Undangan Digital Pernikahan                                 │
│  Merayakan cinta,                                             │
│  [selamanya indah]                                            │
│  Subtitle…                                                    │
│                                                               │
│  ┌───────────────────┐                                        │
│  │  Jelajahi Demo →  │  ← TIER B (outline) — aksi eksplorasi  │
│  └───────────────────┘                                        │
│  ┌──────────────────────────────────────┐                     │
│  │ MULAI DARI      ◈ Diskon 10%          │ ← bubble            │
│  │ Rp 199.000   Rp 179.100               │                     │
│  │ ┌──────────────────────────────────┐  │                     │
│  │ │  ◈ Gunakan kode: WEDDING2026     │  │ ← Tier C (pill)     │
│  │ └──────────────────────────────────┘  │                     │
│  │ ◷ Berakhir dalam …                     │                     │
│  │ ┌──────────────────────────────────┐  │                     │
│  │ │      Pesan Sekarang →            │  │ ← TIER A (satu-satunya)
│  │ └──────────────────────────────────┘  │                     │
│  └──────────────────────────────────────┘                     │
└──────────────────────────────────────────────────────────────┘
```

**Mobile <1024px (header pre-hero hanya brand; nav link disembunyikan)**
```
┌──────────────────────────────┐
│ ◉ Prasha            Pesan    │ ← Tier C (ghost, akses cepat). Naik Tier A setelah hero lewat
├──────────────────────────────┤
│   (kicker, H1, subtitle)     │
│ ┌──────────────────────────┐ │
│ │   Jelajahi Demo →        │ │ ← TIER B, full-width
│ └──────────────────────────┘ │
│ ┌──────────────────────────┐ │
│ │ MULAI DARI               │ │
│ │ Rp 199.000               │ │
│ │ ┌──────────────────────┐ │ │
│ │ │  Pesan Sekarang →    │ │ │ ← TIER A, w-full (bubble sudah w-full)
│ │ └──────────────────────┘ │ │
│ └──────────────────────────┘ │
└──────────────────────────────┘
```

---

## 4. Perilaku mobile vs desktop

| Aspek | Desktop (≥1024px) | Mobile (<1024px) |
|---|---|---|
| Header CTA | Tier C ghost; naik Tier A (`filled`) setelah hero keluar viewport | Teks pendek "Pesan Sekarang" (Tier C) / filled saat post-hero; `min-h-11` agar target tetap 44px |
| Nav header | Tampil (Demo Template, Cara Kerja, Fitur, FAQ) | Disembunyikan (seperti sekarang) — **jangan** tambah hamburger di iterasi ini (tambah CTA = tambah bising) |
| Baris CTA hero | Ikon + tombol sejajar, rata kiri | Tombol `w-full` (satu tombol saja) agar area tap lebar |
| Bubble | `max-w-sm`, rata kiri mengikuti kolom | `w-full max-w-sm mx-auto`, CTA `w-full` |
| CTA sticky/bottom bar | Tidak perlu — header Tier A post-hero cukup | **Tidak menambah bottom bar.** Header Tier A post-hero berfungsi sebagai CTA persisten. |
| Safe area | — | Jika kelak menambah bottom bar, gunakan `env(safe-area-inset-bottom)`; **tidak** untuk versi ini |
| Tinggi header | tetap `h-16` saat CTA berganti Tier → **tidak boleh layout shift** | sama |

**Aturan reveal header (jika memakai pola naik-tier):**
1. Gunakan `IntersectionObserver` pada `<section>` HERO; saat HERO tidak lagi berpotongan (keluar viewport) → `isPostHero = true`.
2. Transisi gaya Tier C → Tier A maksimal 200ms; dibungkus `@media (prefers-reduced-motion: no-preference)`.
3. Tombol **tidak boleh berpindah fokus** dan **tidak boleh autofocus** saat muncul.
4. Saat tersembunyi dari tab order (jika ada state hidden), jangan pakai `opacity-0` saja — gunakan `visibility:hidden` + `aria-hidden="true"` + `tabIndex={-1}` agar tidak menjadi *focusable but invisible* (WCAG 2.4.3/2.4.7).
5. Bila bubble tidak dirender, **lewati** pola naik-tier: header langsung Tier A.

---

## 5. Copywriting

| Lokasi | Sebelum | Sesudah (rekomendasi) | Catatan |
|---|---|---|---|
| Header | "Pesan Undangan" | **"Pesan Sekarang"** | Frasa aksi; pendek & mobile-safe |
| Hero sekunder | "Pesan Undangan" | **DIHAPUS** | — |
| Bubble | "Pesan Sekarang" | **"Pesan Sekarang"** (tetap) | Sudah benar |
| Hero primer | "Jelajahi Demo" | **"Jelajahi Demo"** (tetap) | Aksi berbeda (navigasi) → label berbeda itu benar |
| CTA akhir | "Pesan Undangan" | **"Pesan Sekarang"** | Seragam dengan entry point lain |
| Judul dialog | "Pesan Undangan Digital" | tetap | Konteks tujuan, bukan label tombol |

**Prinsip label:**
- **Satu aksi = satu frasa** — semua yang membuka `OrderDialog` memakai "Pesan Sekarang".
- **Bedakan aksi yang berbeda** — "Jelajahi Demo" / "Lihat Demo" / "Lihat Detail" / "Preview" tetap unik (lihat `demo-card.md` §5).
- Hindari diksi pasif/ambigu ("Selengkapnya", "Klik di sini").
- `content.hero.cta_secondary`, `content.cta.button_text`, dan default header adalah **teks yang dapat diubah admin** (`src/lib/settings.ts:183–219`). Perubahan label di atas adalah **nilai default yang disarankan**; saat implementasi, sinkronkan default settings agar tidak ada entry point yang tetap berbunyi "Pesan Undangan".

---

## 6. Aksesibilitas (WCAG 2.2 AA)

- **Tidak ada dua tombol primer berdampingan:** satu Tier A per region konten. Header (chrome) boleh mengulang Tier A saat section lain kehilangan CTA.
- **Target sentuh (2.5.8):** Tier A 48–56px, Tier B 48px, Tier C 44px, minimal; jarak antar target ≥ 8px.
- **Urutan fokus (2.4.3):** DOM = visual. Urutan tab aktual: brand → nav (desktop) → header CTA → **"Jelajahi Demo"** → pill salin kode (bubble) → **"Pesan Sekarang"** (bubble) → section berikutnya. Perhatikan: tombol header mendahului konten hero (sesuai posisi visual) — jangan mengubah urutan DOM demi gaya.
- **Kontras (1.4.3/1.4.11):** Tier A teks `foreground` di gradien emas ≥ 6.4:1; Tier B/C `gold-deep` ≥ 5.7:1; ring fokus `--ring` ≥ 5.7:1 dan `outline-offset:2px` tidak terpotong `overflow-hidden` bubble.
- **Bukan hanya warna (1.4.1):** hierarki tetap terbaca bila warna dimatikan — Tier A memiliki isi latar + bayangan, Tier B border, Tier C tanpa latar; plus ukuran berbeda.
- **Elemen tersembunyi** tidak boleh *focusable* (`visibility:hidden` + `aria-hidden` + `tabIndex={-1}`), atau cukup tidak dirender.
- **Reduced motion:** transisi Tier C→A dan `scale` hover dimatikan pada `prefers-reduced-motion: reduce` (sudah menjadi pola `globals.css`).
- **Screen reader:** tombol header dan bubble punya nama aksesibel yang sama ("Pesan Sekarang") → tidak membingungkan; ikon panah `aria-hidden`.

---

## 7. Checklist keputusan (siap eksekusi engineer)

1. [ ] **Hapus** tombol `content.hero.cta_secondary` ("Pesan Undangan") dari baris CTA hero (`page.tsx:307–312`).
2. [ ] **Ubah** tombol hero "Jelajahi Demo" (`page.tsx:301–306`) dari filled gold → **outline** (`border border-gold/60 text-gold-deep hover:bg-gold/10`), tetap `min-h-12 lg:min-h-14`.
3. [ ] **Pertahankan** `PricingBubble` "Pesan Sekarang" sebagai satu-satunya **filled gold** di hero; tidak ada perubahan visual pada bubble.
4. [ ] **Ubah** tombol header (`page.tsx:277–282`): label → "Pesan Sekarang".
   - [ ] Jika bubble dirender: mulai sebagai **Tier C (ghost)**, naik ke Tier A saat HERO keluar viewport (`IntersectionObserver`).
   - [ ] Jika bubble tidak dirender (`!show_pricing || basePrice <= 0`): **Tier A selalu**.
5. [ ] **Seragamkan** CTA section akhir (`page.tsx:529–534`) → label "Pesan Sekarang".
6. [ ] **Sinkronkan default** `src/lib/settings.ts`: `hero.cta_secondary` tidak lagi dipakai di hero; `cta.button_text` → "Pesan Sekarang" (teks admin tidak dipaksa berubah saat runtime, cukup default).
7. [ ] **Header height tetap** `h-16` saat pergantian Tier — verifikasi tidak ada layout shift.
8. [ ] **A11y pass:** target ≥ 44px, urutan tab di atas, kontras Tier A/B/C, `visibility` saat tombol nonaktif, reduced-motion.
9. [ ] **Verifikasi visual** di 375px / 640px / 1024px / 1280px: hanya satu filled-gold terlihat per viewport konten; bubble tidak menutupi kolase; header tidak berkedip saat transisi.

---

## 8. Kenapa bukan alternatif lain

- **Biarkan header filled selalu + hapus bubble CTA** → melemahkan konversi karena CTA kehilangan konteks harga/promo (proksimitas).
- **Hapus tombol header sepenuhnya** → kehilangan akses persisten untuk user berintensi tinggi setelah scroll (NN/g sticky header).
- **Samakan semua tombol jadi filled** → semakin boros; melanggar satu-primer-per-region.
- **Ganti "Jelajahi Demo" jadi filled dan bubble jadi outline** → menempatkan nada primer pada aksi *eksplorasi*, bukan *konversi*; bertentangan dengan tujuan bisnis.
