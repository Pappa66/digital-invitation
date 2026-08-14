# Architecture & Tech Stack
**File:** `2_architecture.md`

## 1. Tech Stack Utama
*   **Framework:** Next.js (App Router, React 18+).
*   **Styling & UI:** Tailwind CSS (sinkron dengan spesifikasi `design.md`), Framer Motion (untuk animasi *Guest Output*), Lucide Icons.
*   **State Management & DnD:** Zustand (untuk *global state builder*), `@dnd-kit/core` (untuk *drag-and-drop*).
*   **Database, Auth & Storage:** Supabase (PostgreSQL).

## 2. Dual Deployment Configuration
Sistem dirancang *environment-agnostic* untuk dua target *deployment*:
1.  **Vercel Free Tier:** Mode *serverless*, optimasi *payload* JSON di bawah 4.5MB, memanfaatkan Vercel Edge Cache untuk rute publik `/[slug]`.
2.  **VPS (Self-Hosted):** Menggunakan `output: 'standalone'` di konfigurasi `next.config.js`. Membutuhkan PM2/Docker untuk *runtime* Node.js, dan Nginx sebagai *Reverse Proxy* untuk menangani *routing subdomain* `undangan-digital.*`.

## 3. Core Engine: JSON-Based State
HTML tidak disimpan di *database*. Interaksi di *builder* menghasilkan *tree object* JSON.
**Contoh Skema JSON (`canvas_data`):**
```json
{
  "theme": { "primary": "#D4AF37", "font": "Playfair Display" },
  "blocks": [
    { "id": "b-1", "type": "Hero", "props": { "title": "Panca & Sena", "bg_image": "url..." } },
    { "id": "b-2", "type": "Countdown", "props": { "date": "2026-12-12" } }
  ]
}