# Project Context: Internal Invitation Builder (Enterprise Scale)
**File:** `1_project_context.md`

## 1. Visi & Tujuan Utama
Membangun platform *builder* undangan digital berbasis web yang memiliki kapabilitas *drag-and-drop* sekelas Elementor/WeddingPress. Aplikasi ini difungsikan sebagai sistem produksi internal yang memungkinkan tim membuat undangan digital tanpa batas secara visual, presisi, dan dapat di-publish ke publik.

## 2. Target Pengguna (Aktor)
1. **Internal Creator (Admin/Designer):** Tim internal yang menggunakan antarmuka *Dashboard* dan *Builder* untuk merakit desain, mengatur aset, dan mempublikasikan undangan.
2. **Guest (Public):** Tamu undangan yang mengakses hasil akhir *render* undangan melalui tautan publik.

## 3. Ruang Lingkup & Batasan Mutlak
*   **Enterprise Core:** Tidak ada limitasi fitur (bukan MVP). Semua widget *builder* tingkat lanjut (RSVP, Maps, Countdown, Gallery, Video, Animasi Parallax) akan dikembangkan secara penuh.
*   **Routing Publik:** Menggunakan format *subdomain* dan *slug*: `undangan-digital.prashadigitalindonesia.com/[slug]`.
*   **Strictly No E-commerce:** Dilarang keras menyertakan modul pembayaran, keranjang belanja, atau fitur transaksi di dalam sistem ini.
*   **Zero AI:** Sistem murni digerakkan oleh logika pemrograman dan input manual *user*. Tidak ada integrasi LLM atau AI *generative* dalam bentuk apapun.