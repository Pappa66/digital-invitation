# Dashboard Polish — Spesifikasi Tampilan & Warna

> **Cakupan:** area `(app)` / admin — shell, dashboard, templates, orders, settings.
> **Bukan** landing publik dan **bukan** undangan tamu.
> **Branch:** `legacy-builder` · **Status:** spec (belum ada perubahan kode)
> **Standar:** WCAG 2.2 AA · **Sumber token:** `src/app/globals.css :root` (single source of truth)

---

## 0. Ringkasan temuan (hasil riset kode)

| # | Temuan | Dampak |
|---|---|---|
| T1 | `docs/design/tokens.md` masih mendokumentasikan emas **v1** (`#C9A45C`, `#B98A3E`) & font Playfair/Great Vibes, sedangkan `globals.css` sudah memakai **emas antique** (`--gold #BFA06A`, `--gold-strong #A9894A`) + `--rose` + Cormorant/Pinyon. | Dua "kebenaran" warna → komponen lama ikut menyalin hex v1. |
| T2 | ~80 hex hardcode di `src/components/dashboard/*` (`#c9a45c`, `#b98a3e`, `#e0d6c2`, …) dan 41 di `src/app/**`. | Warna tidak ikut kalau token berubah; berpotensi gagal kontras. |
| T3 | Teks `text-[#c9a45c]` di atas ivory ≈ **2.2:1** (gagal AA). Contoh: link "Reset filter" (`dashboard-client.tsx:167`), "Lihat Undangan" (`client-management.tsx:231`). | Teks tak terbaca cukup. |
| T4 | CTA `bg-gradient from-[#c9a45c] to-[#b98a3e] text-white` ≈ **2.5:1** (gagal AA). Muncul di `project-card.tsx:150`, `client-management.tsx:168`, `finance-tracker.tsx:197,467,524`, `settings`, `login`, `builder`. | Kontras tombol utama gagal; token sudah menyediakan `--primary-foreground` espresso (5.6:1). |
| T5 | Palet **abu dingin** (`gray-*`) tersebar di kartu/tabel/dialog, bercampur dengan token hangat ivory/espresso. | Dashboard terasa "template lain" dibanding landing. |
| T6 | `ShareDialog` & `MediaLibrary` memakai modal `div fixed` sendiri — tanpa `role="dialog"`, `aria-modal`, focus trap, Escape. | Kegagalan a11y & keyboard. |
| T7 | Target sentuh kecil: pagination `h-7 w-7` (28px) (`dashboard-client.tsx:284`), `IconBtn p-1` (~26px), chip `h-8` (32px). | Di bawah standar proyek 44px (WCAG 2.5.8). |
| T8 | `dashboard-client.tsx` membungkus ulang `min-h-screen bg-background` + `max-w-6xl px-4 py-4` **di atas** `main p-6` dari shell → padding ganda & `min-h-screen` di dalam area scroll. | Ruang terbuang, terutama 375/768. |
| T9 | Cakupan state tidak seragam: dashboard/client/finance punya skeleton+error; `template-manager` hanya teks "Memuat template…"; `orders` pakai spinner, tanpa skeleton. | Pengalaman muat berbeda-beda. |
| T10 | Radius/shadow campur: `rounded-md/lg/xl/2xl` + `shadow-sm/md/lg` vs skala token (`--radius-md`, `shadow-soft/card/dialog`). | Kedalaman & sudut tidak konsisten antar komponen. |

**Prinsip perbaikan (tidak mengubah brand):** nilai brand = token di `globals.css`. Semua hex/abu lama dipetakan **ke token**, bukan sebaliknya. Bila pemilik produk ingin emas v1 persis, ubah **satu tempat** (`:root`) — bukan menyalin hex ke komponen.

