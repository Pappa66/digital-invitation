# Execution Plan — Digital Invitation Builder

## Visi Sprint
Mengangkat Digital Invitation Builder dari tool internal menjadi produk yang setara
drag-and-drop builder Elementor (versi WeddingPress) dan aman untuk produksi: tampilan
premium & modern, bisnis logic persisten, builder yang powerful, zero bug blocker dan
zero security leak.

## Prioritas & Acceptance Criteria

### P0 — Fondasi produksi & keamanan
- **P0-1 RLS tersegel** — owners/settings/finance_records hanya operator (`is_internal()`);
  policy UPDATE `orders` ada. AC: non-operator tidak bisa baca/tulis `orders`,
  `settings`, `finance_records`; update status order tersimpan.
- **P0-2 Validasi kanvas jadi gate nyata** — `validations.ts` sinkron dengan 20 block type;
  `GuestView` tidak pakai data tak valid diam-diam. AC: semua blok resmi lulus,
  field style/decoration lulus, data invalid menampilkan placeholder.
- **P0-3 Data client persisten** — tabel `clients` + CRUD server action + wiring UI.
  AC: tambah/ubah/hapus client tersimpan, tetap tampil setelah refresh.
- **P0-4 Signup ditutup** — `enable_signup=false`. AC: tidak ada user baru bisa register.

### P1 — Pengalaman pengguna & builder
- **P1-1 Preview konsisten** — kanvas builder (430px) = output publik. AC: device toggle
  label jujur, lebar output publik konsisten.
- **P1-2 A11y** — modal focus-trap/Esc, toast aria-live, form berlabel, radiogroup,
  reducedMotion. AC: keyboard navigable, screen-reader friendly.
- **P1-3 Design system satu sumber** — token di `globals.css`, kontras ≥ 4.5:1.
  AC: tidak ada hex duplikat, teks AA.
- **P1-4 Token /invite higienis** — 1 token aktif/project, expiry 90 hari, bisa revoke.
  AC: no duplikat token, revoked link tidak bisa dibaca.
- **P1-5 Storage aman** — owner-folder, size & MIME limit. AC: upload di luar folder
  user ditolak; non-image ditolak.

### P2 — Elementor-like (fondasi)
- **P2-1 Library fitur** — fitur kandidat: drag dari template katalog langsung ke project,
  style preset per blok, duplicate/save custom block, import tamu (Excel/CSV),
  check-out otomatis, statistik RSVP di dashboard. AC: diprioritaskan oleh PM bersama FE.

## Ownership Matrix
| Area | File utama | Owner |
|---|---|---|
| Design tokens & landing & guest visual | `tailwind.config.ts`, `globals.css`, `(app)/layout.tsx`, `landing/*`, `guest/cover-*`, `envelope`, `share-bar`, `music-player` | uiux |
| Builder & dashboard UI, a11y | `builder/*`, `dashboard/*`, `ui/*`, store/hooks | fe |
| RLS, migrasi, validasi, persistence | `supabase/migrations/0010+`, `lib/validations.ts`, `lib/types/*`, `lib/actions/*`, `lib/thumbnail.ts` | be |
| Test infra & verifikasi | `*.test.ts(x)`, `vitest.config.ts`, package.json devDeps | qa |
| Plan & AC & dokumen | `docs/*` | pm |

## Dependensi
1. be: migrasi DB → qa verifikasi RLS di remote.
2. be: sync `validations.ts` → qa test `validateCanvasData` seluruh blok.
3. be: persistensi client → fe wiring dashboard.
4. uiux: token → fe pakai token di builder/dashboard.
5. Semua → qa final gate → kelulusan sprint.

## Definition of Done
- `npm run lint` → 0 error.
- `npx tsc --noEmit` → bersih.
- `npm run test` → semua pass (termasuk test validasi & RSVP baru).
- `npm run build` → sukses (rute publik ƒ + statis).
- Zero bug blocker/critical. Zero security leak: RLS tersegel terverifikasi di remote
  (migrasi 0010–0012 applied), validasi gate nyata, signup off, storage aman.
- Migrasi Supabase remote sinkron 0001–0012.

