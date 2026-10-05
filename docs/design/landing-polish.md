# Landing Polish — Spec Visual & UX (Riset + Rekomendasi)

> **Status:** v1.0 — RISET & SPESIFIKASI. Tidak ada perubahan kode aplikasi.
> **Branch:** `legacy-builder` · **Ruang lingkup:** `src/app/page.tsx`, `src/components/landing/*`,
> token di `src/app/globals.css` + `tailwind.config.ts`, kontrak `docs/design/tokens.md`,
> `docs/design/cta-hierarchy.md`, `docs/design/demo-card.md`, `docs/design/hero-pricing-bubble.md`.
> **Batas aman:** tidak mengubah data, URL, atau logika pesanan (harga/promo/`OrderDialog`/`openOrder`).
> **Gaya yang dipakai:** **"Quiet Luxury Editorial"** — whitespace lega, satu aksen emas per viewport,
> heading serif editorial, script hanya untuk momen emosional, foto sebagai hero (acuan: weddingpress / The Knot
> yang dipakai `tokens.md`, pola high-end landing di Mobbin/Awwwards). **Alasan:** kategori pernikahan premium
> menuntut kesan tenang & mahal, bukan ramai; berbeda dari dashboard (fungsional/padat) dan guest (imersif),
> sehingga landing tidak boleh memakai template visual yang sama.

> **Referensi wajib (dipakai per rekomendasi):** Material Design 3 *Buttons/Cards* · Apple HIG *Buttons* ·
> NN/g *Cards & F-Pattern & Sticky Headers* · WCAG 2.2 (1.4.3, 1.4.11, 2.4.3, 2.4.11, 2.5.8, 2.3.3) ·
> shadcn/ui *theming* · UC Berkeley *Accessible card patterns*.

---

## 0. Ringkasan penilaian

| Area | Nilai | Catatan singkat |
|---|---|---|
| Hierarki section & ritme | B− | Urutan masuk akal; border ganda & panjang katalog sebelum "Cara Kerja" |
| Tipografi & skala | B− | Skala token bagus tapi sering di-*override* hardcode; script berulang di semua kicker |
| Warna & token | B | Palet AA; sisa hex/rgba manual & `green-700`; doc `tokens.md` drift dari `globals.css` |
| Hero | B | Kolom seimbang, tapi 3 CTA emas penuh & kolase tinggi fixed |
| Kartu template | B+ | Mengikuti `demo-card.md`; hover kurang guard motion, 3 aksen sekaligus |
| Trust signals | C+ | Stats tanpa metrik jelas; **belum ada testimoni/garansi** |
| Motion | B− | Bubble aman; banyak `scale`/`translate` tanpa guard reduced-motion |
| Responsif & a11y | B− | Struktur DOM baik; beberapa target < 44px; dialog tanpa Esc/focus-trap |
| Footer & CTA penutup | B− | Label CTA tidak seragam; penutup kurang "menutup"; footer minim affordance |

---

## 1. Hierarki visual & ritme section

### 1.1 Temuan

1. **Border ganda antar-section.** Stats memakai `border-y` (`page.tsx:384`), lalu Katalog menambah `border-t`
   (`page.tsx:398`), disusul 4 section lain masing-masing `border-t` (`495, 518, 540, 555`). Karena latar juga
   bergantian (`background` → `card/50` → `muted/60` → `background` → `muted/60` → `background`), garis-garis ini
   menjadi bising dan membuat ritme terasa "bertumpuk".
   **Dampak:** halaman terasa lebih panjang & kaku dari seharusnya.
   **Rekomendasi:** pilih **satu** sistem pemisah — cukup latar section bergantian (buang mayoritas `border-t`),
   atau cukup border (samakan latar). Prioritaskan mempertahankan pergantian latar yang lembut; sisakan border
   hanya pada transisi ke footer.
   **File:** `page.tsx:384, 398, 495, 518, 540, 555, 575`.
   **Ref:** NN/g *Visual Hierarchy*; MD3 *Surfaces & elevation* (pemisah section lewat tonal surface, bukan garis).