### Referensi
- Material Design 3 — *Navigation rail*, *Tabs*, *Cards (elevation/tonal)*: https://m3.material.io/components
- Apple HIG — *Tab bars*, *Sidebars*, *Layout / hit target 44pt*: https://developer.apple.com/design/human-interface-guidelines/
- NN/g — *Empty States*, *Skeleton Screens*, *Confirmation Dialogs*, *Tabs, Used Right*: https://www.nngroup.com/articles/
- shadcn/ui — token & varian: https://ui.shadcn.com/docs/theming · Radix — *Dialog/Tabs a11y*: https://www.radix-ui.com/primitives/docs/overview/accessibility
- WCAG 2.2 — 1.4.3 Contrast, 1.4.11 Non-text, 2.4.7 Focus Visible, 2.4.11 Focus Appearance, 2.5.8 Target Size: https://www.w3.org/TR/WCAG22/
- Pola visual referensi (bukan copy): Mobbin — dashboard SaaS dengan warm-neutral + aksen emas.

---

## 1. Rekonsiliasi & pemetaan token (P0)

### 1.1 Sinkronkan `tokens.md` dengan `globals.css`
`globals.css` adalah sumber resmi (pernyataan di header file-nya). Perbarui `docs/design/tokens.md` §2–§3 agar sama: emas antique, tambahan `--rose`, font Cormorant Garamond / Pinyon Script / Jost. Tanpa ini, kontributor berikutnya akan menyalin hex v1 lagi.

### 1.2 Peta hex/abu → token (berlaku untuk seluruh area dashboard)

| Hardcode lama | Ganti dengan token | Catatan |
|---|---|---|
| `#c9a45c` pada **teks/link/ikon** | `text-gold-deep` (5.7:1) / `text-gold-strong` untuk dekor | jangan `gold` untuk teks |
| `#c9a45c` pada **border/fill** | `gold` | border/pill |
| `#b98a3e` | `gold-strong` | stop gradien, ikon |
| `#c9a45c` / `#b98a3e` pada **gradien CTA + `text-white`** | `bg-gradient-to-r from-gold to-gold-strong` + `text-primary-foreground` | ✱ perbaikan kontras (T4) |
| `#faf7f2` (latar) | `bg-background` | ivory |
| `#4a443c`, `#2b2620`, `#332b23` | `text-foreground` | espresso |
| `#e0d6c2` (border) | `border-border` (halus) / `border-input` (field) | |
| `#8a7a66` | `text-muted-foreground` (6.1:1) | #8a7a66 ≈3.8:1 gagal |
| `#8a6d2f` (hover) | `text-gold-deep` | hover link |
| `text-gray-900` | `text-foreground` | |
| `text-gray-700/600` | `text-foreground` / `text-muted-foreground` | |
| `text-gray-500/400` | `text-muted-foreground` | gray-400 gagal AA |
| `bg-white` | `bg-card` | |
| `bg-gray-50` | `bg-muted` | |
| `bg-gray-100` | `bg-secondary` | |
| `border-gray-100/200` | `border-border` | |
| `border-gray-300` (field) | `border-input` | |
| `divide-gray-200` | `divide-border` | |
| `ring-gray-900` / `focus:border-[#c9a45c]` | andalkan `:focus-visible` global (`--ring`) atau `focus-visible:ring-ring` | satu bahasa fokus |
| `text-red-*` / `bg-red-*` | `text-destructive` / `bg-destructive` (+ `/10`) | |
| `emerald-*` (published/lunas) | token `success` baru (§1.3) atau `gold-deep` bila ingin 100% brand |
| `amber-*` (pending/demo) | token `warning` baru (§1.3) | |
| `blue/purple-*` (stat finance) | token `info` / `accent` brand-netral | hindari 4 hue acak |

### 1.3 Token semantik tambahan (usulan, additive — tidak mengubah brand)
Status butuh makna warna. Tambahkan di `:root`, diselaraskan hue hangat agar tidak "keluar palet":

