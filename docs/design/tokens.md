# Design Tokens & UI Spec — Prasha Digital Invitation

> **Status:** v2.0 — Design system terpadu (single source of truth)
> **Lokasi token:** `src/app/globals.css` `:root` → dipetakan via `tailwind.config.ts`
> **Standar aksesibilitas:** WCAG 2.2 AA

---

## 1. Prinsip

1. **Satu sumber warna** — semua warna dimiliki `:root` di globals.css sebagai HSL triplet,
   lalu dipetakan ke Tailwind (`hsl(var(--token))`). Tidak ada hex manual pada komponen UI.
2. **Tinta emas hanya untuk aksen/dekorasi** — warna emas cerah (`gold`, `gold-strong`)
   TIDAK dipakai sebagai warna teks isi; teks "emas" memakai `gold-deep`/`gold-ink` yang lolos AA.
3. **Hierarki hangat (warm neutrals)** — palet bergerak di rentang ivory → champagn → espresso
   yang konsisten dengan nuansa undangan pernikahan premium (acuan: weddingpress / The Knot).
4. **Kontras wajib** — semua token teks pada latar default ≥ 4.5:1; aksen dekoratif boleh < AA
   selama bukan satu-satunya penanda informasi (dilengkapi ikon/label).

### Referensi
- Material Design 3 — Color system & tonal roles: https://m3.material.io/styles/color
- Apple HIG — Color & typography: https://developer.apple.com/design/human-interface-guidelines/color
- WCAG 2.2 — 1.4.3 Contrast (Minimum), 1.4.11 Non-text Contrast, 2.4.11 Focus Appearance, 2.5.8 Target Size: https://www.w3.org/TR/WCAG22/
- shadcn/ui — token CSS vars convention: https://ui.shadcn.com/docs/theming
- NN/g — form & dialog heuristics: https://www.nngroup.com/articles/ten-usability-heuristics/

---

## 2. Color tokens

### 2.1 Brand ramp — emas pernikahan