## Status Terkini (diisi QA saat gate)
- [x] lint 0 error (35 warning pre-existing react-hooks)
- [x] tsc bersih
- [x] test pass — 131/131 (15 files; baseline 54)
- [x] build sukses (13 statis + 7 dinamis)
- [x] migrasi remote 0010–0012 applied + terverifikasi (is_internal, orders UPDATE, token hygiene, storage, clients, revoke rate-limit, signup off)
- [x] Bug #1 (RSVP meal_choice tidak tersimpan) FIXED — regression test hijau

---

## Fitur QR Absen Kamera (tanpa login)

### Konteks produk
1. Tamu menyelesaikan RSVP -> layar sukses menampilkan QR personal berisi
   `{origin}/absen/{projectId}?t={checkin_token}`.
2. Panitia di venue membuka rute publik `/absen/[projectId]` TANPA login ->
   halaman membuka kamera (browser).
3. Panitia memindai QR tamu -> sistem memverifikasi token -> menyimpan
   check-in (nama dari RSVP) -> menampilkan konfirmasi nama tamu + jumlah
   check-in hari ini.
4. Keamanan: hanya project `published` yang diproses; token acak tidak dapat
   ditebak; rate limit per IP; tanpa auth karena panitia di venue bukan owner.
5. Fallback lama tetap berfungsi: mode manual `?absen=1` (tamu isi nama sendiri).

### User stories (INVEST)
- US-1 (Panitia): "Sebagai panitia di venue, saya ingin memindai QR tamu dengan
  kamera di `/absen/[projectId]` tanpa login, agar pencatatan kehadiran cepat
  dan akurat tanpa menulis ulang nama."
- US-2 (Tamu): "Sebagai tamu, saya ingin QR personal muncul setelah RSVP berhasil,
  agar panitia cukup memindai untuk mengenali saya."
- US-3 (Owner): "Sebagai owner undangan, saya ingin hanya project published yang
  menerima check-in scan dan nama diambil dari RSVP, agar daftar hadir sah dan
  tidak bisa disalahgunakan orang luar."

### Prioritas (MoSCoW)
- MUST: US-1, US-2, US-3; binding token->RSVP; verifikasi + insert atomik;
  tampilkan nama tamu + jumlah check-in hari ini; tolak non-published/token invalid.
- SHOULD: umpan balik suara/getar saat scan sukses; fallback input token manual
  bila kamera tidak tersedia.
- COULD: 5 check-in terakhir tampil di layar panitia.
- WON'T: login panitia, QR batch/cetak massal, integrasi tiket/antrian.

### Acceptance criteria (satu verifikasi QA per poin)

