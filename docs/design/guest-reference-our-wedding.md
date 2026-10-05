# Spec Desain — Tampilan Depan Undangan (Referensi: our-wedding.link)

> **Status:** v1.0 — Spec untuk branch `legacy-builder`
> **Ruang lingkup:** tampilan tamu (`src/components/guest/*`) — tidak mengubah kode di spec ini.
> **Standar:** WCAG 2.2 AA, token di `docs/design/tokens.md`.

---

## 0. Catatan riset (penting)

- `https://our-wedding.link/` berhasil di-fetch — itu **halaman marketing**, bukan isi undangan.
- Halaman tamu asli (`/portofolio/preview/...`) **gagal di-parse**: hanya mengembalikan `<title>`
  karena konten dirender JS (SSR terbatas). Jadi analisis isi undangan di bawah bersumber dari
  (a) taksonomi produk yang terpampang di landing page, dan (b) pola umum undangan digital premium.
- Yang **terbaca langsung** dari landing page (fakta, bukan asumsi):
  - Palet hangat: charcoal/gelap + emas, aksen floral (mawar, wisteria) sebagai ornamen sudut/pemisah.
  - Tipografi: **serif klasik + script** untuk kicker ("Rancang", "Desain", "Kami Berdua").
  - Foto-driven hero, marquee testimoni, kartu harga, FAQ.
  - Fitur undangan yang mereka tonjolkan: **nama tamu di sampul**, **musik latar**,
    **RSVP**, **amplop digital + hadiah**, **rundown**, **cerita**, **galeri**, **simpan tanggal**,
    **lokasi/peta**, **buku tamu digital + QR**, **siaran langsung**, **dua bahasa**, **sampul video (Luxury)**.
  - Kategori desain: Adat Nusantara, Minimalis, Vintage & retro, Sinematik (animasi), Game;
    ada gaya **"Auto Scrolled Cinematic"**.
- **Kesimpulan riset:** gaya visual kita (emas–ivory, serif+script) **sudah seirama**.
  Yang perlu didekati adalah **komposisi, ritme section, dan motion**, bukan ganti identitas.

---

## 1. Perbandingan: referensi vs yang kita punya

| Referensi (pola) | Milik kita | Status |
|---|---|---|
| Sampul + nama tamu + tombol buka | `cover-modal.tsx` (full-screen, nama, sapaan, tombol, petals, opener book/filmroll/oldtv/newspaper) | **Setara**, tinggal polish |
| Sampul video | `cover_bg_image` sudah deteksi `.mp4/webm` | **Ada** |
| Hero ayat pembuka | `QuoteBlock` + `HeroBlock` | **Ada** |
| Mempelai (profil + ortu) | `CoupleBlock` (5 varian) | **Ada** |
| Countdown / simpan tanggal | `CountdownBlock` (4 varian) + tombol "Simpan ke Kalender" di `EventDetailBlock` | **Ada** |
| Rundown / jadwal multi-acara | `EventDetailBlock` (tapi per-blok, belum "rundown" gabungan) | **Sebagian** |
| Cerita perjalanan | `StoryBlock` (timeline + cards) | **Ada** |
| Galeri | `GalleryBlock` (12+ layout, lightbox, video) | **Ada, unggul** |
| Lokasi + petunjuk arah | `MapsBlock` + tombol Maps | **Ada** |
| Siaran langsung | `LiveStreamingBlock` | **Ada** |
| RSVP + menu + deadline | `RSVPForm` (QR absen, throttle, menu) | **Ada, unggul** |
| Ucapan & doa | `GuestBookWall` (global di bawah blok) | **Ada**, tapi terpisah dari form |
| Amplop digital + daftar kado | `EnvelopeBlock` (multi-rekening, tab cash/gift) + `GiftListBlock` | **Ada** |
| Musik latar | `music-player.tsx` | **Ada** |
| Bagikan + QR + kartu IG | `share-bar.tsx` | **Ada, unggul** |
| Absen QR hari-H | `CheckIn` + `/absen/[projectId]` | **Ada, unggul** |
| **Bottom nav mengambang** | `guest-nav.tsx` **ADA tapi TIDAK dirender** (`// nav dihilangkan`) | **Gap (quick win)** |
| Bingkai/ornamen dekoratif | `GuestFrame`, `Ornament`, `DividerBlock`, `DecorLayer` | **Ada, unggul** |
| Penutup sinematik (foto full + thanks) | `ThanksBlock` (teks) + `WatermarkBlock`; belum adegan penutup foto | **Gap kecil** |
| Auto-scroll cinematic | belum | **Tidak wajib ditiru** |