| Token | Usul nilai | Peran |
|---|---|---|
| `--success` | `150 30% 32%` (#3A6B51, ≥5:1 di ivory) | published, lunas, approved |
| `--success-foreground` | `0 0% 100%` | teks chip |
| `--warning` | `33 45% 38%` (#8A6A35) | pending, draft-demo |
| `--info` | `210 40% 35%` | netral informasi finance |

> Jika menolak token baru: pertahankan emerald/amber **tetapi** wajib dicek AA & dibatasi hanya pada chip status (ikon + teks tetap ada), tidak untuk teks isi.

**Referensi:** MD3 *Color roles* (peran semantik ≠ warna acak); WCAG 1.4.3.

---

## 2. Shell — sidebar, header, spacing, active state, mobile

**Gaya yang dipilih:** *sticky rail + content header* (MD3 navigation rail + Apple HIG sidebar). Alasan: admin banyak konteks, rail lebar 240px stabil di desktop; mobile memakai *bottom tab bar* (Apple HIG) karena ibu jari — ini sudah arah kodenya, tinggal dirapikan.

### Wireframe (≥768px)
```
┌──────────────┬─────────────────────────────────────────────┐
│ [logo] Prasha│  Header  64px  ·  Judul halaman   [profil]  │
├──────────────┼─────────────────────────────────────────────┤
│ ▌ Undangan   │                                             │
│   Template   │   main: max-w-7xl, px-6 py-6, gap 24px      │
│   Landing    │                                             │
│   Kontak     │                                             │
│   Pengaturan │                                             │
│              │                                             │
│ ──────────── │                                             │
│ email        │                                             │
│ Keluar       │                                             │
└──────────────┴─────────────────────────────────────────────┘
       240px
```
Mobile (375): header tipis 56px + bottom tab bar 5 item (68px), `main` `pb-[calc(68px+env(safe-area-inset-bottom))]`.

### Spesifikasi
- **Sidebar:** `w-60` (240px) → `w-64` (256px) agar label tidak wrap; tetap `hidden md:flex`. Item `min-h-11` (44px) — sudah OK.
- **Active state:** `bg-accent text-gold-ink` + indikator kiri 3px `bg-gold-strong`. Pertahankan. Tambah `data-active` agar konsisten, dan pastikan `aria-current="page"`.
- **Active routing bug:** deteksi `pathname === href` tidak menyalakan nav pada subroute (`/templates/[id]`). Ganti ke **longest-prefix match**: `pathname === href || pathname.startsWith(href + '/')`, lalu pilih kandidat dengan `href` terpanjang (agar `/dashboard` tidak ikut aktif saat di `/dashboard/landing`).
- **Header:** naikkan dari sekadar `<h1>`. Susun: judul + deskripsi singkat (opsional) di kiri; aksi halaman (mis. "Buat") di kanan; menu akun (email + Keluar) untuk **mobile** (karena sidebar tersembunyi → saat ini user mobile tidak punya jalan logout — celah fungsional).
- **Mobile top bar baru:** 56px, tombol menu akun `min-h-11 min-w-11`. Bottom nav tetap 5 item, ikon 24, label 11px, `aria-current`, target ≥56×48.
- **Spacing:** hapus bungkus ganda di `dashboard-client.tsx` (T8). `main` shell = satu-satunya padding (`px-4 py-4 sm:px-6 sm:py-6`). Konten dashboard langsung mulai dari Tabs. `max-w` konten: 7xl untuk tabel, 6xl untuk grid kartu.
- **Scroll:** buang `min-h-screen` di dalam `main`; cukup `flex-1`.

### State komponen nav
| State | Gaya |
|---|---|
| default | `text-muted-foreground` |
| hover | `bg-muted text-foreground` |
| focus-visible | ring `--ring` 2px offset 2px (global) |
| active | `bg-accent text-gold-ink`, indikator `bg-gold-strong` |
| disabled | — (tidak ada) |

**Referensi:** MD3 navigation rail; Apple HIG sidebars & tab bars; NN/g *Menu, Where and How*.

---

## 3. Flow utama & state

### Flow: Buat undangan dari dashboard
1. **Awal** — tab *Undangan* aktif; grid/empty state tampil.
2. Klik **Buat** (header) → `NewProjectModal` terbuka (fokus pindah ke field nama; Escape menutup; fokus kembali ke tombol pemicu).
3. **Kosong:** isi nama → klik "Mulai dari Kosong" → tombol `loading` (spinner + "Membuka Builder…") → sukses masuk `/builder/[id]`.
4. **Template:** pilih kategori → pilih kartu → `loading` pada kartu itu → buka builder. Kegagalan → `role="alert"` di bawah field, tombol kembali aktif.
5. **Batal** (Escape/backdrop/Batal) → modal tutup, tidak ada perubahan data.
6. **Validasi:** nama opsional untuk template, tapi bila kosong pakai "Undangan Baru"; tampilkan helper, bukan error.

### Flow: Ubah status publish
1. Kartu project, status `draft` + ikon `GlobeLock`.
2. Pengguna klik aksi "Publish" (ikon) → optimistik: chip berubah ke `published` + spinner kecil selama proses.
3. Sukses → chip `Terbit` (ikon `Globe`). Gagal → chip kembali `draft` + toast error (`role="status"`).
4. **Edge:** klik cepat berulang → tombol `disabled` saat `statusBusy` (sudah ada) + `aria-busy`.

### Flow: Cari/filter undangan
1. Awal: daftar penuh, hitungan "1–8 dari N".
2. Ketik → daftar menyusut live; page reset ke 1.
3. Nol hasil → empty state **"Tidak ada yang cocok"** + tombol "Reset filter" (saat ini link kecil, lihat §9).
4. Filter aktif → tampilkan chip ringkasan + "Reset filter" sebagai **Button ghost** (bukan teks 2.2:1).

**Referensi:** NN/g *Empty States* & *Confirmation Dialogs*; MD3 *Dialogs*.

---

## 4. Kartu undangan (`project-card.tsx`)

**Gaya yang dipilih:** *media card* (thumbnail atas → meta → aksi), konsisten dengan katalog template. Alasan: pengenalan visual undangan paling cepat lewat preview.

```
┌──────────────────────────────┐
│  thumbnail 16:10  (hover Edit)│  rounded-t-2xl
├──────────────────────────────┤
│ Nama Pasangan        [Terbit]│  title 14/600 · chip status 12
│ Nama pasangan / slug · tgl   │  caption muted-foreground
│ [ Edit ] [ Share ] ⋯  (icon) │  aksi 44px
└──────────────────────────────┘
```

- **Radius:** `rounded-2xl` (= `--radius-lg`). **Shadow:** `shadow-soft`; hover `shadow-card` (ganti `shadow-sm/md`).
- **Warna:** ganti seluruh `gray-*` → token. Thumbnail fallback `bg-muted`, teks "Belum ada preview" `text-muted-foreground`.
- **CTA "Edit":** `bg-gradient-to-r from-gold to-gold-strong text-primary-foreground` (bukan `text-white`) — perbaikan AA T4.
- **Aksi sekunder:** `border border-input text-foreground hover:bg-accent`.
- **Ikon:** bungkus `IconBtn` dengan target **44×44** (`min-h-11 min-w-11`) dan `focus-visible:ring-ring`. Ikon `text-muted-foreground hover:text-foreground`; danger `hover:text-destructive hover:bg-destructive/10`.
- **Hierarki aksi:** 1 primer (Edit) · 1 sekunder (Share) · sisanya ikon/overflow. Di mobile, satu tombol `⋯` 44px yang membuka menu (sudah ada) — tambahkan `Escape` + manajemen fokus.
- **Status chip:** lihat §8.

**State kartu**
| State | Gaya |
|---|---|
| default | `bg-card border-border shadow-soft` |
| hover | `shadow-card`, thumbnail `scale-105` (hormati `prefers-reduced-motion`) |
| focus-within | ring pada elemen yang difokus |
| busy | aksi `disabled:opacity-40` + `aria-busy="true"` |
| error | toast sekali; tidak mengubah kartu |

**Referensi:** MD3 *Cards*; NN/g *Cards*.

---

## 5. Tema tab (Undangan / Client / Keuangan)

**Gaya:** *segmented tabs* (Radix Tabs) — sudah ada. Perbaikan agar konsisten & terbaca.

- **Mobile 375:** `TabsList` `w-full`; tiap `TabsTrigger` `flex-1 min-h-11`, ikon di atas label atau label saja bila sesak. Saat ini `h-9` (36px) & `inline-flex` → berisiko sempit/melipat.
- **Desktop:** tinggi 40px, `rounded-lg bg-muted p-1`, trigger aktif `bg-card text-foreground shadow-soft` (token), non-aktif `text-muted-foreground hover:text-foreground`.
- **Indikator aktif** memakai `data-[state=active]` (sudah). Samakan `font-medium`.
- **Konten:** `TabsContent` tanpa `mt-2` tambahan (atasi dengan `gap` container) agar header section tidak "mengambang".
- **Deep-link (opsional, cepat):** `?tab=clients` agar refresh tidak balik ke Undangan.

**State tab:** default / hover / focus-visible (ring) / active / disabled (opacity-50). Keyboard: panah kiri-kanan berpindah tab (bawaan Radix) — pastikan `focus-visible` terlihat.

**Referensi:** NN/g *Tabs, Used Right*; Radix Tabs a11y.

---

## 6. Tabel & daftar (Client, Keuangan, Kontak Masuk)

**Gaya:** *data table* hangat. Bungkus `overflow-hidden rounded-2xl border-border bg-card shadow-soft`; di dalam `overflow-x-auto`.

- Header baris: `bg-muted text-muted-foreground` (ganti `bg-gray-50 text-gray-500`), `text-xs font-medium`.
- Sel: default `text-foreground`; sekunder `text-muted-foreground`; angka `tabular-nums text-right`.
- Baris hover: `bg-accent/40`. Divider `divide-border`.
- **Kontak Masuk** sudah berbentuk kartu (lebih baik untuk mobile) — pertahankan, tapi token-kan warna.
- **Client/Keuangan di 375:** wajib `overflow-x-auto` (finance sudah; **client belum** → perbaikan) atau ubah ke *definition cards* di mobile. Prioritas: `overflow-x-auto` + kolom primer tetap.
- **A11y tabel:** tambahkan `<caption class="sr-only">` dan `scope="col"` pada `<th>`. Untuk elemen yang bisa diklik per baris, sediakan tautan/aksi fokusabel, jangan hanya `tr onClick`.
- **Select status per baris** (client): beri `aria-label` ("Status client {nama}") + target ≥44px.

**Referensi:** MD3 *Data tables*; WCAG 1.3.1 (struktur), 2.5.8.

---

## 7. Dialog & modal

**Aturan:** semua dialog wajib memakai primitif `@/components/ui/dialog` (Radix) agar focus trap, Escape, `aria-modal`, dan restore-focus otomatis.

| Dialog | Aksi |
|---|---|
| `confirm-dialog.tsx` | Sudah pakai `Dialog`. Ganti `bg-gray-900 text-white` → `Button` default (emas+tinta); danger → `variant="destructive"`; `border-gray-300`→`border-border`. Target tombol ≥44px. |
| `new-project-modal.tsx` | Token-kan seluruh `gray-*`/`amber-*`. Header/footer pakai `border-border`; input memakai `Input` + `Label` bersama. Tambah spinner saat `busy`. |
| `share-dialog.tsx` | **Ganti** modal `div fixed` → `Dialog`/`DialogContent` (focus trap, Escape, `aria-modal`, tombol tutup `aria-label`). Token-kan. Tabnya samakan bahasa dengan §5. |
| `media-library.tsx` | **Ganti** ke `Dialog`. Perbaiki: (a) tombol hapus saat ini `<span onClick>` di dalam `<button>` — jadikan `<button>` terpisah, `aria-label="Hapus {nama}"`; (b) `confirm()` native → `ConfirmDialog`; (c) `aria-busy` saat unggah. |
| `stats-dialog.tsx` | Sudah jadi **contoh terbaik** (token penuh, `role=alert`, retry). Cukup naikkan target tombol "Coba lagi" ke 44px. |

Layout dialog: `rounded-2xl` (`--radius-lg`) / hero `rounded-3xl`; `shadow-dialog`; `p-5`/`p-6` kelipatan 4; header `border-b border-border`, footer `border-t`. Lebar: konfirmasi `max-w-sm`, form `max-w-md/lg`, template `max-w-3xl`.

**Referensi:** Radix Dialog a11y; NN/g *Confirmation dialogs*; WCAG 2.4.3 (focus order), 2.1.2 (no keyboard trap).

---

## 8. Status badge (draft/published, client, pembayaran)

Satu komponen badge dengan varian; **selalu ikon + teks** (warna bukan satu-satunya penanda — WCAG 1.4.1).

| Varian | Gaya usul | Ikon |
|---|---|---|
| `published` / `lunas` / `approved` | `bg-success/12 text-success border-success/25` (atau `bg-gold/15 text-gold-deep border-gold/30` bila tanpa token baru) | Globe / CheckCircle |
| `draft` | `bg-muted text-muted-foreground border-border` | GlobeLock |
| `pending` | `bg-warning/12 text-warning border-warning/25` | Clock |
| `rejected` | `bg-destructive/10 text-destructive border-destructive/25` | XCircle |
| `proses` (client) | `bg-warning/12 text-warning` | Loader/Pencil |
| `selesai` | `bg-success/12 text-success` | Check |

Ukuran: `px-2 py-0.5 text-xs`, ikon **12–14px** (sekarang `h-2.5`/10px terlalu kecil). `rounded-full`.

**Referensi:** MD3 *Badges/chips*; WCAG 1.4.1 (jangan andalkan warna).

---

## 9. Form & field

- Gunakan `Input`/`Label` (shadcn) bertoken; hapus pola berulang `border-gray-300 focus:border-[#c9a45c] focus:ring-1`.
- **Default:** `border-input bg-card text-foreground placeholder:text-muted-foreground`.
- **Focus:** `:focus-visible` global (`--ring`, 2px + offset) — jangan ring abu.
- **Error:** border `border-destructive` + teks `text-destructive text-xs` di bawah field + `aria-describedby` + `role="alert"`.
- **Disabled:** `opacity-50 cursor-not-allowed`.
- **Loading:** tombol `disabled` + `Loader2 animate-spin` + label "Menyimpan…". Wajib di template-manager, new-project, client/finance add, payment.
- Tinggi field ≥40px (desktop) / 44px (mobile). Label selalu ada (jangan placeholder-saja).
- Angka uang: `inputMode="numeric"`, tampilkan `formatRupiah` di ringkasan final (finance sudah punya preview — pertahankan).

**Referensi:** NN/g *Form design*; WCAG 1.3.1, 3.3.1, 3.3.3.

---

## 10. State kosong / loading / error (seragam)

Pakai satu bahasa di semua tab:

| Konteks | Komponen | Isi |
|---|---|---|
| **Loading daftar** | `DashboardSkeleton` (kartu) / `TableSkeleton` (tabel) / `StatsSkeleton` (angka) | sudah ada di `ui/skeleton.tsx` |
| **Loading aksi** | spinner dalam tombol | jangan blokir seluruh halaman |
| **Empty (belum ada data)** | ikon bulat `bg-gold/15 text-gold-strong` + judul + 1 baris bantuan + CTA primer | lihat `dashboard-client.tsx:246` |
| **Empty (hasil filter)** | ikon + "Tidak ada yang cocok" + **Button "Reset filter"** | jangan link teks |
| **Error** | `InlineError` (sudah ada) + tombol "Coba Lagi" | `role="alert"` |
| **Error aksi** | toast `role="status" aria-live=polite` (pola `orders`) | styling `bg-foreground text-background` |

Terapkan `TableSkeleton`/`InlineError` yang belum dipakai: `template-manager.tsx` (sekarang teks "Memuat…"), `landing-admin.tsx` (inline sudah), `orders` (ganti spinner teks → skeleton baris).

**Referensi:** NN/g *Skeleton Screens* & *Empty States*.

---

## 11. Responsif (375 / 768 / 1280)

| Breakpoint | Shell | Konten |
|---|---|---|
| **375** (mobile) | header 56px + bottom tab bar 68px; menu akun di header | grid 1 kolom; filter stack (`flex-col`); tab full-width; tabel `overflow-x-auto` atau kartu; dialog `w-full` margin 16px, aksi full-width bila sempit |
| **768** (tablet) | sidebar `w-64` muncul; bottom nav hilang | grid 2 kolom; filter 1 baris; tabel tampil penuh |
| **1280** (desktop) | rail + konten; `max-w-6xl/7xl` center | grid 3–4 kolom; tabel lega; dialog besar `max-w-3xl` |

- Hormati `env(safe-area-inset-bottom)` pada bottom nav.
- Jangan ada scroll horizontal tak sengaja (periksa `client-management` table).
- `prefers-reduced-motion`: matikan `scale` hover thumbnail.

**Referensi:** Apple HIG *Layout*; MD3 *Adaptive layouts*.

---

## 12. Aksesibilitas (WCAG 2.2 AA) — checklist wajib

- [ ] **Kontras:** teks ≥4.5:1 (besar ≥3:1). Ganti `text-[#c9a45c]`→`gold-deep`, `text-gray-400`→`muted-foreground`, CTA putih-di-emas→tinta.
- [ ] **Non-text ≥3:1:** border field & ikon aksi (`gold-strong` bukan `gold` transparan) + `ring` fokus.
- [ ] **Target sentuh ≥44×44px:** pagination, IconBtn, chip, tombol dialog, delete media.
- [ ] **Fokus terlihat:** semua kontrol pakai `:focus-visible` ring; tidak ada `outline:none` tanpa pengganti.
- [ ] **Urutan fokus = visual;** modal men-trap fokus dan mengembalikannya ke pemicu.
- [ ] **Escape** menutup dialog/menu; panah untuk tab/menu.
- [ ] **aria:** `aria-current` nav, `aria-label` ikon, `aria-busy` muat, `role=alert` error, `role=status` toast, `scope="col"` th, `caption sr-only`.
- [ ] **Warna bukan satu-satunya penanda** (status selalu ikon+teks).
- [ ] **Skip link** ke konten utama di shell (opsional, disarankan).
- [ ] Uji keyboard penuh tanpa mouse di 3 breakpoint.

**Referensi:** WCAG 2.2 (daftar di atas); WAI-ARIA Authoring Practices.

---

## 13. Rekomendasi berprioritas

### Quick wins (1–2 hari, dampak besar)
| # | Aksi | File |
|---|---|---|
| QW1 | Ganti `text-[#c9a45c]` → `text-gold-deep` (link/teks) | `dashboard-client.tsx:167`, `client-management.tsx:231,238`, `orders/page.tsx:328` |
| QW2 | CTA emas `text-white` → `text-primary-foreground` | `project-card.tsx:150`, `client-management.tsx:168`, `finance-tracker.tsx:197,467,524`, `settings/page.tsx:146-200` |
| QW3 | Hapus bungkus ganda `min-h-screen/bg-background/px-4 py-4` | `dashboard-client.tsx:141-142,353` |
| QW4 | Target sentuh: pagination & IconBtn ke 44px | `dashboard-client.tsx:284`, `project-card.tsx:274` |
| QW5 | Perbaiki active nav longest-prefix | `(app)/layout.tsx:38,50,88` |
| QW6 | `overflow-x-auto` pada tabel client | `client-management.tsx:202` |
| QW7 | Tambah spinner pada tombol busy | `new-project-modal.tsx`, `client-management.tsx:362`, `template-manager.tsx` |

### Pekerjaan menengah
| # | Aksi | File |
|---|---|---|
| MD1 | Ganti semua `gray-*` dashboard → token (§1.2) | `project-card`, `client-management`, `finance-tracker`, `confirm-dialog`, `new-project-modal`, `share-dialog`, `media-library`, `template-manager`, `landing-admin`, `settings`, `orders`, `templates` |
| MD2 | Satukan radius/shadow ke skala token | semua komponen di atas |
| MD3 | Tambah token `success/warning/info` + komponen `StatusBadge` | `globals.css`, `ui/` |
| MD4 | Ganti modal custom → Radix `Dialog` | `share-dialog.tsx`, `media-library.tsx` |
| MD5 | Seragamkan tabs (mobile full-width, token) | `ui/tabs.tsx`, `landing-admin.tsx`, `dashboard-client.tsx` |
| MD6 | Skeleton/error seragam | `template-manager.tsx`, `orders/page.tsx` |

### Pekerjaan besar
| # | Aksi | File |
|---|---|---|
| BG1 | Sinkronkan `tokens.md` ↔ `globals.css` (warna+font) & jadikan lint warna | `docs/design/tokens.md` |
| BG2 | Ekstrak pola berulang: `PageHeader`, `StatCard`, `StatusBadge`, `SectionCard`, `DataTable` | `components/ui/*` |
| BG3 | Mobile header/menu akun (logout di mobile) + skip link | `(app)/layout.tsx` |
| BG4 | Deep-link tab (`?tab=`) + persist filter | `dashboard-client.tsx` |
| BG5 | Audit menyeluruh CTA emas di luar dashboard (login, builder, edit) | `src/app/**` |

---

## 14. Checklist eksekusi untuk Frontend

**Fondasi**
- [ ] Sinkronkan `tokens.md` dengan `globals.css` (T1/BG1).
- [ ] Putuskan: pakai token emas saat ini (rekomendasi) **atau** ubah `:root` bila ingin emas v1. Satu tempat saja.
- [ ] (Opsional) Tambah token `success/warning/info`.

**Shell** (`(app)/layout.tsx`)
- [ ] Active nav longest-prefix + `aria-current`.
- [ ] Hapus padding ganda; `main` jadi satu-satunya padding; buang `min-h-screen` internal.
- [ ] Header: judul + aksi halaman; menu akun mobile; target ≥44px.
- [ ] Bottom nav: `safe-area-inset`, ikon 24/label 11, target ≥56×48.

**Kartu & status**
- [ ] `project-card`: token warna, radius 2xl, `shadow-soft/card`, CTA tinta, IconBtn 44px.
- [ ] Buat `StatusBadge` (ikon+teks), terapkan di project/client/finance/orders.

**Tabel & form**
- [ ] Client: `overflow-x-auto`, token, `caption`+`scope`, `aria-label` select.
- [ ] Finance: ganti hue stat ke token; status chip token.
- [ ] Semua field → `Input`+`Label`; focus ring global; error `role=alert`; tombol loading.

**Dialog**
- [ ] `confirm-dialog` → `Button` token.
- [ ] `share-dialog` & `media-library` → Radix Dialog (trap/Escape/aria) + hapus `confirm()` native & `span onClick`.
- [ ] `new-project-modal` token + spinner.

**State**
- [ ] Seragamkan skeleton/empty/error di semua tab (template-manager, orders).

**Verifikasi**
- [ ] Uji 375 / 768 / 1280, keyboard-only, dan kontras (cek `gold-deep` vs `background`, tinta vs emas).
- [ ] `prefers-reduced-motion` mematikan animasi hover.
- [ ] Tidak ada hex baru di komponen; semua lewat token.

> Catatan: dokumen ini **spesifikasi**, tidak mengubah kode. Semua temuan merujuk path & baris pada branch `legacy-builder`.