2. **Katalog terlalu panjang sebelum "Cara Kerja".** Maks 9 kartu (`PER_PAGE = 9`, `page.tsx:66`) + pagination,
   baru proses 4 langkah. Pengunjung pertama harus menggulir jauh sebelum paham cara kerja.
   **Dampak:** trust/how-it-works jarang terlihat; friksi keputusan naik.
   **Rekomendasi (prioritas sedang):** urutkan ulang menjadi
   `hero → stats → Cara Kerja → Katalog → Fitur → FAQ → CTA → footer`. Alternatif konservatif (tanpa reorder):
   tampilkan 6 kartu di halaman pertama + CTA "Lihat semua template" (bukan pagination besar di atas lipatan).
   **File:** blok section `page.tsx:397–515`; konstanta `PER_PAGE` `page.tsx:66`.
   **Ref:** NN/g *F-Shaped Pattern* + *Progressive disclosure*.

3. **Varian padding CTA penutup (`py-24 lg:py-32`) lebih besar dari section lain (`py-20 lg:py-24`).**
   Ini **bukan cacat** — penutup memang boleh lebih lega. Pertahankan sebagai pengecualian yang disengaja.
   **Ref:** MD3 *Spacing* (rhythm 8pt, aksen boleh berbeda).

4. **Tidak ada landmark/label untuk nilai statistik** dan tidak ada **skip link**.
   **Dampak:** pengguna keyboard/screen reader harus melewati header + nav.
   **Rekomendasi:** tambah skip link `sr-only focus:not-sr-only` ke `#catalog`; bungkus stats dengan
   `<section aria-label="Pencapaian">`.
   **File:** `page.tsx:273, 383–395`.
   **Ref:** WCAG 2.4.1 Bypass Blocks; NN/g *Skip links*.

### 1.2 Wireframe ritme target

```
CURRENT (garis = border, blok = bg)
  background | HERO (bubble harga)
  ───────────── stats (bg gradient, border-y)
  ───────────── katalog (bg card/50, border-t)  ← 9 kartu + pagination
  ───────────── cara kerja (bg muted, border-t)
  ───────────── fitur (bg background, border-t)
  ───────────── faq (bg muted, border-t)
  ───────────── cta (bg background, border-t)
  ───────────── footer (bg background, border-t)

TARGET (pemisah = tonal surface, border minimal)
  background | HERO
  ░░░░░░░░░░░ stats (surface sekunder)
  ░░░░░░░░░░░ cara kerja (surface sekunder)      ← dipindah ke atas
  ░░░░░░░░░░░ katalog (background)               ← tanpa border
  ░░░░░░░░░░░ fitur (surface sekunder)
  ░░░░░░░░░░░ faq (background)
  ░░░░░░░░░░░ cta (wash emas halus, lega)
  ───────────── footer (border tunggal)
```

---

## 2. Tipografi & skala

### 2.1 Temuan

1. **Drift dokumentasi vs implementasi.** `tokens.md` §3 menyebut heading `Playfair Display` / script `Great Vibes`,
   sedangkan `globals.css:14–16` sudah memakai `Cormorant Garamond` / `Pinyon Script`. `tokens.md` §2.1 juga masih
   mencatat hex lama (`#C9A45C`, `#B98A3E`, `#7C5D2E`), padahal `:root` kini `#BFA06A`, `#A9894A`, `#6E5530`.
   **Dampak:** engineer mengikuti doc mengimplementasikan font/warna yang salah.
   **Rekomendasi (quick win, doc saja):** sinkronkan `tokens.md` §2.1 & §3 dengan `globals.css` sebagai source of truth.
   **File:** `docs/design/tokens.md`.
   **Ref:** shadcn/ui *theming* (satu sumber token); `ai-slop-audit.md` T1 (Cormorant direkomendasikan).

2. **Script `font-script` dipakai di hampir semua kicker section** — "Lihat Demo" (`401`), "Mudah & Cepat" (`498`),
   "Fitur Lengkap" (`521`), "Pertanyaan Umum" (`543`), CTA (`557`), plus hero (`305`).
   **Dampak:** persis temuan `ai-slop-audit.md` T2 — menjadi "stempel" repetitif, hierarki antar-section hilang.
   **Rekomendasi (quick win):** script **hanya** untuk kicker hero + kicker CTA penutup. Section tengah
   (Katalog/Cara Kerja/Fitur/FAQ) pakai eyebrow non-script: `text-label uppercase tracking-[0.2em] text-gold-deep`.
   **File:** `page.tsx:401, 498, 521, 543`.
   **Ref:** `ai-slop-audit.md` T2; MD3 *Typography roles*.

