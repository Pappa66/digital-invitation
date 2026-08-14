### 3. Rules & Guidelines

```markdown
# Development Rules & Security
**File:** `3_rules.md`

## 1. Organisasi Tim (No PM Rule)
*   **Agile Direct Communication:** Tidak ada jalur birokrasi Project Manager. *Backend/Database logic* dan *Frontend UI* saling tumpang tindih. Keputusan teknis diambil langsung antar *developer* berdasarkan spesifikasi ini dan dokumen desain.

## 2. Coding Standards (Next.js & Tailwind)
*   Ikuti konvensi *Design Tokens* dari `design.md` secara kaku. Pisahkan *layout* CSS Dashboard (`/builder/*`) dengan CSS Guest (`/[slug]`).
*   Setiap blok/widget harus bersifat *pure component* yang menerima *props* berupa JSON. Hindari *hardcode style*.
*   Wajib menerapkan *debounce* (min 300ms) pada *trigger autosave* JSON ke Supabase saat sedang mengedit di *builder*.

## 3. Prohibitions (Larangan Keras)
*   **[STRICT]** Jangan injeksi *raw* HTML (`dangerouslySetInnerHTML`) untuk blok bawaan. Gunakan pemetaan komponen React yang aman (XSS Prevention).
*   **[STRICT]** Jangan menyimpan aset statis berukuran besar ke dalam Vercel/VPS server. Wajib masuk ke Supabase Storage.
*   **[STRICT]** Tidak boleh ada referensi/library e-commerce (Stripe, Midtrans, Cart).
*   **[STRICT]** Dilarang memasukkan *library* atau *package* yang berhubungan dengan AI.
*   **[STRICT]** Dilarang melakukan animasi pada properti layout (margin, padding, width) di *Guest Output*. Wajib menggunakan `transform` dan `opacity` (mengacu pada aturan FPS tinggi di `design.md`).

## 4. Security & Performance
*   **Supabase RLS:** Wajib aktif. Hanya *user* terautentikasi (tim internal) yang bisa `INSERT/UPDATE/DELETE` di tabel `projects` dan `project_designs`. Rute Publik `/[slug]` menggunakan akses `SELECT` khusus atau via SSR Admin *bypass*.
*   Semua media render menggunakan `next/image` dengan `priority` flag khusus untuk *Hero Image* undangan.

```
