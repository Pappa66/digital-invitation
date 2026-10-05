# Hero Pricing Bubble — Harga, Diskon, Kode Promo & Countdown di Dalam Hero

> **Status:** PANDUAN DESAIN v1.0 — visual only, TIDAK ada perubahan logika/props.
> **Tujuan:** memindahkan informasi harga/diskon/promo/countdown dari section terpisah
> (`src/app/page.tsx` blok `PRICING` → `src/components/landing/pricing-section.tsx`)
> menjadi **bubble mengambang** di dalam hero (`<section>` HERO, baris 287–363).
> **Props tetap:** `basePrice`, `discountPercent`, `promoCode`, `promoExpiresAt?`, `onOrder`.
> **Gaya:** elegan/mewah, rounded (bubble/pill), shadow lembut, palet emas + krem kartu.
> **Referensi:** Material Design 3 — *Cards & elevation* (https://m3.material.io/components/cards/overview);
> NN/g — *Countdown timers & urgency* (https://www.nngroup.com/articles/countdown-timers/);
> W3C WAI-ARIA APG — *Status/Alert pattern* (https://www.w3.org/WAI/ARIA/apg/patterns/alert/);
> WCAG 2.2 — 1.4.3/1.4.11/2.4.11/2.5.8 (https://www.w3.org/TR/WCAG22/).
> Token mengacu `docs/design/tokens.md`.

---

## 0. Keputusan desain & justifikasi

| # | Keputusan | Alasan |
|---|---|---|
| D1 | Bubble diletakkan **di aliran kolom teks kiri hero** (setelah CTA), bukan `absolute` di atas kolase. | Kolase punya `aria-hidden` (page.tsx:319) → konten interaktif di dalamnya tidak akan terbaca screen reader. Menempatkan di kolom teks menjaga urutan DOM = urutan visual (WCAG 2.4.3) dan menjamin tidak bertumpuk. |
| D2 | Bentuk **pill/bubble** `rounded-3xl`, aksen gradien emas + `shadow-card`. | Konsisten dengan bahasa visual kartu landing (kartu template `rounded-3xl`, CTA gradien `from-gold to-gold-strong`). Material 3 menempatkan elevation sebagai sinyal "permukaan mengambang"; `shadow-card` = token elevation lokal. |
| D3 | Harga final pakai `font-heading` + `tabular-nums`, harga coret `line-through` ber-`muted-foreground`. | `font-heading` (Cormorant) = suara mewah/editorial; `tabular-nums` mencegah angka goyang saat countdown/harga. |
| D4 | Status "Tersalin!" diumumkan lewat **`role="status"` terpisah**, bukan `aria-live` pada `<button>`. | ARIA live pada elemen interaktif tidak andal & dapat memicu pengumuman ganda; APG merekomendasikan live region statis. |
| D5 | Urgensi countdown **tidak** memakai warna merah/animasi berkedip. | Menghindari pola "dark pattern" (NN/g) dan menjaga tone mewah; cukup emas + ikon jam. |
| D6 | Animasi masuk **fade + scale halus** yang dijeda saat `prefers-reduced-motion: reduce`. | Konsisten dengan sistem reveal yang sudah ada di `globals.css` (`.js-reveal [data-reveal="zoom"]`), hanya aktif pada `no-preference`. |

**Catatan logic (di luar visual):** `hasDiscount` saat ini hanya melihat `discountPercent > 0`, dan expired hanya menyembunyikan countdown. State 3 di bawah mendefinisikan **dua varian tampilan**; pilihan akhir butuh keputusan produk/logika (bukan bagian dari spec visual ini).

---

## 1. Wireframe ASCII per state

Bubble = lebar `≈ 320–384px` (`max-w-sm`), konten rata tengah di mobile → kiri di `lg` (mengikuti kolom). Angka `▏` = batas padding.

### State 1 — Diskon aktif (`hasDiscount && timeLeft`)
```
┌──────────────────────────────────────────┐  ← rounded-3xl, bg-card/95, ring gold/20,
│  MULAI DARI            ╭───────────────╮  │    shadow-card, backdrop-blur, p-5/6
│                        │ ◈ Diskon 10%  │  │  ← badge pill gold/15, teks gold-deep
│  Rp 199.000   Rp 179.100                 │  │  ← coret (muted) + final (heading 3xl)
│  ╰─ line-through          ─╯  ─╯ tabular │  │
│  ────────────────────────────────────────│  ← divider border-border
│  ╭──────────────────────────────────────╮│
│  │  ◈  Gunakan kode: WEDDING2026        ││  ← copy pill, dashed gold, min-h-11 (44px)
│  ╰──────────────────────────────────────╯│
│  ◷  Berakhir dalam 2h 05j 30m            │  ← countdown, text-xs muted (h/j/m = hari/jam/menit)
│  ────────────────────────────────────────│
│  ╭──────────────────────────────────────╮│
│  │        Pesan Sekarang  →             ││  ← CTA gradien gold, min-h-12 (48px), w-full
│  ╰──────────────────────────────────────╯│
└──────────────────────────────────────────┘
```

### State 2 — Tanpa diskon (`!hasDiscount`)
```
┌──────────────────────────────────────────┐
│  MULAI DARI                               │  ← eyebrow label
│  Rp 199.000                               │  ← harga dasar, heading 3xl/4xl
│  ────────────────────────────────────────│
│  ╭──────────────────────────────────────╮│
│  │        Pesan Sekarang  →             ││
│  ╰──────────────────────────────────────╯│
└──────────────────────────────────────────┘
```
Tanpa badge, tanpa kode, tanpa countdown. Bubble mengecil otomatis (tinggi ≈ 2 blok).

### State 3 — Diskon kedaluwarsa (`hasDiscount && timeLeft === null`)

**Varian B — REKOMENDASI (tampilkan harga normal):**
```
┌──────────────────────────────────────────┐
│  MULAI DARI                               │
│  Rp 199.000                               │  ← harga normal, tanpa coret, tanpa badge
│  ────────────────────────────────────────│
│  ╭──────────────────────────────────────╮│
│  │        Pesan Sekarang  →             ││
│  ╰──────────────────────────────────────╯│
└──────────────────────────────────────────┘
```
**Varian A — logika saat ini (harga diskon tetap, countdown hilang):** blok State 1 **tanpa baris countdown**, badge & kode tetap tampil. *(Dipilih hanya bila produk tetap menampilkan promo meski lewat tenggat.)*

### State 4 — Kode sudah disalin (turunan State 1/3, ≤2 detik)
```
│  ╭──────────────────────────────────────╮│
│  │  ✓  Tersalin!                        ││  ← ikon CheckCircle, bg gold/15,
│  ╰──────────────────────────────────────╯│    label berubah, tanpa berpindah fokus
```
Layout **tidak bergeser**: lebar pill tetap (`min-w` dikunci) supaya label "Gunakan kode: …" ↔ "Tersalin!" tidak menggeser CTA.

---

## 2. Struktur komponen & urutan elemen

```
PricingBubble                       role="group" aria-label="Harga dan promo"; relative z-10
├─ (dekor) <span aria-hidden>       glow emas blur di sudut, pointer-events-none
├─ PriceHeader
│  ├─ eyebrow "Mulai dari"           label 11px uppercase tracking
│  ├─ PromoBadge  [kondisional]      "◈ Diskon {n}%" — dishide saat expired (Varian B)
│  └─ PriceRow
│     ├─ basePrice                   line-through (kondisional: hasDiscount)
│     └─ finalPrice                  heading, besar, tabular-nums
├─ Divider                           border-t border-border  (kondisional)
├─ PromoRow [kondisional hasDiscount]
│  ├─ CopyCodeButton                 <button>, icon swap, min-h-11
│  └─ Countdown    [kondisional timeLeft]  ikon Clock + teks "Berakhir dalam …"
│  └─ LiveRegion                     <span role="status" aria-live="polite" class="sr-only">
└─ OrderButton [kondisional onOrder] <button> CTA gradien, min-h-12, w-full
```

Aturan urutan:
1. **DOM = visual** (kiri→kanan, atas→bawah): eyebrow → harga → badge → divider → copy → countdown → CTA.
2. **Copy button sebelum CTA** di DOM — urutan tab logis (aksi sekunder dulu, aksi utama terakhir / "last action = next step").
3. **LiveRegion ditempatkan tetap** di DOM (tidak di-`unmount`) agar perubahan teks memicu pengumuman; hanya isinya yang berubah.
4. Semua ikon dekoratif (`Tag`, `Clock`, `CheckCircle`, panah CTA) `aria-hidden`.

---

## 3. Saran kelas Tailwind + varian responsif

> Token warna mengikuti `tokens.md`: `gold`, `gold-strong`, `gold-deep`, `card`, `border`,
> `muted-foreground`, `foreground`. **Teks emas wajib `text-gold-deep`/`text-gold-ink`** (AA);
> `gold`/`gold-strong` hanya border/fill/ikon.

| Elemen | Kelas (dasar) | Varian responsif |
|---|---|---|
| Wrapper bubble | `relative z-10 w-full max-w-sm overflow-hidden rounded-3xl border border-gold/25 bg-card/95 p-5 text-center shadow-card backdrop-blur` | `mx-auto lg:mx-0 lg:text-left sm:p-6` |
| Wash gradien dalam | `absolute inset-0 -z-10 bg-gradient-to-br from-gold/15 via-transparent to-gold/5` `aria-hidden` | — |
| Glow dekor | `pointer-events-none absolute -right-6 -top-6 -z-10 h-24 w-24 rounded-full bg-gold/20 blur-2xl` | `lg:h-28 lg:w-28` |
| Eyebrow | `text-[11px] font-semibold uppercase tracking-[0.2em] text-muted-foreground` | — |
| Baris harga | `mt-2 flex flex-wrap items-baseline justify-center gap-x-3 gap-y-1 lg:justify-start` | — |
| Harga coret | `text-base text-muted-foreground line-through decoration-gold-strong/60` | — |
| Harga final | `font-heading text-3xl font-medium text-foreground tabular-nums` | `sm:text-4xl` |
| Badge diskon | `mt-2 inline-flex items-center gap-1 rounded-full bg-gold/15 px-3 py-1 text-xs font-semibold text-gold-deep ring-1 ring-gold/30` | — |
| Divider | `my-4 border-t border-border` | — |
| Copy pill | `inline-flex min-h-11 min-w-[13rem] items-center justify-center gap-1.5 rounded-full border border-dashed border-gold/70 bg-card px-4 py-2 text-xs font-semibold text-gold-deep transition-colors hover:bg-gold/15 active:scale-[0.98] motion-reduce:active:scale-100` | w-full di mobile (`w-full lg:w-auto`) |
| Copy pill (tersalin) | tambah `bg-gold/15 ring-1 ring-gold/40` | — |
| Countdown | `mt-3 inline-flex items-center gap-1.5 text-xs text-muted-foreground tabular-nums` | — |
| CTA | `inline-flex min-h-12 w-full items-center justify-center gap-2 rounded-xl bg-gradient-to-r from-gold to-gold-strong px-6 py-3 text-sm font-semibold text-foreground shadow-gold transition-transform hover:scale-[1.02] active:scale-[0.98] motion-reduce:hover:scale-100 motion-reduce:active:scale-100` | `lg:min-h-12` |
| Live region | `sr-only` (role="status", aria-live="polite") | — |

Prinsip spacing: semua jarak kelipatan 8pt → `p-5` (20, exception komponen), `mt-2/3/4`, `gap-3`, `my-4`. Jangan mengubah rhythm hero (`gap-12 lg:gap-20`).

---

## 4. Aturan placement di hero + anti-tumpang-tindih

**Lokasi:** di dalam `<div class="text-center lg:text-left">` (kolom kiri hero), **setelah baris CTA dan sebelum/n sesudah teks sosial-proof kecil** (`page.tsx:300–316`). Rekomendasi: sisipkan **tepat setelah CTA row (`mt-8`)** agar harga mendukung keputusan klik, lalu catatan demo (`mt-6`).

**Perhitungan ruang (anti-overlap):**
- Container `max-w-6xl` = 1152px. Grid `lg:grid-cols-[1.1fr_0.9fr] gap-20` → kolom kiri ≈ **590px** (lg), ≈**616px** (xl `1.15fr/0.85fr`). Bubble `max-w-sm` (384px) → sisa **≥ 205px**, aman tanpa menyentuh kolom kolase.
- `sm` (640–1023px): grid masih **1 kolom** → bubble ada di urutan setelah teks, di atas kolase; **tidak mungkin tumpang tindih**.

**Aturan wajib:**
1. **Jangan** render bubble sebagai child dari kontainer kolase (`aria-hidden`, page.tsx:319) — konten interaktif akan hilang dari accessibility tree.
2. **Jangan** pakai `absolute`/`fixed` untuk bubble. Jika ingin nuansa "mengambang di tepi", gunakan `relative` + `shadow-card` + glow dekoratif, bukan overlap.
3. Jika suatu saat ingin pergeseran halus ke arah gap antar kolom, batasi `xl:translate-x-2` (≤8px) — masih jauh di dalam gap 80px. Jangan gunakan `-mr-*` besar yang bisa menabrak gambar.
4. Jaga `min-w-0` pada wrapper kolom (sudah ada) dan `max-w-sm` di bubble agar tidak memaksa kolom melar.
5. Alignment: `mx-auto lg:mx-0` → mobile center, desktop mengikuti tepi kiri kolom.
6. Z-index: bubble `relative z-10` (di atas background dekor global `z-0`, di bawah header `z-40`). Glow dekoratif internal `-z-10` relatif ke wrapper.
7. Section `PRICING` terpisah di `page.tsx:379–396` **dihapus dari aliran visual** (dipindah), gate `pricing.show_pricing && pricing.base_price > 0` dipertahankan sebelum render bubble.

---

## 5. Animasi / motion + fallback

| Momen | Motion (hanya `no-preference`) | Durasi/easing | Fallback `reduce` |
|---|---|---|---|
| Bubble masuk | fade + `scale(0.96) → 1` + `translateY(8px) → 0` | 480ms, `cubic-bezier(0.22,0.61,0.36,1)` | Tanpa animasi, langsung tampil (reuse pola `.js-reveal [data-reveal="zoom"]`; gate `@media (prefers-reduced-motion: no-preference)` yang sudah ada di `globals.css`). |
| Copy berhasil | ikon swap `Tag→CheckCircle` + pop halus `scale(0.9→1)`, opacity `0.6→1` | 180ms ease-out | Ikon & label berganti instan, tanpa pop. |
| CTA hover/active | `scale-[1.02]` / `scale-[0.98]` | 150ms | Gunakan `motion-reduce:hover:scale-100 motion-reduce:active:scale-100` (ganti `hover:scale` tanpa guard yang ada di kode lama). |
| Countdown | **tanpa** animasi per detik; update tiap menit. Angka pakai `tabular-nums`. | — | — |
| Glow dekor | statis (tanpa pulse) | — | — |

Catatan: jangan menganimasikan `line-through` atau warna harga; jangan membuat countdown berkedip. Motion hanya "halus masuk" + feedback salin.

---

## 6. Checklist aksesibilitas (WCAG 2.2 AA)

**Kontras**
- [ ] Harga final `foreground` di `card` → ≥ 14:1 ✓.
- [ ] Teks emas (`text-gold-deep`) di `card`/`gold-15` → ≥ 6.8:1 ✓ (jangan pakai `gold-strong` untuk teks — hanya 2.9:1, ikon dekor saja).
- [ ] Eyebrow/countdown `muted-foreground` di `card` → ≥ 6.1:1 ✓.
- [ ] Border/ring dekoratif ≥ 3:1 terhadap latar (non-text contrast 1.4.11): `border-gold/70` di `card` ✓.

**Semantik & screen reader**
- [ ] Wrapper `role="group"` + `aria-label` ("Harga dan promo") atau dihubungkan ke heading tersembunyi.
- [ ] Informasi diskon **tidak hanya warna/gaya**: ada teks "Diskon 10%" + ikon `Tag` (WCAG 1.4.1).
- [ ] Harga coret dilengkapi teks alternatif (mis. `aria-label` pada PriceRow: "Harga awal Rp 199.000, harga promo Rp 179.100") agar `line-through` tidak jadi satu-satunya penanda.
- [ ] Feedback salin diumumkan via `<span role="status" aria-live="polite" class="sr-only">` (bukan `aria-live` pada tombol). Fokus **tidak** berpindah.
- [ ] Ikon dekoratif `aria-hidden`; `Clock`/`Tag`/`CheckCircle` tidak dibacakan.

**Keyboard & fokus**
- [ ] Semua aksi `<button>` native (copy, CTA); urutan tab: copy → CTA.
- [ ] `:focus-visible` global (`outline 2px hsl(--ring)`, offset 2px) terlihat di atas `bg-gold/15` (ring `#6E5530` vs krem ≈ 5.7:1) ✓, tidak terpotong `overflow-hidden` (beri padding/`outline-offset` cukup).
- [ ] Copy bisa diaktifkan Enter/Space; tanpa trap fokus.

**Target sentuh (2.5.8)**
- [ ] Copy pill `min-h-11` (44px) ✓.
- [ ] CTA `min-h-12` (48px) ✓.
- [ ] Jarak antar target ≥ 8px.

**Motion**
- [ ] Semua animasi dibungkus `prefers-reduced-motion: no-preference`; hover/active scale diberi guard `motion-reduce`.

**Konten**
- [ ] Countdown punya satuan eksplisit ("Berakhir dalam 2h 05j 30m") dan disembunyikan saat `timeLeft === null`.
- [ ] `promoCode` kosong → jangan render tombol salin (hindari tombol tanpa konten).

---

## 7. Ringkas untuk engineer

1. Buat komponen presentasional **`PricingBubble`** (nama baru, logika sama) — bisa di file yang sama dengan `pricing-section.tsx` atau `hero-pricing-bubble.tsx`; ekstrak `copyCode` + `getTimeRemaining` apa adanya.
2. Render di hero, di dalam kolom teks kiri, setelah CTA row; gate `pricing.show_pricing && pricing.base_price > 0`.
3. Hapus render `<PricingSection>` dari section `PRICING` (blok 379–396) — jangan hapus file/logikanya.
4. Terapkan kelas & state pada tabel §3; jaga live region tetap ter-mount.
5. Verifikasi manual: mobile `375px`, `sm 640px`, `lg 1024px`, `xl 1280px` — bubble tidak boleh menutupi/menyentuh kolase; cek tab order, kontras, dan `prefers-reduced-motion`.