**Gap inti: (1) nav tidak aktif, (2) alur RSVP ↔ buku tamu belum menyatu, (3) ritme/motion belum dipoles, (4) belum ada adegan penutup.**

---

## 2. Spesifikasi

### 2.1 Urutan section yang disarankan (preset kanvas, bukan hardcode)

Builder bersifat block-based, jadi ini **susunan preset** yang direkomendasikan untuk template "premium":

1. **Cover** (`CoverModal`) — selalu, autoplay musik setelah `invite-opened`.
2. **Quote / Ayat** (`QuoteBlock`, varian `center`) — pembuka tenang.
3. **Mempelai + intro** (`CoupleBlock` varian `elegant` atau `vertical`).
4. **Countdown** (`CountdownBlock` varian `cards`).
5. **Rundown** (`EventDetailBlock` varian `band`; bila >1 acara, 2 blok berurutan: Akad, Resepsi).
6. **Cerita** (`StoryBlock` timeline).
7. **Galeri** (`GalleryBlock` varian `hero-grid` atau `masonry`).
8. **Lokasi** (`MapsBlock` varian `full`).
9. **Siaran langsung** (`LiveStreamingBlock`) — opsional.
10. **RSVP + Ucapan** (`RSVPForm` lalu `GuestBookWall` ditempatkan tepat setelahnya).
11. **Amplop & Kado** (`EnvelopeBlock`, opsional `GiftListBlock`).
12. **Penutup** (`ThanksBlock` varian `elegant`) + `WatermarkBlock`.
13. **Divider** (`DividerBlock`) menyisipkan antar-section bernuansa beda.

> Alasan: pola konversi undangan premium menempatkan detail acara lebih dulu, konfirmasi di akhir,
> gift sebagai penutup — mengurangi friksi dan mengikuti NN/g tentang urutan aksi utama di akhir alur.
> Referensi: NN/g — *"The Anatomy of a Form / primary action at the end"*.

### 2.2 Gaya visual

**Tipografi (sesuaikan dengan runtime, bukan dokumen lama)**
- Runtime aktual (`src/app/layout.tsx`): heading = **Cormorant Garamond**, script = **Pinyon Script**, body = **Jost**.
- **Temuan drift:** `docs/design/tokens.md` §3 menulis Playfair/Great Vibes, dan `cover-modal.tsx`
  masih hardcode `'Great Vibes, cursive'` — font ini **tidak dimuat**. **Wajib diselaraskan ke Pinyon Script**
  agar sampul tidak fallback acak.
- Skala: hero nama `clamp(2rem,6vw,3.5rem)` (script), judul section `display-md`→`display-lg`,
  kicker script 1.75–2rem opacity 0.9, body 14–16px/1.6.
- Pairing cukup **2 peran**: serif untuk struktur, **satu** script hanya untuk kicker/nama. Jangan pakai script untuk body.

**Palet**
- Sudah cocok dengan referensi. Gunakan token `docs/design/tokens.md`:
  emas `#C9A45C` (aksen), ivory `#FAF7F2` (latar), espresso `#2B2620` (teks),
  `gold-deep #7C5D2E` untuk teks emas yang harus AA.
- Aturan: emas hanya untuk aksen/ornamen; teks penting tidak pakai emas cerah (kontras < AA).

**Spacing & bentuk**
- Ritme grid 8pt; jarak antar-section `py-12 sm:py-16` (seluler) / `md:py-20`.
- Radius: kartu `rounded-2xl`, kartu ucapan `rounded-[26px]`, tombol/pill `rounded-full`, sampul `rounded-none` full-bleed.
- Shadow hangat: `shadow-soft`/`shadow-card`; hindari bayangan abu-abu netral.
- Foto: sudut `arch`/`rounded-2xl`, overlay gelap 35–45% untuk keterbacaan teks di atas foto.

**Alasan gaya:** konsisten dengan identitas Prasha dan acuan `docs/design/tokens.md` (berbasis
Material 3 tonal roles + Apple HIG color). Referensi: Material Design 3 — Color roles; Apple HIG — Typography.

