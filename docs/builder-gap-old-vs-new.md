# Audit Gap — Builder Lama vs Builder Baru (Puck)

> Tujuan: menginventaris fitur builder lama yang **belum ada** di builder baru,
> sebagai backlog pengembangan. Sumber: `docs/builder-vs-elementor.md`, git history
> (`builder-store`, `properties-panel`, `elements-sidebar`, `blocks.tsx`), dan kode baru.

## 1. Blok
| Lama (20) | Baru | Status |
|---|---|---|
| Hero, Couple, Countdown, EventDetail, Story, Gallery, RSVP, Envelope, Maps, Thanks, Divider, GiftList, Quote | ✅ ada | 13 |
| Text, Photo, LiveStreaming, CopyText, Watermark | ✅ **baru ditambah** | 5 |
| Popup, Empty | ❌ belum | Popup = overlay khusus; Empty tak perlu |

## 2. Variasi per blok
- Lama: **54 variasi** (16 blok bervariasi), Gallery **12**, Divider 5.
- Baru: Gallery **5** (grid/carousel/masonry/polaroid/mosaic), Divider 5.
- **Belum**: varian kaya untuk Hero/Couple/Countdown/EventDetail/Story/Quote (lama punya beberapa).

## 3. Kustomisasi visual
| Fitur lama | Baru |
|---|---|
| Warna teks/aksen/latar per section | ✅ `blockStyle` |
| **Ukuran font & jenis font per elemen teks** (`textSizes`/`textFonts`) | ❌ |
| **Background section: gradien, gambar, fit, opacity, monokrom** | ❌ (baru warna solid) |
| **Border / radius / shadow / padding / text-align / hideOn (responsive) per blok** | ❌ |
| **Free-drag inner** (geser sub-elemen dalam blok) | ❌ |
| **Inline edit teks di kanvas** | ❌ (pakai panel) |
| **Copy/paste style antar blok** | ❌ (Puck: copy/paste komponen saja) |
| **Z-order UI** (forward/back/front/back) | ❌ (data `zIndex` ada, UI belum) |
| **Ornamen SVG 44 + ornamen global tema** | ❌ (baru dekor upload/Lottie) |
| **Frame (9), card_style, card_variant (10), card_entrance, ornament global** | ❌ |
| **Entrance lengkap + delay** | ⚠️ 6 varian (lama 20+), delay ❌ |
| **Cover editable sebagai blok virtual** | ⚠️ via field root (tanpa kanvas) |
| **Picker kutipan per agama** | ❌ |

## 4. Komposisi & produktivitas
| Fitur lama | Baru |
|---|---|
| Drag-drop blok | ✅ (Puck) |
| Undo/redo 60 langkah | ✅ (Puck) |
| Autosave 300ms | ✅ |
| Duplicate/reorder | ✅ (Puck) |
| **Multi-select & batch (align/distribute/group)** | ❌ |
| **Navigator/outline** | ⚠️ Puck punya panel Outline (terbatas) |
| **Revision history persisten** | ❌ |
| **Clipboard lintas project** | ❌ |
| **Simpan template user / save section** | ❌ (dialog lama dihapus) |
| **Import/export JSON via UI** | ❌ |
| **Keyboard shortcut lengkap** (nudge, duplicate, dll) | ⚠️ sebagian dari Puck |
| **Device preview 430/768/100%** | ❌ (iframe off → viewport Puck tak aktif) |
| **Thumbnail otomatis** | ❌ (dihapus) |
| **Preset desain (39) / quick styles per blok** | ❌ (baru 4 template + warna/font root) |

## 5. Guest (undangan jadi)
- ✅ cover, musik, buku tamu, absensi QR, RSVP fungsional, share, confetti.
- ❌ Popup/Watermark overlay (blok Popup belum), LiveStreaming ✅ (baru).
- ⚠️ Wording per agama: ada library + preset di Kelola Tamu; pemilih kutipan di builder belum.

## 6. Prioritas usulan (dampak tinggi, effort wajar)
1. **Warna & font per elemen teks + background section (gradien/gambar)** — melengkapi kustomisasi visual.
2. **Varian kaya per blok inti** (Hero/Couple/EventDetail/Story) — "lebih kaya" cepat terasa.
3. **Navigator/outline + z-order UI + copy/paste style** — produktivitas komposisi.
4. **Ornamen/asset pack + cover style lengkap + card/frame global** — kesan mewah.
5. **Device preview (iframe) + thumbnail otomatis + clipboard persisten** — kenyamanan.
6. **Revision history + import/export + save section/template** — fitur lanjutan.