3. **Override hardcode menimpa skala.** H1 hero menulis `lg:text-[3.5rem] lg:leading-[1.08]` (`page.tsx:306`)
   padahal sudah ada token `display-2xl` (clamp 48–72px). Selain itu ada `text-[9px]` (`283`), `text-[8px]` (`586`),
   `text-[10px]` (`615–616`).
   **Dampak:** ukuran tidak responsif mulus & menyimpang dari sistem.
   **Rekomendasi (quick win):** H1 cukup `text-display-xl lg:text-display-2xl`; besaran mikro `8–9px` dinaikkan ke
   `text-label` (11px) agar terbaca (terutama footer & brand mark).
   **File:** `page.tsx:283, 306, 586, 615–616`.
   **Ref:** `tokens.md` §3; WCAG 1.4.4 (Resize text).

4. **Heading monoton `font-medium`.** Semua `display-*` memakai `font-medium`.
   **Rekomendasi (opsional):** beri kontras bobot — `display-lg`+ boleh `font-semibold`, sub-heading kecil tetap
   `font-medium`. Jangan tumpuk italic + gradient + script pada satu heading (itu masalah hero `title_b`).
   **File:** `page.tsx:306–311, 402, 499, 522, 544, 558`.
   **Ref:** `ai-slop-audit.md` T3 & T4.

5. **`text-green-700` bukan token** (order-dialog `217`).
   **Rekomendasi (quick win):** tambah token `--success`/`--success-foreground` di `:root` (Nilai AA) lalu pakai
   `text-success`; alternatif tanpa token: `text-gold-deep` + ikon `CheckCircle`.
   **File:** `order-dialog.tsx:217`, `globals.css:12–63`.
   **Ref:** `tokens.md` §1 prinsip "satu sumber warna".

---

## 3. Hero: keseimbangan kolom, nilai jual, posisi bubble

### 3.1 Temuan

1. **Tiga CTA emas penuh dalam satu viewport** — header "Pesan Undangan" (`292–297`, filled), hero
   "Jelajahi Demo" (`316–321`, filled), bubble "Pesan Sekarang" (`pricing-bubble.tsx:117`, filled).
   **Dampak:** tidak ada satu aksi yang jelas primer → konversi kabur. Melanggar `cta-hierarchy.md` §2.2
   dan MD3/Apple HIG (satu aksi menonjol per region).
   **Rekomendasi (besar):** jalankan `cta-hierarchy.md` §7 — hero CTA jadi **Tier B (outline)**; header
   **Tier C (ghost) pre-hero → Tier A saat hero keluar viewport**; bubble tetap **satu-satunya Tier A**.
   Jika bubble tidak dirender, header langsung Tier A.
   **File:** `page.tsx:292–321`; gate bubble `page.tsx:324`.
   **Ref:** MD3 *Buttons* (emphasis), Apple HIG *Buttons*, `cta-hierarchy.md` §2.

2. **Kolase memakai tinggi fixed `style={{ height: 460 }}`** (`page.tsx:338`).
   **Dampak:** di 375px kolase jadi jangkung & tidak proporsional; pada lebar besar tidak memanfaatkan ruang.
   **Rekomendasi (quick win):** ganti ke rasio intrinsik, mis. `aspect-[7/9]` (atau `min-h` berbasis clamp) pada
   grid, biarkan `fill`/`object-cover` mengatur. Pastikan tetap `min-w-0`.
   **File:** `page.tsx:337–375`.
   **Ref:** MD3 *Layout* (rasio intrinsik), demo-card.md §3 (pendekatan aspect-ratio).

3. **Bubble sudah di kolom teks (benar).** Sesuai `hero-pricing-bubble.md` D1 — jangan diubah posisinya.
   Namun pada desktop urutan visual `CTA hero → bubble`, sementara `cta-hierarchy.md` §3.2 menaruh
   aksi utama **terakhir** (bubble) — ini sudah terpenuhi. **Pertahankan.**

