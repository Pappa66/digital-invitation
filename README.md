# Digital Invitation Builder

Platform internal *drag-and-drop* builder undangan digital berbasis Next.js + Supabase.
Layout disimpan sebagai JSON, hasil akhir di-render melalui rute publik `/[slug]`.

## Tech Stack

- Next.js 14 (App Router) + TypeScript (strict)
- Tailwind CSS + Framer Motion + Lucide
- Zustand (builder state) + `@dnd-kit/core` (drag & drop)
- Supabase (PostgreSQL, Auth, Storage, RLS)
- `browser-image-compression` (pipeline aset)

## Struktur

```
templates/                 # 11 template undangan (JSON `canvas_data`)
supabase/schema.sql        # Skema tabel, RLS, storage & fungsi publik
src/
  app/dashboard/           # SaaS UI (login, daftar project, CRUD)
  app/builder/[id]/        # Editor (canvas + sidebar kiri/kanan)
  app/[slug]/              # Guest output publik (SSR)
  components/builder/      # ElementsSidebar, BuilderCanvas, PropertiesPanel, ColorPicker
  components/dashboard/    # ProjectCard, NewProjectModal, MediaLibrary
  components/guest/        # BlockView, GuestRenderer, blocks.tsx
  lib/actions/             # Server Actions (CRUD project, duplicate, publish)
  lib/supabase/            # client.ts & server.ts (typed SSR client)
  store/builder-store.ts   # Zustand store canvas_data
```

## Cara Menjalankan Lokal

```bash
cp .env.example .env.local
npm install
npm run dev
```

Isi `.env.local`:

```
NEXT_PUBLIC_SUPABASE_URL=https://YOUR_PROJECT.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=your-anon-key
```

## Setup Supabase (dikerjakan di tahap akhir)

1. Buat project Supabase (Free Tier).
2. Buka **SQL Editor** → jalankan seluruh isi `supabase/schema.sql`.
   - Membuat tabel `projects`, `project_designs`, `rsvps`.
   - Mengaktifkan RLS (owner-only untuk dashboard; insert publik untuk RSVP).
   - Membuat bucket storage `invitation-assets` (public read).
   - Membuat fungsi `get_published_design` untuk rute publik (bypass RLS TS).
3. **Authentication** → Email/Password → tambah user internal pertama.
4. **Storage** → pastikan bucket `invitation-assets` berstatus public.
5. Salin URL & anon key ke `.env.local`.

> Catatan RLS: rute publik `/[slug]` tidak membaca tabel langsung (ditolak RLS),
> melainkan via RPC `get_published_design` (security definer). Form RSVP
> public hanya menulis ke `rsvps` jika project berstatus `published`.

## Deploy Vercel

1. Push repo ke GitHub.
2. Import di Vercel → framework auto-detect Next.js.
3. Tambahkan env `NEXT_PUBLIC_SUPABASE_URL` & `NEXT_PUBLIC_SUPABASE_ANON_KEY`.
4. Deploy. Rute publik: `https://<domain>/<slug>`.

## Deploy VPS (Self-hosted)

- Build: `npm run build` → output `.next/standalone` (sudah dikonfigurasi di `next.config.mjs`).
- Jalankan dengan PM2/Docker: `node .next/standalone/server.js`.
- Nginx reverse proxy + routing subdomain `undangan-digital.*`.

## Aturan Penting (dari `3_rules.md`)

- Tanpa injeksi HTML mentah: blok dirender via pemetaan komponen React (`BlockView`).
- Aset wajib masuk Supabase Storage, hanya URL yang disimpan di JSON (no base64).
- Autosave builder memakai debounce 300ms.
- Animasi guest hanya `transform` & `opacity` (tanpa layout shift).
- Tanpa library e-commerce / AI.