- **AC A — Scan QR valid -> check-in tersimpan & konfirmasi tampil.**
  GIVEN project P berstatus `published` dan terdapat RSVP dengan nama
  "Budi Santoso" (guest_count 2) yang memiliki token check-in valid dan belum
  terpakai. WHEN panitia tanpa login membuka `/absen/P`, kamera terbuka, lalu
  memindai QR berisi `{origin}/absen/P?t={token}`. THEN sistem memverifikasi
  token, memasukkan SATU record ke tabel `checkins` (project_id=P, name="Budi
  Santoso", guest_count=2, created_at hari ini), dan layar menampilkan teks
  konfirmasi yang memuat "Budi Santoso", status sukses, serta jumlah check-in
  hari ini bertambah 1. VERIFY: baca via RPC `get_invite_checkins` (sebagai
  owner) + snapshot UI.

- **AC B — Token salah / token project lain / project draft -> ditolak tanpa insert.**
  (B1) token tidak terdaftar (`t` acak); (B2) token milik project X dipindai
  saat halaman `/absen/P` (X != P); (B3) project berstatus `draft` dengan token
  valid miliknya. WHEN dipindai atau diverifikasi tanpa login. THEN TIDAK ada
  insert ke `checkins`, layar menampilkan pesan error yang jelas ("Kode tidak
  valid" / "Undangan belum aktif") dan TIDAK menampilkan nama tamu.
  VERIFY: count checkins P tetap 0; teks error muncul; status response gagal.

- **AC C — `/absen/[projectId]` berfungsi tanpa login (metadata dari RPC publik).**
  GIVEN pengguna tanpa sesi login. WHEN membuka `/absen/[projectId]` untuk
  project `published`. THEN halaman render (BUKAN redirect ke `/login`),
  menampilkan metadata project (mis. judul undangan) dari RPC publik, dan
  kamera siap dibuka; untuk project `draft` halaman menolak (404/custom)
  tanpa membocorkan metadata atau canvas. VERIFY: browser incognito/private;
  bandingkan RPC metadata untuk published vs draft.

- **AC D — Duplicate scan dalam window rate limit -> ditolak.**
  GIVEN batas `check_rate_limit` untuk action check-in pada IP panitia sudah
  tercapai (default 3 percobaan / 60 detik / IP). WHEN percobaan scan/verifikasi
  berikutnya tiba dalam window yang sama. THEN permintaan ditolak tanpa insert
  `checkins`, dengan pesan rate-limit yang jelas, dan token pada percobaan itu
  tidak ikut terpakai. VERIFY: 4x scan cepat dari IP yang sama -> tidak ada
  insert tambahan; pesan rate-limit tampil.

- **AC E — Fallback manual `?absen=1` tetap berfungsi (regression).**
  GIVEN halaman undangan publik dibuka dengan query `?absen=1`. WHEN tamu
  mengisi nama (>= 2 karakter) dan menekan Check-in. THEN check-in tersimpan
  ke `checkins` dengan nama dari input manual seperti perilaku lama, tanpa
  QR personal; fitur scan kamera tidak mengubah mode ini.
  VERIFY: `check-in.test.tsx` tetap hijau + smoke manual.

- **AC F — Seluruh template valid lulus `validateCanvasData` (regression).**
  GIVEN setiap template valid terdaftar di `templates/index.json`, termasuk
  template baru berheader "abadan" bila ditambahkan ke registry. WHEN
  `validateCanvasData(canvas_data)` dijalankan untuk masing-masing template.
  THEN hasil bukan null untuk semua template valid; data korup/invalid TETAP
  dikembalikan null (gate tidak dilonggarkan). VERIFY: perluas `templates.test.ts`
  dengan iterasi `TEMPLATE_LIST` + panggil `validateCanvasData`; tambah kasus
  "abadan" saat template tersebut masuk.

### Catatan teknis (target desain untuk keputusan FE/BE)
- Token check-in dibuat per-RSVP (bukan per-project seperti `access_tokens`),
  nilai acak tidak terbaca (gen_random_bytes / uuid), tidak di-log, dirender
  persis saat layar sukses RSVP.
- Verifikasi + insert check-in harus satu operasi atomik (RPC security definer)
  agar tidak ada double-entry / race.
- RPC publik metadata hanya memaparkan field non-intim (title/slug) untuk
  project `published`; jangan ekspos canvas/RSVP/checkins.
- Scanner: kamera browser (`navigator.mediaDevices.getUserMedia`) + decoder QR
  di sisi klien; frame kamera tidak di-upload ke server.
- RLS/trigger `validate_checkin` lama tetap aktif sebagai pertahanan berlapis.

### Task (Definition of Ready)
- [BE-1] Migrasi baru: tabel `checkin_tokens` (rsvp_id FK unique, token,
  expires_at, used_at) + RPC `create_checkin_token`, `get_project_public_meta`,
  `verify_checkin_token` (atomik: cek published -> rate limit -> insert checkins
  with name/guest_count dari RSVP -> tandai used -> return name + count) +
  grants/revokes yang tepat.
- [FE-1] Layar sukses RSVP: panggil `create_checkin_token` setelah insert sukses
  dan render QR personal (reuse react-qr-code).
- [FE-2] Halaman `/absen/[projectId]`: load metadata via RPC publik, scanner
  kamera, states idle/scanning/success/error, tampilan counter harian.
- [QA-1] Implementasi & eksekusi AC A-F + regression `check-in.test.tsx`.

### Definition of Done tambahan (fitur ini)
- Migrasi baru ter-apply di remote; grant/revoke terverifikasi (anon tidak bisa
  SELECT langsung tabel `checkin_tokens`/`rsvps`/`checkins`).
- AC A-F hijau di verifikasi QA (termasuk AC E dan AC F).
- `npm run lint`, `npx tsc --noEmit`, `npm run test`, `npm run build` bersih.
- Rute `/absen/[projectId]` terverifikasi tanpa sesi (browser incognito).

### Pertanyaan terbuka untuk owner (bukan karangan PM)
- Durasi berlaku token check-in: mengikuti profil RSVP (mis. 7 hari) atau sampai
  hari acara (data tanggal di hero block)? Perlu keputusan owner.
- Nominal rate limit scan di venue ramai (default existing 3/60 detik/IP):
  perlu kalibrasi lapangan.
- Lama QR tampil di layar sukses RSVP: permanen atau auto-hilang (mis. 30 detik)?

---

## Sprint 2: Konsolidasi UX & Demo (implementasi selesai)

### 1. Bottom Nav — hanya 6 blok penting, tanpa "Lebih"
- Whitelist: Mempelai (Couple), Kisah (Story), Galeri (Gallery), Acara
  (EventDetail), RSVP, Lokasi (Maps). Urutan mengikuti kanvas. `NAV_MAX_SLOTS=6`,
  `NAV_VISIBLE_SLOTS=6`, menu "Lebih" dihapus. AC BN-1..4 di QA (guest-nav 12 test).

### 2. Demo per template (admin) — `template_demos`
- Migrasi `0014_template_demos.sql`: `template_id`PK, `demo_image`, `demo_link`,
  `updated_at`; RLS SELECT publik (metadata saja), tulis hanya `is_internal()`.
- Server action `upsertTemplateDemo` (Zod, http(s)-only, `requireInternalUser`)
  + client `upsertTemplateDemoClient` & `listTemplateDemos`.
- Landing card: `demo_image`+`demo_link` → thumbnail + tombol "Lihat Demo"
  (tab baru); hanya image → "Lihat Detail"; kosong → live TemplatePreview +
  "Preview" → `/templates/{id}`; fallback gambar rusak → auto-swap preview.
- Referensi desain: `docs/design/demo-card.md`. AC DM-1..5.

### 3. QR Absen — link publik per project
- Link `${origin}/absen/{projectId}` shareable publik.
- Menu "QR Absen" di Builder top bar & kartu project dashboard
  (`src/components/ui/absen-share-dialog.tsx`): QR code + tombol "Salin Link"
  + "Buka halaman absen"; status draft diperingatkan. AC QR-1..4.

### 4. Cover "Buka Undangan" — portrait mobile-first
- Content cover dibungkus kolom portrait `max-w-[430px] centered`; di viewport
  ≥sm dibingkai seperti ponsel; di mobile full-bleed; sisi luar latar charcoal
  + radial emas; scroll-lock & `invite-opened` dipertahankan. AC CV-1..4.

### 5. Builder Quick Styles
- Panel preset tampilan per tipe blok (≥3 opsi, kombinasi style/props yang
  LULUS `validateCanvasData`), apply tanpa menghapus konten user; posisi/
  ukuran/edit/inner-drag/decor tetap bebas (regression). AC QS-1..4.
- Test `quick-styles.test.ts` verifikasi preset tidak menggugurkan validasi.

### 6. Audit AI SLOP & panduan
- `docs/design/ai-slop-audit.md`: skor 5 area (palet 3, tipografi 3.5,
  spacing 1.5, shadow 2.5, komponen 3) rata-rata 2.7/5; checklist anti-generik
  + keputusan backlog (kurangi gradien emas per layar, batasi script, migrasi
  hex lama, sinkron body font, verifikasi angka sosial proof).
- Panduan dikonsep ulang per bagian (GD-1..GD-5) — dipetakan di laporan PM.

### Status Sprint 2 (QA)
- [x] lint 0 error · tsc bersih · test 217/217 (22 files) · build sukses
- [x] coverage lines 62.05% (naik dari ~54%)
- [x] template 39/39 lulus validateCanvasData; Quick Styles tidak memecahkan
- [x] security: template_demos publik hanya metadata; absen tanpa login
      tidak bocor data RSVP; no service_role
- [x] Bug minor backlog: QR svg (react-qr-code) tanpa <title> aksesibel (P2)