4. **Tidak ada reassurance risk-reducer di hero.** Baris "Dibalas via WhatsApp — tanpa perlu membuat akun"
   hanya muncul di CTA penutup (`page.tsx:570`).
   **Dampak:** pengunjung di atas lipatan masih ragu soal proses.
   **Rekomendasi (quick win, copy saja):** tambahkan satu baris `text-xs text-muted-foreground` di bawah CTA/bubble
   hero ("Dibalas via WhatsApp · tanpa akun · revisi 2×") — **tanpa** menambah tombol, **tanpa** data baru.
   **File:** `page.tsx:322–334`.
   **Ref:** NN/g *Trust & Credibility*; Baymard (microcopy di titik friksi).

5. **Target tombol header < 44px** (`px-4 py-2 text-sm`, ≈36px tinggi).
   **Rekomendasi (quick win):** tambah `min-h-11`, jaga `h-16` header tidak berubah.
   **File:** `page.tsx:292–297`.
   **Ref:** WCAG 2.5.8 Target Size (Minimum); `tokens.md` §7.

### 3.2 Wireframe hero (desktop target)

```
┌───────────────────────────────────────────────────────────────────────┐
│ ◉ Prasha   Demo  Cara Kerja  Fitur  FAQ        [ Pesan Sekarang ]      │ ← Tier C pre-hero
├───────────────────────────────────────────────────────────────────────┤
│  Undangan Digital Pernikahan                                          │
│  Merayakan cinta,                                                     │
│  dalam karya yang abadi.        ┌──────────┬──────────┐               │
│  Subtitle… (max-w-lg)           │          │  img 2   │               │
│                                 │  img 1   ├──────────┤               │
│  ┌────────────────────┐         │ (7/12)   │  img 3   │               │
│  │  Jelajahi Demo  →  │ Tier B  │          │  (5/12)  │               │
│  └────────────────────┘         └──────────┴──────────┘               │
│  ┌────────────────────────────────┐                                   │
│  │ Mulai dari   Diskon 10%        │  ← bubble = satu-satunya Tier A   │
│  │ Rp 199.000  Rp 179.100         │     (di kolom teks, bukan kolase) │
│  │ [ Gunakan kode: … ]            │                                   │
│  │ Pesan Sekarang →               │                                   │
│  └────────────────────────────────┘                                   │
│  Dibalas via WhatsApp · tanpa akun · revisi 2×  ← reassurance baru    │
└───────────────────────────────────────────────────────────────────────┘
```

---

## 4. Kartu template & galeri

### 4.1 Temuan

1. **Hover lift tanpa guard reduced-motion:** `hover:-translate-y-1.5` (`page.tsx:736`).
   **Rekomendasi (quick win):** tambah `motion-reduce:hover:translate-y-0` atau bungkus `motion-safe:`.
   **Ref:** WCAG 2.3.3; `demo-card.md` §6.

2. **Nested radius menyimpang token:** media `rounded-[2rem]` di dalam kartu `rounded-3xl` (`page.tsx:738`);
   `demo-card.md` §3 menetapkan media `rounded-3xl`.
   **Rekomendasi (quick win):** samakan ke `rounded-2xl` (media dalam kartu) agar selisih radius konsisten
   dengan skala `--radius-*`; hapus nilai arbitrer.
   **File:** `page.tsx:738`.
   **Ref:** `tokens.md` §5; `ai-slop-audit.md` S2.

3. **Tiga aksen dalam satu kartu** — nomor ghost `01` (`751–753`), badge kategori ber-border, dan gradient pada CTA
   hover. Persis `ai-slop-audit.md` S3.
   **Rekomendasi (sedang):** kurangi satu aksen — redupkan nomor ghost (`text-muted-foreground/40`, `font-normal`)
   atau hilangkan `hover` gradient pada pill.
   **File:** `page.tsx:744–756`.
   **Ref:** `ai-slop-audit.md` S3; MD3 *Cards* (elevation bukan dekorasi berlapis).

4. **Media tidak bereaksi saat hover** (hanya lift kartu).
   **Rekomendasi (opsional):** `group-hover:scale-[1.03]` pada `<Image>` dengan `motion-safe:`, durasi 300–400ms,
   `overflow-hidden` sudah mencegah luber. Hindari pada kartu `TemplatePreview` live (bisa berat).
   **File:** `DemoCardMedia` `page.tsx:782–816`.
   **Ref:** NN/g *Cards* (micro-interaction memperkuat affordance).

