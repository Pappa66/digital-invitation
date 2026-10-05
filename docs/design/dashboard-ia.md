# Dashboard IA — Hero Verdict, Kartu Aksi, Template & Tautan

> **Branch:** `legacy-builder` · **Status:** spesifikasi desain (tidak mengubah kode)
> **Cakupan:** shell `(app)`, `project-card.tsx`, `template-manager.tsx`, `landing-admin.tsx`,
> `(app)/templates/page.tsx`, `(app)/dashboard/page.tsx`.
> **Standar:** WCAG 2.2 AA · **Token:** `src/app/globals.css :root` (lihat `tokens.md`, `dashboard-polish.md`).
> **Gaya yang dipilih per area** (sengaja berbeda, lihat justifikasi tiap bagian):
> - **Kartu undangan → "focused action card"** (progressive disclosure). Alasan: kartu paling sering dipakai;
>   aksi harian (Edit/Share) harus sekali klik, sisanya tidak boleh bersaing secara visual.
> - **Template → "admin gallery + per-card switch"**. Alasan: objek visual, butuh preview besar + kontrol cepat.
> - **Tautan → "record list / data table dengan status lifecycle"**. Alasan: tautan adalah data tabular dengan
>   masa berlaku & state; bentuk tabel lebih mudah diaudit daripada kartu.
>
> **Referensi:** MD3 *Buttons & Menus* (<https://m3.material.io/components/menus/overview>) · Apple HIG *Menus &
> Context menus* (<https://developer.apple.com/design/human-interface-guidelines/menus>) · NN/g *Progressive
> Disclosure* (<https://www.nngroup.com/articles/progressive-disclosure/>) · NN/g *Confirmation Dialogs* ·
> Radix *DropdownMenu / Switch / Dialog a11y* · WCAG 2.2 (1.4.1, 2.4.3, 2.5.8).

---

## 1. Landing — verdict hero

**Verdict: sudah oke (B+).** Per `landing-polish.md` hero sebelumnya B−; beberapa quick win **sudah terpasang** di
`page.tsx`: skip link (`:275`), header CTA `min-h-11` (`:301`), hero CTA jadi **outline**/Tier B (`:325`), kolase
`aspect-[7/9]` (`:345`). Tidak perlu redesain.

**Sisa 2 perbaikan paling berdampak (prioritas):**

1. **Satu filled-gold per viewport (BG1).** Header "Pesan Undangan" masih filled-gold sekaligus PricingBubble
   "Pesan Sekarang" juga filled — dua aksi primer bertabrakan (`page.tsx:301` + `pricing-bubble.tsx`).
   → Header jadi **Tier C (ghost)** selama hero terlihat, naik Tier A saat hero keluar viewport (`IntersectionObserver`,
   hormati `motion-reduce`). Ref: MD3 *Buttons* emphasis; `cta-hierarchy.md` §2.
2. **Reassurance microcopy di hero.** Belum ada baris penenang di bawah CTA (`page.tsx:322–341`); saat ini hanya
   muncul di CTA penutup (`:570`). → tambah satu baris `text-xs text-muted-foreground`: *"Dibalas via WhatsApp ·
   tanpa akun · revisi 2×"* — tanpa tombol baru. Ref: NN/g *Trust & Credibility*.

*(Opsional, bukan blocker: `title_b` menumpuk gradient + italic + kicker script — kurangi satu treatment.)*

---

## 2. Kartu undangan — IA aksi (`project-card.tsx`)

**Masalah:** 6 ikon sekawanan (`Statistik`, `Salin`, `QR`, `Publish`, `Buka`, `Hapus`) + 2 tombol teks → tidak ada
hierarki, terlihat acak. **Solusi:** 2 aksi bernama + 1 overflow, ikon sekunder masuk menu.

### Hierarki

| Tier | Aksi | Bentuk | Alasan |
|---|---|---|---|
| **Primer** | **Edit** | tombol filled emas (`from-gold to-gold-strong`, `text-primary-foreground`) | aksi tersering; kontras AA (token, bukan `text-white`). |
| **Sekunder** | **Share** | tombol outline `border-input` | task kedua tersering, sejajar wajar. |
| **Overflow "⋯"** | Statistik*, Salin, QR Absen, Publish/Draft, Buka Publik, **Hapus** | menu `DropdownMenu` | sekunder + destruktif; kurangi kepadatan. |
| *Deep-link* | Share → `/links?project={id}` (opsi) | — | menyatukan pengelolaan tautan. |

\* Statistik disembunyikan saat demo mode (sudah ada logika `demo`).

**Satu komponen `DropdownMenu` untuk desktop & mobile** — buang percabangan `hidden sm:flex` vs `sm:hidden`.
Item menu min-h 44px, ikon 16px, item destruktif dipisah divider di bawah, `Hapus` merah.

### Wireframe (satu kartu)

```
┌────────────────────────────────────┐
│ thumbnail (hover → overlay "Edit") │
├────────────────────────────────────┤
│ Nama Pasangan             [● Terbit]│
│ Nama pasangan · 5 Okt 2026          │
│                                     │
│ [  ✎ Edit  ] [ ↗ Share ]        [ ⋯ ]│   Edit=filled · Share=outline · ⋯=ikon outline
└────────────────────────────────────┘

⋯ menu (kanan-bawah kartu):
┌──────────────────────┐
│ 📊 Statistik          │
│ ⧉ Salin              │
│ ▦ QR Absen           │
│ 🌐 Buka Publik       │
│ → Jadikan Draft      │
│ ─────────────────    │
│ 🗑 Hapus              │  ← text-destructive
└──────────────────────┘
```

### State (semua aksi)

| State | Gaya |
|---|---|
| default | primer filled emas; sekunder `border-input text-foreground hover:bg-accent`; overflow `text-muted-foreground` |
| hover | primer `opacity-90`; sekunder `bg-accent`; item menu `bg-muted`; destruktif `bg-destructive/10 text-destructive` |
| focus-visible | ring global `--ring` 2px offset 2px (satu bahasa fokus) |
| active/open | tombol "⋯" `bg-accent` + `aria-expanded="true"` |
| disabled | `opacity-40 pointer-events-none`; saat `statusBusy`/`busy` + `aria-busy` |
| loading | spinner inline pada aksi berjalan (Salin/Hapus), bukan blokir kartu |
| error | toast `role="status"`; state kartu tidak berubah |

**Aksesibilitas:** tiap tombol ikon `aria-label` + `title`; menu pakai `aria-haspopup="menu"` + `aria-expanded`;
Escape menutup & fokus kembali ke tombol "⋯"; target semua kontrol **≥44×44px** (WCAG 2.5.8); `Hapus` & `Salin`
tetap lewat `ConfirmDialog` (Radix).
**Ref:** NN/g *Progressive Disclosure*; Radix DropdownMenu; dashboard-polish.md §4.

**Prioritas:** **P0** (perbaikan visual terbesar, tugas kecil).

---

## 3. Halaman Manajemen Template (`/templates`)

**Perubahan:** `/templates` menjadi rumah tunggal template, dengan **tab internal**. Kontrol "Template yang Tampil
di Landing" **dipindah dari `landing-admin.tsx`** (`:154–181`) ke sini. Landing admin menyisakan "konten landing".

**Struktur halaman:**

```
Template
[ Katalog ] [ Template Saya ]                 (segmented tabs, Radix)
────────────────────────────────────────────────────────────────
Tab "Template Saya" (Kelola)
┌ toolbar ─────────────────────────────────────────────────────┐
│ ⌕ Cari…              Urutkan: [Terbaru ▾]   [+ Kosong] [↑ Impor]│
│ [ Dari undangan ▾ ] [ Buat dari Undangan ]                    │
│ Mode landing: ● Hanya template saya    (switch master)        │
└───────────────────────────────────────────────────────────────┘
Grid kartu (1/2/3 kolom):
┌──────────────────────────────┐
│ [thumbnail preview]           │  ← TemplatePreview
│ Nama Template     [Terbit ⇄]  │  ← switch "Tampil di landing"
│ Kategori                       │
│ [ ✎ Ubah ] [ ⧉ Duplikat ] [ Pakai ] [ ⋯ ]│
└──────────────────────────────┘
```

**Aksi & state**

| Aksi | Kontrol | State/konfirmasi |
|---|---|---|
| Buat kosong | tombol "+ Kosong" | loading spinner; sukses → kartu baru |
| Buat dari undangan | select + "Buat dari Undangan" | disabled bila kosong; error `role="alert"` |
| Impor template lokal | tombol (badge jumlah) | loading; ringkasan sukses/gagal |
| Ubah nama/kategori | inline edit (nama + `select` kategori) | Simpan/Batal; target Batal 44px |
| **Tampil di landing** | **switch/slider per kartu** | optimistic; `role="switch"` + `aria-checked`; gagal → rollback + toast |
| Duplikat | menu/aksi | sukses → kartu "… (Salinan)" `visible:false` |
| Hapus | menu "⋯" | `ConfirmDialog` danger |
| Pakai | tombol | loading → buat project → `/builder/[id]` |

- **Switch** bukan ikon mata: makna "on/off" harus eksplisit (WCAG 1.4.1). Ukuran track 44×24, area sentuh ≥44px.
- **Master switch** = `only_custom` (dulu checkbox di landing admin); deskripsi: *"Sembunyikan template bawaan dari katalog landing."*
- **Search & sort** dipertahankan (`newest`, `name`, tambah `visible`).
- **Thumbnail** wajib konsisten `rounded-2xl`, `shadow-soft`, rasio sama seperti katalog (hindari layout jump).

**State halaman:** loading → `DashboardSkeleton` (bukan teks); empty → ikon + "Belum ada template" + CTA "Template
Kosong"; hasil filter kosong → "Tidak ada yang cocok" + Reset; error → `InlineError` + "Coba Lagi".
**Ref:** MD3 *Switches* & *Cards*; NN/g *Progressive Disclosure*; dashboard-polish.md §10.

**Prioritas:** **P0** (pindahkan kontrol landing + ganti ikon mata → switch).

---

## 4. Halaman Manajemen Tautan (`/links` — nav baru "Tautan")

**Tujuan:** satu tempat mengurus semua tautan per undangan (link publik, tamu `?to=`, kelola tamu `?t=`, absen,
edit) beserta token: salin, atur masa berlaku, cabut.

**Penting:** hanya tautan **bertoken** yang punya masa berlaku & bisa dicabut. Link publik
(`/{slug}`) & link tamu (`/{slug}?to=`) **tidak kedaluwarsa** — hanya bisa disalin. Kelola tamu (`/invite/{id}?t=`)
dan Edit (`/edit/{token}`) ber-token → punya lifecycle penuh.

### Struktur

Master–detail: **kiri** daftar undangan (dengan jumlah tautan aktif), **kanan** daftar tautan undangan terpilih.
Mobile: akordeon per undangan (bukan master-detail).

```
Tautan
┌───────────────────┬─────────────────────────────────────────────────────┐
│ ⌕ Cari undangan   │  Perkawinan Panca & Sena            [ ↗ Buka builder] │
│ ────────────────  │  ┌───────────────────────────────────────────────┐  │
│ ● Panca & Sena  3 │  │ Jenis        Tautan            Status   Aksi   │  │
│ ● Dwi & Nadia   1 │  │ Link undangan /panca-sena     Permanen [Salin] │  │
│ ● Rimba & Sari  0 │  │ Kelola tamu   /invite/…?t=…   Aktif 24j [⋯]   │  │
│                   │  │ Edit          /edit/…         Kedaluwarsa [⋯] │  │
│                   │  │ Absen (QR)    /absen/…        Permanen [QR]   │  │
│                   │  └───────────────────────────────────────────────┘  │
│                   │  [+ Buat tautan kelola tamu]  [+ Buat link edit]     │
└───────────────────┴─────────────────────────────────────────────────────┘
```

Setiap baris punya **menu "⋯"** (bukan deretan ikon) berisi: **Salin**, **Atur masa berlaku** (token aktif),
**Cabut** (token aktif). Link permanen hanya punya **Salin / QR**.

**Atur masa berlaku (modal kecil):** preset `1 jam / 24 jam / 7 hari / 1 bulan` → **Terapkan** (rotate token lama,
tampilkan nilai baru sekali). Deskripsikan konsekuensi: *"Tautan lama langsung berhenti berlaku."*

**Konfirmasi cabut (`ConfirmDialog`, danger):**
> "Cabut tautan kelola tamu?" · *Tautan ini langsung tidak bisa dibuka lagi. Kamu bisa membuat tautan baru kapan saja.*
> [Batal] [Cabut]
> Alasan: pencabutan irreversible & berdampak ke orang lain → wajib konfirmasi eksplisit (NN/g *Confirmation Dialogs*).

### State lifecycle

| State | Visual | Aksi tersedia |
|---|---|---|
| **Permanen** (publik/tamu/absen) | chip netral `bg-muted text-muted-foreground` + ikon `Link2` | Salin, QR |
| **Aktif** (>24 jam) | chip `bg-success/12 text-success border-success/25` + `CheckCircle` | Salin, Atur masa berlaku, Cabut |
| **Segera berakhir** (<24 jam) | chip `bg-warning/12 text-warning` + `Clock` | idem + teks sisa waktu `tabular-nums` |
| **Kedaluwarsa** | chip `bg-muted text-muted-foreground` + `ClockOff`, baris `opacity-70` | Perpanjang (rotate baru), Hapus riwayat |
| **Dicabut** | chip `bg-destructive/10 text-destructive` + `XCircle`, tautan `line-through` | Hapus riwayat |

- Status **selalu ikon + teks**, bukan warna saja (WCAG 1.4.1).
- Waktu relatif ("Sisa 5 jam") + absolut `title`/subteks ("s.d. 20 Okt, 14:00").
- Copy memberi feedback `role="status" aria-live="polite"`: "Tautan disalin."

### State halaman

loading → skeleton baris (table skeleton); empty (belum ada undangan) → ajakan "Buat undangan dulu" ke `/dashboard`;
undangan tanpa tautan token → tampilkan link permanen + CTA buat token; error → `InlineError` + retry.

**Ref:** MD3 *Data tables* + *Menus*; Apple HIG *Context menus*; Radix Switch/Dialog; WCAG 1.4.1, 2.1.2, 2.5.8.
**Prioritas:** **P1** (fitur baru; bergantung API token yang sudah ada: `share-token-actions.ts`, `clientGetInviteAccessToken`).

---

## 5. Shell & navigasi (konsistensi)

- **Sidebar:** `w-64`, item `min-h-11`, active `bg-accent text-gold-ink` + indikator 3px `bg-gold-strong`,
  longest-prefix match & `aria-current` sudah benar (`layout.tsx:40–44`) — pertahankan.
- **Item baru "Tautan"** (ikon `Link2`), urutan:
  `Undangan · Template · Tautan · Landing · Kontak Masuk · Pengaturan`.
- **Mobile bottom nav maks 5 item.** Dengan 6 menu, ubah menjadi:
  `Undangan · Template · Tautan · Kontak · Lainnya`.
  "Lainnya" membuka **sheet** berisi `Landing`, `Pengaturan`, `Keluar` (sekaligus menutup celah logout di mobile).
  Alasan: MD3 navigation bar & Apple HIG tab bar membatasi ~5 tujuan; lebih dari itu terbaca sesak & target mengecil.
- Judul header shell mengikuti label nav (sudah otomatis via `activeItem`).

---

## 6. Responsif & aksesibilitas (singkat)

| Breakpoint | Fokus |
|---|---|
| **375** | Kartu: Edit+Share+⋯ tetap satu baris (ikon) — jangan wrap; menu "⋯" full-width sheet, item 48px. Template grid 1 kolom, toolbar stack, switch tetap ≥44px. Tautan jadi akordeon (bukan master-detail). Bottom nav 5 item, `safe-area-inset`. |
| **768** | Template grid 2 kolom; tabel Tautan tampil; sidebar 256px. |
| **1280** | Template grid 3 kolom; Tautan master–detail 2 kolom; `max-w-7xl` untuk tabel. |

**A11y wajib (WCAG 2.2 AA):**
- Kontras teks ≥4.5:1 — pakai `gold-deep`/`gold-ink` untuk teks, `gold` hanya dekor.
- Target sentuh **≥44×44px**: item menu, switch, tombol "⋯", aksi tabel, pagination.
- Urutan fokus = visual; dialog/menu men-trap fokus, Escape menutup, fokus kembali ke pemicu (Radix).
- `switch` pakai `role="switch"` + `aria-checked` + label; ikon dekoratif `aria-hidden`.
- Status & state tidak pernah hanya warna — selalu ikon + teks.
- Feedback salin/cabut via `aria-live`; error form `role="alert"`.
- Hormati `prefers-reduced-motion` pada animasi menu/sheet.

---

## 7. Prioritas ringkas

| P | Item | Alasan |
|---|---|---|
| **P0** | IA aksi kartu: Edit + Share + overflow "⋯" | perbaikan visual terbesar, kecil |
| **P0** | Pindahkan "Tampil di Landing" ke `/templates`; ganti ikon mata → **switch** | permintaan inti, kejelasan makna |
| **P1** | Tab internal `/templates` (Katalog · Template Saya) + toolbar | rumah tunggal, hapus duplikasi |
| **P1** | Halaman `/links` + nav item "Tautan" + state lifecycle + konfirmasi cabut | fitur baru, API sudah ada |
| **P1** | Mobile bottom nav "Lainnya" (Landing/Pengaturan/Keluar) | 6 menu vs batas 5 |
| **P2** | Deep-link Share → `/links?project=` | konsolidasi alur |
| **P2** | Hero: header Tier C + reassurance microcopy | konversi (lihat §1) |

---

## 8. Checklist FE

**Kartu undangan**
- [ ] Ganti deretan `IconBtn` dengan `[Edit][Share][⋯ DropdownMenu]`.
- [ ] Satu komponen menu untuk desktop & mobile; item ≥44px; divider sebelum Hapus.
- [ ] `aria-haspopup`/`aria-expanded`; Escape + restore focus; `ConfirmDialog` tetap untuk Salin/Hapus.
- [ ] CTA Edit pakai `text-primary-foreground`, bukan `text-white`.

**Template** (`/templates`, `template-manager.tsx`)
- [ ] Tambah tab `Katalog` / `Template Saya`.
- [ ] Pindahkan `template_ids`/`only_custom` dari `landing-admin.tsx` ke tab Template Saya.
- [ ] Ganti tombol eye → `Switch` (`role="switch"`, `aria-checked`, target ≥44px), optimistic + rollback.
- [ ] Thumbnail & radius konsisten; search/sort + opsi `visible`.
- [ ] Loading = skeleton; empty/filter-kosong/error seragam.

**Tautan** (`/links` baru)
- [ ] Tambah `NAV` item "Tautan" (`Link2`) + bottom nav "Lainnya" sheet.
- [ ] Master–detail (desktop) / akordeon (mobile); hanya token yang punya lifecycle.
- [ ] Baris: Jenis · Tautan (truncate) · Status chip (ikon+teks) · Aksi "⋯".
- [ ] Modal "Atur masa berlaku" (preset) + rotate; `ConfirmDialog` untuk "Cabut".
- [ ] Salin dengan feedback `aria-live`; kedaluwarsa/dicabut tampil sebagai riwayat.

**Lintas**
- [ ] Tidak ada hex baru — semua token.
- [ ] Uji keyboard-only & kontras di 375/768/1280.
- [ ] `prefers-reduced-motion` mematikan animasi menu/sheet/hover.

> Dokumen ini spesifikasi; tidak ada kode yang diubah. Path & baris merujuk branch `legacy-builder`.
