# Atomic Task Breakdown
**File:** `4_tasks.md`

## Phase 1: Repository & Dual Config Setup
- [ ] Inisialisasi Next.js (App Router, Tailwind, TypeScript opsional).
- [ ] Buat konfigurasi `next.config.js` untuk mode standalone (VPS) dan penanganan CORS.
- [ ] Set up *environment variables* lokal untuk Supabase URL & Anon Key.
- [ ] Buat struktur folder: `app/`, `components/builder/`, `components/guest/`, `lib/supabase/`.

## Phase 2: Supabase Schema & Auth
- [ ] Setup Supabase Project (Free Tier).
- [ ] Buat tabel: `projects`, `project_designs`, `rsvps`.
- [ ] Konfigurasi Storage Bucket "invitation-assets" (Set Public Read).
- [ ] Implementasi Row Level Security (RLS) di semua tabel.
- [ ] Buat UI Halaman Login internal.

## Phase 3: Project Management Dashboard (SaaS UI)
- [ ] Implementasi Layout SaaS (Sidebar, Header) sesuai `design.md`.
- [ ] Buat komponen `ProjectCard` dengan fungsi *hover* dan menu *dropdown*.
- [ ] Buat fungsi CRUD via API/Server Actions: Create New, Duplicate Design (clone JSON row), Delete.

## Phase 4: Core Builder Engine (The Editor)
- [ ] Setup `@dnd-kit/core` untuk area tengah (*Mobile Canvas*).
- [ ] Buat *Sidebar* Kiri: Daftar *draggable widgets* (Text, Image, Countdown, RSVP).
- [ ] Buat *Sidebar* Kanan: Properties Panel & Advanced Color Picker.
- [ ] Implementasi `Zustand` store untuk mengelola *state* `canvas_data` JSON secara *real-time*.
- [ ] Buat fungsi sinkronisasi *Autosave/Manual Save* state JSON ke tabel `project_designs`.

## Phase 5: Asset Optimization Pipeline
- [ ] Integrasikan `browser-image-compression` pada *hook* *upload* gambar.
- [ ] Buat komponen *Media Library Modal* (Upload, Preview, Select) yang membaca dari Supabase Storage.
- [ ] Hubungkan gambar yang dipilih ke widget *Image Block* dalam *state* JSON.

## Phase 6: Guest Output System (The Player)
- [ ] Buat dynamic route `app/[slug]/page.tsx`.
- [ ] Buat *Renderer Engine*: Fungsi yang membaca JSON dari Supabase lalu me- *looping* dan merender komponen yang sesuai (misal: `<HeroBlock data={props} />`).
- [ ] Implementasi *CSS Variables* dinamis (mengacu pada `design.md`) agar *theme* bawaan bisa ditimpa dari data JSON.
- [ ] Implementasi Framer Motion untuk efek *scroll* (AOS) yang ringan.

## Phase 7: Deployment & Testing
- [ ] Uji coba build untuk VPS (`next build` -> `node .next/standalone/server.js`).
- [ ] Push ke GitHub dan koneksikan ke Vercel (Pastikan tidak ada *build error*).
- [ ] Konfigurasi Custom Domain/Subdomain di *dashboard* Vercel atau Nginx VPS.
- [ ] Stress test memuat hasil publik untuk memastikan render animasi ringan di HP.