5. **Search: potensi focus ring ganda** — global `:focus-visible` outline + `focus-visible:ring-2` (`page.tsx:416`).
   **Rekomendasi (quick win):** pilih satu; pertahankan outline global, buang `focus-visible:ring-*` pada input
   (atau sebaliknya). Tombol clear `h-8 w-8` (32px) juga < 44px (`page.tsx:419–426`).
   **File:** `page.tsx:416, 419–426`.
   **Ref:** WCAG 2.4.11 Focus Appearance (hindari ring dobel yang mengaburkan batas), WCAG 2.5.8.

6. **Konsistensi kartu tanpa `demo_image`** sudah baik (fallback `<TemplatePreview>` live, rasio sama).
   **Pertahankan.**

---

## 5. Trust signals (stats, testimoni/garansi), "Cara Kerja", FAQ

### 5.1 Temuan

1. **Belum ada testimoni.** Tidak ditemukan komponen/section testimoni di `src/`.
   **Dampak:** trust tertinggi pada kategori jasa premium belum dipakai.
   **Rekomendasi (besar, butuh konten):** tambah section **"Kata Pasangan"** — 2–3 kutipan asli + nama/kota +
   (opsional) foto. **Jangan mengarang data.** Jika konten belum ada, alternatif aman: 3 badge garansi faktual
   dari copy yang sudah ada — "Proses 2–5 hari kerja", "Revisi 2×", "Tanpa akun untuk tamu" — dengan ikon,
   ditempatkan setelah stats atau sebelum CTA.
   **File:** section baru di `page.tsx` (setelah stats ± `page.tsx:395`); sumber copy `settings.ts:190–212`.
   **Ref:** NN/g *Trustworthiness*; Baymard *Social proof*.

2. **Metrik stats ambigu:** "500+ Undangan Dikirim" vs "10.000+ Tamu Hadir" mencampur satuan undangan & tamu,
   dan `value.toLocaleString('id-ID')` merender "10.000+" pada satu baris (bisa pecah di 375px).
   **Rekomendasi (sedang, copy):** seragamkan metrik (mis. "Undangan Terkirim / Tamu Diundang / Template Demo")
   dan pastikan tidak *wrap*; gunakan `tabular-nums`. Angka statis — **jangan** tambah count-up (slop).
   **File:** `page.tsx:383–395`; default `settings.ts:185–189`.
   **Ref:** `ai-slop-audit.md` (hindari dekorasi berlebih); MD3 *Data display*.

3. **"Cara Kerja" belum punya konektor antar langkah** di desktop, sehingga 4 kartu terbaca sebagai daftar
   lepas, bukan alur.
   **Rekomendasi (quick win):** tambahkan garis horizontal tipis `hidden lg:block` di belakang nomor
   (`border-t border-gold/30`) atau panah antar kartu. Ikon & nomor sudah ada.
   **File:** `page.tsx:501–513`.
   **Ref:** NN/g *Process flows*; MD3 *Steppers*.

4. **FAQ: indikator `+` dirotasi 45° = `×`** (`page.tsx:663`) → pengguna mengira itu tombol tutup saat item terbuka;
   animasi memakai `maxHeight` dari `scrollHeight` yang bisa basi saat konten berubah lebar (`page.tsx:665–671`).
   Juga belum ada `aria-controls`/`id`.
   **Rekomendasi (sedang):** ganti ke `ChevronDown` dengan `rotate-180`, animasi `grid-rows-[0fr] → [1fr]`
   (pola Radix Accordion), tambah `id` panel + `aria-controls`. Hormati `motion-reduce`.
   **File:** `page.tsx:651–674`.
   **Ref:** W3C WAI-ARIA APG *Accordion*; Radix/shadcn *Accordion*.

---

## 6. Motion halus (hormati `prefers-reduced-motion`)

### 6.1 Temuan

