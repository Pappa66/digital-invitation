# Session — Status Proyek Digital Invitation

Update terakhir: sesi deploy + supabase.

## Selesai
- **Deploy live**: Next.js 16.3.1 di Vercel.
  - URL: `https://digital-invitation-rizkipanca03-gmailcoms-projects.vercel.app`
  - Alias: `https://digital-invitation-cyan.vercel.app`
  - Repo GitHub: `Pappa66/digital-invitation` (auto-deploy per push).
- **Supabase** (`ktfirkidyebbpijqwdgt`): migration terpasang & terverifikasi (tabel projects/project_designs/rsvps/access_tokens, RPC get_published_design/get_invite_by_token/ensure_invite_token, bucket invitation-assets public).
- **Upgrade**: Next 14→16.3.1 + React 19, ESLint 9 (flat), proxy.ts (ganti middleware). Chunkload error beres.
- **Publik**: tidak bisa akses dashboard; CTA publik → form pemesanan (src/lib/order.ts, ORDER_WHATSAPP perlu diisi nomor bisnis).
- **Template**: 32 item, 4 kategori (classic/modern/outdoor/romance) × 8; landing dark-gold + pagination + preview detail.
- **Keamanan**: secret (PAT github, sbp token, dbpass) sudah dihapus dari .env.example — tidak pernah masuk git.
- **Mode produksi**: NEXT_PUBLIC_DEMO_MODE=false (Vercel). Verified: / (landing) 200, /templates/{id} 200 (publik), /dashboard & /builder 307 (login).

## Pending (tunggu user)
- **Google OAuth**: enable provider Google di Supabase Auth (butuh OAuth Client ID/Secret dari Google Cloud Console), redirect `https://digital-invitation-rizkipanca03-gmailcoms-projects.vercel.app/auth/callback`. Login produksi berfungsi setelah itu (ALLOWED_EMAIL = digitalprasha@gmail.com). Tanpa deploy ulang.

## Catatan
- Local dev: `npm run dev` (Next 16). Demo mode lokal true di .env.local.
- Env Vercel sudah: URL, anon key asli; DEMO_MODE=false.
- Jangan commit secret apa pun ke .env.example (repo publik).