### 2.3 Motion & scroll

- **Reveal per section** (sudah ada lewat `IntersectionObserver` + variabel `--reveal-dur/--reveal-dist`
  di `GuestRenderer`): standarkan ke `fade-up` 16–24px, durasi 0.5–0.7s, threshold 0.12.
- **Stagger** elemen dalam 1 section (nama → tanggal → tombol) 60–90ms antar-elemen.
- **Parallax halus** hanya pada Hero & foto galeri pembuka (`translateY` ≤ 8%, non-essential).
- **Countdown**: transisi angka halus saat detik berubah; jangan berkedip.
- **Cover → konten**: sampul full-screen, tombol menutup dengan fade + event `invite-opened`
  (musik mulai). Setelah terbuka, tampilkan **scroll cue** panah/teks di Hero.
- **Auto-scroll cinematic**: **jangan** jadikan default. Bila dipakai, hanya sebagai template opsional
  dengan tombol pause (WCAG 2.2.2 Pause, Stop, Hide).
- **Reduced motion**: hormati `prefers-reduced-motion` — matikan marquee/petals/auto-scroll,
  turunkan reveal ke opacity-only.

### 2.4 Komponen: disetel vs dibuat vs tidak ditiru

**A. Cukup disetel (tuning, bukan komponen baru)**
1. `cover-modal.tsx` — ganti font script ke Pinyon Script; tambah monogram; haluskan overlay foto;
   tambah indikator "geser" setelah buka; pastikan **focus trap** + `Esc` menutup.
2. `GuestRenderer.tsx` — **render `GuestNav`** (komponen sudah ada, cukup dipanggil di mode immersive);
   `ShareBar` tetap; pastikan `GuestNav` disembunyikan saat cover terbuka dan saat preview.
3. `SectionHeading` (di `blocks.tsx`) — jadikan heading standar semua section: kicker script + judul serif + ornamen.
4. `CountdownBlock` — jadikan varian `cards` sebagai default; perbaiki padding.
5. `StoryBlock` — aktifkan varian `tablet`/timeline sebagai default.
6. `GuestBookWall` — setelah RSVP sukses, scroll halus ke buku tamu (alur menyatu).
7. `EventDetailBlock` — promosikan tombol "Simpan ke Kalender" agar lebih menonjol.
8. `GuestNav` (`guest-nav.tsx`) — tambah item `Envelope` (Amplop) & `GuestBook` bila layak; tetap maks 6.

**B. Perlu komponen/varian baru**
1. **`ClosingScene`** — section penutup full-bleed foto + ucapan terima kasih besar (varian dari `ThanksBlock`). *Prioritas sedang.*
2. **`SaveTheDate`** (opsional) — strip tanggal + tombol kalender, bila tidak ingin memakai `EventDetail`. *Rendah — `EventDetail` sudah cukup.*
3. **`ScrollCue`** — indikator kecil di Hero (murni dekoratif, `aria-hidden`). *Quick.*
4. **`RundownGroup`** — wadah beberapa `EventDetail` dalam satu blok bernomor (Akad/Resepsi/Unduh Mantu). *Sedang.*
5. **Varian cover "video-first"** — sampul yang langsung memutar video pendek tanpa interaksi selain tombol buka. *Sedang (video sudah didukung, tinggal komposisi).*

**C. TIDAK perlu ditiru (hemat biaya)**
- 95 preset desain, tema Game/Pixel/Isometric/3D Javanese — tidak menambah "kemiripan" bagus, biaya besar.
- Auto-scroll cinematic sebagai default (mengganggu kontrol & aksesibilitas).
- Dashboard vendor/WO, AI Photobooth, denah meja, laporan hari-H — di luar ruang lingkup tampilan undangan.
- Reverse-engineering pixel-perfect — referensi beda brand; pertahankan identitas Prasha.
- Tema Multi-bahasa (dua bahasa) — hanya jika diminta produk; bukan syarat visual.

### 2.5 Aksesibilitas (WCAG 2.2 AA)

- **Kontras:** teks ≥ 4.5:1; teks di atas foto wajib overlay ≥ 40% atau teks putih dengan scrim.
- **Sampul:** `role="dialog"` + `aria-modal` (sudah ada); tambahkan **focus trap**, fokus awal pada
  tombol "Buka Undangan", `Esc`/tombol X menutup, kembalikan fokus setelah tutup.