1. **Banyak `hover:scale` / `active:scale` tanpa guard** pada `page.tsx`: header CTA (`294`), hero CTA (`318`),
   empty-state (`458`), CTA kartu (`700, 714, 727`), submit dialog (`234`). Hanya `PricingBubble` yang sudah
   memakai `motion-reduce:*`.
   **Rekomendasi (quick win):** tambahkan `motion-reduce:hover:scale-100 motion-reduce:active:scale-100`
   (atau ganti ke `motion-safe:hover:scale-[1.02]`) di semua titik tersebut.
   **File:** `page.tsx:234, 294, 318, 458, 700, 714, 727`; `order-dialog.tsx:234`.
   **Ref:** WCAG 2.3.3 Animation from Interactions; `tokens.md` §7.

2. **FAQ `transition-all duration-300`** juga sebaiknya di-guard.
   **File:** `page.tsx:667`.
   **Ref:** WCAG 2.3.3.

3. **Section reveal belum dipakai di landing** meski pola `.js-reveal [data-reveal]` sudah tersedia
   (`globals.css:284–299`).
   **Rekomendasi (opsional/sedang):** aktifkan reveal halus `fade-up` hanya pada blok judul section
   (bukan per kartu) agar tidak terasa berat; sudah otomatis nonaktif saat reduced-motion.
   **File:** `page.tsx` (section heading), `globals.css:284`.
   **Ref:** NN/g *Animation*; pola internal `globals.css`.

4. **Yang sudah benar & jangan diubah:** `pricing-bubble-enter` ter-guard (`globals.css:301–316`);
   countdown tanpa animasi per detik; tidak ada count-up pada stats.

---

## 7. Responsif (375 / 768 / 1280) & aksesibilitas

### 7.1 Temuan

1. **Target sentuh < 44px** di: header CTA (`page.tsx:292`), tombol clear search (`419`), link footer
   (`595–610`, `text-xs` tanpa padding memadai).
   **Rekomendasi (quick win):** `min-h-11` pada header CTA; perbesar hit-area clear search ke 44px; link footer
   `inline-flex min-h-11 items-center` atau naikkan `gap` + `py-2.5`.
   **Ref:** WCAG 2.5.8; `tokens.md` §7.

2. **Kolase tinggi fixed** = risiko proporsi di 375 & 768 (lihat §3.1 no.2).
   **Ref:** MD3 *Adaptive layout*.

3. **Order dialog belum mengelola fokus:** tidak ada trap, tidak ada tombol Esc, fokus tidak dipindah ke dialog,
   konten latar tidak `inert` (`order-dialog.tsx:101–109`).
   **Rekomendasi (besar, a11y):** migrasikan ke Radix Dialog / shadcn `Dialog` (sudah satu ekosistem) atau
   minimal: `Escape` menutup, `autoFocus` ke judul/field pertama, `aria-labelledby`, kembalikan fokus ke pemicu
   saat tutup, dan `inert` pada konten latar. **Tanpa mengubah logika submit.**
   **File:** `order-dialog.tsx:101–109`.
   **Ref:** W3C WAI-ARIA APG *Dialog (Modal)*; WCAG 2.4.3, 2.1.2.

4. **Urutan fokus sudah benar** (DOM = visual: brand → nav → header CTA → hero CTA → copy → order → section).
   **Pertahankan.** Tambahkan skip link (§1.1 no.4).

