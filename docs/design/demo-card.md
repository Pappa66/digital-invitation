# DemoCard — Panduan Desain Kartu Demo Template (Landing)

> **Status:** PANDUAN DESAIN v1.0 — panduan untuk implementasi, TIDAK ada kode di sini.
> **Baris kontrak:** Admin mengatur `demo_image` (URL gambar thumbnail) & `demo_link` (URL demo live) **per template**
> (`TemplateMeta` di `src/lib/types/index.ts` → `templates/index.json`). Landing menampilkan **gambar thumbnail +
> tombol "Lihat Demo"** di kartu katalog (saat ini `src/app/page.tsx` seksi `#catalog`).
> **Referensi:** NN/g — *Cards: UI-Component Definition* (https://www.nngroup.com/articles/cards-component/);
> UC Berkeley — *Accessible card UI component patterns* (https://dap.berkeley.edu/accessible-card-ui-component-patterns);
> Material Design 3 — *Cards* (https://m3.material.io/components/cards/overview).

---

## 1. Flow & matriks state

| Kondisi data template | Media kartu | Tombol | Label tombol | Tujuan |
|---|---|---|---|---|
| `demo_image` ada + `demo_link` ada | thumbnail `demo_image` | **CTA emas** (fokus penuh) | "Lihat Demo" | `demo_link` (tab baru, `rel=noopener`) |
| `demo_image` ada + `demo_link` kosong | thumbnail `demo_image` | **CTA emas** | "Lihat Detail" | `/templates/{id}` |
| `demo_image` kosong (+ `demo_link` opsional) | **render live** `<TemplatePreview canvas>` | **outline** | "Preview" | `/templates/{id}` |
| `demo_image` rusak / gagal load | swap otomatis ke render live `<TemplatePreview>` | sesuaikan tabel di atas | — | tanpa reload |

Aturan main:
1. **Satu aksi utama per kartu.** Jangan bikin seluruh kartu jadi `<a>` pembungkus (wraps link/menu — melanggar bernstein/dap).
   Yang boleh: media sebagai link + tombol sebagai link (sibling), atau cukup tombol + judul link detail. Pilih **pola
   CTA-hanya** (pattern #3 Berkeley) untuk katalog: satu tombol jelas + judul link secondary.
2. **Bitmap `<img>` hanya bila `demo_image` terisi.** Tanpa `demo_image`, gambar live render (SSR-safe, tanpa layanan gambar eksternal).
3. Ukuran grid: 1 kolom (mobile) → 2 (`sm`) → 3 (`lg`), `gap-x-6 gap-y-12` — **jangan ubah rhythm 8pt**.

## 2. Wireframe (ASCII, hierarki & proporsi)

```
┌────────────────────────────────┐  Kartu DemoCard (lebar = kolom grid ± 300–380px)
│ ┌────────────────────────────┐ │
│ │  ▊▊▊▊  (dekorasi ponsel:   │ │  Media — aspect-ratio 3:4, rounded-3xl,
│ │  ▊▊▊▊   notch pill, kecil,  │ │  overflow-hidden, ring-1 ring-foreground/5
│ │  ▊▊▊▊   aria-hidden)        │ │
│ │                             │ │  Gambar: fill, object-cover,
│ │                             │ │  object-position: center 30% (wajah/atas)
│ │                             │ │
│ │  ┌────────────────────────┐ │ │
│ │  │ [ ✿ Classic ]          │ │ │  Badge kategori — kiri atas, glassy
│ │  └────────────────────────┘ │ │
│ │                             │ │
│ │  ░░░░ gradient redup ke     │ │  Overlay: transparan di atas
│ │  ░░░░ bawah (← memberi      │ │  → menghitam di bawah (badge duduk)
│ │  ░░░░ landasan tombol)      │ │
│ └────────────────────────────┘ │
│ ┌────────────────────────────┐ │
│ │ ● ●  Nama Template         │ │  Judul: font-heading heading-sm (18px)
│ │       Deskripsi singkat…   │ │  Desc: body-sm muted, line-clamp-2
│ │ ┌────────────────────────┐ │ │
│ │ │  👁  Lihat Demo         │ │ │  CTA → §5. min-h-11 (44px), select-none
│ │ └────────────────────────┘ │ │
│ └────────────────────────────┘ │
└────────────────────────────────┘
```

Proporsi & rhythm: media = dokumen visual utama (≈ 65% tinggi kartu); isi bawah = nama + 2 baris deskripsi + tombol,
`p-6 pt-5`; jarak antar item bawah `mt-2`/`mt-5` (skala 8pt).

## 3. Rasio & treatment media

- **Rasio kartu: `aspect-[3/4]`** — rasio ponsel horizontal, landing menampilkan "gambar ponsel tegak",
  konsisten dengan bingkai ponsel template (acuan grid MD3 + orientasi perangkat yang diiklankan).
  Untuk kolom ± 300–380px → tinggi media ± 400–507px. Ini bukan rasio ponsel asli (9:16 terlalu
  tinggi untuk grid 3 kolom dan menutup CTA bawah).
- **Gambar:** `<Image fill />` + `object-cover` + `object-center` **default `object-[center_30%]`**
  (komposisi identitas undangan biasanya di sepertiga atas); `loading="lazy"` untuk semua kecuali kartu pertama;
  `sizes="(max-width:640px) 92vw, (max-width:1024px) 46vw, 30vw"`.
- **Overlay gradasi** (wajib, agar badge & teks terbaca dan kartu tidak terlihat "foto mentah"):
  ```
  linear-gradient(180deg,
    rgba(11,8,5,.08) 0%,
    rgba(11,8,5,0) 30%,
    rgba(11,8,5,.45) 72%,
    rgba(11,8,5,.62) 100%)
  ```
  Catatan: kaki overlay tidak pernah lebih gelap dari rgba(…,.62) agar foto pasangan masih tampak;
  jangan tambahkan lapisan emas/gold ke overlay — hanya netral hangat.
- **Dekorasi ponsel (opsional):** notch pill kecil `top-2` tengah, `h-[18px] w-20 rounded-full bg-foreground/90 ring-white/10`,
  `aria-hidden`, `pointer-events-none`.

## 4. Badge kategori

- Posisi **kiri atas media** (menjauh dari tombol skip/logo seperti header landing), `left-3 top-3`.
- Gaya glassy di atas foto:
  `rounded-full border border-white/25 bg-black/40 px-2.5 py-1 text-[10px] font-semibold uppercase tracking-[0.15em] text-white backdrop-blur-sm`
- **A11y:** teks `text-white` (putih murni) di atas `bg-black/40` → kontras ≥ 7:1 bahkan di area cerah foto;
  badge **bukan** sumber informasi tunggal — kategori tetap dibaca dari filter pill di atas grid.
- Bila media memakai render live (latar terang), gunakan varian terang: `border-gold/60 bg-card/90 text-gold-deep`.

## 5. Tombol "Lihat Demo" (gaya golden premium)

Prinsip: tombol **primer emas** hanya ini — satu kartu, satu aksen; jangan tambahkan glow lain di kartu yang sama.

| State | Spesifikasi (token `docs/design/tokens.md` §6) |
|---|---|
| default | `bg-gradient-to-r from-gold to-gold-strong` (token), `text-foreground` (#2B2620, 6.4:1 di atas emas),
`rounded-xl`, `min-h-11` (44px), `px-5`, `text-sm font-semibold`, `shadow-gold`,
highlight atas 1px premium: `shadow-[inset_0_1px_0_rgba(255,255,255,0.28)]`, ikon `Eye` 16px `aria-hidden` |
| hover | `scale-[1.02]` + `shadow-card`; teks tetap `text-foreground` (jangan jadi putih—sub-AA) |
| focus-visible | wrapper global: `outline: 2px solid var(--ring)`, `offset: 2px` (tidak wajib ada di doc ini) |
| active | `scale-[0.98]` |
| disabled (jarang) | `opacity-50 pointer-events-none`, tanpa `shadow-gold` — untuk `demo_link` kosong saat `demo_image` ada tetap ganti label "Lihat Detail" (jangan disable) |
| loading | hanya pada render live pertama: ganti media dengan `Skeleton` (`bg-muted animate-pulse`), tombol tetap siap |

Komposisi akses: teks label selalu berbeda per tujuan (unik) — "Lihat Demo" vs "Lihat Detail" vs "Preview",
sehingga screen-reader user tidak mendengar barisan "Lihat Demo" yang sama (kontras tujuan & referensi Berkeley #3).

## 6. Aksesibilitas (WCAG 2.2 AA)

- **Target sentuh:** tombol & seluruh elemen interaktif ≥ 44×44px (WCAG 2.5.8).
- **Urutan focus:** DOM = visual: judul → deskripsi → tombol; media `pointer-events-none` atau `-1` bila bukan link.
- **Alt:** `alt={`Pratinjau template ${meta.name}`}` (gambar bermakna, bukan `alt=""`).
  Bila gambar murni dekoratif → `alt=""` + `aria-hidden`.
- **Tab baru:** `demo_link` dibuka `target="_blank" rel="noopener noreferrer"`.
- **Reduced motion:** hover `scale` dibungkus `motion-safe:`.
- **Kontras:** badge `white` di glass hitam ≥ 7:1; tombol `foreground` di emas ≥ 6.4:1; judul `foreground` di `card` ≥ 12:1.
- **Keyboard:** tombol = `<a>`/`<button>` native, fokus ring terlihat jelas di atas media & latar kartu.

## 7. Referensi
- NN/g — *Cards: UI-Component Definition*: https://www.nngroup.com/articles/cards-component/
- UC Berkeley — *Accessible card UI component patterns* (pola “Only the call-to-action is clickable”, focus order, redundant links):
  https://dap.berkeley.edu/accessible-card-ui-component-patterns
- Material Design 3 — *Cards* (rasio media & elevation): https://m3.material.io/components/cards/overview
- WCAG 2.2 — 1.4.3, 2.5.8, 2.4.11: https://www.w3.org/TR/WCAG22/