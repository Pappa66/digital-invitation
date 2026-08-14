# Session — Status Proyek Digital Invitation

Update terakhir: migrasi Supabase ke Singapore (ap-southeast-1) + redesign premium + settings dinamis + error pages + audit template/builder.

## Selesai
- **Deploy live**: Next.js 16.3.1 di Vercel.
  - URL: `https://digital-invitation-rizkipanca03-gmailcoms-projects.vercel.app`
  - Alias: `https://digital-invitation-cyan.vercel.app`
  - Repo GitHub: `Pappa66/digital-invitation` (auto-deploy per push).
- **Supabase**: project BARU `vuhdjsrpgjjuajdajjzl` (region ap-southeast-1 / Singapore) menggantikan `ktfirkidyebbpijqwdgt` (ap-south-1/Mumbai, sudah dihapus). Migration 0001–0004 terpasang & terverifikasi (tabel projects/project_designs/rsvps/access_tokens/orders/settings, RPC get_published_design/get_invite_by_token/ensure_invite_token, bucket invitation-assets public).
  - Data lama kosong (hanya seed default), aman saat project lama dihapus.
  - Env baru: URL `https://vuhdjsrpgjjuajdajjzl.supabase.co` + anon key baru (terpasang di `.env.local`, `.env.example`, dan Vercel production/preview/development).
  - DB pooler baru: `postgresql://postgres.vuhdjsrpgjjuajdajjzl:<db-password>@aws-0-ap-southeast-1.pooler.supabase.com:6543/postgres` (db-password tersimpan di `/tmp/opencode/new_project_secret.txt`).
- **Upgrade**: Next 14→16.3.1 + React 19, ESLint 9 (flat), proxy.ts (ganti middleware). Chunkload error beres.
- **Publik**: tidak bisa akses dashboard; CTA publik → form pemesanan.
- **Template**: 32 item, 4 kategori (classic/modern/outdoor/romance) × 8. Audit struktural 32/32 OK, semua font valid Google Fonts.
- **Redesign landing**: tema premium ala undangan pernikahan (ivory/gold + Playfair/Script/Jost, ornamen, preview potret). Konsisten: `template-detail.tsx` + `order-dialog.tsx`.
- **Settings dinamis**: tabel `settings` (migrasi 0004), `src/lib/settings.ts`, halaman dashboard `/settings` (Pengaturan) untuk atur nomor WhatsApp bisnis; `order-dialog.tsx` membaca nomor dari DB (fallback `ORDER_WHATSAPP`). `ORDER_WHATSAPP` di `src/lib/order.ts` masih dipakai fallback.
- **Error pages**: `src/components/ui/error-page.tsx` + `not-found` (404), `error.tsx` (500/generic), `global-error.tsx`. Mendukung kode dari digest `NEXT_HTTP_ERROR_*`.
- **OAuth**: provider Google di-enable di Supabase BARU (`vuhdjsrpgjjuajdajjzl`) + Cloud Console. Callback `auth/callback/route.ts` mapping error akurat (cancelled/oauth/session_expired + description) — bukan lagi selalu "Sesi login tidak valid".
- **Builder**: audit aman; perbaikan kecil — font list + "Karla", quick-start "Templates" di sidebar kini berfungsi.

## Catatan
- Local dev: `npm run dev` (Next 16). Demo mode lokal true di .env.local.
- Env Vercel sudah: URL & anon key baru (project Singapore); DEMO_MODE=false.
- Jangan commit secret apa pun ke .env.example (repo publik).
- Lint: 0 error, 19 warning (pola pre-existing `set-state-in-effect` di invite-manager & kawan-kawan).