5. **Kontras** mengikuti `tokens.md` §2 sudah AA untuk teks; yang perlu dijaga: `text-muted-foreground`
   (#6B5E4E, 6.1:1) dan jangan pernah memakai `gold`/`gold-strong` untuk teks (≈2.9:1).
   Perhatikan `order-dialog:132` `hover:bg-gold-deep hover:text-background` — verifikasi ulang ≥4.5:1.
   **File:** `order-dialog.tsx:132`.
   **Ref:** WCAG 1.4.3 / 1.4.11.

### 7.2 Checklist verifikasi viewport

| Lebar | Fokus verifikasi |
|---|---|
| 375 | Kolase tidak jangkung; stats tidak *wrap*; header CTA ≥44px; link footer ≥44px; bubble full-width |
| 768 | Grid katalog 2 kolom rapi; tinggi kolase proporsional; `sm:text-4xl` bubble pas |
| 1280 | Hanya **satu** filled-gold per viewport; kolom hero 1.15fr/0.85fr tidak menabrak; max-w tetap 6xl |

---

## 8. Footer & CTA penutup

1. **Label CTA tidak seragam:** header "Pesan Undangan" (`296`), CTA penutup "Pesan Undangan"
   (`settings.ts:217`, render `568`), bubble "Pesan Sekarang". Satu aksi = satu frasa.
   **Rekomendasi (quick win):** seragamkan semua ke **"Pesan Sekarang"** (ubah default `settings.ts` + header +
   CTA penutup). Teks admin tidak dipaksa berubah saat runtime.
   **File:** `page.tsx:296, 568`; `settings.ts:217`.
   **Ref:** `cta-hierarchy.md` §5; NN/g *Consistency & Standards*.

2. **CTA penutup kurang "menutup"** — latar polos sama seperti section biasa, hanya border pembatas.
   **Rekomendasi (sedang):** beri *wash* gradien emas sangat halus + ruang lega (sudah ada), atau pembatas
   ornamen tipis; **jangan** menambah filled-gold kedua di viewport yang sama.
   **File:** `page.tsx:555–572`.
   **Ref:** MD3 *Surfaces*; `ai-slop-audit.md` (satu gradient emas per viewport).

3. **Footer minim affordance:** link teks kecil, tanpa ikon sosial, tanpa "kembali ke atas", tanpa tautan legal.
   **Rekomendasi (sedang):** tambah ikon Instagram/WhatsApp dengan target ≥44px; baris legal
   (Kebijakan Privasi/Syarat) bila tersedia; tombol "Kembali ke atas" `min-h-11`.
   **File:** `page.tsx:575–619`.
   **Ref:** NN/g *Footer design*; WCAG 2.5.8.

4. **Dead code:** `src/components/landing/pricing-section.tsx` tidak lagi diimpor (harga pindah ke bubble).
   **Rekomendasi:** hapus pada PR terpisah agar tidak membingungkan. **Bukan perubahan visual.**

---

## 9. Prioritas (Quick Wins vs Besar)

### Quick wins (≤30 menit, risiko rendah, tanpa logika/data)

| ID | Aksi | Dampak | File |
|---|---|---|---|
| QW1 | Guard reduced-motion pada semua `scale`/`translate` | Aksesibilitas + kepatuhan | `page.tsx:234,294,318,458,700,714,727,736` |
| QW2 | `min-h-11` header CTA, clear search, link footer | Target sentuh 44px | `page.tsx:292,419,595–610` |
| QW3 | Kolase `aspect-[7/9]` ganti `height:460` | Proporsi 375/768 | `page.tsx:338` |
| QW4 | Seragamkan label CTA → "Pesan Sekarang" | Kejelasan konversi | `page.tsx:296,568`; `settings.ts:217` |
| QW5 | Script hanya di hero + CTA; section lain eyebrow | Hilangkan "stempel" | `page.tsx:401,498,521,543` |
| QW6 | H1 pakai token; mikro-teks ≥11px | Skala konsisten & terbaca | `page.tsx:283,306,586,615` |
| QW7 | Radius media `rounded-2xl`; normalkan nomor ghost | Konsistensi kartu | `page.tsx:738,751` |
| QW8 | FAQ `ChevronDown` + `aria-controls` + grid animasi | A11y & makna ikon | `page.tsx:651–674` |
| QW9 | Buang focus ring ganda di search | Fokus jelas | `page.tsx:416` |
| QW10 | `green-700` → token success / `gold-deep` | Konsistensi warna | `order-dialog.tsx:217`; `globals.css` |
| QW11 | Sinkronkan `tokens.md` (font + hex) | Cegah salah implementasi | `docs/design/tokens.md` |
| QW12 | Hapus `border-t` berlebih, pertahankan tonal surface | Ritme lebih tenang | `page.tsx:398,495,518,540` |
| QW13 | Skip link + `aria-label` stats | Navigasi keyboard | `page.tsx:273,383` |

### Rekomendasi besar (butuh keputusan/konten, ±1 sesi)

| ID | Aksi | Dampak | File |
|---|---|---|---|
| BG1 | Terapkan `cta-hierarchy.md` (header tier switching + hero outline) | **Konversi** & hierarki | `page.tsx:292–321` |
| BG2 | Section testimoni/garansi | Trust | `page.tsx` (setelah stats) |
| BG3 | Order dialog: focus trap/Esc/inert (Radix Dialog) | A11y modal | `order-dialog.tsx` |
| BG4 | Reorder: Cara Kerja sebelum Katalog (atau 6 kartu pertama) | Alur & friksi | `page.tsx:397–515` |
| BG5 | Enrich footer (ikon sosial, legal, back-to-top) | Kelengkapan & trust | `page.tsx:575–619` |
| BG6 | Konektor langkah "Cara Kerja" + CTA penutup ber-wash | Kejelasan & penutup | `page.tsx:501–513,555–572` |

---

## 10. Checklist eksekusi FE (urutan disarankan)

**Pass 1 — Aman & cepat (QW1–QW13)**
- [ ] QW1 Guard reduced-motion di semua interaksi.
- [ ] QW2 Semua target interaktif ≥44px (header, clear search, footer).
- [ ] QW3 Kolase pakai `aspect-ratio` (hapus tinggi fixed).
- [ ] QW4 Seragamkan label CTA default → "Pesan Sekarang".
- [ ] QW5 Script hanya hero + CTA; section lain eyebrow non-script.
- [ ] QW6 H1 pakai token; naikkan teks mikro ke `text-label`.
- [ ] QW7 Radius & aksen kartu dinormalkan.
- [ ] QW8 FAQ pakai chevron + `aria-controls` + animasi grid.
- [ ] QW9–QW11 Focus ring tunggal; token success; sync `tokens.md`.
- [ ] QW12 Rampingkan border antar-section.
- [ ] QW13 Skip link + label stats.

**Pass 2 — Hierarki konversi (BG1, BG4, BG6)**
- [ ] BG1 Hero CTA → outline; header Tier C→A via `IntersectionObserver` (`motion-reduce`, tanpa autofocus, `h-16` tetap).
- [ ] BG4 Reorder Cara Kerja↔Katalog **atau** batasi 6 kartu pertama.
- [ ] BG6 Konektor langkah + wash CTA penutup (satu emas per viewport tetap).

**Pass 3 — Trust & modal (BG2, BG3, BG5)**
- [ ] BG2 Testimoni/garansi (hanya data asli; jika belum ada → badge garansi faktual).
- [ ] BG3 Order dialog a11y (Esc, focus trap, `inert`, `aria-labelledby`) tanpa mengubah submit.
- [ ] BG5 Footer diperkaya.

**Verifikasi akhir**
- [ ] Hanya **satu** filled-gold per viewport (375/768/1280).
- [ ] `prefers-reduced-motion: reduce` → tidak ada `scale`/`translate`/reveal.
- [ ] Tab order DOM = visual; skip link bekerja; Esc menutup dialog; fokus kembali ke pemicu.
- [ ] Tidak ada hex/rgba manual baru; semua dari token.
- [ ] Tidak ada perubahan pada URL demo (`demo_link`), nominal harga, atau alur `openOrder`.

---

## 11. Referensi

- Material Design 3 — Buttons & Cards: https://m3.material.io/components/buttons/overview ·
  https://m3.material.io/components/cards/overview
- Apple HIG — Buttons: https://developer.apple.com/design/human-interface-guidelines/buttons
- NN/g — Cards: https://www.nngroup.com/articles/cards-component/ · F-Pattern:
  https://www.nngroup.com/articles/f-shaped-pattern-reading-web-content/ · Sticky Headers:
  https://www.nngroup.com/articles/sticky-headers/ · Countdown timers:
  https://www.nngroup.com/articles/countdown-timers/
- W3C WAI-ARIA APG — Accordion & Dialog (Modal): https://www.w3.org/WAI/ARIA/apg/patterns/
- WCAG 2.2 — 1.4.3, 1.4.4, 1.4.11, 2.1.2, 2.3.3, 2.4.1, 2.4.3, 2.4.11, 2.5.8:
  https://www.w3.org/TR/WCAG22/
- UC Berkeley — Accessible card UI patterns: https://dap.berkeley.edu/accessible-card-ui-component-patterns
- shadcn/ui — Theming: https://ui.shadcn.com/docs/theming
- Dokumen internal: `tokens.md`, `cta-hierarchy.md`, `demo-card.md`, `hero-pricing-bubble.md`, `ai-slop-audit.md`
