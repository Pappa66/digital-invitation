# AI-Slop Audit — Design Tokens, Tailwind Config & Globals CSS

> **Status:** v1.0 — audit ringkas, READ-ONLY. Sumber diaudit: `src/app/globals.css` (source of truth),
> `tailwind.config.ts`, `docs/design/tokens.md`, plus sampel penggunaan di `src/` (grep hex manual & gradien).
> **Tujuan:** menilai seberapa "template-y/AI-generik" sistem desain saat ini + flight tips anti-generik.
> **Referensi:** Google Fonts — *Cormorant* (https://fonts.google.com/specimen/Cormorant);
> madegooddesigns — *Playfair vs Cormorant / Best fonts for invitations* (https://madegooddesigns.com/playfair-display-vs-cormorant/);
> Jen Wagner — *4 Google Fonts to use instead of Playfair* (https://jenwagner.co/4-google-fonts-to-use-instead-of-playfair/);
> Material Design 3 — *Color & Elevation* (https://m3.material.io/styles/color).

---

## 1. Nilai terdokumentasi (hasil baca)

| Aspek | Token / nilai | Verdict |
|---|---|---|
| Emas | `--gold` #C9A45C, `--gold-strong` #B98A3E, `--gold-deep` #7C5D2E (AA 5.7:1), `--gold-ink` #5D4A2A (7.9:1) | ✓ peran teks vs dekorasi dipisah |
| Latar | `--background` #FAF7F2, `--card` #FFF, `--secondary` #F2ECE0, `--muted` #F4EEE3, `--accent` #F7EFDF | ✓ warm, konsisten |
| Teks | `--foreground` #2B2620 (14:1), `--muted-foreground` #6B5D4A (6.1:1), `--accent-fg` #5D4A2A | ✓ AA terhitung |
| Ring/danger | `--ring` #7C5D2E, `--destructive` #B42318 (6.2:1) | ✓ |
| Font | `--font-heading` Playfair Display, `--font-script` Great Vibes, `--font-body` Jost (dimuat via `next/font`) | ⚠ karakter tipis (lihat §3) |
| Skala type | display-2xl `clamp(48–72)` … label 11px, body 16/1.6 | ✓ |
| Spacing | kelipatan 8px (2…96), container `max-w-6xl`, `px-4/6`, `py-16/20` | ✓ |
| Radius | `--radius` .5rem / md .75 / lg 1 / xl 1.25; kartu `rounded-2xl/3xl`, pill `rounded-full` | ✓ |
| Shadow | `shadow-soft/card/gold/dialog` (basis #2B2620; `gold` rgba emas | `gold` ⚠ mudah overuse |

## 2. Warna — temuan

- **A1. Hex manual terduplikasi di komponen.** Grep menemukan `#c9a45c`, `#b98a3e`, `#faf7f2`, `#e0d6c2`,
  `#8a7a66`, `#2b2620`, `#4a443c` dipakai ulang di builder/access, error-page, dashboard, bahkan `ui/device-toggle`.
  Ini membuka tiga derajat drift warna di luar satu-satunya sumber token.
  **Fix:** ganti semua dengan token (`gold`, `input`, `background`, `muted-foreground`, …).
- **A2. `text-white` di atas emas = sub-AA (2.5:1).** Terjadi di builder access page, guide-modal, finance-tracker,
  client-management. Proyek PUNYA solusinya: `text-foreground` (#2B2620) di atas gradient emas = 6.4:1. Ganti.
- **A3. `#8a7a66` (muted-foreground lama 3.8:1 ❌) masih hidup** di error-page & builder (mis. konten deskripsi,
  ikon lock). Token sudah diperbaiki ke #6B5D4A — komponen lama belum ikut.
- **A4. Warna di luar palet:** landing BG memakai `rgba(200,155,138,0.07)` (blush pink tak ada di ramp).
  Ambil dari emas/primary ber-α saja.
- **A5. Gradien emas + `shadow-gold` dipakai hampir semua CTA** (hero, header, filter pill aktif, pagination aktif,
  empty-state, hover kartu, tombol dashboard, guide, error-page). Semua "berteriak emas" = identitas tipis.
  **Aturan baru:** satu gradient emas per viewport (CTA primer); yang lain outline/ghost.
  **Positif:** `--gold-deep` sebagai teks emas, `:root` sebagai sumber tunggal, kontras teks terhitung AA.

## 3. Tipografi — temuan

- **T1. Default pairing `Playfair Display + Great Vibes` = "template AI wedding" paling generik.**
  Playfair dipakai jutaan template (sumber: Jen Wagner — Playfair "greatest hits" serif); Cormorant memberi karakter
  lebih halus & klasik utk undangan (sumber: madegooddesigns). **Rekomendasi: ganti default heading ke
  Cambria/Garamond-flavored `Cormorant` (varian Garamond), atau family "soft serif" berkarakter lain
  (Fraunces/DM Serif Display — cek lisensi OFL).** Pertahankan `Jost` sebagai body (non-generik vs Montserrat).
- **T2. Script `Great Vibes` pada hampir semua kicker section** ("Lihat Demo", "Investasi", "Mudah & Cepat",
  "Fitur Lengkap", "Pertanyaan Umum") → "stempel" repetitif. **Script hanya untuk hero/kicker emosional + nama
  pasangan; header section pakai serif roman dengan tracking** (`uppercase tracking-[0.2em]`).
- **T3. Heading hampir selalu `font-medium`** — monoton. Ijinkan weight kontras untuk display
  (mis. `font-semibold/bold` hanya pada display-lg ke atas).
- **T4. Jangan tumpuk** script + italic + gradient-clip text + emas di satu heading (hero title_b saat ini
  memakai `em italic` + gradient gold). Gradient text pada heading panjang menurunkan legibilitas; simpan untuk aksen 1–2 kata.

## 4. Spacing, radius, shadow — temuan

- **S1. Spacing 8pt & container sudah konsisten** — tidak auditable slop.
- **S2. Radius konsisten** — jangan tambah derajat rounded baru; maks kartu `rounded-3xl`.
- **S3. `shadow-gold` glow emas** sebaiknya ≤1 per viewport; elevasi biasa pakai `shadow-card`;
  hindari pair "gradient emas + shadow-gold + nomor dekoratif" di kartu yang sama (landing kartu demo saat ini
  punya 3 aksen sekaligus: gradient pill hover, border-gold, angka 01 ghost).

## 5. Flight tips anti-generik (checklist utk desain berikutnya)

1. **Satu gradient emas per viewport** — hanya CTA primer; aksi sekunder outline/ghost bertinta `gold-deep`.
2. **`shadow-gold` maksimum satu**; elevasi lain pakai `shadow-soft`/`shadow-card`.
3. **Heading berkarakter** — hindari Playfair+Great Vibes default; pilih Cormorant/serif berkarakter lain sesuai 39 template; script hanya aksen emosional.
4. **Teks di atas emas = `text-foreground` (espresso)** — tidak pernah putih (2.5:1 gagal AA).
5. **Semua warna dari token** — nol hex manual; kalau butuh warna baru, tambahkan token di `:root`.
6. **Dekorasi dibatasi**: 1 ornamen/nomor ghost per kartu; prioritas foto asli + whitespace.
7. **Kontras & sinyal**: emas tak pernah jadi satu-satunya penanda (selalu + ikon/label); cek WCAG 1.4.3/1.4.11.
8. **Variasi template**: font & palette template harus beda secara nyata antar 39 tema, bukan hanya rotasi hue.

## 6. Referensi
- Google Fonts — Cormorant specimen: https://fonts.google.com/specimen/Cormorant
- madegooddesigns — Playfair vs Cormorant & pairing undangan: https://madegooddesigns.com/playfair-display-vs-cormorant/
- Jen Wagner — 4 Fonts pengganti Playfair: https://jenwagner.co/4-google-fonts-to-use-instead-of-playfair/
- tokens.md §2 (kontras token) & Material Design 3 (color/elevation): https://m3.material.io/styles/color