- **Target sentuh:** semua tombol/pill ≥ 44×44px (`min-h-11`). Nav pill sudah `min-h-11` ✓.
- **Keyboard:** urutan DOM = urutan visual; semua aksi pakai `<button>/<a>/<input>` native.
- **Media:** `autoPlay` hanya untuk musik setelah interaksi; `prefers-reduced-motion` menonaktifkan animasi non-esensial.
- **Ikon dekoratif:** `aria-hidden`; tombol tanpa teks wajib `aria-label` (sudah diterapkan di ShareBar/GuestNav).
- Referensi: W3C WCAG 2.2 (1.4.3, 2.2.2, 2.4.7, 2.5.8).

---

## 3. Prioritas implementasi

### Quick wins (≤ 1 hari masing-masing)
1. Render `GuestNav` di `GuestRenderer` + sembunyikan saat cover/preview. *(Gap paling terlihat.)*
2. Perbaiki font script sampul ke Pinyon Script (hilangkan drift `tokens.md`).
3. Seragamkan ritme vertical section + heading (`SectionHeading`) di semua blok.
4. `ScrollCue` di Hero + tombol "Buka Undangan" tetap fokus setelah sampul.
5. Scroll ke buku tamu setelah RSVP sukses.
6. Tuning `scroll_anim` default + guard `prefers-reduced-motion`.
7. Promosikan tombol "Simpan ke Kalender" di `EventDetailBlock`.

### Sedang (2–4 hari)
8. `RundownGroup` (Akad/Resepsi dalam satu section bernomor).
9. `ClosingScene` penutup foto full-bleed.
10. Varian cover video-first + monogram.
11. Countdown `cards` refined (angka lebih besar, label tipis).
12. Lightbox galeri: transisi + keyboard hint.

### Besar (≥ 1 minggu, opsional)
13. Template "Sinematik" (reveal bertahap + parallax, tanpa auto-scroll paksa).
14. Preset tema terkurasi (Minimalis, Vintage, Adat) di atas token yang ada.
15. Dua bahasa (hanya bila diminta produk).

---

## 4. Checklist eksekusi FE

- [ ] `GuestRenderer`: import & render `<GuestNav blocks={canvas.blocks} />` di mode immersive; sembunyikan bila `cover` masih terbuka.
- [ ] `cover-modal`: font script → Pinyon Script; tambah monogram; focus trap + `Esc`; indikator scroll setelah buka.
- [ ] `GuestNav`: verifikasi pill aktif mengikuti scroll; tambah `Envelope`/`GuestBook` (maks 6).
- [ ] `SectionHeading`: pakai di `Countdown`, `Gallery`, `Maps`, `RSVP`, `Envelope`, `Thanks` (kicker script + judul serif + ornamen).
- [ ] `CountdownBlock`: default varian `cards`, padding konsisten dengan section lain.
- [ ] `RSVPForm`: on success → `scrollIntoView` ke `GuestBookWall`.
- [ ] `EventDetailBlock`: tombol kalender jadi CTA sekunder yang jelas.
- [ ] `ClosingScene`: section penutup foto + thanks (varian `ThanksBlock`).
- [ ] Motion: tambah `@media (prefers-reduced-motion: reduce)` untuk reveal/petals/parallax/auto-scroll.
- [ ] QA aksesibilitas: kontras teks-di-foto ≥ 4.5:1, target ≥ 44px, focus ring terlihat, urutan tab benar.
- [ ] QA responsif: 360px, 430px (frame kanvas), tablet, desktop.

---

## 5. Referensi (traceable)

- Referensi produk: https://our-wedding.link/ (landing; halaman undangan `/portofolio/preview/*` tidak dapat di-parse tanpa JS).
- `docs/design/tokens.md` — token warna/tipografi/spacing internal.
- Material Design 3 — Color system: https://m3.material.io/styles/color
- Apple HIG — Typography: https://developer.apple.com/design/human-interface-guidelines/typography
- NN/g — Usability heuristics & form flow: https://www.nngroup.com/articles/ten-usability-heuristics/
- W3C WCAG 2.2: https://www.w3.org/TR/WCAG22/