| Token | HSL | Hex | Peran | Kontras (di ivory #FAF7F2) |
|---|---|---|---|---|
| `--gold` | `40 50% 57%` | `#C9A45C` | Border, fill halus, pill aktif, `--primary` | teks di atasnya 6.4:1 (dengan `--primary-foreground`) |
| `--gold-strong` | `37 50% 48%` | `#B98A3E` | Stop gradien, ikon aksen pada latar terang, bar indikator | hanya ikon/dekor (2.9:1) — bukan teks |
| `--gold-deep` | `37 46% 33%` | `#7C5D2E` | **Teks emas AA** di atas ivory/pustaka terang | **5.7:1** ✓ |
| `--gold-ink` | `38 43% 26%` | `#5D4A2A` | Hover/link ketat, `--accent-foreground` | **≥ 7.9:1** ✓ |

> Aturan: `gold` & `gold-strong` hanya untuk aksen/dekorasi; teks penting pakai `gold-deep`/`gold-ink`.

### 2.2 Semantik shadcn (light mode)

| Token | HSL | Hex | Kegunaan | Kontras min |
|---|---|---|---|---|
| `--background` | `38 44% 97%` | `#FAF7F2` | Latar halaman (ivory) | — |
| `--foreground` | `33 15% 15%` | `#2B2620` | Teks utama (espreso) | 14.0:1 ✓ |
| `--card` | `0 0% 100%` | `#FFFFFF` | Kartu/sheet | — |
| `--card-foreground` | `33 15% 15%` | `#2B2620` | Teks di kartu | 14.9:1 ✓ |
| `--primary` | `40 50% 57%` | `#C9A45C` | Tombol CTA / brand accent (teks `--primary-foreground`) | 6.4:1 ✓ |
| `--primary-foreground` | `33 15% 15%` | `#2B2620` | **Tinta di atas emas** (pengganti putih yang sub-AA) | 6.4:1 ✓ |
| `--secondary` | `40 41% 91%` | `#F2ECE0` | Krem lembut (chip, kotak kecil) | — |
| `--secondary-foreground` | `36 10% 21%` | `#3D372E` | Teks di secondary | 10.0:1 ✓ |
| `--muted` | `39 44% 92%` | `#F4EEE3` | Latar area redup / skeleton | — |
| `--muted-foreground` | `35 45% 35%` | `#6B5D4A` | **Teks sekunder** (dulu #8A7A66 ≈ 3.8:1 ❌) | **6.1:1** ✓ |
| `--accent` | `40 60% 92%` | `#F7EFDF` | Champagn (nav aktif, highlight) | — |
| `--accent-foreground` | `38 43% 26%` | `#5D4A2A` | Teks nav aktif | 7.3:1 ✓ |
| `--destructive` | `356 76% 40%` | `#B42318` | Error/danger | 6.2:1 ✓ |
| `--destructive-foreground` | `0 0% 100%` | `#FFFFFF` | Teks di tombol danger | 6.6:1 ✓ |
| `--border` | `38 36% 85%` | `#E7DDCC` | Border halus | dekoratif |
| `--input` | `40 33% 82%` | `#E0D6C2` | Border field | dekoratif + ring saat fokus |
| `--ring` | `37 46% 33%` | `#7C5D2E` | Fokus ring | 5.7:1 (≥ 3:1 Focus Appearance) ✓ |

> **Perbaikan kunci vs v1:** `--muted-foreground` #8A7A66 (3.8:1) → #6B5D4A (6.1:1);
> `--primary-foreground` putih di atas emas (2.5:1) → tinta espresso (6.4:1);
> var `--background` lama (out-of-gamut, clamp kekuningan) → in-gamut #FAF7F2.

### 2.3 Dashboard (alias token)

`dashboard.bg / .surface / .primary / .border` di Tailwind kini **var** —
bukan hex manual (dulu #111827 biru-abu tidak selaras, kini tinta hangat #2B2620).

### 2.4 Guest theme (fallback)

`--gc-primary` → `var(--gold)`, `--gc-secondary` → `var(--gold-deep)`, `--gc-background`/`--gc-text`
tetap tersedia sebagai default bila JSON template tidak mendefinisikan tema.

---

## 3. Tipografi

Font oleh `next/font/google` pada RootLayout, dipetakan ke utilities `.font-heading/.font-script/.font-body`.

| Token | Font stack | Peran |
|---|---|---|
| `--font-heading` | Playfair Display, Georgia, serif | Judul (hero, section, nama pasangan) |
| `--font-script` | Great Vibes, cursive | Kicker / aksen dekoratif kaligrafi |
| `--font-body` | Jost, Montserrat, sans-serif | Body & UI |

Skala utilitas baru (Tailwind `fontSize`): `display-2xl` (clamp 48–72px),
`display-xl` (clamp 40–52px), `display-lg` (clamp 32–44px), `display-md` (24px),
`heading-sm` (18px), `body-sm` (14px), `body-xs` (12px), `label` (11px uppercase).
Body default 16px/1.6.

---

## 4. Spacing (grid 8pt)

- Rhythm utama kelipatan **8px** (Tailwind `space-*`, `p-*`, `gap-*`: 2,4,8,16,24,32,40,48,64,80,96).
- Penyimpangan halus (4px) hanya untuk detail di dalam komponen (badge, chip), bukan antar-section.
- Container: `max-w-6xl` (landing), `px-4 sm:px-6`; vertikal section `py-16/20`.

## 5. Radius & shadow

- `--radius: .5rem` (shadcn), `--radius-md .75rem` (kartu), `--radius-lg 1rem` (panel), `--radius-xl 1.25rem` (hero/dialog).
- Lebanon ke kartu: `rounded-2xl/rounded-3xl`; tombol `rounded-lg/xl`; pill `rounded-full`.
- Shadow: `shadow-soft` (kartu dasar), `shadow-card` (hover kartu), `shadow-gold` (CTA emas),
  `shadow-dialog` (modal), `shadow-phone` (demo ponsel).

---

## 6. Komponen & state

### Tombol (Button CTA)
| State | Gaya |
|---|---|
| default | `bg-gradient-to-r from-gold to-gold-strong text-foreground shadow-gold` (min-h 44px) |
| hover | `scale-[1.02]` |
| active | `scale-[0.98]` |
| focus-visible | `:focus-visible` global — outline `--ring` 2px + offset 2px |
| disabled | `opacity-40/60`, `pointer-events-none`, tanpa bayangan |
| loading | ikon `Loader2 animate-spin` + label berubah (mis. "Membuka Builder…") |

### Field input
| State | Gaya |
|---|---|
| default | `border-input bg-card text-foreground placeholder:text-muted-foreground` |
| focus | `border-gold-strong ring-2 ring-ring/30` |
| error | teks `text-destructive` di bawah field |

### Bottom nav (mobile)
- Tinggi bar ≥ **56px**, ikon **24px**, label **11px**, `aria-current="page"`, area sentuh per item ≥ 56×48px.

### Skeleton & error state
- `Skeleton` (`bg-muted animate-pulse`), `TableSkeleton`, `StatsSkeleton`, `InlineError` di `src/components/ui/skeleton.tsx`.
- Grid dashboard memakai komponen ini: `Skeleton` per kartu + `InlineError` saat gagal memuat.

---

## 7. Aksesibilitas (WCAG 2.2 AA)

- **Kontras:** semua token teks ≥ 4.5:1 (tabel §2); teks besar (≥24px / 18.66px bold) ≥ 3:1.
- **Urutan focus:** DOM = urutan visual; `tab` mengikuti: header → nav → konten → CTA → footer/modal.
- **Keyboard:** semua interaksi pakai elemen native `<button>/<a>/<input>`; modal dengan `role=dialog aria-modal`.
- **Target sentuh:** tombol & link interaktif ≥ 44×44px; nav bawahan ≥ 24px (WCAG 2.5.8) — kami standar 44px.
- **Reduced motion:** `prefers-reduced-motion` menonaktifkan animasi ornament/petals & smooth-scroll.
- **aria:** ikon dekoratif `aria-hidden`; nav aktif `aria-current`; nav tambahan `aria-label`.

---

## 8. Perubahan vs v1 (migrasi)
1. `globals.css :root` = sumber token tunggal; hex terduplikat di layout.tsx/page.tsx dihapus.
2. `tailwind.config.ts` — warna `dashboard.*` & `gold.*` memakai var; font/type/radius/shadow scale ditambahkan.
3. Landing & komponen landing — semua hex → token; CTA emas kini bertinta (AA); kartu template dibuat frame ponsel.
4. Sidebar/bottom-nav dashboard — token + target sentuh 56px + `aria-current`.
5. Guest (cover/share/music/envelope) — polish visual + tombol lewati cover + target sentuh.
6. `ui/skeleton.tsx` — restyle token; API ekspor tidak berubah.