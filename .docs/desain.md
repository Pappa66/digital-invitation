# UI/UX Engineering Specification - Digital Invitation Builder
**Version:** 2.0.0 (Vercel + Supabase Optimized)
**Context:** Web-based Drag-and-Drop Invitation Builder (Dashboard, Project Management, & Public Output)
**Design System:** Tailwind-driven Component Architecture

---

## 1. System Architecture & Hosting Constraints (Vercel & Supabase)
1.  **Data Structure:** Layout *drag-and-drop* disimpan dalam format **JSON** di database Supabase (bukan HTML mentah). Ini membuat fitur "Duplicate Design" sangat cepat dan hemat *resource*.
2.  **Asset Management:** Semua *upload* gambar dari *user* WAJIB masuk ke Supabase Storage. UI harus memiliki *Media Library Modal* agar *user* bisa menggunakan kembali gambar yang sudah di-upload.
3.  **Vercel Optimization:** Hasil akhir undangan harus mendukung *Server-Side Rendering (SSR)* atau *Static Site Generation (SSG)* via Next.js agar *loading* sangat cepat meskipun di-*hosting* di Vercel Free Tier.

---

## 2. Design Philosophy & Layout Anatomy

### A. Dashboard & Project Management (SaaS Layout)
*   **Grid View:** Menampilkan daftar undangan yang pernah dibuat dalam bentuk *Card Grid*. 
*   **Blank State & Templates:** Tombol "Create New" akan memunculkan *Modal* berisi pilihan: "Start from Scratch" (Kosong) atau "Start from Template" (memilih dari *preset* bawaan sistem).
*   **Quick Actions:** Setiap desain memiliki menu *dropdown* untuk: *Edit, Preview, Duplicate, Share Link, Delete*.

### B. The Editor (Elementor-like Builder)
Menggunakan pendekatan layout 100vh tanpa scroll global.
*   **Left Sidebar (w-72):** Panel "Elements" (Text, Image, Section) dan "Templates" (Blok *preset* yang bisa ditarik).
*   **Center Canvas:** Area *preview real-time*. *User* memiliki kebebasan absolut. Mereka bisa menambah seksi baru, mengganti *background* per seksi, mengatur *padding/margin*, layaknya Elementor murni.
*   **Right Sidebar (w-80):** Panel "Styling & Properties". Dilengkapi dengan **Advanced Color Picker** dan **Preset Palettes** yang kaya.

---

## 3. Design Tokens

### A. Dashboard Environment (SaaS UI)
*   **Background:** `#F9FAFB` (Gray 50)
*   **Surface:** `#FFFFFF` (White)
*   **Primary (Action):** `#111827` (Gray 900)
*   **Border:** `#E5E7EB` (Gray 200)

### B. Output Environment (Dynamic & User-Defined)
Karena *user* diberi keleluasaan, token di bawah ini adalah **Global CSS Variables** yang akan ditimpa (*override*) oleh konfigurasi JSON *user*.
*   `--color-primary`: Di-set oleh user (Misal: Gold, Sage Green, Navy).
*   `--color-secondary`: Di-set oleh user.
*   `--color-background`: Di-set oleh user (Mendukung Solid Color, Gradient, atau Image Pattern).
*   `--font-heading`: Di-set via Google Fonts API (Playfair, Montserrat, dll).
*   `--font-body`: Di-set via Google Fonts API.

---

## 4. Component Library Specifications

### 1. Project Card (Di Halaman Daftar Undangan)
*   **Thumbnail Area:** `h-48 w-full bg-gray-100 rounded-t-xl overflow-hidden relative group`. Terdapat gambar *preview* undangan.
*   **Hover State pada Thumbnail:** Muncul *overlay* gelap `bg-black/50` dengan tombol "Edit Design" di tengah.
*   **Info Area:** `p-4 bg-white border-x border-b border-gray-200 rounded-b-xl flex justify-between items-center`.
*   **Action Menu (Titik Tiga):** Munculkan *dropdown* kecil (Shadow lg) berisi tombol **"Duplicate"** (Ikon Copy, memicu duplikasi data di Supabase).

### 2. Advanced Color Picker (Di Right Sidebar Builder)
*   **Preset Swatches:** Tampilkan minimal 15 palet warna populer (Earth Tone, Monochrome, Pastel, Elegant Gold). Berbentuk lingkaran kecil `w-6 h-6 rounded-full cursor-pointer hover:scale-110 transition-transform`.
*   **Custom Hex Input:** Input form khusus berwarna `bg-gray-50 border border-gray-300 rounded-md` yang terhubung dengan *native color picker* (`<input type="color">`).

### 3. Media Replacement UI
*   Saat *user* mengklik gambar di *canvas*, *Right Sidebar* menampilkan kotak *thumbnail* gambar saat ini dengan tombol **"Change Image"**.
*   **Media Modal:** Sebuah *modal overlay* `z-50` yang mengambil daftar gambar dari Supabase Storage milik *user* tersebut, dengan fitur *Upload New*.

---

## 5. Animation & Interaction Logic

1.  **Smooth Duplication:** Saat *user* mengklik "Duplicate" pada daftar desain, tampilkan *toast notification* di sudut kanan atas ("Duplicating project..."), jalankan *query clone* JSON di latar belakang, lalu secara instan tambahkan *Card* baru dengan nama "Copy of [Nama Proyek]" tanpa perlu *reload* halaman.
2.  **Drag and Drop Builder:** 
    *   Saat elemen diseret (*dragged*), elemen di *canvas* lainnya harus sedikit bergeser (*animated displacement* durasi 200ms) untuk memberi ruang (sebagai indikator visual penempatan).
    *   Gunakan `dnd-kit` (React) untuk kalkulasi pergerakan yang mulus (60fps) agar tidak *lagging* di *browser*.

---

## 6. Developer Handoff: Vercel & Supabase Do's & Don'ts

### DO'S (WAJIB DILAKUKAN):
1.  **JSON Payload Optimization:** Pastikan struktur JSON *layout builder* tidak memiliki *key* yang *redundant*. Vercel Free Tier membatasi *payload size* API sebesar 4.5MB. JSON yang ramping akan membuat fitur *Save* dan *Duplicate* berjalan seketika.
2.  **Next/Image Component:** Untuk hasil akhir undangan, SEMUA gambar WAJIB menggunakan komponen `<Image>` bawaan Next.js dengan properti `quality={75}` dan `loading="lazy"`. Ini krusial agar *bandwidth* Vercel Free Tier Tuan tidak cepat habis.
3.  **Supabase RLS (Row Level Security):** Pastikan Tuan mengatur RLS di tabel Supabase. Hanya *user* yang terautentikasi yang bisa melihat, mengedit, atau menduplikasi daftar desain miliknya sendiri.

### DON'TS (DILARANG KERAS):
1.  **DILARANG Menyimpan Base64 Image di Database:** *User* bebas berkreasi, tapi DILARANG KERAS menyimpan gambar hasil *upload* sebagai *string* Base64 di dalam kolom JSON Supabase. Ini akan membuat *database* bengkak. WAJIB upload ke Supabase Storage, lalu simpan URL-nya saja di JSON.
2.  **DILARANG Melakukan Full Page Reload di Editor:** Saat *user* mengganti warna atau mengganti gambar (*swap image*), DILARANG KERAS me-*refresh* halaman. Semuanya harus dikelola via *React State* agar pengalaman Elementor/Canva-nya terasa nyata.